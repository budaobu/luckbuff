// app/data/child-activity-interest.ts
// 孩子活动兴趣方向：十神 -> 日常活动维度映射规则
// 本文件独立存放，仅供「孩子活动兴趣方向测试」使用。
// 所有描述定位为「活动倾向观察」，不做能力、潜力或教育指导判断。

export type ActivityDimensionKey =
  | 'linguistic'
  | 'logical'
  | 'spatial'
  | 'motor'
  | 'musical'
  | 'interpersonal'
  | 'intrapersonal'

export interface ActivityDimension {
  key: ActivityDimensionKey
  labels: Record<string, string>
  tags: Record<string, string[]>
  scenario: Record<string, string>
  homeActivities: Record<string, string[]>
}

export const ACTIVITY_DIMENSIONS: ActivityDimension[] = [
  {
    key: 'linguistic',
    labels: {
      'zh-CN': '语言',
      'zh-TW': '語言',
      en: 'Linguistic',
    },
    tags: {
      'zh-CN': ['爱提问', '喜欢讲故事', '爱聊天'],
      'zh-TW': ['愛提問', '喜歡講故事', '愛聊天'],
      en: ['Curious', 'Storytelling', 'Chatty'],
    },
    scenario: {
      'zh-CN': '更容易在讲故事、聊天、角色扮演和问「为什么」中进入状态；对文字游戏、绕口令、情节接龙兴致较高，表达时眼睛会亮起来。',
      'zh-TW': '更容易在講故事、聊天、角色扮演和問「為什麼」中進入狀態；對文字遊戲、繞口令、情節接龍興致較高，表達時眼睛會亮起來。',
      en: 'They tend to get absorbed in storytelling, conversation, role-play, and asking "why"; they light up with word games, tongue twisters, and story continuations.',
    },
    homeActivities: {
      'zh-CN': [
        '本周可以玩一個「故事接龍」遊戲：你先開頭，輪流續編，觀察她在接龍時是否變得主動、停不下來。',
        '也可以在日常聊天中故意留一個小懸念，看她會不會主動追問、補充情節。',
      ],
      'zh-TW': [
        '本週可以玩一個「故事接龍」遊戲：你先開頭，輪流續編，觀察她在接龍時是否變得主動、停不下來。',
        '也可以在日常聊天中故意留一個小懸念，看她會不會主動追問、補充情節。',
      ],
      en: [
        'Try a "story chain" game this week: you start, then take turns adding sentences, and notice when they become eager and hard to stop.',
        'Leave a small cliffhanger in daily chat and see if they ask follow-up questions or add their own details.',
      ],
    },
  },
  {
    key: 'logical',
    labels: {
      'zh-CN': '逻辑数理',
      'zh-TW': '邏輯數理',
      en: 'Logical-Mathematical',
    },
    tags: {
      'zh-CN': ['爱分类', '找规律', '喜欢规则游戏'],
      'zh-TW': ['愛分類', '找規律', '喜歡規則遊戲'],
      en: ['Sorting', 'Pattern-seeking', 'Rule-based play'],
    },
    scenario: {
      'zh-CN': '更容易在分类、排序、找规律、棋类、数独和建立规则中安静下来；喜欢问因果关系，对「下一步是什么」有执着。',
      'zh-TW': '更容易在分類、排序、找規律、棋類、數獨和建立規則中安靜下來；喜歡問因果關係，對「下一步是什麼」有執著。',
      en: 'They settle easily into sorting, sequencing, patterns, board games, and rule-making; they like to trace cause and effect and wonder "what comes next?"',
    },
    homeActivities: {
      'zh-CN': [
        '本周可以给她一些可分类的日常小物（如不同形状的纽扣、积木），观察她是否会自己建立规则来玩。',
        '也可以一起玩简单的找规律游戏，记录她对「下一步是什么」的反应。',
      ],
      'zh-TW': [
        '本週可以給她一些可分類的日常小物（如不同形狀的鈕扣、積木），觀察她是否會自己建立規則來玩。',
        '也可以一起玩簡單的找規律遊戲，記錄她對「下一步是什麼」的反應。',
      ],
      en: [
        'Give them a handful of sortable household items this week and watch whether they invent their own sorting rules.',
        'Play a simple pattern game together and note how they respond to "what comes next?"',
      ],
    },
  },
  {
    key: 'spatial',
    labels: {
      'zh-CN': '空间',
      'zh-TW': '空間',
      en: 'Spatial',
    },
    tags: {
      'zh-CN': ['爱涂鸦', '喜欢拼图', '拆装能手'],
      'zh-TW': ['愛塗鴉', '喜歡拼圖', '拆裝能手'],
      en: ['Doodling', 'Puzzle lover', 'Tinkerer'],
    },
    scenario: {
      'zh-CN': '更容易在涂鸦、拼图、积木、迷宫、拆装玩具和搭建结构中专注；对形状、方位和空间关系比较敏感。',
      'zh-TW': '更容易在塗鴉、拼圖、積木、迷宮、拆裝玩具和搭建結構中專注；對形狀、方位和空間關係比較敏感。',
      en: 'They focus well while drawing, puzzling, building, taking things apart, and navigating mazes; they notice shapes, directions, and spatial relationships.',
    },
    homeActivities: {
      'zh-CN': [
        '本周可以把家里的小型积木或拼图铺开来，观察她能安静拼多久、会不会尝试不同结构。',
        '也可以带她在纸上画一幅「家里的地图」，看她对空间方位是否感兴趣。',
      ],
      'zh-TW': [
        '本週可以把家裡的小型積木或拼圖鋪開來，觀察她能安靜拼多久、會不會嘗試不同結構。',
        '也可以帶她在紙上畫一幅「家裡的地圖」，看她對空間方位是否感興趣。',
      ],
      en: [
        'Spread out small blocks or a puzzle at home and notice how long they stay absorbed and whether they try different structures.',
        'Draw a simple "map of our home" together and see if they engage with directions and layouts.',
      ],
    },
  },
  {
    key: 'motor',
    labels: {
      'zh-CN': '运动',
      'zh-TW': '運動',
      en: 'Movement',
    },
    tags: {
      'zh-CN': ['精力充沛', '爱跑跳', '身体活跃'],
      'zh-TW': ['精力充沛', '愛跑跳', '身體活躍'],
      en: ['Energetic', 'Active', 'Kinesthetic'],
    },
    scenario: {
      'zh-CN': '更容易在跑跳、攀爬、球类、户外探索和需要身体动起来的游戏中释放能量；久坐后容易找机会活动身体。',
      'zh-TW': '更容易在跑跳、攀爬、球類、戶外探索和需要身體動起來的遊戲中釋放能量；久坐後容易找機會活動身體。',
      en: 'They release energy through running, climbing, ball games, outdoor exploration, and full-body play; sitting still for long makes them seek movement.',
    },
    homeActivities: {
      'zh-CN': [
        '本周可以选一个安全的小公园或空地，观察她在攀爬、追逐、球类活动中什么时候最投入。',
        '也可以在家里用枕头搭一个小障碍路线，看她是否喜欢反复挑战。',
      ],
      'zh-TW': [
        '本週可以選一個安全的小公園或空地，觀察她在攀爬、追逐、球類活動中什麼時候最投入。',
        '也可以在家裡用枕頭搭一個小障礙路線，看她是否喜歡反覆挑戰。',
      ],
      en: [
        'Visit a safe park or open space this week and notice which climbing, chasing, or ball activity pulls them in most.',
        'Build a small pillow obstacle course at home and see if they enjoy repeating the challenge.',
      ],
    },
  },
  {
    key: 'musical',
    labels: {
      'zh-CN': '音乐',
      'zh-TW': '音樂',
      en: 'Musical',
    },
    tags: {
      'zh-CN': ['爱哼唱', '节奏感好', '喜欢律动'],
      'zh-TW': ['愛哼唱', '節奏感好', '喜歡律動'],
      en: ['Humming', 'Rhythmic', 'Loves to move to music'],
    },
    scenario: {
      'zh-CN': '更容易在唱歌、律动、打击乐器和跟着节奏摇摆中投入；对旋律、节奏有明显反应，常被音乐吸引注意力。',
      'zh-TW': '更容易在唱歌、律動、打擊樂器和跟著節奏搖擺中投入；對旋律、節奏有明顯反應，常被音樂吸引注意力。',
      en: 'They get absorbed in singing, moving to rhythm, percussion, and dancing; they clearly respond to melody and beat and are often drawn to music.',
    },
    homeActivities: {
      'zh-CN': [
        '本周可以放一段节奏鲜明的音乐，观察她是否会自然跟着拍手、跺脚或哼唱。',
        '也可以给她一个简单的打击乐器，看她在自由敲击时会不会进入自己的节奏。',
      ],
      'zh-TW': [
        '本週可以放一段節奏鮮明的音樂，觀察她是否會自然跟著拍手、跺腳或哼唱。',
        '也可以給她一個簡單的打擊樂器，看她在自由敲擊時會不會進入自己的節奏。',
      ],
      en: [
        'Play music with a clear beat and watch whether they naturally clap, stomp, or hum along.',
        'Hand them a simple percussion instrument and see if they settle into their own rhythm while playing freely.',
      ],
    },
  },
  {
    key: 'interpersonal',
    labels: {
      'zh-CN': '人际',
      'zh-TW': '人際',
      en: 'Interpersonal',
    },
    tags: {
      'zh-CN': ['喜欢合作', '爱照顾人', '有人陪更开心'],
      'zh-TW': ['喜歡合作', '愛照顧人', '有人陪更開心'],
      en: ['Cooperative', 'Caring', 'Social'],
    },
    scenario: {
      'zh-CN': '更容易在合作游戏、群体活动、照顾他人和家庭互动中感到开心；有人陪一起玩时明显更投入，喜欢分享和回应。',
      'zh-TW': '更容易在合作遊戲、群體活動、照顧他人和家庭互動中感到開心；有人陪一起玩時明顯更投入，喜歡分享和回應。',
      en: 'They thrive in cooperative play, group activities, caring for others, and family interaction; they are noticeably more engaged when someone joins in and like to share and respond.',
    },
    homeActivities: {
      'zh-CN': [
        '本周可以安排一次需要合作完成的小任务，比如一起准备一顿简单的饭，观察她是不是在互动中更开心。',
        '也可以邀请一位同龄小伙伴来家里，观察她在两人游戏中是主导还是配合。',
      ],
      'zh-TW': [
        '本週可以安排一次需要合作完成的小任務，比如一起準備一頓簡單的飯，觀察她是不是在互動中更開心。',
        '也可以邀請一位同齡小夥伴來家裡，觀察她在兩人遊戲中主導還是配合。',
      ],
      en: [
        'Set up a small cooperative task this week, like preparing a simple meal together, and notice if they seem happier during the interaction.',
        'Invite a peer over and observe whether they take the lead or prefer to follow in two-person play.',
      ],
    },
  },
  {
    key: 'intrapersonal',
    labels: {
      'zh-CN': '内省',
      'zh-TW': '內省',
      en: 'Intrapersonal',
    },
    tags: {
      'zh-CN': ['喜欢独处', '安静观察', '沉浸自己的小世界'],
      'zh-TW': ['喜歡獨處', '安靜觀察', '沉浸自己的小世界'],
      en: ['Solitary', 'Observant', 'Inner world'],
    },
    scenario: {
      'zh-CN': '更容易在独处、安静观察、自由涂鸦/日记和不受打扰的探索中放松；需要属于自己的小空间，被打断时容易烦躁。',
      'zh-TW': '更容易在獨處、安靜觀察、自由塗鴉／日記和不受打擾的探索中放鬆；需要屬於自己的小空間，被打斷時容易煩躁。',
      en: 'They relax during solo time, quiet observation, free drawing or journaling, and uninterrupted exploration; they need a small space of their own and may get irritable when interrupted.',
    },
    homeActivities: {
      'zh-CN': [
        '本周可以在家中为她设置一个「安静角」，放些她喜欢的书和画笔，观察她是否会主动进去独处一会儿。',
        '也可以一起养一盆小植物，记录她观察变化时的投入程度。',
      ],
      'zh-TW': [
        '本週可以在家中為她設置一個「安靜角」，放些她喜歡的書和畫筆，觀察她是否會主動進去獨處一會兒。',
        '也可以一起養一盆小植物，記錄她觀察變化時的投入程度。',
      ],
      en: [
        'Create a "quiet corner" at home with books and drawing tools and see if they choose to spend time there on their own.',
        'Care for a small plant together and note how absorbed they are while observing its changes.',
      ],
    },
  },
]

// 十神到活动维度的映射：一个十神只贡献到一个维度，保持规则简单可审
export const SHISHEN_ACTIVITY_DIMENSION_MAP: Record<string, ActivityDimensionKey> = {
  比肩: 'intrapersonal',
  劫财: 'motor',
  食神: 'musical',
  伤官: 'linguistic',
  偏财: 'interpersonal',
  正财: 'logical',
  七杀: 'motor',
  正官: 'logical',
  偏印: 'intrapersonal',
  正印: 'interpersonal',
}

export const ACTIVITY_DIMENSION_ORDER: ActivityDimensionKey[] = [
  'linguistic',
  'logical',
  'spatial',
  'motor',
  'musical',
  'interpersonal',
  'intrapersonal',
]

export function getDimensionMeta(key: ActivityDimensionKey): ActivityDimension | undefined {
  return ACTIVITY_DIMENSIONS.find(d => d.key === key)
}

export function computeActivityDimensionScores(
  shishenCounts: Record<string, number>,
): Record<ActivityDimensionKey, number> {
  const raw: Record<ActivityDimensionKey, number> = {
    linguistic: 0,
    logical: 0,
    spatial: 0,
    motor: 0,
    musical: 0,
    interpersonal: 0,
    intrapersonal: 0,
  }
  for (const [shishen, dimKey] of Object.entries(SHISHEN_ACTIVITY_DIMENSION_MAP)) {
    raw[dimKey] += shishenCounts[shishen] || 0
  }
  const maxCount = Math.max(1, ...Object.values(raw))
  const scores: Record<ActivityDimensionKey, number> = { ...raw }
  for (const key of ACTIVITY_DIMENSION_ORDER) {
    scores[key] = Math.min(100, Math.round((raw[key] / maxCount) * 100))
  }
  return scores
}

export function getTopDimensions(
  scores: Record<ActivityDimensionKey, number>,
): { primary: ActivityDimensionKey; secondary?: ActivityDimensionKey } {
  const sorted = [...ACTIVITY_DIMENSION_ORDER].sort((a, b) => scores[b] - scores[a])
  const primary = sorted[0]!
  const secondary = sorted[1]
  if (secondary && scores[secondary] >= scores[primary] * 0.75) {
    return { primary, secondary }
  }
  return { primary }
}

export interface ActivityPortrait {
  primaryLabel: string
  secondaryLabel?: string
  labels: string[]
  scenario: string
  activities: string[]
}

export function buildPortrait(
  scores: Record<ActivityDimensionKey, number>,
  locale: string,
): ActivityPortrait {
  const effectiveLocale = locale === 'zh-TW' ? 'zh-TW' : locale === 'en' ? 'en' : 'zh-CN'
  const { primary, secondary } = getTopDimensions(scores)
  const primaryMeta = getDimensionMeta(primary)!
  const secondaryMeta = secondary ? getDimensionMeta(secondary) : undefined

  const labels: string[] = [
    ...(primaryMeta.tags[effectiveLocale] || primaryMeta.tags['zh-CN'] || []),
  ]
  if (secondaryMeta) {
    labels.push(...(secondaryMeta.tags[effectiveLocale] || secondaryMeta.tags['zh-CN'] || []).slice(0, 2))
  }

  const scenario = primaryMeta.scenario[effectiveLocale] || primaryMeta.scenario['zh-CN']!

  const activities = [
    ...(primaryMeta.homeActivities[effectiveLocale] || primaryMeta.homeActivities['zh-CN'] || []),
  ]
  if (secondaryMeta && activities.length < 2) {
    const secondaryActivities = secondaryMeta.homeActivities[effectiveLocale] || secondaryMeta.homeActivities['zh-CN'] || []
    activities.push(secondaryActivities[0] || '')
  }

  return {
    primaryLabel: primaryMeta.labels[effectiveLocale] || primaryMeta.labels['zh-CN']!,
    secondaryLabel: secondaryMeta
      ? secondaryMeta.labels[effectiveLocale] || secondaryMeta.labels['zh-CN']!
      : undefined,
    labels: [...new Set(labels)],
    scenario,
    activities: activities.filter(Boolean).slice(0, 2),
  }
}
