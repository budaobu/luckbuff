import { randomBytes, randomInt } from 'node:crypto'
import type {
  AstroDiceCalcResult,
  AstroDiceDignityType,
  AstroDiceElement,
  AstroDiceFace,
  AstroDiceGrade,
} from '~/types/astro-dice'

/* ---------- 静态骰面表（12 行星 / 12 星座 / 12 宫位） ---------- */

const PLANETS: AstroDiceFace[] = [
  { key: 'sun', glyph: '☉', nameZh: '太阳', nameTw: '太陽', nameEn: 'Sun', keywordZh: '自我·意志', keywordTw: '自我·意志', keywordEn: 'Self & will' },
  { key: 'moon', glyph: '☽', nameZh: '月亮', nameTw: '月亮', nameEn: 'Moon', keywordZh: '情绪·直觉', keywordTw: '情緒·直覺', keywordEn: 'Emotion & instinct' },
  { key: 'mercury', glyph: '☿', nameZh: '水星', nameTw: '水星', nameEn: 'Mercury', keywordZh: '沟通·思考', keywordTw: '溝通·思考', keywordEn: 'Mind & message' },
  { key: 'venus', glyph: '♀', nameZh: '金星', nameTw: '金星', nameEn: 'Venus', keywordZh: '爱与美感', keywordTw: '愛與美感', keywordEn: 'Love & beauty' },
  { key: 'mars', glyph: '♂', nameZh: '火星', nameTw: '火星', nameEn: 'Mars', keywordZh: '行动·欲望', keywordTw: '行動·慾望', keywordEn: 'Drive & desire' },
  { key: 'jupiter', glyph: '♃', nameZh: '木星', nameTw: '木星', nameEn: 'Jupiter', keywordZh: '扩张·幸运', keywordTw: '擴張·幸運', keywordEn: 'Growth & luck' },
  { key: 'saturn', glyph: '♄', nameZh: '土星', nameTw: '土星', nameEn: 'Saturn', keywordZh: '责任·边界', keywordTw: '責任·邊界', keywordEn: 'Duty & limits' },
  { key: 'uranus', glyph: '♅', nameZh: '天王星', nameTw: '天王星', nameEn: 'Uranus', keywordZh: '突变·革新', keywordTw: '突變·革新', keywordEn: 'Change & revolt' },
  { key: 'neptune', glyph: '♆', nameZh: '海王星', nameTw: '海王星', nameEn: 'Neptune', keywordZh: '梦想·消融', keywordTw: '夢想·消融', keywordEn: 'Dreams & haze' },
  { key: 'pluto', glyph: '♇', nameZh: '冥王星', nameTw: '冥王星', nameEn: 'Pluto', keywordZh: '蜕变·重生', keywordTw: '蛻變·重生', keywordEn: 'Deep rebirth' },
  { key: 'northNode', glyph: '☊', nameZh: '北交点', nameTw: '北交點', nameEn: 'North Node', keywordZh: '成长方向', keywordTw: '成長方向', keywordEn: 'Path forward' },
  { key: 'southNode', glyph: '☋', nameZh: '南交点', nameTw: '南交點', nameEn: 'South Node', keywordZh: '惯性模式', keywordTw: '慣性模式', keywordEn: 'Old patterns' },
]

const SIGNS: AstroDiceFace[] = [
  { key: 'aries', glyph: '♈', nameZh: '白羊座', nameTw: '牡羊座', nameEn: 'Aries', keywordZh: '开拓·冲劲', keywordTw: '開拓·衝勁', keywordEn: 'Pioneering spark' },
  { key: 'taurus', glyph: '♉', nameZh: '金牛座', nameTw: '金牛座', nameEn: 'Taurus', keywordZh: '稳定·感官', keywordTw: '穩定·感官', keywordEn: 'Steady senses' },
  { key: 'gemini', glyph: '♊', nameZh: '双子座', nameTw: '雙子座', nameEn: 'Gemini', keywordZh: '好奇·交流', keywordTw: '好奇·交流', keywordEn: 'Curious exchange' },
  { key: 'cancer', glyph: '♋', nameZh: '巨蟹座', nameTw: '巨蟹座', nameEn: 'Cancer', keywordZh: '守护·敏感', keywordTw: '守護·敏感', keywordEn: 'Tender shelter' },
  { key: 'leo', glyph: '♌', nameZh: '狮子座', nameTw: '獅子座', nameEn: 'Leo', keywordZh: '表现·自信', keywordTw: '表現·自信', keywordEn: 'Radiant pride' },
  { key: 'virgo', glyph: '♍', nameZh: '处女座', nameTw: '處女座', nameEn: 'Virgo', keywordZh: '条理·服务', keywordTw: '條理·服務', keywordEn: 'Order & service' },
  { key: 'libra', glyph: '♎', nameZh: '天秤座', nameTw: '天秤座', nameEn: 'Libra', keywordZh: '平衡·关系', keywordTw: '平衡·關係', keywordEn: 'Balance & ties' },
  { key: 'scorpio', glyph: '♏', nameZh: '天蝎座', nameTw: '天蠍座', nameEn: 'Scorpio', keywordZh: '深刻·掌控', keywordTw: '深刻·掌控', keywordEn: 'Depth & control' },
  { key: 'sagittarius', glyph: '♐', nameZh: '射手座', nameTw: '射手座', nameEn: 'Sagittarius', keywordZh: '探索·信念', keywordTw: '探索·信念', keywordEn: 'Quest & faith' },
  { key: 'capricorn', glyph: '♑', nameZh: '摩羯座', nameTw: '摩羯座', nameEn: 'Capricorn', keywordZh: '野心·纪律', keywordTw: '野心·紀律', keywordEn: 'Ambition & grit' },
  { key: 'aquarius', glyph: '♒', nameZh: '水瓶座', nameTw: '水瓶座', nameEn: 'Aquarius', keywordZh: '独立·前卫', keywordTw: '獨立·前衛', keywordEn: 'Free & ahead' },
  { key: 'pisces', glyph: '♓', nameZh: '双鱼座', nameTw: '雙魚座', nameEn: 'Pisces', keywordZh: '共情·想象', keywordTw: '共情·想象', keywordEn: 'Empathy & dream' },
]

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫']
const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
const EN_ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
const HOUSE_KEYWORDS_ZH = ['自我·形象', '金钱·价值', '沟通·学习', '家庭·根基', '恋爱·创造', '工作·健康', '伴侣·合作', '亲密·转化', '远行·信仰', '事业·声望', '社群·愿景', '潜意识·疗愈']
const HOUSE_KEYWORDS_TW = ['自我·形象', '金錢·價值', '溝通·學習', '家庭·根基', '戀愛·創造', '工作·健康', '伴侶·合作', '親密·轉化', '遠行·信仰', '事業·聲望', '社群·願景', '潛意識·療癒']
const HOUSE_KEYWORDS_EN = ['Self & image', 'Money & worth', 'Talk & learning', 'Home & roots', 'Love & play', 'Work & health', 'Partner & pact', 'Intimacy & change', 'Travel & faith', 'Career & fame', 'Community & vision', 'Soul & healing']

const HOUSES: AstroDiceFace[] = CIRCLED.map((glyph, i) => ({
  key: `house${i + 1}`,
  glyph,
  nameZh: `第${CN_NUM[i]}宫`,
  nameTw: `第${CN_NUM[i]}宮`,
  nameEn: `${EN_ORD[i]} House`,
  keywordZh: HOUSE_KEYWORDS_ZH[i]!,
  keywordTw: HOUSE_KEYWORDS_TW[i]!,
  keywordEn: HOUSE_KEYWORDS_EN[i]!,
}))

/* ---------- 守护 / 擢升表（星座索引 0=白羊 … 11=双鱼） ---------- */

// 传统七曜用古典守护，外行星用现代守护；南北交点不参与庙旺
const DOMICILE: Record<string, number[]> = {
  sun: [4], moon: [3], mercury: [2, 5], venus: [1, 6], mars: [0, 7],
  jupiter: [8, 11], saturn: [9, 10], uranus: [10], neptune: [11], pluto: [7],
  northNode: [], southNode: [],
}

// 擢升/落陷只取古典七曜，外行星与交点的擢升各家说法不一，不纳入
const EXALTATION: Record<string, number[]> = {
  sun: [0], moon: [1], mercury: [5], venus: [11], mars: [9], jupiter: [3], saturn: [6],
}

// 行星喜乐宫（希腊占星的 joy 传统，1 起）
const PLANET_JOY: Record<string, number> = {
  mercury: 1, moon: 3, venus: 5, mars: 6, sun: 9, jupiter: 11, saturn: 12,
}

/* ---------- 打分 ---------- */

const ELEMENT_OF_SIGN: AstroDiceElement[] = [
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
]

const ELEMENT_CN: Record<AstroDiceElement, string> = { fire: '火', earth: '土', air: '风', water: '水' }

const LUCKY_BY_ELEMENT: Record<AstroDiceElement, { color: string, direction: string }> = {
  fire: { color: '绯红', direction: '南' },
  earth: { color: '姜黄', direction: '西南' },
  air: { color: '月白', direction: '西' },
  water: { color: '黛蓝', direction: '北' },
}

function opposite(signIdx: number): number {
  return (signIdx + 6) % 12
}

function resolveDignity(planetKey: string, signIdx: number): { type: AstroDiceDignityType, delta: number } {
  if ((DOMICILE[planetKey] ?? []).includes(signIdx)) return { type: 'domicile', delta: 18 }
  if ((EXALTATION[planetKey] ?? []).includes(signIdx)) return { type: 'exaltation', delta: 14 }
  if ((DOMICILE[planetKey] ?? []).some(d => opposite(d) === signIdx)) return { type: 'detriment', delta: -12 }
  if ((EXALTATION[planetKey] ?? []).some(e => opposite(e) === signIdx)) return { type: 'fall', delta: -10 }
  return { type: 'neutral', delta: 0 }
}

const DIGNITY_LABEL: Record<AstroDiceDignityType, string> = {
  domicile: '入庙',
  exaltation: '擢升',
  detriment: '失势',
  fall: '落陷',
  neutral: '平和',
}

export default defineEventHandler(async (event): Promise<AstroDiceCalcResult> => {
  const body = await readBody<{ locale?: string }>(event).catch(() => null)
  const locale = typeof body?.locale === 'string' ? body.locale : 'zh-CN'

  // 服务端密码学随机，客户端不可预测、不可重放
  const planet = PLANETS[randomInt(PLANETS.length)]!
  const sign = SIGNS[randomInt(SIGNS.length)]!
  const house = HOUSES[randomInt(HOUSES.length)]!
  const seed = randomBytes(16).toString('hex')

  const signIdx = SIGNS.indexOf(sign)
  const houseNum = HOUSES.indexOf(house) + 1

  const factors: AstroDiceCalcResult['factors'] = []
  let score = 50

  const dignity = resolveDignity(planet.key, signIdx)
  if (dignity.delta !== 0) {
    score += dignity.delta
    factors.push({ key: 'dignity', label: `${planet.nameZh}于${sign.nameZh}${DIGNITY_LABEL[dignity.type]}`, delta: dignity.delta })
  }

  // 宫位强度：角宫最强、续宫次之、果宫平和
  let houseDelta = 0
  let houseLabel = ''
  if ([1, 4, 7, 10].includes(houseNum)) {
    houseDelta = 10
    houseLabel = `${house.nameZh}为角宫，能量外显`
  }
  else if ([2, 5, 8, 11].includes(houseNum)) {
    houseDelta = 5
    houseLabel = `${house.nameZh}为续宫，能量内蓄`
  }
  if (houseDelta) {
    score += houseDelta
    factors.push({ key: 'house-strength', label: houseLabel, delta: houseDelta })
  }

  const joy = PLANET_JOY[planet.key]
  if (joy === houseNum) {
    score += 6
    factors.push({ key: 'joy', label: `${planet.nameZh}喜居${house.nameZh}`, delta: 6 })
  }

  const signElement = ELEMENT_OF_SIGN[signIdx]!
  const houseElement = ELEMENT_OF_SIGN[(houseNum - 1) % 12]!
  if (signElement === houseElement) {
    score += 5
    factors.push({ key: 'element-same', label: `星座与宫位同属${ELEMENT_CN[signElement]}元素`, delta: 5 })
  }
  else if (
    (signElement === 'fire' && houseElement === 'air')
    || (signElement === 'air' && houseElement === 'fire')
    || (signElement === 'earth' && houseElement === 'water')
    || (signElement === 'water' && houseElement === 'earth')
  ) {
    score += 2
    factors.push({ key: 'element-compat', label: `${ELEMENT_CN[signElement]}象与${ELEMENT_CN[houseElement]}象宫位相生`, delta: 2 })
  }

  score = Math.max(5, Math.min(98, score))

  let grade: AstroDiceGrade = 'ping'
  if (score >= 78) grade = 'daji'
  else if (score >= 62) grade = 'ji'
  else if (score < 42) grade = 'xiong'

  const lucky = LUCKY_BY_ELEMENT[signElement]!

  return {
    planet,
    sign,
    house,
    dignity: { type: dignity.type, label: DIGNITY_LABEL[dignity.type] },
    score,
    grade,
    factors,
    lucky: { element: signElement, color: lucky.color, direction: lucky.direction },
    seed,
    locale,
    generatedAt: new Date().toISOString(),
  }
})
