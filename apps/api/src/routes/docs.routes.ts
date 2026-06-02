import type { FastifyInstance } from 'fastify';

import { getSessionToken, requireAuth } from '../middleware/auth.middleware.js';
import { getScanCache, getSseManager } from '../scan/scan-registry.js';
import { analyseDocFile, analyseFolder } from '../services/docs.service.js';
import { loadScanContext } from '../services/scan-context.js';

interface FolderBody {
  readonly path: string;
}

interface DocBody {
  readonly filePath: string;
}

export async function registerDocsRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { id: string }; Body: FolderBody }>(
    '/api/scan/:id/analyse/folder',
    { preHandler: requireAuth },
    async (request, reply) => {
      const token = getSessionToken(request);
      if (!token) return reply.code(401).send({ error: 'Unauthorized' });

      const context = loadScanContext(getScanCache(), request.params.id);
      const folderPath = request.body.path ?? '.';

      void analyseFolder(
        context.scanId,
        folderPath,
        context.result.tree,
        context.repoRef,
        context.headSha,
        token,
        getSseManager(),
      );

      return reply.code(202).send({ status: 'started', folderPath });
    },
  );

  app.post<{ Params: { id: string }; Body: DocBody }>(
    '/api/scan/:id/analyse/doc',
    { preHandler: requireAuth },
    async (request, reply) => {
      const token = getSessionToken(request);
      if (!token) return reply.code(401).send({ error: 'Unauthorized' });

      if (!request.body.filePath) {
        return reply.code(400).send({ error: 'filePath is required' });
      }

      const context = loadScanContext(getScanCache(), request.params.id);
      const result = await analyseDocFile(
        request.body.filePath,
        context.repoRef,
        context.headSha,
        token,
      );

      return reply.send(result);
    },
  );
}
