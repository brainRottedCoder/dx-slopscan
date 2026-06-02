/** Contributor row in Tier 1 summary (alphabetical, no ranking). */
export interface ContributorSummary {
  readonly login: string;
  readonly avatarUrl: string | null;
  readonly prCount: number;
  readonly commitCount: number;
  readonly recentActivity: string;
}

/** Full contributor identity from GitHub. */
export interface Contributor {
  readonly login: string;
  readonly avatarUrl: string | null;
  readonly prCount: number;
  readonly commitCount: number;
}

/** Point on the information-density timeline (never labelled "slop" or "AI"). */
export interface InformationDensityPoint {
  readonly prNumber: number;
  readonly date: string;
  readonly informationDensity: number;
}

/** Deviation from a contributor's personal baseline (F-409). */
export interface DeviationResult {
  readonly lengthDeviation: number;
  readonly vocabularyDrift: number;
  readonly isSignificant: boolean;
  readonly explanation: string;
}

/** Stats snapshot for baseline comparison. */
export interface ContributorStats {
  readonly avgMsgLength: number;
  readonly embeddingCentroid: readonly number[];
}

/** Stored personal baseline for a contributor in a repo. */
export interface ContributorBaseline {
  readonly login: string;
  readonly msgLengthMean: number;
  readonly msgLengthStddev: number;
  readonly avgInfoDensity: number;
  readonly sampleSize: number;
}

/** Tier 2 contributor quality profile response. */
export interface ContributorProfile {
  readonly login: string;
  readonly deviation: DeviationResult;
  readonly timeline: readonly InformationDensityPoint[];
}
