import { nanoid } from 'nanoid'
import type { SansaAction, SansaChannelSummary, SansaCushionState, SansaIncenseState, SansaPeerState } from './types'

interface SansaPeer extends SansaPeerState {
  channel: string
}

interface SansaChannel {
  id: string
  capacity: number
  peers: Map<string, SansaPeer>
  incense: Map<string, SansaIncenseState>
}

interface SansaRoom {
  channels: Map<string, SansaChannel>
}

const channelCount = Number.parseInt(process.env.SANSATEMPLE_CHANNEL_COUNT || '3', 10)
const capacity = Number.parseInt(process.env.SANSATEMPLE_CAPACITY || '50', 10)
const safeChannelCount = Number.isFinite(channelCount) && channelCount > 0 ? Math.min(channelCount, 100) : 3
const safeCapacity = Number.isFinite(capacity) && capacity > 0 ? Math.min(capacity, 100) : 50

const nameAdjectives = ['慢步', '静云', '善树', '听泉', '温石', '守灯', '清竹', '望山', '初雪', '安溪']
const nameNouns = ['松风', '石阶', '山月', '溪声', '灯影', '林雨', '苔痕', '云脚', '晚钟', '草色']

export interface SansaSocket {
  send: (message: string) => void
}

const sockets = new Map<string, SansaSocket>()

const cushions: SansaCushionState[] = Array.from({ length: 24 }, (_, index) => {
  const column = index % 8
  const row = Math.floor(index / 8)
  return {
    id: `cushion-${index + 1}`,
    x: -5.6 + column * 1.6,
    z: -3.4 + row * 2.4,
  }
})

function room(): SansaRoom {
  const marker = '__luckbuffSansatempleRoom__'
  const globalRoom = globalThis as typeof globalThis & { [marker]?: SansaRoom }
  if (!globalRoom[marker]) {
    const channels = new Map<string, SansaChannel>()
    for (let index = 1; index <= safeChannelCount; index += 1) {
      channels.set(String(index), { id: String(index), capacity: safeCapacity, peers: new Map(), incense: new Map() })
    }
    globalRoom[marker] = { channels }
  }
  return globalRoom[marker]!
}

export function sansaChannelSummaries(): SansaChannelSummary[] {
  return [...room().channels.values()].map(channel => ({
    id: channel.id,
    count: channel.peers.size,
    capacity: channel.capacity,
    full: channel.peers.size >= channel.capacity,
  }))
}

export function registerSansaSocket(id: string, socket: SansaSocket) {
  sockets.set(id, socket)
}

export function removeSansaSocket(id: string) {
  sockets.delete(id)
}

export function sendSansa(peerId: string, payload: unknown) {
  const socket = sockets.get(peerId)
  if (!socket) return
  Promise.resolve(socket.send(JSON.stringify(payload))).catch(() => {})
}

export function broadcastSansa(channelId: string, payload: unknown, excludeId?: string) {
  const channel = room().channels.get(channelId)
  if (!channel) return
  for (const peerId of channel.peers.keys()) {
    if (peerId === excludeId) continue
    sendSansa(peerId, payload)
  }
}

export function findAvailableChannel(preferred?: string): SansaChannel | null {
  const channels = room().channels
  if (preferred) {
    const found = channels.get(preferred)
    if (found && found.peers.size < found.capacity) return found
    return null
  }
  return [...channels.values()].find(channel => channel.peers.size < channel.capacity) ?? null
}

export function joinPeer(id: string, channel: string): SansaPeer | null {
  const found = room().channels.get(channel)
  if (!found || found.peers.size >= found.capacity) return null
  const seed = Math.floor(Math.random() * nameAdjectives.length)
  const nounSeed = Math.floor(Math.random() * nameNouns.length)
  const peer: SansaPeer = {
    id,
    name: `${nameAdjectives[seed]}${nameNouns[nounSeed]}`,
    channel,
    x: (Math.random() - 0.5) * 2,
    z: 22,
    rotation: Math.PI,
    action: 'walking',
  }
  found.peers.set(id, peer)
  return peer
}

export function peer(id: string): SansaPeer | undefined {
  for (const channel of room().channels.values()) {
    const found = channel.peers.get(id)
    if (found) return found
  }
  return undefined
}

export function peersInChannel(channelId: string): SansaPeer[] {
  return [...room().channels.get(channelId)?.peers.values() ?? []]
}

export function updatePeer(id: string, state: Partial<Omit<SansaPeer, 'id' | 'channel' | 'name'>>): SansaPeer | undefined {
  const found = peer(id)
  if (!found) return undefined
  found.x = clamp(quantize(state.x, 0.1), -10, 10)
  found.z = clamp(quantize(state.z, 0.1), -5, 28)
  found.rotation = quantize(state.rotation ?? found.rotation, 0.1)
  found.action = state.action ?? found.action
  return found
}

function quantize(value: number | undefined, step: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round((value ?? 0) / step) * step
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function removePeer(id: string): SansaPeer | undefined {
  for (const channel of room().channels.values()) {
    const found = channel.peers.get(id)
    if (!found) continue
    channel.peers.delete(id)
    for (const cushion of cushions) {
      if (cushion.peerId === id) cushion.peerId = undefined
    }
    for (const [incenseId, incense] of channel.incense) {
      if (incense.peerId === id) channel.incense.delete(incenseId)
    }
    return found
  }
  return undefined
}

export function assignCushion(id: string): SansaCushionState | null {
  const current = peer(id)
  if (!current) return null
  releaseCushion(id)
  const sorted = [...cushions]
    .filter(item => !item.peerId)
    .sort((a, b) => distance(a, current) - distance(b, current))
  const chosen = sorted[0]
  if (!chosen) return null
  chosen.peerId = id
  current.cushionId = chosen.id
  return chosen
}

export function releaseCushion(id: string) {
  for (const cushion of cushions) {
    if (cushion.peerId === id) cushion.peerId = undefined
  }
  const current = peer(id)
  if (current) current.cushionId = undefined
}

function distance(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

export function cushionStates(): SansaCushionState[] {
  return cushions.map(item => ({ ...item }))
}

export function incenseStates(channelId: string): SansaIncenseState[] {
  return [...room().channels.get(channelId)?.incense.values() ?? []]
}

export function addIncense(id: string): SansaIncenseState | null {
  const current = peer(id)
  const channel = current && room().channels.get(current.channel)
  if (!current || !channel) return null
  const mine = [...channel.incense.values()].filter(item => item.peerId === id)
  if (mine.length >= 3) return null
  const item: SansaIncenseState = { id: nanoid(10), peerId: id, startedAt: Date.now(), duration: 180_000 }
  channel.incense.set(item.id, item)
  return item
}

export function expireIncense(channelId: string): SansaIncenseState[] {
  const channel = room().channels.get(channelId)
  if (!channel) return []
  const now = Date.now()
  const expired: SansaIncenseState[] = []
  for (const [id, item] of channel.incense) {
    if (now - item.startedAt >= item.duration) {
      channel.incense.delete(id)
      expired.push(item)
    }
  }
  return expired
}

const serviceHours = [5, 18]
const serviceDuration = 20 * 60_000

export function serviceWindow(now = Date.now()): { startedAt: number; endsAt: number } | null {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' })
  const [year, month, day] = formatter.format(now).split('-').map(Number)
  const shanghaiOffset = 8 * 60 * 60_000
  const dayStart = Date.UTC(year!, month! - 1, day!) - shanghaiOffset
  for (const hour of serviceHours) {
    const startedAt = dayStart + hour * 60 * 60_000
    const endsAt = startedAt + serviceDuration
    if (now >= startedAt && now < endsAt) return { startedAt, endsAt }
  }
  return null
}

export function nextServiceAt(now = Date.now()): number {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' })
  const [year, month, day] = formatter.format(now).split('-').map(Number)
  const shanghaiOffset = 8 * 60 * 60_000
  const dayStart = Date.UTC(year!, month! - 1, day!) - shanghaiOffset
  const candidates = serviceHours
    .flatMap((hour) => {
      const startedAt = dayStart + hour * 60 * 60_000
      return [startedAt, startedAt + 24 * 60 * 60_000]
    })
    .filter(time => time > now)
    .sort((a, b) => a - b)
  return candidates[0] ?? dayStart + 29 * 60 * 60_000
}

export function sansaAction(value: unknown): SansaAction {
  const allowed: SansaAction[] = ['idle', 'walking', 'praying', 'meditating', 'woodfish', 'incense']
  return allowed.includes(value as SansaAction) ? value as SansaAction : 'idle'
}
