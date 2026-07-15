<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zi Ping Bazi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('zipingBazi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('zipingBazi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              :show-former-name="false"
              :show-birth-province="false"
              :submit-label="$t('zipingBazi.submit')"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>

        <!-- 子平术知识卡片 -->
        <div class="mt-6 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4 font-serif">{{ $t('zipingBazi.methodologyTitle') }}</h2>
            <div class="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
              <p>{{ $t('zipingBazi.methodologyIntro') }}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard1Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard1Desc') }}</p>
                </div>
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard2Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard2Desc') }}</p>
                </div>
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard3Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard3Desc') }}</p>
                </div>
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard4Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard4Desc') }}</p>
                </div>
              </div>
              <p class="text-xs text-[var(--text-faint)]">{{ $t('zipingBazi.methodologySource') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <TianganDizhi size="full" :label="$t('zipingBazi.calculating')" />
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && chart">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zi Ping Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ formValues.name ? $t('zipingBazi.chartTitle', { name: formValues.name }) : $t('zipingBazi.chartTitleNoName') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('zipingBazi.chartSubtitle', { riZhu: chart.riZhu, strength: chart.riZhuStrength, geju: chart.geju }) }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <UTabs
          :items="tabItems"
          :ui="{
            list: 'bg-[var(--surface-dropdown)] rounded-xl p-1 border border-[var(--border-medium)] gap-1',
            trigger: 'text-[var(--text-muted)] data-[active]:text-[var(--text-primary)] data-[active]:bg-[var(--accent-bg-hover)] data-[active]:font-medium px-4 py-2 text-sm rounded-lg transition-all hover:text-[var(--text-body)]',
            indicator: 'bg-transparent',
            content: 'pt-5',
          }"
        >
          <template #pan>
            <div class="space-y-6">
              <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-6">
                <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4">{{ $t('zipingBazi.fourPillars') }}</h3>
                <div class="grid grid-cols-4 gap-3 text-center">
                  <div v-for="(p, key) in { year: chart.year, month: chart.month, day: chart.day, hour: chart.hour }" :key="key" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
                    <div class="text-xs text-[var(--text-faint)] mb-2">{{ $t(`zipingBazi.${key}Pillar`) }}</div>
                    <div class="text-2xl font-serif text-[var(--text-primary)] mb-1">{{ p ? p.gan + p.zhi : '—' }}</div>
                    <div v-if="p" class="text-xs text-[var(--accent)]">{{ p.shishen }}</div>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-6">
                <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4">{{ $t('zipingBazi.dayunTitle') }}</h3>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div v-for="dy in chart.dayuns.slice(0, 10)" :key="dy.index" class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 text-center" :class="{ 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)]': chart.currentDaYun?.index === dy.index }">
                    <div class="text-[10px] text-[var(--text-faint)]">{{ dy.ageRange[0] }}-{{ dy.ageRange[1] }} {{ $t('zipingBazi.ageUnit') }}</div>
                    <div class="text-sm font-serif text-[var(--text-primary)]">{{ dy.gan }}{{ dy.zhi }}</div>
                  </div>
                </div>
                <p class="text-xs text-[var(--text-faint)] mt-3">{{ $t('zipingBazi.qiyunAge', { age: chart.qiyunAge }) }}</p>
              </div>

              <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-6">
                <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4">{{ $t('zipingBazi.wuxingTitle') }}</h3>
                <div class="grid grid-cols-5 gap-2 text-center">
                  <div v-for="(value, key) in chart.wuxingScore" :key="key" class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
                    <div class="text-xl font-serif text-[var(--text-primary)]">{{ key }}</div>
                    <div class="text-sm text-[var(--accent)] mt-1">{{ value }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #ai>
            <div class="space-y-4">
              <div v-if="aiLoading" class="text-sm text-[var(--text-muted)]">{{ $t('zipingBazi.aiLoading') }}</div>
              <div v-else-if="aiError" class="text-sm text-red-400">{{ aiError }}</div>
              <div v-else-if="aiResult" class="space-y-4">
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('zipingBazi.aiOverview') }}</h4>
                  <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ aiResult.overview }}</p>
                </div>
              </div>
              <div v-else class="text-sm text-[var(--text-muted)]">{{ $t('zipingBazi.aiEmpty') }}</div>
            </div>
          </template>
        </UTabs>

        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" @click="resetToForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="navigateTo('/')">
            <template #leading>
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </template>
            {{ $t('common.backHome') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZipingBaziChart } from '~/types/ziping-bazi'
import type { DiZhi } from '~/types/user'

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
const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = (config.public.siteUrl as string) || 'https://www.ososn.com'

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  formerName: '',
  formerNameChangedYear: undefined,
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const chart = ref<ZipingBaziChart | null>(null)
const aiResult = ref<any>(null)
const aiLoading = ref(false)
const aiError = ref<string | null>(null)

const store = useProfilesStore()
const { calc } = useZipingBaziCalc()

const tabItems = [
  { label: t('zipingBazi.panCalculation'), slot: 'pan' },
  { label: t('zipingBazi.aiInterpret'), slot: 'ai' },
]

function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const [year, month, day] = values.birthDate.split('-').map(Number) as [number, number, number]
  chart.value = calc(year, month, day, values.birthHour ?? null, values.gender)
  phase.value = 'animating'
  setTimeout(() => {
    phase.value = 'result'
    startAiStream()
  }, 1500)
}

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
  })
}

async function startAiStream() {
  if (!chart.value) return
  aiLoading.value = true
  aiError.value = null
  aiResult.value = null

  const summary = `${chart.value.riZhu}日主，${chart.value.riZhuStrength}，${chart.value.geju}，喜用${chart.value.xiyong}，忌${chart.value.jishen}。`
  const profile = {
    id: 'temp',
    label: '临时',
    name: formValues.value.name,
    gender: formValues.value.gender,
    birthDate: formValues.value.birthDate,
    birthHour: formValues.value.birthHour,
  }

  try {
    const result = await $fetch('/api/bazi/interpret', {
      method: 'POST',
      body: {
        chart: chart.value,
        profile,
        summary,
        locale: locale.value,
      },
    })
    aiResult.value = result
  } catch (e: any) {
    aiError.value = e?.data?.statusMessage || e?.message || t('zipingBazi.aiRequestFailed')
  } finally {
    aiLoading.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  aiResult.value = null
  aiLoading.value = false
  aiError.value = null
}

useSeoMeta({
  title: () => `${t('seo.zipingBaziTitle')} - ${siteName}`,
  description: t('seo.zipingBaziDesc'),
  keywords: t('seo.zipingBaziKeywords'),
  ogTitle: () => `${t('seo.zipingBaziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.zipingBaziOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}/tools/ziping-bazi`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: `${siteUrl}/tools/ziping-bazi` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.zipingBaziTitle')} - ${siteName}`,
        url: `${siteUrl}/tools/ziping-bazi`,
        description: t('seo.zipingBaziDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('zipingBazi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}/tools/ziping-bazi`,
          description: t('zipingBazi.subtitle'),
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
