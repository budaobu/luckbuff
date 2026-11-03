<template>
  <div
    ref="field"
    class="hero-hex-field"
    aria-hidden="true"
    data-state="loading"
  />
</template>

<script setup lang="ts">
import type { CanvasTexture, Color, ShaderMaterial, Vector2, WebGLRenderer } from 'three'
import { BAGUA_NAMES, BAGUA_SYMBOLS, LIUSHISI_GUA, LIUSHISI_GUA_SHORT_NAME_MAP, LIUSHISI_GUA_SYMBOLS } from '~/utils/zhouyi/constants'

const field = ref<HTMLDivElement>()
const colorMode = useColorMode()

let disposeScene: (() => void) | null = null
let setDiscColor: (() => void) | null = null

type HeroUniforms = {
  uTime: { value: number }
  uResolution: { value: Vector2 }
  uAspect: { value: number }
  uTexture: { value: CanvasTexture }
  uDiscColor: { value: Color }
  uMouse: { value: Vector2 }
  uEnergy: { value: number }
  uDiskCenter: { value: Vector2 }
  uDiskRadius: { value: number }
  uVerticalScale: { value: number }
}

type DiscHexagram = {
  symbol: string
  name: string
}

type BaguaRingItem = {
  name: string
  symbol: string
}

const DISC_HEXAGRAMS: DiscHexagram[] = LIUSHISI_GUA.map(hexagram => ({
  symbol: LIUSHISI_GUA_SYMBOLS[hexagram.id - 1]!,
  name: LIUSHISI_GUA_SHORT_NAME_MAP[hexagram.id] ?? hexagram.name,
}))

const BAGUA_RING: BaguaRingItem[] = BAGUA_NAMES.map((name, index) => ({
  name,
  symbol: BAGUA_SYMBOLS[index]!,
}))

onMounted(async () => {
  const container = field.value
  if (!container) return

  let disposed = false
  const THREE = await import('three')
  if (disposed || !container.isConnected) return

  const hero = container.closest('.home-hero')
  let width = container.clientWidth || 960
  let height = container.clientHeight || 640
  let renderer: WebGLRenderer | null = null

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
  }
  catch {
    container.dataset.state = 'fallback'
    return
  }

  const gl = renderer
  gl.outputColorSpace = THREE.SRGBColorSpace
  gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
  gl.setSize(width, height)
  gl.domElement.classList.add('hero-hex-canvas')
  container.appendChild(gl.domElement)

  function createHexagramTexture() {
    const size = 2048
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    const texture = new THREE.CanvasTexture(canvas)

    if (context) {
      const center = size / 2
      const radius = 1010
      const coreRadius = 226
      const taijiRadius = 138
      const baguaInner = 308
      const baguaOuter = 570
      const hexagramInner = 710
      const hexagramOuter = 920
      context.translate(center, center)

      const baseGradient = context.createRadialGradient(0, 0, 60, 0, 0, radius)
      baseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.055)')
      baseGradient.addColorStop(0.36, 'rgba(255, 255, 255, 0.03)')
      baseGradient.addColorStop(1, 'rgba(255, 255, 255, 0.01)')
      context.fillStyle = baseGradient
      context.beginPath()
      context.arc(0, 0, radius, 0, Math.PI * 2)
      context.fill()

      for (let index = 0; index < 64; index += 1) {
        if (index % 2 === 1) continue
        const startAngle = -Math.PI / 2 + (index / 64) * Math.PI * 2 + 0.005
        const endAngle = -Math.PI / 2 + ((index + 1) / 64) * Math.PI * 2 - 0.005
        context.fillStyle = 'rgba(255, 255, 255, 0.012)'
        context.beginPath()
        context.arc(0, 0, hexagramInner, startAngle, endAngle)
        context.arc(0, 0, hexagramOuter, endAngle, startAngle, true)
        context.closePath()
        context.fill()
      }

      context.strokeStyle = 'rgba(255, 255, 255, 0.13)'
      context.lineWidth = 2
      context.beginPath()
      context.arc(0, 0, hexagramOuter, 0, Math.PI * 2)
      context.stroke()

      context.strokeStyle = 'rgba(255, 255, 255, 0.07)'
      context.lineWidth = 1.2
      context.beginPath()
      context.arc(0, 0, hexagramInner, 0, Math.PI * 2)
      context.stroke()

      context.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      for (let index = 0; index < 64; index += 1) {
        const angle = -Math.PI / 2 + (index / 64) * Math.PI * 2
        context.beginPath()
        context.moveTo(Math.cos(angle) * (hexagramInner + 14), Math.sin(angle) * (hexagramInner + 14))
        context.lineTo(Math.cos(angle) * (hexagramOuter - 12), Math.sin(angle) * (hexagramOuter - 12))
        context.stroke()
      }

      context.textAlign = 'center'
      context.textBaseline = 'middle'

      DISC_HEXAGRAMS.forEach((hexagram, index) => {
        const angle = -Math.PI / 2 + (index / 64) * Math.PI * 2
        context.save()
        context.translate(Math.cos(angle) * 818, Math.sin(angle) * 818)
        context.rotate(angle + Math.PI / 2)

        context.fillStyle = 'rgba(255, 255, 255, 0.84)'
        context.font = '400 48px "Noto Serif Symbols 2", "Noto Serif Symbols", "Songti SC", "STSong", "SimSun", serif'
        context.fillText(hexagram.symbol, 0, -28)

        context.fillStyle = 'rgba(255, 255, 255, 0.5)'
        context.font = '500 20px "Noto Serif SC", "Songti SC", "SimSun", serif'
        context.fillText(hexagram.name, 0, 34)
        context.restore()
      })

      context.strokeStyle = 'rgba(255, 255, 255, 0.13)'
      context.lineWidth = 1.4
      context.beginPath()
      context.arc(0, 0, baguaOuter, 0, Math.PI * 2)
      context.stroke()

      context.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      context.lineWidth = 1.2
      context.beginPath()
      context.arc(0, 0, baguaInner, 0, Math.PI * 2)
      context.stroke()

      BAGUA_RING.forEach((_, sectorIndex) => {
        if (sectorIndex % 2 === 1) return
        const startAngle = -Math.PI / 2 + (sectorIndex / 8) * Math.PI * 2 + 0.014
        const endAngle = -Math.PI / 2 + ((sectorIndex + 1) / 8) * Math.PI * 2 - 0.014
        context.fillStyle = 'rgba(255, 255, 255, 0.024)'
        context.beginPath()
        context.arc(0, 0, baguaInner, startAngle, endAngle)
        context.arc(0, 0, baguaOuter, endAngle, startAngle, true)
        context.closePath()
        context.fill()
      })

      context.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      for (let index = 0; index < 8; index += 1) {
        const angle = -Math.PI / 2 + (index / 8) * Math.PI * 2
        context.beginPath()
        context.moveTo(Math.cos(angle) * (baguaInner + 16), Math.sin(angle) * (baguaInner + 16))
        context.lineTo(Math.cos(angle) * (baguaOuter - 16), Math.sin(angle) * (baguaOuter - 16))
        context.stroke()
      }

      BAGUA_RING.forEach((item, index) => {
        const angle = -Math.PI / 2 + (index / 8) * Math.PI * 2
        context.save()
        context.translate(Math.cos(angle) * 466, Math.sin(angle) * 466)
        context.rotate(angle + Math.PI / 2)

        context.fillStyle = 'rgba(255, 255, 255, 0.84)'
        context.font = '400 48px "Noto Serif Symbols 2", "Noto Serif Symbols", "Songti SC", "STSong", "SimSun", serif'
        context.fillText(item.symbol, 0, -23)

        context.fillStyle = 'rgba(255, 255, 255, 0.64)'
        context.font = '500 24px "Noto Serif SC", "Songti SC", "SimSun", serif'
        context.fillText(item.name, 0, 27)
        context.restore()
      })

      const coreGradient = context.createRadialGradient(-28, -34, 12, 0, 0, coreRadius)
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.16)')
      coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)')
      context.fillStyle = coreGradient
      context.beginPath()
      context.arc(0, 0, coreRadius, 0, Math.PI * 2)
      context.fill()

      context.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      context.lineWidth = 1.6
      context.beginPath()
      context.arc(0, 0, coreRadius, 0, Math.PI * 2)
      context.stroke()

      context.strokeStyle = 'rgba(255, 255, 255, 0.42)'
      context.lineWidth = 2.2
      context.beginPath()
      context.arc(0, 0, taijiRadius, 0, Math.PI * 2)
      context.stroke()

      context.strokeStyle = 'rgba(255, 255, 255, 0.68)'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(0, -taijiRadius)
      context.arc(0, -taijiRadius / 2, taijiRadius / 2, -Math.PI / 2, Math.PI / 2, false)
      context.arc(0, taijiRadius / 2, taijiRadius / 2, -Math.PI / 2, Math.PI / 2, true)
      context.stroke()

      context.fillStyle = 'rgba(255, 255, 255, 0.72)'
      context.beginPath()
      context.arc(0, -taijiRadius / 2, 13, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = 'rgba(255, 255, 255, 0.3)'
      context.beginPath()
      context.arc(0, taijiRadius / 2, 13, 0, Math.PI * 2)
      context.fill()
    }

    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.generateMipmaps = true
    texture.needsUpdate = true
    return texture
  }

  const hexagramTexture: CanvasTexture = createHexagramTexture()
  const darkDisc = new THREE.Color(0.94, 0.78, 0.42)
  const lightDisc = new THREE.Color(0.46, 0.38, 0.22)
  const initialUniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(width, height) },
    uAspect: { value: width / Math.max(height, 1) },
    uTexture: { value: hexagramTexture },
    uDiscColor: { value: darkDisc.clone() },
    uMouse: { value: new THREE.Vector2(0.5, 0.2) },
    uEnergy: { value: 0.34 },
    uDiskCenter: { value: new THREE.Vector2(0.8, 0.02) },
    uDiskRadius: { value: 0.78 },
      uVerticalScale: { value: 0.68 },
  }

  const material: ShaderMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: initialUniforms,
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float uTime;
      uniform float uAspect;
      uniform sampler2D uTexture;
      uniform vec3 uDiscColor;
      uniform vec2 uMouse;
      uniform float uEnergy;
      uniform vec2 uDiskCenter;
      uniform float uDiskRadius;
      uniform float uVerticalScale;
      varying vec2 vUv;

      void main() {
        vec2 p = (vUv * 2.0 - 1.0) * vec2(uAspect, 1.0);
        vec2 pointerDelta = p - uMouse;
        float pointerDistance = length(pointerDelta);
        vec2 pointerDirection = pointerDistance > 0.0001
          ? pointerDelta / pointerDistance
          : vec2(0.0);

        float traveling = sin(pointerDistance * 24.0 - uTime * 2.8);
        float standing = sin(pointerDistance * 16.0 + uTime * 1.1);
        float wave = (traveling * 0.72 + standing * 0.28)
          * exp(-pointerDistance * 3.8)
          * uEnergy;

        vec2 diskLocal = p - uDiskCenter;
        diskLocal += pointerDirection * wave * 0.028;

        vec2 discPlane = vec2(diskLocal.x, diskLocal.y / uVerticalScale);
        float rotation = -uTime * 0.018;
        float sine = sin(rotation);
        float cosine = cos(rotation);
        discPlane = mat2(cosine, -sine, sine, cosine) * discPlane;

        vec2 diskUv = discPlane / uDiskRadius * 0.5 + 0.5;
        float symbol = texture2D(uTexture, diskUv).a;
        float diskDistance = length(discPlane);
        float discMask = smoothstep(uDiskRadius + 0.012, uDiskRadius - 0.008, diskDistance);

        float highlight = abs(wave);
        vec3 color = uDiscColor * (0.28 + symbol * 0.82);
        float alpha = symbol * discMask * (0.78 + highlight * 0.46);

        vec2 projectedDisk = p - uDiskCenter;
        projectedDisk.y /= uVerticalScale;
        float haloDistance = max(length(projectedDisk) - uDiskRadius, 0.0);
        float haloRings = sin(haloDistance * 9.0 - uTime * 0.35) * 0.5 + 0.5;
        float halo = exp(-haloDistance * 5.0) * (0.028 + haloRings * 0.018);
        color += uDiscColor * halo;
        alpha += halo;

        float pointerRing = abs(sin(pointerDistance * 13.0 - uTime * 2.2))
          * exp(-pointerDistance * 2.8)
          * uEnergy * 0.14;
        color += uDiscColor * pointerRing;
        alpha += pointerRing;

        alpha *= smoothstep(0.0, 0.05, vUv.y);
        if (alpha < 0.004) discard;

        gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.9));
      }
    `,
  })
  const uniforms = material.uniforms as HeroUniforms

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  scene.add(mesh)

  function layout() {
    const aspect = width / Math.max(height, 1)
    const center = uniforms.uDiskCenter.value

    if (aspect < 0.8) {
      center.set(0, 0.1)
      uniforms.uDiskRadius.value = 0.52
      uniforms.uVerticalScale.value = 0.96
    }
    else if (aspect < 1.15) {
      center.set(aspect * 0.04, 0.04)
      uniforms.uDiskRadius.value = 0.55
      uniforms.uVerticalScale.value = 0.98
    }
    else {
      center.set(aspect * 0.36, 0.05)
      uniforms.uDiskRadius.value = 0.72
      uniforms.uVerticalScale.value = 1
    }

    uniforms.uAspect.value = aspect
    uniforms.uResolution.value.set(width, height)
  }

  setDiscColor = () => {
    uniforms.uDiscColor.value.copy(colorMode.value === 'dark' ? darkDisc : lightDisc)
  }
  setDiscColor()
  layout()

  const targetPointer = new THREE.Vector2(0.5, 0.2)
  let targetEnergy = 0.34
  let pointerRaf = 0

  function readPointer(event: PointerEvent) {
    if (!hero) return
    const rect = hero.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const normalizedY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    const nextX = normalizedX * (width / Math.max(height, 1))
    const moved = targetPointer.distanceTo(new THREE.Vector2(nextX, normalizedY))
    targetPointer.set(nextX, normalizedY)
    targetEnergy = Math.min(1, targetEnergy + moved * 3.5 + 0.1)
  }

  function onPointerMove(event: Event) {
    if (event instanceof PointerEvent) readPointer(event)
  }

  function onPointerLeave() {
    targetEnergy = 0.22
  }

  hero?.addEventListener('pointermove', onPointerMove, { passive: true })
  hero?.addEventListener('pointerleave', onPointerLeave, { passive: true })

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let animationId = 0
  let lastFrame = performance.now()
  let elapsed = 0
  let visible = true
  let running = false

  function renderOnce() {
    gl.render(scene, camera)
  }

  function tick(now: number) {
    animationId = requestAnimationFrame(tick)
    const frameDelta = now - lastFrame
    if (!visible || frameDelta < 33) return

    lastFrame = now
    elapsed += Math.min(frameDelta / 1000, 0.1)
    pointerRaf += 1

    const pointer = uniforms.uMouse.value
    pointer.lerp(targetPointer, 0.14)
    const energy = uniforms.uEnergy.value
    const settled = pointerRaf > 18 ? targetEnergy : Math.min(1, targetEnergy + 0.16)
    uniforms.uEnergy.value = energy + (settled - energy) * 0.12
    targetEnergy *= 0.965

    uniforms.uTime.value = elapsed
    gl.render(scene, camera)
  }

  function startAnimation() {
    if (running || motionQuery.matches) return
    running = true
    animationId = requestAnimationFrame(tick)
  }

  function stopAnimation() {
    if (!running) return
    running = false
    cancelAnimationFrame(animationId)
    uniforms.uTime.value = 0
    uniforms.uEnergy.value = 0.3
    renderOnce()
  }

  function onMotionChange() {
    if (motionQuery.matches) stopAnimation()
    else startAnimation()
  }

  const resizeObserver = new ResizeObserver(() => {
    const nextWidth = container.clientWidth
    const nextHeight = container.clientHeight
    if (!nextWidth || !nextHeight) return
    width = nextWidth
    height = nextHeight
    gl.setSize(width, height)
    layout()
    renderOnce()
  })
  resizeObserver.observe(hero || container)

  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true
  }, { threshold: 0 })
  visibilityObserver.observe(hero || container)

  motionQuery.addEventListener('change', onMotionChange)
  container.dataset.state = 'ready'

  if (motionQuery.matches) renderOnce()
  else startAnimation()

  disposeScene = () => {
    disposed = true
    hero?.removeEventListener('pointermove', onPointerMove)
    hero?.removeEventListener('pointerleave', onPointerLeave)
    motionQuery.removeEventListener('change', onMotionChange)
    resizeObserver.disconnect()
    visibilityObserver.disconnect()
    stopAnimation()
    mesh.geometry.dispose()
    material.dispose()
    hexagramTexture.dispose()
    gl.dispose()
    gl.domElement.remove()
  }
})

onBeforeUnmount(() => {
  disposeScene?.()
  disposeScene = null
  setDiscColor = null
})

watch(() => colorMode.value, () => {
  setDiscColor?.()
})
</script>

<style scoped>
.hero-hex-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-hex-field :deep(.hero-hex-canvas) {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 520ms ease;
}

.hero-hex-field[data-state='ready'] :deep(.hero-hex-canvas) {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .hero-hex-field :deep(.hero-hex-canvas) {
    transition: none;
  }
}
</style>
