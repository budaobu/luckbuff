export interface SansaAudioSettings {
  master: number
  environment: number
  chanting: number
  effects: number
}

export interface SansaAudio {
  ready: Ref<boolean>
  initialize: () => void
  setSettings: (settings: SansaAudioSettings) => void
  startEnvironment: () => void
  stopEnvironment: () => void
  startChant: () => void
  stopChant: () => void
  effect: (name: 'bead' | 'woodfish' | 'chime' | 'bell') => void
  suspend: () => void
  resume: () => void
  dispose: () => void
}

const storageKey = 'luckbuff.sansatemple.audio'

export function loadSansaAudioSettings(): SansaAudioSettings {
  if (import.meta.server) return { master: 0.7, environment: 0.5, chanting: 0.5, effects: 0.7 }
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) throw new Error('empty')
    const parsed = JSON.parse(raw) as Partial<SansaAudioSettings>
    return {
      master: numberOr(parsed.master, 0.7),
      environment: numberOr(parsed.environment, 0.5),
      chanting: numberOr(parsed.chanting, 0.5),
      effects: numberOr(parsed.effects, 0.7),
    }
  } catch {
    return { master: 0.7, environment: 0.5, chanting: 0.5, effects: 0.7 }
  }
}

function numberOr(value: unknown, fallback: number) {
  return typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback
}

export function useSansatempleAudio(): SansaAudio {
  const ready = ref(false)
  let context: AudioContext | null = null
  let master: GainNode | null = null
  let environmentBus: GainNode | null = null
  let chantingBus: GainNode | null = null
  let effectsBus: GainNode | null = null
  let environmentNodes: AudioNode[] = []
  let chantNodes: AudioNode[] = []
  let settings = loadSansaAudioSettings()
  let visibilityHandler: (() => void) | null = null

  function initialize() {
    if (ready.value) return
    const AudioContextConstructor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextConstructor) return
    context = new AudioContextConstructor()
    master = context.createGain()
    environmentBus = context.createGain()
    chantingBus = context.createGain()
    effectsBus = context.createGain()
    environmentBus.connect(master)
    chantingBus.connect(master)
    effectsBus.connect(master)
    master.connect(context.destination)
    applySettings()
    ready.value = true

    visibilityHandler = () => {
      if (document.hidden) context?.suspend()
      else context?.resume()
    }
    document.addEventListener('visibilitychange', visibilityHandler)
  }

  function applySettings() {
    if (!master || !environmentBus || !chantingBus || !effectsBus) return
    master.gain.value = settings.master
    environmentBus.gain.value = settings.environment
    chantingBus.gain.value = settings.chanting
    effectsBus.gain.value = settings.effects
    localStorage.setItem(storageKey, JSON.stringify(settings))
  }

  function startEnvironment() {
    if (!context || !environmentBus || environmentNodes.length > 0) return
    const size = 2 ** 15
    const buffer = context.createBuffer(1, size, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let index = 0; index < size; index += 1) data[index] = (Math.random() * 2 - 1) * 0.35
    const noise = context.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 540
    filter.Q.value = 0.8
    const gain = context.createGain()
    gain.gain.value = 0.035
    noise.connect(filter).connect(gain).connect(environmentBus)
    noise.start()
    environmentNodes = [noise, filter, gain]
  }

  function stopEnvironment() {
    for (const node of environmentNodes) {
      const source = node as AudioScheduledSourceNode
      source.stop?.()
      node.disconnect()
    }
    environmentNodes = []
  }

  function startChant() {
    if (!context || !chantingBus || chantNodes.length > 0) return
    const vocal = context.createOscillator()
    vocal.type = 'sawtooth'
    vocal.frequency.value = 132
    const vibrato = context.createOscillator()
    vibrato.frequency.value = 4.4
    const vibratoGain = context.createGain()
    vibratoGain.gain.value = 5
    vibrato.connect(vibratoGain).connect(vocal.frequency)
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 460
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, context.currentTime)
    gain.gain.linearRampToValueAtTime(0.035, context.currentTime + 1)
    vocal.connect(filter).connect(gain).connect(chantingBus)
    vocal.start()
    vibrato.start()
    chantNodes = [vocal, vibrato, vibratoGain, filter, gain]
  }

  function stopChant() {
    for (const node of chantNodes) {
      const source = node as AudioScheduledSourceNode
      source.stop?.()
      node.disconnect()
    }
    chantNodes = []
  }

  function effect(name: 'bead' | 'woodfish' | 'chime' | 'bell') {
    if (!context || !effectsBus) return
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const preset = {
      bead: { frequency: 860, type: 'triangle' as OscillatorType, gain: 0.05, decay: 0.08 },
      woodfish: { frequency: 300, type: 'sine' as OscillatorType, gain: 0.14, decay: 0.13 },
      chime: { frequency: 1046, type: 'sine' as OscillatorType, gain: 0.12, decay: 1.3 },
      bell: { frequency: 660, type: 'sine' as OscillatorType, gain: 0.15, decay: 1.8 },
    }[name]
    oscillator.type = preset.type
    oscillator.frequency.setValueAtTime(preset.frequency, now)
    if (name === 'woodfish') oscillator.frequency.exponentialRampToValueAtTime(preset.frequency * 0.74, now + 0.08)
    gain.gain.setValueAtTime(preset.gain, now)
    gain.gain.exponentialRampToValueAtTime(0.0005, now + preset.decay)
    oscillator.connect(gain).connect(effectsBus)
    oscillator.start(now)
    oscillator.stop(now + preset.decay + 0.02)
  }

  function setSettings(next: SansaAudioSettings) {
    settings = { ...next }
    applySettings()
  }

  function dispose() {
    stopEnvironment()
    stopChant()
    if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler)
    context?.close()
    context = null
    ready.value = false
  }

  onBeforeUnmount(dispose)

  return {
    ready,
    initialize,
    setSettings,
    startEnvironment,
    stopEnvironment,
    startChant,
    stopChant,
    effect,
    suspend: () => context?.suspend(),
    resume: () => context?.resume(),
    dispose,
  }
}
