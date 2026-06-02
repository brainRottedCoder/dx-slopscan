import { create } from 'zustand';

import { fetchCurrentUser, type AuthUser } from '../services/auth-api.js';

export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';

interface AuthStore {
  readonly user: AuthUser | null;
  readonly status: AuthStatus;
  refreshSession: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: 'unknown',

  refreshSession: async () => {
    try {
      const user = await fetchCurrentUser();
      set({
        user,
        status: user ? 'authenticated' : 'anonymous',
      });
    } catch {
      set({ user: null, status: 'anonymous' });
    }
  },

  clearSession: () => set({ user: null, status: 'anonymous' }),
}));
