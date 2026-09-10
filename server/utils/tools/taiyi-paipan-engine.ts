import { Solar } from 'lunar-javascript'
import type {
  TaiyiAcumMethod,
  TaiyiJiStyle,
  TaiyiPaipanPalace,
} from '~~/app/types/taiyi-paipan'
import {
  CHEN_TO_GONG,
  TAIYI_DI_ZHI,
  DOORS,
  EARTH_YI,
  ELEMENT_BY_GAN_ZHI,
  FOUR_GOD,
  NAYIN_ELEMENT,
  NUM_RING,
  NUM_TO_GONG,
  OFFICER_BASE,
  SHI_JI_BY_JU,
  SIXTEEN,
  SKY_YI,
  SOLAR_TERM_GROUPS,
  TAIYI_TIAN_GAN,
  TWENTY_EIGHT_XIU,
  WANG_ZHUAI,
  WANG_ZHUAI_PALACES,
  WENCHANG_BY_JU,
  WENCHANG_STATE,
  XIU_BY_CHEN,
  YANG_CALCULATION,
  YIN_CALCULATION,
  ZHI_FU,
} from './taiyi-paipan-constants'
import {
  calculationMeanings,
  chineseNumber,
  cycleValue,
  guaName,
  mod,
  modOrOne,
  rotate,
} from './taiyi-paipan-utils'

const METHOD_NAMES: Record<TaiyiAcumMethod, string> = {
  0: '太乙统宗',
  1: '太乙金镜',
  2: '太乙淘金歌',
  3: '太乙局',
}

const METHOD_ACCUMULATION = {
  0: 10153917,
  1: 1936557,
  2: 10154193,
  3: 10153917,
} as const satisfies Record<TaiyiAcumMethod, number>

const OPPOSITE_PALACE: Record<number, number> = { 1: 9, 9: 1, 2: 8, 8: 2, 3: 7, 7: 3, 4: 6, 6: 4 }

export interface TaiyiPaipanEngineInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  jiStyle: TaiyiJiStyle
  method: TaiyiAcumMethod
}

export interface TaiyiEngineResult {
  accNumber: number
  dunType: 'yang' | 'yin'
  dunTypeText: string
  juNumber: number
  juText: string
  sancai: string
  jiyuan: string
  fiveYuanJu: string
  taiSui: string
  heGod: string
  jiGod: string
  taiyiPalace: number
  taiyiPalaceName: string
  taiyiHomeAway: string
  wenchang: string
  wenchangState: string
  shiji: string
  shijiXiu: string
  dingMu: string
  yearXiu: string
  home: { value: number, descriptions: string[], general: number, viceGeneral: number }
  away: { value: number, descriptions: string[], general: number, viceGeneral: number }
  fixed: { value: number, descriptions: string[], general: number, viceGeneral: number }
  kingBase: string
  officerBase: string
  peopleBase: string
  fourGod: string
  skyYi: string
  earthYi: string
  zhiFu: string
  flyFu: string
  fiveFortune: string
  doorValue: string
  doors: Record<number, string>
  threeDoors: string
  fiveGenerals: string
  homeAwayRelation: string
  victoryJudgement: string
  yangJiu: string
  baiLiu: string
  yearGua: string
  dayGua: string
  hourGua: string
  palaces: TaiyiPaipanPalace[]
  patterns: Array<{ name: string, detail: string }>
}

export class TaiyiPaipanEngine {
  private lunarInstance: any

  constructor(private readonly input: TaiyiPaipanEngineInput, lunarInstance: any) {
    this.lunarInstance = lunarInstance
  }

  private get jiIndex() {
    return { year: 0, month: 1, day: 2, hour: 3 }[this.input.jiStyle]!
  }

  private get ganzhi() {
    const lunar = this.lunarInstance
    const beforeDay = this.input.hour >= 23 ? lunar.nextDay() : lunar
    return [
      lunar.getYearInGanZhi(),
      lunar.getMonthInGanZhi(),
      beforeDay.getDayInGanZhi(),
      lunar.getTimeInGanZhi(),
    ] as const
  }

  private daysFrom(reference: { year: number, month: number, day: number }) {
    const current = Solar.fromYmdHms(
      this.input.year, this.input.month, this.input.day, this.input.hour, this.input.minute, 0,
    )
    const ref = Solar.fromYmd(reference.year, reference.month, reference.day)
    return Math.round(current.getJulianDay() - ref.getJulianDay())
  }

  private get lunarDate() {
    return {
      year: Number(this.lunarInstance.getYear()),
      month: Math.abs(Number(this.lunarInstance.getMonth())),
      day: Number(this.lunarInstance.getDay()),
    }
  }

  accNumber() {
    return this.accNumberFor(this.input.jiStyle)
  }

  private accNumberFor(jiStyle: TaiyiJiStyle) {
    const { method } = this.input
    const lunar = this.lunarDate
    if (jiStyle === 'year') return METHOD_ACCUMULATION[method] + lunar.year + (lunar.year < 0 ? 1 : 0)
    if (jiStyle === 'month') {
      const accYear = METHOD_ACCUMULATION[method] + lunar.year - 1 + (lunar.year < 0 ? 2 : 0)
      return accYear * 12 + 2 + lunar.month
    }
    if (jiStyle === 'day') {
      const config = 708011105 - method - [185, 185, 183, 182][method]!
      if (method === 3) return Math.round((lunar.year - 423) * (235 / 19) * 29.5306 + lunar.day)
      const base = config + this.daysFrom({ year: 1900, month: 6, day: 19 })
      if (method !== 0) return base
      const dayIndex = this.jiaziIndex(this.ganzhi[2])
      return base + mod(dayIndex - mod(base, 60), 60)
    }
    const config = 708011105 - [0, METHOD_ACCUMULATION[1], METHOD_ACCUMULATION[2], 0][method]!
    const accDay = config + this.daysFrom({ year: 1900, month: 12, day: 21 })
    return (accDay - 1) * 12 + Math.floor((this.input.hour + 1) / 2) + (method === 1 ? 13 : 1)
  }

  private jiaziIndex(ganZhi: string) {
    const index = TAIYI_TIAN_GAN.indexOf(ganZhi[0] as any)
    const zhiIndex = TAIYI_DI_ZHI.indexOf(ganZhi[1] as any)
    return mod(6 * index - 5 * zhiIndex, 60) + 1
  }

  kook() {
    const acc = this.accNumber()
    const ju = modOrOne(acc, 72)
    const term = this.currentTerm()
    let dun: 'yang' | 'yin' = this.input.jiStyle === 'hour' ? (term.half === 'winter' ? 'yang' : 'yin') : 'yang'
    const dunText = dun === 'yang' ? '阳遁' : '阴遁'
    return {
      dunType: dun,
      dunTypeText: dunText,
      juNumber: ju,
      juText: `${dunText}${chineseNumber(ju)}局`,
      sancai: ['理天', '理地', '理人'][(ju - 1) % 3]!,
      accNumber: acc,
    }
  }

  private currentTerm() {
    const term = this.lunarInstance.getJieQi() || this.lunarInstance.getPrevJieQi(true).getName()
    const yang = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种']
    return { name: term, half: yang.includes(term) ? ('winter' as const) : ('summer' as const) }
  }

  jiyuan() {
    const acc = this.accNumber()
    const cnum = [...'一二三四五六']
    const accRemainder = mod(acc, 360)
    let jiNumber = accRemainder === 1 ? 1 : Math.floor(accRemainder / 60) + 1
    if (jiNumber > 6) jiNumber -= 6
    let yuanNumber = Math.floor(mod(mod(accRemainder, 72), 24) / 3) || 1
    if (yuanNumber > 6) yuanNumber -= 6
    const yuanIndex = Math.floor(accRemainder / 72) || 1
    const yuanGanZhi = this.jiaziList().filter((_, index) => index % 12 === 0)[yuanIndex - 1] || '甲子'
    return `第${cnum[jiNumber - 1]!}纪第${cnum[yuanNumber - 1]!}${yuanGanZhi}元`
  }

  fiveYuanJu() {
    const kook = this.kook()
    const ganZhi = this.ganzhi[this.jiIndex]
    const heads = ['甲子', '丙子', '戊子', '庚子', '壬子']
    const startNumbers = [1, 73, 145, 217, 289]
    for (let index = 0; index < heads.length; index += 1) {
      const ring = rotate(this.jiaziList(), heads[index]!)
      const candidate = ring[(kook.juNumber - 1) % 72]
      if (candidate === ganZhi) return `${chineseNumber(startNumbers[index]! + kook.juNumber - 1)}局`
    }
    return `${kook.juText}局`
  }

  private jiaziList() {
    return Array.from({ length: 60 }, (_, index) => `${TAIYI_TIAN_GAN[index % 10]!}${TAIYI_DI_ZHI[index % 12]!}`)
  }

  taiSui() {
    return this.ganzhi[this.jiIndex][1]!
  }

  heGod() {
    return rotate([...TAIYI_DI_ZHI], '丑')[TAIYI_DI_ZHI.indexOf(this.taiSui() as any)]!
  }

  jiGod() {
    const dun = this.kook().dunType
    const source = dun === 'yang' ? rotate([...TAIYI_DI_ZHI].reverse(), '寅') : rotate([...TAIYI_DI_ZHI], '酉')
    return source[TAIYI_DI_ZHI.indexOf(this.taiSui() as any)]!
  }

  taiyiPalace() {
    const kook = this.kook()
    const yangCycle = [1, 2, 3, 4, 6, 7, 8, 9].flatMap(palace => [palace, palace, palace])
    const yinCycle = [9, 8, 7, 6, 4, 3, 2, 1].flatMap(palace => [palace, palace, palace])
    const cycle = kook.dunType === 'yang' ? yangCycle : yinCycle
    return cycle[(kook.juNumber - 1) % 24]!
  }

  wenchang() {
    const kook = this.kook()
    return WENCHANG_BY_JU[kook.dunType]![kook.juNumber - 1]!
  }

  wenchangState() {
    const kook = this.kook()
    return WENCHANG_STATE[kook.dunType]![kook.juNumber - 1] || ''
  }

  shiji() {
    return SHI_JI_BY_JU[this.kook().juNumber - 1]!
  }

  yearXiu() {
    const year = this.lunarDate.year
    const lunarMonth = Number(this.lunarInstance.getMonth())
    const adjustedYear = (lunarMonth === 11 || lunarMonth === 12)
      && this.currentTerm().name !== '立春' ? year - 1 : year
    return TWENTY_EIGHT_XIU[modOrOne(adjustedYear + 15, 28) - 1]!
  }

  shijiXiu() {
    const shiji = this.shiji()
    const shijiNumber = [...SIXTEEN].indexOf(shiji) + 1
    const shijiXiu = XIU_BY_CHEN[shiji] || ''
    const yearNumber = TWENTY_EIGHT_XIU.indexOf(this.yearXiu() as any) + 1
    return rotate([...TWENTY_EIGHT_XIU], shijiXiu as any)[modOrOne(yearNumber + shijiNumber, 28) - 1]!
  }

  dingMu() {
    const start = rotate([...SIXTEEN], this.heGod())
    const steps = start.indexOf(this.taiSui() as any)
    return rotate([...SIXTEEN], this.wenchang())[steps]!
  }

  private calculationTable() {
    const table = this.kook().dunType === 'yang' ? YANG_CALCULATION : YIN_CALCULATION
    return table[this.kook().juNumber - 1]!
  }

  homeCalculation() {
    return this.calculationTable()[0]!
  }

  awayCalculation() {
    return this.calculationTable()[1]!
  }

  fixedCalculation() {
    return this.calculationTable()[2]!
  }

  homeGeneral() {
    const value = this.calculationTable()[0]!
    if (value < 10) return value
    if (value % 10 === 0) return 1
    return value % 10
  }

  homeViceGeneral() {
    const value = mod(this.homeGeneral() * 3, 10)
    return value === 0 ? 5 : value
  }

  awayGeneral() {
    const value = this.calculationTable()[1]!
    const home = this.calculationTable()[0]!
    if (value === 1) return 1
    if (value < 10) return value
    if (value % 10 === 0) return home === 25 ? 1 : 5
    return value % 10
  }

  awayViceGeneral() {
    const value = mod(this.awayGeneral() * 3, 10)
    return value === 0 ? 5 : value
  }

  fixedGeneral() {
    const value = mod(this.calculationTable()[2]!, 10)
    return value === 0 ? 5 : value
  }

  fixedViceGeneral() {
    const value = mod(this.fixedGeneral() * 3, 10)
    return value === 0 ? 5 : value
  }

  kingBase() {
    return rotate([...TAIYI_DI_ZHI], '午')[Math.floor(modOrOne(this.accNumber() + 250, 360) / 30) - 1]!
  }

  officerBase() {
    return cycleValue(OFFICER_BASE, this.kook().juNumber)
  }

  peopleBase() {
    return cycleValue(rotate([...TAIYI_DI_ZHI], '申'), this.kook().juNumber)
  }

  fourGod() {
    return cycleValue(FOUR_GOD, this.kook().juNumber)
  }

  skyYi() {
    return cycleValue(SKY_YI, this.kook().juNumber)
  }

  earthYi() {
    return cycleValue(EARTH_YI, this.kook().juNumber)
  }

  zhiFu() {
    return cycleValue(ZHI_FU, this.kook().juNumber)
  }

  flyFu() {
    const slot = Math.trunc(mod(mod(this.accNumber(), 360), 36) / 3)
    return rotate([...TAIYI_DI_ZHI], '辰')[slot] || '中'
  }

  fiveFortune() {
    const acc = this.accNumber()
    const palace = [1, 3, 9, 7, 5][Math.floor(mod(acc + 250, 225) / 45)] || 1
    return NUM_TO_GONG[palace]!
  }

  doorValue() {
    return DOORS[Math.floor(mod(this.accNumber(), 240) / 30)] || DOORS[0]!
  }

  doors() {
    const taiyi = this.taiyiPalace()
    const palaceRing = rotate([...NUM_RING], taiyi)
    const doorRing = rotate([...DOORS], this.doorValue())
    return Object.fromEntries(palaceRing.map((palace, index) => [palace, doorRing[index]!])) as Record<number, string>
  }

  wangZhuai() {
    const term = this.currentTerm().name
    const group = SOLAR_TERM_GROUPS.find(([terms]) => terms.includes(term))
    const index = group ? SOLAR_TERM_GROUPS.indexOf(group) : 6
    return WANG_ZHUAI[WANG_ZHUAI_PALACES.indexOf(WANG_ZHUAI_PALACES[index]!)] || '囚'
  }

  palaceWangZhuai(palace: number) {
    const term = this.currentTerm().name
    const group = SOLAR_TERM_GROUPS.find(([terms]) => terms.includes(term))
    const wangPalace = group ? WANG_ZHUAI_PALACES[SOLAR_TERM_GROUPS.indexOf(group)]! : 1
    const index = WANG_ZHUAI_PALACES.indexOf(wangPalace)
    return WANG_ZHUAI[mod(index + WANG_ZHUAI_PALACES.indexOf(palace as any), 8)] || '囚'
  }

  threeDoors() {
    const door = this.doors()[this.taiyiPalace()]
    return door && ['休', '生', '开'].includes(door) ? '三门不具' : '三门具'
  }

  fiveGenerals() {
    if (!this.wenchangState() && this.homeGeneral() !== 5 && this.awayGeneral() !== 5) return '五将发'
    if (this.homeGeneral() === 5) return '主将主参不出中门，杜塞无门'
    if (this.awayGeneral() === 5) return '客将客参不出中门，杜塞无门'
    return `${this.wenchangState()}。五将不发`
  }

  homeAwayRelation() {
    const wenchangElement = ELEMENT_BY_GAN_ZHI[this.wenchang()] || ''
    const shijiElement = ELEMENT_BY_GAN_ZHI[this.shiji()] || ''
    const hourElement = NAYIN_ELEMENT.get(this.ganzhi[3]) || ''
    if (hourElement === wenchangElement) return '主关'
    if (hourElement === shijiElement) return '客关'
    return '关'
  }

  victoryJudgement() {
    const home = this.homeCalculation()
    const away = this.awayCalculation()
    if (away < home && this.homeGeneral() !== 5) return '客以少算临多，主人胜'
    if (away < home) return '主将不出中门，主客俱不利，和'
    if (away > home && this.awayGeneral() !== 5) return '客以多算临少，主人败'
    if (away > home) return '客将不出中门，主客俱不利，和'
    return '主客旗鼓相当'
  }

  yangJiu() {
    const year = this.lunarDate.year
    const remainder = mod(mod(mod(year + 12607, 4560), 456), 12)
    const branch = rotate([...TAIYI_DI_ZHI], '寅')[remainder === 0 ? 11 : remainder - 1]!
    return `阳九${branch}`
  }

  baiLiu() {
    const year = this.lunarDate.year
    let remainder = mod(mod(mod(year + 12607, 4320), 288), 24)
    const start = remainder > 12 ? '卯' : '酉'
    if (remainder > 12) remainder = mod(remainder - 12, 12)
    const branch = rotate([...TAIYI_DI_ZHI], start as any)[remainder === 0 ? 11 : remainder - 1]!
    return `百六${branch}`
  }

  yearGua() {
    return guaName(modOrOne(this.accNumberFor('year'), 64))
  }

  dayGua() {
    const remainder = mod(this.accNumberFor('month'), 646464)
    return guaName(mod(remainder, 20) || 64)
  }

  hourGua() {
    return guaName(modOrOne(this.accNumberFor('hour'), 64))
  }

  palaces() {
    const marks: Array<[TaiyiPaipanPalace['position'], string]> = [
      [this.wenchang(), '文昌'],
      [this.taiSui(), '太岁'],
      [this.heGod(), '合神'],
      [this.jiGod(), '计神'],
      [this.shiji(), '始击'],
      [this.dingMu(), '定目'],
      [this.kingBase(), '君基'],
      [this.officerBase(), '臣基'],
      [this.peopleBase(), '民基'],
      [this.fourGod(), '四神'],
      [this.skyYi(), '天乙'],
      [this.earthYi(), '地乙'],
      [this.zhiFu(), '直符'],
      [this.flyFu(), '飞符'],
      [NUM_TO_GONG[this.homeGeneral()]!, '主大'],
      [NUM_TO_GONG[this.homeViceGeneral()]!, '主参'],
      [NUM_TO_GONG[this.awayGeneral()]!, '客大'],
      [NUM_TO_GONG[this.awayViceGeneral()]!, '客参'],
      [NUM_TO_GONG[this.fixedGeneral()]!, '定大'],
      [NUM_TO_GONG[this.fixedViceGeneral()]!, '定参'],
      [NUM_TO_GONG[this.taiyiPalace()]!, '太乙'],
    ]
    const positions: TaiyiPaipanPalace['position'][] = [
      '子', '丑', '艮', '寅', '卯', '辰', '巽', '巳',
      '午', '未', '坤', '申', '酉', '戌', '乾', '亥', '中',
    ]
    return positions.map<TaiyiPaipanPalace>((position) => {
      const gods = marks.filter(([markPosition]) => markPosition === position).map(([, label]) => label)
      if (position === '中' && this.taiyiPalace() === 5) gods.push('太乙')
      return {
        position,
        palaceNumber: CHEN_TO_GONG[position] ?? (position === '中' ? 5 : null),
        gods,
      }
    })
  }

  patterns() {
    const result: Array<{ name: string, detail: string }> = []
    const taiyi = this.taiyiPalace()
    const opposite = OPPOSITE_PALACE[taiyi]
    const palaceOf = (position: string) => CHEN_TO_GONG[position]
    const generals = [
      ['主大', this.homeGeneral()], ['主参', this.homeViceGeneral()],
      ['客大', this.awayGeneral()], ['客参', this.awayViceGeneral()],
    ] as const
    if (palaceOf(this.shiji()) === taiyi) result.push({ name: '掩', detail: '始击临太乙宫，阴盛阳衰、君弱臣强。' })
    if (palaceOf(this.wenchang()) === taiyi) result.push({ name: '关囚', detail: '文昌与太乙同宫，拘系执正，不利为主。' })
    for (const [name, palace] of generals) {
      if (palace === taiyi && palace !== 5) result.push({ name: `囚(${name})`, detail: `${name}与太乙同宫为囚，下犯上之象。` })
    }
    for (let i = 0; i < generals.length; i += 1) {
      for (let j = i + 1; j < generals.length; j += 1) {
        if (generals[i]![1] === generals[j]![1] && generals[i]![1] !== 5) {
          result.push({ name: `关(${generals[i]![0]}、${generals[j]![0]})`, detail: '主客四将同宫，相持争锋，不利有为。' })
        }
      }
    }
    if (palaceOf(this.shiji()) === opposite) result.push({ name: '格(始击)', detail: '始击在太乙对宫，政事上下相格。' })
    if (palaceOf(this.wenchang()) === opposite) result.push({ name: '对', detail: '文昌与太乙相对，大臣怀二。' })

    const eightOrder = [1, 2, 3, 4, 6, 7, 8, 9]
    const previousPalace = eightOrder[mod(eightOrder.indexOf(taiyi) - 1, 8)]!
    const nextPalace = eightOrder[mod(eightOrder.indexOf(taiyi) + 1, 8)]!
    const palacePositions = Object.entries(CHEN_TO_GONG)
      .filter(([, palace]) => palace === taiyi)
      .map(([position]) => position)
    const innerPosition = palacePositions.length === 2
      ? SIXTEEN[mod([...SIXTEEN].indexOf(palacePositions[0]!) - 1, 16)]
      : null
    const outerPosition = palacePositions.length === 2
      ? SIXTEEN[mod([...SIXTEEN].indexOf(palacePositions[1]!) + 1, 16)]
      : null
    for (const [name, position] of [['文昌', this.wenchang()], ['始击', this.shiji()], ['定目', this.dingMu()]] as const) {
      if (palaceOf(position) === taiyi) continue
      if (position === outerPosition) result.push({ name: `辰迫(外、${name})`, detail: `${name}在太乙前一辰，外辰迫，灾急而重。` })
      else if (position === innerPosition) result.push({ name: `辰迫(内、${name})`, detail: `${name}在太乙后一辰，内辰迫，灾尤速。` })
      if (palaceOf(position) === nextPalace) result.push({ name: `宫迫(外、${name})`, detail: `${name}在太乙前一宫，外宫迫，灾缓而轻。` })
      else if (palaceOf(position) === previousPalace) result.push({ name: `宫迫(内、${name})`, detail: `${name}在太乙后一宫，内宫迫。` })
    }
    for (const [name, palace] of generals) {
      if (palace === 5 || palace === taiyi) continue
      if (palace === nextPalace) result.push({ name: `宫迫(外、${name})`, detail: `${name}在太乙前一宫，外宫迫。` })
      else if (palace === previousPalace) result.push({ name: `宫迫(内、${name})`, detail: `${name}在太乙后一宫，内宫迫。` })
    }
    if (palaceOf(this.shiji()) !== taiyi) {
      if (this.shiji() === outerPosition) result.push({ name: '击(外辰)', detail: '始击在太乙前一辰，外辰击，诸侯侵凌。' })
      else if (this.shiji() === innerPosition) result.push({ name: '击(内辰)', detail: '始击在太乙后一辰，内辰击，亲王后妃凭凌。' })
    }
    const doors = this.doors()
    for (const door of ['开', '生'] as const) {
      const doorPalace = Object.entries(doors).find(([, value]) => value === door)?.[0]
      if (!doorPalace) continue
      if (Number(doorPalace) === taiyi) result.push({ name: '执(开生门合)', detail: '太乙与开生门合，执提之象，不可举事。' })
      else if (Number(doorPalace) === opposite) result.push({ name: '提格(开生门冲)', detail: '太乙与开生门冲，提格之象。' })
    }

    if (!result.length) result.push({ name: '无格局', detail: '太乙无掩迫关囚击格对提挟诸格局，主客清明。' })
    return result
  }

  build(): TaiyiEngineResult {
    const kook = this.kook()
    const home = this.homeCalculation()
    const away = this.awayCalculation()
    const fixed = this.fixedCalculation()
    return {
      accNumber: kook.accNumber,
      dunType: kook.dunType,
      dunTypeText: kook.dunTypeText,
      juNumber: kook.juNumber,
      juText: kook.juText,
      sancai: kook.sancai,
      jiyuan: this.jiyuan(),
      fiveYuanJu: this.fiveYuanJu(),
      taiSui: this.taiSui(),
      heGod: this.heGod(),
      jiGod: this.jiGod(),
      taiyiPalace: this.taiyiPalace(),
      taiyiPalaceName: NUM_TO_GONG[this.taiyiPalace()]!,
      taiyiHomeAway: [1, 8, 3, 4].includes(this.taiyiPalace()) ? '太乙在天外，助主' : '太乙在地内，助客',
      wenchang: this.wenchang(),
      wenchangState: this.wenchangState(),
      shiji: this.shiji(),
      shijiXiu: this.shijiXiu(),
      dingMu: this.dingMu(),
      yearXiu: this.yearXiu(),
      home: { value: home, descriptions: calculationMeanings(home), general: this.homeGeneral(), viceGeneral: this.homeViceGeneral() },
      away: { value: away, descriptions: calculationMeanings(away), general: this.awayGeneral(), viceGeneral: this.awayViceGeneral() },
      fixed: { value: fixed, descriptions: calculationMeanings(fixed), general: this.fixedGeneral(), viceGeneral: this.fixedViceGeneral() },
      kingBase: this.kingBase(),
      officerBase: this.officerBase(),
      peopleBase: this.peopleBase(),
      fourGod: this.fourGod(),
      skyYi: this.skyYi(),
      earthYi: this.earthYi(),
      zhiFu: this.zhiFu(),
      flyFu: this.flyFu(),
      fiveFortune: this.fiveFortune(),
      doorValue: this.doorValue(),
      doors: this.doors(),
      threeDoors: this.threeDoors(),
      fiveGenerals: this.fiveGenerals(),
      homeAwayRelation: this.homeAwayRelation(),
      victoryJudgement: this.victoryJudgement(),
      yangJiu: this.yangJiu(),
      baiLiu: this.baiLiu(),
      yearGua: this.yearGua(),
      dayGua: this.dayGua(),
      hourGua: this.hourGua(),
      palaces: this.palaces(),
      patterns: this.patterns(),
    }
  }
}
