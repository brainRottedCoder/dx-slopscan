import type { ContributorProfile, DocAnalysisResult, PrAnalysisResult } from '@slop-scanner/shared-types';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${String(response.status)})`);
  }

  return (await response.json()) as T;
}

export interface PrAnalysisResponse {
  readonly prNumber: number;
  readonly score: PrAnalysisResult['score'];
  readonly signals: PrAnalysisResult['score']['signals'];
  readonly analyzedAt: string;
}

export function fetchPrAnalysis(scanId: string, prNumber: number): Promise<PrAnalysisResponse> {
  return apiFetch<PrAnalysisResponse>(`/api/scan/${scanId}/analyse/pr/${String(prNumber)}`, {
    method: 'POST',
  });
}

export function fetchContributorProfile(
  scanId: string,
  login: string,
): Promise<ContributorProfile> {
  return apiFetch<ContributorProfile>(
    `/api/scan/${scanId}/analyse/contributor/${encodeURIComponent(login)}`,
    { method: 'POST' },
  );
}

export function fetchDocAnalysis(scanId: string, filePath: string): Promise<DocAnalysisResult> {
  return apiFetch<DocAnalysisResult>(`/api/scan/${scanId}/analyse/doc`, {
    method: 'POST',
    body: JSON.stringify({ filePath }),
  });
}

export function startFolderAnalysis(scanId: string, path: string): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/api/scan/${scanId}/analyse/folder`, {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}
