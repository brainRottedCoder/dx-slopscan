/** Maximum concurrent outbound GitHub API requests (F-602). */
export const MAX_CONCURRENT = 5;

/** Default retry attempts for retryable failures. */
export const DEFAULT_MAX_RETRIES = 5;

/** Base delay for exponential backoff in milliseconds. */
export const BASE_BACKOFF_MS = 1000;

/** Maximum backoff cap in milliseconds. */
export const MAX_BACKOFF_MS = 30_000;

/** Random jitter upper bound in milliseconds. */
export const JITTER_MAX_MS = 500;

/** GitHub REST API base URL. */
export const GITHUB_API_BASE = 'https://api.github.com';

/** GitHub GraphQL API endpoint. */
export const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

/** GitHub OAuth authorize endpoint. */
export const GITHUB_OAUTH_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';

/** GitHub OAuth token exchange endpoint. */
export const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';

/** GitHub API version header value. */
export const GITHUB_API_VERSION = '2022-11-28';

/** OAuth scope for private repo access (F-002). */
export const GITHUB_OAUTH_SCOPE = 'repo';
