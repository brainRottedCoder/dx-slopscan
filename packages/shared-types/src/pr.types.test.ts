import { describe, expect, it } from 'vitest';

import type { PrScoringInput, PullRequest } from './pr.types.js';

describe('PullRequest', () => {
  it('requires core GitHub fields', () => {
    const pr: PullRequest = {
      number: 1,
      title: 'Fix auth',
      body: 'Because session tokens expired.',
      state: 'OPEN',
      author: 'dev',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      additions: 10,
      deletions: 2,
      changedFiles: 1,
    };
    expect(pr.number).toBe(1);
  });
});

describe('PrScoringInput', () => {
  it('accepts diff metadata for detection pipeline', () => {
    const input: PrScoringInput = {
      description: 'Updates AuthService',
      diffSymbols: ['AuthService'],
      changedFunctions: ['login'],
      diffLineCount: 42,
    };
    expect(input.diffLineCount).toBe(42);
  });
});
