import * as THREE from 'three'

function roundedObject(geometry: THREE.BufferGeometry, material: THREE.Material) {
  geometry.computeVertexNormals()
  return new THREE.Mesh(geometry, material)
}

export function makeDeskTeapot(THREE: typeof import('three'), ceramic: THREE.Material, lidMaterial: THREE.Material) {
  const teapot = new THREE.Group()
  const profile = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.028, 0),
    new THREE.Vector2(0.054, 0.012),
    new THREE.Vector2(0.079, 0.038),
    new THREE.Vector2(0.088, 0.07),
    new THREE.Vector2(0.083, 0.104),
    new THREE.Vector2(0.065, 0.123),
    new THREE.Vector2(0.052, 0.128),
  ]
  const body = roundedObject(new THREE.LatheGeometry(profile, 42), ceramic)
  const foot = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.006, 8, 32), ceramic)
  foot.rotation.x = Math.PI / 2
  foot.position.y = 0.003
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.037, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidMaterial)
  lid.position.y = 0.126
  lid.scale.set(1.18, 0.72, 1.18)
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), lidMaterial)
  knob.position.y = 0.152
  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.058, 0.072, 0),
    new THREE.Vector3(0.088, 0.083, 0.004),
    new THREE.Vector3(0.109, 0.104, 0.006),
    new THREE.Vector3(0.122, 0.124, 0.008),
  ])
  const spout = new THREE.Mesh(new THREE.TubeGeometry(spoutCurve, 26, 0.012, 12), ceramic)
  const spoutTip = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.003, 8, 20), ceramic)
  spoutTip.name = 'bazi-room-teapot-spout-tip'
  spoutTip.position.set(0.122, 0.124, 0.008)
  spoutTip.rotation.set(0, Math.PI / 2, -0.25)
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.062, 0.095, 0),
    new THREE.Vector3(-0.096, 0.125, 0),
    new THREE.Vector3(-0.099, 0.155, 0),
    new THREE.Vector3(-0.073, 0.171, 0),
  ])
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 26, 0.0075, 10), lidMaterial)
  const handleMountA = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 10), lidMaterial)
  handleMountA.position.set(-0.062, 0.095, 0)
  const handleMountB = handleMountA.clone()
  handleMountB.position.set(-0.073, 0.171, 0)
  teapot.add(body, foot, lid, knob, spout, spoutTip, handle, handleMountA, handleMountB)
  teapot.rotation.y = Math.PI / 2.35
  return teapot
}

export function makeDeskCup(THREE: typeof import('three'), ceramic: THREE.Material, teaMaterial: THREE.Material) {
  const cup = new THREE.Group()
  const profile = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.021, 0),
    new THREE.Vector2(0.023, 0.005),
    new THREE.Vector2(0.026, 0.026),
    new THREE.Vector2(0.033, 0.042),
    new THREE.Vector2(0.036, 0.048),
    new THREE.Vector2(0.031, 0.05),
  ]
  const body = roundedObject(new THREE.LatheGeometry(profile, 32), ceramic)
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.025, 0.008, 24), teaMaterial)
  tea.position.y = 0.041
  const steam = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.09, 4, 8), new THREE.MeshStandardMaterial({ color: 0xdceaf8, transparent: true, opacity: 0, roughness: 1 }))
  steam.position.y = 0.114
  cup.add(body, tea, steam)
  return { cup, tea, steam }
}

export function makeBrush(handleMaterial: THREE.Material, ferruleMaterial: THREE.Material, bristleMaterial: THREE.Material) {
  const brush = new THREE.Group()
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.0065, 0.13, 4, 12), handleMaterial)
  handle.position.y = 0.1
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.0095, 0.026, 14), ferruleMaterial)
  ferrule.position.y = 0.021
  const bristle = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.043, 16), bristleMaterial)
  bristle.position.y = -0.008
  brush.add(handle, ferrule, bristle)
  return brush
}

export function makeBrushRack(material: THREE.Material, brushes: THREE.Group[]) {
  const rack = new THREE.Group()
  const base = roundedObject(bevelBoxGeometry(bevelBoxDimensions(0.19, 0.017, 0.07, 0.005)), material)
  base.rotation.x = Math.PI / 2
  base.position.y = 0.009
  ;[-1, 1].forEach((side) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.055, 0.01, 0.02),
      new THREE.Vector3(side * 0.075, 0.052, 0),
      new THREE.Vector3(side * 0.055, 0.086, -0.018),
    ])
    const support = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.006, 10), material)
    rack.add(support)
  })
  brushes.forEach((brush, index) => {
    brush.rotation.set(1.52, 0, index === 0 ? 0.04 : -0.05)
    brush.position.set(index === 0 ? -0.012 : 0.014, 0.078, index === 0 ? -0.006 : 0.003)
    rack.add(brush)
  })
  rack.add(base)
  return rack
}

function bevelBoxDimensions(width: number, height: number, depth: number, radius: number) {
  return { width, height, depth, radius }
}

function bevelBoxGeometry({ width, height, depth, radius }: { width: number, height: number, depth: number, radius: number }) {
  const shape = new THREE.Shape()
  const x = width / 2
  const y = height / 2
  shape.moveTo(-x + radius, -y)
  shape.lineTo(x - radius, -y)
  shape.quadraticCurveTo(x, -y, x, -y + radius)
  shape.lineTo(x, y - radius)
  shape.quadraticCurveTo(x, y, x - radius, y)
  shape.lineTo(-x + radius, y)
  shape.quadraticCurveTo(-x, y, -x, y - radius)
  shape.lineTo(-x, -y + radius)
  shape.quadraticCurveTo(-x, -y, -x + radius, -y)
  return new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(depth - radius * 2, 0.002),
    bevelEnabled: true,
    bevelThickness: radius,
    bevelSize: radius,
    bevelSegments: 3,
    curveSegments: 8,
  })
}

export function makeCoin(material: THREE.Material) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, 0.036, 0, Math.PI * 2)
  const hole = new THREE.Path()
  hole.moveTo(-0.009, -0.009)
  hole.lineTo(0.009, -0.009)
  hole.lineTo(0.009, 0.009)
  hole.lineTo(-0.009, 0.009)
  hole.closePath()
  shape.holes.push(hole)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.004,
    bevelEnabled: true,
    bevelThickness: 0.001,
    bevelSize: 0.001,
    bevelSegments: 2,
    curveSegments: 32,
  })
  geometry.center()
  return new THREE.Mesh(geometry, material)
}

export function makePaperweight(material: THREE.Material, accent: THREE.Material) {
  const paperweight = new THREE.Group()
  const bar = roundedObject(bevelBoxGeometry(bevelBoxDimensions(0.19, 0.03, 0.052, 0.008)), material)
  bar.rotation.x = Math.PI / 2
  bar.position.y = 0.015
  const inlay = roundedObject(bevelBoxGeometry(bevelBoxDimensions(0.075, 0.013, 0.022, 0.003)), accent)
  inlay.rotation.x = Math.PI / 2
  inlay.position.y = 0.032
  paperweight.add(bar, inlay)
  return paperweight
}

export function makeSeal(body: THREE.Material, face: THREE.Material) {
  const seal = new THREE.Group()
  const base = roundedObject(bevelBoxGeometry(bevelBoxDimensions(0.063, 0.052, 0.063, 0.005)), body)
  base.rotation.x = Math.PI / 2
  base.position.y = 0.026
  const knobCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.052, 0),
    new THREE.Vector3(0.014, 0.066, 0),
    new THREE.Vector3(0.006, 0.084, 0),
    new THREE.Vector3(0, 0.086, 0),
  ])
  const knob = new THREE.Mesh(new THREE.TubeGeometry(knobCurve, 20, 0.008, 10), body)
  const stampFace = new THREE.Mesh(new THREE.CircleGeometry(0.024, 24), face)
  stampFace.rotation.x = -Math.PI / 2
  stampFace.position.y = 0.001
  seal.add(base, knob, stampFace)
  return seal
}

export function makeInkstone(body: THREE.Material, ink: THREE.Material) {
  const inkstone = new THREE.Group()
  const stone = roundedObject(bevelBoxGeometry(bevelBoxDimensions(0.24, 0.046, 0.155, 0.012)), body)
  stone.rotation.x = Math.PI / 2
  stone.position.y = 0.023
  const pool = new THREE.Mesh(new THREE.SphereGeometry(0.049, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), ink)
  pool.rotation.x = Math.PI
  pool.scale.set(1, 0.28, 0.82)
  pool.position.set(-0.03, 0.047, 0)
  const grindingHill = new THREE.Mesh(new THREE.SphereGeometry(0.036, 20, 14), body)
  grindingHill.scale.set(1, 0.42, 0.72)
  grindingHill.position.set(0.062, 0.045, 0)
  inkstone.add(stone, pool, grindingHill)
  return inkstone
}
