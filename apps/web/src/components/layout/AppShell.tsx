import type { ReactNode } from 'react';

import { useAuthStore } from '../../stores/auth.store.js';

import { ThemeToggle } from './ThemeToggle.js';

export interface AppShellProps {
  readonly children: ReactNode;
}

/** Clean app navigation with logo, auth status, and theme toggle. */
export function AppShell({ children }: AppShellProps) {
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const isSignedIn = authStatus === 'authenticated' && user != null;

  return (
    <div className="relative min-h-screen">
      <header
        className="sticky top-0 z-20 border-b px-4 py-3"
        style={{
          background: 'var(--nav-bg)',
          borderColor: 'var(--nav-border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <a href="/" className="flex items-baseline gap-1.5 text-lg font-bold tracking-tight">
            <span className="text-text-primary">Slop</span>
            <span className="hero-gradient">Scanner</span>
          </a>
          <div className="flex items-center gap-3">
            {isSignedIn && (
              <span className="badge badge-info hidden sm:inline-flex">{user.login}</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-4 py-8">{children}</div>
    </div>
  );
}
