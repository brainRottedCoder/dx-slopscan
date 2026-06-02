import { GITHUB_OAUTH_SCOPE } from '@slop-scanner/github-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';


import { buildServer } from '../server.js';

describe('auth routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /auth/me returns 401 when not logged in', async () => {
    const response = await app.inject({ method: 'GET', url: '/auth/me' });
    expect(response.statusCode).toBe(401);
  });

  it('GET /auth/github redirects with scope=repo', async () => {
    const response = await app.inject({ method: 'GET', url: '/auth/github' });
    expect(response.statusCode).toBe(302);
    const location = response.headers.location ?? '';
    expect(location).toContain(`scope=${GITHUB_OAUTH_SCOPE}`);
  });

  it('GET /auth/github/callback rejects mismatched OAuth state', async () => {
    const start = await app.inject({ method: 'GET', url: '/auth/github' });
    const cookie = start.headers['set-cookie'];
    const response = await app.inject({
      method: 'GET',
      url: '/auth/github/callback?code=fake-code&state=wrong-state',
      headers: cookie ? { cookie: String(cookie) } : {},
    });
    expect(response.statusCode).toBe(400);
  });
});
