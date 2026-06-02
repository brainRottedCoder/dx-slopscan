import type { RepoRef, Tier1ScanResult } from '@slop-scanner/shared-types';

import type { ScanCache } from '../cache/sqlite.cache.js';
import { ScanNotFoundError } from '../errors/domain-errors.js';

export interface ScanContext {
  readonly scanId: string;
  readonly repoRef: RepoRef;
  readonly repoFullName: string;
  readonly headSha: string;
  readonly result: Tier1ScanResult;
}

/** Load scan metadata and cached Tier 1 result for analysis routes. */
export function loadScanContext(cache: ScanCache, scanId: string): ScanContext {
  const stored = cache.getScanById(scanId);
  if (!stored) {
    throw new ScanNotFoundError(`Scan ${scanId} not found`);
  }

  const [owner, repo] = stored.repoFullName.split('/');
  if (!owner || !repo) {
    throw new ScanNotFoundError(`Invalid repo name on scan ${scanId}`);
  }

  return {
    scanId,
    repoRef: { owner, repo },
    repoFullName: stored.repoFullName,
    headSha: stored.headSha,
    result: stored.result,
  };
}
