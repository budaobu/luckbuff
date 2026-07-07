<template>
  <div ref="container" class="jiaobei-scene w-full h-full" />
</template>

<script setup lang="ts">
import * as THREE from 'three'

const props = defineProps<{
  toss?: string
  trigger?: number
  duration?: number
}>()

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const container = ref<HTMLDivElement>()

onMounted(() => {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  const scene = new THREE.Scene()
  scene.background = null

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 4.5, 7.5)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.value.appendChild(renderer.domElement)

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(0xfff4e0, 1.2)
  dir.position.set(3, 6, 4)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  scene.add(dir)
  const rim = new THREE.DirectionalLight(0xe8d5ff, 0.5)
  rim.position.set(-3, 2, -4)
  scene.add(rim)

  // Ground
  const groundGeo = new THREE.PlaneGeometry(12, 12)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1510,
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0.35,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.02
  ground.receiveShadow = true
  scene.add(ground)

  /**
   * 真实筊杯几何特征：
   * - 整体呈 3D 新月/半月形：中间圆润、两端渐尖
   * - 俯视轮廓：外弧凸出、内弧凹入，交汇成两个尖角
   * - 阳面（平面）：一侧整体平坦，略有木器打磨感
   * - 阴面（凸面）：另一侧中央明显弧形凸起，向边缘和两端逐渐变薄
   * - 比例：长约手掌大小，中部最宽最厚，尖端最薄
   *
   * 当前实现：用两个相交圆弧的差集作为俯视轮廓；
   * 外弧半径 R、半张角 alpha，内弧半径 r、中心偏移 d，
   * beta 由端点连续条件 R sin alpha = r sin beta 解出，
   * d = R cos alpha - r cos beta 保证两端平滑汇成尖角。
   */
  function createCrescentShape() {
    const R = 1.5
    const alpha = 0.82
    const r = 1.18
    const beta = Math.asin(Math.min(1, (R / r) * Math.sin(alpha)))
    const d = R * Math.cos(alpha) - r * Math.cos(beta)

    const shape = new THREE.Shape()
    shape.absarc(0, 0, R, -alpha, alpha, false)
    const hole = new THREE.Path()
    hole.absarc(d, 0, r, beta, -beta, true)
    shape.holes.push(hole)
    return shape
  }

  function smoothstep(t: number) {
    return t * t * (3 - 2 * t)
  }

  function createCup() {
    const shape = createCrescentShape()
    const depth = 0.16
    const extrudeSettings = {
      depth,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 4,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    }
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geo.center()

    const pos = geo.attributes.position as THREE.BufferAttribute
    const normal = geo.attributes.normal as THREE.BufferAttribute
    const maxBulge = 1.0

    // 阴面中央弧形凸起：中部最厚，向四边与两端逐渐变薄
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)

      const angle = Math.atan2(y, x)
      const radius = Math.sqrt(x * x + y * y)

      // 沿外弧中轴线（angle≈0）凸起最强，向两尖端快速衰减
      const angleFactor = Math.pow(Math.max(0, Math.cos(angle * 0.78)), 2.6)
      // 在主体半径附近（约 0.9~1.2）凸起最强，过薄边缘处衰减
      const radiusFactor = Math.exp(-Math.pow((radius - 1.0) / 0.3, 2))
      const bulgeFactor = angleFactor * radiusFactor

      // z 范围 [-depth/2, depth/2]，front（阳面）平坦，back（阴面）凸起
      const normalizedZ = (z + depth / 2) / depth
      const displacement = maxBulge * bulgeFactor * smoothstep(normalizedZ)

      pos.setZ(i, z + displacement)
    }

    pos.needsUpdate = true
    geo.computeVertexNormals()

    // 第二步：按法线方向给阳面/阴面/侧壁分配颜色
    const colors: number[] = []
    const yangColor = new THREE.Color(0xdbbe8a)
    const yinColor = new THREE.Color(0x7a5c2e)
    const sideColor = new THREE.Color(0xa78954)

    for (let i = 0; i < pos.count; i++) {
      const nx = normal.getX(i)
      const ny = normal.getY(i)
      const nz = normal.getZ(i)

      // 阳面法线大致朝 -Z（局部背面向下），阴面法线大致朝 +Z
      if (nz < -0.45) {
        colors.push(yangColor.r, yangColor.g, yangColor.b)
      } else if (nz > 0.45) {
        colors.push(yinColor.r, yinColor.g, yinColor.b)
      } else {
        colors.push(sideColor.r, sideColor.g, sideColor.b)
      }
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.05,
    })

    const mesh = new THREE.Mesh(geo, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  const cupA = createCup()
  const cupB = createCup()
  scene.add(cupA)
  scene.add(cupB)

  function easeOutBounce(t: number) {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }

  function easeOutQuad(t: number) { return 1 - (1 - t) * (1 - t) }

  let rafId: number | null = null
  let start = performance.now()
  let duration = props.duration ?? 1500
  let completed = false

  function resetPose() {
    cupA.position.set(-0.7, 0.15, 0)
    cupB.position.set(0.7, 0.15, 0)
    cupA.rotation.set(-Math.PI / 2, 0, -0.2)
    cupB.rotation.set(-Math.PI / 2, 0, 0.2)
  }

  function computeTargetRotation(toss: string) {
    // 阳面（平面）朝上：rotation.x = +PI/2；阴面（凸面）朝上：rotation.x = -PI/2
    const flatUp = Math.PI / 2
    const convexUp = -Math.PI / 2
    const flatA = toss === '笑' || toss === '圣'
    const flatB = toss === '笑'
    return {
      targetRotAX: flatA ? flatUp : convexUp,
      targetRotBX: flatB ? flatUp : convexUp,
    }
  }

  function normalizeAngle(a: number) {
    const TWO_PI = Math.PI * 2
    return a - TWO_PI * Math.round(a / TWO_PI)
  }
  function nearestAngle(from: number, to: number) {
    return from + normalizeAngle(to - from)
  }

  function animate() {
    if (!container.value) return
    const now = performance.now()
    const rawT = Math.min((now - start) / duration, 1)

    if (rawT >= 1 && !completed) {
      completed = true
      emit('complete')
    }

    const { targetRotAX, targetRotBX } = computeTargetRotation(props.toss || '圣')

    if (rawT < 0.25) {
      const t = rawT / 0.25
      cupA.position.set(-0.7, 0.15 + t * 1.8, 0)
      cupB.position.set(0.7, 0.15 + t * 1.8, 0)
      cupA.rotation.set(-Math.PI / 2 - t * 0.6, t * 2.5, -0.2 - t * 0.5)
      cupB.rotation.set(-Math.PI / 2 - t * 0.6, -t * 2.5, 0.2 + t * 0.5)
    } else if (rawT < 0.6) {
      const t = (rawT - 0.25) / 0.35
      const arc = Math.sin(t * Math.PI)
      cupA.position.set(-0.7 - t * 1.4, 0.15 + 1.8 + arc * 2.4 - t * 1.8, -t * 0.8)
      cupB.position.set(0.7 + t * 1.4, 0.15 + 1.8 + arc * 2.4 - t * 1.8, -t * 0.8)
      cupA.rotation.set(-Math.PI + t * Math.PI * 3.5, t * Math.PI * 6, -0.7 - t * Math.PI * 2.5)
      cupB.rotation.set(-Math.PI - t * Math.PI * 3.5, -t * Math.PI * 6, 0.7 + t * Math.PI * 2.5)
    } else {
      const t = Math.min((rawT - 0.6) / 0.4, 1)
      const bounce = easeOutBounce(t)
      const targetAX = -0.8
      const targetBX = 0.8
      const targetY = 0.15
      const landY = targetY + (1 - bounce) * 1.2
      cupA.position.set(targetAX, landY, 0.4)
      cupB.position.set(targetBX, landY, -0.4)
      const settleT = easeOutQuad(t)

      // 归一化角度，避免落地时多余旋转
      const startAX = normalizeAngle(-Math.PI + Math.PI * 3.5)
      const startBX = normalizeAngle(-Math.PI - Math.PI * 3.5)
      const startAY = normalizeAngle(Math.PI * 6)
      const startBY = normalizeAngle(-Math.PI * 6)
      const startAZ = normalizeAngle(-0.7 - Math.PI * 2.5)
      const startBZ = normalizeAngle(0.7 + Math.PI * 2.5)

      cupA.rotation.set(
        THREE.MathUtils.lerp(startAX, nearestAngle(startAX, targetRotAX), settleT),
        THREE.MathUtils.lerp(startAY, nearestAngle(startAY, 0), settleT),
        THREE.MathUtils.lerp(startAZ, nearestAngle(startAZ, -0.15), settleT),
      )
      cupB.rotation.set(
        THREE.MathUtils.lerp(startBX, nearestAngle(startBX, targetRotBX), settleT),
        THREE.MathUtils.lerp(startBY, nearestAngle(startBY, 0), settleT),
        THREE.MathUtils.lerp(startBZ, nearestAngle(startBZ, 0.15), settleT),
      )
    }

    renderer.render(scene, camera)

    if (rawT < 1 || !completed) {
      rafId = requestAnimationFrame(animate)
    }
  }

  function startAnimation() {
    if (rafId) cancelAnimationFrame(rafId)
    completed = false
    duration = props.duration ?? 1500
    start = performance.now()
    resetPose()
    rafId = requestAnimationFrame(animate)
  }

  resetPose()
  startAnimation()

  watch(() => props.trigger, () => {
    startAnimation()
  }, { flush: 'post' })

  const onResize = () => {
    if (!container.value) return
    const w = container.value.clientWidth
    const h = container.value.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    container.value?.removeChild(renderer.domElement)
  })
})
</script>

<style scoped>
.jiaobei-scene {
  min-height: 280px;
}
@media (max-width: 640px) {
  .jiaobei-scene {
    min-height: 220px;
  }
}
</style>
