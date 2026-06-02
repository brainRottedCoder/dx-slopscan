import { describe, expect, it } from 'vitest';

import { computeLexicalOverlap } from './lexical-overlap.js';

describe('computeLexicalOverlap', () => {
  it('returns ~1.0 at full overlap', () => {
    const score = computeLexicalOverlap({
      diffSymbols: ['UserService', 'AuthController'],
      descriptionText: 'Updates UserService and AuthController',
    });
    expect(score.value).toBe(1);
  });

  it('returns 0.0 at zero overlap', () => {
    const score = computeLexicalOverlap({
      diffSymbols: ['Alpha', 'Beta'],
      descriptionText: 'Unrelated summary text',
    });
    expect(score.value).toBe(0);
  });

  it('returns 0 with explanation when no symbols', () => {
    const score = computeLexicalOverlap({
      diffSymbols: [],
      descriptionText: 'Some description',
    });
    expect(score.value).toBe(0);
    expect(score.explanation).toContain('No symbols');
  });
});
