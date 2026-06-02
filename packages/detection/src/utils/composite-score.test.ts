import type { SignalScore } from '@slop-scanner/shared-types';

import { describe, expect, it } from 'vitest';

import { composeScore } from './composite-score.js';

describe('composeScore', () => {
  it('computes weighted aggregate and rounds to 0–100', () => {
    const signals: SignalScore[] = [
      { signal: 's1', value: 1, weight: 0.5, explanation: 'Perfect' },
      { signal: 's2', value: 0, weight: 0.5, explanation: 'Zero' },
    ];
    const composite = composeScore(signals);
    expect(composite.total).toBe(50);
    expect(composite.grade).toBe('F');
  });

  it('returns A grade for high total', () => {
    const signals: SignalScore[] = [
      { signal: 's1', value: 1, weight: 0.5, explanation: 'A1' },
      { signal: 's2', value: 1, weight: 0.5, explanation: 'A2' },
    ];
    const composite = composeScore(signals);
    expect(composite.total).toBe(100);
    expect(composite.grade).toBe('A');
  });

  it('returns F grade for low total', () => {
    const signals: SignalScore[] = [
      { signal: 's1', value: 0, weight: 0.5, explanation: 'F1' },
      { signal: 's2', value: 0, weight: 0.5, explanation: 'F2' },
    ];
    const composite = composeScore(signals);
    expect(composite.total).toBe(0);
    expect(composite.grade).toBe('F');
  });

  it('includes ISO timestamp', () => {
    const signals: SignalScore[] = [
      { signal: 's1', value: 0.5, weight: 1, explanation: 'Single' },
    ];
    const composite = composeScore(signals);
    expect(composite.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('copies signals array immutably', () => {
    const signals: SignalScore[] = [
      { signal: 's1', value: 0.3, weight: 0.7, explanation: 'Copy test' },
    ];
    const composite = composeScore(signals);
    expect(composite.signals).toHaveLength(1);
    expect(composite.signals[0]?.signal).toBe('s1');
  });

  it('handles three signals with different weights', () => {
    const signals: SignalScore[] = [
      { signal: 's1', value: 1, weight: 0.2, explanation: 'A' },
      { signal: 's2', value: 0.5, weight: 0.3, explanation: 'B' },
      { signal: 's3', value: 0, weight: 0.5, explanation: 'C' },
    ];
    // total = 1*0.2 + 0.5*0.3 + 0*0.5 = 0.35 -> 35
    const composite = composeScore(signals);
    expect(composite.total).toBe(35);
  });
});
