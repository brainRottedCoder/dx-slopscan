import type { FileTreeNode } from '@slop-scanner/shared-types';
import { describe, expect, it } from 'vitest';

import { listFilesInFolder } from './folder-files.js';

const TREE: FileTreeNode[] = [
  {
    path: 'src',
    name: 'src',
    type: 'dir',
    children: [
      { path: 'src/index.ts', name: 'index.ts', type: 'file' },
      { path: 'src/util.ts', name: 'util.ts', type: 'file' },
    ],
  },
  { path: 'README.md', name: 'README.md', type: 'file' },
];

describe('listFilesInFolder', () => {
  it('lists files under folder prefix', () => {
    const files = listFilesInFolder(TREE, 'src');
    expect(files).toContain('src/index.ts');
    expect(files).not.toContain('README.md');
  });

  it('lists all files for root folder', () => {
    const files = listFilesInFolder(TREE, '.');
    expect(files.length).toBeGreaterThanOrEqual(3);
  });
});
