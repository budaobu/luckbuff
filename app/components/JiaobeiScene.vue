<template>
  <div ref="container" class="jiaobei-scene" />
</template>

<script setup lang="ts">
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps<{
  toss?: string
  trigger?: number
  duration?: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const container = ref<HTMLDivElement>()
const modelUrl = '/models/jiaobei/jiaobei.gltf'

onMounted(async () => {
  if (!container.value) return

  const root = container.value
  const width = root.clientWidth || 640
  const height = root.clientHeight || 280
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 30)
  camera.position.set(0, 2.8, 4.9)
  camera.lookAt(0, 0.18, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.16
  root.appendChild(renderer.domElement)

  const ambient = new THREE.AmbientLight(0xfff8ec, 0.55)
  const hemisphere = new THREE.HemisphereLight(0xfff6e3, 0x2a1a09, 0.85)
  const keyLight = new THREE.DirectionalLight(0xfff1d5, 2.1)
  keyLight.position.set(2.4, 5.2, 3.6)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.camera.left = -4
  keyLight.shadow.camera.right = 4
  keyLight.shadow.camera.top = 4
  keyLight.shadow.camera.bottom = -4
  const rimLight = new THREE.DirectionalLight(0xd9c8ff, 0.8)
  rimLight.position.set(-3.2, 2, -4)
  scene.add(ambient, hemisphere, keyLight, rimLight)

  const groundGeometry = new THREE.CircleGeometry(3.0, 72)
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.16 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -26, 0) })
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true
  ;(world.solver as CANNON.GSSolver).iterations = 14

  const cupPhysics = new CANNON.Material('jiaobei-cup')
  const groundPhysics = new CANNON.Material('jiaobei-ground')
  world.addContactMaterial(new CANNON.ContactMaterial(cupPhysics, groundPhysics, {
    friction: 0.32,
    restitution: 0.26,
  }))
  world.addContactMaterial(new CANNON.ContactMaterial(cupPhysics, cupPhysics, {
    friction: 0.24,
    restitution: 0.2,
  }))

  const physicsGround = new CANNON.Body({ mass: 0, material: groundPhysics })
  physicsGround.addShape(new CANNON.Plane())
  physicsGround.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(physicsGround)

  const cups: {
    mesh: THREE.Mesh
    body: CANNON.Body
    flatUp: boolean
    homeX: number
    yaw: number
    target: THREE.Quaternion
  }[] = []
  let cupGeometry: THREE.BufferGeometry | null = null
  let cupMaterial: THREE.Material | null = null
  let disposed = false
  let completed = false
  let rafId: number | null = null
  let startedAt = 0
  let settledAt = Number.POSITIVE_INFINITY
  let previousElapsed = 0
  let resizeObserver: ResizeObserver | null = null

  const convexUp = new THREE.Quaternion()
  const flatUp = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI)
  const temporaryEuler = new THREE.Euler()
  const temporaryQuaternion = new THREE.Quaternion()
  const temporaryVector = new THREE.Vector3()

  watch(() => props.trigger, () => {
    if (cups.length > 0) startThrow()
  }, { flush: 'post' })

  resizeObserver = new ResizeObserver(() => {
    if (disposed || !root.clientWidth || !root.clientHeight) return
    camera.aspect = root.clientWidth / root.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(root.clientWidth, root.clientHeight)
    renderOnce()
  })
  resizeObserver.observe(root)

  onBeforeUnmount(() => {
    disposed = true
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver?.disconnect()
    cups.forEach(cup => world.removeBody(cup.body))
    world.removeBody(physicsGround)
    cupGeometry?.dispose()
    cupMaterial?.dispose()
    groundGeometry.dispose()
    groundMaterial.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  })

  function toThreeQuaternion(quaternion: CANNON.Quaternion) {
    return temporaryQuaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
  }

  function syncCupMesh(mesh: THREE.Mesh, body: CANNON.Body) {
    mesh.position.set(body.position.x, body.position.y, body.position.z)
    mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
  }

  function createCup(mesh: THREE.Mesh, material: THREE.Material, homeX: number, flatUp: boolean) {
    const visual = new THREE.Mesh(mesh.geometry, material)
    visual.scale.setScalar(1.25)
    visual.castShadow = true
    visual.receiveShadow = true
    scene.add(visual)

    const body = new CANNON.Body({
      mass: 0.18,
      material: cupPhysics,
      linearDamping: 0.16,
      angularDamping: 0.26,
      allowSleep: false,
    })
    body.addShape(new CANNON.Box(new CANNON.Vec3(0.66, 0.094, 0.25)))
    world.addBody(body)
    cups.push({
      mesh: visual,
      body,
      flatUp,
      homeX,
      yaw: 0,
      target: new THREE.Quaternion(),
    })
  }

  function prepareThrow(template: THREE.Mesh) {
    const result = props.toss ?? '圣'
    const flatA = result === '圣' || result === '笑'
    const flatB = result === '笑'

    createCup(template, cupMaterial!, -0.82, flatA)
    createCup(template, cupMaterial!, 0.82, flatB)

    cups.forEach((cup, index) => {
      cup.body.position.set(cup.homeX, 3.3 + index * 0.16, index === 0 ? -0.12 : 0.12)
      temporaryEuler.set(
        (Math.random() - 0.5) * 2.2,
        index === 0 ? -0.5 : 0.5,
        (Math.random() - 0.5) * 1.8,
      )
      cup.body.quaternion.setFromEuler(temporaryEuler.x, temporaryEuler.y, temporaryEuler.z)
      cup.body.velocity.set((Math.random() - 0.5) * 0.5, -0.8, (Math.random() - 0.5) * 0.3)
      cup.body.angularVelocity.set(
        (Math.random() - 0.5) * 18,
        (index === 0 ? -1 : 1) * (12 + Math.random() * 5),
        (Math.random() - 0.5) * 15,
      )
      cup.body.wakeUp()
      syncCupMesh(cup.mesh, cup.body)
    })
  }

  function chooseTargetOrientation(cup: typeof cups[number]) {
    const forward = temporaryVector.set(1, 0, 0).applyQuaternion(toThreeQuaternion(cup.body.quaternion)).clone()
    cup.yaw = Math.atan2(forward.z, forward.x)
    const faceRotation = cup.flatUp ? flatUp : convexUp
    const yawRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), cup.yaw)
    cup.target.copy(yawRotation).multiply(faceRotation)
  }

  function alignToResult(cup: typeof cups[number], dt: number) {
    const body = cup.body
    const current = toThreeQuaternion(body.quaternion).clone()
    const error = cup.target.clone().multiply(current.clone().invert())
    error.normalize()

    const angle = 2 * Math.acos(THREE.MathUtils.clamp(Math.abs(error.w), -1, 1))
    if (angle > 0.002) {
      const sin = Math.sqrt(Math.max(1 - error.w * error.w, 1e-8))
      temporaryVector.set(error.x / sin, error.y / sin, error.z / sin)
      const correction = temporaryVector.clone().multiplyScalar(angle * 7.5)
      body.angularVelocity.x = THREE.MathUtils.lerp(body.angularVelocity.x, correction.x, 0.18)
      body.angularVelocity.y = THREE.MathUtils.lerp(body.angularVelocity.y, correction.y, 0.18)
      body.angularVelocity.z = THREE.MathUtils.lerp(body.angularVelocity.z, correction.z, 0.18)
    }
    else {
      body.angularVelocity.scale(0.82, body.angularVelocity)
    }

    const homeForceX = (cup.homeX - body.position.x) * 4.2
    const homeForceZ = (0 - body.position.z) * 3.6
    body.velocity.x = THREE.MathUtils.lerp(body.velocity.x, homeForceX, Math.min(dt * 5, 0.16))
    body.velocity.z = THREE.MathUtils.lerp(body.velocity.z, homeForceZ, Math.min(dt * 5, 0.16))
  }

  function cupsAreStable() {
    return cups.every(({ body }) => (
      body.position.y < 0.28
      && body.velocity.lengthSquared() < 0.008
      && body.angularVelocity.lengthSquared() < 0.012
    ))
  }

  function renderOnce() {
    renderer.render(scene, camera)
  }

  function finish() {
    if (completed) return
    completed = true
    emit('complete')
  }

  function frame(now: number) {
    if (disposed) return
    const elapsed = (now - startedAt) / 1000
    const dt = Math.min(elapsed - previousElapsed, 1 / 30)
    previousElapsed = elapsed

    if (elapsed >= 0.58 && settledAt === Number.POSITIVE_INFINITY) {
      settledAt = elapsed
      cups.forEach(chooseTargetOrientation)
    }

    if (settledAt !== Number.POSITIVE_INFINITY) {
      cups.forEach(cup => alignToResult(cup, dt))
    }

    world.step(1 / 120, dt, 5)
    cups.forEach(cup => syncCupMesh(cup.mesh, cup.body))

    const duration = Math.max(1.8, Math.min(props.duration ?? 2200, 4000) / 1000)
    if ((elapsed >= duration && cupsAreStable()) || elapsed >= duration + 0.7) {
      renderOnce()
      finish()
      return
    }

    renderOnce()
    rafId = requestAnimationFrame(frame)
  }

  function startThrow() {
    if (disposed || completed || cups.length === 0) return
    if (rafId) cancelAnimationFrame(rafId)
    completed = false
    startedAt = performance.now()
    previousElapsed = 0
    settledAt = Number.POSITIVE_INFINITY
    rafId = requestAnimationFrame(frame)
  }

  try {
    const gltf = await new GLTFLoader().loadAsync(modelUrl)
    const source = gltf.scene.getObjectByName('CupA') ?? gltf.scene.getObjectByName('CupB')
    if (!(source instanceof THREE.Mesh)) {
      throw new Error('Jiaobei GLB does not contain a cup mesh')
    }

    cupGeometry = source.geometry.clone()
    cupMaterial = Array.isArray(source.material) ? source.material[0]! : source.material

    prepareThrow(source)
    renderOnce()
    startThrow()
  }
  catch (error) {
    console.error('Unable to load the jiaobei model', error)
  }

})
</script>

<style scoped>
.jiaobei-scene {
  width: 100%;
  min-height: 280px;
}

@media (max-width: 640px) {
  .jiaobei-scene {
    min-height: 220px;
  }
}
</style>
