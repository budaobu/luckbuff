<template>
  <canvas
    ref="canvas"
    class="absolute inset-0 w-full h-full pointer-events-none"
  />
</template>

<script setup lang="ts">
const canvas = ref<HTMLCanvasElement>()
const colorMode = useColorMode()

/* ---------- Types ---------- */
interface Star {
  x: number; y: number; radius: number
  alpha: number; targetAlpha: number; twinkleSpeed: number
  driftX: number; driftY: number
}
interface ShootingStar {
  x: number; y: number; length: number; speed: number
  angle: number; alpha: number; life: number; maxLife: number
}
interface SymbolItem {
  x: number; y: number; text: string; size: number
  alpha: number; targetAlpha: number; breatheSpeed: number
  driftX: number; driftY: number; rotation: number; rotationSpeed: number
}

/* ---------- Constants ---------- */
const MYSTIC_SYMBOLS = [
  '☯', '乾', '坤', '震', '巽', '坎', '离', '艮', '兑',
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
  '金', '木', '水', '火', '土',
]

onMounted(() => {
  const el = canvas.value
  if (!el) return

  const ctx = el.getContext('2d')
  if (!ctx) return

  let w = 0, h = 0, dpr = 1, animId = 0
  let lastShootingStar = 0
  let isVisible = true
  let lastFrame = 0
  const TARGET_FPS = 30
  const FRAME_INTERVAL = 1000 / TARGET_FPS
  const isDark = () => colorMode.value === 'dark'

  /* -- dark mode: stars -- */
  const stars: Star[] = []
  let shootingStars: ShootingStar[] = []

  /* -- light mode: symbols -- */
  const symbols: SymbolItem[] = []

  function resize() {
    const rect = el!.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = Math.max(rect.width, el!.offsetWidth, 1)
    h = Math.max(rect.height, el!.offsetHeight, 1)
    el!.width = Math.floor(w * dpr)
    el!.height = Math.floor(h * dpr)
    ctx!.setTransform(1, 0, 0, 1, 0, 0)
    ctx!.scale(dpr, dpr)
  }

  /* ---------- Dark mode init ---------- */
  function initStars() {
    stars.length = 0
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.5,
        targetAlpha: Math.random() * 0.5 + 0.4,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        driftX: (Math.random() - 0.5) * 0.02,
        driftY: (Math.random() - 0.5) * 0.02,
      })
    }
  }

  function spawnShootingStar() {
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4
    shootingStars.push({
      x: Math.random() * w * 0.3,
      y: Math.random() * h * 0.25,
      length: Math.random() * 120 + 80,
      speed: Math.random() * 4 + 5,
      angle,
      alpha: 1,
      life: 0,
      maxLife: Math.random() * 50 + 40,
    })
  }

  /* ---------- Light mode init ---------- */
  function initSymbols() {
    symbols.length = 0
    const count = Math.floor((w * h) / 28000)
    for (let i = 0; i < Math.max(count, 22); i++) {
      symbols.push({
        x: Math.random() * w,
        y: Math.random() * h,
        text: MYSTIC_SYMBOLS[Math.floor(Math.random() * MYSTIC_SYMBOLS.length)] ?? '☯',
        size: Math.random() * 16 + 16,
        alpha: Math.random() * 0.06 + 0.08,
        targetAlpha: Math.random() * 0.06 + 0.07,
        breatheSpeed: Math.random() * 0.005 + 0.002,
        driftX: (Math.random() - 0.5) * 0.12,
        driftY: (Math.random() - 0.5) * 0.08,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
      })
    }
  }

  /* ---------- Update ---------- */
  function update(now: number) {
    if (isDark()) {
      for (const s of stars) {
        s.x += s.driftX; s.y += s.driftY
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0
        const diff = s.targetAlpha - s.alpha
        if (Math.abs(diff) < 0.02) s.targetAlpha = Math.random() * 0.5 + 0.3
        s.alpha += diff * s.twinkleSpeed
      }
      if (now - lastShootingStar > 4000 + Math.random() * 4000) {
        spawnShootingStar()
        lastShootingStar = now
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]!
        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed
        s.life++
        s.alpha = Math.max(0, 1 - s.life / s.maxLife)
        if (s.life >= s.maxLife || s.x > w + 200 || s.y > h + 200) {
          shootingStars.splice(i, 1)
        }
      }
    } else {
      for (const s of symbols) {
        s.x += s.driftX; s.y += s.driftY
        if (s.x < -40) s.x = w + 40; if (s.x > w + 40) s.x = -40
        if (s.y < -40) s.y = h + 40; if (s.y > h + 40) s.y = -40
        s.rotation += s.rotationSpeed
        const diff = s.targetAlpha - s.alpha
        if (Math.abs(diff) < 0.005) s.targetAlpha = Math.random() * 0.06 + 0.06
        s.alpha += diff * s.breatheSpeed
      }
    }
  }

  /* ---------- Draw ---------- */
  function drawStar(s: Star) {
    ctx!.beginPath()
    ctx!.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(201, 162, 39, ${s.alpha * 0.08})`
    ctx!.fill()

    ctx!.beginPath()
    ctx!.arc(s.x, s.y, s.radius * 1.8, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(245, 230, 192, ${s.alpha * 0.15})`
    ctx!.fill()

    ctx!.beginPath()
    ctx!.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(255, 248, 220, ${s.alpha})`
    ctx!.fill()

    if (s.radius > 1.3) {
      ctx!.beginPath()
      ctx!.arc(s.x, s.y, s.radius * 0.4, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(255, 255, 255, ${s.alpha * 0.9})`
      ctx!.fill()
    }
  }

  function drawSymbol(s: SymbolItem) {
    ctx!.save()
    ctx!.translate(s.x, s.y)
    ctx!.rotate(s.rotation)
    ctx!.font = `${s.size}px "Noto Serif SC", serif`
    ctx!.textAlign = 'center'
    ctx!.textBaseline = 'middle'
    ctx!.fillStyle = `rgba(107, 91, 61, ${s.alpha})`
    ctx!.fillText(s.text, 0, 0)
    ctx!.restore()
  }

  function drawShootingStar(s: ShootingStar) {
    const tailX = s.x - Math.cos(s.angle) * s.length
    const tailY = s.y - Math.sin(s.angle) * s.length

    const outerGrad = ctx!.createLinearGradient(s.x, s.y, tailX, tailY)
    outerGrad.addColorStop(0, `rgba(245, 230, 192, ${s.alpha * 0.15})`)
    outerGrad.addColorStop(0.2, `rgba(201, 162, 39, ${s.alpha * 0.08})`)
    outerGrad.addColorStop(1, `rgba(201, 162, 39, 0)`)
    ctx!.beginPath(); ctx!.moveTo(s.x, s.y); ctx!.lineTo(tailX, tailY)
    ctx!.strokeStyle = outerGrad; ctx!.lineWidth = 6; ctx!.stroke()

    const grad = ctx!.createLinearGradient(s.x, s.y, tailX, tailY)
    grad.addColorStop(0, `rgba(255, 248, 220, ${s.alpha})`)
    grad.addColorStop(0.2, `rgba(245, 230, 192, ${s.alpha * 0.7})`)
    grad.addColorStop(0.6, `rgba(201, 162, 39, ${s.alpha * 0.3})`)
    grad.addColorStop(1, `rgba(201, 162, 39, 0)`)
    ctx!.beginPath(); ctx!.moveTo(s.x, s.y); ctx!.lineTo(tailX, tailY)
    ctx!.strokeStyle = grad; ctx!.lineWidth = 2.5; ctx!.stroke()

    ctx!.beginPath(); ctx!.arc(s.x, s.y, 6, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(245, 230, 192, ${s.alpha * 0.2})`; ctx!.fill()

    ctx!.beginPath(); ctx!.arc(s.x, s.y, 2.5, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(255, 255, 255, ${s.alpha})`; ctx!.fill()
  }

  function draw() {
    ctx!.clearRect(0, 0, w, h)
    if (isDark()) {
      for (const s of stars) drawStar(s)
      for (const s of shootingStars) drawShootingStar(s)
    } else {
      for (const s of symbols) drawSymbol(s)
    }
  }

  function loop(now: number) {
    if (!isVisible) {
      animId = requestAnimationFrame(loop)
      return
    }
    const elapsed = now - lastFrame
    if (elapsed >= FRAME_INTERVAL) {
      lastFrame = now - (elapsed % FRAME_INTERVAL)
      update(now)
      draw()
    }
    animId = requestAnimationFrame(loop)
  }

  /* ---------- Init ---------- */
  function reinit() {
    resize()
    if (isDark()) {
      initStars()
      shootingStars = []
    } else {
      initSymbols()
    }
  }

  requestAnimationFrame(() => {
    reinit()
    animId = requestAnimationFrame(loop)
  })

  const ro = new ResizeObserver(() => { reinit() })
  ro.observe(el.parentElement || el)

  /* Visibility tracking — pause when off-screen */
  const io = new IntersectionObserver((entries) => {
    isVisible = entries[0]?.isIntersecting ?? true
  }, { threshold: 0 })
  io.observe(el.parentElement || el)

  /* Watch color-mode changes */
  watch(() => colorMode.value, () => { reinit() })

  onBeforeUnmount(() => {
    cancelAnimationFrame(animId)
    ro.disconnect()
    io.disconnect()
  })
})
</script>
