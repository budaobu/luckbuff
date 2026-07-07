import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const PREDICTIONS_DIR = resolve(process.cwd(), 'content', 'worldcup-predictions')
const FIXTURES_PATH = resolve(process.cwd(), 'public', 'worldcup-2026-fixtures.json')

interface FixtureMeta {
  slug: string
  startTime: string
  endTime: string
  venue: string
}

let fixturesCache: FixtureMeta[] | null = null
function getFixtures(): FixtureMeta[] | null {
  if (fixturesCache) return fixturesCache
  try {
    const raw = readFileSync(FIXTURES_PATH, 'utf-8')
    const data = JSON.parse(raw)
    fixturesCache = (data.events || []).map((e: any) => ({
      slug: e.slug,
      startTime: e.startTime,
      endTime: e.endTime,
      venue: e.venue,
    }))
  } catch {
    fixturesCache = []
  }
  return fixturesCache
}

interface PredictionDetail {
  uid: string
  index: number
  homeTeam: string
  awayTeam: string
  summary: string
  matchTime: string
  endTime: string
  venue: string
  dunType: string
  juNumber: number
  yuan: string
  zhifuStar: string
  zhifuPalace: number
  zhishiDoor: string
  zhishiPalace: number
  xunshou: string
  hiddenYi: string
  jieqi: string
  yearGanzhi: string
  monthGanzhi: string
  dayGanzhi: string
  timeGanzhi: string
  kongwang: string
  generatedAt: string
  model: string
  content: string
}

function parseFrontmatter(raw: string): { meta: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }

  const lines = match[1]!.split('\n')
  const meta: Record<string, any> = {}
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (/^-?\d+$/.test(value)) {
      meta[key] = parseInt(value, 10)
    } else {
      meta[key] = value
    }
  }

  return { meta, content: match[2]!.trim() }
}

function resolveLangSuffix(lang: string): string {
  if (lang === 'en') return 'en'
  if (lang === 'zh-TW') return 'zh-tw'
  return ''
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const query = getQuery(event)
  const lang = String(query.lang || 'zh-CN')
  const langSuffix = resolveLangSuffix(lang)

  // Try language-specific file first, then fall back to default
  const fileName = langSuffix ? `${slug}.${langSuffix}.md` : `${slug}.md`
  let filePath = join(PREDICTIONS_DIR, fileName)

  if (!existsSync(filePath)) {
    // Fall back to default Chinese version
    filePath = join(PREDICTIONS_DIR, `${slug}.md`)
    if (!existsSync(filePath)) {
      throw createError({ statusCode: 404, statusMessage: 'Prediction not found' })
    }
  }

  const raw = readFileSync(filePath, 'utf-8')
  const { meta, content } = parseFrontmatter(raw)

  const fixtures = getFixtures()
  const fixture = fixtures?.find(f => f.slug === slug)

  return {
    uid: meta.uid || '',
    slug,
    index: meta.index ?? 0,
    homeTeam: meta.homeTeam || '',
    awayTeam: meta.awayTeam || '',
    summary: meta.summary || '',
    matchTime: meta.matchTime || '',
    endTime: fixture?.endTime || '',
    venue: meta.venue || '',
    dunType: meta.dunType || '',
    juNumber: meta.juNumber ?? 0,
    yuan: meta.yuan || '',
    zhifuStar: meta.zhifuStar || '',
    zhifuPalace: meta.zhifuPalace ?? 0,
    zhishiDoor: meta.zhishiDoor || '',
    zhishiPalace: meta.zhishiPalace ?? 0,
    xunshou: meta.xunshou || '',
    hiddenYi: meta.hiddenYi || '',
    jieqi: meta.jieqi || '',
    yearGanzhi: meta.yearGanzhi || '',
    monthGanzhi: meta.monthGanzhi || '',
    dayGanzhi: meta.dayGanzhi || '',
    timeGanzhi: meta.timeGanzhi || '',
    kongwang: meta.kongwang || '',
    generatedAt: meta.generatedAt || '',
    model: meta.model || '',
    content,
  } as PredictionDetail
})
