import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  readonly close = vi.fn();
}

vi.stubGlobal('EventSource', MockEventSource);

vi.mock('./services/scan-api.js', () => ({
  startScan: vi.fn().mockResolvedValue({ scanId: 'scan-1' }),
}));

vi.mock('./hooks/use-auth-session.js', () => ({
  useAuthSession: vi.fn(),
}));

import { App } from './app.js';
import { useScanStore } from './stores/scan.store.js';

describe('App', () => {
  beforeEach(() => {
    useScanStore.getState().reset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders landing page when idle', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /Slop Scanner/i })).toBeDefined();
    expect(screen.getByLabelText(/Repository URL/i)).toBeDefined();
  });

  it('shows results view while scanning', () => {
    useScanStore.setState({ status: 'scanning', scanId: 'scan-1' });
    render(<App />);
    expect(screen.getAllByText(/Scan in progress/i).length).toBeGreaterThan(0);
  });
});
