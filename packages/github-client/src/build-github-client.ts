import type {
  CommitMessage,
  ContributorSummary,
  DocFile,
  FileTreeNode,
  PullRequest,
  RepoRef,
} from '@slop-scanner/shared-types';

import { adaptCommit } from './adapters/commit.adapter.js';
import { adaptContributorSummary } from './adapters/contributor.adapter.js';
import { adaptPr } from './adapters/pr.adapter.js';
import { adaptTreeEntries } from './adapters/tree.adapter.js';
import { fetchTopLevelDocs } from './docs/top-level-docs.js';
import { createGraphqlClient } from './graphql/graphql-client.js';
import {
  GET_RECENT_COMMITS,
  type GetRecentCommitsResponse,
} from './graphql/queries/get-commits.js';
import {
  GET_CONTRIBUTORS,
  type GetContributorsResponse,
} from './graphql/queries/get-contributors.js';
import { GET_RECENT_PRS, type GetRecentPrsResponse } from './graphql/queries/get-prs.js';
import {
  GET_PULL_REQUEST,
  type GetPullRequestResponse,
} from './graphql/queries/get-pull-request.js';
import { GET_FILE_TREE, type GetFileTreeResponse } from './graphql/queries/get-tree.js';
import { parseRepoUrl } from './parse-repo-url.js';
import { createRestClient, type RestClient } from './rest/rest-client.js';

export interface GitHubClient {
  readonly parseRepoUrl: typeof parseRepoUrl;
  readonly rest: RestClient;
  getRecentPrs(repo: RepoRef, count: number): Promise<PullRequest[]>;
  getPullRequest(repo: RepoRef, prNumber: number): Promise<PullRequest>;
  getRecentCommits(repo: RepoRef, count: number): Promise<CommitMessage[]>;
  getFileTree(repo: RepoRef): Promise<{ tree: FileTreeNode[]; headSha: string }>;
  getTopLevelDocs(
    repo: RepoRef,
    tree: readonly FileTreeNode[],
    headSha: string,
    maxFiles: number,
  ): Promise<DocFile[]>;
  getContributors(repo: RepoRef): Promise<ContributorSummary[]>;
}

export function buildGitHubClient(token: string): GitHubClient {
  const graphql = createGraphqlClient(token);
  const rest = createRestClient(token);

  return {
    parseRepoUrl,
    rest,

    async getRecentPrs(repo: RepoRef, count: number): Promise<PullRequest[]> {
      const data = await graphql.query<GetRecentPrsResponse>(GET_RECENT_PRS, {
        owner: repo.owner,
        name: repo.repo,
        count,
      });
      return data.repository.pullRequests.nodes.map(adaptPr);
    },

    async getPullRequest(repo: RepoRef, prNumber: number): Promise<PullRequest> {
      const data = await graphql.query<GetPullRequestResponse>(GET_PULL_REQUEST, {
        owner: repo.owner,
        name: repo.repo,
        number: prNumber,
      });
      const node = data.repository.pullRequest;
      if (!node) {
        throw new Error(`Pull request #${String(prNumber)} not found`);
      }
      return adaptPr(node);
    },

    async getRecentCommits(repo: RepoRef, count: number): Promise<CommitMessage[]> {
      const data = await graphql.query<GetRecentCommitsResponse>(GET_RECENT_COMMITS, {
        owner: repo.owner,
        name: repo.repo,
        count,
      });
      const nodes = data.repository.defaultBranchRef?.target.history.nodes ?? [];
      return nodes.map(adaptCommit);
    },

    async getFileTree(repo: RepoRef): Promise<{ tree: FileTreeNode[]; headSha: string }> {
      const data = await graphql.query<GetFileTreeResponse>(GET_FILE_TREE, {
        owner: repo.owner,
        name: repo.repo,
      });
      const target = data.repository.defaultBranchRef?.target;
      const entries = target?.tree.entries ?? [];
      const headSha = target?.oid ?? '';
      return { tree: adaptTreeEntries(entries), headSha };
    },

    async getTopLevelDocs(
      repo: RepoRef,
      tree: readonly FileTreeNode[],
      headSha: string,
      maxFiles: number,
    ): Promise<DocFile[]> {
      return fetchTopLevelDocs(rest, repo, tree, headSha, maxFiles);
    },

    async getContributors(repo: RepoRef): Promise<ContributorSummary[]> {
      const data = await graphql.query<GetContributorsResponse>(GET_CONTRIBUTORS, {
        owner: repo.owner,
        name: repo.repo,
      });
      return data.repository.mentionableUsers.nodes.map(adaptContributorSummary);
    },
  };
}
