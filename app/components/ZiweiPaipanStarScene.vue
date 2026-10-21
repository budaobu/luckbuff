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
        <h1>紫微斗数 · 星穹盘</h1>
        <div class="sub">ZI WEI DOU SHU · 3D ASTROLABE</div>
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
            tool="ziwei-paipan"
            summary="紫微斗数 · 星穹盘"
            filename="ziwei-paipan-3d.png"
            :share-target="sceneRoot ?? undefined"
            :share-image-factory="captureFrame"
          />
        </nav>
      </div>
      <div class="now-badge">
        <div class="date">{{ nowDateText }}</div>
        <div class="lunar">{{ result.currentPeriods.lunarDate }}</div>
      </div>
    </header>

    <div class="hint">拖拽旋转 · 滚轮缩放 · 点击宫位查看 · 点击空白收起</div>

    <div class="legend">
      <div v-for="item in natalLegend" :key="`${item.mutagen}-${item.star}`" class="item">
        <span class="dot" :class="`mut-${item.mutagen}`" />
        {{ item.mutagen }} · {{ item.star }}
      </div>
      <div class="item legend-extra">
        <span class="dot is-gold" />
        本命四化（{{ natalStem }}干）
      </div>
    </div>

    <aside class="side-panel" :class="{ hidden: !panelVisible }">
      <button class="panel-close" type="button" aria-label="收起详情" @click="closePanel">✕</button>
      <div v-if="selectedPalace" class="panel-body">
        <div class="palace-title">
          {{ selectedPalace.name }}{{ selectedPalace.isBodyPalace ? ' · 身宫' : '' }}
        </div>
        <div class="palace-meta">
          宫干 {{ selectedPalace.heavenlyStem }}{{ selectedPalace.earthlyBranch }}
          <template v-if="selectedDecade">
            · 大限 {{ selectedDecade.range[0] }}–{{ selectedDecade.range[1] }} 岁
          </template>
          <template v-if="selectedIndex === currentDecadeIndex">
            · <span class="is-gold-text">当前大限</span>
          </template>
          <template v-if="selectedPalace.earthlyBranch === liunianPalaceBranch">
            · <span class="is-rose-text">{{ liunianSihua.year }} 流年命宫</span>
          </template>
        </div>

        <div class="section-label">主星 · {{ selectedPalace.majorStars.length }}</div>
        <template v-if="selectedPalace.majorStars.length">
          <span
            v-for="star in selectedPalace.majorStars"
            :key="`major-${star.name}`"
            class="star-chip major"
          >
            {{ star.name }}
            <span v-if="star.brightness" class="brightness">{{ star.brightness }}</span>
            <span v-if="star.mutagen" class="sihua" :class="`sihua-${star.mutagen}`">{{ star.mutagen }}</span>
          </span>
        </template>
        <span v-else class="empty-note">空宫（借对宫星曜）</span>

        <template v-if="selectedPalace.minorStars.length">
          <div class="section-label">辅星 · {{ selectedPalace.minorStars.length }}</div>
          <span
            v-for="star in selectedPalace.minorStars"
            :key="`minor-${star.name}`"
            class="star-chip minor"
          >
            {{ star.name }}
            <span v-if="star.brightness" class="brightness">{{ star.brightness }}</span>
            <span v-if="star.mutagen" class="sihua" :class="`sihua-${star.mutagen}`">{{ star.mutagen }}</span>
          </span>
        </template>

        <template v-if="selectedPalace.adjectiveStars.length">
          <div class="section-label">杂曜 · {{ selectedPalace.adjectiveStars.length }}</div>
          <span
            v-for="star in selectedPalace.adjectiveStars"
            :key="`adjective-${star.name}`"
            class="star-chip misc"
          >
            {{ star.name }}
          </span>
        </template>

        <div class="section-label">十二神</div>
        <div class="info-row">
          <span class="k">长生十二神</span>
          <span class="v">{{ selectedPalace.changsheng12 || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="k">博士十二神</span>
          <span class="v">{{ selectedPalace.boshi12 || '—' }}</span>
        </div>

        <template v-if="selectedDecade">
          <div class="section-label">大限</div>
          <div class="info-row">
            <span class="k">起运顺序</span>
            <span class="v">第 {{ selectedDecade.order + 1 }} 大限</span>
          </div>
          <div class="info-row">
            <span class="k">岁数范围</span>
            <span class="v">{{ selectedDecade.range[0] }} – {{ selectedDecade.range[1] }} 岁</span>
          </div>
          <div class="info-row">
            <span class="k">宫位干支</span>
            <span class="v">{{ selectedDecade.heavenlyStem }}{{ selectedDecade.earthlyBranch }}</span>
          </div>
        </template>

        <div class="section-label">生年四化（{{ natalStem }}干）</div>
        <template v-if="natalHere.length">
          <div v-for="item in natalHere" :key="`natal-${item.star}`" class="info-row">
            <span class="k">{{ item.star }}</span>
            <span class="v"><span class="sihua" :class="`sihua-${item.mut}`">{{ item.mut }}</span></span>
          </div>
        </template>
        <div v-else class="empty-note">本宫无生年四化</div>

        <div class="section-label">{{ liunianSihua.year }} {{ liunianGanzhi }} · 流年四化</div>
        <template v-if="liunianHere.length">
          <div v-for="item in liunianHere" :key="`liunian-${item.star}`" class="info-row">
            <span class="k">{{ item.star }}</span>
            <span class="v"><span class="sihua" :class="`sihua-${item.mut}`">{{ item.mut }}</span></span>
          </div>
        </template>
        <div v-else class="empty-note">流年四化不在本宫</div>
      </div>
    </aside>

    <div class="timeline">
      <div class="tl-head">
        <span>十二大限 · 按起运先后</span>
        <strong>当前大限</strong>
      </div>
      <div class="tl-track">
        <button
          v-for="(decade, index) in decades"
          :key="`${decade.earthlyBranch}-${decade.range[0]}`"
          type="button"
          class="tl-seg"
          :class="{ active: index === activeTimelineIndex }"
          @click="selectDecade(index)"
        >
          <span class="pal">{{ decade.palaceName }}</span>
          <span class="age">{{ decade.range[0] }}–{{ decade.range[1] }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { ZiweiChartResult, ZiweiPalace } from '~~/server/utils/tools/ziwei-chart'

const props = defineProps<{ result: ZiweiChartResult }>()
const emit = defineEmits<{ retry: [] }>()
const localePath = useLocalePath()

const sceneRoot = ref<HTMLElement | null>(null)
const canvasWrap = ref<HTMLElement | null>(null)
const loaderDone = ref(false)
const loaderRemoved = ref(false)
const panelVisible = ref(false)
const selectedIndex = ref<number | null>(null)
const activeTimelineIndex = ref(0)

interface SceneStar {
  name: string
  brightness: string
  mutagen: string
}

interface ScenePalace extends Omit<ZiweiPalace, 'majorStars' | 'minorStars' | 'adjectiveStars' | 'decadal'> {
  majorStars: SceneStar[]
  minorStars: SceneStar[]
  adjectiveStars: SceneStar[]
  decadal: { range: [number, number]; heavenlyStem: string; earthlyBranch: string }
}

interface SceneDecade {
  order: number
  palaceName: string
  heavenlyStem: string
  earthlyBranch: string
  range: [number, number]
  ages: number[]
}

const palaces = computed<ScenePalace[]>(() => props.result.palaces.map(palace => ({
  ...palace,
  majorStars: palace.majorStars.map(star => ({
    name: star.name,
    brightness: star.brightness || '',
    mutagen: star.mutagen || '',
  })),
  minorStars: palace.minorStars.map(star => ({
    name: star.name,
    brightness: star.brightness || '',
    mutagen: star.mutagen || '',
  })),
  adjectiveStars: palace.adjectiveStars.map(star => ({
    name: star.name,
    brightness: '',
    mutagen: '',
  })),
  decadal: {
    range: [palace.decadal.startAge, palace.decadal.endAge],
    heavenlyStem: palace.decadal.heavenlyStem,
    earthlyBranch: palace.decadal.earthlyBranch,
  },
})))

const decades = computed<SceneDecade[]>(() => props.result.majorLimits.map((limit, order) => ({
  order,
  palaceName: limit.palaceName,
  heavenlyStem: limit.heavenlyStem,
  earthlyBranch: limit.earthlyBranch,
  range: [limit.ageRange[0], limit.ageRange[1]],
  ages: props.result.palaces.find(palace => palace.index === limit.index)?.ages || [],
})))

const currentDecadeIndex = computed(() => {
  const index = props.result.majorLimits.findIndex(limit => limit.isCurrent)
  return index >= 0 ? index : 0
})
const currentDecadePalaceName = computed(() => props.result.majorLimits[currentDecadeIndex.value]?.palaceName || '')

const queryYear = computed(() => Number(props.result.currentPeriods.queryDate.slice(0, 4)) || new Date().getFullYear())
const birthYear = computed(() => Number(props.result.input.birthDate.slice(0, 4)) || queryYear.value)
const currentAge = computed(() => queryYear.value - birthYear.value)

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

function ganzhiForYear(year: number) {
  return {
    stem: STEMS[(year - 4) % 10],
    branch: BRANCHES[(year - 4) % 12],
  }
}

const birthGanzhi = computed(() => ganzhiForYear(birthYear.value))
const natalStem = computed(() => {
  const match = /([甲乙丙丁戊己庚辛壬癸])/.exec(props.result.summary.chineseDate)
  return match?.[1] || birthGanzhi.value.stem
})

const SIHUA_TABLE: Record<string, { lu: string; quan: string; ke: string; ji: string }> = {
  '甲': { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },
  '乙': { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },
  '丙': { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },
  '丁': { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },
  '戊': { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' },
  '己': { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太阳', quan: '武曲', ke: '天同', ji: '太阴' },
  '辛': { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' },
  '癸': { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' },
}

const liunianGanzhi = computed(() => {
  const { stem, branch } = ganzhiForYear(queryYear.value)
  return `${stem}${branch}`
})

const liunianSihua = computed(() => {
  const stem = liunianGanzhi.value.slice(0, 1)
  return {
    year: queryYear.value,
    ganzhi: liunianGanzhi.value,
    ...SIHUA_TABLE[stem],
  }
})

const currentPeriods = computed(() => props.result.currentPeriods.periods)
const yearlyPeriod = computed(() => currentPeriods.value.find(period => period.key === 'yearly'))
const liunianPalaceBranch = computed(() => yearlyPeriod.value?.earthlyBranch || liunianGanzhi.value.slice(1))

const nowDateText = computed(() => props.result.currentPeriods.queryDate.replaceAll('-', ' · '))
const natalLegend = computed(() => props.result.natalMutagens.map(item => ({
  mutagen: item.mutagen,
  star: item.star,
})))

const selectedPalace = computed(() => selectedIndex.value === null ? null : palaces.value[selectedIndex.value])
const selectedDecade = computed(() => selectedPalace.value
  ? decades.value.find(decade => decade.palaceName === selectedPalace.value?.name)
  : null)

function starsWithMutagen(palace: ScenePalace) {
  return [...palace.majorStars, ...palace.minorStars]
    .filter(star => star.mutagen)
    .map(star => ({ star: star.name, mut: star.mutagen }))
}

const natalHere = computed(() => selectedPalace.value ? starsWithMutagen(selectedPalace.value) : [])

const liunianHere = computed(() => {
  if (!selectedPalace.value) return []
  const lnMap: Record<string, string> = { lu: '禄', quan: '权', ke: '科', ji: '忌' }
  return Object.entries(liunianSihua.value)
    .filter(([key]) => ['lu', 'quan', 'ke', 'ji'].includes(key))
    .flatMap(([key, starName]) => {
      const found = [...selectedPalace.value!.majorStars, ...selectedPalace.value!.minorStars]
        .find(star => star.name === starName)
      return found ? [{ star: starName, mut: lnMap[key] }] : []
    })
})

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
const BRANCH_ORDER = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
const PALACE_RADIUS = 9.5
let onPointerMove: ((event: PointerEvent) => void) | null = null
let onPointerDown: ((event: PointerEvent) => void) | null = null
let onPointerCancel: (() => void) | null = null
let onPointerUp: ((event: PointerEvent) => void) | null = null
let onResize: (() => void) | null = null

function branchAngle(branch: string) {
  const index = BRANCH_ORDER.indexOf(branch)
  return ((index < 0 ? 0 : index) / 12) * Math.PI * 2 - Math.PI / 2
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

function mutagenColor(mutagen: string) {
  return { '禄': 0x5ee0b8, '权': 0xffb454, '科': 0x6db3ff, '忌': 0xff5c7c }[mutagen] || 0xffffff
}

const PALACE_COLORS: Record<string, number> = {
  '命宫': 0xe8c56a,
  '兄弟宫': 0x8fa8c8,
  '夫妻宫': 0xff6b9d,
  '子女宫': 0xa78bfa,
  '财帛宫': 0x5ee0b8,
  '疾厄宫': 0x6db3ff,
  '迁移宫': 0xffb454,
  '交友宫': 0x9aa8b8,
  '官禄宫': 0xe8c56a,
  '田宅宫': 0x8fa8c8,
  '福德宫': 0xa78bfa,
  '父母宫': 0xff6b9d,
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
  if (!wrap || !palaces.value.length || !decades.value.length) return

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

  palaces.value.forEach((palace, index) => {
    const angle = branchAngle(palace.earthlyBranch)
    const x = Math.cos(angle) * PALACE_RADIUS
    const z = Math.sin(angle) * PALACE_RADIUS
    const color = PALACE_COLORS[palace.name] || 0x8fa8c8
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    group.userData = { palace, index }

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

    const nameSprite = makeTextSprite(palace.name, {
      fontSize: 72,
      color: '#e8c56a',
      glow: 'rgba(232,197,106,0.7)',
    })
    nameSprite.position.y = 1.85
    group.add(nameSprite)

    const ganzhiSprite = makeTextSprite(`${palace.heavenlyStem}${palace.earthlyBranch}`, {
      fontSize: 48,
      color: '#7a8aa3',
      glow: 'rgba(120,180,255,0.4)',
    })
    ganzhiSprite.position.y = 1.35
    ganzhiSprite.scale.multiplyScalar(0.75)
    group.add(ganzhiSprite)

    const decade = decades.value.find(item => item.palaceName === palace.name)
    if (decade) {
      const decadeSprite = makeTextSprite(`${decade.range[0]}–${decade.range[1]}`, {
        fontSize: 36,
        color: '#5ee0b8',
        glow: 'rgba(94,224,184,0.5)',
      })
      decadeSprite.position.y = -1.35
      decadeSprite.scale.multiplyScalar(0.6)
      group.add(decadeSprite)
    }

    const starGroup = new THREE.Group()
    const majors = palace.majorStars
    majors.forEach((star, starIndex) => {
      const starAngle = (starIndex / Math.max(majors.length, 1)) * Math.PI * 2
      const starRadius = 0.55
      const sx = Math.cos(starAngle) * starRadius
      const sz = Math.sin(starAngle) * starRadius
      const isMutagen = !!star.mutagen
      const sphereColor = isMutagen ? mutagenColor(star.mutagen) : 0xffffff
      const sphereGeo = new THREE.SphereGeometry(0.11, 12, 12)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: sphereColor,
        emissive: sphereColor,
        emissiveIntensity: isMutagen ? 1.6 : 0.5,
        roughness: 0.3,
        metalness: 0.4,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(sx, 0.1, sz)
      starGroup.add(sphere)

      const starSprite = makeTextSprite(star.name, {
        fontSize: 38,
        color: isMutagen ? `#${sphereColor.toString(16).padStart(6, '0')}` : '#d7e2f0',
        glow: isMutagen ? 'rgba(255,255,255,0.6)' : 'rgba(120,180,255,0.4)',
      })
      starSprite.position.set(sx * 1.6, 0.65, sz * 1.6)
      starSprite.scale.multiplyScalar(0.55)
      starGroup.add(starSprite)

      if (isMutagen) {
        const mutSprite = makeTextSprite(star.mutagen, {
          fontSize: 32,
          color: `#${sphereColor.toString(16).padStart(6, '0')}`,
          glow: 'rgba(255,255,255,0.8)',
        })
        mutSprite.position.set(sx * 2.2, 0.95, sz * 2.2)
        mutSprite.scale.multiplyScalar(0.45)
        starGroup.add(mutSprite)
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

    if (palace.name === currentDecadePalaceName.value) {
      const ring = createRing(1.9, 0xe8c56a, 0.7, 0)
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0.05
      ring.userData.isCurrentDecade = true
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

    if (palace.earthlyBranch === liunianPalaceBranch.value) {
      const liunianRing = createRing(2.05, 0xff6b9d, 0.55, 0)
      liunianRing.rotation.x = Math.PI / 2
      liunianRing.position.y = 0.1
      liunianRing.userData.isLiunian = true
      group.add(liunianRing)
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

  palaces.value.forEach((palace) => {
    const angle = branchAngle(palace.earthlyBranch)
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
      if (child.userData.isCurrentDecade) {
        if (material) material.opacity = 0.4 + Math.sin(elapsed * 2) * 0.3
      }
      if (child.userData.isLiunian) {
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

function selectDecade(index: number) {
  activeTimelineIndex.value = index
  const decade = decades.value[index]
  if (!decade) return
  const palaceIndex = palaces.value.findIndex(palace => palace.name === decade.palaceName)
  if (palaceIndex < 0) return
  const angle = branchAngle(decade.earthlyBranch)
  animateCameraTo(new THREE.Vector3(
    Math.cos(angle) * PALACE_RADIUS,
    2,
    Math.sin(angle) * PALACE_RADIUS,
  ))
  showPalacePanel(palaceIndex)
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
  activeTimelineIndex.value = currentDecadeIndex.value
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

.dot.mut-禄 {
  color: var(--zps-lu);
  background: var(--zps-lu);
}

.dot.mut-权 {
  color: var(--zps-quan);
  background: var(--zps-quan);
}

.dot.mut-科 {
  color: var(--zps-ke);
  background: var(--zps-ke);
}

.dot.mut-忌 {
  color: var(--zps-ji);
  background: var(--zps-ji);
}

.dot.is-gold {
  color: var(--zps-gold);
  background: var(--zps-gold);
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

.sihua {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  letter-spacing: 0;
  font-weight: 600;
}

.sihua-禄 {
  background: rgba(94, 224, 184, 0.2);
  color: var(--zps-lu);
}

.sihua-权 {
  background: rgba(255, 180, 84, 0.2);
  color: var(--zps-quan);
}

.sihua-科 {
  background: rgba(109, 179, 255, 0.2);
  color: var(--zps-ke);
}

.sihua-忌 {
  background: rgba(255, 92, 124, 0.2);
  color: var(--zps-ji);
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
