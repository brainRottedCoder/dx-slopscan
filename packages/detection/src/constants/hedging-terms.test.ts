import { describe, expect, it } from 'vitest';

import { HEDGING_TERMS } from './hedging-terms.js';

describe('HEDGING_TERMS', () => {
  it('has no duplicate entries', () => {
    expect(new Set(HEDGING_TERMS).size).toBe(HEDGING_TERMS.length);
  });

  it('contains at least 80 terms', () => {
    expect(HEDGING_TERMS.length).toBeGreaterThanOrEqual(80);
  });
});
