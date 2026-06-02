import type { Contributor, ContributorSummary } from '@slop-scanner/shared-types';

import type { GithubContributorNode } from '../graphql/response-types.js';

/** Map raw GitHub user to domain Contributor. */
export function adaptContributor(node: GithubContributorNode): Contributor {
  const stats = node.contributionsCollection;
  return {
    login: node.login,
    avatarUrl: node.avatarUrl,
    prCount: stats?.totalPullRequestContributions ?? 0,
    commitCount: stats?.totalCommitContributions ?? 0,
  };
}

/** Map to Tier 1 contributor summary row. */
export function adaptContributorSummary(node: GithubContributorNode): ContributorSummary {
  const contributor = adaptContributor(node);
  return {
    login: contributor.login,
    avatarUrl: contributor.avatarUrl,
    prCount: contributor.prCount,
    commitCount: contributor.commitCount,
    recentActivity: 'active',
  };
}
