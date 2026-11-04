<template>
  <span class="flip-clock" aria-hidden="true">
    <template v-for="(state, index) in states" :key="`${index}-${state.previous}-${state.value}`">
      <span v-if="isDigit(state.value)" class="flip-digit" :class="{ animating: state.animating }">
        <span class="flip-half top"><span>{{ state.value }}</span></span>
        <span class="flip-half bottom"><span>{{ state.value }}</span></span>

        <template v-if="state.animating">
          <span class="flip-flap top"><span>{{ state.previous }}</span></span>
          <span class="flip-flap bottom"><span>{{ state.value }}</span></span>
        </template>

        <span class="flip-seam" />
      </span>

      <span v-else class="flip-separator">{{ state.value }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
interface FlipDigitState {
  value: string
  previous: string
  animating: boolean
}

const props = defineProps<{
  chars: string[]
}>()

const states = ref<FlipDigitState[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()

function isDigit(value: string) {
  return /\d/.test(value)
}

function clearTimers() {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
}

watch(() => props.chars, (next, previous) => {
  clearTimers()
  states.value = next.map((value, index) => {
    const previousValue = previous?.[index] ?? value
    return {
      value,
      previous: previousValue,
      animating: isDigit(value) && value !== previousValue,
    }
  })

  states.value.forEach((state, index) => {
    if (!state.animating) return
    timers.set(index, setTimeout(() => {
      const current = states.value[index]
      if (current) {
        current.animating = false
        current.previous = current.value
      }
      timers.delete(index)
    }, 460))
  })
}, { immediate: true })

onBeforeUnmount(clearTimers)
</script>

<style scoped>
.flip-clock {
  display: flex;
  align-items: center;
  min-width: 0;
}

.flip-digit {
  position: relative;
  display: inline-block;
  width: clamp(24px, 8vw, 52px);
  height: clamp(46px, 14vw, 88px);
  overflow: hidden;
  border-radius: 9px;
  background: linear-gradient(180deg, #eef4fd 0 50%, #dbe6f8 50% 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 2px 5px rgba(38, 64, 119, 0.08);
  perspective: 320px;
}

.flip-digit + .flip-digit,
.flip-separator + .flip-digit,
.flip-digit + .flip-separator {
  margin-left: 2px;
}

.flip-half,
.flip-flap {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 50%;
  overflow: hidden;
}

.flip-half.bottom,
.flip-flap.bottom {
  top: 50%;
}

.flip-half > span,
.flip-flap > span {
  position: absolute;
  right: 0;
  left: 0;
  height: 200%;
  display: grid;
  place-items: center;
  color: #22345c;
  font-size: clamp(24px, 7.2vw, 48px);
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}

.flip-half.top > span,
.flip-flap.top > span {
  top: 0;
}

.flip-half.bottom > span,
.flip-flap.bottom > span {
  top: -100%;
}

.flip-separator {
  min-width: 9px;
  color: #22345c;
  text-align: center;
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 750;
}

.flip-flap {
  backface-visibility: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.flip-flap.top {
  z-index: 3;
  background: linear-gradient(180deg, #f1f6fe 0 100%);
  transform-origin: bottom center;
}

.flip-flap.bottom {
  z-index: 4;
  background: linear-gradient(180deg, #e1eafa 0 100%);
  transform-origin: top center;
  transform: rotateX(-90deg);
}

.flip-digit.animating .flip-flap.top {
  animation: fold-top 200ms cubic-bezier(0.55, 0, 0.85, 0.45) forwards;
}

.flip-digit.animating .flip-flap.bottom {
  animation: fold-bottom 220ms 190ms cubic-bezier(0.15, 0.55, 0.4, 1) forwards;
}

.flip-seam {
  position: absolute;
  top: calc(50% - 0.5px);
  right: 0;
  left: 0;
  z-index: 5;
  height: 1px;
  background: rgba(70, 100, 165, 0.22);
}

@keyframes fold-top {
  from {
    transform: rotateX(0);
  }

  to {
    transform: rotateX(-90deg);
  }
}

@keyframes fold-bottom {
  from {
    transform: rotateX(-90deg);
  }

  to {
    transform: rotateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .flip-digit.animating .flip-flap.top,
  .flip-digit.animating .flip-flap.bottom {
    animation: none;
  }
}
</style>
