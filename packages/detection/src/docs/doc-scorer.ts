import type { CompositeScore } from '@slop-scanner/shared-types';

import { DOC_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { composeScore } from '../utils/composite-score.js';
import { buildSignalScore, invertSignalScore } from '../utils/signal-score.js';

import { circularityScoreValue, type DocSectionInput } from './circularity.js';
import { concreteElementScoreValue } from './concrete-elements.js';
import { computeDocHedgingDensity } from './hedging-density.js';
import { computeParagraphVariance } from './paragraph-variance.js';
import { type CodebaseIndex, validateSymbolClaims } from './symbol-validator.js';

export interface DocScoringInput {
  readonly text: string;
  readonly sections: readonly DocSectionInput[];
  readonly codebaseIndex: CodebaseIndex;
}

/** Composite documentation quality score. */
export function scoreDocumentation(input: DocScoringInput): CompositeScore {
  const concreteValue = concreteElementScoreValue(input.text);
  const circularityValue = circularityScoreValue(input.sections);
  const hedging = computeDocHedgingDensity(input.text);
  const paragraphVariance = computeParagraphVariance(input.text);
  const symbolResult = validateSymbolClaims(input.text, input.codebaseIndex);

  const signals = [
    buildSignalScore(
      'concrete_elements',
      concreteValue,
      DOC_SIGNAL_WEIGHTS.CONCRETE_ELEMENTS,
      'Concrete examples and commands detected',
    ),
    buildSignalScore(
      'circularity',
      circularityValue,
      DOC_SIGNAL_WEIGHTS.CIRCULARITY,
      'Circular heading/body overlap',
    ),
    hedging,
    invertSignalScore(paragraphVariance),
    buildSignalScore(
      'symbol_accuracy',
      symbolResult.accuracy,
      DOC_SIGNAL_WEIGHTS.SYMBOL_ACCURACY,
      `${String(symbolResult.verified.length)} of ${String(symbolResult.claimed.length)} symbols verified`,
    ),
  ];

  return composeScore(signals);
}
