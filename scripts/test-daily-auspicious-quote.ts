import assert from 'node:assert/strict'
import { test } from 'node:test'

const { conflictsWithPengzuBaiji, generateDailyAuspiciousQuote } = await import(
  new URL('../server/utils/daily-auspicious-quote.ts', import.meta.url)
)

const JIANXING = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭']
const ZHISHEN = ['青龙', '明堂', '天刑', '朱雀', '金匮', '天德', '白虎', '玉堂', '天牢', '玄武', '司命', '勾陈']
const YELLOW_ZHISHEN = ['青龙', '明堂', '金匮', '天德', '玉堂', '司命']
const BLACK_ZHISHEN = ['天刑', '朱雀', '白虎', '天牢', '玄武', '勾陈']
const FORBIDDEN = [
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

test('section 22 Case 1 uses the traditional jianxing sentence', () => {
  const quote = generateDailyAuspiciousQuote({
    dayStem: '甲',
    dayBranch: '子',
    jianxing: '成',
    zhishen: '青龙',
    yi: ['交易', '立券'],
  })

  assert.equal(quote.text, '成日百事总祯祥')
  assert.equal(quote.sourceType, 'traditional')
  assert.deepEqual(quote.sourceSystem, ['十二建星'])
})

test('section 22 Cases 2-5 use the exact recommended outputs', () => {
  const cases = [
    {
      input: { dayStem: '甲', dayBranch: '子', jianxing: '开', zhishen: '明堂', yi: ['开市', '交易'] },
      expected: '开日逢明堂，宜启新局',
      sourceType: 'derived',
    },
    {
      input: { dayStem: '甲', dayBranch: '子', jianxing: '成', zhishen: '青龙', yi: ['交易'] },
      expected: '成日逢青龙，宜顺势成事',
      sourceType: 'derived',
    },
    {
      input: { dayStem: '甲', dayBranch: '子', jianxing: '危', zhishen: '明堂', yi: ['安床'] },
      expected: '危日宜守，幸逢明堂，可择事而行',
      sourceType: 'derived',
    },
    {
      input: { dayStem: '甲', dayBranch: '子', jianxing: '破', zhishen: '白虎', yi: [] },
      expected: '破日值白虎，宜静守慎行',
      sourceType: 'derived',
    },
  ]

  for (const item of cases) {
    const quote = generateDailyAuspiciousQuote(item.input)
    assert.equal(quote.text, item.expected)
    assert.equal(quote.sourceType, item.sourceType)
  }
})

test('section 22 Case 6 blocks the conflicting item quote with pengzu baiji', () => {
  const input = {
    dayStem: '甲',
    dayBranch: '亥',
    jianxing: '成',
    zhishen: '青龙',
    yi: ['嫁娶', '交易'],
    pengzuStemText: '甲不开仓，财物耗亡',
    pengzuBranchText: '亥不嫁娶，不利新郎',
  }
  const quote = generateDailyAuspiciousQuote(input)

  assert.equal(quote.text, '成日逢青龙，宜顺势成事')
  assert.equal(quote.relatedYi, null)
  assert.equal(quote.sourceType, 'derived')
  assert.ok(conflictsWithPengzuBaiji({ text: '今日宜嫁娶，喜结良缘', relatedYi: '嫁娶' }, input))
})

test('section 22 Case 7 uses the neutral fallback', () => {
  const quote = generateDailyAuspiciousQuote({
    dayStem: '甲',
    dayBranch: '子',
    jianxing: '平',
    zhishen: '天刑',
    yi: [],
  })

  assert.equal(quote.text, '今日宜稳中求进，顺势而为')
  assert.equal(quote.sourceType, 'fallback')
  assert.equal(quote.strength, 'neutral')
})

test('section 8 yellow jianxing with black zhishen uses the prescribed form', () => {
  const quote = generateDailyAuspiciousQuote({
    dayStem: '戊',
    dayBranch: '戌',
    jianxing: '除',
    zhishen: '天牢',
    yi: ['求医', '治病'],
  })

  assert.equal(quote.text, '除日可用，值天牢则诸事宜慎')
  assert.equal(quote.sourceType, 'derived')
})

test('covers all twelve jianxing values', () => {
  for (const jianxing of JIANXING) {
    const quote = generateDailyAuspiciousQuote({
      dayStem: '甲',
      dayBranch: '子',
      jianxing,
      zhishen: '青龙',
      yi: ['交易'],
    })

    assert.equal(quote.jianxing, jianxing)
    assert.ok(quote.text)
  }
})

test('covers all twelve zhishen values', () => {
  for (const zhishen of ZHISHEN) {
    const quote = generateDailyAuspiciousQuote({
      dayStem: '甲',
      dayBranch: '子',
      jianxing: '成',
      zhishen,
      yi: ['交易', '立券'],
    })

    assert.equal(quote.zhishen, zhishen)
    assert.ok(quote.text)
  }
})

test('covers yellow and black system combinations', () => {
  const pairs = [
    ['成', YELLOW_ZHISHEN[0]],
    ['成', BLACK_ZHISHEN[0]],
    ['破', YELLOW_ZHISHEN[0]],
    ['破', BLACK_ZHISHEN[0]],
  ] as const
  const expectedStrength = ['strong', 'neutral', 'neutral', 'cautious']

  pairs.forEach(([jianxing, zhishen], index) => {
    const quote = generateDailyAuspiciousQuote({
      dayStem: '甲',
      dayBranch: '子',
      jianxing,
      zhishen,
      yi: [],
    })

    assert.equal(quote.strength, expectedStrength[index])
  })
})

test('the quote never uses absolute fortune-telling language', () => {
  const quotes = [
    ...JIANXING.map(jianxing => generateDailyAuspiciousQuote({
      dayStem: '甲', dayBranch: '子', jianxing, zhishen: '青龙', yi: ['交易', '立券'],
    })),
    ...ZHISHEN.map(zhishen => generateDailyAuspiciousQuote({
      dayStem: '甲', dayBranch: '子', jianxing: '成', zhishen, yi: ['交易', '立券'],
    })),
  ]

  for (const quote of quotes) {
    for (const phrase of FORBIDDEN) {
      assert.ok(!quote.text.includes(phrase), `${quote.text} contains ${phrase}`)
    }
  }
})

test('xiu28 does not participate in daily quote generation', () => {
  const base = {
    dayStem: '甲',
    dayBranch: '子',
    jianxing: '成',
    zhishen: '青龙',
    yi: ['交易'],
  }
  const withoutXiu = generateDailyAuspiciousQuote(base)
  const withUnluckyXiu = generateDailyAuspiciousQuote({
    ...base,
    xiu28: { name: '心', text: '心星造作大为凶', type: '凶' },
  })
  const withLuckyXiu = generateDailyAuspiciousQuote({
    ...base,
    xiu28: { name: '角', text: '角星造作主荣昌', type: '吉' },
  })

  assert.deepEqual(withLuckyXiu, withoutXiu)
  assert.deepEqual(withUnluckyXiu, withoutXiu)
})

test('generation is deterministic', () => {
  const input = {
    dayStem: '戊',
    dayBranch: '戌',
    jianxing: '除',
    zhishen: '天牢',
    yi: ['嫁娶', '祭祀', '出行', '修造'],
    pengzuStemText: '戊不受田田主不祥',
    pengzuBranchText: '戌不吃犬作怪上床',
  }

  assert.deepEqual(generateDailyAuspiciousQuote(input), generateDailyAuspiciousQuote(input))
})
