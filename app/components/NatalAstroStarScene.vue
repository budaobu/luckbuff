<template>
  <div
    ref="sceneRoot"
    class="zps"
    :class="{ 'is-loading': !loaderRemoved }"
  >
    <div v-if="!loaderRemoved" class="zps-loader" :class="{ done: loaderDone }">
      <div class="loader-ring" />
      <p>正在推演星盘</p>
    </div>

    <div ref="canvasWrap" class="zps-canvas-wrap" />

    <header class="zps-header">
      <div>
        <h1>西方占星 · 星穹盘</h1>
        <div class="sub">WESTERN NATAL CHART · 3D ASTROLABE</div>
        <nav class="toolbar" aria-label="星盘操作">
          <NuxtLink :to="localePath('/chart')">
            <UIcon name="i-heroicons-arrow-left" />
            <span>返回</span>
          </NuxtLink>
          <button type="button" @click="emit('retry')">
            <UIcon name="i-heroicons-arrow-path" />
            <span>重新排盘</span>
          </button>
          <AppShareButton
            tool="natal-astro"
            summary="西方占星 · 星穹盘"
            filename="natal-astro-3d.png"
            :share-target="sceneRoot ?? undefined"
            :share-image-factory="captureFrame"
          />
        </nav>
      </div>
      <div class="now-badge">
        <div class="date">{{ result.birth.localText }}</div>
        <div class="lunar">{{ result.birth.locationName }} · {{ result.birth.coordinates }}</div>
      </div>
    </header>

    <div class="hint">拖拽旋转 · 滚轮缩放 · 点击宫位查看 · 点击空白收起</div>

    <div class="legend">
      <div v-for="item in aspectLegend" :key="`${item.body1}-${item.body2}-${item.type}`" class="item">
        <span class="dot" :class="`nature-${item.nature}`" />
        {{ item.typeZh }} · {{ item.body1Zh }} {{ item.body2Zh }}
      </div>
      <div class="item legend-extra">
        <span class="dot is-gold" />
        上升 {{ result.angles.ascendant }}
      </div>
    </div>

    <aside class="side-panel" :class="{ hidden: !panelVisible }">
      <button class="panel-close" type="button" aria-label="收起详情" @click="closePanel">✕</button>
      <div v-if="selectedCusp" class="panel-body">
        <div class="palace-title">
          {{ selectedCusp.house }} {{ selectedHouseName }}
        </div>
        <div class="palace-meta">
          宫头 {{ selectedCusp.degreeText }}
          <template v-if="selectedIndex === coreHouseIndex">
            · <span class="is-gold-text">太阳所在</span>
          </template>
          <template v-if="selectedCusp.house === 1">
            · <span class="is-rose-text">上升</span>
          </template>
        </div>

        <div class="section-label">主星 · {{ selectedPrimaryPoints.length }}</div>
        <template v-if="selectedPrimaryPoints.length">
          <span
            v-for="point in selectedPrimaryPoints"
            :key="`major-${point.key}`"
            class="star-chip major"
          >
            {{ point.nameZh }}
            <span class="brightness">{{ point.degreeText }}</span>
            <span v-if="point.isRetrograde" class="retro">R</span>
            <span v-if="point.dignityZh" class="state" :class="stateClass(point.dignityZh)">{{ point.dignityZh }}</span>
          </span>
        </template>
        <span v-else class="empty-note">本宫无主星</span>

        <template v-if="selectedMinorPoints.length">
          <div class="section-label">辅星 · {{ selectedMinorPoints.length }}</div>
          <span
            v-for="point in selectedMinorPoints"
            :key="`minor-${point.key}`"
            class="star-chip minor"
          >
            {{ point.nameZh }}
            <span class="brightness">{{ point.degreeText }}</span>
            <span v-if="point.isRetrograde" class="retro">R</span>
          </span>
        </template>

        <template v-if="selectedMiscPoints.length">
          <div class="section-label">敏感点 · {{ selectedMiscPoints.length }}</div>
          <span
            v-for="point in selectedMiscPoints"
            :key="`misc-${point.key}`"
            class="star-chip misc"
          >
            {{ point.nameZh }}
            <span class="brightness">{{ point.degreeText }}</span>
          </span>
        </template>

        <div class="section-label">宫位信息</div>
        <div class="info-row">
          <span class="k">星座</span>
          <span class="v">{{ selectedCusp.signZh }} {{ selectedCusp.sign }}</span>
        </div>
        <div class="info-row">
          <span class="k">黄道经度</span>
          <span class="v">{{ formatLongitude(selectedCusp.longitude) }}</span>
        </div>
        <div class="info-row">
          <span class="k">宫位跨度</span>
          <span class="v">{{ selectedCusp.size }}°</span>
        </div>

        <template v-if="selectedAspects.length">
          <div class="section-label">相位 · {{ selectedAspects.length }}</div>
          <div
            v-for="(aspect, index) in selectedAspects"
            :key="`aspect-${aspect.body1}-${aspect.body2}-${aspect.type}-${index}`"
            class="info-row"
          >
            <span class="k">{{ aspect.body1Zh }} {{ aspect.symbol }} {{ aspect.body2Zh }}</span>
            <span class="v">
              {{ aspect.typeZh }} · {{ aspect.orb }}°
              <span class="state" :class="aspectClass(aspect.classification)">{{ aspect.strength }}%</span>
            </span>
          </div>
        </template>
        <div v-else class="section-label">相位</div>
        <div v-if="!selectedAspects.length" class="empty-note">本宫行星暂无主要相位</div>

        <div class="section-label">元素平衡</div>
        <div v-for="element in result.summary.elements" :key="element.key" class="info-row">
          <span class="k">{{ element.label }}</span>
          <span class="v">{{ element.points.join(' · ') || '—' }}</span>
        </div>

        <template v-if="result.patterns.length">
          <div class="section-label">格局</div>
          <div class="info-row">
            <span class="k">全局格局</span>
            <span class="v">{{ result.patterns.join(' · ') }}</span>
          </div>
        </template>
      </div>
    </aside>

    <div class="timeline">
      <div class="tl-head">
        <span>十二宫位 · 按宫序</span>
        <strong>太阳所在</strong>
      </div>
      <div class="tl-track">
        <button
          v-for="(house, index) in houses"
          :key="`house-${house.house}`"
          type="button"
          class="tl-seg"
          :class="{ active: index === activeTimelineIndex }"
          @click="selectHouse(index)"
        >
          <span class="pal">{{ houseLabels[house.house] }}</span>
          <span class="age">{{ house.signZh }} {{ house.degreeText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type {
  NatalAstroAspect,
  NatalAstroHouseCusp,
  NatalAstroPoint,
  NatalAstroResult,
} from '~~/app/types/natal-astro'

const props = defineProps<{ result: NatalAstroResult }>()
const emit = defineEmits<{ retry: [] }>()
const localePath = useLocalePath()

const sceneRoot = ref<HTMLElement | null>(null)
const canvasWrap = ref<HTMLElement | null>(null)
const loaderDone = ref(false)
const loaderRemoved = ref(false)
const panelVisible = ref(false)
const selectedIndex = ref<number | null>(null)
const activeTimelineIndex = ref(0)

const HOUSE_NAMES: Record<number, string> = {
  1: '自我宫',
  2: '财帛宫',
  3: '沟通宫',
  4: '家庭宫',
  5: '创造宫',
  6: '健康宫',
  7: '伴侣宫',
  8: '亲密宫',
  9: '远行宫',
  10: '事业宫',
  11: '社交宫',
  12: '潜意识宫',
}

const HOUSE_COLORS: Record<number, number> = {
  1: 0xe8c56a,
  2: 0x5ee0b8,
  3: 0x6db3ff,
  4: 0xff6b9d,
  5: 0xa78bfa,
  6: 0x8fa8c8,
  7: 0xffb454,
  8: 0xff6b9d,
  9: 0x6db3ff,
  10: 0xe8c56a,
  11: 0xa78bfa,
  12: 0x8fa8c8,
}

const houseLabels = HOUSE_NAMES

const houses = computed<NatalAstroHouseCusp[]>(() => [...props.result.houseCusps]
  .sort((a, b) => a.house - b.house))
const points = computed<NatalAstroPoint[]>(() => props.result.points)

function pointsInHouse(house: number) {
  return points.value.filter(point => point.house === house)
}

function isPrimaryPoint(point: NatalAstroPoint) {
  return ['luminary', 'planet'].includes(point.category)
}

function isMinorPoint(point: NatalAstroPoint) {
  return ['centaur', 'node'].includes(point.category)
}

function isMiscPoint(point: NatalAstroPoint) {
  return ['asteroid', 'lilith', 'lot', 'angle'].includes(point.category)
}

const aspectLegend = computed<NatalAstroAspect[]>(() => [...props.result.aspects]
  .sort((a, b) => b.strength - a.strength)
  .slice(0, 4))

const coreHouseIndex = computed(() => {
  const sunHouse = points.value.find(point => point.key === 'Sun' || point.name === 'Sun')?.house
  return Math.max(0, houses.value.findIndex(house => house.house === sunHouse))
})

const selectedCusp = computed(() => selectedIndex.value === null ? null : houses.value[selectedIndex.value])
const selectedHouseName = computed(() => selectedCusp.value ? HOUSE_NAMES[selectedCusp.value.house] || '宫位' : '')
const selectedPrimaryPoints = computed(() => {
  const house = selectedCusp.value?.house
  return house ? pointsInHouse(house).filter(isPrimaryPoint) : []
})
const selectedMinorPoints = computed(() => {
  const house = selectedCusp.value?.house
  return house ? pointsInHouse(house).filter(isMinorPoint) : []
})
const selectedMiscPoints = computed(() => {
  const house = selectedCusp.value?.house
  return house ? pointsInHouse(house).filter(isMiscPoint) : []
})
const selectedAspects = computed(() => {
  if (!selectedCusp.value) return []
  const housePoints = new Set(pointsInHouse(selectedCusp.value.house).map(point => point.key))
  return props.result.aspects.filter(aspect => housePoints.has(aspect.body1) || housePoints.has(aspect.body2))
})

function stateClass(state: string) {
  if (['入庙', '入旺'].includes(state)) return 'is-strong'
  if (['落陷', '失势'].includes(state)) return 'is-weak'
  return 'is-neutral'
}

function aspectClass(classification: NatalAstroAspect['classification']) {
  return classification === 'major' ? 'is-strong' : 'is-neutral'
}

function formatLongitude(longitude: number) {
  return `${longitude.toFixed(3)}°`
}

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let clock: THREE.Clock | null = null
let animationId = 0
let camAnim: {
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
  t: number
  dur: number
} | null = null
const palaceGroups: THREE.Group[] = []
const palaceMeshes: THREE.Mesh[] = []
let coreMesh: THREE.Mesh | null = null
let glowSprite: THREE.Sprite | null = null
let coreRing1: THREE.LineLoop | null = null
let coreRing2: THREE.LineLoop | null = null
let coreRing3: THREE.LineLoop | null = null
let starfield: THREE.Points | null = null
let dust: THREE.Points | null = null

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let hoveredIndex = -1
let pointerDown: { x: number; y: number } | null = null
let loaderTimer = 0
let panelTimer = 0
const PALACE_RADIUS = 9.5
let onPointerMove: ((event: PointerEvent) => void) | null = null
let onPointerDown: ((event: PointerEvent) => void) | null = null
let onPointerCancel: (() => void) | null = null
let onPointerUp: ((event: PointerEvent) => void) | null = null
let onResize: (() => void) | null = null

function longitudeAngle(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360
  return (normalized / 360) * Math.PI * 2 - Math.PI / 2
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const chars = text.split('')
  const lines: string[] = []
  let current = ''
  chars.forEach((char) => {
    if (ctx.measureText(current + char).width > maxWidth && current) {
      lines.push(current)
      current = char
    } else {
      current += char
    }
  })
  if (current) lines.push(current)
  return lines
}

function makeTextSprite(text: string, options: {
  fontSize?: number
  color?: string
  glow?: string
  font?: string
  padding?: number
  maxWidth?: number | null
} = {}) {
  const {
    fontSize = 64,
    color = '#d7e2f0',
    glow = 'rgba(120,180,255,0.6)',
    font = '"PingFang SC","Noto Serif SC",serif',
    padding = 20,
    maxWidth = null,
  } = options
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const fontStr = `${fontSize}px ${font}`
  ctx.font = fontStr
  const lines = maxWidth ? wrapText(ctx, text, maxWidth) : [text]
  const lineHeight = fontSize * 1.3
  const width = Math.max(...lines.map(line => ctx.measureText(line).width)) + padding * 2
  const height = lineHeight * lines.length + padding * 2
  canvas.width = width
  canvas.height = height
  const drawingCtx = canvas.getContext('2d')!
  drawingCtx.font = fontStr
  drawingCtx.textAlign = 'center'
  drawingCtx.textBaseline = 'middle'
  drawingCtx.shadowColor = glow
  drawingCtx.shadowBlur = 18
  drawingCtx.fillStyle = color
  lines.forEach((line, index) => {
    drawingCtx.fillText(line, width / 2, padding + lineHeight * index + lineHeight / 2)
  })
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  })
  const sprite = new THREE.Sprite(material)
  const scale = 0.011
  sprite.scale.set(width * scale, height * scale, 1)
  return sprite
}

function pointAccent(point: NatalAstroPoint) {
  if (['入庙', '入旺'].includes(point.dignityZh || '')) return 0x5ee0b8
  if (point.isRetrograde) return 0xa78bfa
  if (['落陷', '失势'].includes(point.dignityZh || '')) return 0xff5c7c
  return 0xffffff
}

function pointBadge(point: NatalAstroPoint) {
  if (point.dignityZh && ['入庙', '入旺', '落陷', '失势'].includes(point.dignityZh)) return point.dignityZh
  return point.isRetrograde ? 'R' : ''
}

function pointTier(point: NatalAstroPoint) {
  if (isPrimaryPoint(point)) return 0
  if (isMinorPoint(point)) return 1
  return 2
}

function createRing(radius: number, color: number, opacity: number, tilt = 0) {
  const points: THREE.Vector3[] = []
  for (let index = 0; index <= 128; index += 1) {
    const angle = (index / 128) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
  })
  const line = new THREE.LineLoop(geometry, material)
  line.rotation.x = tilt
  return line
}

function createStarfield() {
  const count = 3200
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()
  for (let index = 0; index < count; index += 1) {
    const radius = 60 + Math.random() * 140
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[index * 3 + 1] = radius * Math.cos(phi) * 0.6
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    color.setHSL(0.58 + Math.random() * 0.12, 0.5, 0.5 + Math.random() * 0.4)
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const material = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
  return new THREE.Points(geometry, material)
}

function createGlowSprite() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(232,197,106,0.9)')
  gradient.addColorStop(0.3, 'rgba(232,197,106,0.3)')
  gradient.addColorStop(1, 'rgba(232,197,106,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(9, 9, 1)
  return sprite
}

function buildAstrolabe() {
  const wrap = canvasWrap.value
  if (!wrap || !houses.value.length) return

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05060a, 0.008)

  camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 1000)
  camera.position.set(0, 14, 26)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(wrap.clientWidth, wrap.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  wrap.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.35
  controls.minDistance = 12
  controls.maxDistance = 60
  controls.maxPolarAngle = Math.PI * 0.78
  controls.target.set(0, 0, 0)

  scene.add(new THREE.AmbientLight(0x334466, 1.2))
  const keyLight = new THREE.PointLight(0xaaccff, 80, 80)
  keyLight.position.set(0, 18, 6)
  scene.add(keyLight)
  const goldLight = new THREE.PointLight(0xe8c56a, 60, 60)
  goldLight.position.set(-10, 6, -10)
  scene.add(goldLight)
  const jadeLight = new THREE.PointLight(0x5ee0b8, 40, 60)
  jadeLight.position.set(12, -4, 8)
  scene.add(jadeLight)

  starfield = createStarfield()
  scene.add(starfield)

  const coreGroup = new THREE.Group()
  scene.add(coreGroup)
  const coreGeo = new THREE.IcosahedronGeometry(1.5, 2)
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xe8c56a,
    emissive: 0xe8c56a,
    emissiveIntensity: 1.4,
    roughness: 0.25,
    metalness: 0.6,
    flatShading: true,
  })
  coreMesh = new THREE.Mesh(coreGeo, coreMat)
  coreGroup.add(coreMesh)
  glowSprite = createGlowSprite()
  coreGroup.add(glowSprite)
  coreRing1 = createRing(3.2, 0xe8c56a, 0.35, Math.PI / 2)
  coreRing2 = createRing(4.0, 0x5ee0b8, 0.2, Math.PI / 2)
  coreRing3 = createRing(2.4, 0xa78bfa, 0.25, Math.PI / 3)
  coreGroup.add(coreRing1, coreRing2, coreRing3)

  houses.value.forEach((cusp, index) => {
    const angle = longitudeAngle(cusp.longitude)
    const x = Math.cos(angle) * PALACE_RADIUS
    const z = Math.sin(angle) * PALACE_RADIUS
    const color = HOUSE_COLORS[cusp.house] || 0x8fa8c8
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    group.userData = { cusp, index }

    const baseGeo = new THREE.CylinderGeometry(1.55, 1.65, 0.12, 6)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111a2a,
      emissive: color,
      emissiveIntensity: 0.06,
      roughness: 0.5,
      metalness: 0.3,
    })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.y = -0.9
    group.add(base)

    const edgeGeo = new THREE.CylinderGeometry(1.58, 1.58, 0.02, 6)
    const edgeMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    })
    const edge = new THREE.Mesh(edgeGeo, edgeMat)
    edge.position.y = -0.83
    group.add(edge)

    const nameSprite = makeTextSprite(`${cusp.house} ${HOUSE_NAMES[cusp.house] || '宫位'}`, {
      fontSize: 72,
      color: '#e8c56a',
      glow: 'rgba(232,197,106,0.7)',
    })
    nameSprite.position.y = 1.85
    group.add(nameSprite)

    const signSprite = makeTextSprite(`${cusp.signZh} ${cusp.sign}`, {
      fontSize: 48,
      color: '#7a8aa3',
      glow: 'rgba(120,180,255,0.4)',
    })
    signSprite.position.y = 1.35
    signSprite.scale.multiplyScalar(0.75)
    group.add(signSprite)

    const cuspSprite = makeTextSprite(cusp.degreeText, {
      fontSize: 36,
      color: '#5ee0b8',
      glow: 'rgba(94,224,184,0.5)',
    })
    cuspSprite.position.y = -1.35
    cuspSprite.scale.multiplyScalar(0.6)
    group.add(cuspSprite)

    const starGroup = new THREE.Group()
    const housePoints = pointsInHouse(cusp.house)
    const tierCounts = [0, 0, 0]
    housePoints.forEach((point) => {
      const tier = pointTier(point)
      tierCounts[tier]! += 1
    })
    const tierIndexes = [0, 0, 0]
    housePoints.forEach((point) => {
      const tier = pointTier(point)
      const starAngle = (tierIndexes[tier]! / Math.max(tierCounts[tier]!, 1)) * Math.PI * 2
        + (tier * Math.PI * 2) / 9
      tierIndexes[tier]! += 1
      const starRadius = 0.48 + tier * 0.22
      const sx = Math.cos(starAngle) * starRadius
      const sz = Math.sin(starAngle) * starRadius
      const badge = pointBadge(point)
      const sphereColor = pointAccent(point)
      const sphereGeo = new THREE.SphereGeometry(0.11, 12, 12)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: sphereColor,
        emissive: sphereColor,
        emissiveIntensity: badge ? 1.6 : 0.5,
        roughness: 0.3,
        metalness: 0.4,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(sx, 0.1, sz)
      starGroup.add(sphere)

      const starSprite = makeTextSprite(point.nameZh, {
        fontSize: 38,
        color: badge ? `#${sphereColor.toString(16).padStart(6, '0')}` : '#d7e2f0',
        glow: badge ? 'rgba(255,255,255,0.6)' : 'rgba(120,180,255,0.4)',
      })
      starSprite.position.set(sx * 1.6, 0.65, sz * 1.6)
      starSprite.scale.multiplyScalar(point.category === 'luminary' || point.category === 'planet' ? 0.55 : 0.45)
      starGroup.add(starSprite)

      if (badge) {
        const badgeSprite = makeTextSprite(badge, {
          fontSize: 32,
          color: `#${sphereColor.toString(16).padStart(6, '0')}`,
          glow: 'rgba(255,255,255,0.8)',
        })
        badgeSprite.position.set(sx * 2.2, 0.95, sz * 2.2)
        badgeSprite.scale.multiplyScalar(0.45)
        starGroup.add(badgeSprite)
      }
    })
    group.add(starGroup)

    const hitGeo = new THREE.CylinderGeometry(1.7, 1.7, 2.8, 6)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hit = new THREE.Mesh(hitGeo, hitMat)
    hit.position.y = 0.4
    hit.userData = { palaceIndex: index }
    group.add(hit)
    palaceMeshes.push(hit)

    if (index === coreHouseIndex.value) {
      const ring = createRing(1.9, 0xe8c56a, 0.7, 0)
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0.05
      ring.userData.isCoreHouse = true
      group.add(ring)
      const beamGeo = new THREE.CylinderGeometry(0.015, 0.08, 3.5, 6)
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xe8c56a,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      })
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.y = 1.2
      group.add(beam)
    }

    if (cusp.house === 1) {
      const angleRing = createRing(2.05, 0xff6b9d, 0.55, 0)
      angleRing.rotation.x = Math.PI / 2
      angleRing.position.y = 0.1
      angleRing.userData.isAngleHouse = true
      group.add(angleRing)
    }

    scene!.add(group)
    palaceGroups.push(group)
  })

  const ringPoints: THREE.Vector3[] = []
  for (let index = 0; index <= 128; index += 1) {
    const angle = (index / 128) * Math.PI * 2
    ringPoints.push(new THREE.Vector3(
      Math.cos(angle) * PALACE_RADIUS,
      -0.6,
      Math.sin(angle) * PALACE_RADIUS,
    ))
  }
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints)
  scene.add(new THREE.Line(ringGeo, new THREE.LineBasicMaterial({
    color: 0x3a5a8a,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
  })))

  houses.value.forEach((cusp) => {
    const angle = longitudeAngle(cusp.longitude)
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(
        Math.cos(angle) * PALACE_RADIUS,
        -0.6,
        Math.sin(angle) * PALACE_RADIUS,
      ),
    ]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    scene!.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: 0x2a4a6a,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    })))
  })

  const dustCount = 600
  const dustGeo = new THREE.BufferGeometry()
  const dustPos = new Float32Array(dustCount * 3)
  for (let index = 0; index < dustCount; index += 1) {
    const radius = 5 + Math.random() * 18
    const angle = Math.random() * Math.PI * 2
    dustPos[index * 3] = Math.cos(angle) * radius
    dustPos[index * 3 + 1] = (Math.random() - 0.5) * 14
    dustPos[index * 3 + 2] = Math.sin(angle) * radius
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x8fb8ff,
    size: 0.08,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)
}

function updateHover() {
  if (!camera) return
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(palaceMeshes)
  const nextIndex = hits[0] ? hits[0].object.userData.palaceIndex as number : -1
  if (nextIndex !== hoveredIndex) {
    if (hoveredIndex >= 0) palaceGroups[hoveredIndex]?.scale.setScalar(1)
    hoveredIndex = nextIndex
    if (hoveredIndex >= 0) {
      palaceGroups[hoveredIndex]?.scale.setScalar(1.08)
      document.body.style.cursor = 'pointer'
    } else {
      document.body.style.cursor = 'default'
    }
  }
}

function animateCameraTo(target: THREE.Vector3) {
  if (!controls) return
  camAnim = {
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
    t: 0,
    dur: 800,
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (!scene || !camera || !renderer || !controls) return
  const delta = clock!.getDelta()
  const elapsed = clock!.elapsedTime

  if (coreMesh) {
    coreMesh.rotation.y += delta * 0.4
    coreMesh.rotation.x += delta * 0.15
    const pulse = 1 + Math.sin(elapsed * 1.5) * 0.06
    coreMesh.scale.setScalar(pulse)
  }
  if (glowSprite) glowSprite.scale.setScalar(9 * (1 + Math.sin(elapsed * 1.2) * 0.08))
  if (coreRing1) coreRing1.rotation.z += delta * 0.2
  if (coreRing2) coreRing2.rotation.z -= delta * 0.15
  if (coreRing3) coreRing3.rotation.z += delta * 0.1
  if (starfield) starfield.rotation.y += delta * 0.004
  if (dust) dust.rotation.y += delta * 0.01

  palaceGroups.forEach((group, index) => {
    if (index !== hoveredIndex) group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08)
    group.children.forEach((child) => {
      const material = (child as THREE.Mesh).material as (THREE.Material & { opacity: number }) | undefined
      if (child.userData.isCoreHouse) {
        if (material) material.opacity = 0.4 + Math.sin(elapsed * 2) * 0.3
      }
      if (child.userData.isAngleHouse) {
        if (material) material.opacity = 0.3 + Math.sin(elapsed * 2.5 + 1) * 0.25
      }
    })
  })

  if (camAnim && controls) {
    camAnim.t += delta * 1000
    const progress = Math.min(camAnim.t / camAnim.dur, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    controls.target.lerpVectors(camAnim.fromTarget, camAnim.toTarget, ease)
    if (progress >= 1) camAnim = null
  }

  updateHover()
  controls.update()
  renderer.render(scene, camera)
}

function showPalacePanel(index: number) {
  selectedIndex.value = index
  panelVisible.value = true
}

function closePanel() {
  panelVisible.value = false
  if (controls) controls.autoRotate = true
}

function selectHouse(index: number) {
  activeTimelineIndex.value = index
  const cusp = houses.value[index]
  if (!cusp) return
  const angle = longitudeAngle(cusp.longitude)
  animateCameraTo(new THREE.Vector3(
    Math.cos(angle) * PALACE_RADIUS,
    2,
    Math.sin(angle) * PALACE_RADIUS,
  ))
  showPalacePanel(index)
  if (controls) controls.autoRotate = false
}

function setupEvents() {
  const canvas = renderer?.domElement
  if (!canvas) return
  onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }
  onPointerDown = (event) => {
    pointerDown = { x: event.clientX, y: event.clientY }
  }
  onPointerCancel = () => {
    pointerDown = null
  }
  onPointerUp = (event) => {
    if (!pointerDown) return
    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
    pointerDown = null
    if (moved > 6 || !camera) return
    const rect = canvas.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(palaceMeshes)
    const hit = hits[0]
    if (hit) {
      showPalacePanel(hit.object.userData.palaceIndex as number)
      if (controls) controls.autoRotate = false
    } else {
      closePanel()
    }
  }
  onResize = () => {
    const wrap = canvasWrap.value
    if (!wrap || !camera || !renderer) return
    camera.aspect = wrap.clientWidth / wrap.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(wrap.clientWidth, wrap.clientHeight)
  }
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointercancel', onPointerCancel)
  canvas.addEventListener('pointerup', onPointerUp)
  window.addEventListener('resize', onResize)
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(material)) {
      material.forEach(item => item.dispose())
    } else {
      material?.dispose()
    }
    const spriteMaterial = (child as THREE.Sprite).material as THREE.SpriteMaterial | undefined
    if (spriteMaterial?.map) spriteMaterial.map.dispose()
  })
}

function captureFrame(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!scene || !camera || !renderer) {
      resolve(null)
      return
    }
    requestAnimationFrame(() => {
      renderer!.render(scene!, camera!)
      try {
        resolve(renderer!.domElement.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    })
  })
}

defineExpose({ captureFrame })

onMounted(() => {
  document.body.style.overflow = 'hidden'
  buildAstrolabe()
  setupEvents()
  clock = new THREE.Clock()
  animate()
  activeTimelineIndex.value = coreHouseIndex.value
  requestAnimationFrame(() => requestAnimationFrame(() => {
    loaderDone.value = true
    loaderTimer = window.setTimeout(() => {
      loaderRemoved.value = true
    }, 900)
  }))
  panelTimer = window.setTimeout(() => showPalacePanel(0), 1200)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.clearTimeout(loaderTimer)
  window.clearTimeout(panelTimer)
  const canvas = renderer?.domElement
  if (canvas) {
    if (onPointerMove) canvas.removeEventListener('pointermove', onPointerMove)
    if (onPointerDown) canvas.removeEventListener('pointerdown', onPointerDown)
    if (onPointerCancel) canvas.removeEventListener('pointercancel', onPointerCancel)
    if (onPointerUp) canvas.removeEventListener('pointerup', onPointerUp)
  }
  if (onResize) window.removeEventListener('resize', onResize)
  controls?.dispose()
  if (scene) disposeObject(scene)
  renderer?.dispose()
  renderer?.domElement.remove()
  document.body.style.cursor = 'default'
  document.body.style.overflow = ''
})

</script>

<style scoped>
.zps {
  --zps-bg: #05060a;
  --zps-panel: rgba(10, 14, 24, 0.82);
  --zps-border: rgba(120, 180, 255, 0.22);
  --zps-gold: #e8c56a;
  --zps-jade: #5ee0b8;
  --zps-rose: #ff6b9d;
  --zps-violet: #a78bfa;
  --zps-text: #d7e2f0;
  --zps-muted: #7a8aa3;
  --zps-lu: #5ee0b8;
  --zps-quan: #ffb454;
  --zps-ke: #6db3ff;
  --zps-ji: #ff5c7c;
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: hidden;
  background: var(--zps-bg);
  color: var(--zps-text);
  font-family: "PingFang SC", "Noto Serif SC", "Songti SC", serif;
}

.zps-canvas-wrap {
  position: fixed;
  inset: 0;
}

.zps-canvas-wrap :deep(canvas) {
  display: block;
}

.zps-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 18px 28px 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(5, 6, 10, 0.92), transparent);
}

.zps-header h1 {
  font-size: 20px;
  letter-spacing: 6px;
  font-weight: 400;
  color: var(--zps-gold);
  text-shadow: 0 0 24px rgba(232, 197, 106, 0.35);
}

.zps-header .sub {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--zps-muted);
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  pointer-events: auto;
}

.toolbar :deep(a),
.toolbar :deep(button),
.toolbar :deep(.u-button) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(120, 180, 255, 0.18);
  border-radius: 5px;
  background: rgba(10, 14, 24, 0.72);
  color: var(--zps-text);
  font-size: 11px;
  letter-spacing: 1px;
  text-decoration: none;
  backdrop-filter: blur(12px);
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.toolbar :deep(a:hover),
.toolbar :deep(button:hover),
.toolbar :deep(.u-button:hover) {
  border-color: rgba(232, 197, 106, 0.45);
  color: var(--zps-gold);
}

.toolbar :deep(svg) {
  width: 13px;
  height: 13px;
}

.now-badge {
  text-align: right;
  font-size: 12px;
  line-height: 1.7;
  pointer-events: auto;
  cursor: default;
}

.now-badge .date {
  color: var(--zps-jade);
  font-size: 15px;
  letter-spacing: 1px;
}

.now-badge .lunar {
  color: var(--zps-muted);
  font-size: 11px;
}

.hint {
  position: fixed;
  left: 50%;
  top: 82px;
  transform: translateX(-50%);
  z-index: 15;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(122, 138, 163, 0.6);
  pointer-events: none;
  white-space: nowrap;
}

.legend {
  position: fixed;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  font-size: 11px;
  letter-spacing: 1px;
  pointer-events: none;
}

.legend .item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--zps-muted);
}

.legend-extra {
  margin-top: 14px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.dot.is-gold {
  color: var(--zps-gold);
  background: var(--zps-gold);
}

.dot.nature-harmonious {
  color: var(--zps-lu);
  background: var(--zps-lu);
}

.dot.nature-dynamic {
  color: var(--zps-ji);
  background: var(--zps-ji);
}

.dot.nature-neutral {
  color: var(--zps-ke);
  background: var(--zps-ke);
}

.side-panel {
  position: fixed;
  right: 18px;
  top: 84px;
  bottom: 18px;
  width: 340px;
  z-index: 30;
  background: var(--zps-panel);
  border: 1px solid var(--zps-border);
  border-radius: 14px;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 18px;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s;
  scrollbar-width: thin;
  scrollbar-color: rgba(120, 180, 255, 0.25) transparent;
}

.side-panel::-webkit-scrollbar {
  width: 4px;
}

.side-panel::-webkit-scrollbar-thumb {
  background: rgba(120, 180, 255, 0.25);
  border-radius: 2px;
}

.side-panel.hidden {
  transform: translateX(calc(100% + 30px));
  opacity: 0;
  pointer-events: none;
}

.panel-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  color: var(--zps-muted);
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}

.panel-close:hover {
  color: var(--zps-gold);
}

.palace-title {
  font-size: 17px;
  letter-spacing: 3px;
  color: var(--zps-gold);
  margin-bottom: 2px;
}

.palace-meta {
  font-size: 11px;
  color: var(--zps-muted);
  letter-spacing: 1px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(120, 180, 255, 0.12);
}

.is-gold-text {
  color: var(--zps-gold);
}

.is-rose-text {
  color: var(--zps-rose);
}

.section-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--zps-jade);
  text-transform: uppercase;
  margin: 16px 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, rgba(94, 224, 184, 0.3), transparent);
}

.star-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  margin: 3px 4px 3px 0;
  border-radius: 6px;
  font-size: 12px;
  letter-spacing: 1px;
  background: rgba(120, 180, 255, 0.07);
  border: 1px solid rgba(120, 180, 255, 0.14);
  color: #c4d4e8;
}

.star-chip.major {
  background: rgba(232, 197, 106, 0.09);
  border-color: rgba(232, 197, 106, 0.25);
  color: var(--zps-gold);
}

.star-chip.minor {
  background: rgba(94, 224, 184, 0.07);
  border-color: rgba(94, 224, 184, 0.18);
  color: var(--zps-jade);
}

.star-chip.misc {
  background: rgba(167, 139, 250, 0.07);
  border-color: rgba(167, 139, 250, 0.16);
  color: var(--zps-violet);
  font-size: 11px;
}

.brightness {
  font-size: 9px;
  opacity: 0.65;
  letter-spacing: 0;
}

.state {
  background: rgba(94, 224, 184, 0.2);
  color: var(--zps-lu);
}

.state.is-neutral {
  background: rgba(109, 179, 255, 0.2);
  color: var(--zps-ke);
}

.state.is-weak {
  background: rgba(255, 92, 124, 0.2);
  color: var(--zps-ji);
}

.retro {
  background: rgba(167, 139, 250, 0.2);
  color: var(--zps-violet);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 7px 0;
  font-size: 12px;
  border-bottom: 1px dashed rgba(120, 180, 255, 0.08);
}

.info-row .k {
  color: var(--zps-muted);
  letter-spacing: 1px;
}

.info-row .v {
  color: var(--zps-text);
  letter-spacing: 1px;
}

.empty-note {
  color: var(--zps-muted);
  font-size: 11px;
}

.timeline {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 25;
  width: min(860px, calc(100vw - 440px));
  background: rgba(10, 14, 24, 0.78);
  border: 1px solid var(--zps-border);
  border-radius: 12px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 12px 18px 10px;
  pointer-events: auto;
}

.tl-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--zps-muted);
  margin-bottom: 8px;
}

.tl-head strong {
  color: var(--zps-gold);
  font-weight: 400;
  letter-spacing: 2px;
}

.tl-track {
  position: relative;
  height: 40px;
  display: flex;
  gap: 2px;
}

.tl-seg {
  flex: 1;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  background: rgba(120, 180, 255, 0.05);
  border: 1px solid transparent;
  transition: background 0.25s, border-color 0.25s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: var(--zps-muted);
  letter-spacing: 0;
  overflow: hidden;
}

.tl-seg:hover {
  background: rgba(120, 180, 255, 0.12);
}

.tl-seg.active {
  background: rgba(232, 197, 106, 0.14);
  border-color: rgba(232, 197, 106, 0.5);
  color: var(--zps-gold);
  box-shadow: 0 0 18px rgba(232, 197, 106, 0.18);
}

.tl-seg .age {
  font-size: 8px;
  opacity: 0.7;
}

.tl-seg .pal {
  font-size: 10px;
  font-weight: 600;
}

.zps-loader {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #05060a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  transition: opacity 0.8s;
}

.zps-loader.done {
  opacity: 0;
  pointer-events: none;
}

.loader-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(232, 197, 106, 0.15);
  border-top-color: var(--zps-gold);
  animation: zps-spin 1s linear infinite;
}

.zps-loader p {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--zps-muted);
}

@keyframes zps-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .side-panel {
    width: calc(100vw - 24px);
    right: 12px;
    top: 122px;
    bottom: 12px;
  }

  .timeline {
    width: calc(100vw - 24px);
    left: 12px;
    transform: none;
    bottom: 12px;
  }

  .legend {
    display: none;
  }

  .zps-header h1 {
    font-size: 15px;
    letter-spacing: 4px;
  }

  .toolbar {
    max-width: min(100%, 330px);
    overflow-x: auto;
    padding-bottom: 2px;
  }
}
</style>
