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

      <!-- 阶段 3：结果（命盘 + 八字精批 + AI 白话注释，单页连续视图） -->
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

        <!-- 八字精批：AI 白话注释，流式分段追加 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mt-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('zipingBazi.jingpiTitle') }}</h3>
              <p class="text-xs text-[var(--text-faint)] mt-0.5">{{ $t('zipingBazi.jingpiSubtitle') }}</p>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('zipingBazi.aiLoading') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <div v-if="aiSections.length > 0" class="space-y-3">
            <div
              v-for="(section, index) in aiSections"
              :key="section.title"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {{ section.title.replace(/^##\s*/, '') }}
                </h4>
                <div class="ai-section-content" v-html="renderMarkdown(section.content)" />
                <span
                  v-if="aiStreaming && index === aiSections.length - 1"
                  class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
                />
              </div>
            </div>
          </div>

          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('zipingBazi.aiLoading') }}</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
            <UButton color="warning" variant="soft" size="sm" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('zipingBazi.reinterpret') }}
            </UButton>
          </div>
        </div>

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
import { marked } from 'marked'
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
const toast = useToast()
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

const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

const store = useProfilesStore()

const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = lines[0]!.replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('zipingBazi.jingpiTitle'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

async function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  phase.value = 'animating'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const result = await $fetch<ZipingBaziChart>('/api/tools/ziping-bazi/calc', {
      method: 'POST',
      body: {
        gender: values.gender,
        birthDate: values.birthDate,
        birthHour: values.birthHour || null,
        name: values.name || '',
        locale: locale.value,
      },
    })

    chart.value = result

    setTimeout(() => {
      phase.value = 'result'
      startAiStream()
    }, 1200)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('zipingBazi.calcFail'),
      description: err?.data?.message || err?.message || t('zipingBazi.checkInput'),
      color: 'error',
    })
  }
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

  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/ziping-bazi/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chart.value,
        name: formValues.value.name || '',
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
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
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) {
            aiContent.value += data.text
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('zipingBazi.aiRequestFailed')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('zipingBazi.aiRequestFailed')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
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

<style scoped>
.ai-section-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-section-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-section-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-section-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
