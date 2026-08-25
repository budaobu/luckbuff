<template>
  <div class="xkr">
    <div class="xkr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="xkr-head">
        <div class="xkr-head-top">
          <div class="xkr-brand">
            <div class="xkr-seal">{{ $t('xuankong.report.seal') }}</div>
            <span class="xkr-brand-name">{{ $t('xuankong.report.brandName') }}</span>
          </div>
          <div class="xkr-head-right">
            <span class="xkr-time">{{ $t('xuankong.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="xkr-rating">{{ $t('xuankong.report.rating') }}</span>
            <span class="xkr-verdict" :class="{ 'xkr-verdict-warn': isBadPattern }">
              {{ isBadPattern ? '△' : '✓' }} {{ verdict }}
            </span>
          </div>
        </div>

        <h1 class="xkr-title">{{ titleText }}</h1>
        <p class="xkr-subtitle">{{ subtitleText }}</p>

        <div class="xkr-head-bottom">
          <p class="xkr-meta-line">{{ $t('xuankong.sittingFacing') }}：{{ result.sittingLabel }}{{ result.facingLabel }} · {{ $t('xuankong.periodLabel') }}：{{ result.period.name }}（{{ result.period.startYear }}–{{ result.period.endYear }}）</p>
          <p class="xkr-meta-line">{{ $t('xuankong.report.usageLine', { usage: usageText }) }}</p>
        </div>
      </header>

      <!-- ============ 宅基信息 + 排盘概览 ============ -->
      <section class="xkr-row xkr-row-top">
        <div class="xkr-card xkr-profile">
          <div class="xkr-profile-line">
            <span class="xkr-ico">⌖</span>
            <span class="xkr-profile-label">{{ $t('xuankong.report.profileFacing') }}</span>
            <span class="xkr-profile-value">{{ facingText }}</span>
          </div>
          <div class="xkr-profile-line">
            <span class="xkr-ico">☶</span>
            <span class="xkr-profile-label">{{ $t('xuankong.report.profileSitting') }}</span>
            <span class="xkr-profile-value">{{ sittingText }}</span>
          </div>
          <div class="xkr-profile-line">
            <span class="xkr-ico">◷</span>
            <span class="xkr-profile-label">{{ $t('xuankong.report.profilePeriod') }}</span>
            <span class="xkr-profile-value">{{ result.period.name }}</span>
          </div>
          <div class="xkr-profile-line">
            <span class="xkr-ico">⌂</span>
            <span class="xkr-profile-label">{{ $t('xuankong.report.profileUsage') }}</span>
            <span class="xkr-profile-value">{{ usageText }}</span>
          </div>
        </div>

        <div class="xkr-card xkr-overview">
          <h3 class="xkr-card-title">{{ $t('xuankong.report.overviewTitle') }}</h3>
          <div class="xkr-overview-grid">
            <div class="xkr-mini">
              <h4 class="xkr-mini-head">{{ $t('xuankong.report.prosperousTitle') }}</h4>
              <template v-if="prosperousPalaces.length">
                <div v-for="p in prosperousPalaces" :key="p.name" class="xkr-point">
                  <div class="xkr-point-title"><span class="xkr-point-ico">★</span>{{ palaceName(p.name) }}（{{ directionName(p.direction) }}）</div>
                  <div class="xkr-point-desc">{{ $t('xuankong.report.prosperousDesc', { star: result.period.number }) }}</div>
                </div>
              </template>
              <p v-else class="xkr-mini-body">{{ $t('xuankong.report.prosperousNone') }}</p>
            </div>
            <div class="xkr-mini">
              <h4 class="xkr-mini-head xkr-mini-head-warn">⊘ {{ $t('xuankong.report.cautionTitle') }}</h4>
              <div v-if="cautionPalaces.wu" class="xkr-point">
                <div class="xkr-point-title xkr-point-title-warn"><span class="xkr-point-ico">⊘</span>{{ $t('xuankong.report.cautionWuTitle') }}</div>
                <div class="xkr-point-desc">{{ $t('xuankong.report.cautionWuDesc', { palace: palaceName(cautionPalaces.wu.name), direction: directionName(cautionPalaces.wu.direction) }) }}</div>
              </div>
              <div v-if="cautionPalaces.er" class="xkr-point">
                <div class="xkr-point-title xkr-point-title-warn"><span class="xkr-point-ico">⊘</span>{{ $t('xuankong.report.cautionErTitle') }}</div>
                <div class="xkr-point-desc">{{ $t('xuankong.report.cautionErDesc', { palace: palaceName(cautionPalaces.er.name), direction: directionName(cautionPalaces.er.direction) }) }}</div>
              </div>
              <div v-if="result.warning" class="xkr-point">
                <div class="xkr-point-title xkr-point-title-warn"><span class="xkr-point-ico">⊘</span>{{ $t('xuankong.warningLabel') }}</div>
                <div class="xkr-point-desc">{{ result.warning }}</div>
              </div>
              <p v-if="!cautionPalaces.wu && !cautionPalaces.er && !result.warning" class="xkr-mini-body">{{ $t('xuankong.report.cautionNone') }}</p>
            </div>
            <div class="xkr-mini xkr-mini-wide">
              <h4 class="xkr-mini-head">{{ $t('xuankong.report.patternTitle') }}</h4>
              <p v-if="result.pattern" class="xkr-mini-body">
                <strong class="xkr-pattern-name">{{ t(`xuankong.patterns.${result.pattern.key}`) }}</strong>
                {{ t(`xuankong.patternDescriptions.${result.pattern.key}`) }}
              </p>
              <p v-else class="xkr-mini-body">{{ $t('xuankong.report.patternNone') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 星气统计 ============ -->
      <section class="xkr-section">
        <h3 class="xkr-section-title">{{ $t('xuankong.report.statsTitle') }}</h3>
        <div class="xkr-core-grid">
          <div class="xkr-card xkr-core">
            <div class="xkr-core-label">{{ $t('xuankong.report.corePattern') }}</div>
            <div class="xkr-core-value xkr-core-value-sm">{{ patternText }}</div>
            <div class="xkr-core-sub">{{ isBadPattern ? $t('xuankong.report.patternNoteBad') : $t('xuankong.report.patternNoteGood') }}</div>
          </div>
          <div class="xkr-card xkr-core">
            <div class="xkr-core-label">{{ $t('xuankong.report.coreProsperous') }}</div>
            <div class="xkr-core-value">{{ prosperousPalaces.length }}</div>
            <div class="xkr-core-sub">{{ prosperousPalaces.length ? prosperousPalaces.map(p => palaceName(p.name)).join(' · ') : $t('xuankong.report.prosperousNone') }}</div>
          </div>
          <div class="xkr-card xkr-core">
            <div class="xkr-core-label">{{ $t('xuankong.report.coreCaution') }}</div>
            <div class="xkr-core-value xkr-core-value-warn">{{ cautionCount }}</div>
            <div class="xkr-core-sub">{{ cautionList }}</div>
          </div>
          <div class="xkr-card xkr-core">
            <div class="xkr-core-label">{{ $t('xuankong.report.coreWuxing') }}</div>
            <div class="xkr-wuxing">
              <div v-for="w in wuxingStats" :key="w.name" class="xkr-wuxing-row">
                <span class="xkr-wuxing-dot" :style="{ background: w.color }" />
                <span class="xkr-wuxing-name">{{ w.name }}</span>
                <span class="xkr-wuxing-bar-wrap"><span class="xkr-wuxing-bar" :style="{ width: (w.count / maxWuxing * 100) + '%', background: w.color }" /></span>
                <span class="xkr-wuxing-pct">{{ w.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 飞星盘 + 星气分布 ============ -->
      <section class="xkr-row xkr-pans">
        <!-- 九宫飞星盘 -->
        <div class="xkr-card xkr-pan">
          <h3 class="xkr-pan-title">
            {{ $t('xuankong.report.panTitle') }}
            <span class="xkr-pan-legend">{{ $t('xuankong.report.panLegend', { period: $t('xuankong.chartLegend.period'), mountain: $t('xuankong.chartLegend.mountain'), facing: $t('xuankong.chartLegend.facing') }) }}</span>
          </h3>
          <div class="xkr-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.palaceNumber"
              class="xkr-cell"
              :class="cellClass(cell)"
            >
              <div class="xkr-cell-head">
                <span>{{ palaceName(cell.name) }}</span>
                <span>{{ directionName(cell.direction) }}</span>
              </div>
              <div class="xkr-cell-stars">
                <span class="xkr-star" :class="starClass(cell.periodStar, 'period')">{{ cell.periodStar }}</span>
                <span class="xkr-star-sep">/</span>
                <span class="xkr-star" :class="starClass(cell.mountainStar, 'mountain')">{{ cell.mountainStar }}</span>
                <span class="xkr-star-sep">/</span>
                <span class="xkr-star" :class="starClass(cell.facingStar, 'facing')">{{ cell.facingStar }}</span>
              </div>
              <div v-if="cellBadges(cell).length" class="xkr-cell-badges">
                <span v-for="b in cellBadges(cell)" :key="b.text" class="xkr-badge" :class="b.cls">{{ b.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 山向星气雷达图 -->
        <div class="xkr-card xkr-pan">
          <h3 class="xkr-pan-title">{{ $t('xuankong.report.radarTitle') }}</h3>
          <div class="xkr-radar-wrap">
            <svg viewBox="-115 -105 230 210" class="xkr-radar" xmlns="http://www.w3.org/2000/svg">
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
                  :x2="RADAR_AXIS_POINTS[i]!.x" :y2="RADAR_AXIS_POINTS[i]!.y"
                  stroke="#e6dfcd"
                  stroke-width="0.6"
                />
                <text
                  :x="RADAR_LABEL_POINTS[i]!.x" :y="RADAR_LABEL_POINTS[i]!.y"
                  class="xkr-radar-label"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >{{ label }}</text>
              </g>
              <!-- 山星 -->
              <polygon :points="radarSeriesPoints('mountain')" fill="rgba(140, 109, 31, 0.12)" stroke="none" />
              <polyline :points="radarSeriesPoints('mountain')" fill="none" stroke="#8c6d1f" stroke-width="1.4" />
              <!-- 向星 -->
              <polygon :points="radarSeriesPoints('facing')" fill="rgba(140, 47, 38, 0.08)" stroke="none" />
              <polyline :points="radarSeriesPoints('facing')" fill="none" stroke="#8c2f26" stroke-width="1.4" />
            </svg>
            <div class="xkr-radar-legend">
              <span class="xkr-radar-legend-item"><i class="xkr-radar-swatch xkr-radar-swatch-mountain" />{{ $t('xuankong.report.radarMountain') }}</span>
              <span class="xkr-radar-legend-item"><i class="xkr-radar-swatch xkr-radar-swatch-facing" />{{ $t('xuankong.report.radarFacing') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 九宫数据表 ============ -->
      <section class="xkr-section">
        <div class="xkr-card">
          <h3 class="xkr-card-title">{{ $t('xuankong.report.tableTitle') }}</h3>
          <div class="xkr-table-wrap">
            <table class="xkr-table">
              <thead>
                <tr>
                  <th>{{ $t('xuankong.report.tablePalace') }}</th>
                  <th>{{ $t('xuankong.report.tableDirection') }}</th>
                  <th>{{ $t('xuankong.chartLegend.period') }}</th>
                  <th>{{ $t('xuankong.chartLegend.mountain') }}</th>
                  <th>{{ $t('xuankong.chartLegend.facing') }}</th>
                  <th>{{ $t('xuankong.report.tableWuxing') }}</th>
                  <th>{{ $t('xuankong.report.tableNote') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in palaceOrder" :key="p.name">
                  <td class="xkr-table-palace">{{ palaceName(p.name) }}</td>
                  <td>{{ directionName(p.direction) }}</td>
                  <td><span class="xkr-star" :class="starClass(p.periodStar, 'period')">{{ p.periodStar }}</span></td>
                  <td><span class="xkr-star" :class="starClass(p.mountainStar, 'mountain')">{{ p.mountainStar }}</span></td>
                  <td><span class="xkr-star" :class="starClass(p.facingStar, 'facing')">{{ p.facingStar }}</span></td>
                  <td class="xkr-table-wuxing">
                    <span v-for="wx in palaceWuxing(p)" :key="wx.name" class="xkr-wuxing-chip" :style="{ color: wx.color, borderColor: wx.color }">{{ wx.name }}</span>
                  </td>
                  <td class="xkr-table-note">
                    <span v-for="b in cellBadges(p)" :key="b.text" class="xkr-badge" :class="b.cls">{{ b.text }}</span>
                    <span v-if="!cellBadges(p).length">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-04 ============ -->
      <section class="xkr-row xkr-ai-row">
        <div class="xkr-card xkr-ai">
          <h3 class="xkr-ai-title"><span class="xkr-ai-no">01</span>{{ $t('xuankong.report.secPalace') }}</h3>
          <div class="xkr-ai-body xkr-md" v-html="renderSection(aiSections['各宫位简析'])" />
        </div>
        <div class="xkr-card xkr-ai">
          <h3 class="xkr-ai-title"><span class="xkr-ai-no">02</span>{{ $t('xuankong.report.secPattern') }}</h3>
          <div class="xkr-ai-body xkr-md" v-html="renderSection(aiSections['全局格局'])" />
        </div>
      </section>

      <section class="xkr-row xkr-ai-row">
        <div class="xkr-card xkr-ai">
          <h3 class="xkr-ai-title"><span class="xkr-ai-no">03</span>{{ $t('xuankong.report.secRemedy') }}</h3>
          <div class="xkr-ai-body xkr-md" v-html="renderSection(aiSections['化解建议'])" />
        </div>
        <div class="xkr-card xkr-ai">
          <h3 class="xkr-ai-title"><span class="xkr-ai-no">04</span>{{ $t('xuankong.report.secBoost') }}</h3>
          <div class="xkr-ai-body xkr-md" v-html="renderSection(aiSections['催旺建议'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="xkr-streaming">
        <span class="xkr-streaming-dot" />
        {{ $t('xuankong.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="xkr-error">
        <p>{{ error }}</p>
        <button type="button" class="xkr-retry" @click="$emit('retry')">{{ $t('xuankong.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="xkr-foot">
        <span class="xkr-foot-note">ⓘ {{ $t('xuankong.disclaimer') }}</span>
        <span class="xkr-seal xkr-seal-foot">{{ $t('xuankong.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface Palace {
  name: string
  direction: string
  palaceNumber: number
  periodStar: number
  mountainStar: number
  facingStar: number
}

interface CalcResult {
  direction: number
  year: number
  period: { number: number; name: string; startYear: number; endYear: number }
  sittingMountain: { name: string; palace: string; palaceNumber: number; yin: boolean }
  facingMountain: { name: string; palace: string; palaceNumber: number; yin: boolean }
  sittingLabel: string
  facingLabel: string
  pattern: { key: string; name: string; description: string } | null
  palaces: Palace[]
  warning: string | null
  usage?: string
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

const USAGE_KEY: Record<string, string> = { residential: 'residential', office: 'office', shop: 'shop' }
const usageText = computed(() => {
  const key = props.result.usage && USAGE_KEY[props.result.usage]
    ? `xuankong.usageOptions.${props.result.usage}`
    : 'xuankong.report.usageNone'
  return t(key)
})

const facingText = computed(() =>
  `${props.result.facingLabel}（${props.result.facingMountain.name}山 · ${props.result.direction}°）`)
const sittingText = computed(() =>
  `${props.result.sittingLabel}（${props.result.sittingMountain.name}山）`)

const isBadPattern = computed(() => props.result.pattern?.key === 'shangshanxiashui')

const verdict = computed(() => {
  if (!props.result.pattern) return t('xuankong.report.verdictPlain')
  if (isBadPattern.value) return t('xuankong.report.verdictCaution')
  return t('xuankong.report.verdictGood')
})

const titleText = computed(() => {
  const patternName = props.result.pattern ? t(`xuankong.patterns.${props.result.pattern.key}`) : ''
  return patternName
    ? t('xuankong.report.titleWithPattern', { pattern: patternName, period: props.result.period.number })
    : t('xuankong.report.titleNoPattern', { period: props.result.period.number })
})

const subtitleText = computed(() =>
  t('xuankong.report.subtitle', {
    sitting: props.result.sittingLabel,
    facing: props.result.facingLabel,
    period: props.result.period.name,
  }))

const patternText = computed(() =>
  props.result.pattern ? t(`xuankong.patterns.${props.result.pattern.key}`) : t('xuankong.report.patternNone'))

/* ---------- 宫位工具 ---------- */

const PALACE_NAME_KEY: Record<string, string> = {
  坎: 'kan', 坤: 'kun', 震: 'zhen', 巽: 'xun', 中: 'zhong', 乾: 'qian', 兑: 'dui', 艮: 'gen', 离: 'li',
}
const DIRECTION_KEY: Record<string, string> = {
  北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw', 中宫: 'center',
}

function palaceName(name: string): string {
  return t(`xuankong.palaceNames.${PALACE_NAME_KEY[name] ?? 'zhong'}`)
}
function directionName(dir: string): string {
  return t(`xuankong.directions.${DIRECTION_KEY[dir] ?? 'center'}`)
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
const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }

/** 吉星集合（相对元运）：当运、生气、未来生气 */
const luckyStars = computed(() => {
  const p = props.result.period.number
  return new Set([p, p >= 9 ? 1 : p + 1, p >= 8 ? p - 7 : p + 2])
})

function starClass(star: number, type: 'period' | 'mountain' | 'facing'): string {
  if (luckyStars.value.has(star)) return 'xkr-star-lucky'
  if (star === 5 || star === 2) return 'xkr-star-ominous'
  return type === 'period' ? 'xkr-star-dim' : 'xkr-star-plain'
}

function cellClass(cell: Palace): string {
  const prosperous = luckyStars.value.has(cell.mountainStar) || luckyStars.value.has(cell.facingStar)
  return prosperous ? 'xkr-cell-prosperous' : ''
}

function cellBadges(cell: Palace): { text: string; cls: string }[] {
  const badges: { text: string; cls: string }[] = []
  if (cell.mountainStar === 5 || cell.facingStar === 5) {
    badges.push({ text: t('xuankong.report.badgeWu'), cls: 'xkr-badge-warn' })
  }
  if (cell.mountainStar === 2 || cell.facingStar === 2) {
    badges.push({ text: t('xuankong.report.badgeEr'), cls: 'xkr-badge-warn' })
  }
  if (luckyStars.value.has(cell.mountainStar)) {
    badges.push({ text: t('xuankong.report.badgeDing'), cls: 'xkr-badge-good' })
  }
  if (luckyStars.value.has(cell.facingStar)) {
    badges.push({ text: t('xuankong.report.badgeCai'), cls: 'xkr-badge-good' })
  }
  return badges
}

const prosperousPalaces = computed(() =>
  props.result.palaces.filter(p => luckyStars.value.has(p.mountainStar) || luckyStars.value.has(p.facingStar)))

const cautionPalaces = computed(() => ({
  wu: props.result.palaces.find(p => p.mountainStar === 5 || p.facingStar === 5) ?? null,
  er: props.result.palaces.find(p => p.mountainStar === 2 || p.facingStar === 2) ?? null,
}))

const cautionCount = computed(() =>
  (cautionPalaces.value.wu ? 1 : 0) + (cautionPalaces.value.er ? 1 : 0))
const cautionList = computed(() => {
  const parts: string[] = []
  if (cautionPalaces.value.wu) parts.push(palaceName(cautionPalaces.value.wu.name))
  if (cautionPalaces.value.er) parts.push(palaceName(cautionPalaces.value.er.name))
  return parts.length ? parts.join(' · ') : t('xuankong.report.cautionNone')
})

/* ---------- 星气五行统计（山星+向星，共18星） ---------- */

const wuxingStats = computed(() => {
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  for (const p of props.result.palaces) {
    for (const s of [p.mountainStar, p.facingStar]) {
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
  return [p.mountainStar, p.facingStar].map(s => {
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
function radarSeriesPoints(kind: 'mountain' | 'facing'): string {
  return radarPalaces.value.map((p, i) => {
    const v = kind === 'mountain' ? p.mountainStar : p.facingStar
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
    return `<p class="xkr-pending">${t('xuankong.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.xkr {
  --xkr-bg: #f2ede3;
  --xkr-sheet: #faf6ec;
  --xkr-card: #fffdf6;
  --xkr-ink: #2e2a24;
  --xkr-ink-soft: #55503f;
  --xkr-ink-faint: #8a8272;
  --xkr-line: #d8d0bd;
  --xkr-line-soft: #e6dfcd;
  --xkr-accent: #8c2f26;
  --xkr-accent-soft: #a8512e;
  --xkr-star: #8c6d1f;
  --xkr-green: #4a7c59;
  border-radius: 12px;
  background: var(--xkr-bg);
  padding: 18px;
  color: var(--xkr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.xkr-sheet {
  background: var(--xkr-sheet);
  border: 1px solid var(--xkr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.xkr-head { border-bottom: 2px solid var(--xkr-ink); padding-bottom: 16px; }
.xkr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.xkr-brand { display: flex; align-items: center; gap: 8px; }
.xkr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--xkr-accent);
  color: var(--xkr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.xkr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--xkr-ink-soft); }
.xkr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--xkr-ink-faint); }
.xkr-verdict { color: var(--xkr-green); font-weight: 600; }
.xkr-verdict-warn { color: var(--xkr-accent); }
.xkr-rating { letter-spacing: 1px; }

.xkr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.xkr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--xkr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.xkr-head-bottom { text-align: center; }
.xkr-meta-line { margin: 2px 0; font-size: 12px; color: var(--xkr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.xkr-row { display: grid; gap: 14px; margin-top: 16px; }
.xkr-row-top { grid-template-columns: 1fr 2.4fr; }
.xkr-pans { grid-template-columns: 1.2fr 1fr; }
.xkr-ai-row { grid-template-columns: 1fr 1fr; }
.xkr-section { margin-top: 16px; }

.xkr-card {
  background: var(--xkr-card);
  border: 1px solid var(--xkr-line);
  padding: 14px 16px;
  min-width: 0;
}
.xkr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--xkr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.xkr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 宅基信息卡 ---------- */
.xkr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.xkr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.xkr-ico { color: var(--xkr-accent-soft); font-size: 12px; }
.xkr-profile-label { color: var(--xkr-ink-faint); min-width: 30px; }
.xkr-profile-value { color: var(--xkr-ink); letter-spacing: 0.5px; }

/* ---------- 排盘概览 ---------- */
.xkr-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.xkr-mini { border: 1px dashed var(--xkr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.xkr-mini-wide { grid-column: 1 / -1; }
.xkr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--xkr-accent-soft); letter-spacing: 1px; }
.xkr-mini-head-warn { color: var(--xkr-accent); }
.xkr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--xkr-ink-soft); }
.xkr-pattern-name { color: var(--xkr-accent); margin-right: 4px; }
.xkr-point { margin-bottom: 7px; }
.xkr-point:last-child { margin-bottom: 0; }
.xkr-point-title { font-size: 12px; font-weight: 700; color: var(--xkr-ink); display: flex; gap: 5px; align-items: baseline; }
.xkr-point-title-warn { color: var(--xkr-accent); }
.xkr-point-ico { font-size: 10px; color: var(--xkr-star); }
.xkr-point-desc { font-size: 11px; color: var(--xkr-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 星气统计卡 ---------- */
.xkr-core-grid { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1.6fr; gap: 10px; }
.xkr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.xkr-core-label { font-size: 11px; color: var(--xkr-ink-faint); letter-spacing: 1px; }
.xkr-core-value { font-size: 26px; font-weight: 700; letter-spacing: 2px; }
.xkr-core-value-sm { font-size: 18px; letter-spacing: 1px; }
.xkr-core-value-warn { color: var(--xkr-accent); }
.xkr-core-sub { font-size: 10px; color: var(--xkr-ink-faint); }

.xkr-wuxing { display: flex; flex-direction: column; gap: 4px; }
.xkr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.xkr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.xkr-wuxing-name { width: 12px; color: var(--xkr-ink-soft); }
.xkr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--xkr-line-soft); }
.xkr-wuxing-bar { display: block; height: 100%; }
.xkr-wuxing-pct { width: 16px; text-align: right; color: var(--xkr-ink-faint); }

/* ---------- 飞星盘 ---------- */
.xkr-pan { padding: 12px; }
.xkr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.xkr-pan-legend { display: block; font-size: 9px; color: var(--xkr-ink-faint); font-weight: 400; margin-top: 2px; letter-spacing: 0; }

.xkr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.xkr-cell {
  border: 1px solid var(--xkr-line-soft);
  padding: 6px 7px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: 78px;
  background: var(--xkr-card);
}
.xkr-cell-prosperous { border-color: var(--xkr-star); background: rgba(140, 109, 31, 0.05); }
.xkr-cell-head { display: flex; justify-content: space-between; font-size: 9px; color: var(--xkr-ink-faint); }
.xkr-cell-stars { display: flex; align-items: baseline; justify-content: center; gap: 4px; }
.xkr-star { font-size: 19px; font-weight: 700; line-height: 1.2; }
.xkr-star-plain { color: var(--xkr-ink); }
.xkr-star-dim { color: var(--xkr-ink-faint); }
.xkr-star-lucky { color: var(--xkr-star); }
.xkr-star-ominous { color: var(--xkr-accent); }
.xkr-star-sep { font-size: 11px; color: var(--xkr-ink-faint); }
.xkr-cell-badges { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; }
.xkr-badge {
  display: inline-block;
  font-size: 8.5px;
  padding: 0 5px;
  line-height: 1.6;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.xkr-badge-good { background: rgba(74, 124, 89, 0.14); color: var(--xkr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.xkr-badge-warn { background: rgba(140, 47, 38, 0.12); color: var(--xkr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }

/* ---------- 雷达图 ---------- */
.xkr-radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.xkr-radar { width: 100%; max-width: 320px; }
.xkr-radar-label { font-size: 8.5px; fill: var(--xkr-ink-soft); font-weight: 700; }
.xkr-radar-legend { display: flex; gap: 14px; font-size: 10px; color: var(--xkr-ink-faint); }
.xkr-radar-legend-item { display: flex; align-items: center; gap: 5px; }
.xkr-radar-swatch { width: 10px; height: 10px; display: inline-block; }
.xkr-radar-swatch-mountain { background: rgba(140, 109, 31, 0.5); }
.xkr-radar-swatch-facing { background: rgba(140, 47, 38, 0.5); }

/* ---------- 九宫数据表 ---------- */
.xkr-table-wrap { overflow-x: auto; }
.xkr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.xkr-table th, .xkr-table td {
  border: 1px solid var(--xkr-line);
  padding: 6px 8px;
  text-align: center;
  line-height: 1.55;
}
.xkr-table thead th {
  background: var(--xkr-line-soft);
  font-weight: 700;
  color: var(--xkr-ink);
  letter-spacing: 1px;
}
.xkr-table td { color: var(--xkr-ink-soft); }
.xkr-table-palace { font-weight: 700; color: var(--xkr-ink); }
.xkr-table .xkr-star { font-size: 15px; }
.xkr-table-wuxing { white-space: nowrap; }
.xkr-wuxing-chip {
  display: inline-block;
  font-size: 10px;
  border: 1px solid;
  padding: 0 4px;
  line-height: 1.6;
  margin: 0 1px;
}
.xkr-table-note { text-align: left; }

/* ---------- AI 章节 ---------- */
.xkr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--xkr-line-soft);
  padding-bottom: 8px;
}
.xkr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--xkr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.xkr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--xkr-ink-soft); }

.xkr-md :deep(p) { margin: 0 0 0.7em; }
.xkr-md :deep(p:last-child) { margin-bottom: 0; }
.xkr-md :deep(strong) { color: var(--xkr-ink); font-weight: 700; }
.xkr-md :deep(ul), .xkr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.xkr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.xkr-md :deep(h3), .xkr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--xkr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.xkr-md { overflow-x: auto; }
.xkr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--xkr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.xkr-md :deep(.xkr-pending), .xkr-pending { color: var(--xkr-ink-faint); font-style: italic; }

.xkr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--xkr-ink-faint); letter-spacing: 1px;
}
.xkr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--xkr-accent);
  animation: xkr-pulse 1s ease-in-out infinite;
}
@keyframes xkr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.xkr-error { margin-top: 14px; text-align: center; color: var(--xkr-accent); font-size: 12px; }
.xkr-retry {
  margin-top: 8px;
  border: 1px solid var(--xkr-accent);
  background: transparent;
  color: var(--xkr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.xkr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.xkr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--xkr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;
}
.xkr-foot-note { font-size: 10px; color: var(--xkr-ink-faint); line-height: 1.7; flex: 1; min-width: 240px; }
.xkr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); flex-shrink: 0; }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .xkr-row-top { grid-template-columns: 1fr; }
  .xkr-pans { grid-template-columns: 1fr; }
  .xkr-core-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 720px) {
  .xkr { padding: 8px; }
  .xkr-sheet { padding: 16px 12px; }
  .xkr-ai-row { grid-template-columns: 1fr; }
  .xkr-overview-grid { grid-template-columns: 1fr; }
  .xkr-title { font-size: 22px; letter-spacing: 2px; }
  .xkr-core-grid { grid-template-columns: 1fr 1fr; }

  /* 九宫盘：缩小内容，保住 3x3 结构 */
  .xkr-pan { padding: 8px; }
  .xkr-cell { padding: 4px 5px; min-height: 66px; gap: 2px; }
  .xkr-star { font-size: 15px; }
  .xkr-cell-head { font-size: 8px; }
  .xkr-badge { font-size: 7.5px; padding: 0 3px; }

  /* 数据表：给最小宽度，容器滚动 */
  .xkr-table { min-width: 520px; }
}
</style>
