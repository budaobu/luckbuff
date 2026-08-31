<template>
  <div ref="sceneRef" class="bazi-pillars-scene" aria-hidden="true" />
</template>

<script setup lang="ts">
import * as THREE from 'three'
import type { BaziChart } from '~/types/bazi'

interface Props {
  chart: BaziChart
}

interface PillarVisual {
  group: THREE.Group
  frontMaterial: THREE.MeshBasicMaterial
  backingMaterial: THREE.MeshStandardMaterial
  delay: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const sceneRef = ref<HTMLDivElement>()

const inkColor = 0x2e2a24
const paperColor = 0xfffdf5
const sealColor = 0x8c2f26
const frameColor = 0xd8cfba

const pillarData = computed(() => {
  const pillars = [props.chart.year, props.chart.month, props.chart.day, props.chart.hour]
  const labels = [
    t('baziPan.yearPillar'),
    t('baziPan.monthPillar'),
    t('baziPan.dayPillar'),
    t('baziPan.hourPillar'),
  ]

  return pillars.map((pillar, index) => ({
    label: labels[index] ?? '',
    gan: pillar?.gan ?? '—',
    zhi: pillar?.zhi ?? '—',
    isDay: index === 2,
  }))
})

let renderer: THREE.WebGLRenderer | null = null
let resizeObserver: ResizeObserver | null = null
let rafId: number | null = null
const disposables: { dispose: () => void }[] = []

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function createStandardMaterial(color: number, delay: number, opacity: number) {
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0,
    metalness: 0.08,
    roughness: 0.78,
  })
  material.userData = { delay, opacity }
  disposables.push(material)
  return material
}

function createPillarTexture(item: { label: string; gan: string; zhi: string; isDay: boolean }) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return null

  canvas.width = 360
  canvas.height = 620
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#fffdf5'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.lineWidth = 5
  context.strokeStyle = item.isDay ? '#8c2f26' : '#d8cfba'
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)

  const serif = '"Noto Serif SC", "Songti SC", "SimSun", serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  context.fillStyle = item.isDay ? '#8c2f26' : '#8a8272'
  context.font = `500 32px ${serif}`
  context.fillText(item.label, canvas.width / 2, 70)

  context.fillStyle = '#8a8272'
  context.font = `400 24px ${serif}`
  context.fillText('干', 64, 190)
  context.fillText('支', 64, 430)

  context.fillStyle = item.isDay ? '#8c2f26' : '#2e2a24'
  context.font = `700 112px ${serif}`
  context.fillText(item.gan, 206, 190)
  context.fillText(item.zhi, 206, 430)

  context.fillStyle = '#d8cfba'
  context.fillRect(62, 296, 236, 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  disposables.push(texture)
  return texture
}

onMounted(() => {
  const container = sceneRef.value
  if (!container) return

  let width = container.clientWidth
  let height = container.clientHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, width / Math.max(height, 1), 0.1, 100)
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xfff8e8, 1.1))
  const key = new THREE.DirectionalLight(0xffefd2, 1.05)
  key.position.set(2.4, 3.2, 3.8)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xd8cfba, 0.24)
  rim.position.set(-3.2, 1.2, -2.4)
  scene.add(rim)

  const boardGroup = new THREE.Group()
  boardGroup.rotation.x = -0.04
  scene.add(boardGroup)

  const slabGeometry = new THREE.BoxGeometry(0.88, 1.52, 0.07)
  const faceGeometry = new THREE.PlaneGeometry(0.88, 1.52)
  disposables.push(slabGeometry, faceGeometry)

  const slabs: PillarVisual[] = []
  const positions = [-1.8, -0.6, 0.6, 1.8]

  pillarData.value.forEach((item, index) => {
    const group = new THREE.Group()
    group.position.set(positions[index] ?? 0, 0, 0)
    group.userData.delay = 60 + index * 90

    const backingMaterial = createStandardMaterial(
      item.isDay ? 0xf6ebd4 : paperColor,
      group.userData.delay,
      0.92,
    )
    const backing = new THREE.Mesh(slabGeometry, backingMaterial)
    group.add(backing)

    const texture = createPillarTexture(item)
    let frontMaterial: THREE.MeshBasicMaterial
    if (texture) {
      frontMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
      })
    }
    else {
      frontMaterial = new THREE.MeshBasicMaterial({
        color: paperColor,
        transparent: true,
        opacity: 0,
      })
    }

    frontMaterial.userData = { delay: group.userData.delay, opacity: 0.98 }
    disposables.push(frontMaterial)
    const face = new THREE.Mesh(faceGeometry, frontMaterial)
    face.position.z = 0.037
    group.add(face)

    group.scale.setScalar(item.isDay ? 1.04 : 0.94)
    boardGroup.add(group)
    slabs.push({ group, frontMaterial, backingMaterial, delay: group.userData.delay })
  })

  const beamGeometry = new THREE.BoxGeometry(5.2, 0.07, 0.18)
  const baseGeometry = new THREE.BoxGeometry(5.2, 0.09, 0.46)
  disposables.push(beamGeometry, baseGeometry)

  const beamMaterial = createStandardMaterial(frameColor, 0, 0.42)
  const beam = new THREE.Mesh(beamGeometry, beamMaterial)
  beam.position.set(0, 1.02, 0)
  boardGroup.add(beam)

  const baseMaterial = createStandardMaterial(frameColor, 180, 0.38)
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.set(0, -1.06, 0.12)
  boardGroup.add(base)

  function composeCamera() {
    const aspect = width / Math.max(height, 1)
    camera.aspect = aspect
    const distance = aspect < 1.4 ? 8.1 : aspect < 2 ? 6.6 : 5.5
    camera.position.set(0, 0.2, distance)
    camera.lookAt(0, -0.02, 0)
    camera.updateProjectionMatrix()
  }

  function applySettledOpacity(material: THREE.Material) {
    material.opacity = Number(material.userData.opacity ?? 1)
  }

  function settle() {
    composeCamera()
    boardGroup.rotation.x = -0.04
    slabs.forEach((slab) => {
      slab.group.scale.setScalar(1)
      slab.group.position.y = 0
      applySettledOpacity(slab.frontMaterial)
      applySettledOpacity(slab.backingMaterial)
    })
    applySettledOpacity(beamMaterial)
    applySettledOpacity(baseMaterial)
    renderer?.render(scene, camera)
  }

  function resize() {
    if (!container || !renderer) return
    width = container.clientWidth
    height = container.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height)
    composeCamera()
    renderer.render(scene, camera)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)

  function animate() {
    const start = performance.now()
    const duration = 1300

    function tick() {
      const elapsed = performance.now() - start
      composeCamera()
      slabs.forEach((slab) => {
        const progress = easeOutCubic(Math.min(Math.max((elapsed - slab.delay) / 620, 0), 1))
        slab.group.scale.setScalar(0.94 + progress * 0.06)
        slab.group.position.y = (1 - progress) * -0.07
        const targetFront = Number(slab.frontMaterial.userData.opacity)
        const targetBacking = Number(slab.backingMaterial.userData.opacity)
        slab.frontMaterial.opacity = targetFront * progress
        slab.backingMaterial.opacity = targetBacking * progress
      })

      const frameProgress = easeOutCubic(Math.min(elapsed / 760, 1))
      beamMaterial.opacity = Number(beamMaterial.userData.opacity) * frameProgress
      baseMaterial.opacity = Number(baseMaterial.userData.opacity) * frameProgress
      renderer?.render(scene, camera)

      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick)
      }
      else {
        rafId = null
        settle()
      }
    }

    tick()
  }

  composeCamera()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    settle()
  }
  else {
    animate()
  }
})

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  resizeObserver?.disconnect()
  resizeObserver = null

  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
    renderer = null
  }

  disposables.forEach(item => item.dispose())
})
</script>

<style scoped>
.bazi-pillars-scene {
  width: 100%;
  height: 100%;
}

.bazi-pillars-scene :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
