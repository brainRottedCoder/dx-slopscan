import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import session from '@fastify/session';
import Fastify from 'fastify';

import { env } from './config/env.js';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from './constants/auth.js';
import {
  DomainError,
  InvalidRepoUrlError,
  PrivateRepoError,
  RateLimitError,
  ScanNotFoundError,
  toDomainErrorResponse,
} from './errors/domain-errors.js';
import { registerRateLimit } from './middleware/rate-limit.middleware.js';
import { registerRoutes } from './routes/index.js';

export async function buildServer() {
  const app = Fastify({ logger: env.NODE_ENV !== 'test' });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);
  await app.register(session, {
    secret: env.SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE_MS,
    },
  });
  registerRateLimit(app);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ScanNotFoundError) {
      return reply.code(404).send(toDomainErrorResponse(error));
    }
    if (error instanceof PrivateRepoError) {
      return reply.code(403).send(toDomainErrorResponse(error));
    }
    if (error instanceof RateLimitError) {
      return reply.code(429).send(toDomainErrorResponse(error));
    }
    if (error instanceof InvalidRepoUrlError) {
      return reply.code(400).send(toDomainErrorResponse(error));
    }
    if (error instanceof DomainError) {
      return reply.code(400).send(toDomainErrorResponse(error));
    }
    throw error;
  });

  await registerRoutes(app);

  return app;
}
