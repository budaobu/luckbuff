<template>
  <div class="relative overflow-x-clip">
    <!-- 氛围背景光晕（overflow-hidden 会破坏 sticky，用 overflow-x-clip 只裁横向） -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl lg:max-w-6xl mx-auto px-6 py-12">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-[var(--text-muted)] hover:text-[var(--text-body)]"
          :to="localePath('/insights')"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          </template>
          {{ $t('insights.backToList') }}
        </UButton>
      </div>

      <!-- 加载中 -->
      <div v-if="pending" class="max-w-2xl mx-auto space-y-4">
        <USkeleton class="h-10 w-3/4 rounded-xl mx-auto" />
        <USkeleton class="h-5 w-1/3 rounded-xl mx-auto" />
        <USkeleton v-for="i in 5" :key="i" class="h-24 rounded-xl" />
      </div>

      <!-- 错误/文章不存在 -->
      <div v-else-if="error || !article" class="max-w-2xl mx-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
        <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 text-[var(--text-faint)] mx-auto mb-4" />
        <h1 class="text-lg font-semibold text-[var(--text-primary)] mb-2">{{ $t('insights.notFoundTitle') }}</h1>
        <p class="text-sm text-[var(--text-muted)] mb-6">{{ $t('insights.notFoundDesc') }}</p>
        <UButton color="warning" variant="soft" :to="localePath('/insights')">
          <template #leading>
            <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
          </template>
          {{ $t('insights.backToList') }}
        </UButton>
      </div>

      <!-- 文章头（只占正文列，侧栏从下一行开始与正文卡片对齐）+ 正文 + 侧栏 -->
      <div v-else class="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-10 xl:gap-x-12">
        <header class="text-center mb-10 lg:col-start-1">
          <div class="inline-flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent)]" />
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase">{{ $t('insights.badge') }}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif leading-snug">
            {{ article.title }}
          </h1>
          <div class="flex items-center justify-center gap-4 mt-4 flex-wrap text-xs text-[var(--text-faint)]">
            <span
              v-if="article.category"
              class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent)]"
            >
              {{ categoryLabel(article.category) }}
            </span>
            <span v-if="article.publishedAt" class="flex items-center gap-1">
              <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5" />
              {{ formatDate(article.publishedAt) }}
            </span>
            <span v-if="article.author" class="flex items-center gap-1">
              <UIcon name="i-heroicons-user" class="w-3.5 h-3.5" />
              {{ article.author }}
            </span>
            <span v-if="article.readingTime" class="flex items-center gap-1">
              <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
              {{ $t('insights.readingTime', { n: article.readingTime }) }}
            </span>
            <span v-if="viewCount !== null" class="flex items-center gap-1">
              <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
              {{ $t('insights.views', { n: viewCount }) }}
            </span>
          </div>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-6" />
        </header>

        <!-- 正文列（xl 起右侧留白给目录 rail） -->
        <div class="relative min-w-0 xl:pr-14 lg:col-start-1 lg:row-start-2">
          <article>

            <!-- 移动端/平板目录（<lg 显示，rail 在 xl 才出现） -->
            <details
              v-if="tocLinks.length"
              ref="mobileTocEl"
              class="lg:hidden mb-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]"
            >
              <summary class="cursor-pointer select-none list-none flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[var(--text-primary)]">
                <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-[var(--accent)]" />
                {{ $t('insights.tocTitle') }}
              </summary>
              <nav class="px-5 pb-4 flex flex-col border-t border-[var(--border-subtle)]">
                <button
                  v-for="link in tocLinks"
                  :key="link.id"
                  type="button"
                  class="text-left text-[13px] py-2 leading-snug transition-colors"
                  :class="link.id === activeHeadingId ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'"
                  @click="navigateToHeading(link.id, true)"
                >
                  {{ link.text }}
                </button>
              </nav>
            </details>

            <!-- 正文 -->
            <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
              <div
                ref="contentEl"
                class="text-sm text-[var(--text-body)] leading-relaxed insight-content max-w-none"
                v-html="renderedContent"
              />
            </div>

            <!-- 标签 -->
            <div v-if="article.tags.length" class="flex items-center gap-2 mt-6 flex-wrap">
              <UIcon name="i-heroicons-tag" class="w-4 h-4 text-[var(--text-faint)]" />
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-faint)]"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 免责声明 -->
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mt-6">
              <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
                {{ $t('insights.disclaimer') }}
              </p>
            </div>

            <!-- 底部导航 -->
            <div class="flex gap-3 justify-center mt-8 flex-wrap">
              <UButton color="warning" variant="soft" :to="localePath('/insights')">
                <template #leading>
                  <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
                </template>
                {{ $t('insights.backToList') }}
              </UButton>
            </div>
          </article>

          <!-- 目录 tick rail：xl 起嵌在正文列右侧 padding 里 -->
          <InsightsTocRail
            v-if="tocLinks.length"
            :links="tocLinks"
            :active-id="activeHeadingId"
            @navigate="navigateToHeading"
          />
        </div>

        <!-- 侧栏：lg 起右栏（与正文卡片同行），更小屏沉到正文之后 -->
        <aside class="mt-10 lg:mt-0 lg:col-start-2 lg:row-start-2">
          <div class="lg:sticky lg:top-24">
            <InsightsArticleSidebar :tools="sidebarTools" :related="relatedArticles" />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { InsightToolCard, InsightRelatedArticle } from '~/components/insights/ArticleSidebar.vue'
import type { InsightTocLink } from '~/components/insights/TocRail.vue'

interface InsightDetail {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  author: string
  readingTime: number
  relatedTools: string[]
  content: string
  views: number
}

interface InsightListItem {
  slug: string
  title: string
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
}

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => route.params.slug as string)

const { data: article, pending, error } = await useAsyncData(
  () => `insight-${slug.value}-${locale.value}`,
  () => $fetch<InsightDetail>(`/api/insights/${slug.value}?lang=${locale.value}`),
  { server: true, watch: [locale] }
)

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  try {
    return marked.parse(article.value.content, { async: false }) as string
  } catch {
    return article.value.content
  }
})

// ── 浏览次数：SSR 展示接口返回的累计值，客户端挂载后上报一次并刷新 ──
const viewCount = ref<number | null>(article.value?.views ?? null)

watch(article, (a) => {
  viewCount.value = a?.views ?? null
})

// ── 目录：从渲染后的正文提取 h2（文章一级标题），挂 id 供跳转 ──
const contentEl = ref<HTMLElement | null>(null)
const mobileTocEl = ref<HTMLDetailsElement | null>(null)
const tocLinks = ref<InsightTocLink[]>([])
const activeHeadingId = ref<string | null>(null)
let headingEls: HTMLElement[] = []
let spyRaf = 0

function buildToc() {
  if (!contentEl.value) return
  headingEls = Array.from(contentEl.value.querySelectorAll('h2'))
  tocLinks.value = headingEls
    .map((el, i) => {
      if (!el.id) el.id = `sec-${i}`
      return { id: el.id, text: el.textContent?.trim() || '' }
    })
    .filter(link => link.text)
  if (!tocLinks.value.length) activeHeadingId.value = null
  updateActiveHeading()
}

// rAF 节流 scroll-spy：取与视口中心点距离最近的 heading
function updateActiveHeading() {
  if (!headingEls.length) return
  const center = window.innerHeight / 2
  let bestId: string | null = null
  let bestDist = Infinity
  for (const el of headingEls) {
    const dist = Math.abs(el.getBoundingClientRect().top - center)
    if (dist < bestDist) {
      bestDist = dist
      bestId = el.id
    }
  }
  if (bestId && bestId !== activeHeadingId.value) {
    activeHeadingId.value = bestId
  }
}

function onSpyScroll() {
  if (spyRaf) return
  spyRaf = requestAnimationFrame(() => {
    spyRaf = 0
    updateActiveHeading()
  })
}

function navigateToHeading(id: string, closeMobileToc = false) {
  // 先收起移动端目录再量位置，否则折叠导致的内容上移会让滚动目标算偏
  if (closeMobileToc && mobileTocEl.value) mobileTocEl.value.open = false
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - el.offsetHeight) / 2
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
  activeHeadingId.value = id
}

watch(renderedContent, () => nextTick(buildToc))

onMounted(async () => {
  await nextTick()
  buildToc()
  window.addEventListener('scroll', onSpyScroll, { passive: true })
  window.addEventListener('resize', onSpyScroll, { passive: true })

  if (!article.value) return
  const key = `insight-viewed:${slug.value}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch { /* storage 不可用则照常计数 */ }
  try {
    const res = await $fetch<{ total: number }>(`/api/insights/${slug.value}/view`, { method: 'POST' })
    viewCount.value = res.total
  } catch { /* 计数失败不影响阅读 */ }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onSpyScroll)
  window.removeEventListener('resize', onSpyScroll)
  if (spyRaf) cancelAnimationFrame(spyRaf)
})

// ── 相关工具：frontmatter relatedTools 优先，再按文章 tags 匹配，分类兜底 ──
interface ToolEntry extends InsightToolCard {
  tags: string[]
}

const TOOL_REGISTRY: Record<string, ToolEntry> = {
  'office-fengshui': {
    path: '/tools/office-fengshui',
    icon: 'i-heroicons-briefcase',
    titleKey: 'officeFengshui.title',
    descKey: 'officeFengshui.subtitle',
    tags: ['办公室风水', '办公室', '财位', '办公桌', 'office fengshui', 'office'],
  },
  'fengshui': {
    path: '/tools/fengshui',
    icon: 'i-heroicons-home',
    titleKey: 'fengshui.title',
    descKey: 'fengshui.subtitle',
    tags: ['风水', '家居风水', '户型', '住宅风水', 'fengshui', 'feng shui'],
  },
  'bedroom-fengshui': {
    path: '/tools/bedroom-fengshui',
    icon: 'i-heroicons-moon',
    titleKey: 'bedroomFengshui.title',
    descKey: 'bedroomFengshui.subtitle',
    tags: ['卧室风水', '卧室', '床位', '睡眠', 'bedroom'],
  },
  'hall-fengshui': {
    path: '/tools/hall-fengshui',
    icon: 'i-heroicons-home-modern',
    titleKey: 'hallFengshui.title',
    descKey: 'hallFengshui.subtitle',
    tags: ['客厅风水', '厅堂', '玄关', '客厅', 'living room'],
  },
  'study-fengshui': {
    path: '/tools/study-fengshui',
    icon: 'i-heroicons-book-open',
    titleKey: 'studyFengshui.title',
    descKey: 'studyFengshui.subtitle',
    tags: ['书房风水', '文昌', '学业', '书房', '考试', 'study room'],
  },
  'bazhai': {
    path: '/tools/bazhai-fengshui',
    icon: 'i-heroicons-map',
    titleKey: 'bazhai.title',
    descKey: 'bazhai.subtitle',
    tags: ['八宅', '八宅风水', '宅命', '吉凶位'],
  },
  'jinsuoyuguan': {
    path: '/tools/jinsuoyuguan-fengshui',
    icon: 'i-heroicons-globe-alt',
    titleKey: 'jinsuoyuguan.title',
    descKey: 'jinsuoyuguan.subtitle',
    tags: ['金锁玉关', '砂水', '过路阴阳'],
  },
  'bazi': {
    path: '/tools/bazi',
    icon: 'i-heroicons-calendar-days',
    titleKey: 'bazi.title',
    descKey: 'bazi.subtitle',
    tags: ['八字', '四柱', '命理', '五行', '喜用神', '天干地支', 'bazi', 'four pillars'],
  },
  'bazi-ziwei': {
    path: '/tools/bazi-ziwei',
    icon: 'i-heroicons-sparkles',
    titleKey: 'baziZiwei.title',
    descKey: 'baziZiwei.subtitle',
    tags: ['紫微', '紫微斗数', '紫薇', '星曜', 'ziwei'],
  },
  'liuyao-divination': {
    path: '/tools/liu-yao',
    icon: 'i-heroicons-cube',
    titleKey: 'liuyaoDivination.title',
    descKey: 'liuyaoDivination.subtitle',
    tags: ['六爻', '占卜', '起卦', '摇卦', 'liuyao'],
  },
  'tarot': {
    path: '/tools/tarot',
    icon: 'i-heroicons-rectangle-stack',
    titleKey: 'tarot.title',
    descKey: 'tarot.subtitle',
    tags: ['塔罗', '塔罗牌', '牌阵', 'tarot'],
  },
  'huangdao': {
    path: '/tools/huangdao',
    icon: 'i-heroicons-sun',
    titleKey: 'huangdao.title',
    descKey: 'huangdao.subtitle',
    tags: ['黄道吉日', '择日', '吉日', '黄历', 'auspicious'],
  },
  'jinri-yunshi': {
    path: '/tools/jinri-yunshi',
    icon: 'i-heroicons-clock',
    titleKey: 'jinriYunshi.title',
    descKey: 'jinriYunshi.subtitle',
    tags: ['今日运势', '每日运势', '日运', 'daily fortune'],
  },
  'liunian': {
    path: '/tools/liunian',
    icon: 'i-heroicons-arrow-trending-up',
    titleKey: 'liunian.title',
    descKey: 'liunian.subtitle',
    tags: ['流年', '大运', '年运', '流年运势'],
  },
  'baby-naming': {
    path: '/tools/baby-naming',
    icon: 'i-heroicons-pencil-square',
    titleKey: 'babyNaming.title',
    descKey: 'babyNaming.subtitle',
    tags: ['起名', '取名', '宝宝起名', '名字', 'naming'],
  },
  'bazi-wealth': {
    path: '/tools/bazi-wealth',
    icon: 'i-heroicons-currency-dollar',
    titleKey: 'baziWealth.title',
    descKey: 'baziWealth.subtitle',
    tags: ['财富', '财运', '偏财', '正财', 'wealth'],
  },
  'bazi-zhengyuan': {
    path: '/tools/bazi-zhengyuan',
    icon: 'i-heroicons-heart',
    titleKey: 'baziZhengyuan.title',
    descKey: 'baziZhengyuan.subtitle',
    tags: ['正缘', '姻缘', '婚姻', '桃花', '感情', 'love'],
  },
}

const CATEGORY_FALLBACK_TOOL: Record<string, string> = {
  'fengshui': 'fengshui',
  'metaphysics-basics': 'bazi',
  'deep-reading': 'bazi-ziwei',
  'astrology': 'tarot',
  'culture': 'huangdao',
}

const sidebarTools = computed<InsightToolCard[]>(() => {
  if (!article.value) return []
  const picked = new Map<string, InsightToolCard>()
  const push = (slugKey: string) => {
    const tool = TOOL_REGISTRY[slugKey]
    if (tool && !picked.has(tool.path)) {
      const { tags: _tags, ...card } = tool
      picked.set(tool.path, card)
    }
  }

  for (const slugKey of article.value.relatedTools || []) push(slugKey)

  const articleTags = article.value.tags.map(tag => tag.toLowerCase())
  if (articleTags.length) {
    // 双向子串匹配：文章 tag 与工具 tag 互相包含即算命中（如“风水摆件”命中“风水”）
    const scored = Object.entries(TOOL_REGISTRY)
      .map(([slugKey, tool]) => ({
        slugKey,
        score: articleTags.filter(articleTag =>
          tool.tags.some((toolTag) => {
            const tt = toolTag.toLowerCase()
            return articleTag.includes(tt) || tt.includes(articleTag)
          })
        ).length,
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
    for (const s of scored) {
      if (picked.size >= 3) break
      push(s.slugKey)
    }
  }

  if (!picked.size) {
    const fallback = CATEGORY_FALLBACK_TOOL[article.value.category]
    if (fallback) push(fallback)
  }

  return [...picked.values()].slice(0, 3)
})

// ── 相关文章：按共享 tag 数打分，同分按发布日期，零分用最新发布兜底 ──
const { data: insightList } = await useAsyncData(
  () => `insights-list-${locale.value}`,
  () => $fetch<{ articles: InsightListItem[] }>(`/api/insights?lang=${locale.value}`),
  { server: true, watch: [locale] }
)

const relatedArticles = computed<InsightRelatedArticle[]>(() => {
  if (!article.value || !insightList.value) return []
  const currentTags = new Set(article.value.tags)
  return insightList.value.articles
    .filter(a => a.slug !== article.value!.slug)
    .map(a => ({
      article: a,
      score: a.tags.filter(tag => currentTags.has(tag)).length,
      time: new Date(a.publishedAt).getTime() || 0,
    }))
    .sort((x, y) => y.score - x.score || y.time - x.time)
    .slice(0, 4)
    .map(({ article: a }) => ({
      slug: a.slug,
      title: a.title,
      publishedAt: a.publishedAt,
      readingTime: a.readingTime,
    }))
})

function categoryLabel(cat: string): string {
  const key = `insights.categories.${cat}`
  const translated = t(key)
  return translated === key ? cat : translated
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const fmtLocale = locale.value === 'en' ? 'en-US' : locale.value
  return d.toLocaleDateString(fmtLocale, { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── SEO ──
const siteName = useRuntimeConfig().public.siteName

const pageTitle = computed(() => {
  if (!article.value) return `${t('insights.title')} - ${siteName}`
  return `${article.value.title} - ${t('insights.title')} - ${siteName}`
})

const pageDesc = computed(() => article.value?.description || t('insights.seoDesc'))

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDesc.value,
  keywords: () => (article.value ? [...article.value.tags, t('insights.title')].join(',') : t('insights.seoKeywords')),
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDesc.value,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'article',
  ogUrl: () => `https://www.ososn.com/insights/${slug.value}`,
  twitterCard: 'summary_large_image',
})

useHead(() => {
  const clean = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(clean)
    if (obj && typeof obj === 'object') {
      const result: any = {}
      for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== '') result[k] = clean(v)
      }
      return result
    }
    return obj
  }

  const schema = clean({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.value?.title,
    description: pageDesc.value,
    author: {
      '@type': 'Person',
      name: article.value?.author || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: 'https://www.ososn.com',
    },
    datePublished: article.value?.publishedAt,
    dateModified: article.value?.updatedAt || article.value?.publishedAt,
    articleSection: article.value?.category,
    keywords: article.value?.tags.join(', '),
    url: `https://www.ososn.com/insights/${slug.value}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.ososn.com/insights/${slug.value}`,
    },
  })

  return {
    link: [
      { rel: 'canonical', href: `https://www.ososn.com/insights/${slug.value}` },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      },
    ],
  }
})
</script>

<style scoped>
.insight-content :deep(h1),
.insight-content :deep(h2),
.insight-content :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
.insight-content :deep(h1:first-child),
.insight-content :deep(h2:first-child),
.insight-content :deep(h3:first-child) {
  margin-top: 0;
}
.insight-content :deep(h4) {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.75rem;
  margin-bottom: 0.3rem;
}
.insight-content :deep(p) {
  margin-bottom: 0.7em;
  line-height: 1.8;
  color: var(--text-body);
}
.insight-content :deep(p:last-child) {
  margin-bottom: 0;
}
.insight-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.insight-content :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.insight-content :deep(ul),
.insight-content :deep(ol) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.insight-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.insight-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
.insight-content :deep(ol) {
  counter-reset: insight-ol;
}
.insight-content :deep(ol li) {
  position: relative;
  padding-left: 1.4rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.insight-content :deep(ol li::before) {
  counter-increment: insight-ol;
  content: counter(insight-ol) '.';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
.insight-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 1rem 0;
}
.insight-content :deep(blockquote) {
  border-left: 2px solid var(--accent-border);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-muted);
}
.insight-content :deep(code) {
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
  background-color: var(--accent-faint);
  color: var(--text-primary);
}
</style>
