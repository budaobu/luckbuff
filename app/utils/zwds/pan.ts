import type { TianGan, DiZhi } from '~/types/user'
import type { ZwdsChart, ZwdsGong, ZwdsDaXian, MainStar, AuxStar, GongName } from '~/types/zwds'
import {
  ZHI_ORDER,
  GONG_ORDER,
  ZIWEI_XINGStars,
  TIANFU_XINGStars,
  SI_HUA_RULES,
  getWuXingJu,
  getWenChangPos,
  getWenQuPos,
  getZuoFuPos,
  getYouBiPos,
  getLuCunPos,
  getQingYangPos,
  getTuoLuoPos,
  getTianKuiPos,
  getTianYuePos,
  getHuoXingPos,
  getLingXingPos,
  getDiKongPos,
  getDiJiePos,
  getQiXianAge,
} from './constants'
import { getYearPillar, getMonthZhiIndex } from '../bazi/calendar'

// ========== 辅助函数 ==========

/** 获取地支索引（以寅为0） */
function zhiIdx(zhi: DiZhi): number {
  return ZHI_ORDER.indexOf(zhi)
}

/** 从索引取地支 */
function idxZhi(idx: number): DiZhi {
  return ZHI_ORDER[(idx + 12) % 12]!
}

/** 时辰地支转索引（子=0） */
function hourZhiIdx(hourDizhi: DiZhi): number {
  const map: Record<DiZhi, number> = {
    子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5,
    午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
  }
  return map[hourDizhi]
}

// ========== 核心排盘 ==========

/**
 * 计算紫微斗数命盘
 * @param year 公历年
 * @param month 公历月
 * @param day 公历日
 * @param hourDizhi 出生时辰地支（null 表示未知）
 * @param gender 性别
 */
export function calcZwdsPan(
  year: number,
  month: number,
  day: number,
  hourDizhi: DiZhi | null,
  gender: 'male' | 'female',
): ZwdsChart {
  // --- 1. 计算四柱基础信息 ---
  const yearPillar = getYearPillar(year, month, day)
  const yearGan = yearPillar.gan as TianGan
  const yearZhi = yearPillar.zhi as DiZhi

  const { index: monthJieIdx } = getMonthZhiIndex(year, month, day)
  // 农历月（寅=1，卯=2...）
  const lunarMonth = (monthJieIdx + 2) % 12 || 12
  // 简化：用公历日作为农历日近似
  const lunarDay = day

  // --- 2. 确定命宫和身宫 ---
  // 命宫：寅起正月顺数生月，再逆数生时
  // 身宫：寅起正月顺数生月，再顺数生时
  let mingIdx: number
  let shenIdx: number

  if (hourDizhi) {
    const hourIdx = hourZhiIdx(hourDizhi)
    // 寅起正月顺数到生月：寅(1月)=0, 卯(2月)=1...
    const monthStartIdx = (lunarMonth - 1)
    // 命宫：从生月宫位逆数生时
    mingIdx = (monthStartIdx - hourIdx + 12) % 12
    // 身宫：从生月宫位顺数生时
    shenIdx = (monthStartIdx + hourIdx) % 12
  } else {
    // 时辰未知：命宫默认在卯宫（简化），身宫在酉宫对位
    mingIdx = 1
    shenIdx = 7
  }

  // --- 3. 排布十二宫 ---
  // 以命宫为起点，逆时针排列十二宫
  const gongs: ZwdsGong[] = []
  for (let i = 0; i < 12; i++) {
    const zhiIdxVal = (mingIdx - i + 12) % 12
    gongs.push({
      name: GONG_ORDER[i]!,
      zhi: idxZhi(zhiIdxVal),
      mainStars: [],
      auxStars: [],
      siHua: [],
      isMing: i === 0,
      isShen: zhiIdxVal === shenIdx,
    })
  }

  // 按地支索引重新组织，方便安星
  const gongByZhi = new Map<number, ZwdsGong>()
  for (const g of gongs) {
    gongByZhi.set(zhiIdx(g.zhi), g)
  }

  // --- 4. 安紫微星 ---
  // 简化版：根据生日和五行局数确定紫微位置
  // 五行局由命宫天干决定（需先排天干）
  // 命宫天干 = 用五虎遁年法从年干起，顺数到命宫所在月建位置

  // 先确定命宫天干：年干起寅月，顺数到命宫的地支对应的月建
  // 命宫地支对应的月建索引（寅=0, 卯=1...）
  const mingZhiIdx = mingIdx // 因为命宫地支索引就是 mingIdx
  const ganStartMap: Record<TianGan, number> = {
    甲: 2, 己: 2, 乙: 4, 庚: 4, 丙: 6, 辛: 6, 丁: 8, 壬: 8, 戊: 0, 癸: 0,
  }
  const mingGanIdx = (ganStartMap[yearGan] + mingZhiIdx) % 10
  const mingGan = (['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as TianGan[])[mingGanIdx]!

  // 五行局
  const wuxingJu = getWuXingJu(mingGan)

  // 紫微定位：用生日数除以局数
  // 商 = floor(lunarDay / wuxingJu)
  // 余 = lunarDay % wuxingJu
  // 若余 < wuxingJu / 2：紫微在商位（从寅起顺数）
  // 否则：紫微在商+1位
  const n = lunarDay
  const quotient = Math.floor(n / wuxingJu)
  const remainder = n % wuxingJu
  let ziweiIdx: number
  if (remainder === 0) {
    ziweiIdx = quotient
  } else {
    ziweiIdx = remainder < wuxingJu / 2 ? quotient : quotient + 1
  }
  ziweiIdx = ziweiIdx % 12

  // --- 5. 安天府星 ---
  // 天府与紫微相对：相隔6宫
  const tianfuIdx = (ziweiIdx + 6) % 12

  // --- 6. 安十四正曜 ---
  // 紫微星系（逆时针）
  for (const item of ZIWEI_XINGStars) {
    if (item.star) {
      const pos = (ziweiIdx + item.offset + 12) % 12
      const gong = gongByZhi.get(pos)
      if (gong) gong.mainStars.push(item.star)
    }
  }

  // 天府星系（顺时针）
  for (const item of TIANFU_XINGStars) {
    if (item.star) {
      const pos = (tianfuIdx + item.offset) % 12
      const gong = gongByZhi.get(pos)
      if (gong) gong.mainStars.push(item.star)
    }
  }

  // --- 7. 安辅星 ---
  const auxRules: { star: AuxStar; pos: number }[] = [
    { star: '文昌', pos: getWenChangPos(yearGan) },
    { star: '文曲', pos: getWenQuPos(yearGan) },
    { star: '左辅', pos: getZuoFuPos(lunarMonth) },
    { star: '右弼', pos: getYouBiPos(lunarMonth) },
    { star: '禄存', pos: getLuCunPos(yearGan) },
    { star: '擎羊', pos: getQingYangPos(yearGan) },
    { star: '陀罗', pos: getTuoLuoPos(yearGan) },
    { star: '天魁', pos: getTianKuiPos(yearGan) },
    { star: '天钺', pos: getTianYuePos(yearGan) },
    { star: '火星', pos: getHuoXingPos(yearZhi) },
    { star: '铃星', pos: getLingXingPos(yearZhi) },
    { star: '地空', pos: getDiKongPos(yearZhi) },
    { star: '地劫', pos: getDiJiePos(yearZhi) },
  ]

  for (const rule of auxRules) {
    const gong = gongByZhi.get(rule.pos)
    if (gong) gong.auxStars.push(rule.star)
  }

  // --- 8. 标记四化 ---
  const sihuaRule = SI_HUA_RULES[yearGan]
  const sihuaEntries = Object.entries(sihuaRule) as Array<['禄' | '权' | '科' | '忌', MainStar | AuxStar]>

  for (const [type, star] of sihuaEntries) {
    // 找到该星所在的宫
    for (const g of gongs) {
      if (g.mainStars.includes(star as MainStar) || g.auxStars.includes(star as AuxStar)) {
        g.siHua.push({ type, star })
      }
    }
  }

  // --- 9. 排大限 ---
  const daXians: ZwdsDaXian[] = []
  const isYang = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan)
  const isForward = (isYang && gender === 'male') || (!isYang && gender === 'female')

  const qiXianAge = getQiXianAge(yearZhi)

  for (let i = 0; i < 12; i++) {
    let gongIdx: number
    if (isForward) {
      gongIdx = (mingIdx + i) % 12
    } else {
      gongIdx = (mingIdx - i + 12) % 12
    }

    const gong = gongByZhi.get(gongIdx)!
    const startAge = qiXianAge + i * 10
    const endAge = startAge + 9

    daXians.push({
      index: i + 1,
      gongName: gong.name,
      gongZhi: gong.zhi,
      ageRange: [startAge, endAge] as [number, number],
      mainStars: [...gong.mainStars],
    })
  }

  // --- 10. 当前大限 ---
  const currentAge = new Date().getFullYear() - year
  const currentDaXian = daXians.find(
    d => d.ageRange[0] <= currentAge && d.ageRange[1] >= currentAge,
  ) ?? null

  // 标记当前大限宫位
  if (currentDaXian) {
    const cg = gongByZhi.get(zhiIdx(currentDaXian.gongZhi))
    if (cg) cg.isCurrentDaXian = true
  }

  const mingGong = gongs.find(g => g.isMing)!
  const shenGong = gongs.find(g => g.isShen)!

  return {
    gongs,
    mingGong,
    shenGong,
    daXians,
    yearGan,
    yearZhi,
    gender,
    currentDaXian,
    currentAge,
    wuxingJu,
    lunarDay,
    lunarMonth,
  }
}

// ========== 工具函数 ==========

/** 根据公历年月日返回年柱干支（供表单实时显示） */
export function dateToYearGanZhi(year: number, month: number, day: number): string {
  const { gan, zhi } = getYearPillar(year, month, day)
  return `${gan}${zhi}`
}

/** 获取三方四正宫位（命宫的三合+对宫） */
export function getSanFangSiZheng(mingZhi: DiZhi): DiZhi[] {
  const idx = zhiIdx(mingZhi)
  // 三合：命宫 + 顺4 + 逆4
  const sanHe = [idx, (idx + 4) % 12, (idx - 4 + 12) % 12]
  // 对宫
  const duiGong = (idx + 6) % 12
  return [...sanHe.map(i => idxZhi(i)), idxZhi(duiGong)]
}

/** 获取借对宫星（空宫时借用） */
export function getJieGongXing(gong: ZwdsGong, allGongs: ZwdsGong[]): MainStar[] {
  if (gong.mainStars.length > 0) return gong.mainStars
  const idx = zhiIdx(gong.zhi)
  const duiIdx = (idx + 6) % 12
  const duiGong = allGongs.find(g => zhiIdx(g.zhi) === duiIdx)
  return duiGong ? duiGong.mainStars : []
}
