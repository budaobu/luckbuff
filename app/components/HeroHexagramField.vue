<template>
  <div
    ref="field"
    class="hero-hex-field"
    aria-hidden="true"
    data-state="loading"
  >
    <canvas ref="stage" class="hero-hex-canvas" />
  </div>
</template>

<script setup lang="ts">
import type { Material, Mesh } from 'three/webgpu'
import { BAGUA_NAMES, BAGUA_SYMBOLS, LIUSHISI_GUA, LIUSHISI_GUA_SHORT_NAME_MAP, LIUSHISI_GUA_SYMBOLS } from '~/utils/zhouyi/constants'

const field = ref<HTMLDivElement>()
const stage = ref<HTMLCanvasElement>()

let disposeScene: (() => void) | null = null

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

function createPlateCanvas() {
  const size = 2048
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return canvas

  const radius = 1000
  const baguaInner = 300
  const baguaOuter = 560
  const hexagramInner = 690
  const hexagramOuter = 910
  const taijiRadius = 130
  context.translate(size / 2, size / 2)

  const wood = context.createRadialGradient(-320, -340, 100, 0, 0, radius)
  wood.addColorStop(0, '#5c3a1e')
  wood.addColorStop(0.42, '#37220f')
  wood.addColorStop(0.82, '#21130a')
  wood.addColorStop(1, '#120a05')
  context.fillStyle = wood
  context.beginPath()
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.fill()

  context.globalAlpha = 0.07
  context.lineWidth = 2
  for (let index = 0; index < 150; index += 1) {
    const angle = index * Math.PI / 75
    const start = radius * (0.1 + (index % 5) * 0.04)
    const end = radius * (0.48 + (index % 7) * 0.07)
    context.strokeStyle = index % 3 === 0 ? '#c68a4a' : '#88552a'
    context.beginPath()
    context.arc(0, 0, start + (end - start) / 2, angle - 0.13, angle + 0.13)
    context.stroke()
  }
  context.globalAlpha = 1

  const faceLight = context.createRadialGradient(-220, -220, 70, 0, 0, radius)
  faceLight.addColorStop(0, 'rgba(255, 214, 144, 0.15)')
  faceLight.addColorStop(0.62, 'rgba(255, 214, 144, 0.03)')
  faceLight.addColorStop(1, 'rgba(0, 0, 0, 0.22)')
  context.fillStyle = faceLight
  context.beginPath()
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.fill()

  for (let index = 0; index < 64; index += 1) {
    const startAngle = -Math.PI / 2 + (index / 64) * Math.PI * 2
    const endAngle = -Math.PI / 2 + ((index + 1) / 64) * Math.PI * 2
    if (index % 2 === 0) {
      context.fillStyle = 'rgba(246, 212, 140, 0.035)'
      context.beginPath()
      context.arc(0, 0, hexagramInner, startAngle + 0.006, endAngle - 0.006)
      context.arc(0, 0, hexagramOuter, endAngle - 0.006, startAngle + 0.006, true)
      context.closePath()
      context.fill()
    }
    context.strokeStyle = 'rgba(225, 182, 111, 0.18)'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(Math.cos(startAngle) * (hexagramInner + 16), Math.sin(startAngle) * (hexagramInner + 16))
    context.lineTo(Math.cos(startAngle) * (hexagramOuter - 14), Math.sin(startAngle) * (hexagramOuter - 14))
    context.stroke()
  }

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.shadowColor = 'rgba(0, 0, 0, 0.58)'
  context.shadowBlur = 10
  context.shadowOffsetY = 4

  DISC_HEXAGRAMS.forEach((hexagram, index) => {
    const angle = -Math.PI / 2 + (index / 64) * Math.PI * 2
    context.save()
    context.translate(Math.cos(angle) * 800, Math.sin(angle) * 800)
    context.rotate(angle + Math.PI / 2)
    context.fillStyle = '#f2cf8d'
    context.font = '400 54px "Noto Serif Symbols 2", "Noto Serif Symbols", "Songti SC", "STSong", "SimSun", serif'
    context.fillText(hexagram.symbol, 0, -28)
    context.fillStyle = 'rgba(240, 205, 143, 0.66)'
    context.font = '500 24px "Noto Serif SC", "Songti SC", "SimSun", serif'
    context.fillText(hexagram.name, 0, 36)
    context.restore()
  })

  context.shadowBlur = 8
  for (let index = 0; index < 8; index += 1) {
    const startAngle = -Math.PI / 2 + (index / 8) * Math.PI * 2
    const endAngle = -Math.PI / 2 + ((index + 1) / 8) * Math.PI * 2
    if (index % 2 === 0) {
      context.fillStyle = 'rgba(246, 212, 140, 0.05)'
      context.beginPath()
      context.arc(0, 0, baguaInner, startAngle + 0.018, endAngle - 0.018)
      context.arc(0, 0, baguaOuter, endAngle - 0.018, startAngle + 0.018, true)
      context.closePath()
      context.fill()
    }
    context.strokeStyle = 'rgba(210, 170, 105, 0.22)'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(Math.cos(startAngle) * (baguaInner + 20), Math.sin(startAngle) * (baguaInner + 20))
    context.lineTo(Math.cos(startAngle) * (baguaOuter - 20), Math.sin(startAngle) * (baguaOuter - 20))
    context.stroke()
  }

  BAGUA_RING.forEach((item, index) => {
    const angle = -Math.PI / 2 + (index / 8) * Math.PI * 2
    context.save()
    context.translate(Math.cos(angle) * 445, Math.sin(angle) * 445)
    context.rotate(angle + Math.PI / 2)
    context.fillStyle = '#f5d392'
    context.font = '400 54px "Noto Serif Symbols 2", "Noto Serif Symbols", "Songti SC", "STSong", "SimSun", serif'
    context.fillText(item.symbol, 0, -25)
    context.fillStyle = 'rgba(238, 201, 139, 0.72)'
    context.font = '500 28px "Noto Serif SC", "Songti SC", "SimSun", serif'
    context.fillText(item.name, 0, 30)
    context.restore()
  })

  context.shadowBlur = 16
  context.shadowOffsetY = 6
  const boss = context.createRadialGradient(-46, -58, 16, 0, 0, 250)
  boss.addColorStop(0, '#493019')
  boss.addColorStop(0.7, '#2a1a0c')
  boss.addColorStop(1, '#160d06')
  context.fillStyle = boss
  context.beginPath()
  context.arc(0, 0, 244, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = 'rgba(248, 217, 146, 0.82)'
  context.lineWidth = 7
  context.beginPath()
  context.arc(0, 0, taijiRadius, 0, Math.PI * 2)
  context.stroke()
  context.strokeStyle = 'rgba(248, 217, 146, 0.72)'
  context.lineWidth = 6
  context.beginPath()
  context.moveTo(0, -taijiRadius)
  context.arc(0, -taijiRadius / 2, taijiRadius / 2, -Math.PI / 2, Math.PI / 2, false)
  context.arc(0, taijiRadius / 2, taijiRadius / 2, -Math.PI / 2, Math.PI / 2, true)
  context.stroke()

  context.fillStyle = '#f7d895'
  context.beginPath()
  context.arc(0, -taijiRadius / 2, 20, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = 'rgba(247, 216, 149, 0.3)'
  context.beginPath()
  context.arc(0, taijiRadius / 2, 20, 0, Math.PI * 2)
  context.fill()
  context.shadowColor = 'transparent'

  const plateEdge = context.createRadialGradient(0, 0, radius - 34, 0, 0, radius)
  plateEdge.addColorStop(0, 'rgba(0, 0, 0, 0)')
  plateEdge.addColorStop(0.72, 'rgba(70, 45, 18, 0.3)')
  plateEdge.addColorStop(1, 'rgba(12, 7, 3, 0.72)')
  context.fillStyle = plateEdge
  context.beginPath()
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.fill()

  return canvas
}

onMounted(async () => {
  const container = field.value
  const canvas = stage.value
  if (!container || !canvas) return

  let disposed = false
  const [THREE, { RoomEnvironment }] = await Promise.all([
    import('three/webgpu'),
    import('three/examples/jsm/environments/RoomEnvironment.js'),
  ])
  if (disposed || !container.isConnected) return

  const hero = container.closest('.home-hero')
  let width = container.clientWidth || 960
  let height = container.clientHeight || 640

  try {
    const renderer = new THREE.WebGPURenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      forceWebGL: !('gpu' in navigator),
    })

    const plateTexture = new THREE.CanvasTexture(createPlateCanvas())
    plateTexture.colorSpace = THREE.SRGBColorSpace
    plateTexture.anisotropy = 8
    plateTexture.minFilter = THREE.LinearMipmapLinearFilter
    plateTexture.generateMipmaps = true
    plateTexture.needsUpdate = true

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
    renderer.setSize(width, height)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, width / Math.max(height, 1), 0.1, 50)
    camera.position.set(0, 0.45, 9.8)
    camera.lookAt(0, 0.05, 0)

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const environmentScene = new RoomEnvironment()
    const environment = pmremGenerator.fromScene(environmentScene, 0.04).texture
    scene.environment = environment
    scene.environmentIntensity = 0.38
    pmremGenerator.dispose()
    environmentScene.dispose()

    const keyLight = new THREE.DirectionalLight(0xfff0cf, 2.3)
    keyLight.position.set(4.5, 5.2, 6.8)
    scene.add(keyLight)
    const warmLight = new THREE.PointLight(0xf0b869, 11, 30)
    warmLight.position.set(-5.2, -1.2, 5.6)
    scene.add(warmLight)
    const rimLight = new THREE.PointLight(0x8fb6ff, 8, 32)
    rimLight.position.set(2.4, 4.6, -5.4)
    scene.add(rimLight)
    scene.add(new THREE.HemisphereLight(0xfff3d4, 0x25150a, 0.55))

    const woodFace = new THREE.MeshPhysicalMaterial({
      map: plateTexture,
      bumpMap: plateTexture,
      bumpScale: 0.04,
      color: 0x9a7350,
      roughness: 0.34,
      metalness: 0.08,
      clearcoat: 0.82,
      clearcoatRoughness: 0.18,
    })
    const brass = new THREE.MeshPhysicalMaterial({
      color: 0xd9ab5e,
      roughness: 0.2,
      metalness: 1,
      clearcoat: 0.35,
      clearcoatRoughness: 0.24,
    })
    const darkWood = new THREE.MeshPhysicalMaterial({
      color: 0x392315,
      roughness: 0.48,
      metalness: 0.05,
      clearcoat: 0.35,
    })
    const faceMaterial = new THREE.MeshPhysicalMaterial({
      map: plateTexture,
      bumpMap: plateTexture,
      bumpScale: 0.025,
      roughness: 0.3,
      metalness: 0.08,
      clearcoat: 0.78,
      clearcoatRoughness: 0.16,
    })

    const parallaxGroup = new THREE.Group()
    const plateAssembly = new THREE.Group()
    plateAssembly.rotation.set(-0.15, 0.12, 0)

    const plateGeometry = new THREE.CylinderGeometry(2.46, 2.4, 0.17, 256)
    const plateMesh = new THREE.Mesh(plateGeometry, [darkWood, woodFace, darkWood])
    plateMesh.rotation.x = Math.PI / 2
    plateMesh.position.z = -0.035
    plateAssembly.add(plateMesh)

    const outerRim = new THREE.Mesh(new THREE.TorusGeometry(2.46, 0.11, 64, 384), brass)
    outerRim.position.z = 0.055
    plateAssembly.add(outerRim)
    const innerRim = new THREE.Mesh(new THREE.TorusGeometry(1.94, 0.032, 32, 256), brass)
    innerRim.position.z = 0.082
    plateAssembly.add(innerRim)

    const faceGeometry = new THREE.CircleGeometry(2.44, 256)
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial)
    faceMesh.position.z = 0.075
    plateAssembly.add(faceMesh)

    parallaxGroup.add(plateAssembly)
    scene.add(parallaxGroup)

    const basePosition = new THREE.Vector3(2.1, 0.12, 0)
    const pointerTarget = new THREE.Vector2(0, 0)
    const targetPosition = basePosition.clone()

    function layout() {
      const aspect = width / Math.max(height, 1)
      if (aspect < 0.8) {
        basePosition.set(0, -0.15, 0)
        parallaxGroup.scale.setScalar(0.5)
      }
      else if (aspect < 1.15) {
        basePosition.set(aspect * 0.3, -0.05, 0)
        parallaxGroup.scale.setScalar(0.64)
      }
      else {
        basePosition.set(2.35, 0.14, 0)
        parallaxGroup.scale.setScalar(0.72)
      }
      camera.aspect = aspect
      camera.updateProjectionMatrix()
    }

    layout()
    targetPosition.copy(basePosition)

    function readPointer(event: PointerEvent) {
      if (!hero) return
      const rect = hero.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      )
    }

    function onPointerMove(event: Event) {
      if (event instanceof PointerEvent) readPointer(event)
    }

    function onPointerLeave() {
      pointerTarget.set(0, 0)
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
      void renderer.renderAsync(scene, camera)
    }

    function tick(now: number) {
      animationId = requestAnimationFrame(tick)
      const frameDelta = now - lastFrame
      if (!visible || frameDelta < 22) return

      lastFrame = now
      elapsed += Math.min(frameDelta / 1000, 0.1)
      targetPosition.set(
        basePosition.x + pointerTarget.x * 0.42,
        basePosition.y + pointerTarget.y * 0.3,
        basePosition.z,
      )
      parallaxGroup.position.lerp(targetPosition, 0.09)
      parallaxGroup.rotation.y += ((0.12 + pointerTarget.x * 0.18) - parallaxGroup.rotation.y) * 0.08
      plateAssembly.rotation.z = elapsed * 0.055
      void renderer.renderAsync(scene, camera)
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
      plateAssembly.rotation.z = 0
      parallaxGroup.rotation.set(-0.15, 0.12, 0)
      parallaxGroup.position.copy(basePosition)
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
      renderer.setSize(width, height)
      layout()
      targetPosition.copy(basePosition)
      renderOnce()
    })
    resizeObserver.observe(hero || container)

    const visibilityObserver = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
    }, { threshold: 0 })
    visibilityObserver.observe(hero || container)

    motionQuery.addEventListener('change', onMotionChange)

    disposeScene = () => {
      disposed = true
      hero?.removeEventListener('pointermove', onPointerMove)
      hero?.removeEventListener('pointerleave', onPointerLeave)
      motionQuery.removeEventListener('change', onMotionChange)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      stopAnimation()
      scene.traverse((object) => {
        const mesh = object as Mesh & { material?: Material | Material[] }
        mesh.geometry?.dispose()
        if (Array.isArray(mesh.material)) mesh.material.forEach(material => material.dispose())
        else mesh.material?.dispose()
      })
      plateTexture.dispose()
      environment.dispose()
      void renderer.dispose()
    }

    await renderer.init()
    if (disposed || !container.isConnected) {
      disposeScene?.()
      disposeScene = null
      return
    }

    container.dataset.state = 'ready'
    if (motionQuery.matches) renderOnce()
    else startAnimation()
  }
  catch (error) {
    console.warn('Hero hexagram renderer unavailable.', error)
    container.dataset.state = 'fallback'
  }
})

onBeforeUnmount(() => {
  disposeScene?.()
  disposeScene = null
})
</script>

<style scoped>
.hero-hex-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
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
