import { describe, expect, it } from 'vitest';

import type { GithubTreeEntry } from '../graphql/response-types.js';

import { adaptTreeEntries } from './tree.adapter.js';

describe('adaptTreeEntries', () => {
  it('nests directories and files', () => {
    const entries: GithubTreeEntry[] = [
      { path: 'src', name: 'src', type: 'tree', object: null },
      { path: 'src/index.ts', name: 'index.ts', type: 'blob', object: { byteSize: 120 } },
    ];
    const tree = adaptTreeEntries(entries);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.type).toBe('dir');
    expect(tree[0]?.children?.[0]?.path).toBe('src/index.ts');
  });

  it('places root files at top level', () => {
    const entries: GithubTreeEntry[] = [
      { path: 'README.md', name: 'README.md', type: 'blob', object: { byteSize: 40 } },
    ];
    const tree = adaptTreeEntries(entries);
    expect(tree[0]?.name).toBe('README.md');
  });
});
