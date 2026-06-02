import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { ScanCache } from '../cache/sqlite.cache.js';
import { openDatabase } from '../db/client.js';
import { configureScanRegistryForTests, resetScanRegistry } from '../scan/scan-registry.js';
import { buildServer } from '../server.js';

const { analyseDocMock, analyseFolderMock } = vi.hoisted(() => ({
  analyseDocMock: vi.fn().mockResolvedValue({
    filePath: 'README.md',
    sections: [
      {
        heading: 'Intro',
        circularity: 0.1,
        concreteElements: 3,
        hedgingDensity: 0.2,
        symbolValidation: 1,
      },
    ],
    analyzedAt: new Date().toISOString(),
  }),
  analyseFolderMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  requireAuth: async () => undefined,
  getSessionToken: () => 'test-token',
}));

vi.mock('../services/docs.service.js', () => ({
  analyseDocFile: analyseDocMock,
  analyseFolder: analyseFolderMock,
}));

describe('docs routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    cache.storeScan({
      scanId: 'scan-docs',
      repoFullName: 'octo/hello',
      headSha: 'abc',
      result: {
        scanId: 'scan-docs',
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

  it('POST analyse/doc returns sections array', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan/scan-docs/analyse/doc',
      payload: { filePath: 'README.md' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { sections: unknown[] };
    expect(Array.isArray(body.sections)).toBe(true);
    expect(body.sections.length).toBeGreaterThan(0);
    expect(analyseDocMock).toHaveBeenCalled();
  });

  it('POST analyse/folder returns 202 started', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan/scan-docs/analyse/folder',
      payload: { path: 'src' },
    });

    expect(response.statusCode).toBe(202);
    expect(analyseFolderMock).toHaveBeenCalled();
  });
});
