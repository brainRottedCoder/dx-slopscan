import type { FastifyInstance } from 'fastify';

import { getSessionToken, requireAuth } from '../middleware/auth.middleware.js';
import { getScanCache } from '../scan/scan-registry.js';
import { analyseContributor } from '../services/contributor.service.js';
import { loadScanContext } from '../services/scan-context.js';

export async function registerContributorRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { id: string; login: string } }>(
    '/api/scan/:id/analyse/contributor/:login',
    { preHandler: requireAuth },
    async (request, reply) => {
      const token = getSessionToken(request);
      if (!token) return reply.code(401).send({ error: 'Unauthorized' });

      const context = loadScanContext(getScanCache(), request.params.id);
      const profile = await analyseContributor(
        request.params.login,
        context.result,
        context.repoRef,
        token,
      );

      return reply.send(profile);
    },
  );
}
