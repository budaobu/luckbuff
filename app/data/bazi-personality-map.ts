// app/data/bazi-personality-map.ts
// 八字十神人格图谱映射规则
// 同时供 server/api/tools/bazi-personality-map/calc.post.ts 与前端组件使用

export const SHISHEN_DIMENSION_MAP: Record<string, string> = {
  比肩: 'selfIdentity',
  劫财: 'actionDrive',
  食神: 'expressiveCreativity',
  伤官: 'disruptiveInnovation',
  偏财: 'socialMagnetism',
  正财: 'responsibleOrder',
  七杀: 'challengeSeeking',
  正官: 'disciplinedAchievement',
  偏印: 'insightfulAnalysis',
  正印: 'nurturingCare',
}

export const DIMENSION_ORDER = [
  'selfIdentity',
  'actionDrive',
  'expressiveCreativity',
  'disruptiveInnovation',
  'socialMagnetism',
  'responsibleOrder',
  'challengeSeeking',
  'disciplinedAchievement',
  'insightfulAnalysis',
  'nurturingCare',
]

export interface DimensionMeta {
  key: string
  labels: Record<string, string>
  tags: Record<string, string[]>
  tips: Record<string, { high: string; mid: string; low: string }>
}

export const DIMENSION_META: DimensionMeta[] = [
  {
    key: 'selfIdentity',
    labels: {
      'zh-CN': '自我认同',
      'zh-TW': '自我認同',
      en: 'Self-Identity',
    },
    tags: {
      'zh-CN': ['独立', '自信', '主见'],
      'zh-TW': ['獨立', '自信', '主見'],
      en: ['Independent', 'Confident', 'Self-directed'],
    },
    tips: {
      'zh-CN': {
        high: '自我认知清晰，有坚定的个人立场，不易被外界左右。',
        mid: '自我意识稳定，但在重要选择上仍会参考他人意见。',
        low: '容易受环境影响，需要更多时间建立稳定的自我认同。',
      },
      'zh-TW': {
        high: '自我認知清晰，有堅定的個人立場，不易被外界左右。',
        mid: '自我意識穩定，但在重要選擇上仍會參考他人意見。',
        low: '容易受環境影響，需要更多時間建立穩定的自我認同。',
      },
      en: {
        high: 'You have a clear sense of self and hold firm personal boundaries.',
        mid: 'Your self-image is steady, yet you still weigh others\' input on big decisions.',
        low: 'You are easily influenced by context and are still building a stable identity.',
      },
    },
  },
  {
    key: 'actionDrive',
    labels: {
      'zh-CN': '行动魄力',
      'zh-TW': '行動魄力',
      en: 'Action Drive',
    },
    tags: {
      'zh-CN': ['果断', '冲劲', '执行力'],
      'zh-TW': ['果斷', '衝勁', '執行力'],
      en: ['Decisive', 'Energetic', 'Executing'],
    },
    tips: {
      'zh-CN': {
        high: '行动力极强，想到就做，适合在变化中快速推进。',
        mid: '有执行意愿，但会权衡风险后再行动。',
        low: '行动前思虑较多，适合稳扎稳打的节奏。',
      },
      'zh-TW': {
        high: '行動力極強，想到就做，適合在變化中快速推進。',
        mid: '有執行意願，但會權衡風險後再行動。',
        low: '行動前思慮較多，適合穩紮穩打的節奏。',
      },
      en: {
        high: 'You move fast from idea to action and thrive in dynamic environments.',
        mid: 'You are willing to act, but prefer to assess risks first.',
        low: 'You think carefully before acting and favor a steady pace.',
      },
    },
  },
  {
    key: 'expressiveCreativity',
    labels: {
      'zh-CN': '表达创造',
      'zh-TW': '表達創造',
      en: 'Expressive Creativity',
    },
    tags: {
      'zh-CN': ['表达', '创意', '感染力'],
      'zh-TW': ['表達', '創意', '感染力'],
      en: ['Expressive', 'Creative', 'Engaging'],
    },
    tips: {
      'zh-CN': {
        high: '表达流畅、富有感染力，善于用创意连接人心。',
        mid: '有表达欲望，创意输出稳定，适合持续积累。',
        low: '表达偏内敛，更适合通过作品或行动展现想法。',
      },
      'zh-TW': {
        high: '表達流暢、富有感染力，善於用創意連結人心。',
        mid: '有表達慾望，創意輸出穩定，適合持續累積。',
        low: '表達偏內斂，更適合透過作品或行動展現想法。',
      },
      en: {
        high: 'You communicate with warmth and originality, easily moving others.',
        mid: 'You have a steady creative voice that grows stronger with practice.',
        low: 'You tend to express yourself through work and action rather than words.',
      },
    },
  },
  {
    key: 'disruptiveInnovation',
    labels: {
      'zh-CN': '突破创新',
      'zh-TW': '突破創新',
      en: 'Disruptive Innovation',
    },
    tags: {
      'zh-CN': ['创新', '叛逆', '破局'],
      'zh-TW': ['創新', '叛逆', '破局'],
      en: ['Innovative', 'Non-conformist', 'Disruptive'],
    },
    tips: {
      'zh-CN': {
        high: '思维跳脱框架，擅长发现问题并提出非常规方案。',
        mid: '愿意尝试新方法，在熟悉领域能提出改进建议。',
        low: '更信赖经过验证的路径，倾向于在稳定中优化。',
      },
      'zh-TW': {
        high: '思維跳脫框架，擅長發現問題並提出非常規方案。',
        mid: '願意嘗試新方法，在熟悉領域能提出改進建議。',
        low: '更信賴經過驗證的路徑，傾向於在穩定中優化。',
      },
      en: {
        high: 'You think outside conventions and spot unconventional solutions.',
        mid: 'You are open to new methods and improve known domains.',
        low: 'You prefer proven paths and refine stability rather than disrupt it.',
      },
    },
  },
  {
    key: 'socialMagnetism',
    labels: {
      'zh-CN': '社交魅力',
      'zh-TW': '社交魅力',
      en: 'Social Magnetism',
    },
    tags: {
      'zh-CN': ['外向', '人缘', '灵活'],
      'zh-TW': ['外向', '人緣', '靈活'],
      en: ['Outgoing', 'Popular', 'Adaptable'],
    },
    tips: {
      'zh-CN': {
        high: '社交轻松自然，容易获得他人好感与资源支持。',
        mid: '人际关系稳定，能够在需要时拓展人脉。',
        low: '社交圈偏精窄，更注重深度而非广度。',
      },
      'zh-TW': {
        high: '社交輕鬆自然，容易獲得他人好感與資源支持。',
        mid: '人際關係穩定，能夠在需要時拓展人脈。',
        low: '社交圈偏精窄，更注重深度而非廣度。',
      },
      en: {
        high: 'You move through social settings with ease and attract support.',
        mid: 'Your relationships are stable and you can expand them when needed.',
        low: 'You keep a small, close circle and value depth over breadth.',
      },
    },
  },
  {
    key: 'responsibleOrder',
    labels: {
      'zh-CN': '责任秩序',
      'zh-TW': '責任秩序',
      en: 'Responsible Order',
    },
    tags: {
      'zh-CN': ['负责', '规划', '务实'],
      'zh-TW': ['負責', '規劃', '務實'],
      en: ['Responsible', 'Planned', 'Practical'],
    },
    tips: {
      'zh-CN': {
        high: '重视承诺与秩序，善于管理资源与稳步推进计划。',
        mid: '有责任心，能在规则与灵活之间找到平衡。',
        low: '对固定框架耐心有限，更喜欢灵活应变。',
      },
      'zh-TW': {
        high: '重視承諾與秩序，善於管理資源與穩步推進計畫。',
        mid: '有責任心，能在規則與靈活之間找到平衡。',
        low: '對固定框架耐心有限，更喜歡靈活應變。',
      },
      en: {
        high: 'You value commitment and structure, managing resources methodically.',
        mid: 'You are reliable and balance rules with flexibility.',
        low: 'You have limited patience for rigid frames and prefer adaptability.',
      },
    },
  },
  {
    key: 'challengeSeeking',
    labels: {
      'zh-CN': '挑战冒险',
      'zh-TW': '挑戰冒險',
      en: 'Challenge Seeking',
    },
    tags: {
      'zh-CN': ['冒险', '竞争', '抗压'],
      'zh-TW': ['冒險', '競爭', '抗壓'],
      en: ['Adventurous', 'Competitive', 'Resilient'],
    },
    tips: {
      'zh-CN': {
        high: '喜欢挑战与竞争，压力反而能激发你的斗志。',
        mid: '面对挑战有斗志，但会选择胜算较高的方向。',
        low: '更偏好稳定环境，激烈竞争容易消耗你的能量。',
      },
      'zh-TW': {
        high: '喜歡挑戰與競爭，壓力反而能激發你的鬥志。',
        mid: '面對挑戰有鬥志，但會選擇勝算較高的方向。',
        low: '更偏好穩定環境，激烈競爭容易消耗你的能量。',
      },
      en: {
        high: 'You seek challenge and competition; pressure fuels you.',
        mid: 'You rise to challenges, but prefer winnable battles.',
        low: 'You prefer stable settings and find fierce rivalry draining.',
      },
    },
  },
  {
    key: 'disciplinedAchievement',
    labels: {
      'zh-CN': '自律成就',
      'zh-TW': '自律成就',
      en: 'Disciplined Achievement',
    },
    tags: {
      'zh-CN': ['自律', '目标', '成就'],
      'zh-TW': ['自律', '目標', '成就'],
      en: ['Self-disciplined', 'Goal-oriented', 'Achieving'],
    },
    tips: {
      'zh-CN': {
        high: '目标感强，自律性高，能长期坚持并达成高标准。',
        mid: '有明确目标，能在多数情况下保持自律。',
        low: '对目标有弹性，更看重过程中的体验与自由。',
      },
      'zh-TW': {
        high: '目標感強，自律性高，能長期堅持並達成高標準。',
        mid: '有明確目標，能在多數情況下保持自律。',
        low: '對目標有彈性，更看重過程中的體驗與自由。',
      },
      en: {
        high: 'You are highly disciplined and persist toward ambitious goals.',
        mid: 'You have clear goals and maintain discipline most of the time.',
        low: 'You are flexible with goals and prioritize experience and freedom.',
      },
    },
  },
  {
    key: 'insightfulAnalysis',
    labels: {
      'zh-CN': '洞察思辨',
      'zh-TW': '洞察思辨',
      en: 'Insightful Analysis',
    },
    tags: {
      'zh-CN': ['洞察', '分析', '思辨'],
      'zh-TW': ['洞察', '分析', '思辨'],
      en: ['Insightful', 'Analytical', 'Reflective'],
    },
    tips: {
      'zh-CN': {
        high: '思维锐利，善于抽丝剥茧，能看到现象背后的结构。',
        mid: '有一定分析能力，喜欢在决策前理清逻辑。',
        low: '更依赖直觉与经验，复杂的逻辑推演不是你的首选。',
      },
      'zh-TW': {
        high: '思維銳利，善於抽絲剝繭，能看到現象背後的結構。',
        mid: '有一定分析能力，喜歡在決策前釐清邏輯。',
        low: '更依賴直覺與經驗，複雜的邏輯推演不是你的首選。',
      },
      en: {
        high: 'You see structures beneath the surface and dissect problems sharply.',
        mid: 'You analyze situations and prefer to clarify logic before deciding.',
        low: 'You rely more on intuition and experience than on lengthy analysis.',
      },
    },
  },
  {
    key: 'nurturingCare',
    labels: {
      'zh-CN': '滋养关怀',
      'zh-TW': '滋養關懷',
      en: 'Nurturing Care',
    },
    tags: {
      'zh-CN': ['包容', '关怀', '滋养'],
      'zh-TW': ['包容', '關懷', '滋養'],
      en: ['Inclusive', 'Caring', 'Nurturing'],
    },
    tips: {
      'zh-CN': {
        high: '内心温暖，善于滋养他人，容易成为身边人的情感支柱。',
        mid: '有同理心，能在他人需要时给予支持。',
        low: '情感表达较克制，关心他人更偏向实际行动。',
      },
      'zh-TW': {
        high: '內心溫暖，善於滋養他人，容易成為身邊人的情感支柱。',
        mid: '有同理心，能在他人需要時給予支持。',
        low: '情感表達較克制，關心他人更偏向實際行動。',
      },
      en: {
        high: 'You are a warm, steady source of support for people around you.',
        mid: 'You are empathetic and offer support when others need it.',
        low: 'You show care through practical help more than emotional display.',
      },
    },
  },
]

export function getDimensionMeta(key: string): DimensionMeta | undefined {
  return DIMENSION_META.find(d => d.key === key)
}

export function computeDimensionScores(
  shishenCounts: Record<string, number>,
): Record<string, number> {
  const counts = Object.entries(SHISHEN_DIMENSION_MAP).map(([shishen, dimKey]) => ({
    dimKey,
    count: shishenCounts[shishen] || 0,
  }))
  const maxCount = Math.max(1, ...counts.map(c => c.count))
  const scores: Record<string, number> = {}
  for (const { dimKey, count } of counts) {
    scores[dimKey] = Math.min(100, Math.round((count / maxCount) * 100))
  }
  return scores
}

export interface ArchetypeRule {
  key: string
  match: (topDimensions: string[]) => boolean
  names: Record<string, string>
  tags: Record<string, string[]>
  summaries: Record<string, string>
}

function topN(scores: Record<string, number>, n: number): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key)
}

const ARCHETYPE_RULES: ArchetypeRule[] = [
  {
    key: 'pioneer',
    match: top => top.includes('selfIdentity') || top.includes('actionDrive'),
    names: {
      'zh-CN': '开拓者型',
      'zh-TW': '開拓者型',
      en: 'Pioneer',
    },
    tags: {
      'zh-CN': ['独立自主', '行动力强', '敢为人先'],
      'zh-TW': ['獨立自主', '行動力強', '敢為人先'],
      en: ['Independent', 'Action-oriented', 'Trailblazing'],
    },
    summaries: {
      'zh-CN': '你是典型的开拓者，内在驱动力强，习惯自己掌握方向，遇到新领域时愿意第一个迈步。',
      'zh-TW': '你是典型的開拓者，內在驅動力強，習慣自己掌握方向，遇到新領域時願意第一個邁步。',
      en: 'You are a natural pioneer: internally driven, self-directed, and willing to step first into new territory.',
    },
  },
  {
    key: 'creator',
    match: top => top.includes('expressiveCreativity') || top.includes('disruptiveInnovation'),
    names: {
      'zh-CN': '创造者型',
      'zh-TW': '創造者型',
      en: 'Creator',
    },
    tags: {
      'zh-CN': ['创意丰富', '表达独特', '不愿平庸'],
      'zh-TW': ['創意豐富', '表達獨特', '不願平庸'],
      en: ['Creative', 'Expressive', 'Original'],
    },
    summaries: {
      'zh-CN': '你是创造者型人格，思维活跃，擅长用独特方式表达想法，讨厌一成不变。',
      'zh-TW': '你是創造者型人格，思維活躍，擅長用獨特方式表達想法，討厭一成不變。',
      en: 'You are a Creator: mentally active, drawn to original expression, and allergic to stagnation.',
    },
  },
  {
    key: 'connector',
    match: top => top.includes('socialMagnetism') || top.includes('nurturingCare'),
    names: {
      'zh-CN': '联结者型',
      'zh-TW': '聯結者型',
      en: 'Connector',
    },
    tags: {
      'zh-CN': ['善于联结', '温暖包容', '人缘好'],
      'zh-TW': ['善於聯結', '溫暖包容', '人緣好'],
      en: ['Connecting', 'Warm', 'Inclusive'],
    },
    summaries: {
      'zh-CN': '你是联结者型人格，擅长在人与人之间搭桥，温暖而有感染力。',
      'zh-TW': '你是聯結者型人格，擅長在人與人之間搭橋，溫暖而有感染力。',
      en: 'You are a Connector: skilled at building bridges between people, warm and influential.',
    },
  },
  {
    key: 'executor',
    match: top => top.includes('responsibleOrder') || top.includes('disciplinedAchievement'),
    names: {
      'zh-CN': '执行者型',
      'zh-TW': '執行者型',
      en: 'Executor',
    },
    tags: {
      'zh-CN': ['务实可靠', '目标导向', '善于规划'],
      'zh-TW': ['務實可靠', '目標導向', '善於規劃'],
      en: ['Reliable', 'Goal-oriented', 'Structured'],
    },
    summaries: {
      'zh-CN': '你是执行者型人格，重视秩序与结果，能把想法一步步落为现实。',
      'zh-TW': '你是執行者型人格，重視秩序與結果，能把想法一步步落為現實。',
      en: 'You are an Executor: you value order and outcomes and turn ideas into steady progress.',
    },
  },
  {
    key: 'thinker',
    match: top => top.includes('insightfulAnalysis') || top.includes('nurturingCare'),
    names: {
      'zh-CN': '思辨者型',
      'zh-TW': '思辨者型',
      en: 'Thinker',
    },
    tags: {
      'zh-CN': ['洞察深刻', '喜欢反思', '内敛智慧'],
      'zh-TW': ['洞察深刻', '喜歡反思', '內斂智慧'],
      en: ['Insightful', 'Reflective', 'Quietly wise'],
    },
    summaries: {
      'zh-CN': '你是思辨者型人格，习惯向内求索，善于透过表象看到本质。',
      'zh-TW': '你是思辨者型人格，習慣向內求索，善於透過表象看到本質。',
      en: 'You are a Thinker: introspective, able to see beneath the surface, and quietly perceptive.',
    },
  },
  {
    key: 'challenger',
    match: top => top.includes('challengeSeeking') || top.includes('disruptiveInnovation'),
    names: {
      'zh-CN': '挑战者型',
      'zh-TW': '挑戰者型',
      en: 'Challenger',
    },
    tags: {
      'zh-CN': ['敢于质疑', '追求突破', '抗压坚韧'],
      'zh-TW': ['敢於質疑', '追求突破', '抗壓堅韌'],
      en: ['Questioning', 'Breakthrough-seeking', 'Resilient'],
    },
    summaries: {
      'zh-CN': '你是挑战者型人格，不甘于现状，喜欢在压力下寻找突破口。',
      'zh-TW': '你是挑戰者型人格，不甘於現狀，喜歡在壓力下尋找突破口。',
      en: 'You are a Challenger: restless with the status quo and energized by pressure and breakthroughs.',
    },
  },
]

const BALANCED_ARCHETYPE: ArchetypeRule = {
  key: 'balanced',
  match: () => true,
  names: {
    'zh-CN': '平衡型',
    'zh-TW': '平衡型',
    en: 'Balanced',
  },
  tags: {
    'zh-CN': ['多面均衡', '适应力强', '灵活取舍'],
    'zh-TW': ['多面均衡', '適應力強', '靈活取捨'],
    en: ['Balanced', 'Adaptable', 'Flexible'],
  },
  summaries: {
    'zh-CN': '你是平衡型人格，能量分布较为平均，能根据情境灵活调用不同面向。',
    'zh-TW': '你是平衡型人格，能量分布較為平均，能根據情境靈活調用不同面向。',
    en: 'You are a Balanced type: your energy is spread evenly, letting you adapt flexibly to different contexts.',
  },
}

export function determineArchetype(
  scores: Record<string, number>,
  locale: string,
): { key: string; name: string; tags: string[]; summary: string } {
  const top = topN(scores, 3)
  const effectiveLocale = locale === 'zh-TW' ? 'zh-TW' : locale === 'en' ? 'en' : 'zh-CN'
  for (const rule of ARCHETYPE_RULES) {
    if (rule.match(top)) {
      return {
        key: rule.key,
        name: rule.names[effectiveLocale] || rule.names['zh-CN'] || rule.key,
        tags: rule.tags[effectiveLocale] || rule.tags['zh-CN'] || [],
        summary: rule.summaries[effectiveLocale] || rule.summaries['zh-CN'] || '',
      }
    }
  }
  return {
    key: BALANCED_ARCHETYPE.key,
    name: BALANCED_ARCHETYPE.names[effectiveLocale] || BALANCED_ARCHETYPE.names['zh-CN'] || BALANCED_ARCHETYPE.key,
    tags: BALANCED_ARCHETYPE.tags[effectiveLocale] || BALANCED_ARCHETYPE.tags['zh-CN'] || [],
    summary: BALANCED_ARCHETYPE.summaries[effectiveLocale] || BALANCED_ARCHETYPE.summaries['zh-CN'] || '',
  }
}

export function getLevel(score: number): 'high' | 'mid' | 'low' {
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}
