import { angularDifference } from './heading'
import type { CalibrationFeedback, LuopanSample } from '~/types/fengshui-luopan'

export class CalibrationEngine {
  private feedback: CalibrationFeedback = {
    phase: 'idle',
    coverage: 0,
    stable: false,
    level: false,
    magneticDisturbance: false,
  }
  private startedAt = 0
  private stableSince = 0
  private sectorSamples = new Set<number>()
  private recentHeadings: number[] = []
  private recentTimes: number[] = []

  start() {
    this.startedAt = Date.now()
    this.stableSince = 0
    this.sectorSamples.clear()
    this.recentHeadings = []
    this.recentTimes = []
    this.feedback = {
      phase: 'leveling',
      coverage: 0,
      stable: false,
      level: false,
      magneticDisturbance: false,
    }
    return { ...this.feedback }
  }

  feed(sample: LuopanSample) {
    if (this.feedback.phase === 'complete' || this.feedback.phase === 'error') return this.feedback
    const level = Math.abs(sample.beta) < 28 && Math.abs(sample.gamma) < 28
    this.feedback.level = level

    if (!level) {
      this.feedback.phase = 'leveling'
      this.stableSince = 0
      return { ...this.feedback }
    }

    if (typeof sample.accuracy === 'number' && (sample.accuracy > 35 || sample.accuracy < 0)) {
      this.feedback.magneticDisturbance = true
    }

    this.sectorSamples.add(Math.floor(sample.heading / 30))
    this.feedback.coverage = Math.min(this.sectorSamples.size / 12, 1)
    this.feedback.phase = this.feedback.coverage < 0.98 ? 'rotating' : 'stabilizing'

    this.recentHeadings.push(sample.heading)
    this.recentTimes.push(sample.timestamp)
    while (this.recentTimes.length > 0 && sample.timestamp - this.recentTimes[0]! > 1600) {
      this.recentHeadings.shift()
      this.recentTimes.shift()
    }

    const range = this.recentHeadings.reduce((max, heading) => {
      return Math.max(max, Math.abs(angularDifference(this.recentHeadings[0]!, heading)))
    }, 0)
    const quiet = this.recentTimes.length > 5 && range < 7
    const elapsed = sample.timestamp - this.startedAt

    if (this.feedback.phase === 'stabilizing' && quiet) {
      this.stableSince ||= sample.timestamp
      if (sample.timestamp - this.stableSince > 900 && elapsed > 3600) {
        this.feedback.phase = 'complete'
        this.feedback.stable = true
      }
    }
    else {
      this.stableSince = 0
    }

    if (elapsed > 18000 && !this.feedback.stable) {
      this.feedback.phase = 'error'
      this.feedback.magneticDisturbance = true
    }

    return { ...this.feedback }
  }

  abort() {
    this.feedback.phase = 'idle'
    return { ...this.feedback }
  }

  get state() {
    return { ...this.feedback }
  }
}
