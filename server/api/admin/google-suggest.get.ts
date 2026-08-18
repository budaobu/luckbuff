import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const query = getQuery(event)
  const q = String(query.q ?? '').trim().slice(0, 120)
  if (!q) return { suggestions: [] }

  const hl = typeof query.hl === 'string' && /^[a-z]{2}(-[A-Za-z]{2,4})?$/i.test(query.hl)
    ? query.hl
    : 'zh-CN'

  try {
    // Google 返回的 content-type 是 text/html（GB2312），但 body 实为 UTF-8 JSON，
    // 按 text 取回后手动解析，避免 ofetch 按 content-type 放弃解析。
    const raw = await $fetch<string>('https://suggestqueries.google.com/complete/search', {
      query: { client: 'firefox', q, hl },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Accept': 'application/json',
      },
      responseType: 'text',
      timeout: 5000,
    })
    const res = JSON.parse(raw) as [string, string[]]
    const suggestions = Array.isArray(res) && Array.isArray(res[1])
      ? res[1].filter((s): s is string => typeof s === 'string')
      : []
    return { suggestions }
  } catch (err) {
    console.error('[google-suggest] upstream failed:', err)
    return { suggestions: [] }
  }
})
