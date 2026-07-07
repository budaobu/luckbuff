<script setup lang="ts">
interface Props {
  gradient: [string, string]
  symbol: string
  size?: number | string
}
const props = withDefaults(defineProps<Props>(), { size: 160 })

const gradId = `fbti-grad-${props.symbol}`
const filterId = `fbti-water-${props.symbol}`

const symbolPaths: Record<string, string> = {
  glasses: 'M72 124a14 14 0 1 0 0 .01zm56 0a14 14 0 1 0 0 .01zm-56-2h56',
  chart: 'M76 138v-24h12v24zm18-32v32h12v-32zm18 14v18h12v-18z',
  moon: 'M118 108a22 22 0 1 1-28 28 16 16 0 1 0 28-28z',
  crystal: 'M100 116l10 18-10 8-10-8zm0-12a20 20 0 1 1 0 40 20 20 0 0 1 0-40zm-8-6h16v6h-16z',
  star: 'M100 108l5 12h12l-10 7 4 12-11-8-11 8 4-12-10-7h12z',
  clover: 'M100 124c-6-8-14-8-18-2s-2 14 6 16c-8 2-12 10-6 16s14 4 18-4c4 8 12 10 18 4s2-14-6-16c8-2 12-10 6-16s-14-4-18 2z',
  heart: 'M100 136c-12-12-26-8-26 6 0 10 10 20 26 32 16-12 26-22 26-32 0-14-14-18-26-6z',
  flag: 'M86 108h6v48h-6zm6 0l34 14-34 14z',
  bubble: 'M78 114h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6h-30l-14 10v-10h0a6 6 0 0 1-6-6v-22a6 6 0 0 1 6-6z',
  play: 'M90 116l32 16-32 16z',
  scales: 'M100 108v36m-18-36h36m-30 0l-8 22h36l-8-22m-26 28a10 10 0 0 0 20 0',
  eye: 'M76 126a24 12 0 1 1 48 0 24 12 0 1 1-48 0zm24-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  feather: 'M100 108c14 8 18 28 0 44-18-16-14-36 0-44zm0 8v32',
  sprout: 'M100 148v-20c-10-12-28-8-28 8 0 14 18 22 28 24 10-2 28-10 28-24 0-16-18-20-28-8z',
  music: 'M118 108v26a8 8 0 1 1-6 0v-18h-18v18a8 8 0 1 1-6 0v-24z',
  calendar: 'M82 110h36v40h-36zm0 12h36m-24-16v-6m12 6v-6',
}
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    class="fbti-mascot"
  >
    <defs>
      <radialGradient :id="gradId" cx="35%" cy="30%" r="80%">
        <stop offset="0%" :stop-color="props.gradient[0]" stop-opacity="0.95" />
        <stop offset="100%" :stop-color="props.gradient[1]" stop-opacity="0.75" />
      </radialGradient>
      <filter :id="filterId" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="blur" in2="SourceGraphic" operator="over" />
      </filter>
    </defs>

    <!-- 水彩底斑 -->
    <circle cx="100" cy="100" r="88" :fill="`url(#${gradId})`" :filter="`url(#${filterId})`" opacity="0.85" />
    <circle cx="100" cy="100" r="82" :fill="`url(#${gradId})`" opacity="0.5" />

    <!-- 动物白底 -->
    <g fill="#FBF9F1">
      <circle cx="55" cy="58" r="24" />
      <circle cx="145" cy="58" r="24" />
      <ellipse cx="100" cy="105" rx="56" ry="50" />
      <ellipse cx="100" cy="158" rx="62" ry="44" />
    </g>

    <!-- 五官 -->
    <g fill="#13233A">
      <circle cx="80" cy="98" r="5" />
      <circle cx="120" cy="98" r="5" />
      <ellipse cx="100" cy="115" rx="7" ry="5" />
      <path d="M94 124q6 6 12 0" stroke="#13233A" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>

    <!-- 人格符号 -->
    <g :fill="props.gradient[1]">
      <path :d="symbolPaths[props.symbol]" />
    </g>
  </svg>
</template>

<style scoped>
.fbti-mascot {
  display: block;
}
</style>
