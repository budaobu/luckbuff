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
import hashlib
import random
from datetime import datetime

sys.path.insert(0, '${VENDOR_PATH.replace(/\\/g, '\\\\')}')
from lunar_python import Solar

def compact(values):
    if isinstance(values, list):
        return values
    return [values] if values else []

TIANGAN = "甲乙丙丁戊己庚辛壬癸"

TG_VAL = {'甲': 9, '己': 9, '乙': 8, '庚': 8, '丙': 7, '辛': 7,
          '丁': 6, '壬': 6, '戊': 5, '癸': 5}
DZ_VAL = {'子': 9, '午': 9, '丑': 8, '未': 8, '寅': 7, '申': 7,
          '卯': 6, '酉': 6, '辰': 5, '戌': 5, '巳': 4, '亥': 4}

SHENG = {'木': '火', '火': '土', '土': '金', '金': '水', '水': '木'}
GAN_WUXING = {'甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
              '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'}

def get_jdn(year, month, day):
    a = (14 - month) // 12
    y = year + 4800 - a
    m = month + 12 * a - 3
    return day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045

def get_wuxing_by_tail(num):
    tail = num % 10
    if tail in [1, 6]: return '水'
    if tail in [2, 7]: return '火'
    if tail in [3, 8]: return '木'
    if tail in [4, 9]: return '金'
    return '土'

def generate_jishu(current_date, gan, zhi):
    jdn = get_jdn(current_date.year, current_date.month, current_date.day)
    s_val = TG_VAL[gan] + DZ_VAL[zhi] + DZ_VAL['午']
    nine_star = (jdn % 9) + 1
    jianchu = (jdn % 12) + 1
    seed_str = f"{current_date.year}-{current_date.month}-{current_date.day}-{s_val}-{nine_star}-{jianchu}"
    seed = int(hashlib.sha256(seed_str.encode('utf-8')).hexdigest(), 16)

    g_wx = GAN_WUXING[gan]
    target_wx = {g_wx, SHENG[g_wx]}
    pool = [n for n in range(1, 50) if get_wuxing_by_tail(n) in target_wx]
    if len(pool) < 5:
        pool = list(range(1, 50))

    rng = random.Random(seed)
    rng.shuffle(pool)
    return sorted(pool[:5]), s_val

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
    lucky_numbers, guigu_value = generate_jishu(
        d,
        lunar.getDayGan(),
        lunar.getDayZhi(),
    )

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
        'dayLu': lunar.getDayLu() or '',
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
        'luckyNumbers': lucky_numbers,
        'guiguValue': guigu_value,
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

const BRANCH_ZODIAC: Record<string, string> = {
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

const NOBLE_BRANCHES: Record<string, string[]> = {
  甲: ['丑', '未'],
  戊: ['丑', '未'],
  庚: ['丑', '未'],
  乙: ['子', '申'],
  己: ['子', '申'],
  丙: ['亥', '酉'],
  丁: ['亥', '酉'],
  壬: ['卯', '巳'],
  癸: ['卯', '巳'],
  辛: ['午', '寅'],
}

const SIX_HARMONY: Record<string, string> = {
  子: '丑',
  丑: '子',
  寅: '亥',
  亥: '寅',
  卯: '戌',
  戌: '卯',
  辰: '酉',
  酉: '辰',
  巳: '申',
  申: '巳',
  午: '未',
  未: '午',
}

const THREE_HARMONY_GROUPS = [
  ['申', '子', '辰'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
  ['亥', '卯', '未'],
]

function buildNobleHours(dayGan: string, hours: Array<Record<string, any>>) {
  const branches = NOBLE_BRANCHES[dayGan] || []
  return hours
    .filter(hour => branches.includes(String(hour.zhi || '')))
    .map(hour => ({
      branch: String(hour.zhi || ''),
      label: `${String(hour.zhi || '')}时`,
      startTime: String(hour.startTime || ''),
      endTime: String(hour.endTime || ''),
      ganZhi: String(hour.ganZhi || ''),
      tianShen: String(hour.tianShen || ''),
      luck: (hour.luck || '平') as '吉' | '凶' | '平',
    }))
}

function buildLuckyZodiacs(dayZhi: string) {
  const values: Array<{ zodiac: string; relation: '六合' | '三合' }> = []
  const sixBranch = SIX_HARMONY[dayZhi]
  if (sixBranch) {
    values.push({ zodiac: BRANCH_ZODIAC[sixBranch] || '', relation: '六合' })
  }

  for (const group of THREE_HARMONY_GROUPS) {
    if (group.includes(dayZhi)) {
      for (const branch of group) {
        if (branch !== dayZhi) {
          values.push({ zodiac: BRANCH_ZODIAC[branch] || '', relation: '三合' })
        }
      }
    }
  }

  return values.filter(item => item.zodiac)
}

export default defineEventHandler(async (event): Promise<TodayAlmanac> => {
  const body = await readBody<{ date?: string } | undefined>(event).catch(() => undefined)
  const date = body?.date || todayInShanghai()
  const parsed = parseDate(date)
  const engine = await queryEngine(date)
  const dayGan = String(engine.lunar?.dayGanZhi ?? '').slice(0, 1)
  const dayZhi = String(engine.lunar?.dayGanZhi ?? '').slice(-1)
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
    dayLu: String(engine.dayLu || ''),
    taiShen: String(engine.positions?.tai || ''),
    nobleHours: buildNobleHours(dayGan, engine.hours || []),
    luckyZodiacs: buildLuckyZodiacs(dayZhi),
    luckyNumbers: Array.isArray(engine.luckyNumbers)
      ? engine.luckyNumbers.filter((value: unknown): value is number => Number.isInteger(value))
      : [],
    dailyVerse: {
      source: '二十八宿诗',
      text: String(engine.xiu?.song || ''),
    },
    colors: {
      dayWuxing,
      daJi: colorSet(daJiWuxing, `生当日五行${dayWuxing}，为大吉贵人色`),
      ciJi: colorSet(dayWuxing, `与当日五行${dayWuxing}相同，为次吉合作色`),
      buYi: colorSet(buYiWuxing, `克当日五行${dayWuxing}，为不宜消耗色`),
    },
  } satisfies TodayAlmanac
})
