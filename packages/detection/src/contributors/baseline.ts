import { computeVocabularyShift } from './vocabulary-shift.js';

export interface ContributorBaseline {
  readonly login: string;
  readonly msgLengthMean: number;
  readonly msgLengthStddev: number;
  readonly vocabCentroid: Float32Array;
  readonly avgInfoDensity: number;
  readonly sampleSize: number;
}

export interface ContributorStats {
  readonly avgMsgLength: number;
  readonly embeddingCentroid: Float32Array;
}

export interface DeviationResult {
  readonly lengthDeviation: number;
  readonly vocabularyDrift: number;
  readonly isSignificant: boolean;
  readonly explanation: string;
}

function buildDeviationExplanation(lengthZ: number, vocabDrift: number): string {
  if (lengthZ > 2 && vocabDrift > 0.3) {
    return 'Recent pull request descriptions differ notably in length and vocabulary from this contributor’s usual style.';
  }
  if (lengthZ > 2) {
    return 'Recent pull request descriptions are unusually long or short compared with this contributor’s history.';
  }
  if (vocabDrift > 0.3) {
    return 'Recent vocabulary differs from this contributor’s typical phrasing.';
  }
  return 'Recent activity is consistent with this contributor’s established baseline.';
}

/** Flag deviation from a contributor’s own history (F-409). */
export function deviatesFromBaseline(
  current: ContributorStats,
  baseline: ContributorBaseline,
): DeviationResult {
  const lengthZScore =
    Math.abs(current.avgMsgLength - baseline.msgLengthMean) /
    (baseline.msgLengthStddev || 1);
  const vocabDrift = computeVocabularyShift(baseline.vocabCentroid, current.embeddingCentroid);

  return {
    lengthDeviation: lengthZScore,
    vocabularyDrift: vocabDrift,
    isSignificant: lengthZScore > 2.0 || vocabDrift > 0.3,
    explanation: buildDeviationExplanation(lengthZScore, vocabDrift),
  };
}

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stddev(values: readonly number[], avg: number): number {
  if (values.length < 2) return 1;
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance) || 1;
}

/** Build a personal baseline from historical message lengths and embeddings. */
export function buildContributorBaseline(
  login: string,
  messageLengths: readonly number[],
  embeddings: readonly Float32Array[],
  densities: readonly number[],
): ContributorBaseline {
  const msgLengthMean = mean(messageLengths);
  const msgLengthStddev = stddev(messageLengths, msgLengthMean);
  const avgInfoDensity = mean(densities);

  const dimension = embeddings[0]?.length ?? 8;
  const centroid = new Float32Array(dimension);
  if (embeddings.length > 0) {
    for (const embedding of embeddings) {
      for (let index = 0; index < dimension; index += 1) {
        centroid[index] = (centroid[index] ?? 0) + (embedding[index] ?? 0);
      }
    }
    for (let index = 0; index < dimension; index += 1) {
      centroid[index] = (centroid[index] ?? 0) / embeddings.length;
    }
  }

  return {
    login,
    msgLengthMean,
    msgLengthStddev,
    vocabCentroid: centroid,
    avgInfoDensity,
    sampleSize: messageLengths.length,
  };
}
