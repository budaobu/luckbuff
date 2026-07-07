 <template>
   <div ref="container" class="w-full h-full" />
 </template>

 <script setup lang="ts">
 import * as THREE from 'three'

 const container = ref<HTMLDivElement>()
 let rafId: number
 let renderer: THREE.WebGLRenderer | null = null
 let scene: THREE.Scene | null = null
 let camera: THREE.PerspectiveCamera | null = null

 onMounted(() => {
   if (!container.value) return
   initScene()
 })

 onUnmounted(() => {
   cancelAnimationFrame(rafId)
   window.removeEventListener('resize', onResize)
   renderer?.dispose()
 })

 function initScene() {
   const el = container.value!
   const width = el.clientWidth
   const height = el.clientHeight || 300

   scene = new THREE.Scene()
   scene.background = null

   camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
   camera.position.z = 8

   renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
   renderer.setSize(width, height)
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
   el.appendChild(renderer.domElement)

   // 中央核心：象征合盘后的 merged 命盘
   const coreGeo = new THREE.SphereGeometry(0.5, 32, 32)
   const coreMat = new THREE.MeshBasicMaterial({ color: 0xc9a227, transparent: true, opacity: 0.9 })
   const core = new THREE.Mesh(coreGeo, coreMat)
   scene.add(core)

   // 内层光晕
   const glowGeo = new THREE.SphereGeometry(0.75, 32, 32)
   const glowMat = new THREE.MeshBasicMaterial({ color: 0xc9a227, transparent: true, opacity: 0.12 })
   const glow = new THREE.Mesh(glowGeo, glowMat)
   scene.add(glow)

   // 两个轨道环：象征甲乙双方命盘
   const ringGeo = new THREE.TorusGeometry(2.2, 0.025, 16, 120)
   const ringMatA = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.45 })
   const ringMatB = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.45 })
   const ringA = new THREE.Mesh(ringGeo, ringMatA)
   const ringB = new THREE.Mesh(ringGeo, ringMatB)
   ringA.rotation.x = Math.PI / 3
   ringB.rotation.y = Math.PI / 3
   scene.add(ringA, ringB)

   // 粒子背景
   const particleCount = 180
   const positions = new Float32Array(particleCount * 3)
   for (let i = 0; i < particleCount; i++) {
     const r = 3 + Math.random() * 2
     const theta = Math.random() * Math.PI * 2
     const phi = Math.random() * Math.PI
     positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
     positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
     positions[i * 3 + 2] = r * Math.cos(phi)
   }
   const particleGeo = new THREE.BufferGeometry()
   particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
   const particleMat = new THREE.PointsMaterial({ color: 0xe8d5a8, size: 0.045, transparent: true, opacity: 0.6 })
   const particles = new THREE.Points(particleGeo, particleMat)
   scene.add(particles)

   const startTime = Date.now()

   const animate = () => {
     rafId = requestAnimationFrame(animate)
     const t = (Date.now() - startTime) * 0.001

     ringA.rotation.x += 0.004
     ringA.rotation.y += 0.007
     ringB.rotation.x -= 0.005
     ringB.rotation.y += 0.006

     particles.rotation.y += 0.001
     particles.rotation.x = Math.sin(t * 0.3) * 0.1

     const pulse = 1 + Math.sin(t * 2) * 0.12
     core.scale.setScalar(pulse)
     glow.scale.setScalar(pulse * 1.3)

     // 镜头轻微摇摆
     if (camera) {
       camera.position.x = Math.sin(t * 0.4) * 0.3
       camera.position.y = Math.cos(t * 0.3) * 0.2
       camera.lookAt(0, 0, 0)
     }

     renderer?.render(scene!, camera!)
   }
   animate()

   window.addEventListener('resize', onResize)
 }

 function onResize() {
   if (!container.value || !camera || !renderer) return
   const width = container.value.clientWidth
   const height = container.value.clientHeight || 300
   camera.aspect = width / height
   camera.updateProjectionMatrix()
   renderer.setSize(width, height)
 }
 </script>
