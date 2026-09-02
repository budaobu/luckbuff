import { recordPageView } from '~~/server/utils/page-views'

// 占卜提交统计：工具页提交按钮最终都会打到这些 API。
// /api/tools/<slug>/** 取第二段为 slug；顶层工具 API 取第一段。
// 同一 IP + slug 60 秒内只计一次，避免 calc + reading 双请求重复计数。
const TOOL_API_PREFIXES = [
  '/api/bazi-fortune-tune/',
  '/api/bazi/',
  '/api/huangdao/',
  '/api/jinri-yunshi/',
  '/api/liu-yao/',
  '/api/liunian/',
  '/api/liuren/',
  '/api/liuyao-divination/',
  '/api/prophet/',
  '/api/qimen/',
  '/api/vedic/',
  '/api/zhouyi/',
  '/api/zwds/',
]

// 同一顶层 API 下承载多个页面时，用路由前缀还原成实际工具 slug。
const TOOL_API_SLUG_ALIASES = [
  { prefix: '/api/prophet/liuyao-football', slug: 'liuyao-football' },
  { prefix: '/api/prophet/qimen-football', slug: 'qimen-football' },
  { prefix: '/api/prophet/liuren-football', slug: 'liuren-football' },
  { prefix: '/api/prophet/qimen-worldcup/', slug: 'qimen-worldcup' },
  { prefix: '/api/prophet/liuren-worldcup/', slug: 'liuren-worldcup' },
  { prefix: '/api/vedic/', slug: 'vedic-astro' },
]

const DEDUP_WINDOW_MS = 60_000
const recent = new Map<string, number>()

function toolSlugFromPath(path: string): string | null {
  const alias = TOOL_API_SLUG_ALIASES.find(item => path.startsWith(item.prefix))
  if (alias) return alias.slug
  if (path.startsWith('/api/tools/')) {
    const seg = path.slice('/api/tools/'.length).split('/')[0]
    return seg && /^[\w-]{1,80}$/.test(seg) ? seg : null
  }
  for (const prefix of TOOL_API_PREFIXES) {
    if (path.startsWith(prefix)) {
      const seg = prefix.slice('/api/'.length, -1)
      return /^[\w-]{1,80}$/.test(seg) ? seg : null
    }
  }
  return null
}

async function numericEnergySubmitSlug(event: { [key: string]: any }): Promise<string> {
  try {
    const body = await readBody<{ scenario?: string }>(event)
    const scenario = body?.scenario
    return scenario && /^[\w-]{1,40}$/.test(scenario) ? `numeric-energy-${scenario}` : 'numeric-energy'
  } catch {
    return 'numeric-energy'
  }
}

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') return
  const path = getRequestURL(event).pathname
  let slug = toolSlugFromPath(path)
  if (!slug) return
  if (slug === 'numeric-energy') slug = await numericEnergySubmitSlug(event)

  // 等响应结束再计：404/400 等无效请求不算一次占卜
  event.node.res.on('finish', () => {
    if (event.node.res.statusCode >= 400) return

    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const key = `${ip}|${slug}`
    const now = Date.now()
    const last = recent.get(key)
    if (last && now - last < DEDUP_WINDOW_MS) return

    if (recent.size > 5000) {
      for (const [k, t] of recent) {
        if (now - t >= DEDUP_WINDOW_MS) recent.delete(k)
      }
    }
    recent.set(key, now)

    try {
      recordPageView('tool-submit', slug)
    } catch {
      // 计数失败不影响占卜主流程
    }
  })
})
