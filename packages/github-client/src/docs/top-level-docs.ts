import type { DocFile, FileTreeNode, RepoRef } from '@slop-scanner/shared-types';

import type { RestClient } from '../rest/rest-client.js';
import { githubPool } from '../throttle/p-limit-pool.js';

const DOC_FILE_PATTERN = /\.(?:md|mdx|rst)$/i;
const README_PATTERN = /^readme\.md$/i;

function isTopLevelDocPath(path: string): boolean {
  if (path.includes('/')) return false;
  return README_PATTERN.test(path) || DOC_FILE_PATTERN.test(path);
}

/** Collect top-level documentation files from a repository tree. */
export function findTopLevelDocPaths(tree: readonly FileTreeNode[], maxFiles: number): string[] {
  const paths: string[] = [];

  for (const node of tree) {
    if (node.type !== 'file') continue;
    if (!isTopLevelDocPath(node.path)) continue;
    paths.push(node.path);
    if (paths.length >= maxFiles) break;
  }

  return paths.sort((a, b) => {
    if (README_PATTERN.test(a)) return -1;
    if (README_PATTERN.test(b)) return 1;
    return a.localeCompare(b);
  });
}

/** Fetch README and top-level markdown files via the REST API. */
export async function fetchTopLevelDocs(
  rest: RestClient,
  repo: RepoRef,
  tree: readonly FileTreeNode[],
  headSha: string,
  maxFiles: number,
): Promise<DocFile[]> {
  const paths = findTopLevelDocPaths(tree, maxFiles);
  const docs: DocFile[] = [];

  for (const path of paths) {
    const content = await githubPool(() =>
      rest.fetchRawFileContent(repo.owner, repo.repo, path, headSha),
    );
    docs.push({ path, name: path, content });
  }

  return docs;
}
