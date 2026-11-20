import type { SansaAction, SansaChannelSummary, SansaCushionState, SansaIncenseState, SansaPeerState } from '~~/server/utils/sansatemple/types'

type ServerEvent =
  | { type: 'welcome'; you: SansaPeerState; channels: SansaChannelSummary[]; cushions: SansaCushionState[]; incense: SansaIncenseState[]; service: { startedAt: number; endsAt: number } | null; nextServiceAt: number }
  | { type: 'room'; channels: SansaChannelSummary[]; cushions: SansaCushionState[]; incense: SansaIncenseState[]; service: { startedAt: number; endsAt: number } | null; nextServiceAt: number }
  | { type: 'peer-joined'; peer: SansaPeerState }
  | { type: 'peer-left'; id: string }
  | { type: 'peer-state'; peer: SansaPeerState }
  | { type: 'cushion-assigned'; cushionId?: string; reason?: string }
  | { type: 'incense-added'; incense: SansaIncenseState }
  | { type: 'reverence-from'; peerName: string }
  | { type: 'error'; code: string; message: string }

export interface SansaServiceWindow {
  startedAt: number
  endsAt: number
}

export interface SansaConnection {
  channels: Ref<SansaChannelSummary[]>
  cushions: Ref<SansaCushionState[]>
  incense: Ref<SansaIncenseState[]>
  peers: Ref<Record<string, SansaPeerState>>
  connected: Ref<boolean>
  connecting: Ref<boolean>
  service: Ref<SansaServiceWindow | null>
  nextServiceAt: Ref<number>
  notice: Ref<string>
  lastCushion: Ref<string | 'unavailable' | null>
  connect: (channel: string) => Promise<void>
  sendState: (state: { x: number; z: number; rotation: number; action: SansaAction; cushionId?: string }) => void
  requestPray: () => void
  releaseCushion: () => void
  lightIncense: () => void
  reverence: () => void
  leave: () => void
}

export function useSansatempleConnection(notice: Ref<string>): SansaConnection {
  const channels = ref<SansaChannelSummary[]>([])
  const cushions = ref<SansaCushionState[]>([])
  const incense = ref<SansaIncenseState[]>([])
  const peers = ref<Record<string, SansaPeerState>>({})
  const connected = ref(false)
  const connecting = ref(false)
  const service = ref<SansaServiceWindow | null>(null)
  const nextServiceAt = ref(0)
  let socket: WebSocket | null = null
  let channel = ''
  let reconnectAttempts = 0
  let closedByUser = false
  let reconnectTimer: number | null = null
  let lastState = 0
  const lastCushion = ref<string | 'unavailable' | null>(null)

  async function connect(requestedChannel: string) {
    if (connecting.value || connected.value) return
    closedByUser = false
    connecting.value = true
    channel = requestedChannel
    try {
      const response = await fetch('/api/sansatemple/channels')
      channels.value = await response.json() as SansaChannelSummary[]
    } catch {
      connecting.value = false
      notice.value = 'connectionFailed'
      throw new Error('channel fetch failed')
    }

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    socket = new WebSocket(`${protocol}//${location.host}/sansatemple/ws`)

    socket.addEventListener('open', () => {
      socket?.send(JSON.stringify({ type: 'join', channel }))
    })

    socket.addEventListener('message', (event) => {
      handle(JSON.parse(event.data) as ServerEvent)
    })

    socket.addEventListener('close', () => {
      connected.value = false
      connecting.value = false
      socket = null
      if (closedByUser) return
      scheduleReconnect()
    })

    socket.addEventListener('error', () => {
      if (!connected.value) notice.value = 'connectionFailed'
    })
  }

  function scheduleReconnect() {
    if (closedByUser || reconnectAttempts >= 3) {
      notice.value = reconnectAttempts >= 3 ? 'reconnectFailed' : 'connectionFailed'
      return
    }
    reconnectAttempts += 1
    reconnectTimer = window.setTimeout(async () => {
      connecting.value = false
      connected.value = false
      try {
        await connect(channel)
        reconnectAttempts = 0
      } catch {
        notice.value = 'connectionFailed'
      }
    }, 1000 * reconnectAttempts)
  }

  function handle(message: ServerEvent) {
    if (message.type === 'welcome') {
      connected.value = true
      connecting.value = false
      reconnectAttempts = 0
      channels.value = message.channels
      cushions.value = message.cushions
      incense.value = message.incense
      service.value = message.service
      nextServiceAt.value = message.nextServiceAt
      peers.value = { [message.you.id]: message.you }
      return
    }

    if (message.type === 'room') {
      channels.value = message.channels
      cushions.value = message.cushions
      incense.value = message.incense
      service.value = message.service
      nextServiceAt.value = message.nextServiceAt
      return
    }

    if (message.type === 'peer-joined' || message.type === 'peer-state') {
      peers.value = { ...peers.value, [message.peer.id]: message.peer }
      return
    }

    if (message.type === 'peer-left') {
      const next = { ...peers.value }
      delete next[message.id]
      peers.value = next
      return
    }

    if (message.type === 'incense-added') {
      incense.value = [...incense.value.filter(item => item.id !== message.incense.id), message.incense]
      return
    }

    if (message.type === 'cushion-assigned') {
      lastCushion.value = message.cushionId ?? 'unavailable'
    }

    if (message.type === 'reverence-from') {
      notice.value = `reverence:${message.peerName}`
      return
    }

    if (message.type === 'error') {
      connecting.value = false
      notice.value = message.code === 'full' ? 'channelFull' : 'connectionFailed'
      if (message.code === 'full') {
        closedByUser = true
        socket?.close()
      }
    }
  }

  function send(message: Record<string, unknown>) {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message))
  }

  function sendState(state: { x: number; z: number; rotation: number; action: SansaAction; cushionId?: string }) {
    const now = performance.now()
    if (now - lastState < 200) return
    lastState = now
    send({ type: 'state', x: state.x, z: state.z, rotation: state.rotation, action: state.action })
  }

  function leave() {
    closedByUser = true
    if (reconnectTimer) window.clearTimeout(reconnectTimer)
    releaseCushion()
    socket?.close()
    socket = null
    connected.value = false
    connecting.value = false
    peers.value = {}
    incense.value = []
    cushions.value = []
  }

  function releaseCushion() {
    send({ type: 'release-cushion' })
  }

  onBeforeUnmount(() => {
    leave()
  })

  return {
    channels,
    cushions,
    incense,
    peers,
    connected,
    connecting,
    service,
    nextServiceAt,
    notice,
    lastCushion,
    connect,
    sendState,
    requestPray: () => send({ type: 'pray-request' }),
    releaseCushion,
    lightIncense: () => send({ type: 'incense' }),
    reverence: () => send({ type: 'reverence' }),
    leave,
  }
}
