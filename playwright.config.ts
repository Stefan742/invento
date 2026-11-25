import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const PORT = Number(process.env.PORT || 3000)
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // local dev server compiles on first hit; one retry absorbs that
  workers: process.env.CI ? 1 : 3, // one dev server: more parallel workers make timing-based motion checks flaky
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /(screenshots|recordings)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // `pnpm screenshots`: review screenshots (390 / 820 / 1440) and motion recordings for the owner.
      name: 'screenshots',
      testMatch: /(screenshots|recordings)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
