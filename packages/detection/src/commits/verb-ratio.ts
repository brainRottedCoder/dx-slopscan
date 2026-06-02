import type { SignalScore } from '@slop-scanner/shared-types';

import { IMPERATIVE_VERBS } from '../constants/imperative-verbs.js';
import { COMMIT_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore } from '../utils/signal-score.js';

const IMPERATIVE_VERB_SET = new Set<string>(IMPERATIVE_VERBS);

/** Ratio of messages starting with generic imperative verbs. */
export function computeImperativeVerbRatio(messages: readonly string[]): SignalScore {
  if (messages.length === 0) {
    return buildSignalScore('verb_ratio', 0, COMMIT_SIGNAL_WEIGHTS.VERB_RATIO, 'No commits');
  }

  const matches = messages.filter((message) => {
    const first = message.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
    return IMPERATIVE_VERB_SET.has(first);
  });

  const value = matches.length / messages.length;

  return buildSignalScore(
    'verb_ratio',
    value,
    COMMIT_SIGNAL_WEIGHTS.VERB_RATIO,
    `${String(matches.length)} of ${String(messages.length)} commits start with imperative verbs`,
  );
}
