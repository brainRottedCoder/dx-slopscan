import type { SignalScore } from '@slop-scanner/shared-types';

import { COMMIT_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore } from '../utils/signal-score.js';

/** Detect absence of commit bodies (single-line only). */
export function computeBodyPresenceRatio(messages: readonly string[]): SignalScore {
  if (messages.length === 0) {
    return buildSignalScore(
      'body_presence',
      0,
      COMMIT_SIGNAL_WEIGHTS.BODY_PRESENCE,
      'No commits',
    );
  }

  const withBody = messages.filter((message) => message.includes('\n')).length;
  const bodyRatio = withBody / messages.length;
  const slopSignal = 1 - bodyRatio;

  return buildSignalScore(
    'body_presence',
    slopSignal,
    COMMIT_SIGNAL_WEIGHTS.BODY_PRESENCE,
    `${String(withBody)} of ${String(messages.length)} commits include a body`,
  );
}
