<template>
  <section
    class="bazi-3d"
    :data-state="controller.state.value"
    :data-quality="controller.quality.value"
    :data-selected-node="controller.selectedNodeId.value || 'overview'"
    :data-error="controller.errorMessage.value || undefined"
    aria-live="polite"
  >
    <div ref="stageRoot" class="stage-canvas" data-testid="bazi-3d-canvas" aria-hidden="true" />

    <div
      v-show="controller.state.value === 'pending'"
      class="stage-loading"
      :class="{ 'is-hidden': controller.state.value !== 'pending' }"
      data-testid="bazi-3d-loading"
    >
      <div class="loading-rings" aria-hidden="true">
        <span class="loading-ring loading-ring-outer" />
        <span class="loading-ring loading-ring-inner" />
        <span class="loading-glyph">☯</span>
      </div>
      <strong>{{ fourPillars }}</strong>
      <small>{{ $t('baziChart.calculating') }}</small>
    </div>

    <div v-if="overlayOpen" class="stage-header">
      <div class="brand">
        <span class="sigil" aria-hidden="true">命</span>
        <div>
          <strong>{{ $t('bazi3d.title') }}</strong>
          <small>{{ dayMaster?.char ?? result.pillars[2]?.gan }} · {{ result.pattern.status }}</small>
        </div>
      </div>

      <div class="toolbar">
        <button type="button" data-testid="bazi-3d-back" @click="emit('back')">
          <UIcon name="i-lucide-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('common.back') }}
        </button>
        <button type="button" @click="emit('back')">
          <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5" />
          {{ $t('bazi3d.recalculate') }}
        </button>
        <AppShareButton
          tool="bazi-paipan"
          :summary="shareSummary"
          filename="bazi-paipan-poster.png"
          :share-image-factory="createPoster"
        />
        <span class="toolbar-divider" aria-hidden="true" />
        <button type="button" data-testid="bazi-3d-reset-camera" @click="mount?.resetView()">
          <UIcon name="i-lucide-focus" class="h-3.5 w-3.5" />
          {{ $t('bazi3d.resetView') }}
        </button>
        <button
          type="button"
          :data-testid="`bazi-3d-rotate-${autoRotate ? 'on' : 'off'}`"
          @click="toggleRotate"
        >
          <UIcon :name="autoRotate ? 'i-lucide-pause' : 'i-lucide-play'" class="h-3.5 w-3.5" />
          {{ autoRotate ? $t('bazi3d.rotating') : $t('bazi3d.paused') }}
        </button>
        <button type="button" @click="uiOpen = !uiOpen">
          <UIcon :name="uiOpen ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="h-3.5 w-3.5" />
          {{ uiOpen ? $t('bazi3d.hidePanel') : $t('bazi3d.showPanel') }}
        </button>
      </div>
    </div>

    <aside
      v-show="overlayOpen"
      class="info-panel"
      :class="{ 'is-collapsed': !uiOpen }"
      :aria-hidden="!uiOpen"
      :inert="!uiOpen"
      data-testid="bazi-3d-panel"
    >
      <header>
        <div>
          <span aria-hidden="true" />
          <strong>{{ panelTitle }}</strong>
        </div>
        <button
          v-if="controller.selectedNodeId.value && controller.selectedNodeId.value !== 'overview'"
          type="button"
          data-testid="bazi-3d-back-overview"
          @click="selectNode('overview')"
        >
          {{ $t('bazi3d.overviewBack') }}
        </button>
      </header>

      <div class="panel-body">
        <template v-if="panelKind === 'overview'">
          <article>
            <h3>{{ $t('bazi3d.birthInfo') }}</h3>
            <p>{{ result.birth.solarText }} {{ result.birth.clockText }} · {{ result.birth.genderText }}命</p>
            <p>{{ result.birth.lunarDetail }} · {{ result.birth.locationName || $t('baziChart.location') }}</p>
          </article>
          <article>
            <h3>{{ $t('baziChart.dayStrength') }}</h3>
            <p><b>{{ result.energy.strength }}</b> · {{ result.energy.supportRatio }}%</p>
            <p>{{ result.energy.rootStatus }} · {{ result.energy.adjustment }}</p>
          </article>
          <article>
            <h3>{{ $t('baziChart.elementDistribution') }}</h3>
            <div class="element-grid">
              <button
                v-for="item in result.energy.wuxing"
                :key="item.key"
                type="button"
                @click="selectNode(`element:${elementKey(item.key)}`)"
              >
                {{ item.label }} {{ item.visibleCount }}
              </button>
            </div>
          </article>
          <article>
            <h3>{{ $t('bazi3d.natalSignals') }}</h3>
            <p v-for="relation in result.relations.slice(0, 4)" :key="relation.id">
              {{ relation.value }}{{ relation.type }} · {{ relation.positions.join('/') }}
            </p>
            <p v-for="item in result.shensha.slice(0, 4)" :key="`${item.name}-${item.positions.join('/')}`">
              {{ item.name }} · {{ item.positions.join('/') }}
            </p>
          </article>
          <article>
            <h3>{{ $t('baziChart.dayunTitle') }}</h3>
            <div class="dayun-badges">
              <button
                v-for="dayun in result.dayuns"
                :key="dayun.index"
                type="button"
                :class="{ current: dayun.isCurrent }"
                @click="selectNode(`dayun:${dayun.index}`)"
              >
                {{ dayun.startAge }} {{ dayun.ganzhi }}
              </button>
            </div>
          </article>
          <article>
            <h3>{{ $t('baziChart.structureTitle') }}</h3>
            <p>{{ result.pattern.name }} · {{ result.energy.primaryUseGod }}</p>
            <p v-for="item in result.structure.evidence.slice(0, 3)" :key="item">{{ item }}</p>
          </article>
        </template>

        <template v-else-if="panelKind === 'pillar' && selectedPillar">
          <article class="focus-card">
            <h3>{{ selectedPillar.label }}</h3>
            <p class="ganzhi">{{ selectedPillar.ganzhi }}</p>
            <p>{{ selectedPillar.shishenGan }}</p>
          </article>
          <article>
            <h3>{{ $t('baziChart.hiddenStems') }}</h3>
            <p v-for="item in selectedPillar.hiddenStems" :key="`${selectedPillar.key}-${item.gan}`">
              {{ item.gan }} · {{ item.type }} · {{ item.wuxing }} · {{ item.shishen }}
            </p>
          </article>
          <article>
            <h3>{{ $t('baziChart.nayin') }} / {{ $t('baziChart.diShi') }}</h3>
            <p>{{ selectedPillar.nayin }} · {{ selectedPillar.diShi }}</p>
            <p>{{ selectedPillar.xunKong.join(' / ') }}</p>
          </article>
          <article>
            <h3>{{ $t('baziChart.shenshaTitle') }}</h3>
            <p v-for="item in selectedPillar.shensha" :key="`${selectedPillar.key}-${item.name}`">
              {{ item.name }} · {{ item.classification }}
            </p>
          </article>
          <article>
            <h3>{{ $t('bazi3d.pillarMeaning') }}</h3>
            <p>{{ $t(`bazi3d.${selectedPillar.key}Meaning`) }}</p>
          </article>
        </template>

        <template v-else-if="panelKind === 'element' && selectedElement">
          <article class="focus-card">
            <h3>{{ selectedElement.label }}</h3>
            <p class="ganzhi">{{ selectedElement.visibleCount }}</p>
            <p>{{ selectedElement.role }} · {{ selectedElement.percent }}%</p>
          </article>
          <article>
            <h3>{{ $t('bazi3d.elementRelation') }}</h3>
            <p>{{ selectedElement.stateLabel }} · {{ selectedElement.direction }}</p>
            <p>{{ selectedElement.evidence }}</p>
          </article>
          <article>
            <h3>{{ $t('bazi3d.adjustment') }}</h3>
            <p>{{ selectedElement.organs }} · {{ result.energy.adjustment }}</p>
          </article>
        </template>

        <template v-else-if="panelKind === 'dayun' && selectedDayun">
          <article class="focus-card">
            <h3>{{ selectedDayun.startYear }}-{{ selectedDayun.endYear }}</h3>
            <p class="ganzhi">{{ selectedDayun.ganzhi }}</p>
            <p>{{ selectedDayun.startAge }}-{{ selectedDayun.endAge }} · {{ selectedDayun.shishenGan }} / {{ selectedDayun.shishenZhi }}</p>
          </article>
          <article>
            <h3>{{ $t('baziChart.keyShensha') }}</h3>
            <p v-for="item in selectedDayun.shensha" :key="`${selectedDayun.index}-${item.name}`">
              {{ item.name }} · {{ item.classification }}
            </p>
            <p v-if="!selectedDayun.shensha.length">—</p>
          </article>
          <article>
            <h3>{{ $t('bazi3d.annualList') }}</h3>
            <div class="year-list">
              <button
                v-for="year in selectedDayun.liunian"
                :key="year.year"
                type="button"
                :class="{ current: year.isCurrent }"
                @click="selectNode(`liunian:${year.year}`)"
              >
                {{ year.year }} {{ year.ganzhi }} · {{ year.intensity }}
              </button>
            </div>
          </article>
        </template>

        <template v-else-if="panelKind === 'liunian' && selectedLiunian">
          <article class="focus-card">
            <h3>{{ selectedLiunian.year }}</h3>
            <p class="ganzhi">{{ selectedLiunian.ganzhi }}</p>
            <p>{{ selectedLiunian.shishenGan }} / {{ selectedLiunian.shishenZhi }} · {{ selectedLiunian.intensity }}</p>
          </article>
          <article>
            <h3>{{ $t('bazi3d.annualSummary') }}</h3>
            <p>{{ selectedLiunian.summary }}</p>
            <p v-for="item in selectedLiunian.energyShifts" :key="item">{{ item }}</p>
          </article>
          <article>
            <h3>{{ $t('bazi3d.natalSignals') }}</h3>
            <p v-for="signal in selectedLiunian.signals" :key="`${selectedLiunian.year}-${signal.value}`">
              {{ signal.value }}{{ signal.type }} · {{ signal.impact }}
            </p>
          </article>
        </template>

        <p class="disclaimer">{{ $t('baziChart.disclaimer') }}</p>
      </div>
    </aside>

    <div v-show="overlayOpen" class="controls-hint" :class="{ 'is-muted': !uiOpen }">
      <span><kbd>{{ $t('bazi3d.drag') }}</kbd> {{ $t('bazi3d.orbit') }}</span>
      <span><kbd>{{ $t('bazi3d.scroll') }}</kbd> {{ $t('bazi3d.zoom') }}</span>
      <span>{{ $t('bazi3d.clickHint') }}</span>
    </div>

    <div v-if="controller.state.value === 'static'" class="static-fallback" data-testid="bazi-3d-static-poster">
      <strong>{{ $t('bazi3d.staticTitle') }}</strong>
      <span>{{ $t('bazi3d.staticDescription') }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import type { ElementKey } from '~/utils/bazi-paipan-3d/model'
import type { BaziPaipan3DState } from '~/composables/useBaziPaipan3D'
import type { BaziPaipan3DMount } from '~/utils/bazi-paipan-3d/renderer'

const props = defineProps<{
  controller: BaziPaipan3DState
  result: BaziChartResult
}>()

const emit = defineEmits<{
  back: []
}>()

const { t } = useI18n()
const stageRoot = ref<HTMLElement | null>(null)
const uiOpen = ref(true)
const autoRotate = ref(true)
const mount = ref<BaziPaipan3DMount | null>(null)
let abortController: AbortController | null = null

const fourPillars = computed(() => props.result.pillars.map(pillar => pillar.ganzhi).join(' '))
const overlayOpen = computed(() => props.controller.state.value !== 'pending')
const nodeId = computed(() => props.controller.selectedNodeId.value || 'overview')
const panelKind = computed(() => nodeId.value.split(':')[0] ?? 'overview')
const selectedPillar = computed(() => props.result.pillars.find(pillar => `pillar:${pillar.key}` === nodeId.value))
const selectedElement = computed(() => props.result.energy.wuxing.find(item => `element:${elementKey(item.key)}` === nodeId.value))
const selectedDayun = computed(() => props.result.dayuns.find(dayun => `dayun:${dayun.index}` === nodeId.value))
const selectedLiunian = computed(() => props.result.dayuns.flatMap(dayun => dayun.liunian).find(year => `liunian:${year.year}` === nodeId.value))
const dayMaster = computed(() => props.controller.model.value?.dayMaster)
const shareSummary = computed(() => `${fourPillars.value} · ${props.result.energy.strength} · ${props.result.pattern.status}`)

const panelTitle = computed(() => {
  if (selectedPillar.value) return `${selectedPillar.value.label} · ${selectedPillar.value.ganzhi}`
  if (selectedElement.value) return `${t('bazi3d.element')} · ${selectedElement.value.label}`
  if (selectedDayun.value) return `${selectedDayun.value.startYear}-${selectedDayun.value.endYear} ${selectedDayun.value.ganzhi}`
  if (selectedLiunian.value) return `${selectedLiunian.value.year} ${selectedLiunian.value.ganzhi}`
  return t('bazi3d.overview')
})

function elementKey(label: string): ElementKey {
  return props.controller.model.value?.clusters.find(cluster => cluster.label === label)?.elementKey ?? 'earth'
}

function selectNode(value: string) {
  props.controller.selectedNodeId.value = value
}

function toggleRotate() {
  autoRotate.value = !autoRotate.value
  mount.value?.setAutoRotate(autoRotate.value)
}

async function createPoster() {
  const { createBaziPaipanInstrumentPoster } = await import('~/utils/bazi-paipan-3d/poster')
  const currentDayun = props.result.dayuns.find(dayun => dayun.isCurrent) ?? props.result.dayuns[0] ?? null
  return createBaziPaipanInstrumentPoster({
    result: props.result,
    currentDayun,
    siteName: 'ososn',
  })
}

onMounted(async () => {
  const root = stageRoot.value
  const model = props.controller.model.value
  if (!root || !model) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  autoRotate.value = !reducedMotion
  abortController = new AbortController()
  const { mountBaziPaipan3D } = await import('~/utils/bazi-paipan-3d/renderer')
  if (abortController.signal.aborted) return
  mount.value = await mountBaziPaipan3D({
    root,
    state: props.controller,
    result: props.result,
    model,
    reducedMotion,
    signal: abortController.signal,
    labels: { dayMaster: t('bazi3d.dayMaster') },
  })
})

onBeforeUnmount(() => {
  abortController?.abort()
  mount.value?.dispose()
  mount.value = null
  abortController = null
})
</script>

<style scoped>
.bazi-3d {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #03050b;
  color: #e2e8f0;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.stage-canvas,
.stage-canvas canvas {
  position: absolute;
  inset: 0;
}

.stage-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.bazi-3d :global(.bazi-3d-label) {
  pointer-events: none;
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.72));
}

.stage-loading {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  background: rgba(3, 5, 11, 0.96);
  transition: opacity 0.6s ease;
}

.stage-loading.is-hidden {
  pointer-events: none;
  opacity: 0;
}

.loading-rings {
  position: relative;
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
}

.loading-ring {
  position: absolute;
  inset: 0;
  border: 2px dashed rgba(34, 211, 238, 0.45);
  border-radius: 50%;
}

.loading-ring-outer {
  animation: spin 9s linear infinite;
}

.loading-ring-inner {
  inset: 14px;
  border: 2px solid rgba(34, 211, 238, 0.9);
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

.loading-glyph {
  color: #fcd34d;
  font-size: 27px;
  font-weight: 900;
}

.stage-loading strong {
  animation: subtle-pulse 2s ease-in-out infinite;
  color: #f8fafc;
  font-size: 24px;
}

.stage-loading small,
.controls-hint {
  color: #94a3b8;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
}

.stage-header {
  position: absolute;
  inset: 0 0 auto;
  z-index: 4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  pointer-events: none;
}

.brand,
.toolbar {
  pointer-events: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.66);
  backdrop-filter: blur(12px);
}

.sigil {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(245, 158, 11, 0.32);
  border-radius: 7px;
  background: rgba(245, 158, 11, 0.12);
  color: #fcd34d;
  font-size: 17px;
  font-weight: 900;
}

.brand strong {
  display: block;
  color: #f8fafc;
  font-size: 14px;
}

.brand small {
  color: #94a3b8;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: min(560px, 70vw);
  padding: 5px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(12px);
}

.toolbar button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 26px;
  padding: 2px 7px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 5px;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
}

.toolbar button:hover {
  border-color: rgba(245, 158, 11, 0.36);
  background: rgba(245, 158, 11, 0.08);
  color: #fde68a;
}

.toolbar :deep(button) {
  min-height: 26px;
  padding: 2px 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 5px;
  background: transparent;
  color: #cbd5e1;
  font-size: 11px;
}

.toolbar-divider {
  width: 1px;
  align-self: stretch;
  margin: 2px 2px;
  background: rgba(148, 163, 184, 0.2);
}

.info-panel {
  position: absolute;
  top: 62px;
  right: 16px;
  bottom: 44px;
  z-index: 4;
  display: flex;
  width: min(380px, calc(100% - 32px));
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.82);
  backdrop-filter: blur(16px);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.info-panel.is-collapsed {
  opacity: 0;
  transform: translateX(calc(100% + 26px));
}

.info-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 41px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.16);
  background: rgba(15, 23, 42, 0.58);
}

.info-panel header div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.info-panel header span {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fbbf24;
  animation: status-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.info-panel header strong {
  overflow: hidden;
  color: #fcd34d;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-panel header button {
  flex: 0 0 auto;
  padding: 3px 6px;
  border: 1px solid rgba(56, 189, 248, 0.34);
  border-radius: 4px;
  background: rgba(14, 165, 233, 0.12);
  color: #7dd3fc;
  cursor: pointer;
  font-size: 11px;
}

.panel-body {
  flex: 1;
  overflow: auto;
  padding: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  overscroll-behavior: contain;
}

.panel-body article {
  margin: 0 0 9px;
  padding: 9px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.48);
}

.panel-body h3 {
  margin: 0 0 5px;
  color: #7dd3fc;
  font-size: 12px;
}

.panel-body p {
  margin: 4px 0;
  color: #cbd5e1;
  font-size: 11px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.panel-body b,
.focus-card .ganzhi {
  color: #fcd34d;
}

.focus-card {
  text-align: center;
}

.focus-card h3 {
  color: #a5b4fc;
}

.focus-card .ganzhi {
  margin: 5px 0;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 31px;
  font-weight: 900;
}

.element-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
}

.element-grid button,
.dayun-badges button,
.year-list button {
  padding: 5px 4px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 5px;
  background: rgba(15, 23, 42, 0.66);
  color: #cbd5e1;
  cursor: pointer;
  font-size: 11px;
}

.element-grid button:hover,
.dayun-badges button:hover,
.year-list button:hover {
  border-color: rgba(245, 158, 11, 0.38);
  color: #fde68a;
}

.element-grid button {
  font-weight: 700;
}

.dayun-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dayun-badges button,
.year-list button {
  width: 100%;
  text-align: left;
}

.dayun-badges button {
  width: auto;
}

.dayun-badges .current,
.year-list .current {
  border-color: rgba(251, 191, 36, 0.6);
  background: rgba(245, 158, 11, 0.14);
  color: #fcd34d;
}

.disclaimer {
  color: #64748b !important;
}

.controls-hint {
  position: absolute;
  bottom: 14px;
  left: 16px;
  z-index: 3;
  display: flex;
  gap: 12px;
  padding: 7px 10px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 7px;
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.controls-hint.is-muted {
  opacity: 0;
  transform: translateY(12px);
}

.controls-hint kbd {
  padding: 1px 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 3px;
  background: rgba(15, 23, 42, 0.9);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
}

.static-fallback {
  position: absolute;
  right: 16px;
  bottom: 44px;
  z-index: 4;
  display: grid;
  gap: 5px;
  width: min(380px, calc(100% - 32px));
  padding: 14px;
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.92);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.static-fallback strong {
  color: #fcd34d;
  font-size: 14px;
}

.static-fallback span {
  color: #94a3b8;
  font-size: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes subtle-pulse {
  0%,
  100% {
    opacity: 0.42;
    transform: scale(0.98);
  }

  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes status-ping {
  0% {
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.68);
    opacity: 1;
  }

  75%,
  100% {
    box-shadow: 0 0 0 7px rgba(251, 191, 36, 0);
    opacity: 0.55;
  }
}

@media (max-width: 760px) {
  .stage-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px;
  }

  .toolbar {
    justify-content: flex-start;
    max-width: 100%;
  }

  .info-panel {
    top: auto;
    right: 8px;
    bottom: 8px;
    left: 8px;
    width: auto;
    max-height: 47%;
  }

  .info-panel.is-collapsed {
    transform: translateY(calc(100% + 18px));
  }

  .controls-hint {
    display: none;
  }
}
</style>
