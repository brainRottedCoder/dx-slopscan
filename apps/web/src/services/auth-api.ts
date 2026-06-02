import { AUTH_ME_PATH } from '../constants/api.js';

export interface AuthUser {
  readonly login: string;
  readonly scopes: string[];
}

/** Returns the current session user or null when not signed in. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(AUTH_ME_PATH, { credentials: 'include' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Failed to load session');
  return (await response.json()) as AuthUser;
}
