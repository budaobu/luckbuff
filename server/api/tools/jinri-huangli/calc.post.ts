import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { GAN_WUXING, WUXING_KE, WUXING_SHENG } from '~/utils/bazi/constants'
import type { TodayAlmanac } from '~/types/today-almanac'

const PROJECT_ROOT = resolve(process.cwd())
const VENDOR_PATH = join(PROJECT_ROOT, '.cache', 'liuyao-engine', 'lunar_python_vendor.zip')
const VENV_PYTHON = join(PROJECT_ROOT, '.venv', 'bin', 'python')
const WUXING_COLORS: Record<string, string[]> = {
  木: ['绿色', '青色', '翠绿'],
  火: ['红色', '粉色', '紫色', '橙色'],
  土: ['黄色', '棕色', '卡其色', '米色'],
  金: ['白色', '金色', '银色', '杏色'],
  水: ['黑色', '蓝色', '灰色', '深蓝色'],
}

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

def compact(values):
    if isinstance(values, list):
        return values
    return [values] if values else []

def calc_day(date_str):
    d = datetime.strptime(date_str, '%Y-%m-%d').date()
    solar = Solar.fromYmd(d.year, d.month, d.day)
    lunar = solar.getLunar()
    next_jie_qi = lunar.getNextJieQi()

    hours = []
    for hour in lunar.getTimes():
        hours.append({
            'ganZhi': hour.getGanZhi(),
            'zhi': hour.getZhi(),
            'startTime': hour.getMinHm(),
            'endTime': hour.getMaxHm(),
            'tianShen': hour.getTianShen(),
            'luck': hour.getTianShenLuck(),
            'type': hour.getTianShenType(),
            'chongDesc': hour.getChongDesc(),
            'chongShengXiao': hour.getChongShengXiao(),
            'sha': hour.getSha(),
            'yi': compact(hour.getYi()),
            'ji': compact(hour.getJi()),
        })

    xiu = {
        'name': lunar.getXiu() or '',
        'luck': lunar.getXiuLuck() or '',
        'song': lunar.getXiuSong() or '',
        'zheng': lunar.getZheng() or '',
        'animal': lunar.getAnimal() or '',
        'gong': lunar.getGong() or '',
        'shou': lunar.getShou() or '',
    }

    return {
        'lunar': {
            'yearInChinese': lunar.getYearInChinese(),
            'monthInChinese': lunar.getMonthInChinese(),
            'dayInChinese': lunar.getDayInChinese(),
            'yearGanZhi': lunar.getYearInGanZhi(),
            'monthGanZhi': lunar.getMonthInGanZhi(),
            'dayGanZhi': lunar.getDayInGanZhi(),
            'yearNaYin': lunar.getYearNaYin() or '',
            'monthNaYin': lunar.getMonthNaYin() or '',
            'dayNaYin': lunar.getDayNaYin() or '',
            'shengXiao': lunar.getDayShengXiao() or '',
        },
        'yi': compact(lunar.getDayYi()),
        'ji': compact(lunar.getDayJi()),
        'jiShen': compact(lunar.getDayJiShen()),
        'xiongSha': compact(lunar.getDayXiongSha()),
        'tianShen': lunar.getDayTianShen() or '',
        'tianShenLuck': lunar.getDayTianShenLuck() or '平',
        'tianShenType': lunar.getDayTianShenType() or '黄道',
        'jianChu': lunar.getZhiXing() or '',
        'pengZuGan': lunar.getPengZuGan() or '',
        'pengZuZhi': lunar.getPengZuZhi() or '',
        'chongDesc': lunar.getDayChongDesc() or '',
        'chongShengXiao': lunar.getDayChongShengXiao() or '',
        'sha': lunar.getDaySha() or '',
        'xunKong': lunar.getDayXunKong() or '',
        'nineStar': str(lunar.getDayNineStar() or ''),
        'positions': {
            'taiSui': lunar.getDayPositionTaiSuiDesc() or '',
            'taiSuiDay': lunar.getDayPositionTaiSui() or '',
            'tai': lunar.getDayPositionTai() or '',
            'xi': lunar.getDayPositionXiDesc() or '',
            'yangGui': lunar.getDayPositionYangGuiDesc() or '',
            'yinGui': lunar.getDayPositionYinGuiDesc() or '',
            'cai': lunar.getDayPositionCaiDesc() or '',
            'fu': lunar.getDayPositionFuDesc() or '',
        },
        'xiu': xiu,
        'season': {
            'jieQi': lunar.getJieQi() or '',
            'nextJieQi': {
                'name': next_jie_qi.getName(),
                'date': next_jie_qi.getSolar().toYmd(),
            },
            'hou': lunar.getHou() or '',
            'wuHou': lunar.getWuHou() or '',
            'yueXiang': lunar.getYueXiang() or '',
        },
        'festivals': compact(solar.getFestivals()) + compact(solar.getOtherFestivals()) + compact(lunar.getFestivals()) + compact(lunar.getOtherFestivals()),
        'hours': hours,
    }

print(json.dumps(calc_day(sys.argv[1]), ensure_ascii=False))
`
}

function todayInShanghai(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function parseDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }
  const value = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(value.getTime()) || value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }
  return { year, month, day }
}

function queryEngine(date: string): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonInterpreter(), ['-c', buildPythonScript(), date], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, PYTHONPATH: VENDOR_PATH },
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (data: Buffer) => { stdout += data.toString('utf-8') })
    child.stderr.on('data', (data: Buffer) => { stderr += data.toString('utf-8') })
    child.on('close', (code) => {
      if (code !== 0) {
        reject(createError({ statusCode: 500, statusMessage: `Almanac engine error: ${stderr || stdout}`.slice(0, 240) }))
        return
      }
      try {
        resolve(JSON.parse(stdout.trim()))
      }
      catch {
        reject(createError({ statusCode: 500, statusMessage: 'Failed to parse almanac result' }))
      }
    })
    child.on('error', (error: Error) => {
      reject(createError({ statusCode: 500, statusMessage: `Failed to spawn almanac engine: ${error.message}` }))
    })
  })
}

function getShengWo(wuxing: string): string {
  for (const [from, to] of Object.entries(WUXING_SHENG)) {
    if (to === wuxing) return from
  }
  return wuxing
}

function getKeWo(wuxing: string): string {
  for (const [from, to] of Object.entries(WUXING_KE)) {
    if (to === wuxing) return from
  }
  return wuxing
}

function colorSet(wuxing: string, reason: string) {
  return {
    wuxing,
    colors: WUXING_COLORS[wuxing] || [],
    reason,
  }
}

export default defineEventHandler(async (event): Promise<TodayAlmanac> => {
  const body = await readBody<{ date?: string } | undefined>(event).catch(() => undefined)
  const date = body?.date || todayInShanghai()
  const parsed = parseDate(date)
  const engine = await queryEngine(date)
  const dayGan = String(engine.lunar?.dayGanZhi ?? '').slice(0, 1)
  const dayWuxing = GAN_WUXING[dayGan] || '木'
  const daJiWuxing = getShengWo(dayWuxing)
  const buYiWuxing = getKeWo(dayWuxing)

  return {
    date,
    isToday: date === todayInShanghai(),
    timezone: 'Asia/Shanghai',
    weekday: new Date(`${date}T12:00:00Z`).getUTCDay(),
    lunar: engine.lunar,
    yi: engine.yi || [],
    ji: engine.ji || [],
    jiShen: engine.jiShen || [],
    xiongSha: engine.xiongSha || [],
    tianShen: engine.tianShen || '',
    tianShenLuck: engine.tianShenLuck || '平',
    tianShenType: engine.tianShenType || '黄道',
    jianChu: engine.jianChu || '',
    pengZuGan: engine.pengZuGan || '',
    pengZuZhi: engine.pengZuZhi || '',
    chongDesc: engine.chongDesc || '',
    chongShengXiao: engine.chongShengXiao || '',
    sha: engine.sha || '',
    xunKong: engine.xunKong || '',
    nineStar: engine.nineStar || '',
    positions: engine.positions || {},
    xiu: engine.xiu || {},
    season: engine.season || {},
    festivals: engine.festivals || [],
    hours: engine.hours || [],
    colors: {
      dayWuxing,
      daJi: colorSet(daJiWuxing, `生当日五行${dayWuxing}，为大吉贵人色`),
      ciJi: colorSet(dayWuxing, `与当日五行${dayWuxing}相同，为次吉合作色`),
      buYi: colorSet(buYiWuxing, `克当日五行${dayWuxing}，为不宜消耗色`),
    },
  } satisfies TodayAlmanac
})
