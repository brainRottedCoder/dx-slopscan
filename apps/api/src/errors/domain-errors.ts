import type { SupportedAnalysis } from '@slop-scanner/detection';

/** Base class for typed domain errors with user-facing copy. */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly userMessage: string;

  constructor(message: string, userMessage: string) {
    super(message);
    this.name = this.constructor.name;
    this.userMessage = userMessage;
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor() {
    super('Unauthorized', 'Sign in with GitHub to run a scan.');
  }
}

export class ScanNotFoundError extends DomainError {
  readonly code = 'SCAN_NOT_FOUND';

  constructor(scanId: string) {
    super(`Scan ${scanId} not found`, 'That scan could not be found. Start a new scan from the home page.');
  }
}

export class InvalidRepoUrlError extends DomainError {
  readonly code = 'INVALID_REPO_URL';

  constructor(url: string) {
    super(`"${url}" is not a valid GitHub repository URL`, 'Enter a public GitHub repository URL in the form https://github.com/owner/repo.');
  }
}

/** @deprecated Use InvalidRepoUrlError */
export class InvalidRepoError extends InvalidRepoUrlError {}

export class PrivateRepoError extends DomainError {
  readonly code = 'PRIVATE_REPO';

  constructor() {
    super(
      'Repository is private or inaccessible',
      'This repository is private. Ensure you have authorized access via GitHub OAuth.',
    );
  }
}

export class RateLimitError extends DomainError {
  readonly code = 'RATE_LIMIT';
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super(
      `GitHub rate limit exceeded. Retry after ${String(retryAfter)}s.`,
      `GitHub rate limit reached. Try again in ${String(retryAfter)} seconds.`,
    );
    this.retryAfter = retryAfter;
  }
}

export class ScanInProgressError extends DomainError {
  readonly code = 'SCAN_IN_PROGRESS';

  constructor() {
    super('Scan already in progress', 'A scan is already running for this repository. Wait for it to finish.');
  }
}

/** Informational notice when rule-based signals are degraded for non-English repos. */
export class NonEnglishRepoNotice extends DomainError {
  readonly code = 'NON_ENGLISH';
  readonly language: string;
  readonly capability: SupportedAnalysis;

  constructor(language: string) {
    const capability: SupportedAnalysis = 'embeddings_only';
    super(
      `Detected non-English content (${language})`,
      `Detected non-English content (${language}). Rule-based signals disabled; embedding-only scoring active.`,
    );
    this.language = language;
    this.capability = capability;
  }
}

export interface DomainErrorResponse {
  readonly code: string;
  readonly error: string;
  readonly userMessage: string;
  readonly retryAfter?: number;
}

/** Serialize a domain error for API responses. */
export function toDomainErrorResponse(error: DomainError): DomainErrorResponse {
  const payload: DomainErrorResponse = {
    code: error.code,
    error: error.message,
    userMessage: error.userMessage,
  };

  if (error instanceof RateLimitError) {
    return { ...payload, retryAfter: error.retryAfter };
  }

  return payload;
}
