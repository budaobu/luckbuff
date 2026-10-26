<template>
  <div class="kk-page">
    <div class="kk-container">
      <header class="kk-header" :class="{ 'is-result': phase === 'result' }">
        <div class="kk-copy">
          <p class="kk-eyebrow">{{ $t('kyuseiKigaku.eyebrow') }}</p>
          <h1>{{ $t('kyuseiKigaku.title') }}</h1>
          <p class="kk-subtitle">{{ $t('kyuseiKigaku.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="kk-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" v-reveal.stagger class="kk-form-wrap">
        <div class="kk-card">
          <h2>{{ $t('kyuseiKigaku.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-name="false"
            :show-former-name="false"
            require-hour
            :submit-label="$t('kyuseiKigaku.submit')"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="kk-hints">
          <article class="kk-hint"><UIcon name="i-heroicons-clock" class="h-4 w-4" /><p>{{ $t('kyuseiKigaku.hourHint') }}</p></article>
          <article class="kk-hint"><UIcon name="i-heroicons-map-pin" class="h-4 w-4" /><p>{{ $t('kyuseiKigaku.locationHint') }}</p></article>
          <article class="kk-hint"><UIcon name="i-heroicons-shield-check" class="h-4 w-4" /><p>{{ $t('kyuseiKigaku.privacyHint') }}</p></article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="kk-loading"><span /><p>{{ $t('kyuseiKigaku.calculating') }}</p></section>

      <div v-else-if="result" v-reveal><KyuseiKigakuReport :result="result" /></div>

      <div v-if="phase === 'result'" class="kk-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading><UIcon name="i-heroicons-arrow-path" class="h-4 w-4" /></template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton tool="kyusei-kigaku" :summary="shareSummary" filename="kyusei-kigaku-poster.png" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { KyuseiPaipanResult } from '~~/app/types/kyusei-kigaku'

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
const result = ref<KyuseiPaipanResult | null>(null)
const lastFormValues = ref<Partial<FormValues>>({})
const shareSummary = computed(() => result.value
  ? `${result.value.natal.yearStar.star} · ${result.value.natal.monthStar.star} · ${result.value.natal.dayStar.star}`
  : undefined)

async function resolveLocation(name: string) {
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

async function handleSubmit(values: FormValues) {
  if (!values.birthDate || !values.birthHour) {
    toast.add({ title: t('kyuseiKigaku.requiredError'), color: 'error' })
    return
  }
  phase.value = 'loading'
  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    result.value = await plainFetch<KyuseiPaipanResult>('/api/tools/kyusei-kigaku/calc', {
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
      title: t('kyuseiKigaku.fail'),
      description: error?.data?.statusMessage || error?.message || t('kyuseiKigaku.pleaseRetry'),
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

const siteName = useRuntimeConfig().public.siteName || 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/kyusei-kigaku')

useSeoMeta({
  title: () => t('kyuseiKigaku.seo.kyuseiKigakuTitle'),
  description: t('kyuseiKigaku.seo.kyuseiKigakuDesc'),
  keywords: t('kyuseiKigaku.seo.kyuseiKigakuKeywords'),
  ogTitle: () => t('kyuseiKigaku.seo.kyuseiKigakuOgTitle'),
  ogDescription: t('kyuseiKigaku.seo.kyuseiKigakuOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('kyuseiKigaku.seo.kyuseiKigakuOgTitle'),
  twitterDescription: t('kyuseiKigaku.seo.kyuseiKigakuOgDesc'),
  twitterImage: 'https://www.ososn.com/og-image.png',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t('kyuseiKigaku.title'),
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      url: pageUrl.value,
      description: t('kyuseiKigaku.seo.kyuseiKigakuDesc'),
      inLanguage: locale.value,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    }),
  }],
}))
</script>

<style scoped>
.kk-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-body); }
.kk-container { width: 100%; max-width: 1120px; margin: 0 auto; padding: 72px 24px 88px; }
.kk-header { position: relative; min-height: calc(100svh - 210px); display: grid; align-content: center; }
.kk-eyebrow { margin: 0 0 16px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
.kk-copy h1 { margin: 0; font-size: clamp(36px, 5vw, 64px); font-weight: 650; line-height: 1.06; }
.kk-subtitle { max-width: 620px; margin: 20px 0 0; color: var(--text-muted); font-size: 16px; line-height: 1.7; }
.kk-back { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: 5px; color: var(--text-muted); font-size: 13px; text-decoration: none; }
.kk-back:hover { color: var(--accent); }
.kk-form-wrap { display: grid; gap: 16px; }
.kk-card { border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--surface-card); padding: 24px; box-shadow: var(--shadow-panel); backdrop-filter: blur(16px); }
.kk-card h2 { margin: 0 0 18px; font-size: 18px; }
.kk-hints { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.kk-hint { display: flex; gap: 10px; align-items: flex-start; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--surface-card); padding: 16px; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.kk-hint .ui-icon { flex: 0 0 auto; margin-top: 2px; color: var(--accent); }
.kk-loading { min-height: 40vh; display: grid; place-items: center; gap: 12px; color: var(--text-muted); }
.kk-loading span { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: kk-pulse 1.4s infinite; }
.kk-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
@keyframes kk-pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .kk-loading span { animation: none; } }
@media (max-width: 820px) {
  .kk-container { padding: 48px 18px 64px; }
  .kk-header { min-height: auto; margin: 52px 0 28px; }
  .kk-back { position: static; margin-bottom: 16px; }
  .kk-hints { grid-template-columns: 1fr; }
}
</style>
