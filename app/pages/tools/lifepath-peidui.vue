<template>
  <div class="lpp-page">
    <div class="lpp-container">
      <header class="lpp-header">
        <div>
          <p class="lpp-eyebrow">Life Path Match</p>
          <h1 class="lpp-title">{{ $t('lifePathPeidui.title') }}</h1>
          <p class="lpp-subtitle">{{ $t('lifePathPeidui.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/shuangren-hepan')" class="lpp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('lifePathPeidui.backToTopic') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="lpp-form-wrap">
        <div class="lpp-card lpp-form">
          <h2 class="lpp-card-title">{{ $t('lifePathPeidui.formTitle') }}</h2>

          <div class="lpp-person-grid">
            <fieldset
              v-for="(person, key) in people"
              :key="key"
              class="lpp-person"
            >
              <legend>{{ $t(key === 'personA' ? 'lifePathPeidui.personA' : 'lifePathPeidui.personB') }}</legend>

              <label :for="`${key}-name`">{{ $t('lifePathPeidui.nameLabel') }}</label>
              <input
                :id="`${key}-name`"
                v-model="person.name"
                type="text"
                maxlength="24"
                autocomplete="off"
                :placeholder="$t('lifePathPeidui.namePlaceholder')"
              >

              <label>{{ $t('lifePathPeidui.birthDateLabel') }} <em>*</em></label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--surface-card-hover)]"
                  :class="{ 'text-[var(--text-placeholder)]': !person.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="mr-2 h-4 w-4 text-[var(--text-faint)]" />
                  {{ formattedBirthDate(key) }}
                </UButton>
                <template #content>
                  <AppCalendar v-model="calendarDates[key]" color="warning" class="p-2" />
                </template>
              </UPopover>
            </fieldset>
          </div>

          <UButton
            color="warning"
            size="lg"
            block
            class="mt-4"
            @click="handleSubmit"
          >
            <template #leading>
              <UIcon name="i-heroicons-heart" class="h-5 w-5" />
            </template>
            {{ $t('lifePathPeidui.submitBtn') }}
          </UButton>
        </div>

        <div class="lpp-hints">
          <article>
            <UIcon name="i-heroicons-calculator" class="h-4 w-4" />
              <p>{{ $t('lifePathPeidui.hintCalculation') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
            <p>{{ $t('lifePathPeidui.hintInteraction') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('lifePathPeidui.hintPrivacy') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="lpp-loading">
        <span class="lpp-loading-dot" />
        <p>{{ $t('lifePathPeidui.calculating') }}</p>
      </section>

      <div v-else-if="result" class="lpp-report">
        <LifePathPeiduiReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="lpp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('lifePathPeidui.recalculate') }}
        </UButton>
        <AppShareButton
          tool="lifePath-peidui"
          :name="shareName"
          :summary="shareSummary"
          filename="lifepath-peidui-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { LifePathCalcResult } from '~~/server/utils/tools/lifepath-peidui-data'

type PersonKey = 'personA' | 'personB'

interface PersonForm {
  name: string
  birthDate: string
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<LifePathCalcResult | null>(null)

const people = ref<{ personA: PersonForm; personB: PersonForm }>({
  personA: { name: '', birthDate: '' },
  personB: { name: '', birthDate: '' },
})

const tz = getLocalTimeZone()
const df = computed(() => new DateFormatter(
  locale.value === 'en' ? 'en-US' : locale.value === 'zh-TW' ? 'zh-TW' : locale.value === 'ja' ? 'ja-JP' : 'zh-CN',
  { dateStyle: 'long' },
))
const calendarDates = ref<Record<PersonKey, CalendarDate | undefined>>({
  personA: undefined,
  personB: undefined,
})

watch(() => calendarDates.value.personA, (value) => {
  people.value.personA.birthDate = value
    ? `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
    : ''
})

watch(() => calendarDates.value.personB, (value) => {
  people.value.personB.birthDate = value
    ? `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
    : ''
})

function formattedBirthDate(key: PersonKey) {
  const value = calendarDates.value[key]
  return value && people.value[key].birthDate
    ? df.value.format(value.toDate(tz))
    : t('lifePathPeidui.birthDatePlaceholder')
}

const shareName = computed(() => {
  const a = result.value?.personA.name
  const b = result.value?.personB.name
  return a && b ? `${a} × ${b}` : undefined
})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.personA.lifePathNumber} × ${result.value.personB.lifePathNumber} · ${result.value.matrix.tierLabel}`
})

async function handleSubmit() {
  if (!people.value.personA.birthDate || !people.value.personB.birthDate) {
    toast.add({ title: t('lifePathPeidui.checkInput'), color: 'error' })
    return
  }

  phase.value = 'loading'
  try {
    result.value = await $fetch<LifePathCalcResult>('/api/tools/lifepath-peidui/calc', {
      method: 'POST',
      body: { ...people.value, locale: locale.value },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('lifePathPeidui.calcFail'),
      description: error?.data?.statusMessage || error?.message || t('lifePathPeidui.checkInput'),
      color: 'error',
    })
  }
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

const siteName = 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/lifepath-peidui')

useSeoMeta({
  title: () => `${t('seo.lifePathPeiduiTitle')} - ${siteName}`,
  description: t('seo.lifePathPeiduiDesc'),
  keywords: t('seo.lifePathPeiduiKeywords'),
  ogTitle: () => `${t('seo.lifePathPeiduiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.lifePathPeiduiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('lifePathPeidui.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        url: pageUrl.value,
        description: t('seo.lifePathPeiduiDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.lpp-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.lpp-container { width: 100%; max-width: 1120px; margin: 0 auto; padding: 40px 20px 72px; }
.lpp-header { position: relative; display: grid; gap: 18px; margin-bottom: 30px; text-align: center; }
.lpp-eyebrow { margin-bottom: 8px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.lpp-title { margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2; }
.lpp-subtitle { max-width: 640px; margin: 10px 0 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.lpp-back { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.lpp-back:hover { color: var(--accent); }
.lpp-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; }
.lpp-card-title { margin: 0 0 16px; font-size: 16px; font-weight: 700; }
.lpp-form-wrap { display: grid; gap: 18px; max-width: 820px; margin: 0 auto; }
.lpp-person-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.lpp-person { min-width: 0; margin: 0; padding: 16px; border: 1px solid var(--border-subtle); border-radius: 10px; }
.lpp-person legend { padding: 0 7px; color: var(--accent); font-size: 13px; font-weight: 650; }
.lpp-person label { display: block; margin: 14px 0 6px; color: var(--text-muted); font-size: 12px; font-weight: 600; }
.lpp-person label em { color: var(--accent); font-style: normal; }
.lpp-person input { width: 100%; padding: 10px 12px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-input); color: var(--text-primary); font-size: 14px; outline: none; }
.lpp-person input:focus { border-color: var(--accent-border-hover); }
.lpp-hints { display: grid; gap: 10px; }
.lpp-hints article { display: flex; align-items: flex-start; gap: 9px; padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: 10px; background: color-mix(in srgb, var(--surface-card) 72%, transparent); color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.lpp-hints svg { flex-shrink: 0; margin-top: 2px; color: var(--accent); }
.lpp-hints p { margin: 0; }
.lpp-loading { display: grid; justify-items: center; gap: 12px; padding: 72px 20px; color: var(--text-muted); font-size: 14px; }
.lpp-loading-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: lpp-pulse 1s ease-in-out infinite; }
.lpp-report { display: grid; gap: 28px; }
.lpp-actions { display: flex; justify-content: center; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
@keyframes lpp-pulse { 0%, 100% { opacity: .35; transform: scale(.85); } 50% { opacity: 1; transform: scale(1); } }
@media (max-width: 760px) {
  .lpp-container { padding-top: 72px; }
  .lpp-back { position: static; justify-self: center; }
  .lpp-person-grid { grid-template-columns: 1fr; }
}
</style>
