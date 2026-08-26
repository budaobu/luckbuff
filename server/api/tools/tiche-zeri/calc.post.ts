import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { DiZhi } from '~/types/user'
import {
  DI_ZHI,
  GAN_WUXING,
  ZHI_WUXING,
} from '~/utils/bazi/constants'
import {
  getUserPillars,
  getJianChu,
  getSimplifiedXiYongJiShen,
  getDiZhiRelation,
  SHENG_XIAO,
  type TianGan,
  type Pillar,
} from '~~/server/utils/bazi'

interface CalcInput {
  startDate: string
  endDate: string
  owner: {
    birthDate: string
    birthHour?: DiZhi | null
  }
  locale?: string
}

interface RawDay {
  date: string
  lunarDate: string
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
}

interface ScoredDay {
  date: string
  lunarDate: string
  dayGanZhi: string
  shengXiao: string
  tianShen: string
  tianShenLuck: string
  jianChu: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  chongDesc: string
  week: string
  dayScore: number
  tags: string[]
}

interface RankedDay extends ScoredDay {
  rank: number
}

interface OwnerResult {
  birthDate: string
  birthHour: DiZhi | null
  pillars: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
  }
  shengXiao: string
  dayMaster: TianGan
  dayMasterWuxing: string
  xiyong: string
  jishen: string
}

interface CalcResult {
  window: { startDate: string; endDate: string }
  owner: OwnerResult
  days: ScoredDay[]
  ranked: RankedDay[]
  best: RankedDay
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

def calc_range(start_date, end_date):
    start = datetime.strptime(start_date, '%Y-%m-%d').date()
    end = datetime.strptime(end_date, '%Y-%m-%d').date()

    days = []
    current = start
    while current <= end:
        solar = Solar.fromYmd(current.year, current.month, current.day)
        lunar = solar.getLunar()

        days.append({
            'date': current.strftime('%Y-%m-%d'),
            'lunarDate': lunar.toString(),
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
        resolve(JSON.parse(stdout.trim()) as RawDay[])
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

/* ================= 打分口径 =================
 * 与站内既有工具（huangdao / poufuchan-zeri / jishi）同一套简化口径：
 * - 黄历宜忌关键词匹配（huangdao calculate.post.ts 的 matterMap 思路，
 *   提车取「交易/立券/纳财/出行」一组，对应提车的「付钱签约 + 开走上路」）
 * - 建除十二神（server/utils/bazi.ts getJianChu）
 * - 八字喜用神（getSimplifiedXiYongJiShen，以车主日主为轴）
 * - 吉神/凶煞数量加权、十二天神吉凶（huangdao）
 * - 日支与车主生肖/日支的合冲害刑（getDiZhiRelation）
 * 不引入新流派，权重在本文件内集中可调。
 */

// 日级：与「提车」（交易立券、纳财、出行）相关的宜忌关键词
const DAY_YI_GOOD: Array<[string, number]> = [
  ['交易', 12],
  ['纳财', 10],
  ['立券', 8],
  ['出行', 6],
  ['开市', 6],
  ['移徙', 3],
  ['入宅', 3],
  ['祈福', 2],
  ['祭祀', 2],
]
const DAY_JI_BAD: Array<[string, number]> = [
  ['交易', -12],
  ['纳财', -10],
  ['立券', -8],
  ['出行', -6],
  ['开市', -6],
  ['破土', -3],
  ['安葬', -3],
  ['行丧', -3],
  ['动土', -2],
]
const DAY_JI_SHEN_BONUS = ['天德', '月德', '天恩', '母仓']
const DAY_XIONG_SHA_PENALTY = ['月破', '大耗', '劫煞', '灾煞', '月煞', '天刑']

// 建除十二神权重：成/开/定利交易立券，破/闭大忌
const JIAN_CHU_SCORE: Record<string, number> = {
  成: 10,
  开: 8,
  定: 6,
  满: 4,
  建: 2,
  除: 2,
  收: 2,
  平: 0,
  执: 0,
  危: -4,
  闭: -8,
  破: -12,
}

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
  jianChu: string,
  dayGan: TianGan,
  dayZhi: DiZhi,
  owner: OwnerResult,
): { score: number; tags: string[] } {
  const tags: string[] = []
  let score = 50

  // 宜忌关键词
  score += matchKeywords(day.yi, DAY_YI_GOOD, 30)
  score += matchKeywords(day.ji, DAY_JI_BAD, -24)
  if (day.yi.some(y => y.includes('交易'))) tags.push('宜交易')
  if (day.yi.some(y => y.includes('纳财'))) tags.push('宜纳财')
  if (day.yi.some(y => y.includes('出行'))) tags.push('宜出行')

  // 建除十二神
  const jcScore = JIAN_CHU_SCORE[jianChu] ?? 0
  score += jcScore
  if (jcScore >= 6) tags.push(`${jianChu}日`)
  else if (jcScore <= -8) tags.push(`${jianChu}日不宜`)

  // 喜用神：日干支五行对车主日主喜忌
  const dayGanWx = GAN_WUXING[dayGan]!
  const dayZhiWx = ZHI_WUXING[dayZhi] ?? ''
  if (dayGanWx === owner.xiyong) { score += 8; tags.push('日干逢喜用') }
  else if (dayGanWx === owner.jishen) { score -= 8; tags.push('日干逢忌神') }
  if (dayZhiWx === owner.xiyong) score += 4
  else if (dayZhiWx === owner.jishen) score -= 4

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

  // 日支与车主年支（生肖）、日支的关系
  const yearRel = getDiZhiRelation(dayZhi, owner.pillars.year.zhi)
  if (yearRel.relations.includes('冲')) { score -= 8; tags.push('冲本人生肖') }
  if (yearRel.relations.includes('合')) { score += 6; tags.push('合本人生肖') }
  if (yearRel.relations.includes('害') || yearRel.relations.includes('刑')) score -= 3
  const dayRel = getDiZhiRelation(dayZhi, owner.pillars.day.zhi)
  if (dayRel.relations.includes('冲')) score -= 4
  if (dayRel.relations.includes('合')) score += 3

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
  if (daysDiff > 92) {
    throw createError({ statusCode: 400, statusMessage: 'Date window too large (max 92 days)' })
  }

  if (!body.owner?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing owner birthDate' })
  }
  parseDate(body.owner.birthDate)
  const locale = body.locale || 'zh-CN'

  const pillars = getUserPillars(body.owner.birthDate, body.owner.birthHour ?? null)
  const dayMaster = pillars.day.gan
  const { xiyong, jishen } = getSimplifiedXiYongJiShen(dayMaster)
  const owner: OwnerResult = {
    birthDate: body.owner.birthDate,
    birthHour: body.owner.birthHour ?? null,
    pillars,
    shengXiao: SHENG_XIAO[pillars.year.zhi],
    dayMaster,
    dayMasterWuxing: GAN_WUXING[dayMaster]!,
    xiyong,
    jishen,
  }

  const rawDays = await queryLunarRange(body.startDate, body.endDate)

  const days: ScoredDay[] = rawDays.map((raw) => {
    const dayGanZhi = raw.dayGanZhi
    const dayGan = dayGanZhi[0]! as TianGan
    const dayZhi = dayGanZhi[1]! as DiZhi
    const monthZhi = raw.monthGanZhi[1]! as DiZhi
    const jianChu = getJianChu(monthZhi, dayZhi)

    const { score: dayScore, tags } = scoreDay(raw, jianChu, dayGan, dayZhi, owner)

    return {
      date: raw.date,
      lunarDate: raw.lunarDate,
      dayGanZhi,
      shengXiao: raw.shengXiao,
      tianShen: raw.tianShen,
      tianShenLuck: raw.tianShenLuck,
      jianChu,
      yi: raw.yi,
      ji: raw.ji,
      jiShen: raw.jiShen,
      xiongSha: raw.xiongSha,
      chongDesc: raw.chongDesc,
      week: raw.week,
      dayScore,
      tags,
    }
  })

  // 排序：分数降序；同分日期靠前
  const ranked: RankedDay[] = [...days]
    .sort((a, b) => {
      if (b.dayScore !== a.dayScore) return b.dayScore - a.dayScore
      return a.date < b.date ? -1 : 1
    })
    .map((d, idx) => ({ ...d, rank: idx + 1 }))

  if (ranked.length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'No days in window' })
  }

  return {
    window: { startDate: body.startDate, endDate: body.endDate },
    owner,
    days,
    ranked,
    best: ranked[0]!,
    locale,
  }
})
