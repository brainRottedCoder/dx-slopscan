import { describe, expect, it } from 'vitest';

import { gradeFromTotal } from './score.types.js';

describe('gradeFromTotal', () => {
  it('returns A for scores 90 and above', () => {
    expect(gradeFromTotal(90)).toBe('A');
    expect(gradeFromTotal(100)).toBe('A');
  });

  it('returns F for scores below 60', () => {
    expect(gradeFromTotal(59)).toBe('F');
    expect(gradeFromTotal(0)).toBe('F');
  });

  it('returns correct middle grades', () => {
    expect(gradeFromTotal(85)).toBe('B');
    expect(gradeFromTotal(75)).toBe('C');
    expect(gradeFromTotal(65)).toBe('D');
  });
});
