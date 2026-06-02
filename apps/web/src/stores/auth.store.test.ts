import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from './auth.store.js';

const { fetchCurrentUserMock } = vi.hoisted(() => ({
  fetchCurrentUserMock: vi.fn(),
}));

vi.mock('../services/auth-api.js', () => ({
  fetchCurrentUser: fetchCurrentUserMock,
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    fetchCurrentUserMock.mockReset();
    useAuthStore.setState({ user: null, status: 'unknown' });
  });

  it('refreshSession sets authenticated user', async () => {
    fetchCurrentUserMock.mockResolvedValue({ login: 'octocat', scopes: ['repo'] });
    await useAuthStore.getState().refreshSession();
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.login).toBe('octocat');
  });

  it('refreshSession sets anonymous when not signed in', async () => {
    fetchCurrentUserMock.mockResolvedValue(null);
    await useAuthStore.getState().refreshSession();
    expect(useAuthStore.getState().status).toBe('anonymous');
  });
});
