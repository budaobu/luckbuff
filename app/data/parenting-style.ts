// app/data/parenting-style.ts
// 家庭教育风格测试：家长自身八字十神 → 教养倾向维度映射规则
// 本文件独立存放，仅供「家庭教育风格测试」工具使用，与亲子相性、婚姻相性、八字人格图谱的映射维度均不重叠。
// 所有描述定位为「家长本人的自我剖析与自我觉察」，不涉及对孩子的分析或对亲子关系的判断，禁止诊断式表述。

export type ParentingStyleDimension = 'authoritative' | 'laissezFaire' | 'overprotective'

export interface ParentingStyleProfile {
  shishen: string
  dimension: ParentingStyleDimension
  dimensionLabel: string
  name: string
  labels: string[]
  scenario: string
  blindSpot: string
  selfCheck: string[]
}

export interface ParentingStyleMapping {
  profiles: Record<string, ParentingStyleProfile>
  dimensionLabels: Record<ParentingStyleDimension, string>
}

export const DIMENSION_LABELS: Record<ParentingStyleDimension, string> = {
  authoritative: '权威型教养倾向',
  laissezFaire: '放养型教养倾向',
  overprotective: '过度保护型教养倾向',
}

export const PARENTING_STYLE_PROFILES: Record<string, ParentingStyleProfile> = {
  正官: {
    shishen: '正官',
    dimension: 'authoritative',
    dimensionLabel: DIMENSION_LABELS.authoritative,
    name: '规则型权威',
    labels: ['规则明确', '标准清晰', '可预期'],
    scenario: '你会提前和孩子约定好作息、作业和屏幕时间，家里有一张清晰的家规表；孩子知道越过红线会有什么后果，但也知道只要按规则来就能获得稳定感。',
    blindSpot: '你可能把「遵守规则」等同于「被爱」，孩子为了避免让你失望而隐藏真实想法；当规则变成唯一标准时，亲子对话容易变成「对错题」。',
    selfCheck: [
      '本周选一次孩子没有违规、但你很想提醒的小事，先问「你怎么看」而不是直接给标准。',
      '睡前回顾一天，记录孩子主动表达真实想法的1个瞬间，而不是只记他是否守规矩。',
    ],
  },
  七杀: {
    shishen: '七杀',
    dimension: 'authoritative',
    dimensionLabel: DIMENSION_LABELS.authoritative,
    name: '高压型权威',
    labels: ['要求高', '节奏快', '结果导向'],
    scenario: '你习惯直接指出问题，语气有力度，孩子知道你的指令通常不会重复第二遍；你对效率和成果很敏感，家里的事情推进很快。',
    blindSpot: '高压信号容易被敏感的孩子解读为「我不够好」，长期可能让孩子把自我价值与表现挂钩；当孩子退缩时，你可能误以为他态度不好。',
    selfCheck: [
      '本周下达要求时，把声音降低一度，并在句尾加上一句「我相信你能做到」。',
      '每天记录一次孩子主动尝试的小事，睡前具体反馈给他听，重建「尝试=安全」的体验。',
    ],
  },
  正财: {
    shishen: '正财',
    dimension: 'authoritative',
    dimensionLabel: DIMENSION_LABELS.authoritative,
    name: '务实型权威',
    labels: ['目标导向', '重结果', '计划性强'],
    scenario: '你倾向于把大目标拆成可检查的小任务，比如「这周背完20个单词」「月底前完成这个项目」；你会和孩子一起复盘完成度。',
    blindSpot: '当关注点长期停留在「完成了没有」，孩子可能觉得情绪不被看见；一次没达标时，他更怕被评价而不是想改进。',
    selfCheck: [
      '本周完成一个目标后，先问孩子「过程中哪个部分你最投入」，再谈结果。',
      '把本周计划中的1个量化指标，换成1个「感受型」观察：例如「他放松了吗」。',
    ],
  },
  劫财: {
    shishen: '劫财',
    dimension: 'authoritative',
    dimensionLabel: DIMENSION_LABELS.authoritative,
    name: '竞争型权威',
    labels: ['竞争激励', '行动快', '爱挑战'],
    scenario: '你常用「看谁更快」「我们来比一比」推动孩子行动，家里充满游戏感和挑战性；孩子累了你更容易用「再坚持一下」来激励。',
    blindSpot: '长期被比较的孩子可能把爱等同于「只有赢才配得」；当外部环境不再有比赛时，他可能失去内在动力。',
    selfCheck: [
      '本周取消一次比赛式激励，改成「我们一起完成」，完成后只给击掌不给评价。',
      '留意孩子做一件没有奖励、没有对手的事时的状态，记录他是否仍然投入。',
    ],
  },
  食神: {
    shishen: '食神',
    dimension: 'laissezFaire',
    dimensionLabel: DIMENSION_LABELS.laissezFaire,
    name: '轻松型放养',
    labels: ['氛围轻松', '鼓励表达', '享受生活'],
    scenario: '你更看重家里的氛围是否愉快，愿意陪孩子玩游戏、做手工、聊趣事；你对孩子的情绪很宽容，不喜欢太严肃。',
    blindSpot: '遇到需要坚持或立规矩的事，你可能因为怕破坏气氛而让步；孩子需要清晰边界时，家里反而缺少锚点。',
    selfCheck: [
      '本周选一件必须坚持的小事（如睡前收拾），提前把规则和后果写下来，温和但不变地执行。',
      '当孩子讨价还价时，练习只说一次「这次不变」，然后安静陪伴他的情绪。',
    ],
  },
  伤官: {
    shishen: '伤官',
    dimension: 'laissezFaire',
    dimensionLabel: DIMENSION_LABELS.laissezFaire,
    name: '开放型放养',
    labels: ['灵活变通', '鼓励质疑', '讨厌死板'],
    scenario: '你不喜欢一成不变的规则，愿意尝试新办法，鼓励孩子提出不同方案；你常对孩子说「我们来想想有没有更好的方式」。',
    blindSpot: '规则变动太多会让需要稳定感的孩子感到不确定；你的「再想想」可能被孩子理解为「说什么都行，那我就不做了」。',
    selfCheck: [
      '本周把2-3件日常安排固定下来，提前告诉孩子「这几天这个不变」，观察他是否更放松。',
      '当孩子提出新方案时，先明确「哪些部分可以商量，哪些部分不能改」。',
    ],
  },
  偏财: {
    shishen: '偏财',
    dimension: 'laissezFaire',
    dimensionLabel: DIMENSION_LABELS.laissezFaire,
    name: '灵活型放养',
    labels: ['外向灵活', '社交导向', '即兴应变'],
    scenario: '你喜欢带孩子参加各种活动、见朋友、体验新事物，家里常有临时起意的安排；你应变能力很强，孩子觉得和你在一起有趣。',
    blindSpot: '承诺容易临时调整，孩子可能把「你说的话」当成不确定信号；过多的外部刺激也可能挤压独处和沉淀时间。',
    selfCheck: [
      '本周做一个「确定清单」，把3件已经答应孩子的事写在显眼处，不轻易改动。',
      '观察孩子独处时的状态：他是真的无聊，还是在消化信息和情绪。',
    ],
  },
  比肩: {
    shishen: '比肩',
    dimension: 'laissezFaire',
    dimensionLabel: DIMENSION_LABELS.laissezFaire,
    name: '平等型放养',
    labels: ['朋友式相处', '民主商量', '边界宽松'],
    scenario: '你习惯用「你觉得呢」「我们一起决定」和孩子沟通，孩子愿意把学校的事讲给你听；你不喜欢摆家长架子。',
    blindSpot: '边界模糊时，孩子可能把商量当作讨价还价的空间；需要家长拍板的关键时刻，你的迟疑会让孩子更焦虑。',
    selfCheck: [
      '本周在一件你已有明确立场的事情上，直接告诉孩子你的决定和原因，不进入漫长的讨论。',
      '当孩子反复追问「为什么不可以」时，练习用一句话结束话题，然后转移注意力。',
    ],
  },
  正印: {
    shishen: '正印',
    dimension: 'overprotective',
    dimensionLabel: DIMENSION_LABELS.overprotective,
    name: '滋养型保护',
    labels: ['温暖包容', '高支持', '代劳倾向'],
    scenario: '孩子受挫时第一反应是找你，你会先安慰、再帮他想办法，甚至顺手替他做完；你觉得家是永远的退路。',
    blindSpot: '过度代劳会让孩子把「妈妈/爸爸会帮我」内化为默认选项，减少试错机会；孩子可能误把被爱等同于「我不需要独立」。',
    selfCheck: [
      '本周选一件孩子能自己完成的事，完全交给他，不检查不催促，只在他主动求助时给提示。',
      '当孩子求助时，先问「你试过了吗？怎么试的？」，而不是直接接手。',
    ],
  },
  偏印: {
    shishen: '偏印',
    dimension: 'overprotective',
    dimensionLabel: DIMENSION_LABELS.overprotective,
    name: '敏感型保护',
    labels: ['细腻共情', '洞察入微', '边界感弱'],
    scenario: '你能敏锐察觉到孩子的情绪变化，会花很多时间听他讲感受、分析原因；你重视他的内在世界多于外在表现。',
    blindSpot: '过度关注情绪可能让孩子觉得自己的感受被放大，反而更焦虑；过多的「我理解你」有时像分析而不是陪伴。',
    selfCheck: [
      '本周孩子情绪低落时，先陪他做一件安静的小事（如散步、拼图），5分钟后再开口问「你想聊聊吗」。',
      '每天记录一次你没有立刻解读、只是陪伴孩子的时刻，观察他的反应。',
    ],
  },
}

export function getParentingStyleProfile(shishenCounts: Record<string, number>): ParentingStyleProfile {
  const sorted = Object.entries(shishenCounts)
    .filter(([k]) => k !== '日主')
    .sort((a, b) => b[1] - a[1])
  const top = sorted[0]?.[0] || '正官'
  return PARENTING_STYLE_PROFILES[top] || PARENTING_STYLE_PROFILES['正官']!
}

export function getDimensionDistribution(shishenCounts: Record<string, number>): Record<ParentingStyleDimension, number> {
  const distribution: Record<ParentingStyleDimension, number> = {
    authoritative: 0,
    laissezFaire: 0,
    overprotective: 0,
  }
  for (const [shishen, count] of Object.entries(shishenCounts)) {
    const profile = PARENTING_STYLE_PROFILES[shishen]
    if (profile && count > 0) {
      distribution[profile.dimension] += count
    }
  }
  return distribution
}
