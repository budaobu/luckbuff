import { expect, test, type Page } from '@playwright/test'

const guanyinResult = {
  lotType: { id: 'guanyin', name: '观音灵签', count: 100 },
  fortune: {
    number: 1,
    title: '视觉回归签',
    level: '上签',
    levelCode: 'upper',
    poem: '视觉回归签诗',
    explanation: '视觉回归签意。',
    advice: '视觉回归指引。',
  },
  question: '视觉回归验证',
}

const omikujiResult = {
  lotType: { id: 'general-omikuji', name: '日本御神签', count: 100 },
  fortune: {
    number: 1,
    rank: '大吉',
    rankCode: 'daikichi',
    title: '视觉回归',
    poem: '视觉回归和歌',
    summary: '视觉回归摘要。',
    action: '视觉回归行动。',
    luckyDirection: '东',
    symbolColor: '红',
    aspects: [{ key: 'wish', label: '愿望', text: '视觉回归愿望。' }],
  },
  question: '视觉回归验证',
}

const zhugeResult = {
  input: { chars: '山水人', question: '视觉回归验证' },
  chars: [
    { char: '山', strokes: 3, digit: 3 },
    { char: '水', strokes: 4, digit: 4 },
    { char: '人', strokes: 2, digit: 2 },
  ],
  combinedNumber: 342,
  qianNumber: 1,
  qianText: {
    number: '一',
    title: '视觉回归签',
    poem: '视觉回归签诗。',
    interpretation: '视觉回归签解。',
  },
}

async function mockReading(page: Page, path: string, text: string) {
  await page.route(path, async route => route.fulfill({
    status: 200,
    contentType: 'text/event-stream',
    body: `data: ${JSON.stringify({ type: 'text', text })}\n\ndata: [DONE]\n\n`,
  }))
}

async function completeAnimation(page: Page) {
  await expect(page.locator('.lot-shake-scene canvas')).toBeVisible()
  await page.waitForFunction(() => {
    const scene = document.querySelector('.lot-shake-scene')
    return !scene || scene.getAttribute('data-state') === 'settled'
  })
  await expect(page.locator('.lot-shake-scene')).toHaveCount(0)
}

test.describe('lot shake visual regression', () => {
  test('guanyin desktop and mobile flow remains stable', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error' && /hydration|SSR|three|cannon|GLTFLoader/i.test(message.text())) errors.push(message.text())
    })
    await page.route('**/api/tools/guanyin-lots/calc', route => route.fulfill({ json: guanyinResult }))
    await mockReading(page, '**/api/tools/guanyin-lots/reading', '## 问事指引\n\n视觉回归内容。')

    await page.goto('/tools/guanyin-lots')
    await expect(page.getByRole('heading', { name: '观音灵签' })).toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)
    await expect(page).toHaveScreenshot('01-guanyin-form.png', { fullPage: true })

    await page.locator('textarea').fill('视觉回归验证')
    await page.getByRole('button', { name: '提交', exact: true }).click()
    await completeAnimation(page)
    await expect(page.getByText('视觉回归签诗').last()).toBeVisible()
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('02-guanyin-result.png', { fullPage: true })
    expect(errors).toEqual([])
  })

  test('omikuji desktop and mobile flow remains stable', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error' && /hydration|SSR|three|cannon|GLTFLoader/i.test(message.text())) errors.push(message.text())
    })
    await page.route('**/api/tools/omikuji/calc', route => route.fulfill({ json: omikujiResult }))
    await mockReading(page, '**/api/tools/omikuji/reading', '## 问事指引\n\n视觉回归内容。')

    await page.goto('/tools/omikuji')
    await expect(page.getByRole('heading', { name: '日本御神签' })).toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)
    await expect(page).toHaveScreenshot('01-omikuji-form.png', { fullPage: true })

    await page.locator('textarea').fill('视觉回归验证')
    await page.getByRole('button', { name: '抽取御神签', exact: true }).click()
    await completeAnimation(page)
    await expect(page.getByText('视觉回归和歌').last()).toBeVisible()
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('02-omikuji-result.png', { fullPage: true })
    expect(errors).toEqual([])
  })

  test('zhuge desktop and mobile flow remains stable', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error' && /hydration|SSR|three|cannon|GLTFLoader/i.test(message.text())) errors.push(message.text())
    })
    await page.route('**/api/tools/zhuge-cezi/calc', route => route.fulfill({ json: zhugeResult }))
    await mockReading(page, '**/api/tools/zhuge-cezi/reading', '## 问事指引\n\n视觉回归内容。')

    await page.goto('/tools/zhuge-cezi')
    await expect(page.getByRole('heading', { name: '诸葛神数' })).toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)
    await expect(page).toHaveScreenshot('01-zhuge-form.png', { fullPage: true })

    await page.locator('input[maxlength="3"]').fill('山水人')
    await page.locator('textarea').fill('视觉回归验证')
    await page.getByRole('button', { name: '提交', exact: true }).click()
    await completeAnimation(page)
    await expect(page.getByText('测算结果')).toBeVisible()
    await expect(page.getByText('山水人').last()).toBeVisible()
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('02-zhuge-result.png', { fullPage: true })
    expect(errors).toEqual([])
  })
})
