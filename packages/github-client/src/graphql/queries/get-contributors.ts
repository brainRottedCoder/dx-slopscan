import type { GithubContributorNode } from '../response-types.js';

export const GET_CONTRIBUTORS = `
  query GetContributors($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      mentionableUsers(first: 100) {
        nodes {
          login
          avatarUrl
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
          }
        }
      }
    }
  }
`;

export interface GetContributorsResponse {
  readonly repository: {
    readonly mentionableUsers: {
      readonly nodes: readonly GithubContributorNode[];
    };
  };
}

export interface GetContributorsVariables {
  readonly owner: string;
  readonly name: string;
}
