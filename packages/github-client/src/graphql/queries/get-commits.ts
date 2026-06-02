import type { GithubCommitNode } from '../response-types.js';

export const GET_RECENT_COMMITS = `
  query GetRecentCommits($owner: String!, $name: String!, $count: Int!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: $count) {
              nodes {
                oid
                message
                committedDate
                author {
                  user {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface GetRecentCommitsResponse {
  readonly repository: {
    readonly defaultBranchRef: {
      readonly target: {
        readonly history: {
          readonly nodes: readonly GithubCommitNode[];
        };
      };
    } | null;
  };
}

export interface GetRecentCommitsVariables {
  readonly owner: string;
  readonly name: string;
  readonly count: number;
}
