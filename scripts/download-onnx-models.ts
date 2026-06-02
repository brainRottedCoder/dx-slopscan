import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { ReadableStream } from 'node:stream/web';

interface OnnxModelConfig {
  readonly name: string;
  readonly url: string;
  readonly outputPath: string;
}

const DEFAULT_MODELS: readonly OnnxModelConfig[] = [
  {
    name: 'all-MiniLM-L6-v2',
    url: 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx',
    outputPath: resolve(process.cwd(), 'models/minilm/model.onnx'),
  },
  {
    name: 'codebert-base',
    url: 'https://huggingface.co/microsoft/codebert-base/resolve/main/onnx/model.onnx',
    outputPath: resolve(process.cwd(), 'models/codebert/model.onnx'),
  },
];

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  await mkdir(dirname(outputPath), { recursive: true });

  const fileStream = createWriteStream(outputPath);
  const body = response.body;

  if (!body) {
    throw new Error(`No response body for ${url}`);
  }

  const reader = (body as ReadableStream<Uint8Array>).getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(value);
    }
  } finally {
    reader.releaseLock();
    fileStream.end();
  }

  await new Promise<void>((resolvePromise, reject) => {
    fileStream.on('finish', resolvePromise);
    fileStream.on('error', reject);
  });
}

async function downloadModel(config: OnnxModelConfig): Promise<void> {
  process.stdout.write(`[download] Starting ${config.name}...\n`);
  process.stdout.write(`[download] URL: ${config.url}\n`);
  process.stdout.write(`[download] Output: ${config.outputPath}\n`);

  try {
    await downloadFile(config.url, config.outputPath);
    process.stdout.write(`[download] ✅ ${config.name} complete\n`);
  } catch (error) {
    process.stdout.write(
      `[download] ⚠️ ${config.name} failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    throw error;
  }
}

export async function downloadOnnxModels(
  models: readonly OnnxModelConfig[] = DEFAULT_MODELS,
): Promise<void> {
  let failures = 0;

  for (const model of models) {
    try {
      await downloadModel(model);
    } catch {
      failures += 1;
    }
  }

  if (failures > 0) {
    process.stdout.write(
      `[download] ${failures} model(s) failed. Falling back to hash embeddings (deterministic, no ONNX required).\n`,
    );
    process.stdout.write(
      `[download] To retry, set DETECTION_EMBEDDING_MODE=onnx and re-run this script.\n`,
    );
    process.exit(1);
  }

  process.stdout.write('[download] All ONNX models downloaded successfully.\n');
}

async function main(): Promise<void> {
  const customUrl = process.argv[2];
  const customOutput = process.argv[3];

  if (customUrl && customOutput) {
    await downloadOnnxModels([
      {
        name: 'custom',
        url: customUrl,
        outputPath: resolve(customOutput),
      },
    ]);
    return;
  }

  await downloadOnnxModels();
}

main().catch((error: unknown) => {
  process.stderr.write(`Fatal: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
