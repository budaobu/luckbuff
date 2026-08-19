import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { DiZhi } from '~/types/user'
import {
  DI_ZHI,
  GAN_WUXING,
  ZHI_WUXING,
  WUXING_SHENG,
  WUXING_KE,
} from '~/utils/bazi/constants'
import {
  getUserPillars,
  getShiChenGanZhi,
  getShiChenTianShen,
  getDiZhiRelation,
  getGanRelation,
  SHENG_XIAO,
  SHI_CHEN_RANGE,
  type TianGan,
  type Pillar,
} from '~~/server/utils/bazi'

interface PersonInput {
  birthDate: string
  birthHour?: DiZhi | null
}

interface CalcInput {
  startDate: string
  endDate: string
  mother: PersonInput
  father: PersonInput
  locale?: string
}

interface RawHour {
  dizhi: DiZhi
  timeYi: string[]
  timeJi: string[]
}

interface RawDay {
  date: string
  lunarDate: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  tianShen: string
  tianShenLuck: string
  shengXiao: string
  chongDesc: string
  week: string
  hours: RawHour[]
}

interface ScoredHour {
  dizhi: DiZhi
  timeRange: string
  ganZhi: string
  tianShen: string
  tianShenType: '黄道' | '黑道'
  timeYi: string[]
  timeJi: string[]
  score: number
  tags: string[]
}

interface ScoredDay {
  date: string
  lunarDate: string
  dayGanZhi: string
  shengXiao: string
  tianShen: string
  tianShenLuck: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  chongDesc: string
  week: string
  dayScore: number
  hours: ScoredHour[]
}

interface RankedCandidate {
  rank: number
  date: string
  lunarDate: string
  dayGanZhi: string
  week: string
  dizhi: DiZhi
  timeRange: string
  hourGanZhi: string
  tianShen: string
  tianShenType: '黄道' | '黑道'
  dayScore: number
  hourScore: number
  totalScore: number
  tags: string[]
}

interface PersonResult {
  birthDate: string
  birthHour: DiZhi | null
  pillars: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
  }
  shengXiao: string
}

interface CalcResult {
  window: { startDate: string; endDate: string }
  mother: PersonResult
  father: PersonResult
  days: ScoredDay[]
  ranked: RankedCandidate[]
  best: RankedCandidate
  locale: string
}

const PROJECT_ROOT = resolve(process.cwd())
const VENDOR_PATH = join(PROJECT_ROOT, '.cache', 'liuyao-engine', 'lunar_python_vendor.zip')
const VENV_PYTHON = join(PROJECT_ROOT, '.venv', 'bin', 'python')

function pythonInterpreter(): string {
  if (process.env.LIUYAO_PYTHON) return process.env.LIUYAO_PYTHON
  if (existsSync(VENV_PYTHON)) return VENV_PYTHON
  return 'python3'
}

function buildPythonScript(): string {
  return `
import sys
import json
from datetime import datetime, timedelta

sys.path.insert(0, '${VENDOR_PATH.replace(/\\/g, '\\\\')}')
from lunar_python import Solar

HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]

def calc_range(start_date, end_date):
    start = datetime.strptime(start_date, '%Y-%m-%d').date()
    end = datetime.strptime(end_date, '%Y-%m-%d').date()

    days = []
    current = start
    while current <= end:
        solar = Solar.fromYmd(current.year, current.month, current.day)
        lunar = solar.getLunar()

        hours = []
        for h in HOURS:
            h_lunar = Solar.fromYmdHms(current.year, current.month, current.day, h, 0, 0).getLunar()
            hours.append({
                'timeYi': h_lunar.getTimeYi() or [],
                'timeJi': h_lunar.getTimeJi() or [],
            })

        days.append({
            'date': current.strftime('%Y-%m-%d'),
            'lunarDate': lunar.toString(),
            'yearGanZhi': lunar.getYearInGanZhi(),
            'monthGanZhi': lunar.getMonthInGanZhi(),
            'dayGanZhi': lunar.getDayInGanZhi(),
            'yi': lunar.getDayYi() or [],
            'ji': lunar.getDayJi() or [],
            'jiShen': lunar.getDayJiShen() or [],
            'xiongSha': lunar.getDayXiongSha() or [],
            'tianShen': lunar.getDayTianShen() or '',
            'tianShenLuck': lunar.getDayTianShenLuck() or '',
            'shengXiao': lunar.getDayShengXiao() or '',
            'chongDesc': lunar.getDayChongDesc() or '',
            'week': lunar.getWeekInChinese() or '',
            'hours': hours,
        })

        current += timedelta(days=1)

    print(json.dumps(days, ensure_ascii=False))

if __name__ == '__main__':
    calc_range(sys.argv[1], sys.argv[2])
`
}

async function queryLunarRange(startDate: string, endDate: string): Promise<RawDay[]> {
  const script = buildPythonScript()
  return new Promise((resolve, reject) => {
    const child = spawn(pythonInterpreter(), ['-c', script, startDate, endDate], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PYTHONPATH: VENDOR_PATH },
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString('utf-8')
    })

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8')
    })

    child.on('close', (code: number | null) => {
      if (code !== 0) {
        reject(createError({
          statusCode: 500,
          statusMessage: `Python engine error: ${stderr || stdout}`.slice(0, 200),
        }))
        return
      }

      try {
        const days = JSON.parse(stdout.trim()) as Array<Omit<RawDay, 'hours'> & { hours: Array<{ timeYi: string[]; timeJi: string[] }> }>
        // HOURS 顺序与 DI_ZHI 一致，按序补回地支
        const merged: RawDay[] = days.map(d => ({
          ...d,
          hours: d.hours.map((h, idx) => ({
            dizhi: DI_ZHI[idx]!,
            timeYi: h.timeYi,
            timeJi: h.timeJi,
          })),
        }))
        resolve(merged)
      }
      catch {
        reject(createError({
          statusCode: 500,
          statusMessage: `Failed to parse result: ${stdout.slice(0, 200)}`,
        }))
      }
    })

    child.on('error', (err: Error) => {
      reject(createError({
        statusCode: 500,
        statusMessage: `Failed to spawn Python: ${err.message}`,
      }))
    })
  })
}

function parseDate(date: string): void {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }
}

function validatePerson(person: PersonInput | undefined, label: string): PersonInput {
  if (!person?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: `Missing ${label} birthDate` })
  }
  parseDate(person.birthDate)
  return person
}

/* ================= 打分口径 =================
 * 与站内既有工具（huangdao / jinri-yiji / jishi）同一套简化口径：
 * - 黄历关键词匹配（huangdao calculate.post.ts 的 matterMap 思路）
 * - 吉神/凶煞数量加权、十二天神吉凶（huangdao）
 * - 地支六合/六冲/相害/相刑加权（server/utils/bazi.ts getDiZhiRelation）
 * - 日干五行生克（getGanRelation）
 * - 时辰黄黑道（getShiChenTianShen）
 * 不引入新流派，权重在本文件内集中可调。
 */

// 日级：与「生子/迎接新生命」相关的宜忌关键词
const DAY_YI_GOOD: Array<[string, number]> = [
  ['求嗣', 14],
  ['祈福', 4],
  ['祭祀', 3],
  ['纳采', 2],
  ['订盟', 2],
  ['嫁娶', 2],
  ['入宅', 2],
  ['安床', 2],
  ['解除', 2],
]
const DAY_JI_BAD: Array<[string, number]> = [
  ['求嗣', -14],
  ['求医', -4],
  ['治病', -4],
  ['动土', -3],
  ['破土', -3],
  ['安葬', -3],
  ['行丧', -3],
]
const DAY_JI_SHEN_BONUS = ['天德', '月德', '天恩', '母仓']
const DAY_XIONG_SHA_PENALTY = ['月破', '大耗', '劫煞', '灾煞', '月煞', '天刑']

// 时级：时辰宜忌关键词
const HOUR_YI_GOOD: Array<[string, number]> = [
  ['求嗣', 8],
  ['祈福', 3],
  ['祭祀', 2],
  ['订婚', 1],
  ['嫁娶', 1],
  ['入宅', 1],
  ['安床', 1],
]
const HOUR_JI_BAD: Array<[string, number]> = [
  ['求嗣', -8],
  ['求医', -3],
  ['治病', -3],
  ['动土', -2],
  ['破土', -2],
  ['安葬', -2],
]

function matchKeywords(list: string[], rules: Array<[string, number]>, cap: number): number {
  let score = 0
  for (const [kw, weight] of rules) {
    if (list.some(item => item.includes(kw))) score += weight
  }
  if (cap > 0) return Math.min(score, cap)
  return Math.max(score, cap)
}

/** 日级打分：基础 50，上下浮动 */
function scoreDay(
  day: RawDay,
  dayZhi: DiZhi,
  mother: PersonResult,
  father: PersonResult,
): { score: number; tags: string[] } {
  const tags: string[] = []
  let score = 50

  // 宜忌关键词
  score += matchKeywords(day.yi, DAY_YI_GOOD, 30)
  score += matchKeywords(day.ji, DAY_JI_BAD, -24)
  if (day.yi.some(y => y.includes('求嗣'))) tags.push('宜求嗣')

  // 吉神/凶煞
  score += Math.min(day.jiShen.length, 6)
  score -= Math.min(day.xiongSha.length, 6)
  for (const name of DAY_JI_SHEN_BONUS) {
    if (day.jiShen.some(s => s.includes(name))) {
      score += 4
      tags.push(name)
    }
  }
  for (const name of DAY_XIONG_SHA_PENALTY) {
    if (day.xiongSha.some(s => s.includes(name))) score -= 4
  }

  // 十二天神吉凶
  if (day.tianShenLuck === '吉') score += 6
  else if (day.tianShenLuck === '凶') score -= 6

  // 日支与父母年支（生肖）、日支的关系
  for (const [person, label] of [[mother, '母'], [father, '父']] as const) {
    const yearRel = getDiZhiRelation(dayZhi, person.pillars.year.zhi)
    if (yearRel.relations.includes('冲')) { score -= 8; tags.push(`冲${label}生肖`) }
    if (yearRel.relations.includes('合')) { score += 6; tags.push(`合${label}生肖`) }
    if (yearRel.relations.includes('害') || yearRel.relations.includes('刑')) score -= 3
    const dayRel = getDiZhiRelation(dayZhi, person.pillars.day.zhi)
    if (dayRel.relations.includes('冲')) score -= 4
    if (dayRel.relations.includes('合')) score += 3
  }

  return { score: Math.max(0, Math.min(100, score)), tags }
}

/** 时级打分：以宝宝日柱为轴，结合父母生肖与时辰宜忌 */
function scoreHour(
  dizhi: DiZhi,
  hourGan: TianGan,
  dayGan: TianGan,
  dayZhi: DiZhi,
  tianShenType: '黄道' | '黑道',
  raw: RawHour,
  mother: PersonResult,
  father: PersonResult,
): { score: number; tags: string[] } {
  const tags: string[] = []
  let score = 50

  // 时干与宝宝日干的五行生克（生我/同我为佳）
  const ganRel = getGanRelation(dayGan, hourGan)
  if (ganRel.relation === '生我') { score += 8; tags.push('时干生日干') }
  else if (ganRel.relation === '同我') score += 3
  else if (ganRel.relation === '克我') score -= 6
  else score -= 2

  // 时支五行同理（权重减半）
  const dayGanWx = GAN_WUXING[dayGan]!
  const hourZhiWx = ZHI_WUXING[dizhi] ?? ''
  if (hourZhiWx) {
    if (WUXING_SHENG[hourZhiWx] === dayGanWx) score += 4
    else if (WUXING_KE[hourZhiWx] === dayGanWx) score -= 3
  }

  // 时支与宝宝日支合冲
  const dayZhiRel = getDiZhiRelation(dizhi, dayZhi)
  if (dayZhiRel.relations.includes('合')) { score += 5; tags.push('时支合日支') }
  if (dayZhiRel.relations.includes('冲')) { score -= 7; tags.push('时支冲日支') }
  if (dayZhiRel.relations.includes('害') || dayZhiRel.relations.includes('刑')) score -= 2

  // 时支与父母年支（生肖）合冲
  for (const [person, label] of [[mother, '母'], [father, '父']] as const) {
    const rel = getDiZhiRelation(dizhi, person.pillars.year.zhi)
    if (rel.relations.includes('冲')) { score -= 5; tags.push(`冲${label}生肖`) }
    if (rel.relations.includes('合')) { score += 3; tags.push(`合${label}生肖`) }
  }

  // 黄黑道
  if (tianShenType === '黄道') score += 6
  else score -= 6

  // 时辰宜忌
  score += matchKeywords(raw.timeYi, HOUR_YI_GOOD, 14)
  score += matchKeywords(raw.timeJi, HOUR_JI_BAD, -12)
  if (raw.timeYi.some(y => y.includes('求嗣'))) tags.push('时宜求嗣')

  return { score: Math.max(0, Math.min(100, score)), tags }
}

export default defineEventHandler(async (event): Promise<CalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.startDate || !body?.endDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing date window' })
  }
  parseDate(body.startDate)
  parseDate(body.endDate)

  const start = new Date(`${body.startDate}T00:00:00`)
  const end = new Date(`${body.endDate}T00:00:00`)
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (daysDiff < 0) {
    throw createError({ statusCode: 400, statusMessage: 'End date must be after start date' })
  }
  if (daysDiff > 31) {
    throw createError({ statusCode: 400, statusMessage: 'Date window too large (max 31 days)' })
  }

  const motherInput = validatePerson(body.mother, 'mother')
  const fatherInput = validatePerson(body.father, 'father')
  const locale = body.locale || 'zh-CN'

  const buildPerson = (input: PersonInput): PersonResult => {
    const pillars = getUserPillars(input.birthDate, input.birthHour ?? null)
    return {
      birthDate: input.birthDate,
      birthHour: input.birthHour ?? null,
      pillars,
      shengXiao: SHENG_XIAO[pillars.year.zhi],
    }
  }
  const mother = buildPerson(motherInput)
  const father = buildPerson(fatherInput)

  const rawDays = await queryLunarRange(body.startDate, body.endDate)

  const days: ScoredDay[] = rawDays.map((raw) => {
    const dayGanZhi = raw.dayGanZhi
    const dayGan = dayGanZhi[0]! as TianGan
    const dayZhi = dayGanZhi[1]! as DiZhi

    const { score: dayScore, tags: dayTags } = scoreDay(raw, dayZhi, mother, father)

    const shiChenGanZhi = getShiChenGanZhi(dayGan)
    const shiChenTianShen = getShiChenTianShen(dayZhi)

    const hours: ScoredHour[] = DI_ZHI.map((dizhi, idx) => {
      const rawHour = raw.hours[idx]!
      const { ganZhi, gan } = shiChenGanZhi[idx]!
      const tianShen = shiChenTianShen[idx]!
      const { score, tags } = scoreHour(
        dizhi, gan, dayGan, dayZhi, tianShen.type, rawHour, mother, father,
      )
      return {
        dizhi,
        timeRange: SHI_CHEN_RANGE[dizhi],
        ganZhi,
        tianShen: tianShen.tianShen,
        tianShenType: tianShen.type,
        timeYi: rawHour.timeYi,
        timeJi: rawHour.timeJi,
        score,
        tags,
      }
    })

    return {
      date: raw.date,
      lunarDate: raw.lunarDate,
      dayGanZhi,
      shengXiao: raw.shengXiao,
      tianShen: raw.tianShen,
      tianShenLuck: raw.tianShenLuck,
      yi: raw.yi,
      ji: raw.ji,
      jiShen: raw.jiShen,
      xiongSha: raw.xiongSha,
      chongDesc: raw.chongDesc,
      week: raw.week,
      dayScore,
      hours: hours.map(h => ({ ...h, tags: [...new Set([...dayTags.filter(t => t.includes('冲') || t.includes('合')), ...h.tags])] })),
    }
  })

  // 扁平化为完整候选时辰榜单：日分 40% + 时分 60%
  const flat: Array<Omit<RankedCandidate, 'rank'>> = []
  for (const day of days) {
    for (const hour of day.hours) {
      const totalScore = Math.round(day.dayScore * 0.4 + hour.score * 0.6)
      flat.push({
        date: day.date,
        lunarDate: day.lunarDate,
        dayGanZhi: day.dayGanZhi,
        week: day.week,
        dizhi: hour.dizhi,
        timeRange: hour.timeRange,
        hourGanZhi: hour.ganZhi,
        tianShen: hour.tianShen,
        tianShenType: hour.tianShenType,
        dayScore: day.dayScore,
        hourScore: hour.score,
        totalScore,
        tags: hour.tags,
      })
    }
  }

  // 排序：总分降序；同分黄道优先；再同分日期靠前、时辰靠前
  flat.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
    if (a.tianShenType !== b.tianShenType) return a.tianShenType === '黄道' ? -1 : 1
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return DI_ZHI.indexOf(a.dizhi) - DI_ZHI.indexOf(b.dizhi)
  })

  if (flat.length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'No candidates in window' })
  }

  const ranked: RankedCandidate[] = flat.map((c, idx) => ({ ...c, rank: idx + 1 }))

  return {
    window: { startDate: body.startDate, endDate: body.endDate },
    mother,
    father,
    days,
    ranked,
    best: ranked[0]!,
    locale,
  }
})
