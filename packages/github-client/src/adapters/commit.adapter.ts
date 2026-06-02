import type { CommitMessage } from '@slop-scanner/shared-types';

import type { GithubCommitNode } from '../graphql/response-types.js';

/** Map raw GitHub commit node to domain CommitMessage. */
export function adaptCommit(node: GithubCommitNode): CommitMessage {
  return {
    sha: node.oid,
    message: node.message,
    author: node.author?.user?.login ?? 'ghost',
    committedAt: node.committedDate,
  };
}
