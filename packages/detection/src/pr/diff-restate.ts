import type { SignalScore } from '@slop-scanner/shared-types';

import { SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore, zeroScore } from '../utils/signal-score.js';

export interface DiffRestateInput {
  readonly lexicalOverlap: number;
  readonly embeddingSimilarity: number;
  readonly concreteClaimsNormalized: number;
}

const HIGH_OVERLAP_THRESHOLD = 0.65;
const LOW_CLAIMS_THRESHOLD = 0.25;

/** Detect PR descriptions that mirror the diff without added context (F-202). */
export function computeDiffRestate(input: DiffRestateInput): SignalScore {
  const overlap = (input.lexicalOverlap + input.embeddingSimilarity) / 2;
  if (overlap < HIGH_OVERLAP_THRESHOLD) {
    return zeroScore(
      'diff_restate',
      'Description does not closely mirror diff symbols',
      SIGNAL_WEIGHTS.DIFF_RESTATE,
    );
  }

  if (input.concreteClaimsNormalized >= 0.66) {
    return zeroScore(
      'diff_restate',
      'Concrete claims in the description provide sufficient context',
      SIGNAL_WEIGHTS.DIFF_RESTATE,
    );
  }

  const lacksContext = Math.max(0, 1 - input.concreteClaimsNormalized);
  const value = Math.min(overlap * (0.5 + lacksContext * 0.5), 1);

  if (value < LOW_CLAIMS_THRESHOLD) {
    return zeroScore(
      'diff_restate',
      'Overlap present but concrete claims provide context',
      SIGNAL_WEIGHTS.DIFF_RESTATE,
    );
  }

  return buildSignalScore(
    'diff_restate',
    value,
    SIGNAL_WEIGHTS.DIFF_RESTATE,
    'Description closely mirrors the diff without much added context',
  );
}
