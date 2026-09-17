import { test, expect, devices } from '@playwright/test'

const baseURL = process.env.LUOPAN_TEST_BASE_URL ?? 'http://127.0.0.1:3210'

test('continuing orientation samples do not block initialization', async ({ browser }) => {
  test.setTimeout(20_000)
  const context = await browser.newContext({ ...devices['Pixel 7'] })
  await context.addInitScript(() => {
    class TestDeviceOrientationEvent extends Event {}

    Object.defineProperty(window, 'DeviceOrientationEvent', {
      configurable: true,
      value: TestDeviceOrientationEvent,
    })
    Object.defineProperty(window, 'ondeviceorientationabsolute', {
      configurable: true,
      get: () => undefined,
      set: () => {},
    })
  })

  const page = await context.newPage()
  await page.bringToFront()
  await page.goto(`${baseURL}/tools/fengshui-luopan`)
  await page.getByRole('button', { name: '允许设备方向并开始' }).click()
  await page.waitForTimeout(500)

  const dispatcherId = await page.evaluate((startedAt) => {
    let heading = 0
    return setInterval(() => {
      heading = Date.now() - startedAt < 3_200 ? (heading + 20) % 360 : 0
      const event = new Event('deviceorientationabsolute')
      Object.assign(event, { alpha: heading, beta: 0, gamma: 0, absolute: true })
      window.dispatchEvent(event)
    }, 40)
  }, Date.now())

  await expect(page.locator('.flp-overlay h2')).toHaveText('正在初始化盘面', { timeout: 9_000 })
  await expect(page.locator('.flp-overlay')).toBeHidden({ timeout: 3_000 })

  for (let sample = 0; sample < 30; sample += 1) {
    await page.evaluate(() => {
      const event = new Event('deviceorientationabsolute')
      Object.assign(event, { alpha: 0, beta: 0, gamma: 0, absolute: true })
      window.dispatchEvent(event)
    })
    await page.waitForTimeout(50)
  }

  await expect(page.locator('.flp-overlay')).toBeHidden({ timeout: 100 })

  await page.evaluate(id => clearInterval(id), dispatcherId)
  await context.close()
})

test('desktop manual luopan renders the full board and accepts heading control', async ({ page }) => {
  test.setTimeout(15_000)
  await page.goto(`${baseURL}/tools/fengshui-luopan`)

  const dial = page.locator('.fengshui-dial')
  await expect(dial).toBeVisible()
  await expect(page.locator('.luopan-background')).toHaveCSS('background-color', 'rgb(12, 12, 12)')
  expect(await dial.locator('text').count()).toBeGreaterThan(240)
  await expect(dial.locator('.tianxin-cross line')).toHaveCount(2)
  await expect(page.locator('.flp-overlay')).toBeHidden()
  await expect(page.locator('.flp-manual-reading strong')).toHaveText('0°')

  await dial.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.flp-manual-reading strong')).toHaveText('358°')
  await expect(dial.locator('.dial-motion').evaluate(node => node.style.transform))
    .resolves
    .toBe('rotate(-2deg)')

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.flp-manual-reading strong')).toHaveText('2°')

  const slider = page.getByRole('slider')
  await slider.fill('45')
  await expect(page.locator('.flp-manual-reading strong')).toHaveText('45°')
  await expect(dial.locator('.dial-motion').evaluate(node => node.style.transform))
    .resolves
    .toBe('rotate(45deg)')
})
