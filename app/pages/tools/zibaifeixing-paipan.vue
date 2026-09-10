<template>
  <div class="zpx-page">
    <div class="zpx-container">
      <header class="zpx-header">
        <div>
          <p class="zpx-eyebrow">Purple White Flying Stars</p>
          <h1 class="zpx-title">{{ $t('zibaifeixingPaipan.title') }}</h1>
          <p class="zpx-subtitle">{{ $t('zibaifeixingPaipan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="zpx-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="zpx-form-wrap">
        <div class="zpx-card zpx-form">
          <h2 class="zpx-card-title">{{ $t('zibaifeixingPaipan.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-gender="false"
            :show-name="false"
            :show-former-name="false"
            :show-birth-province="true"
            require-hour
            use-time-index
            :submit-label="$t('zibaifeixingPaipan.submit')"
            @submit="handleSubmit"
          />
        </div>
        <div class="zpx-hints">
          <article class="zpx-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('zibaifeixingPaipan.timeHint') }}</p>
          </article>
          <article class="zpx-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('zibaifeixingPaipan.locationHint') }}</p>
          </article>
          <article class="zpx-hint">
            <UIcon name="i-heroicons-squares-2x2" class="h-4 w-4" />
            <p>{{ $t('zibaifeixingPaipan.chartHint') }}</p>
          </article>
          <article class="zpx-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('zibaifeixingPaipan.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="zpx-loading">
        <span class="zpx-loading-dot" />
        <p>{{ $t('zibaifeixingPaipan.calculating') }}</p>
      </section>

      <div v-else-if="result" class="zpx-report">
        <ZibaifeixingPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="zpx-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('zibaifeixingPaipan.recalculate') }}
        </UButton>
        <AppShareButton
          tool="zibaifeixing-paipan"
          :summary="shareSummary"
          filename="zibaifeixing-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { ZibaifeixingResult } from '~~/server/utils/tools/zibaifeixing-paipan'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  birthTimeIndex?: number
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<ZibaifeixingResult | null>(null)
const lastFormValues = ref<Partial<FormValues>>({})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return result.value.layers
    .map(layer => `${layer.label} ${layer.center.label}`)
    .join(' · ')
})

async function resolveLocation(name: string) {
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

async function handleSubmit(values: FormValues) {
  if (!values.birthDate || values.birthTimeIndex === undefined) {
    toast.add({ title: t('zibaifeixingPaipan.requiredError'), color: 'error' })
    return
  }

  lastFormValues.value = { ...values }
  phase.value = 'loading'

  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    result.value = await $fetch<ZibaifeixingResult>('/api/tools/zibaifeixing-paipan/calc', {
      method: 'POST',
      body: {
        date: values.birthDate,
        timeIndex: values.birthTimeIndex,
        location,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('zibaifeixingPaipan.fail'),
      description: error?.data?.statusMessage || error?.message || t('zibaifeixingPaipan.pleaseRetry'),
      color: 'error',
    })
  }
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.zibaifeixingPaipanTitle')} - ${siteName}`,
  description: t('seo.zibaifeixingPaipanDesc'),
  keywords: t('seo.zibaifeixingPaipanKeywords'),
  ogTitle: () => `${t('seo.zibaifeixingPaipanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.zibaifeixingPaipanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/zibaifeixing-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('zibaifeixingPaipan.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/zibaifeixing-paipan')}`,
        description: t('seo.zibaifeixingPaipanDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.zpx-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.zpx-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.zpx-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.zpx-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.zpx-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.zpx-subtitle {
  max-width: 720px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.zpx-back {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 12px;
  transition: color 160ms ease, border-color 160ms ease;
}

.zpx-back:hover {
  border-color: var(--accent-border);
  color: var(--accent);
}

.zpx-form-wrap {
  display: grid;
  gap: 18px;
  max-width: 680px;
  margin: 0 auto;
}

.zpx-card {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-card);
  padding: 20px;
}

.zpx-card-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
}

.zpx-hints {
  display: grid;
  gap: 10px;
}

.zpx-hint {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface-card) 72%, transparent);
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.zpx-loading {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 72px 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.zpx-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: zpx-pulse 1s ease-in-out infinite;
}

@keyframes zpx-pulse {
  50% {
    opacity: 0.35;
    transform: scale(1.25);
  }
}

.zpx-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
  flex-wrap: wrap;
}

@media (max-width: 700px) {
  .zpx-container {
    padding: 30px 16px 56px;
  }

  .zpx-title {
    font-size: 25px;
  }
}
</style>
