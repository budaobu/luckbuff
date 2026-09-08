<template>
  <div class="scs-page">
    <div class="scs-container">
      <header class="scs-header">
        <div>
          <p class="scs-eyebrow">Shichu Suimei</p>
          <h1 class="scs-title">{{ $t('shichuSuimei.title') }}</h1>
          <p class="scs-subtitle">{{ $t('shichuSuimei.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="scs-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="scs-form-wrap">
        <div class="scs-card scs-form">
          <h2 class="scs-card-title">{{ $t('shichuSuimei.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-name="false"
            :show-former-name="false"
            require-hour
            :submit-label="$t('shichuSuimei.submit')"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="scs-hints">
          <article class="scs-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('baziChart.hourHint') }}</p>
          </article>
          <article class="scs-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('baziChart.locationHint') }}</p>
          </article>
          <article class="scs-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('baziChart.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="scs-loading">
        <span class="scs-loading-dot" />
        <p>{{ $t('baziChart.calculating') }}</p>
      </section>

      <div v-else-if="result" class="scs-report">
        <BaziPaipanReport
          :result="result"
          terminology="shichu-suimei"
          ai-endpoint="/api/tools/shichu-suimei/interpret"
        />
      </div>

      <div v-if="phase === 'result'" class="scs-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="shichu-suimei"
          :summary="shareSummary"
          filename="shichu-suimei-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { ShichuSuimeiResult } from '~~/server/utils/tools/shichu-suimei'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const localizedToolUrl = useLocalizedSeoUrl('/tools/shichu-suimei')
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
const result = ref<ShichuSuimeiResult | null>(null)
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
  return `${result.value.pillars.map(pillar => pillar.ganzhi).join(' ')} · ${result.value.energy.strength} · ${result.value.pattern.name}`
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
    toast.add({ title: t('baziChart.requiredError'), color: 'error' })
    return
  }

  formValues.value = { ...values }
  lastFormValues.value = { ...values }
  phase.value = 'loading'

  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    result.value = await $fetch<ShichuSuimeiResult>('/api/tools/shichu-suimei/calc', {
      method: 'POST',
      body: {
        birthDate: values.birthDate,
        birthHour: values.birthHour,
        gender: values.gender,
        location,
        displayLocale: locale.value,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('baziChart.fail'),
      description: error?.data?.statusMessage || error?.message || t('baziChart.pleaseRetry'),
      color: 'error',
    })
  }
}

function handleSaveProfile(id: string, values: FormValues) {
  const store = useProfilesStore()
  store.update(id, {
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
  title: () => `${t('seo.shichuSuimeiTitle')} - ${siteName}`,
  description: t('seo.shichuSuimeiDesc'),
  keywords: t('seo.shichuSuimeiKeywords'),
  ogTitle: () => `${t('seo.shichuSuimeiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.shichuSuimeiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: () => localizedToolUrl.value,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('shichuSuimei.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: localizedToolUrl.value,
        description: t('seo.shichuSuimeiDesc'),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: locale.value === 'ja' ? 'JPY' : 'CNY',
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.scs-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.scs-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.scs-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  position: relative;
  text-align: center;
}

.scs-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.scs-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.scs-subtitle {
  max-width: 640px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.scs-back {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  font-size: 13px;
  transition: color 160ms ease;
}

.scs-back:hover {
  color: var(--text-primary);
}

.scs-form-wrap {
  display: grid;
  gap: 20px;
}

.scs-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 24px;
}

.scs-card-title {
  margin: 0 0 18px;
  font-size: 18px;
  font-weight: 700;
}

.scs-hints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.scs-hint {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 14px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-card) 78%, transparent);
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.scs-hint :deep(.iconify) {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.scs-loading {
  display: grid;
  place-items: center;
  gap: 12px;
  min-height: 280px;
  color: var(--text-muted);
}

.scs-loading-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--accent);
  animation: scs-pulse 1.2s ease-in-out infinite;
}

@keyframes scs-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.82); }
  50% { opacity: 1; transform: scale(1); }
}

.scs-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

@media (max-width: 820px) {
  .scs-container {
    padding-top: 28px;
  }

  .scs-header {
    text-align: left;
  }

  .scs-back {
    position: static;
    justify-self: start;
  }

  .scs-title {
    font-size: 24px;
  }

  .scs-card {
    padding: 20px;
  }

  .scs-hints {
    grid-template-columns: 1fr;
  }

  .scs-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
