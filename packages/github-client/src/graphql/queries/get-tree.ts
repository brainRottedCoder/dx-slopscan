import type { GithubTreeEntry } from '../response-types.js';

export const GET_FILE_TREE = `
  query GetFileTree($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          oid
          ... on Commit {
            tree {
              entries {
                path
                name
                type
                object {
                  ... on Blob {
                    byteSize
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

export interface GetFileTreeResponse {
  readonly repository: {
    readonly defaultBranchRef: {
      readonly target: {
        readonly oid: string;
        readonly tree: {
          readonly entries: readonly GithubTreeEntry[];
        };
      };
    } | null;
  };
}

export interface GetFileTreeVariables {
  readonly owner: string;
  readonly name: string;
}
