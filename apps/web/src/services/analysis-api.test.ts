import { describe, expect, it, vi } from 'vitest';

import { fetchPrAnalysis } from './analysis-api.js';

describe('analysis-api', () => {
  it('fetchPrAnalysis posts to tier-2 PR endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        prNumber: 7,
        score: { total: 65, grade: 'D', signals: [], computedAt: '' },
        signals: [],
        analyzedAt: '2026-01-01T00:00:00.000Z',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPrAnalysis('scan-1', 7);
    expect(result.prNumber).toBe(7);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/scan/scan-1/analyse/pr/7',
      expect.objectContaining({ method: 'POST' }),
    );

    vi.unstubAllGlobals();
  });
});
