<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <!-- Section 标题 -->
      <div class="text-center mb-14">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Prophet</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('prophet.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-md mx-auto">
          {{ $t('prophet.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- ====== 工具入口：横排小卡片 ====== -->
      <div class="mb-12">
        <h2 class="text-xs text-[var(--accent-muted)] tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
          <span class="w-4 h-px bg-[var(--accent-border)]" />
          {{ $t('prophet.toolsSection') }}
          <span class="w-4 h-px bg-[var(--accent-border)]" />
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NuxtLink
          v-for="tool in prophetTools"
          :key="tool.path"
          :to="localePath(tool.path)"
          class="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5"
        >
          <div class="shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
            <UIcon :name="tool.icon" class="w-5 h-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ $t(tool.titleKey) }}</div>
            <div class="text-[11px] text-[var(--text-faint)] truncate">{{ $t(tool.descKey) }}</div>
          </div>
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-[var(--text-faint)] transition-transform duration-300 group-hover:translate-x-0.5" />
        </NuxtLink>
      </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

interface ProphetTool {
  icon: string
  path: string
  titleKey: string
  descKey: string
}

const prophetTools: ProphetTool[] = [
  { icon: 'i-heroicons-circle-stack', path: '/prophet/liuyao-football', titleKey: 'home.toolLiuyaoFootballTitle', descKey: 'home.toolLiuyaoFootballDesc' },
  { icon: 'i-heroicons-squares-2x2', path: '/prophet/qimen-football', titleKey: 'home.toolQimenFootballTitle', descKey: 'home.toolQimenFootballDesc' },
  { icon: 'i-heroicons-cube-transparent', path: '/prophet/liuren-football', titleKey: 'home.toolLiurenFootballTitle', descKey: 'home.toolLiurenFootballDesc' },
  { icon: 'i-heroicons-sparkles', path: '/tools/liu-yao', titleKey: 'home.toolLiuyaoTitle', descKey: 'liuyao.subtitle' },
  { icon: 'i-heroicons-squares-2x2', path: '/prophet/qimen-worldcup', titleKey: 'home.toolQimenWorldcupTitle', descKey: 'home.toolQimenWorldcupDesc' },
  { icon: 'i-heroicons-cube-transparent', path: '/prophet/liuren-worldcup', titleKey: 'home.toolLiurenWorldcupTitle', descKey: 'home.toolLiurenWorldcupDesc' },
  { icon: 'i-heroicons-chart-bar', path: '/prophet/worldcup-champion-odds-2026', titleKey: 'championOdds.link.championOdds', descKey: 'championOdds.link.championOddsDesc' },
  { icon: 'i-heroicons-user-group', path: '/tools/fbti', titleKey: 'home.toolFbtiTitle', descKey: 'home.toolFbtiDesc' },
]

// ── SEO ──
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.prophetTitle')} - ${siteName}`,
  description: t('seo.prophetDesc'),
  keywords: t('seo.prophetKeywords'),
  ogTitle: () => `${t('seo.prophetOgTitle')} - ${siteName}`,
  ogDescription: t('seo.prophetOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/prophet',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.prophetTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/prophet',
        description: t('seo.prophetDesc'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home.toolLiuyaoFootballTitle'), url: 'https://www.ososn.com/prophet/liuyao-football' },
            { '@type': 'ListItem', position: 2, name: t('home.toolQimenFootballTitle'), url: 'https://www.ososn.com/prophet/qimen-football' },
            { '@type': 'ListItem', position: 3, name: t('home.toolLiurenFootballTitle'), url: 'https://www.ososn.com/prophet/liuren-football' },
          ],
        },
      }),
    },
  ],
}))
</script>
