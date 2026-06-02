import type { Tier1ScanResult } from '@slop-scanner/shared-types';
import { describe, expect, it, vi } from 'vitest';

import { analyseContributor } from './contributor.service.js';

const scoreContributorPatternMock = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    lengthDeviation: 1,
    vocabularyDrift: 0.1,
    isSignificant: false,
    explanation: 'Stable pattern.',
  }),
);

const scorePullRequestMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    total: 70,
    grade: 'C',
    signals: [],
    computedAt: '',
  }),
);

vi.mock('@slop-scanner/detection', () => ({
  scoreContributorPattern: scoreContributorPatternMock,
  scorePullRequest: scorePullRequestMock,
  getEmbedding: vi.fn().mockResolvedValue(new Float32Array([1, 0])),
}));

const tier1: Tier1ScanResult = {
  scanId: 'scan-1',
  repoFullName: 'octo/demo',
  tree: [],
  heatmap: [],
  prs: [
    {
      number: 1,
      title: 'A',
      body: 'Because this fixes auth.',
      state: 'OPEN',
      author: 'dev',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      additions: 1,
      deletions: 0,
      changedFiles: 1,
      analysisStatus: 'pending',
    },
    {
      number: 2,
      title: 'B',
      body: 'More detail here.',
      state: 'OPEN',
      author: 'dev',
      avatarUrl: null,
      createdAt: '2026-01-03T00:00:00.000Z',
      updatedAt: '2026-01-04T00:00:00.000Z',
      additions: 2,
      deletions: 1,
      changedFiles: 1,
      analysisStatus: 'pending',
    },
  ],
  commitResult: null,
  docScan: null,
  healthScore: { total: 60, grade: 'D', signals: [], computedAt: '' },
  contributors: [],
  completedAt: new Date().toISOString(),
};

describe('analyseContributor', () => {
  it('builds timeline and delegates deviation to contributor scorer', async () => {
    const client = {
      rest: {
        getPrDiff: vi.fn().mockResolvedValue('diff line'),
      },
    };

    const profile = await analyseContributor(
      'dev',
      tier1,
      { owner: 'octo', repo: 'demo' },
      'token',
      () => client as never,
    );

    expect(profile.login).toBe('dev');
    expect(profile.timeline).toHaveLength(2);
    expect(scoreContributorPatternMock).toHaveBeenCalled();
  });
});
