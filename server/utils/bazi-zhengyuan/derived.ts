import type { TianGan, DiZhi } from '~/types/user'
import type { Pillar, WuxingScore } from '~/types/bazi'
import { GAN_WUXING, GAN_YANG, ZHI_WUXING, ZHI_YANG, ZHI_CANGGAN, WUXING_SHENG, WUXING_KE } from '~/utils/bazi/constants'
import { getShiShenFull } from '~/utils/bazi/shishen'

// ---- 神煞与关系查表（主流口径） ----

const LIU_CHONG: Record<string, string> = {
  子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅',
  卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
}

const LIU_HE: Record<string, string> = {
  子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午',
}

const SAN_HE_JU: Record<string, string[]> = {
  水: ['申', '子', '辰'], 木: ['亥', '卯', '未'],
  火: ['寅', '午', '戌'], 金: ['巳', '酉', '丑'],
}

// 五行天干五合
const GAN_WU_HE: Record<string, string> = {
  甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙',
  丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊',
}

// 咸池桃花（年支或日支查）
const TAO_HUA: Record<string, string> = {
  申: '酉', 子: '酉', 辰: '酉',
  寅: '卯', 午: '卯', 戌: '卯',
  巳: '午', 酉: '午', 丑: '午',
  亥: '子', 卯: '子', 未: '子',
}

// 红鸾（年支查）：卯起子年逆行
const HONG_LUAN: Record<string, string> = {
  子: '卯', 丑: '寅', 寅: '丑', 卯: '子', 辰: '亥', 巳: '戌',
  午: '酉', 未: '申', 申: '未', 酉: '午', 戌: '巳', 亥: '辰',
}

// 天喜（红鸾对冲位）
const TIAN_XI: Record<string, string> = Object.fromEntries(
  Object.entries(HONG_LUAN).map(([k, v]) => [k, LIU_CHONG[v]!]),
)

// 阴差阳错日
const YINCHA_YANGCUO = new Set([
  '丙子', '丁丑', '戊寅', '辛卯', '壬辰', '癸巳',
  '丙午', '丁未', '戊申', '辛酉', '壬戌', '癸亥',
])

// 孤鸾煞日（主流四日说）
const GU_LUAN = new Set(['乙巳', '丁巳', '辛亥', '戊申'])

// 魁罡日
const KUI_GANG = new Set(['庚辰', '庚戌', '壬辰', '戊戌'])

// 干支表
const TIAN_GAN_ARR = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const DI_ZHI_ARR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

function ganzhiOfYear(year: number): { gan: TianGan; zhi: DiZhi } {
  const gan = TIAN_GAN_ARR[(year - 4) % 10]!
  const zhi = DI_ZHI_ARR[(year - 4) % 12]!
  return { gan, zhi }
}

function zhiOfGanZhi(p: { gan: string; zhi: string }): DiZhi {
  return p.zhi as DiZhi
}

// ---- 结果类型 ----

export interface TimingYear {
  year: number
  ganZhi: string
  age: number
  score: number
  reasons: string[]
}

export interface MarriageProfile {
  /** 夫妻宫（日支） */
  spousePalace: {
    zhi: DiZhi
    wuxing: string
    shiShen: string
    peachBlossom: boolean
    chongBy: string[]
    heWith: string[]
  }
  /** 配偶星（男命财星 / 女命官杀） */
  spouseStar: {
    kind: '正财' | '偏财' | '正官' | '七杀'
    wuxing: string
    found: boolean
    locations: string[]
    strength: 'strong' | 'weak' | 'hidden' | 'absent'
    isFavorable: boolean
    position: 'year' | 'month' | 'day' | 'hour' | 'hidden' | 'absent'
  }
  /** 婚姻早晚 */
  marriageTiming: {
    tendency: 'early' | 'late' | 'neutral'
    signals: string[]
  }
  /** 感情稳定性信号 */
  stability: {
    riskSignals: string[]
    goodSignals: string[]
  }
  /** 桃花 */
  peachBlossom: {
    star: DiZhi
    positions: string[]
    innerWall: boolean
    outerWall: boolean
  }
  /** 红鸾天喜 */
  hongLuan: {
    star: DiZhi
    palace: string | null
  }
  tianXi: {
    star: DiZhi
    palace: string | null
  }
  /** 配偶细节 */
  spouseDetails: {
    appearance: string
    ageGap: 'older' | 'similar' | 'younger'
    supportiveness: 'supportive' | 'neutral' | 'draining'
    direction: string
    meetChannel: 'far' | 'near' | 'unknown'
  }
  /** 相处模式 */
  relationshipDynamics: {
    pattern: 'partnerLeads' | 'selfLeads' | 'balanced' | 'clashing'
    note: string
  }
  /** 应期年份（未来若干年婚恋机会评分） */
  timingYears: TimingYear[]
}

// ---- 计算 ----

const PILLAR_LABELS: Record<string, string> = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }

function shiShenOfGan(riGan: string, gan: string): string {
  return getShiShenFull(riGan, gan)
}

function shiShenOfZhi(riGan: string, zhi: string): string {
  const benqi = ZHI_CANGGAN[zhi]?.find(c => c.type === '本气')
  return benqi ? getShiShenFull(riGan, benqi.gan) : '未知'
}

function xiyongList(xiyong: string): string[] {
  return xiyong.split(/[、,，\s]+/).filter(Boolean)
}

function jishenList(jishen: string): string[] {
  return jishen.split(/[、,，\s]+/).filter(Boolean)
}

export function deriveMarriageProfile(input: {
  gender: 'male' | 'female'
  birthYear: number
  chart: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
    riZhu: TianGan
    wuxingScore: WuxingScore
    xiyong: string
    jishen: string
  }
}): MarriageProfile {
  const { gender, birthYear, chart } = input
  const riGan = chart.riZhu
  const riWx = GAN_WUXING[riGan]!
  const xi = xiyongList(chart.xiyong)
  const ji = jishenList(chart.jishen)

  const pillars: { key: 'year' | 'month' | 'day' | 'hour'; p: Pillar }[] = [
    { key: 'year', p: chart.year },
    { key: 'month', p: chart.month },
    { key: 'day', p: chart.day },
    ...(chart.hour ? [{ key: 'hour' as const, p: chart.hour }] : []),
  ]

  const yearZhi = zhiOfGanZhi(chart.year)
  const dayZhi = zhiOfGanZhi(chart.day)
  const dayGanZhi = `${chart.day.gan}${chart.day.zhi}`

  // ---- 夫妻宫 ----
  const palaceChongBy: string[] = []
  const palaceHeWith: string[] = []
  for (const { key, p } of pillars) {
    if (key === 'day') continue
    if (LIU_CHONG[dayZhi] === p.zhi) palaceChongBy.push(PILLAR_LABELS[key]!)
    if (LIU_HE[dayZhi] === p.zhi) palaceHeWith.push(PILLAR_LABELS[key]!)
  }
  const taoHuaStar = TAO_HUA[dayZhi] as DiZhi

  const spousePalace = {
    zhi: dayZhi,
    wuxing: ZHI_WUXING[dayZhi]!,
    shiShen: shiShenOfZhi(riGan, dayZhi),
    peachBlossom: TAO_HUA[yearZhi] === dayZhi || TAO_HUA[dayZhi] === dayZhi,
    chongBy: palaceChongBy,
    heWith: palaceHeWith,
  }

  // ---- 配偶星 ----
  const isMale = gender === 'male'
  // 男：财星（我克者）；女：官杀（克我者）
  const spouseWx = isMale ? WUXING_KE[riWx]! : Object.keys(WUXING_KE).find(k => WUXING_KE[k] === riWx)!
  const sameYang = GAN_YANG[riGan]
  // 同阴阳：男=偏财、女=七杀；异阴阳：男=正财、女=正官
  const spouseKindZheng = isMale ? '正财' : '正官'
  const spouseKindPian = isMale ? '偏财' : '七杀'

  const locations: string[] = []
  let zhengCount = 0
  let pianCount = 0
  let inYearMonth = false
  let inHour = false
  let nearDay = false
  let hiddenCount = 0

  for (const { key, p } of pillars) {
    if (p.gan !== riGan) {
      const ss = shiShenOfGan(riGan, p.gan)
      if (ss === spouseKindZheng || ss === spouseKindPian) {
        locations.push(`${PILLAR_LABELS[key]}天干${p.gan}（${ss}）`)
        if (ss === spouseKindZheng) zhengCount++
        else pianCount++
        if (key === 'year' || key === 'month') inYearMonth = true
        if (key === 'hour') inHour = true
        if (key === 'month' || key === 'hour') nearDay = true
      }
    }
    // 藏干（只统计本气与中气，余气权重低仅提示）
    for (const cg of ZHI_CANGGAN[p.zhi] || []) {
      if (cg.gan === riGan) continue
      const ss = shiShenOfGan(riGan, cg.gan)
      if ((ss === spouseKindZheng || ss === spouseKindPian) && cg.type !== '余气') {
        hiddenCount++
        if (key === 'day' && cg.type === '本气') nearDay = true
      }
    }
  }
  // 日支本气即配偶星：夫妻宫坐配偶星
  const dayBenqiSs = spousePalace.shiShen
  const palaceHasStar = dayBenqiSs === spouseKindZheng || dayBenqiSs === spouseKindPian

  const found = zhengCount + pianCount > 0 || hiddenCount > 0
  const spouseStrength: MarriageProfile['spouseStar']['strength'] =
    zhengCount + pianCount >= 2 ? 'strong'
    : zhengCount + pianCount === 1 ? (hiddenCount > 0 ? 'strong' : 'weak')
    : hiddenCount > 0 ? 'hidden'
    : 'absent'
  const spouseIsFavorable = xi.includes(spouseWx)
  const spousePosition: MarriageProfile['spouseStar']['position'] =
    inYearMonth ? (zhengCount + pianCount > 0 && !nearDay && !inHour ? 'year' : 'month')
    : palaceHasStar ? 'day'
    : inHour ? 'hour'
    : hiddenCount > 0 ? 'hidden'
    : 'absent'

  const spouseStar: MarriageProfile['spouseStar'] = {
    kind: zhengCount > 0 ? (spouseKindZheng as '正财' | '正官') : (spouseKindPian as '偏财' | '七杀'),
    wuxing: spouseWx,
    found,
    locations,
    strength: spouseStrength,
    isFavorable: spouseIsFavorable,
    position: spousePosition,
  }

  // ---- 婚姻早晚 ----
  const timingSignals: string[] = []
  let earlyScore = 0
  if (inYearMonth) { earlyScore++; timingSignals.push('配偶星现于年月柱') }
  if (palaceHeWith.length > 0) { earlyScore++; timingSignals.push(`夫妻宫与${palaceHeWith.join('、')}相合`) }
  if (inHour && !inYearMonth) { earlyScore--; timingSignals.push('配偶星迟至时柱方现') }
  if (spouseStrength === 'weak' || spouseStrength === 'absent') { earlyScore--; timingSignals.push('配偶星偏弱或不显') }
  if (palaceChongBy.length > 0) { earlyScore--; timingSignals.push(`夫妻宫逢${palaceChongBy.join('、')}来冲`) }
  const marriageTendency: MarriageProfile['marriageTiming']['tendency'] =
    earlyScore >= 2 ? 'early' : earlyScore <= -1 ? 'late' : 'neutral'

  // ---- 稳定性信号 ----
  const riskSignals: string[] = []
  const goodSignals: string[] = []

  // 比劫夺财（男）/ 伤官见官（女）
  let biJie = 0
  let shangGan = false
  let zhengGan = false
  for (const { p } of pillars) {
    if (p.gan !== riGan) {
      const ss = shiShenOfGan(riGan, p.gan)
      if (ss === '比肩' || ss === '劫财') biJie++
      if (ss === '伤官') shangGan = true
      if (ss === '正官') zhengGan = true
    }
  }
  // 日主本身也算一份比劫力量参考不计；以天干再见为准
  if (isMale && biJie >= 2) riskSignals.push('比劫重重（感情中竞争与自我意识偏强）')
  if (!isMale && shangGan && zhengGan) riskSignals.push('伤官见官（对伴侣易挑剔、言语易起冲突）')
  if (!isMale && shangGan && !zhengGan && spouseStrength === 'hidden') riskSignals.push('伤官透干而官星藏（标准偏高）')
  if (YINCHA_YANGCUO.has(dayGanZhi)) riskSignals.push(`日柱${dayGanZhi}为阴差阳错日`)
  if (GU_LUAN.has(dayGanZhi)) riskSignals.push(`日柱${dayGanZhi}为孤鸾日`)
  if (KUI_GANG.has(dayGanZhi)) riskSignals.push(`日柱${dayGanZhi}为魁罡日（性情刚直）`)
  if (palaceChongBy.length > 0) riskSignals.push(`夫妻宫逢冲（${palaceChongBy.join('、')}）`)
  if (spouseStrength === 'absent') riskSignals.push('配偶星不透不藏（需大运流年引动）')
  if (pianCount >= 2) riskSignals.push(isMale ? '偏财多见（感情选择多、心性不定）' : '七杀多见（感情中压力感与强势缘分偏多）')
  if (spouseIsFavorable && found) goodSignals.push('配偶星为喜用神（婚姻对自身有助益）')
  if (zhengCount === 1 && pianCount === 0) goodSignals.push(`正星清纯一位（${spouseKindZheng}）`)
  if (palaceHasStar) goodSignals.push('夫妻宫坐配偶星（婚缘贴身为用）')
  if (palaceHeWith.length > 0) goodSignals.push(`夫妻宫逢合（${palaceHeWith.join('、')}）`)
  if (chart.day.gan && GAN_WU_HE[riGan] && pillars.some(({ key, p }) => key !== 'day' && p.gan === GAN_WU_HE[riGan])) {
    goodSignals.push(`日主与${GAN_WU_HE[riGan]}干五合（自身易得情缘吸引）`)
  }

  // ---- 桃花 ----
  const taoHuaPositions: string[] = []
  for (const { key, p } of pillars) {
    if (p.zhi === taoHuaStar) taoHuaPositions.push(PILLAR_LABELS[key]!)
  }
  const peachBlossom: MarriageProfile['peachBlossom'] = {
    star: taoHuaStar,
    positions: taoHuaPositions,
    innerWall: taoHuaPositions.includes('年柱') || taoHuaPositions.includes('月柱'),
    outerWall: taoHuaPositions.includes('日柱') || taoHuaPositions.includes('时柱'),
  }

  // ---- 红鸾天喜 ----
  const hongLuanStar = HONG_LUAN[yearZhi] as DiZhi
  const tianXiStar = TIAN_XI[yearZhi] as DiZhi
  const palaceOfZhi = (z: DiZhi): string | null => {
    const hit = pillars.find(({ p }) => p.zhi === z)
    return hit ? PILLAR_LABELS[hit.key]! : null
  }

  // ---- 配偶细节 ----
  const appearanceMap: Record<string, string> = {
    木: '身形修长、气质清秀',
    火: '明艳有神、举止利落',
    土: '敦厚稳重、面相方圆',
    金: '轮廓分明、肤白气质冷',
    水: '圆润灵动、眼波有神',
  }
  const appearance = appearanceMap[spouseWx]!

  const ageGap: MarriageProfile['spouseDetails']['ageGap'] =
    inYearMonth ? 'older' : (inHour && !inYearMonth) ? 'younger' : 'similar'

  const supportiveness: MarriageProfile['spouseDetails']['supportiveness'] =
    spouseIsFavorable && spouseStrength !== 'absent' ? 'supportive'
    : ji.includes(spouseWx) ? 'draining'
    : 'neutral'

  const directionMap: Record<string, string> = {
    木: '东方', 火: '南方', 土: '本地或中部', 金: '西方', 水: '北方',
  }
  const direction = directionMap[spouseWx]!

  const meetChannel: MarriageProfile['spouseDetails']['meetChannel'] =
    spousePosition === 'year' ? 'far' : (nearDay || palaceHasStar) ? 'near' : 'unknown'

  // ---- 相处模式 ----
  const riScore = chart.wuxingScore[riWx as keyof WuxingScore] ?? 20
  const spouseScore = chart.wuxingScore[spouseWx as keyof WuxingScore] ?? 20
  let pattern: MarriageProfile['relationshipDynamics']['pattern']
  if (palaceChongBy.length > 0 || (isMale && biJie >= 2) || (!isMale && shangGan && zhengGan)) pattern = 'clashing'
  else if (spouseScore >= riScore + 10) pattern = 'partnerLeads'
  else if (riScore >= spouseScore + 10) pattern = 'selfLeads'
  else pattern = 'balanced'
  const patternNote: Record<typeof pattern, string> = {
    partnerLeads: '配偶星偏旺，关系中对方气场较强，容易以对方节奏为主',
    selfLeads: '日主一方偏旺，关系中你更占主导，也更容易忽略对方感受',
    balanced: '双方力量大体均衡，关系容易走向商量着来的相处模式',
    clashing: '命局带冲战信号，相处中容易有硬碰硬的时刻，需要刻意练习柔软',
  }

  // ---- 应期评分（当前年起未来 15 年） ----
  const currentYear = new Date().getFullYear()
  const timingYears: TimingYear[] = []
  for (let y = currentYear; y < currentYear + 15; y++) {
    const { gan, zhi } = ganzhiOfYear(y)
    const age = y - birthYear
    const reasons: string[] = []
    let score = 0

    // 流年与日柱天合地合
    if (LIU_HE[dayZhi] === zhi && GAN_WU_HE[riGan] === gan) {
      score += 3
      reasons.push('与日柱天合地合')
    }
    else {
      if (LIU_HE[dayZhi] === zhi) { score += 2; reasons.push('流年合动夫妻宫') }
      if (GAN_WU_HE[riGan] === gan) { score += 1; reasons.push('流年干与日主五合') }
    }
    if (LIU_CHONG[dayZhi] === zhi) { score += 1; reasons.push('流年冲动夫妻宫（动则有机，亦有波动）') }
    for (const ju of Object.values(SAN_HE_JU)) {
      if (ju.includes(dayZhi) && ju.includes(zhi) && dayZhi !== zhi) {
        score += 1
        reasons.push('流年与夫妻宫三合')
        break
      }
    }
    // 配偶星透干
    if (gan !== riGan) {
      const ss = shiShenOfGan(riGan, gan)
      if (ss === spouseKindZheng) { score += 2; reasons.push(`流年透${spouseKindZheng}`) }
      else if (ss === spouseKindPian) { score += 1; reasons.push(`流年透${spouseKindPian}`) }
    }
    // 红鸾天喜值年
    if (zhi === hongLuanStar) { score += 2; reasons.push('红鸾星值年') }
    if (zhi === tianXiStar) { score += 2; reasons.push('天喜星值年') }
    // 桃花值年
    if (zhi === taoHuaStar) { score += 1; reasons.push('桃花运值年') }

    timingYears.push({ year: y, ganZhi: `${gan}${zhi}`, age, score, reasons })
  }

  return {
    spousePalace,
    spouseStar,
    marriageTiming: { tendency: marriageTendency, signals: timingSignals },
    stability: { riskSignals, goodSignals },
    peachBlossom,
    hongLuan: { star: hongLuanStar, palace: palaceOfZhi(hongLuanStar) },
    tianXi: { star: tianXiStar, palace: palaceOfZhi(tianXiStar) },
    spouseDetails: {
      appearance,
      ageGap,
      supportiveness,
      direction,
      meetChannel,
    },
    relationshipDynamics: { pattern, note: patternNote[pattern] },
    timingYears,
  }
}
