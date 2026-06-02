import type { CommitDistributionResult } from './commit.types.js';
import type { DocSurfaceScan } from './doc.types.js';
import type { CompositeScore } from './score.types.js';

/** Sanitized pull request row for JSON export. */
export interface ExportablePrPreview {
  readonly number: number;
  readonly title: string;
  readonly author: string;
  readonly state: string;
}

/** Sanitized contributor row for JSON export. */
export interface ExportableContributor {
  readonly login: string;
  readonly prCount: number;
  readonly commitCount: number;
}

/** Full exportable scan report (F-306). */
export interface ExportableReport {
  readonly meta: {
    readonly repo: string;
    readonly scanId: string;
    readonly generatedAt: string;
    readonly scopeLimits: Readonly<Record<string, number>>;
    readonly note: string;
  };
  readonly health: CompositeScore;
  readonly prPreviews: readonly ExportablePrPreview[];
  readonly commitScores: CommitDistributionResult | null;
  readonly docScores: DocSurfaceScan | null;
  readonly contributors: readonly ExportableContributor[];
}
