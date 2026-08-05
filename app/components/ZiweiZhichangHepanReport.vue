<template>
  <div class="zzr">
    <div class="zzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="zzr-head">
        <div class="zzr-head-top">
          <div class="zzr-brand">
            <div class="zzr-seal">{{ $t('ziweiZhichangHepan.report.seal') }}</div>
            <span class="zzr-brand-name">{{ $t('ziweiZhichangHepan.report.brandName') }}</span>
          </div>
          <div class="zzr-head-right">
            <span class="zzr-time">{{ $t('ziweiZhichangHepan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="zzr-rating">{{ $t('ziweiZhichangHepan.report.rating') }}</span>
            <span class="zzr-verdict">✓ {{ $t('ziweiZhichangHepan.report.verdict') }}</span>
          </div>
        </div>

        <h1 class="zzr-title">{{ titleText }}</h1>
        <p class="zzr-subtitle">{{ subtitleText }}</p>

        <div class="zzr-head-bottom">
          <p class="zzr-meta-line">{{ pairMetaLine }}</p>
        </div>
      </header>

      <!-- ============ 双人档案条 ============ -->
      <section class="zzr-row zzr-row-profiles">
        <div class="zzr-card zzr-person">
          <div class="zzr-person-head">
            <span class="zzr-person-role">{{ labelA }}</span>
            <span class="zzr-person-name">{{ nameA || labelA }}</span>
            <span class="zzr-person-gender">{{ genderAText }}</span>
          </div>
          <div class="zzr-person-ming">
            <span class="zzr-person-ming-label">{{ $t('zwds.mingGong') }}</span>
            <span class="zzr-person-ming-value">{{ chartA.mingGong.zhi }} · {{ chartA.mingGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
          </div>
          <div class="zzr-person-meta">
            {{ $t('ziweiZhichangHepan.report.personMeta', { ju: chartA.wuxingJu, year: chartA.yearGan + chartA.yearZhi }) }}
          </div>
        </div>

        <div class="zzr-person-vs">×</div>

        <div class="zzr-card zzr-person">
          <div class="zzr-person-head">
            <span class="zzr-person-role">{{ labelB }}</span>
            <span class="zzr-person-name">{{ nameB || labelB }}</span>
            <span class="zzr-person-gender">{{ genderBText }}</span>
          </div>
          <div class="zzr-person-ming">
            <span class="zzr-person-ming-label">{{ $t('zwds.mingGong') }}</span>
            <span class="zzr-person-ming-value">{{ chartB.mingGong.zhi }} · {{ chartB.mingGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
          </div>
          <div class="zzr-person-meta">
            {{ $t('ziweiZhichangHepan.report.personMeta', { ju: chartB.wuxingJu, year: chartB.yearGan + chartB.yearZhi }) }}
          </div>
        </div>
      </section>

      <!-- ============ 核心可视化：雷达图 + 宫位星曜能量 ============ -->
      <section class="zzr-section">
        <h3 class="zzr-section-title">{{ $t('ziweiZhichangHepan.report.visualTitle') }}</h3>
        <div class="zzr-row zzr-row-charts">
          <!-- 关系维度雷达图 -->
          <div class="zzr-card zzr-chart">
            <h4 class="zzr-chart-title">{{ $t('ziweiZhichangHepan.report.radarTitle') }}</h4>
            <div v-if="radarScores" class="zzr-radar-wrap">
              <svg viewBox="0 0 200 200" class="zzr-radar">
                <polygon
                  v-for="ring in [1, 0.66, 0.33]"
                  :key="ring"
                  :points="radarRingPoints(ring)"
                  fill="none"
                  stroke="#d8d0bd"
                  stroke-width="1"
                  class="zzr-radar-grid"
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
                  class="zzr-radar-axis"
                />
                <polygon
                  :points="radarDataPoints"
                  fill="rgba(168, 81, 46, 0.18)"
                  stroke="#a8512e"
                  stroke-width="1.5"
                  class="zzr-radar-data"
                />
                <circle
                  v-for="(p, i) in radarDataVertexes"
                  :key="i"
                  :cx="p.x"
                  :cy="p.y"
                  r="2.4"
                  fill="#8c2f26"
                  class="zzr-radar-vertex"
                />
                <text
                  v-for="(l, i) in radarLabels"
                  :key="i"
                  :x="l.x"
                  :y="l.y"
                  fill="#55503f"
                  class="zzr-radar-label"
                  :text-anchor="l.anchor"
                >{{ l.text }}</text>
              </svg>
            </div>
            <div v-else class="zzr-radar-pending">
              <span class="zzr-pending">{{ pendingText }}</span>
            </div>
            <div v-if="radarScores" class="zzr-radar-scores">
              <div v-for="d in radarDims" :key="d.key" class="zzr-radar-score-row">
                <span class="zzr-radar-score-name">{{ d.label }}</span>
                <span class="zzr-radar-score-bar-wrap">
                  <span
                    class="zzr-radar-score-bar"
                    :class="{ 'zzr-radar-score-risk': d.key === 'risk' }"
                    :style="{ width: radarScores[d.key] + '%' }"
                  />
                </span>
                <span class="zzr-radar-score-val">{{ radarScores[d.key] }}</span>
              </div>
            </div>
          </div>

          <!-- 宫位星曜能量柱状图 -->
          <div class="zzr-card zzr-chart">
            <h4 class="zzr-chart-title">{{ $t('ziweiZhichangHepan.report.gongBarTitle') }}</h4>
            <div class="zzr-gongbar">
              <div v-for="g in gongEnergy" :key="g.name" class="zzr-gongbar-row">
                <span class="zzr-gongbar-name">{{ g.label }}</span>
                <div class="zzr-gongbar-bars">
                  <div class="zzr-gongbar-line">
                    <span class="zzr-gongbar-bar zzr-gongbar-bar-a" :style="{ width: g.aPct + '%' }" />
                    <span class="zzr-gongbar-val">{{ g.a }}</span>
                  </div>
                  <div class="zzr-gongbar-line">
                    <span class="zzr-gongbar-bar zzr-gongbar-bar-b" :style="{ width: g.bPct + '%' }" />
                    <span class="zzr-gongbar-val">{{ g.b }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="zzr-gongbar-legend">
              <span class="zzr-gongbar-lg"><i class="zzr-gongbar-lg-swatch zzr-gongbar-bar-a" />{{ nameA || labelA }}</span>
              <span class="zzr-gongbar-lg"><i class="zzr-gongbar-lg-swatch zzr-gongbar-bar-b" />{{ nameB || labelB }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 关键宫位对比表 ============ -->
      <section class="zzr-section">
        <h3 class="zzr-section-title">{{ $t('ziweiZhichangHepan.report.gongTableTitle') }}</h3>
        <div class="zzr-card zzr-table-card">
          <table class="zzr-table">
            <thead>
              <tr>
                <th>{{ $t('ziweiZhichangHepan.report.colGong') }}</th>
                <th>{{ nameA || labelA }}</th>
                <th>{{ nameB || labelB }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in gongTable" :key="row.key">
                <td class="zzr-table-gong">{{ row.label }}</td>
                <td>{{ row.a }}</td>
                <td>{{ row.b }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ 大限同步对比条 ============ -->
      <section class="zzr-section">
        <div class="zzr-card">
          <h4 class="zzr-pan-title">{{ $t('ziweiZhichangHepan.report.daxianTitle') }}</h4>
          <div class="zzr-sync">
            <div class="zzr-sync-row">
              <div class="zzr-sync-name">{{ nameA || labelA }}</div>
              <div class="zzr-daxian-row">
                <div
                  v-for="d in chartA.daXians"
                  :key="d.index"
                  class="zzr-daxian-item"
                  :class="{ 'zzr-daxian-current': d === chartA.currentDaXian }"
                >
                  <span class="zzr-daxian-gong">{{ d.gongName }}</span>
                  <span class="zzr-daxian-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>
            <div class="zzr-sync-row">
              <div class="zzr-sync-name">{{ nameB || labelB }}</div>
              <div class="zzr-daxian-row">
                <div
                  v-for="d in chartB.daXians"
                  :key="d.index"
                  class="zzr-daxian-item"
                  :class="{ 'zzr-daxian-current': d === chartB.currentDaXian }"
                >
                  <span class="zzr-daxian-gong">{{ d.gongName }}</span>
                  <span class="zzr-daxian-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="zzr-sync-legend">
            <span class="zzr-daxian-current-demo" />{{ $t('ziweiZhichangHepan.report.currentDaxianLabel') }}
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="zzr-row zzr-ai-row">
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">01</span>{{ $t('ziweiZhichangHepan.report.secOverview') }}</h3>
          <div class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['职场合盘总论'])" />
        </div>
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">02</span>{{ $t('ziweiZhichangHepan.report.secMingGong') }}</h3>
          <div class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['命宫互动：谁主谁辅'])" />
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="zzr-row zzr-ai-row">
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">03</span>{{ $t('ziweiZhichangHepan.report.secShiye') }}</h3>
          <div class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['事业宫对照：搞钱与升迁模式'])" />
        </div>
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">04</span>{{ $t('ziweiZhichangHepan.report.secCaibo') }}</h3>
          <div class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['财帛宫互补：资源与利益'])" />
        </div>
      </section>

      <!-- ============ AI 章节 05-06 ============ -->
      <section class="zzr-row zzr-ai-row">
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">05</span>{{ $t('ziweiZhichangHepan.report.secQianyi') }}</h3>
          <div class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['迁移宫与交友宫：对外与人脉'])" />
        </div>
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">06</span>{{ $t('ziweiZhichangHepan.report.secSihua') }}</h3>
          <div class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['四化飞星关系'])" />
        </div>
      </section>

      <!-- ============ AI 章节 07 ============ -->
      <section class="zzr-section">
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">07</span>{{ $t('ziweiZhichangHepan.report.secDaxianSync') }}</h3>
          <div class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['大限同步性'])" />
        </div>
      </section>

      <!-- ============ AI 章节 08 关系优化建议 ============ -->
      <section class="zzr-section">
        <div class="zzr-card zzr-ai">
          <h3 class="zzr-ai-title"><span class="zzr-ai-no">08</span>{{ $t('ziweiZhichangHepan.report.secAdvice') }}</h3>
          <div v-if="adviceList.length" class="zzr-advice">
            <div v-for="(a, i) in adviceList" :key="i" class="zzr-advice-item">
              <span class="zzr-advice-num">{{ i + 1 }}</span>
              <div class="zzr-advice-text">
                <div v-if="a.title" class="zzr-advice-head">{{ a.title }}</div>
                <div class="zzr-advice-desc">{{ a.desc }}</div>
              </div>
            </div>
          </div>
          <div v-else class="zzr-ai-body zzr-md" v-html="renderSection(aiSections['关系优化建议'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="zzr-streaming">
        <span class="zzr-streaming-dot" />
        {{ $t('ziweiZhichangHepan.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="zzr-error">
        <p>{{ error }}</p>
        <button type="button" class="zzr-retry" @click="$emit('retry')">{{ $t('ziweiZhichangHepan.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="zzr-foot">
        <span class="zzr-foot-note">ⓘ {{ $t('ziweiZhichangHepan.report.footerNote') }}</span>
        <span class="zzr-seal zzr-seal-foot">{{ $t('ziweiZhichangHepan.report.sealFoot') }}</span>
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

const titleText = computed(() => t('ziweiZhichangHepan.report.title', {
  a: props.nameA || props.labelA,
  b: props.nameB || props.labelB,
}))

const pairMetaLine = computed(() => t('ziweiZhichangHepan.report.pairMeta', {
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

const pendingText = computed(() => t('ziweiZhichangHepan.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="zzr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}

/** 报告副标题：取总论首句（剔除维度评分行） */
const subtitleText = computed(() => {
  const c = aiSections.value['职场合盘总论'] ?? ''
  const plain = c
    .replace(/[#*]/g, '')
    .split('\n')
    .filter(l => !/^\s*[-*•]\s*(信任契合|目标同频|沟通顺畅|执行协同|协作风险)\s*[：:]/.test(l))
    .join('，')
    .trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').replace(/^[，,、\s]+/, '').trim()
  return first
    ? first.slice(0, 48)
    : t('ziweiZhichangHepan.report.subtitleFallback')
})

/* ---------- 雷达图评分解析 ---------- */

interface RadarScores { trust: number; goal: number; communication: number; execution: number; risk: number }

const radarDims = computed(() => [
  { key: 'trust' as const, label: t('ziweiZhichangHepan.report.dimTrust') },
  { key: 'goal' as const, label: t('ziweiZhichangHepan.report.dimGoal') },
  { key: 'communication' as const, label: t('ziweiZhichangHepan.report.dimCommunication') },
  { key: 'execution' as const, label: t('ziweiZhichangHepan.report.dimExecution') },
  { key: 'risk' as const, label: t('ziweiZhichangHepan.report.dimRisk') },
])

const DIM_PATTERNS: { key: keyof RadarScores; re: RegExp }[] = [
  { key: 'trust', re: /信任契合|信任|trust/i },
  { key: 'goal', re: /目标同频|目标|goal/i },
  { key: 'communication', re: /沟通顺畅|沟通|communication/i },
  { key: 'execution', re: /执行协同|执行|execution/i },
  { key: 'risk', re: /协作风险|协作|风险|risk|conflict|摩擦/i },
]

const radarScores = computed<RadarScores | null>(() => {
  const c = aiSections.value['职场合盘总论'] ?? ''
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
  const vals = [s.trust, s.goal, s.communication, s.execution, s.risk]
  return vals.map((v, i) => {
    const p = radarPoint(i, v / 100)
    return `${fmt(p.x)},${fmt(p.y)}`
  }).join(' ')
})

const radarDataVertexes = computed(() => {
  const s = radarScores.value
  if (!s) return []
  const vals = [s.trust, s.goal, s.communication, s.execution, s.risk]
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
    label: t(`ziweiZhichangHepan.report.${g.labelKey}`),
    a: gongStars(props.chartA, g.key),
    b: gongStars(props.chartB, g.key),
  })))

const gongEnergy = computed(() => {
  const rows = KEY_GONGS.map(g => ({
    name: g.key,
    label: t(`ziweiZhichangHepan.report.${g.labelKey}`),
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

/* ---------- 关系优化建议解析 ---------- */

const adviceList = computed<{ title: string; desc: string }[]>(() => {
  const content = aiSections.value['关系优化建议'] ?? ''
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
.zzr {
  --zzr-bg: #f2ede3;
  --zzr-sheet: #faf6ec;
  --zzr-card: #fffdf6;
  --zzr-ink: #2e2a24;
  --zzr-ink-soft: #55503f;
  --zzr-ink-faint: #8a8272;
  --zzr-line: #d8d0bd;
  --zzr-line-soft: #e6dfcd;
  --zzr-accent: #8c2f26;
  --zzr-accent-soft: #a8512e;
  --zzr-star: #8c6d1f;
  --zzr-green: #4a7c59;
  --zzr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--zzr-bg);
  padding: 18px;
  color: var(--zzr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.zzr-sheet {
  background: var(--zzr-sheet);
  border: 1px solid var(--zzr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.zzr-head { border-bottom: 2px solid var(--zzr-ink); padding-bottom: 16px; }
.zzr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.zzr-brand { display: flex; align-items: center; gap: 8px; }
.zzr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--zzr-accent);
  color: var(--zzr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.zzr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--zzr-ink-soft); }
.zzr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--zzr-ink-faint); }
.zzr-verdict { color: var(--zzr-green); font-weight: 600; }
.zzr-rating { letter-spacing: 1px; }

.zzr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.zzr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--zzr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.zzr-head-bottom { text-align: center; }
.zzr-meta-line { margin: 2px 0; font-size: 12px; color: var(--zzr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.zzr-row { display: grid; gap: 14px; margin-top: 16px; }
.zzr-row-profiles { grid-template-columns: 1fr auto 1fr; align-items: stretch; }
.zzr-row-charts { grid-template-columns: 1fr 1.1fr; }
.zzr-ai-row { grid-template-columns: 1fr 1fr; }
.zzr-section { margin-top: 16px; }

.zzr-card {
  background: var(--zzr-card);
  border: 1px solid var(--zzr-line);
  padding: 14px 16px;
}
.zzr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 双人档案条 ---------- */
.zzr-person { display: flex; flex-direction: column; gap: 10px; }
.zzr-person-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.zzr-person-role {
  font-size: 10px; letter-spacing: 1px;
  border: 1px solid var(--zzr-accent); color: var(--zzr-accent);
  padding: 1px 6px; border-radius: 2px;
}
.zzr-person-name { font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.zzr-person-gender { font-size: 11px; color: var(--zzr-ink-faint); }
.zzr-person-ming {
  display: flex; flex-direction: column; gap: 3px;
  border: 1px solid var(--zzr-line-soft);
  padding: 8px 10px;
  background: rgba(140, 47, 38, 0.03);
}
.zzr-person-ming-label { font-size: 9px; color: var(--zzr-ink-faint); letter-spacing: 1px; }
.zzr-person-ming-value { font-size: 14px; font-weight: 700; color: var(--zzr-accent); letter-spacing: 0.5px; }
.zzr-person-meta { font-size: 11px; color: var(--zzr-ink-faint); line-height: 1.5; }
.zzr-person-vs {
  align-self: center;
  font-size: 22px; font-weight: 700;
  color: var(--zzr-accent-soft);
}

/* ---------- 图表白卡 ---------- */
.zzr-chart { display: flex; flex-direction: column; }
.zzr-chart-title {
  margin: 0 0 12px;
  font-size: 13px; font-weight: 700;
  letter-spacing: 1px; text-align: center;
  border-bottom: 1px solid var(--zzr-line-soft);
  padding-bottom: 8px;
}

/* ---------- 宫位星曜能量柱状图 ---------- */
.zzr-gongbar { display: flex; flex-direction: column; gap: 10px; }
.zzr-gongbar-row { display: flex; align-items: center; gap: 8px; }
.zzr-gongbar-name { width: 30px; font-size: 12px; font-weight: 700; color: var(--zzr-ink-soft); flex-shrink: 0; }
.zzr-gongbar-bars { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.zzr-gongbar-line { display: flex; align-items: center; gap: 5px; }
.zzr-gongbar-bar { display: block; height: 7px; min-width: 2px; }
.zzr-gongbar-bar-a { background: var(--zzr-accent-soft); }
.zzr-gongbar-bar-b { background: var(--zzr-blue); }
.zzr-gongbar-val { font-size: 9px; color: var(--zzr-ink-faint); width: 18px; flex-shrink: 0; }
.zzr-gongbar-legend {
  display: flex; gap: 16px; justify-content: center;
  margin-top: 12px; padding-top: 10px;
  border-top: 1px dashed var(--zzr-line-soft);
}
.zzr-gongbar-lg { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--zzr-ink-soft); }
.zzr-gongbar-lg-swatch { width: 12px; height: 7px; display: inline-block; }

/* ---------- 雷达图 ---------- */
.zzr-radar-wrap { display: flex; justify-content: center; }
.zzr-radar { width: 100%; max-width: 240px; height: auto; }
/* 填充/描边用内联 SVG 属性写在模板上（html-to-image 截图克隆不套用 scoped CSS，
   只依赖 CSS 的 fill/stroke 会在分享图里退成默认黑色实心块）。这里只保留布局规则。 */
.zzr-radar-label { font-size: 9px; letter-spacing: 0.5px; }
.zzr-radar-pending {
  display: flex; align-items: center; justify-content: center;
  min-height: 180px;
}
.zzr-radar-scores { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
.zzr-radar-score-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.zzr-radar-score-name { width: 56px; color: var(--zzr-ink-soft); flex-shrink: 0; }
.zzr-radar-score-bar-wrap { flex: 1; height: 6px; background: var(--zzr-line-soft); }
.zzr-radar-score-bar { display: block; height: 100%; background: var(--zzr-green); }
.zzr-radar-score-risk { background: var(--zzr-accent); }
.zzr-radar-score-val { width: 24px; text-align: right; color: var(--zzr-ink-faint); flex-shrink: 0; }

/* ---------- 宫位对比表 ---------- */
.zzr-table-card { padding: 6px 8px; overflow-x: auto; }
.zzr-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.zzr-table th, .zzr-table td {
  border: 1px solid var(--zzr-line-soft);
  padding: 8px 10px;
  text-align: center;
  color: var(--zzr-ink-soft);
  line-height: 1.5;
}
.zzr-table thead th {
  background: rgba(140, 47, 38, 0.05);
  color: var(--zzr-ink);
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 12.5px;
}
.zzr-table-gong {
  font-weight: 700;
  color: var(--zzr-accent) !important;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* ---------- 大限同步对比条 ---------- */
.zzr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.zzr-sync { display: flex; flex-direction: column; gap: 12px; }
.zzr-sync-row { display: flex; flex-direction: column; gap: 5px; }
.zzr-sync-name { font-size: 11px; font-weight: 700; color: var(--zzr-ink-soft); letter-spacing: 1px; }
.zzr-daxian-row { display: flex; gap: 2px; overflow-x: auto; }
.zzr-daxian-item {
  flex: 1; min-width: 46px;
  border: 1px solid var(--zzr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.zzr-daxian-current { border-color: var(--zzr-accent); background: rgba(140, 47, 38, 0.05); }
.zzr-daxian-gong { font-size: 12px; font-weight: 700; }
.zzr-daxian-age { font-size: 8px; color: var(--zzr-ink-faint); }
.zzr-sync-legend {
  display: flex; align-items: center; gap: 6px;
  margin-top: 10px; font-size: 10px; color: var(--zzr-ink-faint);
}
.zzr-daxian-current-demo {
  width: 14px; height: 12px;
  border: 1px solid var(--zzr-accent);
  background: rgba(140, 47, 38, 0.05);
  display: inline-block;
}

/* ---------- AI 章节 ---------- */
.zzr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--zzr-line-soft);
  padding-bottom: 8px;
}
.zzr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--zzr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.zzr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--zzr-ink-soft); }

.zzr-md :deep(p) { margin: 0 0 0.7em; }
.zzr-md :deep(p:last-child) { margin-bottom: 0; }
.zzr-md :deep(strong) { color: var(--zzr-ink); font-weight: 700; }
.zzr-md :deep(ul), .zzr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.zzr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.zzr-md :deep(h3), .zzr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--zzr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.zzr-md { overflow-x: auto; }
.zzr-md :deep(.zzr-pending), .zzr-pending { color: var(--zzr-ink-faint); font-style: italic; }

/* ---------- 关系优化建议 ---------- */
.zzr-advice { display: flex; flex-direction: column; gap: 10px; }
.zzr-advice-item { display: flex; gap: 9px; align-items: flex-start; }
.zzr-advice-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--zzr-ink); color: #f5efe0;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.zzr-advice-head { font-size: 12.5px; font-weight: 700; color: var(--zzr-ink); }
.zzr-advice-desc { font-size: 12px; color: var(--zzr-ink-soft); line-height: 1.7; margin-top: 1px; }

.zzr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--zzr-ink-faint); letter-spacing: 1px;
}
.zzr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--zzr-accent);
  animation: zzr-pulse 1s ease-in-out infinite;
}
@keyframes zzr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.zzr-error { margin-top: 14px; text-align: center; color: var(--zzr-accent); font-size: 12px; }
.zzr-retry {
  margin-top: 8px;
  border: 1px solid var(--zzr-accent);
  background: transparent;
  color: var(--zzr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.zzr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.zzr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--zzr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.zzr-foot-note { font-size: 10px; color: var(--zzr-ink-faint); }
.zzr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.zzr-card, .zzr-ai, .zzr-chart, .zzr-sync, .zzr-daxian-row, .zzr-person, .zzr-table-card { min-width: 0; }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .zzr-row-charts { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .zzr { padding: 8px; }
  .zzr-sheet { padding: 16px 12px; }
  .zzr-row-profiles { grid-template-columns: 1fr; }
  .zzr-person-vs { display: none; }
  .zzr-ai-row { grid-template-columns: 1fr; }
  .zzr-title { font-size: 20px; letter-spacing: 2px; }

  /* 大限：允许横向滚动，不被压缩 */
  .zzr-daxian-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .zzr-daxian-item { flex: 0 0 auto; min-width: 50px; }
}
</style>
