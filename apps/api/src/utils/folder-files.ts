import type { FileTreeNode } from '@slop-scanner/shared-types';

/** List file paths under a folder prefix from a repository tree. */
export function listFilesInFolder(
  tree: readonly FileTreeNode[],
  folderPath: string,
): string[] {
  const normalized = folderPath === '.' ? '' : folderPath.replace(/\/$/, '');
  const paths: string[] = [];

  const visit = (nodes: readonly FileTreeNode[], prefix: string): void => {
    for (const node of nodes) {
      const fullPath = prefix.length > 0 ? `${prefix}/${node.name}` : node.name;
      if (node.type === 'file') {
        if (normalized.length === 0 || fullPath.startsWith(`${normalized}/`) || fullPath === normalized) {
          paths.push(fullPath);
        }
      }
      if (node.children) visit(node.children, fullPath);
    }
  };

  visit(tree, '');
  return paths;
}
