import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logRateLimitHeaders } from './rate-limit-logger.js';

describe('logRateLimitHeaders', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it('logs rate limit headers when present', () => {
    const headers = new Map([
      ['x-ratelimit-remaining', '42'],
      ['x-ratelimit-limit', '100'],
      ['x-ratelimit-reset', '1234567890'],
    ]);

    const response = {
      headers: {
        get: (key: string) => headers.get(key) ?? null,
      },
    } as unknown as Response;

    logRateLimitHeaders(response);

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const output = String(stdoutSpy.mock.calls[0]?.[0]);
    expect(output).toContain('github-rate-limit');
    expect(output).toContain('remaining=42');
    expect(output).toContain('limit=100');
    expect(output).toContain('reset=1234567890');
  });

  it('does not log when no rate limit headers present', () => {
    const response = {
      headers: {
        get: () => null,
      },
    } as unknown as Response;

    logRateLimitHeaders(response);

    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('logs with question marks for partial headers', () => {
    const headers = new Map([
      ['x-ratelimit-remaining', '10'],
    ]);

    const response = {
      headers: {
        get: (key: string) => headers.get(key) ?? null,
      },
    } as unknown as Response;

    logRateLimitHeaders(response);

    const output = String(stdoutSpy.mock.calls[0]?.[0]);
    expect(output).toContain('remaining=10');
    expect(output).toContain('limit=?');
    expect(output).toContain('reset=?');
  });
});
