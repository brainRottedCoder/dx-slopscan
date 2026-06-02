import type { SseEvent, Tier1ScanResult } from '@slop-scanner/shared-types';
import { create } from 'zustand';

import { startScan } from '../services/scan-api.js';

export type ScanUiStatus = 'idle' | 'scanning' | 'complete' | 'error';

interface ScanStore {
  readonly scanId: string | null;
  readonly status: ScanUiStatus;
  readonly result: Tier1ScanResult | null;
  readonly progress: readonly SseEvent[];
  readonly errorMessage: string | null;
  startScan: (repoUrl: string) => Promise<void>;
  dispatchSseEvent: (event: SseEvent) => void;
  restoreFromApi: (result: Tier1ScanResult) => void;
  reset: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  scanId: null,
  status: 'idle',
  result: null,
  progress: [],
  errorMessage: null,

  startScan: async (repoUrl) => {
    set({ status: 'scanning', progress: [], result: null, errorMessage: null });
    try {
      const { scanId } = await startScan(repoUrl);
      set({ scanId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Scan failed';
      set({ status: 'error', errorMessage: message });
    }
  },

  dispatchSseEvent: (event) => {
    set((state) => {
      const progress = [...state.progress, event];
      if (event.type === 'scan:complete') {
        return {
          progress,
          status: 'complete',
          result: event.payload as Tier1ScanResult,
        };
      }
      if (event.type === 'scan:error') {
        return {
          progress,
          status: 'error',
          errorMessage: 'Scan stream failed',
        };
      }
      return { progress, status: state.status === 'idle' ? 'scanning' : state.status };
    });
  },

  restoreFromApi: (result) =>
    set({
      status: 'complete',
      result,
      errorMessage: null,
    }),

  reset: () =>
    set({
      scanId: null,
      status: 'idle',
      result: null,
      progress: [],
      errorMessage: null,
    }),
}));
