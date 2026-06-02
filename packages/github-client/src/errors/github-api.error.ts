/** Typed error for GitHub API failures. */
export class GitHubApiError extends Error {
  readonly code = 'GITHUB_API_ERROR';

  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}
