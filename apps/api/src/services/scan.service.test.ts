import type { GitHubClient } from '@slop-scanner/github-client';
import type {
  CommitMessage,
  ContributorSummary,
  FileTreeNode,
  PullRequest,
  RepoRef,
} from '@slop-scanner/shared-types';
import { describe, expect, it, vi } from 'vitest';

import { ScanCache } from '../cache/sqlite.cache.js';
import { openDatabase } from '../db/client.js';
import { SseManager } from '../sse/sse-manager.js';

import { runTier1Scan } from './scan.service.js';

const REPO: RepoRef = { owner: 'octo', repo: 'hello' };

function createMockClient(overrides: Partial<GitHubClient> = {}): GitHubClient {
  return {
    parseRepoUrl: vi.fn(),
    rest: {} as GitHubClient['rest'],
    getRecentPrs: vi.fn().mockResolvedValue([]),
    getRecentCommits: vi.fn().mockResolvedValue([]),
    getFileTree: vi.fn().mockResolvedValue({ tree: [], headSha: 'abc123' }),
    getTopLevelDocs: vi.fn().mockRejectedValue(new Error('docs 404')),
    getContributors: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('runTier1Scan', () => {
  it('emits tree and complete events', async () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    const sse = new SseManager();
    const events: string[] = [];
    const originalEmit = sse.emit.bind(sse);
    vi.spyOn(sse, 'emit').mockImplementation((scanId, event) => {
      events.push(event.type);
      originalEmit(scanId, event);
    });

    const client = createMockClient({
      getRecentCommits: vi.fn().mockResolvedValue([
        {
          sha: '1',
          message: 'fix bug',
          author: 'dev',
          committedAt: '2026-01-01T00:00:00.000Z',
        } satisfies CommitMessage,
      ]),
    });

    const result = await runTier1Scan({
      scanId: 'scan-1',
      repoRef: REPO,
      repoFullName: 'octo/hello',
      token: 'token',
      sse,
      cache,
      clientFactory: () => client,
    });

    expect(events).toContain('scan:tree_done');
    expect(events[events.length - 1]).toBe('scan:complete');
    expect(result.healthScore.total).toBeGreaterThanOrEqual(0);
    db.close();
  });

  it('continues when docs step fails', async () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    const sse = new SseManager();
    const client = createMockClient({
      getTopLevelDocs: vi.fn().mockRejectedValue(new Error('not found')),
      getRecentPrs: vi.fn().mockResolvedValue([
        {
          number: 1,
          title: 'PR',
          body: '',
          state: 'OPEN',
          author: 'dev',
          avatarUrl: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          additions: 1,
          deletions: 0,
          changedFiles: 1,
        } satisfies PullRequest,
      ]),
    });

    const result = await runTier1Scan({
      scanId: 'scan-2',
      repoRef: REPO,
      repoFullName: 'octo/hello',
      token: 'token',
      sse,
      cache,
      clientFactory: () => client,
    });

    expect(result.docScan).toBeNull();
    expect(result.prs).toHaveLength(1);
    expect(client.getRecentPrs).toHaveBeenCalled();
    db.close();
  });

  it('serves cached scan without calling GitHub after tree', async () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    const sse = new SseManager();
    const headSha = 'cached-sha';
    const tree: FileTreeNode[] = [{ path: 'README.md', name: 'README.md', type: 'file' }];

    cache.storeScan({
      scanId: 'cached-scan',
      repoFullName: 'octo/hello',
      headSha,
      result: {
        scanId: 'cached-scan',
        repoFullName: 'octo/hello',
        tree,
        heatmap: [],
        prs: [],
        commitResult: null,
        docScan: null,
        healthScore: {
          total: 80,
          grade: 'B',
          signals: [],
          computedAt: new Date().toISOString(),
        },
        contributors: [] as ContributorSummary[],
        completedAt: new Date().toISOString(),
      },
    });

    const client = createMockClient({
      getFileTree: vi.fn().mockResolvedValue({ tree, headSha }),
      getRecentPrs: vi.fn(),
    });

    await runTier1Scan({
      scanId: 'scan-3',
      repoRef: REPO,
      repoFullName: 'octo/hello',
      token: 'token',
      sse,
      cache,
      clientFactory: () => client,
    });

    expect(client.getRecentPrs).not.toHaveBeenCalled();
    db.close();
  });
});
