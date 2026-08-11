/**
 * 三才五格起名引擎 —— 本地确定性候选生成
 *
 * 流程：性别过滤字库 → 单/双字组合（人格剪枝）→ 确定性五格 →
 *       三才配置 → 综合打分 → 本地短评 → 去重排序截前 5。
 *
 * 与 baby-naming/engine.ts 的区别：本工具只输入「姓 + 性别」，无八字喜用，
 * 评分只看三才五格。字库复用 baby-naming 的 NAMING_CHAR_POOL（只读引用）。
 *
 * 笔画来源：姓氏用 getStrokeCountsWithAIFallback 查一次（生僻姓走 AI 兜底并缓存）；
 * 名字候选字直接取字库自带的 traditionalStrokes（康熙笔画），无需再查表。
 * 五格公式与 wuge/calc.ts 一致，此处复刻为喂 strokes 的纯函数，保证确定性可控。
 */

import { NAMING_CHAR_POOL, type NamingChar } from '../baby-naming/chars'
import { getFortune81 } from '../wuge/fortune81'
import { getStrokeCountsWithAIFallback } from '../wuge/strokes'
import { digitToWuxing, sancaiFortune } from '../wuge/sancai'
import { gradeFromScore, scoreCandidate, wugeFortuneRank, wugeOverallLuck } from '../wuge/score'
import { buildBriefComment } from './comment'
import type {
  SancaiWugeCandidate,
  SancaiWugeChar,
  SancaiWugeGrid,
  SancaiWugeNamingResult,
} from '~/types/sancai-wuge'

// 复姓白名单（与 wuge/calc.ts 保持一致）
const COMPOUND_SURNAMES = new Set([
  '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '诸葛', '尉迟',
  '羊舌', '公孙', '慕容', '司徒', '司空', '令狐', '钟离', '宇文', '长孙', '鲜于',
  '闾丘', '亓官', '司寇', '子车', '颛孙', '宰父', '谷梁', '拓跋', '夹谷', '轩辕',
  '百里', '东郭', '南门', '呼延', '归海', '微生', '岳帅', '缑亢', '亢桑',
])

const GRID_NAMES = { tiange: '天格', renge: '人格', dige: '地格', waige: '外格', zongge: '总格' } as const

interface FiveGridValues {
  tiange: number
  renge: number
  dige: number
  waige: number
  zongge: number
}

/**
 * 确定性五格公式（与 wuge/calc.ts buildResult 同款）：
 *  - 天格：单姓 = 姓笔画 + 1；复姓 = 姓各字笔画之和
 *  - 人格：姓末字 + 名首字
 *  - 地格：单名 = 名笔画 + 1；多名 = 名笔画之和
 *  - 外格：总格 - 人格 + 1
 *  - 总格：姓名全部笔画之和
 */
function fiveGridValues(surnameLen: number, strokes: number[]): FiveGridValues {
  const surnameStrokes = strokes.slice(0, surnameLen).reduce((a, b) => a + b, 0)
  const givenStrokes = strokes.slice(surnameLen).reduce((a, b) => a + b, 0)
  const totalStrokes = surnameStrokes + givenStrokes

  const tiange = surnameLen === 1 ? strokes[0]! + 1 : surnameStrokes
  const renge = strokes[surnameLen - 1]! + strokes[surnameLen]!
  const givenCount = strokes.length - surnameLen
  const dige = givenCount === 1 ? givenStrokes + 1 : givenStrokes
  const zongge = totalStrokes
  const waige = zongge - renge + 1

  return { tiange, renge, dige, waige, zongge }
}

function buildGrid(key: keyof typeof GRID_NAMES, value: number): SancaiWugeGrid {
  const f = getFortune81(value)
  return { key, name: GRID_NAMES[key], value, fortune: f.fortune, fortuneDesc: f.desc }
}

/** 由字库条目构造候选（全部确定性） */
function buildCandidate(surname: string, surnameChars: SancaiWugeChar[], given: NamingChar[]): SancaiWugeCandidate | null {
  const surnameLen = surnameChars.length
  const givenChars: SancaiWugeChar[] = given.map(c => ({
    char: c.char,
    strokes: c.traditionalStrokes,
    wuxing: c.wuxing,
    meaning: c.meaning,
  }))
  const chars = [...surnameChars, ...givenChars]
  const strokes = chars.map(c => c.strokes)
  if (strokes.some(s => !Number.isInteger(s) || s <= 0)) return null

  const v = fiveGridValues(surnameLen, strokes)
  const grids = {
    tiange: buildGrid('tiange', v.tiange),
    renge: buildGrid('renge', v.renge),
    dige: buildGrid('dige', v.dige),
    waige: buildGrid('waige', v.waige),
    zongge: buildGrid('zongge', v.zongge),
  }

  // 三才：天/人/地格个位 → 五行
  const tian = digitToWuxing(v.tiange)
  const ren = digitToWuxing(v.renge)
  const di = digitToWuxing(v.dige)
  const sf = sancaiFortune(tian, ren, di)
  const sancai = { tian, ren, di, combo: `${tian}${ren}${di}`, luck: sf.luck, desc: sf.desc }

  const fortunes = [grids.tiange.fortune, grids.renge.fortune, grids.dige.fortune, grids.waige.fortune, grids.zongge.fortune]
  const overallLuck = wugeOverallLuck(fortunes)
  const score = scoreCandidate({ ...grids, sancai: sf })
  const grade = gradeFromScore(score)

  const givenName = given.map(c => c.char).join('')
  const fullName = surname + givenName
  const pinyin = given.map(c => c.pinyin).join(' ')

  const candidate: SancaiWugeCandidate = {
    fullName,
    givenName,
    pinyin,
    chars,
    grids,
    sancai,
    overallLuck,
    score,
    grade,
    briefComment: '',
  }
  candidate.briefComment = buildBriefComment(candidate)
  return candidate
}

/** 性别过滤：male 滤掉 female 字、female 滤掉 male 字，neutral 两性皆可 */
function filterPoolByGender(gender: 'male' | 'female'): NamingChar[] {
  return NAMING_CHAR_POOL.filter(c =>
    !(gender === 'male' && c.gender === 'female') &&
    !(gender === 'female' && c.gender === 'male'),
  )
}

/** 人格笔画 = 姓末字 + 名首字；用于外层剪枝 */
function rengeValueOf(surnameStrokes: number[], firstGiven: NamingChar): number {
  return surnameStrokes[surnameStrokes.length - 1]! + firstGiven.traditionalStrokes
}

const RESULT_LIMIT = 5
const luckRank: Record<string, number> = { 上吉: 5, 吉: 4, 中吉: 3, 平: 2, 需谨慎: 1 }

/**
 * 生成候选：返回排序后前 5 个。
 * 姓氏笔画查不到（生僻字且无 AI 兜底）时返回空 candidates，由 API 层转 422。
 */
export async function generateSancaiWugeNames(
  rawSurname: string,
  gender: 'male' | 'female',
): Promise<SancaiWugeNamingResult> {
  const surname = rawSurname.trim()
  const empty: SancaiWugeNamingResult = { surname, gender, candidates: [], topName: null }
  if (!surname) return empty

  // 拆姓：复姓取前两字，否则取首字
  const surnameText = surname.length >= 2 && COMPOUND_SURNAMES.has(surname.slice(0, 2))
    ? surname.slice(0, 2)
    : surname.slice(0, 1)

  // 姓氏笔画（异步，本地表 → opencc+cnchar → AI 兜底，结果缓存）
  let surnameStrokeMap: Record<string, number>
  try {
    surnameStrokeMap = await getStrokeCountsWithAIFallback([...surnameText])
  } catch {
    return empty
  }
  const surnameChars: SancaiWugeChar[] = [...surnameText].map(char => ({
    char,
    strokes: surnameStrokeMap[char]!,
    // 姓氏五行/寓意不参与三才五格打分，字库有则取、无则给中性占位
    wuxing: NAMING_CHAR_POOL.find(c => c.char === char)?.wuxing ?? '土',
    meaning: NAMING_CHAR_POOL.find(c => c.char === char)?.meaning ?? '',
  }))
  if (surnameChars.some(c => !Number.isInteger(c.strokes) || c.strokes <= 0)) return empty

  const surnameStrokes = surnameChars.map(c => c.strokes)
  const pool = filterPoolByGender(gender)

  // 人格剪枝：名首字使人格为 凶/大凶 的整行剔除（人格与第二字无关）
  const goodFirst = pool.filter(c => wugeFortuneRank(getFortune81(rengeValueOf(surnameStrokes, c)).fortune) >= 2)

  const candidates: SancaiWugeCandidate[] = []
  const seen = new Set<string>()
  const push = (cand: SancaiWugeCandidate | null) => {
    if (!cand || seen.has(cand.fullName)) return
    seen.add(cand.fullName)
    candidates.push(cand)
  }

  // 单字名：人格吉/半吉的字才取
  for (const c of goodFirst) {
    push(buildCandidate(surname, surnameChars, [c]))
  }

  // 双字名：首字人格吉/半吉 × 次字地格不弱（地格=首+次）
  for (const c1 of goodFirst) {
    for (const c2 of pool) {
      if (c1.char === c2.char) continue
      // 地格剪枝：双字名地格 = 两字笔画和，凶/大凶则跳过
      const dige = c1.traditionalStrokes + c2.traditionalStrokes
      if (wugeFortuneRank(getFortune81(dige).fortune) < 2) continue
      push(buildCandidate(surname, surnameChars, [c1, c2]))
    }
  }

  // 排序：综合分 → 五格整体运势 → 总格吉凶
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const luckDiff = (luckRank[b.overallLuck] ?? 0) - (luckRank[a.overallLuck] ?? 0)
    if (luckDiff !== 0) return luckDiff
    return wugeFortuneRank(b.grids.zongge.fortune) - wugeFortuneRank(a.grids.zongge.fortune)
  })

  // 多样性：名字首字相同的候选高度趋同（同首字 → 同人格，常连分数都一样），
  // 海报上一排「苏柏X」看着像 bug。按首字去重——每个首字只留排名最高的一个，
  // 再按分补满到 5 个，保证前 5 名首字各异、且不漏掉更高分的次优首字。
  const top: SancaiWugeCandidate[] = []
  const usedFirst = new Set<string>()
  for (const c of candidates) {
    const first = c.givenName[0] ?? ''
    if (usedFirst.has(first)) continue
    usedFirst.add(first)
    top.push(c)
    if (top.length >= RESULT_LIMIT) break
  }
  if (top.length < RESULT_LIMIT) {
    for (const c of candidates) {
      if (top.length >= RESULT_LIMIT) break
      if (!top.includes(c)) top.push(c)
    }
  }
  return { surname, gender, candidates: top, topName: top[0] ?? null }
}
