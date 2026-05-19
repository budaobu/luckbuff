<script setup lang="ts">
import { zh_cn, zh_tw, en } from '@nuxt/ui/locale'

const { locale } = useI18n()
const config = useRuntimeConfig()

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

useHead({
  script: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4898976797860512',
      async: true,
      crossorigin: 'anonymous',
    },
    ...(baiduAnalyticsId
      ? [
          {
            innerHTML: `var _hmt = _hmt || [];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?${baiduAnalyticsId}";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();`,
            tagPosition: 'bodyClose',
          },
        ]
      : []),
  ],
  meta: googleSiteVerification
    ? [{ name: 'google-site-verification', content: googleSiteVerification }]
    : [],
})
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
