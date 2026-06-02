import { cosineSimilarity } from '../embeddings/similarity.js';

/** Embedding distance between baseline and current contributor voice (0–1). */
export function computeVocabularyShift(
  baselineCentroid: Float32Array,
  currentCentroid: Float32Array,
): number {
  if (baselineCentroid.length === 0 || currentCentroid.length === 0) {
    return 0;
  }
  return Math.max(0, 1 - cosineSimilarity(baselineCentroid, currentCentroid));
}
