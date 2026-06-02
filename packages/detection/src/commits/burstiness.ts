import { MIN_BURSTINESS_SAMPLES } from '../constants/scoring.js';
import { avg, avgSquaredDiff } from '../utils/math.js';

/** Fano factor of inter-commit intervals (variance / mean). */
export function computeBurstiness(isoTimestamps: readonly string[]): number {
  if (isoTimestamps.length < MIN_BURSTINESS_SAMPLES) return 0;

  const ms = [...isoTimestamps].map((timestamp) => Date.parse(timestamp)).sort((a, b) => a - b);
  const intervals: number[] = [];

  for (let index = 1; index < ms.length; index += 1) {
    const previous = ms[index - 1];
    const current = ms[index];
    if (previous !== undefined && current !== undefined) {
      intervals.push(current - previous);
    }
  }

  const mean = avg(intervals);
  if (mean === 0) return 0;

  const variance = avgSquaredDiff(intervals, mean);
  return variance / mean;
}
