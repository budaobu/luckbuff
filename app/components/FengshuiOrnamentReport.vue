<template>
  <div class="fso">
    <div class="fso-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="fso-head">
        <div class="fso-head-top">
          <div class="fso-brand">
            <div class="fso-seal">{{ $t('fengshuiOrnament.report.seal') }}</div>
            <span class="fso-brand-name">{{ $t('fengshuiOrnament.report.brandName') }}</span>
          </div>
          <div class="fso-head-right">
            <span class="fso-time">{{ $t('fengshuiOrnament.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="fso-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="fso-title">{{ $t('fengshuiOrnament.report.reportTitle') }}</h1>
        <p class="fso-subtitle">{{ subtitleText }}</p>

        <div class="fso-head-bottom">
          <p class="fso-meta-line">{{ sitFaceLine }}</p>
          <p class="fso-meta-line">{{ liunianLine }}</p>
        </div>
      </header>

      <!-- ============ 房间信息 + 格局定论 ============ -->
      <section class="fso-row fso-row-top">
        <div class="fso-card fso-profile">
          <h3 class="fso-card-title">{{ $t('fengshuiOrnament.report.roomInfoTitle') }}</h3>
          <div class="fso-profile-line">
            <span class="fso-ico">⌂</span>
            <span class="fso-profile-label">{{ $t('fengshuiOrnament.report.roomTypeLabel') }}</span>
            <span class="fso-profile-value">{{ roomTypeText }}</span>
          </div>
          <div class="fso-profile-line">
            <span class="fso-ico">⊕</span>
            <span class="fso-profile-label">{{ $t('fengshuiOrnament.report.facingLabel') }}</span>
            <span class="fso-profile-value">{{ result.xuankong.sittingLabel }}{{ result.xuankong.facingLabel }}</span>
          </div>
          <div class="fso-profile-line">
            <span class="fso-ico">◎</span>
            <span class="fso-profile-label">{{ $t('fengshuiOrnament.report.periodLabel') }}</span>
            <span class="fso-profile-value">{{ result.xuankong.period.name }}</span>
          </div>
          <div class="fso-profile-line">
            <span class="fso-ico">▦</span>
            <span class="fso-profile-label">{{ $t('fengshuiOrnament.report.sizeLabel') }}</span>
            <span class="fso-profile-value">{{ result.roomGeometry.lengthM }}×{{ result.roomGeometry.widthM }}m</span>
          </div>
          <div class="fso-profile-line">
            <span class="fso-ico">🜲</span>
            <span class="fso-profile-label">{{ $t('fengshuiOrnament.report.doorLabel') }}</span>
            <span class="fso-profile-value">{{ directionLabel(result.roomGeometry.doorDirection) }}</span>
          </div>
        </div>

        <div class="fso-card fso-pattern">
          <h3 class="fso-card-title">{{ $t('fengshuiOrnament.report.patternTitle') }}</h3>
          <div v-if="result.xuankong.pattern" class="fso-pattern-body">
            <div class="fso-pattern-name">{{ t(`xuankong.patterns.${result.xuankong.pattern.key}`) }}</div>
            <p class="fso-pattern-desc">{{ t(`xuankong.patternDescriptions.${result.xuankong.pattern.key}`) }}</p>
          </div>
          <p v-else class="fso-pattern-desc">{{ $t('fengshuiOrnament.report.patternNone') }}</p>

          <div class="fso-liunian-chips">
            <span class="fso-chip">
              {{ $t('fengshuiOrnament.report.chipGanzhi') }}：{{ result.liunian.ganzhiYear }}
            </span>
            <span class="fso-chip fso-chip-warn">
              {{ $t('fengshuiOrnament.report.chipTaisui') }}：{{ directionLabel(result.liunian.taiSuiDirection) }}
            </span>
            <span class="fso-chip fso-chip-warn">
              {{ $t('fengshuiOrnament.report.chipSuipo') }}：{{ directionLabel(result.liunian.suiPoDirection) }}
            </span>
            <span class="fso-chip fso-chip-warn">
              {{ $t('fengshuiOrnament.report.chipSansha') }}：{{ directionLabel(result.liunian.sanShaDirection) }}
            </span>
          </div>
        </div>
      </section>

      <!-- ============ 九宫判定盘 ============ -->
      <section class="fso-section">
        <div class="fso-card fso-pan">
          <h3 class="fso-pan-title">{{ $t('fengshuiOrnament.report.palaceTitle') }}</h3>
          <p class="fso-pan-note">{{ result.roomGeometry.sectorNote }}</p>
          <div class="fso-grid9">
            <div
              v-for="cell in gridCells"
              :key="cell.direction"
              class="fso-cell"
              :class="cellClass(cell)"
            >
              <div class="fso-cell-head">
                <span class="fso-cell-dir">{{ directionLabel(cell.direction) }}</span>
                <span v-if="cell.isDoor" class="fso-flag fso-flag-door">{{ $t('fengshuiOrnament.flagDoor') }}</span>
                <span v-else-if="cell.hasIrregularCorner" class="fso-flag fso-flag-irr">{{ $t('fengshuiOrnament.flagIrregular') }}</span>
              </div>
              <div class="fso-cell-stars">
                <span class="fso-star-big">{{ cell.mountainStar }}</span>
                <span class="fso-star-sep">/</span>
                <span class="fso-star-big">{{ cell.facingStar }}</span>
                <span class="fso-star-sep">/</span>
                <span class="fso-star-year">{{ cell.yearStar }}</span>
              </div>
              <div class="fso-cell-badges">
                <span v-if="cell.isTaiSui" class="fso-badge">{{ $t('fengshuiOrnament.shaTaiSui') }}</span>
                <span v-if="cell.isWuHuang" class="fso-badge">{{ $t('fengshuiOrnament.shaWuHuang') }}</span>
                <span v-if="cell.isSanSha" class="fso-badge">{{ $t('fengshuiOrnament.shaSanSha') }}</span>
                <span v-if="cell.isAnJianSha" class="fso-badge">{{ $t('fengshuiOrnament.shaAnJian') }}</span>
                <span class="fso-badge fso-badge-gap" :class="gapBadgeClass(cell.elementGap)">
                  {{ t(`fengshuiOrnament.gapTypes.${cell.elementGap}`) }}
                </span>
              </div>
            </div>
          </div>
          <p class="fso-legend">{{ $t('fengshuiOrnament.chartLegend') }}</p>
        </div>
      </section>

      <!-- ============ 五行平衡柱状图 ============ -->
      <section class="fso-section">
        <div class="fso-card fso-chart">
          <h3 class="fso-card-title">{{ $t('fengshuiOrnament.report.elementChartTitle') }}</h3>
          <p class="fso-chart-note">{{ $t('fengshuiOrnament.report.elementChartNote') }}</p>
          <div class="fso-chart-wrap">
            <Bar :data="elementChartData" :options="elementChartOptions" />
          </div>
        </div>
      </section>

      <!-- ============ 逐人游星 ============ -->
      <section class="fso-section">
        <h3 class="fso-section-title">{{ $t('fengshuiOrnament.report.personTitle') }}</h3>
        <div
          v-for="person in result.perPerson"
          :key="person.nickname"
          class="fso-card fso-person"
        >
          <div class="fso-person-head">
            <h4 class="fso-person-name">
              {{ person.nickname }}
              <span class="fso-person-sub">{{ person.mingGua }}{{ $t('fengshuiOrnament.mingGuaSuffix') }}（{{ person.dongSiMing }}）</span>
            </h4>
            <span class="fso-person-room">
              {{ $t('fengshuiOrnament.report.roomStarShort', { direction: directionLabel(person.roomFacingStar.direction), star: person.roomFacingStar.star }) }}
            </span>
          </div>

          <div class="fso-person-body">
            <!-- 游星雷达图 -->
            <div class="fso-person-radar">
              <Radar :data="radarData(person)" :options="radarOptions" />
              <p class="fso-radar-note">{{ $t('fengshuiOrnament.report.radarNote') }}</p>
            </div>

            <!-- 游星分布表格 -->
            <div class="fso-person-table-wrap">
              <table class="fso-table">
                <thead>
                  <tr>
                    <th v-for="dir in eightDirections" :key="dir">{{ directionLabel(dir) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      v-for="dir in eightDirections"
                      :key="dir"
                      :class="{ 'fso-td-ausp': isAuspiciousYouxing(person.baguaAssignment[dir]) }"
                    >
                      {{ person.baguaAssignment[dir] ? t(`fengshuiOrnament.youxing.${person.baguaAssignment[dir]}`) : '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- 专属吉位 -->
              <div class="fso-person-pos">
                <span v-if="person.wenchangDirection" class="fso-pos">
                  {{ $t('fengshuiOrnament.posWenchang') }}：{{ directionLabel(person.wenchangDirection) }}
                </span>
                <span v-if="person.taohuaDirection" class="fso-pos">
                  {{ $t('fengshuiOrnament.posTaohua') }}：{{ directionLabel(person.taohuaDirection) }}
                </span>
                <span v-for="dir in person.guirenDirections" :key="dir" class="fso-pos">
                  {{ $t('fengshuiOrnament.posGuiren') }}：{{ directionLabel(dir) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 解读章节 ============ -->
      <section class="fso-section">
        <div class="fso-card fso-ai">
          <h3 class="fso-ai-title">
            <span class="fso-ai-no">✦</span>{{ $t('fengshuiOrnament.report.aiTitle') }}
            <span v-if="streaming" class="fso-streaming-inline">
              {{ $t('fengshuiOrnament.interpreting') }}<span class="fso-streaming-dot" />
            </span>
          </h3>

          <div v-if="aiSectionList.length > 0" class="fso-ai-list">
            <div
              v-for="(section, index) in aiSectionList"
              :key="section.title + index"
              class="fso-ai-item"
            >
              <h4 class="fso-ai-item-head">
                <span class="fso-ai-item-no">{{ String(index + 1).padStart(2, '0') }}</span>
                {{ section.title }}
              </h4>
              <div class="fso-ai-body fso-md" v-html="renderSection(section.content)" />
              <span
                v-if="streaming && index === aiSectionList.length - 1"
                class="fso-cursor"
              />
            </div>
          </div>

          <div v-else class="fso-ai-body fso-md">
            <p class="fso-pending">{{ pendingText }}</p>
          </div>
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="fso-streaming">
        <span class="fso-streaming-dot" />
        {{ $t('fengshuiOrnament.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="fso-error">
        <p>{{ error }}</p>
        <button type="button" class="fso-retry" @click="$emit('retry')">{{ $t('fengshuiOrnament.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="fso-foot">
        <span class="fso-foot-note">ⓘ {{ $t('fengshuiOrnament.disclaimer') }}</span>
        <span class="fso-seal fso-seal-foot">{{ $t('fengshuiOrnament.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { Bar, Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import type { Direction } from '~/utils/bazhai'
import type { ElementGap } from '~/utils/ornament-rules'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend,
)

type YouXingKey = 'shengqi' | 'tianyi' | 'yannian' | 'fuwei' | 'wugui' | 'liusha' | 'huohai' | 'jueming'

interface EnvironmentPalace {
  direction: Direction | '中宫'
  mountainStar: number
  facingStar: number
  periodStar: number
  yearStar: number
  isTaiSui: boolean
  isWuHuang: boolean
  isSanSha: boolean
  isAnJianSha: boolean
  isDoor: boolean
  hasIrregularCorner: boolean
  elementGap: ElementGap
  gapReasons: string[]
}

interface PerPersonResult {
  nickname: string
  gender: 'male' | 'female'
  mingGua: string
  mingGuaNumber: number
  dongSiMing: string
  dayGan: string
  yearZhi: string
  baguaAssignment: Partial<Record<Direction, YouXingKey>>
  roomFacingStar: { direction: Direction; star: string; auspicious: boolean }
  matchedPositions: { wenchang: boolean; taohua: boolean; guiren: boolean }
  wenchangDirection: Direction | null
  taohuaDirection: Direction | null
  guirenDirections: Direction[]
}

interface CalcResult {
  roomType: string
  direction: number
  year: number
  roomGeometry: {
    lengthM: number
    widthM: number
    doorDirection: Direction
    sectorNote: string
    irregular?: Array<{ direction: Direction; type: 'missing' | 'protruding' }>
  }
  xuankong: {
    period: { number: number; name: string; startYear: number; endYear: number }
    sittingLabel: string
    facingLabel: string
    pattern: { key: string; name: string; description: string } | null
    warning: string | null
  }
  liunian: {
    ganzhiYear: string
    yearCenter: number
    taiSuiDirection: Direction
    suiPoDirection: Direction
    sanShaDirection: Direction
  }
  environment: { palaces: EnvironmentPalace[] }
  perPerson: PerPersonResult[]
  locale: string
}

interface Props {
  result: CalcResult
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

const eightDirections: Direction[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

/* ---------- 报告头 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const verdict = computed(() =>
  props.result.xuankong.pattern
    ? t('fengshuiOrnament.report.verdictGood')
    : t('fengshuiOrnament.report.verdictPlain'))

const subtitleText = computed(() =>
  props.result.xuankong.pattern
    ? t(`xuankong.patterns.${props.result.xuankong.pattern.key}`)
    : t('fengshuiOrnament.report.subtitleFallback'))

const sitFaceLine = computed(() =>
  `${props.result.xuankong.sittingLabel}${props.result.xuankong.facingLabel} · ${props.result.xuankong.period.name}`)

const liunianLine = computed(() =>
  `${props.result.liunian.ganzhiYear}${t('fengshuiOrnament.liunianSuffix')}`)

const roomTypeText = computed(() => {
  // 复用共享 roomTypeSelector 命名空间（与 RoomTypeSelector 同源）
  const key = `roomTypeSelector.room${props.result.roomType.charAt(0).toUpperCase()}${props.result.roomType.slice(1)}`
  const val = t(key)
  return val && val !== key ? val : props.result.roomType
})

/* ---------- 九宫格 ---------- */

const gridCells = computed(() => {
  const order = ['东南', '南', '西南', '东', '中宫', '西', '东北', '北', '西北']
  return order
    .map(dir => props.result.environment.palaces.find(p => p.direction === dir))
    .filter((p): p is EnvironmentPalace => Boolean(p))
})

function directionKey(dir: string): string {
  const map: Record<string, string> = {
    北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw', 中宫: 'center',
  }
  return map[dir] || 'center'
}
function directionLabel(dir: string): string {
  return t(`fengshuiOrnament.directions.${directionKey(dir)}`)
}

function cellClass(cell: EnvironmentPalace) {
  if (cell.isTaiSui || cell.isWuHuang || cell.isSanSha || cell.isAnJianSha) return 'fso-cell-sha'
  if (cell.elementGap !== 'neutral' && cell.elementGap !== 'avoid_only') return 'fso-cell-boost'
  return ''
}
function gapBadgeClass(gap: ElementGap) {
  if (gap === 'avoid_only') return 'fso-gap-avoid'
  if (gap === 'neutral') return 'fso-gap-neutral'
  return 'fso-gap-boost'
}

const AUSPICIOUS_YOUXING: YouXingKey[] = ['shengqi', 'tianyi', 'yannian', 'fuwei']
function isAuspiciousYouxing(key: YouXingKey | undefined): boolean {
  return key !== undefined && AUSPICIOUS_YOUXING.includes(key)
}

/* ---------- 五行平衡柱状图 ---------- */

/** 八卦 → 五行 */
const PALACE_ELEMENT: Record<string, 'metal' | 'wood' | 'water' | 'fire' | 'earth'> = {
  北: 'water', 西南: 'earth', 东: 'wood', 东南: 'wood',
  中宫: 'earth', 西北: 'metal', 西: 'metal', 东北: 'earth', 南: 'fire',
}
const ELEMENT_ORDER = ['metal', 'wood', 'water', 'fire', 'earth'] as const
const ELEMENT_COLORS: Record<string, string> = {
  metal: '#7d7d68', wood: '#4a7c59', water: '#4a6a8a', fire: '#a8512e', earth: '#8a6d3b',
}
/** 缺口类型对五行的修正强度（示意） */
const GAP_WEIGHT: Record<ElementGap, number> = {
  metal_drain: -2, water_boost: 2, wood_boost: 2, fire_boost: 2, earth_boost: 2,
  avoid_only: -1, neutral: 0,
}
const GAP_ELEMENT: Record<string, 'metal' | 'wood' | 'water' | 'fire' | 'earth' | null> = {
  metal_drain: 'metal', water_boost: 'water', wood_boost: 'wood',
  fire_boost: 'fire', earth_boost: 'earth', avoid_only: null, neutral: null,
}

const elementCounts = computed(() => {
  const counts: Record<string, number> = { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 }
  for (const p of props.result.environment.palaces) {
    const el = PALACE_ELEMENT[p.direction]
    if (el) counts[el]! += 1
    const gapEl = GAP_ELEMENT[p.elementGap]
    if (gapEl) counts[gapEl]! += GAP_WEIGHT[p.elementGap] ?? 0
  }
  return counts
})

const elementChartData = computed(() => ({
  labels: ELEMENT_ORDER.map(el => t(`fengshuiOrnament.report.elements.${el}`)),
  datasets: [{
    data: ELEMENT_ORDER.map(el => elementCounts.value[el] ?? 0),
    backgroundColor: ELEMENT_ORDER.map(el => `${ELEMENT_COLORS[el]}cc`),
    borderColor: ELEMENT_ORDER.map(el => ELEMENT_COLORS[el]),
    borderWidth: 1.5,
    borderRadius: 3,
    maxBarThickness: 42,
  }],
}))

const elementChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#55503f', font: { size: 12, family: "'Noto Serif SC', serif" } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(85, 80, 63, 0.12)' },
      ticks: { color: '#8a8272', font: { size: 10 }, precision: 0 },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(250, 246, 236, 0.96)',
      titleColor: '#2e2a24',
      bodyColor: '#55503f',
      borderColor: '#d8d0bd',
      borderWidth: 1,
      padding: 8,
      displayColors: false,
    },
  },
}

/* ---------- 逐人游星雷达图 ---------- */

/** 游星吉凶权重（示意：吉=90/70，凶=20/40） */
const YOUXING_SCORE: Record<YouXingKey, number> = {
  shengqi: 95, tianyi: 85, yannian: 80, fuwei: 65,
  wugui: 35, liusha: 30, huohai: 25, jueming: 12,
}

function radarData(person: PerPersonResult) {
  const labels = eightDirections.map(d => directionLabel(d))
  const data = eightDirections.map(d => {
    const key = person.baguaAssignment[d]
    return key ? YOUXING_SCORE[key] : 50
  })
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: 'rgba(140, 47, 38, 0.12)',
      borderColor: '#8c2f26',
      pointBackgroundColor: '#a8512e',
      pointBorderColor: '#faf6ec',
      pointBorderWidth: 1.5,
      pointRadius: 3.5,
      borderWidth: 1.5,
    }],
  }
}

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: { display: false, stepSize: 25 },
      grid: { color: 'rgba(85, 80, 63, 0.14)' },
      angleLines: { color: 'rgba(85, 80, 63, 0.14)' },
      pointLabels: { color: '#55503f', font: { size: 10, family: "'Noto Serif SC', serif" } },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(250, 246, 236, 0.96)',
      titleColor: '#2e2a24',
      bodyColor: '#55503f',
      borderColor: '#d8d0bd',
      borderWidth: 1,
      padding: 8,
      displayColors: false,
    },
  },
}

/* ---------- AI 内容解析 ---------- */

interface AiSection { title: string; content: string }

const aiSectionList = computed<AiSection[]>(() => {
  const text = props.aiContent || ''
  if (!text) return []
  const raws = text.split(/\n(?=##\s)/)
  const out: AiSection[] = []
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const title = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (title || content) out.push({ title: title || t('fengshuiOrnament.interpretation'), content })
  }
  return out
})

const pendingText = computed(() => t('fengshuiOrnament.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) return `<p class="fso-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题（沿用 bzr 纸色语言） ========== */
.fso {
  --fso-bg: #f2ede3;
  --fso-sheet: #faf6ec;
  --fso-card: #fffdf6;
  --fso-ink: #2e2a24;
  --fso-ink-soft: #55503f;
  --fso-ink-faint: #8a8272;
  --fso-line: #d8d0bd;
  --fso-line-soft: #e6dfcd;
  --fso-accent: #8c2f26;
  --fso-accent-soft: #a8512e;
  --fso-star: #8c6d1f;
  --fso-green: #4a7c59;
  border-radius: 12px;
  background: var(--fso-bg);
  padding: 18px;
  color: var(--fso-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.fso-sheet {
  background: var(--fso-sheet);
  border: 1px solid var(--fso-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.fso-head { border-bottom: 2px solid var(--fso-ink); padding-bottom: 16px; }
.fso-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.fso-brand { display: flex; align-items: center; gap: 8px; }
.fso-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--fso-accent);
  color: var(--fso-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px; transform: rotate(-4deg);
  letter-spacing: 1px; padding: 2px;
}
.fso-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--fso-ink-soft); }
.fso-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--fso-ink-faint); }
.fso-verdict { color: var(--fso-green); font-weight: 600; }

.fso-title { margin: 14px 0 6px; font-size: 30px; font-weight: 700; letter-spacing: 4px; text-align: center; }
.fso-subtitle { text-align: center; font-size: 13px; color: var(--fso-ink-soft); letter-spacing: 1px; margin: 0 0 12px; }
.fso-head-bottom { text-align: center; }
.fso-meta-line { margin: 2px 0; font-size: 12px; color: var(--fso-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.fso-row { display: grid; gap: 14px; margin-top: 16px; }
.fso-row-top { grid-template-columns: 1fr 2fr; }
.fso-section { margin-top: 16px; }
.fso-card { background: var(--fso-card); border: 1px solid var(--fso-line); padding: 14px 16px; }
.fso-card-title {
  margin: 0 0 10px; font-size: 14px; font-weight: 700; letter-spacing: 2px;
  border-bottom: 1px solid var(--fso-line-soft); padding-bottom: 8px; text-align: center;
}
.fso-section-title { margin: 0 0 8px; font-size: 14px; font-weight: 700; letter-spacing: 2px; }

/* ---------- 房间信息卡 ---------- */
.fso-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.fso-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.fso-ico { color: var(--fso-accent-soft); font-size: 12px; }
.fso-profile-label { color: var(--fso-ink-faint); min-width: 42px; }
.fso-profile-value { color: var(--fso-ink); letter-spacing: 0.5px; }

/* ---------- 格局定论卡 ---------- */
.fso-pattern { display: flex; flex-direction: column; gap: 8px; }
.fso-pattern-body { text-align: center; padding: 6px 0; }
.fso-pattern-name { font-size: 22px; font-weight: 700; letter-spacing: 3px; color: var(--fso-accent); }
.fso-pattern-desc { font-size: 12px; color: var(--fso-ink-soft); line-height: 1.7; margin: 6px 0 0; }
.fso-liunian-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; padding-top: 10px; border-top: 1px dashed var(--fso-line-soft); }
.fso-chip {
  font-size: 10.5px; padding: 2px 8px; border-radius: 2px;
  background: rgba(74, 124, 89, 0.10); color: var(--fso-green);
  border: 1px solid rgba(74, 124, 89, 0.3); letter-spacing: 0.5px;
}
.fso-chip-warn { background: rgba(140, 47, 38, 0.08); color: var(--fso-accent); border-color: rgba(140, 47, 38, 0.3); }

/* ---------- 九宫判定盘 ---------- */
.fso-pan { padding: 12px; }
.fso-pan-title { margin: 0 0 4px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.fso-pan-note { margin: 0 0 10px; font-size: 10px; color: var(--fso-ink-faint); text-align: center; }
.fso-grid9 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.fso-cell {
  border: 1px solid var(--fso-line-soft); background: var(--fso-card);
  padding: 6px 6px; min-height: 92px;
  display: flex; flex-direction: column; justify-content: space-between; gap: 4px;
}
.fso-cell-sha { border: 1px solid rgba(140, 47, 38, 0.4); background: rgba(140, 47, 38, 0.05); }
.fso-cell-boost { border: 1px solid rgba(140, 109, 31, 0.45); background: rgba(140, 109, 31, 0.06); }
.fso-cell-head { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
.fso-cell-dir { font-size: 9px; color: var(--fso-ink-faint); }
.fso-flag { font-size: 8px; padding: 0 2px; line-height: 1.4; border: 1px solid; }
.fso-flag-door { color: var(--fso-accent-soft); border-color: currentColor; }
.fso-flag-irr { color: var(--fso-star); border-color: currentColor; }
.fso-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 2px; }
.fso-star-big { font-size: 16px; font-weight: 700; }
.fso-star-sep { font-size: 9px; color: var(--fso-ink-faint); }
.fso-star-year { font-size: 12px; color: var(--fso-ink-soft); }
.fso-cell-badges { display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; }
.fso-badge { font-size: 8px; padding: 0 2px; line-height: 1.5; border: 1px solid rgba(140, 47, 38, 0.4); color: var(--fso-accent); background: rgba(140, 47, 38, 0.08); }
.fso-badge-gap { border-style: solid; }
.fso-gap-avoid { color: var(--fso-accent); border-color: rgba(140, 47, 38, 0.4); background: rgba(140, 47, 38, 0.08); }
.fso-gap-neutral { color: var(--fso-ink-faint); border-color: var(--fso-line); background: var(--fso-sheet); }
.fso-gap-boost { color: var(--fso-star); border-color: rgba(140, 109, 31, 0.45); background: rgba(140, 109, 31, 0.08); }
.fso-legend { margin: 8px 0 0; font-size: 9px; color: var(--fso-ink-faint); }

/* ---------- 五行平衡柱状图 ---------- */
.fso-chart-note { margin: 0 0 10px; font-size: 10px; color: var(--fso-ink-faint); text-align: center; }
.fso-chart-wrap { position: relative; height: 220px; }

/* ---------- 逐人游星 ---------- */
.fso-person { padding: 12px 14px; }
.fso-person-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; border-bottom: 1px solid var(--fso-line-soft); padding-bottom: 8px; margin-bottom: 10px; }
.fso-person-name { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.fso-person-sub { font-size: 11px; font-weight: 400; color: var(--fso-ink-faint); margin-left: 6px; }
.fso-person-room { font-size: 10px; color: var(--fso-ink-faint); }
.fso-person-body { display: grid; grid-template-columns: 220px 1fr; gap: 14px; align-items: start; }
.fso-person-radar { position: relative; height: 220px; }
.fso-radar-note { margin: 6px 0 0; font-size: 9px; color: var(--fso-ink-faint); text-align: center; }
.fso-person-table-wrap { min-width: 0; }
.fso-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.fso-table th, .fso-table td { border: 1px solid var(--fso-line); padding: 6px 4px; text-align: center; line-height: 1.4; }
.fso-table thead th { background: var(--fso-line-soft); font-weight: 700; color: var(--fso-ink); letter-spacing: 1px; }
.fso-table td { color: var(--fso-ink-soft); }
.fso-td-ausp { color: var(--fso-accent); font-weight: 700; background: rgba(140, 47, 38, 0.05); }
.fso-person-pos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.fso-pos {
  font-size: 10.5px; padding: 2px 8px; border-radius: 2px;
  background: rgba(74, 124, 89, 0.10); color: var(--fso-green);
  border: 1px solid rgba(74, 124, 89, 0.3); letter-spacing: 0.5px;
}

/* ---------- AI 章节 ---------- */
.fso-ai-title {
  margin: 0 0 10px; font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--fso-line-soft); padding-bottom: 8px;
}
.fso-ai-no { font-size: 11px; color: #f5efe0; background: var(--fso-ink); padding: 2px 6px; letter-spacing: 1px; }
.fso-streaming-inline { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--fso-ink-faint); display: flex; align-items: center; gap: 6px; }
.fso-ai-list { display: flex; flex-direction: column; gap: 12px; }
.fso-ai-item { border: 1px dashed var(--fso-line); background: rgba(255, 255, 255, 0.4); padding: 12px 14px; }
.fso-ai-item-head { margin: 0 0 8px; font-size: 13px; font-weight: 700; letter-spacing: 1px; color: var(--fso-ink); display: flex; align-items: center; gap: 8px; }
.fso-ai-item-no { font-size: 10px; color: #f5efe0; background: var(--fso-accent-soft); padding: 1px 6px; letter-spacing: 1px; }
.fso-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--fso-ink-soft); }
.fso-cursor { display: inline-block; width: 2px; height: 14px; background: var(--fso-accent); vertical-align: middle; animation: fso-pulse 1s ease-in-out infinite; }

.fso-md :deep(p) { margin: 0 0 0.7em; }
.fso-md :deep(p:last-child) { margin-bottom: 0; }
.fso-md :deep(strong) { color: var(--fso-ink); font-weight: 700; }
.fso-md :deep(ul), .fso-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.fso-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.fso-md :deep(h3), .fso-md :deep(h4) { font-size: 12.5px; font-weight: 700; color: var(--fso-ink); margin: 0.8em 0 0.4em; letter-spacing: 1px; }
.fso-md { overflow-x: auto; }
.fso-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.fso-md :deep(th), .fso-md :deep(td) { border: 1px solid var(--fso-line); padding: 4px 6px; text-align: left; }
.fso-md :deep(th) { background: var(--fso-line-soft); font-weight: 700; color: var(--fso-ink); }
.fso-md :deep(blockquote) { margin: 0.5em 0; padding: 6px 10px; border-left: 2px solid var(--fso-accent-soft); background: rgba(168, 81, 46, 0.05); }
.fso-md :deep(.fso-pending), .fso-pending { color: var(--fso-ink-faint); font-style: italic; }

.fso-streaming { margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: var(--fso-ink-faint); letter-spacing: 1px; }
.fso-streaming-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--fso-accent); animation: fso-pulse 1s ease-in-out infinite; }
@keyframes fso-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.fso-error { margin-top: 14px; text-align: center; color: var(--fso-accent); font-size: 12px; }
.fso-retry {
  margin-top: 8px; border: 1px solid var(--fso-accent); background: transparent;
  color: var(--fso-accent); font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.fso-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.fso-foot { margin-top: 18px; border-top: 1px solid var(--fso-line); padding-top: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.fso-foot-note { font-size: 10px; color: var(--fso-ink-faint); max-width: 70%; }
.fso-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
.fso-pan, .fso-chart, .fso-person, .fso-person-body, .fso-person-table-wrap, .fso-chart-wrap { min-width: 0; }

@media (max-width: 1100px) {
  .fso-row-top { grid-template-columns: 1fr; }
  .fso-person-body { grid-template-columns: 1fr; }
  .fso-person-radar { max-width: 320px; margin: 0 auto; }
}

@media (max-width: 720px) {
  .fso { padding: 8px; }
  .fso-sheet { padding: 16px 12px; }
  .fso-title { font-size: 22px; letter-spacing: 2px; }
  .fso-grid9 { gap: 2px; }
  .fso-cell { min-height: 78px; padding: 4px; }
  .fso-star-big { font-size: 13px; }
  .fso-star-year { font-size: 10px; }
  .fso-chart-wrap { height: 180px; }
  .fso-person-radar { height: 200px; }
  .fso-table { min-width: 460px; }
  .fso-person-table-wrap { overflow-x: auto; }
}
</style>
