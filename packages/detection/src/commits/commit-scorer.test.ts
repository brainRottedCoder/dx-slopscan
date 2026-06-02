import { describe, expect, it } from 'vitest';

import { scoreCommitDistribution } from './commit-scorer.js';

describe('scoreCommitDistribution', () => {
  it('returns composite score for batch', () => {
    const score = scoreCommitDistribution({
      messages: ['fix auth', 'update docs', 'refactor api'],
      timestamps: [
        '2026-01-01T00:00:00.000Z',
        '2026-01-02T00:00:00.000Z',
        '2026-01-03T00:00:00.000Z',
      ],
    });

    expect(score.signals.length).toBe(5);
    expect(score.total).toBeGreaterThanOrEqual(0);
  });

  it('returns zero total for empty batch', () => {
    const score = scoreCommitDistribution({ messages: [], timestamps: [] });
    expect(score.total).toBe(0);
  });

  it('produces bounded total between 0 and 100', () => {
    const score = scoreCommitDistribution({
      messages: Array.from({ length: 10 }, () => 'fix bug in module'),
      timestamps: Array.from({ length: 10 }, (_, i) =>
        new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
      ),
    });
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });
});
