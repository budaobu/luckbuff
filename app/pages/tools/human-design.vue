<template>
  <div class="hd-page">
    <div class="hd-container">
      <header class="hd-header">
        <div>
          <p class="hd-eyebrow">Human Design</p>
          <h1 class="hd-title">{{ $t('humanDesign.title') }}</h1>
          <p class="hd-subtitle">{{ $t('humanDesign.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="hd-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="hd-form-layout">
        <form class="hd-card hd-form" @submit.prevent="handleSubmit">
          <h2>{{ $t('humanDesign.formTitle') }}</h2>

          <div class="hd-form-grid">
            <label>
              <span>{{ $t('profileForm.birthDate') }} <i>*</i></span>
              <UInput
                v-model="form.birthDate"
                type="date"
                color="warning"
                required
                class="w-full"
                :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)]' }"
              />
            </label>

            <label>
              <span>{{ $t('humanDesign.birthTime') }} <i>*</i></span>
              <UInput
                v-model="form.birthTime"
                type="time"
                color="warning"
                required
                class="w-full"
                :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)]' }"
              />
            </label>
          </div>

          <label>
            <span>{{ $t('humanDesign.timezone') }} <i>*</i></span>
            <USelect
              v-model="form.timezone"
              :items="timezoneOptions"
              color="warning"
              required
              class="w-full"
              :ui="{
                base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)]',
                content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl',
              }"
            />
          </label>

          <label>
            <span>{{ $t('humanDesign.birthLocation') }}</span>
            <UInput
              v-model="form.location"
              color="warning"
              :placeholder="$t('humanDesign.birthLocationPlaceholder')"
              class="w-full"
              :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
            />
          </label>

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
            {{ $t('humanDesign.submit') }}
          </UButton>
        </form>

        <aside class="hd-hints">
          <article class="hd-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('humanDesign.timeHint') }}</p>
          </article>
          <article class="hd-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('humanDesign.locationHint') }}</p>
          </article>
          <article class="hd-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('humanDesign.privacyHint') }}</p>
          </article>
        </aside>
      </section>

      <section v-else-if="phase === 'loading'" class="hd-loading">
        <span class="hd-loading-dot" />
        <p>{{ $t('humanDesign.calculating') }}</p>
      </section>

      <div v-else-if="result" class="hd-report">
        <HumanDesignReport :result="result" />
        <div class="hd-actions">
          <UButton color="warning" variant="soft" @click="resetToForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HumanDesignChartResult } from '~~/server/utils/tools/human-design'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

interface FormValues {
  birthDate: string
  birthTime: string
  timezone: string
  location: string
}

const COMMON_TIMEZONES = [
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Bangkok',
  'Asia/Kuala_Lumpur',
  'Asia/Jakarta',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const phase = ref<'form' | 'loading' | 'result'>('form')
const isSubmitting = ref(false)
const result = ref<HumanDesignChartResult | null>(null)
const detectedTimezone = ref('')
const form = reactive<FormValues>({
  birthDate: '',
  birthTime: '',
  timezone: '',
  location: '',
})

const timezoneOptions = computed(() => {
  const items = COMMON_TIMEZONES.map(value => ({ label: value, value }))
  if (detectedTimezone.value && !COMMON_TIMEZONES.includes(detectedTimezone.value)) {
    items.unshift({ label: `${t('humanDesign.deviceTimezone')} · ${detectedTimezone.value}`, value: detectedTimezone.value })
  }
  return items
})

onMounted(() => {
  try {
    detectedTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  }
  catch {
    detectedTimezone.value = 'Asia/Shanghai'
  }
  form.timezone = detectedTimezone.value
})

async function resolveLocation(name: string) {
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

async function handleSubmit() {
  if (!form.birthDate || !form.birthTime || !form.timezone) {
    toast.add({ title: t('humanDesign.requiredError'), color: 'error' })
    return
  }

  phase.value = 'loading'
  isSubmitting.value = true
  try {
    let location: Awaited<ReturnType<typeof resolveLocation>> | null = null
    if (form.location.trim()) {
      location = await resolveLocation(form.location.trim())
    }

    result.value = await $fetch<HumanDesignChartResult>('/api/tools/human-design/calc', {
      method: 'POST',
      body: {
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        timezone: form.timezone,
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
      title: t('humanDesign.fail'),
      description: error?.data?.statusMessage || error?.message || t('humanDesign.pleaseRetry'),
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
const pageUrl = computed(() => `https://www.ososn.com${localePath('/tools/human-design')}`)

useSeoMeta({
  title: () => `${t('seo.humanDesignTitle')} - ${siteName}`,
  description: t('seo.humanDesignDesc'),
  keywords: t('seo.humanDesignKeywords'),
  ogTitle: () => `${t('seo.humanDesignOgTitle')} - ${siteName}`,
  ogDescription: t('seo.humanDesignOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('humanDesign.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.humanDesignDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.hd-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.hd-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.hd-header {
  position: relative;
  display: grid;
  gap: 16px;
  margin-bottom: 28px;
  text-align: center;
}

.hd-eyebrow {
  margin-bottom: 7px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hd-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.hd-subtitle {
  max-width: 680px;
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.hd-back {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
}

.hd-form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 300px);
  gap: 22px;
  align-items: start;
}

.hd-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 22px;
}

.hd-form {
  display: grid;
  gap: 16px;
}

.hd-form h2 {
  margin: 0;
  font-size: 20px;
}

.hd-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.hd-form label,
.hd-hint {
  display: grid;
  gap: 7px;
}

.hd-form label > span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

.hd-form label i {
  color: var(--accent);
  font-style: normal;
}

.hd-hints {
  display: grid;
  gap: 10px;
}

.hd-hint {
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-card) 70%, transparent);
}

.hd-hint .w-4 {
  color: var(--accent);
}

.hd-hint p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.hd-loading {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 72px 0;
}

.hd-loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--accent);
  animation: pulse 1.2s ease-in-out infinite;
}

.hd-loading p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.hd-report {
  display: grid;
  gap: 18px;
}

.hd-actions {
  display: flex;
  justify-content: flex-end;
}

@keyframes pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1); }
}

@media (max-width: 860px) {
  .hd-form-layout {
    grid-template-columns: 1fr;
  }

  .hd-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
