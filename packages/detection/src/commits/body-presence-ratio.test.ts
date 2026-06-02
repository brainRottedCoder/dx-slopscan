import { describe, expect, it } from 'vitest';

import { computeBodyPresenceRatio } from './body-presence-ratio.js';

describe('computeBodyPresenceRatio', () => {
  it('flags single-line-only commits', () => {
    const score = computeBodyPresenceRatio(['fix auth', 'update docs']);
    expect(score.value).toBe(1);
  });

  it('returns zero for empty batch', () => {
    const score = computeBodyPresenceRatio([]);
    expect(score.value).toBe(0);
  });

  it('scores commits with bodies lower', () => {
    const noBodies = computeBodyPresenceRatio(['fix auth', 'update docs']);
    const withBodies = computeBodyPresenceRatio([
      'fix auth\n\nDetailed explanation here.',
      'update docs\n\nMore context.',
    ]);
    expect(noBodies.value).toBeGreaterThan(withBodies.value);
  });
});
