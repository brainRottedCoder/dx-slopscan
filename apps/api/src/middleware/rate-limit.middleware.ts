import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { RateLimitError } from '../errors/domain-errors.js';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();

function clientKey(request: FastifyRequest): string {
  const login = request.session?.login;
  if (typeof login === 'string' && login.length > 0) {
    return `user:${login}`;
  }
  return `ip:${request.ip}`;
}

function checkRateLimit(key: string): void {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  existing.count += 1;
  if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    throw new RateLimitError(retryAfter);
  }
}

/** Per-session/IP sliding-window rate limit for API routes. */
export async function rateLimitPreHandler(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (request.url.startsWith('/health')) {
    return;
  }
  checkRateLimit(clientKey(request));
}

/** Register global rate limiting on the Fastify instance. */
export function registerRateLimit(app: FastifyInstance): void {
  app.addHook('onRequest', rateLimitPreHandler);
}

/** Reset buckets (tests only). */
export function resetRateLimitBucketsForTests(): void {
  buckets.clear();
}
