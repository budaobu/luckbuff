<template>
  <div class="f26">
    <section class="f26-hero">
      <div class="f26-container">
        <p class="f26-eyebrow">2026 · BING WU</p>
        <h1>{{ $t('fortune2026.title') }}</h1>
        <p class="f26-lede">{{ $t('fortune2026.subtitle') }}</p>

        <div class="f26-tabs" role="tablist" :aria-label="$t('fortune2026.tablist')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            role="tab"
            class="f26-tab"
            :class="{ active: activeTab === tab.id }"
            :aria-selected="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            {{ $t(tab.titleKey) }}
          </button>
        </div>
      </div>
    </section>

    <main class="f26-container f26-body">
      <section class="f26-panel">
        <div class="f26-panel-head">
          <h2>{{ $t(activeTabData.titleKey) }}</h2>
          <p>{{ $t(activeTabData.descriptionKey) }}</p>
        </div>
        <div class="f26-actions">
          <NuxtLink
            v-for="tool in activeTabData.tools"
            :key="tool.path"
            :to="localePath(tool.path)"
            class="f26-tool"
          >
            <UIcon :name="tool.icon" class="f26-tool-icon" />
            <span class="f26-tool-title">{{ $t(tool.titleKey) }}</span>
            <span class="f26-tool-desc">{{ $t(tool.descKey) }}</span>
            <span class="f26-tool-cta">{{ $t('common.start') }}</span>
          </NuxtLink>
        </div>
      </section>

      <section class="f26-panel">
        <div class="f26-panel-head">
          <h2>{{ $t('fortune2026.readingTitle') }}</h2>
          <p>{{ $t('fortune2026.readingDesc') }}</p>
        </div>
        <div class="f26-articles">
          <NuxtLink
            v-for="article in articles"
            :key="article.slug"
            :to="localePath(`/insights/${article.slug}`)"
            class="f26-article"
          >
            <span class="f26-article-topic">{{ $t(article.topicKey) }}</span>
            <span class="f26-article-title">{{ $t(article.titleKey) }}</span>
            <span class="f26-article-link">{{ $t('fortune2026.readArticle') }}</span>
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
type TabId = 'year' | 'zodiac' | 'career' | 'fengshui' | 'daily'

interface HubTool {
  path: string
  icon: string
  titleKey: string
  descKey: string
}

interface HubTab {
  id: TabId
  titleKey: string
  descriptionKey: string
  tools: HubTool[]
}

const { t } = useI18n()
const localePath = useLocalePath()
const route = '/fortune/2026'

const tabs: HubTab[] = [
  {
    id: 'year',
    titleKey: 'fortune2026.tabs.year.title',
    descriptionKey: 'fortune2026.tabs.year.description',
    tools: [
      { path: '/tools/liunian', icon: 'i-heroicons-arrow-trending-up', titleKey: 'home.toolLiunianTitle', descKey: 'home.toolLiunianDesc' },
      { path: '/tools/bazi', icon: 'i-heroicons-calendar-days', titleKey: 'home.toolBaziTitle', descKey: 'home.toolBaziDesc' },
      { path: '/tools/bazi-elements', icon: 'i-heroicons-chart-bar', titleKey: 'baziElements.title', descKey: 'baziElements.subtitle' },
    ],
  },
  {
    id: 'zodiac',
    titleKey: 'fortune2026.tabs.zodiac.title',
    descriptionKey: 'fortune2026.tabs.zodiac.description',
    tools: [
      { path: '/tools/chong-shengxiao', icon: 'i-heroicons-arrows-right-left', titleKey: 'home.toolChongShengxiaoTitle', descKey: 'home.toolChongShengxiaoDesc' },
      { path: '/tools/shengxiao-piancaiyun', icon: 'i-heroicons-banknotes', titleKey: 'home.toolShengxiaoPiancaiyunTitle', descKey: 'home.toolShengxiaoPiancaiyunDesc' },
    ],
  },
  {
    id: 'career',
    titleKey: 'fortune2026.tabs.career.title',
    descriptionKey: 'fortune2026.tabs.career.description',
    tools: [
      { path: '/tools/bazi-wealth', icon: 'i-heroicons-banknotes', titleKey: 'home.toolBaziWealthTitle', descKey: 'home.toolBaziWealthDesc' },
      { path: '/tools/bazi-zhichang-hepan', icon: 'i-heroicons-briefcase', titleKey: 'baziZhichangHepan.title', descKey: 'baziZhichangHepan.toolDesc' },
      { path: '/tools/office-fengshui', icon: 'i-heroicons-building-office-2', titleKey: 'officeFengshui.title', descKey: 'seo.officeFengshuiDesc' },
    ],
  },
  {
    id: 'fengshui',
    titleKey: 'fortune2026.tabs.fengshui.title',
    descriptionKey: 'fortune2026.tabs.fengshui.description',
    tools: [
      { path: '/tools/zibaifeixing', icon: 'i-heroicons-squares-2x2', titleKey: 'home.toolZibaifeixingTitle', descKey: 'home.toolZibaifeixingDesc' },
      { path: '/tools/xuankong-fengshui', icon: 'i-heroicons-table-cells', titleKey: 'home.toolXuankongFengshuiTitle', descKey: 'home.toolXuankongFengshuiDesc' },
      { path: '/tools/fengshui', icon: 'i-heroicons-home-modern', titleKey: 'home.toolFengshuiTitle', descKey: 'home.toolFengshuiDesc' },
    ],
  },
  {
    id: 'daily',
    titleKey: 'fortune2026.tabs.daily.title',
    descriptionKey: 'fortune2026.tabs.daily.description',
    tools: [
      { path: '/tools/jinri-yunshi', icon: 'i-heroicons-sparkles', titleKey: 'home.toolJinriYunshiTitle', descKey: 'home.toolJinriYunshiDesc' },
      { path: '/tools/huangdao', icon: 'i-heroicons-sun', titleKey: 'home.toolHuangdaoTitle', descKey: 'home.toolHuangdaoDesc' },
      { path: '/tools/jishi', icon: 'i-heroicons-clock', titleKey: 'home.toolJishiTitle', descKey: 'home.toolJishiDesc' },
    ],
  },
]

const articles = [
  { slug: '2026-yearly-fortune-reading-bingwu-horse-year', topicKey: 'fortune2026.topics.year', titleKey: 'fortune2026.articles.yearly' },
  { slug: '2026-second-half-12-zodiac-career-fortune-ranking', topicKey: 'fortune2026.topics.career', titleKey: 'fortune2026.articles.zodiacCareer' },
  { slug: '2026-fan-tai-sui-sheng-xiao-hua-jie-fang-fa', topicKey: 'fortune2026.topics.zodiac', titleKey: 'fortune2026.articles.fanTaisui' },
  { slug: 'chinese-zodiac-2026-lucky-colors-numbers-fire-horse-year-guide', topicKey: 'fortune2026.topics.zodiac', titleKey: 'fortune2026.articles.luckyColors' },
  { slug: '2026-fengshui-prosperity-direction', topicKey: 'fortune2026.topics.fengshui', titleKey: 'fortune2026.articles.wealthDirection' },
  { slug: '2026-bingwu-year-flying-star-fengshui-sector-layout-guide', topicKey: 'fortune2026.topics.fengshui', titleKey: 'fortune2026.articles.flyingStars' },
]

const activeTab = ref<TabId>('year')
const activeTabData = computed(() => tabs.find(tab => tab.id === activeTab.value) ?? tabs[0]!)

const siteName = 'ososn'
useSeoMeta({
  title: () => `${t('seo.fortune2026Title')} - ${siteName}`,
  description: t('seo.fortune2026Desc'),
  keywords: t('seo.fortune2026Keywords'),
  ogTitle: () => `${t('seo.fortune2026OgTitle')} - ${siteName}`,
  ogDescription: t('seo.fortune2026OgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: `https://www.ososn.com${route}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('seo.fortune2026Title'),
        url: `https://www.ososn.com${route}`,
        description: t('seo.fortune2026Desc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [...tabs.flatMap(tab => tab.tools), ...articles.map(article => ({ path: `/insights/${article.slug}`, titleKey: article.titleKey }))]
            .map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: t(item.titleKey),
              url: `https://www.ososn.com${item.path}`,
            })),
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.f26 {
  min-height: 100vh;
  background: #faf7ef;
  color: #2f2a22;
}

.f26-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.f26-hero {
  border-bottom: 1px solid rgba(47, 42, 34, 0.12);
  background:
    linear-gradient(90deg, rgba(201, 162, 39, 0.13) 0%, rgba(250, 247, 239, 0) 52%),
    #faf7ef;
  padding: 52px 0 26px;
}

.f26-eyebrow {
  margin: 0 0 8px;
  color: #a1662f;
  font-size: 12px;
  letter-spacing: 0.24em;
}

.f26-hero h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 54px);
  line-height: 1.08;
  font-family: 'Noto Serif SC', serif;
}

.f26-lede {
  margin: 12px 0 0;
  max-width: 720px;
  font-size: 15px;
  line-height: 1.7;
  color: #635a48;
}

.f26-tabs {
  margin-top: 24px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.f26-tab {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 9px 16px;
  border: 1px solid rgba(47, 42, 34, 0.14);
  background: transparent;
  color: #635a48;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.f26-tab.active {
  border-color: #201d16;
  background: #201d16;
  color: #f8f2df;
}

.f26-body {
  padding: 26px 0 56px;
  display: grid;
  gap: 28px;
}

.f26-panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.f26-panel-head h2 {
  margin: 0;
  font-size: 21px;
  font-family: 'Noto Serif SC', serif;
}

.f26-panel-head p,
.f26-tool-desc,
.f26-article-topic,
.f26-article-link {
  color: #6f6654;
}

.f26-panel-head p {
  margin: 0;
  font-size: 13px;
}

.f26-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.f26-tool {
  display: flex;
  min-height: 168px;
  flex-direction: column;
  padding: 16px;
  border: 1px solid rgba(47, 42, 34, 0.13);
  background: #fffdf8;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.f26-tool:hover {
  border-color: #c9a227;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(47, 42, 34, 0.07);
}

.f26-tool-icon {
  width: 22px;
  height: 22px;
  color: #a1662f;
}

.f26-tool-title {
  margin-top: 12px;
  font-size: 17px;
  font-weight: 700;
}

.f26-tool-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
}

.f26-tool-cta {
  margin-top: auto;
  padding-top: 14px;
  font-size: 13px;
  font-weight: 700;
  color: #a1662f;
}

.f26-articles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.f26-article {
  display: flex;
  min-height: 144px;
  flex-direction: column;
  padding: 16px;
  border-top: 2px solid #c9a227;
  background: transparent;
  text-decoration: none;
  transition: background 0.2s;
}

.f26-article:hover {
  background: #fffdf8;
}

.f26-article-topic {
  font-size: 12px;
}

.f26-article-title {
  margin-top: 9px;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.55;
}

.f26-article-link {
  margin-top: auto;
  padding-top: 12px;
  font-size: 13px;
}

@media (max-width: 860px) {
  .f26-hero {
    padding-top: 36px;
  }

  .f26-actions,
  .f26-articles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .f26-panel-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 560px) {
  .f26-container {
    width: min(1180px, calc(100% - 28px));
  }

  .f26-actions,
  .f26-articles {
    grid-template-columns: 1fr;
  }

  .f26-tool,
  .f26-article {
    min-height: 0;
  }

  .f26-tool-desc {
    margin-bottom: 12px;
  }
}
</style>
