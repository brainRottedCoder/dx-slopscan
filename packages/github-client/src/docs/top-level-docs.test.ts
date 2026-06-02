import type { FileTreeNode } from '@slop-scanner/shared-types';
import { describe, expect, it } from 'vitest';

import { findTopLevelDocPaths } from './top-level-docs.js';

describe('findTopLevelDocPaths', () => {
  const tree: FileTreeNode[] = [
    { path: 'README.md', name: 'README.md', type: 'file' },
    { path: 'src/index.ts', name: 'index.ts', type: 'file' },
    { path: 'CONTRIBUTING.md', name: 'CONTRIBUTING.md', type: 'file' },
  ];

  it('finds top-level markdown files', () => {
    const paths = findTopLevelDocPaths(tree, 20);
    expect(paths).toContain('README.md');
    expect(paths).toContain('CONTRIBUTING.md');
    expect(paths).not.toContain('src/index.ts');
  });

  it('prioritizes README', () => {
    const paths = findTopLevelDocPaths(tree, 20);
    expect(paths[0]).toBe('README.md');
  });

  it('respects max file limit', () => {
    const paths = findTopLevelDocPaths(tree, 1);
    expect(paths).toHaveLength(1);
  });
});
