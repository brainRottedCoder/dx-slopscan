import { describe, expect, it } from 'vitest';

import { computeDocHedgingDensity } from './hedging-density.js';

describe('computeDocHedgingDensity', () => {
  it('uses doc_hedging_density signal id', () => {
    const text =
      'Typically, this module generally handles authentication. Usually it is worth noting that tokens expire.';
    const score = computeDocHedgingDensity(text);
    expect(score.signal).toBe('doc_hedging_density');
    expect(score.value).toBeGreaterThan(0);
  });

  it('returns zero for short text', () => {
    const score = computeDocHedgingDensity('Too short');
    expect(score.value).toBe(0);
  });

  it('returns low score for concrete terse docs', () => {
    const score = computeDocHedgingDensity(
      'Run `pnpm install`. Set `API_KEY` in `.env`. Restart the server.',
    );
    expect(score.value).toBeLessThan(0.3);
  });
});
