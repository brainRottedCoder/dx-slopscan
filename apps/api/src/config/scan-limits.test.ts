import { describe, expect, it } from 'vitest';

import { SCAN_LIMITS } from './scan-limits.js';

describe('SCAN_LIMITS', () => {
  it('caps commits at 100', () => {
    expect(SCAN_LIMITS.MAX_COMMITS).toBe(100);
  });

  it('defines preview PR limit', () => {
    expect(SCAN_LIMITS.MAX_PRS_PREVIEW).toBe(20);
  });

  it('keeps tier2 concurrency low', () => {
    expect(SCAN_LIMITS.TIER2_MAX_CONCURRENT).toBe(2);
  });
});
