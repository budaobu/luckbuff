import { getStrokeCountsWithAIFallback } from '../wuge/strokes'
import { ZHUGE_SHENQIAN } from './data'
import type { ZhugeCeziCharInfo, ZhugeCeziRequest, ZhugeCeziResult } from '~/types/zhuge-cezi'

function isChineseChar(char: string): boolean {
  if (!char || char.length !== 1) return false
  const cp = char.codePointAt(0) || 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

function strokeToDigit(strokes: number): number {
  if (strokes >= 1 && strokes <= 9) return strokes
  if (strokes % 10 === 0) return 1
  return strokes % 10
}

export async function calculateZhugeCezi(payload: ZhugeCeziRequest): Promise<ZhugeCeziResult> {
  const chars = payload.chars?.trim() || ''
  const question = payload.question?.trim() || ''

  if (!chars) {
    throw createError({ statusCode: 400, statusMessage: '请输入汉字' })
  }
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: '请填写所问事项' })
  }

  const charArray = Array.from(chars)
  if (charArray.length !== 3) {
    throw createError({ statusCode: 400, statusMessage: '请准确输入三个汉字' })
  }

  const invalidChars = charArray.filter(c => !isChineseChar(c))
  if (invalidChars.length > 0) {
    throw createError({ statusCode: 400, statusMessage: `包含非汉字字符：${invalidChars.join('、')}` })
  }

  let strokeMap: Record<string, number>
  try {
    strokeMap = await getStrokeCountsWithAIFallback(charArray)
  } catch (e: any) {
    if (e.statusCode === 400) throw e
    throw createError({ statusCode: 500, statusMessage: `笔画查询失败：${e?.message ?? e}` })
  }

  const charInfos: ZhugeCeziCharInfo[] = []
  for (const char of charArray) {
    const strokes = strokeMap[char]
    if (strokes === undefined) {
      throw createError({ statusCode: 400, statusMessage: `以下字的笔画数暂未收录，请换字：${char}` })
    }
    charInfos.push({ char, strokes, digit: strokeToDigit(strokes) })
  }

  const combinedNumber = charInfos[0]!.digit * 100 + charInfos[1]!.digit * 10 + charInfos[2]!.digit
  const qianNumber = ((combinedNumber - 1) % 384) + 1
  const qianText = ZHUGE_SHENQIAN[qianNumber - 1]
  if (!qianText) {
    throw createError({ statusCode: 500, statusMessage: '签文数据缺失' })
  }

  return {
    input: { chars, question },
    chars: charInfos,
    combinedNumber,
    qianNumber,
    qianText,
  }
}
