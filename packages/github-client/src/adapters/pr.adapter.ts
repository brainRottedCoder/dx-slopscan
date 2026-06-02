import type { PullRequest } from '@slop-scanner/shared-types';

import type { GithubPrNode } from '../graphql/response-types.js';

/** Map raw GitHub PR node to domain PullRequest. */
export function adaptPr(node: GithubPrNode): PullRequest {
  return {
    number: node.number,
    title: node.title,
    body: node.body ?? '',
    state: node.state,
    author: node.author?.login ?? 'ghost',
    avatarUrl: node.author?.avatarUrl ?? null,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    additions: node.additions,
    deletions: node.deletions,
    changedFiles: node.changedFiles,
  };
}
