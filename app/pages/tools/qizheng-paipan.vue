<template>
  <div class="qzp-page">
    <ClientOnly>
      <QizhengPaipanBackdrop />
    </ClientOnly>
    <div class="qzp-container">
      <header class="qzp-header" :class="{ 'is-result': phase === 'result' }">
        <div class="qzp-hero-copy">
          <p class="qzp-eyebrow">Qi Zheng Si Yu</p>
          <h1 class="qzp-title">{{ $t('qizhengChart.title') }}</h1>
          <p class="qzp-subtitle">{{ $t('qizhengChart.subtitle') }}</p>
          <span class="qzp-scroll-cue">
            <UIcon name="i-heroicons-arrow-down" class="h-4 w-4" />
          </span>
        </div>
        <NuxtLink :to="localePath('/chart')" class="qzp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" v-reveal.stagger class="qzp-form-wrap">
        <p class="qzp-stage-index">01</p>
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
          <article data-reveal-child class="qzp-hint">
            <span class="qzp-hint-index">02</span>
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('qizhengChart.hourHint') }}</p>
          </article>
          <article data-reveal-child class="qzp-hint">
            <span class="qzp-hint-index">03</span>
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('qizhengChart.locationHint') }}</p>
          </article>
          <article data-reveal-child class="qzp-hint">
            <span class="qzp-hint-index">04</span>
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('qizhengChart.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="qzp-loading">
        <span class="qzp-loading-dot" />
        <p>{{ $t('qizhengChart.calculating') }}</p>
      </section>

      <div v-else-if="result" v-reveal class="qzp-report">
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
    result.value = await plainFetch<QizhengPaipanResult>('/api/tools/qizheng-paipan/calc', {
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

const runtimeConfig = useRuntimeConfig()
const siteName = runtimeConfig.public.siteName || 'ososn'

const pageUrl = useLocalizedSeoUrl('/tools/qizheng-paipan')

useSeoMeta({
  title: () => `${t('seo.qizhengChartTitle')} - ${siteName}`,
  description: t('seo.qizhengChartDesc'),
  keywords: t('seo.qizhengChartKeywords'),
  ogTitle: () => `${t('seo.qizhengChartOgTitle')} - ${siteName}`,
  ogDescription: t('seo.qizhengChartOgDesc'),
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
        name: t('qizhengChart.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.qizhengChartDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.qzp-page {
  --qzp-night: #05070a;
  --qzp-ink: #dfe7e0;
  --qzp-muted: #9aa89f;
  --qzp-line: rgba(223, 231, 224, 0.14);
  --qzp-card: rgba(8, 12, 19, 0.78);
  --qzp-gold: #d9b36a;

  --surface-bg: var(--qzp-night);
  --surface-card: var(--qzp-card);
  --surface-input: rgba(13, 19, 28, 0.92);
  --surface-card-hover: rgba(20, 27, 38, 0.94);
  --surface-dropdown: #0b111a;
  --border-subtle: var(--qzp-line);
  --border-light: rgba(223, 231, 224, 0.12);
  --border-medium: rgba(223, 231, 224, 0.2);
  --text-primary: var(--qzp-ink);
  --text-muted: var(--qzp-muted);
  --text-faint: rgba(154, 168, 159, 0.78);
  --text-placeholder: rgba(154, 168, 159, 0.62);
  --accent: var(--qzp-gold);
  --accent-bg: rgba(217, 179, 106, 0.14);
  --accent-border: rgba(217, 179, 106, 0.28);
  --accent-border-hover: rgba(217, 179, 106, 0.48);

  position: relative;
  min-height: 100vh;
  overflow: clip;
  background: var(--qzp-night);
  color: var(--qzp-ink);
  font-family: Onest, system-ui, -apple-system, "Segoe UI", sans-serif;
}

.qzp-page::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 0;
  background:
    radial-gradient(70rem 42rem at 74% 4%, rgba(75, 97, 137, 0.18), transparent 62%),
    radial-gradient(52rem 34rem at 10% 86%, rgba(50, 68, 104, 0.14), transparent 64%);
  pointer-events: none;
}

.qzp-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 72px 24px 88px;
}

.qzp-header {
  min-height: calc(100svh - 210px);
  display: grid;
  align-items: center;
  position: relative;
  margin-bottom: 56px;
}

.qzp-hero-copy {
  max-width: 780px;
}

.qzp-eyebrow {
  display: block;
  margin-bottom: 18px;
  color: var(--qzp-gold);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.qzp-title {
  margin: 0;
  font-size: clamp(40px, 5.4vw, 74px);
  font-weight: 650;
  line-height: 1.04;
}

.qzp-subtitle {
  max-width: 560px;
  margin: 24px 0 0;
  color: var(--qzp-muted);
  font-size: 16px;
  line-height: 1.7;
}

.qzp-scroll-cue {
  position: absolute;
  bottom: 0;
  left: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--qzp-line);
  border-radius: 999px;
  color: var(--qzp-muted);
  transform: translateX(-50%);
  animation: qzp-drift 3.2s ease-in-out infinite;
}

.qzp-header.is-result {
  min-height: auto;
  margin-bottom: 36px;
}

.qzp-header.is-result .qzp-back {
  position: static;
  justify-self: start;
  margin-bottom: 16px;
}

.qzp-header.is-result .qzp-title {
  font-size: clamp(28px, 3vw, 40px);
}

.qzp-header.is-result .qzp-subtitle,
.qzp-header.is-result .qzp-scroll-cue {
  display: none;
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
  position: relative;
  display: grid;
  gap: 20px;
  margin-top: 36px;
}

.qzp-stage-index {
  margin: 0;
  color: var(--qzp-gold);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.28em;
}

.qzp-card {
  border: 1px solid var(--qzp-line);
  border-radius: 10px;
  background: var(--qzp-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
  padding: 28px;
  backdrop-filter: blur(18px);
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
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid var(--qzp-line);
  border-radius: 10px;
  background: rgba(8, 12, 19, 0.64);
  padding: 16px 52px 16px 18px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
  backdrop-filter: blur(14px);
}

.qzp-hint-index {
  position: absolute;
  top: 12px;
  right: 12px;
  color: rgba(217, 179, 106, 0.66);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.qzp-hint .ui-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.qzp-loading {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  min-height: 40vh;
  color: var(--text-muted);
}

.qzp-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
  animation: pulse 1.4s infinite;
}

.qzp-report,
.qzp-actions {
  position: relative;
  z-index: 1;
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

@keyframes qzp-drift {
  0%, 100% { opacity: 0.52; transform: translateX(-50%) translateY(0); }
  50% { opacity: 1; transform: translateX(-50%) translateY(6px); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .qzp-scroll-cue,
  .qzp-loading-dot {
    animation: none;
  }
}

@media (max-width: 820px) {
  .qzp-container {
    padding: 48px 18px 64px;
  }

  .qzp-header {
    min-height: calc(100svh - 250px);
    margin-bottom: 40px;
  }

  .qzp-title {
    font-size: clamp(34px, 11vw, 48px);
  }

  .qzp-back {
    position: static;
    justify-self: center;
  }

  .qzp-card {
    padding: 20px;
  }

  .qzp-hints {
    grid-template-columns: 1fr;
  }

  .qzp-scroll-cue {
    bottom: -18px;
  }
}
</style>
