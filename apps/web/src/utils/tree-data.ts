import type { FileTreeNode } from '@slop-scanner/shared-types';

export interface ArboristNode {
  readonly id: string;
  readonly name: string;
  readonly children?: ArboristNode[];
  readonly score?: number;
}

/** Convert API file tree nodes to react-arborist data. */
export function toArboristNodes(nodes: readonly FileTreeNode[]): ArboristNode[] {
  return nodes.map((node) => ({
    id: node.path,
    name: node.name,
    ...(node.score != null ? { score: node.score } : {}),
    ...(node.children ? { children: toArboristNodes(node.children) } : {}),
  }));
}

/** Generate a deep tree for performance testing. */
export function generateMockTree(nodeCount: number): ArboristNode[] {
  const nodes: ArboristNode[] = [];
  for (let index = 0; index < nodeCount; index += 1) {
    nodes.push({
      id: `src/file-${String(index)}.ts`,
      name: `file-${String(index)}.ts`,
      score: index % 100,
    });
  }
  return nodes;
}
