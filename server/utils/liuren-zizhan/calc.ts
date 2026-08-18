// ============================================================
// 六壬字占（小六壬字占）：康熙笔画代月 + 农历日 + 时辰，三数落宫
// 与小六壬「月日时」起课同构：字画起宫 → 日落宫 → 时落宫
// 六宫表复用 xiao-liuren 既有数据，不改动原实现
// ============================================================

import { toLunar } from 'lunar'
import { XIAO_LIUREN_POSITIONS } from '../xiao-liuren/calc'
import { getStrokeCountsWithAIFallback } from '../wuge/strokes'
import type { XiaoLiurenPosition, XiaoLiurenStep } from '~/types/xiao-liuren'
import type { LiurenZizhanChart } from '~/types/liuren-zizhan'

const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function getPosition(index: number): XiaoLiurenPosition {
  return XIAO_LIUREN_POSITIONS[((index % 6) + 6) % 6]!
}

function getHourBranchIndex(date: Date): number {
  return Math.floor(((date.getHours() + 1) % 24) / 2)
}

export async function buildLiurenZizhanChart(char: string, questionTime?: string): Promise<LiurenZizhanChart> {
  const strokesMap = await getStrokeCountsWithAIFallback([char])
  const strokes = strokesMap[char]
  if (!strokes) {
    throw createError({ statusCode: 400, statusMessage: `「${char}」的笔画数暂未收录，请换字` })
  }

  const date = questionTime ? new Date(questionTime) : new Date()
  if (isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid questionTime' })
  }

  const { lunar } = toLunar(date)
  const lunarDay = lunar.day
  const hourBranchIndex = getHourBranchIndex(date)
  const hourBranch = DI_ZHI[hourBranchIndex]!

  // 字画代月起宫（一数起大安）→ 日上起 → 时上起
  const stepChar = ((strokes - 1) % 6 + 6) % 6
  const stepDay = (stepChar + ((lunarDay - 1) % 6 + 6) % 6) % 6
  const finalIndex = (stepDay + hourBranchIndex) % 6

  const steps: XiaoLiurenStep[] = [
    { label: '字画起宫', value: `${strokes}画`, positionIndex: stepChar },
    { label: '日落宫', value: `${lunarDay}日`, positionIndex: stepDay },
    { label: '时落宫', value: `${hourBranch}时`, positionIndex: finalIndex },
  ]

  return {
    char,
    strokes,
    questionTime: date.toISOString(),
    lunarDate: `${lunar.year}年 ${lunar.month}月${lunarDay}日`,
    lunarDay,
    hourBranch,
    steps,
    finalPosition: getPosition(finalIndex),
  }
}
