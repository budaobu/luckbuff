import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { DiZhi } from '~/types/user'
import { getUserPillars, SHI_CHEN_RANGE } from '~~/server/utils/bazi'

interface CalcInput {
  birthDate: string
  birthHour?: DiZhi | null
  queryDate: string
  locale?: string
}

interface HourInfo {
  zhi: DiZhi
  timeRange: string
  chongShengXiao: string
  sha: string
  luck: string
  tianShenType: string
}

interface DayInfo {
  date: string
  lunarDate: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  dayZhi: DiZhi
  dayShengXiao: string
  dayChongDesc: string
  dayChongZhi: DiZhi
  dayChongShengXiao: string
  daySha: string
  positionXiDesc: string
  positionCaiDesc: string
  positionFuDesc: string
  hours: HourInfo[]
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  queryDate: string
  lunar: DayInfo & { relationSentence: string }
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
from datetime import datetime

sys.path.insert(0, '${VENDOR_PATH.replace(/\\/g, '\\\\')}')
from lunar_python import Solar

def calc_day(date_str):
    d = datetime.strptime(date_str, '%Y-%m-%d').date()
    solar = Solar.fromYmd(d.year, d.month, d.day)
    lunar = solar.getLunar()

    hours = []
    for actual_h in [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]:
        hl = Solar.fromYmdHms(d.year, d.month, d.day, actual_h, 0, 0).getLunar()
        hours.append({
            'zhi': hl.getTimeZhi(),
            'chongShengXiao': hl.getTimeChongShengXiao(),
            'sha': hl.getTimeSha(),
            'luck': hl.getTimeTianShenLuck(),
            'tianShenType': hl.getTimeTianShenType(),
        })

    return {
        'date': date_str,
        'lunarDate': lunar.toString(),
        'yearGanZhi': lunar.getYearInGanZhi(),
        'monthGanZhi': lunar.getMonthInGanZhi(),
        'dayGanZhi': lunar.getDayInGanZhi(),
        'dayZhi': lunar.getDayZhi(),
        'dayShengXiao': lunar.getDayShengXiao(),
        'dayChongDesc': lunar.getDayChongDesc(),
        'dayChongZhi': lunar.getDayChong(),
        'dayChongShengXiao': lunar.getDayChongShengXiao(),
        'daySha': lunar.getDaySha(),
        'positionXiDesc': lunar.getDayPositionXiDesc(),
        'positionCaiDesc': lunar.getDayPositionCaiDesc(),
        'positionFuDesc': lunar.getDayPositionFuDesc(),
        'hours': hours,
    }

if __name__ == '__main__':
    print(json.dumps(calc_day(sys.argv[1]), ensure_ascii=False))
`
}

function parseDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }
  return { year, month, day }
}

async function queryLunarDay(dateStr: string): Promise<DayInfo> {
  const script = buildPythonScript()
  return new Promise((resolve, reject) => {
    const child = spawn(pythonInterpreter(), ['-c', script, dateStr], {
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
        const result = JSON.parse(stdout.trim())
        resolve(result)
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

// 地支关系
const LIU_HE: Array<[DiZhi, DiZhi]> = [
  ['子', '丑'],
  ['寅', '亥'],
  ['卯', '戌'],
  ['辰', '酉'],
  ['巳', '申'],
  ['午', '未'],
]

const LIU_CHONG: Array<[DiZhi, DiZhi]> = [
  ['子', '午'],
  ['丑', '未'],
  ['寅', '申'],
  ['卯', '酉'],
  ['辰', '戌'],
  ['巳', '亥'],
]

const LIU_HAI: Array<[DiZhi, DiZhi]> = [
  ['子', '未'],
  ['丑', '午'],
  ['寅', '巳'],
  ['卯', '辰'],
  ['申', '亥'],
  ['酉', '戌'],
]

const LIU_PO: Array<[DiZhi, DiZhi]> = [
  ['子', '酉'],
  ['丑', '辰'],
  ['寅', '亥'],
  ['卯', '午'],
  ['巳', '申'],
  ['未', '戌'],
]

const SAN_HE: DiZhi[][] = [
  ['申', '子', '辰'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
  ['亥', '卯', '未'],
]

const SAN_XING: DiZhi[][] = [
  ['寅', '巳', '申'],
  ['丑', '戌', '未'],
  ['子', '卯'],
]

const ZI_XING: DiZhi[] = ['辰', '午', '酉', '亥']

const SHENG_XIAO: Record<DiZhi, string> = {
  子: '鼠',
  丑: '牛',
  寅: '虎',
  卯: '兔',
  辰: '龙',
  巳: '蛇',
  午: '马',
  未: '羊',
  申: '猴',
  酉: '鸡',
  戌: '狗',
  亥: '猪',
}

const SHENG_XIAO_EN: Record<DiZhi, string> = {
  子: 'Rat',
  丑: 'Ox',
  寅: 'Tiger',
  卯: 'Rabbit',
  辰: 'Dragon',
  巳: 'Snake',
  午: 'Horse',
  未: 'Goat',
  申: 'Monkey',
  酉: 'Rooster',
  戌: 'Dog',
  亥: 'Pig',
}

function otherInPair(pairs: Array<[DiZhi, DiZhi]>, dayZhi: DiZhi): DiZhi | null {
  for (const [a, b] of pairs) {
    if (a === dayZhi) return b
    if (b === dayZhi) return a
  }
  return null
}

function othersInGroup(groups: DiZhi[][], dayZhi: DiZhi): DiZhi[] {
  const targets: DiZhi[] = []
  for (const group of groups) {
    if (group.includes(dayZhi)) {
      targets.push(...group.filter(z => z !== dayZhi))
    }
  }
  return targets
}

interface RelationConfig {
  targets: DiZhi[]
  zh: string
  tw: string
  en: string
}

function buildRelationSentence(dayZhi: DiZhi, locale: string): string {
  const isEn = locale === 'en'
  const names = isEn ? SHENG_XIAO_EN : SHENG_XIAO

  const chong = otherInPair(LIU_CHONG, dayZhi)
  const xing = othersInGroup(SAN_XING, dayZhi)
  if (ZI_XING.includes(dayZhi)) xing.push(dayZhi)
  const hai = otherInPair(LIU_HAI, dayZhi)
  const po = otherInPair(LIU_PO, dayZhi)
  const sanhe = othersInGroup(SAN_HE, dayZhi)
  const liuhe = otherInPair(LIU_HE, dayZhi)

  const relations: RelationConfig[] = []
  if (chong) relations.push({ targets: [chong], zh: '相冲', tw: '相沖', en: 'clashes with' })
  if (xing.length) relations.push({ targets: xing, zh: '相刑', tw: '相刑', en: 'punishes with' })
  if (hai) relations.push({ targets: [hai], zh: '相害', tw: '相害', en: 'harms with' })
  if (po) relations.push({ targets: [po], zh: '相破', tw: '相破', en: 'breaks with' })
  if (sanhe.length) relations.push({ targets: sanhe, zh: '三合', tw: '三合', en: 'triple harmony with' })
  if (liuhe) relations.push({ targets: [liuhe], zh: '六合', tw: '六合', en: 'six harmony with' })

  const segments = relations.map((r) => {
    const text = r.targets.map(z => names[z]).join(isEn ? ' and ' : '')
    if (isEn) {
      return `${r.en} ${text}`
    }
    return `与${text}${locale === 'zh-TW' ? r.tw : r.zh}`
  })

  return segments.join(isEn ? '; ' : '，')
}

export default defineEventHandler(async (event): Promise<CalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })
  }
  if (!body?.queryDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing queryDate' })
  }

  parseDate(body.birthDate)
  parseDate(body.queryDate)
  const locale = body.locale || 'zh-CN'

  const userPillars = getUserPillars(body.birthDate, body.birthHour)
  const lunarDay = await queryLunarDay(body.queryDate)

  const hours: HourInfo[] = lunarDay.hours.map((h) => {
    return {
      zhi: h.zhi as DiZhi,
      timeRange: SHI_CHEN_RANGE[h.zhi as DiZhi],
      chongShengXiao: h.chongShengXiao,
      sha: h.sha,
      luck: h.luck,
      tianShenType: h.tianShenType,
    }
  })

  return {
    userGanzhi: {
      year: userPillars.year,
      month: userPillars.month,
      day: userPillars.day,
      hour: userPillars.hour,
    },
    queryDate: body.queryDate,
    lunar: {
      ...lunarDay,
      dayZhi: lunarDay.dayZhi as DiZhi,
      dayChongZhi: lunarDay.dayChongZhi as DiZhi,
      hours,
      relationSentence: buildRelationSentence(lunarDay.dayZhi as DiZhi, locale),
    },
    locale,
  }
})
