import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_MODEL_PATH = resolve(process.cwd(), 'models/minilm/model.onnx');

function getModelPath(): string {
  return process.env.MINILM_MODEL_PATH ?? DEFAULT_MODEL_PATH;
}

/** True when ONNX MiniLM weights are present and hash fallback is not forced. */
export function isOnnxEmbeddingActive(): boolean {
  if (process.env.DETECTION_EMBEDDING_MODE === 'hash') {
    return false;
  }
  return existsSync(getModelPath());
}
