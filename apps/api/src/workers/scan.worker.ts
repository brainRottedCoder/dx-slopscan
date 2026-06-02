import type { RepoRef } from '@slop-scanner/shared-types';

import type { ScanCache } from '../cache/sqlite.cache.js';
import { runTier1Scan, type RunTier1ScanInput } from '../services/scan.service.js';
import type { SseManager } from '../sse/sse-manager.js';

export interface Tier1ScanJob {
  readonly scanId: string;
  readonly repoRef: RepoRef;
  readonly repoFullName: string;
  readonly token: string;
}

export interface Tier1ScanWorkerDeps {
  readonly sse: SseManager;
  readonly cache: ScanCache;
  readonly clientFactory?: RunTier1ScanInput['clientFactory'];
}

/** Enqueue Tier 1 scan work (in-process background job; no external queue in MVP). */
export function enqueueTier1Scan(job: Tier1ScanJob, deps: Tier1ScanWorkerDeps): void {
  const { scanId, repoRef, repoFullName, token } = job;
  const { sse, cache, clientFactory } = deps;

  void runTier1Scan({
    scanId,
    repoRef,
    repoFullName,
    token,
    sse,
    cache,
    ...(clientFactory ? { clientFactory } : {}),
  }).catch(() => {
    cache.markError(scanId);
    sse.emit(scanId, {
      type: 'scan:error',
      scanId,
      payload: { message: 'Scan failed' },
      timestamp: new Date().toISOString(),
    });
    sse.close(scanId);
  });
}
