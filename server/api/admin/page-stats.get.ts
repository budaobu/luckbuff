import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'
import { getPageViewStats, type PageViewStats } from '~~/server/utils/page-views'
// 构建期由 scripts/gen-page-titles.mjs 生成并随 server bundle 打包，
// 运行时无需访问 app/pages 源码。
import pageTitles from '~~/app/data/page-titles.json'

type Section = keyof typeof pageTitles

function withTitles(stats: PageViewStats, section: Section) {
  const titles: Record<string, string> = pageTitles[section]
  return {
    ...stats,
    top: stats.top.map(item => ({ ...item, title: titles[item.slug] })),
  }
}

// 提交 slug 多数与工具页同名（/api/tools/<slug>/ 上来的就是工具 slug），
// submits 表只覆盖了 API 前缀那几个，其余回落到 tools 表查标题。
function withSubmitTitles(stats: PageViewStats) {
  const submits: Record<string, string> = pageTitles.submits
  const tools: Record<string, string> = pageTitles.tools
  return {
    ...stats,
    top: stats.top.map(item => ({
      ...item,
      title: submits[item.slug] ?? tools[item.slug],
    })),
  }
}

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return {
    tools: withTitles(getPageViewStats('tool'), 'tools'),
    hubs: withTitles(getPageViewStats('hub'), 'hubs'),
    submits: withSubmitTitles(getPageViewStats('tool-submit')),
  }
})
