import type { DiZhi, TianGan } from '~/types/user'

export type BztiCode =
  | 'FIRE' | 'WAVE' | 'ROOT' | 'EDGE'
  | 'SOLO' | 'LINK' | 'HOST' | 'VIBE'
  | 'MAKE' | 'MOVE' | 'STAY' | 'TEST'
  | 'LION' | 'OWL' | 'SWAN' | 'WOLF'
  | 'COAL' | 'MINT' | 'INK' | 'SPARK'
  | 'MIRROR' | 'SMOKE' | 'RIVER' | 'FLINT'
  | 'RARE-LUCK' | 'RARE-STORM' | 'RARE-GHOST' | 'RARE-SEED'

export interface BztiType {
  code: BztiCode
  name: Record<string, string>
  alias: Record<string, string>
  rarity: 'common' | 'rare'
  estimatedPercent: number
  tags: Record<string, string[]>
  summary: Record<string, string>
  gradient: [string, string]
  icon: string
  priority: number
}

export interface BztiSignals {
  riZhuStrength: string
  riZhu: TianGan
  monthZhi: DiZhi
  monthWuxing: string
  shishenCounts: Record<string, number>
  wuxingScore: Record<string, number>
  geju: string
  dominantWuxing: string
  weakestWuxing: string
  riWuxing: string
  hasHour: boolean
  hasGanHe: boolean
  hasZhiHe: boolean
}

export interface BztiBirthdayPersonalityCalcResult {
  profile: {
    name?: string
    birthDate: string
    birthHour?: string
    gender: 'male' | 'female'
    birthProvince?: string
  }
  type: BztiType
  code: BztiCode
  rarity: 'common' | 'rare'
  signals: BztiSignals
  pillars: {
    year: { gan: string; zhi: string; shishen: string; canggan: Array<{ gan: string; type: string; shishen: string }> }
    month: { gan: string; zhi: string; shishen: string; canggan: Array<{ gan: string; type: string; shishen: string }> }
    day: { gan: string; zhi: string; shishen: string; canggan: Array<{ gan: string; type: string; shishen: string }> }
    hour: { gan: string; zhi: string; shishen: string; canggan: Array<{ gan: string; type: string; shishen: string }> } | null
  }
  riZhu: string
  riZhuStrength: string
  geju: string
  wuxingScore: Record<string, number>
  shishenCounts: Record<string, number>
}

const GAN_WUXING: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

const COMMON_TYPES: BztiType[] = [
  {
    code: 'FIRE',
    name: { 'zh-CN': '燎原型', 'zh-TW': '燎原型', en: 'Wildfire' },
    alias: { 'zh-CN': '先烧起来再说', 'zh-TW': '先燒起來再說', en: 'Light first, ask later' },
    rarity: 'common',
    estimatedPercent: 5,
    tags: {
      'zh-CN': ['行动优先', '易燃易炸', '热情外放'],
      'zh-TW': ['行動優先', '易燃易炸', '熱情外放'],
      en: ['Action-first', 'Combustible', 'Outwardly warm'],
    },
    summary: {
      'zh-CN': '你是那种想法还没落地，身体已经冲出去三米的人。火气旺不是缺点，是你点燃世界的火柴。',
      'zh-TW': '妳是那種想法還沒落地，身體已經衝出去三米的人。火氣旺不是缺點，是妳點燃世界的火柴。',
      en: 'Your body is three meters ahead of your plan. That fire is not a flaw; it is the match that lights the room.',
    },
    gradient: ['#ef4444', '#f97316'],
    icon: '🔥',
    priority: 10,
  },
  {
    code: 'WAVE',
    name: { 'zh-CN': '暗涌型', 'zh-TW': '暗湧型', en: 'Undertow' },
    alias: { 'zh-CN': '表面平静，底下有漩涡', 'zh-TW': '表面平靜，底下有漩渦', en: 'Calm surface, spinning below' },
    rarity: 'common',
    estimatedPercent: 5,
    tags: {
      'zh-CN': ['情绪深海', '感知敏锐', '内耗型天才'],
      'zh-TW': ['情緒深海', '感知敏銳', '內耗型天才'],
      en: ['Emotional deep sea', 'Hyper-perceptive', 'Overthinking talent'],
    },
    summary: {
      'zh-CN': '你看起来很好说话，其实心里已经把剧本演到了第八季。水多的人，不是软弱，是容纳得多。',
      'zh-TW': '妳看起來很好說話，其實心裡已經把劇本演到了第八季。水多的人，不是軟弱，是容納得多。',
      en: 'You seem easygoing, but your inner script is already in season eight. Water does not mean weak; it means you hold more.',
    },
    gradient: ['#3b82f6', '#06b6d4'],
    icon: '🌊',
    priority: 11,
  },
  {
    code: 'ROOT',
    name: { 'zh-CN': '扎根型', 'zh-TW': '扎根型', en: 'Deep Root' },
    alias: { 'zh-CN': '慢，但站得很稳', 'zh-TW': '慢，但站得很穩', en: 'Slow, but deeply planted' },
    rarity: 'common',
    estimatedPercent: 5,
    tags: {
      'zh-CN': ['土象担当', '耐心储蓄', '靠谱背景板'],
      'zh-TW': ['土象擔當', '耐心儲蓄', '靠譜背景板'],
      en: ['Earth anchor', 'Patient accumulator', 'Reliable backdrop'],
    },
    summary: {
      'zh-CN': '你不抢话筒，但关键时候大家都在找你。你的存在感像承重墙，平时隐形，塌了才知道多重要。',
      'zh-TW': '妳不搶話筒，但關鍵時候大家都在找妳。妳的存在感像承重牆，平時隱形，塌了才知道多重要。',
      en: 'You never grab the mic, yet people find you when it matters. You are a load-bearing wall: invisible until needed.',
    },
    gradient: ['#a16207', '#ca8a04'],
    icon: '🌳',
    priority: 12,
  },
  {
    code: 'EDGE',
    name: { 'zh-CN': '锋刃型', 'zh-TW': '鋒刃型', en: 'Blade Edge' },
    alias: { 'zh-CN': '话少，但每句都带切口', 'zh-TW': '話少，但每句都帶切口', en: 'Quiet words, sharp cuts' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['金气冷感', '边界清晰', '效率至上'],
      'zh-TW': ['金氣冷感', '邊界清晰', '效率至上'],
      en: ['Cool metal', 'Clear boundaries', 'Efficiency-first'],
    },
    summary: {
      'zh-CN': '你不擅长寒暄，但擅长把复杂的事情一刀切。世界需要温柔，也需要你这种精准。',
      'zh-TW': '妳不擅長寒暄，但擅長把複雜的事情一刀切。世界需要溫柔，也需要妳這種精準。',
      en: 'Small talk is not your thing, but slicing through complexity is. The world needs gentleness, and it needs your precision.',
    },
    gradient: ['#64748b', '#94a3b8'],
    icon: '⚔️',
    priority: 13,
  },
  {
    code: 'SOLO',
    name: { 'zh-CN': '单机型', 'zh-TW': '單機型', en: 'Solo Mode' },
    alias: { 'zh-CN': '一个人就是一支队伍', 'zh-TW': '一個人就是一支隊伍', en: 'A one-person team' },
    rarity: 'common',
    estimatedPercent: 5,
    tags: {
      'zh-CN': ['比劫成群', '自我驱动', '组队会掉线'],
      'zh-TW': ['比劫成群', '自我驅動', '組隊會掉線'],
      en: ['Sibling-gods crowd', 'Self-driven', 'Teams slow you down'],
    },
    summary: {
      'zh-CN': '你其实不是孤僻，是和别人节奏不同频。给你一间屋子、一个目标，你能自己长出一条路。',
      'zh-TW': '妳其實不是孤僻，是和別人節奏不同頻。給妳一間屋子、一個目標，妳能自己長出一條路。',
      en: 'You are not antisocial; you are just on a different tempo. Give you a room and a goal, and you will grow your own path.',
    },
    gradient: ['#8b5cf6', '#a78bfa'],
    icon: '🎧',
    priority: 20,
  },
  {
    code: 'LINK',
    name: { 'zh-CN': '连线型', 'zh-TW': '連線型', en: 'Live Wire' },
    alias: { 'zh-CN': '人脉是主动长出来的', 'zh-TW': '人脈是主動長出來的', en: 'Networks grow from you' },
    rarity: 'common',
    estimatedPercent: 5,
    tags: {
      'zh-CN': ['财官两旺', '资源整合', '关系枢纽'],
      'zh-TW': ['財官兩旺', '資源整合', '關係樞紐'],
      en: ['Wealth & officer strong', 'Resource integrator', 'Human hub'],
    },
    summary: {
      'zh-CN': '你天生适合当连接点，别人还在找门，你已经把两边撮合上了。你的价值在关系网络里指数级放大。',
      'zh-TW': '妳天生適合當連接點，別人還在找門，妳已經把兩邊撮合上了。妳的價值在關係網絡裡指數級放大。',
      en: 'You were born to be the connection. While others look for doors, you already matched both sides. Your value compounds inside networks.',
    },
    gradient: ['#10b981', '#34d399'],
    icon: '🔌',
    priority: 21,
  },
  {
    code: 'HOST',
    name: { 'zh-CN': '主理型', 'zh-TW': '主理型', en: 'The Host' },
    alias: { 'zh-CN': '团队不能没有你开场', 'zh-TW': '團隊不能沒有妳開場', en: 'No team starts without you' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['正印光环', '照顾全场', '情绪稳定器'],
      'zh-TW': ['正印光環', '照顧全場', '情緒穩定器'],
      en: ['Seal-god halo', 'Caretaker of the room', 'Emotional stabilizer'],
    },
    summary: {
      'zh-CN': '你是那个会记得每个人咖啡口味的人。别人看到的是体贴，其实你只是受不了场子冷掉。',
      'zh-TW': '妳是那個會記得每個人咖啡口味的人。別人看到的是體貼，其實妳只是受不了場子冷掉。',
      en: "You remember everyone's coffee order. Others call it kindness; you just cannot stand a cold room.",
    },
    gradient: ['#f59e0b', '#fbbf24'],
    icon: '🎤',
    priority: 22,
  },
  {
    code: 'VIBE',
    name: { 'zh-CN': '氛围型', 'zh-TW': '氛圍型', en: 'Vibe Setter' },
    alias: { 'zh-CN': '在场就是软装', 'zh-TW': '在場就是軟裝', en: 'Your presence is the decor' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['食伤生财', '审美在线', '情绪调色盘'],
      'zh-TW': ['食傷生財', '審美在線', '情緒調色盤'],
      en: ['Food-injury feeds wealth', 'Aesthetic online', 'Emotional palette'],
    },
    summary: {
      'zh-CN': '你不一定掌控全场，但你决定全场是什么色调。你擅长让无聊的事变得值得拍照。',
      'zh-TW': '妳不一定掌控全場，但妳決定全場是什麼色調。妳擅長讓無聊的事變得值得拍照。',
      en: 'You may not run the room, but you decide its color. You make dull things worth photographing.',
    },
    gradient: ['#d946ef', '#e879f9'],
    icon: '🪩',
    priority: 23,
  },
  {
    code: 'MAKE',
    name: { 'zh-CN': '造物型', 'zh-TW': '造物型', en: 'Maker' },
    alias: { 'zh-CN': '手比嘴诚实', 'zh-TW': '手比嘴誠實', en: 'Hands more honest than words' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['食伤主导', '创造欲强', '动手派'],
      'zh-TW': ['食傷主導', '創造欲強', '動手派'],
      en: ['Food-injury led', 'Strong creative urge', 'Hands-on'],
    },
    summary: {
      'zh-CN': '你说不清楚的时候，通常已经做了一半。你的世界是由半成品和下一个半成品堆出来的。',
      'zh-TW': '妳說不清楚的時候，通常已經做了一半。妳的世界是由半成品和下一個半成品堆出來的。',
      en: 'When you cannot explain it, you are already halfway done. Your world is built from half-finished things and the next half-finished things.',
    },
    gradient: ['#84cc16', '#a3e635'],
    icon: '🛠️',
    priority: 30,
  },
  {
    code: 'MOVE',
    name: { 'zh-CN': '动能型', 'zh-TW': '動能型', en: 'Kinetic' },
    alias: { 'zh-CN': '停下来会死机', 'zh-TW': '停下來會死機', en: 'Stopping means crashing' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['官杀压阵', '目标驱动', '停不下来'],
      'zh-TW': ['官殺壓陣', '目標驅動', '停不下來'],
      en: ['Officer-killer pressure', 'Goal-driven', 'Cannot stop'],
    },
    summary: {
      'zh-CN': '你是那种被目标追着跑的人。闲下来反而焦虑，动起来才是你的默认状态。',
      'zh-TW': '妳是那種被目標追著跑的人。閒下來反而焦慮，動起來才是妳的預設狀態。',
      en: 'You are chased by goals. Idle time makes you anxious; motion is your default state.',
    },
    gradient: ['#dc2626', '#ef4444'],
    icon: '🏃',
    priority: 31,
  },
  {
    code: 'STAY',
    name: { 'zh-CN': '驻守型', 'zh-TW': '駐守型', en: 'Steadfast' },
    alias: { 'zh-CN': '变了也没关系，我还在', 'zh-TW': '變了也沒關係，我還在', en: 'Everything changes; I stay' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['正印坐镇', '忠诚长情', '守护型'],
      'zh-TW': ['正印坐鎮', '忠誠長情', '守護型'],
      en: ['Seal-god seated', 'Loyal', 'Guardian type'],
    },
    summary: {
      'zh-CN': '你不是不爱变化，只是更相信留下来的价值。对重要的人和事，你就是那个不会自动退出的程序。',
      'zh-TW': '妳不是不愛變化，只是更相信留下來的價值。對重要的人和事，妳就是那個不會自動退出的程式。',
      en: 'You are not against change; you just believe in staying. For the people and things that matter, you are the program that never quits.',
    },
    gradient: ['#0d9488', '#14b8a6'],
    icon: '🏠',
    priority: 32,
  },
  {
    code: 'TEST',
    name: { 'zh-CN': '试探型', 'zh-TW': '試探型', en: 'Probe' },
    alias: { 'zh-CN': '先伸一只脚，再决定跳不跳', 'zh-TW': '先伸一隻腳，再決定跳不跳', en: 'One foot first, then decide' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['偏印观察', '谨慎入局', '风险雷达'],
      'zh-TW': ['偏印觀察', '謹慎入局', '風險雷達'],
      en: ['Seal-observer', 'Cautious entrant', 'Risk radar'],
    },
    summary: {
      'zh-CN': '你不是犹豫，是在收集证据。别人已经All in，你还在等最后一个信号——这常常救你一命。',
      'zh-TW': '妳不是猶豫，是在收集證據。別人已經 All in，妳還在等最後一個信號——這常常救妳一命。',
      en: 'You are not hesitant; you are gathering evidence. While others go all in, you wait for the last signal. It often saves you.',
    },
    gradient: ['#475569', '#64748b'],
    icon: '🧪',
    priority: 33,
  },
  {
    code: 'LION',
    name: { 'zh-CN': '狮群型', 'zh-TW': '獅群型', en: 'Pride Leader' },
    alias: { 'zh-CN': '领地意识写在基因里', 'zh-TW': '領地意識寫在基因裡', en: 'Territorial by design' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['官杀旺', '领导欲', '护短'],
      'zh-TW': ['官殺旺', '領導欲', '護短'],
      en: ['Officer-killer strong', 'Leadership urge', 'Protective'],
    },
    summary: {
      'zh-CN': '你可以温和，但你的地盘必须姓你。责任越大你反而越精神，当甩手掌柜才会让你生锈。',
      'zh-TW': '妳可以溫和，但妳的地盤必須姓妳。責任越大妳反而越精神，當甩手掌櫃才會讓妳生鏽。',
      en: 'You can be gentle, but your territory must carry your name. Bigger responsibility energizes you; being a figurehead rusts you.',
    },
    gradient: ['#b45309', '#d97706'],
    icon: '🦁',
    priority: 40,
  },
  {
    code: 'OWL',
    name: { 'zh-CN': '夜枭型', 'zh-TW': '夜梟型', en: 'Night Owl' },
    alias: { 'zh-CN': '白天待机，深夜开机', 'zh-TW': '白天待機，深夜開機', en: 'Idle by day, alive at night' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['偏印重', '深夜清醒', '独思者'],
      'zh-TW': ['偏印重', '深夜清醒', '獨思者'],
      en: ['Heavy seal', 'Midnight clarity', 'Solo thinker'],
    },
    summary: {
      'zh-CN': '白天的热闹是你的待机画面，深夜的安静才是你的主舞台。你不是孤僻，是需要低噪音环境才能思考。',
      'zh-TW': '白天的熱鬧是妳的待機畫面，深夜的安靜才是妳的主舞台。妳不是孤僻，是需要低噪音環境才能思考。',
      en: 'Daytime noise is your screensaver; midnight quiet is your main stage. You are not lonely; you just need low noise to think.',
    },
    gradient: ['#1e293b', '#334155'],
    icon: '🦉',
    priority: 41,
  },
  {
    code: 'SWAN',
    name: { 'zh-CN': '天鹅型', 'zh-TW': '天鵝型', en: 'Swan' },
    alias: { 'zh-CN': '水面优雅，水下狂蹬', 'zh-TW': '水面優雅，水下狂蹬', en: 'Grace on top, paddling below' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['财官印流通', '体面强迫症', '幕后卷王'],
      'zh-TW': ['財官印流通', '體面強迫症', '幕後捲王'],
      en: ['Wealth-officer-seal flow', 'Dignity compulsion', 'Behind-the-scenes grinder'],
    },
    summary: {
      'zh-CN': '你擅长让一切看起来毫不费力。别人只看到你的从容，没看见你水下那双腿都快蹬出火星。',
      'zh-TW': '妳擅長讓一切看起來毫不費力。別人只看到妳的從容，沒看見妳水下那雙腿都快蹬出火星。',
      en: 'You make everything look effortless. Others see poise; they do not see the legs kicking hard enough to spark.',
    },
    gradient: ['#f8fafc', '#cbd5e1'],
    icon: '🦢',
    priority: 42,
  },
  {
    code: 'WOLF',
    name: { 'zh-CN': '孤狼型', 'zh-TW': '孤狼型', en: 'Lone Wolf' },
    alias: { 'zh-CN': '成群结队不如独行', 'zh-TW': '成群結隊不如獨行', en: 'Packs slow you down' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['七杀独行', '边界感强', '效率猎手'],
      'zh-TW': ['七殺獨行', '邊界感強', '效率獵手'],
      en: ['Seven-killer solo', 'Strong boundaries', 'Efficiency hunter'],
    },
    summary: {
      'zh-CN': '你不是不能合群，是合群时总在算机会成本。与其跟着队伍散步，你更想自己追到点东西。',
      'zh-TW': '妳不是不能合群，是合群時總在算機會成本。與其跟著隊伍散步，妳更想自己追到點東西。',
      en: 'You can fit in, but group time always carries opportunity cost. You would rather hunt alone than walk with the pack.',
    },
    gradient: ['#374151', '#6b7280'],
    icon: '🐺',
    priority: 43,
  },
  {
    code: 'COAL',
    name: { 'zh-CN': '燃煤型', 'zh-TW': '燃煤型', en: 'Coal Burner' },
    alias: { 'zh-CN': '燃烧自己，照亮项目', 'zh-TW': '燃燒自己，照亮專案', en: 'Burn yourself, light the project' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['食伤泄秀', '持续输出', '容易透支'],
      'zh-TW': ['食傷洩秀', '持續輸出', '容易透支'],
      en: ['Food-injury expression', 'Steady output', 'Burnout-prone'],
    },
    summary: {
      'zh-CN': '你是一块好煤，扔进炉子里就能让事情转起来。但别忘了，煤烧完会碎成灰，你得学会续火。',
      'zh-TW': '妳是一塊好煤，扔進爐子裡就能讓事情轉起來。但別忘了，煤燒完會碎成灰，妳得學會續火。',
      en: 'You are good coal: throw you in and things start moving. But coal turns to ash; learn to refuel.',
    },
    gradient: ['#171717', '#525252'],
    icon: '⚫',
    priority: 50,
  },
  {
    code: 'MINT',
    name: { 'zh-CN': '薄荷型', 'zh-TW': '薄荷型', en: 'Mint' },
    alias: { 'zh-CN': '靠近就清醒', 'zh-TW': '靠近就清醒', en: 'People wake up near you' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['金水相生', '清冷理智', '降温器'],
      'zh-TW': ['金水相生', '清冷理智', '降溫器'],
      en: ['Metal-water flow', 'Cool reason', 'Refrigerant'],
    },
    summary: {
      'zh-CN': '你不煽情、不站队，但朋友们上头时总爱找你降温。你的清醒不是冷漠，是省去了表演成本。',
      'zh-TW': '妳不煽情、不站隊，但朋友們上頭時總愛找妳降溫。妳的清醒不是冷漠，是省去了表演成本。',
      en: 'You do not dramatize or take sides, but friends come to you when overheated. Your clarity is not coldness; it just skips the performance.',
    },
    gradient: ['#14b8a6', '#2dd4bf'],
    icon: '🍃',
    priority: 51,
  },
  {
    code: 'INK',
    name: { 'zh-CN': '墨痕型', 'zh-TW': '墨痕型', en: 'Ink Trace' },
    alias: { 'zh-CN': '话不多，但记性好', 'zh-TW': '話不多，但記性好', en: 'Quiet, but never forgets' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['印星重', '记忆库', '慢热型观察家'],
      'zh-TW': ['印星重', '記憶庫', '慢熱型觀察家'],
      en: ['Seal-heavy', 'Memory bank', 'Slow-warming observer'],
    },
    summary: {
      'zh-CN': '你不是当下反应最快的人，但三个月后你能准确复述那天谁说了什么。你的记忆是一笔复利。',
      'zh-TW': '妳不是當下反應最快的人，但三個月後妳能準確復述那天誰說了什麼。妳的記憶是一筆複利。',
      en: 'You are not the fastest to react, but three months later you can quote who said what. Your memory earns compound interest.',
    },
    gradient: ['#312e81', '#4338ca'],
    icon: '🖋️',
    priority: 52,
  },
  {
    code: 'SPARK',
    name: { 'zh-CN': '火花型', 'zh-TW': '火花型', en: 'Spark' },
    alias: { 'zh-CN': '灵感来得快，散得也快', 'zh-TW': '靈感來得快，散得也快', en: 'Ideas flash, then scatter' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['伤官生财', '点子机器', '持续开始'],
      'zh-TW': ['傷官生財', '點子機器', '持續開始'],
      en: ['Injury god feeds wealth', 'Idea machine', 'Perpetual starter'],
    },
    summary: {
      'zh-CN': '你是灵感的打火机，身边人的项目常常从你的一句话开始。问题是，你也容易在落地前被下一个灵感带走。',
      'zh-TW': '妳是靈感的打火機，身邊人的專案常常從妳的一句話開始。問題是，妳也容易在落地前被下一個靈感帶走。',
      en: "You are a lighter for other people's projects. The trouble is, you often run after the next spark before landing the current one.",
    },
    gradient: ['#facc15', '#fde047'],
    icon: '✨',
    priority: 53,
  },
  {
    code: 'MIRROR',
    name: { 'zh-CN': '镜像型', 'zh-TW': '鏡像型', en: 'Mirror' },
    alias: { 'zh-CN': '你见什么人，就亮什么面', 'zh-TW': '你見什麼人，就亮什麼面', en: 'Reflect whoever is in front' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['财星杂', '适应力强', '角色切换'],
      'zh-TW': ['財星雜', '適應力強', '角色切換'],
      en: ['Mixed wealth stars', 'Highly adaptable', 'Role switcher'],
    },
    summary: {
      'zh-CN': '你是那种见什么人就能切换频道的人。效率很高，但偶尔会忘了自己原本静音的台是什么。',
      'zh-TW': '妳是那種見什麼人就能切換頻道的人。效率很高，但偶爾會忘了自己原本靜音的台是什麼。',
      en: 'You can switch channels depending on who is in front of you. It is efficient, but sometimes you forget which station is yours on mute.',
    },
    gradient: ['#6366f1', '#818cf8'],
    icon: '🪞',
    priority: 60,
  },
  {
    code: 'SMOKE',
    name: { 'zh-CN': '烟雾型', 'zh-TW': '煙霧型', en: 'Smoke' },
    alias: { 'zh-CN': '抓不住，但确实存在', 'zh-TW': '抓不住，但確實存在', en: 'Cannot catch it, but it is real' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['水木漂泊', '游离感', '灵感体质'],
      'zh-TW': ['水木漂泊', '游離感', '靈感體質'],
      en: ['Water-wood drifting', 'Unanchored', 'Inspiration-prone'],
    },
    summary: {
      'zh-CN': '你像一缕烟，别人想定义你时你已经飘到别处。自由是你的氧气，但也是你的不稳定来源。',
      'zh-TW': '妳像一縷煙，別人想定義妳時妳已經飄到別處。自由是妳的氧氣，但也是妳的不穩定來源。',
      en: 'You are like smoke: when others try to define you, you have already drifted away. Freedom is your oxygen and your instability.',
    },
    gradient: ['#9ca3af', '#d1d5db'],
    icon: '💨',
    priority: 61,
  },
  {
    code: 'RIVER',
    name: { 'zh-CN': '江河型', 'zh-TW': '江河型', en: 'Great River' },
    alias: { 'zh-CN': '绕开石头，继续流', 'zh-TW': '繞開石頭，繼續流', en: 'Go around the stone, keep flowing' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['水旺', '柔韧', '长期主义'],
      'zh-TW': ['水旺', '柔韌', '長期主義'],
      en: ['Water-strong', 'Resilient', 'Long-term'],
    },
    summary: {
      'zh-CN': '你不硬碰硬，但也很少被真正拦住。时间站在你这边，因为你最擅长把障碍磨成鹅卵石。',
      'zh-TW': '妳不硬碰硬，但也很少被真正攔住。時間站在妳這邊，因為妳最擅長把障礙磨成鵝卵石。',
      en: 'You do not crash into obstacles, but you rarely stay blocked. Time is on your side because you turn stones into pebbles.',
    },
    gradient: ['#1d4ed8', '#3b82f6'],
    icon: '🏞️',
    priority: 62,
  },
  {
    code: 'FLINT',
    name: { 'zh-CN': '燧石型', 'zh-TW': '燧石型', en: 'Flint' },
    alias: { 'zh-CN': '平时沉默，一敲就着火', 'zh-TW': '平時沉默，一敲就著火', en: 'Silent until struck, then fire' },
    rarity: 'common',
    estimatedPercent: 4,
    tags: {
      'zh-CN': ['金火暗藏', '慢热爆发', '底线清晰'],
      'zh-TW': ['金火暗藏', '慢熱爆發', '底線清晰'],
      en: ['Hidden metal-fire', 'Slow-burn explosion', 'Clear bottom line'],
    },
    summary: {
      'zh-CN': '你平时像块石头，不喧哗、不抢镜，但真被踩到底线，会迸出让人意外的火光。别逼你。',
      'zh-TW': '妳平時像塊石頭，不喧嘩、不搶鏡，但真被踩到底線，會迸出讓人意外的火光。別逼妳。',
      en: 'You are usually a quiet stone, but step on the bottom line and you spark in ways people do not expect. Do not push it.',
    },
    gradient: ['#78350f', '#b45309'],
    icon: '🪨',
    priority: 63,
  },
]

const RARE_TYPES: BztiType[] = [
  {
    code: 'RARE-LUCK',
    name: { 'zh-CN': '『天选补丁』', 'zh-TW': '『天選補丁』', en: '『Chosen Patch』' },
    alias: { 'zh-CN': '哪里崩了修哪里', 'zh-TW': '哪裡崩了修哪裡', en: 'Patch whatever breaks' },
    rarity: 'rare',
    estimatedPercent: 1,
    tags: {
      'zh-CN': ['隐藏款', '救火体质', '关键时刻上线'],
      'zh-TW': ['隱藏款', '救火體質', '關鍵時刻上線'],
      en: ['Hidden', 'Firefighter', 'Shows up when it counts'],
    },
    summary: {
      'zh-CN': '你不是C位，但舞台塌了你就是那颗救场的螺丝钉。稀有不是因为你特别闪，是因为没有你时大家才会慌。',
      'zh-TW': '妳不是 C 位，但舞台塌了妳就是那顆救場的螺絲釘。稀有不是因為妳特別閃，是因為沒有妳時大家才會慌。',
      en: 'You are not the star, but when the stage collapses you are the screw that saves the show. Rare not because you shine, but because people panic without you.',
    },
    gradient: ['#fbbf24', '#f59e0b'],
    icon: '🛠️✨',
    priority: 1,
  },
  {
    code: 'RARE-STORM',
    name: { 'zh-CN': '『人形雷暴』', 'zh-TW': '『人形雷暴』', en: '『Walking Thunderstorm』' },
    alias: { 'zh-CN': '靠近五米内自动带电', 'zh-TW': '靠近五公尺內自動帶電', en: 'Static within five meters' },
    rarity: 'rare',
    estimatedPercent: 1,
    tags: {
      'zh-CN': ['隐藏款', '高能量', '压迫感'],
      'zh-TW': ['隱藏款', '高能量', '壓迫感'],
      en: ['Hidden', 'High energy', 'Intense presence'],
    },
    summary: {
      'zh-CN': '你出场自带气压变化，喜欢你的人觉得你摧枯拉朽，怕你的人觉得你破坏力太强。其实你只是忘了调静音。',
      'zh-TW': '妳出場自帶氣壓變化，喜歡妳的人覺得妳摧枯拉朽，怕妳的人覺得妳破壞力太強。其實妳只是忘了調靜音。',
      en: 'Your entrance changes the barometer. Fans find you unstoppable; others find you too much. You just forgot to mute.',
    },
    gradient: ['#4c1d95', '#7c3aed'],
    icon: '⛈️',
    priority: 2,
  },
  {
    code: 'RARE-GHOST',
    name: { 'zh-CN': '『气氛幽灵』', 'zh-TW': '『氣氛幽靈』', en: '『Atmosphere Ghost』' },
    alias: { 'zh-CN': '在场但不被定义', 'zh-TW': '在場但不被定義', en: 'Present but undefined' },
    rarity: 'rare',
    estimatedPercent: 1,
    tags: {
      'zh-CN': ['隐藏款', '低存在高影响', '观察者之王'],
      'zh-TW': ['隱藏款', '低存在高影響', '觀察者之王'],
      en: ['Hidden', 'Low presence, high impact', 'King observer'],
    },
    summary: {
      'zh-CN': '你能在聚会上全程不说话，但散场后大家聊的都是你提到的那个点。你是不署名的高亮批注。',
      'zh-TW': '妳能在聚會上全程不說話，但散場後大家聊的都是妳提到的那個點。妳是不署名的高亮批註。',
      en: 'You can stay quiet through a party, yet afterward everyone talks about the point you made. You are the unsigned highlight.',
    },
    gradient: ['#0f172a', '#334155'],
    icon: '👻',
    priority: 3,
  },
  {
    code: 'RARE-SEED',
    name: { 'zh-CN': '『时间胶囊』', 'zh-TW': '『時間膠囊』', en: '『Time Capsule』' },
    alias: { 'zh-CN': '现在不起眼，未来会发芽', 'zh-TW': '現在看不起眼，未來會發芽', en: 'Small now, sprouts later' },
    rarity: 'rare',
    estimatedPercent: 1,
    tags: {
      'zh-CN': ['隐藏款', '厚积薄发', '延迟满足'],
      'zh-TW': ['隱藏款', '厚積薄發', '延遲滿足'],
      en: ['Hidden', 'Accumulate then burst', 'Delayed gratification'],
    },
    summary: {
      'zh-CN': '你现在看起来像颗普通的种子，但根系已经在别人看不见的地方盘了很久。耐心不是被动，是主动选择的时间杠杆。',
      'zh-TW': '妳現在看起來像顆普通的種子，但根系已經在別人看不見的地方盤了很久。耐心不是被動，是主動選擇的時間槓桿。',
      en: 'You look like an ordinary seed now, but your roots have been spreading where no one sees. Patience is not passivity; it is chosen leverage.',
    },
    gradient: ['#166534', '#22c55e'],
    icon: '🌱',
    priority: 4,
  },
]

export const BZTI_TYPES: BztiType[] = [...RARE_TYPES, ...COMMON_TYPES].sort((a, b) => a.priority - b.priority)

export function getBztiType(code: string): BztiType | undefined {
  return BZTI_TYPES.find(t => t.code === code)
}

export function getAllBztiTypes(): BztiType[] {
  return BZTI_TYPES
}

function topN<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.min(n, arr.length))
}

function hasGanCombination(gans: string[]): boolean {
  const pairs: Array<[string, string]> = [
    ['甲', '己'],
    ['乙', '庚'],
    ['丙', '辛'],
    ['丁', '壬'],
    ['戊', '癸'],
  ]
  return pairs.some(([a, b]) => gans.includes(a) && gans.includes(b))
}

function hasZhiCombination(zhis: string[]): boolean {
  // 六合关系
  const liuHe: Record<string, string> = {
    子: '丑', 丑: '子', 寅: '亥', 亥: '寅',
    卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰',
    巳: '申', 申: '巳', 午: '未', 未: '午',
  }
  // 半三合：任意两个地支，其五行相生且相邻
  const shengRelations: Record<string, string> = {
    亥: '卯', 卯: '未', 寅: '午', 午: '戌',
    巳: '酉', 酉: '丑', 申: '子', 子: '辰',
    丑: '酉', 未: '卯', 戌: '午', 辰: '子',
  }
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const a = zhis[i]!, b = zhis[j]!
      if (liuHe[a] === b) return true
      if (shengRelations[a] === b || shengRelations[b] === a) return true
    }
  }
  return false
}

/** 根据结构信号判定 BZTI 类型 */
export function determineBztiType(signals: BztiSignals): BztiType {
  const {
    riZhuStrength,
    riZhu,
    monthZhi,
    shishenCounts,
    wuxingScore,
    geju,
    dominantWuxing,
    riWuxing,
    hasHour,
    hasGanHe,
    hasZhiHe,
  } = signals

  const topShiShen = Object.entries(shishenCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
  const top2 = topN(topShiShen, 2)
  const top3 = topN(topShiShen, 3)

  const get = (k: string) => shishenCounts[k] || 0
  const biJie = get('比肩') + get('劫财')
  const shiShang = get('食神') + get('伤官')
  const caiXing = get('正财') + get('偏财')
  const guanSha = get('正官') + get('七杀')
  const yinXing = get('正印') + get('偏印')

  const wuxingEntries = Object.entries(wuxingScore).sort((a, b) => b[1] - a[1])
  const maxWuxingScore = wuxingEntries[0]?.[1] ?? 0
  const minWuxingScore = wuxingEntries[wuxingEntries.length - 1]?.[1] ?? 0
  const wuxingSpread = maxWuxingScore - minWuxingScore

  // 稀有型判定：触发特殊结构信号（优先于常规型）
  if (!hasHour && yinXing >= 2 && shiShang <= 1 && caiXing <= 1) {
    return getBztiType('RARE-GHOST')!
  }
  if (riZhuStrength === '身弱' && yinXing >= 3 && wuxingSpread >= 35 && dominantWuxing === riWuxing) {
    return getBztiType('RARE-SEED')!
  }
  if (guanSha >= 4 && riZhuStrength === '身旺' && (wuxingScore['金'] ?? 0) >= 30) {
    return getBztiType('RARE-STORM')!
  }
  if (hasGanHe && hasZhiHe && biJie >= 2 && caiXing >= 2 && riZhuStrength === '身弱') {
    return getBztiType('RARE-LUCK')!
  }

  // 常规型判定：按出现概率与特征强度顺序匹配

  // WOLF：七杀旺且比劫少（必须在 MOVE/LION 之前，否则会被官杀旺的规则截走）
  if (get('七杀') >= 2 && biJie <= 1 && riZhuStrength === '身弱') {
    return getBztiType('WOLF')!
  }

  // FIRE：火旺或食伤旺且身强
  if ((dominantWuxing === '火' && (wuxingScore['火'] ?? 0) >= 30) || (shiShang >= 3 && riZhuStrength === '身旺')) {
    return getBztiType('FIRE')!
  }

  // WAVE：水旺且身弱/印旺
  if (dominantWuxing === '水' && (wuxingScore['水'] ?? 0) >= 28 && (riZhuStrength === '身弱' || yinXing >= 2)) {
    return getBztiType('WAVE')!
  }

  // ROOT：土旺或比劫旺且身旺
  if ((dominantWuxing === '土' && (wuxingScore['土'] ?? 0) >= 28) || (biJie >= 3 && riZhuStrength === '身旺')) {
    return getBztiType('ROOT')!
  }

  // EDGE：金旺或官杀旺且身强
  if ((dominantWuxing === '金' && (wuxingScore['金'] ?? 0) >= 25) || (guanSha >= 3 && riZhuStrength === '身旺')) {
    return getBztiType('EDGE')!
  }

  // SOLO：比劫为最高且无明显财官
  if ((top2.includes('比肩') || top2.includes('劫财')) && caiXing <= 1 && guanSha <= 1) {
    return getBztiType('SOLO')!
  }

  // LINK：财官两旺
  if (caiXing >= 2 && guanSha >= 2) {
    return getBztiType('LINK')!
  }

  // HOST：正印旺或食伤生财流通
  if (get('正印') >= 2 || (shiShang >= 2 && caiXing >= 2 && top3.includes('正印'))) {
    return getBztiType('HOST')!
  }

  // VIBE：食伤旺且财旺
  if (shiShang >= 3 && caiXing >= 2) {
    return getBztiType('VIBE')!
  }

  // MAKE：伤官或食神单一最旺
  if (top2.includes('伤官') || top2.includes('食神')) {
    return getBztiType('MAKE')!
  }

  // COAL：食伤泄秀且身弱（在身弱规则之前）
  if (shiShang >= 3 && riZhuStrength === '身弱') {
    return getBztiType('COAL')!
  }

  // MOVE：官杀旺或七杀格/正官格
  if (guanSha >= 3 || geju.includes('七杀格') || geju.includes('正官格')) {
    return getBztiType('MOVE')!
  }

  // LION：官杀旺且身旺
  if (guanSha >= 2 && riZhuStrength === '身旺') {
    return getBztiType('LION')!
  }

  // STAY：正印格或偏印格且身旺
  if ((geju.includes('正印格') || geju.includes('偏印格')) && riZhuStrength === '身旺') {
    return getBztiType('STAY')!
  }

  // TEST：偏印旺或身弱
  if (get('偏印') >= 2 || (riZhuStrength === '身弱' && yinXing >= 2)) {
    return getBztiType('TEST')!
  }

  // OWL：偏印最旺
  if (top2.includes('偏印')) {
    return getBztiType('OWL')!
  }

  // SWAN：财官印流通
  if (caiXing >= 1 && guanSha >= 1 && yinXing >= 1 && wuxingSpread <= 25) {
    return getBztiType('SWAN')!
  }

  // MINT：金水旺
  if (((wuxingScore['金'] ?? 0) >= 20 && (wuxingScore['水'] ?? 0) >= 20) || (dominantWuxing === '水' && (wuxingScore['金'] ?? 0) >= 18)) {
    return getBztiType('MINT')!
  }

  // INK：正印最旺
  if (top2.includes('正印')) {
    return getBztiType('INK')!
  }

  // SPARK：伤官生财
  if (get('伤官') >= 2 && caiXing >= 2) {
    return getBztiType('SPARK')!
  }

  // MIRROR：财星杂多
  if (caiXing >= 3) {
    return getBztiType('MIRROR')!
  }

  // SMOKE：水木旺且身弱
  if (((wuxingScore['水'] ?? 0) >= 22 && (wuxingScore['木'] ?? 0) >= 22) || (dominantWuxing === '水' && (wuxingScore['木'] ?? 0) >= 20 && riZhuStrength === '身弱')) {
    return getBztiType('SMOKE')!
  }

  // RIVER：水旺且身旺
  if (dominantWuxing === '水' && riZhuStrength === '身旺') {
    return getBztiType('RIVER')!
  }

  // FLINT：金火组合
  if (((wuxingScore['金'] ?? 0) >= 20 && (wuxingScore['火'] ?? 0) >= 20) || (riWuxing === '金' && (wuxingScore['火'] ?? 0) >= 18)) {
    return getBztiType('FLINT')!
  }

  // 兜底：根据五行强弱分配
  if (dominantWuxing === '木') return getBztiType('ROOT')!
  if (dominantWuxing === '火') return getBztiType('FIRE')!
  if (dominantWuxing === '土') return getBztiType('ROOT')!
  if (dominantWuxing === '金') return getBztiType('EDGE')!
  return getBztiType('WAVE')!
}

/** 根据四柱天干地支计算是否有合 */
export function computeBztiStructuralSignals(
  pillars: { gan: string; zhi: string }[],
  riZhu: TianGan,
  monthZhi: DiZhi,
  monthWuxing: string,
  riZhuStrength: string,
  geju: string,
  wuxingScore: Record<string, number>,
  shishenCounts: Record<string, number>,
  hasHour: boolean,
): BztiSignals {
  const gans = pillars.map(p => p.gan)
  const zhis = pillars.map(p => p.zhi)
  const wuxingEntries = Object.entries(wuxingScore).sort((a, b) => b[1] - a[1])
  const riWuxing = GAN_WUXING[riZhu] ?? '木'

  return {
    riZhuStrength,
    riZhu,
    monthZhi,
    monthWuxing,
    shishenCounts,
    wuxingScore,
    geju,
    dominantWuxing: wuxingEntries[0]?.[0] ?? '木',
    weakestWuxing: wuxingEntries[wuxingEntries.length - 1]?.[0] ?? '木',
    riWuxing,
    hasHour,
    hasGanHe: hasGanCombination(gans),
    hasZhiHe: hasZhiCombination(zhis),
  }
}
