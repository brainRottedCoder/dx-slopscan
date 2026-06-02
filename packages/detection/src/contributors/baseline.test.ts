import { describe, expect, it } from 'vitest';

import { buildContributorBaseline, deviatesFromBaseline } from './baseline.js';

describe('deviatesFromBaseline', () => {
  const baseline = buildContributorBaseline(
    'dev',
    [100, 110, 105, 95, 100],
    [new Float32Array([1, 0, 0]), new Float32Array([1, 0, 0]), new Float32Array([1, 0, 0])],
    [60, 62, 58],
  );

  it('flags significant deviation when z-score exceeds 2.0', () => {
    const result = deviatesFromBaseline(
      { avgMsgLength: 250, embeddingCentroid: new Float32Array([1, 0, 0]) },
      baseline,
    );
    expect(result.isSignificant).toBe(true);
    expect(result.lengthDeviation).toBeGreaterThan(2);
  });

  it('does not flag when within baseline norms', () => {
    const result = deviatesFromBaseline(
      { avgMsgLength: 102, embeddingCentroid: new Float32Array([1, 0, 0]) },
      baseline,
    );
    expect(result.isSignificant).toBe(false);
  });
});
