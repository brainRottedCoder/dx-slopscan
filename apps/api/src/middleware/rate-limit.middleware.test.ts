import { describe, expect, it } from 'vitest';

import { RateLimitError } from '../errors/domain-errors.js';

import {
  rateLimitPreHandler,
  resetRateLimitBucketsForTests,
} from './rate-limit.middleware.js';

describe('rateLimitPreHandler', () => {
  it('allows requests under the limit', async () => {
    resetRateLimitBucketsForTests();
    const request = { url: '/api/scan', ip: '127.0.0.1', session: {} };
    await expect(
      rateLimitPreHandler(request as never, {} as never),
    ).resolves.toBeUndefined();
  });

  it('throws RateLimitError when limit exceeded', async () => {
    resetRateLimitBucketsForTests();
    const request = { url: '/api/scan', ip: '10.0.0.99', session: {} };

    for (let index = 0; index < 121; index += 1) {
      try {
        await rateLimitPreHandler(request as never, {} as never);
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        return;
      }
    }

    expect.fail('Expected rate limit to trigger');
  });

  it('skips health checks', async () => {
    resetRateLimitBucketsForTests();
    const request = { url: '/health', ip: '10.0.0.1', session: {} };
    for (let index = 0; index < 200; index += 1) {
      await rateLimitPreHandler(request as never, {} as never);
    }
  });
});
