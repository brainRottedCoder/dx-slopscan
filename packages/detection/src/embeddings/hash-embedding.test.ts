import { describe, expect, it } from 'vitest';

import { hashToEmbedding } from './hash-embedding.js';

describe('hashToEmbedding', () => {
  it('returns a normalized Float32Array of requested dimensions', () => {
    const embedding = hashToEmbedding('hello world', 384);
    expect(embedding).toBeInstanceOf(Float32Array);
    expect(embedding.length).toBe(384);
  });

  it('returns deterministic output for same input', () => {
    const a = hashToEmbedding('deterministic test', 384);
    const b = hashToEmbedding('deterministic test', 384);
    expect(a).toEqual(b);
  });

  it('returns different output for different input', () => {
    const a = hashToEmbedding('input a', 384);
    const b = hashToEmbedding('input b', 384);
    expect(a).not.toEqual(b);
  });

  it('has unit length (normalized)', () => {
    const embedding = hashToEmbedding('normalization check', 384);
    let magnitude = 0;
    for (let i = 0; i < embedding.length; i += 1) {
      magnitude += embedding[i] ** 2;
    }
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it('handles empty string', () => {
    const embedding = hashToEmbedding('', 384);
    expect(embedding).toBeInstanceOf(Float32Array);
    expect(embedding.length).toBe(384);
    // Empty string produces all-zero vector (no characters to distribute)
    let magnitude = 0;
    for (let i = 0; i < embedding.length; i += 1) {
      magnitude += embedding[i] ** 2;
    }
    expect(magnitude).toBe(0);
  });

  it('defaults to MINILM_EMBEDDING_DIM when dimensions omitted', () => {
    const embedding = hashToEmbedding('default dimensions');
    expect(embedding.length).toBe(384);
  });
});
