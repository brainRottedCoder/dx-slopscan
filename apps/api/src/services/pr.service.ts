import { scorePullRequest } from '@slop-scanner/detection';
import { buildGitHubClient, type GitHubClient } from '@slop-scanner/github-client';
import type { PrAnalysisResult, PullRequest, RepoRef } from '@slop-scanner/shared-types';

import { MemoryCache } from '../cache/memory.cache.js';
import { extractChangedFunctions, extractSymbolsFromDiff } from '../utils/diff-parser.js';

const PR_CACHE_TTL_MS = 86_400_000;
const prAnalysisCache = new MemoryCache<PrAnalysisResult>();
const prNumberToCacheKey = new Map<number, string>();

export type GitHubClientFactory = (token: string) => GitHubClient;

function buildCacheKey(prNumber: number, updatedAt: string): string {
  return `${String(prNumber)}:${updatedAt}`;
}

/** Analyse a single pull request with PR-number:updatedAt cache key. */
export async function analysePr(
  prNumber: number,
  repoRef: RepoRef,
  token: string,
  clientFactory: GitHubClientFactory = buildGitHubClient,
): Promise<PrAnalysisResult> {
  const knownKey = prNumberToCacheKey.get(prNumber);
  if (knownKey) {
    const cached = prAnalysisCache.get(knownKey);
    if (cached) return cached;
  }

  const client = clientFactory(token);
  const pr = await client.getPullRequest(repoRef, prNumber);
  const cacheKey = buildCacheKey(prNumber, pr.updatedAt);
  const cached = prAnalysisCache.get(cacheKey);
  if (cached) {
    prNumberToCacheKey.set(prNumber, cacheKey);
    return cached;
  }

  const diff = await client.rest.getPrDiff(repoRef.owner, repoRef.repo, prNumber);
  const diffSymbols = extractSymbolsFromDiff(diff);
  const changedFunctions = extractChangedFunctions(diff);

  const score = await scorePullRequest({
    description: pr.body,
    diffSymbols,
    changedFunctions,
    diffLineCount: diff.split('\n').length,
  });

  const result: PrAnalysisResult = {
    prNumber,
    score,
    analyzedAt: new Date().toISOString(),
  };

  prAnalysisCache.set(cacheKey, result, PR_CACHE_TTL_MS);
  prNumberToCacheKey.set(prNumber, cacheKey);
  return result;
}

/** Test helper — reset PR analysis cache between tests. */
export function resetPrAnalysisCacheForTests(): void {
  prAnalysisCache.clear();
  prNumberToCacheKey.clear();
}

/** Test helper — peek cache without network. */
export function getCachedPrAnalysis(
  prNumber: number,
  updatedAt: string,
): PrAnalysisResult | undefined {
  return prAnalysisCache.get(buildCacheKey(prNumber, updatedAt));
}

/** Test helper — seed cache. */
export function seedPrAnalysisCache(
  pr: PullRequest,
  result: PrAnalysisResult,
): void {
  prAnalysisCache.set(buildCacheKey(pr.number, pr.updatedAt), result, PR_CACHE_TTL_MS);
}
