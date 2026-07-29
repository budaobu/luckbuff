<template>
  <div class="cgr">
    <div class="cgr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="cgr-head">
        <div class="cgr-head-top">
          <div class="cgr-brand">
            <div class="cgr-seal">{{ $t('chenggu.report.seal') }}</div>
            <span class="cgr-brand-name">{{ $t('chenggu.report.brandName') }}</span>
          </div>
          <div class="cgr-head-right">
            <span class="cgr-time">{{ $t('chenggu.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="cgr-rating">{{ $t('chenggu.report.rating') }}</span>
            <span class="cgr-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="cgr-title">{{ titleText }}</h1>
        <p class="cgr-subtitle">{{ $t('chenggu.report.subtitle') }}</p>

        <div class="cgr-head-bottom">
          <p class="cgr-meta-line">{{ metaLine }}</p>
        </div>
      </header>

      <!-- ============ 生辰信息 + 总骨重 ============ -->
      <section class="cgr-row cgr-row-top">
        <div class="cgr-card cgr-profile">
          <div class="cgr-profile-line">
            <span class="cgr-ico">历</span>
            <span class="cgr-profile-label">{{ $t('chenggu.report.solarLabel') }}</span>
            <span class="cgr-profile-value">{{ result.solarDate.year }}-{{ pad(result.solarDate.month) }}-{{ pad(result.solarDate.day) }}</span>
          </div>
          <div class="cgr-profile-line">
            <span class="cgr-ico">农</span>
            <span class="cgr-profile-label">{{ $t('chenggu.report.lunarLabel') }}</span>
            <span class="cgr-profile-value">
              {{ result.lunarDate.year }}{{ $t('chenggu.report.yearUnit') }}{{ result.lunarDate.month }}{{ $t('chenggu.report.monthUnit') }}{{ result.lunarDate.day }}{{ $t('chenggu.report.dayUnit') }}<template v-if="result.lunarDate.isLeapMonth">{{ $t('chenggu.report.leapMonthNote') }}</template>
            </span>
          </div>
          <div class="cgr-profile-line">
            <span class="cgr-ico">性</span>
            <span class="cgr-profile-label">{{ $t('chenggu.report.genderLabel') }}</span>
            <span class="cgr-profile-value">{{ result.gender === 'male' ? $t('common.male') : $t('common.female') }}</span>
          </div>
          <div class="cgr-profile-line">
            <span class="cgr-ico">辰</span>
            <span class="cgr-profile-label">{{ $t('chenggu.report.hourLabel') }}</span>
            <span class="cgr-profile-value">{{ result.breakdown.hour.shiChen }}{{ $t('chenggu.report.hourUnit') }}</span>
          </div>
        </div>

        <div class="cgr-card cgr-total">
          <div class="cgr-total-left">
            <div class="cgr-total-label">{{ $t('chenggu.report.totalWeightLabel') }}</div>
            <div class="cgr-total-value">
              {{ weightText(result.totalWeight) }}
            </div>
            <div class="cgr-total-qian">{{ $t('chenggu.report.totalQianText', { qian: result.totalWeight.totalQian }) }}</div>
            <span class="cgr-level-mark" :class="'cgr-level-' + levelKey">{{ result.fortune.level }}</span>
          </div>
          <div class="cgr-total-right">
            <div class="cgr-gauge-label">{{ $t('chenggu.report.gaugeLabel') }}</div>
            <div class="cgr-gauge">
              <div class="cgr-gauge-track">
                <span class="cgr-gauge-zone cgr-gauge-zone-1" />
                <span class="cgr-gauge-zone cgr-gauge-zone-2" />
                <span class="cgr-gauge-zone cgr-gauge-zone-3" />
                <span class="cgr-gauge-zone cgr-gauge-zone-4" />
                <span class="cgr-gauge-zone cgr-gauge-zone-5" />
                <span class="cgr-gauge-pointer" :style="{ left: gaugePct + '%' }" />
              </div>
              <div class="cgr-gauge-marks">
                <span>{{ $t('chenggu.report.gaugeL1') }}</span>
                <span>{{ $t('chenggu.report.gaugeL2') }}</span>
                <span>{{ $t('chenggu.report.gaugeL3') }}</span>
                <span>{{ $t('chenggu.report.gaugeL4') }}</span>
                <span>{{ $t('chenggu.report.gaugeL5') }}</span>
              </div>
            </div>
            <p class="cgr-gauge-note">{{ $t('chenggu.report.gaugeNote', { qian: result.totalWeight.totalQian, max: GAUGE_MAX }) }}</p>
          </div>
        </div>
      </section>

      <!-- ============ 核心数据：四柱骨重 + 条形图 ============ -->
      <section class="cgr-section">
        <h3 class="cgr-section-title">{{ $t('chenggu.report.coreDataTitle') }}</h3>
        <div class="cgr-core-grid">
          <div v-for="item in breakdownItems" :key="item.key" class="cgr-card cgr-core">
            <div class="cgr-core-label">{{ item.label }}</div>
            <div class="cgr-core-value">{{ weightText(item.weight) }}</div>
            <div class="cgr-core-sub">{{ item.detail }}</div>
          </div>
          <div class="cgr-card cgr-core cgr-bars-card">
            <div class="cgr-core-label">{{ $t('chenggu.report.barTitle') }}</div>
            <div class="cgr-bars">
              <div v-for="item in breakdownItems" :key="'bar-' + item.key" class="cgr-bar-row">
                <span class="cgr-bar-name">{{ item.label }}</span>
                <span class="cgr-bar-wrap"><span class="cgr-bar" :style="{ width: barPct(item.weight.totalQian) + '%' }" /></span>
                <span class="cgr-bar-pct">{{ weightText(item.weight) }}</span>
              </div>
              <div class="cgr-bar-row cgr-bar-row-total">
                <span class="cgr-bar-name">{{ $t('chenggu.report.barTotal') }}</span>
                <span class="cgr-bar-wrap"><span class="cgr-bar cgr-bar-total" :style="{ width: totalBarPct + '%' }" /></span>
                <span class="cgr-bar-pct">{{ weightText(result.totalWeight) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 骨重明细表 ============ -->
      <section class="cgr-section">
        <h3 class="cgr-section-title">{{ $t('chenggu.report.tableTitle') }}</h3>
        <div class="cgr-card cgr-table-card">
          <div class="cgr-table-wrap">
            <table class="cgr-table">
              <thead>
                <tr>
                  <th>{{ $t('chenggu.report.colItem') }}</th>
                  <th>{{ $t('chenggu.report.colBasis') }}</th>
                  <th>{{ $t('chenggu.report.colWeight') }}</th>
                  <th>{{ $t('chenggu.report.colShare') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in breakdownItems" :key="'row-' + item.key">
                  <th class="cgr-table-rowhead">{{ item.label }}</th>
                  <td>{{ item.detail }}</td>
                  <td class="cgr-td-value">{{ weightText(item.weight) }}</td>
                  <td>{{ sharePct(item.weight.totalQian) }}%</td>
                </tr>
                <tr class="cgr-row-total">
                  <th class="cgr-table-rowhead">{{ $t('chenggu.report.barTotal') }}</th>
                  <td>{{ $t('chenggu.report.totalBasis') }}</td>
                  <td class="cgr-td-value">{{ weightText(result.totalWeight) }}</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 双盘：称骨歌 + 雷达图 ============ -->
      <section class="cgr-row cgr-pans">
        <div class="cgr-card cgr-pan">
          <h3 class="cgr-pan-title">{{ $t('chenggu.report.poemTitle') }}</h3>
          <div class="cgr-poem-box">
            <p class="cgr-poem">{{ result.fortune.poem }}</p>
          </div>
          <div class="cgr-poem-meta">
            <span class="cgr-level-mark" :class="'cgr-level-' + levelKey">{{ result.fortune.level }}</span>
            <span class="cgr-poem-note">{{ $t('chenggu.report.poemNote', { level: result.fortune.level }) }}</span>
          </div>
        </div>

        <div class="cgr-card cgr-pan">
          <h3 class="cgr-pan-title">{{ $t('chenggu.report.radarTitle') }}</h3>
          <svg class="cgr-radar" viewBox="0 0 240 240" role="img">
            <polygon
              v-for="lvl in radarLevels"
              :key="lvl"
              class="cgr-radar-grid"
              :points="radarRingPoints(lvl)"
            />
            <line
              v-for="(axis, i) in radarAxes"
              :key="i"
              class="cgr-radar-axis"
              :x1="radarCenter" :y1="radarCenter"
              :x2="axis.x" :y2="axis.y"
            />
            <polygon class="cgr-radar-area" :points="radarAreaPoints" />
            <circle
              v-for="(p, i) in radarValuePoints"
              :key="i"
              class="cgr-radar-dot"
              :cx="p.x" :cy="p.y" r="3"
            />
            <text
              v-for="(axis, i) in radarAxes"
              :key="'label-' + i"
              class="cgr-radar-label"
              :x="axis.lx" :y="axis.ly"
              text-anchor="middle"
              dominant-baseline="middle"
            >{{ axis.label }} {{ weightText(axis.weight) }}</text>
          </svg>
          <p class="cgr-radar-note">{{ $t('chenggu.report.radarNote', { max: RADAR_MAX_LIANG }) }}</p>
        </div>
      </section>

      <!-- ============ AI 章节 01-05 ============ -->
      <section class="cgr-section">
        <h3 class="cgr-section-title">{{ $t('chenggu.report.aiTitle') }}</h3>
        <div class="cgr-ai-grid">
          <div
            v-for="(sec, i) in aiSectionList"
            :key="sec.no"
            class="cgr-card cgr-ai"
            :class="{ 'cgr-ai-wide': i === aiSectionList.length - 1 && aiSectionList.length % 2 === 1 }"
          >
            <h3 class="cgr-ai-title"><span class="cgr-ai-no">{{ sec.no }}</span>{{ sec.title }}</h3>
            <div class="cgr-ai-body cgr-md" v-html="renderSection(sec.content)" />
            <span
              v-if="streaming && i === aiSectionList.length - 1"
              class="cgr-cursor"
            />
          </div>
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="cgr-streaming">
        <span class="cgr-streaming-dot" />
        {{ $t('chenggu.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="cgr-error">
        <p>{{ error }}</p>
        <button type="button" class="cgr-retry" @click="$emit('retry')">{{ $t('chenggu.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="cgr-foot">
        <span class="cgr-foot-note">ⓘ {{ $t('chenggu.report.footerNote') }}</span>
        <span class="cgr-seal cgr-seal-foot">{{ $t('chenggu.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

export interface ChengguReportWeight {
  liang: number
  qian: number
  totalQian: number
}

export interface ChengguReportResult {
  totalWeight: ChengguReportWeight
  breakdown: {
    year: { ganzhi: string; weight: ChengguReportWeight }
    month: { lunarMonth: number; weight: ChengguReportWeight }
    day: { lunarDay: number; weight: ChengguReportWeight }
    hour: { shiChen: string; weight: ChengguReportWeight }
  }
  fortune: {
    level: string
    poem: string
    annotation: string
  }
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean }
  solarDate: { year: number; month: number; day: number }
  gender: 'male' | 'female'
}

interface Props {
  result: ChengguReportResult
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 工具 ---------- */

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function weightText(w: ChengguReportWeight): string {
  if (w.liang === 0) return `${w.qian}${t('chenggu.qianUnit')}`
  if (w.qian === 0) return `${w.liang}${t('chenggu.liangUnit')}`
  return `${w.liang}${t('chenggu.liangUnit')}${w.qian}${t('chenggu.qianUnit')}`
}

/* ---------- 报告头 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const LEVEL_ORDER = ['下下', '中下', '中上', '上等', '极贵'] as const
const levelKey = computed(() => {
  const idx = LEVEL_ORDER.indexOf(props.result.fortune.level as typeof LEVEL_ORDER[number])
  return idx >= 0 ? `l${idx + 1}` : 'l3'
})

const verdict = computed(() => t(`chenggu.report.verdict${levelKey.value.toUpperCase()}`))

const titleText = computed(() =>
  t('chenggu.report.title', { weight: weightText(props.result.totalWeight), level: props.result.fortune.level }))

const metaLine = computed(() => t('chenggu.report.metaLine', {
  solar: `${props.result.solarDate.year}-${pad(props.result.solarDate.month)}-${pad(props.result.solarDate.day)}`,
  gender: props.result.gender === 'male' ? t('common.male') : t('common.female'),
  weight: weightText(props.result.totalWeight),
  level: props.result.fortune.level,
}))

/* ---------- 骨重仪表 ---------- */

// 称骨总重理论上限约 7.2 两（年 1.9 + 月 1.8 + 日 1.8 + 时 1.6，单位钱 72）
const GAUGE_MAX = 72
const gaugePct = computed(() =>
  Math.min(100, Math.max(2, Math.round((props.result.totalWeight.totalQian / GAUGE_MAX) * 100))))

/* ---------- 四柱明细 ---------- */

const breakdownItems = computed(() => {
  const b = props.result.breakdown
  return [
    {
      key: 'year',
      label: t('chenggu.yearWeight'),
      weight: b.year.weight,
      detail: `${b.year.ganzhi}${t('chenggu.report.yearUnit')}`,
    },
    {
      key: 'month',
      label: t('chenggu.monthWeight'),
      weight: b.month.weight,
      detail: `${t('chenggu.report.lunarPrefix')}${b.month.lunarMonth}${t('chenggu.report.monthUnit')}`,
    },
    {
      key: 'day',
      label: t('chenggu.dayWeight'),
      weight: b.day.weight,
      detail: `${t('chenggu.report.lunarPrefix')}${b.day.lunarDay}${t('chenggu.report.dayUnit')}`,
    },
    {
      key: 'hour',
      label: t('chenggu.hourWeight'),
      weight: b.hour.weight,
      detail: `${b.hour.shiChen}${t('chenggu.report.hourUnit')}`,
    },
  ]
})

// 单项骨重条形图以 2.0 两（20 钱）为满刻度
const BAR_ITEM_MAX = 20
function barPct(qian: number): number {
  return Math.max(4, Math.round((qian / BAR_ITEM_MAX) * 100))
}
const totalBarPct = computed(() => gaugePct.value)

function sharePct(qian: number): string {
  const total = props.result.totalWeight.totalQian
  if (!total) return '0.0'
  return ((qian / total) * 100).toFixed(1)
}

/* ---------- 雷达图 ---------- */

const radarCenter = 120
const radarRadius = 82
// 单柱雷达满刻度取 2.0 两（20 钱），超出截断
const RADAR_MAX_LIANG = 2.0

const radarLevels = [0.25, 0.5, 0.75, 1]

function radarPoint(index: number, ratio: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / 4 - Math.PI / 2
  return {
    x: radarCenter + radarRadius * ratio * Math.cos(angle),
    y: radarCenter + radarRadius * ratio * Math.sin(angle),
  }
}

function radarRingPoints(ratio: number): string {
  return Array.from({ length: 4 }, (_, i) => {
    const p = radarPoint(i, ratio)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')
}

const radarAxes = computed(() =>
  breakdownItems.value.map((item, i) => {
    const p = radarPoint(i, 1)
    const lp = radarPoint(i, 1.3)
    return {
      x: p.x, y: p.y, lx: lp.x, ly: lp.y,
      label: item.label,
      weight: item.weight,
    }
  }))

const radarValuePoints = computed(() =>
  breakdownItems.value.map((item, i) => {
    const ratio = Math.min(1, item.weight.totalQian / (RADAR_MAX_LIANG * 10))
    return radarPoint(i, Math.max(0.06, ratio))
  }))

const radarAreaPoints = computed(() =>
  radarValuePoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))

/* ---------- AI 内容解析 ---------- */

const aiSectionList = computed(() => {
  const text = props.aiContent || ''
  if (!text.trim()) return []
  const raws = text.split(/\n(?=##\s)/)
  const list: { no: string; title: string; content: string }[] = []
  for (const raw of raws) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const nl = trimmed.indexOf('\n')
    const head = nl === -1 ? trimmed : trimmed.slice(0, nl)
    const title = head.replace(/^##\s*/, '').trim()
    const content = nl === -1 ? '' : trimmed.slice(nl + 1).trim()
    if (title || content) {
      list.push({
        no: String(list.length + 1).padStart(2, '0'),
        title: title || t('chenggu.interpretation'),
        content,
      })
    }
  }
  return list
})

function renderSection(content: string): string {
  if (!content) {
    return `<p class="cgr-pending">${t('chenggu.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.cgr {
  --cgr-bg: #f2ede3;
  --cgr-sheet: #faf6ec;
  --cgr-card: #fffdf6;
  --cgr-ink: #2e2a24;
  --cgr-ink-soft: #55503f;
  --cgr-ink-faint: #8a8272;
  --cgr-line: #d8d0bd;
  --cgr-line-soft: #e6dfcd;
  --cgr-accent: #8c2f26;
  --cgr-accent-soft: #a8512e;
  --cgr-star: #8c6d1f;
  --cgr-green: #4a7c59;
  border-radius: 12px;
  background: var(--cgr-bg);
  padding: 18px;
  color: var(--cgr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.cgr-sheet {
  background: var(--cgr-sheet);
  border: 1px solid var(--cgr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.cgr-head { border-bottom: 2px solid var(--cgr-ink); padding-bottom: 16px; }
.cgr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.cgr-brand { display: flex; align-items: center; gap: 8px; }
.cgr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--cgr-accent);
  color: var(--cgr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.cgr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--cgr-ink-soft); }
.cgr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--cgr-ink-faint); }
.cgr-verdict { color: var(--cgr-green); font-weight: 600; }
.cgr-rating { letter-spacing: 1px; }

.cgr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.cgr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--cgr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.cgr-head-bottom { text-align: center; }
.cgr-meta-line { margin: 2px 0; font-size: 12px; color: var(--cgr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.cgr-row { display: grid; gap: 14px; margin-top: 16px; }
.cgr-row-top { grid-template-columns: 1fr 2fr; }
.cgr-pans { grid-template-columns: 1fr 1fr; }
.cgr-section { margin-top: 16px; }

.cgr-card {
  background: var(--cgr-card);
  border: 1px solid var(--cgr-line);
  padding: 14px 16px;
}
.cgr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 生辰信息卡 ---------- */
.cgr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.cgr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.cgr-ico { color: var(--cgr-accent-soft); font-size: 12px; }
.cgr-profile-label { color: var(--cgr-ink-faint); min-width: 30px; }
.cgr-profile-value { color: var(--cgr-ink); letter-spacing: 0.5px; }

/* ---------- 总骨重卡 ---------- */
.cgr-total { display: grid; grid-template-columns: 1fr 1.2fr; gap: 14px; align-items: center; }
.cgr-total-left { text-align: center; display: flex; flex-direction: column; gap: 6px; align-items: center; }
.cgr-total-label { font-size: 11px; color: var(--cgr-ink-faint); letter-spacing: 2px; }
.cgr-total-value { font-size: 30px; font-weight: 700; letter-spacing: 2px; color: var(--cgr-accent-soft); }
.cgr-total-qian { font-size: 10px; color: var(--cgr-ink-faint); }
.cgr-total-right { display: flex; flex-direction: column; gap: 6px; }
.cgr-gauge-label { font-size: 11px; color: var(--cgr-ink-faint); letter-spacing: 1px; text-align: center; }

.cgr-level-mark {
  display: inline-block;
  font-size: 11px;
  padding: 2px 12px;
  border-radius: 2px;
  letter-spacing: 2px;
  white-space: nowrap;
}
.cgr-level-l1 { background: rgba(140, 47, 38, 0.12); color: var(--cgr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.cgr-level-l2 { background: rgba(168, 81, 46, 0.12); color: var(--cgr-accent-soft); border: 1px solid rgba(168, 81, 46, 0.35); }
.cgr-level-l3 { background: rgba(140, 109, 31, 0.12); color: var(--cgr-star); border: 1px solid rgba(140, 109, 31, 0.35); }
.cgr-level-l4 { background: rgba(106, 140, 78, 0.14); color: #5c7a42; border: 1px solid rgba(106, 140, 78, 0.35); }
.cgr-level-l5 { background: rgba(74, 124, 89, 0.14); color: var(--cgr-green); border: 1px solid rgba(74, 124, 89, 0.35); }

.cgr-gauge-track { position: relative; height: 10px; display: flex; border: 1px solid var(--cgr-line); overflow: hidden; }
.cgr-gauge-zone { height: 100%; }
.cgr-gauge-zone-1 { flex: 29; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.cgr-gauge-zone-2 { flex: 10; background: #e9d9c4; }
.cgr-gauge-zone-3 { flex: 10; background: #efe9d8; }
.cgr-gauge-zone-4 { flex: 10; background: #dde5d5; }
.cgr-gauge-zone-5 { flex: 13; background: linear-gradient(90deg, #d9e4dc, #b8cdc0); }
.cgr-gauge-pointer {
  position: absolute; top: -2px; width: 2px; height: 14px;
  background: var(--cgr-ink); transform: translateX(-1px);
}
.cgr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--cgr-ink-faint); margin-top: 3px; }
.cgr-gauge-note { margin: 4px 0 0; text-align: center; font-size: 9.5px; color: var(--cgr-ink-faint); }

/* ---------- 核心数据卡 ---------- */
.cgr-core-grid { display: grid; grid-template-columns: repeat(4, 0.7fr) 1.6fr; gap: 10px; }
.cgr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.cgr-core-label { font-size: 11px; color: var(--cgr-ink-faint); letter-spacing: 1px; }
.cgr-core-value { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.cgr-core-sub { font-size: 10px; color: var(--cgr-ink-faint); }
.cgr-bars-card { text-align: left; }

.cgr-bars { display: flex; flex-direction: column; gap: 5px; width: 100%; }
.cgr-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.cgr-bar-name { width: 32px; color: var(--cgr-ink-soft); flex-shrink: 0; }
.cgr-bar-wrap { flex: 1; height: 7px; background: var(--cgr-line-soft); }
.cgr-bar { display: block; height: 100%; background: var(--cgr-star); }
.cgr-bar-row-total { border-top: 1px dashed var(--cgr-line); padding-top: 5px; }
.cgr-bar-row-total .cgr-bar-name { font-weight: 700; color: var(--cgr-ink); }
.cgr-bar-total { background: var(--cgr-accent-soft); }
.cgr-bar-pct { width: 40px; text-align: right; color: var(--cgr-ink-faint); flex-shrink: 0; }

/* ---------- 骨重明细表 ---------- */
.cgr-table-card { padding: 10px 12px; }
.cgr-table-wrap { overflow-x: auto; }
.cgr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.cgr-table th, .cgr-table td {
  border: 1px solid var(--cgr-line);
  padding: 6px 7px;
  vertical-align: top;
  text-align: left;
  line-height: 1.55;
}
.cgr-table thead th {
  background: var(--cgr-line-soft);
  font-weight: 700;
  color: var(--cgr-ink);
  text-align: center;
  letter-spacing: 1px;
  white-space: nowrap;
}
.cgr-table-rowhead {
  background: var(--cgr-line-soft);
  font-weight: 700;
  color: var(--cgr-ink);
  white-space: nowrap;
  font-size: 11px;
}
.cgr-table td { color: var(--cgr-ink-soft); }
.cgr-td-value { font-size: 14px; font-weight: 700; color: var(--cgr-ink) !important; text-align: center; }
.cgr-row-total td, .cgr-row-total .cgr-table-rowhead { background: rgba(140, 47, 38, 0.04); }

/* ---------- 双盘 ---------- */
.cgr-pan { padding: 12px; }
.cgr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }

.cgr-poem-box {
  border: 1px solid var(--cgr-line);
  background: rgba(255, 255, 255, 0.5);
  padding: 16px 14px;
  min-height: 150px;
  display: flex; align-items: center; justify-content: center;
}
.cgr-poem {
  margin: 0;
  font-size: 15px;
  line-height: 2;
  letter-spacing: 1px;
  color: var(--cgr-ink);
  text-align: center;
  white-space: pre-line;
}
.cgr-poem-meta { margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
.cgr-poem-note { font-size: 10px; color: var(--cgr-ink-faint); }

.cgr-radar { width: 100%; max-width: 280px; display: block; margin: 0 auto; }
.cgr-radar-grid { fill: none; stroke: var(--cgr-line); stroke-width: 0.6; }
.cgr-radar-axis { stroke: var(--cgr-line-soft); stroke-width: 0.6; }
.cgr-radar-area { fill: rgba(140, 109, 31, 0.18); stroke: var(--cgr-star); stroke-width: 1.2; }
.cgr-radar-dot { fill: var(--cgr-star); }
.cgr-radar-label { font-size: 9.5px; fill: var(--cgr-ink-soft); letter-spacing: 0.5px; }
.cgr-radar-note { margin: 8px 0 0; text-align: center; font-size: 9.5px; color: var(--cgr-ink-faint); }

/* ---------- AI 章节 ---------- */
.cgr-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.cgr-ai-wide { grid-column: 1 / -1; }
.cgr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--cgr-line-soft);
  padding-bottom: 8px;
}
.cgr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--cgr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.cgr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--cgr-ink-soft); }

.cgr-md :deep(p) { margin: 0 0 0.7em; }
.cgr-md :deep(p:last-child) { margin-bottom: 0; }
.cgr-md :deep(strong) { color: var(--cgr-ink); font-weight: 700; }
.cgr-md :deep(ul), .cgr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.cgr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.cgr-md :deep(h3), .cgr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--cgr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.cgr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--cgr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.cgr-md :deep(.cgr-pending), .cgr-pending { color: var(--cgr-ink-faint); font-style: italic; }

.cgr-cursor {
  display: inline-block;
  width: 2px; height: 14px;
  background: var(--cgr-accent-soft);
  margin-left: 2px;
  vertical-align: middle;
  animation: cgr-pulse 1s ease-in-out infinite;
}

.cgr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--cgr-ink-faint); letter-spacing: 1px;
}
.cgr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--cgr-accent);
  animation: cgr-pulse 1s ease-in-out infinite;
}
@keyframes cgr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.cgr-error { margin-top: 14px; text-align: center; color: var(--cgr-accent); font-size: 12px; }
.cgr-retry {
  margin-top: 8px;
  border: 1px solid var(--cgr-accent);
  background: transparent;
  color: var(--cgr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.cgr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.cgr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--cgr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.cgr-foot-note { font-size: 10px; color: var(--cgr-ink-faint); }
.cgr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .cgr-row-top { grid-template-columns: 1fr; }
  .cgr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .cgr-bars-card { grid-column: 1 / -1; }
}

.cgr-pan, .cgr-ai, .cgr-bars, .cgr-total { min-width: 0; }

@media (max-width: 720px) {
  .cgr { padding: 8px; }
  .cgr-sheet { padding: 16px 12px; }
  .cgr-pans { grid-template-columns: 1fr; }
  .cgr-ai-grid { grid-template-columns: 1fr; }
  .cgr-total { grid-template-columns: 1fr; }
  .cgr-title { font-size: 20px; letter-spacing: 2px; }
  .cgr-core-grid { grid-template-columns: 1fr 1fr; }
  .cgr-table { min-width: 480px; }
}
</style>
