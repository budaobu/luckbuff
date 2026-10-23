import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.QIZHENG_TEST_PORT) || 3312
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: '.',
  testMatch: 'qizheng-kage.visual.spec.ts',
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
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'qizheng-kage-desktop',
      use: {
        ...devices['Desktop Chrome'],
        hasTouch: false,
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'qizheng-kage-mobile',
      use: {
        ...devices['Pixel 7'],
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: `pnpm dev --host 127.0.0.1 --port ${PORT}`,
    url: `${baseURL}/tools/qizheng-paipan`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
