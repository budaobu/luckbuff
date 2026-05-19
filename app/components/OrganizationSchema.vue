<script setup lang="ts">
const { t } = useI18n()

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ososn',
  alternateName: 'LuckBuff',
  url: 'https://www.ososn.com',
  logo: 'https://www.ososn.com/icon.png',
  description: t('organizationSchema.description'),
  sameAs: [],
}
</script>

<template>
  <JsonLd :schema="organizationSchema" />
</template>
