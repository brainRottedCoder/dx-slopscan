import type { SignalScore } from '@slop-scanner/shared-types';

import { DOC_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { computeHedgingDensity } from '../pr/hedging-density.js';
import { buildSignalScore } from '../utils/signal-score.js';

/** Documentation hedging density (reuses PR term list, doc-specific signal id). */
export function computeDocHedgingDensity(text: string): SignalScore {
  const base = computeHedgingDensity(text);
  return buildSignalScore(
    'doc_hedging_density',
    base.value,
    DOC_SIGNAL_WEIGHTS.HEDGING_DENSITY,
    base.explanation,
  );
}
