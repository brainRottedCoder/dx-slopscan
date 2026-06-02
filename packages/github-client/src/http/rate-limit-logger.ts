/** Log GitHub rate-limit headers from every API response (Phase 2 gate). */
export function logRateLimitHeaders(response: Response): void {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const limit = response.headers.get('x-ratelimit-limit');
  const reset = response.headers.get('x-ratelimit-reset');

  if (remaining !== null || limit !== null) {
    process.stdout.write(
      `[github-rate-limit] remaining=${remaining ?? '?'} limit=${limit ?? '?'} reset=${reset ?? '?'}\n`,
    );
  }
}
