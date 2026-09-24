<template>
  <div class="tbp-page">
    <div class="tbp-container">
      <header class="tbp-header">
        <div>
          <p class="tbp-eyebrow">Thai Birthday Buddha</p>
          <h1>{{ $t('thaiBuddha.title') }}</h1>
          <p class="tbp-subtitle">{{ $t('thaiBuddha.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/fortune-telling')" class="tbp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('tools.categoryFortuneTelling') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="tbp-layout">
        <form class="tbp-card" @submit.prevent="handleSubmit">
          <h2>{{ $t('thaiBuddha.formTitle') }}</h2>
          <div class="tbp-form-grid">
            <label>
              <span>{{ $t('thaiBuddha.birthDate') }} <i>*</i></span>
              <UInput
                v-model="form.birthDate"
                type="date"
                color="warning"
                required
                class="w-full"
                :ui="inputUi"
              />
            </label>
            <label>
              <span>{{ $t('thaiBuddha.birthTime') }} <i>*</i></span>
              <UInput
                v-model="form.birthTime"
                type="time"
                color="warning"
                required
                class="w-full"
                :ui="inputUi"
              />
            </label>
          </div>
          <label>
            <span>{{ $t('thaiBuddha.birthCity') }}</span>
            <UInput
              v-model="form.city"
              color="warning"
              :placeholder="$t('thaiBuddha.birthCityPlaceholder')"
              class="w-full"
              :ui="inputUi"
            />
          </label>
          <UButton type="submit" color="warning" size="lg" block :loading="isSubmitting">
            <template #leading><UIcon name="i-heroicons-sparkles" class="h-5 w-5" /></template>
            {{ $t('thaiBuddha.submit') }}
          </UButton>
        </form>

        <aside class="tbp-hints">
          <article><UIcon name="i-heroicons-clock" class="h-4 w-4" /><p>{{ $t('thaiBuddha.timeHint') }}</p></article>
          <article><UIcon name="i-heroicons-map-pin" class="h-4 w-4" /><p>{{ $t('thaiBuddha.locationHint') }}</p></article>
          <article><UIcon name="i-heroicons-shield-check" class="h-4 w-4" /><p>{{ $t('thaiBuddha.privacyHint') }}</p></article>
        </aside>
      </section>

      <section v-else-if="phase === 'loading'" class="tbp-loading">
        <span />
        <p>{{ $t('thaiBuddha.calculating') }}</p>
      </section>

      <div v-else-if="result" class="tbp-report">
        <ThaiBuddhaDaysReport :result="result" />
        <div class="tbp-actions">
          <UButton color="warning" variant="soft" @click="resetToForm">
            <template #leading><UIcon name="i-heroicons-arrow-path" class="h-4 w-4" /></template>
            {{ $t('common.retry') }}
          </UButton>
          <AppShareButton
            tool="thai-buddha"
            :summary="shareSummary"
            filename="thai-buddha-poster.png"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThaiBuddhaResult } from '~~/server/utils/tools/thai-buddha'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

const phase = ref<'form' | 'loading' | 'result'>('form')
const isSubmitting = ref(false)
const result = ref<ThaiBuddhaResult | null>(null)
const form = reactive({
  birthDate: '',
  birthTime: '',
  city: '',
})

const inputUi = {
  base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${t(`thaiBuddha.days.${result.value.day.key}.name`)} · ${t(`thaiBuddha.planets.${result.value.day.planet}`)}`
})

async function resolveLocation(name: string) {
  const direct = await resolveCityCoords(name)
  if (direct?.timezone) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback?.latitude != null && fallback?.longitude != null) {
    return {
      name,
      latitude: fallback.latitude,
      longitude: fallback.longitude,
      timezone: detectTimezone(),
    }
  }
  return null
}

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  }
  catch {
    return 'Asia/Shanghai'
  }
}

async function handleSubmit() {
  if (!form.birthDate || !form.birthTime) {
    toast.add({ title: t('thaiBuddha.requiredError'), color: 'error' })
    return
  }

  phase.value = 'loading'
  isSubmitting.value = true
  try {
    const city = form.city.trim()
    const location = city ? await resolveLocation(city) : null
    if (city && !location) {
      throw new Error(t('thaiBuddha.locationFail'))
    }

    result.value = await plainFetch<ThaiBuddhaResult>('/api/tools/thai-buddha/calc', {
      method: 'POST',
      body: {
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        birthTimezone: detectTimezone(),
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
      title: t('thaiBuddha.fail'),
      description: error?.data?.statusMessage || error?.message || t('thaiBuddha.pleaseRetry'),
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
const pageUrl = useLocalizedSeoUrl('/tools/thai-buddha')

useSeoMeta({
  title: () => `${t('seo.thaiBuddhaTitle')} - ${siteName}`,
  description: t('seo.thaiBuddhaDesc'),
  keywords: t('seo.thaiBuddhaKeywords'),
  ogTitle: () => `${t('seo.thaiBuddhaOgTitle')} - ${siteName}`,
  ogDescription: t('seo.thaiBuddhaOgDesc'),
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
      name: t('seo.thaiBuddhaTitle'),
      url: pageUrl.value,
      description: t('seo.thaiBuddhaDesc'),
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: t('thaiBuddha.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.thaiBuddhaDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      },
    }),
  }],
}))
</script>

<style scoped>
.tbp-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.tbp-container { width: 100%; max-width: 1120px; margin: 0 auto; padding: 40px 20px 72px; }
.tbp-header { position: relative; display: grid; gap: 14px; margin-bottom: 28px; text-align: center; }
.tbp-eyebrow { margin-bottom: 7px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.tbp-header h1 { margin: 0; font-size: 28px; font-weight: 800; line-height: 1.2; }
.tbp-subtitle { max-width: 700px; margin: 9px auto 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.tbp-back { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; text-decoration: none; }
.tbp-back:hover { color: var(--accent); }
.tbp-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 300px); gap: 22px; align-items: start; }
.tbp-card { padding: 22px; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); }
.tbp-card h2 { margin: 0 0 16px; font-size: 18px; }
.tbp-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.tbp-card label { display: grid; gap: 7px; margin-top: 14px; }
.tbp-card span { color: var(--text-muted); font-size: 13px; }
.tbp-card i { color: var(--accent); font-style: normal; }
.tbp-hints { display: grid; gap: 9px; }
.tbp-hints article { display: flex; gap: 9px; align-items: flex-start; padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: 10px; background: color-mix(in srgb, var(--surface-card) 74%, transparent); color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.tbp-hints .ui-icon { flex: 0 0 auto; margin-top: 2px; color: var(--accent); }
.tbp-loading { display: grid; place-items: center; gap: 12px; min-height: 240px; color: var(--text-muted); }
.tbp-loading span { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: tbp-pulse 1.3s infinite; }
.tbp-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
@keyframes tbp-pulse { 0%, 100% { opacity: .3; transform: scale(.8); } 50% { opacity: 1; transform: scale(1); } }
@media (max-width: 760px) {
  .tbp-back { position: static; justify-self: center; }
  .tbp-header h1 { font-size: 24px; }
  .tbp-layout, .tbp-form-grid { grid-template-columns: 1fr; }
}
</style>
