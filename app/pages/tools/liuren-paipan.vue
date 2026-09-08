<template>
  <div class="lpp-page">
    <div class="lpp-container">
      <header class="lpp-header">
        <div>
          <p class="lpp-eyebrow">Da Liu Ren Chart</p>
          <h1 class="lpp-title">{{ $t('liurenPaipan.title') }}</h1>
          <p class="lpp-subtitle">{{ $t('liurenPaipan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/paipan')" class="lpp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="lpp-form-wrap">
        <form class="lpp-card lpp-form" @submit.prevent="handleSubmit">
          <h2 class="lpp-card-title">{{ $t('liurenPaipan.formTitle') }}</h2>

          <DivinationTimeCard
            ref="timeCardRef"
            :label="$t('liurenPaipan.time')"
            :hint="$t('liurenPaipan.timeHint')"
            required
          />

          <div>
            <label for="liuren-paipan-location">{{ $t('liurenPaipan.location') }}</label>
            <UInput
              id="liuren-paipan-location"
              v-model="form.location"
              :placeholder="$t('liurenPaipan.locationPlaceholder')"
              class="w-full"
            />
            <p class="lpp-field-hint">{{ $t('liurenPaipan.locationHint') }}</p>
          </div>

          <div class="lpp-grid-2">
            <div>
              <label for="liuren-paipan-birth">{{ $t('liurenPaipan.birthDate') }}</label>
              <input
                id="liuren-paipan-birth"
                v-model="form.birthDate"
                type="date"
                min="1900-01-01"
                max="2100-12-31"
              >
              <p class="lpp-field-hint">{{ $t('liurenPaipan.birthHint') }}</p>
            </div>
            <div>
              <label>{{ $t('liurenPaipan.gender') }}</label>
              <div class="lpp-gender">
                <button
                  type="button"
                  :class="{ active: form.gender === 'male' }"
                  @click="form.gender = 'male'"
                >
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  :class="{ active: form.gender === 'female' }"
                  @click="form.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>
          </div>

          <UButton type="submit" color="warning" size="lg" block>
            <template #leading>
              <UIcon name="i-heroicons-circle-stack" class="h-4 w-4" />
            </template>
            {{ $t('liurenPaipan.submit') }}
          </UButton>
        </form>

        <div class="lpp-hints">
          <article class="lpp-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('liurenPaipan.timeHint') }}</p>
          </article>
          <article class="lpp-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('liurenPaipan.solarTimeHint') }}</p>
          </article>
          <article class="lpp-hint">
            <UIcon name="i-heroicons-user" class="h-4 w-4" />
            <p>{{ $t('liurenPaipan.birthHint') }}</p>
          </article>
          <article class="lpp-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('liurenPaipan.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="lpp-loading">
        <span class="lpp-loading-dot" />
        <p>{{ $t('liurenPaipan.calculating') }}</p>
      </section>

      <div v-else-if="result" class="lpp-report">
        <LiurenPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="lpp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="liuren-paipan"
          :summary="shareSummary"
          filename="liuren-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiurenPaipanResult } from '~~/app/types/liuren-paipan'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()
const timeCardRef = ref<{ iso: string, timezone: string } | null>(null)

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<LiurenPaipanResult | null>(null)
const form = ref({
  location: '',
  birthDate: '',
  gender: 'male' as 'male' | 'female',
})
const lastFormValues = ref({ ...form.value })

const shareSummary = computed(() => {
  if (!result.value) return undefined
  const { monthGeneral, hourBranch, coursePattern } = result.value.summary
  return `${monthGeneral}${t('liurenPaipan.generalAddedTo')}${hourBranch}${t('liurenPaipan.hourUnit')} · ${coursePattern}`
})

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  }
  catch {
    return 'Asia/Shanghai'
  }
}

interface ResolvedLocation {
  name: string
  longitude?: number
  latitude?: number
  timezone?: string
}

async function resolveLocation(name: string): Promise<ResolvedLocation | null> {
  if (!name.trim()) return null
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

async function handleSubmit() {
  const datetime = timeCardRef.value?.iso
  if (!datetime) {
    toast.add({ title: t('liurenPaipan.requiredError'), color: 'error' })
    return
  }
  lastFormValues.value = { ...form.value }
  phase.value = 'loading'

  try {
    const location = await resolveLocation(form.value.location)
    const timezone = location?.timezone || timeCardRef.value?.timezone || browserTimezone()
    result.value = await $fetch<LiurenPaipanResult>('/api/tools/liuren-paipan/calc', {
      method: 'POST',
      body: {
        datetime,
        timezone,
        location: form.value.location,
        longitude: location?.longitude,
        latitude: location?.latitude,
        birthDate: form.value.birthDate || undefined,
        gender: form.value.birthDate ? form.value.gender : undefined,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('liurenPaipan.fail'),
      description: error?.data?.statusMessage || error?.message || t('liurenPaipan.pleaseRetry'),
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
  title: () => `${t('seo.liurenPaipanTitle')} - ${siteName}`,
  description: t('seo.liurenPaipanDesc'),
  keywords: t('seo.liurenPaipanKeywords'),
  ogTitle: () => `${t('seo.liurenPaipanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.liurenPaipanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liuren-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('liurenPaipan.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/liuren-paipan')}`,
        description: t('seo.liurenPaipanDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.lpp-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.lpp-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.lpp-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.lpp-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.lpp-title {
  font-size: 30px;
  line-height: 1.2;
}

.lpp-subtitle {
  max-width: 720px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 14px;
}

.lpp-back {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 12px;
}

.lpp-form-wrap {
  display: grid;
  gap: 18px;
}

.lpp-card {
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.lpp-card-title {
  margin-bottom: 18px;
  font-size: 18px;
}

.lpp-form {
  display: grid;
  gap: 18px;
}

.lpp-form label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 14px;
}

.lpp-form input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-input);
  color: var(--text-primary);
}

.lpp-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.lpp-gender {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.lpp-gender button {
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
}

.lpp-gender button.active {
  border-color: var(--accent-border-hover);
  background: var(--accent-bg);
  color: var(--accent);
}

.lpp-field-hint {
  margin: 7px 0 0;
  color: var(--text-faint);
  font-size: 12px;
}

.lpp-hints {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.lpp-hint {
  display: flex;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
}

.lpp-hint :deep(.iconify) {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.lpp-loading {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.lpp-loading-dot {
  width: 12px;
  height: 12px;
  border: 2px solid var(--accent-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: lpp-spin 900ms linear infinite;
}

.lpp-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

@keyframes lpp-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 720px) {
  .lpp-grid-2,
  .lpp-hints {
    grid-template-columns: 1fr;
  }
}
</style>
