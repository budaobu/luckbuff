import { LIUSHISI_GUA, getGuaById, getYaoArray } from '~/utils/zhouyi/constants'
import { getYaoci } from '~/utils/zhouyi/yaoci'

export interface HuangjiPaipanHexagram {
  id: number
  name: string
  meaning: string
  guaci: string
  yaoArray: number[]
}

export interface HuangjiPaipanYao {
  position: number
  label: string
  text: string
  dangWei: boolean
}

export interface HuangjiPaipanPeriod {
  number: number
  label: string
  range: string
  yearInRange: number
}

export interface HuangjiPaipanResult {
  year: number
  ganzhi: string
  jinian: number
  chronology: {
    yuan: HuangjiPaipanPeriod
    hui: HuangjiPaipanPeriod
    yun: HuangjiPaipanPeriod
    shi: HuangjiPaipanPeriod
  }
  layers: {
    yuan: HuangjiPaipanHexagram
    seasonPrincipal: HuangjiPaipanHexagram
    term: HuangjiPaipanHexagram
    hui: HuangjiPaipanHexagram
    duty2160: HuangjiPaipanHexagram
    yun360: HuangjiPaipanHexagram
    rawJiazi60: HuangjiPaipanHexagram
    jiazi60: HuangjiPaipanHexagram
    decade: HuangjiPaipanHexagram
    annual: HuangjiPaipanHexagram
  }
  positions: {
    yearInYuan: number
    yearInSeason: number
    termLine: number
    yearInTerm: number
    yearInDuty: number
    yunLine: number
    yearInYun: number
    jiaziLine: number
    yearInJiazi: number
    decadeLine: number
    yearInJiaziCycle: number
    annualIndex: number
  }
  adjustments: {
    jiaziStartSkippedPrincipal: boolean
  }
  yao: HuangjiPaipanYao
  methodology: {
    scheme: string
    evidenceLevel: string
    calendar: string
    cycle: string
    order: string
  }
}

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const YAO_NAMES = ['初', '二', '三', '四', '五', '上']

const YEARS_PER_YUAN = 129600
const YEARS_PER_HUI = 10800
const YEARS_PER_YUN = 360
const YEARS_PER_SHI = 30
const YEARS_PER_SEASON = 32400
const YEARS_PER_TERM = 5400
const YEARS_PER_DUTY = 2160
const YEARS_PER_JIAZI = 60
const JINIAN_BASE = 67017

// 伏羲先天圆图方向：坤 0、坎 18、离 45、乾 63 为四正卦。
const FUXI_CIRCLE = [
  31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 17, 16, 15,
  14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 32,
  33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49,
  50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,
]
const PRINCIPAL_CODES = new Set([0, 18, 45, 63])
const GUA60_CODES = FUXI_CIRCLE.filter(code => !PRINCIPAL_CODES.has(code))
const DUTY_CODES = (() => {
  const start = GUA60_CODES.indexOf(32)
  if (start < 0) throw new Error('六十卦序列缺少复卦')
  return [...GUA60_CODES.slice(start), ...GUA60_CODES.slice(0, start)]
})()
const SEASON_PRINCIPAL_CODES = [45, 63, 18, 0] as const
const HUI_CODES = [32, 48, 56, 60, 62, 63, 31, 15, 7, 3, 1, 0] as const

const CODE_TO_GUA_ID = new Map<number, number>(
  LIUSHISI_GUA.map((gua) => {
    const code = getYaoArray(gua).reduce((value, yao) => value * 2 + yao, 0)
    return [code, gua.id]
  }),
)

function toHexagram(codeOrId: number, source: 'code' | 'id' = 'code'): HuangjiPaipanHexagram {
  const id = source === 'id' ? codeOrId : CODE_TO_GUA_ID.get(codeOrId)
  const gua = id === undefined ? undefined : getGuaById(id)
  if (!gua) throw new Error(`无效卦象: ${codeOrId}`)
  return { id: gua.id, name: gua.name, meaning: gua.meaning, guaci: gua.guaci, yaoArray: getYaoArray(gua) }
}

function codeOf(hexagram: HuangjiPaipanHexagram) {
  return hexagram.yaoArray.reduce((value, yao) => value * 2 + yao, 0)
}

function flipLine(hexagram: HuangjiPaipanHexagram, line: number) {
  if (line < 1 || line > 6) throw new Error(`爻位超出范围: ${line}`)
  const yao = [...hexagram.yaoArray]
  yao[line - 1] = yao[line - 1] === 1 ? 0 : 1
  const code = yao.reduce((value, item) => value * 2 + item, 0)
  return toHexagram(code)
}

function advanceInGua60(start: HuangjiPaipanHexagram, offset: number) {
  const currentIndex = DUTY_CODES.indexOf(codeOf(start))
  if (currentIndex < 0) throw new Error(`六十卦序列缺少卦: ${start.name}`)
  const index = ((currentIndex + offset) % 60 + 60) % 60
  return toHexagram(DUTY_CODES[index]!)
}

function makeYao(hexagram: HuangjiPaipanHexagram, position: number): HuangjiPaipanYao {
  const isYang = hexagram.yaoArray[position - 1] === 1
  const yinYang = isYang ? '九' : '六'
  const label = position === 1
    ? `初${yinYang}`
    : position === 6
      ? `上${yinYang}`
      : `${yinYang}${YAO_NAMES[position - 1]}`
  const text = getYaoci(hexagram.id, position)
  if (!text) throw new Error(`缺少爻辞: 卦${hexagram.id} 爻${position}`)
  return {
    position,
    label,
    text,
    dangWei: position % 2 === 1 ? isYang : !isYang,
  }
}

function period(number: number, unit: string, length: number, startYear: number, yearInRange: number): HuangjiPaipanPeriod {
  return {
    number,
    label: `${unit} ${number}`,
    range: `${startYear}-${startYear + length - 1}`,
    yearInRange,
  }
}

export function calcHuangjiPaipan(year: number): HuangjiPaipanResult {
  if (!Number.isSafeInteger(year) || year < 1900 || year > 2100) {
    throw new Error('Year out of range (1900-2100)')
  }

  const jinian = JINIAN_BASE + year
  const year0 = jinian - 1
  const yuan0 = Math.floor(year0 / YEARS_PER_YUAN)
  const yuanInner = year0 % YEARS_PER_YUAN
  const hui0 = Math.floor(yuanInner / YEARS_PER_HUI)
  const huiInner = yuanInner % YEARS_PER_HUI
  const yun0 = Math.floor(yuanInner / YEARS_PER_YUN)
  const yunInner = yuanInner % YEARS_PER_YUN
  const shi0 = Math.floor(yuanInner / YEARS_PER_SHI)
  const shiInner = yuanInner % YEARS_PER_SHI

  const yuanStartYear = year - yuanInner
  const huiStartYear = year - huiInner
  const yunStartYear = year - yunInner
  const shiStartYear = year - shiInner

  const season0 = Math.floor(yuanInner / YEARS_PER_SEASON)
  const seasonInner = yuanInner % YEARS_PER_SEASON
  const termLine = Math.floor(seasonInner / YEARS_PER_TERM) + 1
  const termInner = seasonInner % YEARS_PER_TERM
  const seasonPrincipal = toHexagram(SEASON_PRINCIPAL_CODES[season0]!)
  const term = flipLine(seasonPrincipal, termLine)

  const hui = toHexagram(HUI_CODES[hui0]!)
  const dutyBlock = Math.floor(yuanInner / YEARS_PER_DUTY)
  const dutyInner = yuanInner % YEARS_PER_DUTY
  const dutyHexagram = toHexagram(CODE_TO_GUA_ID.get(DUTY_CODES[dutyBlock]!)!, 'id')

  const yunLine = Math.floor(dutyInner / YEARS_PER_YUN) + 1
  const yunInnerActual = dutyInner % YEARS_PER_YUN
  const yun = flipLine(dutyHexagram, yunLine)
  const jiaziLine = Math.floor(yunInnerActual / YEARS_PER_JIAZI) + 1
  const yearInJiazi = yunInnerActual % YEARS_PER_JIAZI
  const rawJiazi = flipLine(yun, jiaziLine)
  const skipped = PRINCIPAL_CODES.has(codeOf(rawJiazi))
  let jiaziStart = rawJiazi
  if (skipped) {
    const rawIndex = FUXI_CIRCLE.indexOf(codeOf(rawJiazi))
    let nextIndex = (rawIndex + 1) % FUXI_CIRCLE.length
    while (PRINCIPAL_CODES.has(FUXI_CIRCLE[nextIndex]!)) {
      nextIndex = (nextIndex + 1) % FUXI_CIRCLE.length
    }
    jiaziStart = toHexagram(FUXI_CIRCLE[nextIndex]!)
  }
  const annualIndex = DUTY_CODES.indexOf(codeOf(jiaziStart)) + yearInJiazi
  const annual = advanceInGua60(jiaziStart, yearInJiazi)

  const decadeLine = Math.floor(yearInJiazi / 10) + 1
  const decade = flipLine(jiaziStart, decadeLine)
  const yaoPosition = Math.ceil((shiInner + 1) / 5)

  const gzIndex = ((year - 4) % 60 + 60) % 60

  return {
    year,
    ganzhi: `${GAN[gzIndex % 10]}${ZHI[gzIndex % 12]}`,
    jinian,
    chronology: {
      yuan: period(yuan0 + 1, GAN[yuan0 % 10]!, YEARS_PER_YUAN, yuanStartYear, yuanInner + 1),
      hui: period(hui0 + 1, ZHI[hui0]!, YEARS_PER_HUI, huiStartYear, huiInner + 1),
      yun: period(yun0 + 1, GAN[yun0 % 10]!, YEARS_PER_YUN, yunStartYear, yunInner + 1),
      shi: period(shi0 + 1, ZHI[shi0 % 12]!, YEARS_PER_SHI, shiStartYear, shiInner + 1),
    },
    layers: {
      yuan: toHexagram(32),
      seasonPrincipal,
      term,
      hui,
      duty2160: dutyHexagram,
      yun360: yun,
      rawJiazi60: rawJiazi,
      jiazi60: jiaziStart,
      decade,
      annual,
    },
    positions: {
      yearInYuan: yuanInner + 1,
      yearInSeason: seasonInner + 1,
      termLine,
      yearInTerm: termInner + 1,
      yearInDuty: dutyInner + 1,
      yunLine,
      yearInYun: yunInnerActual + 1,
      jiaziLine,
      yearInJiazi: yearInJiazi + 1,
      decadeLine,
      yearInJiaziCycle: yearInJiazi + 1,
      annualIndex: annualIndex % 60 + 1,
    },
    adjustments: {
      jiaziStartSkippedPrincipal: skipped,
    },
    yao: makeYao(annual, yaoPosition),
    methodology: {
      scheme: '马曾 2020 现代年度配卦 + 传世元会运世骨架',
      evidenceLevel: '现代重构（年度配卦）；原文明载（元会运世骨架）',
      calendar: '公历历史纪年；皇极积年 = 67017 + 公元年',
      cycle: '1元=12会=360运=4320世=129600年；1世=30年',
      order: '先天圆图顺时针，去除乾坤坎离后六十卦循环',
    },
  }
}

export function compactHuangjiPaipanContext(result: HuangjiPaipanResult): string {
  const layers = Object.entries(result.layers).map(([key, gua]) => `${key}:${gua.name}`)
  return [
    `年份：${result.year}（${result.ganzhi}）；皇极积年：${result.jinian}`,
    `元：${result.chronology.yuan.label}，第${result.chronology.yuan.yearInRange}年；会：${result.chronology.hui.label}，第${result.chronology.hui.yearInRange}年`,
    `运：${result.chronology.yun.label}，第${result.chronology.yun.yearInRange}年；世：${result.chronology.shi.label}，第${result.chronology.shi.yearInRange}年`,
    `层级卦：${layers.join('；')}`,
    `60年卦调整：${result.adjustments.jiaziStartSkippedPrincipal ? '原始世卦落四正，年度起点跳过' : '无需跳过'}`,
    `值爻：${result.yao.label}（${result.yao.dangWei ? '当位' : '不当位'}）${result.yao.text}`,
    `口径：${result.methodology.scheme}；${result.methodology.order}`,
  ].join('\n')
}
