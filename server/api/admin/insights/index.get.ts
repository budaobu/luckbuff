import { listInsightSlugs, readInsightSafe, INSIGHT_CATEGORIES } from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { getTranslationOverview } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const query = getQuery(event)
  const pageSize = Math.min(Math.max(Number(query.pageSize) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
  const q = (typeof query.q === 'string' ? query.q : '').trim().toLowerCase()
  const pendingLangs = new Set(
    (typeof query.pending === 'string' ? query.pending : '')
      .split(',')
      .map(s => s.trim())
      .filter((s): s is 'zh-tw' | 'en' => s === 'zh-tw' || s === 'en'),
  )

  // Admin lists every default-locale file, drafts included.
  // 翻译概览最贵（每篇额外读译文文件 + 算源文 hash），只对当前页计算；
  // 开启「未同步」筛选时不得不全量计算，才能正确过滤与分页。
  const all = listInsightSlugs()
    .map(slug => readInsightSafe(slug, 'zh-CN'))
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const overviewCache = new Map<string, ReturnType<typeof buildOverview>>()
  function buildOverview(article: (typeof all)[number]) {
    const { content: _content, ...meta } = article
    return {
      ...meta,
      translations: getTranslationOverview(article.slug, computeSourceHash(article)),
    }
  }
  function getOverview(article: (typeof all)[number]) {
    let o = overviewCache.get(article.slug)
    if (!o) {
      o = buildOverview(article)
      overviewCache.set(article.slug, o)
    }
    return o
  }

  const searched = q ? all.filter(a => a.title.toLowerCase().includes(q)) : all
  const filtered = pendingLangs.size
    ? searched.filter(a => [...pendingLangs].some(lang => getOverview(a).translations[lang].status !== 'done'))
    : searched

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(Math.max(Number(query.page) || 1, 1), totalPages)

  return {
    total: all.length,
    filteredTotal: filtered.length,
    categories: INSIGHT_CATEGORIES,
    page,
    pageSize,
    articles: filtered.slice((page - 1) * pageSize, page * pageSize).map(getOverview),
  }
})
