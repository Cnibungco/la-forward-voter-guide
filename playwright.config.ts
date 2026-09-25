import {defineConfig, devices} from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`

/**
 * Axe scans against a running Next app. `npm run test:a11y` starts `next
 * dev` when nothing is already listening; set PLAYWRIGHT_BASE_URL to point
 * at an existing server instead (and skip the webServer block).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'off',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npx next dev --port ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
