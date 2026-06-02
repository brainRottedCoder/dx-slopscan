import { describe, expect, it } from 'vitest';

import { getEmbedding, resetMiniLmSession } from './minilm.js';

describe('getEmbedding (MiniLM)', () => {
  it('returns a Float32Array of MINILM_EMBEDDING_DIM (384) in hash mode', async () => {
    const originalMode = process.env.DETECTION_EMBEDDING_MODE;
    process.env.DETECTION_EMBEDDING_MODE = 'hash';

    const embedding = await getEmbedding('test sentence for minilm');

    expect(embedding).toBeInstanceOf(Float32Array);
    expect(embedding.length).toBe(384);

    process.env.DETECTION_EMBEDDING_MODE = originalMode;
  });

  it('returns deterministic embedding for same input in hash mode', async () => {
    const originalMode = process.env.DETECTION_EMBEDDING_MODE;
    process.env.DETECTION_EMBEDDING_MODE = 'hash';

    const a = await getEmbedding('same input');
    const b = await getEmbedding('same input');
    expect(a).toEqual(b);

    process.env.DETECTION_EMBEDDING_MODE = originalMode;
  });

  it('falls back to hash when model file is missing', async () => {
    const originalPath = process.env.MINILM_MODEL_PATH;
    process.env.MINILM_MODEL_PATH = '/nonexistent/path/model.onnx';

    const embedding = await getEmbedding('fallback test');

    expect(embedding).toBeInstanceOf(Float32Array);
    expect(embedding.length).toBe(384);

    process.env.MINILM_MODEL_PATH = originalPath;
  });

  it('resetMiniLmSession clears the cached promise', () => {
    expect(() => resetMiniLmSession()).not.toThrow();
  });
});
