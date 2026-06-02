import type { AnalysisBadgeState } from './scan.types.js';
import type { CompositeScore } from './score.types.js';

/** GitHub pull request lifecycle state. */
export type PullRequestState = 'OPEN' | 'CLOSED' | 'MERGED';

/** Domain model for a GitHub pull request (post-adapter). */
export interface PullRequest {
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: PullRequestState;
  readonly author: string;
  readonly avatarUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly additions: number;
  readonly deletions: number;
  readonly changedFiles: number;
}

/** PR row shown in Tier 1 list before Tier 2 analysis. */
export interface PullRequestPreview extends PullRequest {
  readonly analysisStatus: AnalysisBadgeState;
}

/** Result of Tier 2 PR deep analysis. */
export interface PrAnalysisResult {
  readonly prNumber: number;
  readonly score: CompositeScore;
  readonly analyzedAt: string;
}

/** Input to the PR scoring pipeline (detection engine). */
export interface PrScoringInput {
  readonly description: string;
  readonly diffSymbols: readonly string[];
  readonly changedFunctions: readonly string[];
  readonly diffLineCount: number;
}
