import { mkdir, writeFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

const evidence = 'docs/sansatemple/evidence'

test.beforeEach(async () => {
  await mkdir(evidence, { recursive: true })
})

async function openTemple(page: Page) {
  await page.goto('/tools/sansatemple')
  await expect(page.getByRole('heading', { name: '在线寺庙' })).toBeVisible()
  await expect(page.getByTestId('sansatemple-channel-1')).toBeVisible()
  await page.getByTestId('sansatemple-channel-1').click()
  await expect(page.getByTestId('sansatemple-scene')).toBeVisible()
  await expect(page.locator('.sansa-scene canvas')).toBeVisible()
  await expect(page.getByTestId('sansatemple-channel-label')).toContainText('频道 1')
}

async function walkToHall(page: Page) {
  await page.locator('.sansa-scene').click({ position: { x: 320, y: 520 } })
  for (let step = 0; step < 14; step += 1) {
    await page.keyboard.down('s')
    await page.waitForTimeout(800)
    await page.keyboard.up('s')
    if (await page.getByTestId('sansatemple-pray').isEnabled()) return
  }
  await expect(page.getByTestId('sansatemple-pray')).toBeEnabled()
}

async function walkToAltar(page: Page) {
  for (let step = 0; step < 14; step += 1) {
    await page.keyboard.down('w')
    await page.waitForTimeout(600)
    await page.keyboard.up('w')
    if (await page.getByTestId('sansatemple-incense').isEnabled()) return
  }
  await expect(page.getByTestId('sansatemple-incense')).toBeEnabled()
  console.log('altar-z', await page.locator('.sansa-stage').getAttribute('data-self-z'))
  await expect(page.getByTestId('sansatemple-incense')).toBeEnabled({ timeout: 20_000 })
}

test.describe('sansatemple full flow', () => {
  test('desktop entry, hall, actions, sound and leave', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'sansatemple-desktop', 'desktop flow only')
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await openTemple(page)
    await page.screenshot({ path: `${evidence}/desktop-path.png` })
    await walkToHall(page)

    await page.getByTestId('sansatemple-pray').click()
    await expect(page.getByText('正在拜佛')).toBeVisible()
    await page.screenshot({ path: `${evidence}/desktop-praying.png` })
    await page.getByTestId('sansatemple-pray').click()
    await expect(page.getByText('正在拜佛')).toHaveCount(0)

    await page.getByTestId('sansatemple-beads').click()
    await page.getByTestId('sansatemple-bead-ring').focus()
    for (let index = 0; index < 108; index += 1) await page.keyboard.press('ArrowRight', { delay: 2 })
    await expect(page.getByTestId('sansatemple-bead-count')).toHaveText('108/108')
    await page.locator('.sansa-bead-ring').screenshot({ path: `${evidence}/desktop-beads-108.png`, animations: 'disabled' })
    await page.getByRole('dialog', { name: '念珠' }).getByRole('button', { name: '关闭' }).click()

    await walkToAltar(page)
    await expect(page.getByTestId('sansatemple-pray')).toBeEnabled()
    await page.getByTestId('sansatemple-woodfish').click()
    await page.getByTestId('sansatemple-incense').click()
    await expect(page.getByText('香 1/3')).toBeVisible()

    await page.getByTestId('sansatemple-meditate-5').click()
    await expect(page.getByTestId('sansatemple-meditation')).toBeVisible()
    await page.screenshot({ path: `${evidence}/desktop-meditation.png` })
    await page.getByTestId('sansatemple-meditation').click()
    await expect(page.getByTestId('sansatemple-meditation')).toHaveCount(0)

    await page.getByTestId('sansatemple-menu').click()
    await expect(page.getByText('下一场：')).toBeVisible()
    await page.locator('label', { hasText: '总开关' }).locator('input').fill('0.4')
    await page.locator('label', { hasText: '环境音' }).locator('input').fill('0.3')
    await page.locator('label', { hasText: '诵经' }).locator('input').fill('0.2')
    await page.locator('label', { hasText: '音效' }).locator('input').fill('0.6')
    await page.screenshot({ path: `${evidence}/desktop-settings.png` })
    await page.getByTestId('sansatemple-leave').click()
    await expect(page.getByTestId('sansatemple-channel-1')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('mobile touch layout and action controls remain reachable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'sansatemple-mobile', 'mobile flow only')
    await openTemple(page)
    await page.screenshot({ path: `${evidence}/mobile-path.png` })
    await page.locator('.sansa-scene').click({ position: { x: 180, y: 540 } })
    for (let step = 0; step < 14; step += 1) {
      await page.keyboard.down('s')
      await page.waitForTimeout(800)
      await page.keyboard.up('s')
      if (await page.getByTestId('sansatemple-pray').isEnabled()) break
    }
    await expect(page.getByTestId('sansatemple-pray')).toBeEnabled()
    await page.getByTestId('sansatemple-pray').click()
    await expect(page.getByText('正在拜佛')).toBeVisible()
    await page.screenshot({ path: `${evidence}/mobile-praying.png` })
    await page.getByTestId('sansatemple-pray').click()
    await page.getByTestId('sansatemple-beads').click()
    await page.getByTestId('sansatemple-bead-advance').click()
    await expect(page.getByTestId('sansatemple-bead-count')).toHaveText('1/108')
    await page.locator('.sansa-bead-ring').screenshot({ path: `${evidence}/mobile-beads.png`, animations: 'disabled' })
    await page.getByRole('dialog', { name: '念珠' }).getByRole('button', { name: '关闭' }).click()
    await page.getByTestId('sansatemple-menu').click()
    await page.getByTestId('sansatemple-leave').click()
    await expect(page.getByTestId('sansatemple-channel-1')).toBeVisible()
  })
})

test('two browser contexts share a hall without chat', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'sansatemple-desktop', 'desktop multi-client only')
  const first = await browser.newContext({ viewport: { width: 1280, height: 760 }, locale: 'zh-CN' })
  const second = await browser.newContext({ viewport: { width: 1280, height: 760 }, locale: 'zh-CN' })
  const pageA = await first.newPage()
  const pageB = await second.newPage()

  await openTemple(pageA)
  await openTemple(pageB)
  await expect(pageA.getByTestId('sansatemple-channel-label')).toContainText('2')
  await expect(pageB.getByTestId('sansatemple-channel-label')).toContainText('2')

  await pageA.getByTestId('sansatemple-reverence').click()
  await expect(pageB.getByTestId('sansatemple-toast')).toContainText('向你合十')
  await expect(pageA.locator('input, textarea')).toHaveCount(0)
  await expect(pageA.getByTestId('sansatemple-experience')).not.toContainText(/聊天|表情/)
  await pageA.screenshot({ path: `${evidence}/multiplayer-hall.png` })

  const assigned = await pageA.evaluate(async () => {
    function bot(index: number) {
      return new Promise<string | null>((resolve) => {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
        const socket = new WebSocket(`${protocol}//${location.host}/sansatemple/ws`)
        const timer = window.setTimeout(() => resolve(null), 5000)
        socket.onopen = () => socket.send(JSON.stringify({ type: 'join', channel: '1' }))
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data) as { type: string; cushionId?: string }
          if (message.type === 'welcome') {
            socket.send(JSON.stringify({ type: 'state', x: index * 0.4, z: 0, rotation: 0, action: 'idle' }))
            socket.send(JSON.stringify({ type: 'pray-request' }))
          }
          if (message.type === 'cushion-assigned') {
            window.clearTimeout(timer)
            resolve(message.cushionId ?? 'unavailable')
          }
        }
        socket.onerror = () => resolve(null)
      })
    }
    return Promise.all([bot(0), bot(1)])
  })
  expect(assigned[0]).not.toBe('unavailable')
  expect(assigned[1]).not.toBe('unavailable')
  expect(assigned[0]).not.toBe(assigned[1])

  await pageA.getByTestId('sansatemple-menu').click()
  await pageA.getByTestId('sansatemple-leave').click()
  await pageB.getByTestId('sansatemple-menu').click()
  await pageB.getByTestId('sansatemple-leave').click()
  await first.close()
  await second.close()
  await new Promise(resolve => setTimeout(resolve, 300))
  const channels = await (await fetch('http://127.0.0.1:3333/api/sansatemple/channels')).json() as Array<{ id: string; count: number }>
  expect(channels.find(channel => channel.id === '1')?.count).toBe(0)
})

test('map view shows zones and travels to a landmark', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sansatemple-desktop', 'desktop map only')
  await openTemple(page)
  await page.getByTestId('sansatemple-map').click()
  await expect(page.getByTestId('sansatemple-map-view')).toBeVisible()
  await expect(page.getByTestId('sansatemple-current-zone')).toContainText('入口')
  await page.screenshot({ path: `${evidence}/map-zones.png` })
  await page.getByTestId('sansatemple-zone-workshop').click()
  await page.getByTestId('sansatemple-map').click()
  await expect(page.getByTestId('sansatemple-map-view')).toBeVisible()
  await expect(page.getByTestId('sansatemple-current-zone')).toContainText('工坊')
  await expect(page.locator('.sansa-stage')).toHaveAttribute('data-self-z', /-1[456]/)
  await page.screenshot({ path: `${evidence}/map-workshop.png` })
  await page.getByTestId('sansatemple-map-close').click()
  await page.getByTestId('sansatemple-menu').click()
  await page.getByTestId('sansatemple-leave').click()
  await expect(page.getByTestId('sansatemple-channel-1')).toBeVisible()
})

test('records renderer budgets for three quality levels', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sansatemple-desktop', 'desktop quality metrics only')
  await openTemple(page)
  const records: Array<{ quality: string; calls: number; triangles: number; textures: number }> = []
  for (const quality of ['high', 'medium', 'low']) {
    await page.getByTestId('sansatemple-menu').click()
    await page.getByRole('button', { name: quality === 'high' ? '高档' : quality === 'medium' ? '中档' : '低档' }).click()
    await page.waitForTimeout(1200)
    const info = await page.evaluate(() => (window as typeof window & { __sansatempleDiagnostics?: { quality: string; calls: number; triangles: number; textures: number } }).__sansatempleDiagnostics)
    expect(info?.quality).toBe(quality)
    records.push(info!)
    await page.screenshot({ path: `${evidence}/quality-${quality}.png` })
    await page.getByRole('button', { name: '关闭' }).click()
  }
  const budgets = { high: { calls: 275, triangles: 600_000, textures: 100 }, medium: { calls: 150, triangles: 350_000, textures: 80 }, low: { calls: 88, triangles: 150_000, textures: 50 } }
  for (const record of records) {
    const budget = budgets[record.quality as keyof typeof budgets]
    expect(record.calls).toBeLessThanOrEqual(budget.calls)
    expect(record.triangles).toBeLessThanOrEqual(budget.triangles)
  }
  await writeFile(`${evidence}/quality-metrics.json`, JSON.stringify({ measuredAt: new Date().toISOString(), records, budgets }, null, 2))
  await page.getByTestId('sansatemple-menu').click()
  await page.getByTestId('sansatemple-leave').click()
})
