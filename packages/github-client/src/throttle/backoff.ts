import {
  BASE_BACKOFF_MS,
  DEFAULT_MAX_RETRIES,
  JITTER_MAX_MS,
  MAX_BACKOFF_MS,
} from '../constants/github.js';
import { GitHubApiError } from '../errors/github-api.error.js';

/** Returns true when the error warrants a retry. */
export function isRetryable(err: unknown): boolean {
  if (err instanceof GitHubApiError) {
    if (err.status === 429 || err.status === 503) return true;
    if (err.status === 403) return true;
    return false;
  }
  if (err instanceof TypeError) return true;
  return false;
}

function jitter(): number {
  return Math.random() * JITTER_MAX_MS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Execute fn with exponential backoff and jitter on retryable errors. */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = DEFAULT_MAX_RETRIES,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err) || attempt === maxRetries) throw err;
      const delay = Math.min(BASE_BACKOFF_MS * 2 ** attempt + jitter(), MAX_BACKOFF_MS);
      await sleep(delay);
    }
  }
  throw new Error('unreachable');
}
