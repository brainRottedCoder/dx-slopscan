import { describe, expect, it } from 'vitest';

import { computeBurstiness } from './burstiness.js';

describe('computeBurstiness', () => {
  it('returns low Fano factor for uniform timestamps', () => {
    const timestamps = [
      '2026-01-01T00:00:00.000Z',
      '2026-01-02T00:00:00.000Z',
      '2026-01-03T00:00:00.000Z',
      '2026-01-04T00:00:00.000Z',
    ];
    expect(computeBurstiness(timestamps)).toBeLessThan(0.1);
  });

  it('returns high Fano factor for burst + silence pattern', () => {
    const timestamps = [
      '2026-01-01T00:00:00.000Z',
      '2026-01-01T00:01:00.000Z',
      '2026-01-01T00:02:00.000Z',
      '2026-01-10T00:00:00.000Z',
    ];
    expect(computeBurstiness(timestamps)).toBeGreaterThan(1);
  });

  it('returns 0 with fewer than 3 timestamps', () => {
    expect(computeBurstiness(['2026-01-01T00:00:00.000Z'])).toBe(0);
  });
});
