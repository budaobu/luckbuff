export type SansaAction = 'idle' | 'walking' | 'praying' | 'meditating' | 'woodfish' | 'incense' | 'reverence'

export interface SansaPeerState {
  id: string
  name: string
  x: number
  z: number
  rotation: number
  action: SansaAction
  cushionId?: string
}

export interface SansaCushionState {
  id: string
  x: number
  z: number
  peerId?: string
}

export interface SansaIncenseState {
  id: string
  peerId: string
  startedAt: number
  duration: number
}

export interface SansaChannelSummary {
  id: string
  count: number
  capacity: number
  full: boolean
}

export type ClientMessage =
  | { type: 'join'; channel: string }
  | { type: 'state'; x: number; z: number; rotation: number; action: SansaAction; cushionId?: string }
  | { type: 'pray-request' }
  | { type: 'release-cushion' }
  | { type: 'incense' }
  | { type: 'reverence' }

export type ServerMessage =
  | { type: 'welcome'; you: SansaPeerState; channels: SansaChannelSummary[]; cushions: SansaCushionState[]; incense: SansaIncenseState[]; service: { startedAt: number; endsAt: number } | null; nextServiceAt: number }
  | { type: 'room'; channels: SansaChannelSummary[]; cushions: SansaCushionState[]; incense: SansaIncenseState[]; service: { startedAt: number; endsAt: number } | null; nextServiceAt: number }
  | { type: 'peer-joined'; peer: SansaPeerState }
  | { type: 'peer-left'; id: string }
  | { type: 'peer-state'; peer: SansaPeerState }
  | { type: 'cushion-assigned'; cushionId?: string; reason?: string }
  | { type: 'incense-added'; incense: SansaIncenseState }
  | { type: 'incense-expired'; id: string }
  | { type: 'reverence-from'; peerName: string }
  | { type: 'error'; code: 'full' | 'invalid' | 'rate-limited'; message: string }
