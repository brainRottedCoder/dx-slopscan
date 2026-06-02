import { describe, expect, it } from 'vitest';

import { parseEnv } from './env.js';

const VALID_ENV: NodeJS.ProcessEnv = {
  GITHUB_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_SECRET: 'test-client-secret',
  GITHUB_CALLBACK_URL: 'http://localhost:3001/auth/github/callback',
  FRONTEND_URL: 'http://localhost:5173',
  SESSION_SECRET: 'a'.repeat(32),
  NODE_ENV: 'test',
};

describe('parseEnv', () => {
  it('parses valid environment variables', () => {
    const result = parseEnv(VALID_ENV);

    expect(result.GITHUB_CLIENT_ID).toBe('test-client-id');
    expect(result.PORT).toBe(3001);
    expect(result.DB_PATH).toBe('./data/slop.db');
  });

  it('rejects missing GITHUB_CLIENT_ID', () => {
    const incomplete = { ...VALID_ENV };
    delete incomplete.GITHUB_CLIENT_ID;

    expect(() => parseEnv(incomplete)).toThrow();
  });

  it('rejects SESSION_SECRET shorter than minimum', () => {
    expect(() =>
      parseEnv({
        ...VALID_ENV,
        SESSION_SECRET: 'too-short',
      }),
    ).toThrow();
  });

  it('rejects invalid NODE_ENV', () => {
    expect(() =>
      parseEnv({
        ...VALID_ENV,
        NODE_ENV: 'staging',
      }),
    ).toThrow();
  });
});
