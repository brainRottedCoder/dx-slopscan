import type { FastifyReply, FastifyRequest } from 'fastify';

import { env } from '../config/env.js';
import { getDecryptedToken } from '../services/auth.service.js';

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = getDecryptedToken(request.session, env.SESSION_SECRET);
  if (!token) {
    await reply.code(401).send({ error: 'Unauthorized' });
  }
}

export function getSessionToken(request: FastifyRequest): string | null {
  return getDecryptedToken(request.session, env.SESSION_SECRET);
}
