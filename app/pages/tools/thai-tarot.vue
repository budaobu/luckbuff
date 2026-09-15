<template>
  <div class="tt-page">
    <div class="tt-container">
      <header class="tt-header">
        <div>
          <p class="tt-eyebrow">Thai Tarot · ไพ่ทาโรต์</p>
          <h1>{{ $t('thaiTarot.title') }}</h1>
          <p class="tt-subtitle">{{ $t('thaiTarot.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/fortune-telling')" class="tt-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('tools.categoryFortuneTelling') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="tt-form-layout">
        <form class="tt-card tt-form" @submit.prevent="handleSubmit">
          <h2>{{ $t('thaiTarot.formTitle') }}</h2>

          <label>
            <span>{{ $t('thaiTarot.question') }} <i>*</i></span>
            <QuestionInspiration @select="value => form.question = value" />
            <UTextarea
              v-model="form.question"
              :placeholder="$t('thaiTarot.questionPlaceholder')"
              :rows="3"
              color="warning"
              class="w-full mt-2"
              :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
            />
          </label>

          <fieldset>
            <legend>{{ $t('thaiTarot.spread') }} <i>*</i></legend>
            <div class="tt-spread-grid">
              <button
                v-for="spread in spreadOptions"
                :key="spread.key"
                type="button"
                :class="{ active: form.spread === spread.key }"
                @click="form.spread = spread.key"
              >
                <strong>{{ spread.name }}</strong>
                <span>{{ spread.description }}</span>
                <em>{{ spread.count }}</em>
              </button>
            </div>
          </fieldset>

          <label class="tt-switch">
            <input v-model="form.includeReversed" type="checkbox">
            <span>{{ $t('thaiTarot.includeReversed') }}</span>
          </label>

          <UButton type="submit" color="warning" size="lg" block :loading="isSubmitting">
            <template #leading><UIcon name="i-heroicons-sparkles" class="h-5 w-5" /></template>
            {{ $t('thaiTarot.submit') }}
          </UButton>
        </form>

        <aside class="tt-hints">
          <article><UIcon name="i-heroicons-language" class="h-4 w-4" /><p>{{ $t('thaiTarot.thaiHint') }}</p></article>
          <article><UIcon name="i-heroicons-square-3-stack-3d" class="h-4 w-4" /><p>{{ $t('thaiTarot.spreadHint') }}</p></article>
          <article><UIcon name="i-heroicons-shield-check" class="h-4 w-4" /><p>{{ $t('thaiTarot.privacyHint') }}</p></article>
        </aside>
      </section>

      <section v-else-if="phase === 'loading'" class="tt-loading">
        <span class="tt-loading-dot" />
        <p>{{ $t('thaiTarot.drawing') }}</p>
      </section>

      <div v-else-if="result" class="tt-report">
        <ThaiTarotReport :result="result" />

        <div class="tt-actions">
          <UButton color="warning" variant="soft" @click="resetToForm">
            <template #leading><UIcon name="i-heroicons-arrow-path" class="h-4 w-4" /></template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton color="warning" variant="soft" @click="copyResult">
            <template #leading><UIcon name="i-heroicons-clipboard-document" class="h-4 w-4" /></template>
            {{ $t('common.copy') }}
          </UButton>
          <AppShareButton
            tool="thai-tarot"
            :summary="shareSummary"
            filename="thai-tarot-reading.png"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThaiTarotResult, ThaiTarotSpreadKey } from '~~/server/utils/tools/thai-tarot'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const phase = ref<'form' | 'loading' | 'result'>('form')
const isSubmitting = ref(false)
const result = ref<ThaiTarotResult | null>(null)
const form = reactive({
  question: '',
  spread: 'situation-challenge-advice' as ThaiTarotSpreadKey,
  includeReversed: true,
})

const spreadOptions = computed<Array<{ key: ThaiTarotSpreadKey, count: number, name: string, description: string }>>(() => [
  { key: 'single', count: 1, name: t('thaiTarot.spreads.single'), description: t('thaiTarot.spreadHints.single') },
  { key: 'past-present-future', count: 3, name: t('thaiTarot.spreads.pastPresentFuture'), description: t('thaiTarot.spreadHints.time') },
  { key: 'situation-challenge-advice', count: 3, name: t('thaiTarot.spreads.situation'), description: t('thaiTarot.spreadHints.practical') },
  { key: 'relationship', count: 3, name: t('thaiTarot.spreads.relationship'), description: t('thaiTarot.spreadHints.relationship') },
  { key: 'decision-compass', count: 5, name: t('thaiTarot.spreads.decision'), description: t('thaiTarot.spreadHints.decision') },
  { key: 'cross', count: 5, name: t('thaiTarot.spreads.cross'), description: t('thaiTarot.spreadHints.cross') },
  { key: 'celtic-cross', count: 10, name: t('thaiTarot.spreads.celtic'), description: t('thaiTarot.spreadHints.celtic') },
])

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.spread.nameZh} · ${result.value.cards.map(card => card.englishName).join(' · ')}`
})

async function handleSubmit() {
  if (!form.question.trim()) {
    toast.add({ title: t('thaiTarot.requiredError'), color: 'error' })
    return
  }
  phase.value = 'loading'
  isSubmitting.value = true
  try {
    result.value = await $fetch<ThaiTarotResult>('/api/tools/thai-tarot/calc', {
      method: 'POST',
      body: {
        question: form.question.trim(),
        spread: form.spread,
        includeReversed: form.includeReversed,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('thaiTarot.fail'),
      description: error?.data?.statusMessage || error?.message || t('thaiTarot.pleaseRetry'),
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

async function copyResult() {
  if (!result.value) return
  const cards = result.value.cards.map((card, index) => {
    const position = locale.value === 'en' || locale.value === 'ja' ? card.position.labelEn : card.position.labelZh
    return `${index + 1}. ${position} · ${card.englishName}/${card.thaiName} · ${card.orientation} · ${card.advice}`
  }).join('\n')
  const text = `${t('thaiTarot.title')}\n\n${result.value.question}\n\n${cards}\n\n${t('thaiTarot.report.disclaimer')}`
  await navigator.clipboard.writeText(text)
  toast.add({ title: t('share.textCopied'), color: 'success' })
}

const siteName = 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/thai-tarot')

useSeoMeta({
  title: () => `${t('seo.thaiTarotTitle')} - ${siteName}`,
  description: t('seo.thaiTarotDesc'),
  keywords: t('seo.thaiTarotKeywords'),
  ogTitle: () => `${t('seo.thaiTarotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.thaiTarotOgDesc'),
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
        name: t('thaiTarot.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.thaiTarotDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.tt-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.tt-container { width: 100%; max-width: 1120px; margin: 0 auto; padding: 40px 20px 72px; }
.tt-header { position: relative; margin-bottom: 28px; text-align: center; display: grid; gap: 14px; }
.tt-eyebrow { margin-bottom: 6px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.tt-header h1 { margin: 0; font-size: 28px; font-weight: 800; line-height: 1.2; }
.tt-subtitle { max-width: 680px; margin: 8px auto 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.tt-back { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; text-decoration: none; }
.tt-back:hover { color: var(--accent); }
.tt-form-layout { display: grid; gap: 16px; max-width: 760px; margin: 0 auto; }
.tt-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 22px; }
.tt-form h2 { margin: 0 0 16px; font-size: 17px; }
.tt-form label, .tt-form fieldset { display: grid; gap: 7px; margin-top: 16px; border: 0; padding: 0; }
.tt-form span, .tt-form legend { color: var(--text-muted); font-size: 13px; }
.tt-form i { color: var(--accent); font-style: normal; }
.tt-spread-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.tt-spread-grid button { position: relative; padding: 12px; border: 1px solid var(--border-light); border-radius: 10px; background: var(--surface-input); text-align: left; cursor: pointer; }
.tt-spread-grid button.active { border-color: var(--accent-border-hover); background: var(--accent-bg); }
.tt-spread-grid strong { display: block; color: var(--text-primary); font-size: 13px; }
.tt-spread-grid span { display: block; margin-top: 3px; color: var(--text-faint); font-size: 11px; line-height: 1.4; }
.tt-spread-grid em { position: absolute; top: 8px; right: 9px; color: var(--accent); font-size: 11px; font-style: normal; }
.tt-switch { display: flex !important; align-items: center; gap: 9px; }
.tt-switch input { width: 16px; height: 16px; accent-color: var(--accent); }
.tt-hints { display: grid; gap: 9px; }
.tt-hints article { display: flex; gap: 9px; align-items: flex-start; padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: 10px; background: color-mix(in srgb, var(--surface-card) 74%, transparent); color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.tt-hints .ui-icon { flex: 0 0 auto; margin-top: 2px; color: var(--accent); }
.tt-loading { display: grid; place-items: center; gap: 12px; min-height: 240px; color: var(--text-muted); }
.tt-loading-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: tt-pulse 1.3s infinite; }
.tt-report { display: grid; }
.tt-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
@keyframes tt-pulse { 0%, 100% { opacity: .3; transform: scale(.8); } 50% { opacity: 1; transform: scale(1); } }
@media (max-width: 720px) {
  .tt-back { position: static; justify-self: center; }
  .tt-header h1 { font-size: 24px; }
  .tt-spread-grid { grid-template-columns: 1fr; }
}
</style>
