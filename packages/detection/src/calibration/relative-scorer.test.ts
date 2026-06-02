import { describe, expect, it } from 'vitest';

import { formatRelativeScore, getPercentile } from './relative-scorer.js';

const DISTRIBUTION = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

describe('getPercentile', () => {
  it('returns at or below 10 for bottom-10% score', () => {
    expect(getPercentile(10, DISTRIBUTION)).toBeLessThanOrEqual(10);
  });

  it('returns 100 for max score', () => {
    expect(getPercentile(100, DISTRIBUTION)).toBe(100);
  });
});

describe('formatRelativeScore', () => {
  it('returns bottom tier at percentile 15', () => {
    expect(formatRelativeScore(15)).toBe('Bottom 15% of surveyed OSS repositories');
  });

  it('returns below median at percentile 40', () => {
    expect(formatRelativeScore(40)).toBe('Below OSS median');
  });

  it('returns near median at percentile 60', () => {
    expect(formatRelativeScore(60)).toBe('Near OSS median');
  });

  it('returns above median at percentile 61', () => {
    expect(formatRelativeScore(61)).toBe('Above OSS median');
  });
});
