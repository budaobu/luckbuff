import type { BaziChart, Pillar } from '~/types/bazi'
import type {
  MangpaiCalcResult,
  MangpaiGod,
  MangpaiGodName,
  MangpaiLiunian,
  MangpaiShensha,
} from '~/types/mangpai-bazi'
import type { DiZhi, TianGan } from '~/types/user'
import { DI_ZHI, GAN_WUXING, getShiShen } from '~/utils/bazi/constants'
import { calcPillars } from '~/utils/bazi/pillars'
import { calcDaYun } from '~/utils/bazi/dayun'
import {
  calcGeJu,
  calcRiZhuStrength,
  calcWuxingScore,
  calcXiYongJiShen,
} from '~/utils/bazi/analysisCalc'
import { getMonthZhiIndex } from '~/utils/bazi/calendar'
import { getDiZhiRelation } from '~~/server/utils/bazi'
import { getYearGanZhi } from '~/utils/liunian'
import { MANGPAI_GODS } from '~/types/mangpai-bazi'

const GOD_NAMES = MANGPAI_GODS as readonly MangpaiGodName[]

function branchIndex(branch: DiZhi): number {
  const index = DI_ZHI.indexOf(branch)
  if (index < 0) throw new Error(`Invalid earthly branch: ${branch}`)
  return index
}

export function calcMangpaiShensha(
  pillars: Array<Pillar | null>,
  flowYear: number,
): MangpaiShensha {
  const { gan, zhi } = getYearGanZhi(flowYear)
  const flowBranch = zhi as DiZhi
  const start = branchIndex(flowBranch)

  const ring: MangpaiGod[] = DI_ZHI.map((_, offset) => ({
    branch: DI_ZHI[(start + offset) % 12]!,
    name: GOD_NAMES[offset]!,
  }))

  const godOf = (branch: DiZhi): MangpaiGodName =>
    GOD_NAMES[(branchIndex(branch) - start + 12) % 12]!

  const natal = pillars
    .filter((pillar): pillar is Pillar => Boolean(pillar))
    .map(pillar => ({
      ...pillar,
      god: godOf(pillar.zhi),
    }))

  return {
    flowYearBranch: flowBranch,
    rule: '以流年地支起太岁，按十二支自然顺行；命局各支对号入座。',
    ring,
    natal,
  }
}

export function calcMangpaiBazi(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHourDizhi: DiZhi | null,
  gender: 'male' | 'female',
): MangpaiCalcResult {
  const hourMap: Record<DiZhi, number> = {
    子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
    午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
  }
  const hour = birthHourDizhi ? hourMap[birthHourDizhi] : null
  const pillars = calcPillars(birthYear, birthMonth, birthDay, hour, gender)

  const partialChart: BaziChart = {
    year: pillars.year,
    month: pillars.month,
    day: pillars.day,
    hour: pillars.hour,
    riZhu: pillars.riZhu,
    riZhuStrength: '身弱',
    wuxingScore: { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 },
    geju: '',
    xiyong: '',
    jishen: '',
    dayuns: [],
    qiyunAge: 0,
    currentAge: Math.max(0, new Date().getFullYear() - birthYear),
    currentDaYun: null,
  }

  partialChart.wuxingScore = calcWuxingScore(partialChart)
  partialChart.riZhuStrength = calcRiZhuStrength(
    partialChart.riZhu,
    partialChart.month.zhi,
    partialChart.wuxingScore,
  )
  const { xiyong, jishen } = calcXiYongJiShen(
    partialChart.riZhu,
    partialChart.riZhuStrength,
    partialChart.wuxingScore,
  )
  partialChart.xiyong = xiyong
  partialChart.jishen = jishen
  partialChart.geju = calcGeJu(partialChart)

  const { index: monthZhiIdx } = getMonthZhiIndex(birthYear, birthMonth, birthDay)
  const { dayuns, qiyunAge } = calcDaYun(
    partialChart.year.gan,
    partialChart.month.gan,
    partialChart.month.zhi,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    monthZhiIdx,
  )
  partialChart.dayuns = dayuns
  partialChart.qiyunAge = qiyunAge
  partialChart.currentDaYun = dayuns.find(
    d => partialChart.currentAge >= d.ageRange[0]
      && partialChart.currentAge <= d.ageRange[1],
  ) ?? null

  const currentYear = new Date().getFullYear()
  const shensha = calcMangpaiShensha(
    [
      partialChart.year,
      partialChart.month,
      partialChart.day,
      partialChart.hour,
    ],
    currentYear,
  )

  const liunian: MangpaiLiunian[] = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear + i
    const yearGanZhi = getYearGanZhi(year)
    const gan = yearGanZhi.gan as TianGan
    const zhi = yearGanZhi.zhi as DiZhi
    const relation = getDiZhiRelation(partialChart.day.zhi, zhi)

    return {
      year,
      gan,
      zhi,
      shishen: getShiShen(partialChart.riZhu, gan),
      relations: relation.relations,
      god: GOD_NAMES[(branchIndex(zhi) - branchIndex(shensha.flowYearBranch) + 12) % 12]!,
    }
  })

  const flowGanZhi = getYearGanZhi(currentYear)

  return {
    chart: partialChart,
    dayMaster: {
      gan: partialChart.riZhu,
      wuxing: GAN_WUXING[partialChart.riZhu] ?? '',
    },
    currentYear,
    flowYear: {
      year: currentYear,
      gan: flowGanZhi.gan as TianGan,
      zhi: flowGanZhi.zhi as DiZhi,
    },
    liunian,
    shensha,
  }
}
