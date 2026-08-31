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
const googleAdsenseClient = config.public.googleAdsenseClient?.trim()

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
  ],
  meta: [
    ...(head.value.meta || []),
    ...(googleSiteVerification
      ? [{ name: 'google-site-verification', content: googleSiteVerification }]
      : []),
  ],
}))

const interactionController = ref<AbortController | null>(null)

function loadThirdPartyScripts() {
  if (interactionController.value) {
    interactionController.value.abort()
    interactionController.value = null
  }

  if (googleAdsenseClient) {
    const adsScript = document.createElement('script')
    adsScript.async = true
    adsScript.crossOrigin = 'anonymous'
    adsScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseClient}`
    document.head.appendChild(adsScript)
  }

  if (baiduAnalyticsId) {
    const analyticsScript = document.createElement('script')
    analyticsScript.async = true
    analyticsScript.defer = true
    analyticsScript.src = `https://hm.baidu.com/hm.js?${baiduAnalyticsId}`
    document.head.appendChild(analyticsScript)
  }
}

onMounted(() => {
  const controller = new AbortController()
  interactionController.value = controller
  const options: AddEventListenerOptions = { signal: controller.signal, passive: true }

  for (const event of ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const) {
    window.addEventListener(event, loadThirdPartyScripts, { ...options, once: true })
  }
})

onBeforeUnmount(() => {
  interactionController.value?.abort()
  interactionController.value = null
})
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
