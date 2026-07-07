import type { Pillar } from '~/types/bazi'
import type { TianGan, DiZhi } from '~/types/user'
import {
  TIAN_GAN,
  DI_ZHI,
  ZHI_CANGGAN,
  getShiShen,
} from './constants'
import {
  getYearPillar,
  getMonthPillar,
  getDayPillar,
  getHourPillar,
} from './calendar'

export function calcPillars(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  gender: 'male' | 'female',
): {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
  riZhu: TianGan
  liChunBorder: boolean
  monthJieBorder: boolean
  ziShiBorder: boolean
} {
  // 年柱
  const yPillar = getYearPillar(year, month, day)
  // 月柱
  const mPillar = getMonthPillar(yPillar.gan, year, month, day)
  // 日柱
  const dPillar = getDayPillar(year, month, day)

  const yearPillar: Pillar = {
    gan: yPillar.gan as TianGan,
    zhi: yPillar.zhi as DiZhi,
    shishen: getShiShen(dPillar.gan, yPillar.gan),
    canggan: ZHI_CANGGAN[yPillar.zhi]!.map(c => ({
      gan: c.gan as TianGan,
      type: c.type,
    })),
  }

  const monthPillar: Pillar = {
    gan: mPillar.gan as TianGan,
    zhi: mPillar.zhi as DiZhi,
    shishen: getShiShen(dPillar.gan, mPillar.gan),
    canggan: ZHI_CANGGAN[mPillar.zhi]!.map(c => ({
      gan: c.gan as TianGan,
      type: c.type,
    })),
  }

  const dayPillar: Pillar = {
    gan: dPillar.gan as TianGan,
    zhi: dPillar.zhi as DiZhi,
    shishen: '日主',
    canggan: ZHI_CANGGAN[dPillar.zhi]!.map(c => ({
      gan: c.gan as TianGan,
      type: c.type,
    })),
  }

  let hourPillar: Pillar | null = null
  let ziShiBorder = false
  if (hour !== null) {
    let effectiveDayGan = dPillar.gan
    if (hour >= 23) {
      const dayGanIdx = TIAN_GAN.indexOf(dPillar.gan as never)
      effectiveDayGan = TIAN_GAN[(dayGanIdx + 1) % 10]!
    }
    const hPillar = getHourPillar(effectiveDayGan, hour)
    ziShiBorder = hPillar.isZiShiBorder

    hourPillar = {
      gan: hPillar.gan as TianGan,
      zhi: hPillar.zhi as DiZhi,
      shishen: getShiShen(dPillar.gan, hPillar.gan),
      canggan: ZHI_CANGGAN[hPillar.zhi]!.map(c => ({
        gan: c.gan as TianGan,
        type: c.type,
      })),
    }
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    riZhu: dPillar.gan as TianGan,
    liChunBorder: yPillar.isLiChunBorder,
    monthJieBorder: mPillar.isJieBorder,
    ziShiBorder,
  }
}
