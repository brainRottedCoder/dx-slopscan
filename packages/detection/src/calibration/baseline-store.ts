import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { baselineScoresSchema, type BaselineScoresFile } from './baseline-schema.js';

const FALLBACK_DISTRIBUTION: readonly number[] = [
  42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 52, 58, 64,
];

let cachedDistribution: readonly number[] | null = null;
let cachedFile: BaselineScoresFile | null = null;

function resolveBaselinePath(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  return join(moduleDir, '../../../../data/baseline/baseline-scores.json');
}

/** Load and validate baseline JSON from the monorepo data directory. */
export function loadBaselineFile(): BaselineScoresFile {
  if (cachedFile) return cachedFile;

  const raw = readFileSync(resolveBaselinePath(), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  cachedFile = baselineScoresSchema.parse(parsed);
  return cachedFile;
}

/** Health score distribution used for percentile calibration. */
export function getBaselineDistribution(): readonly number[] {
  if (cachedDistribution) return cachedDistribution;

  try {
    const file = loadBaselineFile();
    cachedDistribution = file.healthScoreDistribution;
    return cachedDistribution;
  } catch {
    cachedDistribution = FALLBACK_DISTRIBUTION;
    return cachedDistribution;
  }
}

/** Reset in-memory cache (tests). */
export function resetBaselineCacheForTests(): void {
  cachedDistribution = null;
  cachedFile = null;
}
