import {
  GITHUB_API_VERSION,
  GITHUB_GRAPHQL_URL,
} from '../constants/github.js';
import { GitHubApiError } from '../errors/github-api.error.js';
import { withBackoff } from '../throttle/backoff.js';
import { githubPool } from '../throttle/p-limit-pool.js';

import { logRateLimitHeaders } from './rate-limit-logger.js';


export interface GithubFetchOptions extends Omit<RequestInit, 'headers'> {
  readonly token?: string;
  readonly headers?: Record<string, string>;
}

async function errorFromResponse(response: Response): Promise<GitHubApiError> {
  const retryAfterHeader = response.headers.get('retry-after');
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
  let message = `GitHub API error: ${String(response.status)}`;

  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) message = body.message;
  } catch {
    // ignore JSON parse failures
  }

  return new GitHubApiError(message, response.status, retryAfter);
}

/** Rate-limited, retried fetch for GitHub REST and GraphQL endpoints. */
export async function githubFetch(url: string, options: GithubFetchOptions = {}): Promise<Response> {
  return githubPool(() =>
    withBackoff(async () => {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        ...options.headers,
      };

      if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      logRateLimitHeaders(response);

      if (!response.ok) {
        throw await errorFromResponse(response);
      }

      return response;
    }),
  );
}

export { GITHUB_GRAPHQL_URL };
