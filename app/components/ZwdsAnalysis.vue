<template>
  <div class="space-y-4">
    <!-- 顶部三层切换 -->
    <div class="flex gap-1 p-1 rounded-xl bg-[#1a1612] border border-white/[0.08]">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
        :class="activeTab === tab.key
          ? 'bg-[#c9a227]/15 text-[#f5e6c0]'
          : 'text-[#e8e0d0]/40 hover:text-[#e8e0d0]/70 hover:bg-white/[0.02]'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== 本命 ===== -->
    <div v-if="activeTab === 'benming'" class="space-y-3">
      <!-- 命格总览 -->
      <GlowCard title="命格总览">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div class="text-sm text-[#e8e0d0]/60">命宫</div>
            <div class="text-base font-bold text-[#c9a227]">
              {{ chart.mingGong.zhi }}宫 · {{ chart.mingGong.mainStars.join('、') || '借对宫' }}
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-[#c9a227]/10 text-[#c9a227]">{{ chart.wuxingJu }}局</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm text-[#e8e0d0]/60">身宫</div>
            <div class="text-sm text-[#f5e6c0]">
              {{ chart.shenGong.zhi }}宫 · {{ chart.shenGong.mainStars.join('、') || '借对宫' }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm text-[#e8e0d0]/60">年柱</div>
            <div class="text-sm text-[#f5e6c0]">{{ chart.yearGan }}{{ chart.yearZhi }} · {{ chart.gender === 'male' ? '阳男' : '阴女' }}</div>
          </div>
          <p class="text-xs text-[#e8e0d0]/50 leading-relaxed pt-1">
            本命盘以{{ chart.mingGong.zhi }}宫为命宫，{{ chart.mingGong.mainStars.length > 0 ? '主星' + chart.mingGong.mainStars.join('、') + '坐守' : '为空宫，借对宫星曜' }}，五行{{ chart.wuxingJu }}局。身宫在{{ chart.shenGong.zhi }}，后天发展以此为核心。
          </p>
        </div>
      </GlowCard>

      <!-- 四化总览 -->
      <GlowCard title="本命四化">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="s in benmingSiHua"
            :key="s.star + s.type"
            class="text-xs px-2 py-1 rounded border"
            :class="sihuaBadgeClass(s.type)"
          >
            {{ s.star }}化{{ s.type }} → {{ s.gongName }}宫
          </span>
          <span v-if="benmingSiHua.length === 0" class="text-xs text-[#e8e0d0]/30">四化分布平和</span>
        </div>
      </GlowCard>

      <!-- 十二宫逐宫 -->
      <GlowCard
        v-for="item in benmingAnalysis"
        :key="item.gong.name"
        :title="`${item.gong.name}（${item.gong.zhi}）${item.isMing ? '· 命宫' : ''}${item.isShen ? '· 身宫' : ''}`"
      >
        <div class="space-y-2">
          <!-- 主星 -->
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="star in item.gong.mainStars"
              :key="star"
              class="text-xs px-1.5 py-0.5 rounded font-medium"
              :class="star === '紫微' || star === '天府' ? 'bg-[#c9a227]/10 text-[#c9a227]' : 'bg-white/[0.04] text-[#f5e6c0]/80'"
            >
              {{ star }}
            </span>
            <span v-if="item.gong.mainStars.length === 0" class="text-xs text-[#e8e0d0]/30 italic">借{{ getJieDuiZhi(item.gong.zhi) }}参考</span>
          </div>
          <!-- 辅星 -->
          <div v-if="item.gong.auxStars.length" class="flex flex-wrap gap-1">
            <span
              v-for="star in item.gong.auxStars"
              :key="star"
              class="text-[10px] px-1 py-0.5 rounded text-[#e8e0d0]/50 bg-white/[0.02]"
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
          <p class="text-xs text-[#e8e0d0]/60 leading-relaxed">{{ item.brief }}</p>
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
            ? 'border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]'
            : dx.ageRange[0] <= chart.currentAge && dx.ageRange[1] >= chart.currentAge
              ? 'border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400'
              : 'border-white/[0.06] bg-white/[0.02] text-[#e8e0d0]/50 hover:border-white/10'"
          @click="selectedDaxianIndex = idx"
        >
          <div class="text-[10px] opacity-60">第{{ dx.index }}限</div>
          <div>{{ dx.ageRange[0] }}-{{ dx.ageRange[1] }}岁</div>
        </button>
      </div>

      <!-- 选中大限详情 -->
      <template v-if="currentDaxianAnalysis">
        <GlowCard :title="`${currentDaxianAnalysis.daxian.gongName}宫大限（${currentDaxianAnalysis.daxian.ageRange[0]}-${currentDaxianAnalysis.daxian.ageRange[1]}岁）`">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span v-if="currentDaxianAnalysis.isCurrent" class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">当前大限</span>
              <span class="text-xs text-[#e8e0d0]/50">主星：{{ currentDaxianAnalysis.daxian.mainStars.join('、') || '借对宫' }}</span>
            </div>
            <p class="text-sm text-[#e8e0d0]/80 leading-relaxed">{{ currentDaxianAnalysis.overview }}</p>
          </div>
        </GlowCard>

        <!-- 四维走势 -->
        <GlowCard title="四维走势">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="dim in currentDaxianAnalysis.dimensions"
              :key="dim.name"
              class="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-medium text-[#e8e0d0]/70">{{ dim.name }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  :class="trendClass(dim.trend)"
                >
                  {{ dim.trend }}
                </span>
              </div>
              <p class="text-[11px] text-[#e8e0d0]/50 leading-relaxed">{{ dim.text }}</p>
            </div>
          </div>
        </GlowCard>

        <!-- 时间节点 -->
        <GlowCard title="时间节点">
          <p class="text-sm text-[#e8e0d0]/70 leading-relaxed">{{ currentDaxianAnalysis.timeHint }}</p>
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
            base: 'bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0]',
            content: 'bg-[#1a1612] border border-white/8 rounded-xl shadow-2xl',
            item: 'text-[#f5e6c0] hover:bg-white/[0.04] data-[state=checked]:bg-[#c9a227]/10 data-[state=checked]:text-[#c9a227]',
          }"
        />
        <span class="text-xs text-[#e8e0d0]/40">选择年份查看流年运势</span>
      </div>

      <template v-if="currentLiunianAnalysis">
        <!-- 流年概览（截图目标） -->
        <GlowCard title="流年概览" ref="liunianOverviewRef">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="text-sm text-[#e8e0d0]/60">年柱</div>
              <div class="text-base font-bold text-[#f5e6c0]">{{ currentLiunianAnalysis.yearGanZhi }}</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-[#e8e0d0]/60">太岁入宫</div>
              <div class="text-sm text-[#f5e6c0]">{{ currentLiunianAnalysis.taiSuiGong }}宫（{{ currentLiunianAnalysis.taiSuiZhi }}）</div>
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
            <p class="text-xs text-[#e8e0d0]/50 leading-relaxed">{{ currentLiunianAnalysis.summary }}</p>
          </div>
        </GlowCard>

        <!-- 吉凶评级 -->
        <GlowCard title="吉凶评级">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold border"
              :class="ratingClass(currentLiunianAnalysis.rating)"
            >
              {{ currentLiunianAnalysis.rating }}
            </div>
            <div class="flex-1">
              <p class="text-sm text-[#e8e0d0]/80 leading-relaxed">
                {{ ratingText(currentLiunianAnalysis.rating) }}
              </p>
            </div>
          </div>
        </GlowCard>

        <!-- 四维当年 -->
        <GlowCard title="当年走势">
          <div class="space-y-2.5">
            <div
              v-for="dim in currentLiunianAnalysis.dimensions"
              :key="dim.name"
              class="flex items-start gap-2"
            >
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#e8e0d0]/50 shrink-0 mt-0.5">{{ dim.name }}</span>
              <p class="text-xs text-[#e8e0d0]/60 leading-relaxed">{{ dim.text }}</p>
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

const tabs = [
  { key: 'benming' as const, label: '本命' },
  { key: 'daxian' as const, label: '大限' },
  { key: 'liunian' as const, label: '流年' },
]

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
    case '禄': return 'border-[#c9a227]/20 bg-[#c9a227]/10 text-[#c9a227]'
    case '权': return 'border-red-500/20 bg-red-500/10 text-red-400'
    case '科': return 'border-[#8b5cf6]/20 bg-[#8b5cf6]/10 text-[#8b5cf6]'
    case '忌': return 'border-gray-500/20 bg-gray-500/10 text-gray-400'
    default: return 'border-white/10 bg-white/5 text-[#e8e0d0]'
  }
}

function sihuaDotClass(type: string): string {
  switch (type) {
    case '禄': return 'bg-[#c9a227]/20 text-[#c9a227]'
    case '权': return 'bg-red-500/20 text-red-400'
    case '科': return 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
    case '忌': return 'bg-gray-500/20 text-gray-400'
    default: return 'bg-white/10 text-[#e8e0d0]'
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
    case '调整': return 'bg-[#8b5cf6]/15 text-[#8b5cf6]'
    default: return 'bg-white/5 text-[#e8e0d0]'
  }
}

// 流年
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

const yearOptions = Array.from({ length: 21 }, (_, i) => {
  const y = currentYear - 10 + i
  return { label: `${y}年`, value: y }
})

const currentLiunianAnalysis = computed<LiunianAnalysis | null>(() => {
  return getLiunianAnalysis(props.chart, selectedYear.value)
})

function ratingClass(rating: string): string {
  switch (rating) {
    case '顺遂': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    case '平稳': return 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    case '留意': return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    case '谨慎': return 'border-red-500/30 bg-red-500/10 text-red-400'
    default: return 'border-white/10 bg-white/5 text-[#e8e0d0]'
  }
}

function ratingText(rating: string): string {
  switch (rating) {
    case '顺遂': return '整体运势向好，适合主动推进计划，把握机会。'
    case '平稳': return '运势平稳，无大起大落，按部就班即可。'
    case '留意': return '部分领域有波动信号，保持警觉，遇事先观察。'
    case '谨慎': return '多宫受冲，宜守不宜攻，重大决策建议延后或多方求证。'
    default: return '运势一般，平常心对待。'
  }
}

const liunianOverviewRef = ref<HTMLElement | null>(null)

function getSummary(): string {
  const parts: string[] = []
  parts.push(`【命格总览】命宫${props.chart.mingGong.zhi}（${props.chart.mingGong.mainStars.join('、') || '借对宫'}），${props.chart.wuxingJu}局`)
  parts.push(`【身宫】${props.chart.shenGong.zhi}（${props.chart.shenGong.mainStars.join('、') || '借对宫'}）`)
  const dx = props.chart.currentDaXian
  if (dx) parts.push(`【当前大限】第${dx.index}大限 ${dx.gongName}宫（${dx.gongZhi}）${dx.ageRange[0]}-${dx.ageRange[1]}岁`)
  const liu = getLiunianAnalysis(props.chart, currentYear)
  parts.push(`【${currentYear}流年】${liu.summary}`)
  return parts.join('\n')
}

defineExpose({ getSummary, liunianOverviewRef })
</script>
