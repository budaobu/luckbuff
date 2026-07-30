import { calcBazhai, type BazhaiResult, type Gender } from '~/utils/bazhai'

/**
 * 「看风水」综合堪舆工具的确定性排盘端点。
 *
 * 复用八宅引擎（~/utils/bazhai）：命卦、宅卦、八宫星曜排盘全部确定性计算，
 * AI 只负责解读（reading.post.ts），不参与排盘。
 * 与 tools/bazhai-fengshui/calc.post.ts 的区别：输入带完整出生日期（按立春
 * 调整命卦年份）与建造/入住年份（返回参考元运）。
 */
export interface KanyuCalcResult extends BazhaiResult {
  birthDate: string
  birthHour: string | null
  effectiveBirthYear: number
  facingMountain: string | null
  sittingMountainName: string | null
  period: { number: number; name: string; startYear: number; endYear: number }
}

const PERIODS: { number: number; name: string; startYear: number; endYear: number }[] = [
  { number: 1, name: '一运', startYear: 1864, endYear: 1883 },
  { number: 2, name: '二运', startYear: 1884, endYear: 1903 },
  { number: 3, name: '三运', startYear: 1904, endYear: 1923 },
  { number: 4, name: '四运', startYear: 1924, endYear: 1943 },
  { number: 5, name: '五运', startYear: 1944, endYear: 1963 },
  { number: 6, name: '六运', startYear: 1964, endYear: 1983 },
  { number: 7, name: '七运', startYear: 1984, endYear: 2003 },
  { number: 8, name: '八运', startYear: 2004, endYear: 2023 },
  { number: 9, name: '九运', startYear: 2024, endYear: 2043 },
]

function getPeriod(year: number) {
  return PERIODS.find(p => year >= p.startYear && year <= p.endYear) ?? PERIODS[PERIODS.length - 1]!
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    gender: Gender
    birthDate: string
    birthHour?: string
    direction: number
    buildYear?: number
    moveInYear?: number
    locale?: string
  }>(event)

  if (body == null || !body.gender || !body.birthDate || typeof body.direction !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid gender/birthDate/direction' })
  }
  if (!Number.isFinite(body.direction) || body.direction < 0 || body.direction > 360) {
    throw createError({ statusCode: 400, statusMessage: 'Direction must be in [0, 360]' })
  }

  const date = new Date(body.birthDate)
  if (Number.isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid birthDate' })
  }

  // 命卦以立春（约 2 月 4 日）为岁首：立春前出生按上一年计
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const effectiveBirthYear = date.getUTCFullYear() - (month < 2 || (month === 2 && day < 4) ? 1 : 0)

  const locale = body.locale || 'zh-CN'
  const result = calcBazhai(body.direction, effectiveBirthYear, body.gender, locale)

  const kanyuResult: KanyuCalcResult = {
    ...result,
    birthYear: date.getUTCFullYear(),
    birthDate: body.birthDate,
    birthHour: body.birthHour || null,
    effectiveBirthYear,
    facingMountain: result.mountain ? `${result.mountain.name}（${result.mountain.palace}）` : null,
    sittingMountainName: result.sittingMountain ? `${result.sittingMountain.name}（${result.sittingMountain.palace}）` : null,
    period: getPeriod(body.moveInYear ?? body.buildYear ?? new Date().getFullYear()),
  }

  return kanyuResult
})
