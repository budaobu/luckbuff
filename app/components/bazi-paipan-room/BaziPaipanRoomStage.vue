<template>
  <div
    class="room-stage"
    :data-quality="stage.quality.value"
    :data-state="model.phase"
    :data-error="stage.errorMessage.value || undefined"
    :data-model-pillars="model.pillars.map(pillar => `${pillar.key}:${pillar.gan}${pillar.zhi}`).join('|')"
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

    <div class="stage-status" data-testid="bazi-room-quality">
      <span>{{ qualityLabel }}</span>
      <span v-if="stage.frameMs.value">{{ stage.frameMs.value.toFixed(1) }}ms</span>
    </div>

    <div v-if="!stage.ready.value && !stage.errorMessage.value" class="stage-boot" aria-live="polite">
      <span class="boot-mark" aria-hidden="true">命</span>
      <p>{{ $t('baziPaipanRoom.ritualLoading') }}</p>
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

const { t } = useI18n()
const stageRoot = ref<HTMLElement | null>(null)
const reducedMotion = ref(false)
let mediaQuery: MediaQueryList | null = null

const qualityLabel = computed(() => ({
  high: t('baziPaipanRoom.qualityHigh'),
  mid: t('baziPaipanRoom.qualityMid'),
  low: t('baziPaipanRoom.qualityLow'),
})[props.stage.quality.value])

const rendererLabels = computed(() => ({
  room: props.labels.room,
  chart: props.labels.chart,
  idle: props.labels.idle,
  calculating: props.labels.calculating,
  revealed: props.labels.revealed,
  today: props.labels.today,
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

.stage-status {
  position: absolute;
  z-index: 4;
  top: 12px;
  left: 14px;
  display: flex;
  gap: 6px;
  color: rgba(233, 238, 250, 0.46);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
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

.boot-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgba(212, 175, 109, 0.62);
  border-radius: 4px;
  color: #f2d998;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 23px;
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

  .stage-status span:last-child {
    display: none;
  }
}
</style>
