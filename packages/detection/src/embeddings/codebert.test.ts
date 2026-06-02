import { describe, expect, it } from 'vitest';

import { getCodeEmbedding, resetCodeBertSession } from './codebert.js';

describe('getCodeEmbedding (CodeBERT)', () => {
  it('returns a Float32Array of CODEBERT_DIM (768) in hash mode', async () => {
    const originalMode = process.env.DETECTION_EMBEDDING_MODE;
    process.env.DETECTION_EMBEDDING_MODE = 'hash';

    const embedding = await getCodeEmbedding('function test() { return 42; }');

    expect(embedding).toBeInstanceOf(Float32Array);
    expect(embedding.length).toBe(768);

    process.env.DETECTION_EMBEDDING_MODE = originalMode;
  });

  it('returns deterministic embedding for same input in hash mode', async () => {
    const originalMode = process.env.DETECTION_EMBEDDING_MODE;
    process.env.DETECTION_EMBEDDING_MODE = 'hash';

    const a = await getCodeEmbedding('const x = 1;');
    const b = await getCodeEmbedding('const x = 1;');
    expect(a).toEqual(b);

    process.env.DETECTION_EMBEDDING_MODE = originalMode;
  });

  it('falls back to hash when model file is missing', async () => {
    const originalPath = process.env.CODEBERT_MODEL_PATH;
    process.env.CODEBERT_MODEL_PATH = '/nonexistent/path/model.onnx';

    const embedding = await getCodeEmbedding('fallback code test');

    expect(embedding).toBeInstanceOf(Float32Array);
    expect(embedding.length).toBe(768);

    process.env.CODEBERT_MODEL_PATH = originalPath;
  });

  it('resetCodeBertSession clears the cached promise', () => {
    expect(() => resetCodeBertSession()).not.toThrow();
  });
});
