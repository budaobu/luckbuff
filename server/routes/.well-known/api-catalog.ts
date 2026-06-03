export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/linkset+json')

  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://www.ososn.com'

  return {
    linkset: [
      {
        anchor: `${baseUrl}/api`,
        'service-desc': [
          { href: `${baseUrl}/api/openapi.json` },
        ],
        'service-doc': [
          { href: baseUrl },
        ],
        status: [
          { href: `${baseUrl}/api/ping` },
        ],
      },
    ],
  }
})
