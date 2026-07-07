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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bazi Fortune Tune</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('baziFortuneTune.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziFortuneTune.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <TianganDizhi size="full" :label="$t('baziFortuneTune.calculating')" />
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && reading">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Reading</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ formValues.name ? $t('baziFortuneTune.resultTitle', { name: formValues.name }) : $t('baziFortuneTune.resultTitleNoName') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziFortuneTune.resultSubtitle', { riZhu: chart?.riZhu, strength: chart?.riZhuStrength, xiyong: chart?.xiyong }) }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 喜用神驱动说明 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)]" />
            {{ $t('baziFortuneTune.logicTitle') }}
          </h3>
          <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ reading.logicSummary }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="text-xs px-2.5 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]">
              {{ $t('baziFortuneTune.xiyongLabel') }} {{ reading.xiyong }}
            </span>
            <span class="text-xs px-2.5 py-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-dropdown)] text-[var(--text-muted)]">
              {{ $t('baziFortuneTune.jishenLabel') }} {{ reading.jishen }}
            </span>
          </div>
        </div>

        <!-- 材质与颜色 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-gift" class="w-4 h-4 text-[var(--accent)]" />
              {{ $t('baziFortuneTune.materialsTitle') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="m in reading.materials"
                :key="m"
                class="text-xs px-2.5 py-1 rounded-lg border border-[var(--border-light)] bg-[var(--surface-dropdown)] text-[var(--text-body)]"
              >
                {{ m }}
              </span>
            </div>
          </div>
          <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-swatch" class="w-4 h-4 text-[var(--accent)]" />
              {{ $t('baziFortuneTune.colorsTitle') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="c in reading.colors"
                :key="c"
                class="text-xs px-2.5 py-1 rounded-lg border border-[var(--border-light)] bg-[var(--surface-dropdown)] text-[var(--text-body)]"
              >
                {{ c }}
              </span>
            </div>
          </div>
        </div>

        <!-- 手位与时机 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5 mb-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 text-[var(--accent)]" />
                {{ $t('baziFortuneTune.handTitle') }}
              </h3>
              <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ reading.handPosition }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent)]" />
                {{ $t('baziFortuneTune.timingTitle') }}
              </h3>
              <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ reading.timing }}</p>
            </div>
          </div>
        </div>

        <!-- 搭配提示 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent)]" />
            {{ $t('baziFortuneTune.stylingTitle') }}
          </h3>
          <ul class="space-y-2">
            <li v-for="(tip, idx) in reading.stylingTips" :key="idx" class="text-sm text-[var(--text-body)] leading-relaxed flex gap-2">
              <span class="text-[var(--accent)]">·</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>

        <!-- 逐年提示（可选） -->
        <div v-if="reading.yearlyTips?.length" class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-[var(--accent)]" />
            {{ $t('baziFortuneTune.yearlyTitle') }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="tip in reading.yearlyTips"
              :key="tip.year"
              class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] p-3"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-[var(--text-primary)]">{{ tip.year }} · {{ tip.ganZhi }}</span>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full border"
                  :class="{
                    'border-emerald-500/30 bg-emerald-500/10 text-emerald-400': tip.direction === 'enhance',
                    'border-red-500/30 bg-red-500/10 text-red-400': tip.direction === 'reduce',
                    'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]': tip.direction === 'stable',
                  }"
                >
                  {{ $t(`baziFortuneTune.direction${tip.direction.charAt(0).toUpperCase() + tip.direction.slice(1)}`) }}
                </span>
              </div>
              <p class="text-xs text-[var(--text-body)] leading-relaxed">{{ tip.summary }}</p>
            </div>
          </div>
        </div>

        <!-- 搜索关键词提示 -->
        <div v-if="reading.searchKeyword" class="rounded-xl border border-dashed border-[var(--border-light)] bg-[var(--surface-card)] p-4 mb-5">
          <p class="text-xs text-[var(--text-muted)]">
            <UIcon name="i-heroicons-magnifying-glass" class="w-3.5 h-3.5 inline mr-1" />
            {{ reading.searchKeyword }}
          </p>
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-8">
          <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">{{ reading.disclaimer }}</p>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="resetToForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="navigateTo('/tools')">
            <template #leading>
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
            </template>
            {{ $t('baziFortuneTune.backTools') }}
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
import type { BaziChart } from '~/types/bazi'
import type { BaziFortuneTuneReading } from '~/types/bazi-fortune-tune'
import type { DiZhi } from '~/types/user'

const { t, locale } = useI18n()

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

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
const chart = ref<BaziChart | null>(null)
const reading = ref<BaziFortuneTuneReading | null>(null)
const readingError = ref<string | null>(null)

const store = useProfilesStore()
const { calc } = useBaziCalc()
const toast = useToast()

function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const [year, month, day] = values.birthDate.split('-').map(Number)

  chart.value = calc(year, month, day, values.birthHour ?? null, values.gender)
  phase.value = 'animating'

  // 最少播放 1.5 秒动画
  setTimeout(() => {
    phase.value = 'result'
    fetchReading()
  }, 1500)
}

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

async function fetchReading() {
  if (!chart.value) return
  readingError.value = null
  reading.value = null

  try {
    const result = await $fetch<BaziFortuneTuneReading>('/api/bazi-fortune-tune/reading', {
      method: 'POST',
      body: {
        chart: chart.value,
        profile: {
          name: formValues.value.name,
          gender: formValues.value.gender,
          birthDate: formValues.value.birthDate,
          birthHour: formValues.value.birthHour,
        },
        locale: locale.value,
        includeYearly: false,
      },
    })
    reading.value = result
  } catch (e: any) {
    readingError.value = e?.data?.statusMessage || e?.message || t('baziFortuneTune.requestFailed')
    toast.add({
      title: t('baziFortuneTune.requestFailed'),
      description: readingError.value || '',
      color: 'error',
    })
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  reading.value = null
  readingError.value = null
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.baziFortuneTuneTitle')} - ${siteName}`,
  description: t('seo.baziFortuneTuneDesc'),
  keywords: t('seo.baziFortuneTuneKeywords'),
  ogTitle: () => `${t('seo.baziFortuneTuneOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziFortuneTuneOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/bazi-fortune-tune',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.baziFortuneTuneTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/bazi-fortune-tune',
        description: t('seo.baziFortuneTuneDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('baziFortuneTune.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/bazi-fortune-tune',
          description: t('baziFortuneTune.subtitle'),
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
