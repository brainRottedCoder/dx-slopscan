import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { ScanCache } from '../cache/sqlite.cache.js';
import { openDatabase } from '../db/client.js';
import { configureScanRegistryForTests, resetScanRegistry } from '../scan/scan-registry.js';
import { buildServer } from '../server.js';
import { resetPrAnalysisCacheForTests } from '../services/pr.service.js';

const { analysePrMock } = vi.hoisted(() => ({
  analysePrMock: vi.fn().mockResolvedValue({
    prNumber: 12,
    score: {
      total: 55,
      grade: 'D',
      signals: [
        { signal: 'hedging_density', value: 0.6, weight: 0.15, explanation: 'test' },
      ],
      computedAt: new Date().toISOString(),
    },
    analyzedAt: new Date().toISOString(),
  }),
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  requireAuth: async () => undefined,
  getSessionToken: () => 'test-token',
}));

vi.mock('../services/pr.service.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...(actual as Record<string, unknown>), analysePr: analysePrMock };
});

describe('pr routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    resetPrAnalysisCacheForTests();
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    cache.storeScan({
      scanId: 'scan-tier2',
      repoFullName: 'octo/hello',
      headSha: 'abc',
      result: {
        scanId: 'scan-tier2',
        repoFullName: 'octo/hello',
        tree: [],
        heatmap: [],
        prs: [],
        commitResult: null,
        docScan: null,
        healthScore: { total: 50, grade: 'D', signals: [], computedAt: '' },
        contributors: [],
        completedAt: new Date().toISOString(),
      },
    });
    configureScanRegistryForTests({ cache });
    app = await buildServer();
  });

  afterAll(async () => {
    resetScanRegistry();
    await app.close();
  });

  it('POST analyse/pr returns score payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan/scan-tier2/analyse/pr/12',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { score: { signals: unknown[] } };
    expect(body.score.signals.length).toBeGreaterThan(0);
    expect(analysePrMock).toHaveBeenCalled();
  });
});
