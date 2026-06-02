import type { GithubPrNode } from '../response-types.js';

export const GET_RECENT_PRS = `
  query GetRecentPRs($owner: String!, $name: String!, $count: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequests(last: $count, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          number
          title
          body
          state
          createdAt
          updatedAt
          additions
          deletions
          changedFiles
          author {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

export interface GetRecentPrsResponse {
  readonly repository: {
    readonly pullRequests: {
      readonly nodes: readonly GithubPrNode[];
    };
  };
}

export interface GetRecentPrsVariables {
  readonly owner: string;
  readonly name: string;
  readonly count: number;
}
