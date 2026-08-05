<template>
  <div class="azr">
    <div class="azr-sheet">
      <!-- ============ 报告头 ============ -->
      <header class="azr-head">
        <div class="azr-head-top">
          <div class="azr-brand">
            <div class="azr-seal">{{ $t('astroZhichangHepan.report.seal') }}</div>
            <span class="azr-brand-name">{{ $t('astroZhichangHepan.report.brandName') }}</span>
          </div>
          <div class="azr-head-right">
            <span class="azr-time">{{ $t('astroZhichangHepan.report.generatedAt') }}：{{ generatedAt }}</span>
            <span class="azr-rating">{{ $t('astroZhichangHepan.report.rating') }}</span>
            <span class="azr-verdict">✓ {{ $t('astroZhichangHepan.report.verdict') }}</span>
          </div>
        </div>

        <h1 class="azr-title">{{ titleText }}</h1>
        <p class="azr-subtitle">{{ subtitleText }}</p>

        <div class="azr-head-bottom">
          <p class="azr-meta-line">{{ pairMetaLine }}</p>
        </div>
      </header>

      <!-- ============ 双人档案条 ============ -->
      <section class="azr-row azr-row-profiles">
        <div class="azr-card azr-person">
          <div class="azr-person-head">
            <span class="azr-person-role">{{ result.personA.roleLabel }}</span>
            <span class="azr-person-name">{{ result.personA.name || result.personA.roleLabel }}</span>
            <span class="azr-person-gender">{{ genderText(result.personA.gender) }}</span>
          </div>
          <div class="azr-person-asc">
            <span class="azr-person-asc-label">{{ $t('astroZhichangHepan.report.ascLabel') }}</span>
            <span class="azr-person-asc-value">{{ result.ascendantComparison.aSignZh }}</span>
            <span class="azr-person-mc">MC {{ result.careerFocus.personA.mcSignZh }}</span>
          </div>
          <div class="azr-person-meta">{{ elementLine(result.personA) }}</div>
        </div>

        <div class="azr-person-vs">×</div>

        <div class="azr-card azr-person">
          <div class="azr-person-head">
            <span class="azr-person-role">{{ result.personB.roleLabel }}</span>
            <span class="azr-person-name">{{ result.personB.name || result.personB.roleLabel }}</span>
            <span class="azr-person-gender">{{ genderText(result.personB.gender) }}</span>
          </div>
          <div class="azr-person-asc">
            <span class="azr-person-asc-label">{{ $t('astroZhichangHepan.report.ascLabel') }}</span>
            <span class="azr-person-asc-value">{{ result.ascendantComparison.bSignZh }}</span>
            <span class="azr-person-mc">MC {{ result.careerFocus.personB.mcSignZh }}</span>
          </div>
          <div class="azr-person-meta">{{ elementLine(result.personB) }}</div>
        </div>
      </section>

      <!-- ============ 核心可视化：四元素雷达 + 事业宫位能量 ============ -->
      <section class="azr-section">
        <h3 class="azr-section-title">{{ $t('astroZhichangHepan.report.visualTitle') }}</h3>
        <div class="azr-row azr-row-charts">
          <!-- 四元素雷达 -->
          <div class="azr-card azr-chart">
            <h4 class="azr-chart-title">{{ $t('astroZhichangHepan.report.radarTitle') }}</h4>
            <div class="azr-radar-wrap">
              <svg viewBox="0 0 200 200" class="azr-radar">
                <polygon
                  v-for="ring in [1, 0.66, 0.33]"
                  :key="ring"
                  :points="radarRingPoints(ring)"
                  fill="none"
                  stroke="#d8d0bd"
                  stroke-width="1"
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
                />
                <polygon
                  :points="radarPointsA"
                  fill="rgba(168, 81, 46, 0.16)"
                  stroke="#a8512e"
                  stroke-width="1.5"
                />
                <polygon
                  :points="radarPointsB"
                  fill="rgba(74, 106, 138, 0.14)"
                  stroke="#4a6a8a"
                  stroke-width="1.5"
                />
                <text
                  v-for="(l, i) in radarLabels"
                  :key="i"
                  :x="l.x"
                  :y="l.y"
                  fill="#55503f"
                  class="azr-radar-label"
                  :text-anchor="l.anchor"
                >{{ l.text }}</text>
              </svg>
            </div>
            <div class="azr-gongbar-legend">
              <span class="azr-gongbar-lg"><i class="azr-lg-swatch azr-lg-swatch-a" />{{ result.personA.name || result.personA.roleLabel }}</span>
              <span class="azr-gongbar-lg"><i class="azr-lg-swatch azr-lg-swatch-b" />{{ result.personB.name || result.personB.roleLabel }}</span>
            </div>
          </div>

          <!-- 事业宫位能量柱状 -->
          <div class="azr-card azr-chart">
            <h4 class="azr-chart-title">{{ $t('astroZhichangHepan.report.houseBarTitle') }}</h4>
            <div class="azr-gongbar">
              <div v-for="h in careerHouses" :key="h.n" class="azr-gongbar-row">
                <span class="azr-gongbar-name">{{ houseShort(h.n) }}</span>
                <div class="azr-gongbar-bars">
                  <div class="azr-gongbar-line">
                    <span class="azr-gongbar-bar azr-gongbar-bar-a" :style="{ width: h.aPct + '%' }" />
                    <span class="azr-gongbar-val">{{ h.a }}</span>
                  </div>
                  <div class="azr-gongbar-line">
                    <span class="azr-gongbar-bar azr-gongbar-bar-b" :style="{ width: h.bPct + '%' }" />
                    <span class="azr-gongbar-val">{{ h.b }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="azr-gongbar-legend">
              <span class="azr-gongbar-lg"><i class="azr-gongbar-lg-swatch azr-gongbar-bar-a" />{{ result.personA.name || result.personA.roleLabel }}</span>
              <span class="azr-gongbar-lg"><i class="azr-gongbar-lg-swatch azr-gongbar-bar-b" />{{ result.personB.name || result.personB.roleLabel }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 事业重点对比表 ============ -->
      <section class="azr-section">
        <h3 class="azr-section-title">{{ $t('astroZhichangHepan.report.careerTableTitle') }}</h3>
        <div class="azr-card azr-table-card">
          <table class="azr-table">
            <thead>
              <tr>
                <th>{{ $t('astroZhichangHepan.report.colItem') }}</th>
                <th>{{ result.personA.name || result.personA.roleLabel }}</th>
                <th>{{ result.personB.name || result.personB.roleLabel }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in careerTable" :key="row.key">
                <td class="azr-table-item">{{ row.label }}</td>
                <td>{{ row.a }}</td>
                <td>{{ row.b }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ 跨盘相位 ============ -->
      <section class="azr-section">
        <h3 class="azr-section-title">{{ $t('astroZhichangHepan.report.aspectTitle') }}</h3>
        <div class="azr-card azr-aspect-card">
          <div v-if="aspectGroups.total" class="azr-aspect-stats">
            <span class="azr-aspect-stat azr-aspect-harmony">{{ $t('astroZhichangHepan.report.aspectHarmony') }} {{ aspectGroups.harmony }}</span>
            <span class="azr-aspect-stat azr-aspect-tension">{{ $t('astroZhichangHepan.report.aspectTension') }} {{ aspectGroups.tension }}</span>
            <span class="azr-aspect-stat azr-aspect-blend">{{ $t('astroZhichangHepan.report.aspectBlend') }} {{ aspectGroups.blend }}</span>
          </div>
          <div v-if="uniqueAspects.length" class="azr-aspect-list">
            <div v-for="(a, i) in uniqueAspects" :key="i" class="azr-aspect-item">
              <span class="azr-aspect-nature" :class="`azr-nature-${a.nature}`">{{ natureLabel(a.nature) }}</span>
              <span class="azr-aspect-text">{{ a.personA }} {{ planetZh(a.planetA) }} · {{ a.personB }} {{ planetZh(a.planetB) }}</span>
              <span class="azr-aspect-orb">{{ a.aspectType }} {{ a.orb }}°</span>
            </div>
          </div>
          <p v-else class="azr-none">{{ $t('astroZhichangHepan.noAspects') }}</p>
        </div>
      </section>

      <!-- ============ 宫位叠加 ============ -->
      <section class="azr-section">
        <h3 class="azr-section-title">{{ $t('astroZhichangHepan.report.overlayTitle') }}</h3>
        <div class="azr-row azr-row-overlay">
          <div class="azr-card azr-overlay">
            <h4 class="azr-overlay-title">{{ $t('astroZhichangHepan.aPlanetsInB', { a: result.personA.roleLabel, b: result.personB.roleLabel }) }}</h4>
            <div class="azr-overlay-grid">
              <div v-for="house in 12" :key="house" class="azr-overlay-cell">
                <span class="azr-overlay-house">{{ houseShort(house) }}</span>
                <span class="azr-overlay-planets">{{ (aInB[house] ?? []).join('、') || '—' }}</span>
              </div>
            </div>
          </div>
          <div class="azr-card azr-overlay">
            <h4 class="azr-overlay-title">{{ $t('astroZhichangHepan.bPlanetsInA', { a: result.personA.roleLabel, b: result.personB.roleLabel }) }}</h4>
            <div class="azr-overlay-grid">
              <div v-for="house in 12" :key="house" class="azr-overlay-cell">
                <span class="azr-overlay-house">{{ houseShort(house) }}</span>
                <span class="azr-overlay-planets">{{ (bInA[house] ?? []).join('、') || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ AI 章节 01-02 ============ -->
      <section class="azr-row azr-ai-row">
        <div class="azr-card azr-ai">
          <h3 class="azr-ai-title"><span class="azr-ai-no">01</span>{{ $t('astroZhichangHepan.report.secOverview') }}</h3>
          <div class="azr-ai-body azr-md" v-html="renderSection(aiSection('职场合盘总论', 0))" />
        </div>
        <div class="azr-card azr-ai">
          <h3 class="azr-ai-title"><span class="azr-ai-no">02</span>{{ $t('astroZhichangHepan.report.secChemistry') }}</h3>
          <div class="azr-ai-body azr-md" v-html="renderSection(aiSection('性格与行事化学反应', 1))" />
        </div>
      </section>

      <!-- ============ AI 章节 03-04 ============ -->
      <section class="azr-row azr-ai-row">
        <div class="azr-card azr-ai">
          <h3 class="azr-ai-title"><span class="azr-ai-no">03</span>{{ $t('astroZhichangHepan.report.secCareer') }}</h3>
          <div class="azr-ai-body azr-md" v-html="renderSection(aiSection('事业宫位与权力位差', 2))" />
        </div>
        <div class="azr-card azr-ai">
          <h3 class="azr-ai-title"><span class="azr-ai-no">04</span>{{ $t('astroZhichangHepan.report.secAspect') }}</h3>
          <div class="azr-ai-body azr-md" v-html="renderSection(aiSection('跨盘相位', 3))" />
        </div>
      </section>

      <!-- ============ AI 章节 05 关系优化建议 ============ -->
      <section class="azr-section">
        <div class="azr-card azr-ai">
          <h3 class="azr-ai-title"><span class="azr-ai-no">05</span>{{ $t('astroZhichangHepan.report.secAdvice') }}</h3>
          <div v-if="adviceList.length" class="azr-advice">
            <div v-for="(a, i) in adviceList" :key="i" class="azr-advice-item">
              <span class="azr-advice-num">{{ i + 1 }}</span>
              <div class="azr-advice-text">
                <div v-if="a.title" class="azr-advice-head">{{ a.title }}</div>
                <div class="azr-advice-desc">{{ a.desc }}</div>
              </div>
            </div>
          </div>
          <div v-else class="azr-ai-body azr-md" v-html="renderSection(aiSection('关系优化建议', 4))" />
        </div>
      </section>

      <!-- 流式中提示 -->
      <div v-if="streaming" class="azr-streaming">
        <span class="azr-streaming-dot" />
        {{ $t('astroZhichangHepan.report.streamingHint') }}
      </div>

      <!-- AI 错误 / 空响应 -->
      <div v-if="error" class="azr-error">
        <p>{{ error }}</p>
        <button type="button" class="azr-retry" @click="$emit('retry')">{{ $t('astroZhichangHepan.reinterpret') }}</button>
      </div>
      <div v-else-if="!streaming && emptyResponse" class="azr-error">
        <p>{{ $t('astroZhichangHepan.report.emptyHint') }}</p>
        <button type="button" class="azr-retry" @click="$emit('retry')">{{ $t('astroZhichangHepan.reinterpret') }}</button>
      </div>

      <!-- ============ 页脚 ============ -->
      <footer class="azr-foot">
        <span class="azr-foot-note">ⓘ {{ $t('astroZhichangHepan.report.footerNote') }}</span>
        <span class="azr-seal azr-seal-foot">{{ $t('astroZhichangHepan.report.sealFoot') }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { AstroZhichangCalcResult, AstroZhichangPerson } from '~/types/astro-zhichang-hepan'

interface Props {
  result: AstroZhichangCalcResult
  aiContent: string
  streaming: boolean
  error: string | null
}

const props = defineProps<Props>()
defineEmits<{ retry: [] }>()

const { t, locale } = useI18n()

/* ---------- 静态派生数据 ---------- */

const generatedAt = new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-')

const nameA = computed(() => props.result.personA.name || props.result.personA.roleLabel)
const nameB = computed(() => props.result.personB.name || props.result.personB.roleLabel)

const titleText = computed(() => t('astroZhichangHepan.report.title', { a: nameA.value, b: nameB.value }))
const pairMetaLine = computed(() => t('astroZhichangHepan.report.pairMeta', {
  a: nameA.value,
  ascA: props.result.ascendantComparison.aSignZh,
  b: nameB.value,
  ascB: props.result.ascendantComparison.bSignZh,
}))

function genderText(g: 'male' | 'female' | ''): string {
  if (g === 'male') return t('common.male')
  if (g === 'female') return t('common.female')
  return ''
}

/* ---------- 行星/宫位基础 ---------- */

const PLANET_ZH: Record<string, string> = {
  Sun: '太阳', Moon: '月亮', Mercury: '水星', Venus: '金星', Mars: '火星',
  Jupiter: '木星', Saturn: '土星', Uranus: '天王星', Neptune: '海王星', Pluto: '冥王星',
}
function planetZh(name: string): string {
  return PLANET_ZH[name] ?? name
}
function houseShort(n: number): string {
  return t('astroZhichangHepan.report.houseShort', { n })
}

/* ---------- 四元素 ---------- */

// sign 序号 1-12（白羊=1），元素按 (sign-1)%4：0 火 1 土 2 风 3 水
const ELEMENT_KEYS = ['fire', 'earth', 'air', 'water'] as const
type ElementKey = typeof ELEMENT_KEYS[number]

function elementIndex(sign: number): number {
  return ((sign - 1) % 4 + 4) % 4
}

function elementCounts(p: AstroZhichangPerson): Record<ElementKey, number> {
  const counts: Record<ElementKey, number> = { fire: 0, earth: 0, air: 0, water: 0 }
  for (const pl of p.chart.planets) {
    counts[ELEMENT_KEYS[elementIndex(pl.sign)]!]++
  }
  return counts
}

const elementA = computed(() => elementCounts(props.result.personA))
const elementB = computed(() => elementCounts(props.result.personB))

function elementLine(p: AstroZhichangPerson): string {
  const c = elementCounts(p)
  return t('astroZhichangHepan.report.elementLine', {
    fire: c.fire, earth: c.earth, air: c.air, water: c.water,
  })
}

const elementMax = computed(() => Math.max(
  1,
  ...ELEMENT_KEYS.map(k => Math.max(elementA.value[k], elementB.value[k])),
))

/* ---------- 雷达图 SVG 几何（4 轴） ---------- */

const RADAR_CENTER = 100
const RADAR_RADIUS = 70
const RADAR_COUNT = 4

const radarDims = computed(() => [
  { key: 'fire' as const, label: t('astroZhichangHepan.report.elFire') },
  { key: 'earth' as const, label: t('astroZhichangHepan.report.elEarth') },
  { key: 'air' as const, label: t('astroZhichangHepan.report.elAir') },
  { key: 'water' as const, label: t('astroZhichangHepan.report.elWater') },
])

function radarAngle(i: number): number {
  return (Math.PI * 2 * i) / RADAR_COUNT - Math.PI / 2
}
function radarPoint(i: number, ratio: number): { x: number; y: number } {
  const a = radarAngle(i)
  return { x: RADAR_CENTER + RADAR_RADIUS * ratio * Math.cos(a), y: RADAR_CENTER + RADAR_RADIUS * ratio * Math.sin(a) }
}
function fmt(n: number): string { return n.toFixed(1) }
function radarRingPoints(ratio: number): string {
  return Array.from({ length: RADAR_COUNT }, (_, i) => {
    const p = radarPoint(i, ratio)
    return `${fmt(p.x)},${fmt(p.y)}`
  }).join(' ')
}
const radarAxisEndpoints = computed(() => Array.from({ length: RADAR_COUNT }, (_, i) => radarPoint(i, 1)))

function radarPoints(counts: Record<ElementKey, number>): string {
  return ELEMENT_KEYS.map((k, i) => {
    const p = radarPoint(i, counts[k] / elementMax.value)
    return `${fmt(p.x)},${fmt(p.y)}`
  }).join(' ')
}
const radarPointsA = computed(() => radarPoints(elementA.value))
const radarPointsB = computed(() => radarPoints(elementB.value))

const radarLabels = computed(() => radarDims.value.map((d, i) => {
  const p = radarPoint(i, 1.2)
  const cos = Math.cos(radarAngle(i))
  let anchor: 'start' | 'middle' | 'end' = 'middle'
  if (cos > 0.3) anchor = 'start'
  else if (cos < -0.3) anchor = 'end'
  return { text: d.label, x: p.x, y: p.y, anchor }
}))

/* ---------- 事业宫位能量 ---------- */

const CAREER_HOUSES = [10, 6, 2, 1]

function housePlanetCount(p: AstroZhichangPerson, house: number): number {
  return p.chart.planets.filter(pl => pl.house === house).length
}

const careerHouses = computed(() => {
  const rows = CAREER_HOUSES.map(n => ({
    n,
    a: housePlanetCount(props.result.personA, n),
    b: housePlanetCount(props.result.personB, n),
  }))
  const max = Math.max(1, ...rows.map(r => Math.max(r.a, r.b)))
  return rows.map(r => ({ ...r, aPct: Math.round((r.a / max) * 100), bPct: Math.round((r.b / max) * 100) }))
})

/* ---------- 事业重点对比表 ---------- */

function planetHouseZh(p: AstroZhichangPerson, name: string): string {
  const pl = p.chart.planets.find(x => x.name === name)
  return pl ? t('astroZhichangHepan.report.houseShort', { n: pl.house }) : '—'
}
function tenthPlanets(p: AstroZhichangPerson): string {
  const list = p.chart.planets.filter(pl => pl.house === 10).map(pl => planetZh(pl.name))
  return list.join('、') || t('astroZhichangHepan.report.none')
}

const careerTable = computed(() => [
  { key: 'asc', label: t('astroZhichangHepan.report.rowAsc'), a: props.result.ascendantComparison.aSignZh, b: props.result.ascendantComparison.bSignZh },
  { key: 'mc', label: t('astroZhichangHepan.report.rowMc'), a: props.result.careerFocus.personA.mcSignZh, b: props.result.careerFocus.personB.mcSignZh },
  { key: 'tenth', label: t('astroZhichangHepan.report.rowTenth'), a: tenthPlanets(props.result.personA), b: tenthPlanets(props.result.personB) },
  { key: 'saturn', label: t('astroZhichangHepan.report.rowSaturn'), a: planetHouseZh(props.result.personA, 'Saturn'), b: planetHouseZh(props.result.personB, 'Saturn') },
  { key: 'jupiter', label: t('astroZhichangHepan.report.rowJupiter'), a: planetHouseZh(props.result.personA, 'Jupiter'), b: planetHouseZh(props.result.personB, 'Jupiter') },
  { key: 'sun', label: t('astroZhichangHepan.report.rowSun'), a: planetHouseZh(props.result.personA, 'Sun'), b: planetHouseZh(props.result.personB, 'Sun') },
])

/* ---------- 跨盘相位 ---------- */

const uniqueAspects = computed(() => {
  const seen = new Set<string>()
  return props.result.crossAspects.filter((a) => {
    const key = [a.planetA, a.planetB].sort().join('-') + `-${a.aspectType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 12)
})

const aspectGroups = computed(() => {
  const g = { harmony: 0, tension: 0, blend: 0, total: uniqueAspects.value.length }
  for (const a of uniqueAspects.value) g[a.nature]++
  return g
})

function natureLabel(nature: 'harmony' | 'tension' | 'blend'): string {
  return t(`astroZhichangHepan.report.nature.${nature}`)
}

/* ---------- 宫位叠加 ---------- */

function groupOverlays(overlays: AstroZhichangCalcResult['aPlanetsInB']) {
  const g: Record<number, string[]> = {}
  for (const o of overlays) {
    g[o.house] = g[o.house] ?? []
    g[o.house]!.push(planetZh(o.planet))
  }
  return g
}
const aInB = computed(() => groupOverlays(props.result.aPlanetsInB))
const bInA = computed(() => groupOverlays(props.result.bPlanetsInA))

/* ---------- AI 内容解析 ---------- */

const aiSectionsList = computed<{ title: string; content: string }[]>(() => {
  const text = props.aiContent || ''
  if (!text) return []
  return text
    .split(/\n(?=##\s)/)
    .map(raw => raw.trim())
    .filter(raw => raw.startsWith('##'))
    .map((raw) => {
      const nl = raw.indexOf('\n')
      const title = (nl === -1 ? raw : raw.slice(0, nl)).replace(/^##\s*/, '').trim()
      const content = nl === -1 ? '' : raw.slice(nl + 1).trim()
      return { title, content }
    })
    .filter(s => s.title)
})

function aiSection(keyword: string, index: number): string {
  const list = aiSectionsList.value
  const byTitle = list.find(s => s.title.includes(keyword))
  if (byTitle) return byTitle.content
  return list[index]?.content ?? ''
}

const pendingText = computed(() => t('astroZhichangHepan.report.pending'))

/** AI 完全空响应（流结束但没有任何章节内容） */
const emptyResponse = computed(() => !props.error && !(props.aiContent || '').trim())

function renderSection(content: string | undefined): string {
  if (!content) return `<p class="azr-pending">${pendingText.value}</p>`
  return marked.parse(content, { async: false }) as string
}

/** 副标题：取总论首句 */
const subtitleText = computed(() => {
  const c = aiSection('职场合盘总论', 0)
  const plain = c.replace(/[#*]/g, '').split('\n').join('，').trim()
  const first = (plain.split(/[。！!？?]/)[0] ?? '').replace(/^[，,、\s]+/, '').trim()
  return first ? first.slice(0, 48) : t('astroZhichangHepan.report.subtitleFallback')
})

/* ---------- 关系优化建议解析 ---------- */

const adviceList = computed<{ title: string; desc: string }[]>(() => {
  const content = aiSection('关系优化建议', 4)
  if (!content) return []
  return content
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+[.、)]\s*/, '').trim())
    .filter(Boolean)
    .map((l) => {
      const stripped = l.replace(/\*\*/g, '')
      const m = stripped.match(/^(.{1,20}?)[：:](.+)$/)
      return m ? { title: m[1]!.trim(), desc: m[2]!.trim() } : { title: '', desc: stripped }
    })
    .slice(0, 6)
})
</script>

<style scoped>
/* ========== 纸质报告主题 ========== */
.azr {
  --azr-bg: #f2ede3;
  --azr-sheet: #faf6ec;
  --azr-card: #fffdf6;
  --azr-ink: #2e2a24;
  --azr-ink-soft: #55503f;
  --azr-ink-faint: #8a8272;
  --azr-line: #d8d0bd;
  --azr-line-soft: #e6dfcd;
  --azr-accent: #8c2f26;
  --azr-accent-soft: #a8512e;
  --azr-green: #4a7c59;
  --azr-blue: #4a6a8a;
  border-radius: 12px;
  background: var(--azr-bg);
  padding: 18px;
  color: var(--azr-ink);
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.azr-sheet {
  background: var(--azr-sheet);
  border: 1px solid var(--azr-line);
  box-shadow: 0 2px 18px rgba(60, 48, 30, 0.12);
  padding: 28px 30px 22px;
}

/* ---------- 报告头 ---------- */
.azr-head { border-bottom: 2px solid var(--azr-ink); padding-bottom: 16px; }
.azr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.azr-brand { display: flex; align-items: center; gap: 8px; }
.azr-seal {
  width: 40px; height: 40px;
  border: 2px solid var(--azr-accent);
  color: var(--azr-accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; line-height: 1.15;
  border-radius: 4px;
  transform: rotate(-4deg);
  letter-spacing: 1px;
  padding: 2px;
}
.azr-brand-name { font-size: 13px; letter-spacing: 2px; color: var(--azr-ink-soft); }
.azr-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; color: var(--azr-ink-faint); }
.azr-verdict { color: var(--azr-green); font-weight: 600; }
.azr-rating { letter-spacing: 1px; }

.azr-title { margin: 14px 0 6px; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-align: center; }
.azr-subtitle { text-align: center; font-size: 13px; color: var(--azr-ink-soft); letter-spacing: 1px; margin: 0 0 12px; }
.azr-head-bottom { text-align: center; }
.azr-meta-line { margin: 2px 0; font-size: 12px; color: var(--azr-ink-faint); letter-spacing: 1px; }

/* ---------- 通用卡片/行 ---------- */
.azr-row { display: grid; gap: 14px; margin-top: 16px; }
.azr-row-profiles { grid-template-columns: 1fr auto 1fr; align-items: stretch; }
.azr-row-charts { grid-template-columns: 1fr 1.1fr; }
.azr-row-overlay { grid-template-columns: 1fr 1fr; }
.azr-ai-row { grid-template-columns: 1fr 1fr; }
.azr-section { margin-top: 16px; }

.azr-card { background: var(--azr-card); border: 1px solid var(--azr-line); padding: 14px 16px; }
.azr-section-title { margin: 0 0 8px; font-size: 14px; font-weight: 700; letter-spacing: 2px; }

/* ---------- 双人档案条 ---------- */
.azr-person { display: flex; flex-direction: column; gap: 10px; }
.azr-person-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.azr-person-role {
  font-size: 10px; letter-spacing: 1px;
  border: 1px solid var(--azr-accent); color: var(--azr-accent);
  padding: 1px 6px; border-radius: 2px;
}
.azr-person-name { font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.azr-person-gender { font-size: 11px; color: var(--azr-ink-faint); }
.azr-person-asc {
  display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
  border: 1px solid var(--azr-line-soft);
  padding: 8px 10px;
  background: rgba(140, 47, 38, 0.03);
}
.azr-person-asc-label { font-size: 9px; color: var(--azr-ink-faint); letter-spacing: 1px; }
.azr-person-asc-value { font-size: 15px; font-weight: 700; color: var(--azr-accent); letter-spacing: 0.5px; }
.azr-person-mc { font-size: 11px; color: var(--azr-ink-faint); }
.azr-person-meta { font-size: 11px; color: var(--azr-ink-faint); line-height: 1.5; }
.azr-person-vs { align-self: center; font-size: 22px; font-weight: 700; color: var(--azr-accent-soft); }

/* ---------- 图表白卡 ---------- */
.azr-chart { display: flex; flex-direction: column; }
.azr-chart-title {
  margin: 0 0 12px; font-size: 13px; font-weight: 700;
  letter-spacing: 1px; text-align: center;
  border-bottom: 1px solid var(--azr-line-soft); padding-bottom: 8px;
}

/* ---------- 宫位能量柱状 ---------- */
.azr-gongbar { display: flex; flex-direction: column; gap: 10px; }
.azr-gongbar-row { display: flex; align-items: center; gap: 8px; }
.azr-gongbar-name { width: 34px; font-size: 11px; font-weight: 700; color: var(--azr-ink-soft); flex-shrink: 0; }
.azr-gongbar-bars { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.azr-gongbar-line { display: flex; align-items: center; gap: 5px; }
.azr-gongbar-bar { display: block; height: 7px; min-width: 2px; }
.azr-gongbar-bar-a { background: var(--azr-accent-soft); }
.azr-gongbar-bar-b { background: var(--azr-blue); }
.azr-gongbar-val { font-size: 9px; color: var(--azr-ink-faint); width: 18px; flex-shrink: 0; }
.azr-gongbar-legend {
  display: flex; gap: 16px; justify-content: center;
  margin-top: 12px; padding-top: 10px;
  border-top: 1px dashed var(--azr-line-soft);
}
.azr-gongbar-lg { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--azr-ink-soft); }
.azr-gongbar-lg-swatch { width: 12px; height: 7px; display: inline-block; }
.azr-lg-swatch { width: 12px; height: 7px; display: inline-block; }
.azr-lg-swatch-a { background: var(--azr-accent-soft); }
.azr-lg-swatch-b { background: var(--azr-blue); }

/* ---------- 雷达图 ---------- */
.azr-radar-wrap { display: flex; justify-content: center; }
.azr-radar { width: 100%; max-width: 240px; height: auto; }
.azr-radar-label { font-size: 9px; letter-spacing: 0.5px; }

/* ---------- 对比表 ---------- */
.azr-table-card { padding: 6px 8px; overflow-x: auto; }
.azr-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.azr-table th, .azr-table td {
  border: 1px solid var(--azr-line-soft);
  padding: 8px 10px; text-align: center;
  color: var(--azr-ink-soft); line-height: 1.5;
}
.azr-table thead th {
  background: rgba(140, 47, 38, 0.05);
  color: var(--azr-ink); font-weight: 700;
  letter-spacing: 1px; font-size: 12.5px;
}
.azr-table-item { font-weight: 700; color: var(--azr-accent) !important; letter-spacing: 1px; white-space: nowrap; }

/* ---------- 跨盘相位 ---------- */
.azr-aspect-card { display: flex; flex-direction: column; gap: 10px; }
.azr-aspect-stats { display: flex; gap: 14px; flex-wrap: wrap; }
.azr-aspect-stat { font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border-radius: 2px; }
.azr-aspect-harmony { color: var(--azr-green); border: 1px solid var(--azr-green); }
.azr-aspect-tension { color: var(--azr-accent); border: 1px solid var(--azr-accent); }
.azr-aspect-blend { color: var(--azr-blue); border: 1px solid var(--azr-blue); }
.azr-aspect-list { display: flex; flex-direction: column; gap: 6px; }
.azr-aspect-item {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--azr-line-soft);
  padding: 6px 10px; font-size: 12px;
}
.azr-aspect-nature { font-size: 9px; letter-spacing: 1px; padding: 1px 5px; border-radius: 2px; flex-shrink: 0; color: #fffdf6; }
.azr-nature-harmony { background: var(--azr-green); }
.azr-nature-tension { background: var(--azr-accent); }
.azr-nature-blend { background: var(--azr-blue); }
.azr-aspect-text { flex: 1; color: var(--azr-ink); }
.azr-aspect-orb { font-size: 10px; color: var(--azr-ink-faint); flex-shrink: 0; }
.azr-none { margin: 0; font-size: 12px; color: var(--azr-ink-faint); font-style: italic; }

/* ---------- 宫位叠加 ---------- */
.azr-overlay { display: flex; flex-direction: column; }
.azr-overlay-title {
  margin: 0 0 10px; font-size: 12px; font-weight: 700;
  letter-spacing: 1px; text-align: center;
  border-bottom: 1px solid var(--azr-line-soft); padding-bottom: 8px;
}
.azr-overlay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.azr-overlay-cell {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid var(--azr-line-soft);
  padding: 4px 8px; font-size: 11px;
}
.azr-overlay-house { font-weight: 700; color: var(--azr-accent); flex-shrink: 0; font-size: 10px; }
.azr-overlay-planets { color: var(--azr-ink-soft); }

/* ---------- AI 章节 ---------- */
.azr-ai-title {
  margin: 0 0 10px; font-size: 14px; font-weight: 700; letter-spacing: 2px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--azr-line-soft); padding-bottom: 8px;
}
.azr-ai-no { font-size: 11px; color: #f5efe0; background: var(--azr-ink); padding: 2px 6px; letter-spacing: 1px; }
.azr-ai-body { font-size: 12.5px; line-height: 1.8; color: var(--azr-ink-soft); }

.azr-md :deep(p) { margin: 0 0 0.7em; }
.azr-md :deep(p:last-child) { margin-bottom: 0; }
.azr-md :deep(strong) { color: var(--azr-ink); font-weight: 700; }
.azr-md :deep(ul), .azr-md :deep(ol) { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
.azr-md :deep(li) { margin-bottom: 0.35em; line-height: 1.7; }
.azr-md :deep(h3), .azr-md :deep(h4) { font-size: 12.5px; font-weight: 700; color: var(--azr-ink); margin: 0.8em 0 0.4em; letter-spacing: 1px; }
.azr-md { overflow-x: auto; }
.azr-md :deep(.azr-pending), .azr-pending { color: var(--azr-ink-faint); font-style: italic; }

/* ---------- 关系优化建议 ---------- */
.azr-advice { display: flex; flex-direction: column; gap: 10px; }
.azr-advice-item { display: flex; gap: 9px; align-items: flex-start; }
.azr-advice-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--azr-ink); color: #f5efe0;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.azr-advice-head { font-size: 12.5px; font-weight: 700; color: var(--azr-ink); }
.azr-advice-desc { font-size: 12px; color: var(--azr-ink-soft); line-height: 1.7; margin-top: 1px; }

.azr-streaming {
  margin-top: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; color: var(--azr-ink-faint); letter-spacing: 1px;
}
.azr-streaming-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--azr-accent);
  animation: azr-pulse 1s ease-in-out infinite;
}
@keyframes azr-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.azr-error { margin-top: 14px; text-align: center; color: var(--azr-accent); font-size: 12px; }
.azr-retry {
  margin-top: 8px; border: 1px solid var(--azr-accent);
  background: transparent; color: var(--azr-accent);
  font-size: 12px; padding: 5px 16px;
  cursor: pointer; font-family: inherit; letter-spacing: 1px;
}
.azr-retry:hover { background: rgba(140, 47, 38, 0.06); }

/* ---------- 页脚 ---------- */
.azr-foot {
  margin-top: 18px; border-top: 1px solid var(--azr-line);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
}
.azr-foot-note { font-size: 10px; color: var(--azr-ink-faint); }
.azr-seal-foot { width: 34px; height: 34px; font-size: 9px; transform: rotate(3deg); }

/* grid 子元素默认 min-width:auto，不收缩会硬溢出；统一允许收缩 */
.azr-card, .azr-ai, .azr-chart, .azr-person, .azr-table-card, .azr-overlay { min-width: 0; }

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  .azr-row-charts { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .azr { padding: 8px; }
  .azr-sheet { padding: 16px 12px; }
  .azr-row-profiles { grid-template-columns: 1fr; }
  .azr-person-vs { display: none; }
  .azr-row-overlay { grid-template-columns: 1fr; }
  .azr-ai-row { grid-template-columns: 1fr; }
  .azr-title { font-size: 20px; letter-spacing: 2px; }
}
</style>
