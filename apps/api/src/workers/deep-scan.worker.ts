import { buildGitHubClient } from '@slop-scanner/github-client';
import type { RepoRef, Tier1ScanResult } from '@slop-scanner/shared-types';

import type { ScanCache } from '../cache/sqlite.cache.js';
import { SCAN_LIMITS } from '../config/scan-limits.js';
import { analyseContributor } from '../services/contributor.service.js';
import { analyseDocFile } from '../services/docs.service.js';
import { analysePr } from '../services/pr.service.js';
import { capCommits, safeStep, toCommitDistributionResult } from '../services/scan-helpers.js';
import { mkSseEvent, type SseManager } from '../sse/sse-manager.js';

export interface DeepScanJob {
  readonly scanId: string;
  readonly repoRef: RepoRef;
  readonly repoFullName: string;
  readonly token: string;
  readonly headSha: string;
  readonly tier1: Tier1ScanResult;
}

export interface DeepScanDeps {
  readonly cache: ScanCache;
  readonly sse: SseManager;
  readonly clientFactory?: typeof buildGitHubClient;
}

/** Tier 3 long-running scan — each step is independent (F-301–F-305). */
export async function runDeepScan(job: DeepScanJob, deps: DeepScanDeps): Promise<void> {
  const { scanId, repoRef, token, headSha, tier1 } = job;
  const { sse, cache, clientFactory = buildGitHubClient } = deps;
  const client = clientFactory(token);

  sse.emit(scanId, mkSseEvent('deep_scan:started', scanId, { tier: 3 }));

  const commits =
    (await safeStep(() => client.getRecentCommits(repoRef, SCAN_LIMITS.MAX_COMMITS))) ?? [];
  const commitResult =
    commits.length > 0 ? toCommitDistributionResult(capCommits(commits)) : tier1.commitResult;
  sse.emit(scanId, mkSseEvent('deep_scan:commits_done', scanId, { sampleSize: commits.length }));

  let prScored = 0;
  for (const pr of tier1.prs.slice(0, SCAN_LIMITS.MAX_PRS)) {
    const scored = await safeStep(() => analysePr(pr.number, repoRef, token, clientFactory));
    if (scored) prScored += 1;
  }
  sse.emit(scanId, mkSseEvent('deep_scan:prs_done', scanId, { scored: prScored }));

  let docsScored = 0;
  for (const entry of tier1.docScan?.entries ?? []) {
    const doc = await safeStep(() =>
      analyseDocFile(entry.path, repoRef, headSha, token, clientFactory),
    );
    if (doc) docsScored += 1;
  }
  sse.emit(scanId, mkSseEvent('deep_scan:docs_done', scanId, { scored: docsScored }));

  let profilesBuilt = 0;
  for (const contributor of tier1.contributors.slice(0, 10)) {
    const profile = await safeStep(() =>
      analyseContributor(contributor.login, tier1, repoRef, token, clientFactory),
    );
    if (profile) profilesBuilt += 1;
  }
  sse.emit(
    scanId,
    mkSseEvent('deep_scan:contributors_done', scanId, { profiles: profilesBuilt }),
  );

  const completed: Tier1ScanResult = {
    ...tier1,
    commitResult: commitResult ?? tier1.commitResult,
    completedAt: new Date().toISOString(),
  };
  cache.storeScan({ scanId, repoFullName: job.repoFullName, headSha, result: completed });

  sse.emit(scanId, mkSseEvent('deep_scan:complete', scanId, { tier: 3 }));
  sse.emit(scanId, mkSseEvent('scan:complete', scanId, { ...completed, tier: 3 }));
}
