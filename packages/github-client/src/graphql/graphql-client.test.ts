import { afterEach, describe, expect, it, vi } from 'vitest';

import { GitHubApiError } from '../errors/github-api.error.js';
import * as githubFetchModule from '../http/github-fetch.js';

import { createGraphqlClient } from './graphql-client.js';

describe('createGraphqlClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws GitHubApiError when GraphQL returns errors', async () => {
    vi.spyOn(githubFetchModule, 'githubFetch').mockResolvedValue({
      json: async () => ({
        errors: [{ message: 'Field error' }],
      }),
    } as Response);

    const client = createGraphqlClient('token');

    await expect(client.query('{ test }', {})).rejects.toBeInstanceOf(GitHubApiError);
  });
});
