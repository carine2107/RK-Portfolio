import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 4313)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

/**
 * End-to-end tests.
 *
 * `npm run test:e2e` reuses a running dev server when there is one, otherwise
 * it starts `npm run dev` itself. Firefox and WebKit are enabled through
 * `E2E_ALL_BROWSERS=1` (they need `npx playwright install`).
 */
const allBrowsers = process.env.E2E_ALL_BROWSERS === '1'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'en-GB',
    timezoneId: 'Europe/Berlin',
  },
  projects: [
    // One admin sign-in shared by the tests that use the CMS (tests/e2e/admin-session.ts).
    { name: 'setup', testMatch: /admin.setup.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: false },
      dependencies: ['setup'],
    },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
          { name: 'webkit', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
        ]
      : []),
  ],
  webServer: {
    // E2E_PROD=1 runs the suite against the production build (faster and closer
    // to what visitors get); otherwise the development server is used.
    command: process.env.E2E_PROD === '1' ? 'npm run start' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
