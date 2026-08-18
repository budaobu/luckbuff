// ============================================================
// 奇门字占：时家奇门起局（复用 generateQimenPan）+ 笔画飞宫取用神宫
// 字宫取法：康熙笔画数 ÷ 9 取余 → 洛书宫位（坎1坤2震3巽4中5乾6兑7艮8离9），中5寄坤2
// ============================================================

import { generateQimenPan } from '../qimen/calculator'
import { GONG_NAME } from '../qimen/constants'
import type { Palace } from '../qimen/types'
import { getStrokeCountsWithAIFallback } from '../wuge/strokes'
import type { QimenZizhanChart, ZizhanPalaceInfo } from '~/types/qimen-zizhan'

function toPalaceInfo(p: Palace): ZizhanPalaceInfo {
  return {
    gong: p.gong,
    gongName: GONG_NAME[p.gong] || '',
    direction: p.direction,
    tianpan: p.tianpan as unknown as string,
    dipan: p.dipan as unknown as string,
    men: p.men,
    xing: p.xing,
    shen: p.shen,
    isZhiFu: p.isZhiFu,
    isZhiShi: p.isZhiShi,
  }
}

// 甲遁于六仪之下，天盘无甲；日/时干为甲时以值符宫为用（值符即甲之化身，值符随时干）
function findGongByTianpan(palaces: Palace[], gan: string, zhiFuGong: number): number {
  if (gan === '甲') return zhiFuGong
  return palaces.find(p => (p.tianpan as unknown as string) === gan)?.gong ?? zhiFuGong
}

export async function buildZizhanChart(char: string, questionTime?: string): Promise<QimenZizhanChart> {
  const strokesMap = await getStrokeCountsWithAIFallback([char])
  const strokes = strokesMap[char]
  if (!strokes) {
    throw createError({ statusCode: 400, statusMessage: `「${char}」的笔画数暂未收录，请换字` })
  }

  const date = questionTime ? new Date(questionTime) : new Date()
  if (isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid questionTime' })
  }
  const pan = generateQimenPan(date)

  const ziGongRaw = strokes % 9 === 0 ? 9 : strokes % 9
  const ziGong = ziGongRaw === 5 ? 2 : ziGongRaw

  const riGanGong = findGongByTianpan(pan.palaces, pan.riGanzhi.charAt(0), pan.zhiFuGong)
  const shiGanGong = findGongByTianpan(pan.palaces, pan.shiGanzhi.charAt(0), pan.zhiFuGong)

  const palaceOf = (gong: number) => toPalaceInfo(pan.palaces.find(p => p.gong === gong)!)

  return {
    char,
    strokes,
    questionTime: date.toISOString(),
    pan,
    ziGongRaw,
    ziGong,
    riGanGong,
    shiGanGong,
    ziPalace: palaceOf(ziGong),
    riPalace: palaceOf(riGanGong),
    shiPalace: palaceOf(shiGanGong),
  }
}
