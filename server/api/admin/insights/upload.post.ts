import { saveInsightImage } from '~~/server/utils/insights'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: '没有收到图片文件' })
  }

  try {
    const path = saveInsightImage(file.filename!, file.data)
    return { ok: true, path }
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : '上传失败' })
  }
})
