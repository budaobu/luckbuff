export default defineEventHandler((event) => {
  const url = new URL(getRequestURL(event))
  const segments = url.pathname.split('/')
  const graphIndex = segments.indexOf('graph')
  const graphSlug = segments[graphIndex + 1]

  if (graphIndex === -1 || !graphSlug?.includes('_')) return

  segments[graphIndex + 1] = graphSlug.replace(/_/g, '-')
  return sendRedirect(event, `${segments.join('/')}${url.search}`, 301)
})
