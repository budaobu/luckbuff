import { listInsightSlugs, readInsightRaw, TRANSLATION_LANGS } from '~~/server/utils/insights'
import { computeSourceHash } from '~~/server/utils/insights/hash'
import { startTranslationRetry } from '~~/server/utils/insights/translate'
import { getTranslationOverview } from '~~/server/utils/insights/translation-state'
import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)

  const failed = listInsightSlugs()
    .flatMap((slug) => {
      const source = readInsightRaw(slug, 'zh-CN')
      if (!source) return []
      const overview = getTranslationOverview(slug, computeSourceHash(source))
      return TRANSLATION_LANGS
        .map(lang => ({ slug, lang, status: overview[lang].status, updatedAt: overview[lang].updatedAt }))
        .filter(item => item.status === 'failed')
    })
    .sort((a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''))
    .map(({ slug, lang }) => ({ slug, lang }))

  const status = startTranslationRetry(failed)
  return { ok: true, queued: status.running ? status.total - status.completed : failed.length, status }
})
