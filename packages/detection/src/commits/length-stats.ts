import type { SignalScore } from '@slop-scanner/shared-types';

import { COMMIT_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore } from '../utils/signal-score.js';

const TARGET_MEAN_LENGTH = 72;
const LENGTH_TOLERANCE = 48;

function tokenizeMessages(messages: readonly string[]): readonly string[] {
  return messages.flatMap((message) => message.toLowerCase().split(/\s+/).filter(Boolean));
}

/** Detect suspiciously uniform commit message lengths. */
export function computeLengthStats(messages: readonly string[]): SignalScore {
  if (messages.length === 0) {
    return buildSignalScore('length_stats', 0, COMMIT_SIGNAL_WEIGHTS.LENGTH_STATS, 'No commits');
  }

  const lengths = messages.map((message) => message.length);
  const mean = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / lengths.length;
  const stddev = Math.sqrt(variance);

  const meanDistance = Math.abs(mean - TARGET_MEAN_LENGTH) / LENGTH_TOLERANCE;
  const uniformity = 1 - Math.min(stddev / (mean || 1), 1);
  const value = Math.min(meanDistance * 0.5 + uniformity * 0.5, 1);

  return buildSignalScore(
    'length_stats',
    value,
    COMMIT_SIGNAL_WEIGHTS.LENGTH_STATS,
    `Mean length ${mean.toFixed(0)} chars, stddev ${stddev.toFixed(1)}`,
  );
}

export { tokenizeMessages };
