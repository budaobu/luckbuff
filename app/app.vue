<script setup lang="ts">
import { zh_cn, zh_tw, en } from '@nuxt/ui/locale'

const { locale } = useI18n()
const config = useRuntimeConfig()
const colorMode = useColorMode()

const uiLocale = computed(() => {
  switch (locale.value) {
    case 'zh-TW': return zh_tw
    case 'en': return en
    case 'zh-CN':
    default: return zh_cn
  }
})

const baiduAnalyticsId = config.public.baiduAnalyticsId
const googleSiteVerification = config.public.googleSiteVerification

const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

useHead(() => ({
  htmlAttrs: {
    lang: head.value.htmlAttrs.lang,
    dir: head.value.htmlAttrs.dir,
  },
  link: [
    ...(head.value.link || []),
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: '',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap',
      media: 'print',
      onload: "this.media='all'",
    },
  ],
  script: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4898976797860512',
      async: true,
      defer: true,
      fetchpriority: 'low',
      crossorigin: 'anonymous',
    },
    ...(baiduAnalyticsId
      ? [
          {
            innerHTML: `(function(){var s=document.createElement("script");s.async=true;s.defer=true;s.src="https://hm.baidu.com/hm.js?${baiduAnalyticsId}";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(s,n);})();`,
            tagPosition: 'bodyClose',
          },
        ]
      : []),
  ],
  meta: [
    ...(head.value.meta || []),
    ...(googleSiteVerification
      ? [{ name: 'google-site-verification', content: googleSiteVerification }]
      : []),
  ],
}))
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
