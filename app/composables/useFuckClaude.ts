export type SignalId =
  | 'timezone'
  | 'timezoneOffset'
  | 'language'
  | 'intlLocale'
  | 'fonts'
  | 'emoji'

export type RiskBand = 'low' | 'medium' | 'high'

export interface DetectOutcome {
  /** 人類可讀的檢測值 */
  raw: string
  /** 0–1 的中國用戶相似度 */
  score: number
}

export interface SignalResult extends DetectOutcome {
  id: SignalId
  name: string
  weight: number
  contribution: number
  verdict: RiskBand
  claudeUsed?: boolean
}

export interface ScanResult {
  total: number
  band: RiskBand
  hits: SignalResult[]
  signals: SignalResult[]
}

const CN_TIMEZONES = [
  'Asia/Shanghai',
  'Asia/Urumqi',
  'Asia/Chongqing',
  'Asia/Chungking',
  'Asia/Harbin',
  'Asia/Kashgar',
]
const CLAUDE_TIMEZONES = ['Asia/Shanghai', 'Asia/Urumqi']
const GREATER_CN_TIMEZONES = ['Asia/Hong_Kong', 'Asia/Macau', 'Asia/Taipei']

const FONTS_SC = [
  'Microsoft YaHei',
  'Microsoft YaHei UI',
  'SimSun',
  'NSimSun',
  'SimHei',
  'KaiTi',
  'FangSong',
  'DengXian',
  'PingFang SC',
  'Hiragino Sans GB',
  'STHeiti',
  'STSong',
  'Songti SC',
  'Source Han Sans CN',
  'Source Han Sans SC',
  'Noto Sans CJK SC',
  'Noto Serif CJK SC',
  'WenQuanYi Micro Hei',
  'WenQuanYi Zen Hei',
]
const FONTS_TC = [
  'Microsoft JhengHei',
  'PMingLiU',
  'MingLiU',
  'DFKai-SB',
  'PingFang TC',
  'PingFang HK',
  'Source Han Sans TW',
  'Noto Sans CJK TC',
]

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  }
  catch {
    return ''
  }
}

function detectTimezone(): DetectOutcome {
  const tz = getTimezone()
  let score = 0
  if (CLAUDE_TIMEZONES.includes(tz) || CN_TIMEZONES.includes(tz)) score = 1
  else if (GREATER_CN_TIMEZONES.includes(tz)) score = 0.6
  return { raw: tz || 'unknown', score }
}

function detectTimezoneOffset(): DetectOutcome {
  const offset = new Date().getTimezoneOffset()
  const utcHours = -offset / 60
  const sign = utcHours >= 0 ? '+' : '-'
  const raw = `UTC${sign}${Math.abs(utcHours)}`
  return { raw, score: offset === -480 ? 0.7 : 0 }
}

function normLangs(): string[] {
  const list = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language]
  return list.map(l => (l || '').toLowerCase())
}

function detectLanguage(): DetectOutcome {
  const langs = normLangs()
  const primary = langs[0] || ''
  const isHansCN = (l: string) => l.startsWith('zh-cn') || l.includes('hans') || l === 'zh'
  const isHant = (l: string) =>
    l.startsWith('zh-tw') || l.startsWith('zh-hk') || l.startsWith('zh-mo') || l.includes('hant')
  let score = 0
  if (isHansCN(primary)) score = 1
  else if (isHant(primary)) score = 0.5
  else if (langs.some(isHansCN)) score = 0.7
  else if (langs.some(l => l.startsWith('zh'))) score = 0.4
  return { raw: langs.join(', ') || 'unknown', score }
}

function detectIntlLocale(): DetectOutcome {
  let locale = ''
  try {
    locale = Intl.DateTimeFormat().resolvedOptions().locale || ''
  }
  catch {
    locale = ''
  }
  const l = locale.toLowerCase()
  let score = 0
  if (l.startsWith('zh-cn') || l.includes('hans') || l === 'zh') score = 1
  else if (l.startsWith('zh')) score = 0.5
  return { raw: locale || 'unknown', score }
}

function isFontAvailable(font: string, ctx: CanvasRenderingContext2D): boolean {
  const testString = '中文字体检测ABCabc012'
  const size = '72px'
  const bases = ['monospace', 'sans-serif', 'serif']
  return bases.some((base) => {
    ctx.font = `${size} ${base}`
    const baseWidth = ctx.measureText(testString).width
    ctx.font = `${size} "${font}", ${base}`
    const testWidth = ctx.measureText(testString).width
    return Math.abs(testWidth - baseWidth) > 0.5
  })
}

function detectFonts(): DetectOutcome {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return { raw: 'canvas unavailable', score: 0 }

  const sc = FONTS_SC.filter(f => isFontAvailable(f, ctx))
  const tc = FONTS_TC.filter(f => isFontAvailable(f, ctx))

  let score = 0
  if (sc.length >= 1) score = Math.min(1, 0.75 + 0.08 * sc.length)
  else if (tc.length >= 1) score = 0.5

  const hit = [...sc, ...tc]
  const raw = hit.length
    ? `${hit.slice(0, 4).join(', ')}${hit.length > 4 ? '…' : ''}`
    : 'none detected'
  return { raw, score }
}

function detectEmoji(): DetectOutcome {
  const ua = (navigator.userAgent || '').toLowerCase()
  const platform = (navigator.platform || '').toLowerCase()
  const probe = `${platform} ${ua}`

  let vendor = 'Unknown'
  if (/iphone|ipad|ipod|mac/.test(probe)) vendor = 'Apple'
  else if (/android/.test(probe)) vendor = 'Google'
  else if (/win/.test(probe)) vendor = 'Microsoft'
  else if (/cros/.test(probe)) vendor = 'Google'
  else if (/linux/.test(probe)) vendor = 'Linux / Other'

  const vendorScore: Record<string, number> = {
    Apple: 0.25,
    Microsoft: 0.4,
    Google: 0.35,
    'Linux / Other': 0.5,
    Unknown: 0.4,
  }

  return { raw: `${vendor} style`, score: vendorScore[vendor] ?? 0.4 }
}

interface SignalDef {
  id: SignalId
  weight: number
  claudeUsed?: boolean
  detect: () => DetectOutcome
}

const SIGNALS: SignalDef[] = [
  { id: 'timezone', weight: 30, claudeUsed: true, detect: detectTimezone },
  { id: 'language', weight: 24, detect: detectLanguage },
  { id: 'fonts', weight: 20, detect: detectFonts },
  { id: 'intlLocale', weight: 10, detect: detectIntlLocale },
  { id: 'timezoneOffset', weight: 8, detect: detectTimezoneOffset },
  { id: 'emoji', weight: 8, detect: detectEmoji },
]

export function riskBand(total: number): RiskBand {
  if (total <= 30) return 'low'
  if (total <= 60) return 'medium'
  return 'high'
}

export function signalVerdict(score: number): RiskBand {
  if (score >= 0.6) return 'high'
  if (score >= 0.25) return 'medium'
  return 'low'
}

/**
 * 執行完整掃描，返回總分、風險檔位與各信號詳情。
 * 僅在瀏覽器客戶端調用，避免 SSR 時訪問 navigator/document。
 */
export function runFuckClaudeScan(t: (key: string) => string): ScanResult {
  const signals: SignalResult[] = SIGNALS.map((signal) => {
    let outcome: DetectOutcome
    try {
      outcome = signal.detect()
    }
    catch {
      outcome = { raw: '—', score: 0 }
    }
    const contribution = Math.round(outcome.score * signal.weight)
    const verdict = signalVerdict(outcome.score)
    return {
      ...outcome,
      id: signal.id,
      name: t(`fuckClaude.signal.${signal.id}.name`),
      weight: signal.weight,
      contribution,
      verdict,
      claudeUsed: signal.claudeUsed,
    }
  })

  const total = Math.min(100, signals.reduce((sum, s) => sum + s.contribution, 0))
  const band = riskBand(total)
  const hits = signals.filter(s => s.verdict !== 'low')

  return { total, band, hits, signals }
}
