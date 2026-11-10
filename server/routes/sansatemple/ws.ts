import { nanoid } from 'nanoid'
import {
  addIncense,
  assignCushion,
  broadcastSansa,
  cushionStates,
  expireIncense,
  findAvailableChannel,
  incenseStates,
  joinPeer,
  nextServiceAt,
  peersInChannel,
  registerSansaSocket,
  releaseCushion,
  removeSansaSocket,
  removePeer,
  sansaChannelSummaries,
  sansaAction,
  serviceWindow,
  sendSansa,
  updatePeer,
} from '~~/server/utils/sansatemple/state'
import type { ClientMessage, ServerMessage } from '~~/server/utils/sansatemple/types'

interface PeerContext {
  id: string
  channel?: string
  windowStart: number
  count: number
}

const contexts = new WeakMap<object, PeerContext>()

export default defineWebSocketHandler({
  open(peer) {
    contexts.set(peer, { id: nanoid(12), windowStart: Date.now(), count: 0 })
    registerSansaSocket(contexts.get(peer)!.id, peer)
  },

  message(peer, raw) {
    const context = contexts.get(peer)
    if (!context) return

    const now = Date.now()
    if (now - context.windowStart >= 1000) {
      context.windowStart = now
      context.count = 0
    }
    context.count += 1
    if (context.count > 10) return

    let input: ClientMessage
    try {
      input = JSON.parse(String(raw)) as ClientMessage
    } catch {
      sendSansa(context.id, { type: 'error', code: 'invalid', message: 'invalid message' })
      return
    }

    if (input.type === 'join') {
      const channel = findAvailableChannel(input.channel)
      if (!channel) {
        sendSansa(context.id, { type: 'error', code: 'full', message: 'channel full' })
        return
      }
      const joined = joinPeer(context.id, channel.id)
      if (!joined) return
      context.channel = channel.id
      expireIncense(channel.id)
      const payload: ServerMessage = {
        type: 'welcome',
        you: publicState(joined),
        channels: roomSummaries(),
        cushions: cushionStates(),
        incense: incenseStates(channel.id),
        service: serviceWindow(),
        nextServiceAt: nextServiceAt(),
      }
      sendSansa(context.id, payload)
      broadcastSansa(channel.id, { type: 'peer-joined', peer: publicState(joined) }, context.id)
      return
    }

    if (!context.channel) return

    if (input.type === 'state') {
      const updated = updatePeer(context.id, {
        x: input.x,
        z: input.z,
        rotation: input.rotation,
        action: sansaAction(input.action),
        cushionId: input.cushionId,
      })
      if (updated) {
        broadcastSansa(context.channel, { type: 'peer-state', peer: publicState(updated) }, context.id)
      }
      return
    }

    if (input.type === 'pray-request') {
      const cushion = assignCushion(context.id)
      const payload: ServerMessage = cushion
        ? { type: 'cushion-assigned', cushionId: cushion.id }
        : { type: 'cushion-assigned', reason: 'unavailable' }
      sendSansa(context.id, payload)
      broadcastRoom(context.channel)
      return
    }

    if (input.type === 'release-cushion') {
      releaseCushion(context.id)
      broadcastRoom(context.channel)
      return
    }

    if (input.type === 'incense') {
      const item = addIncense(context.id)
      if (item) {
        broadcastSansa(context.channel, { type: 'incense-added', incense: item })
      }
      return
    }

    if (input.type === 'reverence') {
      const source = peersInChannel(context.channel).find(item => item.id === context.id)
      if (!source) return
      for (const target of peersInChannel(context.channel)) {
        if (target.id === context.id) continue
        if (Math.hypot(target.x - source.x, target.z - source.z) > 4) continue
        sendSansa(target.id, { type: 'reverence-from', peerName: source.name })
      }
    }
  },

  close(peer) {
    const context = contexts.get(peer)
    if (!context) return
    const removed = removePeer(context.id)
    if (removed && context.channel) {
      broadcastSansa(context.channel, { type: 'peer-left', id: context.id })
      broadcastRoom(context.channel)
    }
    removeSansaSocket(context.id)
    contexts.delete(peer)
  },
})

function publicState(input: { id: string; name: string; x: number; z: number; rotation: number; action: ReturnType<typeof sansaAction>; cushionId?: string }) {
  return {
    id: input.id,
    name: input.name,
    x: input.x,
    z: input.z,
    rotation: input.rotation,
    action: input.action,
    cushionId: input.cushionId,
  }
}

function roomSummaries() {
  return sansaChannelSummaries()
}

function broadcastRoom(channelId: string) {
  broadcastSansa(channelId, {
    type: 'room',
    channels: roomSummaries(),
    cushions: cushionStates(),
    incense: incenseStates(channelId),
    service: serviceWindow(),
    nextServiceAt: nextServiceAt(),
  })
}
