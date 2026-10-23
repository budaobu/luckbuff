<script setup lang="ts">
import type { HumanDesignChartResult } from '~~/server/utils/tools/human-design'
import {
  HUMAN_DESIGN_ALL_CHANNELS,
  HUMAN_DESIGN_CENTER_POINTS,
  HUMAN_DESIGN_CENTER_SHAPES,
  HUMAN_DESIGN_CENTERS,
  HUMAN_DESIGN_GATE_POSITIONS,
  humanDesignGateCenter,
} from '~~/app/utils/human-design-geometry'

const CENTER_SHAPES = HUMAN_DESIGN_CENTER_SHAPES
const CENTER_POINTS = HUMAN_DESIGN_CENTER_POINTS
const GATE_POSITIONS = HUMAN_DESIGN_GATE_POSITIONS
const CENTERS = HUMAN_DESIGN_CENTERS.map(center => ({
  ...center,
  labelKey: `humanDesign.centers.${center.id}`,
}))

const props = defineProps<{
  result: HumanDesignChartResult
}>()

const activeGateMap = computed(() => new Map(props.result.gates.map(gate => [gate.gate, gate])))
const definedChannelKeys = computed(() => new Set(props.result.channels.map(channel => channel.key)))

function centerPoints(id: string) {
  return CENTER_SHAPES[id]?.points
}

function centerRect(id: string): [number, number, number, number] {
  return CENTER_SHAPES[id]?.rect ?? [0, 0, 0, 0]
}

function centerLabel(gate: number) {
  return `humanDesign.centers.${humanDesignGateCenter(gate)}`
}

function gateLabel(gate: number) {
  return `${gate}`
}
</script>

<template>
  <div class="bodygraph">
    <svg viewBox="0 0 420 656" role="img" :aria-label="$t('humanDesign.bodygraphTitle')">
      <g
        v-for="[from, to, left, right] in HUMAN_DESIGN_ALL_CHANNELS"
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
