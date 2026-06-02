import type { CompositeScore } from './score.types.js';

/** Documentation file reference from the repo tree. */
export interface DocFile {
  readonly path: string;
  readonly name: string;
  readonly content?: string;
}

/** Per-section breakdown from a documentation deep scan. */
export interface DocSection {
  readonly heading: string;
  readonly content: string;
  readonly score: number;
  readonly signals: readonly string[];
}

/** Tier 2 documentation deep-scan result. */
export interface DocAnalysisResult {
  readonly filePath: string;
  readonly sections: readonly DocSection[];
  readonly overallScore: CompositeScore;
  readonly analyzedAt: string;
}

/** Tier 1 surface scan entry for README / top-level docs. */
export interface DocSurfaceEntry {
  readonly path: string;
  readonly preview: string;
  readonly score: number | null;
}

/** Aggregated Tier 1 documentation surface result. */
export interface DocSurfaceScan {
  readonly entries: readonly DocSurfaceEntry[];
  readonly aggregateScore: CompositeScore | null;
}
