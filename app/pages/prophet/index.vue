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

      <!-- ====== 赛程列表：按时间顺序 ====== -->
      <div>
        <h2 class="text-xs text-[var(--accent-muted)] tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
          <span class="w-4 h-px bg-[var(--accent-border)]" />
          {{ $t('prophet.fixturesSection') }}
          <span class="w-4 h-px bg-[var(--accent-border)]" />
        </h2>

        <!-- 加载中 -->
        <div v-if="predictionsLoading" class="space-y-3">
          <USkeleton v-for="i in 6" :key="i" class="h-16 rounded-xl" />
        </div>

        <!-- 空状态 -->
        <div v-else-if="!sortedFixtures.length" class="text-center py-12">
          <UIcon name="i-heroicons-calendar" class="w-10 h-10 text-[var(--text-faint)] mx-auto mb-3" />
          <p class="text-sm text-[var(--text-muted)]">{{ $t('prophet.noFixtures') }}</p>
        </div>

        <!-- 赛程列表 -->
        <div v-else class="space-y-2">
          <!-- 日期分组 -->
          <div v-for="group in groupedFixtures" :key="group.date">
            <div class="sticky top-0 z-10 py-2">
              <div class="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-dropdown)]/90 backdrop-blur-sm px-3 py-1">
                <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 text-[var(--accent-muted)]" />
                <span class="text-xs text-[var(--text-muted)] font-medium">{{ group.date }}</span>
                <span class="text-[10px] text-[var(--text-faint)]">{{ group.items.length }}{{ $t('prophet.matchesCount') }}</span>
              </div>
            </div>

            <div class="space-y-2 pb-3">
              <NuxtLink
                v-for="item in group.items"
                :key="item.uid"
                :to="localePath(`/prophet/match/${item.slug}`)"
                class="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)]"
              >
                <!-- 时间 -->
                <div class="shrink-0 w-14 text-center">
                  <div class="text-xs font-semibold text-[var(--text-primary)]">{{ item.timeStr }}</div>
                  <div class="text-[10px] text-[var(--text-faint)]">{{ item.timezoneOffset }}</div>
                </div>

                <!-- 分隔线 -->
                <div class="w-px h-8 bg-[var(--border-light)]" />

                <!-- 队伍 -->
                <div class="flex-1 min-w-0 flex items-center justify-center gap-2">
                  <span class="text-sm font-semibold text-[var(--text-primary)] truncate text-right flex-1">{{ translateTeamName(item.homeTeam) }}</span>
                  <span class="text-[10px] text-[var(--accent-muted)] px-1.5 py-0.5 rounded border border-[var(--accent-border)] bg-[var(--accent-faint)] shrink-0">VS</span>
                  <span class="text-sm font-semibold text-[var(--text-primary)] truncate flex-1">{{ translateTeamName(item.awayTeam) }}</span>
                </div>

                <!-- 预测状态 -->
                <div class="shrink-0 flex items-center gap-2">
                  <span
                    v-if="item.hasPrediction"
                    class="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  >
                    {{ $t('prophet.predicted') }}
                  </span>
                  <span
                    v-else
                    class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-faint)]"
                  >
                    {{ $t('prophet.noPrediction') }}
                  </span>
                  <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-[var(--text-faint)] transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

interface ProphetTool {
  icon: string
  path: string
  titleKey: string
  descKey: string
}

const prophetTools: ProphetTool[] = [
  { icon: 'i-heroicons-sparkles', path: '/tools/liu-yao', titleKey: 'home.toolLiuyaoTitle', descKey: 'liuyao.subtitle' },
  { icon: 'i-heroicons-squares-2x2', path: '/prophet/qimen-worldcup', titleKey: 'home.toolQimenWorldcupTitle', descKey: 'home.toolQimenWorldcupDesc' },
  { icon: 'i-heroicons-cube-transparent', path: '/prophet/liuren-worldcup', titleKey: 'home.toolLiurenWorldcupTitle', descKey: 'home.toolLiurenWorldcupDesc' },
  { icon: 'i-heroicons-chart-bar', path: '/prophet/worldcup-champion-odds-2026', titleKey: 'championOdds.link.championOdds', descKey: 'championOdds.link.championOddsDesc' },
  { icon: 'i-heroicons-user-group', path: '/tools/fbti', titleKey: 'home.toolFbtiTitle', descKey: 'home.toolFbtiDesc' },
]

// ── 赛程数据 ──
const { data: fixturesData, status: fixturesStatus, refresh: refreshFixtures } = await useAsyncData('prophet-fixtures', () =>
  $fetch('/api/prophet/worldcup-fixtures', { query: { lang: locale.value } })
)

const { data: predictionsData, status: predictionsStatus, refresh: refreshPredictions } = await useAsyncData('prophet-predictions', () =>
  $fetch('/api/prophet/worldcup-predictions')
)

const fixturesLoading = computed(() => fixturesStatus.value === 'pending')
const predictionsLoading = computed(() => predictionsStatus.value === 'pending')

// Force refresh on client-side mount to avoid stale prefetch payload
onMounted(() => {
  refreshFixtures()
  refreshPredictions()
})

const predictionMap = computed(() => {
  const map = new Map<string, boolean>()
  predictionsData.value?.predictions?.forEach((p: any) => {
    map.set(p.slug, p.hasContent)
  })
  return map
})

interface FixtureItem {
  uid: string
  slug: string
  homeTeam: string
  awayTeam: string
  startTime: string
  timeStr: string
  timezoneOffset: string
  hasPrediction: boolean
}

const sortedFixtures = computed<FixtureItem[]>(() => {
  const events = fixturesData.value?.events || []
  return events
    .filter((f: any) => !f.isPlaceholder)
    .map((f: any) => {
      const d = new Date(f.startTime)
      const slug = f.slug || f.uid.replace(/@(worldcup-calendar|jys66\.top)$/, '')
      return {
        uid: f.uid,
        slug,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        startTime: f.startTime,
        timeStr: d.toLocaleTimeString(locale.value === 'en' ? 'en-US' : locale.value, { hour: '2-digit', minute: '2-digit', hour12: false }),
        timezoneOffset: formatTimezoneOffset(d),
        hasPrediction: predictionMap.value.get(slug) || false,
      }
    })
    .sort((a: FixtureItem, b: FixtureItem) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
})

interface GroupedFixtures {
  date: string
  items: FixtureItem[]
}

const groupedFixtures = computed<GroupedFixtures[]>(() => {
  const groups: Record<string, FixtureItem[]> = {}
  for (const item of sortedFixtures.value) {
    const dateStr = new Date(item.startTime).toLocaleDateString(locale.value === 'en' ? 'en-US' : locale.value, {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(item)
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }))
})

function formatTimezoneOffset(d: Date): string {
  const offset = -d.getTimezoneOffset() / 60
  const sign = offset >= 0 ? '+' : ''
  return `UTC${sign}${offset}`
}

// ── 队名翻译 ──
const teamNameToCode: Record<string, string> = {
  '墨西哥': 'MEX', '南非': 'RSA', '韩国': 'KOR', '捷克': 'CZE', '加拿大': 'CAN',
  '波黑': 'BIH', '卡塔尔': 'QAT', '瑞士': 'SUI', '巴西': 'BRA', '摩洛哥': 'MAR',
  '海地': 'HAI', '苏格兰': 'SCO', '美国': 'USA', '巴拉圭': 'PAR', '澳大利亚': 'AUS',
  '土耳其': 'TUR', '德国': 'GER', '库拉索': 'CUW', '科特迪瓦': 'CIV', '厄瓜多尔': 'ECU',
  '荷兰': 'NED', '日本': 'JPN', '瑞典': 'SWE', '突尼斯': 'TUN', '比利时': 'BEL',
  '埃及': 'EGY', '伊朗': 'IRN', '新西兰': 'NZL', '西班牙': 'ESP', '佛得角': 'CPV',
  '沙特阿拉伯': 'KSA', '乌拉圭': 'URU', '法国': 'FRA', '塞内加尔': 'SEN', '挪威': 'NOR',
  '伊拉克': 'IRQ', '阿根廷': 'ARG', '阿尔及利亚': 'ALG', '奥地利': 'AUT', '约旦': 'JOR',
  '葡萄牙': 'POR', '刚果（金）': 'COD', '乌兹别克斯坦': 'UZB', '哥伦比亚': 'COL',
  '英格兰': 'ENG', '克罗地亚': 'CRO', '加纳': 'GHA', '巴拿马': 'PAN',
  // English names (when fixtures API returns English ICS)
  'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  'Canada': 'CAN', 'Bosnia and Herzegovina': 'BIH', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO', 'USA': 'USA',
  'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR', 'Germany': 'GER',
  'Curaçao': 'CUW', 'Ivory Coast': 'CIV', 'Ecuador': 'ECU', 'Netherlands': 'NED',
  'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN', 'Belgium': 'BEL', 'Egypt': 'EGY',
  'Iran': 'IRN', 'New Zealand': 'NZL', 'Spain': 'ESP', 'Cape Verde': 'CPV',
  'Saudi Arabia': 'KSA', 'Uruguay': 'URU', 'France': 'FRA', 'Senegal': 'SEN',
  'Norway': 'NOR', 'Iraq': 'IRQ', 'Argentina': 'ARG', 'Algeria': 'ALG',
  'Austria': 'AUT', 'Jordan': 'JOR', 'Portugal': 'POR', 'DR Congo': 'COD',
  'Uzbekistan': 'UZB', 'Colombia': 'COL', 'England': 'ENG', 'Croatia': 'CRO',
  'Ghana': 'GHA', 'Panama': 'PAN',
}

function translateTeamName(name: string): string {
  const code = teamNameToCode[name]
  if (code) return t(`teams.${code}`)

  const m16 = name.match(/^16强赛(\d+)胜者$/)
  if (m16) return t('qimenWorldcup.placeholders.roundOf16', { n: m16[1] })

  const m32 = name.match(/^32强赛胜者$/)
  if (m32) return t('qimenWorldcup.placeholders.roundOf32Winner')

  const group = name.match(/^([A-L])组第(\d+)$/)
  if (group) return t('qimenWorldcup.placeholders.groupRank', { group: group[1], rank: group[2] })

  const qf = name.match(/^四分之一决赛(\d+)胜者$/)
  if (qf) return t('qimenWorldcup.placeholders.quarterFinal', { n: qf[1] })

  const sf = name.match(/^半决赛(\d+)胜者$/)
  if (sf) return t('qimenWorldcup.placeholders.semiFinalWinner', { n: sf[1] })

  const sfl = name.match(/^半决赛(\d+)负者$/)
  if (sfl) return t('qimenWorldcup.placeholders.semiFinalLoser', { n: sfl[1] })

  if (name === '小组第三') return t('qimenWorldcup.placeholders.thirdPlace')

  const mw = name.match(/^第(\d+)场胜者$/)
  if (mw) return t('qimenWorldcup.placeholders.matchWinner', { n: mw[1] })

  const ml = name.match(/^第(\d+)场败者$/)
  if (ml) return t('qimenWorldcup.placeholders.matchLoser', { n: ml[1] })

  return name
}

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
            { '@type': 'ListItem', position: 1, name: t('home.toolLiuyaoTitle'), url: 'https://www.ososn.com/tools/liu-yao' },
            { '@type': 'ListItem', position: 2, name: t('home.toolQimenWorldcupTitle'), url: 'https://www.ososn.com/prophet/qimen-worldcup' },
            { '@type': 'ListItem', position: 3, name: t('home.toolLiurenWorldcupTitle'), url: 'https://www.ososn.com/prophet/liuren-worldcup' },
          ],
        },
      }),
    },
  ],
}))
</script>
