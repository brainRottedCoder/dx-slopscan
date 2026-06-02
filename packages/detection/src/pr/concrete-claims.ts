import type { SignalScore } from '@slop-scanner/shared-types';

import { CONCRETE_CLAIMS_FULL_COUNT } from '../constants/scoring.js';
import { SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore, zeroScore } from '../utils/signal-score.js';

const CONCRETE_PATTERNS = [
  /\bfixes?\s+#\d+/i,
  /\bbecause\b/i,
  /\bdue\s+to\b/i,
  /\btrade.?off\b/i,
  /\bline\s+\d+/i,
  /\bbreaking\s+change\b/i,
] as const;

/** Count concrete rationale patterns in text. */
export function countConcreteClaims(text: string): SignalScore {
  if (text.trim().length === 0) {
    return zeroScore('concrete_claims', 'No text to analyze', SIGNAL_WEIGHTS.CONCRETE_CLAIMS);
  }

  const matches = CONCRETE_PATTERNS.filter((pattern) => pattern.test(text));
  const normalized = Math.min(matches.length / CONCRETE_CLAIMS_FULL_COUNT, 1);

  return buildSignalScore(
    'concrete_claims',
    normalized,
    SIGNAL_WEIGHTS.CONCRETE_CLAIMS,
    `Found ${String(matches.length)} concrete claim(s)`,
  );
}
