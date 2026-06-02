import type { StartScanResponse, Tier1ScanResult } from '@slop-scanner/shared-types';

import { SCAN_API_BASE } from '../constants/api.js';

interface ApiErrorBody {
  readonly userMessage?: string;
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

async function errorFromResponse(
  response: Response,
  fallback: string,
): Promise<Error> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body.userMessage) {
      return new Error(body.userMessage);
    }
  } catch {
    /* non-JSON error body */
  }
  return new Error(fallback);
}

/** Start a Tier 1 repository scan. */
export async function startScan(repoUrl: string): Promise<StartScanResponse> {
  const response = await apiFetch(SCAN_API_BASE, {
    method: 'POST',
    body: JSON.stringify({ repoUrl }),
  });

  if (response.status === 401) {
    throw new Error('Unauthorized — sign in with GitHub first');
  }
  if (!response.ok) {
    throw await errorFromResponse(response, `Scan failed (${String(response.status)})`);
  }

  return (await response.json()) as StartScanResponse;
}

/** Fetch completed scan result. */
export async function fetchScanResult(scanId: string): Promise<Tier1ScanResult> {
  const response = await apiFetch(`${SCAN_API_BASE}/${scanId}`);
  if (!response.ok) {
    throw new Error(`Unable to load scan (${String(response.status)})`);
  }
  return (await response.json()) as Tier1ScanResult;
}
