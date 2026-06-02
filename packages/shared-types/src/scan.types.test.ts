import { describe, expect, it } from 'vitest';

import type { RepoRef, Tier1ScanResult } from './scan.types.js';

describe('RepoRef', () => {
  it('allows optional branch', () => {
    const withBranch: RepoRef = { owner: 'org', repo: 'app', branch: 'main' };
    const withoutBranch: RepoRef = { owner: 'org', repo: 'app' };

    expect(withBranch.branch).toBe('main');
    expect(withoutBranch.branch).toBeUndefined();
  });
});

describe('Tier1ScanResult', () => {
  it('requires health score and scan metadata', () => {
    const result: Tier1ScanResult = {
      scanId: 'id-1',
      repoFullName: 'org/repo',
      tree: [],
      heatmap: [],
      prs: [],
      commitResult: null,
      docScan: null,
      healthScore: {
        total: 80,
        grade: 'B',
        signals: [],
        computedAt: '2026-05-29T00:00:00.000Z',
      },
      contributors: [],
      completedAt: '2026-05-29T00:00:00.000Z',
    };

    expect(result.healthScore.grade).toBe('B');
  });
});
