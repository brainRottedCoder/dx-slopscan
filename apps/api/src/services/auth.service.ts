import { randomBytes } from 'node:crypto';

import {
  buildAuthorizeUrl,
  buildGitHubClient,
  exchangeCodeForToken,
} from '@slop-scanner/github-client';

import type { AppEnv } from '../config/env.js';
import { OAUTH_STATE_BYTES } from '../constants/auth.js';

import { decryptToken, encryptToken } from './token-crypto.js';

export interface AuthUserResponse {
  readonly login: string;
  readonly scopes: string[];
  readonly capabilities: {
    readonly privateRepos: boolean;
    readonly prAccess: boolean;
    readonly commitAccess: boolean;
  };
}

export function createOAuthState(): string {
  return randomBytes(OAUTH_STATE_BYTES).toString('hex');
}

export function getGithubAuthorizeUrl(env: AppEnv, state: string): string {
  return buildAuthorizeUrl({
    clientId: env.GITHUB_CLIENT_ID,
    redirectUri: env.GITHUB_CALLBACK_URL,
    state,
  });
}

export async function completeOAuthCallback(
  env: AppEnv,
  code: string,
): Promise<{ encryptedToken: string; login: string; scopes: string[] }> {
  const tokenResult = await exchangeCodeForToken(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    code,
  );

  const client = buildGitHubClient(tokenResult.accessToken);
  const user = await client.rest.getAuthenticatedUser();
  const scopes =
    user.scopes.length > 0
      ? user.scopes
      : tokenResult.scope.split(',').map((s) => s.trim());

  return {
    encryptedToken: encryptToken(tokenResult.accessToken, env.SESSION_SECRET),
    login: user.login,
    scopes,
  };
}

export function getDecryptedToken(session: {
  encryptedToken?: string;
}, secret: string): string | null {
  if (!session.encryptedToken) return null;
  return decryptToken(session.encryptedToken, secret);
}

export function buildAuthUserResponse(login: string, scopes: string[]): AuthUserResponse {
  const hasRepoScope = scopes.includes('repo');
  return {
    login,
    scopes,
    capabilities: {
      privateRepos: hasRepoScope,
      prAccess: hasRepoScope,
      commitAccess: hasRepoScope,
    },
  };
}
