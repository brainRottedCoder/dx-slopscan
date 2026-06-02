/** Thrown when a repository URL cannot be parsed (F-001). */
export class InvalidRepoUrlError extends Error {
  readonly code = 'INVALID_REPO_URL';

  constructor(url: string) {
    super(`"${url}" is not a valid GitHub repository URL`);
    this.name = 'InvalidRepoUrlError';
  }
}
