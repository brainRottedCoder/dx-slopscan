import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useScanStore } from '../stores/scan.store.js';

import { LandingPage } from './LandingPage.js';

vi.mock('../services/scan-api.js', () => ({
  startScan: vi.fn().mockResolvedValue({ scanId: 'scan-1' }),
}));

const authState = vi.hoisted(() => ({
  status: 'anonymous' as 'anonymous' | 'authenticated',
  user: null as { login: string } | null,
}));

vi.mock('../stores/auth.store.js', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

describe('LandingPage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    authState.status = 'anonymous';
    authState.user = null;
    useScanStore.getState().reset();
  });

  it('shows inline validation for non-GitHub URLs', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);

    await user.type(screen.getByLabelText(/Repository URL/i), 'https://example.com/foo/bar');
    await user.click(screen.getByRole('button', { name: /Scan repository/i }));

    expect(screen.getByRole('alert').textContent).toMatch(/valid GitHub/i);
  });

  it('shows sign-in link when anonymous', () => {
    render(<LandingPage />);
    expect(screen.getByRole('link', { name: /Sign in with GitHub/i })).toBeDefined();
  });

  it('shows signed-in banner when authenticated', () => {
    authState.status = 'authenticated';
    authState.user = { login: 'octocat' };
    render(<LandingPage />);
    expect(screen.getByText(/Signed in as/i)).toBeDefined();
    expect(screen.getByText('octocat')).toBeDefined();
    expect(screen.queryByRole('link', { name: /Sign in with GitHub/i })).toBeNull();
  });
});
