import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  BAZI_PAIPAN_TOPICS,
  buildBaziTopicLens,
  buildBaziChenyu,
} from '../server/utils/tools/bazi-paipan-topic-lens.ts'
import type { BaziChartResult } from '../server/utils/tools/bazi-paipan-topic-lens.ts'
import type { TodayAlmanac } from '../app/types/today-almanac.ts'

const chart = JSON.parse(
  readFileSync(new URL('../e2e/fixtures/bazi-paipan-topic-chart.json', import.meta.url), 'utf8'),
) as BaziChartResult
const date = '2026-11-11'

const almanac = {
  jiShen: ['天恩'],
  xiongSha: ['月煞'],
  luckyZodiacs: [{ zodiac: '猪', relation: '六合' }],
  positions: { yangGui: '东北', yinGui: '西南' },
} as unknown as TodayAlmanac

test('covers the six configured topics', () => {
  assert.deepEqual([...BAZI_PAIPAN_TOPICS], ['wealth', 'marriage', 'career', 'fate', 'noble', 'study'])
})

test('builds deterministic natal and today slices for a fixed chart and date', () => {
  const lenses = BAZI_PAIPAN_TOPICS.map(topic => buildBaziTopicLens({ chart, topic, date }))
  const replay = BAZI_PAIPAN_TOPICS.map(topic => buildBaziTopicLens({ chart, topic, date }))
  assert.deepEqual(lenses, replay)

  const byTopic = Object.fromEntries(lenses.map(lens => [lens.topic, lens]))
  assert.deepEqual(byTopic.wealth!.natal.map(item => [item.id, item.value]), [
    ['wealth-star', '偏财 14% / 正财 0%'],
    ['output-to-wealth', '年柱庚午 / 月柱癸未 / 时柱甲午'],
    ['peer-wealth', '劫财 20% / 比肩 0%'],
    ['wealth-store', '未见财库'],
    ['current-dayun-wealth', '丙戌 · 比肩/食神'],
  ])
  assert.equal(byTopic.marriage!.natal.find(item => item.id === 'spouse-palace')?.value, '丙子 · 胎')
  assert.equal(byTopic.career!.natal.find(item => item.id === 'month-pattern')?.value, '伤官格 · 伤官格 · 未透')
  assert.equal(byTopic.fate!.natal.find(item => item.id === 'use-gods')?.value, '用金；辅土；忌火')
  assert.deepEqual(byTopic.noble!.natal.map(item => item.value), ['天乙贵人', '天德贵人', '月德贵人'])
  assert.equal(byTopic.study!.natal.find(item => item.id === 'resource-star')?.value, '偏印 14% / 正印 3%')

  for (const lens of lenses.filter(item => item.topic !== 'fate')) {
    assert.equal(lens.today?.ganzhi, '庚寅')
    assert.equal(lens.today?.tenGod, '偏财')
  }
  assert.equal(byTopic.fate!.today, null)
})

test('uses the existing almanac engine fields for daily stars and noble hints', () => {
  const noble = buildBaziTopicLens({ chart, topic: 'noble', date, almanac })
  assert.equal(noble.todayFields.find(item => item.id === 'today-shensha')?.value, '天恩 / 月煞')
  assert.deepEqual(noble.nobleHints, ['生肖猪（六合）', '贵人方东北', '贵人方西南'])
  assert.ok(buildBaziChenyu('noble', noble).length <= 14)
})
