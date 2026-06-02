import { defineConfig, devices } from '@playwright/test';

const WEB_PORT = 4173;
const WEB_HOST = '127.0.0.1';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://${WEB_HOST}:${String(WEB_PORT)}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm --filter @slop-scanner/web build && pnpm --filter @slop-scanner/web exec vite preview --host ${WEB_HOST} --port ${String(WEB_PORT)}`,
    env: {
      VITE_E2E_SKIP_BOOT: 'true',
    },
    url: `http://${WEB_HOST}:${String(WEB_PORT)}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
