import { describe, expect, it, vi } from 'vitest';

import { fetchCurrentUser } from './auth-api.js';

describe('auth-api', () => {
  it('returns null when session is unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401, ok: false }));
    await expect(fetchCurrentUser()).resolves.toBeNull();
    vi.unstubAllGlobals();
  });

  it('returns user payload when session is valid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ login: 'octocat', scopes: ['repo'] }),
      }),
    );
    await expect(fetchCurrentUser()).resolves.toEqual({
      login: 'octocat',
      scopes: ['repo'],
    });
    vi.unstubAllGlobals();
  });
});
