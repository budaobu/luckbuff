<template>
  <div class="mbp">
    <div class="mbp-sheet">
      <div class="mbp-mesh" aria-hidden="true" />

      <header class="mbp-head">
        <div class="mbp-brand-row">
          <span class="mbp-brand">{{ $t('mangpaiBazi.poster.brand') }}</span>
          <span class="mbp-era">{{ result.flowYear.year }} · {{ result.flowYear.gan }}{{ result.flowYear.zhi }}</span>
        </div>

        <h1 class="mbp-title">{{ $t('mangpaiBazi.poster.title') }}</h1>
        <p class="mbp-subtitle">{{ $t('mangpaiBazi.poster.subtitle', { dayMaster: result.dayMaster.gan, strength: result.chart.riZhuStrength }) }}</p>

        <div class="mbp-pillars" aria-hidden="false">
          <div
            v-for="item in pillarItems"
            :key="item.label"
            class="mbp-pillar"
          >
            <span class="mbp-pillar-label">{{ item.label }}</span>
            <span class="mbp-pillar-ganzhi">{{ item.ganzhi }}</span>
            <span class="mbp-pillar-god">{{ item.god }}</span>
          </div>
        </div>

        <p class="mbp-overview">
          <span v-if="!overview && streaming" class="mbp-skeleton" />
          <template v-else>{{ overview || $t('mangpaiBazi.poster.pending') }}</template>
        </p>
      </header>

      <section class="mbp-ring">
        <div class="mbp-ring-title">
          <span>{{ $t('mangpaiBazi.poster.godRing') }}</span>
          <b>{{ result.shensha.flowYearBranch }}{{ $t('mangpaiBazi.poster.godStart') }}</b>
        </div>
        <p class="mbp-ring-legend">{{ $t('mangpaiBazi.poster.godRingLegend') }}</p>

        <svg
          class="mbp-god-chart"
          viewBox="0 0 400 330"
          role="img"
          :aria-label="`${$t('mangpaiBazi.poster.godRing')} · ${result.shensha.flowYearBranch}${$t('mangpaiBazi.poster.godStart')}`"
        >
          <g class="mbp-chart-grid">
            <circle cx="200" cy="165" r="104" />
            <circle cx="200" cy="165" r="35" />
            <line
              v-for="god in godChartNodes"
              :key="`spoke-${god.branch}`"
              :x1="god.spokeStart.x"
              :y1="god.spokeStart.y"
              :x2="god.point.x"
              :y2="god.point.y"
            />
          </g>

          <path
            v-for="mark in natalChartMarks"
            :key="`line-${mark.branch}`"
            class="mbp-chart-line"
            pathLength="1"
            :d="mark.path"
          />

          <g
            v-for="god in godChartNodes"
            :key="god.branch"
            class="mbp-chart-node"
            :class="{ 'is-flow-year': god.branch === result.shensha.flowYearBranch }"
          >
            <circle :cx="god.point.x" :cy="god.point.y" r="2.4" />
            <circle
              v-if="god.branch === result.shensha.flowYearBranch"
              :cx="god.point.x"
              :cy="god.point.y"
              r="7.5"
              class="mbp-flow-ring"
            />
            <text
              class="mbp-god-label"
              :x="god.label.x"
              :y="god.label.y"
              :text-anchor="god.label.anchor"
            >
              {{ god.branch }} · {{ god.name }}
            </text>
          </g>

          <g
            v-for="mark in natalChartMarks"
            :key="mark.branch"
            class="mbp-natal-mark"
          >
            <circle :cx="mark.point.x" :cy="mark.point.y" r="4.4" />
            <text
              class="mbp-natal-label"
              :x="mark.innerLabel.x"
              :y="mark.innerLabel.y"
              :text-anchor="mark.innerLabel.anchor"
            >
              {{ mark.labels.join('/') }}
            </text>
          </g>

          <g class="mbp-day-master">
            <circle cx="200" cy="165" r="30" />
            <text x="200" y="158" class="mbp-day-master-gan">
              {{ result.dayMaster.gan }}
            </text>
            <text x="200" y="180" class="mbp-day-master-label">
              {{ $t('mangpaiBazi.poster.dayMaster') }}
            </text>
          </g>
        </svg>

        <p class="mbp-ring-note">{{ $t('mangpaiBazi.poster.godRingNote') }}</p>
      </section>

      <section
        v-for="section in activeSections"
        :key="section.id"
        class="mbp-section"
        :class="`mbp-${section.id}`"
      >
        <div class="mbp-section-head">
          <span class="mbp-section-name">{{ $t(`mangpaiBazi.poster.sections.${section.id}`) }}</span>
          <span v-if="section.periods.length" class="mbp-years">
            {{ section.periods.join(' · ') }}
          </span>
        </div>
        <p class="mbp-verdict">{{ section.text }}</p>
        <p class="mbp-basis">
          {{ $t('mangpaiBazi.poster.basisPrefix') }}{{ section.basis }}
        </p>
      </section>

      <section v-if="streaming" class="mbp-section mbp-section-pending">
        <div class="mbp-section-head">
          <span class="mbp-section-name">{{ $t('mangpaiBazi.poster.generating') }}</span>
        </div>
        <span class="mbp-skeleton mbp-skeleton-wide" />
      </section>

      <p v-if="error && !hasSections" class="mbp-error">{{ error }}</p>

      <footer class="mbp-foot">
        <div class="mbp-sign">
          <span class="mbp-seal">{{ $t('mangpaiBazi.poster.seal') }}</span>
          <span class="mbp-site">{{ siteDomain }}</span>
        </div>
        <div class="mbp-disclaimer-row">
          <p class="mbp-disclaimer">{{ $t('mangpaiBazi.poster.disclaimer') }}</p>
          <div class="mbp-qr" aria-hidden="true">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="qrSvg" v-html="qrSvg" />
            <span v-else>QR</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MangpaiCalcResult, MangpaiPosterData, MangpaiSection } from '~/types/mangpai-bazi'

interface Props {
  result: MangpaiCalcResult
  data: MangpaiPosterData
  streaming?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  error: null,
})

const { t } = useI18n()
const siteDomain = 'www.ososn.com'
const overview = computed(() => props.data.overview)
const hasSections = computed(() => Object.keys(props.data.sections).length > 0)

const pillarItems = computed(() => {
  const chart = props.result.chart
  const godOf = (pillar: typeof chart.year) =>
    props.result.shensha.natal.find(item => item.gan === pillar.gan && item.zhi === pillar.zhi)?.god ?? ''

  return [
    { label: t('mangpaiBazi.poster.year'), pillar: chart.year },
    { label: t('mangpaiBazi.poster.month'), pillar: chart.month },
    { label: t('mangpaiBazi.poster.day'), pillar: chart.day },
    { label: t('mangpaiBazi.poster.hour'), pillar: chart.hour },
  ].map((item) => {
    if (!item.pillar) {
      return { label: item.label, ganzhi: t('mangpaiBazi.poster.unknown'), god: '' }
    }
    return {
      label: item.label,
      ganzhi: `${item.pillar.gan}${item.pillar.zhi}`,
      god: godOf(item.pillar),
    }
  })
})

// L5 Radial Convergence skeleton: god positions on the rim, natal branches converge to the day master.
const godChartNodes = computed(() => {
  return props.result.shensha.ring.map((god, index) => {
    const angle = index * 30 - 90
    const radians = angle * Math.PI / 180
    const point = {
      x: 200 + Math.cos(radians) * 104,
      y: 165 + Math.sin(radians) * 104,
    }
    const spokeStart = {
      x: 200 + Math.cos(radians) * 38,
      y: 165 + Math.sin(radians) * 38,
    }
    const labelPoint = {
      x: 200 + Math.cos(radians) * 130,
      y: 165 + Math.sin(radians) * 130,
    }
    const anchor = Math.cos(radians) > 0.25
      ? 'start'
      : Math.cos(radians) < -0.25 ? 'end' : 'middle'

    return {
      ...god,
      angle,
      point,
      spokeStart,
      label: {
        ...labelPoint,
        y: labelPoint.y + (Math.sin(radians) < -0.5 ? -2 : Math.sin(radians) > 0.5 ? 9 : 4),
        anchor,
      },
    }
  })
})

const natalChartMarks = computed(() => {
  const labeledPillars = [
    { label: props.result.chart.year, pillar: props.result.chart.year },
    { label: props.result.chart.month, pillar: props.result.chart.month },
    { label: props.result.chart.day, pillar: props.result.chart.day },
    { label: props.result.chart.hour, pillar: props.result.chart.hour },
  ].filter((item): item is { label: NonNullable<typeof item.label>; pillar: NonNullable<typeof item.pillar> } => {
    return Boolean(item.label)
  })
  const pillarLabels = [
    t('mangpaiBazi.poster.year'),
    t('mangpaiBazi.poster.month'),
    t('mangpaiBazi.poster.day'),
    t('mangpaiBazi.poster.hour'),
  ]

  return labeledPillars
    .map((item, index) => ({ ...item, pillarLabel: pillarLabels[index] ?? '' }))
    .reduce<Array<{ branch: string; labels: string[]; point: { x: number; y: number }; path: string; innerLabel: { x: number; y: number; anchor: string } }>>((marks, item) => {
      const existing = marks.find(mark => mark.branch === item.pillar.zhi)
      if (existing) {
        if (!existing.labels.includes(item.pillarLabel)) existing.labels.push(item.pillarLabel)
        return marks
      }

      const node = godChartNodes.value.find(node => node.branch === item.pillar.zhi)
      if (!node) return marks

      const inner = {
        x: 200 + (node.point.x - 200) * 0.74,
        y: 165 + (node.point.y - 165) * 0.74,
      }

      marks.push({
        branch: item.pillar.zhi,
        labels: [item.pillarLabel],
        point: node.point,
        path: `M${node.point.x} ${node.point.y} C${200 + (node.point.x - 200) * 0.42} ${165 + (node.point.y - 165) * 0.42} ${200 + (node.point.x - 200) * 0.24} ${165 + (node.point.y - 165) * 0.24} 200 165`,
        innerLabel: {
          x: inner.x + (node.point.x - 200) * -0.12,
          y: inner.y + (node.point.y - 165) * -0.12 + 3,
          anchor: Math.cos(node.angle * Math.PI / 180) > 0.25
            ? 'start'
            : Math.cos(node.angle * Math.PI / 180) < -0.25 ? 'end' : 'middle',
        },
      })
      return marks
    }, [])
})

const sectionOrder: MangpaiSection['id'][] = [
  'family', 'career', 'wealth', 'marriage', 'health', 'timing',
]

const activeSections = computed(() =>
  sectionOrder
    .map(id => props.data.sections[id])
    .filter((section): section is MangpaiSection => Boolean(section)),
)

const qrSvg = ref('')
onMounted(async () => {
  const QRCode = (await import('qrcode')).default
  qrSvg.value = await QRCode.toString(`${window.location.origin}/tools/mangpai-bazi`, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#6d5024', light: '#00000000' },
  })
})
</script>

<style scoped>
.mbp {
  --mbp-shell: #f1e8d6;
  --mbp-sheet: #fdf8ec;
  --mbp-paper: #fffaf0;
  --mbp-line: #d8cdb5;
  --mbp-line-soft: #e7dcc6;
  --mbp-ink: #383126;
  --mbp-ink-soft: #6a6050;
  --mbp-ink-faint: #938877;
  --mbp-bronze: #8a5a25;
  --mbp-bronze-dark: #6d471c;
  --mbp-cinnabar: #a83a2d;
  width: 100%;
  color: var(--mbp-ink);
  background: var(--mbp-shell);
  padding: 10px;
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.mbp-sheet {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgba(166, 124, 0, 0.05), transparent 34%),
    var(--mbp-sheet);
  border: 1px solid var(--mbp-line);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.72),
    inset 0 0 34px rgba(166, 124, 0, 0.07),
    0 20px 48px -38px rgba(69, 55, 20, 0.55);
}

.mbp-mesh {
  position: absolute;
  inset: 8px;
  border: 1px solid var(--mbp-line-soft);
  opacity: 0.4;
  pointer-events: none;
}

.mbp-head {
  padding: 28px 22px 24px;
  border-bottom: 1px solid var(--mbp-line);
  text-align: center;
}

.mbp-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--mbp-ink-faint);
  font-size: 10px;
  letter-spacing: 3px;
}

.mbp-brand {
  color: var(--mbp-bronze);
  font-weight: 700;
}

.mbp-era {
  font-variant-numeric: tabular-nums;
}

.mbp-title {
  margin: 24px 0 0;
  font-size: clamp(30px, 9vw, 44px);
  line-height: 1;
  letter-spacing: 7px;
  font-weight: 700;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}

.mbp-subtitle {
  margin: 12px auto 0;
  max-width: 24em;
  color: var(--mbp-ink-soft);
  font-size: 12.5px;
  letter-spacing: 1.5px;
}

.mbp-pillars {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 24px;
}

.mbp-pillar {
  min-height: 142px;
  padding: 10px 6px;
  background: linear-gradient(180deg, rgba(166, 124, 0, 0.06), rgba(166, 124, 0, 0.015));
  border: 1px solid var(--mbp-line);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.mbp-pillar-label {
  font-size: 10px;
  color: var(--mbp-bronze);
  letter-spacing: 2px;
}

.mbp-pillar-ganzhi {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 25px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 5px;
}

.mbp-pillar-god {
  min-height: 18px;
  font-size: 10px;
  color: var(--mbp-cinnabar);
  letter-spacing: 1px;
  white-space: nowrap;
}

.mbp-overview {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 22px auto 0;
  max-width: 33em;
  font-size: 13px;
  line-height: 1.75;
  color: var(--mbp-ink);
}

.mbp-ring {
  padding: 16px 22px;
  border-bottom: 1px solid var(--mbp-line);
}

.mbp-ring-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--mbp-bronze);
  font-size: 11px;
  letter-spacing: 3px;
}

.mbp-ring-title b {
  color: var(--mbp-ink);
  font-weight: 700;
}

.mbp-ring-legend {
  margin: 8px 0 0;
  color: var(--mbp-ink-faint);
  font-size: 10px;
  letter-spacing: 1px;
}

.mbp-god-chart {
  display: block;
  width: 100%;
  max-height: 360px;
  margin-top: 4px;
}

.mbp-chart-grid circle,
.mbp-chart-grid line {
  fill: none;
  stroke: var(--mbp-line-soft);
  stroke-width: 0.7;
  stroke-dasharray: 2 4;
}

.mbp-chart-line {
  fill: none;
  stroke: var(--mbp-bronze);
  stroke-width: 0.9;
  stroke-linecap: round;
  opacity: 0.9;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: mbp-draw 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.mbp-chart-node circle {
  fill: var(--mbp-bronze-dark);
}

.mbp-chart-node .mbp-flow-ring {
  fill: none;
  stroke: var(--mbp-cinnabar);
  stroke-width: 1.4;
}

.mbp-god-label {
  fill: var(--mbp-ink-soft);
  font-size: 11px;
  font-weight: 600;
  dominant-baseline: middle;
}

.mbp-flow-ring + .mbp-god-label {
  fill: var(--mbp-ink);
}

.mbp-natal-mark circle {
  fill: var(--mbp-ink);
}

.mbp-natal-label {
  fill: var(--mbp-bronze);
  font-size: 9.5px;
  font-weight: 700;
  dominant-baseline: middle;
}

.mbp-day-master circle {
  fill: var(--mbp-paper);
  stroke: var(--mbp-bronze-dark);
  stroke-width: 1;
}

.mbp-day-master-gan {
  fill: var(--mbp-ink);
  font-size: 20px;
  font-weight: 700;
  text-anchor: middle;
}

.mbp-day-master-label {
  fill: var(--mbp-ink-faint);
  font-size: 9px;
  letter-spacing: 1px;
  text-anchor: middle;
}

.mbp-ring-note {
  margin: 2px 0 0;
  color: var(--mbp-ink-faint);
  font-size: 9px;
  letter-spacing: 1px;
  text-align: center;
}

.mbp-ring-cell {
  min-width: 0;
  padding: 6px 3px;
  border: 1px solid var(--mbp-line-soft);
  background: rgba(255, 250, 240, 0.78);
  color: var(--mbp-ink-soft);
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mbp-ring-cell i {
  margin-right: 3px;
  color: var(--mbp-bronze);
  font-style: normal;
}

.mbp-ring-cell.is-flow-year {
  border-color: var(--mbp-cinnabar);
  color: var(--mbp-ink);
}

.mbp-section {
  position: relative;
  padding: 18px 22px 17px;
  border-bottom: 1px solid var(--mbp-line);
}

.mbp-section::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 2px;
  background: var(--mbp-bronze-dark);
}

.mbp-section-health::before { background: var(--mbp-bronze); }
.mbp-section-timing::before { background: var(--mbp-cinnabar); }

.mbp-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mbp-section-name {
  color: var(--mbp-bronze);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
}

.mbp-years {
  flex-shrink: 0;
  border: 1px solid var(--mbp-bronze-dark);
  color: var(--mbp-bronze);
  padding: 3px 7px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  white-space: nowrap;
}

.mbp-verdict {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 0.4px;
}

.mbp-basis {
  margin: 8px 0 0;
  color: var(--mbp-ink-faint);
  font-size: 11px;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

.mbp-section-pending {
  display: flex;
  align-items: center;
  min-height: 78px;
}

.mbp-section-pending .mbp-section-head {
  width: 130px;
  flex-shrink: 0;
}

.mbp-skeleton {
  display: inline-block;
  width: 58%;
  height: 12px;
  background: linear-gradient(90deg, transparent, rgba(166, 124, 0, 0.22), transparent);
  animation: mbp-shimmer 1.3s infinite;
}

.mbp-skeleton-wide { width: 100%; }

@keyframes mbp-shimmer {
  from { transform: translateX(-35%); }
  to { transform: translateX(35%); }
}

@keyframes mbp-draw {
  to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .mbp-chart-line {
    animation: none;
    stroke-dasharray: none;
    stroke-dashoffset: 0;
  }

  .mbp-skeleton {
    animation: none;
  }
}

.mbp-error {
  margin: 0;
  padding: 16px 22px;
  color: var(--mbp-cinnabar);
  font-size: 12px;
}

.mbp-foot {
  padding: 18px 22px;
  background: linear-gradient(180deg, transparent, rgba(166, 124, 0, 0.06));
}

.mbp-sign {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mbp-seal {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border: 2px solid var(--mbp-cinnabar);
  color: var(--mbp-cinnabar);
  transform: rotate(-5deg);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
}

.mbp-site {
  color: var(--mbp-bronze);
  font-size: 12px;
  letter-spacing: 1px;
}

.mbp-disclaimer-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 46px;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  border-top: 1px solid var(--mbp-line-soft);
  padding-top: 12px;
}

.mbp-disclaimer {
  margin: 0;
  color: var(--mbp-ink-faint);
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

.mbp-qr {
  width: 46px;
  height: 46px;
  overflow: hidden;
}

.mbp-qr :deep(svg) {
  width: 100%;
  height: 100%;
}

.mbp-qr span {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border: 1px solid var(--mbp-line);
  color: var(--mbp-ink-faint);
  font-size: 9px;
}

@media (max-width: 420px) {
  .mbp-head,
  .mbp-ring,
  .mbp-section,
  .mbp-foot {
    padding-left: 15px;
    padding-right: 15px;
  }

  .mbp-pillar-ganzhi {
    font-size: 21px;
  }

  .mbp-title {
    letter-spacing: 4px;
  }

  .mbp-section-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .mbp-years {
    align-self: flex-start;
  }
}
</style>
