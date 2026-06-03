<template>
  <div class="relative overflow-hidden min-h-screen">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <!-- ========== 页面标题 ========== -->
      <div class="text-center mb-10">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">World Cup 2026 Champion Odds</span>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('championOdds.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-xl mx-auto leading-relaxed">
          {{ $t('championOdds.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- ========== 关联页面入口 ========== -->
      <div class="mb-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <NuxtLink
            :to="localePath('/prophet')"
            class="group flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5"
          >
            <div class="shrink-0 w-9 h-9 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
              <UIcon name="i-heroicons-trophy" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-[var(--text-primary)] truncate">{{ $t('championOdds.link.matchPrediction') }}</div>
              <div class="text-[10px] text-[var(--text-faint)] truncate">{{ $t('prophet.subtitle') }}</div>
            </div>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/tools/liu-yao')"
            class="group flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5"
          >
            <div class="shrink-0 w-9 h-9 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-[var(--text-primary)] truncate">{{ $t('home.toolLiuyaoTitle') }}</div>
              <div class="text-[10px] text-[var(--text-faint)] truncate">{{ $t('liuyao.subtitle') }}</div>
            </div>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/prophet/qimen-worldcup')"
            class="group flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5"
          >
            <div class="shrink-0 w-9 h-9 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-[var(--text-primary)] truncate">{{ $t('home.toolQimenWorldcupTitle') }}</div>
              <div class="text-[10px] text-[var(--text-faint)] truncate">{{ $t('home.toolQimenWorldcupDesc') }}</div>
            </div>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/prophet/liuren-worldcup')"
            class="group flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5"
          >
            <div class="shrink-0 w-9 h-9 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
              <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-[var(--text-primary)] truncate">{{ $t('home.toolLiurenWorldcupTitle') }}</div>
              <div class="text-[10px] text-[var(--text-faint)] truncate">{{ $t('home.toolLiurenWorldcupDesc') }}</div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- ========== 六爻方法论说明 ========== -->
      <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-6">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[var(--accent-muted)] mt-0.5 shrink-0" />
          <div>
            <p class="text-xs font-medium text-[var(--text-muted)] mb-1">{{ $t('championOdds.method') }}</p>
            <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">{{ $t('championOdds.methodNote') }}</p>
          </div>
        </div>
      </div>

      <!-- ========== 筛选栏 ========== -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <!-- 大洲筛选 -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-[var(--text-faint)] shrink-0">{{ $t('championOdds.filter.continent') }}</span>
          <button
            v-for="c in continents"
            :key="c"
            class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border"
            :class="continentFilter === c
              ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]'
              : 'bg-[var(--surface-card)] border-[var(--border-light)] text-[var(--text-faint)] hover:border-[var(--accent-border)] hover:text-[var(--text-muted)]'"
            @click="continentFilter = c"
          >
            {{ c === 'all' ? $t('championOdds.filter.all') : c }}
          </button>
        </div>

        <!-- 组别筛选 -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-[var(--text-faint)] shrink-0">{{ $t('championOdds.filter.group') }}</span>
          <button
            v-for="g in groups"
            :key="g"
            class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border"
            :class="groupFilter === g
              ? 'bg-[var(--accent-purple-faint)] border-[var(--accent-purple-border)] text-[var(--accent-purple-text)]'
              : 'bg-[var(--surface-card)] border-[var(--border-light)] text-[var(--text-faint)] hover:border-[var(--accent-purple-border)] hover:text-[var(--text-muted)]'"
            @click="groupFilter = g"
          >
            {{ g === 'all' ? $t('championOdds.filter.all') : g }}
          </button>
        </div>
      </div>

      <!-- ========== 数据表格 ========== -->
      <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-[var(--border-light)]">
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider w-12">{{ $t('championOdds.table.rank') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider">{{ $t('championOdds.table.team') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider text-center w-20">{{ $t('championOdds.table.champ') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--accent-muted)] uppercase tracking-wider text-center w-24">{{ $t('championOdds.table.liuyao') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--accent-muted)] uppercase tracking-wider min-w-[200px]">{{ $t('championOdds.table.liuyaoBrief') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider text-center w-16">{{ $t('championOdds.table.topGroup') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider text-center w-16">{{ $t('championOdds.table.l32') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider text-center w-16">{{ $t('championOdds.table.l16') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider text-center w-16">{{ $t('championOdds.table.qf') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider text-center w-16">{{ $t('championOdds.table.sf') }}</th>
                <th class="px-4 py-3 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-wider text-center w-16">{{ $t('championOdds.table.final') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(team, idx) in filteredTeams"
                :key="team.code"
                class="border-b border-[var(--border-subtle)] transition-colors duration-200 hover:bg-[var(--surface-card-hover)]"
              >
                <!-- 排名 -->
                <td class="px-4 py-3">
                  <span class="text-xs font-bold" :class="idx < 3 ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'">
                    {{ idx + 1 }}
                  </span>
                </td>

                <!-- 球队 -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-light)] flex items-center justify-center shrink-0">
                      <span class="text-[9px] font-bold text-[var(--text-muted)]">{{ team.group }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-[var(--text-primary)]">{{ $t(`teams.${team.code}`) }}</div>
                      <div class="text-[10px] text-[var(--text-faint)]">{{ team.continent }}</div>
                    </div>
                  </div>
                </td>

                <!-- 夺冠概率 -->
                <td class="px-4 py-3">
                  <div class="text-center">
                    <div class="text-sm font-bold" :class="getChampColor(team.opta.champ)">{{ team.opta.champ.toFixed(2) }}%</div>
                    <div class="mt-1 h-1 rounded-full bg-[var(--border-light)] overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="getChampBarColor(team.opta.champ)"
                        :style="{ width: `${Math.min(team.opta.champ * 5, 100)}%` }"
                      />
                    </div>
                  </div>
                </td>

                <!-- 六爻结论 -->
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="getVerdictClass(team.liuyao.verdict)"
                  >
                    {{ $t(`championOdds.verdict.${verdictKey(team.liuyao.verdict)}`) }}
                  </span>
                </td>

                <!-- 六爻解读 -->
                <td class="px-4 py-3">
                  <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $te(`championOdds.readings.${team.code}`) ? $t(`championOdds.readings.${team.code}`) : team.liuyao.brief }}</p>
                </td>

                <!-- 各阶段概率 -->
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-[var(--text-muted)]">{{ team.opta.topGroup.toFixed(1) }}%</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-[var(--text-muted)]">{{ team.opta.l32.toFixed(1) }}%</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-[var(--text-muted)]">{{ team.opta.l16.toFixed(1) }}%</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-[var(--text-muted)]">{{ team.opta.qf.toFixed(1) }}%</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-[var(--text-muted)]">{{ team.opta.sf.toFixed(1) }}%</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-[var(--text-muted)]">{{ team.opta.final.toFixed(1) }}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredTeams.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-funnel" class="w-8 h-8 text-[var(--text-faint)] mx-auto mb-2" />
          <p class="text-sm text-[var(--text-muted)]">{{ $t('championOdds.noResults') }}</p>
        </div>
      </div>

      <!-- 数据来源 -->
      <div class="mt-6 text-center">
        <p class="text-[10px] text-[var(--text-faint)]">
          Opta Supercomputer {{ $t('championOdds.dataSource') }} · {{ $t('championOdds.liuyaoSource') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TeamOdds {
  code: string
  name: string
  group: string
  continent: string
  opta: {
    team: string
    topGroup: number
    l32: number
    l16: number
    qf: number
    sf: number
    final: number
    champ: number
  }
  liuyao: {
    verdict: string
    brief: string
  }
}

const { t } = useI18n()
const localePath = useLocalePath()

const { data } = await useAsyncData('worldcup-champion-odds', () =>
  $fetch('/api/prophet/worldcup-champion-odds')
)

const teams = computed<TeamOdds[]>(() => data.value?.teams || [])

const continentFilter = ref('all')
const groupFilter = ref('all')

const continents = ['all', 'UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC']
const groups = ['all', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

const filteredTeams = computed(() => {
  let result = teams.value
  if (continentFilter.value !== 'all') {
    result = result.filter(t => t.continent === continentFilter.value)
  }
  if (groupFilter.value !== 'all') {
    result = result.filter(t => t.group === groupFilter.value)
  }
  return result
})

function verdictKey(verdict: string): string {
  const map: Record<string, string> = {
    '大吉': 'great',
    '小吉': 'good',
    '平': 'neutral',
    '凶': 'bad',
    '大凶': 'terrible',
  }
  return map[verdict] || 'neutral'
}

function getVerdictClass(verdict: string): string {
  switch (verdict) {
    case '大吉':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    case '小吉':
      return 'bg-teal-500/10 border-teal-500/30 text-teal-400'
    case '平':
      return 'bg-[var(--accent-faint)] border-[var(--accent-border)] text-[var(--accent-muted)]'
    case '凶':
      return 'bg-orange-500/10 border-orange-500/30 text-orange-400'
    case '大凶':
      return 'bg-red-500/10 border-red-500/30 text-red-400'
    default:
      return 'bg-[var(--accent-faint)] border-[var(--accent-border)] text-[var(--accent-muted)]'
  }
}

function getChampColor(val: number): string {
  if (val >= 10) return 'text-emerald-400'
  if (val >= 5) return 'text-[var(--accent)]'
  if (val >= 1) return 'text-[var(--text-muted)]'
  return 'text-[var(--text-faint)]'
}

function getChampBarColor(val: number): string {
  if (val >= 10) return 'bg-emerald-500'
  if (val >= 5) return 'bg-[var(--accent)]'
  if (val >= 1) return 'bg-[var(--accent-muted)]'
  return 'bg-[var(--border-light)]'
}

// ── SEO ──
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.championOddsTitle')} - ${siteName}`,
  description: t('seo.championOddsDesc'),
  keywords: t('seo.championOddsKeywords'),
  ogTitle: () => `${t('seo.championOddsOgTitle')} - ${siteName}`,
  ogDescription: t('seo.championOddsOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/prophet/worldcup-champion-odds-2026',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.championOddsTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/prophet/worldcup-champion-odds-2026',
        description: t('seo.championOddsDesc'),
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
