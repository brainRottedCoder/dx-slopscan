import type { FileTreeNode } from '@slop-scanner/shared-types';

import type { GithubTreeEntry } from '../graphql/response-types.js';

/** Map flat GitHub tree entries to nested FileTreeNode structure. */
export function adaptTreeEntries(entries: readonly GithubTreeEntry[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const dirMap = new Map<string, FileTreeNode>();

  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));

  for (const entry of sorted) {
    const node: FileTreeNode = {
      path: entry.path,
      name: entry.name,
      type: entry.type === 'tree' ? 'dir' : 'file',
      ...(entry.type === 'blob' && entry.object?.byteSize != null
        ? { size: entry.object.byteSize }
        : {}),
      ...(entry.type === 'tree' ? { children: [] } : {}),
    };

    const slashIndex = entry.path.lastIndexOf('/');
    if (slashIndex === -1) {
      root.push(node);
      if (node.type === 'dir') dirMap.set(entry.path, node);
      continue;
    }

    const parentPath = entry.path.slice(0, slashIndex);
    const parent = dirMap.get(parentPath);
    if (parent?.children) {
      (parent.children as FileTreeNode[]).push(node);
    } else {
      root.push(node);
    }

    if (node.type === 'dir') dirMap.set(entry.path, node);
  }

  return root;
}
