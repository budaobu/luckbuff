<template>
  <div class="tbp-page">
    <div class="tbp-container">
      <header class="tbp-header">
        <div>
          <p class="tbp-eyebrow">Tieban Shenshu Chart</p>
          <h1 class="tbp-title">{{ $t('tiebanPaipan.title') }}</h1>
          <p class="tbp-subtitle">{{ $t('tiebanPaipan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="tbp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="tbp-form-wrap">
        <form class="tbp-card" @submit.prevent="handleSubmit">
          <h2 class="tbp-card-title">{{ $t('tiebanPaipan.formTitle') }}</h2>
          <ProfileBirthDateSelector
            :birth-date="form.birthDate"
            :selected-profile-id="selectedProfileId"
            :date-label="$t('tiebanPaipan.birthDate')"
            required
            @select-profile="applyProfile"
            @update:birth-date="form.birthDate = $event"
          />

          <div>
            <label for="tieban-birth-time">{{ $t('tiebanPaipan.birthTime') }}</label>
            <UInput
              id="tieban-birth-time"
              v-model="form.birthTime"
              type="time"
              min="00:00"
              max="23:59"
              required
              class="w-full"
              :ui="{
                base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
              }"
            />
          </div>

          <div>
            <label for="tieban-location">{{ $t('tiebanPaipan.location') }}</label>
            <UInput
              id="tieban-location"
              v-model="form.location"
              :placeholder="$t('tiebanPaipan.locationPlaceholder')"
              class="w-full"
            />
            <p class="tbp-field-hint">{{ $t('tiebanPaipan.locationHint') }}</p>
          </div>

          <div>
            <label>{{ $t('tiebanPaipan.gender') }}</label>
            <div class="tbp-gender">
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

          <UButton type="submit" color="warning" size="lg" block>
            <template #leading>
              <UIcon name="i-heroicons-calculator" class="h-4 w-4" />
            </template>
            {{ $t('tiebanPaipan.submit') }}
          </UButton>
        </form>

        <div class="tbp-hints">
          <article class="tbp-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('tiebanPaipan.minuteHint') }}</p>
          </article>
          <article class="tbp-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('tiebanPaipan.solarTimeHint') }}</p>
          </article>
          <article class="tbp-hint">
            <UIcon name="i-heroicons-book-open" class="h-4 w-4" />
            <p>{{ $t('tiebanPaipan.corpusHint') }}</p>
          </article>
          <article class="tbp-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('tiebanPaipan.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="tbp-loading">
        <span class="tbp-loading-dot" />
        <p>{{ $t('tiebanPaipan.calculating') }}</p>
      </section>

      <div v-else-if="result" class="tbp-report">
        <TiebanPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="tbp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="tieban-paipan"
          :summary="shareSummary"
          filename="tieban-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TiebanPaipanResult } from '~~/app/types/tieban-paipan'
import type { UserProfile } from '~/types/user'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<TiebanPaipanResult | null>(null)
const selectedProfileId = ref<string | null>(null)
const form = ref({
  birthDate: '',
  birthTime: '',
  location: '',
  gender: 'male' as 'male' | 'female',
})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.natal.hexagram} · ${result.value.numbers.kaokeQuarter} · ${result.value.birth.minuteQuarter.label}`
})

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  }
  catch {
    return 'Asia/Shanghai'
  }
}

const PROFILE_HOUR_TIME: Record<string, string> = {
  子: '00:30',
  丑: '01:30',
  寅: '03:30',
  卯: '05:30',
  辰: '07:30',
  巳: '09:30',
  午: '11:30',
  未: '13:30',
  申: '15:30',
  酉: '17:30',
  戌: '19:30',
  亥: '21:30',
}

function applyProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.value.gender = profile.gender
  form.value.birthDate = profile.birthDate || ''
  if (!form.value.birthTime && profile.birthHour) {
    form.value.birthTime = PROFILE_HOUR_TIME[profile.birthHour] || ''
  }
  if (!form.value.location && profile.birthProvince) {
    form.value.location = profile.birthProvince
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
  if (!form.value.birthDate || !form.value.birthTime) {
    toast.add({ title: t('tiebanPaipan.requiredError'), color: 'error' })
    return
  }

  phase.value = 'loading'
  try {
    const location = await resolveLocation(form.value.location)
    result.value = await $fetch<TiebanPaipanResult>('/api/tools/tieban-paipan/calc', {
      method: 'POST',
      body: {
        birthDate: form.value.birthDate,
        birthTime: form.value.birthTime,
        gender: form.value.gender,
        location: form.value.location,
        longitude: location?.longitude,
        latitude: location?.latitude,
        timezone: location?.timezone || browserTimezone(),
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('tiebanPaipan.fail'),
      description: error?.data?.statusMessage || error?.message || t('tiebanPaipan.pleaseRetry'),
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
  title: () => `${t('seo.tiebanPaipanTitle')} - ${siteName}`,
  description: t('seo.tiebanPaipanDesc'),
  keywords: t('seo.tiebanPaipanKeywords'),
  ogTitle: () => `${t('seo.tiebanPaipanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.tiebanPaipanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/tieban-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('tiebanPaipan.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/tieban-paipan')}`,
        description: t('seo.tiebanPaipanDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.tbp-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.tbp-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.tbp-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.tbp-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tbp-title {
  font-size: 30px;
  line-height: 1.2;
}

.tbp-subtitle {
  max-width: 720px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 14px;
}

.tbp-back {
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

.tbp-form-wrap {
  display: grid;
  gap: 18px;
  max-width: 720px;
  margin: 0 auto;
}

.tbp-card {
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.tbp-card-title {
  margin-bottom: 18px;
  font-size: 18px;
}

.tbp-card form,
.tbp-card {
  display: grid;
  gap: 18px;
}

.tbp-card label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 14px;
}

.tbp-card input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-input);
  color: var(--text-primary);
}

.tbp-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.tbp-gender {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.tbp-gender button {
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
}

.tbp-gender button.active {
  border-color: var(--accent-border-hover);
  background: var(--accent-bg);
  color: var(--accent);
}

.tbp-field-hint {
  margin: 7px 0 0;
  color: var(--text-faint);
  font-size: 12px;
}

.tbp-hints {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tbp-hint {
  display: flex;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
}

.tbp-hint :deep(.iconify) {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.tbp-loading {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.tbp-loading-dot {
  width: 12px;
  height: 12px;
  border: 2px solid var(--accent-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: tbp-spin 900ms linear infinite;
}

.tbp-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

@keyframes tbp-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 720px) {
  .tbp-grid-2,
  .tbp-hints {
    grid-template-columns: 1fr;
  }
}
</style>
