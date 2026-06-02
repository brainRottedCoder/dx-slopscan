import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GitHubApiError } from '../errors/github-api.error.js';

import { githubFetch } from './github-fetch.js';

describe('githubFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sends correct default headers', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      json: vi.fn(),
    } as unknown as Response;

    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await githubFetch('https://api.github.com/user');

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/user',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }),
      }),
    );
  });

  it('includes Bearer authorization when token provided', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      json: vi.fn(),
    } as unknown as Response;

    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await githubFetch('https://api.github.com/user', { token: 'test-token-123' });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/user',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      }),
    );
  });

  it('merges custom headers with defaults', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      json: vi.fn(),
    } as unknown as Response;

    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await githubFetch('https://api.github.com/graphql', {
      headers: { 'Content-Type': 'application/json' },
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('throws GitHubApiError on non-ok response with message from body', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Map([['x-ratelimit-reset', '1234567890']]),
      json: vi.fn().mockResolvedValue({ message: 'Repository not found' }),
    } as unknown as Response;

    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await expect(githubFetch('https://api.github.com/repos/invalid/repo')).rejects.toBeInstanceOf(
      GitHubApiError,
    );
  });

  it('throws GitHubApiError with status code when JSON body fails to parse', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Map(),
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Response;

    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await expect(githubFetch('https://api.github.com/error')).rejects.toBeInstanceOf(
      GitHubApiError,
    );
  });

  it('returns response on success', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map(),
      json: vi.fn().mockResolvedValue({ login: 'testuser' }),
    } as unknown as Response;

    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const response = await githubFetch('https://api.github.com/user');
    expect(response.ok).toBe(true);
  });
});
