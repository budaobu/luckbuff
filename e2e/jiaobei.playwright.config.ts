import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.JIAOBEI_TEST_PORT) || 3311
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: '.',
  testMatch: 'jiaobei.visual.spec.ts',
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
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    {
      name: 'jiaobei-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'jiaobei-mobile',
      use: {
        ...devices['Pixel 7'],
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: `pnpm dev --host 127.0.0.1 --port ${PORT}`,
    url: `${baseURL}/tools/jiaobei`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
