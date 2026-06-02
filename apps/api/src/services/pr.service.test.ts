import type { GitHubClient } from '@slop-scanner/github-client';
import type { PullRequest } from '@slop-scanner/shared-types';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  analysePr,
  getCachedPrAnalysis,
  resetPrAnalysisCacheForTests,
  seedPrAnalysisCache,
} from './pr.service.js';

const PR: PullRequest = {
  number: 7,
  title: 'Test',
  body: 'This change typically improves behavior and fixes #42.',
  state: 'OPEN',
  author: 'dev',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
  additions: 10,
  deletions: 2,
  changedFiles: 1,
};

function createMockClient(): GitHubClient {
  return {
    parseRepoUrl: vi.fn(),
    rest: {
      getPrDiff: vi.fn().mockResolvedValue('+class UserService {}\n-function Old() {}'),
      fetchRawFileContent: vi.fn(),
      getAuthenticatedUser: vi.fn(),
    },
    getRecentPrs: vi.fn(),
    getRecentCommits: vi.fn(),
    getFileTree: vi.fn(),
    getTopLevelDocs: vi.fn(),
    getContributors: vi.fn(),
    getPullRequest: vi.fn().mockResolvedValue(PR),
  };
}

describe('analysePr', () => {
  beforeEach(() => {
    resetPrAnalysisCacheForTests();
    process.env.DETECTION_EMBEDDING_MODE = 'hash';
  });

  it('returns score and signals', async () => {
    const client = createMockClient();
    const result = await analysePr(7, { owner: 'octo', repo: 'hello' }, 'token', () => client);
    expect(result.prNumber).toBe(7);
    expect(result.score.signals.length).toBeGreaterThan(0);
  });

  it('serves cached result without second GitHub fetch', async () => {
    const client = createMockClient();
    const factory = () => client;

    await analysePr(7, { owner: 'octo', repo: 'hello' }, 'token', factory);
    await analysePr(7, { owner: 'octo', repo: 'hello' }, 'token', factory);

    expect(client.getPullRequest).toHaveBeenCalledTimes(1);
    expect(client.rest.getPrDiff).toHaveBeenCalledTimes(1);
  });

  it('cache misses when updatedAt changes', async () => {
    const client = createMockClient();
    seedPrAnalysisCache(PR, {
      prNumber: 7,
      score: {
        total: 99,
        grade: 'A',
        signals: [],
        computedAt: new Date().toISOString(),
      },
      analyzedAt: new Date().toISOString(),
    });

    const updatedPr = { ...PR, updatedAt: '2026-01-02T00:00:00.000Z' };
    vi.mocked(client.getPullRequest).mockResolvedValue(updatedPr);

    const cachedOld = getCachedPrAnalysis(7, PR.updatedAt);
    expect(cachedOld?.score.total).toBe(99);

    await analysePr(7, { owner: 'octo', repo: 'hello' }, 'token', () => client);
    expect(client.getPullRequest).toHaveBeenCalled();
  });

  it('handles empty description without throwing', async () => {
    const client = createMockClient();
    vi.mocked(client.getPullRequest).mockResolvedValue({ ...PR, body: '' });
    const result = await analysePr(7, { owner: 'octo', repo: 'hello' }, 'token', () => client);
    expect(result.score.total).toBeGreaterThanOrEqual(0);
  });
});
