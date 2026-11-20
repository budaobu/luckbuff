<template>
  <div
    class="room-stage"
    :data-quality="stage.quality.value"
    :data-state="model.phase"
    :data-flow="model.flowStage"
    :data-error="stage.errorMessage.value || undefined"
    :data-model-pillars="model.pillars.map(pillar => `${pillar.key}:${pillar.gan}${pillar.zhi}`).join('|')"
    :data-current-pillars="model.currentPillars.map(pillar => `${pillar.key}:${pillar.gan}${pillar.zhi}`).join('|')"
    :data-screen-slide="model.slideId || undefined"
    :data-screen-title="model.slideTitle || undefined"
    :data-screen-detail="model.slideDetail || undefined"
    :data-screen-page="`${model.slideIndex + 1}/${model.slideCount}`"
    data-testid="bazi-room-canvas"
    :aria-label="$t('baziPaipanRoom.roomLabel')"
  >
    <div ref="stageRoot" class="stage-root" />

    <div class="stage-tools">
      <button type="button" :title="$t('baziPaipanRoom.resetView')" @click="stage.resetView()">
        <UIcon name="i-lucide-focus" class="h-4 w-4" />
        <span>{{ $t('baziPaipanRoom.resetView') }}</span>
      </button>
    </div>

    <div v-if="!stage.ready.value && !stage.errorMessage.value" class="stage-boot" aria-live="polite">
      <div class="boot-emblem" aria-hidden="true">
        <span class="boot-halo" />
        <span class="boot-ring" />
        <span class="boot-orbit">
          <i />
        </span>
        <span class="boot-mark">命</span>
      </div>
      <p class="boot-text">{{ $t('baziPaipanRoom.ritualLoading') }}</p>
    </div>

    <div v-if="stage.errorMessage.value" class="stage-error" role="status">
      <p>{{ $t('baziPaipanRoom.stageError') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaziRoomSceneModel } from '~/utils/bazi-paipan-room/model'
import type { BaziRoomRendererLabels } from '~/utils/bazi-paipan-room/renderer'

const props = defineProps<{
  model: BaziRoomSceneModel
  stage: ReturnType<typeof useBaziPaipanStageKit>
  labels: BaziRoomRendererLabels
}>()

const emit = defineEmits<{
  keeperAnchor: [anchor: { x: number, y: number }]
}>()

const { t } = useI18n()
const stageRoot = ref<HTMLElement | null>(null)
const reducedMotion = ref(false)
let mediaQuery: MediaQueryList | null = null

const rendererLabels = computed(() => ({
  room: props.labels.room,
  chart: props.labels.chart,
  idle: props.labels.idle,
  calculating: props.labels.calculating,
  revealed: props.labels.revealed,
  today: props.labels.today,
  currentBazi: props.labels.currentBazi,
  flowYear: props.labels.flowYear,
  flowMonth: props.labels.flowMonth,
  flowDay: props.labels.flowDay,
  flowHour: props.labels.flowHour,
  pillars: props.labels.pillars,
  currentDayun: props.labels.currentDayun,
  reading: props.labels.reading,
  chenyu: props.labels.chenyu,
  readingWaiting: props.labels.readingWaiting,
  fullChart: props.labels.fullChart,
}))

onMounted(async () => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleMotion)
  if (stageRoot.value) await props.stage.attach(stageRoot.value, rendererLabels.value)
})

function handleMotion(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  props.stage.setReducedMotion(event.matches)
}

watch(() => props.model, model => props.stage.setScene(model), { immediate: true })
watch(() => props.stage.keeperAnchor.value, anchor => emit('keeperAnchor', anchor), { immediate: true })

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleMotion)
  props.stage.dispose()
})
</script>

<style scoped>
.room-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #05080f;
}

.stage-root,
.stage-root :deep(canvas) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.stage-root :deep(canvas) {
  display: block;
  cursor: grab;
}

.stage-root :deep(canvas:active) {
  cursor: grabbing;
}

.stage-tools {
  position: absolute;
  z-index: 4;
  left: 14px;
  bottom: 14px;
  display: flex;
}

.stage-tools button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(233, 238, 250, 0.16);
  border-radius: 6px;
  background: rgba(6, 10, 18, 0.7);
  color: rgba(233, 238, 250, 0.78);
  font-size: 12px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.stage-tools button:hover,
.stage-tools button:focus-visible {
  border-color: rgba(212, 175, 109, 0.55);
  color: #f2d998;
}

.stage-boot {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  background: rgba(5, 8, 15, 0.72);
  color: #e9eefa;
}

.boot-emblem {
  position: relative;
  display: grid;
  width: 112px;
  height: 112px;
  place-items: center;
}

.boot-halo,
.boot-ring,
.boot-orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
}

.boot-halo {
  background: radial-gradient(circle, rgba(217, 180, 93, 0.14) 0, rgba(217, 180, 93, 0) 68%);
  animation: boot-breathe 2.4s ease-in-out infinite;
}

.boot-ring {
  inset: 12px;
  border: 1px solid rgba(212, 175, 109, 0.24);
  border-top-color: rgba(242, 217, 152, 0.82);
  animation: boot-spin 1.8s linear infinite;
}

.boot-orbit {
  inset: 2px;
  animation: boot-spin 3.6s linear infinite reverse;
}

.boot-orbit i {
  position: absolute;
  top: -2px;
  left: calc(50% - 3px);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f2d998;
  box-shadow: 0 0 12px rgba(242, 217, 152, 0.7);
}

.boot-mark {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 1px solid rgba(212, 175, 109, 0.5);
  border-radius: 5px;
  background: rgba(7, 11, 19, 0.64);
  color: #f2d998;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 25px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(242, 217, 152, 0.08);
  animation: boot-mark-float 2.4s ease-in-out infinite;
}

.boot-text {
  animation: boot-text-breathe 2.4s ease-in-out infinite;
}

@keyframes boot-breathe {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.94);
  }

  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@keyframes boot-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes boot-mark-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

@keyframes boot-text-breathe {
  0%,
  100% {
    opacity: 0.58;
  }

  50% {
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .boot-halo,
  .boot-ring,
  .boot-orbit,
  .boot-mark,
  .boot-text {
    animation: none;
  }
}

.stage-boot p,
.stage-error p {
  margin: 0;
  font-size: 13px;
}

.stage-error {
  position: absolute;
  z-index: 6;
  bottom: 58px;
  left: 50%;
  translate: -50% 0;
  padding: 9px 12px;
  border: 1px solid rgba(226, 104, 104, 0.36);
  border-radius: 6px;
  background: rgba(42, 14, 16, 0.82);
  color: #ffd9d9;
  font-size: 12px;
}

@media (max-width: 640px) {
  .stage-tools span {
    display: none;
  }
}
</style>
