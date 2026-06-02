import { describe, expect, it } from 'vitest';

import type { GithubContributorNode } from '../graphql/response-types.js';

import { adaptContributor, adaptContributorSummary } from './contributor.adapter.js';

describe('contributor adapters', () => {
  const node: GithubContributorNode = {
    login: 'dev',
    avatarUrl: 'https://example.com/a.png',
    contributionsCollection: {
      totalCommitContributions: 12,
      totalPullRequestContributions: 4,
    },
  };

  it('adaptContributor maps contribution counts', () => {
    expect(adaptContributor(node)).toEqual({
      login: 'dev',
      avatarUrl: 'https://example.com/a.png',
      prCount: 4,
      commitCount: 12,
    });
  });

  it('adaptContributorSummary adds recentActivity', () => {
    expect(adaptContributorSummary(node).recentActivity).toBe('active');
  });

  it('defaults counts to zero when collection missing', () => {
    const sparse: GithubContributorNode = {
      login: 'ghost',
      avatarUrl: null,
      contributionsCollection: null,
    };
    expect(adaptContributor(sparse).prCount).toBe(0);
  });
});
