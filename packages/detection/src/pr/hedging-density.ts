import type { SignalScore } from '@slop-scanner/shared-types';

import { HEDGING_TERMS } from '../constants/hedging-terms.js';
import {
  HEDGING_MAX_PER_1000_WORDS,
  MIN_HEDGING_WORD_COUNT,
} from '../constants/scoring.js';
import { SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore, zeroScore } from '../utils/signal-score.js';

function countHedges(text: string): number {
  const lower = text.toLowerCase();
  return HEDGING_TERMS.reduce((count, term) => {
    return lower.includes(term) ? count + 1 : count;
  }, 0);
}

/** Hedging phrase density per 1,000 words (higher = more slop-like). */
export function computeHedgingDensity(text: string): SignalScore {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
  if (words.length < MIN_HEDGING_WORD_COUNT) {
    return zeroScore('hedging_density', 'Text too short to score', SIGNAL_WEIGHTS.HEDGING_DENSITY);
  }

  const hedgeCount = countHedges(text);
  const per1000 = (hedgeCount / words.length) * 1000;
  const normalized = Math.min(per1000 / HEDGING_MAX_PER_1000_WORDS, 1);

  return buildSignalScore(
    'hedging_density',
    normalized,
    SIGNAL_WEIGHTS.HEDGING_DENSITY,
    `${per1000.toFixed(1)} hedging terms per 1,000 words`,
  );
}
