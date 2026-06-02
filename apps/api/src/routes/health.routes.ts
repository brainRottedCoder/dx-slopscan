import type { FastifyInstance } from 'fastify';

import { HEALTH_ROUTE } from '../constants/server.js';

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get(HEALTH_ROUTE, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));
}
