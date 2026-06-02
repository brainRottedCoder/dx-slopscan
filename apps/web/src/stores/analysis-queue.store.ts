import type { AnalysisBadgeState } from '@slop-scanner/shared-types';
import { create } from 'zustand';

import { TIER2_MAX_CONCURRENT } from '../constants/tier2-limits.js';
import type { PrAnalysisResponse } from '../services/analysis-api.js';
import { fetchPrAnalysis } from '../services/analysis-api.js';

export type JobStatus = 'waiting' | 'active' | 'complete' | 'error';

export interface PrAnalysisJob {
  readonly prNumber: number;
  readonly status: JobStatus;
  readonly result?: PrAnalysisResponse;
}

interface AnalysisQueueStore {
  readonly scanId: string | null;
  readonly jobs: Readonly<Record<number, PrAnalysisJob>>;
  readonly activeCount: number;
  readonly expandedPr: number | null;
  setScanId: (scanId: string | null) => void;
  analysePr: (prNumber: number) => void;
  setExpandedPr: (prNumber: number | null) => void;
  getBadgeState: (prNumber: number) => AnalysisBadgeState;
  clear: () => void;
}

function startNextJobs(
  get: () => AnalysisQueueStore,
  set: (partial: Partial<AnalysisQueueStore>) => void,
): void {
  const state = get();
  if (!state.scanId) return;

  let active = state.activeCount;
  const jobs = { ...state.jobs };
  const waiting = Object.values(jobs).filter((job) => job.status === 'waiting');

  for (const job of waiting) {
    if (active >= TIER2_MAX_CONCURRENT) break;
    if (!state.scanId) break;

    jobs[job.prNumber] = { ...job, status: 'active' };
    active += 1;

    void fetchPrAnalysis(state.scanId, job.prNumber)
      .then((result) => {
        const current = get();
        set({
          jobs: {
            ...current.jobs,
            [job.prNumber]: { prNumber: job.prNumber, status: 'complete', result },
          },
          activeCount: Math.max(0, get().activeCount - 1),
        });
        startNextJobs(get, set);
      })
      .catch(() => {
        const current = get();
        set({
          jobs: {
            ...current.jobs,
            [job.prNumber]: { prNumber: job.prNumber, status: 'error' },
          },
          activeCount: Math.max(0, get().activeCount - 1),
        });
        startNextJobs(get, set);
      });
  }

  if (active !== state.activeCount || waiting.length > 0) {
    set({ jobs, activeCount: active });
  }
}

export const useAnalysisQueueStore = create<AnalysisQueueStore>((set, get) => ({
  scanId: null,
  jobs: {},
  activeCount: 0,
  expandedPr: null,

  setScanId: (scanId) => set({ scanId }),

  analysePr: (prNumber) => {
    const state = get();
    if (state.jobs[prNumber]) {
      set({ expandedPr: prNumber });
      return;
    }

    const canStart =
      state.scanId != null && state.activeCount < TIER2_MAX_CONCURRENT;
    const status: JobStatus = canStart ? 'active' : 'waiting';
    const jobs = {
      ...state.jobs,
      [prNumber]: { prNumber, status },
    };

    set({
      jobs,
      activeCount: status === 'active' ? state.activeCount + 1 : state.activeCount,
      expandedPr: prNumber,
    });

    if (status === 'active' && state.scanId) {
      void fetchPrAnalysis(state.scanId, prNumber)
        .then((result) => {
          const current = get();
          set({
            jobs: {
              ...current.jobs,
              [prNumber]: { prNumber, status: 'complete', result },
            },
            activeCount: Math.max(0, get().activeCount - 1),
          });
          startNextJobs(get, set);
        })
        .catch(() => {
          const current = get();
          set({
            jobs: {
              ...current.jobs,
              [prNumber]: { prNumber, status: 'error' },
            },
            activeCount: Math.max(0, get().activeCount - 1),
          });
          startNextJobs(get, set);
        });
    } else {
      startNextJobs(get, set);
    }
  },

  setExpandedPr: (prNumber) => set({ expandedPr: prNumber }),

  getBadgeState: (prNumber) => {
    const job = get().jobs[prNumber];
    if (!job) return 'pending';
    if (job.status === 'waiting') return 'pending';
    if (job.status === 'active') return 'analysing';
    if (job.status === 'complete') return 'scored';
    return 'pending';
  },

  clear: () => set({ scanId: null, jobs: {}, activeCount: 0, expandedPr: null }),
}));
