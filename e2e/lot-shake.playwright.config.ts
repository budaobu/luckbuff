import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.LOT_TEST_PORT) || 3313
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: '.',
  testMatch: 'lot-shake.visual.spec.ts',
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
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    {
      name: 'lot-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'lot-mobile',
      use: {
        ...devices['Pixel 7'],
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: `pnpm dev --host 127.0.0.1 --port ${PORT}`,
    url: `${baseURL}/tools/guanyin-lots`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
