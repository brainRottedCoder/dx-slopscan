import { describe, expect, it } from 'vitest';

import type { CommitBatch, CommitDistributionResult, CommitMessage } from './commit.types.js';

describe('CommitMessage', () => {
  it('stores sha and author login', () => {
    const commit: CommitMessage = {
      sha: 'abc123',
      message: 'fix: handle expiry',
      author: 'dev',
      committedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(commit.sha).toBe('abc123');
  });
});

describe('CommitBatch', () => {
  it('pairs messages with timestamps for distribution scoring', () => {
    const batch: CommitBatch = {
      messages: ['fix: a', 'feat: b'],
      timestamps: ['2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'],
    };
    expect(batch.messages).toHaveLength(2);
  });
});

describe('CommitDistributionResult', () => {
  it('includes sample metadata', () => {
    const result: CommitDistributionResult = {
      score: { total: 70, grade: 'C', signals: [], computedAt: '' },
      sampleSize: 50,
      lookbackDays: 90,
    };
    expect(result.lookbackDays).toBe(90);
  });
});
