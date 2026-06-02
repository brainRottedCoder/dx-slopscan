/** Percentile rank of a raw score within a baseline distribution (0–100). */
export function getPercentile(rawScore: number, distribution: readonly number[]): number {
  if (distribution.length === 0) return 50;

  const sorted = [...distribution].sort((a, b) => a - b);
  const countAtOrBelow = sorted.filter((score) => score <= rawScore).length;
  return Math.round((countAtOrBelow / sorted.length) * 100);
}

/** Human-readable OSS-relative tier for a percentile rank. */
export function formatRelativeScore(percentile: number): string {
  if (percentile <= 15) return 'Bottom 15% of surveyed OSS repositories';
  if (percentile <= 40) return 'Below OSS median';
  if (percentile <= 60) return 'Near OSS median';
  return 'Above OSS median';
}

/** Attach relative calibration labels to a numeric health total. */
export function calibrateHealthScore(total: number, distribution: readonly number[]): {
  readonly relativePercentile: number;
  readonly relativeLabel: string;
} {
  const relativePercentile = getPercentile(total, distribution);
  return {
    relativePercentile,
    relativeLabel: formatRelativeScore(relativePercentile),
  };
}
