<template>
  <section
    class="b3d"
    :data-state="controller.state.value"
    :data-lifecycle="controller.lifecycle.value"
    :data-timeline="controller.timelineProgress.value"
    :data-intro="controller.introCompleted.value"
    :data-quality="controller.quality.value"
    :data-scene="controller.scene.value"
    :data-tunnel-entry="controller.tunnelEntryProgress.value"
    :data-renderer-stats="rendererStatsText || undefined"
    :data-error="controller.errorMessage.value || undefined"
    aria-live="polite"
  >
    <div class="b3d-toolbar">
      <div class="b3d-tabs" role="tablist" :aria-label="$t('bazi3d.galaxy')">
        <button
          v-for="scene in ['compass', 'galaxy', 'tunnel'] as const"
          :key="scene"
          type="button"
          role="tab"
          :aria-selected="controller.scene.value === scene"
          :data-testid="`bazi-3d-scene-${scene}`"
          :class="{ 'is-active': controller.scene.value === scene }"
          @click="selectScene(scene)"
        >
          {{ $t(`bazi3d.${scene}`) }}
        </button>
      </div>
      <button
        v-if="controller.scene.value === 'compass' && !controller.introCompleted.value"
        type="button"
        data-testid="bazi-3d-skip-intro"
        @click="controller.introCompleted.value = true"
      >
        <UIcon name="i-heroicons-forward" class="h-3.5 w-3.5" />
        {{ $t('bazi3d.skip') }}
      </button>
      <button
        v-if="controller.scene.value === 'compass' && controller.introCompleted.value"
        type="button"
        data-testid="bazi-3d-replay"
        @click="replay"
      >
        <UIcon name="i-heroicons-arrow-path" class="h-3.5 w-3.5" />
        {{ $t('bazi3d.replay') }}
      </button>
      <button
        v-if="controller.scene.value === 'tunnel' && controller.tunnelEntryProgress.value < 1"
        type="button"
        data-testid="bazi-3d-skip-tunnel-entry"
        @click="skipTunnelEntry"
      >
        <UIcon name="i-heroicons-forward" class="h-3.5 w-3.5" />
        {{ $t('bazi3d.skip') }}
      </button>
      <button
        v-if="controller.scene.value === 'tunnel'"
        type="button"
        data-testid="bazi-3d-exit-tunnel"
        @click="exitTunnel"
      >
        <UIcon name="i-heroicons-arrow-left-circle" class="h-3.5 w-3.5" />
        {{ $t('bazi3d.exitTunnel') }}
      </button>
    </div>
    <div ref="stageRoot" class="b3d-canvas" data-testid="bazi-3d-canvas" aria-hidden="true" />

    <aside
      v-if="controller.scene.value === 'compass' && (selectedPillar || selectedElementData)"
      class="b3d-detail"
      data-testid="bazi-3d-detail"
    >
      <header>
        <strong>
          {{ selectedPillar ? selectedPillar.label : selectedElementData?.label }}
        </strong>
        <button
          type="button"
          data-testid="bazi-3d-clear-focus"
          :aria-label="$t('bazi3d.clearFocus')"
          @click="clearFocus"
        >
          <UIcon name="i-heroicons-x-mark" class="h-3.5 w-3.5" />
        </button>
      </header>

      <div v-if="selectedPillar" class="b3d-detail-pillar" data-testid="bazi-3d-pillar-detail">
        <p class="b3d-copy">{{ selectedPillar.gan }}{{ selectedPillar.zhi }}</p>
        <dl>
          <div>
            <dt>{{ $t('baziChart.stemTenGod') }}</dt>
            <dd class="b3d-copy">{{ selectedPillar.shishenGan }}</dd>
          </div>
          <div>
            <dt>{{ $t('baziChart.hiddenStems') }}</dt>
            <dd>
              <span
                v-for="hidden in selectedPillar.hiddenStems"
                :key="`${selectedPillar.key}-${hidden.gan}-${hidden.type}`"
                class="b3d-copy"
              >
                {{ hidden.gan }} · {{ hidden.type }} · {{ hidden.wuxing }} · {{ hidden.shishen }}
              </span>
            </dd>
          </div>
          <div>
            <dt>{{ $t('baziChart.nayin') }}</dt>
            <dd class="b3d-copy">{{ selectedPillar.nayin }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="selectedElementData" class="b3d-detail-element" data-testid="bazi-3d-element-detail">
        <p class="b3d-copy">
          {{ selectedElementData.label }} {{ selectedElementData.percent }}% · {{ selectedElementData.stateLabel }}
        </p>
      </div>

      <div class="b3d-element-picker" role="group" :aria-label="$t('bazi3d.elementFocus')">
        <button
          v-for="cluster in controller.model.value?.clusters"
          :key="cluster.elementKey"
          type="button"
          :data-testid="`bazi-3d-element-${cluster.elementKey}`"
          :class="{ 'is-active': controller.selectedElementKey.value === cluster.elementKey }"
          @click="toggleElement(cluster.elementKey)"
        >
          {{ cluster.label }}
        </button>
      </div>
    </aside>

    <label v-if="controller.scene.value === 'tunnel'" class="b3d-scroll">
      <span class="sr-only">{{ $t('bazi3d.tunnel') }}</span>
      <input
        v-model.number="controller.tunnelProgress.value"
        type="range"
        min="0"
        max="1"
        step="0.01"
        data-testid="bazi-3d-tunnel-slider"
        @keydown.left.prevent="selectNeighborDayun(-1)"
        @keydown.right.prevent="selectNeighborDayun(1)"
        @keydown.up.prevent="selectNeighborDayun(-1)"
        @keydown.down.prevent="selectNeighborDayun(1)"
      >
    </label>

    <aside
      v-if="controller.scene.value === 'tunnel' && selectedDayun"
      class="b3d-dayun"
      data-testid="bazi-3d-selected-dayun"
    >
      <header>
        <div class="b3d-dayun-title">
          <strong>{{ selectedDayun.startYear }}-{{ selectedDayun.endYear }} {{ selectedDayun.ganzhi }}</strong>
          <div>
            <button
              type="button"
              :disabled="!previousDayun"
              :aria-label="$t('bazi3d.previous')"
              @click="selectNeighborDayun(-1)"
            >
              <UIcon name="i-heroicons-chevron-left" class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              :disabled="!nextDayun"
              :aria-label="$t('bazi3d.next')"
              @click="selectNeighborDayun(1)"
            >
              <UIcon name="i-heroicons-chevron-right" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <span>{{ selectedDayun.startAge }}-{{ selectedDayun.endAge }}</span>
        <em v-if="selectedDayun.isCurrent">{{ $t('baziChart.current') }}</em>
      </header>
      <div class="b3d-annuals">
        <div v-for="year in selectedDayun.liunian" :key="year.year">
          <strong>{{ year.year }} {{ year.ganzhi }}</strong>
          <span>{{ year.intensity }}</span>
        </div>
      </div>
    </aside>

    <p v-if="controller.hoveredCharacterId.value" class="b3d-hover">
      {{ hoveredCharacter?.char }} · {{ hoveredCharacter?.elementLabel }}
    </p>

    <div v-if="controller.state.value === 'pending'" class="b3d-fallback">
      <strong>{{ fourPillars }}</strong>
    </div>

    <article v-else-if="isStatic" class="b3d-poster" data-testid="bazi-3d-static-poster">
      <header>
        <strong>{{ fourPillars }}</strong>
        <span>{{ controller.model.value?.dayMaster.char }} · {{ result.energy.strength }}</span>
      </header>
      <div class="b3d-elements">
        <div v-for="cluster in controller.model.value?.clusters" :key="cluster.elementKey">
          <span>{{ cluster.label }}</span>
          <i><em :style="{ width: `${cluster.percent}%` }" /></i>
          <strong>{{ cluster.percent }}%</strong>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import type { BaziPaipan3DState } from '~/composables/useBaziPaipan3D'

const props = defineProps<{
  controller: BaziPaipan3DState
  result: BaziChartResult
}>()

const stageRoot = ref<HTMLElement | null>(null)
let dispose: (() => void) | null = null

const fourPillars = computed(() => props.result.pillars.map(pillar => pillar.ganzhi).join(' '))
const hoveredCharacter = computed(() => props.controller.model.value?.characters.find(
  character => character.id === props.controller.hoveredCharacterId.value,
))
const selectedPillar = computed(() => props.result.pillars.find(
  pillar => pillar.key === props.controller.selectedPillarKey.value,
))
const selectedElementData = computed(() => props.result.energy.wuxing.find((item) => {
  return props.controller.model.value?.clusters.find(
    cluster => cluster.elementKey === props.controller.selectedElementKey.value,
  )?.label === item.label
}))
const selectedDayun = computed(() => props.result.dayuns.find(
  dayun => dayun.index === props.controller.selectedDayunIndex.value,
))
const previousDayun = computed(() => {
  const index = props.result.dayuns.findIndex(dayun => dayun.index === props.controller.selectedDayunIndex.value)
  return index > 0 ? props.result.dayuns[index - 1] : null
})
const nextDayun = computed(() => {
  const index = props.result.dayuns.findIndex(dayun => dayun.index === props.controller.selectedDayunIndex.value)
  return index >= 0 && index + 1 < props.result.dayuns.length ? props.result.dayuns[index + 1] : null
})
const isStatic = computed(() => ['static', 'error'].includes(props.controller.state.value))
const rendererStatsText = computed(() => props.controller.rendererStats.value
  ? JSON.stringify(props.controller.rendererStats.value)
  : '')

const reducedMotion = ref(false)
interface TunnelSelectionSnapshot {
  pillarKey: string | null
  elementKey: 'wood' | 'fire' | 'earth' | 'metal' | 'water' | null
  dayunIndex: number
  progress: number
}
let tunnelEntrySelection: TunnelSelectionSnapshot | null = null

function selectScene(scene: 'compass' | 'galaxy' | 'tunnel') {
  if (scene === 'tunnel') {
    enterTunnel()
    return
  }
  if (scene === 'compass') {
    tunnelEntrySelection = null
    props.controller.introCompleted.value = true
    props.controller.scene.value = scene
    props.controller.timelineControl?.seek(6)
    return
  }
  props.controller.scene.value = scene
}

function enterTunnel() {
  if (!tunnelEntrySelection) {
    tunnelEntrySelection = {
      pillarKey: props.controller.selectedPillarKey.value,
      elementKey: props.controller.selectedElementKey.value,
      dayunIndex: props.controller.selectedDayunIndex.value,
      progress: props.controller.tunnelProgress.value,
    }
  }

  const currentDayun = props.result.dayuns.find(dayun => dayun.isCurrent)
    ?? props.result.dayuns[0]
  if (!currentDayun) return

  props.controller.selectedDayunIndex.value = currentDayun.index
  props.controller.tunnelProgress.value = props.result.dayuns.length > 1
    ? (currentDayun.index - 1) / (props.result.dayuns.length - 1)
    : 0
  props.controller.introCompleted.value = true
  props.controller.tunnelEntryProgress.value = reducedMotion.value ? 1 : 0
  props.controller.scene.value = 'tunnel'
  props.controller.lifecycle.value = 'tunnel'
}

function exitTunnel() {
  const snapshot = tunnelEntrySelection
  if (snapshot) {
    props.controller.selectedPillarKey.value = snapshot.pillarKey
    props.controller.selectedElementKey.value = snapshot.elementKey
    props.controller.selectedDayunIndex.value = snapshot.dayunIndex
    props.controller.tunnelProgress.value = snapshot.progress
    tunnelEntrySelection = null
  }
  props.controller.scene.value = 'compass'
  props.controller.timelineControl?.restoreOverview()
}

function skipTunnelEntry() {
  props.controller.tunnelEntryProgress.value = 1
}

function replay() {
  props.controller.timelineControl?.replay()
}

function toggleElement(elementKey: 'wood' | 'fire' | 'earth' | 'metal' | 'water') {
  props.controller.selectedElementKey.value = props.controller.selectedElementKey.value === elementKey
    ? null
    : elementKey
}

function clearFocus() {
  props.controller.selectedPillarKey.value = null
  props.controller.selectedElementKey.value = null
}

function selectNeighborDayun(direction: -1 | 1) {
  const target = direction === -1 ? previousDayun.value : nextDayun.value
  if (target) props.controller.selectedDayunIndex.value = target.index
}

onMounted(async () => {
  const root = stageRoot.value
  const model = props.controller.model.value
  if (!root || !model) return

  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const { mountBaziPaipan3D } = await import('~/utils/bazi-paipan-3d/renderer')
  dispose = await mountBaziPaipan3D({
    root,
    state: props.controller,
    model,
    reducedMotion: reducedMotion.value,
  })
  if (reducedMotion.value) props.controller.introCompleted.value = true
})

onBeforeUnmount(() => {
  dispose?.()
  dispose = null
})
</script>

<style scoped>
.b3d {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, #8fa4d0 24%, transparent);
  border-radius: 10px;
  background: #05070e;
}

.b3d-toolbar {
  position: absolute;
  z-index: 2;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.b3d-tabs {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(5, 8, 16, 0.74);
}

.b3d-tabs button {
  padding: 4px 8px;
  color: #a7b2c8;
  font-size: 12px;
  transition: color 160ms ease, background-color 160ms ease;
}

.b3d-tabs button + button {
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.b3d-tabs button.is-active {
  background: rgba(255, 216, 132, 0.14);
  color: #fff2ce;
}

.b3d-toolbar span {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(5, 8, 16, 0.68);
  color: #b9c4d9;
  font-size: 12px;
}

.b3d-toolbar button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  background: rgba(5, 8, 16, 0.78);
  color: #e8eefc;
  font-size: 12px;
  transition: border-color 160ms ease, color 160ms ease;
}

.b3d-toolbar button:hover {
  border-color: rgba(255, 216, 132, 0.46);
  color: #fff2ce;
}

.b3d-canvas {
  width: 100%;
  height: clamp(360px, 48vh, 520px);
}

.b3d[data-scene='tunnel'] .b3d-canvas {
  touch-action: none;
}

.b3d-detail {
  position: absolute;
  z-index: 2;
  top: 52px;
  right: 10px;
  width: min(46vw, 250px);
  max-height: calc(100% - 66px);
  overflow: auto;
  padding: 10px;
  border: 1px solid rgba(255, 216, 132, 0.22);
  border-radius: 8px;
  background: rgba(5, 8, 16, 0.86);
  color: #e9eefa;
  font-size: 12px;
}

.b3d-detail header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.b3d-detail button {
  color: #b9c4d9;
}

.b3d-detail dl {
  display: grid;
  gap: 7px;
  margin: 0;
}

.b3d-detail dt {
  color: #a7b2c8;
  font-size: 11px;
}

.b3d-detail dd {
  margin: 2px 0 0;
  line-height: 1.45;
}

.b3d-copy {
  user-select: text;
}

.b3d-detail-element {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.b3d-element-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin-top: 9px;
}

.b3d-element-picker button {
  padding: 4px 0;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: #c9d3e4;
  font-size: 11px;
}

.b3d-element-picker button.is-active {
  border-color: rgba(255, 216, 132, 0.42);
  background: rgba(255, 216, 132, 0.13);
  color: #fff2ce;
}

.b3d-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.b3d-hover {
  position: absolute;
  top: 12px;
  right: 12px;
  margin: 0;
  padding: 5px 9px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  background: rgba(5, 8, 16, 0.76);
  color: #e8eefc;
  font-size: 12px;
  line-height: 1.35;
}

.b3d-fallback,
.b3d-poster {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 14px;
  padding: 20px;
  background:
    radial-gradient(circle at 22% 18%, rgba(74, 105, 188, 0.2), transparent 34%),
    radial-gradient(circle at 78% 78%, rgba(147, 73, 74, 0.14), transparent 36%),
    #070a12;
}

.b3d-scroll {
  position: absolute;
  z-index: 2;
  bottom: 14px;
  left: 50%;
  width: min(78%, 360px);
  transform: translateX(-50%);
}

.b3d-scroll input {
  width: 100%;
  accent-color: #ffd884;
}

.b3d-dayun {
  position: absolute;
  z-index: 2;
  top: 52px;
  right: 10px;
  width: min(46vw, 230px);
  max-height: calc(100% - 76px);
  overflow: auto;
  padding: 9px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 8px;
  background: rgba(5, 8, 16, 0.82);
  color: #dbe3f2;
  font-size: 12px;
}

.b3d-dayun header {
  display: grid;
  gap: 2px;
  margin-bottom: 7px;
}

.b3d-dayun-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.b3d-dayun-title div {
  display: flex;
  gap: 3px;
}

.b3d-dayun-title button {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  color: #dce5f4;
}

.b3d-dayun-title button:disabled {
  opacity: 0.34;
}

.b3d-dayun em {
  width: fit-content;
  padding: 2px 5px;
  border-radius: 5px;
  background: rgba(255, 216, 132, 0.16);
  color: #fff2ce;
  font-style: normal;
}

.b3d-annuals {
  display: grid;
  gap: 5px;
}

.b3d-annuals > div {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  color: #b9c4d9;
}

.b3d-poster {
  align-content: start;
  overflow: auto;
  color: #e9eefa;
}

.b3d-poster header {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  text-align: center;
}

.b3d-poster strong,
.b3d-fallback strong {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(28px, 4.4vw, 38px);
  line-height: 1.15;
}

.b3d-poster span {
  color: #a7b2c8;
  font-size: 13px;
}

.b3d-elements {
  width: min(100%, 520px);
  display: grid;
  gap: 8px;
}

.b3d-elements > div {
  display: grid;
  grid-template-columns: 24px 1fr 38px;
  align-items: center;
  gap: 8px;
  color: #b8c2d6;
  font-size: 12px;
}

.b3d-elements i {
  display: block;
  overflow: hidden;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.b3d-elements em {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7c9bd8, #d0b78a);
}

.b3d-elements strong {
  color: #e9eefa;
  font-weight: 600;
  text-align: right;
}
</style>
