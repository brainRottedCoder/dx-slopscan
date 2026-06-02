import type { CompositeScore } from './score.types.js';

/** Single commit message from GitHub history. */
export interface CommitMessage {
  readonly sha: string;
  readonly message: string;
  readonly author: string;
  readonly committedAt: string;
}

/** Batch input for distribution-level commit scoring (never single-commit). */
export interface CommitBatch {
  readonly messages: readonly string[];
  readonly timestamps: readonly string[];
}

/** Tier 1 commit-pattern distribution result. */
export interface CommitDistributionResult {
  readonly score: CompositeScore;
  readonly sampleSize: number;
  readonly lookbackDays: number;
}
