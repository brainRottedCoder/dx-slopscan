import type { CompositeScore, PrScoringInput } from '@slop-scanner/shared-types';

import { SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { getEmbedding } from '../embeddings/minilm.js';
import { cosineSimilarity } from '../embeddings/similarity.js';
import { detectAnalysisCapability } from '../language/detector.js';
import { composeScore } from '../utils/composite-score.js';
import { buildSignalScore, invertSignalScore } from '../utils/signal-score.js';

import { countConcreteClaims } from './concrete-claims.js';
import { computeDiffRestate } from './diff-restate.js';
import { computeHedgingDensity } from './hedging-density.js';
import { computeLexicalOverlap } from './lexical-overlap.js';

function buildDiffSummary(
  diffSymbols: readonly string[],
  changedFunctions: readonly string[],
): string {
  const symbols = diffSymbols.join(' ');
  const functions = changedFunctions.join(' ');
  return `${symbols} ${functions}`.trim();
}

/** Composite PR information-density score (F-201). */
export async function scorePullRequest(input: PrScoringInput): Promise<CompositeScore> {
  const lexical = computeLexicalOverlap({
    diffSymbols: input.diffSymbols,
    descriptionText: input.description,
  });
  const claims = countConcreteClaims(input.description);
  const { capability } = detectAnalysisCapability(input.description);
  const hedging = computeHedgingDensity(input.description);

  const [descriptionEmbedding, diffEmbedding] = await Promise.all([
    getEmbedding(input.description),
    getEmbedding(buildDiffSummary(input.diffSymbols, input.changedFunctions)),
  ]);

  const similarity = cosineSimilarity(descriptionEmbedding, diffEmbedding);
  const embedScore = buildSignalScore(
    'embedding_similarity',
    similarity,
    SIGNAL_WEIGHTS.EMBEDDING,
    `Cosine similarity: ${similarity.toFixed(3)}`,
  );

  const restate = computeDiffRestate({
    lexicalOverlap: lexical.value,
    embeddingSimilarity: similarity,
    concreteClaimsNormalized: claims.value,
  });

  const signals = [
    invertSignalScore(lexical),
    claims,
    invertSignalScore(embedScore),
    invertSignalScore(restate),
  ];
  if (capability === 'full') {
    signals.push(hedging);
  }

  return composeScore(signals);
}
