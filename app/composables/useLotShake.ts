export interface LotShakeTheme {
  id: string
  signCount: number
  tubeColor: string
  stickColor: string
  accentColor: string
  style: 'bamboo' | 'temple' | 'daoist' | 'buddhist' | 'celestial'
}

const lotShakeThemes = {
  guanyin: {
    id: 'guanyin',
    signCount: 100,
    tubeColor: '#f4e5c4',
    stickColor: '#fff6dd',
    accentColor: '#8c1d18',
    style: 'temple',
  },
  omikuji: {
    id: 'omikuji',
    signCount: 100,
    tubeColor: '#f8f4ea',
    stickColor: '#ffffff',
    accentColor: '#b62b45',
    style: 'bamboo',
  },
  yuelao: {
    id: 'yuelao',
    signCount: 100,
    tubeColor: '#f3d6dd',
    stickColor: '#fff1f4',
    accentColor: '#a63c5a',
    style: 'temple',
  },
  wealthGod: {
    id: 'wealth-god',
    signCount: 100,
    tubeColor: '#f6e2b4',
    stickColor: '#fff6d8',
    accentColor: '#a16207',
    style: 'celestial',
  },
  sanshanwang: {
    id: 'sanshan',
    signCount: 61,
    tubeColor: '#e7f0e2',
    stickColor: '#f6fff2',
    accentColor: '#3f6212',
    style: 'daoist',
  },
  mazu: {
    id: 'mazu',
    signCount: 60,
    tubeColor: '#dbeafe',
    stickColor: '#eff6ff',
    accentColor: '#1d4ed8',
    style: 'temple',
  },
  guandi: {
    id: 'guandi',
    signCount: 100,
    tubeColor: '#fee2e2',
    stickColor: '#fff1f1',
    accentColor: '#991b1b',
    style: 'temple',
  },
  wongTaiSin: {
    id: 'wong-tai-sin',
    signCount: 100,
    tubeColor: '#ede9fe',
    stickColor: '#f5f3ff',
    accentColor: '#6d28d9',
    style: 'daoist',
  },
  wenshu: {
    id: 'wenshu',
    signCount: 100,
    tubeColor: '#fae8ff',
    stickColor: '#fdf4ff',
    accentColor: '#7e22ce',
    style: 'buddhist',
  },
  dizang: {
    id: 'dizang',
    signCount: 60,
    tubeColor: '#e0e7ff',
    stickColor: '#eef2ff',
    accentColor: '#4338ca',
    style: 'buddhist',
  },
  tudigong: {
    id: 'tudigong',
    signCount: 32,
    tubeColor: '#ecfccb',
    stickColor: '#f7fee7',
    accentColor: '#4d7c0f',
    style: 'bamboo',
  },
  baosheng: {
    id: 'baoshengdadi',
    signCount: 60,
    tubeColor: '#cffafe',
    stickColor: '#ecfeff',
    accentColor: '#0e7490',
    style: 'temple',
  },
  zhuge: {
    id: 'zhuge',
    signCount: 384,
    tubeColor: '#fef3c7',
    stickColor: '#fffbeb',
    accentColor: '#92400e',
    style: 'daoist',
  },
} as const satisfies Record<string, LotShakeTheme>

export type LotShakeThemeId = keyof typeof lotShakeThemes

export function useLotShakeTheme(id: LotShakeThemeId) {
  return lotShakeThemes[id]
}

export function useLotShake() {
  const trigger = ref(0)
  const selectedSign = ref<number | null>(null)
  const error = ref<string | null>(null)
  let resolvers: Array<() => void> = []

  function complete() {
    resolvers.forEach(resolve => resolve())
    resolvers = []
  }

  async function play() {
    error.value = null
    selectedSign.value = null
    trigger.value += 1
    await new Promise<void>((resolve) => {
      resolvers.push(resolve)
    })
  }

  function setSign(sign: number) {
    selectedSign.value = sign
  }

  function fail(message: string) {
    error.value = message
    complete()
  }

  function cancel() {
    complete()
  }

  onScopeDispose(cancel)

  return {
    trigger,
    selectedSign,
    error,
    play,
    complete,
    setSign,
    fail,
    cancel,
  }
}
