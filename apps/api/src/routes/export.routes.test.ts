import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { ScanCache } from '../cache/sqlite.cache.js';
import { openDatabase } from '../db/client.js';
import { configureScanRegistryForTests, resetScanRegistry } from '../scan/scan-registry.js';
import { buildServer } from '../server.js';

vi.mock('../middleware/auth.middleware.js', () => ({
  requireAuth: async () => undefined,
  getSessionToken: () => 'test-token',
}));

describe('export routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    cache.storeScan({
      scanId: '550e8400-e29b-41d4-a716-446655440001',
      repoFullName: 'octo/hello',
      headSha: 'abc',
      result: {
        scanId: '550e8400-e29b-41d4-a716-446655440001',
        repoFullName: 'octo/hello',
        tree: [],
        heatmap: [],
        prs: [],
        commitResult: null,
        docScan: null,
        healthScore: { total: 55, grade: 'D', signals: [], computedAt: '' },
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

  it('GET export returns validated JSON report', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/scan/550e8400-e29b-41d4-a716-446655440001/export',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { meta: { note: string } };
    expect(body.meta.note).toContain('information density');
  });
});
