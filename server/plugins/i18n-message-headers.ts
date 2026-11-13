export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    const { pathname } = new URL(getRequestURL(event))
    if (!/^\/_i18n\/[^/]+\/[^/]+\/messages\.json$/.test(pathname)) return

    setResponseHeaders(event, {
      'cache-control': 'public, max-age=31536000, immutable',
      vary: 'Accept-Encoding',
    })
  })
})
