import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { DiZhi } from '~/types/user'
import { getUserPillars, getDivinationDayPillar, type Pillar, type TianGan } from '~~/server/utils/bazi'

interface CalcInput {
  birthDate: string
  birthHour?: DiZhi | null
  qiguaTime?: string
  scenes?: string[]
  customScene?: string
  locale?: string
}

interface LunarDayInfo {
  date: string
  lunarDate: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  yearNaYin: string
  monthNaYin: string
  dayNaYin: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  tianShen: string
  tianShenLuck: string
  tianShenType: string
  jieQi: string
  shengXiao: string
  week: string
  monthInChinese: string
  dayInChinese: string
  chongDesc: string
  chongShengXiao: string
  sha: string
  nineStar: string
  xunKong: string
  positionTaiSuiDesc: string
  positionXiDesc: string
  positionYangGuiDesc: string
  positionYinGuiDesc: string
  positionCaiDesc: string
  positionFuDesc: string
  lu: string
}

interface CalcResult {
  userGanzhi: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
  }
  targetDate: string
  lunar: LunarDayInfo
  scenes: string[]
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

    return {
        'date': date_str,
        'lunarDate': lunar.toString(),
        'yearGanZhi': lunar.getYearInGanZhi(),
        'monthGanZhi': lunar.getMonthInGanZhi(),
        'dayGanZhi': lunar.getDayInGanZhi(),
        'yearNaYin': lunar.getYearNaYin() or '',
        'monthNaYin': lunar.getMonthNaYin() or '',
        'dayNaYin': lunar.getDayNaYin() or '',
        'yi': lunar.getDayYi() or [],
        'ji': lunar.getDayJi() or [],
        'jiShen': lunar.getDayJiShen() or [],
        'xiongSha': lunar.getDayXiongSha() or [],
        'tianShen': lunar.getDayTianShen() or '',
        'tianShenLuck': lunar.getDayTianShenLuck() or '',
        'tianShenType': lunar.getDayTianShenType() or '',
        'jieQi': lunar.getJieQi() or '',
        'shengXiao': lunar.getDayShengXiao() or '',
        'week': lunar.getWeekInChinese() or '',
        'monthInChinese': lunar.getMonthInChinese() or '',
        'dayInChinese': lunar.getDayInChinese() or '',
        'chongDesc': lunar.getDayChongDesc() or '',
        'chongShengXiao': lunar.getDayChongShengXiao() or '',
        'sha': lunar.getDaySha() or '',
        'nineStar': str(lunar.getDayNineStar() or ''),
        'xunKong': lunar.getDayXunKong() or '',
        'positionTaiSuiDesc': lunar.getDayPositionTaiSuiDesc() or '',
        'positionXiDesc': lunar.getDayPositionXiDesc() or '',
        'positionYangGuiDesc': lunar.getDayPositionYangGuiDesc() or '',
        'positionYinGuiDesc': lunar.getDayPositionYinGuiDesc() or '',
        'positionCaiDesc': lunar.getDayPositionCaiDesc() or '',
        'positionFuDesc': lunar.getDayPositionFuDesc() or '',
        'lu': lunar.getDayLu() or '',
    }

if __name__ == '__main__':
    print(json.dumps(calc_day(sys.argv[1]), ensure_ascii=False))
`
}

function parseBirthDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate format' })
  }
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }
  return { year, month, day }
}

function parseQiguaTime(time?: string): Date {
  if (!time) return new Date()
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid qiguaTime' })
  }
  return d
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function queryLunarDay(dateStr: string): Promise<LunarDayInfo> {
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

export default defineEventHandler(async (event): Promise<CalcResult> => {
  const body = await readBody<CalcInput>(event)

  if (!body?.birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing birthDate' })
  }

  parseBirthDate(body.birthDate)
  const qiguaDate = parseQiguaTime(body.qiguaTime)
  const targetDate = formatDate(qiguaDate)
  const scenes = Array.isArray(body.scenes) ? body.scenes : []
  const customScene = body.customScene?.trim()
  const allScenes = customScene ? [...scenes, customScene] : scenes
  const locale = body.locale || 'zh-CN'

  // 用户四柱
  const userPillars = getUserPillars(body.birthDate, body.birthHour)

  // 目标日农历黄历信息
  const lunarDay = await queryLunarDay(targetDate)

  return {
    userGanzhi: {
      year: userPillars.year,
      month: userPillars.month,
      day: userPillars.day,
      hour: userPillars.hour,
    },
    targetDate,
    lunar: lunarDay,
    scenes: allScenes,
    locale,
  }
})
