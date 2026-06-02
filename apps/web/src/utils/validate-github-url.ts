const GITHUB_REPO_PATTERN =
  /^https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?(?:\?.*)?$/i;

/** Returns an error message when the URL is not a public GitHub repository link. */
export function validateGithubRepoUrl(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed.length === 0) return 'Repository URL is required';
  if (!GITHUB_REPO_PATTERN.test(trimmed)) {
    return 'Enter a valid GitHub repository URL (https://github.com/owner/repo)';
  }
  return null;
}
