import type { DeviationResult } from '@slop-scanner/shared-types';

import {
  buildContributorBaseline,
  deviatesFromBaseline,
  type ContributorStats,
} from './baseline.js';

export interface ContributorScoringInput {
  readonly login: string;
  readonly messageLengths: readonly number[];
  readonly embeddings: readonly Float32Array[];
  readonly densities: readonly number[];
  readonly currentMessageLength: number;
  readonly currentEmbedding: Float32Array;
}

/** Score contributor deviation from personal baseline (F-203, F-409). */
export function scoreContributorPattern(input: ContributorScoringInput): DeviationResult {
  if (input.messageLengths.length < 2) {
    const average =
      input.densities.length > 0
        ? input.densities.reduce((sum, value) => sum + value, 0) / input.densities.length
        : 0;
    return {
      lengthDeviation: 0,
      vocabularyDrift: 0,
      isSignificant: false,
      explanation: `Average information density ${average.toFixed(0)} across recent pull requests.`,
    };
  }

  const baseline = buildContributorBaseline(
    input.login,
    input.messageLengths,
    input.embeddings,
    input.densities,
  );

  const current: ContributorStats = {
    avgMsgLength: input.currentMessageLength,
    embeddingCentroid: input.currentEmbedding,
  };

  return deviatesFromBaseline(current, baseline);
}
