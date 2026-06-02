import { describe, expect, it, vi } from 'vitest';

import { enqueueTier1Scan } from './scan.worker.js';

const runTier1ScanMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('../services/scan.service.js', () => ({
  runTier1Scan: runTier1ScanMock,
}));

describe('enqueueTier1Scan', () => {
  it('delegates to runTier1Scan in the background', async () => {
    runTier1ScanMock.mockClear();
    const sse = { emit: vi.fn(), close: vi.fn() };
    const cache = { markError: vi.fn() };

    enqueueTier1Scan(
      {
        scanId: 'scan-1',
        repoRef: { owner: 'octo', repo: 'demo' },
        repoFullName: 'octo/demo',
        token: 'token',
      },
      { sse: sse as never, cache: cache as never },
    );

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(runTier1ScanMock).toHaveBeenCalledWith(
      expect.objectContaining({ scanId: 'scan-1', repoFullName: 'octo/demo' }),
    );
  });
});
