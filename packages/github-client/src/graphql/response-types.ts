/** Raw GitHub GraphQL pull request node. */
export interface GithubPrNode {
  readonly number: number;
  readonly title: string;
  readonly body: string | null;
  readonly state: 'OPEN' | 'CLOSED' | 'MERGED';
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly additions: number;
  readonly deletions: number;
  readonly changedFiles: number;
  readonly author: { readonly login: string; readonly avatarUrl: string | null } | null;
}

/** Raw GitHub GraphQL commit node. */
export interface GithubCommitNode {
  readonly oid: string;
  readonly message: string;
  readonly committedDate: string;
  readonly author: { readonly user: { readonly login: string } | null } | null;
}

/** Raw GitHub tree entry from GraphQL. */
export interface GithubTreeEntry {
  readonly path: string;
  readonly name: string;
  readonly type: 'blob' | 'tree';
  readonly object: { readonly byteSize?: number | null } | null;
}

/** Raw GitHub collaborator node. */
export interface GithubContributorNode {
  readonly login: string;
  readonly avatarUrl: string | null;
  readonly contributionsCollection?: {
    readonly totalCommitContributions: number;
    readonly totalPullRequestContributions: number;
  } | null;
}
