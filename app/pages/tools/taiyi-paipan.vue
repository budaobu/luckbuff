<template>
  <div class="typ-page">
    <div class="typ-container">
      <header class="typ-header">
        <div>
          <p class="typ-eyebrow">Taiyi Chart</p>
          <h1>{{ $t('taiyiPaipan.title') }}</h1>
          <p class="typ-subtitle">{{ $t('taiyiPaipan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="typ-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="typ-form-wrap">
        <form class="typ-card typ-form" @submit.prevent="handleSubmit">
          <h2>{{ $t('taiyiPaipan.formTitle') }}</h2>
          <DivinationTimeCard
            ref="timeCardRef"
            :label="$t('taiyiPaipan.time')"
            :hint="$t('taiyiPaipan.timeHint')"
            required
          />

          <fieldset>
            <legend>{{ $t('taiyiPaipan.jiStyle') }}</legend>
            <div class="typ-segment">
              <button
                v-for="option in jiStyleOptions"
                :key="option.value"
                type="button"
                :class="{ active: form.jiStyle === option.value }"
                @click="form.jiStyle = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>{{ $t('taiyiPaipan.acumMethod') }}</legend>
            <div class="typ-segment">
              <button
                v-for="option in methodOptions"
                :key="option.value"
                type="button"
                :class="{ active: form.method === option.value }"
                @click="form.method = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </fieldset>

          <div>
            <label for="taiyi-paipan-location">{{ $t('taiyiPaipan.location') }}</label>
            <UInput
              id="taiyi-paipan-location"
              v-model="form.location"
              :placeholder="$t('taiyiPaipan.locationPlaceholder')"
              class="w-full"
            />
            <p class="typ-field-hint">{{ $t('taiyiPaipan.locationHint') }}</p>
          </div>

          <UButton type="submit" color="warning" size="lg" block>
            <template #leading>
              <UIcon name="i-heroicons-table-cells" class="h-4 w-4" />
            </template>
            {{ $t('taiyiPaipan.submit') }}
          </UButton>
        </form>

        <div class="typ-hints">
          <article><UIcon name="i-heroicons-clock" class="h-4 w-4" /><p>{{ $t('taiyiPaipan.timeHint') }}</p></article>
          <article><UIcon name="i-heroicons-map-pin" class="h-4 w-4" /><p>{{ $t('taiyiPaipan.locationHint') }}</p></article>
          <article><UIcon name="i-heroicons-sun" class="h-4 w-4" /><p>{{ $t('taiyiPaipan.solarTimeHint') }}</p></article>
          <article><UIcon name="i-heroicons-shield-check" class="h-4 w-4" /><p>{{ $t('taiyiPaipan.privacyHint') }}</p></article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="typ-loading">
        <span class="typ-dot" />
        <p>{{ $t('taiyiPaipan.calculating') }}</p>
      </section>

      <div v-else-if="result" class="typ-report">
        <TaiyiPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="typ-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading><UIcon name="i-heroicons-arrow-path" class="h-4 w-4" /></template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton tool="taiyi-paipan" :summary="shareSummary" filename="taiyi-paipan-poster.png" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaiyiAcumMethod, TaiyiPaipanResult } from '~~/app/types/taiyi-paipan'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()
const timeCardRef = ref<{ iso: string, timezone: string } | null>(null)

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<TaiyiPaipanResult | null>(null)
const form = ref({
  location: '',
  jiStyle: 'hour' as 'year' | 'month' | 'day' | 'hour',
  method: 0 as TaiyiAcumMethod,
})

const jiStyleOptions = computed(() => [
  { value: 'hour' as const, label: t('taiyiPaipan.jiOptions.hour') },
  { value: 'day' as const, label: t('taiyiPaipan.jiOptions.day') },
  { value: 'month' as const, label: t('taiyiPaipan.jiOptions.month') },
  { value: 'year' as const, label: t('taiyiPaipan.jiOptions.year') },
])

const methodOptions = computed(() => [
  { value: 0 as TaiyiAcumMethod, label: t('taiyiPaipan.methodOptions.tongzong') },
  { value: 1 as TaiyiAcumMethod, label: t('taiyiPaipan.methodOptions.jinjing') },
  { value: 2 as TaiyiAcumMethod, label: t('taiyiPaipan.methodOptions.taojin') },
  { value: 3 as TaiyiAcumMethod, label: t('taiyiPaipan.methodOptions.ju') },
])

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.summary.juText} · ${result.value.summary.taiyiPalaceName}${t('taiyiPaipan.palaceSuffix')}`
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
    toast.add({ title: t('taiyiPaipan.requiredError'), color: 'error' })
    return
  }
  phase.value = 'loading'
  try {
    const location = await resolveLocation(form.value.location)
    const timezone = location?.timezone || timeCardRef.value?.timezone || browserTimezone()
    result.value = await $fetch<TaiyiPaipanResult>('/api/tools/taiyi-paipan/calc', {
      method: 'POST',
      body: {
        datetime,
        timezone,
        location: form.value.location,
        longitude: location?.longitude,
        latitude: location?.latitude,
        jiStyle: form.value.jiStyle,
        method: form.value.method,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('taiyiPaipan.fail'),
      description: error?.data?.statusMessage || error?.message || t('taiyiPaipan.pleaseRetry'),
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
  title: () => `${t('seo.taiyiPaipanTitle')} - ${siteName}`,
  description: t('seo.taiyiPaipanDesc'),
  keywords: t('seo.taiyiPaipanKeywords'),
  ogTitle: () => `${t('seo.taiyiPaipanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.taiyiPaipanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/taiyi-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: t('taiyiPaipan.title'),
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      url: `https://www.ososn.com${localePath('/tools/taiyi-paipan')}`,
      description: t('seo.taiyiPaipanDesc'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    }),
  }],
}))
</script>

<style scoped>
.typ-page{min-height:100vh;background:var(--surface-bg);color:var(--text-primary)}
.typ-container{width:100%;max-width:1120px;margin:0 auto;padding:40px 20px 72px}
.typ-header{display:grid;gap:16px;margin-bottom:28px;text-align:center}
.typ-eyebrow{margin-bottom:8px;color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.typ-header h1{font-size:30px;line-height:1.2}
.typ-subtitle{max-width:720px;margin:10px auto 0;color:var(--text-muted);font-size:14px}
.typ-back{justify-self:center;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid var(--border-subtle);border-radius:999px;color:var(--text-secondary)}
.typ-form-wrap{display:grid;grid-template-columns:minmax(0,440px);justify-content:center;gap:18px}
.typ-card{background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:8px;padding:20px}
.typ-form{display:grid;gap:18px}
.typ-form h2,.typ-form legend{margin:0;font-size:15px;font-weight:600}
.typ-form fieldset{border:0;padding:0}
.typ-form legend{margin-bottom:8px;color:var(--text-muted)}
.typ-form label{display:block;margin-bottom:7px;color:var(--text-muted);font-size:13px}
.typ-field-hint,.typ-hints p{margin:6px 0 0;color:var(--text-faint);font-size:11px;line-height:1.6}
.typ-segment{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:3px;background:var(--surface-input);border:1px solid var(--border-light);border-radius:7px}
.typ-segment button{min-height:31px;border:0;border-radius:5px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer}
.typ-segment button.active{background:var(--surface-card);color:var(--accent);box-shadow:0 1px 2px rgb(0 0 0 / 6%)}
.typ-hints{display:grid;gap:10px}
.typ-hints article{display:flex;gap:9px;align-items:flex-start;padding:12px;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:8px}
.typ-hints svg{flex:0 0 auto;margin-top:1px;color:var(--accent)}
.typ-hints p{margin:0}
.typ-loading{display:grid;justify-items:center;gap:10px;padding:80px 20px;color:var(--text-muted)}
.typ-dot{width:9px;height:9px;border-radius:50%;background:var(--accent);animation:pulse 1.2s ease-in-out infinite}
.typ-actions{display:flex;justify-content:center;gap:10px;margin-top:24px}
@keyframes pulse{0%,100%{opacity:.35;transform:scale(.88)}50%{opacity:1;transform:scale(1)}}
@media (max-width:640px){
  .typ-container{padding:28px 16px 56px}
  .typ-header h1{font-size:25px}
  .typ-segment{grid-template-columns:repeat(2,minmax(0,1fr))}
}
</style>
