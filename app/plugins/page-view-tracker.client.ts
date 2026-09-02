// 工具页/专题页浏览上报：全局路由监听，与文章详情页的统计口径一致
// （sessionStorage 每会话每页去重）。文章页维持 /api/insights/[slug]/view 不变。
// 从 ofetch 直接引 $fetch：Nuxt 自动导入的 typed $fetch 会把整个路由表联合类型
// 拉进实例化，路由一多就炸 TS2589；这里只是 fire-and-forget 上报，不需要路由类型
import { $fetch } from 'ofetch'
import { toolCategories } from '~/composables/useToolCategories'

const HUB_PATHS = new Set([
  '/tools',
  '/insights',
  '/astrology',
  '/fortune-telling',
  '/naming',
  '/draw-a-lot',
  '/seeking',
  '/cezi',
  '/fengshui',
  '/numeric-energy',
  '/auspicious-datetime',
  '/psychological-test',
  '/shuangren-hepan',
  '/prophet',
])
const REGISTERED_TOOL_PATHS = new Set(
  toolCategories.flatMap(category => category.tools.map(tool => tool.path)),
)

const LOCALE_PREFIX = /^\/(?:zh-CN|zh-TW|en)(?=\/|$)/

export default defineNuxtPlugin((nuxtApp) => {
  function track(path: string) {
    const clean = path.replace(LOCALE_PREFIX, '') || '/'

    let type: 'tool' | 'hub'
    let slug: string
    const toolMatch = clean.match(/^\/tools\/([\w-]+)/)
    if (toolMatch || REGISTERED_TOOL_PATHS.has(clean)) {
      type = 'tool'
      slug = toolMatch ? toolMatch[1]! : clean.slice(1).split('/')[1]!
    } else if (clean === '/') {
      // 首页计入专题页统计，slug 固定为 home
      type = 'hub'
      slug = 'home'
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
