import type { Dimension, Question, Personality } from '~/types/fbti'

export const dimensions: Dimension[] = [
  {
    id: 'A',
    left: '死忠',
    right: '墙头草',
    leftColor: '#B06B5A',
    rightColor: '#8A9CAE',
  },
  {
    id: 'B',
    left: '数据',
    right: '玄学',
    leftColor: '#8B8290',
    rightColor: '#8A9A7A',
  },
  {
    id: 'C',
    left: '热情外放',
    right: '佛系陪看',
    leftColor: '#C8A27A',
    rightColor: '#9A8B9A',
  },
  {
    id: 'D',
    left: '真懂球',
    right: '看热闹',
    leftColor: '#7A8B8A',
    rightColor: '#A69B7A',
  },
]

function opt(id: string, text: string, dim: 'A' | 'B' | 'C' | 'D', side: 1 | -1, weight = 1, triggerHidden = false) {
  return { id, text, effects: [{ dimension: dim, side, weight }], triggerHidden }
}

interface ScoreTotals {
  pos: number
  neg: number
}

function aggregateTotals(answers: { questionId: string; optionId: string }[]): Record<'A' | 'B' | 'C' | 'D', ScoreTotals> {
  const totals: Record<'A' | 'B' | 'C' | 'D', ScoreTotals> = {
    A: { pos: 0, neg: 0 },
    B: { pos: 0, neg: 0 },
    C: { pos: 0, neg: 0 },
    D: { pos: 0, neg: 0 },
  }
  const allQuestions = [...getMainQuestions(), getHiddenQuestion()]
  for (const ans of answers) {
    const q = allQuestions.find(x => x.id === ans.questionId)
    if (!q) continue
    const opt = q.options.find(o => o.id === ans.optionId)
    if (!opt) continue
    for (const e of opt.effects) {
      const t = totals[e.dimension]
      if (e.side === 1) t.pos += e.weight
      else t.neg += e.weight
    }
  }
  return totals
}

export function getMainQuestions(): Question[] {
  return [
    {
      id: 'A1',
      text: '你最初喜欢上一支球队，最可能是因为什么？',
      options: [
        opt('A1a', '家乡、父辈或成长记忆，早就刻在 DNA 里', 'A', 1, 2),
        opt('A1b', '某届大赛被他们踢出的名场面圈粉', 'A', -1, 1),
      ],
    },
    {
      id: 'A2',
      text: '主队连续输球，你的第一反应是？',
      options: [
        opt('A2a', '继续追每场，相信总会触底反弹', 'A', 1, 2),
        opt('A2b', '先放一放，等状态回暖再回来看', 'A', -1, 1),
      ],
    },
    {
      id: 'A3',
      text: '朋友问你世界杯支持哪队，你会？',
      options: [
        opt('A3a', '毫不犹豫报出那支队的名字', 'A', 1, 1),
        opt('A3b', '看对阵和精彩程度，临时决定', 'A', -1, 2),
      ],
    },
    {
      id: 'A4',
      text: '如果主队不幸降级，你会？',
      options: [
        opt('A4a', '继续追随，不离不弃', 'A', 1, 2),
        opt('A4b', '顺便关注一些更高水平的联赛', 'A', -1, 1),
      ],
    },
    {
      id: 'A5',
      text: '世界杯期间，你支持的队伍比赛踢得很难看，你会？',
      options: [
        opt('A5a', '皱着眉也要看完，毕竟是自己人', 'A', 1, 2),
        opt('A5b', '切去看另一场更精彩的', 'A', -1, 1),
      ],
    },
    {
      id: 'A6',
      text: '主队核心转会死敌，你的反应是？',
      options: [
        opt('A6a', '祝福但心很痛，像是被背叛', 'A', 1, 2),
        opt('A6b', '职业足球嘛，理解球员选择', 'A', -1, 1),
      ],
    },
    {
      id: 'B1',
      text: '赛前你更习惯做哪项准备？',
      options: [
        opt('B1a', '查伤病、xG、近期战绩和交锋记录', 'B', 1, 2),
        opt('B1b', '看看黄历、运势、幸运色和星座', 'B', -1, 1),
      ],
    },
    {
      id: 'B2',
      text: '预测一场比赛胜负时，你更相信？',
      options: [
        opt('B2a', '数据统计和战术对比', 'B', 1, 2),
        opt('B2b', '第六感、玄学规律和神秘力量', 'B', -1, 2),
      ],
    },
    {
      id: 'B3',
      text: '点球大战前你会？',
      options: [
        opt('B3a', '回忆门将扑救方向统计', 'B', 1, 2),
        opt('B3b', '闭眼许愿并调整坐姿到幸运位', 'B', -1, 2),
      ],
    },
    {
      id: 'B4',
      text: '支持的球队爆冷输球，你更可能？',
      options: [
        opt('B4a', '复盘控球率、射门数和预期进球', 'B', 1, 2),
        opt('B4b', '觉得今天风水不对，改天再看', 'B', -1, 1),
      ],
    },
    {
      id: 'B5',
      text: '选一件看球幸运物，你会？',
      options: [
        opt('B5a', '不需要，球队实力才是硬道理', 'B', 1, 1),
        opt('B5b', '固定座位、球衣、小吃，缺一样都不踏实', 'B', -1, 2, true),
      ],
    },
    {
      id: 'B6',
      text: '你如何看待足球冷门？',
      options: [
        opt('B6a', '小样本事件，长期会回归均值', 'B', 1, 2),
        opt('B6b', '玄学力量，该冷就得冷', 'B', -1, 1),
      ],
    },
    {
      id: 'C1',
      text: '主队进球瞬间，你的第一反应？',
      options: [
        opt('C1a', '跳起来大喊，恨不得整栋楼都听见', 'C', 1, 2),
        opt('C1b', '嘴角上扬，在心里默默鼓掌', 'C', -1, 1),
      ],
    },
    {
      id: 'C2',
      text: '凌晨三点的关键比赛，你通常？',
      options: [
        opt('C2a', '提前定闹钟，再困也要看直播', 'C', 1, 2),
        opt('C2b', '随缘醒来，没赶上就看集锦', 'C', -1, 1),
      ],
    },
    {
      id: 'C3',
      text: '你更喜欢哪种看球氛围？',
      options: [
        opt('C3a', '热闹的聚会、酒吧或球迷广场', 'C', 1, 2),
        opt('C3b', '安静的沙发或睡前独自看', 'C', -1, 1),
      ],
    },
    {
      id: 'C4',
      text: '输了关键比赛后，你的状态是？',
      options: [
        opt('C4a', '难受一整天，反复复盘那几脚', 'C', 1, 2),
        opt('C4b', '接受结果，该干嘛干嘛', 'C', -1, 2),
      ],
    },
    {
      id: 'C5',
      text: '比赛日的仪式感对你来说？',
      options: [
        opt('C5a', '必须穿球衣、备零食、约朋友', 'C', 1, 2),
        opt('C5b', '打开电视就算尊重比赛', 'C', -1, 1),
      ],
    },
    {
      id: 'C6',
      text: '解说员明显偏向你支持的球队，你会？',
      options: [
        opt('C6a', '听着更带劲，跟着一起喊', 'C', 1, 2),
        opt('C6b', '希望他客观一点，别那么激动', 'C', -1, 1),
      ],
    },
    {
      id: 'D1',
      text: '朋友问你到底什么叫越位，你会？',
      options: [
        opt('D1a', '拿出纸笔画给他看', 'D', 1, 2),
        opt('D1b', '说“等 VAR 划线就懂了”', 'D', -1, 1),
      ],
    },
    {
      id: 'D2',
      text: '你平时会主动研究什么？',
      options: [
        opt('D2a', '战术板和球员技术特点', 'D', 1, 2),
        opt('D2b', '球星八卦、转会传闻和球衣设计', 'D', -1, 1),
      ],
    },
    {
      id: 'D3',
      text: '看比赛时你的眼睛更常落在？',
      options: [
        opt('D3a', '阵型变化和球员跑位', 'D', 1, 2),
        opt('D3b', '谁帅、谁冲突、谁庆祝有创意', 'D', -1, 2),
      ],
    },
    {
      id: 'D4',
      text: '世界杯你最期待看到什么？',
      options: [
        opt('D4a', '教练的战术博弈和临场调度', 'D', 1, 2),
        opt('D4b', '开幕式、烟花和球迷整活', 'D', -1, 1),
      ],
    },
    {
      id: 'D5',
      text: '聊起足球，你更常引用？',
      options: [
        opt('D5a', '具体数据和战术名词', 'D', 1, 2),
        opt('D5b', '名场面、段子和经典梗', 'D', -1, 1),
      ],
    },
    {
      id: 'D6',
      text: '一场比赛最吸引你的是？',
      options: [
        opt('D6a', '教练的换人策略是否合理', 'D', 1, 2),
        opt('D6b', '戏剧性的剧情反转和意外', 'D', -1, 2),
      ],
    },
  ]
}

export function getHiddenQuestion(): Question {
  return {
    id: 'H1',
    text: '中场休息时，一位神秘老人递给你一枚幸运硬币，你会？',
    options: [
      {
        id: 'H1a',
        text: '立刻收好，觉得它能给下半场带来好运',
        effects: [
          { dimension: 'B', side: -1, weight: 2 },
          { dimension: 'C', side: 1, weight: 1 },
        ],
      },
      {
        id: 'H1b',
        text: '婉拒，并继续分析下半场的数据走势',
        effects: [
          { dimension: 'B', side: 1, weight: 2 },
          { dimension: 'C', side: -1, weight: 1 },
        ],
      },
    ],
    isHidden: true,
  }
}

export const personalities: Personality[] = [
  {
    code: 'ABCD',
    name: '战术控',
    alias: 'THE PROFESSOR',
    description: '你把世界杯当成公开课，每次越位都要暂停画线。朋友看球喝啤酒，你端着战术板讲高位逼抢。',
    pros: '懂体系、会复盘，能把 90 分钟拆成十几个战术片段。',
    cons: '容易在庆祝进球时指出“这次反击的阵地转换其实不够干净”。',
    bestMatch: 'abcD',
    worstMatch: 'abcd',
    quote: '这不是进球，这是战术执行的必然结果。',
    percentage: 9,
    scores: { A: 82, B: 80, C: 78, D: 85 },
    mascot: { gradient: ['#8B8290', '#B06B5A'], symbol: 'glasses' },
  },
  {
    code: 'ABCd',
    name: '数据控',
    alias: 'THE ANALYST',
    description: '你的看球伴侣是 xG 曲线和传球网络图。球队赢了不重要，预期进球有没有兑现才重要。',
    pros: '用数字说话，预测准确率常让朋友惊掉下巴。',
    cons: '偶尔会把“足球是圆的”翻译成“小概率方差事件”。',
    bestMatch: 'aBcd',
    worstMatch: 'AbCD',
    quote: '样本量还不够，但趋势已经很明显。',
    percentage: 7,
    scores: { A: 80, B: 85, C: 75, D: 30 },
    mascot: { gradient: ['#8B8290', '#C8A27A'], symbol: 'chart' },
  },
  {
    code: 'ABcD',
    name: '守夜人',
    alias: 'THE NIGHT OWL',
    description: '凌晨三点的比赛从不缺席，黑眼圈是你的荣誉袖标。你不是在熬夜，你是在值夜班。',
    pros: '毅力惊人，再冷的场次也能看出门道。',
    cons: '第二天开会时，你的灵魂还在替补席。',
    bestMatch: 'AbCd',
    worstMatch: 'aBCd',
    quote: '真正的球迷，不需要闹钟。',
    percentage: 4,
    scores: { A: 78, B: 75, C: 22, D: 82 },
    mascot: { gradient: ['#7A8B8A', '#B06B5A'], symbol: 'moon' },
  },
  {
    code: 'ABcd',
    name: '预言家',
    alias: 'THE ORACLE',
    description: '你赛前总能列出十八条理由说明为什么某队会输——然后他们真的输了。你不太庆祝，因为结果早写在小本本上。',
    pros: '冷静、理性，很少被情绪带跑。',
    cons: '赢球时的快乐好像也被你提前透支了。',
    bestMatch: 'aBcD',
    worstMatch: 'Abcd',
    quote: '我早就说过，只是你们当时没信。',
    percentage: 5,
    scores: { A: 75, B: 80, C: 20, D: 25 },
    mascot: { gradient: ['#9A8B9A', '#8B8290'], symbol: 'crystal' },
  },
  {
    code: 'AbCD',
    name: '玄学家',
    alias: 'THE MYSTIC',
    description: '球衣颜色、开赛时辰、行星逆行……你总能从奇怪的角度找到胜负线索。科学解释不了的事，你有一整套玄学补丁。',
    pros: '想象力丰富，看球像解谜，乐趣翻倍。',
    cons: '主队输球后，你会先检查是不是自己坐错了沙发。',
    bestMatch: 'abCD',
    worstMatch: 'ABCd',
    quote: '这不是迷信，这是场域能量。',
    percentage: 5,
    scores: { A: 80, B: 20, C: 78, D: 82 },
    mascot: { gradient: ['#8A9A7A', '#B06B5A'], symbol: 'star' },
  },
  {
    code: 'AbCd',
    name: '幸运锦鲤',
    alias: 'THE LUCKY CHARM',
    description: '你支持的球队不一定最强，但每逢大赛总有人莫名其妙进球。朋友都抢着和你一起看决赛。',
    pros: '自带锦鲤气场，能替主队攒人品。',
    cons: '你自己也解释不了为什么最后五分钟总能绝平。',
    bestMatch: 'ABcD',
    worstMatch: 'ABCD',
    quote: '别问，问就是玄学守恒。',
    percentage: 4,
    scores: { A: 78, B: 18, C: 75, D: 22 },
    mascot: { gradient: ['#8A9A7A', '#C8A27A'], symbol: 'clover' },
  },
  {
    code: 'AbcD',
    name: '死忠老炮',
    alias: 'THE LOYALIST',
    description: '你见过球队降级、换帅、换队徽，甚至换球场，但你的围巾颜色没变过。输赢看淡，陪伴是真。',
    pros: '长情、稳定，是球队真正的第十二人。',
    cons: '对新战术有点念旧，总怀念“当年的防守”。',
    bestMatch: 'Abcd',
    worstMatch: 'abcd',
    quote: '我不是在看球，我是在还青春的债。',
    percentage: 6,
    scores: { A: 85, B: 22, C: 20, D: 78 },
    mascot: { gradient: ['#B06B5A', '#7A8B8A'], symbol: 'heart' },
  },
  {
    code: 'Abcd',
    name: '护旗手',
    alias: 'THE ULTRA',
    description: '你从不缺席主队的任何一场比赛，哪怕只是友谊赛热身。你的歌声比解说员还响亮。',
    pros: '热情能点燃整个客厅，感染力满分。',
    cons: '偶尔会因为对手一次普通犯规进入战斗状态。',
    bestMatch: 'AbcD',
    worstMatch: 'aBcD',
    quote: '这球必须看直播，录播不算。',
    percentage: 5,
    scores: { A: 82, B: 20, C: 20, D: 25 },
    mascot: { gradient: ['#B06B5A', '#A69B7A'], symbol: 'flag' },
  },
  {
    code: 'aBCD',
    name: '沙发指挥官',
    alias: 'THE PUNDIT',
    description: '你坐在沙发上，却比教练还忙。每个换人你都有意见，每次战术调整你都想打电话。',
    pros: '视野开阔，分析头头是道，适合解说。',
    cons: '电视机里的人听不见你的战术安排。',
    bestMatch: 'ABCD',
    worstMatch: 'aBcd',
    quote: '这换人早该做了，我看第 30 分钟就知道。',
    percentage: 7,
    scores: { A: 20, B: 82, C: 78, D: 80 },
    mascot: { gradient: ['#8B8290', '#7A8B8A'], symbol: 'bubble' },
  },
  {
    code: 'aBCd',
    name: '集锦党',
    alias: 'THE HIGHLIGHTER',
    description: '你深谙“只看精华”的人生哲学。三分钟的集锦涵盖进球、扑救和冲突，效率极高。',
    pros: '永不缺梗，社交话题永远在线。',
    cons: '有时会误把剪辑节奏当成真实比赛强度。',
    bestMatch: 'abcd',
    worstMatch: 'ABcD',
    quote: '正赛太长，集锦才是现代足球。',
    percentage: 6,
    scores: { A: 22, B: 78, C: 75, D: 25 },
    mascot: { gradient: ['#8B8290', '#C8A27A'], symbol: 'play' },
  },
  {
    code: 'aBcD',
    name: '中立鉴赏家',
    alias: 'THE NEUTRAL',
    description: '你没有主队，但有审美。一场 0:0 也能让你拍手叫好，因为防守艺术也是艺术。',
    pros: '情绪稳定，看得最通透，不容易心碎。',
    cons: '关键时刻少了那种“心脏骤停”的代入感。',
    bestMatch: 'ABcd',
    worstMatch: 'Abcd',
    quote: '好球就是好球，不分阵营。',
    percentage: 8,
    scores: { A: 25, B: 78, C: 22, D: 80 },
    mascot: { gradient: ['#8A9CAE', '#7A8B8A'], symbol: 'scales' },
  },
  {
    code: 'aBcd',
    name: '颜值鉴赏家',
    alias: 'THE AESTHETE',
    description: '你关注球衣设计、球员发型和看台风暴。比赛结果不重要，出场阵容的时尚感才重要。',
    pros: '总能发现别人忽略的美好细节。',
    cons: '偶尔会被解说员的领带吸引走注意力。',
    bestMatch: 'abcD',
    worstMatch: 'aBCD',
    quote: '这件第三客场球衣，值得赢一座设计奖。',
    percentage: 9,
    scores: { A: 22, B: 80, C: 20, D: 22 },
    mascot: { gradient: ['#8A9CAE', '#9A8B9A'], symbol: 'eye' },
  },
  {
    code: 'abCD',
    name: '故事党',
    alias: 'THE ROMANTIC',
    description: '你追的不是比分，是剧本。逆转、黑马、老将谢幕——这些才是世界杯真正的主题曲。',
    pros: '共情力强，能把一场普通小组赛讲成史诗。',
    cons: '有时候太投入，会替输家难过好几天。',
    bestMatch: 'AbCD',
    worstMatch: 'ABCd',
    quote: '足球最美的部分，永远发生在数据之外。',
    percentage: 4,
    scores: { A: 20, B: 22, C: 78, D: 82 },
    mascot: { gradient: ['#A69B7A', '#B06B5A'], symbol: 'feather' },
  },
  {
    code: 'abCd',
    name: '全村希望',
    alias: 'THE BELIEVER',
    description: '你支持的球队可能小组赛就回家，但你每年都说“今年有希望”。信念是你最强的阵容。',
    pros: '乐观、纯粹，能给身边人带来情绪价值。',
    cons: '小组赛出局后，你复盘的重点通常是“下次抽签”。',
    bestMatch: 'AbCd',
    worstMatch: 'aBcD',
    quote: '只要还没出局，就还是冠军相。',
    percentage: 5,
    scores: { A: 22, B: 20, C: 75, D: 22 },
    mascot: { gradient: ['#A69B7A', '#C8A27A'], symbol: 'sprout' },
  },
  {
    code: 'abcD',
    name: '气氛搭子',
    alias: 'THE VIBE',
    description: '你看球主要是为了和大家一起喊、一起笑、一起吃夜宵。比分是背景音，陪伴才是主菜。',
    pros: '能把任何比赛变成派对，人缘超好。',
    cons: '终场哨响时，你可能更关心冰箱还剩多少啤酒。',
    bestMatch: 'ABCD',
    worstMatch: 'ABcd',
    quote: '输赢不重要，重要的是我们一起看了。',
    percentage: 9,
    scores: { A: 20, B: 18, C: 80, D: 78 },
    mascot: { gradient: ['#C8A27A', '#9A8B9A'], symbol: 'music' },
  },
  {
    code: 'abcd',
    name: '四年球迷',
    alias: 'THE QUADRENNIAL',
    description: '世界杯期间你准时出现，其他时间你在专心生活。别紧张，这很正常，四年一度的仪式感刚刚好。',
    pros: '自带节日氛围，总能让周围人重新爱上足球。',
    cons: '在非大赛年，你可能会把俱乐部队徽认错。',
    bestMatch: 'aBCd',
    worstMatch: 'AbcD',
    quote: '世界杯来了，我又可以假装懂球了。',
    percentage: 8,
    scores: { A: 18, B: 20, C: 22, D: 20 },
    mascot: { gradient: ['#8A9CAE', '#A69B7A'], symbol: 'calendar' },
  },
]

export function getPersonalityByCode(code: string): Personality | undefined {
  return personalities.find(p => p.code === code)
}

export function getPersonalityByCodeOrDefault(code: string): Personality {
  return getPersonalityByCode(code) ?? personalities[0]!
}

export function calculatePersonality(answers: { questionId: string; optionId: string }[]): Personality {
  const totals = aggregateTotals(answers)

  let code = ''
  const order: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
  for (const dim of order) {
    const t = totals[dim]
    const score = t.pos + t.neg === 0 ? 50 : (t.pos / (t.pos + t.neg)) * 100
    code += score >= 50 ? dim.toUpperCase() : dim.toLowerCase()
  }

  return getPersonalityByCodeOrDefault(code)
}

export function calculateScores(answers: { questionId: string; optionId: string }[]): Record<'A' | 'B' | 'C' | 'D', number> {
  const totals = aggregateTotals(answers)
  const result = {} as Record<'A' | 'B' | 'C' | 'D', number>
  for (const dim of ['A', 'B', 'C', 'D'] as const) {
    const t = totals[dim]
    result[dim] = t.pos + t.neg === 0 ? 50 : Math.round((t.pos / (t.pos + t.neg)) * 100)
  }
  return result
}

export function shuffleQuestions(questions: Question[]): Question[] {
  const arr = questions.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = arr[i]
    const b = arr[j]
    if (a !== undefined && b !== undefined) {
      arr[i] = b
      arr[j] = a
    }
  }
  return arr
}
