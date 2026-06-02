import type { FastifyInstance } from 'fastify';

import { registerAuthRoutes } from './auth.routes.js';
import { registerContributorRoutes } from './contributor.routes.js';
import { registerDocsRoutes } from './docs.routes.js';
import { registerExportRoutes } from './export.routes.js';
import { registerHealthRoutes } from './health.routes.js';
import { registerPrRoutes } from './pr.routes.js';
import { registerScanRoutes } from './scan.routes.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  await registerScanRoutes(app);
  await registerPrRoutes(app);
  await registerContributorRoutes(app);
  await registerDocsRoutes(app);
  await registerExportRoutes(app);
}
