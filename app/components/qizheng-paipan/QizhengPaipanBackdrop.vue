<template>
  <div class="backdrop" aria-hidden="true">
    <div class="fallback" :class="{ 'is-covered': !staticMode }" />
    <canvas v-show="!staticMode" ref="canvasRef" class="scene" />
  </div>
</template>

<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)
const staticMode = ref(true)
let cleanup: (() => void) | null = null

onBeforeUnmount(() => {
  cleanup?.()
  cleanup = null
})

onMounted(async () => {
  const canvas = canvasRef.value
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const smallViewport = window.matchMedia('(max-width: 820px)')
  const coarsePointer = window.matchMedia('(pointer: coarse)')
  const lowDevice = (navigator.hardwareConcurrency || 4) <= 4

  if (!canvas || reducedMotion.matches || smallViewport.matches || coarsePointer.matches || lowDevice) {
    staticMode.value = true
    return
  }

  try {
    const THREE = await import('three')
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100)
    camera.position.set(0, 0, 12)

    const starCount = 850
    const positions = new Float32Array(starCount * 3)
    for (let index = 0; index < starCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 42
      positions[(index * 3) + 1] = (Math.random() - 0.5) * 28
      positions[(index * 3) + 2] = (Math.random() - 0.5) * 28 - 6
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starMaterial = new THREE.PointsMaterial({
      color: 0xdfe8e0,
      size: 0.055,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const orbitGeometry = new THREE.TorusGeometry(7.8, 0.012, 3, 180)
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xd9b36a,
      transparent: true,
      opacity: 0.16,
    })
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
    orbit.rotation.set(Math.PI / 2.65, 0.2, 0)
    orbit.position.set(3.4, -1.5, -5)
    scene.add(orbit)

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth
      const height = canvas.clientHeight || window.innerHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    let frameId = 0
    let running = true
    const renderFrame = (elapsed: number) => {
      if (!running) return
      const seconds = elapsed * 0.001
      stars.rotation.y = seconds * 0.008
      orbit.rotation.z = seconds * 0.014
      camera.position.y = Math.sin(seconds * 0.07) * 0.22
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(renderFrame)
    }

    const handleVisibility = () => {
      if (document.hidden) {
        running = false
        window.cancelAnimationFrame(frameId)
        return
      }
      if (!running) {
        running = true
        frameId = window.requestAnimationFrame(renderFrame)
      }
    }

    staticMode.value = false
    resize()
    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    frameId = window.requestAnimationFrame(renderFrame)
    cleanup = () => {
      running = false
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      starGeometry.dispose()
      starMaterial.dispose()
      orbitGeometry.dispose()
      orbitMaterial.dispose()
      renderer.dispose()
    }
  }
  catch {
    staticMode.value = true
  }
})
</script>

<style scoped>
.backdrop {
  position: fixed;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(58rem 34rem at 72% 12%, rgba(76, 97, 138, 0.28), transparent 62%),
    radial-gradient(46rem 30rem at 18% 78%, rgba(52, 72, 108, 0.22), transparent 64%),
    radial-gradient(2px 2px at 18% 24%, rgba(223, 232, 224, 0.7), transparent 50%),
    radial-gradient(1px 1px at 38% 62%, rgba(223, 232, 224, 0.45), transparent 50%),
    radial-gradient(2px 2px at 74% 45%, rgba(217, 179, 106, 0.55), transparent 50%),
    radial-gradient(1px 1px at 83% 76%, rgba(223, 232, 224, 0.4), transparent 50%);
  opacity: 1;
  transition: opacity 480ms ease;
}

.fallback.is-covered {
  opacity: 0;
}

.scene {
  display: block;
  width: 100%;
  height: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .fallback {
    transition: none;
  }
}
</style>
