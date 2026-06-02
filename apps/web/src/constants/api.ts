/** Health check path (proxied to API in dev). */
export const HEALTH_CHECK_PATH = '/health';

/** OAuth start URL. */
export const AUTH_GITHUB_PATH = '/auth/github';

/** Auth session probe. */
export const AUTH_ME_PATH = '/auth/me';

/** Tier 1 scan API base. */
export const SCAN_API_BASE = '/api/scan';

export function scanStreamPath(scanId: string): string {
  return `${SCAN_API_BASE}/${scanId}/stream`;
}

export function scanResultPath(scanId: string): string {
  return `${SCAN_API_BASE}/${scanId}`;
}

export function scanStatusPath(scanId: string): string {
  return `${SCAN_API_BASE}/${scanId}/status`;
}
