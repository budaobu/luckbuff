import type { BaziChart } from '~/types/bazi'
import { GAN_WUXING, TIAN_GAN, DI_ZHI, ZHI_WUXING, WUXING_SHENG, WUXING_KE, getShiShen } from './constants'

// 日主性格描述
const RIZHU_PERSONALITY: Record<string, string> = {
  甲: '甲木参天，有向上进取之心，仁慈正直，有领导力。为人宽厚，有主见，不轻易妥协。',
  乙: '乙木柔韧，善于适应环境，心思细腻，有艺术气质。为人温和，懂得变通，外柔内刚。',
  丙: '丙火太阳，热情开朗，光明磊落，有感染力。为人热心，喜欢表达，有奉献精神。',
  丁: '丁火灯烛，心思缜密，专注执着，有洞察力。为人内敛，注重细节，有工匠精神。',
  戊: '戊土城墙，稳重踏实，诚信可靠，有包容力。为人厚道，做事有条理，善于积累。',
  己: '己土田园，温和细腻，善于协调，有服务精神。为人谦逊，适应力强，懂得配合。',
  庚: '庚金斧钺，刚毅果断，有正义感，敢于挑战。为人直率，重义气，有开拓精神。',
  辛: '辛金珠宝，精致细腻，追求完美，有品位。为人内敛，注重形象，有审美能力。',
  壬: '壬水江河，智慧灵动，胸怀宽广，善于谋略。为人机智，适应力强，有包容心。',
  癸: '癸水雨露，温柔细腻，善解人意，有直觉力。为人含蓄，感知敏锐，有艺术天赋。',
}

// 五行旺衰补充描述
const WUXING_DESC: Record<string, Record<string, string>> = {
  身旺: {
    木: '木气旺盛，精力充沛，有开拓精神。注意避免过于刚强固执。',
    火: '火气充沛，热情积极，行动力强。注意避免急躁冲动。',
    土: '土气厚重，稳重踏实，有承载力。注意避免过于保守迟钝。',
    金: '金气锐利，果断坚毅，有执行力。注意避免过于冷酷固执。',
    水: '水气充盈，智慧灵动，善于应变。注意避免过于多变不定。',
  },
  身弱: {
    木: '木气不足，需要培养自信，多接触绿色植物、木质物品有助运势。',
    火: '火气偏弱，需要增强热情，多接触阳光、红色物品有助运势。',
    土: '土气薄弱，需要增强定力，多接触大地、黄色物品有助运势。',
    金: '金气欠缺，需要培养决断力，多接触金属、白色物品有助运势。',
    水: '水气不足，需要增强智慧，多接触水景、黑色物品有助运势。',
  },
  从强: {
    木: '从木之势，顺势而为，木旺则发。宜从事与木相关的行业。',
    火: '从火之势，热情奔放，火旺则明。宜从事与火相关的行业。',
    土: '从土之势，厚德载物，土旺则安。宜从事与土相关的行业。',
    金: '从金之势，锋芒毕露，金旺则成。宜从事与金相关的行业。',
    水: '从水之势，智慧如海，水旺则流。宜从事与水相关的行业。',
  },
  从弱: {
    木: '从弱之势，以柔克刚，宜顺从环境，借助他人之力。',
    火: '从弱之势，以静制动，宜韬光养晦，等待时机。',
    土: '从弱之势，以退为进，宜稳扎稳打，不求冒进。',
    金: '从弱之势，以曲求全，宜灵活变通，避免正面冲突。',
    水: '从弱之势，以柔化刚，宜顺势而为，借力打力。',
  },
}

// 十神六亲对应
const SHISHEN_QINQI: Record<string, string> = {
  比肩: '兄弟、朋友、同事',
  劫财: '姐妹、竞争者、合伙人',
  食神: '子女、晚辈、学生',
  伤官: '才华、创意、表现欲',
  偏财: '父亲、偏门财、横财',
  正财: '妻子、正当收入、积蓄',
  偏印: '继母、偏门学问、灵感',
  正印: '母亲、学业、贵人',
  七杀: '压力、挑战、小人',
  正官: '丈夫、上司、规矩',
}

// 格局描述
const GEJU_DESC: Record<string, string> = {
  正官格: '正官格主贵，为人正直守规矩，有领导才能。适合从事管理、公职、教育等行业。根据《渊海子平》："正官格，贵在纯粹。"',
  七杀格: '七杀格主威，为人果断有魄力，敢于冒险。适合从事军警、外科、竞技等行业。需注意制化得当，否则易有波折。',
  正财格: '正财格主富，为人务实勤恳，善于理财。适合从事金融、商业、实业等行业。根据《滴天髓》："财为养命之源。"',
  偏财格: '偏财格主横财，为人机敏灵活，善于把握机会。适合从事投资、销售、娱乐等行业。',
  正印格: '正印格主文，为人仁慈博学，有涵养。适合从事教育、文化、学术等行业。根据《三命通会》："印绶生月，富贵双全。"',
  偏印格: '偏印格主奇，为人特立独行，有独创精神。适合从事艺术、玄学、技术等行业。',
  食神格: '食神格主福，为人温和乐观，有口福。适合从事餐饮、艺术、娱乐等行业。',
  伤官格: '伤官格主才，为人聪明才华横溢，不拘一格。适合从事创作、演艺、技术等行业。根据《子平真诠》："伤官配印，贵不可言。"',
  建禄格: '建禄格主自立，为人独立自强，不依赖他人。适合创业、自由职业。需注意财官配合。',
  从旺格: '从旺格顺势而为，五行极旺，宜顺其势而用之。根据《滴天髓》："从得真者只论从。"',
  从弱格: '从弱格以弱为用，五行极弱，宜顺从环境，借助外力。',
  普通格: '命局平和，无明显偏枯，一生平稳。宜踏实努力，稳中求进。',
}

// 地支关系
const ZHI_CHONG: Record<string, string> = {
  子: '午', 午: '子', 丑: '未', 未: '丑',
  寅: '申', 申: '寅', 卯: '酉', 酉: '卯',
  辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
}

const ZHI_HE: Record<string, string> = {
  子: '丑', 丑: '子', 寅: '亥', 亥: '寅',
  卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰',
  巳: '申', 申: '巳', 午: '未', 未: '午',
}

const ZHI_HAI: Record<string, string> = {
  子: '未', 未: '子', 丑: '午', 午: '丑',
  寅: '巳', 巳: '寅', 卯: '辰', 辰: '卯',
  申: '亥', 亥: '申', 酉: '戌', 戌: '酉',
}

const ZHI_XING: Record<string, string[]> = {
  寅: ['巳', '申'], 巳: ['寅', '申'], 申: ['寅', '巳'],
  丑: ['戌', '未'], 戌: ['丑', '未'], 未: ['丑', '戌'],
  子: ['卯'], 卯: ['子'],
  辰: ['辰'], 午: ['午'], 酉: ['酉'], 亥: ['亥'],
}

function getLiuNianGanZhi(year: number): [string, string] {
  return [TIAN_GAN[(year - 4) % 10]!, DI_ZHI[(year - 4) % 12]!]
}

function getZhiRelations(zhi1: string, zhi2: string): string[] {
  const relations: string[] = []
  if (ZHI_CHONG[zhi1] === zhi2) relations.push('冲')
  if (ZHI_HE[zhi1] === zhi2) relations.push('合')
  if (ZHI_HAI[zhi1] === zhi2) relations.push('害')
  if (ZHI_XING[zhi1]?.includes(zhi2)) relations.push('刑')
  return relations
}

function buildLiuNianText(chart: BaziChart): string {
  const currentYear = new Date().getFullYear()
  const [liuNianGan, liuNianZhi] = getLiuNianGanZhi(currentYear)
  const riZhi = chart.day.zhi
  const riWx = GAN_WUXING[chart.riZhu]!
  const liuNianGanWx = GAN_WUXING[liuNianGan]!
  const liuNianZhiWx = ZHI_WUXING[liuNianZhi]!
  const liuNianGanShen = getShiShen(chart.riZhu, liuNianGan)

  // 流年天干五行生克关系
  let wxRelation = ''
  if (liuNianGanWx === riWx) {
    wxRelation = '流年天干与日主同五行，为比劫之年，主竞争、合作、人际变动。'
  } else if (WUXING_SHENG[riWx] === liuNianGanWx) {
    wxRelation = '流年天干泄耗日主，为食伤之年，主才华发挥、表达输出、创意涌现。'
  } else if (WUXING_KE[riWx] === liuNianGanWx) {
    wxRelation = '流年天干克制日主，为官杀之年，主压力增大、责任加重、约束增多。'
  } else if (WUXING_SHENG[liuNianGanWx] === riWx) {
    wxRelation = '流年天干生助日主，为印绶之年，主贵人相助、学习成长、内心充实。'
  } else {
    wxRelation = '流年天干为日主所克，为财星之年，主求财机遇、资源整合、物质往来。'
  }

  // 地支关系（流年 vs 日支）
  const relations = getZhiRelations(riZhi, liuNianZhi)
  let relationText = ''
  if (relations.length > 0) {
    relationText = `流年地支${liuNianZhi}（${liuNianZhiWx}）与日支${riZhi}相${relations.join('、')}，主根基、家庭、内心状态易有波动。`
  }

  // 大运关系
  let dyText = ''
  if (chart.currentDaYun) {
    const dyRelations = getZhiRelations(chart.currentDaYun.zhi, liuNianZhi)
    if (dyRelations.length > 0) {
      dyText = `流年与大运地支${chart.currentDaYun.zhi}相${dyRelations.join('、')}，大运与流年气场交织，该年变动性较强。`
    }
  }

  // 喜忌判断
  const isXiYong = chart.xiyong.includes(liuNianGanWx!) || chart.xiyong.includes(liuNianZhiWx!)
  const isJiShen = chart.jishen.includes(liuNianGanWx!) || chart.jishen.includes(liuNianZhiWx!)

  let fortuneText = ''
  if (isXiYong) {
    fortuneText = `流年五行${liuNianGanWx}${liuNianZhiWx}契合命局喜用神，整体运势偏向有利，宜主动进取、把握机遇。`
  } else if (isJiShen) {
    fortuneText = `流年五行${liuNianGanWx}${liuNianZhiWx}触犯命局忌神，整体运势需谨慎，宜保守低调、防范风险、避免冒进。`
  } else {
    fortuneText = `流年五行${liuNianGanWx}${liuNianZhiWx}对命局影响中性，吉凶参半，宜稳中求进、见机行事、随机应变。`
  }

  return `${currentYear}年为${liuNianGan}${liuNianZhi}年。流年天干${liuNianGan}为日主之${liuNianGanShen}，五行属${liuNianGanWx}，${wxRelation}${relationText}${dyText}${fortuneText}`
}

export function generateAnalysis(chart: BaziChart): Record<string, string> {
  const riWx = GAN_WUXING[chart.riZhu]!

  // 1. 日主分析
  const riZhuText = `${chart.riZhu}属${riWx}，${chart.riZhuStrength}。${RIZHU_PERSONALITY[chart.riZhu] ?? ''}${WUXING_DESC[chart.riZhuStrength]?.[riWx] ?? ''}`

  // 2. 十神分析
  const shishenList = [
    { position: '年柱', shishen: chart.year.shishen },
    { position: '月柱', shishen: chart.month.shishen },
    { position: '时柱', shishen: chart.hour?.shishen },
  ].filter(s => s.shishen)

  const shishenText = shishenList.map(s =>
    `${s.position}见${s.shishen}，主${SHISHEN_QINQI[s.shishen!] ?? '相关人事'}。`,
  ).join('')

  // 3. 五行平衡
  const wuxingEntries = Object.entries(chart.wuxingScore)
    .sort((a, b) => b[1] - a[1])
  const wuxingText = `五行分布：${wuxingEntries.map(([k, v]) => `${k}${v}%`).join('、')}。喜用神为${chart.xiyong}，忌神为${chart.jishen}。`

  // 4. 格局判定
  const gejuText = `${chart.geju}。${GEJU_DESC[chart.geju] ?? ''}`

  // 5. 大运分析
  const currentDy = chart.currentDaYun
  const dayunText = currentDy
    ? `当前行第${currentDy.index}步大运${currentDy.gan}${currentDy.zhi}（${currentDy.ageRange[0]}-${currentDy.ageRange[1]}岁），起运年龄${chart.qiyunAge}岁。`
    : `尚未起运，起运年龄${chart.qiyunAge}岁。`

  // 6. 流年分析（基于命盘数据计算）
  const liuNianText = buildLiuNianText(chart)

  return {
    日主分析: riZhuText,
    十神分析: shishenText,
    五行平衡: wuxingText,
    格局判定: gejuText,
    大运分析: dayunText,
    流年分析: liuNianText,
  }
}

export function getAnalysisSummary(chart: BaziChart): string {
  const analysis = generateAnalysis(chart)
  return Object.entries(analysis).map(([k, v]) => `【${k}】${v}`).join('\n\n')
}
