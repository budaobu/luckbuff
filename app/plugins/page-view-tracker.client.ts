// 工具页/专题页浏览上报：全局路由监听，与文章详情页的统计口径一致
// （sessionStorage 每会话每页去重）。文章页维持 /api/insights/[slug]/view 不变。
const HUB_PATHS = new Set([
  '/tools',
  '/insights',
  '/fortune-telling',
  '/naming',
  '/draw-a-lot',
  '/seeking',
  '/cezi',
  '/fengshui',
  '/auspicious-datetime',
  '/psychological-test',
  '/shuangren-hepan',
])

const LOCALE_PREFIX = /^\/(?:zh-CN|zh-TW|en)(?=\/|$)/

export default defineNuxtPlugin((nuxtApp) => {
  function track(path: string) {
    const clean = path.replace(LOCALE_PREFIX, '') || '/'

    let type: 'tool' | 'hub'
    let slug: string
    const toolMatch = clean.match(/^\/tools\/([\w-]+)/)
    if (toolMatch) {
      type = 'tool'
      slug = toolMatch[1]!
    } else if (HUB_PATHS.has(clean)) {
      type = 'hub'
      slug = clean.slice(1)
    } else {
      return
    }

    try {
      const key = `pv:${type}:${slug}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch { /* storage 不可用则照常计数 */ }

    $fetch('/api/track/page-view', {
      method: 'POST',
      body: { type, slug },
    }).catch(() => { /* 计数失败不影响浏览 */ })
  }

  nuxtApp.hook('app:mounted', () => track(useRoute().path))
  useRouter().afterEach((to) => track(to.path))
})
