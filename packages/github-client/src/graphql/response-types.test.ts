import { describe, expect, it } from 'vitest';

import type {
  GithubCommitNode,
  GithubContributorNode,
  GithubPrNode,
  GithubTreeEntry,
} from './response-types.js';

describe('GitHub GraphQL response types', () => {
  it('accepts PR node shape', () => {
    const node: GithubPrNode = {
      number: 1,
      title: 'T',
      body: null,
      state: 'OPEN',
      createdAt: '',
      updatedAt: '',
      additions: 0,
      deletions: 0,
      changedFiles: 0,
      author: null,
    };
    expect(node.state).toBe('OPEN');
  });

  it('accepts commit node shape', () => {
    const node: GithubCommitNode = {
      oid: 'abc',
      message: 'msg',
      committedDate: '',
      author: null,
    };
    expect(node.oid).toBe('abc');
  });

  it('accepts tree entry shape', () => {
    const entry: GithubTreeEntry = {
      path: 'src',
      name: 'src',
      type: 'tree',
      object: null,
    };
    expect(entry.type).toBe('tree');
  });

  it('accepts contributor node shape', () => {
    const node: GithubContributorNode = {
      login: 'dev',
      avatarUrl: null,
      contributionsCollection: {
        totalCommitContributions: 1,
        totalPullRequestContributions: 2,
      },
    };
    expect(node.login).toBe('dev');
  });
});
