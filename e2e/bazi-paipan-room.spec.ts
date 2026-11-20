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
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu'],
  },
})

async function mockRoomApis(page: Page) {
  let readingRequests = 0
  await page.route('**/api/tools/bazi-paipan/current', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 250))
    await route.fulfill({
      json: {
        date: '2026-11-11',
        hour: 10,
        pillars: [
          { key: 'year', gan: '丙', zhi: '午', ganzhi: '丙午' },
          { key: 'month', gan: '己', zhi: '亥', ganzhi: '己亥' },
          { key: 'day', gan: '庚', zhi: '寅', ganzhi: '庚寅' },
          { key: 'hour', gan: '辛', zhi: '巳', ganzhi: '辛巳' },
        ],
      },
    })
  })
  await page.route('**/api/tools/bazi-paipan/calc', route => route.fulfill({ json: calcResult }))
  await page.route('**/api/tools/bazi-paipan/lens', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')
    await route.fulfill({ json: body.topic === 'career' ? careerLens : wealthLens })
  })
  await page.route('**/api/tools/bazi-paipan/interpret', async (route) => {
    readingRequests += 1
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' },
      body: [
        'data: {"type":"chenyu","text":"小步取实，不追热闹"}',
        '',
        'data: {"type":"reading","text":"财星清楚，机会不是没有。先把今天能收尾的一件小事做完，再看热闹。"}',
        '',
        'data: [DONE]',
        '',
      ].join('\n'),
    })
  })
  return { readingRequests: () => readingRequests }
}

async function runRevealFlow(page: Page, quality: 'low' | 'high' = 'low') {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(`/tools/bazi-paipan?baziRoomE2E=1&baziRoomQuality=${quality}`)
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute(
    'data-quality',
    quality === 'low' ? 'low' : /high|mid/,
    { timeout: 15000 },
  )
  await expect(page.getByTestId('bazi-room-start')).toBeVisible()
  await page.waitForTimeout(200)

  await expect(page.getByTestId('bazi-room-topic-card')).toHaveCount(0)
  await expect(page.getByTestId('bazi-room-keeper-bubble')).toHaveCount(0)
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 }
  await page.mouse.click(56, Math.max(280, viewport.height - 220))
  await expect(page.getByTestId('bazi-room-keeper-bubble')).toContainText('点击开始按钮')
  await expect(page.getByTestId('bazi-room-current-cycles')).toHaveCount(0)
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute(
    'data-current-pillars',
    'flowYear:丙午|flowMonth:己亥|flowDay:庚寅|flowHour:辛巳',
  )
  const bootCanvasLength = await page.locator('.room-stage canvas').evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL('image/png').length)
  expect(bootCanvasLength).toBeGreaterThan(10000)

  await page.getByTestId('bazi-room-start').click()
  await expect(page.getByTestId('bazi-room-keeper-bubble')).toContainText('这次你想问什么？')
  await expect(page.getByTestId('bazi-room-topic-wealth')).toBeVisible()
  const idleCanvas = await page.locator('.room-stage canvas').evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL('image/png'))

  await page.getByTestId('bazi-room-topic-wealth').click()
  await expect(page.getByTestId('bazi-room-form-card')).toBeVisible()
  await expect(page.getByTestId('bazi-room-keeper-bubble')).toContainText('麻烦告知你的生辰')
  await page.evaluate(async () => {
    await window.__baziPaipanRoomE2E?.submit({
      gender: 'male',
      birthDate: '1990-07-10',
      birthHour: '午',
      name: '',
      formerName: '',
      birthProvince: '',
    })
  })

  await expect(page.getByTestId('bazi-room-slideshow')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('bazi-room-form-card')).toHaveCount(0)
  await expect(page.locator('.result-carousel')).toHaveCount(0)
  await expect(page.locator('.top-share')).toBeVisible()
  await expect(page.getByTestId('bazi-room-change-topic')).toContainText('再问')
  await expect(page.getByTestId('bazi-room-change-person')).toContainText('换人')
  await expect(page.getByTestId('bazi-room-open-full')).toContainText('全盘')
  await expect(page.getByTestId('bazi-room-clear-local')).toContainText('清除')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'natal')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-title', '用户八字')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-page', '1/5')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-flow', 'slideshow')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute(
    'data-model-pillars',
    'year:庚午|month:癸未|day:丙子|hour:甲午|today:庚寅',
  )
  const revealedCanvas = await page.locator('.room-stage canvas').evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL('image/png'))
  expect(revealedCanvas).not.toBe(idleCanvas)
}

declare global {
  interface Window {
    __baziPaipanRoomE2E?: {
      submit: (values: {
        gender: 'male' | 'female'
        birthDate: string
        birthHour?: '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'
        name: string
        formerName: string
        birthProvince: string
      }) => void
    }
  }
}

test('runs the guided desktop flow and result slideshow', async ({ page }) => {
  test.setTimeout(45000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const api = await mockRoomApis(page)
  await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
  await runRevealFlow(page)

  await page.keyboard.press('ArrowRight')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'topic-natal')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-title', '财运排盘结果')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-detail', /财星/)
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-detail', /比劫夺财/)
  await page.keyboard.press('j')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'topic-current')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-title', '财运当日引动')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-detail', /今日柱：庚寅/)
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-detail', /流日十神：偏财/)
  await page.keyboard.press('k')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'topic-natal')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'natal')

  await page.getByTestId('bazi-room-next-slide').click()
  await page.getByTestId('bazi-room-next-slide').click()
  await page.getByTestId('bazi-room-next-slide').click()
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'reading')
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-detail', /财星清楚|小步取实/)
  await page.getByTestId('bazi-room-next-slide').click()
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'full-chart')
  await expect(page.getByTestId('bazi-room-open-full-screen')).toBeVisible()
  await expect(page.getByTestId('bazi-room-open-full-screen')).toContainText('看完整排盘结果')

  await page.getByTestId('bazi-room-open-full-screen').click()
  for (const tab of ['chart', 'elements', 'cycles', 'relations']) {
    await page.getByTestId(`bazi-full-tab-${tab}`).click()
    await expect(page.getByTestId(`bazi-full-tab-${tab}`)).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('.modal-body [data-bpr-ai-target]').first()).toBeVisible()
  }
  await page.getByTestId('bazi-full-tab-cycles').click()
  await expect(page.getByTestId('bazi-room-today-timeline')).toContainText('庚寅')
  await expect(page.getByTestId('bazi-room-month-timeline').locator('span')).toHaveCount(12)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.getByTestId('bazi-room-change-topic').click()
  await expect(page.getByTestId('bazi-room-topic-career')).toBeVisible()
  await page.getByTestId('bazi-room-topic-career').click()
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'natal', { timeout: 15000 })
  await page.getByTestId('bazi-room-change-topic').click()
  await page.getByTestId('bazi-room-topic-wealth').click()
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'natal')
  expect(api.readingRequests()).toBe(2)

  await page.getByTestId('bazi-room-change-person').click()
  const birthCard = page.getByTestId('bazi-room-form-card')
  await expect(birthCard).toBeVisible()
  await birthCard.locator('.icon-only').click()
  await page.getByTestId('bazi-room-clear-local').click()
  await expect(page.getByTestId('bazi-room-start')).toBeVisible()
  await expect(page.getByTestId('bazi-room-topic-card')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('keeps the mobile stage and result flow usable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const api = await mockRoomApis(page)
  await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
  await runRevealFlow(page)

  await expect(page.getByTestId('bazi-room-slideshow')).toBeVisible()
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'natal')
  await expect(page.locator('.slide-number')).toContainText('1 / 5')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'output/playwright/bazi-room-mobile-flow.png', fullPage: true })
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
  await expect(page.getByTestId('bazi-room-start')).toBeVisible()
  await page.getByTestId('bazi-room-start').click()
  await page.getByTestId('bazi-room-topic-wealth').click()
  await expect(page.getByTestId('bazi-room-canvas')).toHaveAttribute('data-screen-slide', 'natal', { timeout: 15000 })
  expect(api.readingRequests()).toBe(2)
})

test.describe('visual baselines', () => {
  test('desktop first screen', async ({ page }) => {
    await mockRoomApis(page)
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
    await runRevealFlow(page, 'high')
    await page.clock.resume()
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('bazi-room-desktop.png', { maxDiffPixelRatio: 0.05, animations: 'disabled' })
  })

  test('mobile first screen', async ({ page }) => {
    await mockRoomApis(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.clock.setFixedTime(new Date('2026-11-11T10:00:00+08:00'))
    await runRevealFlow(page, 'high')
    await page.clock.resume()
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('bazi-room-mobile.png', { maxDiffPixelRatio: 0.08, animations: 'disabled' })
  })
})
