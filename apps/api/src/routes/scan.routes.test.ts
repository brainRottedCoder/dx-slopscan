import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { ScanCache } from '../cache/sqlite.cache.js';
import { openDatabase } from '../db/client.js';
import { configureScanRegistryForTests, resetScanRegistry } from '../scan/scan-registry.js';
import { buildServer } from '../server.js';
import { SseManager } from '../sse/sse-manager.js';

const { runTier1ScanMock } = vi.hoisted(() => ({
  runTier1ScanMock: vi.fn().mockResolvedValue({
    scanId: 'mock',
    repoFullName: 'octo/hello',
    tree: [],
    heatmap: [],
    prs: [],
    commitResult: null,
    docScan: null,
    healthScore: { total: 0, grade: 'F', signals: [], computedAt: new Date().toISOString() },
    contributors: [],
    completedAt: new Date().toISOString(),
  }),
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  requireAuth: async () => undefined,
  getSessionToken: () => 'test-token',
}));

vi.mock('../services/scan.service.js', () => ({
  runTier1Scan: runTier1ScanMock,
}));

describe('scan routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    const db = openDatabase(':memory:');
    configureScanRegistryForTests({
      cache: new ScanCache(db),
      sse: new SseManager(),
    });
    app = await buildServer();
  });

  afterAll(async () => {
    resetScanRegistry();
    await app.close();
  });

  it('POST /api/scan returns 202 with scanId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan',
      payload: { repoUrl: 'https://github.com/octo/hello' },
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({ scanId: expect.any(String) });
    expect(runTier1ScanMock).toHaveBeenCalled();
  });

  it('GET /api/scan/:id returns 404 for unknown scan', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/scan/missing-scan-id',
    });

    expect(response.statusCode).toBe(404);
  });

  it('POST /api/scan rejects invalid repo URL', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan',
      payload: { repoUrl: 'not-a-valid-url' },
    });

    expect(response.statusCode).toBe(400);
  });
});
