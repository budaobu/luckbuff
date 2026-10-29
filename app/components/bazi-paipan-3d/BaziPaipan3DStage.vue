<template>
  <section
    class="bazi-3d"
    :data-state="controller.state.value"
    :data-quality="controller.quality.value"
    :data-selected-node="controller.selectedNodeId.value || 'overview'"
    :data-active-segment="segment.activeSegmentId.value || undefined"
    :data-segment-effect="segment.activeSegment.value?.effect || undefined"
    :data-error="controller.errorMessage.value || undefined"
    :class="{ 'is-panel-collapsed': !uiOpen }"
    aria-live="polite"
  >
    <div ref="stageRoot" class="stage-canvas" data-testid="bazi-3d-canvas" aria-hidden="true" />

    <Transition name="segment-fade">
      <div
        v-if="staticSegmentVisible && segment.activeSegment.value"
        class="segment-static"
        data-testid="bazi-3d-segment-static"
        aria-hidden="true"
      >
        <svg viewBox="0 0 260 150" role="presentation">
          <g
            :stroke="segment.activeSegment.value.accent"
            fill="none"
            stroke-width="1.2"
            opacity="0.68"
          >
            <template v-if="segment.activeSegment.value.effect === 'rings'">
              <circle cx="130" cy="72" r="24" />
              <circle cx="130" cy="72" r="36" />
              <circle cx="130" cy="72" r="48" />
            </template>
            <template v-else-if="segment.activeSegment.value.effect === 'orbit'">
              <ellipse cx="130" cy="72" rx="50" ry="20" />
              <ellipse cx="130" cy="72" rx="20" ry="42" />
              <circle cx="130" cy="72" r="14" />
              <circle cx="180" cy="72" r="3" />
              <circle cx="130" cy="30" r="3" />
            </template>
            <template v-else-if="segment.activeSegment.value.effect === 'lattice'">
              <rect x="90" y="46" width="24" height="10" />
              <rect x="122" y="46" width="24" height="10" />
              <rect x="154" y="46" width="24" height="10" />
              <rect x="106" y="68" width="24" height="10" />
              <rect x="138" y="68" width="24" height="10" />
              <rect x="122" y="90" width="24" height="10" />
            </template>
            <template v-else-if="segment.activeSegment.value.effect === 'stream'">
              <path d="M72 90 C 104 32, 156 112, 188 54" />
              <circle cx="72" cy="90" r="3" />
              <circle cx="130" cy="72" r="3" />
              <circle cx="188" cy="54" r="3" />
            </template>
            <template v-else-if="segment.activeSegment.value.effect === 'star'">
              <path d="M130 28 140 58 172 58 146 78 156 110 130 90 104 110 114 78 88 58 120 58Z" />
            </template>
            <template v-else-if="segment.activeSegment.value.effect === 'pulse'">
              <circle cx="130" cy="72" r="16" />
              <circle cx="130" cy="72" r="30" />
              <circle cx="130" cy="72" r="44" stroke-dasharray="4 6" />
            </template>
            <template v-else>
              <rect x="112" y="30" width="36" height="84" rx="6" />
              <path d="M130 52 142 72 130 92 118 72Z" />
            </template>
          </g>
        </svg>
      </div>
    </Transition>

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
          v-if="segment.isActive.value"
          type="button"
          data-testid="bazi-3d-segment-back"
          @click="segment.back()"
        >
          {{ $t('bazi3d.segmentBack') }}
        </button>
        <button
          v-else-if="controller.selectedNodeId.value && controller.selectedNodeId.value !== 'overview'"
          type="button"
          data-testid="bazi-3d-back-overview"
          @click="selectNode('overview')"
        >
          {{ $t('bazi3d.overviewBack') }}
        </button>
      </header>

      <div ref="panelBody" class="panel-body">
        <Transition name="segment-view" mode="out-in">
          <div
            v-if="segment.activeSegment.value"
            :key="segment.activeSegment.value.id"
            class="segment-detail"
            data-testid="bazi-3d-segment-detail"
          >
            <section>
              <h4>{{ $t('bazi3d.dataSource') }}</h4>
              <dl>
                <div v-for="item in activeSegmentFields" :key="item.path">
                  <dt>{{ segmentFieldLabel(item.path) }}</dt>
                  <dd>{{ formatSegmentValue(item.value) }}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h4>{{ $t('bazi3d.algorithm') }}</h4>
              <p>{{ $t(segment.activeSegment.value.methodKey) }}</p>
              <ul>
                <li v-for="item in methodologyFields" :key="item.path">
                  <span>{{ segmentFieldLabel(item.path) }}</span>
                  <span>{{ formatSegmentValue(item.value) }}</span>
                </li>
              </ul>
            </section>
          </div>

          <div v-else key="panel-preview" class="panel-preview">

        <template v-if="panelKind === 'overview' && !segment.isActive.value">
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open('overview', 'birth-info')">
                <span>{{ $t('bazi3d.birthInfo') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p>{{ result.birth.solarText }} {{ result.birth.clockText }} · {{ result.birth.genderText }}命</p>
            <p>{{ result.birth.lunarDetail }} · {{ result.birth.locationName || $t('baziChart.location') }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open('overview', 'day-strength')">
                <span>{{ $t('baziChart.dayStrength') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p><b>{{ result.energy.strength }}</b> · {{ result.energy.supportRatio }}%</p>
            <p>{{ result.energy.rootStatus }} · {{ result.energy.adjustment }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open('element:wood', 'detail')">
                <span>{{ $t('bazi3d.element') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
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
            <p>{{ result.energy.primaryUseGod }} / {{ result.energy.supportUseGod }} · {{ result.energy.avoidGod }}忌</p>
            <p>调候 · {{ result.energy.adjustment }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open('pillar:day', 'detail')">
                <span>{{ $t('bazi3d.pillarDetail') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <div class="pillar-overview-grid">
              <div v-for="pillar in result.pillars" :key="pillar.key">
                <b>{{ pillar.label }}</b>
                <span>{{ pillar.ganzhi }} · {{ pillar.shishenGan }}</span>
                <small>藏 {{ pillar.hiddenStems.map(item => item.gan).join('') }} · {{ pillar.diShi }}</small>
                <small>纳音 {{ pillar.nayin }} · {{ pillar.xunKong.join('/') || '无旬空' }}</small>
                <small>{{ pillar.shensha.map(item => item.name).join(' / ') || '—' }}</small>
              </div>
            </div>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open('overview', 'natal-signals')">
                <span>{{ $t('bazi3d.natalSignals') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p v-for="relation in result.relations.slice(0, 4)" :key="relation.id">
              {{ relation.value }}{{ relation.type }} · {{ relation.positions.join('/') }}
            </p>
            <p v-for="item in result.shensha.slice(0, 4)" :key="`${item.name}-${item.positions.join('/')}`">
              {{ item.name }} · {{ item.positions.join('/') }}
            </p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(currentDayun ? `dayun:${currentDayun.index}` : 'dayun:0', 'detail')">
                <span>{{ $t('baziChart.dayunTitle') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
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
            <p v-if="currentDayun">
              {{ currentDayun.startYear }}-{{ currentDayun.endYear }} · {{ currentDayun.shishenGan }} / {{ currentDayun.shishenZhi }}
            </p>
            <p>{{ currentDayun?.shensha.map(item => item.name).join(' / ') || '—' }}</p>
            <p v-if="currentLiunian">
              {{ currentLiunian.year }} {{ currentLiunian.ganzhi }} · {{ currentLiunian.intensity }} · {{ currentLiunian.summary }}
            </p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open('overview', 'structure')">
                <span>{{ $t('baziChart.structureTitle') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p>{{ result.pattern.name }} · {{ result.energy.primaryUseGod }}</p>
            <p v-for="item in result.structure.evidence.slice(0, 3)" :key="item">{{ item }}</p>
          </article>
        </template>

        <template v-else-if="panelKind === 'pillar' && selectedPillar && !segment.isActive.value">
          <article class="focus-card">
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ `${selectedPillar.label} · ${$t('bazi3d.segment.pillarSummary')}` }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p class="ganzhi">{{ selectedPillar.ganzhi }}</p>
            <p>{{ selectedPillar.shishenGan }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('baziChart.hiddenStems') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p v-for="item in selectedPillar.hiddenStems" :key="`${selectedPillar.key}-${item.gan}`">
              {{ item.gan }} · {{ item.type }} · {{ item.wuxing }} · {{ item.shishen }}
            </p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ `${$t('baziChart.nayin')} / ${$t('baziChart.diShi')}` }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p>{{ selectedPillar.nayin }} · {{ selectedPillar.diShi }}</p>
            <p>{{ selectedPillar.xunKong.join(' / ') }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('baziChart.shenshaTitle') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p v-for="item in selectedPillar.shensha" :key="`${selectedPillar.key}-${item.name}`">
              {{ item.name }} · {{ item.classification }}
            </p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('bazi3d.pillarMeaning') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p>{{ $t(`bazi3d.${selectedPillar.key}Meaning`) }}</p>
          </article>
        </template>

        <template v-else-if="panelKind === 'element' && selectedElement && !segment.isActive.value">
          <article class="focus-card">
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ selectedElement.label }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p class="ganzhi">{{ selectedElement.visibleCount }}</p>
            <p>{{ selectedElement.role }} · {{ selectedElement.percent }}%</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('bazi3d.elementRelation') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p>{{ selectedElement.stateLabel }} · {{ selectedElement.direction }}</p>
            <p>{{ selectedElement.evidence }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('bazi3d.adjustment') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p>{{ selectedElement.organs }} · {{ result.energy.adjustment }}</p>
          </article>
        </template>

        <template v-else-if="panelKind === 'dayun' && selectedDayun && !segment.isActive.value">
          <article class="focus-card">
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ `${selectedDayun.startYear}-${selectedDayun.endYear} ${selectedDayun.ganzhi}` }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p class="ganzhi">{{ selectedDayun.ganzhi }}</p>
            <p>{{ selectedDayun.startAge }}-{{ selectedDayun.endAge }} · {{ selectedDayun.shishenGan }} / {{ selectedDayun.shishenZhi }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('baziChart.keyShensha') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p v-for="item in selectedDayun.shensha" :key="`${selectedDayun.index}-${item.name}`">
              {{ item.name }} · {{ item.classification }}
            </p>
            <p v-if="!selectedDayun.shensha.length">—</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('bazi3d.annualList') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
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

        <template v-else-if="panelKind === 'liunian' && selectedLiunian && !segment.isActive.value">
          <article class="focus-card">
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ `${selectedLiunian.year} ${selectedLiunian.ganzhi}` }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p class="ganzhi">{{ selectedLiunian.ganzhi }}</p>
            <p>{{ selectedLiunian.shishenGan }} / {{ selectedLiunian.shishenZhi }} · {{ selectedLiunian.intensity }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('bazi3d.annualSummary') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p>{{ selectedLiunian.summary }}</p>
            <p v-for="item in selectedLiunian.energyShifts" :key="item">{{ item }}</p>
          </article>
          <article>
            <h3 class="segment-title">
              <button type="button" data-testid="bazi-3d-segment-entry" @click="segment.open(nodeId, 'detail')">
                <span>{{ $t('bazi3d.natalSignals') }}</span>
                <UIcon name="i-lucide-chevron-right" class="segment-icon" />
              </button>
            </h3>
            <p v-for="signal in selectedLiunian.signals" :key="`${selectedLiunian.year}-${signal.value}`">
              {{ signal.value }}{{ signal.type }} · {{ signal.impact }}
            </p>
          </article>
        </template>

        <p class="disclaimer">{{ $t('baziChart.disclaimer') }}</p>
          </div>
        </Transition>
      </div>
    </aside>

    <div v-show="overlayOpen" class="controls-hint" :class="{ 'is-muted': !uiOpen }">
      <span><kbd>{{ $t('bazi3d.drag') }}</kbd> {{ $t('bazi3d.orbit') }}</span>
      <span><kbd>{{ $t('bazi3d.scroll') }}</kbd> {{ $t('bazi3d.zoom') }}</span>
      <span>{{ $t('bazi3d.clickHint') }}</span>
    </div>

    <nav
      v-show="overlayOpen"
      class="segment-tabbar"
      data-testid="bazi-3d-segment-tabbar"
      aria-label="Chart segments"
    >
      <button
        v-for="config in segmentTabs"
        :key="config.id"
        type="button"
        class="segment-tab"
        :class="{ 'is-active': segment.activeSegmentId.value === config.id }"
        :data-testid="`bazi-3d-segment-tab-${config.id}`"
        @click="segment.openConfig(config)"
      >
        <UIcon :name="config.icon" class="h-3.5 w-3.5" />
        <span>{{ $t(config.titleKey) }}</span>
      </button>
    </nav>

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
import { useBaziPaipanSegments } from '~/composables/useBaziPaipanSegments'

const props = defineProps<{
  controller: BaziPaipan3DState
  result: BaziChartResult
}>()

const emit = defineEmits<{
  back: []
}>()

const { t } = useI18n()
const stageRoot = ref<HTMLElement | null>(null)
const panelBody = ref<HTMLElement | null>(null)
const uiOpen = ref(true)
const autoRotate = ref(true)
const mount = ref<BaziPaipan3DMount | null>(null)
const reducedMotion = ref(false)
let abortController: AbortController | null = null

const resultRef = computed(() => props.result)
const staticMode = computed(() => reducedMotion.value
  || props.controller.state.value === 'static'
  || props.controller.quality.value === 'low')
const segment = useBaziPaipanSegments({
  result: resultRef,
  selectedNodeId: props.controller.selectedNodeId,
  mount,
  panelBody,
  staticMode,
  onSegmentNodeSelect: (nodeId) => {
    const config = segment.segmentConfigs.value.find(item => item.parentId === nodeId && item.key === 'detail')
    if (config) void segment.openConfig(config)
  },
  onSegmentBackground: () => {
    if (segment.isActive.value) void segment.back()
    else selectNode('overview')
  },
})
const handleSegmentNodeSelect = (nodeId: string) => {
  const config = segment.segmentConfigs.value.find(item => item.parentId === nodeId && item.key === 'detail')
  if (config) void segment.openConfig(config)
}
const handleSegmentBackground = () => {
  if (segment.isActive.value) void segment.back()
  else selectNode('overview')
}
const staticSegmentVisible = computed(() => segment.isActive.value && staticMode.value)
const segmentTabs = computed(() => {
  const dayun = selectedDayun.value
    ?? props.result.dayuns.find(item => item.isCurrent)
    ?? props.result.dayuns[0]
  const parentIds = [
    'overview',
    selectedPillar.value ? nodeId.value : 'pillar:day',
    selectedElement.value ? nodeId.value : 'element:wood',
    dayun ? `dayun:${dayun.index}` : '',
  ]

  return parentIds.flatMap(parentId => segment.configsForNode(parentId))
})

const fourPillars = computed(() => props.result.pillars.map(pillar => pillar.ganzhi).join(' '))
const overlayOpen = computed(() => props.controller.state.value !== 'pending')
const nodeId = computed(() => props.controller.selectedNodeId.value || 'overview')
const panelKind = computed(() => nodeId.value.split(':')[0] ?? 'overview')
const selectedPillar = computed(() => props.result.pillars.find(pillar => `pillar:${pillar.key}` === nodeId.value))
const selectedElement = computed(() => props.result.energy.wuxing.find(item => `element:${elementKey(item.key)}` === nodeId.value))
const selectedDayun = computed(() => props.result.dayuns.find(dayun => `dayun:${dayun.index}` === nodeId.value))
const selectedLiunian = computed(() => props.result.dayuns.flatMap(dayun => dayun.liunian).find(year => `liunian:${year.year}` === nodeId.value))
const currentDayun = computed(() => props.result.dayuns.find(dayun => dayun.isCurrent) ?? props.result.dayuns[0])
const currentLiunian = computed(() => currentDayun.value?.liunian.find(year => year.isCurrent) ?? currentDayun.value?.liunian[0])
const dayMaster = computed(() => props.controller.model.value?.dayMaster)
const shareSummary = computed(() => `${fourPillars.value} · ${props.result.energy.strength} · ${props.result.pattern.status}`)

const panelTitle = computed(() => {
  if (segment.activeSegment.value) return t(segment.activeSegment.value.titleKey)
  if (selectedPillar.value) return `${selectedPillar.value.label} · ${selectedPillar.value.ganzhi}`
  if (selectedElement.value) return `${t('bazi3d.element')} · ${selectedElement.value.label}`
  if (selectedDayun.value) return `${selectedDayun.value.startYear}-${selectedDayun.value.endYear} ${selectedDayun.value.ganzhi}`
  if (selectedLiunian.value) return `${selectedLiunian.value.year} ${selectedLiunian.value.ganzhi}`
  return t('bazi3d.overview')
})

const methodologyFields = computed(() => [
  { path: 'methodology.school', value: props.result.methodology.school },
  { path: 'methodology.calendar', value: props.result.methodology.calendar },
  { path: 'methodology.trueSolarTime', value: props.result.methodology.trueSolarTime },
  { path: 'methodology.dayBoundary', value: props.result.methodology.dayBoundary },
  { path: 'methodology.monthRule', value: props.result.methodology.monthRule },
  { path: 'methodology.scorePolicy', value: props.result.methodology.scorePolicy },
  { path: 'methodology.engines', value: props.result.methodology.engines.join(' / ') },
])

const activeSegmentFields = computed(() => {
  const active = segment.activeSegment.value
  if (!active) return []

  const fields = new Map<string, { path: string, value: string }>()
  const addField = (item: { path: string, value: string }) => {
    const existing = fields.get(item.path)
    if (!existing) {
      fields.set(item.path, { ...item })
      return
    }
    if (existing.value !== item.value) existing.value = `${existing.value} / ${item.value}`
  }

  active.source.forEach(addField)
  active.judgment.forEach(addField)
  return [...fields.values()]
})

function formatSegmentValue(value: string) {
  const enumValues: Record<string, string> = {
    corrected: t('bazi3d.labels.corrected'),
    uncorrected: t('bazi3d.labels.uncorrected'),
    failed: t('bazi3d.labels.failed'),
    boundary: t('bazi3d.labels.boundary'),
    favorable: t('bazi3d.labels.favorable'),
    unfavorable: t('bazi3d.labels.unfavorable'),
    neutral: t('bazi3d.labels.neutral'),
  }
  return value
    .replace(/\btrue\b/g, t('bazi3d.labels.yes'))
    .replace(/\bfalse\b/g, t('bazi3d.labels.no'))
    .replace(/\b(corrected|uncorrected|failed|boundary|favorable|unfavorable|neutral)\b/g, token => enumValues[token] ?? token)
}

function segmentFieldLabel(path: string) {
  const elementMatch = path.match(/^energy\.wuxing\[(.+)\]\.(.+)$/)
  if (elementMatch) {
    const labelKeys: Record<string, string> = {
      weight: 'elementWeight',
      percent: 'elementPercent',
      visibleCount: 'elementVisible',
      hiddenCount: 'elementHidden',
      role: 'elementRole',
      state: 'elementState',
      stateLabel: 'elementStateLabel',
      evidence: 'elementEvidence',
    }
    const key = labelKeys[elementMatch[2] ?? '']
    return key ? t(`bazi3d.labels.${key}`, { element: elementMatch[1] }) : t('bazi3d.labels.element')
  }

  if (path.startsWith('relations[')) return t(path.endsWith('.status') ? 'bazi3d.labels.relationStatus' : 'bazi3d.labels.relationSignal')
  if (path.startsWith('shenshaCombinations[')) return t('bazi3d.labels.shenshaCombination')
  if (path.startsWith('shensha[')) return t('bazi3d.labels.shenshaSignal')
  if (path.startsWith('dayuns[')) return t(path.endsWith('.isCurrent') ? 'bazi3d.labels.dayunState' : 'bazi3d.labels.dayun')
  if (path.startsWith('dayun.currentLiunian.energyShifts[')) return t('bazi3d.labels.energyShift')
  if (path.startsWith('dayun.currentLiunian.signals[')) return t('bazi3d.labels.annualSignal')
  if (path.startsWith('dayun.currentLiunian.')) {
    const currentYearKeys: Record<string, string> = {
      year: 'year',
      ganzhi: 'ganzhi',
      age: 'age',
      shishen: 'stemTenGod',
      intensity: 'intensity',
      summary: 'summary',
    }
    const key = currentYearKeys[path.split('.').at(-1) ?? '']
    return key ? t(`bazi3d.labels.${key}`) : t('bazi3d.labels.annual')
  }
  if (path.startsWith('dayun.liunian[')) return t('bazi3d.labels.annual')
  if (path.startsWith('pillar.hiddenStems[')) return t('bazi3d.labels.hiddenStem')
  if (path.startsWith('pillar.shensha[')) return t('bazi3d.labels.pillarShensha')
  if (path.startsWith('liunian.energyShifts[')) return t('bazi3d.labels.energyShift')
  if (path.startsWith('liunian.signals[')) return t('bazi3d.labels.annualSignal')
  if (path.startsWith('pattern.evidence[')) return t('bazi3d.labels.patternEvidence')

  const exactKeys: Record<string, string> = {
    'birth.solarText': 'solarDate',
    'birth.clockText': 'clock',
    'birth.trueSolarText': 'trueSolar',
    'birth.selectedHour': 'selectedHour',
    'birth.effectiveHour': 'effectiveHour',
    'birth.lunarDetail': 'lunarDetail',
    'birth.timezone': 'timezone',
    'birth.dayBoundaryChanged': 'dayBoundary',
    'birth.solarTerm.previous': 'previousTerm',
    'birth.solarTerm.next': 'nextTerm',
    'birth.solarTerm.progress': 'termProgress',
    'birth.solarTimeStatus': 'solarTimeStatus',
    'birth.solarTimeStatusText': 'solarTimeStatusText',
    'energy.strength': 'strength',
    'energy.supportRatio': 'supportRatio',
    'energy.rootStatus': 'rootStatus',
    'energy.rootQuality': 'rootQuality',
    'energy.monthCommand': 'monthCommand',
    'energy.monthCommandDetail': 'monthCommandDetail',
    'energy.primaryUseGod': 'primaryUseGod',
    'energy.supportUseGod': 'supportUseGod',
    'energy.avoidGod': 'avoidGod',
    'energy.adjustment': 'adjustment',
    'calculation.dayElement': 'calculationDayElement',
    'calculation.supportElement': 'calculationSupportElement',
    'calculation.dayElementWeight': 'calculationDayElementWeight',
    'calculation.supportElementWeight': 'calculationSupportElementWeight',
    'calculation.supportWeight': 'calculationSupportWeight',
    'calculation.totalWeight': 'calculationTotalWeight',
    'calculation.supportRatioFormula': 'calculationSupportRatioFormula',
    'calculation.strengthThresholds': 'calculationStrengthThresholds',
    'dayunMeta.direction': 'dayunDirection',
    'dayunMeta.startText': 'dayunStartText',
    'dayunMeta.startDate': 'dayunStartDate',
    'pattern.name': 'patternName',
    'pattern.monthMainQi': 'monthMainQi',
    'pattern.transparency': 'transparency',
    'pattern.rootStatus': 'rootStatus',
    'pattern.status': 'patternStatus',
    'structure.patternEvidence': 'patternEvidence',
    'pillar.label': 'pillarLabel',
    'pillar.key': 'pillarKey',
    'pillar.ganzhi': 'ganzhi',
    'pillar.gan': 'stem',
    'pillar.zhi': 'branch',
    'pillar.ganWuxing': 'stemElement',
    'pillar.zhiWuxing': 'branchElement',
    'pillar.shishenGan': 'stemTenGod',
    'pillar.hiddenStems': 'hiddenStems',
    'pillar.diShi': 'diShi',
    'pillar.selfSitting': 'selfSitting',
    'pillar.nayin': 'nayin',
    'pillar.xun': 'xun',
    'pillar.xunKong': 'xunKong',
    'pillar.voidKinds': 'voidKinds',
    'pillar.tag': 'pillarTag',
    'pillar.shensha.length': 'shenshaCount',
    'pillar.ganWuxing + pillar.shishenGan': 'stemEvidence',
    'pillar.zhiWuxing + main hidden stem': 'branchEvidence',
    'element.key': 'element',
    'element.weight': 'weight',
    'element.percent': 'percent',
    'element.visibleCount': 'visibleCount',
    'element.hiddenCount': 'hiddenCount',
    'element.role': 'role',
    'element.state': 'state',
    'element.stateLabel': 'stateLabel',
    'element.evidence': 'evidence',
    'element.direction': 'direction',
    'element.organs': 'organs',
    'dayun.ganzhi': 'ganzhi',
    'dayun.startYear': 'startYear',
    'dayun.endYear': 'endYear',
    'dayun.startAge': 'startAge',
    'dayun.endAge': 'endAge',
    'dayun.isCurrent': 'isCurrent',
    'dayun.shishenGan': 'stemTenGod',
    'dayun.shishenZhi': 'branchTenGod',
    'dayun.index': 'dayunIndex',
    'dayun.shensha.length': 'shenshaCount',
    'liunian.year': 'year',
    'liunian.ganzhi': 'ganzhi',
    'liunian.age': 'age',
    'liunian.shishenGan': 'stemTenGod',
    'liunian.shishenZhi': 'branchTenGod',
    'liunian.intensity': 'intensity',
    'liunian.isCurrent': 'isCurrent',
    'liunian.summary': 'summary',
    'liunian.signals.length': 'signalCount',
    'methodology.school': 'methodSchool',
    'methodology.calendar': 'methodCalendar',
    'methodology.trueSolarTime': 'methodTrueSolar',
    'methodology.dayBoundary': 'methodDayBoundary',
    'methodology.monthRule': 'methodMonthRule',
    'methodology.scorePolicy': 'methodScorePolicy',
    'methodology.engines': 'methodEngines',
  }
  const key = exactKeys[path]
  return key ? t(`bazi3d.labels.${key}`) : t('bazi3d.labels.field')
}

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
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  autoRotate.value = !reducedMotion.value
  abortController = new AbortController()
  const { mountBaziPaipan3D } = await import('~/utils/bazi-paipan-3d/renderer')
  if (abortController.signal.aborted) return
  mount.value = await mountBaziPaipan3D({
    root,
    state: props.controller,
    result: props.result,
    model,
    reducedMotion: reducedMotion.value,
    signal: abortController.signal,
    labels: { dayMaster: t('bazi3d.dayMaster') },
    onSegmentNodeSelect: handleSegmentNodeSelect,
    onSegmentBackground: handleSegmentBackground,
  })
})

onMounted(() => {
  if (!new URLSearchParams(window.location.search).get('bazi3dE2E')) return
  ;(window as Window & {
    __baziPaipanStageE2E?: {
      controller: BaziPaipan3DState
      segment: ReturnType<typeof useBaziPaipanSegments>
      getMount: () => BaziPaipan3DMount | null
    }
  }).__baziPaipanStageE2E = {
    controller: props.controller,
    segment,
    getMount: () => mount.value,
  }
})

onBeforeUnmount(() => {
  abortController?.abort()
  mount.value?.dispose()
  mount.value = null
  abortController = null
  delete (window as Window & { __baziPaipanStageE2E?: unknown }).__baziPaipanStageE2E
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

.stage-canvas {
  position: absolute;
  inset: 0 412px 0 0;
}

.bazi-3d.is-panel-collapsed .stage-canvas {
  inset: 0 16px 0 0;
}

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
  bottom: 56px;
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

.segment-title {
  margin: 0;
}

.segment-title button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.segment-title button:focus-visible {
  outline: 1px solid rgba(125, 211, 252, 0.7);
  outline-offset: 2px;
}

.segment-icon {
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.segment-title button:hover .segment-icon,
.segment-title button:focus-visible .segment-icon {
  opacity: 0.78;
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

.pillar-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.pillar-overview-grid > div {
  display: grid;
  gap: 2px;
  padding: 6px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 6px;
  background: rgba(2, 6, 23, 0.42);
}

.pillar-overview-grid b {
  color: #fcd34d;
  font-size: 11px;
}

.pillar-overview-grid span,
.pillar-overview-grid small {
  color: #cbd5e1;
  font-size: 10px;
  line-height: 1.3;
}

.pillar-overview-grid small {
  color: #94a3b8;
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

.segment-static {
  position: absolute;
  bottom: 92px;
  left: 16px;
  z-index: 3;
  width: min(260px, calc(100% - 32px));
  padding: 8px;
  border: 1px solid rgba(99, 102, 241, 0.24);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.72);
  pointer-events: none;
}

.segment-static svg {
  display: block;
  width: 100%;
  height: auto;
}

.segment-detail {
  display: grid;
  gap: 9px;
}

.segment-detail > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.segment-detail > header div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  color: #fcd34d;
}

.segment-detail > header strong {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-detail > header button,
.segment-detail section h4 {
  color: #7dd3fc;
}

.segment-detail > header button {
  margin-left: auto;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 3px;
  min-height: 25px;
  padding: 2px 6px;
  border: 1px solid rgba(56, 189, 248, 0.32);
  border-radius: 4px;
  background: rgba(14, 165, 233, 0.1);
  cursor: pointer;
  font-size: 11px;
}

.segment-detail section {
  padding: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.44);
}

.segment-detail h4 {
  margin: 0 0 6px;
  font-size: 11px;
}

.segment-detail p {
  color: #e2e8f0 !important;
}

.segment-detail dl {
  display: grid;
  gap: 5px;
  margin: 0;
}

.segment-detail dl > div {
  display: grid;
  gap: 2px;
}

.segment-detail dt {
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.segment-detail dd {
  margin: 0;
  color: #cbd5e1;
  font-size: 11px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.segment-detail ul {
  display: grid;
  gap: 4px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
}

.segment-detail li {
  display: grid;
  gap: 2px;
}

.segment-detail li > span {
  color: #64748b;
  font-size: 10px;
}

.segment-view-enter-active,
.segment-view-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.segment-view-enter-from,
.segment-view-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.segment-fade-enter-active,
.segment-fade-leave-active {
  transition: opacity 0.24s ease;
}

.segment-fade-enter-from,
.segment-fade-leave-to {
  opacity: 0;
}

@media (hover: none) {
  .segment-icon {
    opacity: 0.56;
  }
}

.controls-hint {
  position: absolute;
  bottom: 74px;
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

  .segment-tabbar {
    position: absolute;
    right: 412px;
    bottom: 12px;
    left: 16px;
    z-index: 5;
    display: flex;
    gap: 6px;
    padding: 6px;
  justify-content: center;
  flex-wrap: wrap;
  row-gap: 5px;
    border: 1px solid rgba(99, 102, 241, 0.26);
    border-radius: 8px;
    background: rgba(2, 6, 23, 0.78);
    backdrop-filter: blur(14px);
    scrollbar-width: none;
  }

  .segment-tabbar::-webkit-scrollbar {
    display: none;
  }

  .segment-tab {
    display: inline-flex;
  flex: 0 1 auto;
  min-width: 0;
    align-items: center;
    gap: 5px;
    min-height: 34px;
    padding: 5px 9px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 6px;
    background: transparent;
    color: #cbd5e1;
    cursor: pointer;
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 11px;
    white-space: nowrap;
  }

  .segment-tab:hover {
    border-color: rgba(245, 158, 11, 0.34);
    background: rgba(245, 158, 11, 0.08);
    color: #fde68a;
  }

  .segment-tab.is-active {
    border-color: rgba(251, 191, 36, 0.66);
    background: rgba(245, 158, 11, 0.16);
    color: #fcd34d;
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
    bottom: 60px;
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

  .segment-tabbar {
    right: 8px;
    bottom: 10px;
    left: 8px;
  }

  .stage-canvas,
  .bazi-3d.is-panel-collapsed .stage-canvas {
    inset: 0 0 47% 0;
  }

  .segment-static {
    right: 8px;
    bottom: auto;
    left: 8px;
    top: 68px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .segment-view-enter-active,
  .segment-view-leave-active,
  .segment-fade-enter-active,
  .segment-fade-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
