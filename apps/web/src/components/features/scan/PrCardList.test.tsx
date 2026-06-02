import type { PullRequestPreview } from '@slop-scanner/shared-types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnalysisQueueStore } from '../../../stores/analysis-queue.store.js';

import { PrCardList } from './PrCardList.js';

vi.mock('../../../services/analysis-api.js', () => ({
  fetchPrAnalysis: vi.fn().mockResolvedValue({
    prNumber: 42,
    score: { total: 60, grade: 'D', signals: [], computedAt: '' },
    signals: [
      { signal: 'hedging_density', value: 0.5, weight: 0.15, explanation: 'test' },
    ],
    analyzedAt: new Date().toISOString(),
  }),
}));

const SAMPLE_PR: PullRequestPreview = {
  number: 42,
  title: 'Improve auth',
  body: 'Short body',
  state: 'OPEN',
  author: 'dev',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  additions: 12,
  deletions: 3,
  changedFiles: 2,
  analysisStatus: 'pending',
};

describe('PrCardList', () => {
  beforeEach(() => {
    useAnalysisQueueStore.getState().clear();
    useAnalysisQueueStore.getState().setScanId('scan-test');
  });

  it('dispatches analysePr when card is clicked', async () => {
    const user = userEvent.setup();
    render(<PrCardList prs={[SAMPLE_PR]} />);

    await user.click(screen.getByRole('button', { name: /#42 Improve auth/i }));
    expect(useAnalysisQueueStore.getState().jobs[42]).toBeDefined();
  });
});
