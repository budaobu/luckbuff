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

def calc_month_days(start_date, end_date):
    start = datetime.strptime(start_date, '%Y-%m-%d').date()
    end = datetime.strptime(end_date, '%Y-%m-%d').date()

    days = []
    current = start
    while current <= end:
        solar = Solar.fromYmd(current.year, current.month, current.day)
        lunar = solar.getLunar()

        yi = lunar.getDayYi() or []
        ji = lunar.getDayJi() or []
        tian_shen_luck = lunar.getDayTianShenLuck() or ''

        days.append({
            'date': current.strftime('%Y-%m-%d'),
            'dayGanZhi': lunar.getDayInGanZhi(),
            'yi': yi,
            'ji': ji,
            'tianShenLuck': tian_shen_luck,
            'jieQi': lunar.getJieQi() or '',
            'monthInChinese': lunar.getMonthInChinese(),
            'dayInChinese': lunar.getDayInChinese(),
            'shengXiao': lunar.getDayShengXiao(),
            'fortuneLevel': 'ji' if tian_shen_luck == '吉' else ('xiong' if tian_shen_luck == '凶' else 'ping'),
        })
        current += timedelta(days=1)

    print(json.dumps(days, ensure_ascii=False))

if __name__ == '__main__':
    calc_month_days(sys.argv[1], sys.argv[2])
`
}

export default defineEventHandler(async (event) => {
  const { startDate, endDate } = await readBody<{ startDate: string; endDate: string }>(event)

  if (!startDate || !endDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw createError({ statusCode: 400, statusMessage: 'startDate and endDate (YYYY-MM-DD) are required' })
  }

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(pythonInterpreter(), ['-c', buildPythonScript(), startDate, endDate], {
      env: { ...process.env, PYTHONPATH: VENDOR_PATH },
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => { stdout += data.toString() })
    child.stderr.on('data', (data) => { stderr += data.toString() })

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('[FortuneCalendar Python Error]', stderr.slice(0, 500))
        rejectPromise(createError({ statusCode: 500, statusMessage: `Python error: ${stderr.slice(0, 200)}` }))
        return
      }
      try {
        const jsonLine = stdout.split('\n').find(l => l.trim().startsWith('['))
        if (!jsonLine) {
          rejectPromise(createError({ statusCode: 500, statusMessage: 'No data returned from engine' }))
          return
        }
        resolvePromise(JSON.parse(jsonLine))
      } catch (e: any) {
        rejectPromise(createError({ statusCode: 500, statusMessage: `Parse error: ${e.message}` }))
      }
    })

    child.on('error', (err) => {
      rejectPromise(createError({ statusCode: 500, statusMessage: `Spawn error: ${err.message}` }))
    })
  })
})
