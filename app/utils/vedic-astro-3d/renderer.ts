import type {
  VedicAstroDetailKind,
  VedicAstroMode,
  VedicAstroModel,
} from './model'
import {
  PLANET_COLORS,
  PLANET_CN,
  SIGN_CN,
} from './model'

export interface VedicAstro3DMount {
  dispose: () => void
  resetView: () => void
  switchMode: (mode: VedicAstroMode) => void
  setAutoRotate: (enabled: boolean) => void
}

export interface VedicAstro3DCallbacks {
  onSelect: (detail: { kind: VedicAstroDetailKind, key: string | number }) => void
  onHover: (payload: { text: string, x: number, y: number } | null) => void
  onReady?: () => void
  onError?: (message: string) => void
}

type Disposable = { dispose?: () => void }

function disposeTree(root: any) {
  root?.traverse?.((child: any) => {
    child.geometry?.dispose?.()
    const material = child.material
    if (Array.isArray(material)) {
      material.forEach(item => {
        item.map?.dispose?.()
        item.dispose?.()
      })
    }
    else {
      material?.map?.dispose?.()
      material?.dispose?.()
    }
  })
}

function fallbackThreeMount(callbacks: VedicAstro3DCallbacks): VedicAstro3DMount {
  callbacks.onError?.('当前设备不支持 WebGL 实时渲染')
  return {
    dispose: () => undefined,
    resetView: () => undefined,
    switchMode: () => undefined,
    setAutoRotate: () => undefined,
  }
}

export async function mountVedicAstro3D(
  root: HTMLElement,
  model: VedicAstroModel,
  callbacks: VedicAstro3DCallbacks,
): Promise<VedicAstro3DMount> {
  if (!root.clientWidth || !root.clientHeight) return fallbackThreeMount(callbacks)

  try {
    const THREE = await import('three')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
    const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js')
    const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js')
    const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js')

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(root.clientWidth, root.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    root.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x03040a, 0.018)

    const camera = new THREE.PerspectiveCamera(42, root.clientWidth / root.clientHeight, 0.1, 200)
    camera.position.set(0, 9, 23)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    controls.autoRotateSpeed = 0.45
    controls.minDistance = 10
    controls.maxDistance = 42
    controls.target.set(0, 1, 0)

    scene.add(new THREE.AmbientLight(0x334466, 0.9))
    const keyLight = new THREE.PointLight(0xe8b860, 120, 60)
    keyLight.position.set(8, 14, 10)
    scene.add(keyLight)
    const rimLight = new THREE.PointLight(0x4fd8ff, 80, 50)
    rimLight.position.set(-12, 6, -8)
    scene.add(rimLight)

    const starCount = 4500
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const radius = 45 + Math.random() * 70
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[(i * 3) + 1] = radius * Math.cos(phi) * 0.6
      starPositions[(i * 3) + 2] = radius * Math.sin(phi) * Math.sin(theta)
      const color = new THREE.Color().setHSL(0.58 + Math.random() * 0.08, 0.5, 0.55 + Math.random() * 0.4)
      starColors[i * 3] = color.r
      starColors[(i * 3) + 1] = color.g
      starColors[(i * 3) + 2] = color.b
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    const starMaterial = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    scene.add(new THREE.Points(starGeometry, starMaterial))

    const chartGroup = new THREE.Group()
    scene.add(chartGroup)

    function createZodiacRing(radius: number, color: number, opacity = 0.35, segments = 128) {
      const points = []
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      })
      return new THREE.Line(geometry, material)
    }
    chartGroup.add(createZodiacRing(7.2, 0xe8b860, 0.5))
    chartGroup.add(createZodiacRing(6.8, 0xe8b860, 0.22))
    chartGroup.add(createZodiacRing(4.2, 0x4fd8ff, 0.18))
    chartGroup.add(createZodiacRing(1.6, 0xa78bfa, 0.25))

    const signMeshes: import('three').Mesh[] = []
    for (let i = 0; i < 12; i++) {
      const start = ((i * 30) - 90) * Math.PI / 180
      const end = (((i + 1) * 30) - 90) * Math.PI / 180
      const shape = new THREE.Shape()
      shape.absarc(0, 0, 7.0, start, end, false)
      shape.absarc(0, 0, 5.4, end, start, true)
      const geometry = new THREE.ShapeGeometry(shape, 32)
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xe8b860 : 0x4fd8ff,
        transparent: true,
        opacity: 0.045,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = -Math.PI / 2
      mesh.userData = { sign: i, isSignSector: true }
      chartGroup.add(mesh)
      signMeshes.push(mesh)

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(start) * 5.4, 0, Math.sin(start) * 5.4),
        new THREE.Vector3(Math.cos(start) * 7.2, 0, Math.sin(start) * 7.2),
      ])
      chartGroup.add(new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0xe8b860, transparent: true, opacity: 0.25 }),
      ))
    }

    function createTextSprite(text: string, color: string, width = 128, height = 64, fontSize = 26) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (context) {
        context.font = `600 ${fontSize}px "PingFang SC","Microsoft YaHei",sans-serif`
        context.fillStyle = color
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(text, width / 2, height / 2)
      }
      const texture = new THREE.CanvasTexture(canvas)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
      }))
      sprite.scale.set(width / 92, height / 92, 1)
      return sprite
    }

    for (let i = 0; i < 12; i++) {
      const angle = (((i * 30) - 90) + 15) * Math.PI / 180
      const sprite = createTextSprite(SIGN_CN[i] || '', '#e8b860')
      sprite.position.set(Math.cos(angle) * 8.15, 0.05, Math.sin(angle) * 8.15)
      chartGroup.add(sprite)
    }

    const planetMeshes: Record<string, {
      group: import('three').Group
      sphere: import('three').Mesh
      hit: import('three').Mesh
      sign: number
      baseY: number
    }> = {}
    const planetLabels: Record<string, import('three').Sprite> = {}

    function clearPlanets() {
      for (const item of Object.values(planetMeshes)) {
        disposeTree(item.group)
        chartGroup.remove(item.group)
      }
      for (const label of Object.values(planetLabels)) {
        label.material.map?.dispose()
        label.material.dispose()
        chartGroup.remove(label)
      }
      for (const key of Object.keys(planetMeshes)) delete planetMeshes[key]
      for (const key of Object.keys(planetLabels)) delete planetLabels[key]
    }

    function createPlanetMesh(colorHex: number) {
      const group = new THREE.Group()
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 32, 32),
        new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.55,
          roughness: 0.35,
          metalness: 0.4,
        }),
      )
      group.add(sphere)
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.78, 16, 16),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      )
      group.add(hit)
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 5.5, 4),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
        }),
      )
      beam.position.y = 2.75
      group.add(beam)
      return { group, sphere, hit }
    }

    function placePlanets(signs: Record<string, number>) {
      clearPlanets()
      const grouped: Record<number, string[]> = {}
      for (const [planet, sign] of Object.entries(signs)) {
        ;(grouped[sign] ||= []).push(planet)
      }
      for (const [signText, planets] of Object.entries(grouped)) {
        const sign = Number(signText)
        const baseAngle = (((sign * 30) - 90) + 15) * Math.PI / 180
        planets.forEach((planet, index) => {
          const count = planets.length
          const spread = count > 1 ? (index - ((count - 1) / 2)) * 0.32 : 0
          const angle = baseAngle + spread
          const radius = 6.0 + (index % 2) * 0.55
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          const y = 1.4 + (index % 3) * 0.45
          const { group, sphere, hit } = createPlanetMesh(PLANET_COLORS[planet] || 0xffffff)
          group.position.set(x, y, z)
          group.userData = { planet, sign }
          chartGroup.add(group)
          planetMeshes[planet] = { group, sphere, hit, sign, baseY: y }

          const label = createTextSprite(
            PLANET_CN[planet] || planet,
            `#${new THREE.Color(PLANET_COLORS[planet] || 0xffffff).getHexString()}`,
            192,
            64,
            28,
          )
          label.material.opacity = 1
          label.scale.set(2.0, 0.68, 1)
          label.position.set(x, y + 1.1, z)
          label.userData = { planet, sign }
          chartGroup.add(label)
          planetLabels[planet] = label
        })
      }
    }

    const drishtiGroup = new THREE.Group()
    chartGroup.add(drishtiGroup)

    function rebuildDrishti(signs: Record<string, number>) {
      while (drishtiGroup.children.length) {
        const child = drishtiGroup.children[0] as import('three').Object3D
        disposeTree(child)
        drishtiGroup.remove(child)
      }
      for (const aspect of model.drishti) {
        const fromSign = signs[aspect.from]
        if (fromSign === undefined) continue
        const fromAngle = (((fromSign * 30) - 90) + 15) * Math.PI / 180
        const toAngle = (((aspect.toSign * 30) - 90) + 15) * Math.PI / 180
        const start = new THREE.Vector3(Math.cos(fromAngle) * 6.0, 1.8, Math.sin(fromAngle) * 6.0)
        const end = new THREE.Vector3(Math.cos(toAngle) * 6.0, 1.8, Math.sin(toAngle) * 6.0)
        const mid = start.clone().add(end).multiplyScalar(0.5)
        mid.y += 2.2 + Math.random() * 0.8
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40))
        const material = new THREE.LineBasicMaterial({
          color: aspect.strength === 1 ? 0xe8b860 : 0x4fd8ff,
          transparent: true,
          opacity: aspect.strength === 1 ? 0.32 : 0.18,
          blending: THREE.AdditiveBlending,
        })
        drishtiGroup.add(new THREE.Line(geometry, material))
      }
    }

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(root.clientWidth, root.clientHeight),
      0.65,
      0.5,
      0.85,
    )
    composer.addPass(bloom)

    let currentMode: VedicAstroMode = 'd1'
    let pulsePlanet: string | null = null
    function planetTooltip(planet: string, sign: number) {
      const data = model.planetMap[planet]
      const suffix = currentMode === 'd1' && data
        ? `　${data.nakshatra} · 第${data.pada}分度`
        : `　第${vargaMapFor(currentMode)?.ascendantHouse(sign) || 1}宫`
      return `<b style="color:#${new THREE.Color(PLANET_COLORS[planet] || 0xffffff).getHexString()}">${PLANET_CN[planet] || planet}</b>　${SIGN_CN[sign]}座${suffix}　<span style="color:#8a8fa8;font-size:10px">点击查看详情</span>`
    }

    function vargaMapFor(mode: VedicAstroMode) {
      const key = mode === 'd1' ? 'd1' : mode === 'd9' ? 'd9' : 'd10'
      const varga = model.vargaMap[key]
      if (!varga) return undefined
      return {
        ...varga,
        ascendantHouse: (sign: number) =>
          ((sign - varga.lagnaSign) % 12 + 12) % 12 + 1,
      }
    }

    function handlePointerMove(event: PointerEvent) {
      const bounds = renderer.domElement.getBoundingClientRect()
      const pointer = new THREE.Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(pointer, camera)

      const planetMeshList = Object.values(planetMeshes).flatMap(item => [item.hit, item.sphere])
      const planetHit = raycaster.intersectObjects(planetMeshList)[0]
      if (planetHit) {
        const userData = planetEventData(planetHit.object)
        if (userData.planet && userData.sign !== undefined) {
          callbacks.onHover({
            text: planetTooltip(userData.planet, userData.sign),
            x: event.clientX,
            y: event.clientY,
          })
          renderer.domElement.style.cursor = 'pointer'
          return
        }
      }

      const signHit = raycaster.intersectObjects(signMeshes)[0]
      if (signHit) {
        const sign = (signHit.object.userData as { sign?: number }).sign ?? 0
        const lagna = vargaMapFor(currentMode)?.lagnaSign ?? model.lagnaSign
        const house = ((sign - lagna) % 12 + 12) % 12 + 1
        callbacks.onHover({
          text: `第 ${house} 宫 · <b style="color:#e8b860">${SIGN_CN[sign]}座</b>　<span style="color:#8a8fa8;font-size:10px">点击查看详情</span>`,
          x: event.clientX,
          y: event.clientY,
        })
        renderer.domElement.style.cursor = 'pointer'
        return
      }

      callbacks.onHover(null)
      renderer.domElement.style.cursor = 'grab'
    }

    function handlePointerLeave() {
      callbacks.onHover(null)
    }

    let downInfo: { x: number, y: number, at: number } | null = null
    function handlePointerDown(event: PointerEvent) {
      downInfo = { x: event.clientX, y: event.clientY, at: Date.now() }
    }

    function planetEventData(object: import('three').Object3D) {
      const direct = object.userData as { planet?: string, sign?: number }
      if (direct.planet && direct.sign !== undefined) return direct
      return object.parent?.userData as { planet?: string, sign?: number }
    }

    function selectAtPointer(event: PointerEvent | MouseEvent) {
      const info = downInfo
      downInfo = null
      if (!info) return
      const dx = Math.abs(event.clientX - info.x)
      const dy = Math.abs(event.clientY - info.y)
      if (dx > 8 || dy > 8 || Date.now() - info.at > 400) return

      const bounds = renderer.domElement.getBoundingClientRect()
      const pointer = new THREE.Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(pointer, camera)
      const planetMeshList = Object.values(planetMeshes).flatMap(item => [item.hit, item.sphere])
      const planetHit = raycaster.intersectObjects(planetMeshList)[0]
      if (planetHit) {
        const planet = planetEventData(planetHit.object).planet
        if (planet) {
          pulsePlanet = planet
          callbacks.onSelect({ kind: 'planet', key: planet })
          return
        }
      }
      const signHit = raycaster.intersectObjects(signMeshes)[0]
      if (signHit) {
        const sign = (signHit.object.userData as { sign?: number }).sign
        if (sign !== undefined) {
          pulsePlanet = null
          callbacks.onSelect({ kind: 'house', key: sign })
        }
      }
    }

    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave)
    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointerup', selectAtPointer)
    renderer.domElement.addEventListener('click', selectAtPointer)

    const clock = new THREE.Clock()
    let elapsed = 0
    let disposed = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function frame() {
      if (disposed) return
      const delta = clock.getDelta()
      elapsed += reducedMotion ? 0 : 0.008
      Object.entries(planetMeshes).forEach(([name, planet], index) => {
        const y = planet.baseY + (reducedMotion ? 0 : Math.sin((elapsed * 1.4) + (index * 1.1)) * 0.22)
        planet.group.position.y = y
        if (!reducedMotion) planet.group.rotation.y += delta * 0.6
        planet.sphere.scale.setScalar(1 + (reducedMotion ? 0 : Math.sin((elapsed * 2) + index) * 0.06))
        const material = planet.sphere.material as import('three').MeshStandardMaterial
        material.emissiveIntensity = name === pulsePlanet
          ? 0.95 + Math.sin(elapsed * 4) * 0.35
          : 0.55
        const label = planetLabels[name]
        if (label) label.position.y = y + 1.1
      })
      signMeshes.forEach((mesh, index) => {
        const material = mesh.material as import('three').MeshBasicMaterial
        material.userData ||= { baseOpacity: material.opacity }
        const base = material.userData.baseOpacity as number
        material.opacity = reducedMotion ? base : base + Math.sin((elapsed * 1.2) + index) * 0.012
      })
      drishtiGroup.children.forEach((line, index) => {
        const material = (line as import('three').Line).material as import('three').LineBasicMaterial
        material.opacity = reducedMotion
          ? (index % 2 === 0 ? 0.28 : 0.18)
          : 0.16 + Math.sin((elapsed * 1.8) + (index * 0.7)) * 0.08
      })
      controls.update()
      composer.render()
    }

    function switchMode(mode: VedicAstroMode) {
      const data = mode === 'd1'
        ? { lagnaSign: model.lagnaSign, planetSigns: model.planetSigns }
        : mode === 'd9' ? model.vargaMap.d9 : model.vargaMap.d10
      if (!data) return
      currentMode = mode
      pulsePlanet = null
      placePlanets(data.planetSigns)
      rebuildDrishti(data.planetSigns)
      signMeshes.forEach((mesh, index) => {
        const material = mesh.material as import('three').MeshBasicMaterial
        material.userData ||= { baseOpacity: material.opacity }
        material.userData.baseOpacity = index === data.lagnaSign ? 0.16 : 0.045
        material.opacity = material.userData.baseOpacity
      })
    }

    const resizeObserver = new ResizeObserver(() => {
      const width = root.clientWidth
      const height = root.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      composer.setSize(width, height)
    })
    resizeObserver.observe(root)

    function dispose() {
      disposed = true
      resizeObserver.disconnect()
      renderer.setAnimationLoop(null)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave)
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointerup', selectAtPointer)
      renderer.domElement.removeEventListener('click', selectAtPointer)
      controls.dispose()
      disposeTree(scene)
      composer.dispose?.()
      renderer.domElement.remove()
      renderer.dispose()
    }

    placePlanets(model.planetSigns)
    rebuildDrishti(model.planetSigns)
    switchMode('d1')
    renderer.setAnimationLoop(frame)
    callbacks.onReady?.()

    return {
      dispose,
      resetView: () => {
        controls.autoRotate = !reducedMotion
        controls.target.set(0, 1, 0)
        camera.position.set(0, 9, 23)
      },
      switchMode,
      setAutoRotate: enabled => (controls.autoRotate = enabled && !reducedMotion),
    }
  }
  catch (error) {
    console.warn('[vedic-astro-3d] renderer failed', error)
    return fallbackThreeMount(callbacks)
  }
}
