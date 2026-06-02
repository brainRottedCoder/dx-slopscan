import { describe, expect, it } from 'vitest';

import { computeDiffRestate } from './diff-restate.js';

describe('computeDiffRestate', () => {
  it('flags high overlap with few concrete claims', () => {
    const score = computeDiffRestate({
      lexicalOverlap: 0.9,
      embeddingSimilarity: 0.85,
      concreteClaimsNormalized: 0,
    });
    expect(score.value).toBeGreaterThan(0.5);
  });

  it('returns zero when overlap is low', () => {
    const score = computeDiffRestate({
      lexicalOverlap: 0.2,
      embeddingSimilarity: 0.3,
      concreteClaimsNormalized: 0,
    });
    expect(score.value).toBe(0);
  });

  it('returns zero when concrete claims provide context despite overlap', () => {
    const score = computeDiffRestate({
      lexicalOverlap: 0.9,
      embeddingSimilarity: 0.9,
      concreteClaimsNormalized: 1,
    });
    expect(score.value).toBe(0);
  });
});
