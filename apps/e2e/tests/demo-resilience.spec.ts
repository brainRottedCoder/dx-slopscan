import { expect, test } from '@playwright/test';

import { createMockScanResult } from './fixtures/mock-results.js';
import {
  mockAuthSession,
  mockPrAnalysis,
  mockTier1ScanFlow,
  startScanFromLanding,
} from './helpers/scan-mocks.js';

const SCAN_ID = 'e2e-scan-1';
const REPO_URL = 'https://github.com/octo/demo';

test.describe('Phase 8 demo resilience', () => {
  test('monorepo shows warning banner without crashing', async ({ page }) => {
    const result = createMockScanResult(SCAN_ID, {
      repoFullName: 'vercel/next.js',
      scanWarnings: ['Scanning top 500 files — large monorepo detected.'],
    });
    await mockTier1ScanFlow(page, SCAN_ID, result);
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/large monorepo detected/i)).toBeVisible();
    await expect(page.getByText(/vercel\/next.js/i)).toBeVisible();
  });

  test('private repo shows OAuth guidance', async ({ page }) => {
    await page.route('**/api/scan', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'PRIVATE_REPO',
          error: 'Repository is private or inaccessible',
          userMessage:
            'This repository is private. Ensure you have authorized access via GitHub OAuth.',
        }),
      });
    });

    await startScanFromLanding(page, 'https://github.com/acme/private');
    await expect(page.getByText(/authorized access via GitHub OAuth/i)).toBeVisible();
  });

  test('non-English repo shows capability notice', async ({ page }) => {
    const result = createMockScanResult(SCAN_ID, {
      scanWarnings: [
        'Non-English detected (es). Embedding-only scoring active.',
      ],
    });
    await mockTier1ScanFlow(page, SCAN_ID, result);
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/Non-English detected/i)).toBeVisible();
    await expect(page.getByText(/Embedding-only scoring active/i)).toBeVisible();
  });

  test('rate limit partial results show notice', async ({ page }) => {
    const result = createMockScanResult(SCAN_ID, {
      scanWarnings: [
        'Some GitHub data could not be fetched (rate limit or API error). Partial results shown — retry after the limit resets.',
      ],
    });
    await mockTier1ScanFlow(page, SCAN_ID, result);
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/Partial results shown/i)).toBeVisible();
  });

  test('five rapid PR clicks all reach scored state', async ({ page }) => {
    const result = createMockScanResult(SCAN_ID);
    await mockTier1ScanFlow(page, SCAN_ID, result);
    await mockPrAnalysis(page, SCAN_ID);
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/octo\/demo/i)).toBeVisible();

    for (let pr = 1; pr <= 5; pr += 1) {
      await page.getByRole('button', { name: new RegExp(`#${String(pr)}`, 'i') }).click();
    }

    await expect(page.getByLabel('Score 70')).toHaveCount(5, { timeout: 15_000 });
  });

  test('SSE drop restores results from REST status', async ({ page }) => {
    const result = createMockScanResult(SCAN_ID, { repoFullName: 'octo/reconnect' });
    await mockTier1ScanFlow(page, SCAN_ID, result, 'fail');
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/octo\/reconnect/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Repository health/i)).toBeVisible();
  });

  test('ONNX missing shows embedding fallback notice', async ({ page }) => {
    const result = createMockScanResult(SCAN_ID, {
      scanWarnings: [
        'ONNX embeddings unavailable — embedding signals use a deterministic fallback; lexical and structural signals still run.',
      ],
    });
    await mockTier1ScanFlow(page, SCAN_ID, result);
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/ONNX embeddings unavailable/i)).toBeVisible();
  });

  test('empty repo shows graceful no-activity UI', async ({ page }) => {
    const result = createMockScanResult(SCAN_ID, {
      prs: [],
      scanWarnings: ['No recent activity to analyse in the preview window.'],
    });
    await mockTier1ScanFlow(page, SCAN_ID, result);
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/No recent activity/i)).toBeVisible();
    await expect(page.getByText(/No pull requests in preview window/i)).toBeVisible();
  });

  test('full demo flow has no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    const result = createMockScanResult(SCAN_ID);
    await mockAuthSession(page);
    await mockTier1ScanFlow(page, SCAN_ID, result);
    await mockPrAnalysis(page, SCAN_ID);
    await startScanFromLanding(page, REPO_URL);

    await expect(page.getByText(/Compared to OSS median/i)).toBeVisible();
    await page.getByRole('button', { name: /#1/i }).click();
    await expect(page.getByLabel('Score 70')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
