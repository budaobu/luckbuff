import type { ZwdsChart, ZwdsGong, MainStar, ZwdsDaXian, SiHuaItem } from '~/types/zwds'
import type { TianGan, DiZhi } from '~/types/user'
import { SI_HUA_RULES, ZHI_ORDER } from './constants'

// ========== 主星基础性格描述 ==========

const STAR_PERSONALITY: Record<MainStar, string> = {
  紫微: '领导型，有帝王之气，自尊自重，喜欢掌控局面。做事有格局，眼光长远，但有时会显得孤傲。',
  天机: '智慧型，思维敏捷，善于谋划，学习能力强。为人机巧变通，但容易思虑过多，心神不宁。',
  太阳: '热情型，光明磊落，乐于助人，有奉献精神。喜欢被认可，但要注意避免过度付出而忽略自己。',
  武曲: '实干型，刚毅果决，重视效率和结果。理财观念强，做事有条理，但有时会显得过于严肃。',
  天同: '享受型，温和善良，知足常乐，有艺术气质。人缘好，但容易缺乏进取心，遇事逃避。',
  廉贞: '复杂型，感情丰富，才华横溢，有完美主义倾向。做事投入，但情绪波动大，容易钻牛角尖。',
  天府: '守成型，稳重保守，善于管理资源，有包容力。做事踏实，但有时会显得过于谨慎，缺乏冒险精神。',
  太阴: '内敛型，温柔细腻，善解人意，有审美能力。情感丰富，但容易多愁善感，缺乏安全感。',
  贪狼: '欲望型，多才多艺，交际能力强，追求新鲜感。适应力佳，但容易贪多务得，感情复杂。',
  巨门: '思辨型，口才出众，善于分析，洞察力强。喜欢探究真相，但容易口舌是非，多疑。',
  天相: '服务型，注重形象，善于协调，有正义感。做事公正，但容易受环境影响，缺乏主见。',
  天梁: '庇佑型，成熟稳重，乐于助人，有长者风范。有化解危机的能力，但容易好为人师。',
  七杀: '开创型，勇敢果断，有冒险精神，行动力强。不畏挑战，但容易冲动，人际关系需要经营。',
  破军: '变革型，破旧立新，敢于突破，不甘平庸。创造力强，但稳定性差，容易大起大落。',
}

// ========== 宫位解读模板 ==========

const GONG_INTERPRET: Record<string, string> = {
  命宫: '命宫的星曜组合决定了一个人的先天格局与核心性格。',
  兄弟: '兄弟宫反映与手足及平辈的关系，也体现合作与竞争的倾向。',
  夫妻: '夫妻宫揭示感情模式与婚姻特质，影响伴侣选择与相处方式。',
  子女: '子女宫反映与下一代的缘分，也代表创造力与桃花机缘。',
  财帛: '财帛宫显示求财方式与理财观念，影响财富积累的路径。',
  疾厄: '疾厄宫体现体质倾向与健康隐患，也反映抗压能力。',
  迁移: '迁移宫代表外出运与异地发展机会，也影响人际关系的第一印象。',
  交友: '交友宫反映朋友圈质量，判断益友与损友的倾向。',
  事业: '事业宫揭示适合的工作方向与职业发展路径。',
  田宅: '田宅宫反映家庭环境、房产缘分与居住品质。',
  福德: '福德宫体现精神世界、享受方式与内心满足感。',
  父母: '父母宫反映与长辈的关系，也代表贵人运与教育背景。',
}

// ========== 主星入宫位解读 ==========

function getStarGongText(star: MainStar, gongName: string): string {
  const base = STAR_PERSONALITY[star]

  const gongModifier: Record<string, Record<string, string>> = {
    命宫: {
      紫微: '命宫坐紫微，天生具有领导气质，自尊心强，不甘居人下。',
      天机: '命宫坐天机，聪明机敏，善于思考，适合从事脑力工作。',
      太阳: '命宫坐太阳，热情开朗，乐于付出，有贵人缘。',
      武曲: '命宫坐武曲，务实理性，重视实际利益，做事有始有终。',
      天同: '命宫坐天同，性格温和，知足常乐，有艺术细胞。',
      廉贞: '命宫坐廉贞，感情丰富，才华横溢，但情绪起伏较大。',
      天府: '命宫坐天府，稳重保守，善于守成，有管理才能。',
      太阴: '命宫坐太阴，温柔细腻，直觉敏锐，适合从事细致工作。',
      贪狼: '命宫坐贪狼，多才多艺，交际广泛，追求多彩人生。',
      巨门: '命宫坐巨门，口才出众，善于分析，但要注意言语分寸。',
      天相: '命宫坐天相，注重形象，善于协调，有服务精神。',
      天梁: '命宫坐天梁，成熟稳重，有化解困难的能力，适合从事咨询类工作。',
      七杀: '命宫坐七杀，勇敢果决，敢于冒险，适合开创性工作。',
      破军: '命宫坐破军，不甘平庸，喜欢变革，人生起伏较大。',
    },
    事业: {
      紫微: '紫微在事业宫，适合管理岗位或自主创业，有领导才能。',
      天机: '天机在事业宫，适合策划、咨询、IT等脑力密集型行业。',
      太阳: '太阳在事业宫，适合教育、公关、服务业，能获得名声。',
      武曲: '武曲在事业宫，适合金融、实业、技术类工作，以专业立足。',
      天同: '天同在事业宫，适合艺术、娱乐、餐饮等享受型行业。',
      廉贞: '廉贞在事业宫，适合创意、设计、演艺等需要才华的领域。',
      天府: '天府在事业宫，适合管理、行政、房地产等守成型行业。',
      太阴: '太阴在事业宫，适合财务、美容、文化等细腻型工作。',
      贪狼: '贪狼在事业宫，适合演艺、销售、娱乐等多变型行业。',
      巨门: '巨门在事业宫，适合律师、教师、咨询等口才型职业。',
      天相: '天相在事业宫，适合公务员、服务业、协调型岗位。',
      天梁: '天梁在事业宫，适合医疗、教育、公益等助人型行业。',
      七杀: '七杀在事业宫，适合军警、外科、竞技等挑战型职业。',
      破军: '破军在事业宫，适合创新、研发、改革等变革型工作。',
    },
    财帛: {
      紫微: '紫微在财帛，求财方式大气，善于整合资源获利。',
      天机: '天机在财帛，靠智慧求财，适合咨询、策划类收入。',
      太阳: '太阳在财帛，光明正大求财，适合品牌、名声变现。',
      武曲: '武曲在财帛，正财稳定，善于理财积累，偏财运一般。',
      天同: '天同在财帛，求财心态平和，不喜冒险，细水长流。',
      廉贞: '廉贞在财帛，求财方式多变，需注意风险控制。',
      天府: '天府在财帛，善于守财，理财保守稳健，积少成多。',
      太阴: '太阴在财帛，适合稳健投资，房产、储蓄类收益佳。',
      贪狼: '贪狼在财帛，财源多路，但需注意贪多失少。',
      巨门: '巨门在财帛，靠口才或专业技能求财，宜专精。',
      天相: '天相在财帛，求财方式正统，适合稳定薪资。',
      天梁: '天梁在财帛，不求大富，但求安稳，晚年财运佳。',
      七杀: '七杀在财帛，敢冒风险求财，大起大落。',
      破军: '破军在财帛，求财方式多变，需防破耗。',
    },
    夫妻: {
      紫微: '紫微在夫妻宫，伴侣条件优越，有领导气质。',
      天机: '天机在夫妻宫，伴侣聪明机灵，但关系易有变数。',
      太阳: '太阳在夫妻宫，伴侣热情大方，能给予支持。',
      武曲: '武曲在夫妻宫，伴侣务实理性，重视物质基础。',
      天同: '天同在夫妻宫，感情温馨和谐，伴侣性格温和。',
      廉贞: '廉贞在夫妻宫，感情浓烈复杂，需用心经营。',
      天府: '天府在夫妻宫，伴侣稳重顾家，关系踏实。',
      太阴: '太阴在夫妻宫，伴侣温柔体贴，感情细腻。',
      贪狼: '贪狼在夫妻宫，桃花旺盛，感情经历丰富。',
      巨门: '巨门在夫妻宫，沟通重要，易有口舌之争。',
      天相: '天相在夫妻宫，伴侣注重形象，关系和谐。',
      天梁: '天梁在夫妻宫，伴侣成熟稳重，能给予庇护。',
      七杀: '七杀在夫妻宫，感情来得快，需防冲动。',
      破军: '破军在夫妻宫，感情起伏大，易有变化。',
    },
  }

  return gongModifier[gongName]?.[star] ?? `${star}在${gongName}宫，${base}`
}

// ========== 生成分析文本 ==========

export function generateZwdsAnalysis(chart: ZwdsChart): Record<string, string> {
  const result: Record<string, string> = {}

  // 1. 命宫分析
  const mingStars = chart.mingGong.mainStars.length > 0
    ? chart.mingGong.mainStars
    : chart.gongs.find(g => g.zhi === chart.mingGong.zhi)?.mainStars ?? []

  const mingText = mingStars.length > 0
    ? mingStars.map(s => getStarGongText(s, '命宫')).join(' ')
    : `命宫在${chart.mingGong.zhi}宫，为借对宫星曜，性格特质需参考对宫。`

  result['命宫分析'] = `${mingText} 五行局为${chart.wuxingJu}局，${GONG_INTERPRET['命宫']}`

  // 2. 身宫分析
  const shenStars = chart.shenGong.mainStars
  const shenText = shenStars.length > 0
    ? shenStars.map(s => getStarGongText(s, '命宫')).join(' ')
    : `身宫在${chart.shenGong.zhi}宫，后天发展方向需参考对宫。`
  result['身宫分析'] = `身宫在${chart.shenGong.zhi}，代表后天努力方向。${shenText}`

  // 3. 财帛宫分析
  const caiGong = chart.gongs.find(g => g.name === '财帛')!
  const caiStars = caiGong.mainStars.length > 0 ? caiGong.mainStars : [caiGong.zhi]
  const caiText = caiGong.mainStars.length > 0
    ? caiGong.mainStars.map(s => getStarGongText(s, '财帛')).join(' ')
    : `财帛宫在${caiGong.zhi}，为空宫，需借对宫星曜参考。`
  result['财帛分析'] = caiText

  // 4. 事业宫分析
  const shiGong = chart.gongs.find(g => g.name === '事业')!
  const shiText = shiGong.mainStars.length > 0
    ? shiGong.mainStars.map(s => getStarGongText(s, '事业')).join(' ')
    : `事业宫在${shiGong.zhi}，为空宫，需借对宫星曜参考。`
  result['事业分析'] = shiText

  // 5. 夫妻宫分析
  const fuGong = chart.gongs.find(g => g.name === '夫妻')!
  const fuText = fuGong.mainStars.length > 0
    ? fuGong.mainStars.map(s => getStarGongText(s, '夫妻')).join(' ')
    : `夫妻宫在${fuGong.zhi}，为空宫，需借对宫星曜参考。`
  result['夫妻分析'] = fuText

  // 6. 大限分析
  const currentDx = chart.currentDaXian
  const daXianText = currentDx
    ? `当前行第${currentDx.index}大限（${currentDx.ageRange[0]}-${currentDx.ageRange[1]}岁），大限走到${currentDx.gongName}宫（${currentDx.gongZhi}），主星为${currentDx.mainStars.join('、') || '借对宫'}。`
    : '尚未起运。'
  result['大限分析'] = daXianText

  // 7. 四化分析
  const siHuaGongs = chart.gongs.filter(g => g.siHua.length > 0)
  const siHuaText = siHuaGongs.map(g =>
    `${g.name}宫${g.siHua.map(s => `${s.star}化${s.type}`).join('、')}`,
  ).join('；')
  result['四化分析'] = siHuaText || '本年四化飞星分布平和。'

  return result
}

export function getZwdsSummary(chart: ZwdsChart): string {
  const analysis = generateZwdsAnalysis(chart)
  return Object.entries(analysis).map(([k, v]) => `【${k}】${v}`).join('\n\n')
}

// ========== 本命十二宫逐宫分析 ==========

/** 根据宫位主星生成简要解读（所有宫位通用） */
function getGongBrief(gong: ZwdsGong): string {
  if (gong.mainStars.length === 0) {
    return `${gong.name}在${gong.zhi}宫，为空宫，需借对宫${ZHI_ORDER[(ZHI_ORDER.indexOf(gong.zhi) + 6) % 12]}参考。`
  }
  const starTexts = gong.mainStars.map(s => {
    const base = STAR_PERSONALITY[s]
    return `${s}：${base}`
  })
  return `${GONG_INTERPRET[gong.name]} ${starTexts.join(' ')}`
}

export interface BenmingGongAnalysis {
  gong: ZwdsGong
  brief: string
  isMing: boolean
  isShen: boolean
}

export function generateBenmingAnalysis(chart: ZwdsChart): BenmingGongAnalysis[] {
  return chart.gongs.map(g => ({
    gong: g,
    brief: getGongBrief(g),
    isMing: g.isMing ?? false,
    isShen: g.isShen ?? false,
  }))
}

// ========== 大限分析 ==========

export interface DaxianDimension {
  name: string
  trend: '上升' | '平稳' | '波动' | '调整'
  text: string
}

export interface DaxianAnalysis {
  daxian: ZwdsDaXian
  isCurrent: boolean
  overview: string
  dimensions: DaxianDimension[]
  timeHint: string
}

function getDimensionTrend(gongName: string, mainStars: MainStar[]): '上升' | '平稳' | '波动' | '调整' {
  const riseStars = ['紫微', '太阳', '武曲', '天府', '天相', '天梁']
  const adjustStars = ['天机', '廉贞', '巨门', '贪狼']
  const waveStars = ['七杀', '破军']
  const stars = mainStars.length > 0 ? mainStars : []
  if (stars.some(s => waveStars.includes(s))) return '波动'
  if (stars.some(s => adjustStars.includes(s))) return '调整'
  if (stars.some(s => riseStars.includes(s))) return '上升'
  return '平稳'
}

function getDimensionText(gongName: string, mainStars: MainStar[]): string {
  const trend = getDimensionTrend(gongName, mainStars)
  const starStr = mainStars.join('、') || '借对宫'
  const hints: Record<string, Record<string, string>> = {
    感情: {
      上升: '这十年感情关系有机会深化，适合确立长期关系或步入婚姻。',
      平稳: '感情生活趋于稳定，平淡中见真情，适合经营现有关系。',
      波动: '感情经历起伏，易有变化或考验，需以包容心态面对。',
      调整: '感情模式面临调整，可能经历观念冲突，沟通是关键。',
    },
    事业: {
      上升: '事业处于上升期，有机会获得认可与晋升，宜主动争取。',
      平稳: '事业节奏平稳，适合深耕现有领域，积累专业口碑。',
      波动: '事业起伏较大，可能面临转型或跳槽，保持弹性应对。',
      调整: '事业方向可能需要调整，适合反思规划，不宜冒进。',
    },
    财运: {
      上升: '财运向好，正财收入有望增长，可适当拓展理财渠道。',
      平稳: '财务状况稳定，适合保守理财，量入为出。',
      波动: '财来财去，投资需谨慎，避免大额冒险。',
      调整: '财务结构可能需要调整，注意开源节流，控制风险。',
    },
    健康: {
      上升: '整体健康状态良好，精力充沛，适合培养运动习惯。',
      平稳: '健康状况平稳，保持规律作息即可，注意小病预防。',
      波动: '健康易有起伏，注意劳逸结合，定期体检。',
      调整: '身体可能在提醒你需要调整生活方式，关注亚健康信号。',
    },
  }
  const hint = hints[gongName]?.[trend] ?? '保持平常心，顺势而为。'
  return `${gongName}走势${trend}（主星：${starStr}）。${hint}`
}

export function getDaxianAnalysis(chart: ZwdsChart, daxianIndex: number): DaxianAnalysis {
  const dx = chart.daXians[daxianIndex]
  const isCurrent = dx.ageRange[0] <= chart.currentAge && dx.ageRange[1] >= chart.currentAge

  // 找到该大限对应的本命宫位
  const gong = chart.gongs.find(g => g.name === dx.gongName)!

  const overview = `第${dx.index}大限走入${dx.gongName}宫（${dx.gongZhi}），年龄${dx.ageRange[0]}-${dx.ageRange[1]}岁。主星为${dx.mainStars.join('、') || '借对宫'}。此限${isCurrent ? '为当前大限' : '已' + (dx.ageRange[1] < chart.currentAge ? '过' : '未至')}。`

  // 四维走势：根据大限宫位的主星推断，同时参考对宫和三合
  const dimensions: DaxianDimension[] = [
    { name: '感情', trend: getDimensionTrend('感情', dx.mainStars), text: '' },
    { name: '事业', trend: getDimensionTrend('事业', dx.mainStars), text: '' },
    { name: '财运', trend: getDimensionTrend('财运', dx.mainStars), text: '' },
    { name: '健康', trend: getDimensionTrend('健康', dx.mainStars), text: '' },
  ]

  // 感情参考夫妻宫/福德宫的主星，如果大限宫位正好是这两个，直接用；否则混合
  const fuqiGong = chart.gongs.find(g => g.name === '夫妻')!
  const fudeGong = chart.gongs.find(g => g.name === '福德')!
  dimensions[0].text = getDimensionText('感情', dx.gongName === '夫妻' || dx.gongName === '福德' ? dx.mainStars : [...fuqiGong.mainStars, ...fudeGong.mainStars])

  // 事业参考事业宫/迁移宫
  const shiyeGong = chart.gongs.find(g => g.name === '事业')!
  const qianyiGong = chart.gongs.find(g => g.name === '迁移')!
  dimensions[1].text = getDimensionText('事业', dx.gongName === '事业' || dx.gongName === '迁移' ? dx.mainStars : [...shiyeGong.mainStars, ...qianyiGong.mainStars])

  // 财运参考财帛宫/田宅宫
  const caiboGong = chart.gongs.find(g => g.name === '财帛')!
  const tianzhaiGong = chart.gongs.find(g => g.name === '田宅')!
  dimensions[2].text = getDimensionText('财运', dx.gongName === '财帛' || dx.gongName === '田宅' ? dx.mainStars : [...caiboGong.mainStars, ...tianzhaiGong.mainStars])

  // 健康参考疾厄宫/命宫
  const jieGong = chart.gongs.find(g => g.name === '疾厄')!
  dimensions[3].text = getDimensionText('健康', dx.gongName === '疾厄' || dx.gongName === '命宫' ? dx.mainStars : [...jieGong.mainStars, ...chart.mingGong.mainStars])

  // 时间节点提示
  const midAge = Math.floor((dx.ageRange[0] + dx.ageRange[1]) / 2)
  const timeHint = `大限中段约${midAge}岁前后可能出现关键转折，留意该年前后的事业与感情变化。`

  return { daxian: dx, isCurrent, overview, dimensions, timeHint }
}

// ========== 流年分析 ==========

export type LiunianRating = 'shunSui' | 'stable' | 'liuYi' | 'jinShen'

export interface LiunianAnalysis {
  year: number
  yearGanZhi: string
  taiSuiGong: string // 太岁入宫名称
  taiSuiZhi: DiZhi
  liuNianSiHua: SiHuaItem[]
  dimensions: { name: string; text: string }[]
  rating: LiunianRating
  summary: string
}

/** 根据年份获取天干地支 */
function getYearGanZhi(year: number): { gan: TianGan; zhi: DiZhi } {
  const ganList: TianGan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const zhiList: DiZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const ganIdx = (year - 4) % 10
  const zhiIdx = (year - 4) % 12
  return { gan: ganList[ganIdx], zhi: zhiList[zhiIdx] }
}

export function getLiunianAnalysis(chart: ZwdsChart, year: number): LiunianAnalysis {
  const { gan, zhi } = getYearGanZhi(year)
  const yearGanZhi = `${gan}${zhi}`

  // 太岁入宫：流年地支在命盘中对应的宫位
  const taiSuiGongObj = chart.gongs.find(g => g.zhi === zhi)
  const taiSuiGong = taiSuiGongObj?.name ?? '未知'
  const taiSuiZhi = zhi

  // 流年四化
  const sihuaRule = SI_HUA_RULES[gan]
  const liuNianSiHua: SiHuaItem[] = [
    { type: '禄', star: sihuaRule.禄 },
    { type: '权', star: sihuaRule.权 },
    { type: '科', star: sihuaRule.科 },
    { type: '忌', star: sihuaRule.忌 },
  ]

  // 找到流年四化落入的宫位
  const liuNianSiHuaGongs = liuNianSiHua.map(sh => {
    const g = chart.gongs.find(gong =>
      gong.mainStars.includes(sh.star as MainStar) || gong.auxStars.includes(sh.star as any),
    )
    return { ...sh, gongName: g?.name ?? '未知' }
  })

  // 吉凶评级：综合太岁宫位主星 + 流年忌星落点 + 本命四化叠流年四化
  let score = 50 // 基准分

  // 太岁宫位主星加分/减分
  const tsStars = taiSuiGongObj?.mainStars ?? []
  const goodStars = ['紫微', '天府', '天相', '天梁', '太阳', '太阴']
  const badStars = ['七杀', '破军', '擎羊', '陀罗', '火星', '铃星']
  tsStars.forEach(s => {
    if (goodStars.includes(s)) score += 8
    if (badStars.includes(s)) score -= 6
  })

  // 流年忌星落命宫/事业/财帛/夫妻减分较多
  const jiStar = sihuaRule.忌
  const jiGong = chart.gongs.find(g =>
    g.mainStars.includes(jiStar as MainStar) || g.auxStars.includes(jiStar as any),
  )
  if (jiGong && ['命宫', '事业', '财帛', '夫妻'].includes(jiGong.name)) {
    score -= 12
  } else if (jiGong) {
    score -= 6
  }

  // 流年禄星落命宫/财帛/事业加分
  const luStar = sihuaRule.禄
  const luGong = chart.gongs.find(g =>
    g.mainStars.includes(luStar as MainStar) || g.auxStars.includes(luStar as any),
  )
  if (luGong && ['命宫', '财帛', '事业'].includes(luGong.name)) {
    score += 10
  } else if (luGong) {
    score += 5
  }

  const rating: LiunianRating =
    score >= 65 ? 'shunSui' : score >= 45 ? 'stable' : score >= 30 ? 'liuYi' : 'jinShen'

  // 四维当年判断
  const dimensions = [
    {
      name: '感情',
      text: jiGong?.name === '夫妻'
        ? '流年忌入夫妻宫，感情易有摩擦，需多沟通包容。'
        : luGong?.name === '夫妻'
          ? '流年禄入夫妻宫，感情运势向好，适合经营关系。'
          : '感情运势平稳，维持现有节奏即可。',
    },
    {
      name: '事业',
      text: jiGong?.name === '事业'
        ? '流年忌入事业宫，工作易有压力或变动，稳扎稳打为上。'
        : luGong?.name === '事业'
          ? '流年禄入事业宫，事业有机会获得突破，宜主动争取。'
          : '事业节奏平稳，适合深耕现有领域。',
    },
    {
      name: '财运',
      text: jiGong?.name === '财帛'
        ? '流年忌入财帛宫，财务需谨慎，避免冲动消费或投资。'
        : luGong?.name === '财帛'
          ? '流年禄入财帛宫，正财偏财皆有利好，可适当拓展。'
          : '财运平稳，量入为出即可。',
    },
    {
      name: '健康',
      text: jiGong?.name === '疾厄' || jiGong?.name === '命宫'
        ? '流年忌入命宫或疾厄，注意身体保养，避免过度劳累。'
        : '健康状态平稳，保持规律作息。',
    },
  ]

  const summary = `${year}年${yearGanZhi}，太岁入${taiSuiGong}宫。流年四化：${liuNianSiHuaGongs.map(s => `${s.star}化${s.type}入${s.gongName}`).join('，')}。整体评级「${rating}」。`

  return { year, yearGanZhi, taiSuiGong, taiSuiZhi, liuNianSiHua, dimensions, rating, summary }
}
