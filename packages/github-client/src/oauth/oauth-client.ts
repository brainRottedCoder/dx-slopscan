import {
  GITHUB_OAUTH_AUTHORIZE_URL,
  GITHUB_OAUTH_SCOPE,
  GITHUB_OAUTH_TOKEN_URL,
} from '../constants/github.js';
import { GitHubApiError } from '../errors/github-api.error.js';
import { githubPool } from '../throttle/p-limit-pool.js';

export interface OAuthTokenResult {
  readonly accessToken: string;
  readonly scope: string;
}

export interface BuildAuthorizeUrlParams {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly state: string;
}

/** Build GitHub OAuth authorization redirect URL (F-002). */
export function buildAuthorizeUrl(params: BuildAuthorizeUrlParams): string {
  const search = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    scope: GITHUB_OAUTH_SCOPE,
    state: params.state,
  });
  return `${GITHUB_OAUTH_AUTHORIZE_URL}?${search.toString()}`;
}

/** Exchange OAuth authorization code for an access token. */
export async function exchangeCodeForToken(
  clientId: string,
  clientSecret: string,
  code: string,
): Promise<OAuthTokenResult> {
  return githubPool(async () => {
    const response = await fetch(GITHUB_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      throw new GitHubApiError('OAuth token exchange failed', response.status);
    }

    const payload = (await response.json()) as {
      access_token?: string;
      scope?: string;
      error?: string;
    };

    if (!payload.access_token) {
      throw new GitHubApiError(payload.error ?? 'Missing access token', 400);
    }

    return {
      accessToken: payload.access_token,
      scope: payload.scope ?? GITHUB_OAUTH_SCOPE,
    };
  });
}
