import { randomUUID } from 'node:crypto';

import { parseRepoUrl } from '@slop-scanner/github-client';
import type { FastifyInstance } from 'fastify';

import { InvalidRepoUrlError, ScanNotFoundError } from '../errors/domain-errors.js';
import { getSessionToken, requireAuth } from '../middleware/auth.middleware.js';
import { getScanCache, getSseManager } from '../scan/scan-registry.js';
import { loadScanContext } from '../services/scan-context.js';
import { runDeepScan } from '../workers/deep-scan.worker.js';
import { enqueueTier1Scan } from '../workers/scan.worker.js';

interface StartScanBody {
  readonly repoUrl: string;
}

export async function registerScanRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: StartScanBody }>(
    '/api/scan',
    { preHandler: requireAuth },
    async (request, reply) => {
      const token = getSessionToken(request);
      if (!token) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      let repoRef;
      try {
        repoRef = parseRepoUrl(request.body.repoUrl);
      } catch {
        throw new InvalidRepoUrlError(request.body.repoUrl ?? '');
      }

      const scanId = randomUUID();
      const repoFullName = `${repoRef.owner}/${repoRef.repo}`;
      const cache = getScanCache();
      const sse = getSseManager();

      cache.upsertPendingScan(scanId, repoFullName, 'pending');

      enqueueTier1Scan(
        { scanId, repoRef, repoFullName, token },
        { sse, cache },
      );

      return reply.code(202).send({ scanId });
    },
  );

  app.get<{ Params: { id: string } }>(
    '/api/scan/:id/stream',
    { preHandler: requireAuth },
    async (request, reply) => {
      const scanId = request.params.id;
      getSseManager().register(scanId, reply.raw);
      return reply;
    },
  );

  app.get<{ Params: { id: string } }>(
    '/api/scan/:id',
    { preHandler: requireAuth },
    async (request, _reply) => {
      const stored = getScanCache().getScanById(request.params.id);
      if (!stored) {
        throw new ScanNotFoundError(`Scan ${request.params.id} not found`);
      }
      return stored.result;
    },
  );

  app.post<{ Params: { id: string } }>(
    '/api/scan/:id/deep-scan',
    { preHandler: requireAuth },
    async (request, reply) => {
      const token = getSessionToken(request);
      if (!token) return reply.code(401).send({ error: 'Unauthorized' });

      const context = loadScanContext(getScanCache(), request.params.id);

      void runDeepScan(
        {
          scanId: context.scanId,
          repoRef: context.repoRef,
          repoFullName: context.result.repoFullName,
          token,
          headSha: context.headSha,
          tier1: context.result,
        },
        { cache: getScanCache(), sse: getSseManager() },
      ).catch(() => {
        getSseManager().emit(request.params.id, {
          type: 'scan:error',
          scanId: request.params.id,
          payload: { message: 'Deep scan failed' },
          timestamp: new Date().toISOString(),
        });
      });

      return reply.code(202).send({ status: 'started', scanId: context.scanId });
    },
  );

  app.get<{ Params: { id: string } }>(
    '/api/scan/:id/status',
    { preHandler: requireAuth },
    async (request, _reply) => {
      const status = getScanCache().getScanStatus(request.params.id);
      if (!status) {
        throw new ScanNotFoundError(`Scan ${request.params.id} not found`);
      }

      return {
        scanId: request.params.id,
        status: status.status,
        progress: status.progress,
      };
    },
  );
}
