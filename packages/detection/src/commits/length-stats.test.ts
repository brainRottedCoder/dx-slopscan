import { describe, expect, it } from 'vitest';

import { computeLengthStats } from './length-stats.js';

describe('computeLengthStats', () => {
  it('flags uniform message lengths', () => {
    const messages = Array.from({ length: 5 }, () => 'a'.repeat(72));
    const score = computeLengthStats(messages);
    expect(score.value).toBeGreaterThan(0.3);
  });

  it('returns zero for empty batch', () => {
    const score = computeLengthStats([]);
    expect(score.value).toBe(0);
    expect(score.explanation).toContain('No commits');
  });

  it('handles highly variable lengths', () => {
    const score = computeLengthStats(['x', 'a'.repeat(200), 'short']);
    expect(score.value).toBeGreaterThanOrEqual(0);
    expect(score.value).toBeLessThanOrEqual(1);
  });
});
