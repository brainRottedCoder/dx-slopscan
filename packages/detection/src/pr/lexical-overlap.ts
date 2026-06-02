import type { SignalScore } from '@slop-scanner/shared-types';

import { SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore, zeroScore } from '../utils/signal-score.js';

export interface LexicalOverlapInput {
  readonly diffSymbols: readonly string[];
  readonly descriptionText: string;
}

/** Fraction of diff symbols appearing verbatim in the PR description. */
export function computeLexicalOverlap(input: LexicalOverlapInput): SignalScore {
  const { diffSymbols, descriptionText } = input;

  if (diffSymbols.length === 0) {
    return zeroScore(
      'lexical_overlap',
      'No symbols in diff — cannot compute overlap',
      SIGNAL_WEIGHTS.LEXICAL_OVERLAP,
    );
  }

  const lowerDesc = descriptionText.toLowerCase();
  const found = diffSymbols.filter((symbol) => lowerDesc.includes(symbol.toLowerCase()));
  const value = found.length / diffSymbols.length;

  return buildSignalScore(
    'lexical_overlap',
    value,
    SIGNAL_WEIGHTS.LEXICAL_OVERLAP,
    `${String(found.length)} of ${String(diffSymbols.length)} diff symbols appear verbatim in description`,
  );
}
