import {
  calibrateHealthScore,
  detectAnalysisCapability,
  getBaselineDistribution,
  isOnnxEmbeddingActive,
  scoreCommitDistribution,
  scoreDocumentation,
} from '@slop-scanner/detection';
import type {
  CommitBatch,
  CommitDistributionResult,
  CommitMessage,
  CompositeScore,
  DocFile,
  DocSurfaceScan,
  FileTreeNode,
  FolderHeatmapEntry,
  PullRequest,
  PullRequestPreview,
} from '@slop-scanner/shared-types';
import { gradeFromTotal } from '@slop-scanner/shared-types';

import { SCAN_LIMITS } from '../config/scan-limits.js';

interface DocSectionInput {
  readonly heading: string;
  readonly body: string;
}

export async function safeStep<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export function capCommits(commits: readonly CommitMessage[]): CommitMessage[] {
  return commits.slice(0, SCAN_LIMITS.MAX_COMMITS);
}

export function toCommitBatch(commits: readonly CommitMessage[]): CommitBatch {
  return {
    messages: commits.map((commit) => commit.message.split('\n')[0] ?? commit.message),
    timestamps: commits.map((commit) => commit.committedAt),
  };
}

export function toCommitDistributionResult(
  commits: readonly CommitMessage[],
): CommitDistributionResult {
  const batch = toCommitBatch(commits);
  return {
    score: scoreCommitDistribution(batch),
    sampleSize: commits.length,
    lookbackDays: SCAN_LIMITS.MAX_LOOKBACK_DAYS,
  };
}

function parseDocSections(text: string): readonly DocSectionInput[] {
  const parts = text.split(/^##\s+/m).filter((part) => part.trim().length > 0);
  if (parts.length === 0) {
    return [{ heading: 'Document', body: text }];
  }

  return parts.map((part) => {
    const lines = part.split('\n');
    const heading = lines[0]?.trim() ?? 'Section';
    const body = lines.slice(1).join('\n');
    return { heading, body };
  });
}

export function scoreDocsSurface(
  docs: readonly DocFile[],
  symbols: ReadonlySet<string>,
): DocSurfaceScan {
  const entries = docs.map((doc) => {
    const text = doc.content ?? '';
    const composite = scoreDocumentation({
      text,
      sections: parseDocSections(text),
      codebaseIndex: { symbols },
    });
    return {
      path: doc.path,
      preview: text.slice(0, 200),
      score: composite.total,
    };
  });

  if (entries.length === 0) {
    return { entries: [], aggregateScore: null };
  }

  const average =
    entries.reduce((sum, entry) => sum + (entry.score ?? 0), 0) / entries.length;

  const aggregateScore: CompositeScore = {
    total: Math.round(average),
    grade: gradeFromTotal(Math.round(average)),
    signals: [],
    computedAt: new Date().toISOString(),
  };

  return { entries, aggregateScore };
}

function flattenFiles(nodes: readonly FileTreeNode[]): FileTreeNode[] {
  const files: FileTreeNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') files.push(node);
    if (node.children) files.push(...flattenFiles(node.children));
  }
  return files;
}

export function buildHeatmap(tree: readonly FileTreeNode[]): FolderHeatmapEntry[] {
  const folders = new Map<string, { fileCount: number; scores: number[] }>();

  for (const file of flattenFiles(tree)) {
    const folder = file.path.includes('/') ? (file.path.split('/')[0] ?? '.') : '.';
    const stats = folders.get(folder) ?? { fileCount: 0, scores: [] };
    stats.fileCount += 1;
    if (file.score != null) stats.scores.push(file.score);
    folders.set(folder, stats);
  }

  return [...folders.entries()].map(([path, stats]) => ({
    path,
    fileCount: stats.fileCount,
    aggregateScore:
      stats.scores.length > 0
        ? stats.scores.reduce((sum, value) => sum + value, 0) / stats.scores.length
        : 0,
    topSignals: [],
  }));
}

export function toPrPreviews(prs: readonly PullRequest[]): PullRequestPreview[] {
  return prs.map((pr) => ({ ...pr, analysisStatus: 'pending' as const }));
}

export function countTreeFiles(nodes: readonly FileTreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'file') count += 1;
    if (node.children) count += countTreeFiles(node.children);
  }
  return count;
}

export function buildScanWarnings(input: {
  readonly fileCount: number;
  readonly prCount: number;
  readonly commitCount: number;
  readonly sampleText: string;
  readonly partialResults?: boolean;
}): string[] {
  const warnings: string[] = [];

  if (input.fileCount >= SCAN_LIMITS.MAX_FILES) {
    warnings.push(
      `Scanning top ${String(SCAN_LIMITS.MAX_FILES)} files — large monorepo detected.`,
    );
  }

  const language = detectAnalysisCapability(input.sampleText);
  if (language.capability === 'embeddings_only' && language.language !== 'unknown') {
    warnings.push(
      `Non-English detected (${language.language}). Embedding-only scoring active.`,
    );
  }

  if (!isOnnxEmbeddingActive()) {
    warnings.push(
      'ONNX embeddings unavailable — embedding signals use a deterministic fallback; lexical and structural signals still run.',
    );
  }

  if (input.partialResults) {
    warnings.push(
      'Some GitHub data could not be fetched (rate limit or API error). Partial results shown — retry after the limit resets.',
    );
  }

  if (input.prCount === 0 && input.commitCount === 0) {
    warnings.push('No recent activity to analyse in the preview window.');
  }

  return warnings;
}

export function composeHealthScore(input: {
  readonly commitResult: CommitDistributionResult | null;
  readonly docScan: DocSurfaceScan | null;
}): CompositeScore {
  const totals: number[] = [];

  if (input.commitResult) totals.push(input.commitResult.score.total);
  if (input.docScan?.aggregateScore) totals.push(input.docScan.aggregateScore.total);

  if (totals.length === 0) {
    const total = 0;
    const calibration = calibrateHealthScore(total, getBaselineDistribution());
    return {
      total,
      grade: gradeFromTotal(total),
      signals: [],
      computedAt: new Date().toISOString(),
      relativePercentile: calibration.relativePercentile,
      relativeLabel: calibration.relativeLabel,
    };
  }

  const total = Math.round(totals.reduce((sum, value) => sum + value, 0) / totals.length);
  const calibration = calibrateHealthScore(total, getBaselineDistribution());
  return {
    total,
    grade: gradeFromTotal(total),
    signals: [
      ...(input.commitResult?.score.signals ?? []),
      ...(input.docScan?.aggregateScore?.signals ?? []),
    ],
    computedAt: new Date().toISOString(),
    relativePercentile: calibration.relativePercentile,
    relativeLabel: calibration.relativeLabel,
  };
}
