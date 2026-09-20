// 工具页/专题页浏览上报：全局路由监听，与文章详情页的统计口径一致
// （sessionStorage 每会话每页去重）。文章页维持 /api/insights/[slug]/view 不变。
// 从 ofetch 直接引 $fetch：Nuxt 自动导入的 typed $fetch 会把整个路由表联合类型
// 拉进实例化，路由一多就炸 TS2589；这里只是 fire-and-forget 上报，不需要路由类型
import { $fetch } from 'ofetch'
import { toolCategories } from '~/composables/useToolCategories'

const HUB_PATHS = new Set([
  '/tools',
  '/chart',
  '/special',
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
  '/wiki',
])
const PAGE_PATHS = new Set([
  '/privacy',
  '/terms',
  '/settings',
])
const REGISTERED_TOOL_PATHS = new Set(
  toolCategories.flatMap(category => category.tools.map(tool => tool.path)),
)

const LOCALE_PREFIX = /^\/(?:zh-CN|zh-TW|en)(?=\/|$)/
const PROPHET_MATCH_RE = /^\/prophet\/match\/([\w-]{1,80})$/
const GUANYIN_LOT_DETAIL_RE = /^\/tools\/guanyin-lots\/(\d{1,3})$/
const GUANDI_LOT_DETAIL_RE = /^\/tools\/guandi-lots\/(\d{1,3})$/
const WONG_TAI_SIN_LOT_DETAIL_RE = /^\/tools\/wong-tai-sin-lots\/(\d{1,3})$/
const WENSHU_LOT_DETAIL_RE = /^\/tools\/wenshu-lots\/(\d{1,3})$/
const DIZANG_LOT_DETAIL_RE = /^\/tools\/dizang-lots\/(\d{1,3})$/
const TUDIGONG_LOT_DETAIL_RE = /^\/tools\/tudigong-lots\/(\d{1,3})$/
const BAOSHENG_LOT_DETAIL_RE = /^\/tools\/baosheng-lots\/(\d{1,3})$/
const WIKI_ENTRY_RE = /^\/wiki\/(.+)$/
const TOOL_ROUTE_RE = /^\/tools\/([\w-]{1,80})\/?$/

export default defineNuxtPlugin((nuxtApp) => {
  function track(path: string) {
    const clean = path.replace(LOCALE_PREFIX, '').replace(/\/+$/, '') || '/'

    let type: 'tool' | 'hub' | 'page'
    let slug: string
    const matchMatch = clean.match(PROPHET_MATCH_RE)
    const guanyinMatch = clean.match(GUANYIN_LOT_DETAIL_RE)
    const guandiMatch = clean.match(GUANDI_LOT_DETAIL_RE)
    const wongTaiSinMatch = clean.match(WONG_TAI_SIN_LOT_DETAIL_RE)
    const wenshuMatch = clean.match(WENSHU_LOT_DETAIL_RE)
    const dizangMatch = clean.match(DIZANG_LOT_DETAIL_RE)
    const tudigongMatch = clean.match(TUDIGONG_LOT_DETAIL_RE)
    const baoshengMatch = clean.match(BAOSHENG_LOT_DETAIL_RE)
    const wikiMatch = clean.match(WIKI_ENTRY_RE)
    const toolMatch = clean.match(TOOL_ROUTE_RE)
    if (matchMatch) {
      type = 'tool'
      slug = matchMatch[1]!
    } else if (guanyinMatch) {
      type = 'tool'
      slug = `guanyin-lot-${guanyinMatch[1]}`
    } else if (guandiMatch) {
      type = 'tool'
      slug = `guandi-lot-${guandiMatch[1]}`
    } else if (wongTaiSinMatch) {
      type = 'tool'
      slug = `wong-tai-sin-lot-${wongTaiSinMatch[1]}`
    } else if (wenshuMatch) {
      type = 'tool'
      slug = `wenshu-lot-${wenshuMatch[1]}`
    } else if (dizangMatch) {
      type = 'tool'
      slug = `dizang-lot-${dizangMatch[1]}`
    } else if (tudigongMatch) {
      type = 'tool'
      slug = `tudigong-lot-${tudigongMatch[1]}`
    } else if (baoshengMatch) {
      type = 'tool'
      slug = `baosheng-lot-${baoshengMatch[1]}`
    } else if (wikiMatch) {
      type = 'page'
      slug = wikiMatch[1]!.replace(/\//g, '--')
    } else if (toolMatch || REGISTERED_TOOL_PATHS.has(clean)) {
      type = 'tool'
      slug = toolMatch ? toolMatch[1]! : clean.slice(1).split('/')[1]!
    } else if (clean === '/') {
      // 首页计入专题页统计，slug 固定为 home
      type = 'hub'
      slug = 'home'
    } else if (HUB_PATHS.has(clean)) {
      type = 'hub'
      slug = clean.slice(1)
    } else if (PAGE_PATHS.has(clean)) {
      type = 'page'
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
