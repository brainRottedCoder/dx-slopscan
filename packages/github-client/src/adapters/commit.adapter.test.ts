import { describe, expect, it } from 'vitest';

import type { GithubCommitNode } from '../graphql/response-types.js';

import { adaptCommit } from './commit.adapter.js';

describe('adaptCommit', () => {
  it('maps GraphQL commit node to domain CommitMessage', () => {
    const node: GithubCommitNode = {
      oid: 'sha1',
      message: 'fix: auth',
      committedDate: '2026-01-01T00:00:00.000Z',
      author: { user: { login: 'octocat' } },
    };
    expect(adaptCommit(node)).toEqual({
      sha: 'sha1',
      message: 'fix: auth',
      author: 'octocat',
      committedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('uses ghost when author is missing', () => {
    const node: GithubCommitNode = {
      oid: 'sha2',
      message: 'chore',
      committedDate: '2026-01-02T00:00:00.000Z',
      author: null,
    };
    expect(adaptCommit(node).author).toBe('ghost');
  });
});
