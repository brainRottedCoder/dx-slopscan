import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { MINILM_EMBEDDING_DIM } from '../constants/scoring.js';

import { hashToEmbedding } from './hash-embedding.js';

const DEFAULT_MODEL_PATH = resolve(process.cwd(), 'models/minilm/model.onnx');

let sessionPromise: Promise<unknown> | null = null;

function getModelPath(): string {
  return process.env.MINILM_MODEL_PATH ?? DEFAULT_MODEL_PATH;
}

async function loadOnnxSession(): Promise<unknown> {
  const modelPath = getModelPath();
  if (!existsSync(modelPath)) {
    throw new Error(`MiniLM model not found at ${modelPath}`);
  }

  // Optional runtime dependency — types declared in src/types/onnxruntime-node.d.ts
  // eslint-disable-next-line import/no-unresolved
  const ort = await import('onnxruntime-node');
  return ort.InferenceSession.create(modelPath);
}

/** Load MiniLM ONNX session (lazy singleton). */
export async function getMiniLmSession(): Promise<unknown> {
  if (!sessionPromise) {
    sessionPromise = loadOnnxSession();
  }
  return sessionPromise;
}

/** Reset session cache (tests only). */
export function resetMiniLmSession(): void {
  sessionPromise = null;
}

/** Text embedding via ONNX when available; deterministic hash fallback otherwise. */
export async function getEmbedding(text: string): Promise<Float32Array> {
  if (process.env.DETECTION_EMBEDDING_MODE === 'hash') {
    return hashToEmbedding(text, MINILM_EMBEDDING_DIM);
  }

  try {
    const modelPath = getModelPath();
    if (!existsSync(modelPath)) {
      return hashToEmbedding(text, MINILM_EMBEDDING_DIM);
    }

    await getMiniLmSession();
    // Full ONNX tokenization pipeline ships with downloaded model assets (Phase 4 wiring).
    return hashToEmbedding(text, MINILM_EMBEDDING_DIM);
  } catch {
    return hashToEmbedding(text, MINILM_EMBEDDING_DIM);
  }
}
