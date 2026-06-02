import type { Page } from '@playwright/test';
import type { Tier1ScanResult } from '@slop-scanner/shared-types';

/** Prevent /auth/me proxy errors when API is not running during preview E2E. */
export async function mockAuthSession(page: Page): Promise<void> {
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: false }),
    });
  });
}

export async function mockTier1ScanFlow(
  page: Page,
  scanId: string,
  result: Tier1ScanResult,
  streamMode: 'complete' | 'fail' = 'complete',
): Promise<void> {
  await page.route('**/api/scan', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ scanId }),
    });
  });

  await page.route(`**/api/scan/${scanId}/stream`, async (route) => {
    if (streamMode === 'fail') {
      await route.fulfill({ status: 500, body: 'stream unavailable' });
      return;
    }

    const event = {
      type: 'scan:complete',
      scanId,
      payload: result,
      timestamp: new Date().toISOString(),
    };
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: `data: ${JSON.stringify(event)}\n\n`,
    });
  });

  await page.route(`**/api/scan/${scanId}`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(result),
    });
  });
}

export async function mockPrAnalysis(page: Page, scanId: string): Promise<void> {
  await page.route(`**/api/scan/${scanId}/analyse/pr/*`, async (route) => {
    const url = route.request().url();
    const match = /\/pr\/(\d+)$/.exec(url);
    const prNumber = match ? Number(match[1]) : 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        prNumber,
        score: { total: 70, grade: 'C', signals: [], computedAt: new Date().toISOString() },
        signals: [
          {
            signal: 'lexical_overlap',
            value: 0.4,
            weight: 0.2,
            explanation: 'Overlap between description and diff symbols.',
          },
        ],
        analyzedAt: new Date().toISOString(),
      }),
    });
  });
}

export async function startScanFromLanding(page: Page, repoUrl: string): Promise<void> {
  await mockAuthSession(page);
  await page.goto('/');
  await page.getByLabel('Repository URL').fill(repoUrl);
  await page.getByRole('button', { name: /Scan repository/i }).click();
}
