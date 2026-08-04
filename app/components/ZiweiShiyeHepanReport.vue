<template>
  <div class="zsr">
    <div class="zsr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="zsr-head">
        <div class="zsr-head-top">
          <div class="zsr-brand">
            <div class="zsr-seal">{{ $t('ziweiShiyeHepan.report.seal') }}</div>
            <span class="zsr-brand-name">{{ $t('ziweiShiyeHepan.report.brandName') }}</span>
          </div>
          <div class="zsr-head-right">
            <span class="zsr-time">{{ $t('ziweiShiyeHepan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="zsr-rating">{{ $t('ziweiShiyeHepan.report.rating') }}</span>
            <span class="zsr-verdict">✓ {{ $t('ziweiShiyeHepan.report.verdict') }}</span>
          </div>
        </div>

        <h1 class="zsr-title">{{ titleText }}</h1>
        <p class="zsr-subtitle">{{ subtitleText }}</p>

        <div class="zsr-head-bottom">
          <p class="zsr-meta-line">{{ pairMetaLine }}</p>
        </div>
      </header>

      <!-- ============ 双人档案条 ============ -->
      <section class="zsr-row zsr-row-profiles">
        <div class="zsr-card zsr-person">
          <div class="zsr-person-head">
            <span class="zsr-person-role">{{ labelA }}</span>
            <span class="zsr-person-name">{{ nameA || labelA }}</span>
            <span class="zsr-person-gender">{{ genderAText }}</span>
          </div>
          <div class="zsr-person-ming">
            <span class="zsr-person-ming-label">{{ $t('zwds.mingGong') }}</span>
            <span class="zsr-person-ming-value">{{ chartA.mingGong.zhi }} · {{ chartA.mingGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
          </div>
          <div class="zsr-person-meta">
            {{ $t('ziweiShiyeHepan.report.personMeta', { ju: chartA.wuxingJu, year: chartA.yearGan + chartA.yearZhi }) }}
          </div>
        </div>

        <div class="zsr-person-vs">×</div>

        <div class="zsr-card zsr-person">
          <div class="zsr-person-head">
            <span class="zsr-person-role">{{ labelB }}</span>
            <span class="zsr-person-name">{{ nameB || labelB }}</span>
            <span class="zsr-person-gender">{{ genderBText }}</span>
          </div>
          <div class="zsr-person-ming">
            <span class="zsr-person-ming-label">{{ $t('zwds.mingGong') }}</span>
            <span class="zsr-person-ming-value">{{ chartB.mingGong.zhi }} · {{ chartB.mingGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
          </div>
          <div class="zsr-person-meta">
            {{ $t('ziweiShiyeHepan.report.personMeta', { ju: chartB.wuxingJu, year: chartB.yearGan + chartB.yearZhi }) }}
          </div>
        </div>
      </section>

      <!-- ============ 核心可视化：雷达图 + 宫位星曜能量 ============ -->
      <section class="zsr-section">
        <h3 class="zsr-section-title">{{ $t('ziweiShiyeHepan.report.visualTitle') }}</h3>
        <div class="zsr-row zsr-row-charts">
          <!-- 关系维度雷达图 -->
          <div class="zsr-card zsr-chart">
            <h4 class="zsr-chart-title">{{ $t('ziweiShiyeHepan.report.radarTitle') }}</h4>
            <div v-if="radarScores" class="zsr-radar-wrap">
              <svg viewBox="0 0 200 200" class="zsr-radar">
                <polygon
                  v-for="ring in [1, 0.66, 0.33]"
                  :key="ring"
                  :points="radarRingPoints(ring)"
                  fill="none"
                  stroke="#d8d0bd"
                  stroke-width="1"
                  class="zsr-radar-grid"
                />
                <line
                  v-for="(p, i) in radarAxisEndpoints"
                  :key="i"
                  x1="100"
                  y1="100"
                  :x2="p.x"
                  :y2="p.y"
                  stroke="#e6dfcd"
                  stroke-width="1"
                  class="zsr-radar-axis"
                />
                <polygon
                  :points="radarDataPoints"
                  fill="rgba(168, 81, 46, 0.18)"
                  stroke="#a8512e"
                  stroke-width="1.5"
                  class="zsr-radar-data"
                />
                <circle
                  v-for="(p, i) in radarDataVertexes"
                  :key="i"
                  :cx="p.x"
                  :cy="p.y"
                  r="2.4"
                  fill="#8c2f26"
                  class="zsr-radar-vertex"
                />
                <text
                  v-for="(l, i) in radarLabels"
                  :key="i"
                  :x="l.x"
                  :y="l.y"
                  fill="#55503f"
                  class="zsr-radar-label"
                  :text-anchor="l.anchor"
                >{{ l.text }}</text>
              </svg>
            </div>
            <div v-else class="zsr-radar-pending">
              <span class="zsr-pending">{{ pendingText }}</span>
            </div>
            <div v-if="radarScores" class="zsr-radar-scores">
              <div v-for="d in radarDims" :key="d.key" class="zsr-radar-score-row">
                <span class="zsr-radar-score-name">{{ d.label }}</span>
                <span class="zsr-radar-score-bar-wrap">
                  <span
                    class="zsr-radar-score-bar"
                    :class="{ 'zsr-radar-score-risk': d.key === 'risk' }"
                    :style="{ width: radarScores[d.key] + '%' }"
                  />
                </span>
                <span class="zsr-radar-score-val">{{ radarScores[d.key] }}</span>
              </div>
            </div>
          </div>

          <!-- 宫位星曜能量柱状图 -->
          <div class="zsr-card zsr-chart">
            <h4 class="zsr-chart-title">{{ $t('ziweiShiyeHepan.report.gongBarTitle') }}</h4>
            <div class="zsr-gongbar">
              <div v-for="g in gongEnergy" :key="g.name" class="zsr-gongbar-row">
                <span class="zsr-gongbar-name">{{ g.label }}</span>
                <div class="zsr-gongbar-bars">
                  <div class="zsr-gongbar-line">
                    <span class="zsr-gongbar-bar zsr-gongbar-bar-a" :style="{ width: g.aPct + '%' }" />
                    <span class="zsr-gongbar-val">{{ g.a }}</span>
                  </div>
                  <div class="zsr-gongbar-line">
                    <span class="zsr-gongbar-bar zsr-gongbar-bar-b" :style="{ width: g.bPct + '%' }" />
                    <span class="zsr-gongbar-val">{{ g.b }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="zsr-gongbar-legend">
              <span class="zsr-gongbar-lg"><i class="zsr-gongbar-lg-swatch zsr-gongbar-bar-a" />{{ nameA || labelA }}</span>
              <span class="zsr-gongbar-lg"><i class="zsr-gongbar-lg-swatch zsr-gongbar-bar-b" />{{ nameB || labelB }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 关键宫位对比表 ============ -->
      <section class="zsr-section">
        <h3 class="zsr-section-title">{{ $t('ziweiShiyeHepan.report.gongTableTitle') }}</h3>
        <div class="zsr-card zsr-table-card">
          <table class="zsr-table">
            <thead>
              <tr>
                <th>{{ $t('ziweiShiyeHepan.report.colGong') }}</th>
                <th>{{ nameA || labelA }}</th>
                <th>{{ nameB || labelB }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in gongTable" :key="row.key">
                <td class="zsr-table-gong">{{ row.label }}</td>
                <td>{{ row.a }}</td>
                <td>{{ row.b }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ 大限同步对比条 ============ -->
      <section class="zsr-section">
        <div class="zsr-card">
          <h4 class="zsr-pan-title">{{ $t('ziweiShiyeHepan.report.daxianTitle') }}</h4>
          <div class="zsr-sync">
            <div class="zsr-sync-row">
              <div class="zsr-sync-name">{{ nameA || labelA }}</div>
              <div class="zsr-daxian-row">
                <div
                  v-for="d in chartA.daXians"
                  :key="d.index"
                  class="zsr-daxian-item"
                  :class="{ 'zsr-daxian-current': d === chartA.currentDaXian }"
                >
                  <span class="zsr-daxian-gong">{{ d.gongName }}</span>
                  <span class="zsr-daxian-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>
            <div class="zsr-sync-row">
              <div class="zsr-sync-name">{{ nameB || labelB }}</div>
              <div class="zsr-daxian-row">
                <div
                  v-for="d in chartB.daXians"
                  :key="d.index"
                  class="zsr-daxian-item"
                  :class="{ 'zsr-daxian-current': d === chartB.currentDaXian }"
                >
                  <span class="zsr-daxian-gong">{{ d.gongName }}</span>
                  <span class="zsr-daxian-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="zsr-sync-legend">
            <span class="zsr-daxian-current-demo" />{{ $t('ziweiShiyeHepan.report.currentDaxianLabel') }}
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="zsr-row zsr-ai-row">
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">01</span>{{ $t('ziweiShiyeHepan.report.secOverview') }}</h3>
          <div class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['合伙总论'])" />
        </div>
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">02</span>{{ $t('ziweiShiyeHepan.report.secMingGong') }}</h3>
          <div class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['命宫互动：谁主谁辅'])" />
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="zsr-row zsr-ai-row">
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">03</span>{{ $t('ziweiShiyeHepan.report.secShiye') }}</h3>
          <div class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['事业宫对照：搞钱模式合不合'])" />
        </div>
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">04</span>{{ $t('ziweiShiyeHepan.report.secCaibo') }}</h3>
          <div class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['财帛宫互补：资源与分账'])" />
        </div>
      </section>

      <!-- ============ AI 章节 05-06 ============ -->
      <section class="zsr-row zsr-ai-row">
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">05</span>{{ $t('ziweiShiyeHepan.report.secQianyi') }}</h3>
          <div class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['迁移宫与交友宫：外拓与贵人'])" />
        </div>
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">06</span>{{ $t('ziweiShiyeHepan.report.secSihua') }}</h3>
          <div class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['四化飞星关系'])" />
        </div>
      </section>

      <!-- ============ AI 章节 07 ============ -->
      <section class="zsr-section">
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">07</span>{{ $t('ziweiShiyeHepan.report.secDaxianSync') }}</h3>
          <div class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['大限同步性'])" />
        </div>
      </section>

      <!-- ============ AI 章节 08 合伙建议 ============ -->
      <section class="zsr-section">
        <div class="zsr-card zsr-ai">
          <h3 class="zsr-ai-title"><span class="zsr-ai-no">08</span>{{ $t('ziweiShiyeHepan.report.secAdvice') }}</h3>
          <div v-if="adviceList.length" class="zsr-advice">
            <div v-for="(a, i) in adviceList" :key="i" class="zsr-advice-item">
              <span class="zsr-advice-num">{{ i + 1 }}</span>
              <div class="zsr-advice-text">
                <div v-if="a.title" class="zsr-advice-head">{{ a.title }}</div>
                <div class="zsr-advice-desc">{{ a.desc }}</div>
              </div>
            </div>
          </div>
          <div v-else class="zsr-ai-body zsr-md" v-html="renderSection(aiSections['合伙建议'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="zsr-streaming">
        <span class="zsr-streaming-dot" />
        {{ $t('ziweiShiyeHepan.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="zsr-error">
        <p>{{ error }}</p>
        <button type="button" class="zsr-retry" @click="$emit('retry')">{{ $t('ziweiShiyeHepan.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="zsr-foot">
        <span class="zsr-foot-note">ⓘ {{ $t('ziweiShiyeHepan.report.footerNote') }}</span>
        <span class="zsr-seal zsr-seal-foot">{{ $t('ziweiShiyeHepan.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { ZwdsChart, GongName } from '~/types/zwds'

interface Props {
  chartA: ZwdsChart
  chartB: ZwdsChart
  aiContent: string
  streaming: boolean
  error: string | null
  nameA?: string
  nameB?: string
  labelA: string
  labelB: string
  genderA: 'male' | 'female'
  genderB: 'male' | 'female'
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

const genderAText = computed(() => props.genderA === 'male' ? t('common.male') : t('common.female'))
const genderBText = computed(() => props.genderB === 'male' ? t('common.male') : t('common.female'))

const titleText = computed(() => t('ziweiShiyeHepan.report.title', {
  a: props.nameA || props.labelA,
  b: props.nameB || props.labelB,
}))

const pairMetaLine = computed(() => t('ziweiShiyeHepan.report.pairMeta', {
  a: props.nameA || props.labelA,
  mingA: props.chartA.mingGong.zhi,
  b: props.nameB || props.labelB,
  mingB: props.chartB.mingGong.zhi,
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
  return map
})

const pendingText = computed(() => t('ziweiShiyeHepan.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="zsr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}

/** 报告副标题：取总论首句 */
const subtitleText = computed(() => {
  const c = aiSections.value['合伙总论'] ?? ''
  const plain = c
    .replace(/[#*]/g, '')
    .split('\n')
    .filter(l => !/^\s*[-*•]\s*(理念契合|目标同频|资源互补|执行协同|分账风险)\s*[：:]/.test(l))
    .join('，')
    .trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').replace(/^[，,、\s]+/, '').trim()
  return first
    ? first.slice(0, 48)
    : t('ziweiShiyeHepan.report.subtitleFallback')
})

/* ---------- 雷达图评分解析 ---------- */

interface RadarScores { idea: number; goal: number; resource: number; execution: number; risk: number }

const radarDims = computed(() => [
  { key: 'idea' as const, label: t('ziweiShiyeHepan.report.dimIdea') },
  { key: 'goal' as const, label: t('ziweiShiyeHepan.report.dimGoal') },
  { key: 'resource' as const, label: t('ziweiShiyeHepan.report.dimResource') },
  { key: 'execution' as const, label: t('ziweiShiyeHepan.report.dimExecution') },
  { key: 'risk' as const, label: t('ziweiShiyeHepan.report.dimRisk') },
])

const DIM_PATTERNS: { key: keyof RadarScores; re: RegExp }[] = [
  { key: 'idea', re: /理念契合|理念|idea|vision/i },
  { key: 'goal', re: /目标同频|目标|goal/i },
  { key: 'resource', re: /资源互补|资源|resource/i },
  { key: 'execution', re: /执行协同|执行|execution/i },
  { key: 'risk', re: /分账风险|分账|风险|risk|conflict/i },
]

const radarScores = computed<RadarScores | null>(() => {
  const c = aiSections.value['合伙总论'] ?? ''
  if (!c) return null
  const found: Partial<RadarScores> = {}
  for (const line of c.split('\n')) {
    const m = line.replace(/^[-*•]\s*/, '').match(/^(.{1,8}?)\s*[：:]\s*(\d{1,3})\s*$/)
    if (!m) continue
    const label = m[1]!
    const val = Math.max(0, Math.min(100, Number(m[2])))
    const dim = DIM_PATTERNS.find(d => d.re.test(label))
    if (dim && !(dim.key in found)) found[dim.key] = val
  }
  if (Object.keys(found).length < 5) return null
  return found as RadarScores
})

/* ---------- 雷达图 SVG 几何 ---------- */

const RADAR_CENTER = 100
const RADAR_RADIUS = 72
const RADAR_COUNT = 5

function radarAngle(i: number): number {
  return (Math.PI * 2 * i) / RADAR_COUNT - Math.PI / 2
}

function radarPoint(i: number, ratio: number): { x: number; y: number } {
  const a = radarAngle(i)
  return {
    x: RADAR_CENTER + RADAR_RADIUS * ratio * Math.cos(a),
    y: RADAR_CENTER + RADAR_RADIUS * ratio * Math.sin(a),
  }
}

function fmt(n: number): string {
  return n.toFixed(1)
}

function radarRingPoints(ratio: number): string {
  return Array.from({ length: RADAR_COUNT }, (_, i) => {
    const p = radarPoint(i, ratio)
    return `${fmt(p.x)},${fmt(p.y)}`
  }).join(' ')
}

const radarAxisEndpoints = computed(() =>
  Array.from({ length: RADAR_COUNT }, (_, i) => radarPoint(i, 1)))

const radarDataPoints = computed(() => {
  const s = radarScores.value
  if (!s) return ''
  const vals = [s.idea, s.goal, s.resource, s.execution, s.risk]
  return vals.map((v, i) => {
    const p = radarPoint(i, v / 100)
    return `${fmt(p.x)},${fmt(p.y)}`
  }).join(' ')
})

const radarDataVertexes = computed(() => {
  const s = radarScores.value
  if (!s) return []
  const vals = [s.idea, s.goal, s.resource, s.execution, s.risk]
  return vals.map((v, i) => radarPoint(i, v / 100))
})

const radarLabels = computed(() => {
  return radarDims.value.map((d, i) => {
    const p = radarPoint(i, 1.18)
    const angle = radarAngle(i)
    const cos = Math.cos(angle)
    let anchor: 'start' | 'middle' | 'end' = 'middle'
    if (cos > 0.3) anchor = 'start'
    else if (cos < -0.3) anchor = 'end'
    return { text: d.label, x: p.x, y: p.y, anchor }
  })
})

/* ---------- 关键宫位对比 ---------- */

const KEY_GONGS: { key: GongName; labelKey: string }[] = [
  { key: '命宫', labelKey: 'gongMing' },
  { key: '事业', labelKey: 'gongShiye' },
  { key: '财帛', labelKey: 'gongCaibo' },
  { key: '迁移', labelKey: 'gongQianyi' },
  { key: '交友', labelKey: 'gongJiaoyou' },
]

function gongOf(chart: ZwdsChart, name: GongName) {
  return chart.gongs.find(g => g.name === name)
}

function gongStars(chart: ZwdsChart, name: GongName): string {
  const g = gongOf(chart, name)
  if (!g) return t('common.unknown')
  const stars = g.mainStars.join('、') || t('zwds.borrowPalace')
  return `${g.zhi} · ${stars}`
}

function gongStarCount(chart: ZwdsChart, name: GongName): number {
  const g = gongOf(chart, name)
  if (!g) return 0
  return g.mainStars.length + g.auxStars.length
}

const gongTable = computed(() =>
  KEY_GONGS.map(g => ({
    key: g.key,
    label: t(`ziweiShiyeHepan.report.${g.labelKey}`),
    a: gongStars(props.chartA, g.key),
    b: gongStars(props.chartB, g.key),
  })))

const gongEnergy = computed(() => {
  const rows = KEY_GONGS.map(g => ({
    name: g.key,
    label: t(`ziweiShiyeHepan.report.${g.labelKey}`),
    a: gongStarCount(props.chartA, g.key),
    b: gongStarCount(props.chartB, g.key),
  }))
  const max = Math.max(1, ...rows.map(r => Math.max(r.a, r.b)))
  return rows.map(r => ({
    ...r,
    aPct: Math.round((r.a / max) * 100),
    bPct: Math.round((r.b / max) * 100),
  }))
})

/* ---------- 合伙建议解析 ---------- */

const adviceList = computed<{ title: string; desc: string }[]>(() => {
  const content = aiSections.value['合伙建议'] ?? ''
  if (!content) return []
  return content
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+[.、)]\s*/, '').trim())
    .filter(Boolean)
    .map(l => {
      const stripped = l.replace(/\*\*/g, '')
      const m = stripped.match(/^(.{1,20}?)[：:](.+)$/)
      return m ? { title: m[1]!.trim(), desc: m[2]!.trim() } : { title: '', desc: stripped }
    })
    .slice(0, 6)
})
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.zsr {
  --zsr-bg: #f2ede3;
  --zsr-sheet: #faf6ec;
  --zsr-card: #fffdf6;
  --zsr-ink: #2e2a24;
  --zsr-ink-soft: #55503f;
  --zsr-ink-faint: #8a8272;
  --zsr-line: #d8d0bd;
  --zsr-line-soft: #e6dfcd;
  --zsr-accent: #8c2f26;
  --zsr-accent-soft: #a8512e;
  --zsr-star: #8c6d1f;
  --zsr-green: #4a7c59;
  --zsr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--zsr-bg);
  padding: 18px;
  color: var(--zsr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.zsr-sheet {
  background: var(--zsr-sheet);
  border: 1px solid var(--zsr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.zsr-head { border-bottom: 2px solid var(--zsr-ink); padding-bottom: 16px; }
.zsr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.zsr-brand { display: flex; align-items: center; gap: 8px; }
.zsr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--zsr-accent);
  color: var(--zsr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.zsr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--zsr-ink-soft); }
.zsr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--zsr-ink-faint); }
.zsr-verdict { color: var(--zsr-green); font-weight: 600; }
.zsr-rating { letter-spacing: 1px; }

.zsr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.zsr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--zsr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.zsr-head-bottom { text-align: center; }
.zsr-meta-line { margin: 2px 0; font-size: 12px; color: var(--zsr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.zsr-row { display: grid; gap: 14px; margin-top: 16px; }
.zsr-row-profiles { grid-template-columns: 1fr auto 1fr; align-items: stretch; }
.zsr-row-charts { grid-template-columns: 1fr 1.1fr; }
.zsr-ai-row { grid-template-columns: 1fr 1fr; }
.zsr-section { margin-top: 16px; }

.zsr-card {
  background: var(--zsr-card);
  border: 1px solid var(--zsr-line);
  padding: 14px 16px;
}
.zsr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 双人档案条 ---------- */
.zsr-person { display: flex; flex-direction: column; gap: 10px; }
.zsr-person-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.zsr-person-role {
  font-size: 10px; letter-spacing: 1px;
  border: 1px solid var(--zsr-accent); color: var(--zsr-accent);
  padding: 1px 6px; border-radius: 2px;
}
.zsr-person-name { font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.zsr-person-gender { font-size: 11px; color: var(--zsr-ink-faint); }
.zsr-person-ming {
  display: flex; flex-direction: column; gap: 3px;
  border: 1px solid var(--zsr-line-soft);
  padding: 8px 10px;
  background: rgba(140, 47, 38, 0.03);
}
.zsr-person-ming-label { font-size: 9px; color: var(--zsr-ink-faint); letter-spacing: 1px; }
.zsr-person-ming-value { font-size: 14px; font-weight: 700; color: var(--zsr-accent); letter-spacing: 0.5px; }
.zsr-person-meta { font-size: 11px; color: var(--zsr-ink-faint); line-height: 1.5; }
.zsr-person-vs {
  align-self: center;
  font-size: 22px; font-weight: 700;
  color: var(--zsr-accent-soft);
}

/* ---------- 图表白卡 ---------- */
.zsr-chart { display: flex; flex-direction: column; }
.zsr-chart-title {
  margin: 0 0 12px;
  font-size: 13px; font-weight: 700;
  letter-spacing: 1px; text-align: center;
  border-bottom: 1px solid var(--zsr-line-soft);
  padding-bottom: 8px;
}

/* ---------- 宫位星曜能量柱状图 ---------- */
.zsr-gongbar { display: flex; flex-direction: column; gap: 10px; }
.zsr-gongbar-row { display: flex; align-items: center; gap: 8px; }
.zsr-gongbar-name { width: 30px; font-size: 12px; font-weight: 700; color: var(--zsr-ink-soft); flex-shrink: 0; }
.zsr-gongbar-bars { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.zsr-gongbar-line { display: flex; align-items: center; gap: 5px; }
.zsr-gongbar-bar { display: block; height: 7px; min-width: 2px; }
.zsr-gongbar-bar-a { background: var(--zsr-accent-soft); }
.zsr-gongbar-bar-b { background: var(--zsr-blue); }
.zsr-gongbar-val { font-size: 9px; color: var(--zsr-ink-faint); width: 18px; flex-shrink: 0; }
.zsr-gongbar-legend {
  display: flex; gap: 16px; justify-content: center;
  margin-top: 12px; padding-top: 10px;
  border-top: 1px dashed var(--zsr-line-soft);
}
.zsr-gongbar-lg { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--zsr-ink-soft); }
.zsr-gongbar-lg-swatch { width: 12px; height: 7px; display: inline-block; }

/* ---------- 雷达图 ---------- */
.zsr-radar-wrap { display: flex; justify-content: center; }
.zsr-radar { width: 100%; max-width: 240px; height: auto; }
/* 填充/描边用内联 SVG 属性写在模板上（html-to-image 截图克隆不套用 scoped CSS，
   只依赖 CSS 的 fill/stroke 会在分享图里退成默认黑色实心块）。这里只保留布局规则。 */
.zsr-radar-label { font-size: 9px; letter-spacing: 0.5px; }
.zsr-radar-pending {
  display: flex; align-items: center; justify-content: center;
  min-height: 180px;
}
.zsr-radar-scores { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
.zsr-radar-score-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.zsr-radar-score-name { width: 56px; color: var(--zsr-ink-soft); flex-shrink: 0; }
.zsr-radar-score-bar-wrap { flex: 1; height: 6px; background: var(--zsr-line-soft); }
.zsr-radar-score-bar { display: block; height: 100%; background: var(--zsr-green); }
.zsr-radar-score-risk { background: var(--zsr-accent); }
.zsr-radar-score-val { width: 24px; text-align: right; color: var(--zsr-ink-faint); flex-shrink: 0; }

/* ---------- 宫位对比表 ---------- */
.zsr-table-card { padding: 6px 8px; overflow-x: auto; }
.zsr-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.zsr-table th, .zsr-table td {
  border: 1px solid var(--zsr-line-soft);
  padding: 8px 10px;
  text-align: center;
  color: var(--zsr-ink-soft);
  line-height: 1.5;
}
.zsr-table thead th {
  background: rgba(140, 47, 38, 0.05);
  color: var(--zsr-ink);
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 12.5px;
}
.zsr-table-gong {
  font-weight: 700;
  color: var(--zsr-accent) !important;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* ---------- 大限同步对比条 ---------- */
.zsr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.zsr-sync { display: flex; flex-direction: column; gap: 12px; }
.zsr-sync-row { display: flex; flex-direction: column; gap: 5px; }
.zsr-sync-name { font-size: 11px; font-weight: 700; color: var(--zsr-ink-soft); letter-spacing: 1px; }
.zsr-daxian-row { display: flex; gap: 2px; overflow-x: auto; }
.zsr-daxian-item {
  flex: 1; min-width: 46px;
  border: 1px solid var(--zsr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.zsr-daxian-current { border-color: var(--zsr-accent); background: rgba(140, 47, 38, 0.05); }
.zsr-daxian-gong { font-size: 12px; font-weight: 700; }
.zsr-daxian-age { font-size: 8px; color: var(--zsr-ink-faint); }
.zsr-sync-legend {
  display: flex; align-items: center; gap: 6px;
  margin-top: 10px; font-size: 10px; color: var(--zsr-ink-faint);
}
.zsr-daxian-current-demo {
  width: 14px; height: 12px;
  border: 1px solid var(--zsr-accent);
  background: rgba(140, 47, 38, 0.05);
  display: inline-block;
}

/* ---------- AI 章节 ---------- */
.zsr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--zsr-line-soft);
  padding-bottom: 8px;
}
.zsr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--zsr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.zsr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--zsr-ink-soft); }

.zsr-md :deep(p) { margin: 0 0 0.7em; }
.zsr-md :deep(p:last-child) { margin-bottom: 0; }
.zsr-md :deep(strong) { color: var(--zsr-ink); font-weight: 700; }
.zsr-md :deep(ul), .zsr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.zsr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.zsr-md :deep(h3), .zsr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--zsr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.zsr-md { overflow-x: auto; }
.zsr-md :deep(.zsr-pending), .zsr-pending { color: var(--zsr-ink-faint); font-style: italic; }

/* ---------- 合伙建议 ---------- */
.zsr-advice { display: flex; flex-direction: column; gap: 10px; }
.zsr-advice-item { display: flex; gap: 9px; align-items: flex-start; }
.zsr-advice-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--zsr-ink); color: #f5efe0;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.zsr-advice-head { font-size: 12.5px; font-weight: 700; color: var(--zsr-ink); }
.zsr-advice-desc { font-size: 12px; color: var(--zsr-ink-soft); line-height: 1.7; margin-top: 1px; }

.zsr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--zsr-ink-faint); letter-spacing: 1px;
}
.zsr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--zsr-accent);
  animation: zsr-pulse 1s ease-in-out infinite;
}
@keyframes zsr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.zsr-error { margin-top: 14px; text-align: center; color: var(--zsr-accent); font-size: 12px; }
.zsr-retry {
  margin-top: 8px;
  border: 1px solid var(--zsr-accent);
  background: transparent;
  color: var(--zsr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.zsr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.zsr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--zsr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.zsr-foot-note { font-size: 10px; color: var(--zsr-ink-faint); }
.zsr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.zsr-card, .zsr-ai, .zsr-chart, .zsr-sync, .zsr-daxian-row, .zsr-person, .zsr-table-card { min-width: 0; }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .zsr-row-charts { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .zsr { padding: 8px; }
  .zsr-sheet { padding: 16px 12px; }
  .zsr-row-profiles { grid-template-columns: 1fr; }
  .zsr-person-vs { display: none; }
  .zsr-ai-row { grid-template-columns: 1fr; }
  .zsr-title { font-size: 20px; letter-spacing: 2px; }

  /* 大限：允许横向滚动，不被压缩 */
  .zsr-daxian-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .zsr-daxian-item { flex: 0 0 auto; min-width: 50px; }
}
</style>
