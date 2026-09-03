<template>
  <div class="bc-page">
    <div class="bc-container">
      <header class="bc-header">
        <div>
          <p class="bc-eyebrow">Bazi Chart</p>
          <h1 class="bc-title">{{ $t('baziChart.title') }}</h1>
          <p class="bc-subtitle">{{ $t('baziChart.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/paipan')" class="bc-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="bc-form-wrap">
        <div class="bc-card bc-form">
          <h2 class="bc-card-title">{{ $t('baziChart.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-name="false"
            :show-former-name="false"
            require-hour
            :submit-label="$t('baziChart.submit')"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="bc-hints">
          <article class="bc-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('baziChart.hourHint') }}</p>
          </article>
          <article class="bc-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('baziChart.locationHint') }}</p>
          </article>
          <article class="bc-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('baziChart.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="bc-loading">
        <span class="bc-loading-dot" />
        <p>{{ $t('baziChart.calculating') }}</p>
      </section>

      <div v-else-if="result" ref="shareTargetRef" class="bc-report">
        <BaziPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="bc-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <UButton color="warning" variant="soft" @click="handleShare">
          <template #leading>
            <UIcon name="i-heroicons-share" class="h-4 w-4" />
          </template>
          {{ $t('common.shareResult') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'

const { t, locale } = useI18n()
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
const result = ref<BaziChartResult | null>(null)
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
const shareTargetRef = ref<HTMLElement>()

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
    result.value = await $fetch<BaziChartResult>('/api/tools/bazi-paipan/calc', {
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

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()
  try {
    await share({
      tool: 'bazi-paipan',
      summary: `${result.value.pillars.map(pillar => pillar.ganzhi).join(' ')} · ${result.value.structure.dayStrength} · ${result.value.pattern.status}`,
      shareTarget: shareTargetRef.value,
      filename: `bazi-paipan-${formValues.value.birthDate}.png`,
      t,
    })
  }
  catch (error: any) {
    toast.add({
      title: t('share.shareFail'),
      description: error?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

function formatOffset(minutes: number) {
  const sign = minutes < 0 ? '-' : '+'
  const absolute = Math.abs(minutes)
  const hour = Math.floor(absolute / 60)
  const minute = absolute % 60
  return `${sign}${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function shortDatetime(value: string) {
  return value.replace('T', ' ').slice(0, 16)
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.baziChartTitle')} - ${siteName}`,
  description: t('seo.baziChartDesc'),
  keywords: t('seo.baziChartKeywords'),
  ogTitle: () => `${t('seo.baziChartOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziChartOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/bazi-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('baziChart.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/bazi-paipan')}`,
        description: t('seo.baziChartDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.bc-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.bc-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.bc-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
}

.bc-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.bc-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.bc-subtitle {
  max-width: 640px;
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.bc-back {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
}

.bc-back:hover {
  color: var(--accent);
}

.bc-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 20px;
}

.bc-card-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
}

.bc-form-wrap {
  display: grid;
  gap: 18px;
}

.bc-form {
  max-width: 680px;
}

.bc-hints {
  display: grid;
  gap: 10px;
}

.bc-hint {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface-card) 72%, transparent);
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.bc-loading {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 72px 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.bc-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: bc-pulse 1s ease-in-out infinite;
}

.bc-report {
  display: grid;
  gap: 38px;
}

.bc-hero {
  display: grid;
  gap: 20px;
}

.bc-hero-kicker {
  margin: 0 0 8px;
  color: var(--text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bc-pillars-text {
  margin: 0;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(30px, 5.5vw, 46px);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.15;
}

.bc-hero-meta {
  margin: 12px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.bc-hero-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.bc-hero-facts dt {
  color: var(--text-faint);
  font-size: 12px;
}

.bc-hero-facts dd {
  min-height: 22px;
  margin: 4px 0 0;
  font-size: 15px;
  font-weight: 700;
}

.bc-alert {
  margin: -18px 0 0;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, #b45309 28%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, #b45309 7%, transparent);
  color: #92400e;
  font-size: 13px;
  line-height: 1.6;
}

.bc-alert-soft {
  border-color: var(--border-light);
  background: var(--surface-card);
  color: var(--text-muted);
}

.bc-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.bc-section-label {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.bc-section-label span {
  color: var(--accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 700;
}

.bc-section-label h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.bc-section-note {
  grid-column: 2;
  margin: -8px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.bc-pillar-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.bc-pillar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 13px;
}

.bc-pillar-head strong {
  color: var(--text-primary);
  font-weight: 700;
}

.bc-pillar-ganzhi {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin-top: 12px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 36px;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
}

.bc-pillar-day {
  border-color: var(--accent-border);
}

.bc-pillar dl {
  margin: 14px 0 0;
}

.bc-pillar dl div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
  border-top: 1px solid var(--border-subtle);
  font-size: 12px;
}

.bc-pillar dt {
  color: var(--text-faint);
}

.bc-pillar dd {
  margin: 0;
  color: var(--text-muted);
  text-align: right;
}

.bc-hidden {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.bc-hidden span {
  padding: 4px 7px;
  border-radius: 6px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 11px;
}

.bc-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin: 0;
}

.bc-detail-grid dt {
  color: var(--text-faint);
  font-size: 12px;
}

.bc-detail-grid dd {
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 600;
}

.bc-detail-note {
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.bc-wuxing-list {
  display: grid;
  gap: 16px;
}

.bc-wuxing-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
}

.bc-wuxing-head span {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.bc-wuxing-bar {
  height: 6px;
  margin: 8px 0;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-input);
}

.bc-wuxing-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.bc-wuxing p {
  margin: 0;
  color: var(--text-faint);
  font-size: 12px;
}

.bc-two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.bc-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bc-tag {
  padding: 6px 9px;
  border: 1px solid var(--border-light);
  border-radius: 7px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 12px;
}

.bc-signal-list {
  display: grid;
  gap: 14px;
}

.bc-signal-list strong {
  display: block;
  font-size: 14px;
}

.bc-signal-list span {
  color: var(--accent);
  font-size: 12px;
}

.bc-signal-list p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.bc-extra {
  margin-top: 12px;
}

.bc-extra dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
}

.bc-extra dt {
  color: var(--text-faint);
  font-size: 12px;
}

.bc-extra dd {
  margin: 5px 0 0;
  font-size: 14px;
  font-weight: 700;
}

.bc-dayun-list {
  grid-column: 2;
  display: grid;
  gap: 10px;
}

.bc-dayun-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.bc-dayun-head strong {
  min-width: 62px;
}

.bc-dayun-head span {
  color: var(--text-muted);
}

.bc-dayun-head em {
  padding: 2px 6px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11px;
  font-style: normal;
}

.bc-flow-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.bc-flow-list span {
  padding: 4px 7px;
  border-radius: 6px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.bc-flow-current {
  background: var(--accent-bg) !important;
  color: var(--accent) !important;
}

.bc-structure-grid {
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.bc-structure-grid span {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.bc-structure-grid strong {
  display: block;
  min-height: 24px;
  margin-top: 6px;
  font-size: 15px;
}

.bc-empty {
  margin: 0;
  color: var(--text-faint);
  font-size: 13px;
}

.bc-disclaimer {
  margin: -10px 0 0;
  color: var(--text-placeholder);
  font-size: 12px;
  line-height: 1.7;
}

.bc-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

@keyframes bc-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
}

@media (min-width: 900px) {
  .bc-container {
    padding-top: 56px;
  }

  .bc-header {
    grid-template-columns: 1fr auto;
    align-items: end;
  }

  .bc-hints {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bc-hero {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: center;
  }

  .bc-section {
    grid-template-columns: 180px minmax(0, 1fr);
  }

  .bc-pillar-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .bc-pillar-ganzhi {
    font-size: 30px;
  }

  .bc-detail-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .bc-hero-facts,
  .bc-two-col,
  .bc-detail-grid {
    grid-template-columns: 1fr;
  }

  .bc-extra dl,
  .bc-structure-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bc-dayun-list,
  .bc-structure-grid,
  .bc-section-note {
    grid-column: auto;
  }
}
</style>
