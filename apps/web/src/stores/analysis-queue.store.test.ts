import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnalysisQueueStore } from './analysis-queue.store.js';

const { fetchPrAnalysisMock } = vi.hoisted(() => ({
  fetchPrAnalysisMock: vi.fn().mockResolvedValue({
    prNumber: 1,
    score: { total: 70, grade: 'C', signals: [], computedAt: '' },
    signals: [],
    analyzedAt: new Date().toISOString(),
  }),
}));

vi.mock('../services/analysis-api.js', () => ({
  fetchPrAnalysis: fetchPrAnalysisMock,
}));

describe('useAnalysisQueueStore', () => {
  beforeEach(() => {
    fetchPrAnalysisMock.mockClear();
    useAnalysisQueueStore.getState().clear();
    useAnalysisQueueStore.getState().setScanId('scan-1');
  });

  it('limits active jobs to two concurrent', () => {
    const store = useAnalysisQueueStore.getState();
    store.analysePr(1);
    store.analysePr(2);
    store.analysePr(3);

    const jobs = Object.values(useAnalysisQueueStore.getState().jobs);
    const waiting = jobs.filter((job) => job.status === 'waiting');
    expect(waiting.length).toBeGreaterThanOrEqual(1);
    expect(useAnalysisQueueStore.getState().activeCount).toBeLessThanOrEqual(2);
  });

  it('queues five rapid clicks with at most two active', () => {
    const store = useAnalysisQueueStore.getState();
    for (let pr = 1; pr <= 5; pr += 1) {
      store.analysePr(pr);
    }
    expect(useAnalysisQueueStore.getState().activeCount).toBeLessThanOrEqual(2);
    expect(Object.keys(useAnalysisQueueStore.getState().jobs).length).toBe(5);
  });
});
