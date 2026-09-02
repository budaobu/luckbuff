import type { Ref } from 'vue'

export function useLieflatChartReveal(target: Ref<SVGSVGElement | null | undefined>) {
  const revealed = ref(false)
  let observer: IntersectionObserver | null = null
  let replayTimer: number | null = null
  let revealFallbackTimer: number | null = null

  function reveal() {
    revealed.value = true
  }

  function replay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (replayTimer !== null) window.clearTimeout(replayTimer)
    revealed.value = false
    replayTimer = window.setTimeout(() => {
      revealed.value = true
      replayTimer = null
    }, 40)
  }

  onMounted(() => {
    if (!target.value) return
    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        reveal()
        observer?.disconnect()
        observer = null
      }
    }, { threshold: 0.2 })
    observer.observe(target.value)

    // The poster is also captured as one offscreen image; never leave a chart invisible.
    revealFallbackTimer = window.setTimeout(() => {
      revealFallbackTimer = null
      reveal()
    }, 180)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    if (replayTimer !== null) {
      window.clearTimeout(replayTimer)
      replayTimer = null
    }
    if (revealFallbackTimer !== null) {
      window.clearTimeout(revealFallbackTimer)
      revealFallbackTimer = null
    }
  })

  return { revealed, replay }
}
