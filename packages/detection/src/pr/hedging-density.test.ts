import { describe, expect, it } from 'vitest';

import { computeHedgingDensity } from './hedging-density.js';

const AI_PR =
  'This change typically improves the system and generally makes things better. ' +
  'It is worth noting that the implementation might possibly help in most cases. ' +
  'Perhaps this could potentially reduce issues somewhat.';

const TERSE_COMMIT = 'fix null pointer in parser';

describe('computeHedgingDensity', () => {
  it('scores typical AI PR above 0.5', () => {
    const score = computeHedgingDensity(AI_PR);
    expect(score.value).toBeGreaterThan(0.5);
  });

  it('scores terse commit below 0.2', () => {
    const score = computeHedgingDensity(TERSE_COMMIT);
    expect(score.value).toBeLessThan(0.2);
  });

  it('returns zero for very short text', () => {
    const score = computeHedgingDensity('too short');
    expect(score.value).toBe(0);
    expect(score.explanation).toContain('too short');
  });
});
