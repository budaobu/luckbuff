export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

export function angularDifference(from: number, to: number) {
  return normalizeDegrees(to - from + 180) - 180
}

export class HeadingFilter {
  private heading: number | null = null
  private lastTimestamp = 0

  reset() {
    this.heading = null
    this.lastTimestamp = 0
  }

  filter(rawHeading: number, timestamp: number) {
    const heading = normalizeDegrees(rawHeading)
    if (this.heading === null || this.lastTimestamp === 0) {
      this.heading = heading
      this.lastTimestamp = timestamp
      return heading
    }

    const elapsed = Math.max(timestamp - this.lastTimestamp, 1)
    const speed = Math.abs(angularDifference(this.heading, heading)) / elapsed * 1000
    this.lastTimestamp = timestamp

    // Fast turns must remain responsive; a still phone needs stronger noise rejection.
    const smoothing = speed > 180 ? 0.46 : speed > 45 ? 0.28 : 0.14
    this.heading = normalizeDegrees(this.heading + angularDifference(this.heading, heading) * smoothing)
    return this.heading
  }
}
