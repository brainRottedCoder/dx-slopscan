import { describe, expect, it } from 'vitest';

import { computeVocabularyShift } from './vocabulary-shift.js';

describe('computeVocabularyShift', () => {
  it('returns 0 for identical centroids', () => {
    const vector = new Float32Array([1, 0, 0]);
    expect(computeVocabularyShift(vector, vector)).toBe(0);
  });

  it('returns high drift for orthogonal vectors', () => {
    const a = new Float32Array([1, 0, 0]);
    const b = new Float32Array([0, 1, 0]);
    expect(computeVocabularyShift(a, b)).toBeCloseTo(1, 1);
  });

  it('returns 0 for empty vectors', () => {
    expect(computeVocabularyShift(new Float32Array(), new Float32Array())).toBe(0);
  });
});
