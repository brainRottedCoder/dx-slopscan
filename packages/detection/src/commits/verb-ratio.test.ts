import { describe, expect, it } from 'vitest';

import { computeImperativeVerbRatio } from './verb-ratio.js';

describe('computeImperativeVerbRatio', () => {
  it('detects imperative commit subjects', () => {
    const score = computeImperativeVerbRatio(['fix auth', 'update docs', 'add tests']);
    expect(score.value).toBeGreaterThan(0.5);
  });

  it('returns zero for empty batch', () => {
    const score = computeImperativeVerbRatio([]);
    expect(score.value).toBe(0);
  });

  it('scores non-imperative subjects lower', () => {
    const imperative = computeImperativeVerbRatio(['fix bug', 'add feature']);
    const descriptive = computeImperativeVerbRatio(['auth bug resolved', 'feature complete']);
    expect(imperative.value).toBeGreaterThan(descriptive.value);
  });
});
