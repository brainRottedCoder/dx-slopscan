import './load-env.js';

import { env } from './config/env.js';
import { buildServer } from './server.js';

async function start(): Promise<void> {
  const app = await buildServer();
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}

start().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
