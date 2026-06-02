import { describe, expect, it, vi } from 'vitest';

import { SseManager } from '../sse/sse-manager.js';

import { runDeepScan } from './deep-scan.worker.js';

describe('runDeepScan', () => {
  it('emits at least four distinct Tier 3 SSE event types', async () => {
    const sse = new SseManager();
    const types: string[] = [];
    const originalEmit = sse.emit.bind(sse);
    vi.spyOn(sse, 'emit').mockImplementation((scanId, event) => {
      types.push(event.type);
      originalEmit(scanId, event);
    });

    const cache = {
      storeScan: vi.fn(),
    };

    const tier1 = {
      scanId: 'scan-deep',
      repoFullName: 'octo/hello',
      tree: [],
      heatmap: [],
      prs: [],
      commitResult: null,
      docScan: { entries: [], aggregateScore: null },
      healthScore: { total: 50, grade: 'D' as const, signals: [], computedAt: '' },
      contributors: [],
      completedAt: new Date().toISOString(),
    };

    const client = {
      parseRepoUrl: vi.fn(),
      rest: { getPrDiff: vi.fn(), fetchRawFileContent: vi.fn() },
      getRecentPrs: vi.fn().mockResolvedValue([]),
      getRecentCommits: vi.fn().mockResolvedValue([]),
      getFileTree: vi.fn(),
      getTopLevelDocs: vi.fn(),
      getContributors: vi.fn(),
      getPullRequest: vi.fn(),
    };

    await runDeepScan(
      {
        scanId: 'scan-deep',
        repoRef: { owner: 'octo', repo: 'hello' },
        repoFullName: 'octo/hello',
        token: 'token',
        headSha: 'sha',
        tier1,
      },
      {
        sse,
        cache: cache as never,
        clientFactory: () => client as never,
      },
    );

    const tier3Types = types.filter((type) => type.startsWith('deep_scan:'));
    expect(new Set(tier3Types).size).toBeGreaterThanOrEqual(4);
  });
});
