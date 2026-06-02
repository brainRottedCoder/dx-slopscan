import type { FastifyInstance, FastifyReply } from 'fastify';

import { env } from '../config/env.js';
import {
  buildAuthUserResponse,
  completeOAuthCallback,
  createOAuthState,
  getGithubAuthorizeUrl,
} from '../services/auth.service.js';

function sendUnauthorized(reply: FastifyReply) {
  return reply.code(401).send({ error: 'Unauthorized' });
}

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/auth/github', async (request, reply) => {
    const state = createOAuthState();
    request.session.oauthState = state;
    await request.session.save();
    const url = getGithubAuthorizeUrl(env, state);
    return reply.redirect(url);
  });

  app.get('/auth/github/callback', async (request, reply) => {
    const query = request.query as { code?: string; state?: string };
    const { code, state } = query;

    if (!code || !state || state !== request.session.oauthState) {
      return reply.code(400).send({ error: 'Invalid OAuth callback' });
    }

    const auth = await completeOAuthCallback(env, code);
    request.session.encryptedToken = auth.encryptedToken;
    request.session.login = auth.login;
    request.session.scopes = auth.scopes;
    delete request.session.oauthState;
    await request.session.save();

    return reply.redirect(env.FRONTEND_URL);
  });

  app.get('/auth/me', async (request, reply) => {
    if (!request.session.login || !request.session.scopes) {
      return sendUnauthorized(reply);
    }

    return buildAuthUserResponse(request.session.login, request.session.scopes);
  });

  app.post('/auth/logout', async (request, reply) => {
    await request.session.destroy();
    return reply.code(204).send();
  });
}
