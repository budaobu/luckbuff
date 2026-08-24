<template>
  <div ref="containerRef" class="astro-dice-roller">
    <div
      v-for="(item, i) in results"
      :key="i"
      class="dice-label"
      :style="labelStyle(i)"
    >
      <transition name="fade">
        <span v-if="landed" class="dice-label-text">{{ item.label }}</span>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

interface DiceResult {
  label: string
  /** 落地后朝上那面要显示的符号（服务端随机结果的 glyph） */
  glyph?: string
}

const props = withDefaults(
  defineProps<{
    results: DiceResult[]
    /** 每颗骰子的符号池（如行星 12 符号），翻滚时随机上脸 */
    symbols?: string[][]
    autoRoll?: boolean
    duration?: number // ms
  }>(),
  {
    symbols: () => [],
    autoRoll: false,
    duration: 1800,
  }
)

const emit = defineEmits<{
  (e: 'landed'): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const landed = ref(false)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let dice: THREE.Mesh[] = []
let shadows: THREE.Mesh[] = []
let shadowTexture: THREE.CanvasTexture | null = null
let rafId = 0
let resizeObserver: ResizeObserver | null = null

// purple / amber / sky — add more colors if results.length > 3 (e.g. Planet / Sign / House)
const DICE_COLORS = [0x8b5cf6, 0xf59e0b, 0x38bdf8]

// BoxGeometry 材质顺序：+x, -x, +y, -y, +z, -z
const FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
]

function lighten(hex: number, amt: number): string {
  const c = new THREE.Color(hex).lerp(new THREE.Color(0xffffff), amt)
  return `#${c.getHexString()}`
}

function createFaceTexture(color: number, glyph: string): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const hex = '#' + color.toString(16).padStart(6, '0')

  // 中心微亮的径向底色，避免纯色塑料感
  const grad = ctx.createRadialGradient(size * 0.38, size * 0.32, size * 0.08, size / 2, size / 2, size * 0.78)
  grad.addColorStop(0, lighten(color, 0.28))
  grad.addColorStop(1, hex)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  // 内凹边框，刻面感
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = 6
  ctx.strokeRect(12, 12, size - 24, size - 24)

  if (glyph) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `600 148px 'Noto Serif SC', 'Songti SC', 'Apple Symbols', serif`
    // 先描一圈深色浮雕底，再铺白面，符号才有刻上去的感觉
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillText(glyph, size / 2, size / 2 + 14)
    ctx.fillStyle = 'rgba(255,255,255,0.96)'
    ctx.fillText(glyph, size / 2, size / 2 + 8)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function createShadowTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(10,8,20,0.5)')
  grad.addColorStop(0.65, 'rgba(10,8,20,0.18)')
  grad.addColorStop(1, 'rgba(10,8,20,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/** 从符号池随机抽 6 个不重复符号上脸；池为空则返回空面 */
function randomFaceGlyphs(pool: string[]): string[] {
  const bag = [...pool]
  const out: string[] = []
  while (out.length < 6 && bag.length) {
    out.push(bag.splice(Math.floor(Math.random() * bag.length), 1)[0]!)
  }
  while (out.length < 6) out.push('')
  return out
}

function setFaceGlyph(die: THREE.Mesh, faceIdx: number, glyph: string) {
  const mats = die.material as THREE.MeshStandardMaterial[]
  const mat = mats[faceIdx]
  if (!mat) return
  mat.map?.dispose()
  mat.map = createFaceTexture(die.userData.color as number, glyph)
  mat.needsUpdate = true
}

/** 骰子当前朝上的面（世界 +Y 方向分量最大的局部法线） */
function topFaceIndex(die: THREE.Mesh): number {
  const v = new THREE.Vector3()
  let best = 0
  let bestY = -Infinity
  FACE_NORMALS.forEach((n, idx) => {
    v.copy(n).applyQuaternion(die.quaternion)
    if (v.y > bestY) {
      bestY = v.y
      best = idx
    }
  })
  return best
}

function initScene() {
  const el = containerRef.value
  if (!el) return

  const width = el.clientWidth
  const height = el.clientHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 3.2, 6.5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  el.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const key = new THREE.DirectionalLight(0xffffff, 1.15)
  key.position.set(4, 6, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x93c5fd, 0.45)
  rim.position.set(-5, 2, -4)
  scene.add(rim)

  const count = props.results.length || 3
  const spacing = 2.4
  const startX = -((count - 1) * spacing) / 2

  shadowTexture = createShadowTexture()
  dice = []
  shadows = []
  for (let i = 0; i < count; i++) {
    const color = DICE_COLORS[i % DICE_COLORS.length]
    const geometry = new RoundedBoxGeometry(1.4, 1.4, 1.4, 4, 0.14)
    const materials = randomFaceGlyphs(props.symbols[i] ?? []).map(
      g =>
        new THREE.MeshStandardMaterial({
          map: createFaceTexture(color, g),
          roughness: 0.32,
          metalness: 0.08,
        }),
    )
    const die = new THREE.Mesh(geometry, materials)
    die.position.set(startX + i * spacing, 0, 0)
    die.userData.color = color
    scene.add(die)
    dice.push(die)

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.1),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.42 }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(startX + i * spacing, -0.72, 0)
    scene.add(shadow)
    shadows.push(shadow)
  }

  window.addEventListener('resize', handleResize)
  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(el)

  renderFrame()
}

function handleResize() {
  const el = containerRef.value
  if (!el || !camera || !renderer) return
  const width = el.clientWidth
  const height = el.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  renderFrame()
}

function renderFrame() {
  if (!renderer || !scene || !camera) return
  renderer.render(scene, camera)
}

// cubic ease-out for a natural deceleration into the landing
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Plays the tumble + bounce animation. Faces spin through the symbol pool
 * during the tumble; on landing, whichever face points up gets repainted
 * with the server-decided result glyph — the die literally shows the roll.
 */
function rollDice() {
  landed.value = false
  cancelAnimationFrame(rafId)

  // 开滚先换一组随机面，翻滚时有"符号在转"的感觉
  dice.forEach((die, i) => {
    const pool = props.symbols[i] ?? []
    if (!pool.length) return
    randomFaceGlyphs(pool).forEach((g, faceIdx) => setFaceGlyph(die, faceIdx, g))
  })

  const start = performance.now()
  const duration = props.duration

  // 终值取 90° 的整数倍，骰子落定是平的，不会歪着卡住
  const tumbles = dice.map(() => ({
    x: (4 + Math.floor(Math.random() * 6)) * (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1),
    y: (4 + Math.floor(Math.random() * 6)) * (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1),
    z: (4 + Math.floor(Math.random() * 6)) * (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1),
  }))

  function tick(now: number) {
    const elapsed = now - start
    const t = Math.min(elapsed / duration, 1)
    const eased = easeOutCubic(t)
    const bounce = Math.sin(t * Math.PI) * (1 - t) * 1.6 // decaying bounce height
    const lift = Math.min(bounce, 1.2)

    dice.forEach((die, i) => {
      const tumble = tumbles[i]!
      die.rotation.x = tumble.x * eased
      die.rotation.y = tumble.y * eased
      die.rotation.z = tumble.z * eased
      die.position.y = bounce

      const shadow = shadows[i]
      if (shadow) {
        shadow.scale.setScalar(1 - lift * 0.3)
        ;(shadow.material as THREE.MeshBasicMaterial).opacity = 0.42 - lift * 0.18
      }
    })

    renderFrame()

    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      dice.forEach((die, i) => {
        die.position.y = 0
        const glyph = props.results[i]?.glyph
        if (glyph) setFaceGlyph(die, topFaceIndex(die), glyph)

        const shadow = shadows[i]
        if (shadow) {
          shadow.scale.setScalar(1)
          ;(shadow.material as THREE.MeshBasicMaterial).opacity = 0.42
        }
      })
      renderFrame()
      landed.value = true
      emit('landed')
    }
  }

  rafId = requestAnimationFrame(tick)
}

function labelStyle(i: number) {
  const count = props.results.length || 3
  const leftPercent = ((i + 0.5) / count) * 100
  return { left: `${leftPercent}%` }
}

function disposeScene() {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  resizeObserver = null

  dice.forEach((die) => {
    die.geometry.dispose()
    const mats = Array.isArray(die.material) ? die.material : [die.material]
    mats.forEach((m) => {
      ;(m as THREE.MeshStandardMaterial).map?.dispose()
      m.dispose()
    })
  })
  dice = []

  shadows.forEach((s) => {
    s.geometry.dispose()
    ;(s.material as THREE.Material).dispose()
  })
  shadows = []
  shadowTexture?.dispose()
  shadowTexture = null

  renderer?.dispose()
  if (renderer?.domElement.parentElement) {
    renderer.domElement.parentElement.removeChild(renderer.domElement)
  }
  renderer = null
  scene = null
  camera = null
}

onMounted(() => {
  initScene()
  if (props.autoRoll) rollDice()
})

onBeforeUnmount(disposeScene)

// exposed so the parent can trigger the roll once the backend
// combination + AI reading have come back (SSE calc.post.ts result)
defineExpose({ roll: rollDice })
</script>

<style scoped>
.astro-dice-roller {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.astro-dice-roller canvas {
  display: block;
}

.dice-label {
  position: absolute;
  bottom: 8%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}

.dice-label-text {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(15, 15, 20, 0.65);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.fade-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
