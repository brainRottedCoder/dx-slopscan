import { describe, expect, it } from 'vitest';

import type { GithubPrNode } from '../graphql/response-types.js';

import { adaptPr } from './pr.adapter.js';

describe('adaptPr', () => {
  it('maps GraphQL PR node to PullRequest', () => {
    const node: GithubPrNode = {
      number: 42,
      title: 'Improve cache',
      body: 'Fixes #1',
      state: 'OPEN',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      additions: 10,
      deletions: 2,
      changedFiles: 1,
      author: { login: 'dev', avatarUrl: 'https://example.com/a.png' },
    };
    expect(adaptPr(node).author).toBe('dev');
    expect(adaptPr(node).body).toBe('Fixes #1');
  });

  it('defaults missing body to empty string', () => {
    const node: GithubPrNode = {
      number: 1,
      title: 'T',
      body: null,
      state: 'MERGED',
      createdAt: '',
      updatedAt: '',
      additions: 0,
      deletions: 0,
      changedFiles: 0,
      author: null,
    };
    expect(adaptPr(node).body).toBe('');
    expect(adaptPr(node).author).toBe('ghost');
  });
});
