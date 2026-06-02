import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { baselineScoresSchema } from '../packages/detection/src/calibration/baseline-schema.js';

const OSS_REPOS = [
  'facebook/react',
  'pallets/flask',
  'django/django',
  'vercel/next.js',
  'tiangolo/fastapi',
  'microsoft/vscode',
  'denoland/deno',
  'rust-lang/rust',
  'nodejs/node',
  'torvalds/linux',
] as const;

/** Representative health scores when live GitHub seeding is unavailable. */
const SYNTHETIC_SCORES: readonly number[] = [
  38, 41, 44, 47, 50, 52, 54, 56, 58, 60, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
  72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 45,
  48, 51, 55, 59, 61, 64, 67, 70, 73, 76,
];

function main(): void {
  const repos = OSS_REPOS.map((fullName, index) => ({
    fullName,
    healthScore: SYNTHETIC_SCORES[index * 5] ?? 65,
  }));

  const payload = baselineScoresSchema.parse({
    version: 1,
    generatedAt: new Date().toISOString(),
    repos,
    healthScoreDistribution: [...SYNTHETIC_SCORES],
  });

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const outputDir = join(root, 'data', 'baseline');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'baseline-scores.json');
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote baseline to ${outputPath}`);
}

main();
