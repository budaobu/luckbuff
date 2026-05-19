<script setup lang="ts">
const { t } = useI18n()

const faqSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: t('home.faq1Q'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t('home.faq1A'),
      },
    },
    {
      '@type': 'Question',
      name: t('home.faq2Q'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t('home.faq2A'),
      },
    },
    {
      '@type': 'Question',
      name: t('home.faq3Q'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t('home.faq3A'),
      },
    },
    {
      '@type': 'Question',
      name: t('home.faq4Q'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t('home.faq4A'),
      },
    },
    {
      '@type': 'Question',
      name: t('home.faq5Q'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t('home.faq5A'),
      },
    },
    {
      '@type': 'Question',
      name: t('home.faq6Q'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t('home.faq6A'),
      },
    },
    {
      '@type': 'Question',
      name: t('home.faq7Q'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t('home.faq7A'),
      },
    },
  ],
}))
</script>

<template>
  <JsonLd :schema="faqSchema" />
</template>
