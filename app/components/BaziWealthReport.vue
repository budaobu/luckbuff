<template>
  <div class="bwr">
    <div class="bwr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bwr-head">
        <div class="bwr-head-top">
          <div class="bwr-brand">
            <div class="bwr-seal">{{ $t('baziWealth.report.seal') }}</div>
            <span class="bwr-brand-name">{{ $t('baziWealth.report.brandName') }}</span>
          </div>
          <div class="bwr-head-right">
            <span class="bwr-time">{{ $t('baziWealth.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bwr-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="bwr-title">{{ titleText }}</h1>
        <p class="bwr-subtitle">{{ subtitleText }}</p>

        <div class="bwr-head-bottom">
          <p class="bwr-meta-line">{{ rizhuLine }}</p>
        </div>
      </header>

      <!-- ============ 命主信息 + 财富格局总论 ============ -->
      <section class="bwr-row bwr-row-top">
        <div class="bwr-card bwr-profile">
          <div class="bwr-profile-line">
            <span class="bwr-ico">☀</span>
            <span class="bwr-profile-label">{{ $t('baziWealth.report.solarLabel') }}</span>
            <span class="bwr-profile-value">{{ solarText }}</span>
          </div>
          <div class="bwr-profile-line">
            <span class="bwr-ico">⚥</span>
            <span class="bwr-profile-label">{{ $t('baziWealth.report.genderLabel') }}</span>
            <span class="bwr-profile-value">{{ genderText }}</span>
          </div>
          <div class="bwr-profile-line">
            <span class="bwr-ico">♒</span>
            <span class="bwr-profile-label">{{ $t('baziWealth.report.ageLabel') }}</span>
            <span class="bwr-profile-value">{{ ageText }}</span>
          </div>
        </div>

        <div class="bwr-card bwr-overview">
          <h3 class="bwr-card-title">{{ $t('baziWealth.report.overviewTitle') }}</h3>
          <div class="bwr-ai-body bwr-md" v-html="renderSection(aiSections['财富格局总论'])" />
        </div>
      </section>

      <!-- ============ 命盘核心数据 ============ -->
      <section class="bwr-section">
        <h3 class="bwr-section-title">{{ $t('baziWealth.report.coreDataTitle') }}</h3>
        <div class="bwr-core-grid">
          <div class="bwr-card bwr-core">
            <div class="bwr-core-label">{{ $t('baziWealth.report.gejuLabel') }}</div>
            <div class="bwr-core-value">{{ chart.geju }}</div>
          </div>
          <div class="bwr-card bwr-core">
            <div class="bwr-core-label">{{ $t('baziWealth.report.wangshaiLabel') }}</div>
            <div class="bwr-core-value">{{ chart.riZhuStrength }}</div>
            <div class="bwr-gauge">
              <div class="bwr-gauge-track">
                <span class="bwr-gauge-zone bwr-gauge-zone-weak" />
                <span class="bwr-gauge-zone bwr-gauge-zone-mid" />
                <span class="bwr-gauge-zone bwr-gauge-zone-strong" />
                <span class="bwr-gauge-pointer" :style="{ left: gaugePos + '%' }" />
              </div>
              <div class="bwr-gauge-marks">
                <span>{{ $t('baziWealth.report.weakLabel') }}</span>
                <span>{{ $t('baziWealth.report.midLabel') }}</span>
                <span>{{ $t('baziWealth.report.strongLabel') }}</span>
              </div>
            </div>
          </div>
          <div class="bwr-card bwr-core">
            <div class="bwr-core-label">{{ $t('baziWealth.report.xiyongLabel') }}</div>
            <div class="bwr-yongshen">
              <span v-for="g in xiyongList" :key="g" class="bwr-yongshen-char">{{ g }}</span>
            </div>
            <div class="bwr-core-sub">{{ $t('baziWealth.report.jishenLine', { jishen: chart.jishen }) }}</div>
          </div>
          <div class="bwr-card bwr-core">
            <div class="bwr-core-label">{{ $t('baziWealth.report.wuxingLabel') }}</div>
            <div class="bwr-wuxing">
              <div v-for="w in wuxingList" :key="w.name" class="bwr-wuxing-row">
                <span class="bwr-wuxing-dot" :style="{ background: w.color }" />
                <span class="bwr-wuxing-name">{{ w.name }}</span>
                <span class="bwr-wuxing-bar-wrap"><span class="bwr-wuxing-bar" :style="{ width: w.pct + '%', background: w.color }" /></span>
                <span class="bwr-wuxing-pct">{{ w.pct }}%</span>
              </div>
            </div>
          </div>
          <div class="bwr-card bwr-core bwr-core-radar">
            <div class="bwr-core-label">{{ $t('baziWealth.report.wuxingRadarLabel') }}</div>
            <div class="bwr-radar-wrap">
              <Radar v-if="radarData" :data="radarData" :options="radarOptions" />
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 四柱 + 大运 ============ -->
      <section class="bwr-section">
        <div class="bwr-card bwr-pan">
          <h3 class="bwr-pan-title">{{ $t('baziWealth.report.baziPanTitle') }}</h3>
          <div class="bwr-bazi">
            <div class="bwr-bazi-grid">
              <div v-for="p in pillars" :key="p.label" class="bwr-pillar">
                <div class="bwr-pillar-head">{{ p.label }}</div>
                <div class="bwr-pillar-shishen">{{ p.shishen }}</div>
                <div class="bwr-pillar-gan" :class="{ 'bwr-pillar-rimu': p.isDay }">{{ p.gan }}</div>
                <div class="bwr-pillar-zhi" :class="{ 'bwr-pillar-rimu': p.isDay }">{{ p.zhi }}</div>
                <div class="bwr-pillar-canggan">
                  <span v-for="cg in p.canggan" :key="cg.gan">{{ cg.gan }}<i>({{ cg.type }})</i></span>
                </div>
              </div>
            </div>

            <!-- 大运 -->
            <div class="bwr-dayun">
              <div class="bwr-dayun-title">{{ $t('baziWealth.report.dayunTitle', { age: chart.qiyunAge }) }}</div>
              <div class="bwr-dayun-row">
                <div
                  v-for="d in chart.dayuns"
                  :key="d.index"
                  class="bwr-dayun-item"
                  :class="{ 'bwr-dayun-current': chart.currentDaYun?.index === d.index }"
                >
                  <span class="bwr-dayun-gz">{{ d.gan }}{{ d.zhi }}</span>
                  <span class="bwr-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 财星结构 + 财富等级 ============ -->
      <section class="bwr-row bwr-row-wealth">
        <div class="bwr-card">
          <h3 class="bwr-card-title">{{ $t('baziWealth.report.caixingTitle') }}</h3>
          <div class="bwr-cai-grid">
            <div class="bwr-cai-stat">
              <div class="bwr-cai-stat-head">
                <span class="bwr-cai-stat-label">{{ $t('baziWealth.report.zhengcaiLabel') }}</span>
                <span class="bwr-cai-stat-value">{{ caixing.zheng }}</span>
              </div>
              <div class="bwr-cai-strength">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="bwr-cai-dot"
                  :class="{ 'bwr-cai-dot-on': n <= caixing.zhengStrength }"
                />
                <span class="bwr-cai-strength-label">{{ strengthLabel(caixing.zhengStrength) }}</span>
              </div>
            </div>
            <div class="bwr-cai-stat">
              <div class="bwr-cai-stat-head">
                <span class="bwr-cai-stat-label">{{ $t('baziWealth.report.piancaiLabel') }}</span>
                <span class="bwr-cai-stat-value">{{ caixing.pian }}</span>
              </div>
              <div class="bwr-cai-strength">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="bwr-cai-dot bwr-cai-dot-pian"
                  :class="{ 'bwr-cai-dot-on': n <= caixing.pianStrength }"
                />
                <span class="bwr-cai-strength-label">{{ strengthLabel(caixing.pianStrength) }}</span>
              </div>
            </div>
          </div>
          <p class="bwr-cai-note">{{ caixingNote }}</p>
        </div>

        <div class="bwr-card">
          <h3 class="bwr-card-title">{{ $t('baziWealth.report.levelTitle') }}</h3>
          <div class="bwr-level">
            <div class="bwr-level-value">{{ wealthLevel || pendingText }}</div>
            <div class="bwr-level-track">
              <span
                v-for="seg in levelSegments"
                :key="seg.key"
                class="bwr-level-seg"
                :class="{ 'bwr-level-seg-on': seg.on }"
              >
                <i class="bwr-level-seg-bar" />
                <em class="bwr-level-seg-label">{{ seg.label }}</em>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 大运财运走势 ============ -->
      <section class="bwr-section">
        <div class="bwr-card">
          <h3 class="bwr-card-title">{{ $t('baziWealth.report.dayunChartTitle') }}</h3>
          <div class="bwr-chart-wrap">
            <Bar v-if="dayunChartData" :data="dayunChartData" :options="dayunChartOptions" />
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 ============ -->
      <section class="bwr-row bwr-ai-row">
        <div class="bwr-card bwr-ai">
          <h3 class="bwr-ai-title"><span class="bwr-ai-no">01</span>{{ $t('baziWealth.report.secRiZhuCaixing') }}</h3>
          <div class="bwr-ai-body bwr-md" v-html="renderSection(aiSections['日主与财星关系'])" />
        </div>
        <div class="bwr-card bwr-ai">
          <h3 class="bwr-ai-title"><span class="bwr-ai-no">02</span>{{ $t('baziWealth.report.secZhengPian') }}</h3>
          <div class="bwr-ai-body bwr-md" v-html="renderSection(aiSections['正财与偏财分析'])" />
        </div>
      </section>

      <section class="bwr-row bwr-ai-row">
        <div class="bwr-card bwr-ai">
          <h3 class="bwr-ai-title"><span class="bwr-ai-no">03</span>{{ $t('baziWealth.report.secLevel') }}</h3>
          <div class="bwr-ai-body bwr-md" v-html="renderSection(aiSections['财富等级评估'])" />
        </div>
        <div class="bwr-card bwr-ai">
          <h3 class="bwr-ai-title"><span class="bwr-ai-no">04</span>{{ $t('baziWealth.report.secDayun') }}</h3>
          <div class="bwr-ai-body bwr-md" v-html="renderSection(aiSections['大运财运走势'])" />
        </div>
      </section>

      <section class="bwr-row bwr-ai-row">
        <div class="bwr-card bwr-ai">
          <h3 class="bwr-ai-title"><span class="bwr-ai-no">05</span>{{ $t('baziWealth.report.secDirection') }}</h3>
          <div class="bwr-ai-body bwr-md" v-html="renderSection(aiSections['最佳求财方向'])" />
        </div>
        <div class="bwr-card bwr-ai">
          <h3 class="bwr-ai-title"><span class="bwr-ai-no">06</span>{{ $t('baziWealth.report.secAdvice') }}</h3>
          <div class="bwr-ai-body bwr-md" v-html="renderSection(aiSections['财富建议'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bwr-streaming">
        <span class="bwr-streaming-dot" />
        {{ $t('baziWealth.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bwr-error">
        <p>{{ error }}</p>
        <button type="button" class="bwr-retry" @click="$emit('retry')">{{ $t('baziWealth.reinterpret') }}</button>
      </div>

      <!-- 重新解读 -->
      <div v-if="!streaming && !error && aiContent" class="bwr-rerun">
        <button type="button" class="bwr-retry" @click="$emit('retry')">{{ $t('baziWealth.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bwr-foot">
        <span class="bwr-foot-note">ⓘ {{ $t('baziWealth.report.footerNote') }}</span>
        <span class="bwr-seal bwr-seal-foot">{{ $t('baziWealth.report.sealFoot') }}</span>
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
import type { TianGan, DiZhi } from '~/types/user'

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
)

interface Props {
  chart: BaziChart
  aiContent: string
  streaming: boolean
  error: string | null
  birthDate: string
  birthHour?: DiZhi
  gender: 'male' | 'female'
  name?: string
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

const genderText = computed(() =>
  props.gender === 'male' ? t('baziWealth.report.genderMale') : t('baziWealth.report.genderFemale'))

const solarText = computed(() => {
  const h = props.birthHour ? t('baziWealth.report.hourSuffix', { hour: props.birthHour }) : ''
  return `${props.birthDate}${h}`
})

const ageText = computed(() =>
  t('baziWealth.report.ageValue', { age: props.chart.currentAge, year: new Date().getFullYear() }))

const rizhuLine = computed(() => t('baziWealth.report.rizhuLine', {
  riZhu: props.chart.riZhu,
  strength: props.chart.riZhuStrength,
  geju: props.chart.geju,
  xiyong: props.chart.xiyong,
}))

const titleText = computed(() =>
  props.name
    ? t('baziWealth.report.titleWithName', { name: props.name })
    : t('baziWealth.report.title'))

/** 喜用：字符串拆分 */
const xiyongList = computed(() =>
  (props.chart.xiyong || '').split(/[、，,\s]+/).filter(Boolean).slice(0, 4))

const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }
const wuxingList = computed(() =>
  (['木', '火', '土', '金', '水'] as const).map(wx => ({
    name: wx,
    pct: Math.round(props.chart.wuxingScore[wx] ?? 0),
    color: WX_COLORS[wx]!,
  })))

const gaugePos = computed(() => {
  const map: Record<string, number> = { 从弱: 8, 身弱: 32, 身旺: 68, 从强: 92 }
  return map[props.chart.riZhuStrength] ?? 50
})

/** 四柱 */
const pillars = computed(() => {
  const c = props.chart
  const mk = (label: string, p: typeof c.year | null, isDay = false) => ({
    label,
    gan: p?.gan ?? '—',
    zhi: p?.zhi ?? '—',
    shishen: isDay ? t('baziWealth.report.rizhuTag') : (p?.shishen ?? '—'),
    canggan: p?.canggan ?? [],
    isDay,
  })
  return [
    mk(t('baziWealth.report.yearPillar'), c.year),
    mk(t('baziWealth.report.monthPillar'), c.month),
    mk(t('baziWealth.report.dayPillar'), c.day, true),
    mk(t('baziWealth.report.hourPillar'), c.hour),
  ]
})

/* ---------- 财星结构推导 ---------- */

const WX_GAN: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}
const YANG_GAN: TianGan[] = ['甲', '丙', '戊', '庚', '壬']
/** 我克者为财：日干五行 → 财星五行 */
const WX_KE_BY: Record<string, string> = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' }

interface CaixingInfo {
  zheng: string
  pian: string
  zhengStrength: number
  pianStrength: number
}

const caixing = computed<CaixingInfo>(() => {
  const dayWx = WX_GAN[props.chart.riZhu] ?? '木'
  const caiWx = WX_KE_BY[dayWx] ?? '土'
  const yangDay = YANG_GAN.includes(props.chart.riZhu)
  const gans = (Object.keys(WX_GAN) as TianGan[]).filter(g => WX_GAN[g] === caiWx)
  // 异性为正财：阳日干见阴干为正财，阴日干见阳干为正财
  const zheng = gans.find(g => YANG_GAN.includes(g) !== yangDay) ?? gans[0]!
  const pian = gans.find(g => g !== zheng) ?? gans[0]!

  const pillarGans = [props.chart.year.gan, props.chart.month.gan, props.chart.hour?.gan].filter(Boolean) as TianGan[]
  const strengthOf = (gan: TianGan) => {
    let n = 1 // 财星五行本身有气
    if (pillarGans.includes(gan)) n += 2 // 透出天干
    for (const p of [props.chart.year, props.chart.month, props.chart.day, props.chart.hour]) {
      if (p?.canggan?.some(cg => cg.gan === gan && cg.type === '本气')) { n += 2; break }
    }
    return Math.min(5, n)
  }
  return { zheng, pian, zhengStrength: strengthOf(zheng), pianStrength: strengthOf(pian) }
})

const caixingNote = computed(() => t('baziWealth.report.caixingNote', {
  riZhu: props.chart.riZhu,
  zheng: caixing.value.zheng,
  pian: caixing.value.pian,
}))

function strengthLabel(n: number): string {
  if (n >= 4) return t('baziWealth.report.strengthStrong')
  if (n >= 2) return t('baziWealth.report.strengthMid')
  return t('baziWealth.report.strengthWeak')
}

/* ---------- 财富等级 ---------- */

const LEVEL_KEYS = ['wenbao', 'xiaokang', 'zhongchan', 'fuyu', 'jufu'] as const
const LEVEL_PATTERNS: [RegExp, number][] = [
  [/巨富/, 4],
  [/富裕/, 3],
  [/中产/, 2],
  [/小康/, 1],
  [/温饱/, 0],
]

const wealthLevel = computed(() => {
  const content = aiSections.value['财富等级评估'] ?? ''
  if (!content) return ''
  for (const [re] of LEVEL_PATTERNS) {
    const m = content.match(re)
    if (m) return m[0]!
  }
  return ''
})

const levelSegments = computed(() => {
  const activeIdx = LEVEL_PATTERNS.find(([re]) => re.test(wealthLevel.value))?.[1] ?? -1
  return LEVEL_KEYS.map((key, i) => ({
    key,
    label: t(`baziWealth.report.level_${key}`),
    on: i === activeIdx,
  }))
})

/* ---------- 五行雷达图 ---------- */

const radarData = computed(() => ({
  labels: (['木', '火', '土', '金', '水'] as const).map(wx => wx),
  datasets: [
    {
      label: t('baziWealth.report.wuxingRadarLabel'),
      data: (['木', '火', '土', '金', '水'] as const).map(wx => Math.round(props.chart.wuxingScore[wx] ?? 0)),
      backgroundColor: 'rgba(140, 111, 31, 0.15)',
      borderColor: '#8c6d1f',
      borderWidth: 1.5,
      pointBackgroundColor: ['#4a7c59', '#a8512e', '#8a6d3b', '#7d7d68', '#4a6a8a'],
      pointBorderColor: '#faf6ec',
      pointRadius: 3,
    },
  ],
}))

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 50,
      ticks: { display: false, stepSize: 10 },
      grid: { color: 'rgba(85, 80, 63, 0.18)' },
      angleLines: { color: 'rgba(85, 80, 63, 0.18)' },
      pointLabels: { color: '#55503f', font: { size: 11, family: "'Noto Serif SC', serif" } },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(46, 42, 36, 0.92)',
      titleColor: '#f2ede3',
      bodyColor: '#e6dfcd',
      borderColor: 'rgba(140, 111, 31, 0.5)',
      borderWidth: 1,
    },
  },
}

/* ---------- 大运财运柱状图 ---------- */

const SCORE_MAP: Record<string, number> = { 大吉: 5, 吉: 4, 平: 3, 凶: 2, 大凶: 1 }

function dayunScore(gan: TianGan, zhi: DiZhi): number {
  const ganWx = WX_GAN[gan] ?? ''
  const ZHI_WX: Record<string, string> = {
    寅: '木', 卯: '木', 巳: '火', 午: '火', 申: '金', 酉: '金',
    亥: '水', 子: '水', 辰: '土', 戌: '土', 丑: '土', 未: '土',
  }
  const zhiWx = ZHI_WX[zhi] ?? ''
  const xiyong = props.chart.xiyong || ''
  const jishen = props.chart.jishen || ''
  let score = 3
  for (const wx of [ganWx, zhiWx]) {
    if (!wx) continue
    if (xiyong.includes(wx)) score += 0.5
    else if (jishen.includes(wx)) score -= 0.5
  }
  return Math.max(1, Math.min(5, Math.round(score * 2) / 2))
}

const dayunChartData = computed(() => {
  const list = props.chart.dayuns.slice(0, 8)
  const curIdx = props.chart.currentDaYun?.index
  return {
    labels: list.map(d => `${d.gan}${d.zhi}\n${d.ageRange[0]}-${d.ageRange[1]}`),
    datasets: [
      {
        label: t('baziWealth.report.dayunChartYLabel'),
        data: list.map(d => d.score ?? (d.fortune ? SCORE_MAP[d.fortune] : undefined) ?? dayunScore(d.gan, d.zhi)),
        backgroundColor: list.map(d => d.index === curIdx ? 'rgba(140, 47, 38, 0.75)' : 'rgba(138, 109, 59, 0.5)'),
        borderColor: list.map(d => d.index === curIdx ? '#8c2f26' : '#8a6d3b'),
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  }
})

const dayunChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 5,
      ticks: { stepSize: 1, color: '#8a8272', font: { size: 10 } },
      grid: { color: 'rgba(85, 80, 63, 0.12)' },
    },
    x: {
      ticks: { color: '#55503f', font: { size: 10, family: "'Noto Serif SC', serif" } },
      grid: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(46, 42, 36, 0.92)',
      titleColor: '#f2ede3',
      bodyColor: '#e6dfcd',
      borderColor: 'rgba(140, 111, 31, 0.5)',
      borderWidth: 1,
    },
  },
}

/* ---------- AI 内容解析 ---------- */

interface AiSectionMap { [title: string]: string }

const aiSections = computed<AiSectionMap>(() => {
  const text = props.aiContent || ''
  const map: AiSectionMap = {}
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

const pendingText = computed(() => t('baziWealth.report.pending'))

/** 判定词：从总论首句提炼 */
const verdict = computed(() => {
  const c = aiSections.value['财富格局总论'] ?? ''
  if (!c) return t('baziWealth.report.verdictFallback')
  if (/亨通|大旺|极旺|顺遂/.test(c)) return t('baziWealth.report.verdictGreat')
  if (/平稳|平顺|稳定|安定/.test(c)) return t('baziWealth.report.verdictSteady')
  if (/先难后易|渐入|后旺|晚发/.test(c)) return t('baziWealth.report.verdictLate')
  if (/波折|起伏|反复|多艰/.test(c)) return t('baziWealth.report.verdictRough')
  return t('baziWealth.report.verdictNormal')
})

const subtitleText = computed(() => {
  const c = aiSections.value['财富格局总论'] ?? ''
  const plain = c.replace(/[#*]/g, '').replace(/\n/g, '，').trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').replace(/^[，,、\s]+/, '').trim()
  return first ? first.slice(0, 48) : t('baziWealth.report.subtitleFallback', {
    geju: props.chart.geju, strength: props.chart.riZhuStrength,
  })
})

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="bwr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.bwr {
  --bwr-bg: #f2ede3;
  --bwr-sheet: #faf6ec;
  --bwr-card: #fffdf6;
  --bwr-ink: #2e2a24;
  --bwr-ink-soft: #55503f;
  --bwr-ink-faint: #8a8272;
  --bwr-line: #d8d0bd;
  --bwr-line-soft: #e6dfcd;
  --bwr-accent: #8c2f26;
  --bwr-accent-soft: #a8512e;
  --bwr-star: #8c6d1f;
  --bwr-green: #4a7c59;
  border-radius: 12px;
  background: var(--bwr-bg);
  padding: 18px;
  color: var(--bwr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.bwr-sheet {
  background: var(--bwr-sheet);
  border: 1px solid var(--bwr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.bwr-head { border-bottom: 2px solid var(--bwr-ink); padding-bottom: 16px; }
.bwr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.bwr-brand { display: flex; align-items: center; gap: 8px; }
.bwr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--bwr-accent);
  color: var(--bwr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.bwr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bwr-ink-soft); }
.bwr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bwr-ink-faint); }
.bwr-verdict { color: var(--bwr-green); font-weight: 600; }

.bwr-title {
  margin: 14px 0 6px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
}
.bwr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--bwr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.bwr-head-bottom { text-align: center; }
.bwr-meta-line { margin: 2px 0; font-size: 12px; color: var(--bwr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.bwr-row { display: grid; gap: 14px; margin-top: 16px; }
.bwr-row-top { grid-template-columns: 1fr 2.4fr; }
.bwr-row-wealth { grid-template-columns: 1fr 1fr; }
.bwr-ai-row { grid-template-columns: 1fr 1fr; }
.bwr-section { margin-top: 16px; }

.bwr-card {
  background: var(--bwr-card);
  border: 1px solid var(--bwr-line);
  padding: 14px 16px;
}
.bwr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--bwr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.bwr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 命主信息卡 ---------- */
.bwr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.bwr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.bwr-ico { color: var(--bwr-accent-soft); font-size: 12px; }
.bwr-profile-label { color: var(--bwr-ink-faint); min-width: 30px; }
.bwr-profile-value { color: var(--bwr-ink); letter-spacing: 0.5px; }

/* ---------- 财富格局总论 ---------- */
.bwr-overview { display: flex; flex-direction: column; }

/* ---------- 核心数据卡 ---------- */
.bwr-core-grid { display: grid; grid-template-columns: 0.9fr 1.3fr 1fr 1.4fr 1.2fr; gap: 10px; }
.bwr-core { text-align: center; display: flex; flex-direction: column; gap: 6px; padding: 12px 10px; }
.bwr-core-label { font-size: 11px; color: var(--bwr-ink-faint); letter-spacing: 1px; }
.bwr-core-value { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
.bwr-core-sub { font-size: 10px; color: var(--bwr-ink-faint); }
.bwr-core-radar { padding: 10px; }
.bwr-radar-wrap { height: 150px; }

.bwr-gauge { margin-top: 4px; }
.bwr-gauge-track { position: relative; height: 8px; display: flex; border: 1px solid var(--bwr-line); overflow: hidden; }
.bwr-gauge-zone { height: 100%; }
.bwr-gauge-zone-weak { flex: 35; background: linear-gradient(90deg, #b8cdc0, #d9e4dc); }
.bwr-gauge-zone-mid { flex: 30; background: #efe9d8; }
.bwr-gauge-zone-strong { flex: 35; background: linear-gradient(90deg, #e3cfc0, #cfa992); }
.bwr-gauge-pointer {
  position: absolute; top: -2px; width: 2px; height: 12px;
  background: var(--bwr-ink); transform: translateX(-1px);
}
.bwr-gauge-marks { display: flex; justify-content: space-between; font-size: 9px; color: var(--bwr-ink-faint); margin-top: 3px; }

.bwr-yongshen { display: flex; justify-content: center; gap: 8px; }
.bwr-yongshen-char {
  width: 30px; height: 30px;
  border: 1.5px solid var(--bwr-ink);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
}

.bwr-wuxing { display: flex; flex-direction: column; gap: 4px; }
.bwr-wuxing-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.bwr-wuxing-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.bwr-wuxing-name { width: 12px; color: var(--bwr-ink-soft); }
.bwr-wuxing-bar-wrap { flex: 1; height: 6px; background: var(--bwr-line-soft); }
.bwr-wuxing-bar { display: block; height: 100%; }
.bwr-wuxing-pct { width: 28px; text-align: right; color: var(--bwr-ink-faint); }

/* ---------- 八字盘 ---------- */
.bwr-pan { padding: 12px; min-width: 0; }
.bwr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.bwr-bazi { min-width: 0; }
.bwr-bazi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.bwr-pillar { border: 1px solid var(--bwr-line-soft); text-align: center; padding: 6px 4px; display: flex; flex-direction: column; gap: 2px; }
.bwr-pillar-head { font-size: 9px; color: var(--bwr-ink-faint); letter-spacing: 1px; }
.bwr-pillar-shishen { font-size: 10px; color: var(--bwr-accent-soft); min-height: 14px; }
.bwr-pillar-gan { font-size: 26px; font-weight: 700; line-height: 1.2; }
.bwr-pillar-zhi { font-size: 26px; font-weight: 700; line-height: 1.2; color: var(--bwr-ink-soft); }
.bwr-pillar-rimu { color: var(--bwr-accent); }
.bwr-pillar-canggan { display: flex; flex-direction: column; font-size: 9px; color: var(--bwr-ink-faint); line-height: 1.5; min-height: 42px; }
.bwr-pillar-canggan i { font-style: normal; opacity: 0.7; }

.bwr-dayun { margin-top: 10px; }
.bwr-dayun-title { font-size: 10px; color: var(--bwr-ink-faint); margin-bottom: 4px; letter-spacing: 1px; }
.bwr-dayun-row { display: flex; gap: 2px; overflow-x: auto; }
.bwr-dayun-item {
  flex: 1; min-width: 44px;
  border: 1px solid var(--bwr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.bwr-dayun-current { border-color: var(--bwr-accent); background: rgba(140, 47, 38, 0.05); }
.bwr-dayun-gz { font-size: 12px; font-weight: 700; }
.bwr-dayun-age { font-size: 8px; color: var(--bwr-ink-faint); }

/* ---------- 财星结构 ---------- */
.bwr-cai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bwr-cai-stat {
  border: 1px solid var(--bwr-line);
  background: rgba(255, 255, 255, 0.45);
  padding: 10px 12px;
  display: flex; flex-direction: column; gap: 8px;
}
.bwr-cai-stat-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.bwr-cai-stat-label { font-size: 12px; font-weight: 700; color: var(--bwr-ink); letter-spacing: 1px; }
.bwr-cai-stat-value { font-size: 24px; font-weight: 700; color: var(--bwr-accent-soft); }
.bwr-cai-strength { display: flex; align-items: center; gap: 4px; }
.bwr-cai-dot {
  width: 9px; height: 9px; border-radius: 50%;
  border: 1px solid var(--bwr-line);
  background: transparent;
}
.bwr-cai-dot-on { background: var(--bwr-accent-soft); border-color: var(--bwr-accent-soft); }
.bwr-cai-dot-pian.bwr-cai-dot-on { background: var(--bwr-star); border-color: var(--bwr-star); }
.bwr-cai-strength-label { font-size: 10px; color: var(--bwr-ink-faint); margin-left: 4px; letter-spacing: 1px; }
.bwr-cai-note { margin: 10px 0 0; font-size: 11px; color: var(--bwr-ink-faint); line-height: 1.6; }

/* ---------- 财富等级 ---------- */
.bwr-level { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
.bwr-level-value {
  font-size: 26px; font-weight: 700; letter-spacing: 3px;
  color: var(--bwr-accent); text-align: center;
}
.bwr-level-track { display: flex; gap: 3px; }
.bwr-level-seg { flex: 1; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.bwr-level-seg-bar {
  display: block; width: 100%; height: 8px;
  background: var(--bwr-line-soft);
  border: 1px solid var(--bwr-line);
}
.bwr-level-seg-on .bwr-level-seg-bar {
  background: linear-gradient(90deg, var(--bwr-accent-soft), var(--bwr-accent));
  border-color: var(--bwr-accent);
}
.bwr-level-seg-label { font-style: normal; font-size: 10px; color: var(--bwr-ink-faint); letter-spacing: 1px; }
.bwr-level-seg-on .bwr-level-seg-label { color: var(--bwr-accent); font-weight: 700; }

/* ---------- 大运图表 ---------- */
.bwr-chart-wrap { height: 220px; }

/* ---------- AI 章节 ---------- */
.bwr-ai { min-width: 0; }
.bwr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--bwr-line-soft);
  padding-bottom: 8px;
}
.bwr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--bwr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.bwr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--bwr-ink-soft); }

.bwr-md :deep(p) { margin: 0 0 0.7em; }
.bwr-md :deep(p:last-child) { margin-bottom: 0; }
.bwr-md :deep(strong) { color: var(--bwr-ink); font-weight: 700; }
.bwr-md :deep(ul), .bwr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.bwr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.bwr-md :deep(h3), .bwr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--bwr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.bwr-md { overflow-x: auto; }
.bwr-md :deep(table) { width: 100%; border-collapse: collapse; font-size: 11px; margin: 0.5em 0; }
.bwr-md :deep(th), .bwr-md :deep(td) { border: 1px solid var(--bwr-line); padding: 4px 6px; text-align: left; }
.bwr-md :deep(th) { background: var(--bwr-line-soft); font-weight: 700; color: var(--bwr-ink); }
.bwr-md :deep(blockquote) {
  margin: 0.5em 0; padding: 6px 10px;
  border-left: 2px solid var(--bwr-accent-soft);
  background: rgba(168, 81, 46, 0.05);
}
.bwr-md :deep(.bwr-pending), .bwr-pending { color: var(--bwr-ink-faint); font-style: italic; }

/* ---------- 流式/错误/重试 ---------- */
.bwr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--bwr-ink-faint); letter-spacing: 1px;
}
.bwr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--bwr-accent);
  animation: bwr-pulse 1s ease-in-out infinite;
}
@keyframes bwr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.bwr-error { margin-top: 14px; text-align: center; color: var(--bwr-accent); font-size: 12px; }
.bwr-rerun { margin-top: 14px; text-align: center; }
.bwr-retry {
  margin-top: 8px;
  border: 1px solid var(--bwr-accent);
  background: transparent;
  color: var(--bwr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.bwr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.bwr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--bwr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.bwr-foot-note { font-size: 10px; color: var(--bwr-ink-faint); }
.bwr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .bwr-row-top { grid-template-columns: 1fr; }
  .bwr-row-wealth { grid-template-columns: 1fr; }
  .bwr-core-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 720px) {
  .bwr { padding: 8px; }
  .bwr-sheet { padding: 16px 12px; }
  .bwr-ai-row { grid-template-columns: 1fr; }
  .bwr-title { font-size: 22px; letter-spacing: 2px; }
  .bwr-core-grid { grid-template-columns: 1fr 1fr; }

  .bwr-pillar-gan, .bwr-pillar-zhi { font-size: 19px; }
  .bwr-pillar-shishen { font-size: 9px; }
  .bwr-pillar-canggan { font-size: 8px; min-height: 34px; }
  .bwr-pillar-head { font-size: 8px; }

  .bwr-dayun-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .bwr-dayun-item { flex: 0 0 auto; min-width: 48px; }

  .bwr-cai-grid { grid-template-columns: 1fr; }
  .bwr-level-seg-label { font-size: 9px; }
}
</style>
