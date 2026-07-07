import { toLunar } from 'lunar'
import type {
  XiaoLiurenMethod,
  XiaoLiurenPosition,
  XiaoLiurenRequest,
  XiaoLiurenResult,
  XiaoLiurenStep,
} from '~/types/xiao-liuren'

export const XIAO_LIUREN_POSITIONS: XiaoLiurenPosition[] = [
  {
    name: '大安',
    index: 0,
    finger: '食指根节',
    meaning: '安稳、静止、吉',
    summary: '凡谋事主一、五、七，大安事事昌。',
  },
  {
    name: '留连',
    index: 1,
    finger: '食指尖',
    meaning: '拖延、反复、难决',
    summary: '凡谋事主二、八，留连事难成。',
  },
  {
    name: '速喜',
    index: 2,
    finger: '中指尖',
    meaning: '快速、喜庆、好消息',
    summary: '凡谋事主三、六、九，速喜喜来临。',
  },
  {
    name: '赤口',
    index: 3,
    finger: '无名指尖',
    meaning: '口舌、官非、惊险',
    summary: '凡谋事主四、七、十，赤口主口舌。',
  },
  {
    name: '小吉',
    index: 4,
    finger: '无名指根节',
    meaning: '小利、和合、平顺',
    summary: '凡谋事主一、五、七，小吉最吉昌。',
  },
  {
    name: '空亡',
    index: 5,
    finger: '中指根节',
    meaning: '虚无、落空、不利',
    summary: '凡谋事主三、六、九，空亡事不祥。',
  },
]

const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function getPosition(index: number): XiaoLiurenPosition {
  return XIAO_LIUREN_POSITIONS[((index % 6) + 6) % 6]!
}

function getHourBranchIndex(date: Date): number {
  // 用当地时间的小时推算时辰：23-1 子，1-3 丑，...
  const h = date.getHours()
  // 23-1 -> 子 (0); 1-3 -> 丑 (1); ...
  return Math.floor(((h + 1) % 24) / 2)
}

function numberToPositionIndex(n: number): number {
  // 数字 1 对应大安 (index 0)
  return ((n - 1) % 6 + 6) % 6
}

function calculateByCounts(counts: [number, number, number]): { finalIndex: number; steps: XiaoLiurenStep[] } {
  const [a, b, c] = counts
  const stepA = numberToPositionIndex(a)
  const stepB = (stepA + ((b - 1) % 6 + 6) % 6) % 6
  const finalIndex = (stepB + ((c - 1) % 6 + 6) % 6) % 6

  const steps: XiaoLiurenStep[] = [
    { label: '首数落宫', value: a, positionIndex: stepA },
    { label: '次数落宫', value: b, positionIndex: stepB },
    { label: '末数落宫', value: c, positionIndex: finalIndex },
  ]

  return { finalIndex, steps }
}

function calcByTime(datetime?: string, timezone?: string): Omit<XiaoLiurenResult, 'method' | 'input'> {
  const now = new Date()
  const date = datetime ? new Date(datetime) : now

  // 使用 lunar 库将阳历转为农历
  const { lunar } = toLunar(date)
  const lunarMonth = lunar.month
  const lunarDay = lunar.day
  const hourBranchIndex = getHourBranchIndex(date)
  const hourBranch = DI_ZHI[hourBranchIndex]!

  const stepMonth = numberToPositionIndex(lunarMonth)
  const stepDay = (stepMonth + numberToPositionIndex(lunarDay)) % 6
  const finalIndex = (stepDay + hourBranchIndex) % 6

  const steps: XiaoLiurenStep[] = [
    { label: '月起宫', value: `${lunarMonth}月`, positionIndex: stepMonth },
    { label: '日落宫', value: `${lunarDay}日`, positionIndex: stepDay },
    { label: '时落宫', value: `${hourBranch}时`, positionIndex: finalIndex },
  ]

  return {
    finalPosition: getPosition(finalIndex),
    steps,
    timeContext: {
      solarDate: date.toISOString(),
      lunarDate: `${lunar.year}年 ${lunarMonth}月${lunarDay}日`,
      lunarMonth,
      lunarDay,
      hourBranch,
      hourBranchIndex,
    },
  }
}

function calcByNumber(numbers: [number, number, number]): Omit<XiaoLiurenResult, 'method' | 'input'> {
  const { finalIndex, steps } = calculateByCounts(numbers)
  return {
    finalPosition: getPosition(finalIndex),
    steps,
    numberContext: { numbers },
  }
}

function calcByCharacter(text: string): Omit<XiaoLiurenResult, 'method' | 'input'> {
  const normalized = text.trim()
  if (!normalized) throw new Error('请输入汉字')

  // 采用多维度哈希把汉字映射为三个数字
  const chars = Array.from(normalized)
  const charCount = chars.length

  let codeSum = 0
  let strokeEstimate = 0
  for (const ch of chars) {
    const cp = ch.codePointAt(0) || 0
    codeSum += cp
    // 粗略笔画估计：对常用汉字按 Unicode 区段给个默认值，避免依赖大字典
    if (cp >= 0x4e00 && cp <= 0x9fff) {
      strokeEstimate += 8
    } else {
      strokeEstimate += 1
    }
  }

  const a = ((charCount - 1) % 6) + 1
  const b = ((codeSum - 1) % 6) + 1
  const c = ((strokeEstimate - 1) % 6) + 1
  const numbers: [number, number, number] = [a, b, c]

  const { finalIndex, steps } = calculateByCounts(numbers)

  return {
    finalPosition: getPosition(finalIndex),
    steps,
    characterContext: {
      text: normalized,
      charCount,
      strokeHint: `字数 ${charCount}、码点和 ${codeSum}、估算笔画 ${strokeEstimate}`,
    },
  }
}

export function calculateXiaoLiuren(payload: XiaoLiurenRequest): XiaoLiurenResult {
  const base = {
    input: {
      question: payload.question,
      gender: payload.gender,
      birthYear: payload.birthYear,
    },
  }

  if (payload.method === 'time') {
    return { method: 'time', ...calcByTime(payload.datetime, payload.timezone), ...base }
  }

  if (payload.method === 'number') {
    return { method: 'number', ...calcByNumber(payload.numbers), ...base }
  }

  return { method: 'character', ...calcByCharacter(payload.text), ...base }
}

export { XIAO_LIUREN_POSITIONS as POSITIONS }
