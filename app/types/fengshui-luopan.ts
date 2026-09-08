export type LuopanRingId = 'mountains' | 'stems' | 'branches' | 'elements' | 'trigrams'

export type LuopanProfileId = 'complete' | 'reading' | 'compact'

export type LuopanStatus =
  | 'detecting'
  | 'unsupported'
  | 'browser-unsupported'
  | 'permission-required'
  | 'permission-denied'
  | 'calibrating'
  | 'initializing'
  | 'active'
  | 'sensor-error'

export interface DeviceCapability {
  isMobileLike: boolean
  supportsOrientation: boolean
  supportsMotion: boolean
  supportsAbsoluteOrientation: boolean
  requiresPermission: boolean
  canUseCompass: boolean
}

export interface LuopanSample {
  heading: number
  accuracy: number | null
  absolute: boolean
  beta: number
  gamma: number
  timestamp: number
}

export interface LuopanDirection {
  degree: number
  mountain: string
  trigram: string
  heavenlyStem: string
  earthlyBranch: string
  element: string
}

export type CalibrationPhase = 'idle' | 'leveling' | 'rotating' | 'stabilizing' | 'complete' | 'error'

export interface CalibrationFeedback {
  phase: CalibrationPhase
  coverage: number
  stable: boolean
  level: boolean
  magneticDisturbance: boolean
}
