<template>
  <div class="zbr">
    <div class="zbr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="zbr-head">
        <div class="zbr-head-top">
          <div class="zbr-brand">
            <div class="zbr-seal">{{ $t('zibaifeixing.report.seal') }}</div>
            <span class="zbr-brand-name">{{ $t('zibaifeixing.report.brandName') }}</span>
          </div>
          <div class="zbr-head-right">
            <span class="zbr-time">{{ $t('zibaifeixing.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="zbr-rating">{{ $t('zibaifeixing.report.rating') }}</span>
            <span class="zbr-verdict" :class="{ 'zbr-verdict-warn': hasOminousCenter }">
              {{ hasOminousCenter ? '△' : '✓' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="zbr-title">{{ titleText }}</h1>
        <p class="zbr-subtitle">{{ subtitleText }}</p>

        <div class="zbr-head-bottom">
          <p class="zbr-meta-line">
            {{ $t('zibaifeixing.report.metaDate', { year: result.input.year, month: result.input.month, day: result.input.day }) }}
            · {{ $t('zibaifeixing.report.metaLunar', { year: result.input.lunarYear, branch: result.input.lunarYearBranch, month: result.input.lunarMonth, day: result.input.lunarDay }) }}
          </p>
          <p class="zbr-meta-line">
            {{ $t('zibaifeixing.report.metaJieqi', { jieqi: result.currentJieqi.name }) }}
            · {{ $t('zibaifeixing.report.metaIntent', { intent: intentText }) }}
          </p>
        </div>
      </header>

      <!-- ============ 排盘档案 + 吉凶概览 ============ -->
      <section class="zbr-row zbr-row-top">
        <div class="zbr-card zbr-profile">
          <div class="zbr-profile-line">
            <span class="zbr-ico">◷</span>
            <span class="zbr-profile-label">{{ $t('zibaifeixing.report.profileDate') }}</span>
            <span class="zbr-profile-value">{{ result.input.year }}-{{ pad2(result.input.month) }}-{{ pad2(result.input.day) }}</span>
          </div>
          <div class="zbr-profile-line">
            <span class="zbr-ico">☯</span>
            <span class="zbr-profile-label">{{ $t('zibaifeixing.report.profileLunar') }}</span>
            <span class="zbr-profile-value">{{ result.input.lunarYearBranch }} · {{ result.input.lunarMonth }}/{{ result.input.lunarDay }}</span>
          </div>
          <div class="zbr-profile-line">
            <span class="zbr-ico">❄</span>
            <span class="zbr-profile-label">{{ $t('zibaifeixing.report.profileJieqi') }}</span>
            <span class="zbr-profile-value">{{ result.currentJieqi.name }}</span>
          </div>
          <div class="zbr-profile-line">
            <span class="zbr-ico">⌖</span>
            <span class="zbr-profile-label">{{ $t('zibaifeixing.report.profileIntent') }}</span>
            <span class="zbr-profile-value">{{ intentText }}</span>
          </div>
        </div>

        <div class="zbr-card zbr-overview">
          <h3 class="zbr-card-title">{{ $t('zibaifeixing.report.overviewTitle') }}</h3>
          <div class="zbr-overview-grid">
            <div class="zbr-mini">
              <h4 class="zbr-mini-head">★ {{ $t('zibaifeixing.report.luckyTitle') }}</h4>
              <template v-if="luckyPalaces.length">
                <div v-for="p in luckyPalaces" :key="p.name" class="zbr-point">
                  <div class="zbr-point-title"><span class="zbr-point-ico">★</span>{{ palaceName(p.name) }}（{{ directionName(p.direction) }}）</div>
                  <div class="zbr-point-desc">{{ $t('zibaifeixing.report.luckyDesc', { stars: p.stars.join(' / ') }) }}</div>
                </div>
              </template>
              <p v-else class="zbr-mini-body">{{ $t('zibaifeixing.report.luckyNone') }}</p>
            </div>
            <div class="zbr-mini">
              <h4 class="zbr-mini-head zbr-mini-head-warn">⊘ {{ $t('zibaifeixing.report.cautionTitle') }}</h4>
              <div v-if="cautionPalaces.wu" class="zbr-point">
                <div class="zbr-point-title zbr-point-title-warn"><span class="zbr-point-ico">⊘</span>{{ $t('zibaifeixing.report.cautionWuTitle') }}</div>
                <div class="zbr-point-desc">{{ $t('zibaifeixing.report.cautionWuDesc', { palace: palaceName(cautionPalaces.wu.name), direction: directionName(cautionPalaces.wu.direction) }) }}</div>
              </div>
              <div v-if="cautionPalaces.er" class="zbr-point">
                <div class="zbr-point-title zbr-point-title-warn"><span class="zbr-point-ico">⊘</span>{{ $t('zibaifeixing.report.cautionErTitle') }}</div>
                <div class="zbr-point-desc">{{ $t('zibaifeixing.report.cautionErDesc', { palace: palaceName(cautionPalaces.er.name), direction: directionName(cautionPalaces.er.direction) }) }}</div>
              </div>
              <p v-if="!cautionPalaces.wu && !cautionPalaces.er" class="zbr-mini-body">{{ $t('zibaifeixing.report.cautionNone') }}</p>
            </div>
            <div class="zbr-mini zbr-mini-wide">
              <h4 class="zbr-mini-head">{{ $t('zibaifeixing.report.centerNoteTitle') }}</h4>
              <p class="zbr-mini-body">{{ centerNoteText }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 入中星与星气统计 ============ -->
      <section class="zbr-section">
        <h3 class="zbr-section-title">{{ $t('zibaifeixing.report.statsTitle') }}</h3>
        <div class="zbr-core-grid">
          <div class="zbr-card zbr-core">
            <div class="zbr-core-label">{{ $t('zibaifeixing.yearLabelShort') }}</div>
            <div class="zbr-core-value" :class="centerClass(result.yearCenter)">{{ result.yearCenter }}</div>
            <div class="zbr-core-sub">{{ starName(result.yearCenter) }}</div>
          </div>
          <div class="zbr-card zbr-core">
            <div class="zbr-core-label">{{ $t('zibaifeixing.monthLabelShort') }}</div>
            <div class="zbr-core-value" :class="centerClass(result.monthCenter)">{{ result.monthCenter }}</div>
            <div class="zbr-core-sub">{{ starName(result.monthCenter) }}</div>
          </div>
          <div class="zbr-card zbr-core">
            <div class="zbr-core-label">{{ $t('zibaifeixing.dayLabelShort') }}</div>
            <div class="zbr-core-value" :class="centerClass(result.dayCenter)">{{ result.dayCenter }}</div>
            <div class="zbr-core-sub">{{ starName(result.dayCenter) }}</div>
          </div>
          <div class="zbr-card zbr-core">
            <div class="zbr-core-label">{{ $t('zibaifeixing.report.coreLucky') }}</div>
            <div class="zbr-core-value zbr-core-value-good">{{ luckyPalaces.length }}</div>
            <div class="zbr-core-sub">{{ luckyPalaces.length ? luckyPalaces.map(p => palaceName(p.name)).join(' · ') : $t('zibaifeixing.report.luckyNone') }}</div>
          </div>
          <div class="zbr-card zbr-core">
            <div class="zbr-core-label">{{ $t('zibaifeixing.report.coreCaution') }}</div>
            <div class="zbr-core-value zbr-core-value-warn">{{ cautionCount }}</div>
            <div class="zbr-core-sub">{{ cautionList }}</div>
          </div>
          <div class="zbr-card zbr-core zbr-core-wuxing">
            <div class="zbr-core-label">{{ $t('zibaifeixing.report.coreWuxing') }}</div>
            <div class="zbr-wuxing">
              <div v-for="w in wuxingStats" :key="w.name" class="zbr-wuxing-row">
                <span class="zbr-wuxing-dot" :style="{ background: w.color }" />
                <span class="zbr-wuxing-name">{{ w.name }}</span>
                <span class="zbr-wuxing-bar-wrap"><span class="zbr-wuxing-bar" :style="{ width: (w.count / maxWuxing * 100) + '%', background: w.color }" /></span>
                <span class="zbr-wuxing-pct">{{ w.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 九宫紫白盘 + 三盘星气雷达 ============ -->
      <section class="zbr-row zbr-pans">
        <!-- 九宫紫白盘 -->
        <div class="zbr-card zbr-pan">
          <h3 class="zbr-pan-title">
            {{ $t('zibaifeixing.report.panTitle') }}
            <span class="zbr-pan-legend">{{ $t('zibaifeixing.report.panLegend', { year: $t('zibaifeixing.chartLegend.year'), month: $t('zibaifeixing.chartLegend.month'), day: $t('zibaifeixing.chartLegend.day') }) }}</span>
          </h3>
          <div class="zbr-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.palaceNumber"
              class="zbr-cell"
              :class="cellClass(cell)"
            >
              <div class="zbr-cell-head">
                <span>{{ palaceName(cell.name) }}</span>
                <span>{{ directionName(cell.direction) }}</span>
              </div>
              <div class="zbr-cell-stars">
                <span class="zbr-star" :class="starClass(cell.yearStar)">{{ cell.yearStar }}</span>
                <span class="zbr-star-sep">/</span>
                <span class="zbr-star" :class="starClass(cell.monthStar)">{{ cell.monthStar }}</span>
                <span class="zbr-star-sep">/</span>
                <span class="zbr-star" :class="starClass(cell.dayStar)">{{ cell.dayStar }}</span>
              </div>
              <div v-if="cellBadges(cell).length" class="zbr-cell-badges">
                <span v-for="b in cellBadges(cell)" :key="b.text" class="zbr-badge" :class="b.cls">{{ b.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 三盘星气雷达图 -->
        <div class="zbr-card zbr-pan">
          <h3 class="zbr-pan-title">{{ $t('zibaifeixing.report.radarTitle') }}</h3>
          <div class="zbr-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="zbr-radar" xmlns="http://www.w3.org/2000/svg">
              <!-- 轴网格 -->
              <polygon
                v-for="lvl in [3, 6, 9]"
                :key="lvl"
                :points="ringPoints(lvl)"
                fill="none"
                stroke="#d8d0bd"
                stroke-width="0.6"
              />
              <!-- 轴线 + 标签 -->
              <g v-for="(label, i) in radarLabels" :key="i">
                <line
                  :x1="0" :y1="0"
                  :x2="RADAR_AXIS_POINTS[i].x" :y2="RADAR_AXIS_POINTS[i].y"
                  stroke="#e6dfcd"
                  stroke-width="0.6"
                />
                <text
                  :x="RADAR_LABEL_POINTS[i].x" :y="RADAR_LABEL_POINTS[i].y"
                  class="zbr-radar-label"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ label }}</text>
              </g>
              <!-- 年盘 -->
              <polygon :points="radarSeriesPoints('year')" fill="rgba(140, 109, 31, 0.14)" stroke="none" />
              <polyline :points="radarSeriesPoints('year')" fill="none" stroke="#8c6d1f" stroke-width="1.4" />
              <!-- 月盘 -->
              <polygon :points="radarSeriesPoints('month')" fill="rgba(74, 124, 89, 0.10)" stroke="none" />
              <polyline :points="radarSeriesPoints('month')" fill="none" stroke="#4a7c59" stroke-width="1.2" />
              <!-- 日盘 -->
              <polygon :points="radarSeriesPoints('day')" fill="rgba(140, 47, 38, 0.08)" stroke="none" />
              <polyline :points="radarSeriesPoints('day')" fill="none" stroke="#8c2f26" stroke-width="1.2" />
            </svg>
            <div class="zbr-radar-legend">
              <span class="zbr-radar-legend-item"><i class="zbr-radar-swatch zbr-radar-swatch-year" />{{ $t('zibaifeixing.report.radarYear') }}</span>
              <span class="zbr-radar-legend-item"><i class="zbr-radar-swatch zbr-radar-swatch-month" />{{ $t('zibaifeixing.report.radarMonth') }}</span>
              <span class="zbr-radar-legend-item"><i class="zbr-radar-swatch zbr-radar-swatch-day" />{{ $t('zibaifeixing.report.radarDay') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 九宫数据表 ============ -->
      <section class="zbr-section">
        <div class="zbr-card">
          <h3 class="zbr-card-title">{{ $t('zibaifeixing.report.tableTitle') }}</h3>
          <div class="zbr-table-wrap">
            <table class="zbr-table">
              <thead>
                <tr>
                  <th>{{ $t('zibaifeixing.report.tablePalace') }}</th>
                  <th>{{ $t('zibaifeixing.report.tableDirection') }}</th>
                  <th>{{ $t('zibaifeixing.chartLegend.year') }}</th>
                  <th>{{ $t('zibaifeixing.chartLegend.month') }}</th>
                  <th>{{ $t('zibaifeixing.chartLegend.day') }}</th>
                  <th>{{ $t('zibaifeixing.report.tableWuxing') }}</th>
                  <th>{{ $t('zibaifeixing.report.tableNote') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="zbr-table-palace">{{ palaceName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="zbr-star" :class="starClass(p.yearStar)">{{ p.yearStar }}</span></td>
                  <td><span class="zbr-star" :class="starClass(p.monthStar)">{{ p.monthStar }}</span></td>
                  <td><span class="zbr-star" :class="starClass(p.dayStar)">{{ p.dayStar }}</span></td>
                  <td class="zbr-table-wuxing">
                    <span v-for="wx in palaceWuxing(p)" :key="wx.name" class="zbr-wuxing-chip" :style="{ color: wx.color, borderColor: wx.color }">{{ wx.name }}</span>
                  </td>
                  <td class="zbr-table-note">
                    <span v-for="b in cellBadges(p)" :key="b.text" class="zbr-badge" :class="b.cls">{{ b.text }}</span>
                    <span v-if="!cellBadges(p).length">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="zbr-row zbr-ai-row">
        <div class="zbr-card zbr-ai">
          <h3 class="zbr-ai-title"><span class="zbr-ai-no">01</span>{{ $t('zibaifeixing.report.secPalace') }}</h3>
          <div class="zbr-ai-body zbr-md" v-html="renderSection(aiSections['各宫位简析'])" />
        </div>
        <div class="zbr-card zbr-ai">
          <h3 class="zbr-ai-title"><span class="zbr-ai-no">02</span>{{ $t('zibaifeixing.report.secOverview') }}</h3>
          <div class="zbr-ai-body zbr-md" v-html="renderSection(aiSections['全局观察'])" />
        </div>
      </section>

      <section class="zbr-row zbr-ai-row">
        <div class="zbr-card zbr-ai">
          <h3 class="zbr-ai-title"><span class="zbr-ai-no">03</span>{{ $t('zibaifeixing.report.secAdvice') }}</h3>
          <div class="zbr-ai-body zbr-md" v-html="renderSection(aiSections['吉凶方位与用事建议'])" />
        </div>
        <div class="zbr-card zbr-ai">
          <h3 class="zbr-ai-title"><span class="zbr-ai-no">04</span>{{ $t('zibaifeixing.report.secRemedy') }}</h3>
          <div class="zbr-ai-body zbr-md" v-html="renderSection(aiSections['化解提示'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="zbr-streaming">
        <span class="zbr-streaming-dot" />
        {{ $t('zibaifeixing.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="zbr-error">
        <p>{{ error }}</p>
        <button type="button" class="zbr-retry" @click="$emit('retry')">{{ $t('zibaifeixing.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="zbr-foot">
        <span class="zbr-foot-note">ⓘ {{ $t('zibaifeixing.disclaimer') }}</span>
        <span class="zbr-seal zbr-seal-foot">{{ $t('zibaifeixing.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface Palace {
  palaceNumber: number
  name: string
  direction: string
  yearStar: number
  monthStar: number
  dayStar: number
}

interface CalcResult {
  input: {
    year: number
    month: number
    day: number
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    lunarYearBranch: string
    intent: string
  }
  yearCenter: number
  monthCenter: number
  dayCenter: number
  currentJieqi: { name: string; date: string }
  palaces: Palace[]
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

/* ---------- 静态派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

const INTENT_KEYS = new Set(['general', 'wealth', 'health', 'love', 'study', 'travel', 'renovation'])
const intentText = computed(() =>
  INTENT_KEYS.has(props.result.input.intent)
    ? t(`zibaifeixing.intentOptions.${props.result.input.intent}`)
    : t('zibaifeixing.intentOptions.general'))

const LUCKY_STARS = new Set([1, 6, 8, 9])
const OMINOUS_STARS = new Set([2, 5])

const hasOminousCenter = computed(() =>
  OMINOUS_STARS.has(props.result.yearCenter)
  || OMINOUS_STARS.has(props.result.monthCenter)
  || OMINOUS_STARS.has(props.result.dayCenter))

const verdict = computed(() =>
  hasOminousCenter.value ? t('zibaifeixing.report.verdictCaution') : t('zibaifeixing.report.verdictGood'))

const titleText = computed(() =>
  t('zibaifeixing.report.title', {
    year: starName(props.result.yearCenter),
    month: starName(props.result.monthCenter),
    day: starName(props.result.dayCenter),
  }))

const subtitleText = computed(() =>
  t('zibaifeixing.report.subtitle', {
    year: props.result.input.year,
    month: props.result.input.month,
    day: props.result.input.day,
  }))

const centerNoteText = computed(() =>
  t('zibaifeixing.report.centerNote', {
    year: props.result.yearCenter,
    month: props.result.monthCenter,
    day: props.result.dayCenter,
  }))

/* ---------- 宫位工具 ---------- */

const PALACE_NAME_KEY: Record<string, string> = {
  坎: 'kan', 坤: 'kun', 震: 'zhen', 巽: 'xun', 中: 'zhong', 乾: 'qian', 兑: 'dui', 艮: 'gen', 离: 'li',
}
const DIRECTION_KEY: Record<string, string> = {
  北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw', 中宫: 'center',
}

function palaceName(name: string): string {
  return t(`zibaifeixing.palaceNames.${PALACE_NAME_KEY[name] ?? 'zhong'}`)
}
function directionName(dir: string): string {
  return t(`zibaifeixing.directions.${DIRECTION_KEY[dir] ?? 'center'}`)
}

// 九宫格按上南下北排列：巽 离 坤 / 震 中 兑 / 艮 坎 乾
const GRID_ORDER = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾']
const gridCells = computed(() =>
  GRID_ORDER.map(name => props.result.palaces.find(p => p.name === name)!).filter(Boolean))

// 表格按坎→坤→震→巽→中→乾→兑→艮→离顺序（与 AI 提示一致）
const TABLE_ORDER = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离']
const palaceOrder = computed(() =>
  TABLE_ORDER.map(name => props.result.palaces.find(p => p.name === name)!).filter(Boolean))

// 雷达图按罗盘顺时针：坎（北）起
const RADAR_ORDER = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾']
const radarPalaces = computed(() =>
  RADAR_ORDER.map(name => props.result.palaces.find(p => p.name === name)!).filter(Boolean))
const radarLabels = computed(() => radarPalaces.value.map(p => palaceName(p.name)))

/* ---------- 九星属性 ---------- */

const STAR_WUXING: Record<number, string> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
}
const STAR_NAME_KEY: Record<number, string> = {
  1: 's1', 2: 's2', 3: 's3', 4: 's4', 5: 's5', 6: 's6', 7: 's7', 8: 's8', 9: 's9',
}
const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }

function starName(star: number): string {
  return t(`zibaifeixing.report.starNames.${STAR_NAME_KEY[star] ?? 's1'}`)
}

function starClass(star: number): string {
  if (LUCKY_STARS.has(star)) return 'zbr-star-lucky'
  if (OMINOUS_STARS.has(star)) return 'zbr-star-ominous'
  return 'zbr-star-plain'
}

function centerClass(star: number): string {
  if (LUCKY_STARS.has(star)) return 'zbr-core-value-good'
  if (OMINOUS_STARS.has(star)) return 'zbr-core-value-warn'
  return ''
}

function cellClass(cell: Palace): string {
  const lucky = [cell.yearStar, cell.monthStar, cell.dayStar].some(s => LUCKY_STARS.has(s))
  return lucky ? 'zbr-cell-lucky' : ''
}

function cellBadges(cell: Palace): { text: string; cls: string }[] {
  const badges: { text: string; cls: string }[] = []
  const stars = [cell.yearStar, cell.monthStar, cell.dayStar]
  if (stars.includes(5)) badges.push({ text: t('zibaifeixing.report.badgeWu'), cls: 'zbr-badge-warn' })
  if (stars.includes(2)) badges.push({ text: t('zibaifeixing.report.badgeEr'), cls: 'zbr-badge-warn' })
  if (stars.some(s => LUCKY_STARS.has(s))) badges.push({ text: t('zibaifeixing.report.badgeJi'), cls: 'zbr-badge-good' })
  return badges
}

const luckyPalaces = computed(() =>
  props.result.palaces
    .filter(p => [p.yearStar, p.monthStar, p.dayStar].some(s => LUCKY_STARS.has(s)))
    .map(p => ({ ...p, stars: [p.yearStar, p.monthStar, p.dayStar].filter(s => LUCKY_STARS.has(s)) })))

const cautionPalaces = computed(() => ({
  wu: props.result.palaces.find(p => [p.yearStar, p.monthStar, p.dayStar].includes(5)) ?? null,
  er: props.result.palaces.find(p => [p.yearStar, p.monthStar, p.dayStar].includes(2)) ?? null,
}))

const cautionCount = computed(() =>
  (cautionPalaces.value.wu ? 1 : 0) + (cautionPalaces.value.er ? 1 : 0))
const cautionList = computed(() => {
  const parts: string[] = []
  if (cautionPalaces.value.wu) parts.push(palaceName(cautionPalaces.value.wu.name))
  if (cautionPalaces.value.er) parts.push(palaceName(cautionPalaces.value.er.name))
  return parts.length ? parts.join(' · ') : t('zibaifeixing.report.cautionNone')
})

/* ---------- 星气五行统计（年+月+日，共27星） ---------- */

const wuxingStats = computed(() => {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  for (const p of props.result.palaces) {
    for (const s of [p.yearStar, p.monthStar, p.dayStar]) {
      const wx = STAR_WUXING[s]!
      counts[wx] = (counts[wx] ?? 0) + 1
    }
  }
  return (['木', '火', '土', '金', '水'] as const).map(wx => ({
    name: wx,
    count: counts[wx]!,
    color: WX_COLORS[wx]!,
  }))
})
const maxWuxing = computed(() => Math.max(1, ...wuxingStats.value.map(w => w.count)))

function palaceWuxing(p: Palace): { name: string; color: string }[] {
  return [p.yearStar, p.monthStar, p.dayStar].map(s => {
    const name = STAR_WUXING[s]!
    return { name, color: WX_COLORS[name]! }
  })
}

/* ---------- 雷达图 ---------- */

const RADAR_R = 88
function radarPoint(i: number, value: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2
  const r = (value / 9) * RADAR_R
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
}
// html-to-image 对 SVG transform 序列化有兼容问题，角度全部预计算为坐标
const RADAR_AXIS_POINTS = Array.from({ length: 8 }, (_, i) => radarPoint(i, 9))
const RADAR_LABEL_POINTS = Array.from({ length: 8 }, (_, i) => radarPoint(i, 10.6))
function ringPoints(level: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const pt = radarPoint(i, level)
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }).join(' ')
}
function radarSeriesPoints(kind: 'year' | 'month' | 'day'): string {
  return radarPalaces.value.map((p, i) => {
    const v = kind === 'year' ? p.yearStar : kind === 'month' ? p.monthStar : p.dayStar
    const pt = radarPoint(i, v)
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }).join(' ')
}

/* ---------- AI 内容解析 ---------- */

const aiSections = computed<Record<string, string>>(() => {
  const text = props.aiContent || ''
  const map: Record<string, string> = {}
  if (!text) return map
  const raws = text.split(/\n(?=##\s)/)
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('##')) continue
    const nl = trimmed.indexOf('\n')
    const title = (nl === -1 ? trimmed : trimmed.slice(0, nl)).replace(/^##\s*/, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title) map[title] = content
  }
  return map
})

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="zbr-pending">${t('zibaifeixing.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.zbr {
  --zbr-bg: #f2ede3;
  --zbr-sheet: #faf6ec;
  --zbr-card: #fffdf6;
  --zbr-ink: #2e2a24;
  --zbr-ink-soft: #55503f;
  --zbr-ink-faint: #8a8272;
  --zbr-line: #d8d0bd;
  --zbr-line-soft: #e6dfcd;
  --zbr-accent: #8c2f26;
  --zbr-accent-soft: #a8512e;
  --zbr-star: #8c6d1f;
  --zbr-green: #4a7c59;
  border-radius: 12px;
  background: var(--zbr-bg);
  padding: 18px;
  color: var(--zbr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.zbr-sheet {
  background: var(--zbr-sheet);
  border: 1px solid var(--zbr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.zbr-head { border-bottom: 2px solid var(--zbr-ink); padding-bottom: 16px; }
.zbr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.zbr-brand { display: flex; align-items: center; gap: 8px; }
.zbr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--zbr-accent);
  color: var(--zbr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
  white-space: pre-line;
}
.zbr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--zbr-ink-soft); }
.zbr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--zbr-ink-faint); }
.zbr-verdict { color: var(--zbr-green); font-weight: 600; }
.zbr-verdict-warn { color: var(--zbr-accent); }
.zbr-rating { letter-spacing: 1px; }

.zbr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.zbr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--zbr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.zbr-head-bottom { text-align: center; }
.zbr-meta-line { margin: 2px 0; font-size: 12px; color: var(--zbr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.zbr-row { display: grid; gap: 14px; margin-top: 16px; }
.zbr-row-top { grid-template-columns: 1fr 2.4fr; }
.zbr-pans { grid-template-columns: 1.2fr 1fr; }
.zbr-ai-row { grid-template-columns: 1fr 1fr; }
.zbr-section { margin-top: 16px; }

.zbr-card {
  background: var(--zbr-card);
  border: 1px solid var(--zbr-line);
  padding: 14px 16px;
  min-width: 0;
}
.zbr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--zbr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.zbr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 排盘档案卡 ---------- */
.zbr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.zbr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.zbr-ico { color: var(--zbr-accent-soft); font-size: 12px; }
.zbr-profile-label { color: var(--zbr-ink-faint); min-width: 30px; }
.zbr-profile-value { color: var(--zbr-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.zbr-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.zbr-mini { border: 1px dashed var(--zbr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.zbr-mini-wide { grid-column: 1 / -1; }
.zbr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--zbr-accent-soft); letter-spacing: 1px; }
.zbr-mini-head-warn { color: var(--zbr-accent); }
.zbr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--zbr-ink-soft); }
.zbr-point { margin-bottom: 7px; }
.zbr-point:last-child { margin-bottom: 0; }
.zbr-point-title { font-size: 12px; font-weight: 700; color: var(--zbr-ink); display: flex; gap: 5px; align-items: baseline; }
.zbr-point-title-warn { color: var(--zbr-accent); }
.zbr-point-ico { font-size: 10px; color: var(--zbr-star); }
.zbr-point-desc { font-size: 11px; color: var(--zbr-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 星气统计卡 ---------- */
.zbr-core-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.zbr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.zbr-core-wuxing { grid-column: span 1; }
.zbr-core-label { font-size: 11px; color: var(--zbr-ink-faint); letter-spacing: 1px; }
.zbr-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.zbr-core-value-good { color: var(--zbr-star); }
.zbr-core-value-warn { color: var(--zbr-accent); }
.zbr-core-sub { font-size: 10px; color: var(--zbr-ink-faint); }

.zbr-wuxing { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.zbr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.zbr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.zbr-wuxing-name { width: 12px; color: var(--zbr-ink-soft); }
.zbr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--zbr-line-soft); }
.zbr-wuxing-bar { display: block; height: 100%; }
.zbr-wuxing-pct { width: 16px; text-align: right; color: var(--zbr-ink-faint); }

/* ---------- 九宫紫白盘 ---------- */
.zbr-pan { padding: 12px; }
.zbr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.zbr-pan-legend { display: block; font-size: 9px; color: var(--zbr-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.zbr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.zbr-cell {
  border: 1px solid var(--zbr-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--zbr-card);
}
.zbr-cell-lucky { border-color: var(--zbr-star); background: rgba(140, 109, 31, 0.05); }
.zbr-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--zbr-ink-faint); }
.zbr-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 4px; }
.zbr-star { font-size: 19px; font-weight: 700; line-height: 1.2; }
.zbr-star-plain { color: var(--zbr-ink); }
.zbr-star-lucky { color: var(--zbr-star); }
.zbr-star-ominous { color: var(--zbr-accent); }
.zbr-star-sep { font-size: 11px; color: var(--zbr-ink-faint); }
.zbr-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; }
.zbr-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.zbr-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--zbr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.zbr-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--zbr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }

/* ---------- 雷达图 ---------- */
.zbr-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.zbr-radar { width: 100%; max-width: 320px; }
.zbr-radar-label { font-size: 8.5px; fill: var(--zbr-ink-soft); font-weight: 700; }
.zbr-radar-legend { display: flex; gap: 12px; font-size: 10px; color: var(--zbr-ink-faint); flex-wrap: wrap; justify-content: center; }
.zbr-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.zbr-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.zbr-radar-swatch-year { background: rgba(140, 109, 31, 0.5); }
.zbr-radar-swatch-month { background: rgba(74, 124, 89, 0.5); }
.zbr-radar-swatch-day { background: rgba(140, 47, 38, 0.5); }

/* ---------- 九宫数据表 ---------- */
.zbr-table-wrap { overflow-x: auto; }
.zbr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.zbr-table th, .zbr-table td {
  border: 1px solid var(--zbr-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.zbr-table thead th {
  background: var(--zbr-line-soft);
  font-weight: 700;
  color: var(--zbr-ink);
  letter-spacing: 1px;
}
.zbr-table td { color: var(--zbr-ink-soft); }
.zbr-table-palace { font-weight: 700; color: var(--zbr-ink); }
.zbr-table .zbr-star { font-size: 15px; }
.zbr-table-wuxing { white-space: nowrap; }
.zbr-wuxing-chip {
  display: inline-block;
  font-size: 10px;
  border: 1px solid;
  padding: 0 4px;
  line-height: 1.6;
  margin: 0 1px;
}
.zbr-table-note { text-align: left; }

/* ---------- AI 章节 ---------- */
.zbr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--zbr-line-soft);
  padding-bottom: 8px;
}
.zbr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--zbr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.zbr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--zbr-ink-soft); }

.zbr-md :deep(p) { margin: 0 0 0.7em; }
.zbr-md :deep(p:last-child) { margin-bottom: 0; }
.zbr-md :deep(strong) { color: var(--zbr-ink); font-weight: 700; }
.zbr-md :deep(ul), .zbr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.zbr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.zbr-md :deep(h3), .zbr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--zbr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.zbr-md { overflow-x: auto; }
.zbr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--zbr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.zbr-md :deep(.zbr-pending), .zbr-pending { color: var(--zbr-ink-faint); font-style: italic; }

.zbr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--zbr-ink-faint); letter-spacing: 1px;
}
.zbr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--zbr-accent);
  animation: zbr-pulse 1s ease-in-out infinite;
}
@keyframes zbr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.zbr-error { margin-top: 14px; text-align: center; color: var(--zbr-accent); font-size: 12px; }
.zbr-retry {
  margin-top: 8px;
  border: 1px solid var(--zbr-accent);
  background: transparent;
  color: var(--zbr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.zbr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.zbr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--zbr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.zbr-foot-note { font-size: 10px; color: var(--zbr-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.zbr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .zbr-row-top { grid-template-columns: 1fr; }
  .zbr-pans { grid-template-columns: 1fr; }
  .zbr-core-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 720px) {
  .zbr { padding: 8px; }
  .zbr-sheet { padding: 16px 12px; }
  .zbr-ai-row { grid-template-columns: 1fr; }
  .zbr-overview-grid { grid-template-columns: 1fr; }
  .zbr-title { font-size: 20px; letter-spacing: 2px; }
  .zbr-core-grid { grid-template-columns: repeat(3, 1fr); }

  /* 九宫盘：缩小内容，保住 3x3 结构 */
  .zbr-pan { padding: 8px; }
  .zbr-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .zbr-star { font-size: 15px; }
  .zbr-cell-head { font-size: 8px; }
  .zbr-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .zbr-table { min-width: 520px; }
}
</style>
