import { describe, expect, it } from 'vitest';

import { computeParagraphVariance } from './paragraph-variance.js';

const UNIFORM_DOC = `First section with exactly twenty words in this paragraph for testing purposes here today.

Second section with exactly twenty words in this paragraph for testing purposes here today.

Third section with exactly twenty words in this paragraph for testing purposes here today.`;

const VARIED_DOC = `Short intro.

This paragraph is much longer and explains configuration options, trade-offs, and migration steps in detail for operators.

Tiny note.`;

describe('computeParagraphVariance', () => {
  it('flags uniform paragraph lengths', () => {
    const score = computeParagraphVariance(UNIFORM_DOC);
    expect(score.value).toBeGreaterThan(0.4);
  });

  it('returns low score for varied paragraph lengths', () => {
    const score = computeParagraphVariance(VARIED_DOC);
    expect(score.value).toBeLessThan(0.5);
  });

  it('returns zero with fewer than two paragraphs', () => {
    const score = computeParagraphVariance('Only one block of text without breaks.');
    expect(score.value).toBe(0);
  });
});
