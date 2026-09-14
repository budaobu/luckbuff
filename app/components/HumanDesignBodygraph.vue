<script setup lang="ts">
import type { HumanDesignChartResult } from '~~/server/utils/tools/human-design'

const props = defineProps<{
  result: HumanDesignChartResult
}>()

interface BodygraphShape {
  points?: string
  rect?: [number, number, number, number]
  label: [number, number]
}

interface GraphCenter {
  id: string
  gates: number[]
  labelKey: string
}

const CENTER_SHAPES: Record<string, BodygraphShape> = {
  head: { points: '210,16 252,74 168,74', label: [210, 62] },
  ajna: { points: '168,92 252,92 210,148', label: [210, 136] },
  throat: { rect: [172, 166, 76, 72], label: [210, 226] },
  g: { points: '210,250 262,302 210,354 158,302', label: [210, 342] },
  heart: { points: '302,232 348,262 302,292', label: [322, 278] },
  sacral: { rect: [172, 400, 76, 72], label: [210, 460] },
  spleen: { points: '136,382 136,470 64,426', label: [98, 462] },
  solarplexus: { points: '350,382 350,470 278,426', label: [322, 462] },
  root: { rect: [172, 556, 76, 72], label: [210, 616] },
} as const

const CENTERS: GraphCenter[] = [
  { id: 'head', gates: [64, 61, 63], labelKey: 'humanDesign.centers.head' },
  { id: 'ajna', gates: [47, 24, 4, 17, 11, 43], labelKey: 'humanDesign.centers.ajna' },
  { id: 'throat', gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16], labelKey: 'humanDesign.centers.throat' },
  { id: 'g', gates: [1, 13, 25, 46, 2, 15, 10, 7], labelKey: 'humanDesign.centers.g' },
  { id: 'heart', gates: [21, 40, 26, 51], labelKey: 'humanDesign.centers.heart' },
  { id: 'sacral', gates: [34, 5, 14, 29, 59, 9, 3, 42, 27], labelKey: 'humanDesign.centers.sacral' },
  { id: 'spleen', gates: [48, 57, 44, 50, 32, 28, 18], labelKey: 'humanDesign.centers.spleen' },
  { id: 'solarplexus', gates: [6, 37, 30, 55, 49, 22, 36], labelKey: 'humanDesign.centers.solarplexus' },
  { id: 'root', gates: [53, 60, 52, 19, 39, 41, 58, 38, 54], labelKey: 'humanDesign.centers.root' },
]

const GATE_POSITIONS: Record<number, [number, number]> = {
  64: [210, 38], 61: [210, 58], 63: [210, 78],
  47: [186, 104], 24: [210, 104], 4: [234, 104], 17: [186, 124], 11: [210, 124], 43: [234, 124],
  62: [188, 180], 23: [210, 180], 56: [232, 180], 35: [188, 196], 12: [210, 196], 45: [232, 196], 33: [188, 212], 8: [210, 212], 31: [232, 212], 20: [199, 228], 16: [221, 228],
  1: [210, 264], 13: [238, 290], 25: [210, 316], 46: [182, 290], 2: [210, 284], 15: [232, 306], 10: [210, 330], 7: [188, 306],
  21: [308, 248], 40: [336, 262], 26: [308, 278], 51: [336, 278],
  34: [190, 418], 5: [210, 418], 14: [230, 418], 29: [190, 435], 59: [210, 435], 9: [230, 435], 3: [190, 452], 42: [210, 452], 27: [230, 452],
  48: [94, 390], 57: [94, 410], 44: [94, 430], 50: [94, 450], 32: [76, 430], 28: [112, 430], 18: [94, 466],
  6: [320, 394], 37: [338, 412], 30: [338, 430], 55: [338, 448], 49: [320, 464], 22: [304, 412], 36: [304, 448],
  53: [190, 572], 60: [210, 572], 52: [230, 572], 19: [190, 589], 39: [210, 589], 41: [230, 589], 58: [190, 606], 38: [210, 606], 54: [230, 606],
}

const CHANNEL_CENTERS: Array<[string, string, number, number]> = [
  ['g', 'throat', 1, 8], ['g', 'sacral', 2, 14], ['sacral', 'root', 3, 60], ['ajna', 'head', 4, 63],
  ['g', 'sacral', 5, 15], ['solarplexus', 'sacral', 6, 59], ['throat', 'g', 7, 31], ['sacral', 'root', 9, 52],
  ['g', 'throat', 10, 20], ['g', 'sacral', 10, 34], ['spleen', 'g', 10, 57], ['ajna', 'throat', 11, 56],
  ['throat', 'solarplexus', 12, 22], ['g', 'throat', 13, 33], ['throat', 'spleen', 16, 48], ['ajna', 'throat', 17, 62],
  ['spleen', 'root', 18, 58], ['root', 'solarplexus', 19, 49], ['throat', 'sacral', 20, 34], ['throat', 'spleen', 20, 57],
  ['heart', 'throat', 21, 45], ['throat', 'ajna', 23, 43], ['ajna', 'head', 24, 61], ['g', 'heart', 25, 51],
  ['heart', 'spleen', 26, 44], ['sacral', 'spleen', 27, 50], ['spleen', 'root', 28, 38], ['sacral', 'g', 29, 46],
  ['solarplexus', 'root', 30, 41], ['spleen', 'root', 32, 54], ['sacral', 'spleen', 34, 57], ['throat', 'solarplexus', 35, 36],
  ['solarplexus', 'heart', 37, 40], ['solarplexus', 'root', 39, 55], ['sacral', 'root', 42, 53], ['ajna', 'head', 47, 64],
]

const CENTER_POINTS: Record<string, [number, number]> = {
  head: [210, 45],
  ajna: [210, 120],
  throat: [210, 202],
  g: [210, 302],
  heart: [325, 262],
  sacral: [210, 436],
  spleen: [100, 426],
  solarplexus: [325, 426],
  root: [210, 592],
}

const activeGateMap = computed(() => new Map(props.result.gates.map(gate => [gate.gate, gate])))
const definedChannelKeys = computed(() => new Set(props.result.channels.map(channel => channel.key)))

function centerPoints(id: string) {
  return CENTER_SHAPES[id]?.points
}

function centerRect(id: string): [number, number, number, number] {
  return CENTER_SHAPES[id]?.rect ?? [0, 0, 0, 0]
}

function centerLabel(gate: number) {
  const center = CENTERS.find(item => item.gates.includes(gate))
  return center?.labelKey ?? ''
}

function gateLabel(gate: number) {
  return `${gate}`
}
</script>

<template>
  <div class="bodygraph">
    <svg viewBox="0 0 420 656" role="img" :aria-label="$t('humanDesign.bodygraphTitle')">
      <g
        v-for="[from, to, left, right] in CHANNEL_CENTERS"
        :key="`channel-${left}-${right}`"
        class="graph-channel"
        :class="{ 'is-defined': definedChannelKeys.has(`${Math.min(left, right)}-${Math.max(left, right)}`) }"
      >
        <line
          :x1="CENTER_POINTS[from]![0]"
          :y1="CENTER_POINTS[from]![1]"
          :x2="CENTER_POINTS[to]![0]"
          :y2="CENTER_POINTS[to]![1]"
        />
      </g>

      <g
        v-for="center in CENTERS"
        :key="center.id"
        class="graph-center"
        :class="{ 'is-defined': result.definedCenters.includes(center.id) }"
        data-hd-ai-target
        :data-hd-ai-label="`${$t(center.labelKey)} · ${result.definedCenters.includes(center.id) ? $t('humanDesign.defined') : $t('humanDesign.open')}`"
        tabindex="0"
        role="button"
      >
        <polygon v-if="centerPoints(center.id)" :points="centerPoints(center.id)" />
        <rect
          v-else
          :x="centerRect(center.id)[0]"
          :y="centerRect(center.id)[1]"
          :width="centerRect(center.id)[2]"
          :height="centerRect(center.id)[3]"
          rx="8"
        />
      </g>

      <g
        v-for="(position, gate) in GATE_POSITIONS"
        :key="`gate-${gate}`"
        class="graph-gate"
        :class="{ 'is-active': activeGateMap.has(Number(gate)) }"
        data-hd-ai-target
        :data-hd-ai-label="`${gate} · ${$t(centerLabel(Number(gate)))}`"
        tabindex="0"
        role="button"
      >
        <circle :cx="position[0]" :cy="position[1]" r="7.5" />
        <text :x="position[0]" :y="position[1] + 3">{{ gateLabel(Number(gate)) }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.bodygraph {
  display: flex;
  justify-content: center;
}

svg {
  width: min(100%, 520px);
  height: auto;
}

.graph-channel line {
  stroke: var(--border-medium);
  stroke-width: 7;
  stroke-linecap: round;
  opacity: 0.42;
}

.graph-channel.is-defined line {
  stroke: var(--accent);
  opacity: 0.78;
}

.graph-center polygon,
.graph-center rect {
  fill: color-mix(in srgb, var(--surface-card) 88%, transparent);
  stroke: var(--border-medium);
  stroke-width: 2;
  transition: fill 150ms ease, stroke 150ms ease;
}

.graph-center.is-defined polygon,
.graph-center.is-defined rect {
  fill: color-mix(in srgb, var(--accent-bg) 82%, var(--surface-card));
  stroke: var(--accent);
}

.graph-center text {
  fill: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  text-anchor: middle;
  pointer-events: none;
}

.graph-center.is-defined text {
  fill: var(--text-primary);
}

.graph-gate circle {
  fill: var(--surface-bg);
  stroke: var(--border-medium);
  stroke-width: 1;
}

.graph-gate.is-active circle {
  fill: var(--text-primary);
  stroke: var(--text-primary);
}

.graph-gate text {
  fill: var(--text-faint);
  font-size: 7px;
  font-weight: 700;
  text-anchor: middle;
  pointer-events: none;
}

.graph-gate.is-active text {
  fill: var(--surface-bg);
}

.graph-center:focus-visible,
.graph-gate:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
</style>
