import { checkInsightsAdminAuth } from '~~/server/utils/insights-admin-auth'
import { getPageViewStats } from '~~/server/utils/page-views'

export default defineEventHandler((event) => {
  checkInsightsAdminAuth(event)

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return {
    tools: getPageViewStats('tool'),
    hubs: getPageViewStats('hub'),
    submits: getPageViewStats('tool-submit'),
  }
})
