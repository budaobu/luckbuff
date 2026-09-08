<template>
  <div class="qzp-page">
    <div class="qzp-container">
      <header class="qzp-header">
        <div>
          <p class="qzp-eyebrow">Qi Zheng Si Yu</p>
          <h1 class="qzp-title">{{ $t('qizhengChart.title') }}</h1>
          <p class="qzp-subtitle">{{ $t('qizhengChart.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="qzp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="qzp-form-wrap">
        <div class="qzp-card qzp-form">
          <h2 class="qzp-card-title">{{ $t('qizhengChart.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-name="false"
            :show-former-name="false"
            require-hour
            :submit-label="$t('qizhengChart.submit')"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="qzp-hints">
          <article class="qzp-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('qizhengChart.hourHint') }}</p>
          </article>
          <article class="qzp-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('qizhengChart.locationHint') }}</p>
          </article>
          <article class="qzp-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('qizhengChart.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="qzp-loading">
        <span class="qzp-loading-dot" />
        <p>{{ $t('qizhengChart.calculating') }}</p>
      </section>

      <div v-else-if="result" class="qzp-report">
        <QizhengPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="qzp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="qizheng-paipan"
          :summary="shareSummary"
          filename="qizheng-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { QizhengPaipanResult } from '~~/app/types/qizheng-paipan'

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
const result = ref<QizhengPaipanResult | null>(null)
const formValues = ref<FormValues>({
  gender: 'male', birthDate: '', birthHour: undefined, name: '', formerName: '',
  formerNameChangedYear: undefined, birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.liming.lifePalace}命 · ${result.value.basic.dayNight} · ${result.value.planets.length}曜`
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
    toast.add({ title: t('qizhengChart.requiredError'), color: 'error' })
    return
  }
  formValues.value = { ...values }
  lastFormValues.value = { ...values }
  phase.value = 'loading'
  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    result.value = await $fetch<QizhengPaipanResult>('/api/tools/qizheng-paipan/calc', {
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
      title: t('qizhengChart.fail'),
      description: error?.data?.statusMessage || error?.message || t('qizhengChart.pleaseRetry'),
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

useSeoMeta({
  title: () => `${t('seo.qizhengChartTitle')} - ${siteName}`,
  description: t('seo.qizhengChartDesc'),
  keywords: t('seo.qizhengChartKeywords'),
  ogTitle: () => `${t('seo.qizhengChartOgTitle')} - ${siteName}`,
  ogDescription: t('seo.qizhengChartOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/qizheng-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('qizhengChart.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/qizheng-paipan')}`,
        description: t('seo.qizhengChartDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.qzp-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.qzp-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.qzp-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  position: relative;
  text-align: center;
}

.qzp-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.qzp-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.qzp-subtitle {
  max-width: 680px;
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.qzp-back {
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

.qzp-back:hover {
  color: var(--accent);
}

.qzp-form-wrap {
  display: grid;
  gap: 20px;
}

.qzp-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 24px;
}

.qzp-card-title {
  margin: 0 0 18px;
  font-size: 18px;
}

.qzp-hints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.qzp-hint {
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

.qzp-hint .ui-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.qzp-loading {
  display: grid;
  place-items: center;
  min-height: 240px;
  color: var(--text-muted);
}

.qzp-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
  animation: pulse 1.4s infinite;
}

.qzp-report {
  display: grid;
}

.qzp-actions {
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
  .qzp-back {
    position: static;
    justify-self: center;
  }

  .qzp-title {
    font-size: 24px;
  }

  .qzp-hints {
    grid-template-columns: 1fr;
  }
}
</style>
