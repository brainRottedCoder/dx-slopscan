import type { SseEvent } from '@slop-scanner/shared-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useScanStore } from './scan.store.js';

vi.mock('../services/scan-api.js', () => ({
  startScan: vi.fn().mockResolvedValue({ scanId: 'scan-123' }),
}));

describe('useScanStore', () => {
  beforeEach(() => {
    useScanStore.getState().reset();
  });

  it('sets error status on scan:error SSE event', () => {
    const event: SseEvent = {
      type: 'scan:error',
      scanId: 'scan-123',
      payload: null,
      timestamp: new Date().toISOString(),
    };

    useScanStore.getState().dispatchSseEvent(event);
    expect(useScanStore.getState().status).toBe('error');
  });

  it('stores complete result from scan:complete', () => {
    const result = {
      scanId: 'scan-123',
      repoFullName: 'octo/hello',
      tree: [],
      heatmap: [],
      prs: [],
      commitResult: null,
      docScan: null,
      healthScore: { total: 80, grade: 'B' as const, signals: [], computedAt: '' },
      contributors: [],
      completedAt: new Date().toISOString(),
    };

    useScanStore.getState().dispatchSseEvent({
      type: 'scan:complete',
      scanId: 'scan-123',
      payload: result,
      timestamp: new Date().toISOString(),
    });

    expect(useScanStore.getState().status).toBe('complete');
    expect(useScanStore.getState().result?.healthScore.total).toBe(80);
  });
});
