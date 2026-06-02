import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { ScanCache } from '../cache/sqlite.cache.js';
import { openDatabase } from '../db/client.js';
import { configureScanRegistryForTests, resetScanRegistry } from '../scan/scan-registry.js';
import { buildServer } from '../server.js';

const analyseContributorMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    login: 'dev',
    deviation: {
      lengthDeviation: 0,
      vocabularyDrift: 0,
      isSignificant: false,
      explanation: 'ok',
    },
    timeline: [],
  }),
);

vi.mock('../middleware/auth.middleware.js', () => ({
  requireAuth: async () => undefined,
  getSessionToken: () => 'test-token',
}));

vi.mock('../services/contributor.service.js', () => ({
  analyseContributor: analyseContributorMock,
}));

describe('contributor routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    cache.storeScan({
      scanId: 'scan-contrib',
      repoFullName: 'octo/hello',
      headSha: 'abc',
      result: {
        scanId: 'scan-contrib',
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

  afterAll(() => {
    resetScanRegistry();
  });

  it('POST contributor analysis returns profile JSON', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan/scan-contrib/analyse/contributor/dev',
    });
    expect(response.statusCode).toBe(200);
    expect(analyseContributorMock).toHaveBeenCalled();
  });
});
