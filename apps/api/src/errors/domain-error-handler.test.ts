import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { PrivateRepoError, RateLimitError, toDomainErrorResponse } from './domain-errors.js';

function buildTestApp() {
  const app = Fastify();
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof PrivateRepoError) {
      return reply.code(403).send(toDomainErrorResponse(error));
    }
    if (error instanceof RateLimitError) {
      return reply.code(429).send(toDomainErrorResponse(error));
    }
    throw error;
  });

  app.get('/private', () => {
    throw new PrivateRepoError();
  });

  app.get('/rate-limit', () => {
    throw new RateLimitError(90);
  });

  return app;
}

describe('domain error HTTP mapping', () => {
  it('PrivateRepoError returns 403 with userMessage', async () => {
    const app = buildTestApp();
    const response = await app.inject({ method: 'GET', url: '/private' });
    expect(response.statusCode).toBe(403);
    const body = response.json() as { userMessage: string; code: string };
    expect(body.code).toBe('PRIVATE_REPO');
    expect(body.userMessage.length).toBeGreaterThan(0);
    await app.close();
  });

  it('RateLimitError returns 429 with retryAfter', async () => {
    const app = buildTestApp();
    const response = await app.inject({ method: 'GET', url: '/rate-limit' });
    expect(response.statusCode).toBe(429);
    const body = response.json() as { retryAfter: number };
    expect(body.retryAfter).toBe(90);
    await app.close();
  });
});
