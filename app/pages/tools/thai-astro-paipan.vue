<template>
  <div class="tap-page">
    <div class="tap-container">
      <header class="tap-header">
        <div>
          <p class="tap-eyebrow">Thai 12 Rasi</p>
          <h1 class="tap-title">{{ $t('thaiAstro.title') }}</h1>
          <p class="tap-subtitle">{{ $t('thaiAstro.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="tap-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="tap-form-layout">
        <form class="tap-card tap-form" @submit.prevent="handleSubmit">
          <h2>{{ $t('thaiAstro.formTitle') }}</h2>

          <div class="tap-form-grid">
            <div>
              <span>{{ $t('thaiAstro.birthDate') }} <i>*</i></span>
              <UPopover>
                <UButton
                  type="button"
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)]"
                  :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="mr-2 h-4 w-4 text-[var(--text-faint)]" />
                  {{ form.birthDate && calendarDate ? dateFormatter.format(calendarDate.toDate(timezone)) : $t('thaiAstro.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <LazyAppCalendar v-model="calendarDate" color="warning" class="p-2" />
                </template>
              </UPopover>
            </div>
            <div>
              <span>{{ $t('thaiAstro.birthTime') }} <i>*</i></span>
              <AppTimePicker
                v-model="form.birthTime"
                :placeholder="$t('thaiAstro.birthTimePlaceholder')"
                :hour-placeholder="$t('thaiAstro.hourPlaceholder')"
                :minute-placeholder="$t('thaiAstro.minutePlaceholder')"
                required
              />
            </div>
          </div>

          <label>
            <span>{{ $t('thaiAstro.birthCity') }} <i>*</i></span>
            <UInput
              v-model="form.city"
              color="warning"
              :placeholder="$t('thaiAstro.birthCityPlaceholder')"
              class="w-full"
              :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
            />
          </label>

          <div>
            <span class="tap-gender-label">{{ $t('thaiAstro.gender') }}</span>
            <div class="tap-gender" role="group" :aria-label="$t('thaiAstro.gender')">
              <button
                v-for="gender in genderOptions"
                :key="gender.value"
                type="button"
                :class="{ active: form.gender === gender.value }"
                :aria-pressed="form.gender === gender.value"
                @click="form.gender = gender.value"
              >
                {{ gender.label }}
              </button>
            </div>
          </div>

          <UButton
            type="submit"
            color="warning"
            size="lg"
            block
            :loading="isSubmitting"
            class="mt-2"
          >
            <template #leading>
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </template>
            {{ $t('thaiAstro.submit') }}
          </UButton>
        </form>

        <aside class="tap-hints">
          <article class="tap-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('thaiAstro.timeHint') }}</p>
          </article>
          <article class="tap-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('thaiAstro.locationHint') }}</p>
          </article>
          <article class="tap-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('thaiAstro.privacyHint') }}</p>
          </article>
        </aside>
      </section>

      <section v-else-if="phase === 'loading'" class="tap-loading">
        <span />
        <p>{{ $t('thaiAstro.calculating') }}</p>
      </section>

      <div v-else-if="result" class="tap-report">
        <ThaiAstro3DStage :result="result" />
      </div>
      <div v-if="phase === 'result'" class="tap-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="thai-astro-paipan"
          :summary="shareSummary"
          filename="thai-astro-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThaiAstroChartResult } from '~~/server/utils/tools/thai-astro-paipan'
import ThaiAstro3DStage from '~/components/thai-astro-3d/ThaiAstro3DStage.vue'
import { DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'loading' | 'result'>('form')
const isSubmitting = ref(false)
const result = ref<ThaiAstroChartResult | null>(null)
const form = reactive({
  birthDate: '',
  birthTime: '',
  city: '',
  gender: 'unknown',
})

const timezone = getLocalTimeZone()
const dateFormatter = computed(() => new DateFormatter(locale.value, { dateStyle: 'long' }))
const calendarDate = shallowRef<DateValue | undefined>(undefined)

watch(calendarDate, (date) => {
  form.birthDate = date
    ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    : ''
})

const genderOptions = computed(() => [
  { label: t('thaiAstro.genderUnknown'), value: 'unknown' },
  { label: t('thaiAstro.genderFemale'), value: 'female' },
  { label: t('thaiAstro.genderMale'), value: 'male' },
])

const shareSummary = computed(() => {
  if (!result.value) return undefined
  const sun = result.value.planets.find(planet => planet.key === 'Sun')
  const moon = result.value.planets.find(planet => planet.key === 'Moon')
  return [sun?.signNameTh, moon?.signNameTh, result.value.ascendant.signNameTh].filter(Boolean).join(' · ')
})

async function handleSubmit() {
  if (!form.birthDate || !form.birthTime || !form.city.trim()) {
    toast.add({ title: t('thaiAstro.requiredError'), color: 'error' })
    return
  }

  phase.value = 'loading'
  isSubmitting.value = true
  try {
    result.value = await plainFetch<ThaiAstroChartResult>('/api/tools/thai-astro-paipan/calc', {
      method: 'POST',
      body: {
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        city: form.city.trim(),
        gender: form.gender === 'unknown' ? '' : form.gender,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('thaiAstro.fail'),
      description: error?.data?.statusMessage || error?.message || t('thaiAstro.pleaseRetry'),
      color: 'error',
    })
  }
  finally {
    isSubmitting.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

const siteName = 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/thai-astro-paipan')

useSeoMeta({
  title: () => `${t('seo.thaiAstroTitle')} - ${siteName}`,
  description: t('seo.thaiAstroDesc'),
  keywords: t('seo.thaiAstroKeywords'),
  ogTitle: () => `${t('seo.thaiAstroOgTitle')} - ${siteName}`,
  ogDescription: t('seo.thaiAstroOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('seo.thaiAstroTitle'),
      url: pageUrl.value,
      description: t('seo.thaiAstroDesc'),
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: t('thaiAstro.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.thaiAstroDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      },
    }),
  }],
}))
</script>

<style scoped>
.tap-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.tap-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.tap-header {
  position: relative;
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.tap-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tap-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.tap-subtitle {
  max-width: 680px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.tap-back {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: none;
}

.tap-back:hover {
  color: var(--accent);
}

.tap-form-layout {
  display: grid;
  gap: 20px;
}

.tap-card {
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.tap-form {
  display: grid;
  gap: 16px;
}

.tap-form h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.tap-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.tap-form label {
  display: grid;
  gap: 7px;
}

.tap-form label > span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

.tap-form label i {
  color: var(--accent);
  font-style: normal;
}

.tap-gender-label {
  display: block;
  margin-bottom: 7px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

.tap-gender {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.tap-gender button {
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.2s, background-color 0.2s, color 0.2s;
}

.tap-gender button.active {
  border-color: var(--accent-border-hover);
  background: var(--accent-bg);
  color: var(--accent);
}

.tap-hints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.tap-hint {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.tap-hint .ui-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.tap-hint p {
  margin: 0;
}

.tap-loading {
  display: grid;
  justify-items: center;
  gap: 12px;
  min-height: 240px;
}

.tap-loading span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--accent);
  animation: tap-pulse 1.2s ease-in-out infinite;
}

.tap-report {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.tap-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 26px;
  flex-wrap: wrap;
}

@keyframes tap-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
}

@media (max-width: 900px) {
  .tap-container {
    padding: 28px 16px 56px;
  }

  .tap-title {
    font-size: 24px;
  }

  .tap-back {
    position: static;
    justify-self: center;
    justify-content: center;
  }

  .tap-hints {
    grid-template-columns: 1fr;
  }

  .tap-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
