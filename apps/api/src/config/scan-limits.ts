/** Single source of truth for scan depth limits (F-604). */
export const SCAN_LIMITS = {
  MAX_COMMITS: 100,
  MAX_PRS: 50,
  MAX_PRS_PREVIEW: 20,
  MAX_TREE_DEPTH: 3,
  MAX_FILES: 500,
  MAX_LOOKBACK_DAYS: 90,
  MAX_DOC_FILES: 20,
  TIER2_MAX_CONCURRENT: 2,
} as const;

export type ScanLimits = typeof SCAN_LIMITS;
