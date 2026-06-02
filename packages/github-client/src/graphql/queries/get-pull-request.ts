import type { GithubPrNode } from '../response-types.js';

export const GET_PULL_REQUEST = `
  query GetPullRequest($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
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
`;

export interface GetPullRequestResponse {
  readonly repository: {
    readonly pullRequest: GithubPrNode | null;
  };
}

export interface GetPullRequestVariables {
  readonly owner: string;
  readonly name: string;
  readonly number: number;
}
