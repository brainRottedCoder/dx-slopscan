import type { SignalScore } from '@slop-scanner/shared-types';

import { clamp01 } from './math.js';

/** Build a normalized signal score entry. */
export function buildSignalScore(
  signal: string,
  value: number,
  weight: number,
  explanation: string,
): SignalScore {
  return {
    signal,
    value: clamp01(value),
    weight,
    explanation,
  };
}

/** Zero-value signal with explanation (non-scoring cases). */
export function zeroScore(signal: string, explanation: string, weight = 0): SignalScore {
  return buildSignalScore(signal, 0, weight, explanation);
}

/** Invert signal — used when high raw values indicate slop. */
export function invertSignalScore(signal: SignalScore): SignalScore {
  return {
    ...signal,
    value: clamp01(1 - signal.value),
    explanation: `Inverted slop signal: ${signal.explanation}`,
  };
}
