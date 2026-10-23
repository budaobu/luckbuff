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

function currentTheme() {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

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
    let isLightTheme = currentTheme() === 'light'

    const starCount = 850
    const positions = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    const alphas = new Float32Array(starCount)
    for (let index = 0; index < starCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 42
      positions[(index * 3) + 1] = (Math.random() - 0.5) * 28
      positions[(index * 3) + 2] = -8 - Math.random() * 14
      sizes[index] = 0.16 + Math.random() * Math.random() * 0.32
      alphas[index] = 0.38 + Math.random() * 0.42
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    starGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
    const starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(isLightTheme ? 0x3b352a : 0xf7f4ea) },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = aSize * uPixelRatio * (240.0 / max(1.0, -mvPosition.z));
          vAlpha = aAlpha;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          float pointDistance = length(gl_PointCoord - vec2(0.5));
          float alpha = (1.0 - smoothstep(0.28, 0.5, pointDistance)) * vAlpha;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const applyTheme = () => {
      isLightTheme = currentTheme() === 'light'
      starMaterial.blending = isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending
      starMaterial.uniforms.uColor!.value.set(isLightTheme ? 0x3b352a : 0xf7f4ea)
      starMaterial.needsUpdate = true
      orbitMaterial.opacity = isLightTheme ? 0.12 : 0.22
    }

    const orbitGeometry = new THREE.TorusGeometry(7.8, 0.012, 3, 180)
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xd9b36a,
      transparent: true,
      opacity: isLightTheme ? 0.12 : 0.22,
    })
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
    orbit.rotation.set(Math.PI / 2.65, 0.2, 0)
    orbit.position.set(3.4, -1.5, -5)
    scene.add(orbit)

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth
      const height = canvas.clientHeight || window.innerHeight
      renderer.setSize(width, height, false)
      starMaterial.uniforms.uPixelRatio!.value = renderer.getPixelRatio()
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
    applyTheme()
    resize()
    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributeFilter: ['class'] })
    frameId = window.requestAnimationFrame(renderFrame)
    cleanup = () => {
      running = false
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      themeObserver.disconnect()
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
    radial-gradient(58rem 34rem at 72% 12%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 62%),
    radial-gradient(46rem 30rem at 18% 78%, color-mix(in srgb, var(--accent-purple) 6%, transparent), transparent 64%),
    radial-gradient(2px 2px at 18% 24%, color-mix(in srgb, var(--text-muted) 52%, transparent), transparent 50%),
    radial-gradient(1px 1px at 38% 62%, color-mix(in srgb, var(--text-muted) 34%, transparent), transparent 50%),
    radial-gradient(2px 2px at 74% 45%, color-mix(in srgb, var(--accent) 38%, transparent), transparent 50%),
    radial-gradient(1px 1px at 83% 76%, color-mix(in srgb, var(--text-muted) 28%, transparent), transparent 50%);
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
