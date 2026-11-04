<template>
  <div class="relative">
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-0">
      <div class="absolute top-[10%] left-[8%] w-[360px] h-[360px] rounded-full bg-[var(--accent)]/[0.04] blur-[120px]" />
      <div class="absolute bottom-[18%] right-[8%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.03] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-[780px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <WorkCheerWidget />

      <section v-reveal class="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6">
        <h2 class="text-base font-semibold text-[var(--text-primary)] mb-4">{{ $t('workCheer.faqTitle') }}</h2>
        <div class="space-y-4">
          <div v-for="index in 3" :key="index">
            <h3 class="text-sm font-medium text-[var(--text-primary)]">{{ $t(`workCheer.faq.q${index}`) }}</h3>
            <p class="mt-1 text-xs text-[var(--text-faint)] leading-relaxed">{{ $t(`workCheer.faq.a${index}`) }}</p>
          </div>
        </div>
      </section>

      <p class="mt-6 text-center text-[11px] text-[var(--text-faint)] leading-relaxed max-w-2xl mx-auto">
        {{ $t('workCheer.disclaimer') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const siteName = config.public.siteName
const siteUrl = useRequestURL().origin
const pagePath = '/tools/slaves-encourager'

const pageTitle = computed(() => `${t('seoWorkCheer.title')} - ${siteName}`)

useSeoMeta({
  title: pageTitle,
  description: () => t('seoWorkCheer.desc'),
  keywords: () => t('seoWorkCheer.keywords'),
  ogTitle: pageTitle,
  ogDescription: () => t('seoWorkCheer.desc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}${pagePath}`,
  twitterCard: 'summary_large_image',
})

useHead(() => {
  const currentPath = localePath(pagePath)
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || siteUrl

  return {
    link: [
      { rel: 'canonical', href: `${baseUrl}${currentPath}` },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: pageTitle.value,
          url: `${siteUrl}${pagePath}`,
          description: t('seoWorkCheer.desc'),
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          inLanguage: locale.value,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        }),
      },
    ],
  }
})
</script>
