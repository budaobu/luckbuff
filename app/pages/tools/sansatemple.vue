<template>
  <div class="sansatemple-page">
    <noscript>
      {{ t('sansatemple.noscript') }}
    </noscript>
    <ClientOnly>
      <SansatempleExperience />
      <template #fallback>
        <div class="sansatemple-loading">{{ t('sansatemple.opening') }}</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteName = runtimeConfig.public.siteName
const pageUrl = useLocalizedSeoUrl('/tools/sansatemple')

useSeoMeta({
  title: () => `${t('sansatemple.seo.title')} - ${siteName}`,
  description: () => t('sansatemple.seo.description'),
  ogTitle: () => `${t('sansatemple.seo.title')} - ${siteName}`,
  ogDescription: () => t('sansatemple.seo.description'),
  ogUrl: () => pageUrl.value,
})

useHead({
  meta: [
    { name: 'theme-color', content: '#101623' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: t('sansatemple.title'),
        description: t('sansatemple.seo.description'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        url: pageUrl.value,
        publisher: { '@type': 'Organization', name: siteName },
      }),
    },
  ],
})
</script>

<style scoped>
.sansatemple-page {
  min-height: 100dvh;
  background: #101623;
}

.sansatemple-loading {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  color: #ece7dd;
}
</style>
