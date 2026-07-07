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
  seo: true,
})

useHead(() => ({
  htmlAttrs: {
    lang: head.value.htmlAttrs.lang || 'zh-CN',
    dir: (head.value.htmlAttrs.dir || 'ltr') as 'ltr' | 'rtl' | 'auto',
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
            tagPosition: 'bodyClose' as const,
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
  <!-- 全局 SVG mask：三段圆弧凹角卡片 -->
  <svg width="0" height="0" class="absolute pointer-events-none" aria-hidden="true">
    <defs>
      <mask id="arcCardMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
        <rect width="1" height="1" fill="white" />
        <ellipse cx="0" cy="0" rx="0.06" ry="0.06" fill="black" />
        <ellipse cx="1" cy="0" rx="0.06" ry="0.06" fill="black" />
        <ellipse cx="1" cy="1" rx="0.06" ry="0.06" fill="black" />
        <ellipse cx="0" cy="1" rx="0.06" ry="0.06" fill="black" />
        <ellipse cx="0.03464" cy="0.02" rx="0.02" ry="0.02" fill="white" />
        <ellipse cx="0.02" cy="0.03464" rx="0.02" ry="0.02" fill="white" />
        <ellipse cx="0.96536" cy="0.02" rx="0.02" ry="0.02" fill="white" />
        <ellipse cx="0.98" cy="0.03464" rx="0.02" ry="0.02" fill="white" />
        <ellipse cx="0.96536" cy="0.98" rx="0.02" ry="0.02" fill="white" />
        <ellipse cx="0.98" cy="0.96536" rx="0.02" ry="0.02" fill="white" />
        <ellipse cx="0.03464" cy="0.98" rx="0.02" ry="0.02" fill="white" />
        <ellipse cx="0.02" cy="0.96536" rx="0.02" ry="0.02" fill="white" />
      </mask>
    </defs>
  </svg>

  <UApp :locale="uiLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
