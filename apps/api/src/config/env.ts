import { z } from 'zod';

import { DEFAULT_API_PORT, MIN_SESSION_SECRET_LENGTH } from '../constants/server.js';

const nodeEnvSchema = z.enum(['development', 'test', 'production']);

const envSchema = z.object({
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  SESSION_SECRET: z.string().min(MIN_SESSION_SECRET_LENGTH),
  PORT: z.coerce.number().int().positive().default(DEFAULT_API_PORT),
  NODE_ENV: nodeEnvSchema,
  DB_PATH: z.string().default('./data/slop.db'),
  MODELS_DIR: z.string().default('./models'),
  SCAN_CACHE_TTL_HOURS: z.coerce.number().int().positive().default(24),
});

export type AppEnv = z.infer<typeof envSchema>;

/** Parse and validate process environment. Throws on invalid config. */
export function parseEnv(source: NodeJS.ProcessEnv): AppEnv {
  return envSchema.parse(source);
}

export const env: AppEnv = parseEnv(process.env);
