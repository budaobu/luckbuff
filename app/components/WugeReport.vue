<template>
  <div class="wgr">
    <div class="wgr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="wgr-head">
        <div class="wgr-head-top">
          <div class="wgr-brand">
            <div class="wgr-seal">{{ $t('wuge.report.seal') }}</div>
            <span class="wgr-brand-name">{{ $t('wuge.report.brandName') }}</span>
          </div>
          <div class="wgr-head-right">
            <span class="wgr-time">{{ $t('wuge.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="wgr-rating">{{ $t('wuge.report.rating') }}</span>
            <span class="wgr-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="wgr-title">{{ titleText }}</h1>
        <p class="wgr-subtitle">{{ subtitleText }}</p>

        <div class="wgr-head-bottom">
          <p class="wgr-meta-line">{{ totalLine }}</p>
        </div>
      </header>

      <!-- ============ 姓名信息 + 总评 ============ -->
      <section class="wgr-row wgr-row-top">
        <div class="wgr-card wgr-profile">
          <div class="wgr-profile-line">
            <span class="wgr-ico">名</span>
            <span class="wgr-profile-label">{{ $t('wuge.report.nameLabel') }}</span>
            <span class="wgr-profile-value">{{ result.input }}</span>
          </div>
          <div class="wgr-profile-line">
            <span class="wgr-ico">氏</span>
            <span class="wgr-profile-label">{{ $t('wuge.report.surnameLabel') }}</span>
            <span class="wgr-profile-value">{{ result.surname }}</span>
          </div>
          <div class="wgr-profile-line">
            <span class="wgr-ico">字</span>
            <span class="wgr-profile-label">{{ $t('wuge.report.givenLabel') }}</span>
            <span class="wgr-profile-value">{{ result.givenName }}</span>
          </div>
          <div class="wgr-profile-line">
            <span class="wgr-ico">画</span>
            <span class="wgr-profile-label">{{ $t('wuge.report.totalStrokesLabel') }}</span>
            <span class="wgr-profile-value">{{ result.chars.reduce((s, c) => s + c.strokes, 0) }}</span>
          </div>
        </div>

        <div class="wgr-card">
          <h3 class="wgr-card-title">{{ $t('wuge.report.overviewTitle') }}</h3>
          <div class="wgr-overview-grid">
            <div class="wgr-mini">
              <h4 class="wgr-mini-head wgr-mini-head-star">★ {{ $t('wuge.report.advantagesTitle') }}</h4>
              <div v-for="(g, i) in bestGrids" :key="i" class="wgr-point">
                <div class="wgr-point-title"><span class="wgr-point-ico">★</span>{{ g.label }} · {{ g.grid.value }}</div>
                <div class="wgr-point-desc">{{ g.grid.fortune.desc }}</div>
              </div>
            </div>
            <div class="wgr-mini">
              <h4 class="wgr-mini-head wgr-mini-head-warn">⊘ {{ $t('wuge.report.concernsTitle') }}</h4>
              <template v-if="worstGrids.length">
                <div v-for="(g, i) in worstGrids" :key="i" class="wgr-point">
                  <div class="wgr-point-title wgr-point-title-warn"><span class="wgr-point-ico">⊘</span>{{ g.label }} · {{ g.grid.value }}</div>
                  <div class="wgr-point-desc">{{ g.grid.fortune.desc }}</div>
                </div>
              </template>
              <p v-else class="wgr-mini-body">{{ $t('wuge.report.noConcerns') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 核心数据 ============ -->
      <section class="wgr-section">
        <h3 class="wgr-section-title">{{ $t('wuge.report.coreDataTitle') }}</h3>
        <div class="wgr-core-grid">
          <div class="wgr-card wgr-core">
            <div class="wgr-core-label">{{ $t('wuge.report.overallGradeLabel') }}</div>
            <div class="wgr-core-value wgr-grade" :class="'wgr-grade-' + gradeKey">{{ grade }}</div>
            <div class="wgr-core-sub">{{ $t('wuge.report.scoreText', { score }) }}</div>
          </div>
          <div class="wgr-card wgr-core">
            <div class="wgr-core-label">{{ $t('wuge.report.coreRengeLabel') }}</div>
            <div class="wgr-core-value">{{ result.grids.renge.value }}</div>
            <div class="wgr-core-sub">{{ result.grids.renge.fortune.fortune }}</div>
          </div>
          <div class="wgr-card wgr-core">
            <div class="wgr-core-label">{{ $t('wuge.report.zonggeLabel') }}</div>
            <div class="wgr-core-value">{{ result.grids.zongge.value }}</div>
            <div class="wgr-core-sub">{{ result.grids.zongge.fortune.fortune }}</div>
          </div>
          <div class="wgr-card wgr-core">
            <div class="wgr-core-label">{{ $t('wuge.report.goodGridRatioLabel') }}</div>
            <div class="wgr-core-value">{{ goodGridCount }}<span class="wgr-core-dim">/5</span></div>
            <div class="wgr-gauge">
              <div class="wgr-gauge-track">
                <span class="wgr-gauge-zone wgr-gauge-zone-bad" />
                <span class="wgr-gauge-zone wgr-gauge-zone-mid" />
                <span class="wgr-gauge-zone wgr-gauge-zone-good" />
                <span class="wgr-gauge-pointer" :style="{ left: (goodGridCount / 5) * 100 + '%' }" />
              </div>
              <div class="wgr-gauge-marks">
                <span>{{ $t('wuge.report.gaugeWeak') }}</span>
                <span>{{ $t('wuge.report.gaugeMid') }}</span>
                <span>{{ $t('wuge.report.gaugeGood') }}</span>
              </div>
            </div>
          </div>
          <div class="wgr-card wgr-core">
            <div class="wgr-core-label">{{ $t('wuge.report.gridBarLabel') }}</div>
            <div class="wgr-bars">
              <div v-for="row in gridBarList" :key="row.key" class="wgr-bar-row">
                <span class="wgr-bar-dot" :style="{ background: row.color }" />
                <span class="wgr-bar-name">{{ row.label }}</span>
                <span class="wgr-bar-wrap"><span class="wgr-bar" :style="{ width: row.pct + '%', background: row.color }" /></span>
                <span class="wgr-bar-pct">{{ row.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 五格总览表 ============ -->
      <section class="wgr-section">
        <h3 class="wgr-section-title">{{ $t('wuge.report.gridOverviewTitle') }}</h3>
        <div class="wgr-card wgr-table-card">
          <div class="wgr-table-wrap">
            <table class="wgr-table">
              <thead>
                <tr>
                  <th>{{ $t('wuge.report.colGrid') }}</th>
                  <th>{{ $t('wuge.report.colValue') }}</th>
                  <th>{{ $t('wuge.report.colFortune') }}</th>
                  <th>{{ $t('wuge.report.colDomain') }}</th>
                  <th>{{ $t('wuge.report.colDesc') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in gridRows" :key="row.key" :class="{ 'wgr-row-renge': row.key === 'renge' }">
                  <th class="wgr-table-rowhead">{{ row.label }}</th>
                  <td class="wgr-td-value">{{ row.grid.value }}</td>
                  <td><span class="wgr-mark" :class="'wgr-mark-' + row.mark">{{ row.grid.fortune.fortune }}</span></td>
                  <td>{{ row.domain }}</td>
                  <td>{{ row.grid.fortune.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ 双盘：笔画拆解 + 雷达图 ============ -->
      <section class="wgr-row wgr-pans">
        <div class="wgr-card wgr-pan">
          <h3 class="wgr-pan-title">{{ $t('wuge.report.strokeChartTitle') }}</h3>
          <div class="wgr-chars">
            <div v-for="(c, i) in result.chars" :key="i" class="wgr-char-box">
              <div class="wgr-char-role">{{ i < result.surname.length ? $t('wuge.report.roleSurname') : $t('wuge.report.roleGiven') }}</div>
              <div class="wgr-char-glyph">{{ c.char }}</div>
              <div class="wgr-char-strokes">{{ $t('wuge.report.strokesValue', { n: c.strokes }) }}</div>
            </div>
          </div>
          <div class="wgr-formula">
            <div class="wgr-formula-title">{{ $t('wuge.report.formulaTitle') }}</div>
            <div v-for="line in formulaLines" :key="line.label" class="wgr-formula-line">
              <span class="wgr-formula-label">{{ line.label }}</span>
              <span class="wgr-formula-expr">{{ line.expr }}</span>
              <span class="wgr-formula-eq">= {{ line.value }}</span>
            </div>
          </div>
        </div>

        <div class="wgr-card wgr-pan">
          <h3 class="wgr-pan-title">{{ $t('wuge.report.radarTitle') }}</h3>
          <svg class="wgr-radar" viewBox="0 0 240 240" role="img">
            <polygon
              v-for="lvl in radarLevels"
              :key="lvl"
              class="wgr-radar-grid"
              :points="radarRingPoints(lvl)"
            />
            <line
              v-for="(axis, i) in radarAxes"
              :key="i"
              class="wgr-radar-axis"
              :x1="radarCenter" :y1="radarCenter"
              :x2="axis.x" :y2="axis.y"
            />
            <polygon class="wgr-radar-area" :points="radarAreaPoints" />
            <circle
              v-for="(p, i) in radarValuePoints"
              :key="i"
              class="wgr-radar-dot"
              :cx="p.x" :cy="p.y" r="3"
            />
            <text
              v-for="(axis, i) in radarAxes"
              :key="'label-' + i"
              class="wgr-radar-label"
              :x="axis.lx" :y="axis.ly"
              text-anchor="middle"
              dominant-baseline="middle"
            >{{ axis.label }} {{ radarAxes[i]!.value }}</text>
          </svg>
          <p class="wgr-radar-note">{{ $t('wuge.report.radarNote') }}</p>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="wgr-row wgr-ai-row">
        <div class="wgr-card wgr-ai">
          <h3 class="wgr-ai-title"><span class="wgr-ai-no">01</span>{{ $t('wuge.report.secTianRen') }}</h3>
          <div class="wgr-ai-sub">
            <h4 class="wgr-ai-sub-head">{{ $t('wuge.tiange') }} · {{ result.grids.tiange.value }}</h4>
            <div class="wgr-ai-body wgr-md" v-html="renderSection(sectionContent('天格'))" />
          </div>
          <div class="wgr-ai-sub">
            <h4 class="wgr-ai-sub-head">{{ $t('wuge.renge') }} · {{ result.grids.renge.value }}</h4>
            <div class="wgr-ai-body wgr-md" v-html="renderSection(sectionContent('人格'))" />
          </div>
        </div>
        <div class="wgr-card wgr-ai">
          <h3 class="wgr-ai-title"><span class="wgr-ai-no">02</span>{{ $t('wuge.report.secDiWai') }}</h3>
          <div class="wgr-ai-sub">
            <h4 class="wgr-ai-sub-head">{{ $t('wuge.dige') }} · {{ result.grids.dige.value }}</h4>
            <div class="wgr-ai-body wgr-md" v-html="renderSection(sectionContent('地格'))" />
          </div>
          <div class="wgr-ai-sub">
            <h4 class="wgr-ai-sub-head">{{ $t('wuge.waige') }} · {{ result.grids.waige.value }}</h4>
            <div class="wgr-ai-body wgr-md" v-html="renderSection(sectionContent('外格'))" />
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="wgr-row wgr-ai-row">
        <div class="wgr-card wgr-ai">
          <h3 class="wgr-ai-title"><span class="wgr-ai-no">03</span>{{ $t('wuge.report.secZongge') }}</h3>
          <div class="wgr-ai-sub">
            <h4 class="wgr-ai-sub-head">{{ $t('wuge.zongge') }} · {{ result.grids.zongge.value }}</h4>
            <div class="wgr-ai-body wgr-md" v-html="renderSection(sectionContent('总格'))" />
          </div>
        </div>
        <div class="wgr-card wgr-ai">
          <h3 class="wgr-ai-title"><span class="wgr-ai-no">04</span>{{ $t('wuge.report.secSynthesis') }}</h3>
          <div class="wgr-ai-body wgr-md" v-html="renderSection(sectionContent('综合评鉴'))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="wgr-streaming">
        <span class="wgr-streaming-dot" />
        {{ $t('wuge.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="wgr-error">
        <p>{{ error }}</p>
        <button type="button" class="wgr-retry" @click="$emit('retry')">{{ $t('wuge.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="wgr-foot">
        <span class="wgr-foot-note">ⓘ {{ $t('wuge.report.footerNote') }}</span>
        <span class="wgr-seal wgr-seal-foot">{{ $t('wuge.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

export interface WugeReportGrid {
  name: string
  value: number
  fortune: {
    fortune: string
    desc: string
  }
}

export interface WugeReportResult {
  input: string
  surname: string
  givenName: string
  chars: { char: string; strokes: number }[]
  grids: {
    tiange: WugeReportGrid
    renge: WugeReportGrid
    dige: WugeReportGrid
    waige: WugeReportGrid
    zongge: WugeReportGrid
  }
}

interface Props {
  result: WugeReportResult
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 报告头 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const GRID_KEYS = ['tiange', 'renge', 'dige', 'waige', 'zongge'] as const
type GridKey = typeof GRID_KEYS[number]

const FORTUNE_SCORE: Record<string, number> = {
  大吉: 100, 吉: 85, 半吉: 70, 吉多于凶: 55, 凶多于吉: 45, 凶: 30, 大凶: 15,
}

const gridList = computed(() =>
  GRID_KEYS.map(key => ({ key, label: t(`wuge.${key}`), grid: props.result.grids[key] })))

const goodGridCount = computed(() =>
  gridList.value.filter(g => (FORTUNE_SCORE[g.grid.fortune.fortune] ?? 60) >= 70).length)

const score = computed(() => Math.round(
  gridList.value.reduce((s, g) => s + (FORTUNE_SCORE[g.grid.fortune.fortune] ?? 60), 0) / gridList.value.length))

const gradeKey = computed(() => {
  if (score.value >= 85) return 'jia'
  if (score.value >= 70) return 'yi'
  if (score.value >= 55) return 'bing'
  return 'ding'
})
const grade = computed(() => t(`wuge.report.grade${gradeKey.value.charAt(0).toUpperCase()}${gradeKey.value.slice(1)}`))

const verdict = computed(() => {
  if (score.value >= 85) return t('wuge.report.verdictExcellent')
  if (score.value >= 70) return t('wuge.report.verdictGood')
  if (score.value >= 55) return t('wuge.report.verdictAverage')
  return t('wuge.report.verdictWeak')
})

const titleText = computed(() =>
  t('wuge.report.title', { name: props.result.input, grade: grade.value }))

const subtitleText = computed(() => t('wuge.report.subtitle'))

const totalLine = computed(() => t('wuge.report.totalLine', {
  tiange: props.result.grids.tiange.value,
  renge: props.result.grids.renge.value,
  dige: props.result.grids.dige.value,
  waige: props.result.grids.waige.value,
  zongge: props.result.grids.zongge.value,
}))

/* ---------- 优势 / 隐忧 ---------- */

const bestGrids = computed(() =>
  [...gridList.value]
    .sort((a, b) => (FORTUNE_SCORE[b.grid.fortune.fortune] ?? 60) - (FORTUNE_SCORE[a.grid.fortune.fortune] ?? 60))
    .slice(0, 2))

const worstGrids = computed(() =>
  gridList.value.filter(g => (FORTUNE_SCORE[g.grid.fortune.fortune] ?? 60) < 55)
    .sort((a, b) => (FORTUNE_SCORE[a.grid.fortune.fortune] ?? 60) - (FORTUNE_SCORE[b.grid.fortune.fortune] ?? 60))
    .slice(0, 2))

/* ---------- 五格总览表 ---------- */

const MARKS = ['same', 'good', 'partial', 'warn', 'conflict'] as const
function markOf(fortune: string): typeof MARKS[number] {
  if (fortune === '大吉') return 'same'
  if (fortune === '吉') return 'good'
  if (fortune === '半吉') return 'partial'
  if (fortune === '凶') return 'warn'
  return 'conflict'
}

const DOMAIN_KEYS: Record<GridKey, string> = {
  tiange: 'domainTiange',
  renge: 'domainRenge',
  dige: 'domainDige',
  waige: 'domainWaige',
  zongge: 'domainZongge',
}

const gridRows = computed(() =>
  gridList.value.map(g => ({
    ...g,
    mark: markOf(g.grid.fortune.fortune),
    domain: t(`wuge.report.${DOMAIN_KEYS[g.key]}`),
  })))

/* ---------- 条形图 ---------- */

const FORTUNE_COLORS: Record<string, string> = {
  大吉: '#4a7c59', 吉: '#6a8c4e', 半吉: '#8c6d1f', 凶: '#a8512e', 大凶: '#8c2f26',
}
const gridBarList = computed(() =>
  gridList.value.map(g => ({
    key: g.key,
    label: g.label,
    value: g.grid.value,
    pct: Math.max(4, Math.round((g.grid.value / 81) * 100)),
    color: FORTUNE_COLORS[g.grid.fortune.fortune] ?? '#7d7d68',
  })))

/* ---------- 推演算式 ---------- */

const formulaLines = computed(() => {
  const r = props.result
  const chars = r.chars
  const sLen = r.surname.length
  const surnameSum = chars.slice(0, sLen).map(c => c.strokes).join(' + ')
  const givenSum = chars.slice(sLen).map(c => c.strokes).join(' + ')
  const allSum = chars.map(c => c.strokes).join(' + ')
  const g = r.grids
  return [
    {
      label: t('wuge.tiange'),
      expr: sLen === 1 ? `${surnameSum} + 1` : surnameSum,
      value: g.tiange.value,
    },
    {
      label: t('wuge.renge'),
      expr: `${chars[sLen - 1]!.strokes} + ${chars[sLen]!.strokes}`,
      value: g.renge.value,
    },
    {
      label: t('wuge.dige'),
      expr: r.givenName.length === 1 ? `${givenSum} + 1` : givenSum,
      value: g.dige.value,
    },
    {
      label: t('wuge.waige'),
      expr: `${g.zongge.value} − ${g.renge.value} + 1`,
      value: g.waige.value,
    },
    {
      label: t('wuge.zongge'),
      expr: allSum,
      value: g.zongge.value,
    },
  ]
})

/* ---------- 雷达图 ---------- */

const radarCenter = 120
const radarRadius = 82

const RADAR_LABEL_I18N: Record<GridKey, string> = {
  tiange: 'radarTian',
  renge: 'radarRen',
  dige: 'radarDi',
  waige: 'radarWai',
  zongge: 'radarZong',
}

function radarPoint(index: number, ratio: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2
  return {
    x: radarCenter + radarRadius * ratio * Math.cos(angle),
    y: radarCenter + radarRadius * ratio * Math.sin(angle),
  }
}

const radarLevels = [0.25, 0.5, 0.75, 1]
function radarRingPoints(ratio: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const p = radarPoint(i, ratio)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')
}

const radarAxes = computed(() =>
  GRID_KEYS.map((key, i) => {
    const p = radarPoint(i, 1)
    const lp = radarPoint(i, 1.24)
    return {
      x: p.x, y: p.y, lx: lp.x, ly: lp.y,
      label: t(`wuge.report.${RADAR_LABEL_I18N[key]}`),
      value: props.result.grids[key].value,
    }
  }))

const radarValuePoints = computed(() =>
  GRID_KEYS.map((key, i) => {
    const ratio = Math.min(1, props.result.grids[key].value / 81)
    return radarPoint(i, Math.max(0.08, ratio))
  }))

const radarAreaPoints = computed(() =>
  radarValuePoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))

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

/** 按章节关键字模糊匹配（兼容「天格 / Heaven Grid」这类双语标题） */
function sectionContent(keyword: string): string {
  const entry = Object.entries(aiSections.value).find(([title]) => title.includes(keyword))
  return entry?.[1] ?? ''
}

function renderSection(content: string): string {
  if (!content) {
    return `<p class="wgr-pending">${t('wuge.report.pending')}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.wgr {
  --wgr-bg: #f2ede3;
  --wgr-sheet: #faf6ec;
  --wgr-card: #fffdf6;
  --wgr-ink: #2e2a24;
  --wgr-ink-soft: #55503f;
  --wgr-ink-faint: #8a8272;
  --wgr-line: #d8d0bd;
  --wgr-line-soft: #e6dfcd;
  --wgr-accent: #8c2f26;
  --wgr-accent-soft: #a8512e;
  --wgr-star: #8c6d1f;
  --wgr-green: #4a7c59;
  border-radius: 12px;
  background: var(--wgr-bg);
  padding: 18px;
  color: var(--wgr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.wgr-sheet {
  background: var(--wgr-sheet);
  border: 1px solid var(--wgr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.wgr-head { border-bottom: 2px solid var(--wgr-ink); padding-bottom: 16px; }
.wgr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.wgr-brand { display: flex; align-items: center; gap: 8px; }
.wgr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--wgr-accent);
  color: var(--wgr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.wgr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--wgr-ink-soft); }
.wgr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--wgr-ink-faint); }
.wgr-verdict { color: var(--wgr-green); font-weight: 600; }
.wgr-rating { letter-spacing: 1px; }

.wgr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.wgr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--wgr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.wgr-head-bottom { text-align: center; }
.wgr-meta-line { margin: 2px 0; font-size: 12px; color: var(--wgr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.wgr-row { display: grid; gap: 14px; margin-top: 16px; }
.wgr-row-top { grid-template-columns: 1fr 2.2fr; }
.wgr-pans { grid-template-columns: 1fr 1fr; }
.wgr-ai-row { grid-template-columns: 1fr 1fr; }
.wgr-section { margin-top: 16px; }

.wgr-card {
  background: var(--wgr-card);
  border: 1px solid var(--wgr-line);
  padding: 14px 16px;
}
.wgr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--wgr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.wgr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 姓名信息卡 ---------- */
.wgr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.wgr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.wgr-ico { color: var(--wgr-accent-soft); font-size: 12px; }
.wgr-profile-label { color: var(--wgr-ink-faint); min-width: 30px; }
.wgr-profile-value { color: var(--wgr-ink); letter-spacing: 0.5px; }

/* ---------- 总评优劣势 ---------- */
.wgr-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.wgr-mini { border: 1px dashed var(--wgr-line); padding: 10px 12px; background: rgba(255, 255, 255, 0.45); }
.wgr-mini-head { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: var(--wgr-accent-soft); letter-spacing: 1px; }
.wgr-mini-head-star { color: var(--wgr-star); }
.wgr-mini-head-warn { color: var(--wgr-accent); }
.wgr-mini-body { margin: 0; font-size: 12px; line-height: 1.7; color: var(--wgr-ink-soft); }
.wgr-point { margin-bottom: 7px; }
.wgr-point:last-child { margin-bottom: 0; }
.wgr-point-title { font-size: 12px; font-weight: 700; color: var(--wgr-ink); display: flex; gap: 5px; align-items: baseline; }
.wgr-point-title-warn { color: var(--wgr-accent); }
.wgr-point-ico { font-size: 10px; color: var(--wgr-star); }
.wgr-point-desc { font-size: 11px; color: var(--wgr-ink-faint); line-height: 1.55; margin-top: 1px; padding-left: 15px; }

/* ---------- 核心数据卡 ---------- */
.wgr-core-grid { display: grid; grid-template-columns: 1fr 0.8fr 0.8fr 1.2fr 1.6fr; gap: 10px; }
.wgr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; justify-content: center; }
.wgr-core-label { font-size: 11px; color: var(--wgr-ink-faint); letter-spacing: 1px; }
.wgr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.wgr-core-dim { font-size: 13px; color: var(--wgr-ink-faint); letter-spacing: 0; }
.wgr-core-sub { font-size: 10px; color: var(--wgr-ink-faint); }
.wgr-grade-jia { color: var(--wgr-green); }
.wgr-grade-yi { color: #6a8c4e; }
.wgr-grade-bing { color: var(--wgr-star); }
.wgr-grade-ding { color: var(--wgr-accent); }

.wgr-gauge { margin-top: 4px; }
.wgr-gauge-track { position: relative; height: 8px; display: flex; border: 1px solid var(--wgr-line); overflow: hidden; }
.wgr-gauge-zone { height: 100%; }
.wgr-gauge-zone-bad { flex: 40; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.wgr-gauge-zone-mid { flex: 25; background: #efe9d8; }
.wgr-gauge-zone-good { flex: 35; background: linear-gradient(90deg, #d9e4dc, #b8cdc0); }
.wgr-gauge-pointer {
  position: absolute; top: -2px; width: 2px; height: 12px;
  background: var(--wgr-ink); transform: translateX(-1px);
}
.wgr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--wgr-ink-faint); margin-top: 3px; }

.wgr-bars { display: flex; flex-direction: column; gap: 4px; }
.wgr-bar-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.wgr-bar-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.wgr-bar-name { width: 24px; color: var(--wgr-ink-soft); }
.wgr-bar-wrap { flex: 1; height: 6px; background: var(--wgr-line-soft); }
.wgr-bar { display: block; height: 100%; }
.wgr-bar-pct { width: 22px; text-align: right; color: var(--wgr-ink-faint); }

/* ---------- 五格总览表 ---------- */
.wgr-table-card { padding: 10px 12px; }
.wgr-table-wrap { overflow-x: auto; }
.wgr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.wgr-table th, .wgr-table td {
  border: 1px solid var(--wgr-line);
  padding: 6px 7px;
  vertical-align: top;
  text-align: left;
  line-height: 1.55;
}
.wgr-table thead th {
  background: var(--wgr-line-soft);
  font-weight: 700;
  color: var(--wgr-ink);
  text-align: center;
  letter-spacing: 1px;
  white-space: nowrap;
}
.wgr-table-rowhead {
  background: var(--wgr-line-soft);
  font-weight: 700;
  color: var(--wgr-ink);
  white-space: nowrap;
  font-size: 11px;
}
.wgr-table td { color: var(--wgr-ink-soft); }
.wgr-td-value { font-size: 15px; font-weight: 700; color: var(--wgr-ink) !important; text-align: center; }
.wgr-row-renge td, .wgr-row-renge .wgr-table-rowhead { background: rgba(140, 47, 38, 0.04); }
.wgr-mark {
  display: inline-block;
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.wgr-mark-same { background: rgba(74, 124, 89, 0.14); color: var(--wgr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.wgr-mark-good { background: rgba(106, 140, 78, 0.14); color: #5c7a42; border: 1px solid rgba(106, 140, 78, 0.35); }
.wgr-mark-partial { background: rgba(140, 109, 31, 0.12); color: var(--wgr-star); border: 1px solid rgba(140, 109, 31, 0.35); }
.wgr-mark-warn { background: rgba(168, 81, 46, 0.12); color: var(--wgr-accent-soft); border: 1px solid rgba(168, 81, 46, 0.35); }
.wgr-mark-conflict { background: rgba(140, 47, 38, 0.12); color: var(--wgr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }

/* ---------- 双盘 ---------- */
.wgr-pan { padding: 12px; }
.wgr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }

.wgr-chars { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.wgr-char-box {
  border: 1px solid var(--wgr-line);
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 4px;
  width: 64px;
  text-align: center;
  display: flex; flex-direction: column; gap: 4px;
}
.wgr-char-role { font-size: 9px; color: var(--wgr-ink-faint); letter-spacing: 1px; }
.wgr-char-glyph { font-size: 30px; font-weight: 700; line-height: 1.2; }
.wgr-char-strokes { font-size: 10px; color: var(--wgr-accent-soft); }

.wgr-formula { margin-top: 12px; border-top: 1px dashed var(--wgr-line); padding-top: 10px; }
.wgr-formula-title { font-size: 10px; color: var(--wgr-ink-faint); letter-spacing: 1px; margin-bottom: 6px; }
.wgr-formula-line { display: flex; align-items: baseline; gap: 8px; font-size: 11px; padding: 2px 0; }
.wgr-formula-label { width: 28px; font-weight: 700; color: var(--wgr-ink); flex-shrink: 0; }
.wgr-formula-expr { color: var(--wgr-ink-soft); font-family: 'Courier New', monospace; font-size: 11px; }
.wgr-formula-eq { margin-left: auto; font-weight: 700; color: var(--wgr-accent-soft); }

.wgr-radar { width: 100%; max-width: 280px; display: block; margin: 0 auto; }
.wgr-radar-grid { fill: none; stroke: var(--wgr-line); stroke-width: 0.6; }
.wgr-radar-axis { stroke: var(--wgr-line-soft); stroke-width: 0.6; }
.wgr-radar-area { fill: rgba(140, 109, 31, 0.18); stroke: var(--wgr-star); stroke-width: 1.2; }
.wgr-radar-dot { fill: var(--wgr-star); }
.wgr-radar-label { font-size: 9.5px; fill: var(--wgr-ink-soft); letter-spacing: 0.5px; }
.wgr-radar-note { margin: 8px 0 0; text-align: center; font-size: 9.5px; color: var(--wgr-ink-faint); }

/* ---------- AI 章节 ---------- */
.wgr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--wgr-line-soft);
  padding-bottom: 8px;
}
.wgr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--wgr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.wgr-ai-sub { margin-bottom: 10px; }
.wgr-ai-sub:last-child { margin-bottom: 0; }
.wgr-ai-sub-head {
  margin: 0 0 6px;
  font-size: 12px; font-weight: 700;
  color: var(--wgr-accent-soft); letter-spacing: 1px;
}
.wgr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--wgr-ink-soft); }

.wgr-md :deep(p) { margin: 0 0 0.7em; }
.wgr-md :deep(p:last-child) { margin-bottom: 0; }
.wgr-md :deep(strong) { color: var(--wgr-ink); font-weight: 700; }
.wgr-md :deep(ul), .wgr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.wgr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.wgr-md :deep(h3), .wgr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--wgr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.wgr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--wgr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.wgr-md :deep(.wgr-pending), .wgr-pending { color: var(--wgr-ink-faint); font-style: italic; }

.wgr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--wgr-ink-faint); letter-spacing: 1px;
}
.wgr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--wgr-accent);
  animation: wgr-pulse 1s ease-in-out infinite;
}
@keyframes wgr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.wgr-error { margin-top: 14px; text-align: center; color: var(--wgr-accent); font-size: 12px; }
.wgr-retry {
  margin-top: 8px;
  border: 1px solid var(--wgr-accent);
  background: transparent;
  color: var(--wgr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.wgr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.wgr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--wgr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.wgr-foot-note { font-size: 10px; color: var(--wgr-ink-faint); }
.wgr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .wgr-row-top { grid-template-columns: 1fr; }
  .wgr-core-grid { grid-template-columns: repeat(2, 1fr); }
}

.wgr-pan, .wgr-ai, .wgr-chars, .wgr-formula, .wgr-bars { min-width: 0; }

@media (max-width: 720px) {
  .wgr { padding: 8px; }
  .wgr-sheet { padding: 16px 12px; }
  .wgr-ai-row { grid-template-columns: 1fr; }
  .wgr-pans { grid-template-columns: 1fr; }
  .wgr-overview-grid { grid-template-columns: 1fr; }
  .wgr-title { font-size: 20px; letter-spacing: 2px; }
  .wgr-core-grid { grid-template-columns: 1fr 1fr; }
  .wgr-char-box { width: 52px; }
  .wgr-char-glyph { font-size: 24px; }
  .wgr-table { min-width: 560px; }
}
</style>
