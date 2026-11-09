import { chromium } from 'playwright'

const base = process.env.MEASURE_BASE_URL ?? 'http://127.0.0.1:4173'
const timeoutMs = Number(process.env.MEASURE_TIMEOUT_MS ?? 20000)

const browser = await chromium.launch()
const context = await browser.newContext({
  locale: 'zh-CN',
  viewport: { width: 1280, height: 800 },
})

async function measureInteractive(name, path, activate, ready) {
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8,
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const start = Date.now()
  const response = await page.goto(`${base}${path}`, { waitUntil: 'commit' })
  let activatedAt
  let readyAt

  try {
    await activate(page)
    activatedAt = Date.now() - start
    await ready(page, timeoutMs)
    readyAt = Date.now() - start
    console.log(`${name}: activate=${activatedAt}ms ready=${readyAt}ms status=${response?.status()}`)
  } catch (error) {
    console.error(`${name}: FAILED after ${Date.now() - start}ms`)
    throw error
  } finally {
    await page.close()
  }
}

function waitForHydrated(page) {
  return page.waitForFunction(() => {
    const button = [...document.querySelectorAll('nav button')].find(node => (
      node.querySelector('.i-heroicons\\:moon') || node.querySelector('.i-heroicons\\:sun')
    ))
    return !!button && button.textContent !== ''
  }, { timeout: timeoutMs, polling: 16 })
}

await measureInteractive(
  'theme',
  '/',
  page => waitForHydrated(page).then(() => page.locator('nav button').filter({ has: page.locator('.i-heroicons\\:moon, .i-heroicons\\:sun') }).first().click({ timeout: timeoutMs })),
  page => page.waitForFunction(() => localStorage.getItem('luckbuff-color-mode') === 'light', { timeout: timeoutMs, polling: 16 }),
)

await measureInteractive(
  'date-picker',
  '/tools/jishi',
  async (page) => {
    await waitForHydrated(page)
    await page.locator('main button[aria-haspopup="dialog"]').first().click({ timeout: timeoutMs })
  },
  page => page.locator('button[aria-haspopup="dialog"][aria-expanded="true"]').first().waitFor({ state: 'visible', timeout: timeoutMs }),
)

await browser.close()
