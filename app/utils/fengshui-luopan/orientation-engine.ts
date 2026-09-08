import { HeadingFilter, normalizeDegrees } from './heading'
import type { LuopanSample } from '~/types/fengshui-luopan'

interface OrientationPayload {
  alpha: number | null
  beta: number | null
  gamma: number | null
  absolute?: boolean
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

function screenRotationAngle() {
  const orientation = window.screen?.orientation
  if (orientation && typeof orientation.angle === 'number') return orientation.angle
  const legacyAngle = window.orientation
  return typeof legacyAngle === 'number' ? normalizeDegrees(legacyAngle) : 0
}

function tiltCompensatedHeading(alpha: number, beta: number, gamma: number) {
  const alphaRad = alpha * Math.PI / 180
  const betaRad = beta * Math.PI / 180
  const gammaRad = gamma * Math.PI / 180

  // ZXY device-orientation projection of the viewport-top vector. Browser alpha is
  // counter-clockwise; magnetic heading is clockwise from north.
  const y = Math.cos(gammaRad) * Math.sin(alphaRad) - Math.sin(betaRad) * Math.sin(gammaRad) * Math.cos(alphaRad)
  const x = Math.cos(betaRad) * Math.cos(alphaRad)
  return normalizeDegrees(360 - Math.atan2(y, x) * 180 / Math.PI)
}

export class OrientationEngine {
  private filter = new HeadingFilter()
  private handlers: Array<() => void> = []
  private latest: LuopanSample | null = null
  private hadValidSample = false

  get validSampleReceived() {
    return this.hadValidSample
  }

  start(onSample: (sample: LuopanSample) => void) {
    this.stop()
    this.hadValidSample = false
    this.filter.reset()

    let motionBeta = 0
    let motionGamma = 0
    let hasMotion = false

    const emit = (raw: number, accuracy: number | null, absolute: boolean, beta: number, gamma: number) => {
      if (!Number.isFinite(raw)) return
      const screenAngle = screenRotationAngle()
      const heading = this.filter.filter(raw - screenAngle, Date.now())
      const sample: LuopanSample = {
        heading,
        accuracy,
        absolute,
        beta: Number.isFinite(beta) ? beta : motionBeta,
        gamma: Number.isFinite(gamma) ? gamma : motionGamma,
        timestamp: Date.now(),
      }
      this.latest = sample
      this.hadValidSample = true
      onSample(sample)
    }

    const orientationHandler = (event: Event) => {
      const payload = event as Event & OrientationPayload
      if (typeof payload.webkitCompassHeading === 'number') {
        emit(
          payload.webkitCompassHeading,
          typeof payload.webkitCompassAccuracy === 'number' ? payload.webkitCompassAccuracy : null,
          true,
          payload.beta ?? motionBeta,
          payload.gamma ?? motionGamma,
        )
        return
      }

      // Relative alpha cannot establish magnetic north. The page treats its absence as an explicit error.
      if (payload.absolute !== true || payload.alpha === null || payload.beta === null || payload.gamma === null) return
      emit(
        tiltCompensatedHeading(payload.alpha, payload.beta, payload.gamma),
        null,
        true,
        payload.beta,
        payload.gamma,
      )
    }

    const motionHandler = (event: DeviceMotionEvent) => {
      const gravity = event.accelerationIncludingGravity
      if (!gravity) return
      if (typeof gravity.x === 'number' && typeof gravity.y === 'number') {
        const angle = screenRotationAngle() * Math.PI / 180
        const rotatedX = gravity.x * Math.cos(angle) + gravity.y * Math.sin(angle)
        const rotatedY = -gravity.x * Math.sin(angle) + gravity.y * Math.cos(angle)
        motionBeta = Math.atan2(rotatedX, gravity.z ?? 1) * 180 / Math.PI
        motionGamma = Math.atan2(rotatedY, gravity.z ?? 1) * 180 / Math.PI
        hasMotion = true
      }
    }

    window.addEventListener('deviceorientationabsolute', orientationHandler)
    const supportsAbsolute = 'ondeviceorientationabsolute' in window
    if (!supportsAbsolute) window.addEventListener('deviceorientation', orientationHandler)
    window.addEventListener('devicemotion', motionHandler)
    this.handlers.push(() => window.removeEventListener('deviceorientationabsolute', orientationHandler))
    if (!supportsAbsolute) this.handlers.push(() => window.removeEventListener('deviceorientation', orientationHandler))
    this.handlers.push(() => window.removeEventListener('devicemotion', motionHandler))

    const visibilityHandler = () => {
      if (document.hidden) this.stop()
    }
    document.addEventListener('visibilitychange', visibilityHandler)
    this.handlers.push(() => document.removeEventListener('visibilitychange', visibilityHandler))

    return () => {
      if (!hasMotion) motionBeta = 0
      this.stop()
    }
  }

  stop() {
    this.handlers.forEach(cleanup => cleanup())
    this.handlers = []
    this.latest = null
    this.filter.reset()
  }

  get lastSample() {
    return this.latest
  }
}
