import { isValidSlug, readInsightRaw, type TranslationLang } from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { getTranslationOverview } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler(async (event) => {
  checkInsightsAdminAuth(event)

  const slug = getRouterParam(event, 'slug') || ''
  if (!isValidSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const lang = getRouterParam(event, 'lang') as TranslationLang
  if (lang !== 'en' && lang !== 'zh-tw') {
    throw createError({ statusCode: 400, statusMessage: '不支持的语言' })
  }

  const article = readInsightRaw(slug, lang)
  if (!article) throw createError({ statusCode: 404, statusMessage: '该语言版本不存在' })

  const source = readInsightRaw(slug, 'zh-CN')
  if (!source) throw createError({ statusCode: 404, statusMessage: '源文章不存在' })

  return {
    ...article,
    translations: getTranslationOverview(slug, computeSourceHash(source)),
  }
})
