<template>
  <div class="bzr">
    <div class="bzr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="bzr-head">
        <div class="bzr-head-top">
          <div class="bzr-brand">
            <div class="bzr-seal">{{ $t('baziZhichangHepan.report.seal') }}</div>
            <span class="bzr-brand-name">{{ $t('baziZhichangHepan.report.brandName') }}</span>
          </div>
          <div class="bzr-head-right">
            <span class="bzr-time">{{ $t('baziZhichangHepan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="bzr-rating">{{ $t('baziZhichangHepan.report.rating') }}</span>
            <span class="bzr-verdict">✓ {{ relationLabel }}</span>
          </div>
        </div>

        <h1 class="bzr-title">{{ titleText }}</h1>
        <p class="bzr-subtitle">{{ subtitleText }}</p>

        <div class="bzr-head-bottom">
          <p class="bzr-meta-line">{{ pairMetaLine }}</p>
        </div>
      </header>

      <!-- ============ 双人档案条 ============ -->
      <section class="bzr-row bzr-row-profiles">
        <div class="bzr-card bzr-person">
          <div class="bzr-person-head">
            <span class="bzr-person-role">{{ labelA }}</span>
            <span class="bzr-person-name">{{ nameA || labelA }}</span>
            <span class="bzr-person-gender">{{ genderAText }}</span>
          </div>
          <div class="bzr-person-pillars">
            <span>{{ chartA.year.gan }}{{ chartA.year.zhi }}</span>
            <span>{{ chartA.month.gan }}{{ chartA.month.zhi }}</span>
            <span class="bzr-person-day">{{ chartA.day.gan }}{{ chartA.day.zhi }}</span>
            <span>{{ chartA.hour ? chartA.hour.gan + chartA.hour.zhi : '—' }}</span>
          </div>
          <div class="bzr-person-meta">
            {{ $t('bazi.chartSubtitle', { riZhu: chartA.riZhu, strength: chartA.riZhuStrength, geju: chartA.geju }) }}
          </div>
        </div>

        <div class="bzr-person-vs">×</div>

        <div class="bzr-card bzr-person">
          <div class="bzr-person-head">
            <span class="bzr-person-role">{{ labelB }}</span>
            <span class="bzr-person-name">{{ nameB || labelB }}</span>
            <span class="bzr-person-gender">{{ genderBText }}</span>
          </div>
          <div class="bzr-person-pillars">
            <span>{{ chartB.year.gan }}{{ chartB.year.zhi }}</span>
            <span>{{ chartB.month.gan }}{{ chartB.month.zhi }}</span>
            <span class="bzr-person-day">{{ chartB.day.gan }}{{ chartB.day.zhi }}</span>
            <span>{{ chartB.hour ? chartB.hour.gan + chartB.hour.zhi : '—' }}</span>
          </div>
          <div class="bzr-person-meta">
            {{ $t('bazi.chartSubtitle', { riZhu: chartB.riZhu, strength: chartB.riZhuStrength, geju: chartB.geju }) }}
          </div>
        </div>
      </section>

      <!-- ============ 核心可视化：五行对比 + 雷达图 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('baziZhichangHepan.report.visualTitle') }}</h3>
        <div class="bzr-row bzr-row-charts">
          <!-- 五行对比条形图 -->
          <div class="bzr-card bzr-chart">
            <h4 class="bzr-chart-title">{{ $t('baziZhichangHepan.report.wuxingTitle') }}</h4>
            <div class="bzr-wxcmp">
              <div v-for="w in wuxingCompare" :key="w.name" class="bzr-wxcmp-row">
                <span class="bzr-wxcmp-dot" :style="{ background: w.color }" />
                <span class="bzr-wxcmp-name">{{ w.name }}</span>
                <div class="bzr-wxcmp-bars">
                  <div class="bzr-wxcmp-bar-line">
                    <span class="bzr-wxcmp-bar bzr-wxcmp-bar-a" :style="{ width: w.a + '%' }" />
                    <span class="bzr-wxcmp-val">{{ w.a }}</span>
                  </div>
                  <div class="bzr-wxcmp-bar-line">
                    <span class="bzr-wxcmp-bar bzr-wxcmp-bar-b" :style="{ width: w.b + '%' }" />
                    <span class="bzr-wxcmp-val">{{ w.b }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="bzr-wxcmp-legend">
              <span class="bzr-wxcmp-lg"><i class="bzr-wxcmp-lg-swatch bzr-wxcmp-bar-a" />{{ nameA || labelA }}</span>
              <span class="bzr-wxcmp-lg"><i class="bzr-wxcmp-lg-swatch bzr-wxcmp-bar-b" />{{ nameB || labelB }}</span>
            </div>
          </div>

          <!-- 关系维度雷达图 -->
          <div class="bzr-card bzr-chart">
            <h4 class="bzr-chart-title">{{ $t('baziZhichangHepan.report.radarTitle') }}</h4>
            <div v-if="radarScores" class="bzr-radar-wrap">
              <svg viewBox="0 0 200 200" class="bzr-radar">
                <!-- 网格 -->
                <polygon
                  v-for="ring in [1, 0.66, 0.33]"
                  :key="ring"
                  :points="radarRingPoints(ring)"
                  class="bzr-radar-grid"
                />
                <!-- 轴线 -->
                <line
                  v-for="(p, i) in radarAxisEndpoints"
                  :key="i"
                  x1="100"
                  y1="100"
                  :x2="p.x"
                  :y2="p.y"
                  class="bzr-radar-axis"
                />
                <!-- 数据多边形 -->
                <polygon :points="radarDataPoints" class="bzr-radar-data" />
                <circle
                  v-for="(p, i) in radarDataVertexes"
                  :key="i"
                  :cx="p.x"
                  :cy="p.y"
                  r="2.4"
                  class="bzr-radar-vertex"
                />
                <!-- 维度标签 -->
                <text
                  v-for="(l, i) in radarLabels"
                  :key="i"
                  :x="l.x"
                  :y="l.y"
                  class="bzr-radar-label"
                  :text-anchor="l.anchor"
                >{{ l.text }}</text>
              </svg>
            </div>
            <div v-else class="bzr-radar-pending">
              <span class="bzr-pending">{{ pendingText }}</span>
            </div>
            <!-- 评分明细 -->
            <div v-if="radarScores" class="bzr-radar-scores">
              <div v-for="d in radarDims" :key="d.key" class="bzr-radar-score-row">
                <span class="bzr-radar-score-name">{{ d.label }}</span>
                <span class="bzr-radar-score-bar-wrap">
                  <span
                    class="bzr-radar-score-bar"
                    :class="{ 'bzr-radar-score-risk': d.key === 'risk' }"
                    :style="{ width: radarScores[d.key] + '%' }"
                  />
                </span>
                <span class="bzr-radar-score-val">{{ radarScores[d.key] }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 四柱并排盘 ============ -->
      <section class="bzr-section">
        <h3 class="bzr-section-title">{{ $t('baziZhichangHepan.report.pillarsTitle') }}</h3>
        <div class="bzr-row bzr-row-pillars">
          <div class="bzr-card bzr-pan">
            <h4 class="bzr-pan-title">{{ nameA || labelA }}</h4>
            <div class="bzr-bazi-grid">
              <div v-for="p in pillarsA" :key="p.label" class="bzr-pillar">
                <div class="bzr-pillar-head">{{ p.label }}</div>
                <div class="bzr-pillar-shishen">{{ p.shishen }}</div>
                <div class="bzr-pillar-gan" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.gan }}</div>
                <div class="bzr-pillar-zhi" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.zhi }}</div>
                <div class="bzr-pillar-canggan">
                  <span v-for="cg in p.canggan" :key="cg.gan">{{ cg.gan }}<i>({{ cg.type }})</i></span>
                </div>
              </div>
            </div>
          </div>
          <div class="bzr-card bzr-pan">
            <h4 class="bzr-pan-title">{{ nameB || labelB }}</h4>
            <div class="bzr-bazi-grid">
              <div v-for="p in pillarsB" :key="p.label" class="bzr-pillar">
                <div class="bzr-pillar-head">{{ p.label }}</div>
                <div class="bzr-pillar-shishen">{{ p.shishen }}</div>
                <div class="bzr-pillar-gan" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.gan }}</div>
                <div class="bzr-pillar-zhi" :class="{ 'bzr-pillar-rimu': p.isDay }">{{ p.zhi }}</div>
                <div class="bzr-pillar-canggan">
                  <span v-for="cg in p.canggan" :key="cg.gan">{{ cg.gan }}<i>({{ cg.type }})</i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 大运同步对比条 ============ -->
      <section class="bzr-section">
        <div class="bzr-card">
          <h4 class="bzr-pan-title">{{ $t('baziZhichangHepan.report.dayunTitle') }}</h4>
          <div class="bzr-sync">
            <div class="bzr-sync-row">
              <div class="bzr-sync-name">{{ nameA || labelA }}</div>
              <div class="bzr-dayun-row">
                <div
                  v-for="d in chartA.dayuns"
                  :key="d.index"
                  class="bzr-dayun-item"
                  :class="{ 'bzr-dayun-current': d === chartA.currentDaYun }"
                >
                  <span class="bzr-dayun-gz">{{ d.gan }}{{ d.zhi }}</span>
                  <span class="bzr-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>
            <div class="bzr-sync-row">
              <div class="bzr-sync-name">{{ nameB || labelB }}</div>
              <div class="bzr-dayun-row">
                <div
                  v-for="d in chartB.dayuns"
                  :key="d.index"
                  class="bzr-dayun-item"
                  :class="{ 'bzr-dayun-current': d === chartB.currentDaYun }"
                >
                  <span class="bzr-dayun-gz">{{ d.gan }}{{ d.zhi }}</span>
                  <span class="bzr-dayun-age">{{ d.ageRange[0] }}-{{ d.ageRange[1] }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="bzr-sync-legend">
            <span class="bzr-dayun-current-demo" />{{ $t('baziZhichangHepan.report.currentDayunLabel') }}
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">01</span>{{ $t('baziZhichangHepan.report.secOverview') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['职场合盘总论'])" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">02</span>{{ $t('baziZhichangHepan.report.secDayPillar') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['日柱互动：谁主谁辅'])" />
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">03</span>{{ $t('baziZhichangHepan.report.secWuxing') }}</h3>
          <div v-if="wuxingConclusion" class="bzr-wxc">
            <div class="bzr-wxc-block">
              <div class="bzr-wxc-head">{{ $t('baziZhichangHepan.report.wxA', { name: nameA || labelA }) }}</div>
              <div class="bzr-wxc-body">{{ wuxingConclusion.a }}</div>
            </div>
            <div class="bzr-wxc-block">
              <div class="bzr-wxc-head">{{ $t('baziZhichangHepan.report.wxB', { name: nameB || labelB }) }}</div>
              <div class="bzr-wxc-body">{{ wuxingConclusion.b }}</div>
            </div>
            <div class="bzr-wxc-block bzr-wxc-result">
              <div class="bzr-wxc-head">{{ $t('baziZhichangHepan.report.wxConclusion') }}</div>
              <div class="bzr-wxc-body">{{ wuxingConclusion.conclusion }}</div>
            </div>
          </div>
          <div v-else class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['五行互补：资源与短板'])" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">04</span>{{ $t('baziZhichangHepan.report.secShishen') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['十神关系：职场角色分工'])" />
        </div>
      </section>

      <!-- ============ AI 章节 05-06 ============ -->
      <section class="bzr-row bzr-ai-row">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">05</span>{{ $t('baziZhichangHepan.report.secCharacter') }}</h3>
          <div class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['性格匹配：一起上班的化学反应'])" />
        </div>
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">06</span>{{ $t('baziZhichangHepan.report.secDayunSync') }}</h3>
          <div v-if="dayunSync" class="bzr-sync-points">
            <div class="bzr-sp">
              <div class="bzr-sp-head bzr-sp-head-sync">◎ {{ $t('baziZhichangHepan.report.syncPoint') }}</div>
              <div class="bzr-sp-body">{{ dayunSync.sync }}</div>
            </div>
            <div class="bzr-sp">
              <div class="bzr-sp-head bzr-sp-head-off">◇ {{ $t('baziZhichangHepan.report.offPoint') }}</div>
              <div class="bzr-sp-body">{{ dayunSync.off }}</div>
            </div>
            <div class="bzr-sp">
              <div class="bzr-sp-head bzr-sp-head-window">★ {{ $t('baziZhichangHepan.report.keyWindow') }}</div>
              <div class="bzr-sp-body">{{ dayunSync.window }}</div>
            </div>
          </div>
          <div v-else class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['大运同步：未来能不能同频'])" />
        </div>
      </section>

      <!-- ============ AI 章节 07 关系优化建议 ============ -->
      <section class="bzr-section">
        <div class="bzr-card bzr-ai">
          <h3 class="bzr-ai-title"><span class="bzr-ai-no">07</span>{{ $t('baziZhichangHepan.report.secAdvice') }}</h3>
          <div v-if="adviceList.length" class="bzr-advice">
            <div v-for="(a, i) in adviceList" :key="i" class="bzr-advice-item">
              <span class="bzr-advice-num">{{ i + 1 }}</span>
              <div class="bzr-advice-text">
                <div v-if="a.title" class="bzr-advice-head">{{ a.title }}</div>
                <div class="bzr-advice-desc">{{ a.desc }}</div>
              </div>
            </div>
          </div>
          <div v-else class="bzr-ai-body bzr-md" v-html="renderSection(aiSections['关系优化建议'])" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="bzr-streaming">
        <span class="bzr-streaming-dot" />
        {{ $t('baziZhichangHepan.report.streamingHint') }}
      </div>

      <!-- AI 错误 -->
      <div v-if="error" class="bzr-error">
        <p>{{ error }}</p>
        <button type="button" class="bzr-retry" @click="$emit('retry')">{{ $t('baziZhichangHepan.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="bzr-foot">
        <span class="bzr-foot-note">ⓘ {{ $t('baziZhichangHepan.report.footerNote') }}</span>
        <span class="bzr-seal bzr-seal-foot">{{ $t('baziZhichangHepan.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { BaziChart } from '~/types/bazi'

type RelationType = 'leader-member' | 'colleague'

interface Props {
  chartA: BaziChart
  chartB: BaziChart
  aiContent: string
  streaming: boolean
  error: string | null
  relationType: RelationType
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

const relationLabel = computed(() =>
  props.relationType === 'colleague'
    ? t('baziZhichangHepan.relationTypeColleague')
    : t('baziZhichangHepan.relationTypeLeaderMember'))

const genderAText = computed(() => props.genderA === 'male' ? t('common.male') : t('common.female'))
const genderBText = computed(() => props.genderB === 'male' ? t('common.male') : t('common.female'))

const WX_GAN: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

const titleText = computed(() => {
  const wxA = WX_GAN[props.chartA.riZhu] ?? ''
  const wxB = WX_GAN[props.chartB.riZhu] ?? ''
  return t('baziZhichangHepan.report.title', {
    ganA: props.chartA.riZhu, wxA,
    ganB: props.chartB.riZhu, wxB,
  })
})

const pairMetaLine = computed(() => t('baziZhichangHepan.report.pairMeta', {
  a: props.nameA || props.labelA,
  b: props.nameB || props.labelB,
  riZhuA: props.chartA.riZhu,
  riZhuB: props.chartB.riZhu,
}))

/* ---------- 五行对比 ---------- */

const WX_COLORS: Record<string, string> = { 木: '#4a7c59', 火: '#a8512e', 土: '#8a6d3b', 金: '#7d7d68', 水: '#4a6a8a' }
const wuxingCompare = computed(() =>
  (['木', '火', '土', '金', '水'] as const).map(wx => ({
    name: wx,
    a: Math.round(props.chartA.wuxingScore[wx] ?? 0),
    b: Math.round(props.chartB.wuxingScore[wx] ?? 0),
    color: WX_COLORS[wx]!,
  })))

/* ---------- 四柱 ---------- */

function buildPillars(chart: BaziChart) {
  const mk = (label: string, p: typeof chart.year | null, isDay = false) => ({
    label,
    gan: p?.gan ?? '—',
    zhi: p?.zhi ?? '—',
    shishen: isDay ? t('baziZhichangHepan.report.rizhuTag') : (p?.shishen ?? '—'),
    canggan: p?.canggan ?? [],
    isDay,
  })
  return [
    mk(t('baziPan.yearPillar'), chart.year),
    mk(t('baziPan.monthPillar'), chart.month),
    mk(t('baziPan.dayPillar'), chart.day, true),
    mk(t('baziPan.hourPillar'), chart.hour),
  ]
}
const pillarsA = computed(() => buildPillars(props.chartA))
const pillarsB = computed(() => buildPillars(props.chartB))

/* ---------- AI 内容解析 ---------- */

interface AiSection { title: string; content: string }

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

const pendingText = computed(() => t('baziZhichangHepan.report.pending'))

function renderSection(content: string | undefined): string {
  if (!content) {
    return `<p class="bzr-pending">${pendingText.value}</p>`
  }
  return marked.parse(content, { async: false }) as string
}

/** 按 `**子标题**` 分块 */
function splitBlocks(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  let current: string | null = null
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*\*\*([^*]+)\*\*\s*$/)
    if (m) {
      current = m[1]!.trim()
      if (!(current in out)) out[current] = ''
    } else if (current !== null) {
      out[current] += line + '\n'
    }
  }
  for (const k of Object.keys(out)) out[k] = out[k]!.trim()
  return out
}

/** 报告副标题：取总论首句 */
const subtitleText = computed(() => {
  const c = aiSections.value['职场合盘总论'] ?? ''
  const plain = c
    .replace(/[#*]/g, '')
    // 去掉维度评分行
    .split('\n')
    .filter(l => !/^\s*[-*•]\s*(沟通默契|目标一致|资源互补|执行协同|冲突风险)\s*[：:]/.test(l))
    .join('，')
    .trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').replace(/^[，,、\s]+/, '').trim()
  return first
    ? first.slice(0, 48)
    : t('baziZhichangHepan.report.subtitleFallback', { relation: relationLabel.value })
})

/* ---------- 雷达图评分解析 ---------- */

interface RadarScores { communication: number; goal: number; resource: number; execution: number; risk: number }

const radarDims = computed(() => [
  { key: 'communication' as const, label: t('baziZhichangHepan.report.dimCommunication') },
  { key: 'goal' as const, label: t('baziZhichangHepan.report.dimGoal') },
  { key: 'resource' as const, label: t('baziZhichangHepan.report.dimResource') },
  { key: 'execution' as const, label: t('baziZhichangHepan.report.dimExecution') },
  { key: 'risk' as const, label: t('baziZhichangHepan.report.dimRisk') },
])

const DIM_PATTERNS: { key: keyof RadarScores; re: RegExp }[] = [
  { key: 'communication', re: /沟通默契|沟通|communication/i },
  { key: 'goal', re: /目标一致|目标|goal/i },
  { key: 'resource', re: /资源互补|资源|resource/i },
  { key: 'execution', re: /执行协同|执行|execution/i },
  { key: 'risk', re: /冲突风险|冲突|risk|conflict/i },
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
  // 五个维度齐全才渲染雷达
  if (Object.keys(found).length < 5) return null
  return found as RadarScores
})

/* ---------- 雷达图 SVG 几何 ---------- */

const RADAR_CENTER = 100
const RADAR_RADIUS = 72
const RADAR_COUNT = 5

function radarAngle(i: number): number {
  // 从正上方开始，顺时针
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
  const vals = [s.communication, s.goal, s.resource, s.execution, s.risk]
  return vals.map((v, i) => {
    const p = radarPoint(i, v / 100)
    return `${fmt(p.x)},${fmt(p.y)}`
  }).join(' ')
})

const radarDataVertexes = computed(() => {
  const s = radarScores.value
  if (!s) return []
  const vals = [s.communication, s.goal, s.resource, s.execution, s.risk]
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

/* ---------- 五行互补结论解析 ---------- */

const wuxingConclusion = computed<{ a: string; b: string; conclusion: string } | null>(() => {
  const content = aiSections.value['五行互补：资源与短板'] ?? ''
  if (!content) return null
  const blocks = splitBlocks(content)
  const pick = (re: RegExp) => Object.entries(blocks).find(([k]) => re.test(k))?.[1] ?? ''
  const a = pick(/^A|A 方|A 五行|甲方/i).replace(/\*\*/g, '').trim()
  const b = pick(/^B|B 方|B 五行|乙方/i).replace(/\*\*/g, '').trim()
  const conclusion = pick(/互补结论|结论/).replace(/\*\*/g, '').trim()
  if (!a && !b && !conclusion) return null
  return {
    a: a.split('\n').filter(Boolean).join(' '),
    b: b.split('\n').filter(Boolean).join(' '),
    conclusion: conclusion.split('\n').filter(Boolean).join(' '),
  }
})

/* ---------- 大运同步要点解析 ---------- */

const dayunSync = computed<{ sync: string; off: string; window: string } | null>(() => {
  const content = aiSections.value['大运同步：未来能不能同频'] ?? ''
  if (!content) return null
  const blocks = splitBlocks(content)
  const pick = (re: RegExp) => Object.entries(blocks).find(([k]) => re.test(k))?.[1] ?? ''
  const sync = pick(/同步点|同步/).replace(/\*\*/g, '').trim()
  const off = pick(/错位点|错位/).replace(/\*\*/g, '').trim()
  const window = pick(/关键窗口|窗口/).replace(/\*\*/g, '').trim()
  if (!sync && !off && !window) return null
  const clean = (s: string) => s.split('\n').filter(Boolean).join(' ')
  return { sync: clean(sync), off: clean(off), window: clean(window) }
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
.bzr {
  --bzr-bg: #f2ede3;
  --bzr-sheet: #faf6ec;
  --bzr-card: #fffdf6;
  --bzr-ink: #2e2a24;
  --bzr-ink-soft: #55503f;
  --bzr-ink-faint: #8a8272;
  --bzr-line: #d8d0bd;
  --bzr-line-soft: #e6dfcd;
  --bzr-accent: #8c2f26;
  --bzr-accent-soft: #a8512e;
  --bzr-star: #8c6d1f;
  --bzr-green: #4a7c59;
  --bzr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--bzr-bg);
  padding: 18px;
  color: var(--bzr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.bzr-sheet {
  background: var(--bzr-sheet);
  border: 1px solid var(--bzr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.bzr-head { border-bottom: 2px solid var(--bzr-ink); padding-bottom: 16px; }
.bzr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.bzr-brand { display: flex; align-items: center; gap: 8px; }
.bzr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--bzr-accent);
  color: var(--bzr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.bzr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--bzr-ink-soft); }
.bzr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-verdict { color: var(--bzr-green); font-weight: 600; }
.bzr-rating { letter-spacing: 1px; }

.bzr-title {
  margin: 14px 0 6px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  text-align: center;
}
.bzr-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--bzr-ink-soft);
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.bzr-head-bottom { text-align: center; }
.bzr-meta-line { margin: 2px 0; font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.bzr-row { display: grid; gap: 14px; margin-top: 16px; }
.bzr-row-profiles { grid-template-columns: 1fr auto 1fr; align-items: stretch; }
.bzr-row-charts { grid-template-columns: 1.2fr 1fr; }
.bzr-row-pillars { grid-template-columns: 1fr 1fr; }
.bzr-ai-row { grid-template-columns: 1fr 1fr; }
.bzr-section { margin-top: 16px; }

.bzr-card {
  background: var(--bzr-card);
  border: 1px solid var(--bzr-line);
  padding: 14px 16px;
}
.bzr-section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ---------- 双人档案条 ---------- */
.bzr-person { display: flex; flex-direction: column; gap: 10px; }
.bzr-person-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bzr-person-role {
  font-size: 10px; letter-spacing: 1px;
  border: 1px solid var(--bzr-accent); color: var(--bzr-accent);
  padding: 1px 6px; border-radius: 2px;
}
.bzr-person-name { font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.bzr-person-gender { font-size: 11px; color: var(--bzr-ink-faint); }
.bzr-person-pillars { display: flex; gap: 6px; }
.bzr-person-pillars span {
  flex: 1;
  border: 1px solid var(--bzr-line-soft);
  padding: 5px 2px;
  text-align: center;
  font-size: 14px; font-weight: 700;
  letter-spacing: 1px;
}
.bzr-person-day { color: var(--bzr-accent); border-color: var(--bzr-accent) !important; background: rgba(140, 47, 38, 0.04); }
.bzr-person-meta { font-size: 11px; color: var(--bzr-ink-faint); line-height: 1.5; }
.bzr-person-vs {
  align-self: center;
  font-size: 22px; font-weight: 700;
  color: var(--bzr-accent-soft);
}

/* ---------- 图表白卡 ---------- */
.bzr-chart { display: flex; flex-direction: column; }
.bzr-chart-title {
  margin: 0 0 12px;
  font-size: 13px; font-weight: 700;
  letter-spacing: 1px; text-align: center;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
}

/* ---------- 五行对比条形图 ---------- */
.bzr-wxcmp { display: flex; flex-direction: column; gap: 9px; }
.bzr-wxcmp-row { display: flex; align-items: center; gap: 7px; }
.bzr-wxcmp-dot { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.bzr-wxcmp-name { width: 14px; font-size: 12px; font-weight: 700; color: var(--bzr-ink-soft); flex-shrink: 0; }
.bzr-wxcmp-bars { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.bzr-wxcmp-bar-line { display: flex; align-items: center; gap: 5px; }
.bzr-wxcmp-bar { display: block; height: 7px; min-width: 2px; }
.bzr-wxcmp-bar-a { background: var(--bzr-accent-soft); }
.bzr-wxcmp-bar-b { background: var(--bzr-blue); }
.bzr-wxcmp-val { font-size: 9px; color: var(--bzr-ink-faint); width: 20px; flex-shrink: 0; }
.bzr-wxcmp-legend {
  display: flex; gap: 16px; justify-content: center;
  margin-top: 12px; padding-top: 10px;
  border-top: 1px dashed var(--bzr-line-soft);
}
.bzr-wxcmp-lg { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--bzr-ink-soft); }
.bzr-wxcmp-lg-swatch { width: 12px; height: 7px; display: inline-block; }

/* ---------- 雷达图 ---------- */
.bzr-radar-wrap { display: flex; justify-content: center; }
.bzr-radar { width: 100%; max-width: 260px; height: auto; }
.bzr-radar-grid { fill: none; stroke: var(--bzr-line); stroke-width: 1; }
.bzr-radar-axis { stroke: var(--bzr-line-soft); stroke-width: 1; }
.bzr-radar-data {
  fill: rgba(168, 81, 46, 0.18);
  stroke: var(--bzr-accent-soft);
  stroke-width: 1.5;
}
.bzr-radar-vertex { fill: var(--bzr-accent); }
.bzr-radar-label { font-size: 9px; fill: var(--bzr-ink-soft); letter-spacing: 0.5px; }
.bzr-radar-pending {
  display: flex; align-items: center; justify-content: center;
  min-height: 180px;
}
.bzr-radar-scores { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
.bzr-radar-score-row { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.bzr-radar-score-name { width: 56px; color: var(--bzr-ink-soft); flex-shrink: 0; }
.bzr-radar-score-bar-wrap { flex: 1; height: 6px; background: var(--bzr-line-soft); }
.bzr-radar-score-bar { display: block; height: 100%; background: var(--bzr-green); }
.bzr-radar-score-risk { background: var(--bzr-accent); }
.bzr-radar-score-val { width: 24px; text-align: right; color: var(--bzr-ink-faint); flex-shrink: 0; }

/* ---------- 四柱盘 ---------- */
.bzr-pan { padding: 12px; }
.bzr-pan-title { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-align: center; }
.bzr-bazi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.bzr-pillar { border: 1px solid var(--bzr-line-soft); text-align: center; padding: 6px 4px; display: flex; flex-direction: column; gap: 2px; }
.bzr-pillar-head { font-size: 9px; color: var(--bzr-ink-faint); letter-spacing: 1px; }
.bzr-pillar-shishen { font-size: 10px; color: var(--bzr-accent-soft); min-height: 14px; }
.bzr-pillar-gan { font-size: 24px; font-weight: 700; line-height: 1.2; }
.bzr-pillar-zhi { font-size: 24px; font-weight: 700; line-height: 1.2; color: var(--bzr-ink-soft); }
.bzr-pillar-rimu { color: var(--bzr-accent); }
.bzr-pillar-canggan { display: flex; flex-direction: column; font-size: 9px; color: var(--bzr-ink-faint); line-height: 1.5; min-height: 42px; }
.bzr-pillar-canggan i { font-style: normal; opacity: 0.7; }

/* ---------- 大运同步对比条 ---------- */
.bzr-sync { display: flex; flex-direction: column; gap: 12px; }
.bzr-sync-row { display: flex; flex-direction: column; gap: 5px; }
.bzr-sync-name { font-size: 11px; font-weight: 700; color: var(--bzr-ink-soft); letter-spacing: 1px; }
.bzr-dayun-row { display: flex; gap: 2px; overflow-x: auto; }
.bzr-dayun-item {
  flex: 1; min-width: 46px;
  border: 1px solid var(--bzr-line-soft);
  display: flex; flex-direction: column; align-items: center;
  padding: 3px 2px; gap: 1px;
}
.bzr-dayun-current { border-color: var(--bzr-accent); background: rgba(140, 47, 38, 0.05); }
.bzr-dayun-gz { font-size: 12px; font-weight: 700; }
.bzr-dayun-age { font-size: 8px; color: var(--bzr-ink-faint); }
.bzr-sync-legend {
  display: flex; align-items: center; gap: 6px;
  margin-top: 10px; font-size: 10px; color: var(--bzr-ink-faint);
}
.bzr-dayun-current-demo {
  width: 14px; height: 12px;
  border: 1px solid var(--bzr-accent);
  background: rgba(140, 47, 38, 0.05);
  display: inline-block;
}

/* ---------- AI 章节 ---------- */
.bzr-ai-title {
  margin: 0 0 10px;
  font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--bzr-line-soft);
  padding-bottom: 8px;
}
.bzr-ai-no {
  font-size: 11px; color: #f5efe0;
  background: var(--bzr-ink);
  padding: 2px 6px;
  letter-spacing: 1px;
}
.bzr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--bzr-ink-soft); }

.bzr-md :deep(p) { margin: 0 0 0.7em; }
.bzr-md :deep(p:last-child) { margin-bottom: 0; }
.bzr-md :deep(strong) { color: var(--bzr-ink); font-weight: 700; }
.bzr-md :deep(ul), .bzr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.bzr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.bzr-md :deep(h3), .bzr-md :deep(h4) {
  font-size: 12.5px; font-weight: 700; color: var(--bzr-ink);
  margin: 0.8em 0 0.4em; letter-spacing: 1px;
}
.bzr-md { overflow-x: auto; }
.bzr-md :deep(.bzr-pending), .bzr-pending { color: var(--bzr-ink-faint); font-style: italic; }

/* ---------- 五行互补结论块 ---------- */
.bzr-wxc { display: flex; flex-direction: column; gap: 9px; }
.bzr-wxc-block { border: 1px dashed var(--bzr-line); padding: 9px 11px; background: rgba(255, 255, 255, 0.45); }
.bzr-wxc-result { border: 1px solid var(--bzr-accent-soft); background: rgba(168, 81, 46, 0.05); }
.bzr-wxc-head { font-size: 11px; font-weight: 700; color: var(--bzr-accent-soft); letter-spacing: 1px; margin-bottom: 4px; }
.bzr-wxc-result .bzr-wxc-head { color: var(--bzr-accent); }
.bzr-wxc-body { font-size: 12px; line-height: 1.7; color: var(--bzr-ink-soft); }

/* ---------- 大运同步要点 ---------- */
.bzr-sync-points { display: flex; flex-direction: column; gap: 9px; }
.bzr-sp { border: 1px dashed var(--bzr-line); padding: 9px 11px; background: rgba(255, 255, 255, 0.45); }
.bzr-sp-head { font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
.bzr-sp-head-sync { color: var(--bzr-green); }
.bzr-sp-head-off { color: var(--bzr-accent-soft); }
.bzr-sp-head-window { color: var(--bzr-star); }
.bzr-sp-body { font-size: 12px; line-height: 1.7; color: var(--bzr-ink-soft); }

/* ---------- 优化建议 ---------- */
.bzr-advice { display: flex; flex-direction: column; gap: 10px; }
.bzr-advice-item { display: flex; gap: 9px; align-items: flex-start; }
.bzr-advice-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--bzr-ink); color: #f5efe0;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.bzr-advice-head { font-size: 12.5px; font-weight: 700; color: var(--bzr-ink); }
.bzr-advice-desc { font-size: 12px; color: var(--bzr-ink-soft); line-height: 1.7; margin-top: 1px; }

.bzr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--bzr-ink-faint); letter-spacing: 1px;
}
.bzr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--bzr-accent);
  animation: bzr-pulse 1s ease-in-out infinite;
}
@keyframes bzr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.bzr-error { margin-top: 14px; text-align: center; color: var(--bzr-accent); font-size: 12px; }
.bzr-retry {
  margin-top: 8px;
  border: 1px solid var(--bzr-accent);
  background: transparent;
  color: var(--bzr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.bzr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.bzr-foot {
  margin-top: 18px;
  border-top: 1px solid var(--bzr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.bzr-foot-note { font-size: 10px; color: var(--bzr-ink-faint); }
.bzr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.bzr-pan, .bzr-ai, .bzr-chart, .bzr-bazi-grid, .bzr-sync, .bzr-dayun-row, .bzr-person { min-width: 0; }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .bzr-row-charts { grid-template-columns: 1fr; }
  .bzr-row-pillars { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .bzr { padding: 8px; }
  .bzr-sheet { padding: 16px 12px; }
  .bzr-row-profiles { grid-template-columns: 1fr; }
  .bzr-person-vs { display: none; }
  .bzr-ai-row { grid-template-columns: 1fr; }
  .bzr-title { font-size: 20px; letter-spacing: 2px; }

  /* 四柱盘：缩小干支大字 */
  .bzr-pan { padding: 8px; }
  .bzr-pillar-gan, .bzr-pillar-zhi { font-size: 18px; }
  .bzr-pillar-shishen { font-size: 9px; }
  .bzr-pillar-canggan { font-size: 8px; min-height: 34px; }
  .bzr-pillar-head { font-size: 8px; }

  /* 大运：允许横向滚动，不被压缩 */
  .bzr-dayun-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .bzr-dayun-item { flex: 0 0 auto; min-width: 50px; }
}
</style>
