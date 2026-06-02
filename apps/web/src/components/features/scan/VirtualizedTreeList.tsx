import { Tree, type NodeRendererProps } from 'react-arborist';

import type { ArboristNode } from '../../../utils/tree-data.js';
import { ScoreBadge } from '../../ui/ScoreBadge.js';

export interface VirtualizedTreeListProps {
  readonly data: readonly ArboristNode[];
  readonly height?: number;
}

function FileIcon() {
  return (
    <svg className="tree-icon" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2a2 2 0 012-2h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V14a2 2 0 01-2 2H4a2 2 0 01-2-2V2z" fillOpacity="0.2" />
      <path d="M6.5 1A1.5 1.5 0 008 2.5V5H4.5A1.5 1.5 0 003 6.5v7A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0011.5 5H9V2.5A1.5 1.5 0 007.5 1h-1z" />
    </svg>
  );
}

function FolderIcon({ isOpen }: { readonly isOpen: boolean }) {
  return (
    <svg className="tree-icon" viewBox="0 0 16 16" fill="currentColor">
      {isOpen ? (
        <path d="M1.5 2.5A2.5 2.5 0 014 0h2.5a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H12a2 2 0 012 2v.5a.5.5 0 01-.5.5H1.5a.5.5 0 01-.5-.5v-2zM0 4.5a.5.5 0 01.5-.5h14a.5.5 0 01.5.5v8a2.5 2.5 0 01-2.5 2.5h-10A2.5 2.5 0 010 12.5v-8z" />
      ) : (
        <path d="M1.5 2.5A2.5 2.5 0 014 0h2.5a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H12a2 2 0 012 2v.5a.5.5 0 01-.5.5H1.5a.5.5 0 01-.5-.5v-2zM0 4.5a.5.5 0 01.5-.5h14a.5.5 0 01.5.5v8a2.5 2.5 0 01-2.5 2.5h-10A2.5 2.5 0 010 12.5v-8z" />
      )}
    </svg>
  );
}

function TreeRow({ node, style }: NodeRendererProps<ArboristNode>) {
  const score = node.data.score;

  return (
    <div
      className="tree-row"
      style={style}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 truncate text-left text-text-primary hover:text-cyan"
        onClick={() => node.toggle()}
      >
        {node.isLeaf ? <FileIcon /> : <FolderIcon isOpen={node.isOpen} />}
        <span className="truncate">{node.data.name}</span>
      </button>
      {score == null ? (
        <ScoreBadge state="pending" />
      ) : (
        <ScoreBadge state="scored" score={score} />
      )}
    </div>
  );
}

/** Virtualized repository tree (react-arborist). */
export function VirtualizedTreeList({ data, height = 420 }: VirtualizedTreeListProps) {
  return (
    <div
      className="scan-slice overflow-hidden rounded-lg"
      style={{ minHeight: height }}
    >
      <Tree
        data={data}
        width="100%"
        height={height}
        indent={16}
        rowHeight={34}
        openByDefault={false}
      >
        {TreeRow}
      </Tree>
    </div>
  );
}
