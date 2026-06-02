import type { CommitDistributionResult } from './commit.types.js';
import type { ContributorSummary } from './contributor.types.js';
import type { DocSurfaceScan } from './doc.types.js';
import type { PullRequestPreview } from './pr.types.js';
import type { CompositeScore } from './score.types.js';

/** Scan lifecycle status persisted in SQLite. */
export type ScanStatus = 'pending' | 'running' | 'complete' | 'error' | 'cached';

/** Three-state analysis badge on PR cards and tree nodes (F-505). */
export type AnalysisBadgeState = 'pending' | 'analysing' | 'scored';

/** Parsed GitHub repository reference. */
export interface RepoRef {
  readonly owner: string;
  readonly repo: string;
  readonly branch?: string;
}

/** Scan metadata row (F-607). */
export interface ScanMeta {
  readonly id: string;
  readonly repoFullName: string;
  readonly headSha: string;
  readonly status: ScanStatus;
  readonly createdAt: string;
  readonly completedAt?: string;
}

/** Node in the repository file tree (F-101). */
export interface FileTreeNode {
  readonly path: string;
  readonly name: string;
  readonly type: 'file' | 'dir';
  readonly size?: number;
  readonly children?: readonly FileTreeNode[];
  readonly score?: number;
}

/** Folder-level heatmap entry (F-102). */
export interface FolderHeatmapEntry {
  readonly path: string;
  readonly fileCount: number;
  readonly aggregateScore: number;
  readonly topSignals: readonly string[];
}

/** Complete Tier 1 overview scan result. */
export interface Tier1ScanResult {
  readonly scanId: string;
  readonly repoFullName: string;
  readonly tree: readonly FileTreeNode[];
  readonly heatmap: readonly FolderHeatmapEntry[];
  readonly prs: readonly PullRequestPreview[];
  readonly commitResult: CommitDistributionResult | null;
  readonly docScan: DocSurfaceScan | null;
  readonly healthScore: CompositeScore;
  readonly contributors: readonly ContributorSummary[];
  readonly completedAt: string;
  /** User-visible scan notices (monorepo cap, language mode, partial results). */
  readonly scanWarnings?: readonly string[];
}

/** Request body for POST /api/scan. */
export interface StartScanRequest {
  readonly repoUrl: string;
}

/** Response from POST /api/scan. */
export interface StartScanResponse {
  readonly scanId: string;
}

/** Poll-based scan status fallback (F-506). */
export interface ScanStatusResponse {
  readonly scanId: string;
  readonly status: ScanStatus;
  readonly progress: readonly string[];
}
