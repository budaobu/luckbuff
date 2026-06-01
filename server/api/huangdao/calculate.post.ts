import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

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

def calc_huangdao(start_date, end_date, matter_keywords):
    start = datetime.strptime(start_date, '%Y-%m-%d').date()
    end = datetime.strptime(end_date, '%Y-%m-%d').date()
    keywords = [k.strip() for k in matter_keywords.split(',')] if matter_keywords else []

    days = []
    current = start
    while current <= end:
        solar = Solar.fromYmd(current.year, current.month, current.day)
        lunar = solar.getLunar()

        yi = lunar.getDayYi() or []
        ji = lunar.getDayJi() or []
        ji_shen = lunar.getDayJiShen() or []
        tian_shen = lunar.getDayTianShen() or ''
        tian_shen_luck = lunar.getDayTianShenLuck() or ''

        # 计算匹配度：事项关键词在"宜"中的匹配
        match_score = 0
        if keywords:
            for kw in keywords:
                if any(kw in y for y in yi):
                    match_score += 30
                if any(kw in j for j in ji):
                    match_score -= 20
        else:
            match_score = 50

        # 吉神加分
        match_score += min(len(ji_shen) * 5, 20)
        if tian_shen_luck == '吉':
            match_score += 10
        elif tian_shen_luck == '凶':
            match_score -= 10

        # 判断是否吉日：宜中有匹配且没有明显冲突
        is_auspicious = len(yi) > 0 and match_score >= 30

        days.append({
            'date': current.strftime('%Y-%m-%d'),
            'yearGanZhi': lunar.getYearInGanZhi(),
            'monthGanZhi': lunar.getMonthInGanZhi(),
            'dayGanZhi': lunar.getDayInGanZhi(),
            'yearNaYin': lunar.getYearNaYin() or '',
            'monthNaYin': lunar.getMonthNaYin() or '',
            'naYin': lunar.getDayNaYin(),
            'week': lunar.getWeekInChinese(),
            'yi': yi,
            'ji': ji,
            'jiShen': ji_shen,
            'xiongSha': lunar.getDayXiongSha() or [],
            'tianShen': tian_shen,
            'tianShenLuck': tian_shen_luck,
            'tianShenType': lunar.getDayTianShenType() or '',
            'jieQi': lunar.getJieQi() or '',
            'shengXiao': lunar.getDayShengXiao(),
            'isAuspicious': is_auspicious,
            'matchScore': max(0, min(100, match_score)),
            # 农历
            'monthInChinese': lunar.getMonthInChinese(),
            'dayInChinese': lunar.getDayInChinese(),
            # 冲煞
            'chongDesc': lunar.getDayChongDesc() or '',
            'chongShengXiao': lunar.getDayChongShengXiao() or '',
            'sha': lunar.getDaySha() or '',
            # 九星、旬空
            'nineStar': str(lunar.getDayNineStar() or ''),
            'xunKong': lunar.getDayXunKong() or '',
            # 方位
            'positionTaiSuiDesc': lunar.getDayPositionTaiSuiDesc() or '',
            'positionXiDesc': lunar.getDayPositionXiDesc() or '',
            'positionYangGuiDesc': lunar.getDayPositionYangGuiDesc() or '',
            'positionYinGuiDesc': lunar.getDayPositionYinGuiDesc() or '',
            'positionCaiDesc': lunar.getDayPositionCaiDesc() or '',
            'positionFuDesc': lunar.getDayPositionFuDesc() or '',
            # 禄
            'lu': lunar.getDayLu() or '',
        })

        current += timedelta(days=1)

    # 按匹配度排序，只返回前 15 个最吉日
    days.sort(key=lambda d: d['matchScore'], reverse=True)
    top_days = [d for d in days if d['isAuspicious']][:15]
    # 如果吉日不足，补充非吉日中最匹配的前几个
    if len(top_days) < 5:
        non_auspicious = [d for d in days if not d['isAuspicious']]
        top_days.extend(non_auspicious[:5 - len(top_days)])

    # 按日期排序返回
    top_days.sort(key=lambda d: d['date'])
    print(json.dumps(top_days, ensure_ascii=False))

if __name__ == '__main__':
    calc_huangdao(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else '')
`
}

export default defineEventHandler(async (event) => {
  const { startDate, endDate, matter = '' } = await readBody<{
    startDate: string
    endDate: string
    matter?: string
  }>(event)

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing date range' })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }

  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (daysDiff < 0) {
    throw createError({ statusCode: 400, statusMessage: 'End date must be after start date' })
  }
  if (daysDiff > 365) {
    throw createError({ statusCode: 400, statusMessage: 'Date range too large (max 365 days)' })
  }

  // 将事项转换为关键词匹配
  const matterMap: Record<string, string> = {
    '搬家入宅': '移徙,入宅',
    '订婚结婚': '嫁娶,纳采,订盟',
    '开业启动': '开市,开业,开工,立券,交易',
    '签约合作': '订盟,签约,交易,立券',
    '出行赴任': '出行,赴任,移徙',
    '就医手术': '求医,治病,疗病',
    '考试学习': '入学,考试,求学,冠笄',
  }

  let keywords = matter
  for (const [key, value] of Object.entries(matterMap)) {
    if (matter.includes(key)) {
      keywords = value
      break
    }
  }

  const script = buildPythonScript()

  return new Promise((resolve, reject) => {
    const child = spawn(pythonInterpreter(), ['-c', script, startDate, endDate, keywords], {
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
      } catch {
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
})
