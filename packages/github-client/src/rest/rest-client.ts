import { GITHUB_API_BASE } from '../constants/github.js';
import { githubFetch } from '../http/github-fetch.js';
import { githubPool } from '../throttle/p-limit-pool.js';

const TRUNCATION_MARKER = '@@ ... @@';
const TRUNCATION_SUFFIX = '\\ No newline at end of file\n...';

/** Detect GitHub truncated diff patches (F-605). */
export function isDiffTruncated(patch: string): boolean {
  return patch.includes(TRUNCATION_MARKER) || patch.endsWith(TRUNCATION_SUFFIX);
}

export interface RestClient {
  getPrDiff(owner: string, repo: string, prNumber: number): Promise<string>;
  fetchRawFileContent(owner: string, repo: string, path: string, ref: string): Promise<string>;
  getAuthenticatedUser(): Promise<{ login: string; scopes: string[] }>;
}

/** Fetch full file content when a diff patch was truncated (F-605). */
export async function fetchFullFileFallback(
  client: RestClient,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<string> {
  return githubPool(() => client.fetchRawFileContent(owner, repo, path, ref));
}

export function createRestClient(token: string): RestClient {
  return {
    async getPrDiff(owner: string, repo: string, prNumber: number): Promise<string> {
      const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${String(prNumber)}`;
      const response = await githubFetch(url, {
        token,
        headers: { Accept: 'application/vnd.github.v3.diff' },
      });
      return response.text();
    },

    async fetchRawFileContent(
      owner: string,
      repo: string,
      path: string,
      ref: string,
    ): Promise<string> {
      const encodedPath = path
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
      const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;
      const response = await githubFetch(url, { token });
      const payload = (await response.json()) as { content?: string; encoding?: string };

      if (!payload.content || payload.encoding !== 'base64') {
        return '';
      }

      return Buffer.from(payload.content, 'base64').toString('utf8');
    },

    async getAuthenticatedUser(): Promise<{ login: string; scopes: string[] }> {
      const response = await githubFetch(`${GITHUB_API_BASE}/user`, { token });
      const user = (await response.json()) as { login: string };
      const scopeHeader = response.headers.get('x-oauth-scopes') ?? '';
      const scopes = scopeHeader
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      return { login: user.login, scopes };
    },
  };
}
