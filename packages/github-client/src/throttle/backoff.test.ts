import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GitHubApiError } from '../errors/github-api.error.js';

import { withBackoff } from './backoff.js';

describe('withBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries on 429 exactly maxRetries times before success', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new GitHubApiError('rate limited', 429))
      .mockRejectedValueOnce(new GitHubApiError('rate limited', 429))
      .mockRejectedValueOnce(new GitHubApiError('rate limited', 429))
      .mockResolvedValue('ok');

    const maxRetries = 3;
    const promise = withBackoff(fn, maxRetries);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(maxRetries + 1);
  });

  it('does not retry 404', async () => {
    const fn = vi.fn().mockRejectedValue(new GitHubApiError('not found', 404));

    await expect(withBackoff(fn, 5)).rejects.toBeInstanceOf(GitHubApiError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
