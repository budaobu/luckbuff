<template>
  <div class="tyr">
    <div class="tyr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="tyr-head">
        <div class="tyr-head-top">
          <div class="tyr-brand">
            <div class="tyr-seal">{{ $t('taiyi.report.seal') }}</div>
            <span class="tyr-brand-name">{{ $t('taiyi.report.brandName') }}</span>
          </div>
          <div class="tyr-head-right">
            <span class="tyr-time">{{ $t('taiyi.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="tyr-verdict">✓ {{ verdict }}</span>
          </div>
        </div>

        <h1 class="tyr-title">{{ titleText }}</h1>
        <p class="tyr-subtitle">{{ subtitleText }}</p>

        <div class="tyr-head-bottom">
          <p class="tyr-meta-line">{{ $t('taiyi.report.questionLine', { type: questionTypeLabel, question: question }) }}</p>
          <p class="tyr-meta-line">{{ cycleLine }}</p>
        </div>
      </header>

      <!-- ============ 占问信息 + 核心数据 ============ -->
      <section class="tyr-row tyr-row-top">
        <div class="tyr-card tyr-profile">
          <div class="tyr-profile-line">
            <span class="tyr-ico">☀</span>
            <span class="tyr-profile-label">{{ $t('taiyi.report.solarLabel') }}</span>
            <span class="tyr-profile-value">{{ solarText }}</span>
          </div>
          <div class="tyr-profile-line">
            <span class="tyr-ico">◑</span>
            <span class="tyr-profile-label">{{ $t('taiyi.report.questionTypeLabel') }}</span>
            <span class="tyr-profile-value">{{ questionTypeLabel }}</span>
          </div>
          <div class="tyr-profile-line">
            <span class="tyr-ico">❝</span>
            <span class="tyr-profile-label">{{ $t('taiyi.report.questionLabel') }}</span>
            <span class="tyr-profile-value">{{ question }}</span>
          </div>
        </div>

        <div class="tyr-card">
          <h3 class="tyr-card-title">{{ $t('taiyi.report.coreDataTitle') }}</h3>
          <div class="tyr-core-grid">
            <div class="tyr-core">
              <div class="tyr-core-label">{{ $t('taiyi.report.accYearsLabel') }}</div>
              <div class="tyr-core-value">{{ chart.accumulatedYears.accumulatedYears }}</div>
              <div class="tyr-core-sub">{{ $t('taiyi.report.baseNote') }}</div>
            </div>
            <div class="tyr-core">
              <div class="tyr-core-label">{{ $t('taiyi.report.yinyangJuLabel') }}</div>
              <div class="tyr-core-value">{{ chart.yearChart.yinYangJu }}{{ chart.yearChart.juNumber }}</div>
              <div class="tyr-core-sub">{{ $t('taiyi.report.juUnit') }}</div>
            </div>
            <div class="tyr-core">
              <div class="tyr-core-label">{{ $t('taiyi.report.chaoShenLabel') }}</div>
              <div class="tyr-core-value">{{ chart.yearChart.chaoShenJieQi.state }}</div>
              <div class="tyr-core-sub">{{ $t('taiyi.report.juYearPositionLabel', { pos: chart.yearChart.chaoShenJieQi.juYearPosition }) }}</div>
            </div>
            <div class="tyr-core">
              <div class="tyr-core-label">{{ $t('taiyi.report.cycleLabel') }}</div>
              <div class="tyr-cycle">
                <div class="tyr-cycle-track">
                  <span class="tyr-cycle-fill" :style="{ width: cyclePct + '%' }" />
                  <span class="tyr-cycle-pointer" :style="{ left: cyclePct + '%' }" />
                </div>
                <div class="tyr-cycle-marks">
                  <span>1</span>
                  <span>{{ chart.yearChart.chaoShenJieQi.cyclePosition }}/72</span>
                  <span>72</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 四柱干支 ============ -->
      <section class="tyr-section">
        <h3 class="tyr-section-title">{{ $t('taiyi.report.pillarsTitle') }}</h3>
        <div class="tyr-pillars-grid">
          <div v-for="p in pillarList" :key="p.label" class="tyr-pillar">
            <div class="tyr-pillar-head">{{ p.label }}</div>
            <div class="tyr-pillar-gz">{{ p.ganzhi }}</div>
          </div>
        </div>
      </section>

      <!-- ============ 九宫盘 + 吉凶统计 ============ -->
      <section class="tyr-row tyr-pans">
        <!-- 太乙九宫盘 -->
        <div class="tyr-card tyr-pan">
          <h3 class="tyr-pan-title">{{ $t('taiyi.report.ninePalaceTitle') }}</h3>
          <div class="tyr-palace-grid">
            <div
              v-for="pos in palaceLayout"
              :key="pos.num"
              class="tyr-palace"
              :class="{ 'tyr-palace-center': pos.num === 5 }"
            >
              <div class="tyr-palace-head">
                <span class="tyr-palace-name">{{ pos.label }}</span>
                <span class="tyr-palace-dir">{{ pos.dir }}</span>
              </div>
              <div class="tyr-palace-gods">
                <span
                  v-for="god in godsByPalace(pos.num)"
                  :key="god.name"
                  class="tyr-god"
                  :class="'tyr-god-' + god.nature"
                >{{ god.name }}</span>
                <span v-if="!godsByPalace(pos.num).length" class="tyr-god-none">—</span>
              </div>
            </div>
          </div>
          <div class="tyr-palace-legend">
            <span class="tyr-god tyr-god-吉">{{ $t('taiyi.report.natureJi') }}</span>
            <span class="tyr-god tyr-god-凶">{{ $t('taiyi.report.natureXiong') }}</span>
            <span class="tyr-god tyr-god-中">{{ $t('taiyi.report.natureZhong') }}</span>
            <span class="tyr-palace-legend-note">{{ $t('taiyi.report.yearChartNote') }}</span>
          </div>
        </div>

        <!-- 吉凶统计 -->
        <div class="tyr-card tyr-pan">
          <h3 class="tyr-pan-title">{{ $t('taiyi.report.natureStatsTitle') }}</h3>
          <div class="tyr-stats-table-wrap">
            <table class="tyr-stats-table">
              <thead>
                <tr>
                  <th>{{ $t('taiyi.report.panColLabel') }}</th>
                  <th>{{ $t('taiyi.report.juColLabel') }}</th>
                  <th>{{ $t('taiyi.report.natureJi') }}</th>
                  <th>{{ $t('taiyi.report.natureXiong') }}</th>
                  <th>{{ $t('taiyi.report.natureZhong') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in natureStats" :key="row.level">
                  <th class="tyr-stats-rowhead">{{ row.label }}</th>
                  <td>{{ row.ju }}</td>
                  <td>{{ row.ji }}</td>
                  <td>{{ row.xiong }}</td>
                  <td>{{ row.zhong }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tyr-bars">
            <div v-for="row in natureStats" :key="row.level" class="tyr-bars-row">
              <span class="tyr-bars-label">{{ row.label }}</span>
              <div class="tyr-bars-track">
                <span class="tyr-bar tyr-bar-ji" :style="{ width: (row.ji / 16 * 100) + '%' }" />
                <span class="tyr-bar tyr-bar-xiong" :style="{ width: (row.xiong / 16 * 100) + '%' }" />
                <span class="tyr-bar tyr-bar-zhong" :style="{ width: (row.zhong / 16 * 100) + '%' }" />
              </div>
              <span class="tyr-bars-val">{{ row.ji }}/{{ row.xiong }}/{{ row.zhong }}</span>
            </div>
          </div>
          <div class="tyr-bars-legend">
            <span><i class="tyr-dot tyr-dot-ji" />{{ $t('taiyi.report.natureJi') }}</span>
            <span><i class="tyr-dot tyr-dot-xiong" />{{ $t('taiyi.report.natureXiong') }}</span>
            <span><i class="tyr-dot tyr-dot-zhong" />{{ $t('taiyi.report.natureZhong') }}</span>
          </div>
        </div>
      </section>

      <!-- ============ 五要神宫次雷达图 ============ -->
      <section class="tyr-section">
        <div class="tyr-card tyr-pan">
          <h3 class="tyr-pan-title">{{ $t('taiyi.report.radarTitle') }}</h3>
          <p class="tyr-pan-sub">{{ $t('taiyi.report.radarSub') }}</p>
          <div class="tyr-radar-wrap">
            <svg :viewBox="`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`" class="tyr-radar">
              <!-- 刻度环 -->
              <polygon
                v-for="ring in radarRings"
                :key="ring"
                :points="radarRingPoints(ring)"
                class="tyr-radar-ring"
              />
              <!-- 轴线 -->
              <line
                v-for="(axis, i) in radarAxes"
                :key="axis.key"
                :x1="RADAR_CX"
                :y1="RADAR_CY"
                :x2="radarPoint(i, 8).x"
                :y2="radarPoint(i, 8).y"
                class="tyr-radar-axis-line"
              />
              <!-- 各盘多边形 -->
              <polygon
                v-for="poly in radarPolys"
                :key="poly.level"
                :points="poly.points"
                class="tyr-radar-poly"
                :style="{ fill: poly.color + '22', stroke: poly.color }"
              />
              <!-- 轴标签 -->
              <text
                v-for="(axis, i) in radarAxes"
                :key="axis.key"
                :x="radarPoint(i, 9.2).x"
                :y="radarPoint(i, 9.2).y"
                class="tyr-radar-label"
                text-anchor="middle"
                dominant-baseline="middle"
              >{{ axis.label }}</text>
            </svg>
            <div class="tyr-radar-legend">
              <div v-for="poly in radarPolys" :key="poly.level" class="tyr-radar-legend-item">
                <span class="tyr-dot" :style="{ background: poly.color }" />
                <span class="tyr-radar-legend-label">{{ poly.label }}</span>
                <span class="tyr-radar-legend-val">{{ poly.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 十六神分布总表 ============ -->
      <section class="tyr-section">
        <h3 class="tyr-section-title">{{ $t('taiyi.report.godsTableTitle') }}</h3>
        <div class="tyr-card tyr-godstable-card">
          <div class="tyr-table-wrap">
            <table class="tyr-table">
              <thead>
                <tr>
                  <th>{{ $t('taiyi.report.godColName') }}</th>
                  <th>{{ $t('taiyi.report.godColNature') }}</th>
                  <th v-for="pan in pans" :key="pan.level">{{ pan.levelLabel }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="god in godRows" :key="god.name">
                  <th class="tyr-table-rowhead">{{ god.name }}</th>
                  <td><span class="tyr-mark" :class="natureMarkClass(god.nature)">{{ natureLabel(god.nature) }}</span></td>
                  <td v-for="pan in pans" :key="pan.level" :class="{ 'tyr-cell-highlight': god.name === '太乙' }">
                    {{ palaceLabel(god.palaces[pan.level] ?? 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ============ AI 解读 ============ -->
      <section class="tyr-row tyr-ai-row">
        <div class="tyr-card tyr-ai">
          <h3 class="tyr-ai-title"><span class="tyr-ai-no">01</span>{{ $t('taiyi.report.secOverview') }}</h3>
          <div class="tyr-ai-body tyr-md" v-html="renderSection(aiSections['总论'])" />
        </div>
        <div class="tyr-card tyr-ai">
          <h3 class="tyr-ai-title"><span class="tyr-ai-no">02</span>{{ $t('taiyi.report.secTaiyiGong') }}</h3>
          <div class="tyr-ai-body tyr-md" v-html="renderSection(aiSections['太乙宫主断'])" />
        </div>
      </section>
      <section class="tyr-row tyr-ai-row">
        <div class="tyr-card tyr-ai">
          <h3 class="tyr-ai-title"><span class="tyr-ai-no">03</span>{{ $t('taiyi.report.secGods') }}</h3>
          <div class="tyr-ai-body tyr-md" v-html="renderSection(aiSections['神将论断'])" />
        </div>
        <div class="tyr-card tyr-ai">
          <h3 class="tyr-ai-title"><span class="tyr-ai-no">04</span>{{ $t('taiyi.report.secTiming') }}</h3>
          <div class="tyr-ai-body tyr-md" v-html="renderSection(aiSections['时间节点提示'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="tyr-streaming">
        <span class="tyr-streaming-dot" />
        {{ $t('taiyi.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="tyr-error">
        <p>{{ error }}</p>
        <button type="button" class="tyr-retry" @click="$emit('retry')">{{ $t('taiyi.report.retry') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="tyr-foot">
        <span class="tyr-foot-note">ⓘ {{ $t('taiyi.report.footerNote') }}</span>
        <span class="tyr-seal tyr-seal-foot">{{ $t('taiyi.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { TaiyiChartResult, TaiyiGod, PanLevel, QuestionType } from '~~/server/utils/taiyi/types'

interface Props {
  chart: TaiyiChartResult
  aiContent: string
  streaming: boolean
  error: string | null
  questionType: QuestionType
  questionTypeLabel: string
  datetime: string
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t, locale } = useI18n()

/* ---------- 基础派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const question = computed(() => props.chart.input.question)

const solarText = computed(() => props.datetime.replace('T', ' '))

const titleText = computed(() => t('taiyi.report.titleWithJu', {
  yy: props.chart.yearChart.yinYangJu,
  ju: props.chart.yearChart.juNumber,
}))

const subtitleText = computed(() => t('taiyi.report.subtitleValue', {
  state: props.chart.yearChart.chaoShenJieQi.state,
  pos: props.chart.yearChart.chaoShenJieQi.cyclePosition,
}))

const cycleLine = computed(() => t('taiyi.report.cycleValue', {
  pos: props.chart.yearChart.chaoShenJieQi.cyclePosition,
  juYear: props.chart.yearChart.chaoShenJieQi.juYearPosition,
}))

const verdict = computed(() => t('taiyi.report.verdict'))

const cyclePct = computed(() => Math.round((props.chart.yearChart.chaoShenJieQi.cyclePosition / 72) * 100))

const pillarList = computed(() => [
  { label: t('taiyi.report.yearPillar'), ganzhi: props.chart.pillars.year },
  { label: t('taiyi.report.monthPillar'), ganzhi: props.chart.pillars.month },
  { label: t('taiyi.report.dayPillar'), ganzhi: props.chart.pillars.day },
  { label: t('taiyi.report.hourPillar'), ganzhi: props.chart.pillars.hour },
])

/* ---------- 宫位 ---------- */

const PALACE_INFO: { num: number; label: string; dir: string }[] = [
  { num: 4, label: '巽四', dir: '东南' },
  { num: 9, label: '离九', dir: '南' },
  { num: 2, label: '坤二', dir: '西南' },
  { num: 3, label: '震三', dir: '东' },
  { num: 5, label: '中五', dir: '中' },
  { num: 7, label: '兑七', dir: '西' },
  { num: 8, label: '艮八', dir: '东北' },
  { num: 1, label: '坎一', dir: '北' },
  { num: 6, label: '乾六', dir: '西北' },
]

const palaceLayout = PALACE_INFO

function palaceLabel(palace: number): string {
  const labels: Record<number, string> = {
    1: '坎一', 2: '坤二', 3: '震三', 4: '巽四', 5: '中五',
    6: '乾六', 7: '兑七', 8: '艮八', 9: '离九',
  }
  return labels[palace] ?? `宫${palace}`
}

function godsByPalace(palace: number): TaiyiGod[] {
  return props.chart.yearChart.gods.filter(g => g.palace === palace)
}

/* ---------- 四盘 ---------- */

const pans = computed(() => [
  props.chart.yearChart,
  props.chart.monthChart,
  props.chart.dayChart,
  props.chart.hourChart,
])

interface NatureStatRow {
  level: PanLevel
  label: string
  ju: string
  ji: number
  xiong: number
  zhong: number
}

const natureStats = computed<NatureStatRow[]>(() =>
  pans.value.map(pan => ({
    level: pan.level,
    label: pan.levelLabel,
    ju: `${pan.yinYangJu}${pan.juNumber}`,
    ji: pan.gods.filter(g => g.nature === '吉').length,
    xiong: pan.gods.filter(g => g.nature === '凶').length,
    zhong: pan.gods.filter(g => g.nature === '中').length,
  })))

interface GodRow {
  name: string
  nature: string
  palaces: Partial<Record<PanLevel, number>>
}

const godRows = computed<GodRow[]>(() =>
  props.chart.yearChart.gods.map((g, idx) => ({
    name: g.name,
    nature: g.nature,
    palaces: {
      year: g.palace,
      month: props.chart.monthChart.gods[idx]?.palace,
      day: props.chart.dayChart.gods[idx]?.palace,
      hour: props.chart.hourChart.gods[idx]?.palace,
    },
  })))

function natureLabel(nature: string): string {
  if (nature === '吉') return t('taiyi.report.natureJi')
  if (nature === '凶') return t('taiyi.report.natureXiong')
  return t('taiyi.report.natureZhong')
}

function natureMarkClass(nature: string): string {
  if (nature === '吉') return 'tyr-mark-ji'
  if (nature === '凶') return 'tyr-mark-xiong'
  return 'tyr-mark-zhong'
}

/* ---------- 雷达图：四盘 × 五要神宫位 ---------- */

const RADAR_SIZE = 320
const RADAR_CX = RADAR_SIZE / 2
const RADAR_CY = RADAR_SIZE / 2
const RADAR_R = 110

const radarAxes = computed(() => [
  { key: 'taiyi', label: t('taiyi.report.spiritTaiyi') },
  { key: 'jishen', label: t('taiyi.report.spiritJiShen') },
  { key: 'wenchang', label: t('taiyi.report.spiritWenChang') },
  { key: 'tianmu', label: t('taiyi.report.spiritTianMu') },
  { key: 'dimu', label: t('taiyi.report.spiritDiMu') },
])

const SPIRIT_KEYS = ['taiyiGong', 'jiShenGong', 'wenChangGong', 'tianMuGong', 'diMuGong'] as const

const PAN_COLORS: Record<PanLevel, string> = {
  year: '#8c2f26',
  month: '#8c6d1f',
  day: '#4a7c59',
  hour: '#4a6a8a',
}

const radarRings = [2, 4, 6, 8]

function radarPoint(axisIndex: number, value: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * axisIndex) / 5 - Math.PI / 2
  const r = (value / 8) * RADAR_R
  return { x: RADAR_CX + r * Math.cos(angle), y: RADAR_CY + r * Math.sin(angle) }
}

function radarRingPoints(ring: number): string {
  return radarAxes.value.map((_, i) => {
    const p = radarPoint(i, ring)
    return `${p.x},${p.y}`
  }).join(' ')
}

const radarPolys = computed(() =>
  pans.value.map(pan => {
    const values = [
      pan.taiyiGong,
      pan.keySpirits.jiShenGong,
      pan.keySpirits.wenChangGong,
      pan.keySpirits.tianMuGong,
      pan.keySpirits.diMuGong,
    ]
    return {
      level: pan.level,
      label: pan.levelLabel,
      color: PAN_COLORS[pan.level]!,
      points: values.map((v, i) => {
        const p = radarPoint(i, v)
        return `${p.x},${p.y}`
      }).join(' '),
      desc: t('taiyi.report.radarPolyDesc', {
        taiyi: palaceLabel(pan.taiyiGong),
        ju: `${pan.yinYangJu}${pan.juNumber}`,
      }),
    }
  }))

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
  // 兜底：旧格式无标题时，按段落顺序映射到四个章节
  if (!Object.keys(map).length && text.trim()) {
    const paras = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean)
    const keys = ['总论', '太乙宫主断', '神将论断', '时间节点提示']
    paras.slice(0, 4).forEach((p, i) => {
      map[keys[i]!] = p
    })
  }
  return map
})

const pendingText = computed(() => t('taiyi.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="tyr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.tyr {
  --tyr-bg: #f2ede3;
  --tyr-sheet: #faf6ec;
  --tyr-card: #fffdf6;
  --tyr-ink: #2e2a24;
  --tyr-ink-soft: #55503f;
  --tyr-ink-faint: #8a8272;
  --tyr-line: #d8d0bd;
  --tyr-line-soft: #e6dfcd;
  --tyr-accent: #8c2f26;
  --tyr-accent-soft: #a8512e;
  --tyr-star: #8c6d1f;
  --tyr-green: #4a7c59;
  --tyr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--tyr-bg);
  padding: 18px;
  color: var(--tyr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.tyr-sheet {
  background: var(--tyr-sheet);
  border: 1px solid var(--tyr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.tyr-head { border-bottom: 2px solid var(--tyr-ink); padding-bottom: 16px; }
.tyr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.tyr-brand { display: flex; align-items: center; gap: 8px; }
.tyr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--tyr-accent);
  color: var(--tyr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.tyr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--tyr-ink-soft); }
.tyr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--tyr-ink-faint); }
.tyr-verdict { color: var(--tyr-green); font-weight: 600; }

.tyr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.tyr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--tyr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.tyr-head-bottom { text-align: center; }
.tyr-meta-line { margin: 2px 0; font-size: 12px; color: var(--tyr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.tyr-row { display: grid; gap: 14px; margin-top: 16px; }
.tyr-row-top { grid-template-columns: 1fr 2.2fr; }
.tyr-pans { grid-template-columns: 1fr 1fr; }
.tyr-ai-row { grid-template-columns: 1fr 1fr; }
.tyr-section { margin-top: 16px; }

.tyr-card {
  background: var(--tyr-card);
  border: 1px solid var(--tyr-line);
  padding: 14px 16px;
}
.tyr-card-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--tyr-line-soft);
  padding-bottom: 8px;
  text-align: center;
}
.tyr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 占问信息卡 ---------- */
.tyr-profile { display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.tyr-profile-line { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
.tyr-ico { color: var(--tyr-accent-soft); font-size: 12px; }
.tyr-profile-label { color: var(--tyr-ink-faint); min-width: 56px; flex-shrink: 0; }
.tyr-profile-value { color: var(--tyr-ink); letter-spacing: 0.5px; word-break: break-all; }

/* ---------- 核心数据 ---------- */
.tyr-core-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.tyr-core {
  text-align: center;
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 8px;
  border: 1px dashed var(--tyr-line);
  background: rgba(255, 255, 255, 0.45);
}
.tyr-core-label { font-size: 11px; color: var(--tyr-ink-faint); letter-spacing: 1px; }
.tyr-core-value { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.tyr-core-sub { font-size: 10px; color: var(--tyr-ink-faint); }

.tyr-cycle { margin-top: 6px; }
.tyr-cycle-track {
  position: relative;
  height: 8px;
  background: var(--tyr-line-soft);
  border: 1px solid var(--tyr-line);
  overflow: visible;
}
.tyr-cycle-fill {
  display: block; height: 100%;
  background: linear-gradient(90deg, #d9cba8, var(--tyr-star));
}
.tyr-cycle-pointer {
  position: absolute; top: -3px;
  width: 2px; height: 12px;
  background: var(--tyr-ink);
  transform: translateX(-1px);
}
.tyr-cycle-marks {
  display: flex; justify-content: space-between;
  font-size: 9px; color: var(--tyr-ink-faint);
  margin-top: 3px;
}

/* ---------- 四柱 ---------- */
.tyr-pillars-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.tyr-pillar {
  background: var(--tyr-card);
  border: 1px solid var(--tyr-line);
  text-align: center;
  padding: 10px 6px;
  display: flex; flex-direction: column; gap: 4px;
}
.tyr-pillar-head { font-size: 10px; color: var(--tyr-ink-faint); letter-spacing: 2px; }
.tyr-pillar-gz { font-size: 22px; font-weight: 700; letter-spacing: 2px; color: var(--tyr-ink); }

/* ---------- 九宫盘 ---------- */
.tyr-pan { padding: 12px; }
.tyr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.tyr-pan-sub { margin: -4px 0 10px; font-size: 10px; color: var(--tyr-ink-faint); text-align: center; }

.tyr-palace-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, minmax(92px, auto));
  gap: 2px;
}
.tyr-palace {
  border: 1px solid var(--tyr-line-soft);
  padding: 5px 6px;
  display: flex; flex-direction: column; gap: 4px;
  background: var(--tyr-card);
  overflow: hidden;
}
.tyr-palace-center { background: var(--tyr-sheet); }
.tyr-palace-head { display: flex; justify-content: space-between; align-items: baseline; font-size: 9px; }
.tyr-palace-name { font-weight: 700; color: var(--tyr-ink-soft); font-size: 10px; }
.tyr-palace-dir { color: var(--tyr-ink-faint); }
.tyr-palace-gods { display: flex; flex-wrap: wrap; gap: 3px; align-content: flex-start; }
.tyr-god {
  display: inline-block;
  font-size: 11px; font-weight: 700;
  padding: 1px 5px;
  border-radius: 2px;
  border: 1px solid transparent;
}
.tyr-god-吉 { color: var(--tyr-green); background: rgba(74, 124, 89, 0.10); border-color: rgba(74, 124, 89, 0.3); }
.tyr-god-凶 { color: var(--tyr-accent); background: rgba(140, 47, 38, 0.08); border-color: rgba(140, 47, 38, 0.3); }
.tyr-god-中 { color: var(--tyr-ink-faint); background: rgba(138, 130, 114, 0.10); border-color: rgba(138, 130, 114, 0.3); }
.tyr-god-none { font-size: 10px; color: var(--tyr-ink-faint); }
.tyr-palace-legend {
  margin-top: 10px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 10px;
}
.tyr-palace-legend-note { color: var(--tyr-ink-faint); }

/* ---------- 吉凶统计 ---------- */
.tyr-stats-table-wrap { overflow-x: auto; margin-bottom: 12px; }
.tyr-stats-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.tyr-stats-table th, .tyr-stats-table td {
  border: 1px solid var(--tyr-line);
  padding: 5px 7px;
  text-align: center;
  color: var(--tyr-ink-soft);
}
.tyr-stats-table thead th { background: var(--tyr-line-soft); color: var(--tyr-ink); font-weight: 700; letter-spacing: 1px; }
.tyr-stats-rowhead { background: var(--tyr-line-soft); color: var(--tyr-ink); font-weight: 700; }

.tyr-bars { display: flex; flex-direction: column; gap: 6px; }
.tyr-bars-row { display: flex; align-items: center; gap: 8px; font-size: 10px; }
.tyr-bars-label { width: 34px; flex-shrink: 0; color: var(--tyr-ink-soft); font-weight: 700; }
.tyr-bars-track {
  flex: 1; height: 10px;
  background: var(--tyr-line-soft);
  display: flex;
  overflow: hidden;
}
.tyr-bar { display: block; height: 100%; }
.tyr-bar-ji { background: var(--tyr-green); }
.tyr-bar-xiong { background: var(--tyr-accent); }
.tyr-bar-zhong { background: #a89e88; }
.tyr-bars-val { width: 34px; text-align: right; color: var(--tyr-ink-faint); flex-shrink: 0; }
.tyr-bars-legend {
  margin-top: 8px;
  display: flex; gap: 14px;
  font-size: 10px; color: var(--tyr-ink-faint);
}
.tyr-dot {
  display: inline-block;
  width: 8px; height: 8px; border-radius: 2px;
  margin-right: 4px;
}
.tyr-dot-ji { background: var(--tyr-green); }
.tyr-dot-xiong { background: var(--tyr-accent); }
.tyr-dot-zhong { background: #a89e88; }

/* ---------- 雷达图 ---------- */
.tyr-radar-wrap {
  display: grid;
  grid-template-columns: minmax(0, 340px) 1fr;
  gap: 14px;
  align-items: center;
  justify-items: center;
}
.tyr-radar { width: 100%; max-width: 340px; height: auto; }
.tyr-radar-ring {
  fill: none;
  stroke: var(--tyr-line);
  stroke-width: 1;
}
.tyr-radar-axis-line {
  stroke: var(--tyr-line-soft);
  stroke-width: 1;
}
.tyr-radar-poly {
  stroke-width: 1.5;
  fill-opacity: 1;
}
.tyr-radar-label {
  font-size: 11px;
  fill: var(--tyr-ink-soft);
  font-weight: 700;
}
.tyr-radar-legend {
  display: flex; flex-direction: column; gap: 8px;
  justify-self: stretch;
}
.tyr-radar-legend-item {
  display: flex; align-items: baseline; gap: 6px;
  font-size: 11px;
  border: 1px dashed var(--tyr-line);
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.45);
}
.tyr-radar-legend-label { font-weight: 700; color: var(--tyr-ink); }
.tyr-radar-legend-val { color: var(--tyr-ink-faint); font-size: 10px; }

/* ---------- 十六神分布总表 ---------- */
.tyr-godstable-card { padding: 10px 12px; }
.tyr-table-wrap { overflow-x: auto; }
.tyr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.tyr-table th, .tyr-table td {
  border: 1px solid var(--tyr-line);
  padding: 4px 6px;
  text-align: center;
  vertical-align: middle;
  color: var(--tyr-ink-soft);
}
.tyr-table thead th {
  background: var(--tyr-line-soft);
  font-weight: 700;
  color: var(--tyr-ink);
  letter-spacing: 1px;
}
.tyr-table-rowhead {
  background: var(--tyr-line-soft);
  font-weight: 700;
  color: var(--tyr-ink);
  white-space: nowrap;
}
.tyr-cell-highlight { font-weight: 700; color: var(--tyr-accent); }
.tyr-mark {
  display: inline-block;
  font-size: 10px;
  padding: 0 7px;
  border-radius: 2px;
  letter-spacing: 1px;
  white-space: nowrap;
}
.tyr-mark-ji { background: rgba(74, 124, 89, 0.14); color: var(--tyr-green); border: 1px solid rgba(74, 124, 89, 0.35); }
.tyr-mark-xiong { background: rgba(140, 47, 38, 0.10); color: var(--tyr-accent); border: 1px solid rgba(140, 47, 38, 0.35); }
.tyr-mark-zhong { background: rgba(138, 130, 114, 0.14); color: var(--tyr-ink-faint); border: 1px solid rgba(138, 130, 114, 0.35); }

/* ---------- AI 章节 ---------- */
.tyr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--tyr-line-soft);
  padding-bottom: 8px;
}
.tyr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--tyr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.tyr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--tyr-ink-soft); }

.tyr-md :deep(p) { margin: 0 0 0.7em; }
.tyr-md :deep(p:last-child) { margin-bottom: 0; }
.tyr-md :deep(strong) { color: var(--tyr-ink); font-weight: 700; }
.tyr-md :deep(ul), .tyr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.tyr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.tyr-md { overflow-x: auto; }
.tyr-md :deep(.tyr-pending), .tyr-pending { color: var(--tyr-ink-faint); font-style: italic; }

.tyr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--tyr-ink-faint); letter-spacing: 1px;
}
.tyr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--tyr-accent);
  animation: tyr-pulse 1s ease-in-out infinite;
}
@keyframes tyr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.tyr-error { margin-top: 14px; text-align: center; color: var(--tyr-accent); font-size: 12px; }
.tyr-retry {
  margin-top: 8px;
  border: 1px solid var(--tyr-accent);
  background: transparent;
  color: var(--tyr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.tyr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.tyr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--tyr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.tyr-foot-note { font-size: 10px; color: var(--tyr-ink-faint); }
.tyr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .tyr-row-top { grid-template-columns: 1fr; }
  .tyr-pans { grid-template-columns: 1fr; }
  .tyr-radar-wrap { grid-template-columns: 1fr; }
}

.tyr-pan, .tyr-ai, .tyr-palace-grid, .tyr-radar-wrap, .tyr-table-wrap { min-width: 0; }

@media (max-width: 720px) {
  .tyr { padding: 8px; }
  .tyr-sheet { padding: 16px 12px; }
  .tyr-ai-row { grid-template-columns: 1fr; }
  .tyr-title { font-size: 21px; letter-spacing: 2px; }
  .tyr-core-grid { grid-template-columns: repeat(2, 1fr); }
  .tyr-pillars-grid { grid-template-columns: repeat(2, 1fr); }

  /* 九宫盘：保住 3x3 结构 */
  .tyr-pan { padding: 8px; }
  .tyr-palace-grid { grid-template-rows: repeat(3, minmax(72px, auto)); }
  .tyr-palace { padding: 3px 4px; gap: 2px; }
  .tyr-god { font-size: 10px; padding: 0 3px; }

  /* 十六神总表：表格给最小宽度，容器滚动 */
  .tyr-table { min-width: 520px; }
}
</style>
