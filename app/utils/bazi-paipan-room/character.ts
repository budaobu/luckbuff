import * as THREE from 'three'

export type CharacterKind = 'keeper' | 'visitor'

export interface SoftArmRig {
  shoulder: THREE.Group
  elbow: THREE.Group
  wrist: THREE.Group
  hand: THREE.Group
}

export interface SoftLegRig {
  thigh: THREE.Group
  shin: THREE.Group
  foot: THREE.Group
}

export interface SoftCharacterRig {
  root: THREE.Group
  hips: THREE.Group
  spine: THREE.Group
  chest: THREE.Group
  neck: THREE.Group
  head: THREE.Group
  leftArm: SoftArmRig
  rightArm: SoftArmRig
  legs: SoftLegRig[]
}

interface CharacterOptions {
  kind: CharacterKind
  position: [number, number, number]
  rotationY: number
}

function makeSegment(
  THREE: typeof import('three'),
  radiusTop: number,
  radiusBottom: number,
  length: number,
  material: THREE.Material,
) {
  const segment = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 20, 1), material)
  segment.position.y = -length / 2
  const cap = new THREE.Mesh(new THREE.SphereGeometry(radiusBottom, 18, 14), material)
  cap.position.y = -length
  return { segment, cap }
}

function makeArm(
  THREE: typeof import('three'),
  side: -1 | 1,
  sleeveMaterial: THREE.Material,
  cuffMaterial: THREE.Material,
  skinMaterial: THREE.Material,
): SoftArmRig {
  const shoulder = new THREE.Group()
  shoulder.position.set(side * 0.272, 0.172, 0.015)
  const shoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.088, 20, 16), sleeveMaterial)
  shoulderPad.scale.set(1.02, 0.84, 0.95)
  shoulder.add(shoulderPad)

  const upper = makeSegment(THREE, 0.075, 0.069, 0.29, sleeveMaterial)
  shoulder.add(upper.segment, upper.cap)
  const elbow = new THREE.Group()
  elbow.position.y = -0.31
  shoulder.add(elbow)
  const elbowPad = new THREE.Mesh(new THREE.SphereGeometry(0.067, 18, 14), sleeveMaterial)
  elbow.add(elbowPad)
  const lower = makeSegment(THREE, 0.064, 0.052, 0.26, sleeveMaterial)
  elbow.add(lower.segment, lower.cap)
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.062, 0.07, 20), cuffMaterial)
  cuff.position.y = -0.255
  elbow.add(cuff)

  const wrist = new THREE.Group()
  wrist.position.y = -0.3
  elbow.add(wrist)
  const hand = new THREE.Group()
  hand.position.y = -0.012
  wrist.add(hand)
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.062, 18, 14), skinMaterial)
  palm.scale.set(0.92, 0.72, 1.24)
  palm.position.set(0, -0.015, 0.036)
  const fingers = new THREE.Mesh(new THREE.CapsuleGeometry(0.049, 0.036, 5, 14), skinMaterial)
  fingers.scale.set(0.92, 0.82, 0.94)
  fingers.position.set(0, -0.008, 0.104)
  fingers.rotation.x = 0.12
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.023, 0.03, 4, 10), skinMaterial)
  thumb.position.set(side * -0.055, -0.006, 0.043)
  thumb.rotation.set(0.18, 0, side * -0.62)
  hand.add(palm, fingers, thumb)
  return { shoulder, elbow, wrist, hand }
}

function makeLeg(
  THREE: typeof import('three'),
  side: -1 | 1,
  clothMaterial: THREE.Material,
  shoeMaterial: THREE.Material,
): SoftLegRig {
  const thigh = new THREE.Group()
  thigh.position.set(side * 0.17, 0, 0.02)
  const upper = makeSegment(THREE, 0.112, 0.088, 0.36, clothMaterial)
  thigh.add(upper.segment, upper.cap)
  const shin = new THREE.Group()
  shin.position.y = -0.37
  thigh.add(shin)
  const knee = new THREE.Mesh(new THREE.SphereGeometry(0.084, 18, 14), clothMaterial)
  shin.add(knee)
  const lower = makeSegment(THREE, 0.08, 0.058, 0.31, clothMaterial)
  shin.add(lower.segment, lower.cap)
  const ankle = new THREE.Group()
  ankle.position.y = -0.31
  shin.add(ankle)
  const shoeUpper = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 14), shoeMaterial)
  shoeUpper.scale.set(0.86, 0.72, 1.45)
  shoeUpper.position.set(0, -0.032, 0.038)
  const toe = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), shoeMaterial)
  toe.scale.set(0.9, 0.68, 1.18)
  toe.position.set(0, -0.05, 0.118)
  const sole = new THREE.Mesh(new THREE.BoxGeometry(0.122, 0.022, 0.216), new THREE.MeshStandardMaterial({ color: 0xdfd8cb, roughness: 0.45 }))
  sole.position.set(0, -0.085, 0.05)
  ankle.add(shoeUpper, toe, sole)
  return { thigh, shin, foot: ankle }
}

function makeHead(
  kind: CharacterKind,
  skinMaterial: THREE.Material,
): THREE.Group {
  const head = new THREE.Group()
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.215, 32, 24), skinMaterial)
  skull.scale.set(1, 1.07, 0.99)
  skull.position.y = 0.08
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.168, 28, 20), skinMaterial)
  jaw.scale.set(0.92, 0.78, 0.92)
  jaw.position.set(0, -0.005, 0.018)
  head.add(skull, jaw)

  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 0.16 })
  const irisMaterial = new THREE.MeshStandardMaterial({ color: kind === 'keeper' ? 0x352117 : 0x1c1613, roughness: 0.1 })
  const browMaterial = new THREE.MeshStandardMaterial({ color: kind === 'keeper' ? 0xe8e4d8 : 0x161210, roughness: 0.82 })
  ;[-1, 1].forEach((side) => {
    const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.046, 18, 14), eyeWhiteMaterial)
    eyeSocket.scale.set(1.08, 0.74, 0.46)
    eyeSocket.position.set(side * 0.078, 0.106, 0.197)
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.023, 16, 12), irisMaterial)
    iris.scale.set(1, 1.1, 0.54)
    iris.position.set(side * 0.077, 0.106, 0.226)
    const pupilHighlight = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08 }))
    pupilHighlight.position.set(side * 0.066, 0.117, 0.238)
    const lid = new THREE.Mesh(new THREE.CapsuleGeometry(0.043, 0.008, 4, 14), skinMaterial)
    lid.rotation.set(0, 0, side * 0.08)
    lid.position.set(side * 0.078, 0.15, 0.198)
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.06, 4, 10), browMaterial)
    brow.rotation.set(0.12, 0.14, side * 0.24)
    brow.position.set(side * 0.081, 0.184, 0.202)
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.047, 18, 14), skinMaterial)
    ear.scale.set(0.48, 1, 0.72)
    ear.position.set(side * 0.212, 0.065, -0.005)
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 12), new THREE.MeshStandardMaterial({ color: kind === 'keeper' ? 0xd68d6f : 0xd98d76, roughness: 0.82 }))
    cheek.scale.set(1, 0.66, 0.32)
    cheek.position.set(side * 0.122, 0.018, 0.17)
    head.add(eyeSocket, iris, pupilHighlight, lid, brow, ear, cheek)
  })

  const nose = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.038, 5, 14), skinMaterial)
  nose.rotation.x = Math.PI / 2.1
  nose.position.set(0, 0.05, 0.213)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 8, 18, Math.PI * 0.82), new THREE.MeshStandardMaterial({ color: 0x7d3830, roughness: 0.42 }))
  mouth.rotation.set(0, 0, Math.PI + Math.PI * 0.09)
  mouth.position.set(0, -0.031, 0.187)
  head.add(nose, mouth)

  if (kind === 'keeper') {
    const shavedMaterial = new THREE.MeshStandardMaterial({ color: 0xd7b493, roughness: 0.72 })
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.218, 30, 20, 0, Math.PI * 2, 0, Math.PI * 0.56), shavedMaterial)
    cap.position.y = 0.085
    const robeHat = new THREE.Mesh(new THREE.SphereGeometry(0.225, 30, 20, 0, Math.PI * 2, 0, Math.PI * 0.35), new THREE.MeshStandardMaterial({ color: 0xd2a759, roughness: 0.5, metalness: 0.12 }))
    robeHat.position.y = 0.168
    robeHat.scale.y = 0.78
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.029, 16, 12), new THREE.MeshStandardMaterial({ color: 0xc89447, roughness: 0.28, metalness: 0.58 }))
    bead.position.y = 0.316
    head.add(cap, robeHat, bead)
  }
  else {
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x171210, roughness: 0.88 })
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.226, 30, 22), hairMaterial)
    hair.scale.set(1.03, 1.06, 1.01)
    hair.position.set(0, 0.098, -0.019)
    const fringe = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.09, 4, 16), hairMaterial)
    fringe.rotation.x = 0.9
    fringe.position.set(0, 0.212, 0.149)
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.076, 20, 16), hairMaterial)
    bun.position.set(0, 0.282, -0.078)
    const hairTie = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.009, 8, 18), new THREE.MeshStandardMaterial({ color: 0xa85335, roughness: 0.55 }))
    hairTie.rotation.x = Math.PI / 2.4
    hairTie.position.set(0, 0.23, -0.085)
    head.add(hair, fringe, bun, hairTie)
  }
  return head
}

export function makeSoftCharacter(THREE: typeof import('three'), options: CharacterOptions): SoftCharacterRig {
  const root = new THREE.Group()
  root.position.set(...options.position)
  root.rotation.y = options.rotationY
  root.scale.setScalar(0.94)
  root.userData.roomRole = options.kind

  const skin = new THREE.MeshStandardMaterial({
    color: options.kind === 'keeper' ? 0xd9b396 : 0xe3bf9d,
    roughness: 0.58,
  })
  const primary = new THREE.MeshStandardMaterial({
    color: options.kind === 'keeper' ? 0x2d5c54 : 0xc9702f,
    roughness: 0.78,
  })
  const secondary = new THREE.MeshStandardMaterial({
    color: options.kind === 'keeper' ? 0x263f3c : 0x9a5326,
    roughness: 0.8,
  })
  const cuff = new THREE.MeshStandardMaterial({
    color: options.kind === 'keeper' ? 0xe6dcb8 : 0x86411e,
    roughness: 0.7,
  })
  const trim = new THREE.MeshStandardMaterial({
    color: options.kind === 'keeper' ? 0xc9a764 : 0xd7b070,
    roughness: 0.36,
    metalness: 0.14,
  })

  const hips = new THREE.Group()
  hips.position.y = 0.72
  root.add(hips)
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.225, 26, 20), secondary)
  pelvis.scale.set(1.02, 0.73, 0.82)
  pelvis.position.y = 0.015
  const seatCushion = new THREE.Mesh(new THREE.SphereGeometry(0.217, 26, 18), primary)
  seatCushion.scale.set(1.05, 0.54, 0.86)
  seatCushion.position.set(0, -0.05, -0.005)
  hips.add(pelvis, seatCushion)

  const spine = new THREE.Group()
  spine.position.y = 0.12
  spine.rotation.x = 0.1
  hips.add(spine)
  const waist = new THREE.Mesh(new THREE.CapsuleGeometry(0.192, 0.13, 6, 24), secondary)
  waist.scale.set(1.06, 1, 0.82)
  waist.position.y = 0.08
  spine.add(waist)

  const chest = new THREE.Group()
  chest.position.y = 0.34
  spine.add(chest)
  const chestProfile = [
    new THREE.Vector2(0.001, -0.12),
    new THREE.Vector2(0.215, -0.1),
    new THREE.Vector2(0.254, 0.04),
    new THREE.Vector2(0.25, 0.17),
    new THREE.Vector2(0.19, 0.26),
    new THREE.Vector2(0.028, 0.28),
  ]
  const torso = new THREE.Mesh(new THREE.LatheGeometry(chestProfile, 30), primary)
  torso.scale.z = 0.78
  torso.position.y = 0.05
  const robeFront = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.36, 0.028), trim)
  robeFront.position.set(0.038, 0.085, 0.194)
  robeFront.rotation.z = 0.035
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.025, 8, 26), trim)
  collar.rotation.x = Math.PI / 2
  collar.position.y = 0.285
  const neckBone = new THREE.Group()
  neckBone.position.y = 0.275
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.07, 0.14, 16), skin)
  neckMesh.position.y = 0.05
  neckBone.add(neckMesh)
  const neck = new THREE.Group()
  neck.position.y = 0.1
  const headGroup = makeHead(options.kind, skin)
  neck.add(headGroup)
  neckBone.add(neck)
  chest.add(torso, robeFront, collar, neckBone)
  const backShell = new THREE.Mesh(new THREE.SphereGeometry(0.199, 28, 22), primary)
  backShell.scale.set(1.02, 1.24, 0.64)
  backShell.position.set(0, 0.062, -0.042)
  chest.add(backShell)

  if (options.kind === 'keeper') {
    const prayerBeads = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.018, 8, 28), new THREE.MeshStandardMaterial({ color: 0x815033, roughness: 0.58 }))
    prayerBeads.rotation.set(0.78, 0, 0.22)
    prayerBeads.position.set(-0.09, 0.08, 0.152)
    chest.add(prayerBeads)
  }

  const leftArm = makeArm(THREE, -1, primary, cuff, skin)
  const rightArm = makeArm(THREE, 1, primary, cuff, skin)
  chest.add(leftArm.shoulder, rightArm.shoulder)

  const legCloth = options.kind === 'keeper'
    ? secondary
    : new THREE.MeshStandardMaterial({ color: 0x3d5677, roughness: 0.76 })
  const shoe = options.kind === 'keeper'
    ? new THREE.MeshStandardMaterial({ color: 0x24170f, roughness: 0.44 })
    : new THREE.MeshStandardMaterial({ color: 0xf0f2f5, roughness: 0.44 })
  const legs = [makeLeg(THREE, -1, legCloth, shoe), makeLeg(THREE, 1, legCloth, shoe)]
  legs.forEach(leg => hips.add(leg.thigh))

  return { root, hips, spine, chest, neck, head: headGroup, leftArm, rightArm, legs }
}

export function restSittingPose(rig: SoftCharacterRig) {
  rig.hips.rotation.set(0, 0, 0)
  rig.spine.rotation.set(0.11, 0, 0)
  rig.chest.rotation.set(0.035, 0, 0)
  rig.neck.rotation.set(-0.035, 0, 0)
  rig.legs.forEach((leg) => {
    leg.thigh.rotation.set(-1.34, 0, leg.thigh.position.x < 0 ? -0.045 : 0.045)
    leg.shin.rotation.set(1.28, 0, 0)
    leg.foot.rotation.set(0.08, 0, 0)
  })
  rig.leftArm.shoulder.rotation.set(-0.42, 0, 0.08)
  rig.leftArm.elbow.rotation.set(-0.34, 0, 0.03)
  rig.leftArm.wrist.rotation.set(-0.16, 0, 0)
  rig.rightArm.shoulder.rotation.set(-0.38, 0, -0.08)
  rig.rightArm.elbow.rotation.set(-0.32, 0, -0.03)
  rig.rightArm.wrist.rotation.set(-0.14, 0, 0)
}
