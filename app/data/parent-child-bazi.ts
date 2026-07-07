// app/data/parent-child-bazi.ts
// 亲子相性：亲子场景下的十神 - 教养特质映射规则
// 本文件独立存放，仅供「亲子相性」工具使用，不复用八字人格图谱的通用映射表。
// 所有描述定位为「性格倾向与沟通建议」，避免心理诊断式表述。

export interface ChildTraitProfile {
  shishen: string
  labels: string[]
  scenario: string
  communicationTip: string
}

export interface ParentRoleProfile {
  shishen: string
  labels: string[]
  scenario: string
  blindSpot: string
}

export interface FrictionRule {
  key: string
  parentToChildShishen: string
  childDominantShishen: string
  title: string
  conflict: string
  actions: string[]
}

export interface ParentChildMapping {
  childProfiles: Record<string, ChildTraitProfile>
  parentRoles: Record<string, ParentRoleProfile>
  frictionRules: FrictionRule[]
}

// 孩子单人十神性格画像：聚焦日常行为场景，避免诊断式标签
export const CHILD_TRAIT_PROFILES: Record<string, ChildTraitProfile> = {
  比肩: {
    shishen: '比肩',
    labels: ['自主', '平等意识强', '不服输'],
    scenario: '在学校小组活动中更愿意自己拿主意，对「你必须听我的」容易顶嘴；被当众批评时反应激烈，但私下沟通效果更好。',
    communicationTip: '少用命令句，多给二选一；先肯定他的判断，再补充你的顾虑。',
  },
  劫财: {
    shishen: '劫财',
    labels: ['行动快', '竞争欲强', '边界感弱'],
    scenario: '玩游戏输了会立刻要求再来一局，和兄弟姐妹容易因「谁先拿」爆发冲突；兴奋时很难安静坐下。',
    communicationTip: '提前约定游戏规则和轮流顺序；在他情绪激动时先带离现场，而不是当场说教。',
  },
  食神: {
    shishen: '食神',
    labels: ['温和', '表达欲强', '享受生活'],
    scenario: '喜欢边做边聊，吃饭时更愿意分享学校趣事；面对压力时容易用「我不知道」来回避。',
    communicationTip: '把要求嵌入轻松对话，避免连续追问；给他一点「边吃边聊」的缓冲时间。',
  },
  伤官: {
    shishen: '伤官',
    labels: ['聪明', '爱质疑', '追求独特'],
    scenario: '常会反问「为什么一定要这样」，对重复性作业不耐烦；被否定时容易用讽刺或沉默反抗。',
    communicationTip: '把他的质疑当作信息而非挑衅；解释规则时给出「为什么」而不是只说「就这样」。',
  },
  偏财: {
    shishen: '偏财',
    labels: ['外向', '灵活', '社交型'],
    scenario: '放学路上能和陌生人聊起来，朋友邀约比作业更吸引他；对长期奖励兴趣一般，喜欢即时反馈。',
    communicationTip: '用短周期小奖励建立习惯，而不是空谈未来好处；社交安排提前告知，避免临时打断。',
  },
  正财: {
    shishen: '正财',
    labels: ['踏实', '重规则', '责任感强'],
    scenario: '会主动记录作业清单，对「说好的事」很在意；突然被改计划容易焦虑，需要明确预期。',
    communicationTip: '变更计划时提前说明原因和新安排；肯定他守规则的行为，再讨论弹性空间。',
  },
  七杀: {
    shishen: '七杀',
    labels: ['敏锐', '有魄力', '抗压起伏大'],
    scenario: '遇到挑战时要么冲上去，要么完全退缩；对语气很敏感，一句重话可能让他记很久。',
    communicationTip: '批评时对事不对人，降低音量；在他退缩时给具体第一步，而不是催他「勇敢点」。',
  },
  正官: {
    shishen: '正官',
    labels: ['自律', '求认可', '守规矩'],
    scenario: '老师会评价「很省心」，但过度紧张于排名和评分；犯错后第一反应是担心被否定。',
    communicationTip: '表扬具体行为而非笼统「你真棒」；犯错时先问「你怎么看」，再一起找改进办法。',
  },
  偏印: {
    shishen: '偏印',
    labels: ['内省', '敏感', '洞察力强'],
    scenario: '喜欢独处思考，对感兴趣的话题能钻研很久；被强行社交或打断时会明显烦躁。',
    communicationTip: '尊重他的独处时间；重要谈话前先问他「现在方便聊吗」，不要突然推门打断。',
  },
  正印: {
    shishen: '正印',
    labels: ['温和', '依赖安全感', '包容'],
    scenario: '遇到困难第一反应是找家长，安慰后恢复很快；对新环境适应慢，需要陪伴过渡。',
    communicationTip: '先陪伴再放手；把大挑战拆成他能独立完成的小步骤，逐步建立自信。',
  },
}

// 家长角色画像：从孩子日主看家长是什么十神，即家长带给孩子的教养风格
export const PARENT_ROLE_PROFILES: Record<string, ParentRoleProfile> = {
  正官: {
    shishen: '正官',
    labels: ['规则型家长'],
    scenario: '习惯明确家规、作息表和奖惩标准，孩子清楚知道你的底线。',
    blindSpot: '容易把「守规矩」等同于「被爱」，孩子可能不敢表达真实想法。',
  },
  七杀: {
    shishen: '七杀',
    labels: ['权威型家长'],
    scenario: '说话有力度，孩子知道你说到做到；对效率和结果要求高。',
    blindSpot: '语气一重，敏感型孩子容易把批评当成否定，进入对抗或退缩。',
  },
  正印: {
    shishen: '正印',
    labels: ['滋养型家长'],
    scenario: '倾向于包容和保护，孩子受挫时第一反应是到你这里寻求安慰。',
    blindSpot: '过度代劳会让孩子失去试错机会，把「妈妈会帮我」内化为默认选项。',
  },
  偏印: {
    shishen: '偏印',
    labels: ['理解型家长'],
    scenario: '愿意听孩子解释原因，重视他的内在感受多于外在表现。',
    blindSpot: '讲太多「我理解你」可能让孩子觉得你在分析他，而不是陪他一起面对。',
  },
  比肩: {
    shishen: '比肩',
    labels: ['朋友型家长'],
    scenario: '习惯用平等语气商量，孩子愿意把你当朋友聊学校的事。',
    blindSpot: '边界模糊时，孩子可能把你的宽容当作可以讨价还价的空间。',
  },
  劫财: {
    shishen: '劫财',
    labels: ['竞争型家长'],
    scenario: '会和孩子一起比拼、挑战，用「看谁更快」来激励行动。',
    blindSpot: '长期比较容易让孩子把爱当成「只有赢才配得」。',
  },
  食神: {
    shishen: '食神',
    labels: ['轻松型家长'],
    scenario: '氛围轻松，鼓励孩子表达，家里常有笑声和创意活动。',
    blindSpot: '遇到需要坚持的事时，容易因为怕破坏气氛而降低要求。',
  },
  伤官: {
    shishen: '伤官',
    labels: ['开放型家长'],
    scenario: '愿意尝试新方法，鼓励孩子提出不同方案，不喜欢死板规则。',
    blindSpot: '规则变动太多，需要稳定感的孩子会没有安全感。',
  },
  正财: {
    shishen: '正财',
    labels: ['务实型家长'],
    scenario: '重视计划、责任和实际成果，常带孩子一起制定目标。',
    blindSpot: '过于关注「有没有完成」，可能忽略孩子当下的情绪需求。',
  },
  偏财: {
    shishen: '偏财',
    labels: ['灵活型家长'],
    scenario: '应变能力强，乐于带孩子见世面、交朋友、体验新事物。',
    blindSpot: '承诺容易临时调整，让孩子觉得「你说的话不太确定」。',
  },
}

// 摩擦规则库：特定家长风格 × 孩子主导十神 的常见冲突点与本周可执行行动
export const FRICTION_RULES: FrictionRule[] = [
  {
    key: '七杀家长-伤官孩子',
    parentToChildShishen: '七杀',
    childDominantShishen: '伤官',
    title: '权威压制 vs 质疑反抗',
    conflict: '家长习惯快速定调、用结果说话；孩子遇到强制要求第一反应是质疑规则本身，容易顶撞或冷对抗。',
    actions: [
      '本周发生一次冲突时，先停6秒再开口，把「你必须」改成「我需要你配合，因为……」。',
      '本周让孩子参与制定一条家规，比如周末屏幕时间，把「家长单方面规定」改成「共同商定版本」。',
    ],
  },
  {
    key: '正官家长-偏财孩子',
    parentToChildShishen: '正官',
    childDominantShishen: '偏财',
    title: '规则稳定 vs 灵活社交',
    conflict: '家长重视时间表和承诺，孩子却容易被朋友、新机会吸引而临时改变计划，导致家长觉得「不被尊重」。',
    actions: [
      '本周把固定安排写在可视化白板/纸上，临时变更必须提前30分钟告知并说明替代方案。',
      '本周允许孩子有1次「社交优先」的选择权，但前一晚必须和家长确认是否影响次日安排。',
    ],
  },
  {
    key: '正印家长-比肩孩子',
    parentToChildShishen: '正印',
    childDominantShishen: '比肩',
    title: '过度保护 vs 自主独立',
    conflict: '家长倾向于帮孩子铺平道路、替他做决定；孩子到了一定年龄后开始抗拒，觉得「你当我是小孩」。',
    actions: [
      '本周选一件孩子能自己完成的事（如整理书包、准备第二天衣物），完全交给他，不检查不催促。',
      '本周每天至少一次用「你打算怎么处理？」替代「你应该这样做」。',
    ],
  },
  {
    key: '偏印家长-劫财孩子',
    parentToChildShishen: '偏印',
    childDominantShishen: '劫财',
    title: '慢热理解 vs 冲动行动',
    conflict: '家长想先聊清楚感受和原因，孩子却已经情绪上头、动手或冲出门，双方节奏完全对不上。',
    actions: [
      '本周孩子情绪激动时，先陪他做一件消耗体力的小事（如原地跳10下、喝水），再开始对话。',
      '本周把谈话时间控制在5分钟内，只说「我看到……」+「我需要……」，不展开长篇分析。',
    ],
  },
  {
    key: '正财家长-食神孩子',
    parentToChildShishen: '正财',
    childDominantShishen: '食神',
    title: '目标导向 vs 过程享受',
    conflict: '家长关注任务完成度和效率，孩子更在意做事时是否开心、能否表达，容易被批评「不务正业」。',
    actions: [
      '本周完成一项任务后，先问孩子「过程中哪个部分最有趣」，再讨论结果。',
      '本周把一个大目标拆成3个小节点，每个节点完成后允许他做5分钟自己喜欢的事。',
    ],
  },
  {
    key: '比肩家长-正官孩子',
    parentToChildShishen: '比肩',
    childDominantShishen: '正官',
    title: '平等商量 vs 渴望明确标准',
    conflict: '家长习惯用商量和民主，孩子反而希望家长直接告诉他「什么是对的」，过多的选择让他焦虑。',
    actions: [
      '本周在2-3件日常小事上，明确给出「Yes/No」或「A/B」二选一，而不是开放式询问。',
      '本周每天睡前给孩子一个具体肯定，例如「今天你把书包整理得很好」，强化清晰标准。',
    ],
  },
  {
    key: '劫财家长-正印孩子',
    parentToChildShishen: '劫财',
    childDominantShishen: '正印',
    title: '激励竞争 vs 需要安全感',
    conflict: '家长常用「看谁更快」「你要赢」来激励，孩子却对竞争感到压力，更想要陪伴和无条件支持。',
    actions: [
      '本周取消一次「比赛」式激励，改成「我们一起完成」，完成后给孩子一个拥抱或击掌。',
      '本周每天留10分钟不评价、不指导的纯陪伴时间，孩子做什么都行。',
    ],
  },
  {
    key: '食神家长-正财孩子',
    parentToChildShishen: '食神',
    childDominantShishen: '正财',
    title: '轻松氛围 vs 责任焦虑',
    conflict: '家长希望气氛轻松、减少压力，孩子却会因为规则模糊而焦虑，反而反复确认「到底要做什么」。',
    actions: [
      '本周把每天必须完成的3件事写在清单上，完成一项勾选一项，让孩子自己掌控节奏。',
      '本周开玩笑或转移话题前，先确认孩子的问题已经得到明确回答。',
    ],
  },
  {
    key: '伤官家长-正官孩子',
    parentToChildShishen: '伤官',
    childDominantShishen: '正官',
    title: '灵活开放 vs 规则依赖',
    conflict: '家长喜欢临时调整、尝试新方法，孩子却依赖既定规则，变动会让他不安甚至情绪失控。',
    actions: [
      '本周如需变更计划，提前至少一天告诉孩子，并解释「什么变了」和「什么没变」。',
      '本周和孩子一起做一个「不变清单」，列出每天固定会发生的事，增强稳定感。',
    ],
  },
  {
    key: '偏财家长-偏印孩子',
    parentToChildShishen: '偏财',
    childDominantShishen: '偏印',
    title: '外向体验 vs 内向深耕',
    conflict: '家长喜欢带孩子社交、见世面，孩子却更想宅在家里钻研自己感兴趣的事，被拉出门容易疲惫。',
    actions: [
      '本周把外出安排减半，或允许孩子带一个他熟悉/喜欢的物品出门作为「安全锚」。',
      '本周每天留30分钟不被打扰的独处时间，家长不敲门、不送水果、不借故查看。',
    ],
  },
  {
    key: '七杀家长-正印孩子',
    parentToChildShishen: '七杀',
    childDominantShishen: '正印',
    title: '高要求 vs 高敏感',
    conflict: '家长语气或要求一重，孩子容易解读为「我不够好」，进而退缩或哭泣，家长又觉得孩子「太脆弱」。',
    actions: [
      '本周下达要求时，把声音降低一度，并在句尾加一句「我相信你能做到」。',
      '本周每天记录一次孩子主动尝试的小事，睡前具体反馈给他听，重建「尝试=安全」的体验。',
    ],
  },
  {
    key: '正官家长-伤官孩子',
    parentToChildShishen: '正官',
    childDominantShishen: '伤官',
    title: '规则清晰 vs 质疑规则',
    conflict: '家长强调「规则就是规则」，孩子却总在找例外、问为什么，家长觉得被挑战权威。',
    actions: [
      '本周选一条孩子常质疑的规则，用5分钟解释「这条规则保护的是什么」，允许他提一个修改建议。',
      '本周当孩子再次质疑时，先说一句「你这个角度很有意思」，再给出你的判断。',
    ],
  },
]

// 默认摩擦规则：当没有精确匹配时使用，按家长风格和日主生克生成通用版本
export const DEFAULT_FRICTION: Omit<FrictionRule, 'key' | 'parentToChildShishen' | 'childDominantShishen'> = {
  title: '教养节奏差异',
  conflict: '双方性格倾向不同，导致日常沟通中一个想推进、一个想缓冲，容易在作业、作息、规则执行等场景产生拉锯。',
  actions: [
    '本周固定一个「亲子同步时间」，每天10-15分钟，不谈学习和规则，只做孩子选的事。',
    '本周遇到意见分歧时，先复述一遍孩子的话，确认你听懂了，再表达你的需求。',
  ],
}

import { GAN_WUXING, WUXING_SHENG, WUXING_KE } from '~/utils/bazi/constants'

// 日主五行关系标签（从孩子视角看家长日主对孩子的作用）
export const DAY_MASTER_RELATION_LABELS: Record<string, string> = {
  比和: '气场相近，容易理解但容易较真',
  生: '家长天然滋养孩子，关系温暖但可能溺爱',
  被生: '孩子容易消耗家长精力，需要家长多付出',
  克: '家长对孩子有约束力，但也容易带来压力',
  被克: '孩子天然挑战家长权威，需要更多耐心',
}

export function getDayMasterRelation(parentRiGan: string, childRiGan: string): {
  relation: '比和' | '生' | '被生' | '克' | '被克'
  label: string
} {
  const parentWx = GAN_WUXING[parentRiGan] || ''
  const childWx = GAN_WUXING[childRiGan] || ''

  if (!parentWx || !childWx) {
    return { relation: '比和', label: DAY_MASTER_RELATION_LABELS['比和']! }
  }

  if (parentWx === childWx) return { relation: '比和', label: DAY_MASTER_RELATION_LABELS['比和']! }
  if (WUXING_SHENG[parentWx] === childWx) return { relation: '生', label: DAY_MASTER_RELATION_LABELS['生']! }
  if (WUXING_SHENG[childWx] === parentWx) return { relation: '被生', label: DAY_MASTER_RELATION_LABELS['被生']! }
  if (WUXING_KE[parentWx] === childWx) return { relation: '克', label: DAY_MASTER_RELATION_LABELS['克']! }
  return { relation: '被克', label: DAY_MASTER_RELATION_LABELS['被克']! }
}

export function getChildProfile(childShishenCounts: Record<string, number>): ChildTraitProfile {
  const sorted = Object.entries(childShishenCounts)
    .filter(([k]) => k !== '日主')
    .sort((a, b) => b[1] - a[1])
  const top = sorted[0]?.[0] || '比肩'
  return CHILD_TRAIT_PROFILES[top] || CHILD_TRAIT_PROFILES['比肩']!
}

export function getParentRole(parentToChildShishen: string): ParentRoleProfile {
  return PARENT_ROLE_PROFILES[parentToChildShishen] || PARENT_ROLE_PROFILES['正官']!
}

export function findFrictionRule(
  parentToChildShishen: string,
  childDominantShishen: string,
): FrictionRule | null {
  return (
    FRICTION_RULES.find(
      r =>
        r.parentToChildShishen === parentToChildShishen &&
        r.childDominantShishen === childDominantShishen,
    ) || null
  )
}
