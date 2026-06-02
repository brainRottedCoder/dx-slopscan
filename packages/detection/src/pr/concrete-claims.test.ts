import { describe, expect, it } from 'vitest';

import { countConcreteClaims } from './concrete-claims.js';

describe('countConcreteClaims', () => {
  it('detects fixes #42 pattern', () => {
    const score = countConcreteClaims('This fixes #42 because of a race condition.');
    expect(score.value).toBeGreaterThan(0);
  });

  it('returns 0 on empty text without crashing', () => {
    const score = countConcreteClaims('');
    expect(score.value).toBe(0);
  });

  it('returns low score on vague text', () => {
    const score = countConcreteClaims('Updated things.');
    expect(score.value).toBeLessThan(0.34);
  });
});
