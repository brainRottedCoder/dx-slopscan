import { describe, expect, it } from 'vitest';

import { baselineScoresSchema } from './baseline-schema.js';
import { getBaselineDistribution, loadBaselineFile } from './baseline-store.js';

describe('baseline store', () => {
  it('loads baseline JSON that passes Zod validation', () => {
    const file = loadBaselineFile();
    expect(baselineScoresSchema.safeParse(file).success).toBe(true);
    expect(file.healthScoreDistribution.length).toBeGreaterThanOrEqual(10);
  });

  it('exposes a non-empty distribution', () => {
    const distribution = getBaselineDistribution();
    expect(distribution.length).toBeGreaterThan(0);
  });
});
