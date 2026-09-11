<template>
  <div class="hjp-page">
    <div class="hjp-container">
      <header class="hjp-header">
        <div>
          <p class="hjp-eyebrow">Huangji Jingshi Chart</p>
          <h1 class="hjp-title">{{ $t('huangjiPaipan.title') }}</h1>
          <p class="hjp-subtitle">{{ $t('huangjiPaipan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="hjp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="hjp-form-wrap">
        <form class="hjp-card" @submit.prevent="handleSubmit">
          <h2>{{ $t('huangjiPaipan.formTitle') }}</h2>
          <label for="huangji-year">{{ $t('huangjiPaipan.year') }}</label>
          <UInput
            id="huangji-year"
            v-model="yearText"
            type="number"
            inputmode="numeric"
            min="1900"
            max="2100"
            required
            class="w-full"
          />
          <div class="hjp-presets">
            <button v-for="preset in presets" :key="preset.year" type="button" @click="yearText = String(preset.year)">
              {{ preset.label }}
            </button>
          </div>
          <UButton type="submit" color="warning" size="lg" block>
            <template #leading>
              <UIcon name="i-heroicons-calculator" class="h-4 w-4" />
            </template>
            {{ $t('huangjiPaipan.submit') }}
          </UButton>
        </form>

        <div class="hjp-hints">
          <article>
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('huangjiPaipan.rangeHint') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-square-3-stack-3d" class="h-4 w-4" />
            <p>{{ $t('huangjiPaipan.layerHint') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-book-open" class="h-4 w-4" />
            <p>{{ $t('huangjiPaipan.methodHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="hjp-loading">
        <span class="hjp-loading-dot" />
        <p>{{ $t('huangjiPaipan.calculating') }}</p>
      </section>

      <div v-else-if="result" class="hjp-report">
        <HuangjiPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="hjp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="huangji-paipan"
          :summary="shareSummary"
          filename="huangji-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HuangjiPaipanResult } from '~~/server/utils/huangji/paipan'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const STORAGE_KEY = 'huangji-paipan:last'
const YEAR_MIN = 1900
const YEAR_MAX = 2100
const currentYear = new Date().getFullYear()

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<HuangjiPaipanResult | null>(null)
const yearText = ref(String(currentYear))

const presets = computed(() => [
  { year: currentYear, label: t('huangjiPaipan.thisYear') },
  { year: currentYear + 1, label: t('huangjiPaipan.nextYear') },
  { year: currentYear + 2, label: t('huangjiPaipan.yearAfter') },
])

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.ganzhi} · ${result.value.layers.annual.name} · ${result.value.chronology.hui.label}`
})

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) yearText.value = saved
})

async function handleSubmit() {
  const year = Number(yearText.value)
  if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
    toast.add({ title: t('huangjiPaipan.rangeError', { min: YEAR_MIN, max: YEAR_MAX }), color: 'error' })
    return
  }

  phase.value = 'loading'
  try {
    result.value = await $fetch<HuangjiPaipanResult>('/api/tools/huangji-paipan/calc', {
      method: 'POST',
      body: { year },
    })
    localStorage.setItem(STORAGE_KEY, String(year))
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('huangjiPaipan.fail'),
      description: error?.data?.statusMessage || error?.message || t('huangjiPaipan.pleaseRetry'),
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
  title: () => `${t('seo.huangjiPaipanTitle')} - ${siteName}`,
  description: t('seo.huangjiPaipanDesc'),
  keywords: t('seo.huangjiPaipanKeywords'),
  ogTitle: () => `${t('seo.huangjiPaipanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.huangjiPaipanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/huangji-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('huangjiPaipan.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: 'https://www.ososn.com/tools/huangji-paipan',
        description: t('seo.huangjiPaipanDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.hjp-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.hjp-container { width: 100%; max-width: 1160px; margin: 0 auto; padding: 40px 20px 72px; }
.hjp-header { display: grid; gap: 18px; margin-bottom: 30px; position: relative; text-align: center; }
.hjp-eyebrow { margin-bottom: 8px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.hjp-title { margin: 0; font-size: 28px; line-height: 1.2; }
.hjp-subtitle { max-width: 680px; margin: 10px 0 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.hjp-back { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.hjp-back:hover { color: var(--accent); }
.hjp-form-wrap { display: grid; grid-template-columns: minmax(0, 460px) minmax(0, 1fr); gap: 20px; align-items: start; }
.hjp-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; }
.hjp-form-wrap h2 { margin: 0 0 18px; font-size: 16px; }
.hjp-form-wrap label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 13px; }
.hjp-presets { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 18px; }
.hjp-presets button { border: 1px solid var(--border-subtle); border-radius: 8px; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 12px; padding: 6px 10px; }
.hjp-presets button:hover { border-color: var(--accent-border-hover); color: var(--accent); }
.hjp-hints { display: grid; gap: 12px; }
.hjp-hints article { display: flex; gap: 10px; align-items: flex-start; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--surface-card); padding: 14px; }
.hjp-hints p { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.hjp-loading { display: grid; place-items: center; gap: 14px; padding: 80px 0; }
.hjp-loading p { margin: 0; color: var(--text-muted); font-size: 14px; }
.hjp-loading-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: hjp-pulse 1.2s ease-in-out infinite; }
.hjp-actions { display: flex; justify-content: center; gap: 12px; margin-top: 28px; }
@keyframes hjp-pulse { 0%, 100% { opacity: .3; transform: scale(.9); } 50% { opacity: 1; transform: scale(1.1); } }
@media (max-width: 860px) { .hjp-form-wrap { grid-template-columns: 1fr; } .hjp-back { position: static; justify-self: center; } }
</style>
