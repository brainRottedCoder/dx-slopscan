import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

async function run(): Promise<void> {
  process.env.DETECTION_EMBEDDING_MODE = 'hash';

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const runnerUrl = pathToFileURL(
    join(root, 'packages/detection/dist/bakeoff/bakeoff-runner.js'),
  ).href;
  const { loadBakeoffDatasetFromFile, runBakeoffEvaluation } = await import(runnerUrl);

  const datasetPath = join(root, 'data/baseline/labelled-evaluation-set.json');
  const results = await runBakeoffEvaluation(loadBakeoffDatasetFromFile(datasetPath));

  const outputPath = join(root, 'data/bakeoff-results.json');
  writeFileSync(outputPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');

  process.stdout.write(`Bake-off precision: ${(results.precision * 100).toFixed(1)}%\n`);
  process.stdout.write(`Wrote ${outputPath}\n`);

  if (results.precision < 0.7) {
    process.exitCode = 1;
  }
}

void run();
