// ============================================================
// 奇门遁甲排盘计算器
// ============================================================

import type { Palace, QimenPan, YinYang } from './types'
import {
  YANG_DUN_DI_PAN, YIN_DUN_DI_PAN,
  LUO_SHU_SHUN, LUO_SHU_NI,
  JIU_XING, XING_DI_PAN,
  BA_MEN_ORDER, MEN_DI_PAN,
  BA_SHEN, GONG_DIRECTION, GONG_NAME,
  GAN_INDEX, ZHI_INDEX, DI_ZHI,
} from './constants'
import { getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi, getCurrentJieqi, determineJuNumber, getXunShou, getJiaZiIndex } from './ganzhi'

/**
 * 获取某干在指定地盘中的宫位
 */
function getGongOfStem(stem: string, diPan: Record<number, string>): number {
  for (const [gong, gan] of Object.entries(diPan)) {
    if (gan === stem) return Number(gong)
  }
  return 2 // 默认坤宫
}

/**
 * 获取旬首对应的六仪
 * 甲子→戊, 甲戌→己, 甲申→庚, 甲午→辛, 甲辰→壬, 甲寅→癸
 */
function getXunShouYiLi(xunShou: string): string {
  const map: Record<string, string> = {
    '甲子': '戊', '甲戌': '己', '甲申': '庚',
    '甲午': '辛', '甲辰': '壬', '甲寅': '癸',
  }
  return map[xunShou] || '戊'
}

/**
 * 在洛书序中查找某宫的下一步/上一步
 */
function luoShuNext(gong: number, order: number[]): number {
  const idx = order.indexOf(gong)
  if (idx < 0) return gong
  return order[(idx + 1) % order.length] || gong
}

function luoShuPrev(gong: number, order: number[]): number {
  const idx = order.indexOf(gong)
  if (idx < 0) return gong
  return order[(idx - 1 + order.length) % order.length] || gong
}

/**
 * 按洛书序生成飞布序列
 */
function luoShuSequence(startGong: number, count: number, order: number[]): number[] {
  const result: number[] = []
  let current = startGong
  for (let i = 0; i < count; i++) {
    result.push(current)
    const idx = order.indexOf(current)
    if (idx < 0) {
      // 中5宫不在洛书序中，从坎1宫继续
      current = order[0]!
    } else {
      current = order[(idx + 1) % order.length]!
    }
  }
  return result
}

/**
 * 排天盘：从值符宫开始按洛书序飞布九星
 * 值符星位置 = 时干所在地盘宫
 */
function arrangeTianPan(
  diPan: Record<number, string>,
  zhiFuGong: number,
  yinYang: YinYang,
  shiGan: string,
): Record<number, Xing> {
  // 时干所在宫 = 值符星当前位置
  const shiGanGong = getGongOfStem(shiGan, diPan)

  // 九星顺序（按洛书序的地盘位置）
  const xingByGong: Record<number, string> = {}
  for (const [xing, gong] of Object.entries(XING_DI_PAN)) {
    xingByGong[gong] = xing
  }

  // 值符星
  const zhiFuXing = xingByGong[zhiFuGong] || '天蓬'

  // 九星排列顺序（从值符星开始）
  const xingOrder: string[] = []
  const zhiFuIdx = Math.max(0, JIU_XING.indexOf(zhiFuXing))
  for (let i = 0; i < 9; i++) {
    xingOrder.push(JIU_XING[(zhiFuIdx + i) % 9] || '')
  }

  // 从时干所在宫开始飞布
  const order = yinYang === 'yang' ? LUO_SHU_SHUN : LUO_SHU_NI
  const gongs = luoShuSequence(shiGanGong, 9, order)

  const tianPan: Record<number, string> = {}
  for (let i = 0; i < 9; i++) {
    const g = gongs[i]
    if (g != null) tianPan[g] = xingOrder[i] || ''
  }

  return tianPan as Record<number, Xing>
}

/**
 * 排八门：从值使宫开始按洛书序飞布八门
 * 值使门 = 值符宫的地盘门
 * 值使宫 = 值使门的地盘位置
 * 从值使宫开始，按时辰数顺/逆飞布
 */
function arrangeMen(
  zhiFuGong: number,
  yinYang: YinYang,
  shiZhi: string,
): Record<number, string | null> {
  // 值使门 = 值符宫的地盘门
  const zhiShiMen = Object.entries(MEN_DI_PAN).find(([, gong]) => gong === zhiFuGong)?.[0] || '休门'

  // 值使宫 = 值使门的地盘位置
  const zhiShiGong = MEN_DI_PAN[zhiShiMen] || 1

  // 时辰索引（子=0, 丑=1, ..., 亥=11）
  const zhiIdx = ZHI_INDEX[shiZhi] ?? 0

  // 从值使宫开始，按时辰数飞布
  const order = yinYang === 'yang' ? LUO_SHU_SHUN : LUO_SHU_NI
  let currentGong: number = zhiShiGong
  for (let i = 0; i < zhiIdx; i++) {
    const idx = order.indexOf(currentGong)
    if (idx < 0) break
    currentGong = order[(idx + 1) % order.length] || currentGong
  }

  // 当前时辰值使门所在宫
  const currentZhiShiGong = currentGong

  // 八门排列顺序（从值使门开始）
  const menOrder: string[] = []
  const zhiShiIdx = Math.max(0, BA_MEN_ORDER.indexOf(zhiShiMen))
  for (let i = 0; i < 8; i++) {
    menOrder.push(BA_MEN_ORDER[(zhiShiIdx + i) % 8] || '')
  }

  // 从当前值使宫开始飞布八门
  const gongs = luoShuSequence(currentZhiShiGong, 8, order)

  const men: Record<number, string | null> = {}
  // 先清空
  for (let g = 1; g <= 9; g++) men[g] = null

  for (let i = 0; i < 8; i++) {
    const g = gongs[i]
    if (g != null) men[g] = menOrder[i] || null
  }
  // 中5宫无门
  men[5] = null

  return men
}

/**
 * 排八神：从值符宫开始，阳遁顺飞，阴遁逆飞
 */
function arrangeShen(
  zhiFuGong: number,
  yinYang: YinYang,
): Record<number, string> {
  const order = yinYang === 'yang' ? LUO_SHU_SHUN : LUO_SHU_NI
  const gongs = luoShuSequence(zhiFuGong, 8, order)

  const shen: Record<number, string> = {}
  for (let i = 0; i < 8; i++) {
    const g = gongs[i]
    if (g != null) shen[g] = BA_SHEN[i] || ''
  }
  // 中5宫寄坤2
  shen[5] = shen[2] || ''

  return shen
}

/**
 * 天盘干：值符随时干，九星所在宫的天盘干 = 该星原宫的地盘干
 * 简化：天盘干 = 值符宫的地盘干 随时干宫开始顺/逆飞布
 */
function arrangeTianPanGan(
  diPan: Record<number, string>,
  zhiFuGong: number,
  yinYang: YinYang,
  shiGan: string,
): Record<number, string> {
  // 值符宫的地盘干
  const zhiFuGan = diPan[zhiFuGong] || '戊'

  // 从时干所在宫开始
  const shiGanGong = getGongOfStem(shiGan, diPan)

  const order = yinYang === 'yang' ? LUO_SHU_SHUN : LUO_SHU_NI
  const gongs = luoShuSequence(shiGanGong, 9, order)

  // 天盘干顺序：从值符干开始，按六仪三奇顺序
  const ganOrder = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙']
  const startIdx = Math.max(0, ganOrder.indexOf(zhiFuGan || '戊'))

  const tianPanGan: Record<number, string> = {}
  for (let i = 0; i < 9; i++) {
    const g = gongs[i]
    if (g != null) tianPanGan[g] = ganOrder[(startIdx + i) % 9] || ''
  }

  return tianPanGan
}

/**
 * 主排盘函数
 */
export function generateQimenPan(date: Date): QimenPan {
  // 1. 计算四柱
  const yearGZ = getYearGanZhi(date)
  const monthGZ = getMonthGanZhi(date, yearGZ)
  const dayGZ = getDayGanZhi(date)
  const hourGZ = getHourGanZhi(date, dayGZ)

  // 2. 确定节气和局数
  const jieqi = getCurrentJieqi(date)
  const { juShu, yinYang } = determineJuNumber(jieqi, dayGZ)

  // 3. 排地盘
  const diPan = (yinYang === 'yang'
    ? YANG_DUN_DI_PAN[juShu]
    : YIN_DUN_DI_PAN[juShu])!

  // 4. 确定旬首和值符宫
  const xunShou = getXunShou(hourGZ)
  const xunShouYiLi = getXunShouYiLi(xunShou)
  const zhiFuGong = getGongOfStem(xunShouYiLi, diPan)

  // 5. 确定值使宫
  const zhiShiMen = Object.entries(MEN_DI_PAN).find(([, gong]) => gong === zhiFuGong)?.[0] || '休门'
  const zhiShiGong = MEN_DI_PAN[zhiShiMen] || 1

  // 6. 排天盘星
  const tianPanXing = arrangeTianPan(diPan, zhiFuGong, yinYang, hourGZ.charAt(0))

  // 7. 排八门
  const men = arrangeMen(zhiFuGong, yinYang, hourGZ.charAt(1))

  // 8. 排八神
  const shen = arrangeShen(zhiFuGong, yinYang)

  // 9. 排天盘干
  const tianPanGan = arrangeTianPanGan(diPan, zhiFuGong, yinYang, hourGZ.charAt(0))

  // 10. 组装九宫
  const palaces: Palace[] = []
  for (let gong = 1; gong <= 9; gong++) {
    palaces.push({
      gong,
      direction: GONG_DIRECTION[gong] || '',
      dipan: (diPan[gong] || '戊') as any,
      tianpan: (tianPanGan[gong] || '戊') as any,
      men: (men[gong] as any) || null,
      xing: (tianPanXing[gong] || '天蓬') as any,
      shen: (shen[gong] || '值符') as any,
      isZhiFu: gong === zhiFuGong,
      isZhiShi: gong === zhiShiGong,
    })
  }

  return {
    juShu,
    yinYang,
    shiGanzhi: hourGZ,
    riGanzhi: dayGZ,
    jieqi: jieqi.name,
    palaces,
    zhiFuGong,
    zhiShiGong: zhiShiGong,
  }
}
