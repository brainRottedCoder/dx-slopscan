import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadBakeoffDatasetFromFile, runBakeoffEvaluation } from './bakeoff-runner.js';

describe('bakeoff evaluation', () => {
  it('achieves at least 70% precision on labelled set', async () => {
    process.env.DETECTION_EMBEDDING_MODE = 'hash';
    const root = join(dirname(fileURLToPath(import.meta.url)), '../../../../');
    const dataset = loadBakeoffDatasetFromFile(
      join(root, 'data/baseline/labelled-evaluation-set.json'),
    );
    const results = await runBakeoffEvaluation(dataset);
    expect(results.precision).toBeGreaterThanOrEqual(0.7);
  });
});
