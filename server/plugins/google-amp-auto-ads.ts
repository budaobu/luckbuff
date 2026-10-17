const AMP_AUTO_ADS_SCRIPT =
  '<script async custom-element="amp-auto-ads" src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"></script>'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const adClient = useRuntimeConfig(event).public.googleAdsenseClient?.trim()
    if (!adClient) return

    if (!/^ca-pub-\d+$/.test(adClient)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Invalid NUXT_PUBLIC_GOOGLE_ADSENSE_CLIENT',
      })
    }

    const autoAds = `<amp-auto-ads type="adsense" data-ad-client="${adClient}"></amp-auto-ads>`
    if (!html.head.includes(AMP_AUTO_ADS_SCRIPT)) {
      html.head.push(AMP_AUTO_ADS_SCRIPT)
    }
    if (!html.bodyPrepend.includes(autoAds)) {
      html.bodyPrepend.unshift(autoAds)
    }
  })
})
