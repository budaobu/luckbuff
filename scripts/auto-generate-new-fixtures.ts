#!/usr/bin/env tsx
/**
 * Auto-detect new real-team matches from ICS updates and generate predictions.
 *
 * This script compares the latest ICS data with existing predictions.
 * When a previously placeholder match now has real team names, it triggers
 * prediction generation for that match.
 *
 * Usage:
 *   tsx scripts/auto-generate-new-fixtures.ts
 *
 * Can be run periodically (e.g. daily via cron) to auto-generate predictions
 * as knockout stage matchups are determined.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { gunzipSync } from 'node:zlib'

// ── Config ──────────────────────────────────────────────────────────
const ICS_URL = 'https://jys66.top/calendars/worldcup2026.ics'
const FIXTURES_PATH = resolve(process.cwd(), 'public', 'worldcup-2026-fixtures.json')
const PREDICTIONS_DIR = resolve(process.cwd(), 'content', 'worldcup-predictions')

// ── Simple .env loader ──────────────────────────────────────────────
function loadEnv(path: string): void {
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf-8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}
loadEnv(resolve(process.cwd(), '.env'))

// ── AI Config ───────────────────────────────────────────────────────
const AI_BASE_URL = process.env.NUXT_AI_BASE_URL || 'https://api2.gptniux.com/v1/chat/completions'
const AI_API_KEY = process.env.NUXT_AI_API_KEY || ''
const AI_MODEL = process.env.NUXT_AI_MODEL || 'claude-opus-4-6'
const AI_PROVIDER = process.env.NUXT_AI_PROVIDER || 'gptniux'
const AI_MAX_TOKENS = Math.min(parseInt(process.env.NUXT_AI_MAX_TOKENS || '8192', 10), 8192)

// ── Qimen Engine ────────────────────────────────────────────────────
const PROJECT_ROOT = resolve(process.cwd())
const CACHE_DIR = join(PROJECT_ROOT, '.cache', 'qimen-engine')
const ENGINE_PATH = join(CACHE_DIR, 'qimen_engine.py')
const SOURCE_ENGINE_PATH = join(PROJECT_ROOT, 'qimen-engine.py')
const LIUYAO_CACHE = join(PROJECT_ROOT, '.cache', 'liuyao-engine')
const LIUYAO_VENDOR = join(LIUYAO_CACHE, 'lunar_python_vendor.zip')
const VENDOR_PATH = join(CACHE_DIR, 'lunar_python_vendor.zip')
const LIUYAO_SKILL = join(PROJECT_ROOT, 'liuyao-three-coin-physical-core-SKILL-contract-v2.md')

function readBlob(text: string, tag: string): string {
  const regex = new RegExp(`<!--\\s*${tag}_BEGIN\\s*(.*?)\\s*${tag}_END\\s*-->`, 's')
  const match = text.match(regex)
  if (!match) throw new Error(`missing embedded payload: ${tag}`)
  return match[1].replace(/\s+/g, '')
}

function decodeBase64Gz(blob: string): Buffer {
  return gunzipSync(Buffer.from(blob, 'base64'))
}

function extractVendorFromSkill(): void {
  if (!existsSync(LIUYAO_SKILL)) {
    throw new Error(`liu-yao SKILL.md not found at ${LIUYAO_SKILL}`)
  }
  const skillText = readFileSync(LIUYAO_SKILL, 'utf-8')
  const vendorBlob = readBlob(skillText, 'VENDOR_B64_GZ')
  mkdirSync(LIUYAO_CACHE, { recursive: true })
  writeFileSync(LIUYAO_VENDOR, decodeBase64Gz(vendorBlob))
}

function ensureEngine(): void {
  if (existsSync(ENGINE_PATH) && existsSync(VENDOR_PATH)) return
  if (!existsSync(SOURCE_ENGINE_PATH)) {
    throw new Error(`qimen-engine.py not found at ${SOURCE_ENGINE_PATH}`)
  }
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(ENGINE_PATH, readFileSync(SOURCE_ENGINE_PATH, 'utf-8'))
  if (!existsSync(LIUYAO_VENDOR)) extractVendorFromSkill()
  writeFileSync(VENDOR_PATH, readFileSync(LIUYAO_VENDOR))
}

const VENV_PYTHON = join(PROJECT_ROOT, '.venv', 'bin', 'python')
function pythonInterpreter(): string {
  if (process.env.QIMEN_PYTHON) return process.env.QIMEN_PYTHON
  if (existsSync(VENV_PYTHON)) return VENV_PYTHON
  return 'python3'
}

interface Fixture {
  uid: string
  slug: string
  homeTeam: string
  awayTeam: string
  summary: string
  startTime: string
  venue: string
  isPlaceholder: boolean
}

async function runQimenEngineForMatch(fixture: Fixture): Promise<any> {
  ensureEngine()

  const dt = new Date(fixture.startTime)
  const venueParts = (fixture.venue || '').split(',').map(s => s.trim())
  const city = venueParts[0] || '未知'
  const country = venueParts[venueParts.length - 1] || '未知'

  const enginePayload = {
    question_type: 'other',
    question_goal: 'can_succeed',
    calendar_type: 'solar',
    time_input: {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
      hour: dt.getHours(),
      minute: dt.getMinutes(),
      second: dt.getSeconds(),
    },
    location: { country, city },
  }

  const payloadFile = join(CACHE_DIR, `auto-payload-${randomBytes(8).toString('hex')}.json`)
  const outputFile = join(CACHE_DIR, `auto-output-${randomBytes(8).toString('hex')}.json`)
  writeFileSync(payloadFile, JSON.stringify(enginePayload), 'utf-8')

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      try { require('node:fs').unlinkSync(payloadFile) } catch { /* ignore */ }
      try { require('node:fs').unlinkSync(outputFile) } catch { /* ignore */ }
    }

    const args = [ENGINE_PATH, '--input', payloadFile, '--output', outputFile]
    const child = spawn(pythonInterpreter(), args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PYTHONPATH: VENDOR_PATH },
    })

    let stderr = ''
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString() })

    child.on('close', (code: number | null) => {
      if (code !== 0) {
        cleanup()
        reject(new Error(`Engine exited ${code}: ${stderr}`))
        return
      }
      try {
        const raw = JSON.parse(readFileSync(outputFile, 'utf-8'))
        cleanup()
        resolve({ status: 'ok', ...raw })
      } catch (e) {
        cleanup()
        reject(e)
      }
    })

    child.on('error', (err) => {
      cleanup()
      reject(err)
    })
  })
}

// ── AI Prediction ───────────────────────────────────────────────────
type LocaleCode = 'zh-CN' | 'zh-TW' | 'en'

function buildSystemPrompt(locale: LocaleCode): string {
  const langNote =
    locale === 'en'
      ? 'Please output in natural English.'
      : locale === 'zh-TW'
        ? '請用繁體中文輸出。'
        : '请用简体中文输出。'

  return `你是一位精通奇门遁甲的足球比赛预测大师。

## 核心原则
- 盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读
- 将奇门遁甲的用神体系映射到足球比赛场景中
- 输出必须包含概率预测和明确的结论
- 禁止恐吓用语，保持客观理性
- ${langNote}

## 足球比赛用神映射
- 主队 = 日干（求测方），客队 = 时干（对方）
- 值符 = 主裁判 / 赛事官方力量
- 值使 = 比赛进程 / 节奏控制方
- 生门 = 进球机会 / 进攻效率
- 伤门 = 身体对抗 / 伤病风险
- 景门 = 观众氛围 / 主场优势
- 死门 = 防守稳固度
- 惊门 = 意外事件 / 争议判罚
- 开门 = 比赛开局态势

## 输出格式要求

你必须严格按照以下格式输出：

---

### 比赛信息
[主队] vs [客队]
比赛时间：[时间]
比赛地点：[场馆]

### 奇门排盘
[遁_type] · [局数]局 · [元]
值符：[星]临[宫]宫，值使：[门]临[宫]宫
旬空：[空亡信息]

### 盘面分析
[基于用神体系的简短分析，200字以内]

### 胜负概率
[主队] 胜：[x]%
平局：[y]%
[客队] 胜：[z]%

### 比分预测
最可能比分：[a]-[b]
备选比分：[c]-[d]、[e]-[f]

### 结论
[一句话总结预测结果]

---

## 概率要求
- 三方概率之和必须等于 100%
- 概率可以有小数点后一位
- 基于用神旺衰、门宫生克、空亡状态综合判断
- 不要给出过于保守的均等概率，要有倾向性

## 比分预测要求
- 基于双方进攻能力（生门、景门）与防守稳固度（死门）给出最可能比分
- 足球比赛常见比分范围 0-0 到 4-3
- 给出 1 个最可能比分 + 2 个备选比分

## 格式约束
- 严格按上述分段结构输出
- "胜负概率"段落的三行必须保持固定格式：
  "主队名 胜：xx.x%"
  "平局：xx.x%"
  "客队名 胜：xx.x%"
- 结论段落用一句话总结`
}

function buildUserPrompt(fixture: Fixture, chartJson: any): string {
  const chartForAi = JSON.parse(JSON.stringify(chartJson))
  if (chartForAi.normalized_input?.ruleset) delete chartForAi.normalized_input.ruleset

  return `请为以下世界杯比赛进行奇门遁甲预测：

## 比赛信息
- 主队：${fixture.homeTeam}
- 客队：${fixture.awayTeam}
- 比赛时间：${fixture.startTime}
- 比赛地点：${fixture.venue || '未知'}

## 奇门遁甲盘面数据（JSON）
${JSON.stringify(chartForAi, null, 2)}

请严格按照系统提示中规定的格式输出预测结果，必须包含"胜负概率"和"比分预测"段落。`
}

async function callAiPrediction(fixture: Fixture, chartJson: any, locale: LocaleCode): Promise<string> {
  const isOpenAi = AI_PROVIDER === 'openai' || AI_PROVIDER === 'newapi' || AI_PROVIDER === 'gptniux'

  const body = isOpenAi
    ? {
        model: AI_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(locale) },
          { role: 'user', content: buildUserPrompt(fixture, chartJson) },
        ],
        stream: false,
        max_tokens: AI_MAX_TOKENS,
      }
    : {
        model: AI_MODEL,
        prompt: `${buildSystemPrompt(locale)}\n\n${buildUserPrompt(fixture, chartJson)}`,
        stream: false,
        options: { num_predict: AI_MAX_TOKENS },
      }

  const res = await fetch(AI_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI API ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = await res.json()
  const content = isOpenAi
    ? json.choices?.[0]?.message?.content
    : (json.response ?? json.choices?.[0]?.message?.content)

  if (!content) {
    throw new Error('Empty AI response')
  }

  return content as string
}

// ── Markdown Output ─────────────────────────────────────────────────
function formatMatchDate(iso: string, locale: LocaleCode): string {
  const d = new Date(iso)
  const localeMap: Record<LocaleCode, string> = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'en': 'en-US',
  }
  return d.toLocaleString(localeMap[locale], {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    weekday: 'short',
  })
}

function uidToSlug(uid: string): string {
  return uid.replace(/@(worldcup-calendar|jys66\.top)$/, '')
}

function buildFrontmatter(fixture: Fixture, chart: any, index: number): string {
  const ganzhi = chart.ganzhi || {}
  const chartMeta = chart.chart || {}
  const slug = fixture.slug || uidToSlug(fixture.uid)

  return `---
uid: "${fixture.uid}"
slug: "${slug}"
index: ${index}
homeTeam: "${fixture.homeTeam}"
awayTeam: "${fixture.awayTeam}"
summary: "${fixture.summary}"
matchTime: "${fixture.startTime}"
venue: "${fixture.venue || ''}"
dunType: "${chartMeta.dun_type || ''}"
juNumber: ${chartMeta.ju_number || 0}
yuan: "${chartMeta.yuan || ''}"
zhifuStar: "${chartMeta.zhifu?.star || ''}"
zhifuPalace: ${chartMeta.zhifu?.palace || 0}
zhishiDoor: "${chartMeta.zhishi?.door || ''}"
zhishiPalace: ${chartMeta.zhishi?.palace || 0}
yearGanzhi: "${ganzhi.year || ''}"
monthGanzhi: "${ganzhi.month || ''}"
dayGanzhi: "${ganzhi.day || ''}"
timeGanzhi: "${ganzhi.time || ''}"
kongwang: "${Array.isArray(chartMeta.kongwang) ? chartMeta.kongwang.join('、') : (chartMeta.kongwang || '')}"
generatedAt: "${new Date().toISOString()}"
model: "${AI_MODEL}"
---`
}

function savePrediction(fixture: Fixture, chart: any, aiContentMap: Record<LocaleCode, string>, index: number): void {
  mkdirSync(PREDICTIONS_DIR, { recursive: true })
  const slug = fixture.slug || uidToSlug(fixture.uid)
  const frontmatter = buildFrontmatter(fixture, chart, index)

  const localeSuffixMap: Record<LocaleCode, string> = {
    'zh-CN': '',
    'zh-TW': '.zh-tw',
    'en': '.en',
  }

  for (const [locale, content] of Object.entries(aiContentMap) as [LocaleCode, string][]) {
    const suffix = localeSuffixMap[locale]
    const filePath = join(PREDICTIONS_DIR, `${slug}${suffix}.md`)

    const localeTitleMap: Record<LocaleCode, string> = {
      'zh-CN': `${fixture.homeTeam} vs ${fixture.awayTeam} 比分预测`,
      'zh-TW': `${fixture.homeTeam} vs ${fixture.awayTeam} 比分預測`,
      'en': `${fixture.homeTeam} vs ${fixture.awayTeam} Score Prediction`,
    }

    const localeMethodMap: Record<LocaleCode, string> = {
      'zh-CN': '奇门遁甲 AI 预测',
      'zh-TW': '奇門遁甲 AI 預測',
      'en': 'Qimen Dunjia AI Prediction',
    }

    const fullContent = `${frontmatter}\n\n# ${localeTitleMap[locale]}\n\n> **比赛时间**：${formatMatchDate(fixture.startTime, locale)}\n> **比赛地点**：${fixture.venue || '待定'}\n> **预测方法**：${localeMethodMap[locale]}\n\n${content}\n`

    writeFileSync(filePath, fullContent, 'utf-8')
  }
}

// ── ICS Parser ──────────────────────────────────────────────────────
function unfoldLines(raw: string): string[] {
  const lines = raw.split(/\r?\n/)
  const result: string[] = []
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      result[result.length - 1] += line.slice(1)
    } else {
      result.push(line)
    }
  }
  return result
}

function unescapeIcsText(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\;/g, ';')
    .replace(/\\,/g, ',')
    .replace(/\\\\/g, '\\')
}

function icsDateToIso(dt: string, isAllDay: boolean): string | null {
  if (isAllDay) {
    if (dt.length !== 8) return null
    return `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T00:00:00.000Z`
  }
  if (dt.length < 15) return null
  const year = dt.slice(0, 4)
  const month = dt.slice(4, 6)
  const day = dt.slice(6, 8)
  const hour = dt.slice(9, 11)
  const minute = dt.slice(11, 13)
  const second = dt.slice(13, 15)
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
}

function hasAnyEmoji(name: string): boolean {
  if (/[\u{1F1E6}-\u{1F1FF}]/u.test(name)) return true
  return /\p{Extended_Pictographic}/u.test(name)
}

function isPlaceholderTeam(name: string): boolean {
  return !hasAnyEmoji(name)
}

function stripEmojiPrefix(name: string): string {
  const firstSpace = name.indexOf(' ')
  if (firstSpace > 0) {
    const prefix = name.slice(0, firstSpace)
    if (hasAnyEmoji(prefix)) {
      return name.slice(firstSpace + 1).trimStart()
    }
  }
  return name
}

interface IcsEvent {
  uid: string
  summary: string
  dtStart: string
  dtEnd?: string
  location?: string
  description?: string
  isAllDay: boolean
}

function parseIcsEvents(raw: string): IcsEvent[] {
  const lines = unfoldLines(raw)
  const events: IcsEvent[] = []
  let current: Partial<IcsEvent> = {}
  let inEvent = false

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      current = {}
    } else if (line === 'END:VEVENT') {
      inEvent = false
      if (current.uid && current.summary && current.dtStart) {
        events.push({
          uid: current.uid,
          summary: current.summary,
          dtStart: current.dtStart,
          dtEnd: current.dtEnd,
          location: current.location,
          description: current.description,
          isAllDay: current.isAllDay ?? false,
        })
      }
      current = {}
    } else if (inEvent) {
      const idx = line.indexOf(':')
      if (idx === -1) continue

      const keyWithParams = line.slice(0, idx)
      const rawValue = line.slice(idx + 1)
      const key = keyWithParams.split(';')[0]
      const value = unescapeIcsText(rawValue)

      if (keyWithParams.includes('VALUE=DATE') || (key === 'DTSTART' && /^\d{8}$/.test(value))) {
        current.isAllDay = true
      }

      switch (key) {
        case 'UID': current.uid = value; break
        case 'SUMMARY': current.summary = value; break
        case 'DTSTART': current.dtStart = value; break
        case 'DTEND': current.dtEnd = value; break
        case 'LOCATION': current.location = value; break
        case 'DESCRIPTION': current.description = value; break
      }
    }
  }

  return events
}

interface FixturesData {
  updatedAt: string
  source: string
  total: number
  events: Fixture[]
}

function parseWorldCupIcs(raw: string): FixturesData {
  const events = parseIcsEvents(raw)

  const fixtures: Fixture[] = events
    .filter((e) => {
      if (e.isAllDay) return false
      if (!e.summary.includes(' vs ')) return false
      return true
    })
    .map((e) => {
      const parts = e.summary.split(' vs ')
      const rawHome = parts[0]?.trim() || ''
      const rawAway = parts[1]?.trim() || ''
      const isPlaceholder = isPlaceholderTeam(rawHome) || isPlaceholderTeam(rawAway)
      const homeTeam = stripEmojiPrefix(rawHome)
      const awayTeam = stripEmojiPrefix(rawAway)
      const venue = e.location || ''
      const startTime = icsDateToIso(e.dtStart, e.isAllDay)

      return {
        uid: e.uid,
        slug: uidToSlug(e.uid),
        homeTeam,
        awayTeam,
        summary: e.summary,
        startTime: startTime || '',
        endTime: e.dtEnd ? icsDateToIso(e.dtEnd, e.isAllDay) : null,
        venue,
        isPlaceholder,
      }
    })
    .filter((f) => f.startTime)

  return {
    updatedAt: new Date().toISOString(),
    source: ICS_URL,
    total: fixtures.length,
    events: fixtures,
  }
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  if (!AI_API_KEY) {
    console.error('Error: NUXT_AI_API_KEY not set')
    process.exit(1)
  }

  console.log('Fetching latest ICS...')
  let icsRaw: string
  try {
    const res = await fetch(ICS_URL, { headers: { 'User-Agent': 'LuckBuff/1.0' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    icsRaw = await res.text()
    if (!icsRaw.includes('BEGIN:VCALENDAR')) throw new Error('Invalid ICS')
  } catch (e: any) {
    console.error('Failed to fetch ICS:', e.message)
    process.exit(1)
  }

  const parsed = parseWorldCupIcs(icsRaw)
  console.log(`ICS has ${parsed.events.length} fixtures`)

  // Load existing predictions (by slug/filename)
  const existingSlugs = new Set<string>()
  if (existsSync(PREDICTIONS_DIR)) {
    const files = readdirSync(PREDICTIONS_DIR).filter(f => f.endsWith('.md'))
    for (const file of files) {
      existingSlugs.add(file.replace('.md', ''))
    }
  }
  console.log(`Existing predictions: ${existingSlugs.size}`)

  // Find matches that are NOT placeholders and DON'T have predictions yet
  const newMatches = parsed.events.filter(f =>
    !f.isPlaceholder && !existingSlugs.has(f.slug)
  )

  if (newMatches.length === 0) {
    console.log('No new real-team matches to generate. All caught up!')
    process.exit(0)
  }

  console.log(`\nFound ${newMatches.length} new matches to generate:`)
  newMatches.forEach(f => console.log(`  - ${f.homeTeam} vs ${f.awayTeam} (${f.startTime})`))
  console.log('')

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < newMatches.length; i++) {
    const fixture = newMatches[i]
    const label = `${i + 1}/${newMatches.length} ${fixture.homeTeam} vs ${fixture.awayTeam}`
    console.log(`  GENERATING: ${label}`)
    const start = Date.now()

    try {
      const chart = await runQimenEngineForMatch(fixture)
      if (chart.status !== 'ok') {
        throw new Error(`Engine error: ${chart.message}`)
      }

      // Call AI for prediction in all 3 languages
      const locales: LocaleCode[] = ['zh-CN', 'zh-TW', 'en']
      const aiContentMap: Record<LocaleCode, string> = {
        'zh-CN': '',
        'zh-TW': '',
        'en': '',
      }

      for (let li = 0; li < locales.length; li++) {
        const locale = locales[li]
        try {
          const content = await callAiPrediction(fixture, chart, locale)
          aiContentMap[locale] = content
          console.log(`    AI ${locale}: OK`)
        } catch (err: any) {
          console.error(`    AI ${locale}: FAIL — ${err?.message || err}`)
          if (locale === 'zh-CN') throw err
          aiContentMap[locale] = ''
        }

        if (li < locales.length - 1) {
          await new Promise(r => setTimeout(r, 2000))
        }
      }

      savePrediction(fixture, chart, aiContentMap, i)

      const elapsed = ((Date.now() - start) / 1000).toFixed(1)
      console.log(`  DONE (${elapsed}s): ${label}`)
      successCount++

      if (i < newMatches.length - 1) {
        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err: any) {
      console.error(`  FAIL: ${label} — ${err?.message || err}`)
      failCount++
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('')
  console.log('========================================')
  console.log(`Auto-generation complete: ${successCount} success, ${failCount} failed`)
  console.log('========================================')
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
