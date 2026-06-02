import 'fastify';

declare module 'fastify' {
  interface Session {
    oauthState?: string;
    encryptedToken?: string;
    login?: string;
    scopes?: string[];
  }
}
