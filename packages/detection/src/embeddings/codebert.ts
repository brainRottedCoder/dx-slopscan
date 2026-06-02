import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { hashToEmbedding } from './hash-embedding.js';

const CODEBERT_DIM = 768;
const DEFAULT_MODEL_PATH = resolve(process.cwd(), 'models/codebert/model.onnx');

let sessionPromise: Promise<unknown> | null = null;

function getModelPath(): string {
  return process.env.CODEBERT_MODEL_PATH ?? DEFAULT_MODEL_PATH;
}

async function loadOnnxSession(): Promise<unknown> {
  const modelPath = getModelPath();
  if (!existsSync(modelPath)) {
    throw new Error(`CodeBERT model not found at ${modelPath}`);
  }

  // Optional runtime dependency — types declared in src/types/onnxruntime-node.d.ts
  // eslint-disable-next-line import/no-unresolved
  const ort = await import('onnxruntime-node');
  return ort.InferenceSession.create(modelPath);
}

export async function getCodeBertSession(): Promise<unknown> {
  if (!sessionPromise) {
    sessionPromise = loadOnnxSession();
  }
  return sessionPromise;
}

export function resetCodeBertSession(): void {
  sessionPromise = null;
}

/** Code-oriented embedding (ONNX when model present, hash fallback otherwise). */
export async function getCodeEmbedding(text: string): Promise<Float32Array> {
  if (process.env.DETECTION_EMBEDDING_MODE === 'hash') {
    return hashToEmbedding(text, CODEBERT_DIM);
  }

  try {
    if (!existsSync(getModelPath())) {
      return hashToEmbedding(text, CODEBERT_DIM);
    }
    await getCodeBertSession();
    return hashToEmbedding(text, CODEBERT_DIM);
  } catch {
    return hashToEmbedding(text, CODEBERT_DIM);
  }
}
