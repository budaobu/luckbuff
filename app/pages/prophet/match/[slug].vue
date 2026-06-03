<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-[var(--text-muted)] hover:text-[var(--text-body)]"
          @click="navigateTo(localePath('/prophet'))"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          </template>
          {{ $t('common.back') }}
        </UButton>
      </div>

      <!-- 加载中 -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-20">
        <TianganDizhi size="compact" :label="$t('common.loading')" />
      </div>

      <!-- 错误/未生成状态 -->
      <div v-else-if="error || !prediction">
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
          <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 text-[var(--text-faint)] mx-auto mb-4" />
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-2">{{ $t('prophet.match.noPrediction') }}</h2>
          <p class="text-sm text-[var(--text-muted)] mb-6">{{ $t('prophet.match.noPredictionDesc') }}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UButton color="warning" variant="soft" :to="localePath('/prophet/qimen-worldcup')">
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
              </template>
              {{ $t('prophet.match.goPredict') }}
            </UButton>
            <UButton color="neutral" variant="soft" @click="navigateTo(localePath('/prophet'))">
              {{ $t('prophet.match.backToList') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- 预测内容 -->
      <div v-else class="space-y-5">
        <!-- 比赛标题卡 -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-[var(--accent)]" />
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase">{{ $t('prophet.match.badge') }}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ homeTeamName }} vs {{ awayTeamName }} {{ $t('prophet.match.scorePrediction') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ formatMatchTime(prediction.matchTime) }}
          </p>
        </div>

        <!-- 比赛信息卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
          <div class="flex items-center justify-center gap-4 mb-4">
            <div class="text-center flex-1">
              <div class="text-lg font-bold text-[var(--text-primary)]">{{ homeTeamName }}</div>
              <div class="text-[10px] text-[var(--accent)] mt-1">{{ $t('qimenWorldcup.result.homeTeam') }}</div>
            </div>
            <div class="text-xl font-bold text-[var(--text-faint)]">VS</div>
            <div class="text-center flex-1">
              <div class="text-lg font-bold text-[var(--text-primary)]">{{ awayTeamName }}</div>
              <div class="text-[10px] text-[var(--accent)] mt-1">{{ $t('qimenWorldcup.result.awayTeam') }}</div>
            </div>
          </div>
          <div class="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)] flex-wrap">
            <span class="flex items-center gap-1">
              <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
              {{ formatMatchTime(prediction.matchTime) }}
            </span>
            <span v-if="prediction.venue" class="flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
              {{ prediction.venue }}
            </span>
            <span v-if="prediction.dunType" class="flex items-center gap-1">
              <UIcon name="i-heroicons-squares-2x2" class="w-3.5 h-3.5" />
              {{ $t(`qimen.dunTypeMap.${prediction.dunType}`) || prediction.dunType }}·{{ prediction.juNumber }}{{ $t('prophet.match.juUnit') }}
            </span>
          </div>
        </div>

        <!-- 奇门四柱速览 -->
        <div v-if="ganzhiCards.length" class="grid grid-cols-3 gap-2">
          <div
            v-for="item in ganzhiCards"
            :key="item.label"
            class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center"
          >
            <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ item.label }}</div>
            <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ item.value }}</div>
          </div>
        </div>

        <!-- 排盘摘要 -->
        <QimenChartSummary v-if="reconstructedChart" :chart="reconstructedChart" />

        <!-- AI 预测内容 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5"
        >
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--accent)]" />
            <h2 class="text-lg font-semibold text-[var(--text-primary)]">{{ $t('prophet.match.aiPrediction') }}</h2>
          </div>

          <div
            class="text-sm text-[var(--text-body)] leading-relaxed prediction-content max-w-none"
            v-html="renderedContent"
          />
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('qimenWorldcup.disclaimer') }}
          </p>
        </div>

        <!-- 底部导航 -->
        <div class="flex gap-3 justify-center mt-8 flex-wrap">
          <UButton color="warning" variant="soft" :to="localePath('/prophet')">
            <template #leading>
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
            </template>
            {{ $t('prophet.match.allMatches') }}
          </UButton>
          <UButton color="warning" variant="soft" :to="localePath('/prophet/qimen-worldcup')">
            <template #leading>
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            </template>
            {{ $t('prophet.match.customPredict') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { QimenChartResponse } from '~/types/qimen'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => route.params.slug as string)

// ── Team name translation (fixtures store Chinese names) ──
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
  'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR', 'Turkiye': 'TUR', 'Germany': 'GER',
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
  return name
}

const homeTeamName = computed(() => prediction.value ? translateTeamName(prediction.value.homeTeam) : '')
const awayTeamName = computed(() => prediction.value ? translateTeamName(prediction.value.awayTeam) : '')

const { data: prediction, pending, error } = await useAsyncData(
  () => `match-prediction-${slug.value}-${locale.value}`,
  () => $fetch(`/api/prophet/worldcup-prediction/${slug.value}?lang=${locale.value}`),
  { server: true, watch: [locale] }
)

// ── 重构 chart 对象供 QimenChartSummary 使用 ──
const reconstructedChart = computed<QimenChartResponse | null>(() => {
  const p = prediction.value
  if (!p) return null
  if (!p.dunType && !p.juNumber) return null

  const kongwangArr = p.kongwang
    ? p.kongwang.split('、').filter(Boolean)
    : []

  return {
    normalized_input: {},
    calendar: {
      jieqi: p.jieqi ? { active_jie: p.jieqi, active_jie_started_at: '', next_jie: '', next_jie_at: '' } : undefined,
    } as any,
    ganzhi: {
      year: p.yearGanzhi || '',
      month: p.monthGanzhi || '',
      day: p.dayGanzhi || '',
      time: p.timeGanzhi || '',
    },
    chart: {
      dun_type: p.dunType,
      ju_number: p.juNumber,
      yuan: p.yuan || '',
      xunshou: p.xunshou || '',
      hidden_yi: p.hiddenYi || '',
      kongwang: kongwangArr,
      zhifu: {
        star: p.zhifuStar || '',
        palace: p.zhifuPalace,
      },
      zhishi: {
        door: p.zhishiDoor || '',
        palace: p.zhishiPalace,
      },
    },
  } as QimenChartResponse
})

// ── 内容渲染 -->
const renderedContent = computed(() => {
  if (!prediction.value?.content) return ''
  try {
    return marked.parse(prediction.value.content, { async: false }) as string
  } catch {
    return prediction.value.content
  }
})

// ── 四柱数据 -->
const ganzhiCards = computed(() => {
  if (!prediction.value) return []
  const p = prediction.value
  const cards = []
  if (p.yearGanzhi) cards.push({ label: t('qimen.ganzhi.yearLabel'), value: p.yearGanzhi })
  if (p.monthGanzhi) cards.push({ label: t('qimen.ganzhi.monthLabel'), value: p.monthGanzhi })
  if (p.dayGanzhi) cards.push({ label: t('qimen.ganzhi.dayLabel'), value: p.dayGanzhi })
  if (p.timeGanzhi) cards.push({ label: t('qimen.ganzhi.timeLabel'), value: p.timeGanzhi })
  if (p.xunshou) cards.push({ label: t('qimen.ganzhi.xunshouLabel'), value: p.xunshou })
  if (p.kongwang) cards.push({ label: t('qimen.ganzhi.xunkongLabel'), value: p.kongwang })
  return cards
})

function formatMatchTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'en': 'en-US',
  }
  const fmtLocale = localeMap[locale.value] || 'zh-CN'
  return d.toLocaleString(fmtLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  })
}

// ── SEO -->
const siteName = 'ososn'

const pageTitle = computed(() => {
  if (!prediction.value) return t('prophet.match.fallbackTitle')
  return `${t('prophet.match.titlePrefix')}${homeTeamName.value}vs${awayTeamName.value}${t('prophet.match.scorePrediction')} - ${siteName}`
})

const pageDesc = computed(() => {
  if (!prediction.value) return t('seo.prophetDesc')
  return t('prophet.match.seoDesc', {
    home: homeTeamName.value,
    away: awayTeamName.value,
  })
})

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDesc.value,
  keywords: () => prediction.value
    ? t('prophet.match.seoKeywords', { home: homeTeamName.value, away: awayTeamName.value })
    : t('seo.prophetKeywords'),
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDesc.value,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'article',
  ogUrl: () => `https://www.ososn.com/prophet/match/${slug.value}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: `https://www.ososn.com/prophet/match/${slug.value}`,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: prediction.value
          ? `${homeTeamName.value} vs ${awayTeamName.value} ${t('prophet.match.scorePrediction')}`
          : t('prophet.match.fallbackTitle'),
        startDate: prediction.value?.matchTime || '',
        location: prediction.value?.venue
          ? {
              '@type': 'Place',
              name: prediction.value.venue,
            }
          : undefined,
        competitor: [
          { '@type': 'SportsTeam', name: homeTeamName.value || '' },
          { '@type': 'SportsTeam', name: awayTeamName.value || '' },
        ],
        description: pageDesc.value,
        url: `https://www.ososn.com/prophet/match/${slug.value}`,
      }),
    },
  ],
}))
</script>

<style scoped>
.prediction-content :deep(h1),
.prediction-content :deep(h2),
.prediction-content :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
.prediction-content :deep(h1:first-child),
.prediction-content :deep(h2:first-child),
.prediction-content :deep(h3:first-child) {
  margin-top: 0;
}
.prediction-content :deep(h4) {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.75rem;
  margin-bottom: 0.3rem;
}
.prediction-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.prediction-content :deep(p:last-child) {
  margin-bottom: 0;
}
.prediction-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.prediction-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.prediction-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.prediction-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
.prediction-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 1rem 0;
}
.prediction-content :deep(blockquote) {
  border-left: 2px solid var(--accent-border);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-muted);
}
</style>
