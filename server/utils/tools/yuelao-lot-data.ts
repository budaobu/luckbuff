import yuelaoLotData from '~~/app/data/yuelao-lots-100.json'

export interface YuelaoLot {
  id: number
  rank: string
  rankCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower'
  poem: string[]
  source: string
}

export interface YuelaoLotResult {
  lotType: {
    id: 'yuelao'
    name: string
    count: number
  }
  fortune: {
    id: number
    rank: string
    rankCode: YuelaoLot['rankCode']
    poem: string
    source: string
  }
}

const yuelaoLotName = {
  'zh-CN': '月老灵签',
  'zh-TW': '月老靈籤',
  en: 'Yuelao Oracle',
  ja: '月老霊籤',
} as const

export const yuelaoLotCount = yuelaoLotData.length

function localeKey(locale: string): keyof typeof yuelaoLotName {
  return locale === 'zh-TW' || locale === 'en' || locale === 'ja' ? locale : 'zh-CN'
}

function lotType(locale: string) {
  const loc = localeKey(locale)
  return {
    id: 'yuelao' as const,
    name: yuelaoLotName[loc],
    count: yuelaoLotData.length,
  }
}

function fortune(lot: YuelaoLot): YuelaoLotResult['fortune'] {
  return {
    id: lot.id,
    rank: lot.rank,
    rankCode: lot.rankCode,
    poem: lot.poem.join('\n'),
    source: lot.source,
  }
}

export function getYuelaoLot(id: number, locale = 'zh-CN') {
  const lot = yuelaoLotData.find(item => item.id === id) as YuelaoLot | undefined
  if (!lot) {
    throw createError({ statusCode: 404, statusMessage: 'Yuelao lot not found' })
  }
  return {
    lotType: lotType(locale),
    fortune: fortune(lot),
    locale,
  }
}

export function drawYuelaoLot(locale = 'zh-CN') {
  const id = Math.floor(Math.random() * yuelaoLotData.length) + 1
  return getYuelaoLot(id, locale)
}
