export type LifePathLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja'

export interface LifePathInput {
  name?: string
  birthDate: string
}

export interface LifePathDimension {
  relationshipNeed: string
  communication: string
  emotion: string
  lifestyle: string
  growth: string
}

export interface LifePathProfile {
  number: number
  symbol: string
  tags: string[]
  dimension: LifePathDimension
}

export interface LifePathCalcResult {
  personA: LifePathPersonResult
  personB: LifePathPersonResult
  matrix: LifePathMatrix
  sharedFocus: string[]
  contrast: string[]
  dimensions: Array<{ key: string; label: string; reading: string }>
  highlights: string[]
  advice: string
  locale: LifePathLocale
}

export interface LifePathPersonResult {
  name: string
  birthDate: string
  digits: string
  calculation: string
  lifePathNumber: number
  isMaster: boolean
  pairRoot: number
  masterNote: string
  profile: LifePathProfile
  bestMatches: number[]
  cautionMatches: number[]
}

export interface LifePathMatrix {
  pairKey: string
  tierKey: 'strong' | 'supportive' | 'balanced' | 'growth'
  tierLabel: string
  summary: string
}

type Tier = LifePathMatrix['tierKey']

const MASTER_NUMBERS = new Set([11, 22, 33])
const MASTER_ROOT: Record<number, number> = { 11: 2, 22: 4, 33: 6 }

const PAIR_TIERS: Record<string, Tier> = {
  '1-3': 'strong', '1-5': 'strong', '1-6': 'strong',
  '2-4': 'strong', '2-6': 'strong', '2-8': 'strong',
  '3-5': 'strong', '3-9': 'strong',
  '4-7': 'strong', '4-8': 'strong',
  '5-7': 'strong', '6-9': 'strong', '7-7': 'strong', '9-9': 'strong',
  '1-2': 'supportive', '1-4': 'supportive', '1-7': 'supportive',
  '2-7': 'supportive', '2-9': 'supportive', '3-4': 'supportive',
  '3-7': 'supportive', '4-4': 'supportive', '4-6': 'supportive',
  '5-6': 'supportive', '6-6': 'supportive', '8-8': 'supportive',
  '1-1': 'growth', '1-8': 'growth', '1-9': 'growth',
  '2-3': 'growth', '2-5': 'growth', '3-3': 'growth',
  '3-6': 'growth', '3-8': 'growth', '4-5': 'growth',
  '4-9': 'growth', '5-9': 'growth', '6-7': 'growth',
  '7-8': 'growth', '7-9': 'growth', '8-9': 'growth',
  '2-2': 'balanced', '5-5': 'balanced', '5-8': 'balanced',
}

const TIER_TEXT: Record<LifePathLocale, Record<Tier, { label: string; summary: string; advice: string }>> = {
  'zh-CN': {
    strong: { label: '天然共振', summary: '核心节奏容易对上，关系里自带推进力和默契。', advice: '保留共同节奏，也别把默契当成不需要沟通。每周留一段只谈感受的时间。' },
    supportive: { label: '互补支撑', summary: '两人不是同一种人，但差异能补上彼此的空位。', advice: '把差异写成分工，而不是要求对方变成自己。先说需要，再评价方法。' },
    balanced: { label: '稳定磨合', summary: '没有强磁场，却有慢慢长出来的稳定感。', advice: '降低对 instant chemistry 的期待，用固定的小仪式累积信任。' },
    growth: { label: '课题型配对', summary: '吸引和张力都明显，关键在于能否处理差异。', advice: '为冲突设边界：不翻旧账、不说绝对化结论，每次只处理一个具体议题。' },
  },
  'zh-TW': {
    strong: { label: '天然共振', summary: '核心節奏容易對上，關係裡自帶推進力和默契。', advice: '保留共同節奏，也別把默契當成不需要溝通。每週留一段只談感受的時間。' },
    supportive: { label: '互補支撐', summary: '兩人不是同一種人，但差異能補上彼此的空位。', advice: '把差異寫成分工，而不是要求對方變成自己。先說需要，再評論方法。' },
    balanced: { label: '穩定磨合', summary: '沒有強磁場，卻有慢慢長出來的穩定感。', advice: '降低對 instant chemistry 的期待，用固定的小儀式累積信任。' },
    growth: { label: '課題型配對', summary: '吸引和張力都明顯，關鍵在於能否處理差異。', advice: '為衝突設邊界：不翻舊帳、不說絕對化結論，每次只處理一個具體議題。' },
  },
  en: {
    strong: { label: 'Natural resonance', summary: 'Core rhythms align easily, creating momentum and intuitive rapport.', advice: 'Keep the shared rhythm, but do not treat rapport as a substitute for talking. Set aside weekly time for feelings.' },
    supportive: { label: 'Complementary support', summary: 'You are different, yet the difference can fill practical and emotional gaps.', advice: 'Turn difference into roles instead of asking either person to change type. State needs before judging methods.' },
    balanced: { label: 'Steady adjustment', summary: 'This is less about instant chemistry and more about gradually built stability.', advice: 'Use small repeated rituals to build trust rather than expecting immediate intensity.' },
    growth: { label: 'Growth pairing', summary: 'Attraction and tension are both visible; the work is handling difference well.', advice: 'Set conflict boundaries: no old files, no absolute verdicts, and one concrete issue at a time.' },
  },
  ja: {
    strong: { label: '自然な共鳴', summary: '中心のリズムが合いやすく、推進力と通じ合う感覚があります。', advice: '共通のリズムを保ちつつ、感情を話す時間も定期的に確保してください。' },
    supportive: { label: '互補サポート', summary: 'タイプは違いますが、違いが互いの空白を補います。', advice: '違いを役割に変え、相手を自分と同じにしようとしないことが大切です。' },
    balanced: { label: '安定した調整', summary: '劇的な chemistry より、少しずつ育つ安定感が特徴です。', advice: '小さな習慣を繰り返して信頼を作ると関係が整いやすくなります。' },
    growth: { label: '成長型の相性', summary: '魅力と摩擦の両方がはっきり出る組み合わせです。', advice: '過去を持ち出さず、絶対的な判断を避け、一度に一つの課題だけ扱ってください。' },
  },
}

const PROFILES: Record<LifePathLocale, Record<number, Omit<LifePathProfile, 'dimension'>>> = {
  'zh-CN': {
    1: { number: 1, symbol: '起点型', tags: ['独立', '主动', '开创'] },
    2: { number: 2, symbol: '联结型', tags: ['协调', '敏感', '合作'] },
    3: { number: 3, symbol: '表达型', tags: ['表达', '创意', '社交'] },
    4: { number: 4, symbol: '结构型', tags: ['稳定', '秩序', '执行'] },
    5: { number: 5, symbol: '变化型', tags: ['自由', '好奇', '适应'] },
    6: { number: 6, symbol: '照护型', tags: ['责任', '关怀', '和谐'] },
    7: { number: 7, symbol: '思辨型', tags: ['内省', '分析', '洞察'] },
    8: { number: 8, symbol: '成就型', tags: ['目标', '掌控', '成就'] },
    9: { number: 9, symbol: '完成型', tags: ['理想', '包容', '意义'] },
    11: { number: 11, symbol: '启发型', tags: ['直觉', '启发', '感召'] },
    22: { number: 22, symbol: '建构型', tags: ['建构', '整合', '落地'] },
    33: { number: 33, symbol: '滋养型', tags: ['奉献', '滋养', '引导'] },
  },
  'zh-TW': {
    1: { number: 1, symbol: '起點型', tags: ['獨立', '主動', '開創'] },
    2: { number: 2, symbol: '聯結型', tags: ['協調', '敏感', '合作'] },
    3: { number: 3, symbol: '表達型', tags: ['表達', '創意', '社交'] },
    4: { number: 4, symbol: '結構型', tags: ['穩定', '秩序', '執行'] },
    5: { number: 5, symbol: '變化型', tags: ['自由', '好奇', '適應'] },
    6: { number: 6, symbol: '照護型', tags: ['責任', '關懷', '和諧'] },
    7: { number: 7, symbol: '思辨型', tags: ['內省', '分析', '洞察'] },
    8: { number: 8, symbol: '成就型', tags: ['目標', '掌控', '成就'] },
    9: { number: 9, symbol: '完成型', tags: ['理想', '包容', '意義'] },
    11: { number: 11, symbol: '啟發型', tags: ['直覺', '啟發', '感召'] },
    22: { number: 22, symbol: '建構型', tags: ['建構', '整合', '落地'] },
    33: { number: 33, symbol: '滋養型', tags: ['奉獻', '滋養', '引導'] },
  },
  en: {
    1: { number: 1, symbol: 'Initiator', tags: ['independence', 'initiative', 'pioneering'] },
    2: { number: 2, symbol: 'Connector', tags: ['coordination', 'sensitivity', 'cooperation'] },
    3: { number: 3, symbol: 'Expressor', tags: ['expression', 'creativity', 'social energy'] },
    4: { number: 4, symbol: 'Builder', tags: ['stability', 'order', 'execution'] },
    5: { number: 5, symbol: 'Explorer', tags: ['freedom', 'curiosity', 'adaptability'] },
    6: { number: 6, symbol: 'Nurturer', tags: ['responsibility', 'care', 'harmony'] },
    7: { number: 7, symbol: 'Thinker', tags: ['reflection', 'analysis', 'insight'] },
    8: { number: 8, symbol: 'Achiever', tags: ['goals', 'mastery', 'achievement'] },
    9: { number: 9, symbol: 'Humanitarian', tags: ['ideals', 'inclusion', 'meaning'] },
    11: { number: 11, symbol: 'Illuminator', tags: ['intuition', 'inspiration', 'presence'] },
    22: { number: 22, symbol: 'Master Builder', tags: ['building', 'integration', 'grounding'] },
    33: { number: 33, symbol: 'Master Teacher', tags: ['devotion', 'nurture', 'guidance'] },
  },
  ja: {
    1: { number: 1, symbol: '起点型', tags: ['自立', '主体性', '開拓'] },
    2: { number: 2, symbol: '調和型', tags: ['協調', '感受性', '支える力'] },
    3: { number: 3, symbol: '表現型', tags: ['表現', '創造', '社交性'] },
    4: { number: 4, symbol: '構築型', tags: ['安定', '秩序', '実行'] },
    5: { number: 5, symbol: '変化型', tags: ['自由', '好奇心', '適応'] },
    6: { number: 6, symbol: 'ケア型', tags: ['責任', '思いやり', '調和'] },
    7: { number: 7, symbol: '内省型', tags: ['分析', '洞察', '静けさ'] },
    8: { number: 8, symbol: '成就型', tags: ['目標', '統率', '達成'] },
    9: { number: 9, symbol: '完成型', tags: ['理想', '包容', '意味'] },
    11: { number: 11, symbol: '直感型', tags: ['直感', '着想', '存在感'] },
    22: { number: 22, symbol: '大構築型', tags: ['構築', '統合', '現実化'] },
    33: { number: 33, symbol: '奉仕型', tags: ['献身', '育成', '導き'] },
  },
}

const ROOT_DIMENSIONS: Record<LifePathLocale, Record<number, LifePathDimension>> = {
  'zh-CN': {
    1: { relationshipNeed: '需要独立空间，也希望决定被尊重', communication: '直说重点，讨厌被绕圈或反复拖延', emotion: '倾向用行动、承担和解决问题来表达在乎', lifestyle: '喜欢推进目标、开新局、掌握方向', growth: '练习停下来问对方：你现在真正需要什么？' },
    2: { relationshipNeed: '需要被回应，也需要稳定而温柔的关系', communication: '先感受气氛，再说出口，容易被粗话伤到', emotion: '通过细节照顾、陪伴和敏感回应表达爱', lifestyle: '偏好两人节奏、亲密协作和可预期安排', growth: '练习把不满尽早讲清，不靠退让维持和平。' },
    3: { relationshipNeed: '需要轻松感、表达空间和精神共鸣', communication: '语速快、联想多，擅长把话题变有趣', emotion: '用玩笑、分享和浪漫创意传递情绪', lifestyle: '喜欢新鲜体验、朋友聚会和创作性活动', growth: '练习在关系沉重时留在现场，不用幽默跳走。' },
    4: { relationshipNeed: '需要可靠承诺和清楚边界', communication: '讲究事实、步骤和可行性，不擅长空泛抒情', emotion: '用责任、规律和长期投入表达稳定', lifestyle: '重视计划、储蓄、健康作息和可执行目标', growth: '练习允许关系里出现无目的的快乐。' },
    5: { relationshipNeed: '需要自由、变化和不被控制的信任', communication: '直接灵活，喜欢新观点和即时反馈', emotion: '用共同冒险、身体感和新鲜话题拉近距离', lifestyle: '偏好旅行、尝试、多元社交和非固定日程', growth: '练习在关系里建立稳定的承诺，而非只靠热度。' },
    6: { relationshipNeed: '需要归属感，也习惯主动照顾对方', communication: '关心生活细节，容易把提醒变成担忧', emotion: '用照顾、家庭感和长期守护表达爱', lifestyle: '重视家人、居所、共同餐桌和情感仪式', growth: '练习照顾自己，减少替对方安排的倾向。' },
    7: { relationshipNeed: '需要深度、独处和精神上的诚实', communication: '观察多、表达少，喜欢有质量的长谈', emotion: '倾向先内部消化，再选择性敞开', lifestyle: '重视阅读、研究、安静空间和思想交流', growth: '练习把正在想的事情说出口，不让对方猜测。' },
    8: { relationshipNeed: '需要平等尊重、掌控感和实际成果', communication: '目标导向，容易直接进入方案和资源分配', emotion: '用保护、供给和解决现实问题表达爱', lifestyle: '在意事业、财务、权力边界和长期成就', growth: '练习把脆弱和柔软当成力量，不只用效率衡量关系。' },
    9: { relationshipNeed: '需要意义、包容和更大的共同愿景', communication: '视野宽、共情强，有时显得疏离或说教', emotion: '用理解、宽恕和对世界的善意表达爱', lifestyle: '关注社会议题、艺术、精神成长和长期价值', growth: '练习回到具体的人和眼前的小事，不只守在理想里。' },
  },
  'zh-TW': {
    1: { relationshipNeed: '需要獨立空間，也希望決定被尊重', communication: '直說重點，討厭被繞圈或反覆拖延', emotion: '傾向用行動、承擔和解決問題來表達在乎', lifestyle: '喜歡推進目標、開新局、掌握方向', growth: '練習停下來問對方：你現在真正需要什麼？' },
    2: { relationshipNeed: '需要被回應，也需要穩定而溫柔的關係', communication: '先感受氣氛，再說出口，容易被粗話傷到', emotion: '透過細節照顧、陪伴和敏感回應表達愛', lifestyle: '偏好兩人節奏、親密協作和可預期安排', growth: '練習把不滿及早講清，不靠退讓維持和平。' },
    3: { relationshipNeed: '需要輕鬆感、表達空間和精神共鳴', communication: '語速快、聯想多，擅長把話題變有趣', emotion: '用玩笑、分享和浪漫創意傳遞情緒', lifestyle: '喜歡新鮮體驗、朋友聚會和創作性活動', growth: '練習在關係沉重時留在現場，不用幽默跳走。' },
    4: { relationshipNeed: '需要可靠承諾和清楚邊界', communication: '講究事實、步驟和可行性，不擅長空泛抒情', emotion: '用責任、規律和長期投入表達穩定', lifestyle: '重視計畫、儲蓄、健康作息和可執行目標', growth: '練習允許關係裡出現無目的的快樂。' },
    5: { relationshipNeed: '需要自由、變化和不被控制的信任', communication: '直接靈活，喜歡新觀點和即時回饋', emotion: '用共同冒險、身體感和新鮮話題拉近距离', lifestyle: '偏好旅行、嘗試、多元社交和非固定日程', growth: '練習在關係裡建立穩定的承諾，而非只靠熱度。' },
    6: { relationshipNeed: '需要歸屬感，也習慣主動照顧對方', communication: '關心生活細節，容易把提醒變成擔憂', emotion: '用照顧、家庭感和長期守護表達愛', lifestyle: '重視家人、居所、共同餐桌和情感儀式', growth: '練習照顧自己，減少替對方安排的傾向。' },
    7: { relationshipNeed: '需要深度、獨處和精神上的誠實', communication: '觀察多、表達少，喜歡有品質的長談', emotion: '傾向先內部消化，再選擇性敞開', lifestyle: '重視閱讀、研究、安靜空間和思想交流', growth: '練習把正在想的事情說出口，不讓對方猜測。' },
    8: { relationshipNeed: '需要平等尊重、掌控感和實際成果', communication: '目標導向，容易直接進入方案和資源分配', emotion: '用保護、供給和解決現實問題表達愛', lifestyle: '在意事業、財務、權力邊界和長期成就', growth: '練習把脆弱和柔軟當成力量，不只用效率衡量關係。' },
    9: { relationshipNeed: '需要意義、包容和更大的共同願景', communication: '視野寬、共情強，有時顯得疏離或說教', emotion: '用理解、寬恕和對世界的善意表達愛', lifestyle: '關注社會議題、藝術、精神成長和長期價值', growth: '練習回到具體的人和眼前的小事，不只守在理想裡。' },
  },
  en: {
    1: { relationshipNeed: 'Needs autonomy and respect for independent decisions', communication: 'Goes straight to the point and dislikes circular delay', emotion: 'Shows care through action, responsibility, and problem-solving', lifestyle: 'Moves toward goals, fresh starts, and clear direction', growth: 'Practice asking what the other person truly needs now.' },
    2: { relationshipNeed: 'Needs response, warmth, and emotional steadiness', communication: 'Reads atmosphere first and can be hurt by bluntness', emotion: 'Loves through details, presence, and sensitive attunement', lifestyle: 'Prefers close collaboration and predictable rhythms', growth: 'Name dissatisfaction early instead of keeping peace through self-erasure.' },
    3: { relationshipNeed: 'Needs lightness, expression, and mental resonance', communication: 'Quick, associative, and skilled at making topics engaging', emotion: 'Shares humor, stories, and romantic imagination', lifestyle: 'Seeks novelty, friends, play, and creative work', growth: 'Stay present in heavy moments instead of joking past them.' },
    4: { relationshipNeed: 'Needs reliable commitment and clear boundaries', communication: 'Focuses on facts, steps, and feasibility', emotion: 'Builds love through consistency and long-term investment', lifestyle: 'Values planning, health, savings, and workable systems', growth: 'Allow purposeless pleasure inside the relationship.' },
    5: { relationshipNeed: 'Needs freedom, variety, and trust without control', communication: 'Flexible and direct, with fast feedback and new ideas', emotion: 'Bonds through adventure, vitality, and shared discovery', lifestyle: 'Enjoys travel, experimentation, and unscripted time', growth: 'Build stable commitment rather than relying only on intensity.' },
    6: { relationshipNeed: 'Needs belonging and naturally tends to care for the partner', communication: 'Attends to daily details, sometimes turning care into worry', emotion: 'Loves through protection, home, and long-term devotion', lifestyle: 'Prioritizes family, home, shared meals, and rituals', growth: 'Care for yourself too; avoid over-managing the other person.' },
    7: { relationshipNeed: 'Needs depth, solitude, and inner honesty', communication: 'Observes quietly and prefers meaningful long conversations', emotion: 'Processes privately before choosing to open up', lifestyle: 'Values study, quiet, research, and idea exchange', growth: 'Speak the inner process aloud instead of leaving the partner to guess.' },
    8: { relationshipNeed: 'Needs equality, respect, agency, and tangible results', communication: 'Moves quickly to solutions, resources, and structure', emotion: 'Protects and provides by solving real-world problems', lifestyle: 'Focuses on career, finances, boundaries, and achievement', growth: 'Treat vulnerability as strength, not inefficiency.' },
    9: { relationshipNeed: 'Needs meaning, inclusion, and a larger shared vision', communication: 'Broad and empathic, sometimes distant or instructive', emotion: 'Loves through understanding, forgiveness, and goodwill', lifestyle: 'Draws toward art, ideals, service, and long-term values', growth: 'Return from the ideal to the concrete person in front of you.' },
  },
  ja: {
    1: { relationshipNeed: '自立と決定への尊重が必要', communication: '要点を先に話し、回り道を嫌う', emotion: '行動と解決で愛情を示す', lifestyle: '目標や新しい始まりを大切にする', growth: '相手が今何を必要としているか尋ねる。' },
    2: { relationshipNeed: '応答と穏やかな安心感が必要', communication: '空気を読み、直接すぎる言葉に傷つく', emotion: '細やかな気遣いと伴走で示す', lifestyle: '二人のペースと予測できる予定を好む', growth: '不満を早めに言葉にする。' },
    3: { relationshipNeed: '軽さ、表現、知的共鳴が必要', communication: '連想が速く、話を面白くできる', emotion: '冗談や創造的な共有で近づく', lifestyle: '新しい体験や創作を好む', growth: '重い場面でも冗談で逃げない。' },
    4: { relationshipNeed: '信頼できる約束と明確な境界が必要', communication: '事実、手順、実行可能性を重視する', emotion: '継続と責任で安心を作る', lifestyle: '計画、健康、貯蓄、仕組みを重視する', growth: '目的のない楽しみも許す。' },
    5: { relationshipNeed: '自由、変化、信頼が必要', communication: '柔軟で率直に新しい意見を出す', emotion: '冒険と発見を通して結ばれる', lifestyle: '旅行や試行、多様な交流を好む', growth: '熱量だけでなく約束を作る。' },
    6: { relationshipNeed: '帰属感があり、相手を世話しやすい', communication: '日常の細部に関心が向く', emotion: '保護、家庭、長期的な支えで示す', lifestyle: '家族、住まい、食卓の時間を重視する', growth: '自分も大切にし、管理しすぎない。' },
    7: { relationshipNeed: '深さ、ひとりの時間、誠実さが必要', communication: '静かに観察し、意味のある対話を好む', emotion: '内で消化してから開く', lifestyle: '学び、静けさ、研究を重視する', growth: '考えている過程を言葉にする。' },
    8: { relationshipNeed: '対等さ、主導権、現実の成果が必要', communication: 'すぐ方針と資源に話を進める', emotion: '現実の問題を守って解決する', lifestyle: '仕事、財務、境界、成果を重視する', growth: '脆弱さも力として認める。' },
    9: { relationshipNeed: '意味、包摂、大きなビジョンが必要', communication: '視野が広く、共感や説教になりやすい', emotion: '理解と赦し、善意で示す', lifestyle: '芸術、社会、精神性を重視する', growth: '理想より目の前の人に戻る。' },
  },
}

const MASTER_NOTE: Record<LifePathLocale, Record<number, string>> = {
  'zh-CN': {
    11: '配对中按灵数惯例取根数 2 参与矩阵；11 保留更高的直觉与敏感度。',
    22: '配对中按灵数惯例取根数 4 参与矩阵；22 保留更大的建构与整合野心。',
    33: '配对中按灵数惯例取根数 6 参与矩阵；33 保留更强的照护与引导主题。',
  },
  'zh-TW': {
    11: '配對中按靈數慣例取根數 2 參與矩陣；11 保留更高的直覺與敏感度。',
    22: '配對中按靈數慣例取根數 4 參與矩陣；22 保留更大的建構與整合野心。',
    33: '配對中按靈數慣例取根數 6 參與矩陣；33 保留更強的照護與引導主題。',
  },
  en: {
    11: 'Compatibility follows the common convention of using root 2; 11 keeps heightened intuition and sensitivity.',
    22: 'Compatibility follows the common convention of using root 4; 22 keeps a larger building and integrating ambition.',
    33: 'Compatibility follows the common convention of using root 6; 33 keeps a stronger caring and guiding theme.',
  },
  ja: {
    11: '相性では慣例に従いルート2を使い、11の直感と感受性も併記します。',
    22: '相性では慣例に従いルート4を使い、22の構築力も併記します。',
    33: '相性では慣例に従いルート6を使い、33のケアと導きも併記します。',
  },
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function digitSum(value: number): number {
  let total = 0
  let current = value
  while (current > 0) {
    total += current % 10
    current = Math.floor(current / 10)
  }
  return total
}

function reduceNumber(value: number): number {
  let current = value
  while (!MASTER_NUMBERS.has(current) && current > 9) {
    current = digitSum(current)
  }
  return current
}

function parseBirthDate(value: string): { year: number; month: number; day: number } {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: 'Birth date must use YYYY-MM-DD' })
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid calendar date' })
  }
  return { year, month, day }
}

function calculationText(year: number, month: number, day: number): string {
  const monthRoot = reduceNumber(month)
  const dayRoot = reduceNumber(day)
  const yearRoot = reduceNumber(year)
  const combined = reduceNumber(monthRoot + dayRoot + yearRoot)
  return `${year}-${month}-${day} → ${monthRoot} + ${dayRoot} + ${yearRoot} = ${monthRoot + dayRoot + yearRoot} → ${combined}`
}

export function lifePathPairKey(a: number, b: number): string {
  return a <= b ? `${a}-${b}` : `${b}-${a}`
}

export function lifePathPairTier(a: number, b: number): Tier {
  return PAIR_TIERS[lifePathPairKey(a, b)] ?? 'balanced'
}

function profile(locale: LifePathLocale, number: number): LifePathProfile {
  const root = MASTER_ROOT[number] ?? number
  const base = PROFILES[locale][number] ?? PROFILES[locale][root]!
  return {
    ...base,
    dimension: ROOT_DIMENSIONS[locale][root]!,
  }
}

function bestMatches(locale: LifePathLocale, number: number): number[] {
  const root = MASTER_ROOT[number] ?? number
  return [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter(item => lifePathPairTier(root, item) === 'strong')
}

function cautionMatches(locale: LifePathLocale, number: number): number[] {
  const root = MASTER_ROOT[number] ?? number
  return [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter(item => lifePathPairTier(root, item) === 'growth')
}

function person(locale: LifePathLocale, input: LifePathInput): LifePathPersonResult {
  if (!input?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birth date' })
  }

  const { year, month, day } = parseBirthDate(input.birthDate)
  const number = reduceNumber(reduceNumber(month) + reduceNumber(day) + reduceNumber(year))
  const isMaster = MASTER_NUMBERS.has(number)
  const pairRoot = MASTER_ROOT[number] ?? number

  return {
    name: input.name?.trim() || '',
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    digits: digitsOnly(input.birthDate),
    calculation: calculationText(year, month, day),
    lifePathNumber: number,
    isMaster,
    pairRoot,
    masterNote: isMaster ? MASTER_NOTE[locale][number] ?? '' : '',
    profile: profile(locale, number),
    bestMatches: bestMatches(locale, number),
    cautionMatches: cautionMatches(locale, number),
  }
}

function matrixFor(locale: LifePathLocale, personA: LifePathPersonResult, personB: LifePathPersonResult): LifePathMatrix {
  const key = lifePathPairKey(personA.pairRoot, personB.pairRoot)
  const tierKey = lifePathPairTier(personA.pairRoot, personB.pairRoot)
  const text = TIER_TEXT[locale][tierKey]!
  return {
    pairKey: key,
    tierKey,
    tierLabel: text.label,
    summary: text.summary,
  }
}

export function createLifePathPeiduiResult(input: {
  personA: LifePathInput
  personB: LifePathInput
  locale?: string
}): LifePathCalcResult {
  const locale: LifePathLocale = input.locale === 'zh-TW' || input.locale === 'en' || input.locale === 'ja'
    ? input.locale
    : 'zh-CN'
  const personA = person(locale, input.personA)
  const personB = person(locale, input.personB)
  const matrix = matrixFor(locale, personA, personB)
  const tier = TIER_TEXT[locale][matrix.tierKey]!
  const shared = personA.profile.tags.filter(tag => personB.profile.tags.includes(tag))
  const contrastA = personA.profile.tags.filter(tag => !personB.profile.tags.includes(tag))
  const contrastB = personB.profile.tags.filter(tag => !personA.profile.tags.includes(tag))
  const rootDimensionA = personA.profile.dimension
  const rootDimensionB = personB.profile.dimension
  const labels = {
    'zh-CN': { communication: '沟通节奏', emotion: '情感表达', lifestyle: '生活方式', growth: '成长课题' },
    'zh-TW': { communication: '溝通節奏', emotion: '情感表達', lifestyle: '生活方式', growth: '成長課題' },
    en: { communication: 'Communication', emotion: 'Emotional style', lifestyle: 'Lifestyle', growth: 'Growth work' },
    ja: { communication: 'コミュニケーション', emotion: '感情表現', lifestyle: '生活スタイル', growth: '成長課題' },
  }[locale]

  return {
    personA,
    personB,
    matrix,
    sharedFocus: shared,
    contrast: [...contrastA, ...contrastB],
    dimensions: [
      { key: 'communication', label: labels.communication, reading: `${rootDimensionA.communication}；${rootDimensionB.communication}` },
      { key: 'emotion', label: labels.emotion, reading: `${rootDimensionA.emotion}；${rootDimensionB.emotion}` },
      { key: 'lifestyle', label: labels.lifestyle, reading: `${rootDimensionA.lifestyle}；${rootDimensionB.lifestyle}` },
      { key: 'growth', label: labels.growth, reading: tier.advice },
    ],
    highlights: [
      `${personA.profile.symbol}: ${rootDimensionA.relationshipNeed}`,
      `${personB.profile.symbol}: ${rootDimensionB.relationshipNeed}`,
    ],
    advice: tier.advice,
    locale,
  }
}
