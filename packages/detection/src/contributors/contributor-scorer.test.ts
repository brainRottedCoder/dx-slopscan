import { describe, expect, it } from 'vitest';

import { scoreContributorPattern } from './contributor-scorer.js';

describe('scoreContributorPattern', () => {
  it('returns non-significant deviation with one sample', () => {
    const result = scoreContributorPattern({
      login: 'dev',
      messageLengths: [120],
      embeddings: [new Float32Array([1, 0])],
      densities: [70],
      currentMessageLength: 120,
      currentEmbedding: new Float32Array([1, 0]),
    });
    expect(result.isSignificant).toBe(false);
  });

  it('flags length deviation when latest message is extreme', () => {
    const result = scoreContributorPattern({
      login: 'dev',
      messageLengths: [100, 105, 98, 102],
      embeddings: [
        new Float32Array([1, 0]),
        new Float32Array([1, 0]),
        new Float32Array([1, 0]),
        new Float32Array([1, 0]),
      ],
      densities: [70, 72, 68, 71],
      currentMessageLength: 400,
      currentEmbedding: new Float32Array([1, 0]),
    });
    expect(result.lengthDeviation).toBeGreaterThan(2);
    expect(result.isSignificant).toBe(true);
  });

  it('flags vocabulary drift when embedding shifts', () => {
    const result = scoreContributorPattern({
      login: 'dev',
      messageLengths: [100, 110, 105],
      embeddings: [
        new Float32Array([1, 0, 0]),
        new Float32Array([1, 0, 0]),
        new Float32Array([1, 0, 0]),
      ],
      densities: [70, 72, 68],
      currentMessageLength: 105,
      currentEmbedding: new Float32Array([0, 1, 0]),
    });
    expect(result.vocabularyDrift).toBeGreaterThan(0.3);
    expect(result.isSignificant).toBe(true);
  });
});
