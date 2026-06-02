import { describe, expect, it } from 'vitest';

import { avg, avgSquaredDiff, clamp01 } from './math.js';

describe('avg', () => {
  it('computes arithmetic mean of values', () => {
    expect(avg([1, 2, 3, 4, 5])).toBe(3);
  });

  it('returns 0 for empty array', () => {
    expect(avg([])).toBe(0);
  });

  it('handles single element', () => {
    expect(avg([42])).toBe(42);
  });

  it('handles negative numbers', () => {
    expect(avg([-2, -4])).toBe(-3);
  });

  it('handles floating point', () => {
    expect(avg([1.5, 2.5, 3.0])).toBeCloseTo(2.333, 3);
  });
});

describe('avgSquaredDiff', () => {
  it('computes mean squared deviation from mean', () => {
    const values = [2, 4, 6];
    const mean = 4;
    // (2-4)^2=4, (4-4)^2=0, (6-4)^2=4 -> avg=8/3
    expect(avgSquaredDiff(values, mean)).toBeCloseTo(8 / 3, 5);
  });

  it('returns 0 for empty array', () => {
    expect(avgSquaredDiff([], 5)).toBe(0);
  });

  it('returns 0 when all values equal mean', () => {
    expect(avgSquaredDiff([5, 5, 5], 5)).toBe(0);
  });
});

describe('clamp01', () => {
  it('clamps value to 0–1 inclusive', () => {
    expect(clamp01(0.5)).toBe(0.5);
  });

  it('clamps negative values to 0', () => {
    expect(clamp01(-0.3)).toBe(0);
  });

  it('clamps values above 1 to 1', () => {
    expect(clamp01(1.5)).toBe(1);
  });

  it('returns 0 for 0', () => {
    expect(clamp01(0)).toBe(0);
  });

  it('returns 1 for 1', () => {
    expect(clamp01(1)).toBe(1);
  });
});
