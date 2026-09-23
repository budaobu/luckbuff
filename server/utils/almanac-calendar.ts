import { createHash } from 'node:crypto'
import { Solar } from 'lunar-javascript'

export type AlmanacCalendarType = 'yi' | 'ji' | 'festivals'
export type AlmanacCalendarLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja'

export const ALMANAC_CALENDAR_TYPES: readonly AlmanacCalendarType[] = ['yi', 'ji', 'festivals']
export const ALMANAC_CALENDAR_LOCALES: readonly AlmanacCalendarLocale[] = ['zh-CN', 'zh-TW', 'en', 'ja']
export const ALMANAC_CALENDAR_DAYS = 400

const SOLAR_TERMS = new Set([
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
])

const SOLAR_TERM_EN: Record<string, string> = {
  立春: 'Start of Spring',
  雨水: 'Rain Water',
  惊蛰: 'Awakening of Insects',
  春分: 'Spring Equinox',
  清明: 'Qingming',
  谷雨: 'Grain Rain',
  立夏: 'Start of Summer',
  小满: 'Grain Buds',
  芒种: 'Grain in Ear',
  夏至: 'Summer Solstice',
  小暑: 'Minor Heat',
  大暑: 'Major Heat',
  立秋: 'Start of Autumn',
  处暑: 'End of Heat',
  白露: 'White Dew',
  秋分: 'Autumn Equinox',
  寒露: 'Cold Dew',
  霜降: 'Frost’s Descent',
  立冬: 'Start of Winter',
  小雪: 'Minor Snow',
  大雪: 'Major Snow',
  冬至: 'Winter Solstice',
  小寒: 'Minor Cold',
  大寒: 'Major Cold',
}

const SOLAR_TERM_JA: Record<string, string> = {
  立春: '立春',
  雨水: '雨水',
  惊蛰: '啓蟄',
  春分: '春分',
  清明: '清明',
  谷雨: '穀雨',
  立夏: '立夏',
  小满: '小満',
  芒种: '芒種',
  夏至: '夏至',
  小暑: '小暑',
  大暑: '大暑',
  立秋: '立秋',
  处暑: '処暑',
  白露: '白露',
  秋分: '秋分',
  寒露: '寒露',
  霜降: '霜降',
  立冬: '立冬',
  小雪: '小雪',
  大雪: '大雪',
  冬至: '冬至',
  小寒: '小寒',
  大寒: '大寒',
}

const FESTIVAL_EN: Record<string, string> = {
  元旦: 'New Year’s Day',
  除夕: 'Chinese New Year’s Eve',
  春节: 'Chinese New Year',
  元宵节: 'Lantern Festival',
  龙抬头: 'Dragon Head-Raising Day',
  清明节: 'Qingming Festival',
  端午节: 'Dragon Boat Festival',
  七夕节: 'Qixi Festival',
  中元节: 'Zhongyuan Festival',
  中秋节: 'Mid-Autumn Festival',
  重阳节: 'Double Ninth Festival',
  寒衣节: 'Cold Clothing Festival',
  下元节: 'Lower Yuan Festival',
  腊八节: 'Laba Festival',
  小年: 'Little New Year',
  妇女节: 'International Women’s Day',
  植树节: 'Arbor Day',
  劳动节: 'Labour Day',
  青年节: 'Youth Day',
  儿童节: 'Children’s Day',
  建党节: 'CPC Founding Day',
  建军节: 'Army Day',
  教师节: 'Teachers’ Day',
  国庆节: 'National Day',
}

const FESTIVAL_JA: Record<string, string> = {
  元旦: '元旦',
  除夕: '旧正月前日',
  春节: '旧正月',
  元宵节: '元宵節',
  龙抬头: '龍抬頭',
  清明节: '清明節',
  端午节: '端午節',
  七夕节: '七夕節',
  中元节: '中元節',
  中秋节: '中秋節',
  重阳节: '重陽節',
  寒衣节: '寒衣節',
  下元节: '下元節',
  腊八节: '臘八節',
  小年: '小年',
  妇女节: '国際女性デー',
  植树节: '植樹節',
  劳动节: '労働節',
  青年节: '青年節',
  儿童节: '児童節',
  建党节: '中国共産党創立記念日',
  建军节: '解放軍記念日',
  教师节: '教師節',
  国庆节: '国慶節',
}

let zhTwConverter: ((value: string) => string) | null = null

async function toZhTw(value: string): Promise<string> {
  if (!zhTwConverter) {
    const { default: OpenCC } = await import('opencc-js')
    zhTwConverter = OpenCC.Converter({ from: 'cn', to: 'tw' }) as (value: string) => string
  }
  return zhTwConverter(value)
}

function textValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(item => String(item || '')).filter(Boolean)
  return value ? [String(value)] : []
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function todayInShanghai(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function compactDate(date: string): string {
  return date.replaceAll('-', '')
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function icsStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`
}

function stableId(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 12)
}

async function localize(value: string, locale: AlmanacCalendarLocale): Promise<string> {
  if (locale === 'zh-TW') return toZhTw(value)
  if (locale === 'en') return SOLAR_TERMS.has(value) ? SOLAR_TERM_EN[value] || value : FESTIVAL_EN[value] || value
  if (locale === 'ja') return SOLAR_TERMS.has(value) ? SOLAR_TERM_JA[value] || value : FESTIVAL_JA[value] || value
  return value
}

function calendarName(types: AlmanacCalendarType[], locale: AlmanacCalendarLocale): string {
  const names = {
    'zh-CN': ['黄历订阅', '宜', '忌', '节日节气'],
    'zh-TW': ['黃曆訂閱', '宜', '忌', '節日節氣'],
    en: ['Chinese Almanac Calendar', 'Yi', 'Ji', 'Festivals & Solar Terms'],
    ja: ['中国暦カレンダー', '宜', '忌', '行事・節気'],
  } as const
  const selected = types.map((type) => {
    if (type === 'yi') return names[locale][1]
    if (type === 'ji') return names[locale][2]
    return names[locale][3]
  })
  return `${names[locale][0]} · ${selected.join(' / ')}`
}

function eventKindLabel(kind: 'festival' | 'solar-term', locale: AlmanacCalendarLocale): string {
  if (kind === 'solar-term') {
    return {
      'zh-CN': '二十四节气',
      'zh-TW': '二十四節氣',
      en: '24 solar terms',
      ja: '二十四節気',
    }[locale]
  }
  return {
    'zh-CN': '传统节日 / 节假日',
    'zh-TW': '傳統節日 / 節假日',
    en: 'Traditional festival / holiday',
    ja: '伝統行事 / 祝日',
  }[locale]
}

export async function generateAlmanacCalendar(
  types: AlmanacCalendarType[],
  locale: AlmanacCalendarLocale,
): Promise<string> {
  const startDate = todayInShanghai()
  const endDate = addDays(startDate, ALMANAC_CALENDAR_DAYS - 1)
  const currentDate = new Date(`${startDate}T12:00:00Z`)
  const lastModified = new Date()
  const events: string[] = []

  while (currentDate.toISOString().slice(0, 10) <= endDate) {
    const date = currentDate.toISOString().slice(0, 10)
    const solar = Solar.fromYmd(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth() + 1,
      currentDate.getUTCDate(),
    )
    const lunar = solar.getLunar()
    const dayStart = compactDate(date)
    const dayEnd = compactDate(addDays(date, 1))

    for (const kind of ['yi', 'ji'] as const) {
      if (!types.includes(kind)) continue
      const values = textValues(kind === 'yi' ? lunar.getDayYi() : lunar.getDayJi())
      if (!values.length) continue
      const label = kind === 'yi' ? '宜' : '忌'
      const summaryValues = values.slice(0, 6)
      const summaryTail = values.length > summaryValues.length ? ` +${values.length - summaryValues.length}` : ''
      events.push([
        'BEGIN:VEVENT',
        `UID:almanac-${kind}-${dayStart}@ososn.com`,
        `DTSTAMP:${icsStamp(lastModified)}`,
        `DTSTART;VALUE=DATE:${dayStart}`,
        `DTEND;VALUE=DATE:${dayEnd}`,
        `SUMMARY:${icsEscape(`${label}: ${summaryValues.join('/')}${summaryTail}`)}`,
        `DESCRIPTION:${icsEscape(`${label}: ${values.join('、')}`)}`,
        'END:VEVENT',
      ].join('\r\n'))
    }

    if (types.includes('festivals')) {
      const rawFestivals = [...textValues(solar.getFestivals()), ...textValues(lunar.getFestivals())]
      const solarTerm = lunar.getJieQi() || ''
      const entries = [
        ...rawFestivals.map(name => ({ name, kind: 'festival' as const })),
        ...(solarTerm && SOLAR_TERMS.has(solarTerm) ? [{ name: solarTerm, kind: 'solar-term' as const }] : []),
      ]

      for (const entry of entries) {
        const name = await localize(entry.name, locale)
        events.push([
          'BEGIN:VEVENT',
          `UID:almanac-${entry.kind}-${dayStart}-${stableId(entry.name)}@ososn.com`,
          `DTSTAMP:${icsStamp(lastModified)}`,
          `DTSTART;VALUE=DATE:${dayStart}`,
          `DTEND;VALUE=DATE:${dayEnd}`,
          `SUMMARY:${icsEscape(name)}`,
          `DESCRIPTION:${icsEscape(eventKindLabel(entry.kind, locale))}`,
          'END:VEVENT',
        ].join('\r\n'))
      }
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ososn//Almanac Calendar Subscription//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(calendarName(types, locale))}`,
    'X-WR-TIMEZONE:Asia/Shanghai',
    ...events,
    'END:VCALENDAR',
  ]

  return `${lines.join('\r\n')}\r\n`
}
