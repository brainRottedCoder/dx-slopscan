import type { FolderHeatmapEntry } from '@slop-scanner/shared-types';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

import { scoreToRepoColorVar } from '../../../constants/theme.js';

export interface RepoTreemapProps {
  readonly heatmap: readonly FolderHeatmapEntry[];
  readonly onFolderSelect?: (path: string) => void;
  readonly scanning?: boolean;
}

interface TreemapNode {
  readonly name: string;
  readonly value: number;
  readonly score: number;
  readonly topSignals: readonly string[];
}

const TREEMAP_WIDTH = 640;
const TREEMAP_HEIGHT = 340;

function toTreemapNodes(heatmap: readonly FolderHeatmapEntry[]): TreemapNode[] {
  return heatmap.map((entry) => ({
    name: entry.path,
    value: Math.max(entry.fileCount, 1),
    score: entry.aggregateScore,
    topSignals: entry.topSignals,
  }));
}

/** Map aggregate score to repo color vars (no hardcoded hex). */
export function scoreToTreemapColor(score: number): string {
  return scoreToRepoColorVar(score);
}

/** D3 treemap sized by file count and colored by aggregate score. */
export function RepoTreemap({ heatmap, onFolderSelect, scanning = false }: RepoTreemapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = toTreemapNodes(heatmap);
    if (nodes.length === 0) return;

    type HierarchyRoot = { readonly name: string; readonly children: TreemapNode[] };

    const root = d3
      .hierarchy<HierarchyRoot | TreemapNode>({ name: 'root', children: nodes })
      .sum((node) => ('value' in node ? node.value : 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.treemap<HierarchyRoot | TreemapNode>().size([TREEMAP_WIDTH, TREEMAP_HEIGHT]).padding(2)(
      root,
    );

    const leaves = root.leaves() as d3.HierarchyRectangularNode<TreemapNode>[];

    const groups = svg
      .attr('viewBox', `0 0 ${String(TREEMAP_WIDTH)} ${String(TREEMAP_HEIGHT)}`)
      .selectAll('g')
      .data(leaves)
      .join('g')
      .attr('transform', (node) => `translate(${String(node.x0)},${String(node.y0)})`);

    groups
      .append('rect')
      .attr('width', (node) => Math.max(node.x1 - node.x0, 0))
      .attr('height', (node) => Math.max(node.y1 - node.y0, 0))
      .attr('fill', (node) => scoreToTreemapColor(node.data.score))
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('class', 'cursor-pointer opacity-85 hover:opacity-100')
      .style('transition', 'opacity 0.2s ease')
      .on('click', (_event, node) => {
        onFolderSelect?.(node.data.name);
      });

    groups
      .append('title')
      .text(
        (node) =>
          `${node.data.name}\nFiles: ${String(node.data.value)}\nScore: ${node.data.score.toFixed(0)}`,
      );

    groups
      .filter((node) => node.x1 - node.x0 > 48 && node.y1 - node.y0 > 20)
      .append('text')
      .attr('x', 4)
      .attr('y', 14)
      .attr('fill', 'var(--text-primary)')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text((node) => node.data.name);
  }, [heatmap, onFolderSelect]);

  return (
    <div className="scan-slice relative min-h-[340px] w-full">
      {scanning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <span className="badge badge-analysing">Scanning folders…</span>
        </div>
      )}
      <svg
        ref={svgRef}
        className="relative z-[1] h-auto w-full max-w-full"
        role="img"
        aria-label="Repository folder heatmap"
      />
    </div>
  );
}
