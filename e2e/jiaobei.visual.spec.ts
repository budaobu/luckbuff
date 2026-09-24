import { expect, test } from '@playwright/test'

const fortune = {
  number: 1,
  combo: '圣笑阴',
  comboNormalized: '圣阳阴',
  name: '验证卦',
  poem: '物理动画验证签',
  explanation: '视觉回归固定结果。',
  advice: '保持动画稳定。',
  level: '上签',
  levelCode: 'upper',
  story: '',
  interpretation: '',
}

test.describe('jiaobei visual regression', () => {
  test('desktop and mobile toss flow remains stable', async ({ page }) => {
    const pageErrors: string[] = []
    let calcRequestBody: Record<string, unknown> | undefined
    page.on('pageerror', error => pageErrors.push(error.message))
    page.on('console', (message) => {
      const text = message.text()
      if (message.type() === 'error' && /hydration|SSR|three|cannon|GLTFLoader/i.test(text)) {
        pageErrors.push(text)
      }
    })

    await page.route('**/api/tools/jiaobei/calc', async (route) => {
      calcRequestBody = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fortune,
          tosses: ['圣杯', '笑杯', '阴杯'],
          question: '视觉回归验证',
        }),
      })
    })

    await page.route('**/api/tools/jiaobei/reading', async (route) => {
      const events = [
        { type: 'text', text: '## 卦辞今译\n\n固定的视觉回归内容。' },
        { type: 'text', text: '\n\n## 问事指引\n\n动画结束后保持稳定。' },
      ].map(event => `data: ${JSON.stringify(event)}\n\n`)
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: `${events.join('')}data: [DONE]\n\n`,
      })
    })

    await page.goto('/tools/jiaobei')
    await expect(page.getByRole('heading', { name: '掷筊' })).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(750)
    await expect(page).toHaveScreenshot('01-form.png', { fullPage: true })

    await page.locator('textarea').fill('视觉回归验证')
    await page.getByRole('button', { name: '提交' }).click()
    await expect(page.getByRole('button', { name: '掷筊' })).toBeVisible()
    await page.getByRole('button', { name: '掷筊' }).click()

    for (let toss = 1; toss <= 3; toss += 1) {
      const canvas = page.locator('.jiaobei-scene canvas')
      await expect(canvas).toBeVisible()

      if (toss === 1) {
        await expect(page.locator('.jiaobei-scene[data-state="running"]')).toBeVisible()
        await page.waitForTimeout(500)
        await page.screenshot({
          path: `e2e-results/jiaobei-animation-${test.info().project.name}.png`,
          fullPage: true,
        })
        await expect(page.locator('.jiaobei-scene[data-state="settled"]')).toBeVisible()
        await page.screenshot({
          path: `e2e-results/jiaobei-settled-${test.info().project.name}.png`,
          fullPage: true,
        })
      }

      await expect(canvas).toHaveCount(0, { timeout: 5_000 })
      const expectedSymbols = ['圣筊', '笑筊', '阴筊']
      await expect(page.getByTestId('toss-record')).toHaveCount(toss)
      for (let index = 0; index < toss; index += 1) {
        await expect(page.getByTestId('toss-record').nth(index)).toContainText(expectedSymbols[index]!)
      }

      if (toss < 3) {
        await page.getByRole('button', { name: '掷筊' }).click()
      }
    }

    await expect(page.getByRole('heading', { name: '测算结果' })).toBeVisible()
    expect(calcRequestBody).toMatchObject({ question: '视觉回归验证' })
    expect(calcRequestBody).not.toHaveProperty('combo')
    await expect(page.getByText('固定的视觉回归内容。')).toBeVisible()
    await expect(page.getByText('动画结束后保持稳定。')).toBeVisible()
    await page.waitForTimeout(250)
    await expect(page).toHaveScreenshot('02-result.png', { fullPage: true })
    expect(pageErrors).toEqual([])
  })
})
