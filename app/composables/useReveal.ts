import type { Directive } from 'vue'

const STAGGER_STEP_MS = 80

let observer: IntersectionObserver | null = null

// shared with the scroll fallback so a node never reveals twice
const revealedSet = new WeakSet<HTMLElement>()

function markRevealed(el: HTMLElement) {
  revealedSet.add(el)
}

function revealChildren(el: HTMLElement) {
  const children = el.querySelectorAll<HTMLElement>('[data-reveal-child]')
  children.forEach((child, i) => {
    child.style.transitionDelay = `${20 + i * STAGGER_STEP_MS}ms`
    child.classList.add('revealed')
  })
  // hover must respond instantly, not wait out the queue delay
  children.forEach((child) => {
    child.addEventListener(
      'transitionend',
      () => { child.style.transitionDelay = '0ms' },
      { once: true },
    )
  })
}

function revealEl(el: HTMLElement) {
  if (revealedSet.has(el)) return
  markRevealed(el)
  if (el.dataset.revealStagger === 'parent') {
    revealChildren(el)
  } else {
    el.classList.add('revealed')
  }
}

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          revealEl(entry.target as HTMLElement)
          observer!.unobserve(entry.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
  }
  return observer
}

/**
 * scrollIntoView() on a transformed element can leave Chromium's
 * IntersectionObserver stuck (callbacks silently stop firing — observed in
 * this project's preview: headless Chromium + the MysticField canvas).
 * A scroll listener converges to the same result and never gets stuck.
 */
function startScrollFallback() {
  const pending = new Set<HTMLElement>()
  const check = () => {
    const vh = window.innerHeight
    for (const el of [...pending]) {
      const rect = el.getBoundingClientRect()
      if (rect.top < vh * 0.92 && rect.bottom > 0 && rect.height > 0) {
        pending.delete(el)
        revealEl(el)
      }
    }
    if (pending.size === 0) {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }
  window.addEventListener('scroll', check, { passive: true })
  window.addEventListener('resize', check, { passive: true })
  return { pending, check }
}

let fallback: ReturnType<typeof startScrollFallback> | null = null

/**
 * v-reveal — cindy.cn-style scroll reveal.
 *
 * Usage:
 *   <div v-reveal>                    fade+rise on scroll into view
 *   <div v-reveal="{ delay: 2 }">     with .1s * delay transition-delay
 *   <div v-reveal.stagger>            children marked data-reveal-child
 *                                     reveal as a queue (80ms apart)
 *
 * Degrades gracefully: without JS the elements stay visible (classes are
 * only applied by this directive, never present in SSR HTML), and
 * prefers-reduced-motion collapses all motion via CSS.
 */
export const vReveal: Directive<HTMLElement, { delay?: number } | undefined> = {
  getSSRProps() {
    // server render: no attributes -> element fully visible
    return {}
  },
  mounted(el, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (binding.modifiers.stagger) {
      el.dataset.revealStagger = 'parent'
      el.querySelectorAll<HTMLElement>('[data-reveal-child]').forEach((child) => {
        child.classList.add('reveal-pending')
      })
    } else {
      el.classList.add('reveal-pending')
      if (binding.value?.delay) {
        el.style.transitionDelay = `${binding.value.delay * 100}ms`
      }
    }
    getObserver().observe(el)
    if (!fallback) fallback = startScrollFallback()
    fallback.pending.add(el)
    fallback.check()
  },
  unmounted(el) {
    observer?.unobserve(el)
    fallback?.pending.delete(el)
  },
}
