import { useEffect } from 'react';

import { useAuthStore } from '../stores/auth.store.js';

/** Load session from /auth/me on mount. */
export function useAuthSession(): void {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === 'unknown') {
      void refreshSession();
    }
  }, [status, refreshSession]);
}
