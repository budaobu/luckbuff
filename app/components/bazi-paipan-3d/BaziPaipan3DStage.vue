<template>
  <section
    class="b3d"
    :data-state="controller.state.value"
    :data-error="controller.errorMessage.value || undefined"
    aria-live="polite"
  >
    <div ref="stageRoot" class="b3d-canvas" data-testid="bazi-3d-canvas" aria-hidden="true" />

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
import { mountBaziPaipan3D } from '~/utils/bazi-paipan-3d/renderer'

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
const isStatic = computed(() => ['static', 'error'].includes(props.controller.state.value))

onMounted(async () => {
  const root = stageRoot.value
  const model = props.controller.model.value
  if (!root || !model) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  dispose = await mountBaziPaipan3D({
    root,
    state: props.controller,
    model,
    reducedMotion,
  })
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

.b3d-canvas {
  width: 100%;
  height: clamp(360px, 48vh, 520px);
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
