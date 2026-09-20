import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const WIKI_DIR = resolve(process.cwd(), 'content', 'wiki')
const MANIFEST_FILE = join(WIKI_DIR, 'index.json')
const OUTPUT_FILE = join(WIKI_DIR, 'seo.json')
const SUGGEST_ENDPOINT = 'https://suggestqueries.google.com/complete/search'
const REQUEST_TIMEOUT_MS = 10_000
const REQUEST_DELAY_MS = 90

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: 'application/json',
}

const DOMAIN_TITLES = {
  bazi: '八字',
  liuyao: '六爻',
  kanyu: '风水',
  ziwei: '紫微斗数',
  qimen: '奇门遁甲',
  liuren: '大六壬',
  qizheng: '七政四余',
}

const FALLBACK_QUERIES = {
  bazi: '八字基础',
  liuyao: '六爻',
  kanyu: '风水',
  ziwei: '紫微斗数基础',
  qimen: '奇门遁甲基础',
  liuren: '大六壬',
  qizheng: '七政四余',
}

const INDEX_QUERIES = [
  '术数',
  '八字基础',
  '八字十神',
  '六爻',
  '风水',
  '紫微斗数',
  '奇门遁甲',
  '大六壬',
  '七政四余',
]

const INFORMATIONAL = /(意思|含义|什么|详解|解释|怎么看|如何|基础|入门|知识|总论|关系|方位|五行|排盘|命盘|星|格|表|图|教学|组合|藏干)/
const LOW_TOPICAL_MATCH = /(电影|电视剧|线上看|apk|软件|skill|学霸|小说|招聘|下载|英文|机场|无人机|机器人|投顾|律师事务所|医院|纪录片|六合彩|玄武岩|玄武门|玄武是什么|杜门卡逊|天相投顾|天机阁|天英星 路尼|幻想水浒|正官庄|正印科技|推拿|刮痧|拔罐|滑罐|按摩|图片|高丽参|红参|后裔|太阳系|诱电|睿芯|大模型|百厨大战|氏病|螺旋菌)/

function text(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function compact(value) {
  return text(value).replace(/\s+/g, '')
}

function normalizeConcept(value) {
  return compact(value).replace(/[（）()：:、，]/g, '')
}

function unique(values) {
  return [...new Set(values.map(value => text(value)).filter(Boolean))]
}

function titleParts(title) {
  const beforeColon = compact(title.split(/[：:]/)[0] || title)
  const beforeParenthesis = compact(beforeColon.split(/[（(]/)[0] || '')
  const coreStem = beforeParenthesis.replace(/(底层逻辑|定局法|使用说明|判定法|入门|总论|法则|逻辑|定论|精解|说明|底层)$/g, '')
  const segments = new Set([beforeColon, beforeParenthesis, coreStem])
  for (const segment of compact(title).split('与')) {
    const stem = segment.replace(/(基础|底层逻辑|定局法|使用说明|判定法|入门|总论|法则|逻辑|定论|精解|说明|底层)$/g, '')
    if (stem.length >= 2) segments.add(stem)
  }
  if (beforeParenthesis.length >= 4) segments.add(beforeParenthesis.slice(0, 2))
  return [...segments].filter(item => item.length >= 2 && item !== normalizeConcept(title))
}

function entryQueries(title, domainTitle) {
  const parts = titleParts(title)
  const queries = [
    text(title),
    `${domainTitle} ${title}`,
    `${title} ${domainTitle}`,
    ...parts.slice(0, 3),
    ...parts.slice(0, 2).flatMap(part => [`${domainTitle} ${part}`, `${part} ${domainTitle}`]),
  ]
  return unique(queries).slice(0, 9)
}

function truncateDescription(value, maxLength = 158) {
  const valueText = text(value)
  if (valueText.length <= maxLength) return valueText
  const clipped = valueText.slice(0, maxLength)
  const boundary = Math.max(clipped.lastIndexOf('。'), clipped.lastIndexOf('；'), clipped.lastIndexOf('，'))
  return boundary > maxLength * 0.65 ? clipped.slice(0, boundary + 1) : `${clipped.trimEnd()}…`
}

async function fetchSuggestions(query) {
  const response = await fetch(`${SUGGEST_ENDPOINT}?client=firefox&hl=zh-CN&gl=CN&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(query)}`, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Google suggest HTTP ${response.status}: ${query}`)
  const raw = await response.text()
  let parsed
  try {
    parsed = JSON.parse(raw)
  }
  catch {
    throw new Error(`Google suggest returned non-JSON: ${query}`)
  }
  const suggestions = Array.isArray(parsed?.[1])
    ? parsed[1].filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())
    : []
  return [...new Set(suggestions)].slice(0, 10)
}

function rankSuggestion(suggestion, title, domainTitle, parts, query) {
  const phrase = compact(suggestion)
  const concept = normalizeConcept(title)
  let score = 0
  if (phrase.includes(concept)) score += 500
  if (phrase.includes(domainTitle)) score += 260
  if (concept.length <= 2 && !phrase.includes(domainTitle)) score -= 420
  if (parts.some(part => phrase.includes(part))) score += 180
  if (INFORMATIONAL.test(phrase)) score += 100
  if (query !== title) score += 40
  if (LOW_TOPICAL_MATCH.test(phrase)) score -= 1000
  score -= Math.min(phrase.length * 4, 100)
  return score
}

function rankSuggestions(suggestions, title, domainTitle, parts, query) {
  return suggestions
    .map(suggestion => ({ suggestion, score: rankSuggestion(suggestion, title, domainTitle, parts, query) }))
    .filter(item => item.score > 100 && !LOW_TOPICAL_MATCH.test(item.suggestion))
    .sort((left, right) => right.score - left.score || left.suggestion.length - right.suggestion.length)
}

async function measureEntry(entry) {
  const domainTitle = DOMAIN_TITLES[entry.domain] || entry.categoryTitle
  const parts = titleParts(entry.title)
  const queries = entryQueries(entry.title, domainTitle)
  const queryResults = []
  const ranked = []
  const seen = new Set()

  for (const query of queries) {
    const suggestions = await fetchSuggestions(query)
    queryResults.push({ query, suggestions })
    for (const item of rankSuggestions(suggestions, entry.title, domainTitle, parts, query)) {
      const key = compact(item.suggestion)
      if (!seen.has(key)) {
        seen.add(key)
        ranked.push(item)
      }
    }
    if (ranked.length >= 3) break
  }

  ranked.sort((left, right) => right.score - left.score || left.suggestion.length - right.suggestion.length)
  let matchType = ranked[0]
    ? (compact(ranked[0].suggestion) === normalizeConcept(entry.title) ? 'exact' : 'enriched')
    : 'fallback'

  if (!ranked.length) {
    const fallbackQuery = FALLBACK_QUERIES[entry.domain] || entry.categoryTitle
    const suggestions = await fetchSuggestions(fallbackQuery)
    queryResults.push({ query: fallbackQuery, suggestions })
    const fallbackRanked = rankSuggestions(suggestions, entry.title, domainTitle, parts, fallbackQuery)
    if (fallbackRanked[0]) {
      ranked.push(...fallbackRanked.slice(0, 5))
      matchType = 'fallback'
    }
  }

  const focusKeyword = ranked[0]?.suggestion || `${entry.title}｜${domainTitle}`
  const focusCompact = compact(focusKeyword)
  const seoTitle = matchType === 'fallback'
    ? `${entry.title}｜${entry.categoryTitle}`
    : (focusCompact.includes(normalizeConcept(entry.title)) ? focusCompact : `${focusCompact}｜${entry.title}`)
  const keywords = unique([
    focusKeyword,
    ...ranked.slice(0, 4).map(item => item.suggestion),
  ]).slice(0, 5)
  const intro = text(entry.excerpt).replace(/\s+/g, ' ')

  return {
    focusKeyword,
    matchType,
    seoTitle,
    seoDescription: truncateDescription(`${entry.title}词条属${entry.categoryTitle}。${intro} 本页围绕「${focusKeyword}」整理相关概念与阅读路径。`),
    keywords,
    query: queryResults[0]?.query || entry.title,
    queries: queryResults,
    suggestions: unique(queryResults.flatMap(result => result.suggestions)).slice(0, 20),
    topCandidates: ranked.slice(0, 3).map(item => ({ keyword: item.suggestion, score: item.score })),
  }
}

function rankIndexSuggestion(suggestion, query) {
  const phrase = compact(suggestion)
  let score = 0
  if (/(八字|十神|六爻|风水|玄空|二十四山|紫微|奇门|大六壬|七政四余)/.test(phrase)) score += 320
  if (INFORMATIONAL.test(phrase)) score += 120
  if (LOW_TOPICAL_MATCH.test(phrase)) score -= 1000
  score -= Math.min(phrase.length * 4, 80)
  return query === '术数' ? score + 40 : score
}

function buildIndexSeo(queryResults) {
  const ranked = queryResults
    .flatMap(result => result.suggestions.map(suggestion => ({
      suggestion,
      score: rankIndexSuggestion(suggestion, result.query),
    })))
    .filter(item => item.score > 100 && !LOW_TOPICAL_MATCH.test(item.suggestion))
    .sort((left, right) => right.score - left.score || left.suggestion.length - right.suggestion.length)

  return {
    focusKeyword: ranked[0]?.suggestion || '术数',
    matchType: ranked[0] ? 'enriched' : 'fallback',
    seoTitle: '术数词条库_八字、紫微、奇门、六爻与六壬',
    seoDescription: '收录八字基础、十神、六爻、风水、紫微斗数、奇门遁甲、大六壬与七政四余词条，提供核心概念、排盘知识与阅读路径。',
    keywords: unique(ranked.slice(0, 12).map(item => item.suggestion)).slice(0, 12),
    suggestions: unique(queryResults.flatMap(result => result.suggestions)).slice(0, 40),
    topCandidates: ranked.slice(0, 5).map(item => ({ keyword: item.suggestion, score: item.score })),
  }
}

async function atomicWriteJson(path, value) {
  await mkdir(join(path, '..'), { recursive: true })
  const temporary = `${path}.tmp-${process.pid}`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}

const manifest = JSON.parse(await readFile(MANIFEST_FILE, 'utf8'))
if (!Array.isArray(manifest.entries) || !manifest.entries.length) {
  throw new Error('content/wiki/index.json is empty; run pnpm wiki:sync first')
}

const indexQueryResults = []
for (const query of INDEX_QUERIES) {
  indexQueryResults.push({ query, suggestions: await fetchSuggestions(query) })
  await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS))
}

const entries = {}
for (const [index, entry] of manifest.entries.entries()) {
  entries[entry.sourcePath] = await measureEntry(entry)
  if ((index + 1) % 10 === 0) console.log(`[wiki-seo] ${index + 1}/${manifest.entries.length}`)
  await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS))
}

const payload = {
  syncedAt: new Date().toISOString(),
  source: {
    name: 'Google Search Suggest',
    client: 'firefox',
    locale: 'zh-CN',
    region: 'CN',
    endpoint: SUGGEST_ENDPOINT,
  },
  index: {
    query: '术数',
    ...buildIndexSeo(indexQueryResults),
  },
  entries,
}

await atomicWriteJson(OUTPUT_FILE, payload)
const matches = Object.values(entries)
console.log(`[wiki-seo] saved ${matches.length} entries -> ${OUTPUT_FILE}`)
console.log(`[wiki-seo] exact=${matches.filter(item => item.matchType === 'exact').length}, enriched=${matches.filter(item => item.matchType === 'enriched').length}, fallback=${matches.filter(item => item.matchType === 'fallback').length}`)
