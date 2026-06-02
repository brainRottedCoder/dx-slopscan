import { MINILM_EMBEDDING_DIM } from '../constants/scoring.js';

/** Deterministic pseudo-embedding for tests and offline fallback (no ONNX). */
export function hashToEmbedding(text: string, dimensions = MINILM_EMBEDDING_DIM): Float32Array {
  const vector = new Float32Array(dimensions);
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    const slot = code % dimensions;
    vector[slot] = (vector[slot] ?? 0) + code / 255;
  }

  let magnitude = 0;
  for (let index = 0; index < vector.length; index += 1) {
    magnitude += (vector[index] ?? 0) ** 2;
  }
  const norm = Math.sqrt(magnitude) || 1;
  for (let index = 0; index < vector.length; index += 1) {
    vector[index] = (vector[index] ?? 0) / norm;
  }

  return vector;
}
