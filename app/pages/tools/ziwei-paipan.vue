<template>
  <div class="zc-page">
    <div class="zc-container">
      <header class="zc-header">
        <div>
          <p class="zc-eyebrow">Zi Wei Chart</p>
          <h1 class="zc-title">{{ $t('ziweiChart.title') }}</h1>
          <p class="zc-subtitle">{{ $t('ziweiChart.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/paipan')" class="zc-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="zc-form-wrap">
        <div class="zc-card zc-form">
          <h2 class="zc-card-title">{{ $t('ziweiChart.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-name="false"
            :show-former-name="false"
            require-hour
            use-time-index
            :submit-label="$t('ziweiChart.submit')"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="zc-hints">
          <article class="zc-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('ziweiChart.hourHint') }}</p>
          </article>
          <article class="zc-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('ziweiChart.locationHint') }}</p>
          </article>
          <article class="zc-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('baziChart.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="zc-loading">
        <span class="zc-loading-dot" />
        <p>{{ $t('ziweiChart.calculating') }}</p>
      </section>

      <div v-else-if="result" class="zc-report">
        <ZiweiPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="zc-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="ziwei-paipan"
          :summary="shareSummary"
          filename="ziwei-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZiweiChartResult } from '~~/server/utils/tools/ziwei-chart'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthTimeIndex?: number
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<ZiweiChartResult | null>(null)
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthTimeIndex: undefined,
  name: '',
  formerName: '',
  formerNameChangedYear: undefined,
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.summary.fiveElementsClass} · ${result.value.summary.soulPalace}`
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
    toast.add({ title: t('ziweiChart.requiredError'), color: 'error' })
    return
  }

  formValues.value = { ...values }
  lastFormValues.value = { ...values }
  phase.value = 'loading'

  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    result.value = await $fetch<ZiweiChartResult>('/api/tools/ziwei-paipan/calc', {
      method: 'POST',
      body: {
        birthDate: values.birthDate,
        birthTimeIndex: values.birthTimeIndex,
        gender: values.gender,
        location,
        locale: locale.value,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('ziweiChart.fail'),
      description: error?.data?.statusMessage || error?.message || t('ziweiChart.pleaseRetry'),
      color: 'error',
    })
  }
}

function birthHourFromTimeIndex(index: number) {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
  return index === 12 ? '子' : branches[index]
}

function handleSaveProfile(id: string, values: FormValues) {
  if (values.birthTimeIndex === undefined) return
  const store = useProfilesStore()
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: birthHourFromTimeIndex(values.birthTimeIndex),
    birthTimeIndex: values.birthTimeIndex,
    birthProvince: values.birthProvince || undefined,
  })
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.ziweiChartTitle')} - ${siteName}`,
  description: t('seo.ziweiChartDesc'),
  keywords: t('seo.ziweiChartKeywords'),
  ogTitle: () => `${t('seo.ziweiChartOgTitle')} - ${siteName}`,
  ogDescription: t('seo.ziweiChartOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/ziwei-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('ziweiChart.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/ziwei-paipan')}`,
        description: t('seo.ziweiChartDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.zc-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.zc-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.zc-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.zc-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.zc-title {
  font-size: clamp(28px, 5vw, 42px);
  line-height: 1.1;
}

.zc-subtitle {
  max-width: 680px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.6;
}

.zc-back {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
}

.zc-form-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
}

.zc-card {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 22px;
}

.zc-card-title {
  margin-bottom: 18px;
  font-size: 18px;
}

.zc-hints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.zc-hint {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.zc-hint svg {
  margin-top: 2px;
  color: var(--accent);
  flex: 0 0 auto;
}

.zc-loading {
  display: grid;
  place-items: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--text-muted);
}

.zc-loading-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  animation: zc-pulse 1.2s ease-in-out infinite;
}

.zc-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

@keyframes zc-pulse {
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.1); }
}

@media (max-width: 820px) {
  .zc-container {
    padding: 28px 16px 56px;
  }

  .zc-hints {
    grid-template-columns: 1fr;
  }
}
</style>
