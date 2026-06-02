import type { PullRequestPreview, Tier1ScanResult } from '@slop-scanner/shared-types';

const BASE_HEALTH = {
  total: 72,
  grade: 'C' as const,
  signals: [],
  computedAt: new Date().toISOString(),
  relativeLabel: 'Above average',
  relativePercentile: 65,
};

function makePr(number: number): PullRequestPreview {
  return {
    number,
    title: `Change set ${String(number)}`,
    body: 'Updates implementation details.',
    state: 'OPEN',
    author: 'dev',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    additions: 10,
    deletions: 2,
    changedFiles: 1,
    analysisStatus: 'pending',
  };
}

/** Minimal Tier 1 payload for Playwright API mocks. */
export function createMockScanResult(
  scanId: string,
  overrides: Partial<Tier1ScanResult> = {},
): Tier1ScanResult {
  return {
    scanId,
    repoFullName: 'octo/demo',
    tree: [{ path: 'src/index.ts', name: 'index.ts', type: 'file', size: 120 }],
    heatmap: [{ path: 'src', fileCount: 1, aggregateScore: 70, topSignals: ['verb_ratio'] }],
    prs: [makePr(1), makePr(2), makePr(3), makePr(4), makePr(5)],
    commitResult: null,
    docScan: null,
    healthScore: BASE_HEALTH,
    contributors: [],
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}
