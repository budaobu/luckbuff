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

const out = { tools, hubs, submits }
if (Object.keys(toolPathAliases).length) out.paths = toolPathAliases
writeFileSync(OUT_FILE, `${JSON.stringify(out, null, 2)}\n`)
console.log(`page-titles: ${Object.keys(tools).length} tools, ${Object.keys(hubs).length} hubs, ${Object.keys(submits).length} submits -> app/data/page-titles.json`)
