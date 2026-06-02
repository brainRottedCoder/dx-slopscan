import type { SignalScore } from '@slop-scanner/shared-types';

import { COMMIT_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore } from '../utils/signal-score.js';

import { tokenizeMessages } from './length-stats.js';

/** Low type-token ratio across commit batch suggests templated messages. */
export function computeTypeTokenRatio(messages: readonly string[]): SignalScore {
  const tokens = tokenizeMessages(messages);
  if (tokens.length === 0) {
    return buildSignalScore(
      'type_token_ratio',
      0,
      COMMIT_SIGNAL_WEIGHTS.TYPE_TOKEN_RATIO,
      'No tokens',
    );
  }

  const unique = new Set(tokens);
  const ratio = unique.size / tokens.length;
  const slopSignal = 1 - ratio;

  return buildSignalScore(
    'type_token_ratio',
    slopSignal,
    COMMIT_SIGNAL_WEIGHTS.TYPE_TOKEN_RATIO,
    `Type-token ratio ${ratio.toFixed(3)}`,
  );
}
