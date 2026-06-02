import { describe, expect, it } from 'vitest';

import { computeTypeTokenRatio } from './type-token-ratio.js';

describe('computeTypeTokenRatio', () => {
  it('flags repetitive templated messages', () => {
    const messages = Array.from({ length: 4 }, () => 'fix bug in module');
    const score = computeTypeTokenRatio(messages);
    expect(score.value).toBeGreaterThan(0.5);
  });

  it('returns zero when no tokens', () => {
    const score = computeTypeTokenRatio([]);
    expect(score.value).toBe(0);
  });

  it('scores diverse vocabulary lower', () => {
    const repetitive = computeTypeTokenRatio(['fix bug', 'fix bug', 'fix bug']);
    const diverse = computeTypeTokenRatio([
      'refactor auth middleware',
      'add postgres migration',
      'remove legacy cache layer',
    ]);
    expect(repetitive.value).toBeGreaterThan(diverse.value);
  });
});
