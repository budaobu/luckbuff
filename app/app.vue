<script setup lang="ts">
import { zh_cn, zh_tw, en, ja, ko } from '@nuxt/ui/locale'

// useLocaleHead emits both primary (`ja`) and regional (`ja-JP`) tags for the
// same page. Keep the tag that matches the rendered document language.
function dedupeAlternateLinks<T extends { rel?: string; href?: string; hreflang?: string }>(
  links: T[],
  documentLanguage: string,
): T[] {
  const localeFamilies = new Map<string, Map<string, T>>()
  for (const link of links) {
    if (link.rel !== 'alternate' || !link.href || !link.hreflang) continue
    const hrefFamilies = localeFamilies.get(link.href) ?? new Map()
    const primaryLanguage = link.hreflang.split('-')[0] || ''
    const family = hrefFamilies.get(primaryLanguage)

    if (!family) {
      hrefFamilies.set(primaryLanguage, link)
      localeFamilies.set(link.href, hrefFamilies)
      continue
    }

    if (link.hreflang === documentLanguage || family.hreflang !== documentLanguage) {
      hrefFamilies.set(primaryLanguage, link)
    }
  }

  return links.filter((link) => {
    const hreflang = link.hreflang
    const href = link.href || ''
    const primaryLanguage = (hreflang || '').split('-')[0] || ''
    return link.rel !== 'alternate' || !hreflang || hreflang === 'x-default'
      || localeFamilies.get(href)?.get(primaryLanguage) === link
  })
}

const { locale } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()

const uiLocale = computed(() => {
  switch (locale.value) {
    case 'zh-TW': return zh_tw
    case 'en': return en
    case 'ja': return ja
    case 'ko': return ko
    case 'zh-CN':
    default: return zh_cn
  }
})

const googleTagManagerId = config.public.googleTagManagerId?.trim()
const googleSiteVerification = config.public.googleSiteVerification
const googleAdsenseClient = config.public.googleAdsenseClient?.trim()

const head = useLocaleHead({
  seo: true,
})

useHead(() => {
  const documentLanguage = head.value.htmlAttrs.lang || 'zh-CN'
  const alternateLinks = dedupeAlternateLinks(head.value.link, documentLanguage)

  return {
  htmlAttrs: {
    lang: documentLanguage,
    dir: (head.value.htmlAttrs.dir || 'ltr') as 'ltr' | 'rtl' | 'auto',
  },
  link: alternateLinks,
  script: [
    ...(googleAdsenseClient
      ? [{
          src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseClient}`,
          async: true,
          crossorigin: 'anonymous' as const,
          tagPosition: 'head' as const,
        }]
      : []),
    ...(googleTagManagerId
      ? [
          {
            src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(googleTagManagerId)}`,
            async: true,
            tagPosition: 'head' as const,
          },
          {
            innerHTML: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());`,
            tagPosition: 'head' as const,
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
  }
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
