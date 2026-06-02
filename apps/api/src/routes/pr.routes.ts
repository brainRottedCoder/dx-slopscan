import type { FastifyInstance } from 'fastify';

import { getSessionToken, requireAuth } from '../middleware/auth.middleware.js';
import { getScanCache } from '../scan/scan-registry.js';
import { analysePr } from '../services/pr.service.js';
import { loadScanContext } from '../services/scan-context.js';

export async function registerPrRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { id: string; prNumber: string } }>(
    '/api/scan/:id/analyse/pr/:prNumber',
    { preHandler: requireAuth },
    async (request, reply) => {
      const token = getSessionToken(request);
      if (!token) return reply.code(401).send({ error: 'Unauthorized' });

      const prNumber = Number.parseInt(request.params.prNumber, 10);
      if (Number.isNaN(prNumber)) {
        return reply.code(400).send({ error: 'Invalid pull request number' });
      }

      const context = loadScanContext(getScanCache(), request.params.id);
      const result = await analysePr(prNumber, context.repoRef, token);

      return reply.send({
        prNumber: result.prNumber,
        score: result.score,
        signals: result.score.signals,
        analyzedAt: result.analyzedAt,
      });
    },
  );
}
