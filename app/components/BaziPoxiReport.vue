<template>
  <div class="bpr">
    <div class="bpr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bpr-head">
        <div class="bpr-head-top">
          <div class="bpr-brand">
            <div class="bpr-seal">{{ $t('baziPoxiHepan.report.seal') }}</div>
            <span class="bpr-brand-name">{{ $t('baziPoxiHepan.report.brandName') }}</span>
          </div>
          <div class="bpr-head-right">
            <span class="bpr-time">{{ $t('baziPoxiHepan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bpr-rating">{{ $t('baziPoxiHepan.report.rating') }}</span>
          </div>
        </div>

        <h1 class="bpr-title">{{ titleText }}</h1>
        <p class="bpr-subtitle">{{ subtitleText }}</p>

        <div class="bpr-head-bottom">
          <p class="bpr-meta-line">{{ pairMeta }}</p>
        </div>
      </header>

      <!-- ============ 匹配度总览：总分 + 五维雷达 ============ -->
      <section class="bpr-row bpr-row-top">
        <div class="bpr-card bpr-score">
          <h3 class="bpr-card-title">{{ $t('baziPoxiHepan.report.matchTitle') }}</h3>
          <div class="bpr-score-num">{{ match.overall }}<span class="bpr-score-unit">{{ $t('baziPoxiHepan.report.scoreUnit') }}</span></div>
          <div class="bpr-score-grade" :class="gradeClass">{{ gradeLabel }}</div>
          <div class="bpr-score-bar">
            <span class="bpr-score-bar-fill" :style="{ width: match.overall + '%' }" />
          </div>
          <p class="bpr-score-hint">{{ overallVerdict }}</p>
        </div>

        <div class="bpr-card bpr-radar-card">
          <h3 class="bpr-card-title">{{ $t('baziPoxiHepan.report.dimRadarTitle') }}</h3>
          <div class="bpr-radar-wrap">
            <Radar v-if="dimRadarData" :data="dimRadarData" :options="dimRadarOptions" />
          </div>
          <div class="bpr-dim-list">
            <div v-for="d in dimItems" :key="d.key" class="bpr-dim-item">
              <span class="bpr-dim-label">{{ d.label }}</span>
              <span class="bpr-dim-bar"><span class="bpr-dim-bar-fill" :style="{ width: d.score + '%' }" /></span>
              <span class="bpr-dim-val">{{ d.score }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 两人命盘信息 ============ -->
      <section class="bpr-row bpr-persons">
        <div v-for="p in persons" :key="p.role" class="bpr-card bpr-person">
          <div class="bpr-person-head">
            <span class="bpr-person-role" :class="p.roleClass">{{ p.roleLabel }}</span>
            <span class="bpr-person-name">{{ p.name }}</span>
            <span class="bpr-person-gender">{{ p.genderLabel }}</span>
          </div>
          <div class="bpr-person-pillars">
            <div v-for="pl in p.pillars" :key="pl.label" class="bpr-mini-pillar">
              <div class="bpr-mini-pillar-head">{{ pl.label }}</div>
              <div class="bpr-mini-pillar-shishen">{{ pl.shishen }}</div>
              <div class="bpr-mini-pillar-gan" :class="{ 'bpr-mini-rimu': pl.isDay }">{{ pl.gan }}</div>
              <div class="bpr-mini-pillar-zhi" :class="{ 'bpr-mini-rimu': pl.isDay }">{{ pl.zhi }}</div>
            </div>
          </div>
          <div class="bpr-person-meta">
            <span>{{ $t('baziPoxiHepan.report.rizhuLabel') }} <b>{{ p.chart.riZhu }}</b>（{{ p.chart.riZhuStrength }}）</span>
            <span>{{ $t('baziPoxiHepan.report.gejuLabel') }} <b>{{ p.chart.geju }}</b></span>
            <span>{{ $t('baziPoxiHepan.report.xiyongLabel') }} <b>{{ p.chart.xiyong || '—' }}</b></span>
          </div>
        </div>
      </section>

      <!-- ============ 五行互补：双系雷达 ============ -->
      <section class="bpr-section">
        <div class="bpr-card">
          <h3 class="bpr-card-title">{{ $t('baziPoxiHepan.report.wuxingTitle') }}</h3>
          <div class="bpr-wuxing-grid">
            <div class="bpr-wuxing-radar">
              <Radar v-if="wuxingRadarData" :data="wuxingRadarData" :options="wuxingRadarOptions" />
            </div>
            <div class="bpr-wuxing-table-wrap">
              <table class="bpr-table bpr-wuxing-table">
                <thead>
                  <tr>
                    <th>{{ $t('baziPoxiHepan.report.wuxingCol') }}</th>
                    <th v-for="w in wuxingKeys" :key="w">{{ w }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th class="bpr-table-rowhead">{{ nameA }}</th>
                    <td v-for="w in wuxingKeys" :key="w">{{ Math.round(chartA.wuxingScore[w] ?? 0) }}%</td>
                  </tr>
                  <tr>
                    <th class="bpr-table-rowhead">{{ nameB }}</th>
                    <td v-for="w in wuxingKeys" :key="w">{{ Math.round(chartB.wuxingScore[w] ?? 0) }}%</td>
                  </tr>
                  <tr>
                    <th class="bpr-table-rowhead">{{ $t('baziPoxiHepan.report.harmonyRow') }}</th>
                    <td v-for="w in wuxingKeys" :key="w">
                      <span class="bpr-mark" :class="harmonyClass(match.harmony[w])">{{ harmonyLabel(match.harmony[w]) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 日柱互动小卡片 ============ -->
      <section class="bpr-section">
        <h3 class="bpr-section-title">{{ $t('baziPoxiHepan.report.dayInteractTitle') }}</h3>
        <div class="bpr-day-grid">
          <div class="bpr-card bpr-day-card">
            <div class="bpr-day-label">{{ $t('baziPoxiHepan.report.dayGanRel') }}</div>
            <div class="bpr-day-value">{{ dayGanRelation }}</div>
            <div class="bpr-day-sub">{{ chartA.riZhu }} · {{ chartB.riZhu }}</div>
          </div>
          <div class="bpr-card bpr-day-card">
            <div class="bpr-day-label">{{ $t('baziPoxiHepan.report.dayZhiRel') }}</div>
            <div class="bpr-day-value">{{ dayZhiRelation }}</div>
            <div class="bpr-day-sub">{{ chartA.day.zhi }} · {{ chartB.day.zhi }}</div>
          </div>
          <div class="bpr-card bpr-day-card">
            <div class="bpr-day-label">{{ $t('baziPoxiHepan.report.dominantLabel') }}</div>
            <div class="bpr-day-value">{{ dominantText }}</div>
            <div class="bpr-day-sub">{{ $t('baziPoxiHepan.report.dominantSub') }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 大运同步：双柱状图 ============ -->
      <section class="bpr-section">
        <div class="bpr-card">
          <h3 class="bpr-card-title">{{ $t('baziPoxiHepan.report.dayunChartTitle') }}</h3>
          <div class="bpr-chart-wrap">
            <Bar v-if="dayunChartData" :data="dayunChartData" :options="dayunChartOptions" />
          </div>
          <div class="bpr-dayun-legend">
            <span class="bpr-legend-item"><i class="bpr-legend-dot bpr-legend-a" />{{ nameA }}</span>
            <span class="bpr-legend-item"><i class="bpr-legend-dot bpr-legend-b" />{{ nameB }}</span>
          </div>
        </div>
      </section>

      <!-- ============ 十神角色分工表格 ============ -->
      <section class="bpr-section">
        <div class="bpr-card">
          <h3 class="bpr-card-title">{{ $t('baziPoxiHepan.report.shishenTitle') }}</h3>
          <div class="bpr-table-wrap">
            <table class="bpr-table">
              <thead>
                <tr>
                  <th class="bpr-table-rowhead"></th>
                  <th>{{ $t('baziPoxiHepan.report.yearPillar') }}</th>
                  <th>{{ $t('baziPoxiHepan.report.monthPillar') }}</th>
                  <th>{{ $t('baziPoxiHepan.report.dayPillar') }}</th>
                  <th>{{ $t('baziPoxiHepan.report.hourPillar') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th class="bpr-table-rowhead">{{ nameA }}</th>
                  <td>{{ chartA.year.shishen || '—' }}</td>
                  <td>{{ chartA.month.shishen || '—' }}</td>
                  <td>{{ $t('baziPoxiHepan.report.rizhuTag') }}</td>
                  <td>{{ chartA.hour?.shishen || '—' }}</td>
                </tr>
                <tr>
                  <th class="bpr-table-rowhead">{{ nameB }}</th>
                  <td>{{ chartB.year.shishen || '—' }}</td>
                  <td>{{ chartB.month.shishen || '—' }}</td>
                  <td>{{ $t('baziPoxiHepan.report.rizhuTag') }}</td>
                  <td>{{ chartB.hour?.shishen || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="bpr-row bpr-ai-row">
        <div class="bpr-card bpr-ai">
          <h3 class="bpr-ai-title"><span class="bpr-ai-no">01</span>{{ $t('baziPoxiHepan.report.secOverview') }}</h3>
          <div class="bpr-ai-body bpr-md" v-html="renderSection(sec('婆媳总论'))" />
        </div>
        <div class="bpr-card bpr-ai">
          <h3 class="bpr-ai-title"><span class="bpr-ai-no">02</span>{{ $t('baziPoxiHepan.report.secDayInteract') }}</h3>
          <div class="bpr-ai-body bpr-md" v-html="renderSection(sec('日柱互动'))" />
        </div>
      </section>

      <section class="bpr-row bpr-ai-row">
        <div class="bpr-card bpr-ai">
          <h3 class="bpr-ai-title"><span class="bpr-ai-no">03</span>{{ $t('baziPoxiHepan.report.secWuxing') }}</h3>
          <div class="bpr-ai-body bpr-md" v-html="renderSection(sec('五行互补'))" />
        </div>
        <div class="bpr-card bpr-ai">
          <h3 class="bpr-ai-title"><span class="bpr-ai-no">04</span>{{ $t('baziPoxiHepan.report.secShishen') }}</h3>
          <div class="bpr-ai-body bpr-md" v-html="renderSection(sec('十神关系'))" />
        </div>
      </section>

      <section class="bpr-row bpr-ai-row">
        <div class="bpr-card bpr-ai">
          <h3 class="bpr-ai-title"><span class="bpr-ai-no">05</span>{{ $t('baziPoxiHepan.report.secPersonality') }}</h3>
          <div class="bpr-ai-body bpr-md" v-html="renderSection(sec('性格匹配'))" />
        </div>
        <div class="bpr-card bpr-ai">
          <h3 class="bpr-ai-title"><span class="bpr-ai-no">06</span>{{ $t('baziPoxiHepan.report.secDayun') }}</h3>
          <div class="bpr-ai-body bpr-md" v-html="renderSection(sec('大运同步'))" />
        </div>
      </section>

      <section class="bpr-section">
        <div class="bpr-card bpr-ai">
          <h3 class="bpr-ai-title"><span class="bpr-ai-no">07</span>{{ $t('baziPoxiHepan.report.secAdvice') }}</h3>
          <div class="bpr-ai-body bpr-md" v-html="renderSection(sec('婆媳相处建议'))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bpr-streaming">
        <span class="bpr-streaming-dot" />
        {{ $t('baziPoxiHepan.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bpr-error">
        <p>{{ error }}</p>
        <button type="button" class="bpr-retry" @click="$emit('retry')">{{ $t('baziPoxiHepan.reinterpret') }}</button>
      </div>

      <!-- 重新解读 -->
      <div v-if="!streaming && !error && aiContent" class="bpr-rerun">
        <button type="button" class="bpr-retry" @click="$emit('retry')">{{ $t('baziPoxiHepan.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bpr-foot">
        <span class="bpr-foot-note">ⓘ {{ $t('baziPoxiHepan.report.footerNote') }}</span>
        <span class="bpr-seal bpr-seal-foot">{{ $t('baziPoxiHepan.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { Radar, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import type { BaziChart } from '~/types/bazi'

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
)

interface Props {
  chartA: BaziChart
  chartB: BaziChart
  aiContent: string
  streaming: boolean
  error: string | null
  nameA?: string
  nameB?: string
  genderA: 'male' | 'female'
  genderB: 'male' | 'female'
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

const nameA = computed(() => props.nameA || t('baziPoxiHepan.personA'))
const nameB = computed(() => props.nameB || t('baziPoxiHepan.personB'))

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

/* ---------- AI 章节切分 ---------- */

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

/** 按关键词模糊取章节（AI 标题可能带副标题） */
function sec(keyword: string): string {
  const hit = Object.entries(aiSections.value).find(([title]) => title.includes(keyword))
  return hit?.[1] ?? ''
}

const pendingText = computed(() => t('baziPoxiHepan.report.pending'))

function renderSection(content: string): string {
  if (!content) return `<p class="bpr-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}

/* ---------- 匹配度数据解析 ---------- */

type Harmony = '互补' | '平稳' | '互耗'

interface MatchData {
  overall: number
  dims: { key: string; score: number }[]
  harmony: Record<string, Harmony>
}

const DIM_DEFS = [
  { key: 'dayInteract', match: '日柱互动分', i18n: 'dimDayInteract' },
  { key: 'wuxing', match: '五行互补分', i18n: 'dimWuxing' },
  { key: 'shishen', match: '十神契合分', i18n: 'dimShishen' },
  { key: 'personality', match: '性格匹配分', i18n: 'dimPersonality' },
  { key: 'dayun', match: '大运同步分', i18n: 'dimDayun' },
] as const

const wuxingKeys = ['木', '火', '土', '金', '水'] as const

function clampScore(v: number): number {
  if (Number.isNaN(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
}

/** 从图表数据推导默认五行调和：互补/平稳/互耗 */
function deriveHarmony(): Record<string, Harmony> {
  const out: Record<string, Harmony> = {}
  for (const w of wuxingKeys) {
    const a = props.chartA.wuxingScore[w] ?? 0
    const b = props.chartB.wuxingScore[w] ?? 0
    const hi = Math.max(a, b)
    const lo = Math.min(a, b)
    if (hi >= 32 && lo <= 14) out[w] = '互补'
    else if (hi >= 36 && lo >= 26) out[w] = '互耗'
    else out[w] = '平稳'
  }
  return out
}

/** 由图表数据兜底生成匹配分（AI 未给时） */
function deriveScores(): MatchData {
  const strengthScore = (s: string) => ({ 从弱: 55, 身弱: 65, 身旺: 75, 从强: 60 } as Record<string, number>)[s] ?? 65

  // 五行互补分：两人五行分布差异越互补越高
  let complement = 0
  for (const w of wuxingKeys) {
    const a = props.chartA.wuxingScore[w] ?? 0
    const b = props.chartB.wuxingScore[w] ?? 0
    const hi = Math.max(a, b)
    const lo = Math.min(a, b)
    if (hi >= 30 && lo <= 16) complement += 1
  }
  const wuxingScore = 50 + complement * 9

  // 日柱互动分：天干五合 / 地支六合 加分
  const ganHe = isGanHe(props.chartA.riZhu, props.chartB.riZhu)
  const zhiHe = isZhiLiuHe(props.chartA.day.zhi, props.chartB.day.zhi)
  const zhiChong = isZhiChong(props.chartA.day.zhi, props.chartB.day.zhi)
  let dayScore = 62 + (ganHe ? 18 : 0) + (zhiHe ? 14 : 0) - (zhiChong ? 16 : 0)
  dayScore = clampScore(dayScore)

  const personalityScore = clampScore(Math.round((strengthScore(props.chartA.riZhuStrength) + strengthScore(props.chartB.riZhuStrength)) / 2))
  const shishenScore = clampScore(60 + (ganHe ? 8 : 0) + (zhiHe ? 6 : 0))
  const dayunScore = clampScore(58 + ((props.chartA.currentDaYun && props.chartB.currentDaYun) ? 8 : 0))

  const dims = [
    { key: 'dayInteract', score: dayScore },
    { key: 'wuxing', score: clampScore(wuxingScore) },
    { key: 'shishen', score: shishenScore },
    { key: 'personality', score: personalityScore },
    { key: 'dayun', score: dayunScore },
  ]
  const overall = clampScore(Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length))
  return { overall, dims, harmony: deriveHarmony() }
}

const match = computed<MatchData>(() => {
  const fallback = deriveScores()
  const content = aiSections.value['匹配度数据'] ?? ''
  if (!content) return fallback

  const get = (key: string): number | null => {
    const m = content.match(new RegExp(`${key}[：:]\\s*(\\d{1,3})`))
    return m ? clampScore(Number(m[1])) : null
  }
  const getHarmony = (w: string): Harmony | null => {
    const m = content.match(new RegExp(`五行调和-${w}[：:]\\s*(互补|平稳|互耗)`))
    return (m?.[1] as Harmony) ?? null
  }

  const overall = get('综合匹配分') ?? fallback.overall
  const dims = DIM_DEFS.map((d, i) => ({
    key: d.key,
    score: get(d.match) ?? fallback.dims[i]!.score,
  }))
  const harmony: Record<string, Harmony> = {}
  for (const w of wuxingKeys) harmony[w] = getHarmony(w) ?? fallback.harmony[w]!

  return { overall, dims, harmony }
})

const dimItems = computed(() =>
  match.value.dims.map(d => ({
    key: d.key,
    label: t(`baziPoxiHepan.report.${DIM_DEFS.find(x => x.key === d.key)!.i18n}`),
    score: d.score,
  })))

const gradeLabel = computed(() => {
  const s = match.value.overall
  if (s >= 85) return t('baziPoxiHepan.report.gradeExcellent')
  if (s >= 70) return t('baziPoxiHepan.report.gradeGood')
  if (s >= 55) return t('baziPoxiHepan.report.gradeFair')
  return t('baziPoxiHepan.report.gradePoor')
})

const gradeClass = computed(() => {
  const s = match.value.overall
  if (s >= 85) return 'bpr-grade-excellent'
  if (s >= 70) return 'bpr-grade-good'
  if (s >= 55) return 'bpr-grade-fair'
  return 'bpr-grade-poor'
})

const overallVerdict = computed(() => {
  const c = sec('婆媳总论')
  const plain = c.replace(/[#*]/g, '').replace(/\n/g, '，').trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').trim()
  return first ? first.slice(0, 40) : t('baziPoxiHepan.report.verdictFallback')
})

/* ---------- 报告头 ---------- */

const WX_GAN: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

const titleText = computed(() => t('baziPoxiHepan.report.title', {
  ganA: props.chartA.riZhu, wxA: WX_GAN[props.chartA.riZhu] ?? '',
  ganB: props.chartB.riZhu, wxB: WX_GAN[props.chartB.riZhu] ?? '',
}))

const subtitleText = computed(() => t('baziPoxiHepan.report.subtitleFallback'))

const pairMeta = computed(() => t('baziPoxiHepan.report.pairMeta', {
  a: nameA.value, riZhuA: props.chartA.riZhu,
  b: nameB.value, riZhuB: props.chartB.riZhu,
}))

/* ---------- 两人信息卡 ---------- */

interface MiniPillar { label: string; gan: string; zhi: string; shishen: string; isDay: boolean }

function buildPillars(c: BaziChart): MiniPillar[] {
  const mk = (label: string, p: BaziChart['year'] | null, isDay = false): MiniPillar => ({
    label,
    gan: p?.gan ?? '—',
    zhi: p?.zhi ?? '—',
    shishen: isDay ? t('baziPoxiHepan.report.rizhuTag') : (p?.shishen ?? '—'),
    isDay,
  })
  return [
    mk(t('baziPoxiHepan.report.yearPillar'), c.year),
    mk(t('baziPoxiHepan.report.monthPillar'), c.month),
    mk(t('baziPoxiHepan.report.dayPillar'), c.day, true),
    mk(t('baziPoxiHepan.report.hourPillar'), c.hour),
  ]
}

const persons = computed(() => [
  {
    role: 'A',
    roleLabel: t('baziPoxiHepan.personA'),
    roleClass: 'bpr-role-a',
    name: nameA.value,
    genderLabel: props.genderA === 'male' ? t('common.male') : t('common.female'),
    chart: props.chartA,
    pillars: buildPillars(props.chartA),
  },
  {
    role: 'B',
    roleLabel: t('baziPoxiHepan.personB'),
    roleClass: 'bpr-role-b',
    name: nameB.value,
    genderLabel: props.genderB === 'male' ? t('common.male') : t('common.female'),
    chart: props.chartB,
    pillars: buildPillars(props.chartB),
  },
])

/* ---------- 五行雷达 ---------- */

const wxLabels = computed(() => wuxingKeys.map(w => t(`baziPoxiHepan.report.wx${w}`)))

const wuxingRadarData = computed(() => ({
  labels: wxLabels.value,
  datasets: [
    {
      label: nameA.value,
      data: wuxingKeys.map(w => Math.round(props.chartA.wuxingScore[w] ?? 0)),
      backgroundColor: 'rgba(140, 47, 38, 0.14)',
      borderColor: '#8c2f26',
      pointBackgroundColor: '#8c2f26',
      borderWidth: 2,
      pointRadius: 3,
    },
    {
      label: nameB.value,
      data: wuxingKeys.map(w => Math.round(props.chartB.wuxingScore[w] ?? 0)),
      backgroundColor: 'rgba(74, 124, 89, 0.14)',
      borderColor: '#4a7c59',
      pointBackgroundColor: '#4a7c59',
      borderWidth: 2,
      pointRadius: 3,
    },
  ],
}))

const paperTooltip = {
  backgroundColor: 'rgba(46, 42, 36, 0.94)',
  titleColor: '#f5efe0',
  bodyColor: '#efe9d8',
  borderColor: 'rgba(140, 47, 38, 0.4)',
  borderWidth: 1,
  padding: 8,
}

const wuxingRadarOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 50,
      ticks: { display: false, stepSize: 10 },
      grid: { color: 'rgba(46, 42, 36, 0.12)' },
      angleLines: { color: 'rgba(46, 42, 36, 0.12)' },
      pointLabels: { color: '#55503f', font: { size: 12, family: "'Noto Serif SC', serif" } },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: paperTooltip,
  },
}

/* ---------- 五维相性雷达 ---------- */

const dimRadarData = computed(() => ({
  labels: dimItems.value.map(d => d.label),
  datasets: [
    {
      label: t('baziPoxiHepan.report.dimRadarTitle'),
      data: dimItems.value.map(d => d.score),
      backgroundColor: 'rgba(140, 109, 31, 0.16)',
      borderColor: '#8c6d1f',
      pointBackgroundColor: '#8c6d1f',
      borderWidth: 2,
      pointRadius: 3,
    },
  ],
}))

const dimRadarOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: { display: false, stepSize: 20 },
      grid: { color: 'rgba(46, 42, 36, 0.12)' },
      angleLines: { color: 'rgba(46, 42, 36, 0.12)' },
      pointLabels: { color: '#55503f', font: { size: 10, family: "'Noto Serif SC', serif" } },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: paperTooltip,
  },
}

/* ---------- 日柱关系推导 ---------- */

const GAN_HE: Record<string, string> = { 甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊' }
function isGanHe(a: string, b: string): boolean { return GAN_HE[a] === b }

const ZHI_LIUHE: Record<string, string> = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' }
function isZhiLiuHe(a: string, b: string): boolean { return ZHI_LIUHE[a] === b }

const ZHI_CHONG: Record<string, string> = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' }
function isZhiChong(a: string, b: string): boolean { return ZHI_CHONG[a] === b }

const dayGanRelation = computed(() =>
  isGanHe(props.chartA.riZhu, props.chartB.riZhu)
    ? t('baziPoxiHepan.report.relGanHe')
    : t('baziPoxiHepan.report.relGanNormal'))

const dayZhiRelation = computed(() => {
  const a = props.chartA.day.zhi
  const b = props.chartB.day.zhi
  if (isZhiLiuHe(a, b)) return t('baziPoxiHepan.report.relZhiHe')
  if (isZhiChong(a, b)) return t('baziPoxiHepan.report.relZhiChong')
  return t('baziPoxiHepan.report.relZhiNormal')
})

const dominantText = computed(() => {
  const sa = props.chartA.riZhuStrength
  const sb = props.chartB.riZhuStrength
  const strong = (s: string) => s === '身旺' || s === '从强'
  if (strong(sa) && !strong(sb)) return t('baziPoxiHepan.report.dominantA', { name: nameA.value })
  if (strong(sb) && !strong(sa)) return t('baziPoxiHepan.report.dominantB', { name: nameB.value })
  return t('baziPoxiHepan.report.dominantBalanced')
})

/* ---------- 大运同步双柱状图 ---------- */

/** 大运五行强度 → 评分（0-100），用作关系助力度的代理指标 */
const WX_STRENGTH: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }

function dayunToScore(chart: BaziChart, count: number): { label: string; score: number; current: boolean }[] {
  const list = chart.dayuns.slice(0, count)
  const dayWx = WX_GAN[chart.riZhu] ?? '土'
  const favorable = new Set((chart.xiyong || '').split(/[、，,\s]+/).filter(Boolean))
  return list.map(d => {
    const ganWx = WX_GAN[d.gan] ?? ''
    // 简化评分：天干五行若入喜用则高分，否则中性偏中
    let score = 58
    if (favorable.has(ganWx)) score = 82
    else if (ganWx === dayWx) score = 66
    return {
      label: `${d.gan}${d.zhi}`,
      score,
      current: chart.currentDaYun ? d.index === chart.currentDaYun.index : false,
    }
  })
}

const dayunChartData = computed(() => {
  const count = Math.max(props.chartA.dayuns.length, props.chartB.dayuns.length, 1)
  const a = dayunToScore(props.chartA, count)
  const b = dayunToScore(props.chartB, count)
  const labels = Array.from({ length: count }, (_, i) => a[i]?.label ?? b[i]?.label ?? `${i + 1}`)
  const colorFor = (item?: { current: boolean }, base = '#8c2f26', cur = '#b8552e') =>
    item?.current ? cur : base
  return {
    labels,
    datasets: [
      {
        label: nameA.value,
        data: a.map(x => x.score),
        backgroundColor: a.map(x => colorFor(x, 'rgba(140,47,38,0.72)', 'rgba(184,85,46,0.95)')),
        borderRadius: 2,
        maxBarThickness: 26,
        categoryPercentage: 0.72,
        barPercentage: 0.9,
      },
      {
        label: nameB.value,
        data: b.map(x => x.score),
        backgroundColor: b.map(x => colorFor(x, 'rgba(74,124,89,0.72)', 'rgba(104,160,122,0.95)')),
        borderRadius: 2,
        maxBarThickness: 26,
        categoryPercentage: 0.72,
        barPercentage: 0.9,
      },
    ],
  }
})

const dayunChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#8a8272', font: { size: 10, family: "'Noto Serif SC', serif" } },
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: { color: 'rgba(46, 42, 36, 0.08)' },
      ticks: { color: '#8a8272', font: { size: 10 }, stepSize: 20 },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: paperTooltip,
  },
}

/* ---------- 五行调和标记 ---------- */

function harmonyClass(h: Harmony | undefined): string {
  if (h === '互补') return 'bpr-mark-good'
  if (h === '互耗') return 'bpr-mark-bad'
  return 'bpr-mark-mid'
}
function harmonyLabel(h: Harmony | undefined): string {
  if (h === '互补') return t('baziPoxiHepan.report.harmonyGood')
  if (h === '互耗') return t('baziPoxiHepan.report.harmonyBad')
  return t('baziPoxiHepan.report.harmonyMid')
}
</script>

<style scoped>
/* ========== 纸质报告主题（对齐 BaziZiweiReport） ========== */
.bpr {
  --bpr-bg: #f2ede3;
  --bpr-sheet: #faf6ec;
  --bpr-card: #fffdf6;
  --bpr-ink: #2e2a24;
  --bpr-ink-soft: #55503f;
  --bpr-ink-faint: #8a8272;
  --bpr-line: #d8d0bd;
  --bpr-line-soft: #e6dfcd;
  --bpr-accent: #8c2f26;
  --bpr-accent-soft: #a8512e;
  --bpr-star: #8c6d1f;
  --bpr-green: #4a7c59;
  border-radius: 12px;
  background: var(--bpr-bg);
  padding: 18px;
  color: var(--bpr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.bpr-sheet {
  background: var(--bpr-sheet);
  border: 1px solid var(--bpr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.bpr-head { border-bottom: 2px solid var(--bpr-ink); padding-bottom: 16px; }
.bpr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.bpr-brand { display: flex; align-items: center; gap: 8px; }
.bpr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--bpr-accent);
  color: var(--bpr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.bpr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bpr-ink-soft); }
.bpr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bpr-ink-faint); }
.bpr-rating { letter-spacing: 1px; }

.bpr-title { margin: 14px 0 6px; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-align: center; }
.bpr-subtitle { text-align: center; font-size: 13px; color: var(--bpr-ink-soft); letter-spacing: 1px; margin: 0 0 12px; }
.bpr-head-bottom { text-align: center; }
.bpr-meta-line { margin: 2px 0; font-size: 12px; color: var(--bpr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.bpr-row { display: grid; gap: 14px; margin-top: 16px; }
.bpr-row-top { grid-template-columns: 1fr 1.6fr; }
.bpr-persons { grid-template-columns: 1fr 1fr; }
.bpr-ai-row { grid-template-columns: 1fr 1fr; }
.bpr-section { margin-top: 16px; }

.bpr-card { background: var(--bpr-card); border: 1px solid var(--bpr-line); padding: 14px 16px; }
.bpr-card-title {
  margin: 0 0 10px; font-size: 14px; font-weight: 700; letter-spacing: 2px;
  border-bottom: 1px solid var(--bpr-line-soft); padding-bottom: 8px; text-align: center;
}
.bpr-section-title { margin: 0 0 8px; font-size: 14px; font-weight: 700; letter-spacing: 2px; }

/* ---------- 匹配度总分卡 ---------- */
.bpr-score { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; }
.bpr-score-num { font-size: 52px; font-weight: 700; line-height: 1; color: var(--bpr-accent); letter-spacing: 2px; }
.bpr-score-unit { font-size: 16px; color: var(--bpr-ink-faint); margin-left: 4px; }
.bpr-score-grade { font-size: 14px; font-weight: 700; letter-spacing: 3px; padding: 3px 14px; border: 1.5px solid currentColor; border-radius: 3px; }
.bpr-grade-excellent { color: var(--bpr-green); }
.bpr-grade-good { color: var(--bpr-star); }
.bpr-grade-fair { color: var(--bpr-accent-soft); }
.bpr-grade-poor { color: var(--bpr-accent); }
.bpr-score-bar { width: 100%; height: 8px; background: var(--bpr-line-soft); border: 1px solid var(--bpr-line); overflow: hidden; }
.bpr-score-bar-fill { display: block; height: 100%; background: linear-gradient(90deg, var(--bpr-accent-soft), var(--bpr-accent)); transition: width 0.8s ease; }
.bpr-score-hint { margin: 0; font-size: 11.5px; color: var(--bpr-ink-soft); line-height: 1.6; }

/* ---------- 五维雷达 ---------- */
.bpr-radar-card { display: flex; flex-direction: column; }
.bpr-radar-wrap { height: 230px; }
.bpr-dim-list { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
.bpr-dim-item { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.bpr-dim-label { width: 64px; color: var(--bpr-ink-soft); flex-shrink: 0; }
.bpr-dim-bar { flex: 1; height: 6px; background: var(--bpr-line-soft); overflow: hidden; }
.bpr-dim-bar-fill { display: block; height: 100%; background: var(--bpr-star); transition: width 0.7s ease; }
.bpr-dim-val { width: 26px; text-align: right; font-weight: 700; color: var(--bpr-ink); }

/* ---------- 两人信息卡 ---------- */
.bpr-person { display: flex; flex-direction: column; gap: 10px; }
.bpr-person-head { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--bpr-line-soft); padding-bottom: 8px; }
.bpr-person-role { font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border: 1.5px solid currentColor; border-radius: 3px; }
.bpr-role-a { color: var(--bpr-accent); }
.bpr-role-b { color: var(--bpr-green); }
.bpr-person-name { font-size: 15px; font-weight: 700; color: var(--bpr-ink); letter-spacing: 1px; }
.bpr-person-gender { margin-left: auto; font-size: 11px; color: var(--bpr-ink-faint); }
.bpr-person-pillars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.bpr-mini-pillar { border: 1px solid var(--bpr-line-soft); text-align: center; padding: 5px 2px; display: flex; flex-direction: column; gap: 1px; }
.bpr-mini-pillar-head { font-size: 9px; color: var(--bpr-ink-faint); letter-spacing: 1px; }
.bpr-mini-pillar-shishen { font-size: 9px; color: var(--bpr-accent-soft); min-height: 13px; }
.bpr-mini-pillar-gan { font-size: 22px; font-weight: 700; line-height: 1.2; }
.bpr-mini-pillar-zhi { font-size: 22px; font-weight: 700; line-height: 1.2; color: var(--bpr-ink-soft); }
.bpr-mini-rimu { color: var(--bpr-accent); }
.bpr-person-meta { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 11px; color: var(--bpr-ink-soft); border-top: 1px dashed var(--bpr-line-soft); padding-top: 8px; }
.bpr-person-meta b { color: var(--bpr-ink); }

/* ---------- 五行互补 ---------- */
.bpr-wuxing-grid { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; align-items: center; }
.bpr-wuxing-radar { height: 240px; min-width: 0; }
.bpr-wuxing-table-wrap { overflow-x: auto; max-width: 100%; }
.bpr-wuxing-table { width: auto; }
.bpr-wuxing-table td { text-align: center; }

/* ---------- 表格 ---------- */
.bpr-table-wrap { overflow-x: auto; }
.bpr-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
.bpr-table th, .bpr-table td {
  border: 1px solid var(--bpr-line); padding: 6px 8px; vertical-align: middle; text-align: center; line-height: 1.5;
}
.bpr-table thead th { background: var(--bpr-line-soft); font-weight: 700; color: var(--bpr-ink); letter-spacing: 1px; }
.bpr-table-rowhead { background: var(--bpr-line-soft); font-weight: 700; color: var(--bpr-ink); white-space: nowrap; }
.bpr-table td { color: var(--bpr-ink-soft); }

.bpr-mark { display: inline-block; font-size: 10px; padding: 1px 8px; border-radius: 2px; letter-spacing: 1px; white-space: nowrap; }
.bpr-mark-good { background: rgba(74, 124, 89, 0.14); color: var(--bpr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.bpr-mark-mid { background: rgba(140, 109, 31, 0.12); color: var(--bpr-star); border: 1px solid rgba(140, 109, 31, 0.35); }
.bpr-mark-bad { background: rgba(140, 47, 38, 0.12); color: var(--bpr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }

/* ---------- 日柱互动小卡片 ---------- */
.bpr-day-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.bpr-day-card { text-align: center; display: flex; flex-direction: column; gap: 5px; padding: 14px 10px; }
.bpr-day-label { font-size: 11px; color: var(--bpr-ink-faint); letter-spacing: 1px; }
.bpr-day-value { font-size: 18px; font-weight: 700; color: var(--bpr-accent); letter-spacing: 1px; }
.bpr-day-sub { font-size: 10.5px; color: var(--bpr-ink-faint); }

/* ---------- 大运图表 ---------- */
.bpr-chart-wrap { height: 260px; }
.bpr-dayun-legend { display: flex; justify-content: center; gap: 18px; margin-top: 10px; }
.bpr-legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--bpr-ink-soft); }
.bpr-legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.bpr-legend-a { background: var(--bpr-accent); }
.bpr-legend-b { background: var(--bpr-green); }

/* ---------- AI 章节 ---------- */
.bpr-ai-title {
  margin: 0 0 10px; font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--bpr-line-soft); padding-bottom: 8px;
}
.bpr-ai-no { font-size: 11px; color: #f5efe0; background: var(--bpr-ink); padding: 2px 6px; letter-spacing: 1px; }
.bpr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--bpr-ink-soft); }

.bpr-md :deep(p) { margin: 0 0 0.7em; }
.bpr-md :deep(p:last-child) { margin-bottom: 0; }
.bpr-md :deep(strong) { color: var(--bpr-ink); font-weight: 700; }
.bpr-md :deep(ul), .bpr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.bpr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.bpr-md :deep(h3), .bpr-md :deep(h4) { font-size: 12.5px; font-weight: 700; color: var(--bpr-ink); margin: 0.8em 0 0.4em; letter-spacing: 1px; }
.bpr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--bpr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.bpr-md :deep(.bpr-pending), .bpr-pending { color: var(--bpr-ink-faint); font-style: italic; }

/* ---------- 流式/错误/重试 ---------- */
.bpr-streaming { margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: var(--bpr-ink-faint); letter-spacing: 1px; }
.bpr-streaming-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--bpr-accent); animation: bpr-pulse 1s ease-in-out infinite; }
@keyframes bpr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.bpr-error { margin-top: 14px; text-align: center; color: var(--bpr-accent); font-size: 12px; }
.bpr-retry {
  margin-top: 8px; border: 1px solid var(--bpr-accent); background: transparent; color: var(--bpr-accent);
  font-size: 12px; padding: 5px 16px; cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.bpr-retry:hover { background: rgba(140, 47, 38, 0.06); }
.bpr-rerun { margin-top: 14px; text-align: center; }

/* ---------- 页脚 ---------- */
.bpr-foot {
  margin-top: 18px; border-top: 1px solid var(--bpr-line); padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.bpr-foot-note { font-size: 10px; color: var(--bpr-ink-faint); }
.bpr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
.bpr-score, .bpr-radar-card, .bpr-card, .bpr-ai, .bpr-person { min-width: 0; }

@media (max-width: 1000px) {
  .bpr-row-top { grid-template-columns: 1fr; }
  .bpr-persons { grid-template-columns: 1fr; }
  .bpr-wuxing-grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .bpr { padding: 8px; }
  .bpr-sheet { padding: 16px 12px; }
  .bpr-title { font-size: 20px; letter-spacing: 2px; }
  .bpr-ai-row { grid-template-columns: 1fr; }
  .bpr-day-grid { grid-template-columns: 1fr; }
  .bpr-radar-wrap { height: 200px; }
  .bpr-wuxing-radar { height: 210px; }
  .bpr-chart-wrap { height: 220px; }
  .bpr-mini-pillar-gan, .bpr-mini-pillar-zhi { font-size: 17px; }
  .bpr-score-num { font-size: 42px; }
  .bpr-table { min-width: 480px; }
  .bpr-wuxing-table { min-width: 0; }
}
</style>
