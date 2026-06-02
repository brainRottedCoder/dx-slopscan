import type { CompositeScore, SignalScore } from '@slop-scanner/shared-types';
import { gradeFromTotal } from '@slop-scanner/shared-types';

import { clamp01 } from './math.js';

/** Weighted aggregate of signal scores into a 0–100 composite. */
export function composeScore(signals: readonly SignalScore[]): CompositeScore {
  const weighted = signals.reduce((sum, signal) => sum + signal.value * signal.weight, 0);
  const total = Math.round(clamp01(weighted) * 100);

  return {
    total,
    grade: gradeFromTotal(total),
    signals: [...signals],
    computedAt: new Date().toISOString(),
  };
}
