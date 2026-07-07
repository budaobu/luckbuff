import type { DiZhi } from '~/types/user'
import {
  getUserPillars,
  getDivinationDayPillar,
  getSimplifiedXiYongJiShen,
  getZodiacRelations,
  getShiChenGanZhi,
  getGanRelation,
  getWuxingDirection,
  getWuxingEnergy,
  SHI_CHEN_RANGE,
  type TianGan,
  type Pillar,
} from '~~/server/utils/bazi'

interface CalcInput {
  birthDate: string
  birthHour?: DiZhi | null
  qiguaTime?: string
  scene?: string
  locale?: string
}

type Scene = 'work' | 'business' | 'contract' | 'family' | 'social'

const VALID_SCENES: Scene[] = ['work', 'business', 'contract', 'family', 'social']

interface RenjiItem {
  shengxiao: string
  dizhi: DiZhi
  relations: string[]
  score: number
}

interface JishiItem {
  dizhi: DiZhi
  timeRange: string
  score: number
  reason: string
}

interface FangweiItem {
  direction: string
  wuxing: string
}

interface CalcResult {
  userGanzhi: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
  }
  userZhi: DiZhi[]
  userGan: TianGan[]
  xiyongWuxing: string
  jishenWuxing: string
  qiguaRizhi: DiZhi
  qiguaRigan: TianGan
  wuxingEnergy: {
    wuxing: string
    tendency: 'shun' | 'ni' | 'ping'
    label: string
  }
  renji: {
    yi: RenjiItem[]
    ji: RenjiItem[]
  }
  jishi: {
    ji: JishiItem[]
    xiong: JishiItem[]
  }
  fangwei: {
    ji: FangweiItem[]
    xiong: FangweiItem[]
  }
  scene: Scene
  locale: string
}

function normalizeScene(scene?: string): Scene {
  if (scene && VALID_SCENES.includes(scene as Scene)) return scene as Scene
  return 'work'
}

function parseBirthDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }
  return { year, month, day }
}

function parseQiguaTime(time?: string): Date {
  if (!time) return new Date()
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid qiguaTime' })
  }
  return d
}

export default defineEventHandler(async (event): Promise<CalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })
  }

  parseBirthDate(body.birthDate)
  const qiguaDate = parseQiguaTime(body.qiguaTime)
  const scene = normalizeScene(body.scene)
  const locale = body.locale || 'zh-CN'

  // 第一步：四柱推导
  const userPillars = getUserPillars(body.birthDate, body.birthHour)

  // 第二步：起卦日柱
  const qiguaDay = getDivinationDayPillar(qiguaDate)

  // 第三步：喜用五行（简化版）
  const { xiyong: xiyongWuxing, jishen: jishenWuxing } = getSimplifiedXiYongJiShen(userPillars.day.gan)

  // 第四步：人际关系矩阵
  const zodiacScores = getZodiacRelations(qiguaDay.zhi)
  const sortedZodiac = [...zodiacScores].sort((a, b) => b.score - a.score)
  const yiCutoff = sortedZodiac.find(s => s.score <= 0)?.score ?? Number.NEGATIVE_INFINITY
  const jiCutoff = [...sortedZodiac].reverse().find(s => s.score >= 0)?.score ?? Number.POSITIVE_INFINITY
  const yiZodiac = sortedZodiac.filter(z => z.score > 0 || z.score > yiCutoff).slice(0, 6)
  const jiZodiac = sortedZodiac.filter(z => z.score < 0 || z.score < jiCutoff).slice(-6).reverse()

  // 第五步：吉时推导
  const shiChenList = getShiChenGanZhi(qiguaDay.gan)
  const shiChenScores = shiChenList.map((sz) => {
    const rel = getGanRelation(qiguaDay.gan, sz.gan)
    const shiWx = getWuxingByGan(sz.gan)
    let bonus = 0
    if (shiWx === xiyongWuxing) bonus += 1
    if (shiWx === jishenWuxing) bonus -= 1
    const score = rel.score + bonus
    let reason = `时干${sz.gan}（${shiWx}）${rel.relation}日干，基础 ${rel.score > 0 ? '+' : ''}${rel.score}`
    if (bonus > 0) reason += '；喜用五行加分'
    if (bonus < 0) reason += '；忌神五行减分'
    return {
      dizhi: sz.dizhi,
      timeRange: SHI_CHEN_RANGE[sz.dizhi],
      score,
      reason,
    }
  })

  const sortedJishi = [...shiChenScores].sort((a, b) => b.score - a.score)
  const topScore = sortedJishi[0]?.score ?? 0
  const bottomScore = sortedJishi[sortedJishi.length - 1]?.score ?? 0
  const jiShi = sortedJishi.filter(s => s.score > 0 || (topScore <= 0 && s.score === topScore)).slice(0, 4)
  const xiongShi = sortedJishi.filter(s => s.score < 0 || (bottomScore >= 0 && s.score === bottomScore)).slice(-4).reverse()

  // 第六步：方位推导
  const riGanWuxing = getWuxingByGan(qiguaDay.gan)
  const jiDirections: FangweiItem[] = []
  if (riGanWuxing !== xiyongWuxing) {
    jiDirections.push({ direction: getWuxingDirection(riGanWuxing), wuxing: riGanWuxing })
  }
  jiDirections.push({ direction: getWuxingDirection(xiyongWuxing), wuxing: xiyongWuxing })

  const xiongDirections: FangweiItem[] = [
    { direction: getWuxingDirection(jishenWuxing), wuxing: jishenWuxing },
  ]

  // 第七步：五行能量定性
  const wuxingEnergy = getWuxingEnergy(userPillars.day.gan, xiyongWuxing, jishenWuxing)

  return {
    userGanzhi: userPillars,
    userZhi: [userPillars.year.zhi, userPillars.month.zhi, userPillars.day.zhi, userPillars.hour?.zhi].filter(Boolean) as DiZhi[],
    userGan: [userPillars.year.gan, userPillars.month.gan, userPillars.day.gan, userPillars.hour?.gan].filter(Boolean) as TianGan[],
    xiyongWuxing,
    jishenWuxing,
    qiguaRizhi: qiguaDay.zhi,
    qiguaRigan: qiguaDay.gan,
    wuxingEnergy,
    renji: {
      yi: yiZodiac,
      ji: jiZodiac,
    },
    jishi: {
      ji: jiShi,
      xiong: xiongShi,
    },
    fangwei: {
      ji: jiDirections,
      xiong: xiongDirections,
    },
    scene,
    locale,
  }
})

function getWuxingByGan(gan: TianGan): string {
  const map: Record<string, string> = {
    甲: '木', 乙: '木',
    丙: '火', 丁: '火',
    戊: '土', 己: '土',
    庚: '金', 辛: '金',
    壬: '水', 癸: '水',
  }
  return map[gan] ?? '木'
}
