<template>
  <div class="skp-page">
    <div class="skp-container">
      <header class="skp-header">
        <div>
          <p class="skp-eyebrow">Sukuyo</p>
          <h1 class="skp-title">{{ $t('sukuyoPaipan.title') }}</h1>
          <p class="skp-subtitle">{{ $t('sukuyoPaipan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="skp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="skp-form-wrap">
        <div class="skp-card skp-form">
          <h2 class="skp-card-title">{{ $t('sukuyoPaipan.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-gender="false"
            :show-name="false"
            :show-former-name="false"
            require-hour
            :submit-label="$t('sukuyoPaipan.submit')"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="skp-hints">
          <article class="skp-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('sukuyoPaipan.hourHint') }}</p>
          </article>
          <article class="skp-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('sukuyoPaipan.locationHint') }}</p>
          </article>
          <article class="skp-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('sukuyoPaipan.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="skp-loading">
        <span class="skp-loading-dot" />
        <p>{{ $t('sukuyoPaipan.calculating') }}</p>
      </section>

      <div v-else-if="result" class="skp-report">
        <SukuyoPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="skp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="sukuyo-paipan"
          :summary="shareSummary"
          filename="sukuyo-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { SukuyoPaipanResult } from '~~/app/types/sukuyo-paipan'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<SukuyoPaipanResult | null>(null)
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  formerName: '',
  formerNameChangedYear: undefined,
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.precise.mansion.name} · ${result.value.precise.mansion.nameEn}`
})

async function resolveLocation(name: string) {
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

async function handleSubmit(values: FormValues) {
  if (!values.birthDate || !values.birthHour) {
    toast.add({ title: t('sukuyoPaipan.requiredError'), color: 'error' })
    return
  }
  formValues.value = { ...values }
  lastFormValues.value = { ...values }
  phase.value = 'loading'
  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    result.value = await plainFetch<SukuyoPaipanResult>('/api/tools/sukuyo-paipan/calc', {
      method: 'POST',
      body: {
        birthDate: values.birthDate,
        birthHour: values.birthHour,
        gender: values.gender,
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
      title: t('sukuyoPaipan.fail'),
      description: error?.data?.statusMessage || error?.message || t('sukuyoPaipan.pleaseRetry'),
      color: 'error',
    })
  }
}

function handleSaveProfile(id: string, values: FormValues) {
  useProfilesStore().update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    birthProvince: values.birthProvince || undefined,
  })
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

const siteName = 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/sukuyo-paipan')

useSeoMeta({
  title: () => `${t('seo.sukuyoChartTitle')} - ${siteName}`,
  description: t('seo.sukuyoChartDesc'),
  keywords: t('seo.sukuyoChartKeywords'),
  ogTitle: () => `${t('seo.sukuyoChartOgTitle')} - ${siteName}`,
  ogDescription: t('seo.sukuyoChartOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('sukuyoPaipan.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.sukuyoChartDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.skp-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.skp-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.skp-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  position: relative;
  text-align: center;
}

.skp-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.skp-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.skp-subtitle {
  max-width: 680px;
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.skp-back {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: none;
}

.skp-back:hover {
  color: var(--accent);
}

.skp-form-wrap {
  display: grid;
  gap: 20px;
}

.skp-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 24px;
}

.skp-card-title {
  margin: 0 0 18px;
  font-size: 18px;
}

.skp-hints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.skp-hint {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 14px 16px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.skp-hint .ui-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.skp-loading {
  display: grid;
  place-items: center;
  min-height: 240px;
  color: var(--text-muted);
}

.skp-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
  animation: pulse 1.4s infinite;
}

.skp-report {
  display: grid;
}

.skp-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 26px;
}

@keyframes pulse {
  0%, 100% { opacity: .3; transform: scale(.8); }
  50% { opacity: 1; transform: scale(1); }
}

@media (max-width: 820px) {
  .skp-back {
    position: static;
    justify-self: center;
  }

  .skp-title {
    font-size: 24px;
  }

  .skp-hints {
    grid-template-columns: 1fr;
  }
}
</style>
