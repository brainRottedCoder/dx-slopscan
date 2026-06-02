import { describe, expect, it } from 'vitest';

import { GITHUB_OAUTH_SCOPE } from '../constants/github.js';

import { buildAuthorizeUrl } from './oauth-client.js';

describe('buildAuthorizeUrl', () => {
  it('includes repo scope in redirect URL', () => {
    const url = buildAuthorizeUrl({
      clientId: 'cid',
      redirectUri: 'http://localhost:3001/auth/github/callback',
      state: 'random-state',
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('scope')).toBe(GITHUB_OAUTH_SCOPE);
    expect(parsed.searchParams.get('client_id')).toBe('cid');
  });
});
