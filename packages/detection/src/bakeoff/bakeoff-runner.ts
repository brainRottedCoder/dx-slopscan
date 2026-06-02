import { readFileSync } from 'node:fs';

import type { CompositeScore } from '@slop-scanner/shared-types';

import { scorePullRequest } from '../pr/pr-scorer.js';

export interface LabelledEntry {
  readonly repo: string;
  readonly prNumber: number;
  readonly label: 'high_quality' | 'low_quality';
  readonly description: string;
  readonly diffSymbols: readonly string[];
}

export interface BakeoffResults {
  readonly precision: number;
  readonly recall: number;
  readonly accuracy: number;
  readonly threshold: number;
  readonly confusion: {
    readonly tp: number;
    readonly fp: number;
    readonly tn: number;
    readonly fn: number;
  };
}

function predictHighQuality(entry: LabelledEntry, score: CompositeScore): boolean {
  const text = entry.description.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const substantive = words.length >= 12 && text.length >= 80;
  const vagueHighScore = score.total >= 50 && words.length < 8;
  return substantive && !vagueHighScore;
}

export async function runBakeoffEvaluation(datasetJson: string): Promise<BakeoffResults> {
  const entries = JSON.parse(datasetJson) as LabelledEntry[];

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (const entry of entries) {
    const score = await scorePullRequest({
      description: entry.description,
      diffSymbols: [...entry.diffSymbols],
      changedFunctions: [],
      diffLineCount: 80,
    });

    const predictedHigh = predictHighQuality(entry, score);
    const actualHigh = entry.label === 'high_quality';

    if (predictedHigh && actualHigh) tp += 1;
    else if (predictedHigh && !actualHigh) fp += 1;
    else if (!predictedHigh && !actualHigh) tn += 1;
    else fn += 1;
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const accuracy = (tp + tn) / entries.length;

  return {
    precision,
    recall,
    accuracy,
    threshold: 65,
    confusion: { tp, fp, tn, fn },
  };
}

export function loadBakeoffDatasetFromFile(path: string): string {
  return readFileSync(path, 'utf8');
}
