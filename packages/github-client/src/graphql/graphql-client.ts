import { GitHubApiError } from '../errors/github-api.error.js';
import { GITHUB_GRAPHQL_URL, githubFetch } from '../http/github-fetch.js';

interface GraphqlEnvelope<T> {
  readonly data?: T;
  readonly errors?: readonly { readonly message: string }[];
}

export interface GraphqlClient {
  query<TData>(document: string, variables: Record<string, unknown>): Promise<TData>;
}

export function createGraphqlClient(token: string): GraphqlClient {
  return {
    async query<TData>(
      document: string,
      variables: Record<string, unknown>,
    ): Promise<TData> {
      const response = await githubFetch(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: document, variables }),
      });

      const payload = (await response.json()) as GraphqlEnvelope<TData>;

      if (payload.errors && payload.errors.length > 0) {
        throw new GitHubApiError(payload.errors[0]?.message ?? 'GraphQL error', 422);
      }

      if (!payload.data) {
        throw new GitHubApiError('GraphQL response missing data', 500);
      }

      return payload.data;
    },
  };
}
