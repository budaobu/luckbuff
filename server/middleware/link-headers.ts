import { defineEventHandler, getRequestURL, getMethod, setResponseHeader } from 'h3'

const HOMEPAGE_PATHS = new Set(['/', '/en', '/zh-TW'])

const LINK_HEADER = [
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</privacy>; rel="privacy-policy"',
  '</terms>; rel="terms-of-service"',
].join(', ')

export default defineEventHandler((event) => {
  if (getMethod(event) !== 'GET') return

  const { pathname } = getRequestURL(event)
  const normalized = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname

  if (!HOMEPAGE_PATHS.has(normalized)) return

  setResponseHeader(event, 'Link', LINK_HEADER)
})
