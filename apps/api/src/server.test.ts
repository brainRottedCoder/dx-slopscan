import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { HEALTH_ROUTE } from './constants/server.js';
import { buildServer } from './server.js';

describe('buildServer', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 from health endpoint', async () => {
    const response = await app.inject({ method: 'GET', url: HEALTH_ROUTE });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });
});
