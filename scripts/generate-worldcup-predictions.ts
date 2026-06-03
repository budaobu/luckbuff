#!/usr/bin/env tsx
/**
 * Batch generate qimen-based World Cup match predictions.
 * Reads fixtures from public/worldcup-2026-fixtures.json,
 * generates a qimen chart for each match, calls AI for prediction,
 * and saves results as Markdown files in content/worldcup-predictions/.
 *
 * Usage:
 *   tsx scripts/generate-worldcup-predictions.ts
 *
 * Resume from a specific index (after interruption):
 *   tsx scripts/generate-worldcup-predictions.ts --resume 42
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Simple .env loader (no dotenv dependency)
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
    // Unwrap quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}
loadEnv(resolve(process.cwd(), '.env'))

const FIXTURES_PATH = resolve(process.cwd(), 'public', 'worldcup-2026-fixtures.json')
const OUTPUT_DIR = resolve(process.cwd(), 'content', 'worldcup-predictions')

// ── Types ───────────────────────────────────────────────────────────
interface WorldCupFixture {
  uid: string
  slug?: string
  homeTeam: string
  awayTeam: string
  summary: string
  startTime: string
  venue: string
  isPlaceholder?: boolean
}

interface FixturesData {
  events: WorldCupFixture[]
}

// ── AI Config ───────────────────────────────────────────────────────
const AI_BASE_URL = process.env.NUXT_AI_BASE_URL || 'https://api2.gptniux.com/v1/chat/completions'
const AI_API_KEY = process.env.NUXT_AI_API_KEY || ''
const AI_MODEL = process.env.NUXT_AI_MODEL || 'claude-opus-4-6'
const AI_PROVIDER = process.env.NUXT_AI_PROVIDER || 'gptniux'
const AI_MAX_TOKENS = Math.min(parseInt(process.env.NUXT_AI_MAX_TOKENS || '8192', 10), 8192)

if (!AI_API_KEY) {
  console.error('Error: NUXT_AI_API_KEY not set in .env')
  process.exit(1)
}

// ── Qimen Engine (inline, same logic as server/utils/qimen.ts) ──────
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { gunzipSync } from 'node:zlib'

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

interface QimenEngineResult {
  status: 'ok' | 'fatal_error' | 'system_pause'
  message?: string
  [key: string]: any
}

async function runQimenEngineForMatch(fixture: WorldCupFixture): Promise<QimenEngineResult> {
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

  const payloadFile = join(CACHE_DIR, `batch-payload-${randomBytes(8).toString('hex')}.json`)
  const outputFile = join(CACHE_DIR, `batch-output-${randomBytes(8).toString('hex')}.json`)
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
  if (locale === 'en') {
    return `You are a Qimen Dunjia master specializing in football match predictions.

## Core Principles
- Chart data has been deterministically computed; do NOT recalculate. Interpret directly from the provided JSON.
- Map Qimen Dunjia spiritual references to football match scenarios.
- Output MUST include probability predictions and a clear conclusion.
- No fear-mongering; remain objective and rational.
- Write EVERYTHING in English. NO Chinese characters anywhere.

## Spirit Mapping for Football
- Home team = Day Stem (seeker), Away team = Hour Stem (opponent)
- Zhi Fu = Main referee / official tournament power
- Zhi Shi = Match flow / rhythm controller
- Sheng Men = Goal-scoring opportunities / offensive efficiency
- Shang Men = Physical confrontation / injury risk
- Jing Men = Crowd atmosphere / home advantage
- Si Men = Defensive solidity
- Jing Men (alternate) = Unexpected events / controversial decisions
- Kai Men = Opening match momentum

## Required Output Format

You MUST strictly follow this format:

---

### Match Info
[Home] vs [Away]
Match Time: [time]
Venue: [stadium]

### Qimen Chart
[Dun type] · [Ju number] Ju · [Yuan]
Zhi Fu: [Star] at Palace [Palace], Zhi Shi: [Door] at Palace [Palace]
Xun Kong: [Empty info]

### Chart Analysis
[Short analysis based on spirit system, under 200 words]

### Win Probability
[Home] Win: [x]%
Draw: [y]%
[Away] Win: [z]%

### Score Prediction
Most likely score: [a]-[b]
Alternative scores: [c]-[d], [e]-[f]

### Conclusion
[One-sentence summary]

---

## Probability Rules
- Three probabilities must sum to exactly 100%
- One decimal place allowed
- Based on spirit strength, palace interactions, and empty states
- Do NOT give overly conservative equal odds; show bias

## Score Rules
- Based on offensive ability (Sheng Men, Jing Men) and defensive solidity (Si Men)
- Common football scores range from 0-0 to 4-3
- Give 1 most likely score + 2 alternatives

## Format Constraints
- Strictly follow the section structure above
- "Win Probability" section must keep fixed format:
  "[Home team name] Win: xx.x%"
  "Draw: xx.x%"
  "[Away team name] Win: xx.x%"
- Conclusion: one sentence only`
  }

  if (locale === 'zh-TW') {
    return `你是一位精通奇門遁甲的足球比賽預測大師。

## 核心原則
- 盤面數據已由確定性腳本計算完成，請不要重新推算，直接基於提供的 JSON 做解讀
- 將奇門遁甲的用神體系映射到足球比賽場景中
- 輸出必須包含概率預測和明確的結論
- 禁止恐嚇用語，保持客觀理性
- 請全部使用繁體中文輸出，不可混用簡體字

## 足球比賽用神映射
- 主隊 = 日干（求測方），客隊 = 時干（對方）
- 值符 = 主裁判 / 賽事官方力量
- 值使 = 比賽進程 / 節奏控制方
- 生門 = 進球機會 / 進攻效率
- 傷門 = 身體對抗 / 傷病風險
- 景門 = 觀眾氛圍 / 主場優勢
- 死門 = 防守穩固度
- 驚門 = 意外事件 / 爭議判罰
- 開門 = 比賽開局態勢

## 輸出格式要求

你必須嚴格按照以下格式輸出：

---

### 比賽資訊
[主隊] vs [客隊]
比賽時間：[時間]
比賽地點：[場館]

### 奇門排盤
[遁_type] · [局數]局 · [元]
值符：[星]臨[宮]宮，值使：[門]臨[宮]宮
旬空：[空亡資訊]

### 盤面分析
[基於用神體系的簡短分析，200字以內]

### 勝負概率
[主隊] 勝：[x]%
平局：[y]%
[客隊] 勝：[z]%

### 比分預測
最可能比分：[a]-[b]
備選比分：[c]-[d]、[e]-[f]

### 結論
[一句話總結預測結果]

---

## 概率要求
- 三方概率之和必須等於 100%
- 概率可以有小數點後一位
- 基於用神旺衰、門宮生剋、空亡狀態綜合判斷
- 不要給出過於保守的均等概率，要有傾向性

## 比分預測要求
- 基於雙方進攻能力（生門、景門）與防守穩固度（死門）給出最可能比分
- 足球比賽常見比分範圍 0-0 到 4-3
- 給出 1 個最可能比分 + 2 個備選比分

## 格式約束
- 嚴格按上述分段結構輸出
- "勝負概率"段落的三行必須保持固定格式：
  "主隊名 勝：xx.x%"
  "平局：xx.x%"
  "客隊名 勝：xx.x%"
- 結論段落用一句話總結`
  }

  // zh-CN default
  return `你是一位精通奇门遁甲的足球比赛预测大师。

## 核心原则
- 盘面数据已由确定性脚本计算完成，请不要重新推算，直接基于提供的 JSON 做解读
- 将奇门遁甲的用神体系映射到足球比赛场景中
- 输出必须包含概率预测和明确的结论
- 禁止恐吓用语，保持客观理性
- 请用简体中文输出。

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

function buildUserPrompt(fixture: WorldCupFixture, chartJson: any, locale: LocaleCode): string {
  const chartForAi = JSON.parse(JSON.stringify(chartJson))
  if (chartForAi.normalized_input?.ruleset) delete chartForAi.normalized_input.ruleset

  if (locale === 'en') {
    return `Predict the following World Cup match using Qimen Dunjia:

Match Data:
- Home: ${fixture.homeTeam}
- Away: ${fixture.awayTeam}
- Match Time: ${fixture.startTime}
- Venue: ${fixture.venue || 'TBD'}

Qimen Dunjia Chart Data (JSON):
${JSON.stringify(chartForAi, null, 2)}

Strictly follow the output format specified in the system prompt. Must include "Win Probability" and "Score Prediction" sections.`
  }

  if (locale === 'zh-TW') {
    return `請為以下世界盃比賽進行奇門遁甲預測：

比賽資料：
- 主隊：${fixture.homeTeam}
- 客隊：${fixture.awayTeam}
- 比賽時間：${fixture.startTime}
- 比賽地點：${fixture.venue || '待定'}

奇門遁甲盤面數據（JSON）：
${JSON.stringify(chartForAi, null, 2)}

請嚴格按照系統提示中規定的格式輸出預測結果，必須包含「勝負概率」和「比分預測」段落。`
  }

  return `请为以下世界杯比赛进行奇门遁甲预测：

比赛资料：
- 主队：${fixture.homeTeam}
- 客队：${fixture.awayTeam}
- 比赛时间：${fixture.startTime}
- 比赛地点：${fixture.venue || '待定'}

奇门遁甲盘面数据（JSON）：
${JSON.stringify(chartForAi, null, 2)}

请严格按照系统提示中规定的格式输出预测结果，必须包含"胜负概率"和"比分预测"段落。`
}

async function callAiPrediction(fixture: WorldCupFixture, chartJson: any, locale: LocaleCode): Promise<string> {
  const isOpenAi = AI_PROVIDER === 'openai' || AI_PROVIDER === 'newapi' || AI_PROVIDER === 'gptniux'

  const body = isOpenAi
    ? {
        model: AI_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(locale) },
          { role: 'user', content: buildUserPrompt(fixture, chartJson, locale) },
        ],
        stream: false,
        max_tokens: AI_MAX_TOKENS,
      }
    : {
        model: AI_MODEL,
        prompt: `${buildSystemPrompt(locale)}\n\n${buildUserPrompt(fixture, chartJson, locale)}`,
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

function buildFrontmatter(fixture: WorldCupFixture, chart: any, index: number): string {
  const ganzhi = chart.ganzhi || {}
  const chartMeta = chart.chart || {}
  const slug = fixture.slug || uidToSlug(fixture.uid)

  const calendar = chart.calendar || {}
  const jieqiObj = calendar.jieqi
  const jieqiName = typeof jieqiObj === 'string' ? jieqiObj : (jieqiObj?.active_jie || '')

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
xunshou: "${chartMeta.xunshou || ''}"
hiddenYi: "${chartMeta.hidden_yi || ''}"
jieqi: "${jieqiName}"
yearGanzhi: "${ganzhi.year || ''}"
monthGanzhi: "${ganzhi.month || ''}"
dayGanzhi: "${ganzhi.day || ''}"
timeGanzhi: "${ganzhi.time || ''}"
kongwang: "${Array.isArray(chartMeta.kongwang) ? chartMeta.kongwang.join('、') : (chartMeta.kongwang || '')}"
generatedAt: "${new Date().toISOString()}"
model: "${AI_MODEL}"
---`
}

function savePrediction(fixture: WorldCupFixture, chart: any, aiContentMap: Record<LocaleCode, string>, index: number): void {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const slug = fixture.slug || uidToSlug(fixture.uid)
  const frontmatter = buildFrontmatter(fixture, chart, index)

  const localeSuffixMap: Record<LocaleCode, string> = {
    'zh-CN': '',
    'zh-TW': '.zh-tw',
    'en': '.en',
  }

  for (const [locale, content] of Object.entries(aiContentMap) as [LocaleCode, string][]) {
    const suffix = localeSuffixMap[locale]
    const filePath = join(OUTPUT_DIR, `${slug}${suffix}.md`)

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

    const localeLabelMap: Record<LocaleCode, { time: string; venue: string; method: string; venueFallback: string }> = {
      'zh-CN': { time: '比赛时间', venue: '比赛地点', method: '预测方法', venueFallback: '待定' },
      'zh-TW': { time: '比賽時間', venue: '比賽地點', method: '預測方法', venueFallback: '待定' },
      'en': { time: 'Match Time', venue: 'Venue', method: 'Method', venueFallback: 'TBD' },
    }

    const labels = localeLabelMap[locale]
    const fullContent = `${frontmatter}\n\n# ${localeTitleMap[locale]}\n\n> **${labels.time}**：${formatMatchDate(fixture.startTime, locale)}\n> **${labels.venue}**：${fixture.venue || labels.venueFallback}\n> **${labels.method}**：${localeMethodMap[locale]}\n\n${content}\n`

    writeFileSync(filePath, fullContent, 'utf-8')
  }
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const resumeIdx = args.includes('--resume')
    ? parseInt(args[args.indexOf('--resume') + 1], 10)
    : 0
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1], 10)
    : Infinity

  const fixturesData: FixturesData = JSON.parse(readFileSync(FIXTURES_PATH, 'utf-8'))
  const fixtures = fixturesData.events.slice(resumeIdx, resumeIdx + limit)

  console.log(`Found ${fixturesData.events.length} fixtures. Limit: ${limit}. Starting generation from index ${resumeIdx}...`)
  console.log(`Output directory: ${OUTPUT_DIR}`)
  console.log(`AI Model: ${AI_MODEL}`)
  console.log('')

  mkdirSync(OUTPUT_DIR, { recursive: true })

  let successCount = 0
  let failCount = 0
  let skipPlaceholder = 0

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = fixtures[i]
    const label = `${String(i + 1).padStart(3, '0')}/${fixtures.length} ${fixture.homeTeam} vs ${fixture.awayTeam}`

    // Skip placeholder matches (knockout stage with unresolved team names)
    if (fixture.isPlaceholder) {
      console.log(`  SKIP (placeholder): ${label}`)
      skipPlaceholder++
      continue
    }

    // Skip if all language files already generated (unless --resume passed)
    const slug = fixture.slug || uidToSlug(fixture.uid)
    const hasZh = existsSync(join(OUTPUT_DIR, `${slug}.md`))
    const hasTw = existsSync(join(OUTPUT_DIR, `${slug}.zh-tw.md`))
    const hasEn = existsSync(join(OUTPUT_DIR, `${slug}.en.md`))
    if (hasZh && hasTw && hasEn && !args.includes('--resume')) {
      console.log(`  SKIP (all langs exist): ${label}`)
      successCount++
      continue
    }

    console.log(`  GENERATING: ${label}`)
    const start = Date.now()

    try {
      // Step 1: Generate qimen chart (once per match)
      const chart = await runQimenEngineForMatch(fixture)
      if (chart.status !== 'ok') {
        throw new Error(`Engine error: ${chart.message}`)
      }

      // Step 2: Call AI for prediction — skip languages that already exist
      const localeSuffixMap: Record<LocaleCode, string> = {
        'zh-CN': '',
        'zh-TW': '.zh-tw',
        'en': '.en',
      }
      const locales: LocaleCode[] = ['zh-CN', 'zh-TW', 'en']
      const aiContentMap: Record<LocaleCode, string> = {
        'zh-CN': '',
        'zh-TW': '',
        'en': '',
      }

      for (let li = 0; li < locales.length; li++) {
        const locale = locales[li]
        const existingLangFile = join(OUTPUT_DIR, `${slug}${localeSuffixMap[locale]}.md`)

        if (existsSync(existingLangFile)) {
          // Re-use existing content (skip API call)
          const existingRaw = readFileSync(existingLangFile, 'utf-8')
          const fmEnd = existingRaw.indexOf('\n---\n')
          aiContentMap[locale] = fmEnd > 0 ? existingRaw.slice(fmEnd + 5).trim() : existingRaw
          console.log(`    AI ${locale}: REUSE existing file`)
          continue
        }

        try {
          const content = await callAiPrediction(fixture, chart, locale)
          aiContentMap[locale] = content
          console.log(`    AI ${locale}: OK`)
        } catch (err: any) {
          console.error(`    AI ${locale}: FAIL — ${err?.message || err}`)
          // If Chinese fails, abort this match entirely
          if (locale === 'zh-CN') throw err
          // For other languages, continue with empty content
          aiContentMap[locale] = ''
        }

        // Rate limiting between language calls
        if (li < locales.length - 1) {
          await new Promise(r => setTimeout(r, 2000))
        }
      }

      // Step 3: Save as markdown files (one per language)
      savePrediction(fixture, chart, aiContentMap, i)

      const elapsed = ((Date.now() - start) / 1000).toFixed(1)
      console.log(`  DONE (${elapsed}s): ${label}`)
      successCount++

      // Rate limiting between matches
      if (i < fixtures.length - 1) {
        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err: any) {
      console.error(`  FAIL: ${label} — ${err?.message || err}`)
      failCount++
      // Continue with next match on failure
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('')
  console.log('========================================')
  console.log(`Generation complete: ${successCount} success, ${failCount} failed, ${skipPlaceholder} placeholders skipped`)
  console.log(`Output: ${OUTPUT_DIR}`)
  console.log('========================================')
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
