import { calcBazhai, type BazhaiResult, type Gender } from '~/utils/bazhai'
import {
  getUserPillars,
  getSimplifiedXiYongJiShen,
  type TianGan,
  type Pillar,
} from '~~/server/utils/bazi'
import { GAN_WUXING, ZHI_WUXING } from '~/utils/bazi/constants'

/**
 * 「风水鱼缸」确定性排盘端点。
 *
 * 复用八宅引擎（~/utils/bazhai）+ 八字干支工具（server/utils/bazi）：
 * 命卦、宅卦、八宫星曜、文财位（生气方）、五行喜忌全部确定性计算，
 * AI 只负责解读（reading.post.ts），不参与排盘。
 *
 * 与 tools/fengshui/calc.post.ts 的区别：额外返回八字四柱与简化喜用神，
 * 供鱼缸的鱼色五行配置、水培植物五行、数量吉数等参考。
 */

export type RoomType = 'residence' | 'office' | 'shop'

export interface FishTankCalcResult extends BazhaiResult {
  roomType: RoomType
  floor: number | null
  tankSize: string | null
  dayMasterGan: TianGan
  dayMasterWuxing: string
  xiyong: string
  jishen: string
  wuxingScore: Record<string, number>
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }
  wealth: { star: string; direction: string }
}

const VALID_ROOM_TYPES: RoomType[] = ['residence', 'office', 'shop']

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    direction: number
    birthDate: string
    birthHour?: string
    gender: Gender
    roomType: RoomType
    floor?: number | string
    tankSize?: string
    locale?: string
  }>(event)

  if (body == null || !body.birthDate || typeof body.direction !== 'number' || !body.gender) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid birthDate/direction/gender' })
  }
  if (!Number.isFinite(body.direction) || body.direction < 0 || body.direction > 360) {
    throw createError({ statusCode: 400, statusMessage: 'Direction must be in [0, 360]' })
  }
  if (!VALID_ROOM_TYPES.includes(body.roomType)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid roomType' })
  }

  const date = new Date(body.birthDate)
  if (Number.isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }

  const locale = body.locale || 'zh-CN'
  // 命卦以立春（约 2 月 4 日）为岁首：立春前出生按上一年计
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const effectiveBirthYear = date.getUTCFullYear() - (month < 2 || (month === 2 && day < 4) ? 1 : 0)

  const bazhai = calcBazhai(body.direction, effectiveBirthYear, body.gender, locale)

  // 八字五行喜忌（确定性，不经过 AI）
  const pillars = getUserPillars(body.birthDate, (body.birthHour as any) ?? null)
  const dayMasterGan = pillars.day.gan
  const dayMasterWuxing = GAN_WUXING[dayMasterGan] ?? '木'
  const { xiyong, jishen } = getSimplifiedXiYongJiShen(dayMasterGan)

  // 五行分布（四柱天干+地支各计 1，供雷达图）
  const wuxingScore: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  const pillarList: (Pillar | null)[] = [pillars.year, pillars.month, pillars.day, pillars.hour]
  for (const p of pillarList) {
    if (!p) continue
    const gw = GAN_WUXING[p.gan]
    const zw = ZHI_WUXING[p.zhi]
    if (gw) wuxingScore[gw] = (wuxingScore[gw] ?? 0) + 1
    if (zw) wuxingScore[zw] = (wuxingScore[zw] ?? 0) + 1
  }

  // 文财位（理气财位）：生气为首选，缺则取延年
  const shengqi = bazhai.palaces.find(p => p.star === '生气')
  const yannian = bazhai.palaces.find(p => p.star === '延年')
  const wealthStar = shengqi ?? yannian

  // 楼层：可空，空则不返回
  const floorRaw = body.floor
  const floor = floorRaw === undefined || floorRaw === null || floorRaw === ''
    ? null
    : Math.floor(Number(floorRaw))

  const result: FishTankCalcResult = {
    ...bazhai,
    roomType: body.roomType,
    floor: floor !== null && Number.isFinite(floor) ? floor : null,
    tankSize: body.tankSize?.trim() ? body.tankSize.trim().slice(0, 60) : null,
    dayMasterGan,
    dayMasterWuxing,
    xiyong,
    jishen,
    wuxingScore,
    pillars: { year: pillars.year, month: pillars.month, day: pillars.day, hour: pillars.hour },
    wealth: {
      star: wealthStar?.star ?? '生气',
      direction: wealthStar?.direction ?? '东',
    },
  }

  return result
})
