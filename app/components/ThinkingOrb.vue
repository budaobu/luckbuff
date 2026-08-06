<template>
  <canvas
    ref="canvasRef"
    role="img"
    :aria-label="ariaLabel || defaultLabel"
    :style="{ width: `${size}px`, height: `${size}px`, display: 'block' }"
  />
</template>

<script setup lang="ts">
import { MODE_DRAWS, resolvePreset } from 'thinking-orbs'
import type { OrbState, OrbSize, OrbTheme } from 'thinking-orbs'

/**
 * Vue wrapper around the framework-agnostic canvas painters shipped by
 * `thinking-orbs` (resolvePreset + MODE_DRAWS). The package's own component is
 * React-only; this reproduces its render loop so the same orb animations work
 * in Nuxt/Vue without pulling in a React runtime.
 */

interface Props {
  /** Which animation to show. */
  state?: OrbState
  /** Tuned size preset — 64 or 20 CSS px. */
  size?: OrbSize
  /** Theme mode; `auto` detects from the host project. */
  theme?: OrbTheme
  /** Animation speed multiplier on top of the preset's baked speed. */
  speed?: number
  /** Freeze the animation on the current frame. */
  paused?: boolean
  /** Overrides the per-state default aria-label. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  state: 'working',
  size: 64,
  theme: 'auto',
  speed: 1,
  paused: false,
  ariaLabel: undefined,
})

const DEFAULT_LABELS: Record<OrbState, string> = {
  working: 'Working…',
  searching: 'Searching…',
  solving: 'Solving…',
  listening: 'Listening…',
  connecting: 'Connecting…',
  weaving: 'Weaving…',
  composing: 'Composing…',
  breathing: 'Thinking…',
  shaping: 'Shaping…',
}

const defaultLabel = computed(() => DEFAULT_LABELS[props.state])

const canvasRef = ref<HTMLCanvasElement | null>(null)

// --- theme resolution (auto = ancestor data-theme/dark class, else OS) ---
const isDark = ref(false)
let themeObserver: MutationObserver | null = null
let mediaQuery: MediaQueryList | null = null

function resolveAutoTheme() {
  const el = canvasRef.value
  if (el) {
    let node: HTMLElement | null = el
    while (node) {
      const dt = node.getAttribute('data-theme')
      if (dt === 'dark') return true
      if (dt === 'light') return false
      if (node.classList.contains('dark')) return true
      if (node.classList.contains('light')) return false
      node = node.parentElement
    }
  }
  if (typeof matchMedia !== 'undefined') {
    return matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

function currentDark(): boolean {
  if (props.theme === 'dark') return true
  if (props.theme === 'light') return false
  return isDark.value
}

// --- render loop ---
let rafId = 0
let running = false
let intersectionObserver: IntersectionObserver | null = null
let onVisibility: (() => void) | null = null
let isVisible = true

const prefersReducedMotion = ref(false)
let motionQuery: MediaQueryList | null = null

function paint(ctx: CanvasRenderingContext2D, t: number, dpr: number, draw: (c: CanvasRenderingContext2D, size: number, t: number, dark: boolean, opts: Record<string, number | undefined>) => void, opts: Record<string, number | undefined>) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, props.size, props.size)
  draw(ctx, props.size, t, currentDark(), opts)
}

function stop() {
  running = false
  cancelAnimationFrame(rafId)
}

function setup() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(2, typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1)
  canvas.width = Math.round(props.size * dpr)
  canvas.height = Math.round(props.size * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { mode, speed, opts } = resolvePreset(props.state, props.size)
  const draw = MODE_DRAWS[mode]
  const effectiveSpeed = speed * props.speed
  const frame = (t: number) => paint(ctx, t, dpr, draw, opts)

  // prefers-reduced-motion: render a single representative frame, no animation.
  if (prefersReducedMotion.value) {
    frame(0.6)
    return
  }

  const tick = () => {
    frame((performance.now() / 1000) * effectiveSpeed)
    if (running) rafId = requestAnimationFrame(tick)
  }
  const start = () => {
    if (running || props.paused) return
    running = true
    rafId = requestAnimationFrame(tick)
  }

  frame((performance.now() / 1000) * effectiveSpeed)

  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = !!entry?.isIntersecting
      if (isVisible && document.visibilityState !== 'hidden') start()
      else stop()
    })
    intersectionObserver.observe(canvas)
  }

  onVisibility = () => {
    if (document.visibilityState === 'hidden') stop()
    else if (isVisible) start()
  }
  document.addEventListener('visibilitychange', onVisibility)

  if (!intersectionObserver) start()
}

function teardown() {
  stop()
  intersectionObserver?.disconnect()
  intersectionObserver = null
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  onVisibility = null
}

onMounted(() => {
  isDark.value = resolveAutoTheme()

  if (props.theme === 'auto') {
    mediaQuery = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null
    const onMedia = () => { isDark.value = resolveAutoTheme() }
    mediaQuery?.addEventListener('change', onMedia)

    const root = document.documentElement
    themeObserver = new MutationObserver(() => { isDark.value = resolveAutoTheme() })
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'], subtree: true })
  }

  motionQuery = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)') : null
  prefersReducedMotion.value = motionQuery?.matches ?? false
  const onMotion = (e: MediaQueryListEvent) => { prefersReducedMotion.value = e.matches }
  motionQuery?.addEventListener('change', onMotion)

  setup()

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', () => {})
    motionQuery?.removeEventListener('change', onMotion)
    themeObserver?.disconnect()
    teardown()
  })
})

// Re-render a fresh frame when state/size/theme/speed/paused change.
watch(
  () => [props.state, props.size, props.theme, props.speed, props.paused, isDark.value, prefersReducedMotion.value],
  () => {
    if (!canvasRef.value) return
    teardown()
    setup()
  },
)
</script>
