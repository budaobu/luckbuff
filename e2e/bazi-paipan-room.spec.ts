import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const fixtureRoot = resolve(new URL('.', import.meta.url).pathname, 'fixtures')
const calcResult = JSON.parse(readFileSync(resolve(fixtureRoot, 'bazi-paipan-calc.json'), 'utf8'))
const wealthLens = JSON.parse(readFileSync(resolve(fixtureRoot, 'bazi-paipan-lens-wealth.json'), 'utf8'))
const careerLens = JSON.parse(readFileSync(resolve(fixtureRoot, 'bazi-paipan-lens-career.json'), 'utf8'))

test.use({
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:3069',
  reducedMotion: 'no-preference',
  launchOptions: {
    args: [
      '--use-gl=swiftshader',
      '--enable-unsafe-swiftshader',
      '--disable-gpu',
    ],
  },
})

async function mockRoomApis(page: Page) {
  let readingRequests = 0
  await page.route('**/api/tools/bazi-paipan/calc', route => route.fulfill({ json: calcResult }))
  await page.route('**/api/tools/bazi-paipan/lens', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')
    await route.fulfill({ json: body.topic === 'career' ? careerLens : wealthLens })
  })
  await page.route('**/api/tools/bazi-paipan/interpret', async (route) => {
    readingRequests += 1
    const requestBody = JSON.parse(route.request().postData() ?? '{}')
    if (requestBody.mode === 'target') {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
        body: [
          'data: {"type":"text","text":"这段结构显示：先稳住主轴，再处理可迁移的细节。"}',
          '',
          'data: [DONE]',
          '',
        ].join('\n'),
      })
      return
    }
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
      body: [
        'data: {"type":"chenyu","text":"小步取实，不追热闹"}',
        '',
        'data: {"type":"reading","text":"财星清楚，机会不是没有。先把今天能收尾的一件小事做完，再看热闹。"}',
        '',
        'data: [DONE]',
        '',
        '',
      ].join('\n'),
    })
  })
  return {
    readingRequests: () => readingRequests,
  }
}

async function runRevealFlow(page: Page, quality: 'low' | 'high' = 'low') {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(`/tools/bazi-paipan?baziRoomE2E=1&baziRoomQuality=${quality}`)
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-quality', quality === 'low' ? 'low' : /high|mid/, { timeout: 15000 })
  const topicCard = page.getByTestId('bazi-room-topic-card')
  await expect(topicCard).toBeVisible()
  await expect(page.getByTestId('bazi-room-change-topic')).toBeVisible()
  await expect(page.getByTestId('bazi-room-change-topic')).toContainText('问什么')
  await topicCard.getByTestId('bazi-room-topic-wealth').click()
  await expect(page.getByTestId('bazi-room-form-card')).toBeVisible()
  await expect(topicCard).toHaveCount(0)
  const idleCanvas = await page.locator('.room-stage canvas').evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL('image/png'))

  const formCard = page.getByTestId('bazi-room-form-card')
  const dateButton = formCard.locator('button[aria-haspopup="dialog"]').first()
  await dateButton.click()
  const calendarLayer = page.locator('[data-reka-popper-content-wrapper], [data-radix-popper-content-wrapper]').last()
  await expect(calendarLayer).toBeVisible()
  await expect.poll(() => calendarLayer.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
    return Boolean(hit && (hit === node || node.contains(hit)))
  })).toBe(true)

  const calendar = page.getByTestId('app-calendar')
  const yearSelect = page.getByTestId('calendar-year-select')
  await yearSelect.selectOption('1990')
  await expect(yearSelect).toContainText('1990')

  const monthSelect = page.getByTestId('calendar-month-select')
  await monthSelect.selectOption('7')
  await expect(monthSelect).toContainText('七月')
  await expect(calendar).toContainText('1990年7月')
  await calendar.getByRole('button', { name: /1990年7月10日/ }).click()
  await expect(dateButton).toContainText('1990年7月10日')
  await page.keyboard.press('Escape')

  const hourSelect = formCard.getByRole('combobox')
  await hourSelect.click()
  await page.getByRole('option', { name: /午/ }).click()
  await expect(hourSelect).toContainText('午')
  await page.getByRole('button', { name: '揭示今日盘面' }).click()
  await expect(page.getByTestId('bazi-room-chenyu')).toContainText('小步取实')
  await expect(page.getByTestId('bazi-room-user-info-card')).toBeVisible()
  await expect(page.getByTestId('bazi-room-form-card')).toHaveCount(0)
  await expect(page.locator('.info-rail')).toBeVisible()
  await expect(page.getByTestId('bazi-room-change-topic')).toContainText('再问')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute(
    'data-model-pillars',
    'year:庚午|month:癸未|day:丙子|hour:甲午|today:庚寅',
  )
  await expect(page.getByTestId('bazi-room-natal-slice').first()).toContainText('财星')
  await expect(page.getByTestId('bazi-room-today-slice').first()).toContainText('庚寅')
  await expect(page.getByTestId('bazi-room-reading')).toContainText('财星清楚')
  const revealedCanvas = await page.locator('.room-stage canvas').evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL('image/png'))
  expect(revealedCanvas).not.toBe(idleCanvas)
  await page.clock.runFor(1000)
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-state', 'revealed')
}

test('runs the frozen Bazi room flow on desktop', async ({ page }) => {
  test.setTimeout(45000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const api = await mockRoomApis(page)
  await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
  await runRevealFlow(page)

  const canvasData = await page.locator('.room-stage canvas').evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL('image/png').length)
  expect(canvasData).toBeGreaterThan(10000)
  await expect(page.locator('h1')).toHaveText('八字排盘')
  await expect(page.locator('body')).not.toContainText('隐士')

  await page.getByTestId('bazi-room-open-full').click()
  for (const tab of ['chart', 'elements', 'cycles', 'relations']) {
    await page.getByTestId(`bazi-full-tab-${tab}`).click()
    await expect(page.getByTestId(`bazi-full-tab-${tab}`)).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('.modal-body [data-bpr-ai-target]').first()).toBeVisible()
  }
  await page.getByTestId('bazi-full-tab-cycles').click()
  await expect(page.getByTestId('bazi-room-today-timeline')).toContainText('庚寅')
  await expect(page.getByTestId('bazi-room-month-timeline').locator('span')).toHaveCount(12)
  await expect(page.getByTestId('bazi-room-month-timeline').locator('.current')).toContainText('11月')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.getByTestId('bazi-room-change-topic').click()
  const changedTopicCard = page.getByTestId('bazi-room-topic-card')
  await expect(changedTopicCard).toBeVisible()
  await expect(changedTopicCard.getByTestId('bazi-room-topic-career')).toBeVisible()
  await changedTopicCard.getByRole('button').first().click()
  await expect(changedTopicCard).toHaveCount(0)

  const canvasBox = await page.getByTestId('bazi-room-canvas').boundingBox()
  expect(canvasBox).not.toBeNull()
  await page.mouse.click(canvasBox!.x + canvasBox!.width * 0.72, canvasBox!.y + canvasBox!.height * 0.76)
  const visitorCard = page.getByTestId('bazi-room-user-card')
  await expect(visitorCard).toBeVisible()
  await expect(visitorCard).toContainText('1990-07-10')
  await expect(visitorCard).toContainText('午')
  await expect(visitorCard).toContainText('男')
  await visitorCard.getByRole('button').first().click()
  await expect(visitorCard).toHaveCount(0)

  await page.getByTestId('bazi-room-change-topic').click()
  await page.getByTestId('bazi-room-topic-career').click()
  await expect(page.getByRole('heading', { level: 2, name: '今日事业' })).toBeVisible()
  expect(api.readingRequests()).toBe(2)

  await page.getByTestId('bazi-room-change-topic').click()
  await page.getByTestId('bazi-room-topic-wealth').click()
  await expect(page.getByTestId('bazi-room-chenyu')).toContainText('小步取实')
  expect(api.readingRequests()).toBe(2)

  await page.getByRole('button', { name: '生成海报' }).first().click()
  await expect(page.getByRole('heading', { name: '分享结果' })).toBeVisible()
  await page.locator('.fixed.inset-0').last().locator('button').first().click()

  await expect(page.getByTestId('bazi-room-deep-link')).toHaveAttribute('href', '/tools/bazi-wealth')
  await page.getByTestId('bazi-room-clear-local').click()
  await expect(page.getByTestId('bazi-room-user-info-card')).toHaveCount(0)
  await expect(page.locator('.info-rail')).toHaveCount(0)
  await expect(page.getByTestId('bazi-room-topic-card')).toBeVisible()
  await expect(page.getByTestId('bazi-room-change-topic')).toContainText('问什么')
  expect(errors).toEqual([])
})

test('keeps the mobile stage and result flow usable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const api = await mockRoomApis(page)
  await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
  await runRevealFlow(page)

  await expect(page.getByTestId('bazi-room-open-full')).toBeVisible()
  await page.getByTestId('bazi-room-open-full').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByTestId('bazi-full-tab-elements').click()
  await expect(page.getByTestId('bazi-full-tab-elements')).toHaveAttribute('aria-selected', 'true')
  await page.screenshot({ path: 'output/playwright/bazi-room-mobile-full-elements.png', fullPage: true })
  await page.keyboard.press('Escape')
  expect(api.readingRequests()).toBeGreaterThanOrEqual(1)
})

test('invalidates the Bazi reading cache on the next date', async ({ page }) => {
  const api = await mockRoomApis(page)
  await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
  await runRevealFlow(page)
  expect(api.readingRequests()).toBe(1)

  await page.clock.setFixedTime(new Date('2026-11-12T10:00:00+08:00'))
  await page.reload()
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-quality', 'low', { timeout: 15000 })
  await expect(page.getByTestId('bazi-room-chenyu')).toContainText('小步取实')
  expect(api.readingRequests()).toBe(2)

  await page.getByTestId('bazi-room-change-topic').click()
  await page.getByTestId('bazi-room-topic-wealth').click()
  await expect(page.getByTestId('bazi-room-chenyu')).toContainText('小步取实')
  expect(api.readingRequests()).toBe(3)
})

test.describe('visual baselines', () => {
  test('desktop first screen', async ({ page }) => {
    await mockRoomApis(page)
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
    await runRevealFlow(page, 'high')
    await page.clock.resume()
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('bazi-room-desktop.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    })
  })

  test('mobile first screen', async ({ page }) => {
    await mockRoomApis(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
    await runRevealFlow(page, 'high')
    await page.clock.resume()
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('bazi-room-mobile.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
    })
  })
})
