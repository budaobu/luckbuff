interface FormDateParts {
  year: number
  month: number
  day: number
}

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>()

function resolveDateLocale(locale: string) {
  if (locale === 'en') return 'en-US'
  if (locale === 'zh-TW') return 'zh-TW'
  if (locale === 'ja') return 'ja-JP'
  if (locale === 'ko') return 'ko-KR'
  return 'zh-CN'
}

export function formatIsoDate(value: string | undefined, locale: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return ''

  const cacheKey = `${resolveDateLocale(locale)}:${value}`
  let formatter = dateFormatterCache.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(resolveDateLocale(locale), {
      dateStyle: 'long',
      timeZone: 'UTC',
    })
    dateFormatterCache.set(cacheKey, formatter)
  }

  const [year, month, day] = (value as string).split('-').map(Number) as [number, number, number]
  return formatter.format(new Date(Date.UTC(year, month - 1, day)))
}

export function parseIsoDateParts(value: string): FormDateParts | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  return { year, month, day }
}
