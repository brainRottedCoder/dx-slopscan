import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ScanCache } from '../cache/sqlite.cache.js';
import { openDatabase } from '../db/client.js';
import { configureScanRegistryForTests, resetScanRegistry } from '../scan/scan-registry.js';
import { buildServer } from '../server.js';
import { SseManager } from '../sse/sse-manager.js';

describe('scan routes auth', () => {
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

  it('POST /api/scan returns 401 without auth', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/scan',
      payload: { repoUrl: 'https://github.com/octo/hello' },
    });
    expect(response.statusCode).toBe(401);
  });
});
