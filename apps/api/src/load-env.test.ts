import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('loadEnvFiles', () => {
  it('finds monorepo root .env when present', () => {
    const rootEnv = resolve(process.cwd(), '../../.env');
    expect(existsSync(rootEnv)).toBe(true);
  });
});
