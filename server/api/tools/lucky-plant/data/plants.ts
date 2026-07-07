export type Wuxing = '木' | '火' | '土' | '金' | '水'

export interface Plant {
  id: string
  name: string
  element: Wuxing
  tags: string[]
  meaning: string
  care: string
  wealthBoost: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface PlantRecommendation extends Plant {
  matchReason: string
}

export const PLANTS: Plant[] = [
  {
    id: 'money-tree',
    name: '发财树',
    element: '木',
    tags: ['旺财', '招财', '乔迁'],
    meaning: '树形似伞盖，叶片如手掌，传统认为能聚拢财气、招引贵人，是商铺与客厅的经典旺财植物。',
    care: '喜散射光，忌积水；春秋保持土壤微润，冬季减少浇水，每月施一次稀薄液肥。',
    wealthBoost: 95,
    difficulty: 'easy',
  },
  {
    id: 'lucky-bamboo',
    name: '富贵竹',
    element: '木',
    tags: ['开运', '节节高', '文昌'],
    meaning: '茎节分明象征步步高升，水培清雅又寓意财源滚滚，适合书桌、玄关与文昌位。',
    care: '水培每 7~10 天换水一次，避免阳光直射；土培保持土壤湿润但不积水。',
    wealthBoost: 85,
    difficulty: 'easy',
  },
  {
    id: 'pothos',
    name: '绿萝',
    element: '木',
    tags: ['净化', '生旺', '耐阴'],
    meaning: '藤蔓绵延代表生机不断，能柔化尖角煞气，也能为阴暗角落带来生气与财运。',
    care: '极耐阴，忌暴晒；土干即浇，偶尔喷水增湿，生长快可常修剪。',
    wealthBoost: 70,
    difficulty: 'easy',
  },
  {
    id: 'anthurium',
    name: '红掌',
    element: '火',
    tags: ['红火', '喜庆', '人缘'],
    meaning: '心形红花配蜡绿叶，象征热情与财运红火，利于提升人际与正偏财机会。',
    care: '喜明亮散射光，忌强光直射；保持土壤湿润，空气湿度 60% 以上开花更艳。',
    wealthBoost: 88,
    difficulty: 'medium',
  },
  {
    id: 'guzmania',
    name: '鸿运当头',
    element: '火',
    tags: ['转运', '开运', '喜庆'],
    meaning: '花心艳红如火炬，寓意时来运转、鸿运高照，适合放在客厅显眼处催旺气场。',
    care: '喜半阴与湿润环境；叶杯内保持少量清水，避免积水烂根，冬季注意保温。',
    wealthBoost: 90,
    difficulty: 'medium',
  },
  {
    id: 'zz-plant',
    name: '金钱树',
    element: '土',
    tags: ['聚财', '稳健', '守财'],
    meaning: '叶片厚实如钱币串生，象征财富积累与守财能力，适合放在财位或办公桌上。',
    care: '耐旱怕涝，宁干勿湿；喜散射光，冬季控水，春秋季各施一次缓释肥。',
    wealthBoost: 92,
    difficulty: 'easy',
  },
  {
    id: 'snake-plant',
    name: '虎尾兰',
    element: '土',
    tags: ['化煞', '净化', '稳健'],
    meaning: '剑叶挺拔可化解冲煞，夜间释放氧气，象征坚韧与稳定的财库能量。',
    care: '极耐旱，少浇水；喜光也耐阴，土壤透气即可，冬季保持 10°C 以上。',
    wealthBoost: 75,
    difficulty: 'easy',
  },
  {
    id: 'peace-lily',
    name: '白掌',
    element: '金',
    tags: ['平安', '顺遂', '净化'],
    meaning: '白色佛焰苞形似帆船，寓意一帆风顺、事业平顺，能平和气场并转化负能量。',
    care: '喜半阴，忌强光；保持土壤微润，干燥时叶片会下垂提醒浇水，定期喷水。',
    wealthBoost: 78,
    difficulty: 'easy',
  },
  {
    id: 'silver-queen',
    name: '银皇后',
    element: '金',
    tags: ['聚气', '净化', '雅致'],
    meaning: '银白叶脉如财气流动，被认为能聚敛财气、提升空间质感，适合现代家居与办公室。',
    care: '喜明亮散射光，忌烈日；保持土壤微湿，空气干燥时经常喷雾。',
    wealthBoost: 72,
    difficulty: 'medium',
  },
  {
    id: 'coin-plant',
    name: '铜钱草',
    element: '水',
    tags: ['聚财', '圆润', '生机'],
    meaning: '圆叶如铜钱，寓意财源滚滚、圆满和谐，水培更显「水生财」的意象。',
    care: '喜水喜光，可半土半水养护；保证充足光照叶片更圆，缺水易萎蔫。',
    wealthBoost: 86,
    difficulty: 'easy',
  },
  {
    id: 'narcissus',
    name: '水仙',
    element: '水',
    tags: ['清雅', '开运', '年节'],
    meaning: '凌波仙子象征智慧与清贵，年节摆放可催旺人气与正财，适合入门玄关或客厅。',
    care: '水培需勤换水，避免温度过高导致徒长；开花后移到阴凉处延长花期。',
    wealthBoost: 68,
    difficulty: 'medium',
  },
  {
    id: 'jade-plant',
    name: '玉树',
    element: '土',
    tags: ['守财', '长寿', '多肉'],
    meaning: '肉质叶片饱满如元宝，象征财富饱满、家宅安稳，是老一辈最喜爱的「镇宅财树」。',
    care: '喜光耐旱，土干透再浇；夏季遮阴控水，冬季保持温暖，少施肥。',
    wealthBoost: 80,
    difficulty: 'easy',
  },
]

export const WUXING_LABELS: Record<Wuxing, string> = {
  木: '木',
  火: '火',
  土: '土',
  金: '金',
  水: '水',
}

export const SEASON_NAMES: Record<string, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

export const WUXING_SHENG: Record<Wuxing, Wuxing> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
}

export function getSeasonFromMonth(month: number): { season: string; element: Wuxing } {
  // 按节气大致划分：2-4 春木、5-7 夏火、8-10 秋金、11-1 冬水
  if (month >= 2 && month <= 4) return { season: 'spring', element: '木' }
  if (month >= 5 && month <= 7) return { season: 'summer', element: '火' }
  if (month >= 8 && month <= 10) return { season: 'autumn', element: '金' }
  return { season: 'winter', element: '水' }
}

export function deriveXiYong(element: Wuxing): Wuxing {
  // 简化的「泄秀」喜用：旺则宜泄
  return WUXING_SHENG[element]
}

export function derivePlants(xiYong: Wuxing, placement?: string): PlantRecommendation[] {
  const sheng = Object.entries(WUXING_SHENG).find(([, v]) => v === xiYong)?.[0] as Wuxing | undefined

  const scored = PLANTS.map((plant) => {
    let score = plant.wealthBoost
    let matchReason = `五行属${plant.element}，与你的整体气场相协调。`

    if (plant.element === xiYong) {
      score += 30
      matchReason = `五行属${plant.element}，正是你当前喜用之元素，最能补益气场、催旺财运。`
    }
    else if (sheng && plant.element === sheng) {
      score += 15
      matchReason = `五行属${plant.element}，生助你的喜用元素，能带来持续稳定的生旺之气。`
    }

    if (placement) {
      const p = placement.toLowerCase()
      if (p.includes('财') || p.includes('办公')) {
        if (plant.tags.includes('旺财') || plant.tags.includes('聚财') || plant.tags.includes('稳健')) {
          score += 8
          matchReason += '适合财位或办公场景，有助于聚财守财。'
        }
      }
      if (p.includes('客') || p.includes('厅')) {
        if (plant.tags.includes('喜庆') || plant.tags.includes('开运')) {
          score += 5
          matchReason += '摆放在客厅可提升家宅整体气场。'
        }
      }
      if (p.includes('卧')) {
        if (plant.tags.includes('净化') || plant.tags.includes('平安')) {
          score += 5
          matchReason += '夜间释放氧气或净化能力强，适合卧室。'
        }
      }
      if (p.includes('阳')) {
        if (plant.difficulty === 'easy' && (plant.element === '火' || plant.element === '木')) {
          score += 5
          matchReason += '喜光耐养，适合光照充足的阳台。'
        }
      }
    }

    return { ...plant, matchReason, score }
  })

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const diffMap = { easy: 0, medium: 1, hard: 2 }
    return diffMap[a.difficulty] - diffMap[b.difficulty]
  })

  return scored.slice(0, 5).map(({ score: _score, ...rest }) => rest)
}
