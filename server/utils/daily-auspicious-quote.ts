export type QuoteSourceType = 'traditional' | 'derived' | 'fallback'
export type QuoteStrength = 'strong' | 'normal' | 'neutral' | 'cautious'

export interface DailyAuspiciousQuoteInput {
  dayStem: string
  dayBranch: string
  jianxing: string
  zhishen: string
  zhishenType?: string
  yi: string[]
  pengzuStemText?: string
  pengzuBranchText?: string
}

export interface DailyAuspiciousQuote {
  text: string
  sourceType: QuoteSourceType
  sourceSystem: string[]
  jianxing: string
  zhishen: string
  strength: QuoteStrength
  relatedYi: string | null
}

type QuoteCandidate = DailyAuspiciousQuote

const JIANXING_CLASS: Record<string, 'yellow' | 'black'> = {
  建: 'black',
  除: 'yellow',
  满: 'black',
  平: 'black',
  定: 'yellow',
  执: 'yellow',
  破: 'black',
  危: 'yellow',
  成: 'yellow',
  收: 'black',
  开: 'yellow',
  闭: 'black',
}

const ZHISHEN_CLASS: Record<string, 'yellow' | 'black'> = {
  青龙: 'yellow',
  明堂: 'yellow',
  金匮: 'yellow',
  天德: 'yellow',
  玉堂: 'yellow',
  司命: 'yellow',
  天刑: 'black',
  朱雀: 'black',
  白虎: 'black',
  天牢: 'black',
  玄武: 'black',
  勾陈: 'black',
}

const JIANXING_MEANING: Record<string, string> = {
  建: '宜启新程',
  除: '宜除旧布新',
  满: '宜守成纳福',
  平: '宜稳中求进',
  定: '宜安定守成',
  执: '宜专心持守',
  破: '宜除弊去旧',
  危: '宜谨慎安守',
  成: '宜顺势成事',
  收: '宜收敛守成',
  开: '宜开新局',
  闭: '宜静守蓄势',
}

type TraditionalJianxingQuote = {
  original: string
  safeQuote: string
  related?: string[]
  broad?: boolean
}

const JIANXING_QUOTE: Record<string, TraditionalJianxingQuote> = {
  建: { original: '建宜出行', safeQuote: '建日宜启行，万事从头起', related: ['出行'] },
  除: { original: '除疗病', safeQuote: '除旧布新，宜去旧迎新', related: ['求医', '治病'] },
  满: { original: '满宜仓库及池塘', safeQuote: '满日盈满，宜守成纳福', related: ['修仓', '筑堤'] },
  平: { original: '平宜平道并泥饰', safeQuote: '平日守常，宜稳中求进', related: ['平治道涂', '修饰垣墙'] },
  定: { original: '定宜冠带喜非常', safeQuote: '定日安定，宜守成定局', related: ['冠带'] },
  执: { original: '执宜捕捉并渔猎', safeQuote: '执日持守，宜专心成事', related: ['捕捉', '渔猎'] },
  破: { original: '破宜疗病坏城墙', safeQuote: '破日宜除弊，不宜妄作大事', related: ['求医', '治病'], broad: false },
  危: { original: '危宜安床忌履险', safeQuote: '危日宜慎行，安守为先', related: ['安床'] },
  成: { original: '成日百事总祯祥', safeQuote: '成日百事总祯祥', broad: true },
  收: { original: '收宜嫁娶敛财货', safeQuote: '收日宜收敛，聚财守成', related: ['嫁娶', '纳财'] },
  开: { original: '开为百吉', safeQuote: '开日启新局，宜顺势而行' },
  闭: { original: '闭宜合帐并缠足', safeQuote: '闭日宜静守，收敛蓄势', related: ['合帐', '缠足'] },
}

const ZHISHEN_QUOTE: Record<string, string> = {
  青龙: '青龙值日，吉气相随',
  明堂: '明堂值日，诸事宜明',
  金匮: '金匮临日，宜守成纳财',
  天德: '天德临门，宜行善积福',
  玉堂: '玉堂值日，宜从容行事',
  司命: '司命当值，宜顺势而为',
  天刑: '天刑值日，行事宜慎',
  朱雀: '朱雀值日，言语宜谨',
  白虎: '白虎值日，诸事宜慎',
  天牢: '天牢值日，宜守不宜妄动',
  玄武: '玄武值日，宜防疏漏',
  勾陈: '勾陈值日，宜稳守缓行',
}

const PRIMARY_YI_PRIORITY = [
  ['开业', '开市', '开张'],
  ['嫁娶'],
  ['出行'],
  ['交易', '求财', '纳财'],
  ['入宅'],
  ['修造', '动土'],
  ['祈福', '祭祀'],
  ['安床'],
]

const YI_QUOTE_MAP: Record<string, string> = {
  嫁娶: '宜成家结缘',
  开市: '宜开张启业',
  开业: '宜开张启业',
  开张: '宜开张启业',
  出行: '宜启程出行',
  求财: '宜求财交易',
  纳财: '宜求财交易',
  交易: '宜求财交易',
  祈福: '宜祈福纳祥',
  祭祀: '宜敬神祈福',
  修造: '宜修造营建',
  动土: '宜修造营建',
  安床: '宜安床定居',
  入宅: '宜入宅安居',
  立券: '宜订约成事',
  签约: '宜订约成事',
  求学: '宜进取求成',
  赴任: '宜进取求成',
}

const PENGZU_CONFLICT_RULES: Array<{ pengzu: RegExp, actions: string[] }> = [
  { pengzu: /不开仓/, actions: ['开市', '开业', '开张', '求财', '纳财', '交易'] },
  { pengzu: /不栽植/, actions: ['栽种', '种植'] },
  { pengzu: /不修灶/, actions: ['修灶', '作灶'] },
  { pengzu: /不剃头/, actions: ['剃头'] },
  { pengzu: /不受田/, actions: ['受田'] },
  { pengzu: /不破券/, actions: ['立券', '签约', '交易'] },
  { pengzu: /不经络/, actions: ['经络', '纺织'] },
  { pengzu: /不合酱/, actions: ['合酱'] },
  { pengzu: /不决水/, actions: ['决水', '放水', '开渠'] },
  { pengzu: /不词讼/, actions: ['词讼', '诉讼'] },
  { pengzu: /不问卜/, actions: ['问卜', '占卜'] },
  { pengzu: /不冠带/, actions: ['冠带'] },
  { pengzu: /不祭祀/, actions: ['祭祀'] },
  { pengzu: /不穿井/, actions: ['穿井', '掘井'] },
  { pengzu: /不远行/, actions: ['出行', '远行'] },
  { pengzu: /不苫盖/, actions: ['苫盖', '盖屋'] },
  { pengzu: /不服药/, actions: ['服药'] },
  { pengzu: /不安床/, actions: ['安床'] },
  { pengzu: /不会客/, actions: ['会客'] },
  { pengzu: /不乞犬/, actions: ['乞犬'] },
  { pengzu: /不嫁娶/, actions: ['嫁娶', '结婚', '婚姻', '纳采', '问名'] },
]

const FORBIDDEN_ABSOLUTE_LANGUAGE = [
  '万事大吉',
  '百无禁忌',
  '诸事皆宜',
  '万事皆宜',
  '必定发财',
  '一定发财',
  '一定成功',
  '必然成功',
  '今日必有好运',
  '今日必有灾',
  '灾祸将至',
  '必有灾祸',
  '大凶',
]

function getJianxingClass(jianxing: string) {
  return JIANXING_CLASS[jianxing] || 'unknown'
}

function getZhishenClass(zhishen: string) {
  return ZHISHEN_CLASS[zhishen] || 'unknown'
}

export function getJianxingType(jianxing: string) {
  return getJianxingClass(jianxing)
}

export function getZhishenType(zhishen: string) {
  return getZhishenClass(zhishen)
}

function selectPrimaryYi(yi: string[]) {
  for (const group of PRIMARY_YI_PRIORITY) {
    const item = yi.find(action => group.includes(action))
    if (item) return item
  }

  return yi.find(action => YI_QUOTE_MAP[action]) || null
}

function createBase(input: DailyAuspiciousQuoteInput, strength: QuoteStrength) {
  return {
    jianxing: input.jianxing,
    zhishen: input.zhishen,
    strength,
  }
}

function getStrength(jianxingType: string, zhishenType: string): QuoteStrength {
  if (jianxingType === 'unknown' || zhishenType === 'unknown') return 'neutral'
  if (jianxingType !== zhishenType) return 'neutral'
  if (jianxingType === 'black') return 'cautious'
  return 'normal'
}

function createTraditionalJianxingCandidate(input: DailyAuspiciousQuoteInput): QuoteCandidate | null {
  const quote = JIANXING_QUOTE[input.jianxing]
  if (!quote) return null
  const applicable = input.jianxing === '成'
    && quote.broad === true
    && input.yi.length >= 2
  if (!applicable) return null

  const jianxingType = getJianxingClass(input.jianxing)
  const zhishenType = getZhishenClass(input.zhishen)

  return {
    text: quote.original,
    sourceType: 'traditional',
    sourceSystem: ['十二建星'],
    ...createBase(input, getStrength(jianxingType, zhishenType)),
    relatedYi: null,
  }
}

function createJianxingZhishenCandidate(
  input: DailyAuspiciousQuoteInput,
  jianxingType: string,
  zhishenType: string,
): QuoteCandidate | null {
  if (jianxingType === 'unknown' || zhishenType === 'unknown') return null

  if (zhishenType === 'yellow' && ['危'].includes(input.jianxing)) {
    const text = input.zhishen === '明堂'
      ? '危日宜守，幸逢明堂，可择事而行'
      : `${input.jianxing}日宜守，幸逢${input.zhishen}，可择事而行`

    return {
      text,
      sourceType: 'derived',
      sourceSystem: ['十二建星', '十二值神'],
      ...createBase(input, 'neutral'),
      relatedYi: null,
    }
  }

  if (jianxingType === 'yellow' && zhishenType === 'yellow') {
    const isStrong = ['成', '开'].includes(input.jianxing)
    const text = input.jianxing === '成' && input.zhishen === '青龙'
      ? '成日逢青龙，宜顺势成事'
      : input.jianxing === '开' && input.zhishen === '明堂'
        ? '开日逢明堂，宜启新局'
        : `${input.jianxing}日逢${input.zhishen}，宜顺势而行`

    return {
      text,
      sourceType: 'derived',
      sourceSystem: ['十二建星', '十二值神'],
      ...createBase(input, isStrong ? 'strong' : 'normal'),
      relatedYi: null,
    }
  }

  if (input.jianxing === '平' && input.zhishen === '天刑') {
    return {
      text: '今日宜稳中求进，顺势而为',
      sourceType: 'fallback',
      sourceSystem: ['十二建星', '十二值神'],
      ...createBase(input, 'neutral'),
      relatedYi: null,
    }
  }

  if (jianxingType === 'yellow' && zhishenType === 'black') {
    return {
      text: `${input.jianxing}日可用，值${input.zhishen}则诸事宜慎`,
      sourceType: 'derived',
      sourceSystem: ['十二建星', '十二值神'],
      ...createBase(input, 'neutral'),
      relatedYi: null,
    }
  }

  if (jianxingType === 'black' && zhishenType === 'yellow') {
    const text = input.jianxing === '危' && input.zhishen === '明堂'
      ? '危日宜守，幸逢明堂，可择事而行'
      : `${input.jianxing}日宜守，幸逢${input.zhishen}，可择事而行`

    return {
      text,
      sourceType: 'derived',
      sourceSystem: ['十二建星', '十二值神'],
      ...createBase(input, 'neutral'),
      relatedYi: null,
    }
  }

  return {
    text: `${input.jianxing}日值${input.zhishen}，宜静守慎行`,
    sourceType: 'derived',
    sourceSystem: ['十二建星', '十二值神'],
    ...createBase(input, 'cautious'),
    relatedYi: null,
  }
}

function createYiCandidate(
  input: DailyAuspiciousQuoteInput,
  jianxingType: string,
  zhishenType: string,
  primaryYi: string,
): QuoteCandidate | null {
  const phrase = YI_QUOTE_MAP[primaryYi]
  const meaning = JIANXING_MEANING[input.jianxing]
  if (!phrase || !meaning) return null

  const strength = getStrength(jianxingType, zhishenType)
  const text = strength === 'cautious'
    ? `${phrase}，惟宜择事而行`
    : strength === 'neutral'
      ? `${phrase}，宜择事而行`
      : `${meaning}，今日${phrase}`

  return {
    text,
    sourceType: 'derived',
    sourceSystem: ['十二建星', '当日宜事'],
    ...createBase(input, strength),
    relatedYi: primaryYi,
  }
}

function createCombinedCandidate(
  input: DailyAuspiciousQuoteInput,
  jianxingType: string,
  zhishenType: string,
  primaryYi: string,
): QuoteCandidate | null {
  const phrase = YI_QUOTE_MAP[primaryYi]
  if (!phrase) return null

  const strength = getStrength(jianxingType, zhishenType)
  const text = jianxingType === 'yellow' && zhishenType === 'yellow'
    ? `${input.jianxing}日逢${input.zhishen}，今日${phrase}`
    : jianxingType === 'black' && zhishenType === 'black'
      ? `${input.jianxing}日值${input.zhishen}，今日${phrase}，仍以稳守为先`
      : `${phrase}，宜择事而行`

  return {
    text,
    sourceType: 'derived',
    sourceSystem: ['十二建星', '十二值神', '当日宜事'],
    ...createBase(input, strength),
    relatedYi: primaryYi,
  }
}

export function createFallbackQuote(input?: Pick<DailyAuspiciousQuoteInput, 'jianxing' | 'zhishen'>): DailyAuspiciousQuote {
  return {
    text: '今日宜稳中求进，顺势而为',
    sourceType: 'fallback',
    sourceSystem: ['十二建星', '十二值神'],
    jianxing: input?.jianxing || '',
    zhishen: input?.zhishen || '',
    strength: 'neutral',
    relatedYi: null,
  }
}

export function conflictsWithPengzuBaiji(candidate: Pick<DailyAuspiciousQuote, 'text' | 'relatedYi'>, input: DailyAuspiciousQuoteInput) {
  const pengzuText = `${input.pengzuStemText || ''}${input.pengzuBranchText || ''}`
  if (!pengzuText) return false

  const hasActiveTaboo = PENGZU_CONFLICT_RULES.some(rule => rule.pengzu.test(pengzuText))
  if (hasActiveTaboo && ['百事', '百吉'].some(phrase => candidate.text.includes(phrase))) {
    return true
  }

  return PENGZU_CONFLICT_RULES.some(rule =>
    rule.pengzu.test(pengzuText)
    && (Boolean(candidate.relatedYi && rule.actions.includes(candidate.relatedYi))
      || rule.actions.some(action => candidate.text.includes(action))),
  )
}

function containsForbiddenAbsoluteLanguage(text: string) {
  return FORBIDDEN_ABSOLUTE_LANGUAGE.some(word => text.includes(word))
}

function createQuoteCandidates(input: DailyAuspiciousQuoteInput, jianxingType: string, zhishenType: string) {
  const primaryYi = selectPrimaryYi(input.yi)
  const candidates = [
    createTraditionalJianxingCandidate(input),
    createJianxingZhishenCandidate(input, jianxingType, zhishenType),
    primaryYi ? createYiCandidate(input, jianxingType, zhishenType, primaryYi) : null,
    primaryYi ? createCombinedCandidate(input, jianxingType, zhishenType, primaryYi) : null,
  ].filter((candidate): candidate is QuoteCandidate => Boolean(candidate))

  return { candidates, primaryYi }
}

export function generateDailyAuspiciousQuote(almanac: DailyAuspiciousQuoteInput): DailyAuspiciousQuote {
  const jianxingType = getJianxingClass(almanac.jianxing)
  const zhishenType = getZhishenClass(almanac.zhishen)
  const { candidates } = createQuoteCandidates(almanac, jianxingType, zhishenType)
  const safeCandidates = candidates
    .filter(candidate => !conflictsWithPengzuBaiji(candidate, almanac))
    .filter(candidate => !containsForbiddenAbsoluteLanguage(candidate.text))

  safeCandidates.sort((left, right) => {
    const sourceOrder = (sourceType: QuoteSourceType) => sourceType === 'traditional' ? 0 : sourceType === 'derived' ? 1 : 2
    return sourceOrder(left.sourceType) - sourceOrder(right.sourceType)
  })

  return safeCandidates[0] || createFallbackQuote(almanac)
}
