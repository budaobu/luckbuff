<template>
  <div class="space-y-4">
    <!-- 顶部三层切换 -->
    <div class="flex gap-1 p-1 rounded-xl bg-[var(--surface-dropdown)] border border-[var(--border-medium)]">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
        :class="activeTab === tab.key
          ? 'bg-[var(--accent-bg-hover)] text-[var(--text-primary)]'
          : 'text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--surface-card)]'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== 本命 ===== -->
    <div v-if="activeTab === 'benming'" class="space-y-3">
      <!-- 命格总览 -->
      <GlowCard :title="$t('zwdsAnalysis.lifePalaceLabel') + ' ' + $t('zwdsAi.命格总览')">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div class="text-sm text-[var(--text-muted)]">{{ $t('zwdsAnalysis.lifePalaceLabel') }}</div>
            <div class="text-base font-bold text-[var(--accent)]">
              {{ chart.mingGong.zhi }}宫 · {{ chart.mingGong.mainStars.join('、') || $t('zwdsAnalysis.borrow') + $t('zwdsAnalysis.referenceLabel') }}
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent)]">{{ chart.wuxingJu }}{{ $t('zwds.wuxingBureau') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm text-[var(--text-muted)]">{{ $t('zwdsAnalysis.bodyPalaceLabel') }}</div>
            <div class="text-sm text-[var(--text-primary)]">
              {{ chart.shenGong.zhi }}宫 · {{ chart.shenGong.mainStars.join('、') || $t('zwdsAnalysis.borrow') + $t('zwdsAnalysis.referenceLabel') }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm text-[var(--text-muted)]">{{ $t('zwdsAnalysis.yearPillarLabel') }}</div>
            <div class="text-sm text-[var(--text-primary)]">{{ chart.yearGan }}{{ chart.yearZhi }} · {{ chart.gender === 'male' ? $t('zwdsAnalysis.sunSign') : $t('zwdsAnalysis.moonSign') }}</div>
          </div>
          <p class="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
            {{ $t('zwdsAnalysis.benMingIntro', { minggong: chart.mingGong.zhi, mainStars: chart.mingGong.mainStars.join('、') || $t('zwdsAnalysis.borrow'), secondaryStars: '', tianJi: chart.wuxingJu }) }}
          </p>
        </div>
      </GlowCard>

      <!-- 四化总览 -->
      <GlowCard :title="$t('zwdsAnalysis.benMingFourTransform')">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="s in benmingSiHua"
            :key="s.star + s.type"
            class="text-xs px-2 py-1 rounded border"
            :class="sihuaBadgeClass(s.type)"
          >
            {{ s.star }}化{{ s.type }} → {{ s.gongName }}宫
          </span>
          <span v-if="benmingSiHua.length === 0" class="text-xs text-[var(--text-placeholder)]">{{ $t('zwdsAnalysis.sihuaPeace') }}</span>
        </div>
      </GlowCard>

      <!-- 十二宫逐宫 -->
      <GlowCard
        v-for="item in benmingAnalysis"
        :key="item.gong.name"
        :title="`${item.gong.name}（${item.gong.zhi}）${item.isMing ? '· ' + $t('zwdsAnalysis.lifePalace') : ''}${item.isShen ? '· ' + $t('zwdsAnalysis.bodyPalace') : ''}`"
      >
        <div class="space-y-2">
          <!-- 主星 -->
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="star in item.gong.mainStars"
              :key="star"
              class="text-xs px-1.5 py-0.5 rounded font-medium"
              :class="star === '紫微' || star === '天府' ? 'bg-[var(--accent-bg)] text-[var(--accent)]' : 'bg-[var(--surface-card-hover)] text-[var(--text-primary)]'"
            >
              {{ star }}
            </span>
            <span v-if="item.gong.mainStars.length === 0" class="text-xs text-[var(--text-placeholder)] italic">{{ $t('zwdsAnalysis.borrowLabel') }}{{ getJieDuiZhi(item.gong.zhi) }}{{ $t('zwdsAnalysis.referenceLabel') }}</span>
          </div>
          <!-- 辅星 -->
          <div v-if="item.gong.auxStars.length" class="flex flex-wrap gap-1">
            <span
              v-for="star in item.gong.auxStars"
              :key="star"
              class="text-[10px] px-1 py-0.5 rounded text-[var(--text-muted)] bg-[var(--surface-card)]"
            >
              {{ star }}
            </span>
          </div>
          <!-- 四化 -->
          <div v-if="item.gong.siHua.length" class="flex flex-wrap gap-1">
            <span
              v-for="s in item.gong.siHua"
              :key="s.star + s.type"
              class="text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              :class="sihuaDotClass(s.type)"
            >
              {{ s.type }}
            </span>
          </div>
          <!-- 解读 -->
          <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ item.brief }}</p>
        </div>
      </GlowCard>
    </div>

    <!-- ===== 大限 ===== -->
    <div v-if="activeTab === 'daxian'" class="space-y-3">
      <!-- 大限选择器 -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="(dx, idx) in chart.daXians"
          :key="dx.index"
          class="shrink-0 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="selectedDaxianIndex === idx
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : dx.ageRange[0] <= chart.currentAge && dx.ageRange[1] >= chart.currentAge
              ? 'border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400'
              : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-light)]'"
          @click="selectedDaxianIndex = idx"
        >
          <div class="text-[10px] opacity-60">{{ $t('zwds.currentDaXian') }}{{ dx.index }}</div>
          <div>{{ dx.ageRange[0] }}-{{ dx.ageRange[1] }}{{ $t('zwdsPan.sui') }}</div>
        </button>
      </div>

      <!-- 选中大限详情 -->
      <template v-if="currentDaxianAnalysis">
        <GlowCard :title="`${currentDaxianAnalysis.daxian.gongName}宫大限（${currentDaxianAnalysis.daxian.ageRange[0]}-${currentDaxianAnalysis.daxian.ageRange[1]}岁）`">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span v-if="currentDaxianAnalysis.isCurrent" class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">{{ $t('zwdsAnalysis.currentDaXian') }}</span>
              <span class="text-xs text-[var(--text-muted)]">{{ $t('zwdsAnalysis.interpretation') }}：{{ currentDaxianAnalysis.daxian.mainStars.join('、') || $t('zwdsAnalysis.borrowLabel') + $t('zwdsAnalysis.referenceLabel') }}</span>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ currentDaxianAnalysis.overview }}</p>
          </div>
        </GlowCard>

        <!-- 四维走势 -->
        <GlowCard :title="$t('zwdsAnalysis.fourTrendTitle')">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="dim in currentDaxianAnalysis.dimensions"
              :key="dim.name"
              class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-medium text-[var(--text-muted)]">{{ dim.name }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  :class="trendClass(dim.trend)"
                >
                  {{ getTrendLabel(dim.trend) }}
                </span>
              </div>
              <p class="text-[11px] text-[var(--text-muted)] leading-relaxed">{{ dim.text }}</p>
            </div>
          </div>
        </GlowCard>

        <!-- 时间节点 -->
        <GlowCard :title="$t('zwdsAnalysis.timeNodeTitle')">
          <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ currentDaxianAnalysis.timeHint }}</p>
        </GlowCard>
      </template>
    </div>

    <!-- ===== 流年 ===== -->
    <div v-if="activeTab === 'liunian'" class="space-y-3">
      <!-- 年份选择 -->
      <div class="flex items-center gap-3">
        <USelect
          v-model="selectedYear"
          :items="yearOptions"
          color="warning"
          class="w-32"
          :ui="{
            base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
            content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl',
            item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
          }"
        />
        <span class="text-xs text-[var(--text-faint)]">{{ $t('zwdsAnalysis.selectYearHint') }}</span>
      </div>

      <template v-if="currentLiunianAnalysis">
        <!-- 流年概览（截图目标） -->
        <GlowCard :title="$t('zwdsAnalysis.liuNianOverviewTitle')" ref="liunianOverviewRef">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="text-sm text-[var(--text-muted)]">{{ $t('zwdsAnalysis.currentYearLabel') }}</div>
              <div class="text-base font-bold text-[var(--text-primary)]">{{ currentLiunianAnalysis.yearGanZhi }}</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-[var(--text-muted)]">{{ $t('zwdsAnalysis.taisuiEntryLabel') }}</div>
              <div class="text-sm text-[var(--text-primary)]">{{ currentLiunianAnalysis.taiSuiGong }}宫（{{ currentLiunianAnalysis.taiSuiZhi }}）</div>
            </div>
            <div class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="s in currentLiunianAnalysis.liuNianSiHua"
                :key="s.star + s.type"
                class="text-xs px-2 py-1 rounded border"
                :class="sihuaBadgeClass(s.type)"
              >
                {{ s.star }}化{{ s.type }}
              </span>
            </div>
            <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ currentLiunianAnalysis.summary }}</p>
          </div>
        </GlowCard>

        <!-- 吉凶评级 -->
        <GlowCard :title="$t('zwdsAnalysis.jiXiongRating')">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold border"
              :class="ratingClass(currentLiunianAnalysis.rating)"
            >
              {{ ratingLabel(currentLiunianAnalysis.rating) }}
            </div>
            <div class="flex-1">
              <p class="text-sm text-[var(--text-body)] leading-relaxed">
                {{ ratingText(currentLiunianAnalysis.rating) }}
              </p>
            </div>
          </div>
        </GlowCard>

        <!-- 四维当年 -->
        <GlowCard :title="$t('zwdsAnalysis.liuNianTrendTitle')">
          <div class="space-y-2.5">
            <div
              v-for="dim in currentLiunianAnalysis.dimensions"
              :key="dim.name"
              class="flex items-start gap-2"
            >
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-card-hover)] text-[var(--text-muted)] shrink-0 mt-0.5">{{ dim.name }}</span>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ dim.text }}</p>
            </div>
          </div>
        </GlowCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZwdsChart, DiZhi } from '~/types/zwds'
import {
  generateBenmingAnalysis,
  getDaxianAnalysis,
  getLiunianAnalysis,
  type DaxianAnalysis,
  type LiunianAnalysis,
} from '~/utils/zwds/analysis'

interface Props {
  chart: ZwdsChart
}

const props = defineProps<Props>()

const { t } = useI18n()

const tabs = computed(() => [
  { key: 'benming' as const, label: t('zwdsAnalysis.tabsLabelBenMing') },
  { key: 'daxian' as const, label: t('zwdsAnalysis.tabsLabelDaXian') },
  { key: 'liunian' as const, label: t('zwdsAnalysis.tabsLabelLiuNian') },
])

const activeTab = ref<'benming' | 'daxian' | 'liunian'>('benming')

// 本命
const benmingAnalysis = computed(() => generateBenmingAnalysis(props.chart))

const benmingSiHua = computed(() => {
  const result: { type: string; star: string; gongName: string }[] = []
  for (const g of props.chart.gongs) {
    for (const s of g.siHua) {
      result.push({ type: s.type, star: s.star, gongName: g.name })
    }
  }
  return result
})

function sihuaBadgeClass(type: string): string {
  switch (type) {
    case '禄': return 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]'
    case '权': return 'border-red-500/20 bg-red-500/10 text-red-400'
    case '科': return 'border-[var(--accent-purple-border)] bg-[var(--accent-purple-faint)] text-[var(--accent-purple-text)]'
    case '忌': return 'border-[var(--text-faint)]/20 bg-[var(--text-faint)]/10 text-[var(--text-muted)]'
    default: return 'border-[var(--border-light)] bg-[var(--surface-card-hover)] text-[var(--text-body)]'
  }
}

function sihuaDotClass(type: string): string {
  switch (type) {
    case '禄': return 'bg-[var(--accent-bg-hover)] text-[var(--accent)]'
    case '权': return 'bg-red-500/20 text-red-400'
    case '科': return 'bg-[var(--accent-purple-faint)] text-[var(--accent-purple-text)]'
    case '忌': return 'bg-[var(--text-faint)]/20 text-[var(--text-muted)]'
    default: return 'bg-[var(--border-light)] text-[var(--text-body)]'
  }
}

function getJieDuiZhi(zhi: DiZhi): DiZhi {
  const ZHI_ORDER: DiZhi[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
  const idx = ZHI_ORDER.indexOf(zhi)
  return ZHI_ORDER[(idx + 6) % 12]
}

// 大限
const selectedDaxianIndex = ref(0)

// 默认选中当前大限
onMounted(() => {
  const currentIdx = props.chart.daXians.findIndex(
    d => d.ageRange[0] <= props.chart.currentAge && d.ageRange[1] >= props.chart.currentAge,
  )
  if (currentIdx >= 0) selectedDaxianIndex.value = currentIdx
})

const currentDaxianAnalysis = computed<DaxianAnalysis | null>(() => {
  if (selectedDaxianIndex.value < 0 || selectedDaxianIndex.value >= props.chart.daXians.length) return null
  return getDaxianAnalysis(props.chart, selectedDaxianIndex.value)
})

function trendClass(trend: string): string {
  switch (trend) {
    case '上升': return 'bg-emerald-500/15 text-emerald-400'
    case '平稳': return 'bg-blue-500/15 text-blue-400'
    case '波动': return 'bg-amber-500/15 text-amber-400'
    case '调整': return 'bg-[var(--accent-purple-faint)] text-[var(--accent-purple-text)]'
    default: return 'bg-[var(--surface-card-hover)] text-[var(--text-body)]'
  }
}

function getTrendLabel(trend: string): string {
  switch (trend) {
    case '上升': return t('zwdsAnalysis.trendUp')
    case '平稳': return t('zwdsAnalysis.trendStable')
    case '波动': return t('zwdsAnalysis.trendFluctuate')
    case '调整': return t('zwdsAnalysis.trendAdjust')
    default: return trend
  }
}

// 流年
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

const yearOptions = Array.from({ length: 21 }, (_, i) => {
  const y = currentYear - 10 + i
  return { label: `${y}${t('zwdsPan.sui')}`, value: y }
})

const currentLiunianAnalysis = computed<LiunianAnalysis | null>(() => {
  return getLiunianAnalysis(props.chart, selectedYear.value)
})

function ratingClass(rating: string): string {
  switch (rating) {
    case 'shunSui': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    case 'stable': return 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    case 'liuYi': return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    case 'jinShen': return 'border-red-500/30 bg-red-500/10 text-red-400'
    case 'yiBan': return 'border-[var(--border-light)] bg-[var(--surface-card-hover)] text-[var(--text-body)]'
    default: return 'border-[var(--border-light)] bg-[var(--surface-card-hover)] text-[var(--text-body)]'
  }
}

function ratingText(rating: string): string {
  switch (rating) {
    case 'shunSui': return t('zwdsAnalysis.ratingShunSui')
    case 'stable': return t('zwdsAnalysis.ratingPingWen')
    case 'liuYi': return t('zwdsAnalysis.ratingLiuYi')
    case 'jinShen': return t('zwdsAnalysis.ratingJinShen')
    case 'yiBan': return t('zwdsAnalysis.ratingYiBan')
    default: return t('zwdsAnalysis.ratingPingWen')
  }
}

function ratingLabel(rating: string): string {
  switch (rating) {
    case 'shunSui': return t('fortuneRadar.levels.excellent')
    case 'stable': return t('fortuneRadar.levels.stable')
    case 'liuYi': return t('fortuneRadar.levels.weak')
    case 'jinShen': return t('fortuneRadar.levels.low')
    case 'yiBan': return t('fortuneRadar.levels.good')
    default: return t('fortuneRadar.levels.stable')
  }
}

const liunianOverviewRef = ref<HTMLElement | null>(null)

function getSummary(): string {
  const parts: string[] = []
  parts.push(`【${t('zwdsAnalysis.lifePalaceLabel')}】${props.chart.mingGong.zhi}（${props.chart.mingGong.mainStars.join('、') || t('zwdsAnalysis.borrowLabel') + t('zwdsAnalysis.referenceLabel')}），${props.chart.wuxingJu}${t('zwdsPan.wuxingBureau')}`)
  parts.push(`【${t('zwdsAnalysis.bodyPalaceLabel')}】${props.chart.shenGong.zhi}（${props.chart.shenGong.mainStars.join('、') || t('zwdsAnalysis.borrowLabel') + t('zwdsAnalysis.referenceLabel')}）`)
  const dx = props.chart.currentDaXian
  if (dx) parts.push(`【${t('zwdsAnalysis.currentDaXian')}】${dx.index} ${dx.gongName}宫（${dx.gongZhi}）${dx.ageRange[0]}-${dx.ageRange[1]}${t('zwdsPan.sui')}`)
  const liu = getLiunianAnalysis(props.chart, currentYear)
  parts.push(`【${currentYear}${t('zwds.liuNian')}】${liu.summary}`)
  return parts.join('\n')
}

defineExpose({ getSummary, liunianOverviewRef })
</script>
