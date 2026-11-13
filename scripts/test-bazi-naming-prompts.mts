import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSystemPrompt, buildUserPrompt } from '../server/utils/bazi-naming/prompts.ts'
import type { BaziChart } from '../app/types/bazi.ts'

const chart = {
  year: { gan: '甲', zhi: '子' },
  month: { gan: '丙', zhi: '寅' },
  day: { gan: '戊', zhi: '辰' },
  hour: null,
  riZhu: '戊辰',
  riZhuStrength: '身弱',
  wuxingScore: { 木: 30, 火: 20, 土: 10, 金: 20, 水: 20 },
  geju: '偏印格',
  xiyong: '火、土',
  jishen: '水、金',
  dayuns: [],
  qiyunAge: 3,
  currentAge: 20,
  currentDaYun: null,
} satisfies BaziChart

const input = {
  surname: '陈',
  gender: 'female' as const,
  chart,
  locale: 'en',
  nameStyle: 'modern',
}

test('prompts request English names for the English locale', () => {
  const system = buildSystemPrompt('en')
  const user = buildUserPrompt(input, 'en')

  assert.match(system, /English given names/)
  assert.match(system, /Write all output in English\./)
  assert.ok(!/中文给定名/.test(system))
  assert.match(user, /Recommend 5-8 auspicious English given names/)
})

test('prompts request Japanese names for the Japanese locale', () => {
  const system = buildSystemPrompt('ja')
  const user = buildUserPrompt({ ...input, locale: 'ja' }, 'ja')

  assert.match(system, /日本名（名）/)
  assert.match(system, /すべて日本語で出力してください。/)
  assert.match(user, /5〜8個の縁起の良い日本名/)
})

test('supports all configured locales with localized naming traditions', () => {
  const expectations: Record<string, RegExp> = {
    'zh-CN': /中文给定名/,
    'zh-TW': /中文給定名/,
    en: /English given names/,
    ja: /日本名（名）/,
    ko: /한국어 이름\(이름\)/,
  }

  for (const [locale, pattern] of Object.entries(expectations)) {
    assert.match(buildSystemPrompt(locale), pattern)
  }
})

test('falls back to Simplified Chinese naming outside configured locales', () => {
  assert.match(buildSystemPrompt('fr'), /中文给定名/)
  assert.match(buildSystemPrompt('fr'), /请使用简体中文输出。/)
})
