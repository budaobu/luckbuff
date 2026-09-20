// 生成 app/data/page-titles.json：页面 slug → 页面 h1 标题（zh-CN）。
// 供 admin 浏览统计把 route slug 显示为可读标题。prebuild/predev 自动运行，
// 已提交进仓库，dev 时不跑也能用旧副本。
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PAGES_DIR = resolve(ROOT, 'app', 'pages')
const OUT_FILE = resolve(ROOT, 'app', 'data', 'page-titles.json')

const locale = JSON.parse(readFileSync(resolve(ROOT, 'i18n', 'locales', 'zh-CN.json'), 'utf-8'))

function lookup(key) {
  let cur = locale
  for (const part of key.split('.')) {
    if (cur == null || typeof cur !== 'object') return null
    cur = cur[part]
  }
  return typeof cur === 'string' ? cur : null
}

// 取文件中第一个 <h1> 内的第一个 t('...') / $t('...') 字面量 key
function titleFromFile(path) {
  if (!existsSync(path)) return null
  const src = readFileSync(path, 'utf-8')
  const componentTitle = src.match(/title-key="([^"]+)"/)
  if (componentTitle) {
    const title = lookup(componentTitle[1])
    if (title) return title
  }
  const h1 = src.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)
  if (!h1) return null
  const m = h1[1].match(/\$?t\(\s*'([^']+)'/) || h1[1].match(/\$?t\(\s*"([^"]+)"/)
  return m ? lookup(m[1]) : null
}

function toolPageFile(slug) {
  const flat = resolve(PAGES_DIR, 'tools', `${slug}.vue`)
  if (existsSync(flat)) return flat
  return resolve(PAGES_DIR, 'tools', slug, 'index.vue')
}

// ── 工具页：扫描 app/pages/tools/ ──
const tools = {}
for (const entry of readdirSync(resolve(PAGES_DIR, 'tools'), { withFileTypes: true })) {
  const slug = entry.name.replace(/\.vue$/, '')
  const title = titleFromFile(toolPageFile(slug))
  if (title) tools[slug] = title
}

// ── 目录已注册的工具页：覆盖 /tools 之外的嵌套路由（如 /prophet/*） ──
const categorySrc = readFileSync(resolve(ROOT, 'app', 'composables', 'useToolCategories.ts'), 'utf-8')
const toolPathAliases = {}
const directoryGroupPaths = new Set(['/chart', '/tools', '/special'])
for (const pathMatch of categorySrc.matchAll(/\bpath:\s*'([^']+)'/g)) {
  const path = pathMatch[1]
  if (directoryGroupPaths.has(path)) continue

  const slug = path.startsWith('/tools/')
    ? path.slice('/tools/'.length)
    : path.split('/').at(-1)
  if (!slug || !/^[\w-]{1,80}$/.test(slug)) continue

  const titleKeys = [...categorySrc.slice(0, pathMatch.index).matchAll(/titleKey:\s*'([^']+)'/g)]
  const title = (titleKeys.at(-1) ? lookup(titleKeys.at(-1)[1]) : null)
    || titleFromFile(toolPageFile(slug))
  if (title) tools[slug] ??= title
  if (!path.startsWith('/tools/')) toolPathAliases[slug] = path
}

// ── 观音灵签详情页：自定义动态路由，按签号作为独立统计项 ──
const guanyinLots = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'guanyin-lots-100.json'), 'utf-8'))
const guanyinTitleTemplate = lookup('guanyinLotDetail.title')
for (const lot of guanyinLots) {
  const slug = `guanyin-lot-${lot.id}`
  tools[slug] ??= guanyinTitleTemplate?.replace('{n}', String(lot.id)) || slug
  toolPathAliases[slug] = `/tools/guanyin-lots/${lot.id}`
}

// 关帝灵签详情页：同一动态路由规则，按签号作为独立统计项
const guandiLots = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'guandi-lots-100.json'), 'utf-8'))
const guandiTitleTemplate = lookup('guandiLotDetail.title')
for (const lot of guandiLots) {
  const slug = `guandi-lot-${lot.id}`
  tools[slug] ??= guandiTitleTemplate?.replace('{n}', String(lot.id)) || slug
  toolPathAliases[slug] = `/tools/guandi-lots/${lot.id}`
}

// 黄大仙灵签详情页：与观音/关帝保持同一 plural 动态路由规则
const wongTaiSinLots = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'wong-tai-sin-lots-100.json'), 'utf-8'))
const wongTaiSinTitleTemplate = lookup('wongTaiSinLotDetail.title')
for (const lot of wongTaiSinLots) {
  const slug = `wong-tai-sin-lot-${lot.id}`
  tools[slug] ??= wongTaiSinTitleTemplate?.replace('{n}', String(lot.id)) || slug
  toolPathAliases[slug] = `/tools/wong-tai-sin-lots/${lot.id}`
}

// 文殊菩萨灵签详情页：继续沿用 plural 动态路由规则。
const wenshuLots = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'wenshu-lots-100.json'), 'utf-8'))
const wenshuTitleTemplate = lookup('wenshuLotDetail.title')
for (const lot of wenshuLots) {
  const slug = `wenshu-lot-${lot.id}`
  tools[slug] ??= wenshuTitleTemplate?.replace('{n}', String(lot.id)) || slug
  toolPathAliases[slug] = `/tools/wenshu-lots/${lot.id}`
}

// 地藏王菩萨灵签详情页：继续沿用 plural 动态路由规则。
const dizangLots = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'dizang-lots-60.json'), 'utf-8'))
const dizangTitleTemplate = lookup('dizangLotDetail.title')
for (const lot of dizangLots) {
  const slug = `dizang-lot-${lot.id}`
  tools[slug] ??= dizangTitleTemplate?.replace('{n}', String(lot.id)) || slug
toolPathAliases[slug] = `/tools/dizang-lots/${lot.id}`
}

// 土地公灵签详情页：继续沿用 plural 动态路由规则。
const tudigongLots = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'tudigong-lots-32.json'), 'utf-8'))
const tudigongTitleTemplate = lookup('tudigongLotDetail.title')
for (const lot of tudigongLots) {
  const slug = `tudigong-lot-${lot.id}`
  tools[slug] ??= tudigongTitleTemplate?.replace('{n}', String(lot.id)) || slug
  toolPathAliases[slug] = `/tools/tudigong-lots/${lot.id}`
}

// 保生大帝灵签详情页：继续沿用 plural 动态路由规则。
const baoshengLots = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'baosheng-lots-60.json'), 'utf-8'))
const baoshengTitleTemplate = lookup('baoshengLotDetail.title')
for (const lot of baoshengLots) {
  const slug = `baosheng-lot-${lot.number}`
  tools[slug] ??= baoshengTitleTemplate?.replace('{n}', String(lot.number)) || slug
  toolPathAliases[slug] = `/tools/baosheng-lots/${lot.number}`
}

// ── 世界杯比赛详情页：内容文件在构建期生成，按比赛 slug 作为独立统计项 ──
const matchDir = resolve(ROOT, 'content', 'worldcup-predictions')
for (const filename of readdirSync(matchDir)) {
  if (!filename.endsWith('.md') || /\.\w{2}(-\w{2})?\.md$/.test(filename)) continue
  const src = readFileSync(resolve(matchDir, filename), 'utf-8')
  const slug = src.match(/^slug:\s*["']([^"']+)["']/m)?.[1]
  const title = src.match(/^#\s+(.+)$/m)?.[1]?.trim()
  if (!slug || !/^[\w-]{1,80}$/.test(slug)) continue
  tools[slug] ??= title || slug
  toolPathAliases[slug] = `/prophet/match/${slug}`
}

// 图解详情页：本地数据快照中的每个交互图都是独立统计路由。
const graphIndex = JSON.parse(readFileSync(resolve(ROOT, 'app', 'data', 'graph-charts.json'), 'utf-8'))
for (const chart of graphIndex.charts) {
  const slug = `graph-${chart.id}`
  tools[slug] ??= chart.title
  toolPathAliases[slug] = `/graph/${chart.id}`
}

// ── 专题页：HUB_PATHS 与 app/plugins/page-view-tracker.client.ts 保持一致 ──
const trackerSrc = readFileSync(resolve(ROOT, 'app', 'plugins', 'page-view-tracker.client.ts'), 'utf-8')
const hubBlock = trackerSrc.match(/HUB_PATHS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)
const hubPaths = hubBlock ? [...hubBlock[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : []

const hubs = { home: '首页' }
for (const path of hubPaths) {
  const slug = path.slice(1)
  const title = titleFromFile(resolve(PAGES_DIR, `${slug}.vue`))
    || titleFromFile(resolve(PAGES_DIR, slug, 'index.vue'))
  if (title) hubs[slug] = title
}

// ── 其他公共页面：与 PAGE_PATHS 保持一致，不计入工具或专题页 ──
const pagePathsBlock = trackerSrc.match(/PAGE_PATHS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)
const pagePaths = pagePathsBlock ? [...pagePathsBlock[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : []
const pages = {}
for (const path of pagePaths) {
  const slug = path.slice(1)
  const title = titleFromFile(resolve(PAGES_DIR, `${slug}.vue`))
  if (title) pages[slug] = title
}

// ── Wiki 词条详情页：同步索引生成，按词条路径作为独立统计项 ──
const wikiIndexFile = resolve(ROOT, 'content', 'wiki', 'index.json')
if (existsSync(wikiIndexFile)) {
  const wikiIndex = JSON.parse(readFileSync(wikiIndexFile, 'utf-8'))
  for (const entry of wikiIndex.entries || []) {
    if (!entry.sourcePath?.startsWith('/wiki/')) continue
    const slug = entry.sourcePath.slice('/wiki/'.length).replace(/\//g, '--')
    pages[slug] ??= entry.title || slug
  }
}

// ── 占卜提交：slug 来自 tool-submit-tracker 的 API 前缀，多数与工具页同名 ──
const submitBlock = trackerSrc && readFileSync(resolve(ROOT, 'server', 'middleware', 'tool-submit-tracker.ts'), 'utf-8')
  .match(/TOOL_API_PREFIXES\s*=\s*\[([\s\S]*?)\]/)
const submitSlugs = submitBlock
  ? [...submitBlock[1].matchAll(/'\/api\/([\w-]+)\/'/g)].map(m => m[1])
  : []

const submitAliasBlock = trackerSrc && readFileSync(resolve(ROOT, 'server', 'middleware', 'tool-submit-tracker.ts'), 'utf-8')
  .match(/TOOL_API_SLUG_ALIASES\s*=\s*\[([\s\S]*?)\]/)
const submitAliases = submitAliasBlock
  ? new Map([...submitAliasBlock[1].matchAll(/slug:\s*'([^']+)'/g)].map(m => [m[1], m[1]]))
  : new Map()

// API slug 与工具页 slug 不一致时的别名（值为 app/pages 下的相对路径）
const SUBMIT_PAGE_ALIASES = {
  vedic: 'tools/vedic-astro.vue',
  prophet: 'prophet/index.vue',
}

const submits = {}
for (const slug of [...submitSlugs, ...submitAliases.keys()]) {
  const title = tools[slug]
    || (SUBMIT_PAGE_ALIASES[slug] ? titleFromFile(resolve(PAGES_DIR, SUBMIT_PAGE_ALIASES[slug])) : null)
  if (title) submits[slug] = title
}

// 历史提交 slug 与实际页面路由不一致时，排行也要指向可打开的页面。
const SUBMIT_PAGE_PATHS = {
  vedic: '/tools/vedic-astro',
  prophet: '/prophet',
}
for (const [slug, path] of Object.entries(SUBMIT_PAGE_PATHS)) {
  if (submits[slug]) toolPathAliases[slug] = path
}

const out = { tools, hubs, pages, submits }
if (Object.keys(toolPathAliases).length) out.paths = toolPathAliases
writeFileSync(OUT_FILE, `${JSON.stringify(out, null, 2)}\n`)
console.log(`page-titles: ${Object.keys(tools).length} tools, ${Object.keys(hubs).length} hubs, ${Object.keys(pages).length} pages, ${Object.keys(submits).length} submits -> app/data/page-titles.json`)
