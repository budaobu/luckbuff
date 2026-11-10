import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.SANSATEMPLE_TEST_PORT) || 3333
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: '.',
  testMatch: 'sansatemple.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL,
    headless: true,
    locale: 'zh-CN',
    timezoneId: 'Asia/Singapore',
    video: 'off',
    trace: 'retain-on-failure',
  },
  timeout: 180_000,
  expect: {
    timeout: 20_000,
  },
  projects: [
    {
      name: 'sansatemple-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 760 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'sansatemple-mobile',
      use: {
        ...devices['Pixel 7'],
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: `NODE_OPTIONS='--no-deprecation --max-old-space-size=6144' pnpm exec nuxt dev --host 127.0.0.1 --port ${PORT}`,
    url: `${baseURL}/tools/sansatemple`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
