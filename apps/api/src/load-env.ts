import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from 'dotenv';

const ENV_FILENAMES = ['.env', '../../.env'] as const;

/** Load the first .env file found (package dir, then monorepo root). */
export function loadEnvFiles(): void {
  for (const relativePath of ENV_FILENAMES) {
    const envPath = resolve(process.cwd(), relativePath);
    if (existsSync(envPath)) {
      config({ path: envPath });
      return;
    }
  }
}

loadEnvFiles();
