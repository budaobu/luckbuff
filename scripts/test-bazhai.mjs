import { calcMingGuaNumber, getGuaByNumber, findMountain24, normalizeDegree, calcBazhai, MOUNTAINS_24, TEST_CASES } from '../app/utils/bazhai.ts'

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    console.error(`❌ ${name}: expected ${expected}, got ${actual}`)
    process.exit(1)
  }
  console.log(`✅ ${name}: ${actual}`)
}

function runTests() {
  console.log('=== 命卦公式验证 ===')
  for (const tc of TEST_CASES) {
    const n = calcMingGuaNumber(tc.birthYear, tc.gender)
    const gua = getGuaByNumber(n)
    assertEqual(`${tc.birthYear} ${tc.gender}`, gua, tc.expected)
  }

  console.log('\n=== 24 山角度映射验证 ===')
  const m0 = findMountain24(0)
  assertEqual('0° 为子山', m0?.name, '子')
  const m90 = findMountain24(90)
  assertEqual('90° 为卯山', m90?.name, '卯')
  const m180 = findMountain24(180)
  assertEqual('180° 为午山', m180?.name, '午')
  const m270 = findMountain24(270)
  assertEqual('270° 为酉山', m270?.name, '酉')
  const m337 = findMountain24(337.5)
  assertEqual('337.5° 为壬山', m337?.name, '壬')
  const m352 = findMountain24(352.5)
  assertEqual('352.5° 为子山', m352?.name, '子')

  console.log('\n=== 朝向与坐山验证 ===')
  const r180 = calcBazhai(180, 1985, 'male')
  assertEqual('朝南（180°）坐山', r180.sittingMountain?.name, '子')
  assertEqual('朝南（180°）向山', r180.mountain?.name, '午')

  console.log('\n=== 大游年歌诀验证（离命）===')
  const li = calcBazhai(180, 1973, 'male')
  assertEqual('1973 男命为离命', li.mingGua, '离')
  const liPalaces = Object.fromEntries(li.palaces.map(p => [p.direction, p.star]))
  assertEqual('离命 南（伏位）', liPalaces['南'], '伏位')
  assertEqual('离命 西南（六煞）', liPalaces['西南'], '六煞')
  assertEqual('离命 西（五鬼）', liPalaces['西'], '五鬼')
  assertEqual('离命 西北（绝命）', liPalaces['西北'], '绝命')
  assertEqual('离命 北（延年）', liPalaces['北'], '延年')
  assertEqual('离命 东北（祸害）', liPalaces['东北'], '祸害')
  assertEqual('离命 东（生气）', liPalaces['东'], '生气')
  assertEqual('离命 东南（天医）', liPalaces['东南'], '天医')

  console.log('\n=== 大游年歌诀验证（离命）===')
  const qian = calcBazhai(180, 1964, 'male')
  assertEqual('1964 男命为离命', qian.mingGua, '离')
  const qianPalaces = Object.fromEntries(qian.palaces.map(p => [p.direction, p.star]))
  assertEqual('离命 南（伏位）', qianPalaces['南'], '伏位')
  assertEqual('离命 西南（六煞）', qianPalaces['西南'], '六煞')
  assertEqual('离命 西（五鬼）', qianPalaces['西'], '五鬼')
  assertEqual('离命 西北（绝命）', qianPalaces['西北'], '绝命')
  assertEqual('离命 北（延年）', qianPalaces['北'], '延年')
  assertEqual('离命 东北（祸害）', qianPalaces['东北'], '祸害')
  assertEqual('离命 东（生气）', qianPalaces['东'], '生气')
  assertEqual('离命 东南（天医）', qianPalaces['东南'], '天医')

  console.log('\n=== 中五寄宫验证 ===')
  assertEqual('1986 男命（余5→坤）', getGuaByNumber(calcMingGuaNumber(1986, 'male')), '坤')
  assertEqual('1981 女命（余5→艮）', getGuaByNumber(calcMingGuaNumber(1981, 'female')), '艮')

  console.log('\n=== 24 山中心点角度验证 ===')
  const centers = [
    { name: '子', deg: 0 },
    { name: '卯', deg: 90 },
    { name: '午', deg: 180 },
    { name: '酉', deg: 270 },
    { name: '艮', deg: 45 },
    { name: '巽', deg: 135 },
    { name: '坤', deg: 225 },
    { name: '乾', deg: 315 },
  ]
  for (const c of centers) {
    const m = findMountain24(c.deg)
    assertEqual(`${c.deg}° 中心点`, m?.name, c.name)
  }

  console.log('\n=== 全部通过 ===')
}

runTests()
