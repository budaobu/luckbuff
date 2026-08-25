// 皇极经世·值年卦 确定性计算核心
//
// 纪元锚点（已交叉验证，详见 docs/huangji-zhiniangua-algorithm.md）：
//   帝尧元年 = 甲辰 = 公元前2357年（天文纪年 -2356）
//   来源1：祝泌《皇极经世解》用卦案例（zhouyi64.com/newsnw/id/1075）
//         「唐尧于二千一百五十六世岁次甲辰(公元前2357年)即位」
//   来源2：知乎《以皇极经世历法计算2022年》积年换算
//         尧元年积年 = 67017 - 2357 + 1 = 64661（元起点公元前67017年）
//   锚点年值年卦 = 雷火丰（六十卦序列 index 12）：
//   来源1：njmingdinghui《皇极经世年卦表(1984到2043值年卦)》2024甲辰=雷火丰
//   来源2：suhe.space《值年卦及其推算法》从元起点逐层推得1984=鼎、2024=丰
//   桥接：BC2357 与 2024 同为甲辰，相距 4380 = 73×60 年整，
//         扁平六十卦循环下两年同卦，故尧元年 = 丰。
//   备注：祝泌层叠法尧元年岁卦为大有，属另一推演体系（60年一重置），
//         与本工具采用的连续扁平循环口径不同，已与用户确认采用丰。

import { getGuaById, getYaoArray } from '~/utils/zhouyi/constants'
import { getYaoci } from '~/utils/zhouyi/yaoci'

// 先天六十四卦圆图去乾坤坎离四正卦后的六十卦循环（复…剥），以卦 id 表示
export const GUA60: number[] = [
  24, 27, 3, 42, 51, 21, 17, 25, 36, 22,
  63, 37, 55, 49, 13, 19, 41, 60, 61, 54,
  38, 58, 10, 11, 26, 5, 9, 34, 14, 43,
  44, 28, 50, 32, 57, 48, 18, 46, 6, 47,
  64, 40, 59, 4, 7, 33, 31, 56, 62, 53,
  39, 52, 15, 12, 45, 35, 16, 20, 8, 23,
]

// 锚点：公元前2357年（天文纪年 -2356）= 六十卦序列 index 12（丰）
// index(Y) = (Y + 2356 + 12) mod 60 = (Y + 2368) mod 60
const ANCHOR_OFFSET = 2368

// 皇极经世积年：元起点公元前67017年，公元Y年积年 = 67017 + Y
const JINIAN_BASE = 67017

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export interface ZhinianguaResult {
  year: number
  ganzhi: string
  jinian: number
  guaIndex: number
  gua: {
    id: number
    name: string
    meaning: string
    guaci: string
    yaoArray: number[]
  }
  shi: {
    startYear: number
    endYear: number
    yearInShi: number
  }
  yao: {
    position: number
    label: string
    text: string
    dangWei: boolean
  }
  dashi: string
}

const YAO_POS_NAMES = ['初', '二', '三', '四', '五', '上']

// 大势走向：按爻位 × 当位与否的确定性模板
function buildDashi(pos: number, dangWei: boolean, guaName: string): string {
  const stage = [
    '一世之初，基业始立，万物萌发而未彰',
    '世运渐启，崭露头角，居中得道而渐兴',
    '世至中段，多忧多惧，进退之际变革酝酿',
    '世过半程，近权近势，机遇与戒惧并存',
    '世运鼎盛，居尊得中，大势如日方中天',
    '一世之终，盛极将衰，物极必反宜思变',
  ][pos - 1]
  const tone = dangWei
    ? '爻当其位，顺天应时，此五年大势稳中向好'
    : '爻不当位，时位相违，此五年大势波折中前行，宜守不宜躁'
  return `${stage}。值年卦${guaName}，${tone}。`
}

export function calcZhiniangua(year: number): ZhinianguaResult {
  const guaIndex = ((year + ANCHOR_OFFSET) % 60 + 60) % 60
  const guaId = GUA60[guaIndex]!
  const guaInfo = getGuaById(guaId)
  if (!guaInfo) throw new Error(`GUA60 序列存在无效卦 id: ${guaId}`)

  const jinian = JINIAN_BASE + year
  const yearInShi = (jinian - 1) % 30 + 1
  const yaoPosition = Math.ceil(yearInShi / 5)

  const yaoArray = getYaoArray(guaInfo)
  const isYang = yaoArray[yaoPosition - 1] === 1
  const yinYang = isYang ? '九' : '六'
  const label = yaoPosition === 1
    ? `初${yinYang}`
    : yaoPosition === 6
      ? `上${yinYang}`
      : `${yinYang}${YAO_POS_NAMES[yaoPosition - 1]}`
  const dangWei = yaoPosition % 2 === 1 ? isYang : !isYang

  const yaoci = getYaoci(guaId, yaoPosition)
  if (!yaoci) throw new Error(`缺少爻辞数据: 卦${guaId} 爻${yaoPosition}`)

  const gzIndex = ((year - 4) % 60 + 60) % 60

  return {
    year,
    ganzhi: `${GAN[gzIndex % 10]}${ZHI[gzIndex % 12]}`,
    jinian,
    guaIndex,
    gua: {
      id: guaInfo.id,
      name: guaInfo.name,
      meaning: guaInfo.meaning,
      guaci: guaInfo.guaci,
      yaoArray,
    },
    shi: {
      startYear: year - (yearInShi - 1),
      endYear: year - (yearInShi - 1) + 29,
      yearInShi,
    },
    yao: {
      position: yaoPosition,
      label,
      text: yaoci,
      dangWei,
    },
    dashi: buildDashi(yaoPosition, dangWei, guaInfo.name),
  }
}
