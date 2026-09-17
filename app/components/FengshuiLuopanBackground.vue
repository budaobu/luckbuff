<template>
  <div class="luopan-background" aria-hidden="true">
    <svg
      class="starry-background"
      viewBox="0 0 3000 3000"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="flp-star-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="flp-mansion-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#268" stop-opacity="1" />
          <stop offset="100%" stop-color="#268" stop-opacity="0" />
        </radialGradient>
      </defs>

      <g v-for="mansion in constellations" :key="mansion.name">
        <circle
          v-for="star in mansion.stars"
          :key="star.id"
          :cx="scaled(star.x)"
          :cy="scaled(star.y)"
          r="4"
          fill="url(#flp-mansion-gradient)"
          class="mansion-star"
        />
        <path
          v-for="(line, index) in mansion.lines"
          :key="`${mansion.name}-line-${index}`"
          :d="`M ${scaled(line.start.x)} ${scaled(line.start.y)} L ${scaled(line.end.x)} ${scaled(line.end.y)}`"
          stroke="rgba(255, 255, 255, 0.1)"
          stroke-width="1"
          fill="none"
        />
      </g>

      <circle
        v-for="star in stars"
        :key="star.id"
        :cx="star.x"
        :cy="star.y"
        :r="star.size"
        fill="url(#flp-star-gradient)"
        :style="{
          opacity: star.opacity,
          transform: `translate(${star.moveX}px, ${star.moveY}px)`,
          animation: `flp-twinkle ${star.twinkleSpeed}s infinite ease-in-out`,
        }"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import twentyEightConstellations from '~/utils/fengshui-luopan/twenty-eight-constellations'

interface DriftingStar {
  id: string
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  moveX: number
  moveY: number
  twinkleSpeed: number
}

const stageSize = 3000
const constellations = twentyEightConstellations
const stars = ref<DriftingStar[]>([])
let animationFrame: number | null = null

function scaled(value: string) {
  return Number(value) * stageSize
}

function generateStars() {
  stars.value = Array.from({ length: 200 }, (_, index) => {
    const x = Math.random() * stageSize
    const y = Math.random() * stageSize
    const speed = Math.random() * 3 + 2
    return {
      id: `star-${index}`,
      x,
      y,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.5,
      speed,
      moveX: 0,
      moveY: 0,
      twinkleSpeed: speed,
    }
  })
}

function updateStars() {
  const now = performance.now()
  stars.value = stars.value.map((star) => {
    const phase = now * 0.00003 * star.speed + star.x * 0.01
    return {
      ...star,
      moveX: Math.cos(phase) * 8,
      moveY: Math.sin(phase) * 8,
    }
  })
  animationFrame = requestAnimationFrame(updateStars)
}

onMounted(() => {
  generateStars()
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) updateStars()
})

onBeforeUnmount(() => {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.luopan-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: rgb(12, 12, 12);
}

.starry-background {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: center;
  animation: flp-background-rotate 120s linear infinite;
}

.mansion-star {
  animation: flp-twinkle 3s infinite ease-in-out;
}

@keyframes flp-background-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes flp-twinkle {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .starry-background,
  .mansion-star {
    animation: none;
  }
}
</style>
