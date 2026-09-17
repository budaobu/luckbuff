<template>
  <div
    class="fengshui-dial"
    :class="{
      'is-interactive': interactive,
      'is-calibrating': status === 'calibrating',
      'is-active': status === 'active',
    }"
    :tabindex="interactive ? 0 : -1"
    :aria-label="$t('fengshuiLuopan.title')"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @keydown="handleKeydown"
  >
    <div class="dial-motion" :style="{ transform: `rotate(${heading}deg)` }">
      <svg class="dial-svg" viewBox="0 0 800 800" aria-hidden="true">
        <circle
          class="dial-face"
          cx="400"
          cy="400"
          :r="outerRadius + scaleStyle.maxLineHeight * 2"
        />

        <circle
          cx="400"
          cy="400"
          :r="tianChiRadius"
          :stroke="lineStyle.borderColor"
          fill="none"
        />

        <circle
          v-for="layer in visibleLayerGeometry"
          :key="`border-${layer.index}`"
          cx="400"
          cy="400"
          :r="layer.outer"
          :stroke="lineStyle.borderColor"
          fill="none"
        />

        <path
          v-for="cell in cells"
          :key="`cell-${cell.layerIndex}-${cell.cellIndex}`"
          :d="cell.path"
          :fill="cell.fill"
        />

        <text
          v-for="label in labels"
          :key="`label-${label.layerIndex}-${label.cellIndex}-${label.subIndex}`"
          :x="label.x"
          :y="label.y"
          :transform="`rotate(${label.rotation} ${label.x} ${label.y})`"
          :fill="label.color"
          :font-size="label.fontSize"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ label.text }}
        </text>

        <line
          v-for="divider in dividers"
          :key="`divider-${divider.layerIndex}-${divider.index}`"
          :x1="divider.x1"
          :y1="divider.y1"
          :x2="divider.x2"
          :y2="divider.y2"
          :stroke="lineStyle.borderColor"
        />

        <g v-if="isShowScale">
          <line
            v-for="tick in ticks"
            :key="`tick-${tick.degree}`"
            :x1="tick.x1"
            :y1="tick.y1"
            :x2="tick.x2"
            :y2="tick.y2"
            :stroke="tick.highlight ? lineStyle.scaleHighlightColor : lineStyle.scaleColor"
          />
          <text
            v-for="tick in tickLabels"
            :key="`tick-label-${tick.degree}`"
            :x="tick.x"
            :y="tick.y"
            :transform="`rotate(${tick.rotation} ${tick.x} ${tick.y})`"
            :fill="lineStyle.scaleHighlightColor"
            :font-size="scaleStyle.numberFontSize ?? 20"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ tick.degree }}
          </text>
        </g>
      </svg>
    </div>

    <svg v-if="isShowTianxinCross" class="tianxin-cross" viewBox="0 0 800 800" aria-hidden="true">
      <line x1="40" y1="400" x2="760" y2="400" stroke="#ff0000" stroke-width="2" />
      <line x1="400" y1="40" x2="400" y2="760" stroke="#ff0000" stroke-width="2" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import compassTheme from '~/utils/fengshui-luopan/compass-theme'
import { angularDifference, normalizeDegrees } from '~/utils/fengshui-luopan/heading'
import type { LuopanSample, LuopanStatus } from '~/types/fengshui-luopan'

interface Props {
  status: LuopanStatus
  visibleLayers: number[]
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), { interactive: false })
const emit = defineEmits<{ headingChange: [heading: number] }>()

const CORRECTION_ANGLE = -90
const center = 400
const scaleStyle = compassTheme.scaclStyle
const lineStyle = compassTheme.line
const isShowScale = compassTheme.isShowScale !== false
const isShowTianxinCross = compassTheme.isShowTianxinCross === true

const outerRadius = center - scaleStyle.maxLineHeight * 3
const tianChiRadius = compassTheme.compassSize.tianChiRadius ?? outerRadius * 0.1
const layerHeight = (outerRadius - tianChiRadius) / compassTheme.data.length
const layerGeometry = compassTheme.data.map((_, index) => ({
  index,
  inner: tianChiRadius + layerHeight * index,
  outer: tianChiRadius + layerHeight * (index + 1),
}))

const visibleLayerGeometry = computed(() => {
  return layerGeometry.filter(layer => props.visibleLayers.includes(layer.index))
})

function rads(degrees: number) {
  return Math.PI * (degrees + CORRECTION_ANGLE) / 180
}

function point(radius: number, degrees: number) {
  return {
    x: center + radius * Math.cos(rads(degrees)),
    y: center + radius * Math.sin(rads(degrees)),
  }
}

function arcPath(startDegrees: number, endDegrees: number, inner: number, outer: number) {
  const innerStart = point(inner, startDegrees)
  const outerStart = point(outer, startDegrees)
  const outerEnd = point(outer, endDegrees)
  const innerEnd = point(inner, endDegrees)
  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${outer} ${outer} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${inner} ${inner} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

const cells = computed(() => {
  return visibleLayerGeometry.value.flatMap((layer) => {
    const config = compassTheme.data[layer.index]!
    const count = config.data.length
    const span = 360 / count
    return config.data.map((_, cellIndex) => {
      const fill = compassTheme.latticeFill.find(candidate => candidate[0] === cellIndex && candidate[1] === layer.index)?.[2] ?? 'transparent'
      return {
        layerIndex: layer.index,
        cellIndex,
        fill,
        path: arcPath(span * cellIndex, span * (cellIndex + 1), layer.inner, layer.outer),
      }
    })
  })
})

const labels = computed(() => {
  return visibleLayerGeometry.value.flatMap((layer) => {
    const config = compassTheme.data[layer.index]!
    const count = config.data.length
    const span = 360 / count
    const radius = layer.inner + layerHeight / 2
    const defaultFontSize = Math.min(Math.max(outerRadius / 20, 12), 24)

    return config.data.flatMap((entry, cellIndex) => {
      const entries = Array.isArray(entry) ? entry : [entry]
      const spacing = Array.isArray(entry) ? span / (entry.length + 1) : 0

      return entries.map((text, subIndex) => {
        const textAngle = Array.isArray(entry)
          ? span * cellIndex + (config.startAngle ?? 0) + spacing * (subIndex + 1)
          : span * cellIndex + span / 2 + (config.startAngle ?? 0)
        const position = point(radius, textAngle)
        const degrees = textAngle + CORRECTION_ANGLE + 90
        const extraRotation = config.vertical && degrees > 90 && degrees < 270 ? 270 : 90
        const color = Array.isArray(config.textColor)
          ? config.textColor[subIndex] ?? config.textColor[0] ?? '#ffffff'
          : config.textColor ?? '#ffffff'

        return {
          layerIndex: layer.index,
          cellIndex,
          subIndex,
          text,
          color,
          fontSize: config.fontSize ?? defaultFontSize,
          x: position.x,
          y: position.y,
          rotation: degrees + extraRotation,
        }
      })
    })
  })
})

const dividers = computed(() => {
  return visibleLayerGeometry.value.flatMap((layer) => {
    const count = compassTheme.data[layer.index]!.data.length
    const span = 360 / count
    return Array.from({ length: count }, (_, index) => {
      const start = point(layer.inner, span * index)
      const end = point(layer.outer, span * index)
      return {
        layerIndex: layer.index,
        index,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
      }
    })
  })
})

const ticks = computed(() => {
  const radius = layerGeometry[layerGeometry.length - 1]!.outer
  return Array.from({ length: 360 }, (_, index) => {
    const degree = index + 1
    const start = point(radius, degree)
    const length = degree % 10 === 0
      ? scaleStyle.maxLineHeight
      : degree % 5 === 0
        ? scaleStyle.midLineHeight
        : scaleStyle.minLineHeight
    const end = point(radius + length, degree)
    return {
      degree,
      highlight: degree % 10 === 0,
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    }
  })
})

const tickLabels = computed(() => {
  const radius = layerGeometry[layerGeometry.length - 1]!.outer + scaleStyle.maxLineHeight * 2
  return Array.from({ length: 36 }, (_, index) => {
    const degree = (index + 1) * 10
    const position = point(radius, degree)
    return {
      degree,
      x: position.x,
      y: position.y,
      rotation: degree + CORRECTION_ANGLE + 90,
    }
  })
})

const heading = ref(0)
let dragPointerId: number | null = null
let dragStartHeading = 0
let dragStartX = 0

function setHeading(value: LuopanSample | number) {
  const target = normalizeDegrees(typeof value === 'number' ? value : value.heading)
  // Keep the rendered angle continuous; interpolating 359 -> 0 would spin backwards.
  heading.value += angularDifference(heading.value, target)
}

function startDrag(event: PointerEvent) {
  if (!props.interactive || dragPointerId !== null) return
  dragPointerId = event.pointerId
  dragStartHeading = heading.value
  dragStartX = event.clientX
  ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
}

function moveDrag(event: PointerEvent) {
  if (event.pointerId !== dragPointerId) return
  heading.value = dragStartHeading - (event.clientX - dragStartX) * 0.45
  emit('headingChange', normalizeDegrees(heading.value))
}

function endDrag(event: PointerEvent) {
  if (event.pointerId === dragPointerId) dragPointerId = null
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.interactive) return
  const step = event.shiftKey ? 10 : 2
  if (event.key === 'ArrowLeft') heading.value -= step
  else if (event.key === 'ArrowRight') heading.value += step
  else if (event.key === 'Home') heading.value += angularDifference(heading.value, 0)
  else return

  event.preventDefault()
  emit('headingChange', heading.value)
}

defineExpose({ setHeading })
</script>

<style scoped>
.fengshui-dial {
  position: relative;
  width: var(--flp-dial-size, min(100%, 72vh));
  height: var(--flp-dial-size, min(100%, 72vh));
  aspect-ratio: 1;
  margin: auto;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.fengshui-dial.is-interactive {
  cursor: grab;
}

.fengshui-dial.is-interactive:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 50%;
}

.fengshui-dial.is-interactive:active {
  cursor: grabbing;
}

.dial-motion {
  width: 100%;
  height: 100%;
  transition: transform 0.11s linear;
  transform-origin: center;
  will-change: transform;
  backface-visibility: hidden;
}

.dial-svg {
  display: block;
  width: 100%;
  height: 100%;
  font-family: "Kaiti SC", "KaiTi", "STKaiti", "Noto Serif SC", serif;
}

.dial-face {
  fill: rgb(12, 12, 12);
}

.dial-svg circle,
.dial-svg path,
.dial-svg line {
  stroke-width: 1;
}

.dial-svg text {
  font-family: inherit;
}

.tianxin-cross {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.fengshui-dial.is-calibrating .dial-motion {
  animation: dial-prepare 1.8s ease-in-out;
}

@keyframes dial-prepare {
  0%,
  100% {
    opacity: 1;
    scale: 1;
  }

  45% {
    opacity: 0.78;
    scale: 0.97;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dial-motion,
  .fengshui-dial.is-calibrating .dial-motion {
    transition: none;
    animation: none;
  }
}
</style>
