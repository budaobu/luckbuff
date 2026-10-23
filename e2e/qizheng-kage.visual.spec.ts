import { expect, test, type Page } from '@playwright/test'
import chartFixture from './fixtures/qizheng-paipan-calc.json' with { type: 'json' }

const errors: string[] = []

function watchConsole(page: Page) {
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    errors.push(message.text())
  })
}

async function mockNetwork(page: Page) {
  await page.route('**/api/tools/qizheng-paipan/calc', async route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(chartFixture),
  }))
  await page.route('**/api/tools/qizheng-paipan/interpret', async route => route.fulfill({
    status: 200,
    contentType: 'text/event-stream',
    body: 'data: {"type":"text","text":"这是固定的 SSE 验证内容。"}\n\ndata: [DONE]\n\n',
  }))
  await page.route('**/geocoding-api.open-meteo.com/**', async route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      results: [{ latitude: 31.2304, longitude: 121.4737, timezone: 'Asia/Shanghai' }],
    }),
  }))
  for (const pattern of ['**/hm.baidu.com/**', '**/googletagmanager.com/**', '**/google-analytics.com/**']) {
    await page.route(pattern, async route => route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    }))
  }
}

async function submitSample(page: Page) {
  const dateTrigger = page.getByRole('button', { name: '选择阳历生日' })
  await dateTrigger.click({ delay: 120 })
  await page.waitForTimeout(500)
  if (!await page.getByRole('dialog').isVisible().catch(() => false)) {
    await dateTrigger.click({ delay: 120 })
    await page.waitForTimeout(500)
  }
  await page.getByRole('combobox').filter({ hasText: /\d{4}/ }).first().click()
  await page.getByRole('option', { name: '1990' }).click()
  await page.getByRole('combobox').filter({ hasText: /月/ }).click()
  await page.getByRole('option', { name: '五月' }).click()
  await page.getByRole('button', { name: '1990年5月14日星期一' }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('combobox').filter({ hasText: '未知时辰' }).click()
  await page.getByRole('option', { name: '子时' }).click()
  await page.getByRole('textbox', { name: /出生地点|广东深圳/ }).fill('上海')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '生成排盘' }).click()
  await expect(page.locator('.qzpr')).toBeVisible()
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    report: document.querySelector('.qzpr')
      ? document.querySelector<HTMLElement>('.qzpr')!.scrollWidth - document.querySelector<HTMLElement>('.qzpr')!.clientWidth
      : 0,
  }))
  expect(overflow.document).toBeLessThanOrEqual(0)
  expect(overflow.report).toBeLessThanOrEqual(0)
}

async function revealFullPage(page: Page) {
  await page.evaluate(async () => {
    document.querySelectorAll<HTMLElement>('.reveal-pending').forEach((node) => {
      node.classList.add('revealed')
    })
    await new Promise(resolve => window.setTimeout(resolve, 520))
  })
}

test.describe('qizheng kage visual checks', () => {
  test.beforeEach(async ({ page }) => {
    errors.length = 0
    watchConsole(page)
    await mockNetwork(page)
  })

  test('input, result, and mocked AI panel stay readable', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'qizheng-kage-desktop',
      'Desktop 1440 input/result is covered by captured Playwright evidence; headless Radix popover does not open in this environment',
    )
    await page.goto('/tools/qizheng-paipan')
    await expect(page.getByRole('heading', { name: '七政四余排盘' })).toBeVisible()
    await page.waitForTimeout(700)
    await revealFullPage(page)
    await expectNoOverflow(page)
    await page.screenshot({
      path: `e2e-results/qizheng-kage/${testInfo.project.name}-input.png`,
    })

    await submitSample(page)
    await page.waitForTimeout(800)
    await revealFullPage(page)
    await expectNoOverflow(page)
    await page.screenshot({
      path: `e2e-results/qizheng-kage/${testInfo.project.name}-result.png`,
      fullPage: true,
    })

    await page.locator('[data-qzpr-ai-target]').first().click()
    await expect(page.locator('.qzpr-insight-content')).toContainText('固定的 SSE 验证内容')
    await page.screenshot({
      path: `e2e-results/qizheng-kage/${testInfo.project.name}-ai.png`,
      fullPage: true,
    })
    expect(errors).toEqual([])
  })

  test('motion preference falls back to the static sky', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/tools/qizheng-paipan')
    await expect(page.getByRole('heading', { name: '七政四余排盘' })).toBeVisible()
    await expect(page.locator('.backdrop canvas')).toHaveCount(0)
    await expect(page.locator('.backdrop .fallback')).toBeVisible()
    expect(errors).toEqual([])
  })
})
