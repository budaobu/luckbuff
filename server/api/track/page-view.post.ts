import { PAGE_VIEW_TYPES, recordPageView } from '~~/server/utils/page-views'

// 工具页/专题页浏览上报。与文章 view 接口同风格：无鉴权、计数失败静默。
export default defineEventHandler(async (event) => {
  const body = await readBody<{ type?: string; slug?: string }>(event).catch(() => null)
  const type = body?.type
  const slug = body?.slug
  if (
    !type
    || !(PAGE_VIEW_TYPES as readonly string[]).includes(type)
    || type === 'tool-submit'
    || typeof slug !== 'string'
    || !/^[\w-]{1,80}$/.test(slug)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const total = recordPageView(type as 'tool' | 'hub', slug)
  return { total }
})
