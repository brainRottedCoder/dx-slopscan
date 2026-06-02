import { getEmbedding, scoreContributorPattern, scorePullRequest } from '@slop-scanner/detection';
import { buildGitHubClient } from '@slop-scanner/github-client';
import type {
  ContributorProfile,
  InformationDensityPoint,
  RepoRef,
  Tier1ScanResult,
} from '@slop-scanner/shared-types';

import type { GitHubClientFactory } from './pr.service.js';

const MAX_CONTRIBUTOR_PRS = 30;

/** Build contributor profile from cached Tier 1 PR previews. */
export async function analyseContributor(
  login: string,
  scanResult: Tier1ScanResult,
  repoRef: RepoRef,
  token: string,
  clientFactory: GitHubClientFactory = buildGitHubClient,
): Promise<ContributorProfile> {
  const client = clientFactory(token);
  const authorPrs = scanResult.prs
    .filter((pr) => pr.author === login)
    .slice(0, MAX_CONTRIBUTOR_PRS);

  const timeline: InformationDensityPoint[] = [];
  const messageLengths: number[] = [];
  const embeddings: Float32Array[] = [];
  const densities: number[] = [];

  for (const pr of authorPrs) {
    try {
      const diff = await client.rest.getPrDiff(repoRef.owner, repoRef.repo, pr.number);
      const score = await scorePullRequest({
        description: pr.body,
        diffSymbols: [],
        changedFunctions: [],
        diffLineCount: diff.split('\n').length,
      });
      const density = score.total;
      timeline.push({
        prNumber: pr.number,
        date: pr.updatedAt,
        informationDensity: density,
      });
      messageLengths.push(pr.body.length);
      embeddings.push(await getEmbedding(pr.body));
      densities.push(density);
    } catch {
      timeline.push({
        prNumber: pr.number,
        date: pr.updatedAt,
        informationDensity: 0,
      });
    }
  }

  const latest = authorPrs[0];
  const currentEmbedding = latest
    ? await getEmbedding(latest.body)
    : new Float32Array(embeddings[0]?.length ?? 8);

  const deviation = scoreContributorPattern({
    login,
    messageLengths,
    embeddings,
    densities,
    currentMessageLength: latest?.body.length ?? messageLengths[0] ?? 0,
    currentEmbedding,
  });

  return {
    login,
    deviation,
    timeline,
  };
}
