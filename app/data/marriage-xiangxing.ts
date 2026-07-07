// app/data/marriage-xiangxing.ts
// 婚姻相性：亲密关系场景下的十神 - 关系模式映射规则
// 本文件独立存放，仅供「婚姻相性测试」工具使用，不复用亲子相性或八字人格图谱的映射表。
// 所有描述定位为「相处模式与沟通建议」，避免运势吉凶判断与心理诊断式表述。

import { GAN_WUXING, WUXING_SHENG, WUXING_KE } from '~/utils/bazi/constants'

export interface MarriagePortrait {
  shishen: string
  labels: string[]
  communicationStyle: string
  emotionalExpression: string
  rulesVsFreedom: string
  scenario: string
}

export interface MarriageFriction {
  key: string
  title: string
  conflict: string
  actions: string[]
}

export interface MarriageFrictionRule extends MarriageFriction {
  aToBShishen: string
  bDominantShishen: string
}

// 个人在亲密关系中的主导十神画像
// 聚焦沟通风格、情绪表达方式、对规则与自由的诉求
export const PERSONALITY_PORTRAITS: Record<string, MarriagePortrait> = {
  比肩: {
    shishen: '比肩',
    labels: ['平等协商', '直来直往', '共同决策'],
    communicationStyle: '习惯把伴侣当作「队友」，遇到事情倾向于先商量再决定，不喜欢单方面被安排。',
    emotionalExpression: '情绪来得直接、去得也快，生气时更想当场说开，而不是冷战或隐忍。',
    rulesVsFreedom: '希望关系里有一套双方认可的「共同规则」，而不是谁单方面定规矩；反感被当成下属或孩子对待。',
    scenario: '比如旅行规划时，TA 更希望一起列清单、分工合作；如果伴侣独断决定所有行程，TA 容易感到被忽视而对抗。',
  },
  劫财: {
    shishen: '劫财',
    labels: ['行动先行', '情绪外放', '需要空间'],
    communicationStyle: '想到就说、说完就忘，沟通节奏快，有时候话出口后才意识到语气重。',
    emotionalExpression: '情绪起伏明显，开心时很热情，烦躁时需要快速宣泄，不喜欢被追问「你什么意思」。',
    rulesVsFreedom: '对「被管」特别敏感，需要保留一定的自主空间；太过细密的约束会让 TA 想逃离。',
    scenario: '比如伴侣追问行踪或要求报备，TA 可能不是故意隐瞒，而是对「被监控感」产生本能反弹。',
  },
  食神: {
    shishen: '食神',
    labels: ['温和回避', '日常关怀', '轻松氛围'],
    communicationStyle: '不喜欢正面冲突，遇到分歧时倾向于转移话题或用玩笑化解，直到气氛安全才开口。',
    emotionalExpression: '情绪表达偏日常化：做饭、陪伴、照顾细节，而非直接说「我需要你」。委屈时容易默默消化。',
    rulesVsFreedom: '希望关系氛围轻松，对高压式要求反应慢；需要伴侣把规则变成共同约定，而不是命令。',
    scenario: '比如吵架后，TA 可能不会主动复盘，而是靠一起做饭、散步来恢复连接；被强迫立刻沟通会感到压力。',
  },
  伤官: {
    shishen: '伤官',
    labels: ['直言质疑', '追求真实', '反感僵化'],
    communicationStyle: '说话锋利、逻辑清晰，遇到不合理的要求会直接指出，甚至不惜引发争论。',
    emotionalExpression: '情绪真实外露，讨厌虚伪和表面和谐；不开心时宁愿摊牌，也不假装没事。',
    rulesVsFreedom: '极其重视个人边界和自由，对「必须」「应该」类话语过敏，希望规则可以被讨论和修改。',
    scenario: '比如伴侣要求 TA 按固定方式处理家事，TA 容易反问「为什么一定要这样」，被当作抬杠。',
  },
  偏财: {
    shishen: '偏财',
    labels: ['灵活随性', '外向分享', '即兴安排'],
    communicationStyle: '喜欢边做边聊，话题跳跃，对一本正经的「严肃谈话」容易走神。',
    emotionalExpression: '情绪通过社交、活动、礼物表达，不开心时更想出门换环境，而不是待在家里分析。',
    rulesVsFreedom: '喜欢灵活和新鲜感，长期固定的日程会让 TA 感到乏味；需要伴侣允许计划外的小变化。',
    scenario: '比如周末临时被朋友约，TA 可能很兴奋地想参加；如果伴侣坚持原计画不变，TA 会觉得生活缺乏弹性。',
  },
  正财: {
    shishen: '正财',
    labels: ['务实稳定', '守信重诺', '明确分工'],
    communicationStyle: '沟通讲究事实和结果，不喜欢绕弯子；约定好的事情希望对方认真对待。',
    emotionalExpression: '情绪相对稳定但容易累积，不满通常通过「你答应过我的」这类具体事件表达。',
    rulesVsFreedom: '重视共同约定和责任分工，变化需要提前沟通；临时变卦会让 TA 感到不被尊重。',
    scenario: '比如伴侣经常迟到或爽约，TA 会把这解读为对关系的不重视，而不是「小事而已」。',
  },
  七杀: {
    shishen: '七杀',
    labels: ['有魄力', '高压敏感', '边界清晰'],
    communicationStyle: '说话简短有力，讨厌反复解释；遇到问题时倾向于快速定调，而不是长时间讨论。',
    emotionalExpression: '情绪强度高，压力大了容易爆发；但爆发过后往往很快恢复，不需要伴侣过度安抚。',
    rulesVsFreedom: '希望关系里有清晰的边界和底线，讨厌拖泥带水；一旦被触碰底线，反应会很强烈。',
    scenario: '比如伴侣在公开场合否定 TA，TA 可能会当场冷脸；私下沟通时反而更容易接受反馈。',
  },
  正官: {
    shishen: '正官',
    labels: ['自律守序', '目标导向', '情绪克制'],
    communicationStyle: '表达有条理，喜欢把问题说清楚、定下解决方案；对无目的的争吵感到疲惫。',
    emotionalExpression: '情绪偏克制，不轻易失控；但长期压抑后可能一次性爆发，让伴侣措手不及。',
    rulesVsFreedom: '希望关系有共同目标和结构感，愿意遵守规则，也期待伴侣同样自律。',
    scenario: '比如讨论未来时，TA 希望列出具体计划；如果伴侣总是「到时候再说」，TA 会感到焦虑和不被重视。',
  },
  偏印: {
    shishen: '偏印',
    labels: ['内省独立', '慢热观察', '需要独处'],
    communicationStyle: '先听后说，需要较长时间整理思绪；被催促回答时容易变得防御或沉默。',
    emotionalExpression: '情绪处理偏内倾，遇到压力时更需要独处空间，而不是立刻被陪伴或追问。',
    rulesVsFreedom: '对规则有自己的理解，不喜欢被强行说服；重视精神独立和个人兴趣空间。',
    scenario: '比如吵架后，TA 可能需要几小时甚至一天独处；伴侣如果一直追问「你倒是说话」，会让 TA 更想退缩。',
  },
  正印: {
    shishen: '正印',
    labels: ['温和包容', '照顾型表达', '稳定节奏'],
    communicationStyle: '语气柔和，善于倾听，但遇到冲突时容易回避对立，害怕伤害关系。',
    emotionalExpression: '通过照顾、关心、营造安全感来表达情绪；自己委屈时往往先忍让。',
    rulesVsFreedom: '喜欢稳定、可预期的生活节奏，变动会带来不安；需要伴侣给足安全感和提前说明。',
    scenario: '比如伴侣临时改变周末计划，TA 可能口头说「没关系」，但内心会失落很久，需要被主动安抚。',
  },
}

// 摩擦规则库：甲方对乙方的十神 × 乙方主导十神
// 用现代关系心理学语言描述反复出现的冲突场景与可执行建议
export const FRICTION_RULES: MarriageFrictionRule[] = [
  {
    key: '正官-伤官',
    aToBShishen: '正官',
    bDominantShishen: '伤官',
    title: '规则执行 vs 质疑变通',
    conflict: '一方希望按约定推进、尽快定案，另一方则习惯质疑规则、寻找例外；容易在「这件事到底该怎么做」上反复拉锯。',
    actions: [
      '本周选一件常引发分歧的小事（如家务分工、周末安排），用10分钟共同写下规则 + 可调整的3种例外情况。',
      '当乙方再次质疑时，甲方先说一句「你这个角度有道理」，再说明底线在哪里，而不是直接驳回。',
    ],
  },
  {
    key: '七杀-正印',
    aToBShishen: '七杀',
    bDominantShishen: '正印',
    title: '高压推进 vs 需要缓冲',
    conflict: '一方说话直接、要求明确，另一方则需要温和过渡和情绪安全感；甲方一急，乙方就容易退缩或隐忍。',
    actions: [
      '本周甲方在提要求前，先降低语速和音量，并在句尾加一句「我相信你能处理」。',
      '乙方在感到被压制时，用固定句式表达：「我需要5分钟整理一下，然后我们再聊。」',
    ],
  },
  {
    key: '正印-伤官',
    aToBShishen: '正印',
    bDominantShishen: '伤官',
    title: '回避冲突 vs 直面摊牌',
    conflict: '一方希望维持表面和谐、慢慢消化矛盾，另一方则倾向于当场把话说开；乙方觉得甲方虚伪，甲方觉得乙方太冲。',
    actions: [
      '本周约定一个「安全词」，任何一方觉得快要吵起来时可以暂停，30分钟后再继续。',
      '乙方在表达不满时，先用「我注意到……」开头，而不是「你总是……」。',
    ],
  },
  {
    key: '比肩-正官',
    aToBShishen: '比肩',
    bDominantShishen: '正官',
    title: '平等协商 vs 目标推进',
    conflict: '一方习惯凡事商量、共同决策，另一方则希望快速制定计划并执行；乙方觉得甲方优柔寡断，甲方觉得乙方独断。',
    actions: [
      '本周把决策分为「必须共同决定」和「可以各自负责」两类，减少每件小事都要协商的消耗。',
      '乙方在做决定前，先用一句话说明理由，再给出结论，而不是直接下指令。',
    ],
  },
  {
    key: '劫财-偏印',
    aToBShishen: '劫财',
    bDominantShishen: '偏印',
    title: '即时沟通 vs 独处处理',
    conflict: '一方情绪来了就想立刻聊开，另一方则需要独处空间整理思绪；甲方觉得乙方冷漠，乙方觉得甲方逼得太紧。',
    actions: [
      '本周约定：当乙方说「我需要一点时间」时，甲方先离开现场做自己的事，1小时后再回来。',
      '乙方在独处后，主动用一条简短信息告诉甲方「我想好了，可以聊了」，减少甲方的不确定感。',
    ],
  },
  {
    key: '正财-偏财',
    aToBShishen: '正财',
    bDominantShishen: '偏财',
    title: '计划稳定 vs 灵活即兴',
    conflict: '一方重视提前约定和守信，另一方则喜欢临时变化和新鲜体验；乙方觉得甲方死板，甲方觉得乙方不负责任。',
    actions: [
      '本周把计划分成「固定锚点」（必须遵守）和「弹性区域」（可临时调整）两部分。',
      '乙方临时想变更计划时，必须同时提出替代方案，而不是只说一句「改一下吧」。',
    ],
  },
  {
    key: '食神-七杀',
    aToBShishen: '食神',
    bDominantShishen: '七杀',
    title: '缓和氛围 vs 直面问题',
    conflict: '一方遇到矛盾倾向于转移话题、缓和气氛，另一方则希望立刻面对问题、快速解决；乙方觉得甲方逃避，甲方觉得乙方压迫。',
    actions: [
      '本周约定一个「问题时间」，每天15分钟集中处理需要沟通的事，其余时间不主动挑起矛盾。',
      '甲方在乙方直接指出问题时，先复述一遍听到的内容，确认理解后再回应，而不是立刻转移话题。',
    ],
  },
  {
    key: '偏印-食神',
    aToBShishen: '偏印',
    bDominantShishen: '食神',
    title: '独处整理 vs 日常连接',
    conflict: '一方需要独处来恢复能量，另一方则通过日常陪伴和轻松互动来感受亲密；乙方觉得甲方疏远，甲方觉得乙方黏人。',
    actions: [
      '本周甲方每天主动发起一次5分钟的日常连接（如一起泡茶、分享一件小事），让乙方感到被重视。',
      '乙方在甲方需要独处时，不追问原因，只说「等你好了叫我」，并真的去做自己的事。',
    ],
  },
  {
    key: '伤官-正官',
    aToBShishen: '伤官',
    bDominantShishen: '正官',
    title: '质疑规则 vs 维护秩序',
    conflict: '一方喜欢挑战和重新讨论规则，另一方则希望规则稳定、按约定执行；乙方觉得甲方不守规矩，甲方觉得乙方僵化。',
    actions: [
      '每周安排一次15分钟的「规则复盘会」，其他时间按现有约定执行，减少日常摩擦。',
      '甲方在质疑规则时，必须同时提出一个替代方案，而不是只说「这样不对」。',
    ],
  },
  {
    key: '正官-劫财',
    aToBShishen: '正官',
    bDominantShishen: '劫财',
    title: '结构约束 vs 自由空间',
    conflict: '一方希望关系有清晰结构和共同目标，另一方则对约束敏感、需要自主空间；乙方容易把甲方的关心解读为控制。',
    actions: [
      '本周甲方在提要求时，先说明「这是建议，不是必须」，给乙方选择的空间。',
      '乙方在想要自主决定时，先告诉甲方自己的计划和大致时间，减少甲方的失控感。',
    ],
  },
  {
    key: '七杀-比肩',
    aToBShishen: '七杀',
    bDominantShishen: '比肩',
    title: '强势定调 vs 平等对抗',
    conflict: '一方习惯快速拿主意、推动执行，另一方则希望被当作平等伙伴商量；乙方容易在公开场合与甲方对抗。',
    actions: [
      '本周甲方在做影响双方的决策前，先问乙方一句「你怎么看」，等乙方说完再下结论。',
      '乙方在不同意时，用「我同意你的目标，但方式上我想补充」代替直接反对。',
    ],
  },
  {
    key: '正印-劫财',
    aToBShishen: '正印',
    bDominantShishen: '劫财',
    title: '照顾包容 vs 独立冒险',
    conflict: '一方通过照顾和包容来表达爱，另一方则需要独立空间和冒险机会；乙方可能把甲方的关心当成束缚。',
    actions: [
      '本周甲方每天至少一次用「你需要我做什么吗？」替代「你应该……」。',
      '乙方在做出让甲方担心的事前，主动说明计划和预计回来时间，减少甲方的焦虑。',
    ],
  },
]

export const DEFAULT_FRICTION: Omit<MarriageFriction, 'key'> = {
  title: '沟通节奏与情绪处理差异',
  conflict: '双方在沟通速度、情绪表达方式和处理冲突的节奏上存在差异，容易在压力场景下互相误解：一方觉得另一方太慢或太冲，另一方觉得被催促或被忽视。',
  actions: [
    '本周发生一次分歧时，双方约定「先停3分钟」再回应，避免情绪高峰时说出伤人的话。',
    '每天睡前用5分钟分享一件今天开心的小事，建立正向沟通惯性，抵消冲突时的负面情绪。',
  ],
}

// 日主五行关系标签（亲密关系视角）
export const DAY_MASTER_RELATION_LABELS: Record<string, string> = {
  比和: '气场相近，容易互相理解，但也容易在同类问题上僵持不下。',
  生: '一方天然愿意滋养和支持另一方，关系温暖但可能付出不均。',
  被生: '一方容易从另一方获得支持，需要注意不要把对方的好意视为理所当然。',
  克: '一方对另一方有约束和推动作用，容易带来成长，也可能造成压力。',
  被克: '一方容易挑战或激发另一方改变，需要更多耐心和沟通技巧。',
}

export function getDayMasterRelation(aRiGan: string, bRiGan: string): {
  relation: '比和' | '生' | '被生' | '克' | '被克'
  label: string
} {
  const aWx = GAN_WUXING[aRiGan] || ''
  const bWx = GAN_WUXING[bRiGan] || ''

  if (!aWx || !bWx) {
    return { relation: '比和', label: DAY_MASTER_RELATION_LABELS['比和']! }
  }

  if (aWx === bWx) return { relation: '比和', label: DAY_MASTER_RELATION_LABELS['比和']! }
  if (WUXING_SHENG[aWx] === bWx) return { relation: '生', label: DAY_MASTER_RELATION_LABELS['生']! }
  if (WUXING_SHENG[bWx] === aWx) return { relation: '被生', label: DAY_MASTER_RELATION_LABELS['被生']! }
  if (WUXING_KE[aWx] === bWx) return { relation: '克', label: DAY_MASTER_RELATION_LABELS['克']! }
  return { relation: '被克', label: DAY_MASTER_RELATION_LABELS['被克']! }
}

export function getPersonPortrait(shishenCounts: Record<string, number>): MarriagePortrait {
  const sorted = Object.entries(shishenCounts)
    .filter(([k]) => k !== '日主')
    .sort((a, b) => b[1] - a[1])
  const top = sorted[0]?.[0] || '比肩'
  return PERSONALITY_PORTRAITS[top] || PERSONALITY_PORTRAITS['比肩']!
}

export function findFrictionRule(aToBShishen: string, bDominantShishen: string): MarriageFriction | null {
  const rule = FRICTION_RULES.find(
    r => r.aToBShishen === aToBShishen && r.bDominantShishen === bDominantShishen,
  )
  if (!rule) return null
  return {
    key: rule.key,
    title: rule.title,
    conflict: rule.conflict,
    actions: rule.actions,
  }
}
