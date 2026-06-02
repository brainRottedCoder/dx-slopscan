import { describe, expect, it } from 'vitest';

import {
  InvalidRepoUrlError,
  PrivateRepoError,
  RateLimitError,
  toDomainErrorResponse,
} from './domain-errors.js';

describe('domain errors', () => {
  it('PrivateRepoError includes userMessage', () => {
    const error = new PrivateRepoError();
    const body = toDomainErrorResponse(error);
    expect(body.userMessage).toContain('private');
    expect(body.code).toBe('PRIVATE_REPO');
  });

  it('RateLimitError includes retryAfter', () => {
    const error = new RateLimitError(120);
    const body = toDomainErrorResponse(error);
    expect(body.retryAfter).toBe(120);
    expect(body.userMessage).toContain('120');
  });

  it('InvalidRepoUrlError has actionable userMessage', () => {
    const error = new InvalidRepoUrlError('not-a-url');
    expect(error.userMessage).toContain('github.com');
  });
});
