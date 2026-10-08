<template>
  <div ref="container" class="lot-shake-scene" data-testid="lot-shake-scene" :data-state="state" />
</template>

<script setup lang="ts">
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { LotShakeTheme } from '~/composables/useLotShake'

const props = defineProps<{
  trigger: number
  theme: LotShakeTheme
  selectedSign?: number | null
  duration?: number
}>()

const emit = defineEmits<{
  complete: []
  error: [message: string]
}>()

const container = ref<HTMLDivElement>()
const state = ref<'loading' | 'running' | 'settled' | 'error'>('loading')

let cachedModel: Promise<{ tube: THREE.Object3D; stick: THREE.Mesh }> | null = null

function isMesh(value: THREE.Object3D): value is THREE.Mesh {
  return 'isMesh' in value && Boolean(value.isMesh)
}

function objectWithPrefix(root: THREE.Object3D, prefix: string) {
  return root.getObjectByName(prefix)
    ?? root.children.find(child => child.name === prefix || child.name.startsWith(`${prefix}.`))
}

function loadModel() {
  if (cachedModel) return cachedModel

  cachedModel = new GLTFLoader().loadAsync('/models/lot-tube/lot-tube.gltf').then((gltf) => {
    const tube = objectWithPrefix(gltf.scene, 'LotTube')
    const stick = objectWithPrefix(gltf.scene, 'LotStick')
    if (!tube || !stick || !isMesh(stick)) {
      throw new Error('Lot tube GLB is missing required meshes')
    }
    return { tube, stick }
  })

  return cachedModel
}

function firstMaterial(mesh: THREE.Mesh) {
  return Array.isArray(mesh.material) ? mesh.material[0]! : mesh.material
}

onMounted(async () => {
  const root = container.value
  if (!root) return

  const width = root.clientWidth || 640
  const height = root.clientHeight || 320
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 20)
  camera.position.set(0, 2.65, 4.55)
  camera.lookAt(0, 1.35, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  root.appendChild(renderer.domElement)

  scene.add(
    new THREE.AmbientLight(0xfff6e6, 0.48),
    new THREE.HemisphereLight(0xfff5df, 0x221205, 0.82),
  )
  const keyLight = new THREE.DirectionalLight(0xffeccf, 2.0)
  keyLight.position.set(1.8, 4.4, 2.8)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  const rimLight = new THREE.DirectionalLight(0xc9c3ff, 0.65)
  rimLight.position.set(-2.8, 1.8, -3)
  scene.add(keyLight, rimLight)

  const shadowGeometry = new THREE.CircleGeometry(1.25, 64)
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.14 })
  const ground = new THREE.Mesh(shadowGeometry, shadowMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -24, 0) })
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true
  ;(world.solver as CANNON.GSSolver).iterations = 12

  const stickPhysics = new CANNON.Material('lot-stick')
  world.addContactMaterial(new CANNON.ContactMaterial(stickPhysics, stickPhysics, {
    friction: 0.18,
    restitution: 0.38,
  }))

  type ShakingStick = {
    mesh: THREE.Mesh
    body: CANNON.Body
  }
  const sticks: ShakingStick[] = []
  let tubeRoot: THREE.Object3D | null = null
  let tubeMaterial: THREE.MeshStandardMaterial | null = null
  let stickGeometry: THREE.BufferGeometry | null = null
  let stickMaterial: THREE.MeshStandardMaterial | null = null
  let selectedMaterial: THREE.MeshStandardMaterial | null = null
  let materialsToDispose: THREE.Material[] = []
  let geometriesToDispose: THREE.BufferGeometry[] = []
  let disposed = false
  let completed = false
  let releaseAt = Number.POSITIVE_INFINITY
  let selected: ShakingStick | null = null
  let selectedAligned = false
  let pendingSign = props.selectedSign ?? null
  let rafId: number | null = null
  let startedAt = 0
  let previousElapsed = 0
  let resizeObserver: ResizeObserver | null = null
  const identityQuaternion = new CANNON.Quaternion()

  resizeObserver = new ResizeObserver(() => {
    if (disposed || !root.clientWidth || !root.clientHeight) return
    camera.aspect = root.clientWidth / root.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(root.clientWidth, root.clientHeight)
    renderer.render(scene, camera)
  })
  resizeObserver.observe(root)

  function syncMesh(mesh: THREE.Mesh, body: CANNON.Body) {
    mesh.position.set(body.position.x, body.position.y, body.position.z)
    mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
  }

  function visibleStickCount() {
    return Math.min(props.theme.signCount, Math.max(9, Math.min(24, props.theme.signCount)))
  }

  function createSticks(template: { geometry: THREE.BufferGeometry }, tubeMaterial: THREE.MeshStandardMaterial) {
    const count = visibleStickCount()
    stickMaterial = tubeMaterial.clone()
    stickMaterial.color.set(props.theme.stickColor)
    stickMaterial.roughness = props.theme.style === 'bamboo' ? 0.62 : 0.52
    selectedMaterial = stickMaterial.clone()
    selectedMaterial.color.set(props.theme.accentColor)
    selectedMaterial.emissive.set(props.theme.accentColor)
    selectedMaterial.emissiveIntensity = 0.08

    for (let index = 0; index < count; index += 1) {
      const mesh = new THREE.Mesh(template.geometry, stickMaterial)
      mesh.castShadow = true
      scene.add(mesh)

      const body = new CANNON.Body({
        mass: 0.055,
        material: stickPhysics,
        linearDamping: 0.24,
        angularDamping: 0.42,
        allowSleep: false,
      })
      body.addShape(new CANNON.Cylinder(0.042, 0.042, 1.72, 10))
      const ring = index % 3
      const angle = (index / count) * Math.PI * 2 + ring * 0.3
      const radius = ring === 0 ? 0.015 : 0.16 + (ring - 1) * 0.12 + Math.random() * 0.035
      body.position.set(Math.cos(angle) * radius, 0.87 + Math.random() * 0.07, Math.sin(angle) * radius)
      body.quaternion.set(0, 0, 0, 1)
      world.addBody(body)
      sticks.push({ mesh, body })
      syncMesh(mesh, body)
    }
  }

  function constrainToTube(body: CANNON.Body, allowRelease: boolean) {
    const bottom = 0.98
    const ceiling = 1.58
    if (body.position.y < bottom) {
      body.position.y = bottom
      body.velocity.y = Math.max(body.velocity.y, 0.2)
    }
    if (!allowRelease && body.position.y + 0.86 > ceiling) {
      body.position.y = ceiling - 0.86
      body.velocity.y = Math.min(body.velocity.y, -0.2)
    }

    const radial = Math.sqrt(body.position.x ** 2 + body.position.z ** 2)
    const limit = 0.28
    if (radial > limit) {
      const scale = limit / radial
      body.position.x *= scale
      body.position.z *= scale
      body.velocity.x *= -0.24
      body.velocity.z *= -0.24
    }
  }

  function shakeSticks(elapsed: number) {
    const impulsePhase = Math.floor(elapsed * 11)
    sticks.forEach((stick, index) => {
      if (index % 3 !== impulsePhase % 3) return
      const strength = 2.1 + Math.random() * 2.4
      stick.body.applyImpulse(new CANNON.Vec3(
        (Math.random() - 0.5) * strength,
        0.8 + Math.random() * 1.5,
        (Math.random() - 0.5) * strength,
      ))
      stick.body.angularVelocity.set(
        (Math.random() - 0.5) * 2.2,
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 2.2,
      )
      stick.body.wakeUp()
    })
  }

  function chooseSelected() {
    const count = sticks.length
    const sign = pendingSign && pendingSign > 0 ? pendingSign : Math.floor(Math.random() * props.theme.signCount) + 1
    selected = sticks[(sign - 1) % count]!
    if (selected.mesh.material !== selectedMaterial) selected.mesh.material = selectedMaterial!
    releaseAt = performance.now()
  }

  function releaseSelected() {
    if (!selected) return
    sticks.forEach((stick) => {
      if (stick === selected) return
      stick.body.velocity.scale(0.08, stick.body.velocity)
      stick.body.angularVelocity.scale(0.08, stick.body.angularVelocity)
    })
    selected.body.velocity.set((Math.random() - 0.5) * 0.12, 5.3, (Math.random() - 0.5) * 0.12)
    selected.body.angularVelocity.set((Math.random() - 0.5) * 3, 0.4, (Math.random() - 0.5) * 3)
    selected.body.wakeUp()
  }

  function alignSelected() {
    if (!selected || selectedAligned) return
    if (selected.body.position.y < 1.68) return
    selected.body.position.set(0, 1.82, 0)
    selected.body.quaternion.copy(identityQuaternion)
    selected.body.velocity.set(0, 0, 0)
    selected.body.angularVelocity.set(0, 0, 0)
    selectedAligned = true
  }

  function startShake() {
    if (disposed || sticks.length === 0 || completed) return
    selected = null
    selectedAligned = false
    releaseAt = Number.POSITIVE_INFINITY
    startedAt = performance.now()
    previousElapsed = 0
    state.value = 'running'
    rafId = requestAnimationFrame(frame)
  }

  function finish() {
    if (completed) return
    completed = true
    state.value = 'settled'
    renderer.render(scene, camera)
    emit('complete')
  }

  function frame(now: number) {
    if (disposed) return
    const elapsed = (now - startedAt) / 1000
    const dt = Math.min(elapsed - previousElapsed, 1 / 30)
    previousElapsed = elapsed
    const duration = Math.max(1, Math.min(props.duration ?? 2600, 4200) / 1000)

    if (releaseAt === Number.POSITIVE_INFINITY && elapsed >= duration * 0.56) {
      chooseSelected()
      releaseSelected()
    }
    if (releaseAt !== Number.POSITIVE_INFINITY) alignSelected()

    if (releaseAt === Number.POSITIVE_INFINITY) {
      shakeSticks(elapsed)
      const tube = tubeRoot
      if (tube) {
        tube.position.x = Math.sin(elapsed * 23) * 0.065
        tube.rotation.z = Math.sin(elapsed * 17) * 0.07
      }
    }
    else if (tubeRoot) {
      const settle = Math.min(1, dt * 9)
      tubeRoot.position.x *= 1 - settle
      tubeRoot.rotation.z *= 1 - settle
    }

    sticks.forEach(({ mesh, body }) => constrainToTube(body, body === selected?.body))
    world.step(1 / 120, dt, 5)
    sticks.forEach(({ mesh, body }) => {
      if (body !== selected?.body) {
        const quaternion = body.quaternion
        quaternion.x *= 0.55
        quaternion.y *= 0.9
        quaternion.z *= 0.55
        quaternion.normalize()
      }
      syncMesh(mesh, body)
    })

    renderer.render(scene, camera)
    const selectedReleased = releaseAt !== Number.POSITIVE_INFINITY
    if ((elapsed >= duration && selectedAligned) || (selectedReleased && elapsed >= duration + 0.55)) {
      finish()
      return
    }
    rafId = requestAnimationFrame(frame)
  }

  watch(() => props.selectedSign, (value) => {
    pendingSign = value ?? null
  }, { flush: 'post' })

  watch(() => props.trigger, () => {
    if (sticks.length > 0) startShake()
  }, { flush: 'post' })

  onBeforeUnmount(() => {
    disposed = true
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver?.disconnect()
    sticks.forEach(({ body }) => world.removeBody(body))
    materialsToDispose.forEach(material => material.dispose())
    geometriesToDispose.forEach(geometry => geometry.dispose())
    shadowGeometry.dispose()
    shadowMaterial.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  })

  try {
    const model = await loadModel()
    tubeRoot = model.tube.clone(true)
    tubeRoot.traverse((child) => {
      if (!isMesh(child)) return
      child.castShadow = true
      child.receiveShadow = true
      const source = firstMaterial(child) as THREE.MeshStandardMaterial
      const material = source.clone()
      material.color.set(child.name.startsWith('LotSeal') ? props.theme.accentColor : props.theme.tubeColor)
      material.roughness = props.theme.style === 'celestial' ? 0.38 : 0.48
      child.material = material
      materialsToDispose.push(material)
      if (child.name.startsWith('TubeBody') && material instanceof THREE.MeshStandardMaterial) tubeMaterial = material
    })
    scene.add(tubeRoot)

    if (!tubeMaterial) throw new Error('Lot tube GLB has no tube body material')
    stickGeometry = model.stick.geometry.clone()
    geometriesToDispose.push(stickGeometry)
    createSticks({ geometry: stickGeometry }, tubeMaterial)
    materialsToDispose.push(stickMaterial!, selectedMaterial!)
    geometriesToDispose = geometriesToDispose.filter(geometry => geometry !== model.stick.geometry)

    renderScene()
    startShake()
  }
  catch (error) {
    state.value = 'error'
    const message = error instanceof Error ? error.message : 'Unable to load the lot tube model'
    console.error('Unable to load the lot tube model', error)
    emit('error', message)
  }

  function renderScene() {
    renderer.render(scene, camera)
  }
})
</script>

<style scoped>
.lot-shake-scene {
  width: 100%;
  height: 100%;
}

@media (max-width: 640px) {
  .lot-shake-scene {
    height: 100%;
  }
}
</style>
