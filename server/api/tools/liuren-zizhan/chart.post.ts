import { buildLiurenZizhanChart } from '~~/server/utils/liuren-zizhan/calc'

const CJK_RE = /^[一-鿿豈-﫿]$/

export default defineEventHandler(async (event) => {
  const body = await readBody<{ char?: string, questionTime?: string }>(event)

  const char = (body?.char || '').trim()
  if (!CJK_RE.test(char)) {
    throw createError({ statusCode: 400, statusMessage: '请写一个汉字（单字）' })
  }

  try {
    return await buildLiurenZizhanChart(char, body?.questionTime)
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: err?.message || '起课失败' })
  }
})
