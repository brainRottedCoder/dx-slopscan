import { buildGitHubClient, type GitHubClient } from '@slop-scanner/github-client';
import type { RepoRef, Tier1ScanResult } from '@slop-scanner/shared-types';

import type { ScanCache } from '../cache/sqlite.cache.js';
import { SCAN_LIMITS } from '../config/scan-limits.js';
import { mkSseEvent, type SseManager } from '../sse/sse-manager.js';

import {
  buildHeatmap,
  buildScanWarnings,
  capCommits,
  composeHealthScore,
  countTreeFiles,
  safeStep,
  scoreDocsSurface,
  toCommitDistributionResult,
  toPrPreviews,
} from './scan-helpers.js';

export type GitHubClientFactory = (token: string) => GitHubClient;

export interface RunTier1ScanInput {
  readonly scanId: string;
  readonly repoRef: RepoRef;
  readonly repoFullName: string;
  readonly token: string;
  readonly sse: SseManager;
  readonly cache: ScanCache;
  readonly clientFactory?: GitHubClientFactory;
}

function collectCodeSymbols(tree: Tier1ScanResult['tree']): Set<string> {
  const symbols = new Set<string>();
  const visit = (nodes: Tier1ScanResult['tree']): void => {
    for (const node of nodes) {
      if (node.type === 'file' && /\.(?:ts|tsx|js|jsx|py|go|rs)$/i.test(node.path)) {
        const base = node.name.replace(/\.[^.]+$/, '');
        if (base.length > 0) symbols.add(base);
      }
      if (node.children) visit(node.children);
    }
  };
  visit(tree);
  return symbols;
}

/** Run Tier 1 overview scan with resilient per-step error handling. */
export async function runTier1Scan(input: RunTier1ScanInput): Promise<Tier1ScanResult> {
  const client = (input.clientFactory ?? buildGitHubClient)(input.token);
  const { scanId, repoRef, repoFullName, sse, cache } = input;

  sse.emit(scanId, mkSseEvent('scan:started', scanId, { repoFullName }));
  cache.markRunning(scanId);

  let fetchFailures = 0;

  const treeResult = await safeStep(() => client.getFileTree(repoRef));
  if (!treeResult) fetchFailures += 1;
  const tree = treeResult?.tree ?? [];
  const headSha = treeResult?.headSha ?? '';
  if (headSha) cache.updateHeadSha(scanId, headSha);

  sse.emit(scanId, mkSseEvent('scan:tree_done', scanId, { tree, headSha }));

  const cached =
    headSha.length > 0 ? cache.getScanBySha(repoFullName, headSha) : null;
  if (cached) {
    const cachedResult = { ...cached.result, scanId };
    sse.emit(scanId, mkSseEvent('scan:prs_done', scanId, cachedResult.prs));
    sse.emit(scanId, mkSseEvent('scan:commits_done', scanId, cachedResult.commitResult));
    sse.emit(scanId, mkSseEvent('scan:docs_done', scanId, cachedResult.docScan));
    sse.emit(scanId, mkSseEvent('scan:complete', scanId, cachedResult));
    cache.markCached(scanId, cachedResult);
    sse.close(scanId);
    return cachedResult;
  }

  const prsRaw = await safeStep(() =>
    client.getRecentPrs(repoRef, SCAN_LIMITS.MAX_PRS_PREVIEW),
  );
  if (!prsRaw) fetchFailures += 1;
  const prs = prsRaw ?? [];
  sse.emit(scanId, mkSseEvent('scan:prs_done', scanId, toPrPreviews(prs)));

  const commitsStep = await safeStep(() =>
    client.getRecentCommits(repoRef, SCAN_LIMITS.MAX_COMMITS),
  );
  if (commitsStep === null) fetchFailures += 1;
  const commits = capCommits(commitsStep ?? []);
  const commitResult = commits.length > 0 ? toCommitDistributionResult(commits) : null;
  sse.emit(scanId, mkSseEvent('scan:commits_done', scanId, commitResult));

  const docs =
    headSha.length > 0
      ? await safeStep(() =>
          client.getTopLevelDocs(repoRef, tree, headSha, SCAN_LIMITS.MAX_DOC_FILES),
        )
      : null;
  const docScan = docs ? scoreDocsSurface(docs, collectCodeSymbols(tree)) : null;
  sse.emit(scanId, mkSseEvent('scan:docs_done', scanId, docScan));

  const contributors =
    (await safeStep(() => client.getContributors(repoRef))) ?? [];

  const completedAt = new Date().toISOString();
  const sampleText =
    docs?.map((doc) => doc.content ?? '').join('\n').slice(0, 2000) ??
    prs.map((pr) => pr.body).join('\n').slice(0, 2000);
  const scanWarnings = buildScanWarnings({
    fileCount: countTreeFiles(tree),
    prCount: prs.length,
    commitCount: commits.length,
    sampleText,
    partialResults: fetchFailures > 0,
  });

  const result: Tier1ScanResult = {
    scanId,
    repoFullName,
    tree,
    heatmap: buildHeatmap(tree),
    prs: toPrPreviews(prs),
    commitResult,
    docScan,
    healthScore: composeHealthScore({ commitResult, docScan }),
    contributors,
    completedAt,
    ...(scanWarnings.length > 0 ? { scanWarnings } : {}),
  };

  cache.storeScan({ scanId, repoFullName, headSha, result });
  cache.markComplete(scanId, result);
  sse.emit(scanId, mkSseEvent('scan:complete', scanId, result));
  sse.close(scanId);
  return result;
}
