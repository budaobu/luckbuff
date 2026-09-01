<template>
  <div class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-24 left-1/2 h-[320px] w-[620px] -translate-x-1/2 bg-[#7a5220]/10 blur-[110px]" />
      <div class="absolute bottom-0 right-[8%] h-[220px] w-[300px] bg-[#5d2b23]/10 blur-[90px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-2xl px-5 py-12 md:px-6">
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="mb-2 block text-xs uppercase tracking-[0.25em] text-[var(--accent-muted)]">Mangpai Bazi</span>
          <h1 class="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            {{ $t('mangpaiBazi.title') }}
          </h1>
          <p class="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            {{ $t('mangpaiBazi.subtitle') }}
          </p>
          <div class="mt-5 flex items-center gap-3">
            <span class="h-px w-14 bg-[var(--accent-border-hover)]" />
            <span class="text-xs tracking-[0.2em] text-[var(--text-faint)]">{{ $t('mangpaiBazi.badge') }}</span>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)]">
          <div class="h-[3px] bg-gradient-to-r from-[#7a5220] via-[#b5473a] to-[#231f1a]" />
          <div class="p-5 md:p-6">
            <BaziForm
              :initial-values="lastFormValues"
              :show-name="false"
              :show-former-name="false"
              :show-birth-province="false"
              :submit-label="$t('mangpaiBazi.submit')"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>

        <p class="mt-5 text-xs leading-relaxed text-[var(--text-faint)]">
          {{ $t('mangpaiBazi.methodology') }}
        </p>
      </div>

      <div v-else-if="phase === 'calculating'" class="flex min-h-[58vh] items-center justify-center">
        <div class="w-full max-w-sm text-center">
          <div class="mx-auto flex h-20 w-20 items-center justify-center border border-[#b5473a]/50 bg-[#231f1a]">
            <span class="font-serif text-2xl font-bold text-[#b5473a]">{{ $t('mangpaiBazi.sealChar') }}</span>
          </div>
          <p class="mt-5 text-sm tracking-[0.2em] text-[var(--text-muted)]">
            {{ $t('mangpaiBazi.calculating') }}
          </p>
        </div>
      </div>

      <div v-else-if="phase === 'result' && result" class="mx-auto max-w-xl">
        <MangpaiBaziPoster
          ref="posterComponent"
          :result="result"
          :data="posterData"
          :streaming="streaming"
          :error="error"
        />

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <UButton color="warning" variant="soft" @click="reset">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
            </template>
            {{ $t('mangpaiBazi.again') }}
          </UButton>
          <AppShareButton
            tool="mangpai-bazi"
            :summary="shareSummary"
            :share-target="posterElement"
            :filename="`mangpai-bazi-${result.flowYear.year}.png`"
            :disabled="streaming"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="navigateTo(localePath('/fortune-telling'))"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
            </template>
            {{ $t('mangpaiBazi.back') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { MangpaiCalcResult, MangpaiPosterData, MangpaiSection } from '~/types/mangpai-bazi'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const store = useProfilesStore()

const phase = ref<'form' | 'calculating' | 'result'>('form')
const result = ref<MangpaiCalcResult | null>(null)
const lastFormValues = ref<Partial<FormValues>>({})
const formValues = ref<FormValues | null>(null)
const posterComponent = ref<{ $el: HTMLElement } | null>(null)
const posterElement = computed(() => posterComponent.value?.$el)
const streaming = ref(false)
const error = ref<string | null>(null)

const emptyPosterData = (): MangpaiPosterData => ({
  overview: '',
  sections: {},
})
const posterData = ref<MangpaiPosterData>(emptyPosterData())

const shareSummary = computed(() => {
  if (!result.value) return ''
  const chart = result.value.chart
  return t('mangpaiBazi.shareSummary', {
    dayMaster: result.value.dayMaster.gan,
    strength: chart.riZhuStrength,
    geju: chart.geju,
  })
})

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
    formerName: values.formerName || undefined,
    formerNameChangedYear: values.formerNameChangedYear,
    birthProvince: values.birthProvince || undefined,
  })
}

async function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }
  phase.value = 'calculating'
  result.value = null
  posterData.value = emptyPosterData()
  streaming.value = false
  error.value = null

  try {
    result.value = await $fetch<MangpaiCalcResult>('/api/tools/mangpai-bazi/calc', {
      method: 'POST',
      body: {
        gender: values.gender,
        birthDate: values.birthDate,
        birthHour: values.birthHour ?? null,
      },
    })
    phase.value = 'result'
    await nextTick()
    startReading()
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('mangpaiBazi.calcFailed'),
      description: err?.data?.statusMessage || err?.message || t('mangpaiBazi.calcFailed'),
      color: 'error',
    })
  }
}

async function startReading() {
  if (!result.value) return
  posterData.value = emptyPosterData()
  streaming.value = true
  error.value = null

  try {
    const response = await fetch('/api/tools/mangpai-bazi/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: result.value, locale: locale.value }),
    })
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        const event = JSON.parse(payload) as
          | { type: 'overview'; text: string }
          | { type: 'section'; section: MangpaiSection }
          | { type: 'error'; message?: string }
          | { type: 'complete' }

        if (event.type === 'overview') {
          posterData.value.overview = event.text
        }
        else if (event.type === 'section') {
          posterData.value.sections = {
            ...posterData.value.sections,
            [event.section.id]: event.section,
          }
        }
        else if (event.type === 'error' && event.message) {
          error.value = event.message
        }
      }
    }
  }
  catch (err: any) {
    error.value = err?.message || t('mangpaiBazi.readingFailed')
  }
  finally {
    streaming.value = false
  }
}

function reset() {
  phase.value = 'form'
  result.value = null
  posterData.value = emptyPosterData()
  streaming.value = false
  error.value = null
}

const siteName = 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/mangpai-bazi')

useSeoMeta({
  title: () => `${t('seo.mangpaiBaziTitle')} - ${siteName}`,
  description: t('seo.mangpaiBaziDesc'),
  keywords: t('seo.mangpaiBaziKeywords'),
  ogTitle: () => `${t('seo.mangpaiBaziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.mangpaiBaziOgDesc'),
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
        '@type': 'WebPage',
        name: `${t('seo.mangpaiBaziTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.mangpaiBaziDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('mangpaiBazi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('seo.mangpaiBaziOgDesc'),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
        },
      }),
    },
  ],
}))
</script>
