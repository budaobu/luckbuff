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
  shengXiao: string
  luck: string
  tianShenType: string
  pianCaiShengXiao: string
}

interface WealthPosition {
  name: string
  direction: string
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  queryDate: string
  lunar: {
    date: string
    lunarDate: string
    yearGanZhi: string
    monthGanZhi: string
    dayGanZhi: string
    dayGan: string
    dayZhi: DiZhi
    dayShengXiao: string
  }
  pianCaiShengXiao: string[]
  wealthPositions: WealthPosition[]
  jiShiHours: HourInfo[]
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
            'shengXiao': hl.getTimeShengXiao(),
            'luck': hl.getTimeTianShenLuck(),
            'tianShenType': hl.getTimeTianShenType(),
        })

    return {
        'date': date_str,
        'lunarDate': lunar.toString(),
        'yearGanZhi': lunar.getYearInGanZhi(),
        'monthGanZhi': lunar.getMonthInGanZhi(),
        'dayGanZhi': lunar.getDayInGanZhi(),
        'dayGan': lunar.getDayGan(),
        'dayZhi': lunar.getDayZhi(),
        'dayShengXiao': lunar.getDayShengXiao(),
        'positionCaiDesc': lunar.getDayPositionCaiDesc(),
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

async function queryLunarDay(dateStr: string): Promise<{
  date: string
  lunarDate: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  dayGan: string
  dayZhi: string
  dayShengXiao: string
  positionCaiDesc: string
  hours: Array<{
    zhi: string
    shengXiao: string
    luck: string
    tianShenType: string
  }>
}> {
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

// 地支三合
const SAN_HE: DiZhi[][] = [
  ['申', '子', '辰'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
  ['亥', '卯', '未'],
]

// 地支六合
const LIU_HE: Array<[DiZhi, DiZhi]> = [
  ['子', '丑'],
  ['寅', '亥'],
  ['卯', '戌'],
  ['辰', '酉'],
  ['巳', '申'],
  ['午', '未'],
]

// 地支相冲
const LIU_CHONG: Array<[DiZhi, DiZhi]> = [
  ['子', '午'],
  ['丑', '未'],
  ['寅', '申'],
  ['卯', '酉'],
  ['辰', '戌'],
  ['巳', '亥'],
]

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

const GAN_WUXING: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

const GAN_YANG: Record<string, boolean> = {
  甲: true, 乙: false, 丙: true, 丁: false, 戊: true,
  己: false, 庚: true, 辛: false, 壬: true, 癸: false,
}

// 天干对应求财方位（传统纳甲/财神方位歌诀）
const GAN_DIRECTION: Record<string, string> = {
  甲: '东北方',
  乙: '西南方',
  丙: '正西方',
  丁: '正西方',
  戊: '正北方',
  己: '正北方',
  庚: '正东方',
  辛: '正东方',
  壬: '正南方',
  癸: '正南方',
}

function otherInPair(pairs: Array<[DiZhi, DiZhi]>, zhi: DiZhi): DiZhi | null {
  for (const [a, b] of pairs) {
    if (a === zhi) return b
    if (b === zhi) return a
  }
  return null
}

function othersInGroup(groups: DiZhi[][], zhi: DiZhi): DiZhi[] {
  const targets: DiZhi[] = []
  for (const group of groups) {
    if (group.includes(zhi)) {
      targets.push(...group.filter(item => item !== zhi))
    }
  }
  return targets
}

// 计算今日偏财运好的生肖：日支三合 + 六合，排除相冲生肖
function calcPianCaiShengXiao(dayZhi: DiZhi): string[] {
  const sanhe = othersInGroup(SAN_HE, dayZhi)
  const liuhe = otherInPair(LIU_HE, dayZhi)
  const chong = otherInPair(LIU_CHONG, dayZhi)

  const zhiSet = new Set<DiZhi>(sanhe)
  if (liuhe) zhiSet.add(liuhe)
  if (chong) zhiSet.delete(chong)
  zhiSet.delete(dayZhi)

  return Array.from(zhiSet).map(z => SHENG_XIAO[z])
}

// 根据日干推算正财/偏财方位：我克者为财，阴阳异性为正财，同性为偏财。
// 这里使用传统天干求财方位歌诀直接映射正财/偏财天干到具体方位。
function calcWealthPositions(dayGan: string): WealthPosition[] {
  const isYang = GAN_YANG[dayGan]

  // 正财天干：与日干阴阳异性且被日干克
  const zhengCaiGan = (() => {
    const ganList = Object.keys(GAN_YANG)
    return ganList.find(g => {
      if (GAN_WUXING[g] !== GAN_WUXING[dayGan] && GAN_WUXING[g] !== undefined) {
        // 我克者为财：日干五行克目标天干五行
        const wx = GAN_WUXING[dayGan]!
        const targetWx = GAN_WUXING[g]!
        const ke: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
        if (ke[wx] === targetWx) {
          return GAN_YANG[g] !== isYang
        }
      }
      return false
    }) || dayGan
  })()

  const pianCaiGan = (() => {
    const ganList = Object.keys(GAN_YANG)
    return ganList.find(g => {
      if (g === zhengCaiGan) return false
      if (GAN_WUXING[g] !== GAN_WUXING[dayGan] && GAN_WUXING[g] !== undefined) {
        const wx = GAN_WUXING[dayGan]!
        const targetWx = GAN_WUXING[g]!
        const ke: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
        if (ke[wx] === targetWx) {
          return GAN_YANG[g] === isYang
        }
      }
      return false
    }) || dayGan
  })()

  return [
    { name: '偏财位', direction: GAN_DIRECTION[pianCaiGan] || '中央' },
    { name: '正财位', direction: GAN_DIRECTION[zhengCaiGan] || '中央' },
  ]
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

  const dayZhi = lunarDay.dayZhi as DiZhi
  const dayGan = lunarDay.dayGan
  const wealthPositions = calcWealthPositions(dayGan)
  const caiPosition = lunarDay.positionCaiDesc

  const hours: HourInfo[] = lunarDay.hours.map((h) => {
    const zhi = h.zhi as DiZhi
    const liuhe = otherInPair(LIU_HE, zhi)
    return {
      zhi,
      timeRange: SHI_CHEN_RANGE[zhi],
      shengXiao: h.shengXiao,
      luck: h.luck,
      tianShenType: h.tianShenType,
      pianCaiShengXiao: liuhe ? SHENG_XIAO[liuhe] : h.shengXiao,
    }
  })

  const jiShiHours = hours.filter(h => h.luck === '吉')

  return {
    userGanzhi: {
      year: userPillars.year,
      month: userPillars.month,
      day: userPillars.day,
      hour: userPillars.hour,
    },
    queryDate: body.queryDate,
    lunar: {
      date: lunarDay.date,
      lunarDate: lunarDay.lunarDate,
      yearGanZhi: lunarDay.yearGanZhi,
      monthGanZhi: lunarDay.monthGanZhi,
      dayGanZhi: lunarDay.dayGanZhi,
      dayGan,
      dayZhi,
      dayShengXiao: lunarDay.dayShengXiao,
    },
    pianCaiShengXiao: calcPianCaiShengXiao(dayZhi),
    wealthPositions: [
      ...wealthPositions,
      { name: '财神位', direction: caiPosition.endsWith('方') || caiPosition === '中央' ? caiPosition : `${caiPosition}方` },
    ],
    jiShiHours,
    locale,
  }
})
