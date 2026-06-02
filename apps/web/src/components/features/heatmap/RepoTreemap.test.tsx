import type { FolderHeatmapEntry } from '@slop-scanner/shared-types';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RepoTreemap, scoreToTreemapColor } from './RepoTreemap.js';

function buildHeatmap(count: number): FolderHeatmapEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    path: `folder-${String(index)}`,
    fileCount: index + 1,
    aggregateScore: 40 + index * 5,
    topSignals: ['length_stats'],
  }));
}

describe('RepoTreemap', () => {
  it('renders one rect per folder node', () => {
    const { container } = render(<RepoTreemap heatmap={buildHeatmap(5)} />);
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(5);
  });

  it('never maps to danger red hex literal', () => {
    expect(scoreToTreemapColor(10)).not.toBe('#ef4444');
    expect(scoreToTreemapColor(95)).not.toBe('#ef4444');
  });

  it('uses five-tier theme variables for fills', () => {
    expect(scoreToTreemapColor(90)).toBe('var(--color-score-high)');
    expect(scoreToTreemapColor(80)).toBe('var(--color-score-cyan)');
    expect(scoreToTreemapColor(65)).toBe('var(--color-score-medium)');
    expect(scoreToTreemapColor(45)).toBe('var(--color-score-orange)');
    expect(scoreToTreemapColor(10)).toBe('var(--color-score-danger)');
  });

  it('shows scan overlay when scanning', () => {
    const { container } = render(<RepoTreemap heatmap={buildHeatmap(2)} scanning />);
    expect(container.querySelector('.scan-slice .absolute')).not.toBeNull();
  });
});
