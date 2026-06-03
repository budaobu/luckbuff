export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://www.ososn.com'

  return {
    resource: `${baseUrl}/api`,
    authorization_servers: [baseUrl],
    scopes_supported: ['read', 'write'],
  }
})
