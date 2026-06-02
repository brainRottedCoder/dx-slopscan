/** Letter grade derived from a composite score total (0–100). */
export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/** Single detection signal contribution to a composite score. */
export interface SignalScore {
  readonly signal: string;
  readonly value: number;
  readonly weight: number;
  readonly explanation: string;
}

/** Weighted aggregate score with explainable signal breakdown. */
export interface CompositeScore {
  readonly total: number;
  readonly grade: ScoreGrade;
  readonly signals: SignalScore[];
  readonly computedAt: string;
  /** OSS percentile rank (0–100) when baseline calibration is applied. */
  readonly relativePercentile?: number;
  /** Human-readable comparison to OSS baseline repos. */
  readonly relativeLabel?: string;
}

/** Maps a numeric total (0–100) to a letter grade. */
export function gradeFromTotal(total: number): ScoreGrade {
  if (total >= 90) return 'A';
  if (total >= 80) return 'B';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}
