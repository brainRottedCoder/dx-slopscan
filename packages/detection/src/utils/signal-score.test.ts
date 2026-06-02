import type { SignalScore } from '@slop-scanner/shared-types';

import { describe, expect, it } from 'vitest';

import { buildSignalScore, invertSignalScore, zeroScore } from './signal-score.js';

describe('buildSignalScore', () => {
  it('builds a normalized signal score entry', () => {
    const score = buildSignalScore('test_signal', 0.75, 0.25, 'Test explanation');
    expect(score.signal).toBe('test_signal');
    expect(score.value).toBe(0.75);
    expect(score.weight).toBe(0.25);
    expect(score.explanation).toBe('Test explanation');
  });

  it('clamps value to 0–1', () => {
    const high = buildSignalScore('high', 1.5, 0.3, 'Too high');
    expect(high.value).toBe(1);

    const low = buildSignalScore('low', -0.2, 0.3, 'Too low');
    expect(low.value).toBe(0);
  });

  it('preserves exact value within range', () => {
    const score = buildSignalScore('exact', 0.123, 0.4, 'Exact');
    expect(score.value).toBe(0.123);
  });
});

describe('zeroScore', () => {
  it('returns zero-value signal with explanation', () => {
    const score = zeroScore('empty_signal', 'No data available');
    expect(score.value).toBe(0);
    expect(score.weight).toBe(0);
    expect(score.explanation).toBe('No data available');
  });

  it('allows custom weight', () => {
    const score = zeroScore('weighted_zero', 'Zero but weighted', 0.15);
    expect(score.weight).toBe(0.15);
  });
});

describe('invertSignalScore', () => {
  it('inverts the signal value (1 - value)', () => {
    const original: SignalScore = {
      signal: 'overlap',
      value: 0.8,
      weight: 0.25,
      explanation: 'High overlap is bad',
    };
    const inverted = invertSignalScore(original);
    expect(inverted.value).toBeCloseTo(0.2, 10);
    expect(inverted.signal).toBe('overlap');
    expect(inverted.weight).toBe(0.25);
  });

  it('clamps inverted value to 0–1', () => {
    const original: SignalScore = {
      signal: 'edge',
      value: 0,
      weight: 0.3,
      explanation: 'Edge case',
    };
    const inverted = invertSignalScore(original);
    expect(inverted.value).toBe(1);
  });

  it('prepends explanation with inversion marker', () => {
    const original: SignalScore = {
      signal: 'test',
      value: 0.5,
      weight: 0.2,
      explanation: 'Original text',
    };
    const inverted = invertSignalScore(original);
    expect(inverted.explanation).toContain('Inverted slop signal');
    expect(inverted.explanation).toContain('Original text');
  });
});
