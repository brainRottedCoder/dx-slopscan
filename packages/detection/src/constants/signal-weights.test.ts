import { describe, expect, it } from 'vitest';

import { COMMIT_SIGNAL_WEIGHTS, DOC_SIGNAL_WEIGHTS, SIGNAL_WEIGHTS } from './signal-weights.js';

function sumWeights(weights: Record<string, number>): number {
  return Object.values(weights).reduce((sum, weight) => sum + weight, 0);
}

describe('SIGNAL_WEIGHTS', () => {
  it('PR weights sum to 1.0', () => {
    expect(sumWeights(SIGNAL_WEIGHTS)).toBeCloseTo(1, 5);
  });

  it('commit weights sum to 1.0', () => {
    expect(sumWeights(COMMIT_SIGNAL_WEIGHTS)).toBeCloseTo(1, 5);
  });

  it('documentation weights sum to 1.0', () => {
    expect(sumWeights(DOC_SIGNAL_WEIGHTS)).toBeCloseTo(1, 5);
  });
});
