import type { FastifyInstance } from 'fastify';

import { ScanNotFoundError, UnauthorizedError } from '../errors/domain-errors.js';
import { getSessionToken, requireAuth } from '../middleware/auth.middleware.js';
import { getScanCache } from '../scan/scan-registry.js';
import { generateJsonReport, validateExportReport } from '../services/export.service.js';

export async function registerExportRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { id: string } }>(
    '/api/scan/:id/export',
    { preHandler: requireAuth },
    async (request, _reply) => {
      const token = getSessionToken(request);
      if (!token) {
        throw new UnauthorizedError();
      }

      const stored = getScanCache().getScanById(request.params.id);
      if (!stored) {
        throw new ScanNotFoundError(request.params.id);
      }

      const report = validateExportReport(
        generateJsonReport(stored.scanId, stored.result),
      );
      return report;
    },
  );
}
