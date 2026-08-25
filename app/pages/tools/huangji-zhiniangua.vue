<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('huangjiZhiniangua.title') }}</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('huangjiZhiniangua.pageTitle') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('huangjiZhiniangua.pageSubtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 预设年份 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('huangjiZhiniangua.form.presetLabel') }}
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="preset in presets"
                  :key="preset.year"
                  type="button"
                  class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-input)] px-3 py-3.5 text-center transition-all duration-200 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                  @click="runCalc(preset.year)"
                >
                  <span class="block text-lg font-bold text-[var(--text-primary)] font-serif">{{ preset.year }}</span>
                  <span class="block text-[11px] text-[var(--text-faint)] mt-0.5">{{ preset.label }}</span>
                </button>
              </div>
            </div>

            <!-- 自定义年份 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('huangjiZhiniangua.form.customYearLabel') }}
              </label>
              <div class="flex gap-3">
                <input
                  v-model="customYear"
                  type="number"
                  inputmode="numeric"
                  :placeholder="$t('huangjiZhiniangua.form.customYearPlaceholder')"
                  class="flex-1 px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                  @keyup.enter="handleCustomSubmit"
                >
                <UButton
                  color="warning"
                  size="lg"
                  :loading="loading"
                  :disabled="!String(customYear).trim() || loading"
                  class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
                  @click="handleCustomSubmit"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
                  </template>
                  {{ $t('huangjiZhiniangua.form.submitBtn') }}
                </UButton>
              </div>
              <p class="text-[11px] text-[var(--text-faint)]">
                {{ $t('huangjiZhiniangua.form.customYearHint') }}
              </p>
            </div>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('huangjiZhiniangua.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('huangjiZhiniangua.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('huangjiZhiniangua.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('huangjiZhiniangua.knowledgeCard2Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：加载 ============ -->
      <div v-if="phase === 'loading'" class="flex flex-col items-center justify-center min-h-[50vh]">
        <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
          <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
        </div>
        <p class="mt-4 text-sm text-[var(--text-muted)]">{{ $t('huangjiZhiniangua.calculating') }}</p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('huangjiZhiniangua.resultTitle', { year: calcResult.year }) }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ calcResult.ganzhi }} · {{ calcResult.gua.name }} · {{ calcResult.yao.label }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 隐藏截图目标：完整卦帖海报 -->
        <div v-if="!aiStreaming && aiContent" ref="posterRef" v-show="false" class="hzn-share-target">
          <HuangjiZhinianguaPoster
            :year="calcResult.year"
            :ganzhi="calcResult.ganzhi"
            :jinian="calcResult.jinian"
            :gua="calcResult.gua"
            :yao="calcResult.yao"
            :shi="calcResult.shi"
            :dashi="calcResult.dashi"
            :ai-content="aiContent"
          />
        </div>

        <div class="hzn-result-card">
          <HuangjiZhinianguaPoster
            :year="calcResult.year"
            :ganzhi="calcResult.ganzhi"
            :jinian="calcResult.jinian"
            :gua="calcResult.gua"
            :yao="calcResult.yao"
            :shi="calcResult.shi"
            :dashi="calcResult.dashi"
            :ai-content="aiContent"
          />
          <div v-if="aiStreaming" class="flex items-center gap-2 px-4 pb-4 text-xs text-[var(--text-faint)]">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4 animate-pulse text-[var(--accent)]" />
            {{ $t('huangjiZhiniangua.streaming') }}
          </div>
          <div v-if="aiError" class="flex items-center gap-3 px-4 pb-4">
            <p class="text-xs text-red-400">{{ aiError }}</p>
            <UButton color="warning" variant="soft" size="xs" @click="startAiStream(calcResult!)">
              {{ $t('huangjiZhiniangua.retry') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('huangjiZhiniangua.recalculate') }}
          </UButton>
          <AppShareButton
            tool="huangji-zhiniangua"
            :summary="`${calcResult.year}${calcResult.ganzhi} · ${calcResult.gua.name}${calcResult.yao.label}`"
            :share-target="posterRef || undefined"
            :filename="`huangji-zhiniangua-${calcResult.year}.png`"
            :disabled="aiStreaming || !aiContent"
          />
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { navigateTo('/fortune-telling') }">
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('huangjiZhiniangua.backToHub') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZhinianguaResult } from '~~/server/utils/huangji/core'

const { t, locale } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'loading' | 'result'>('form')
const loading = ref(false)
const customYear = ref<number | string>('')

const calcResult = ref<ZhinianguaResult | null>(null)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

const STORAGE_KEY = 'huangji-zhiniangua:last'
const YEAR_MIN = 1900
const YEAR_MAX = 2100

const currentYear = new Date().getFullYear()
const presets = computed(() => [
  { year: currentYear, label: t('huangjiZhiniangua.form.presetThisYear') },
  { year: currentYear + 1, label: t('huangjiZhiniangua.form.presetNextYear') },
  { year: currentYear + 2, label: t('huangjiZhiniangua.form.presetYearAfter') },
])

function handleCustomSubmit() {
  const year = Number(String(customYear.value).trim())
  if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
    toast.add({
      title: t('huangjiZhiniangua.error.yearRange', { min: YEAR_MIN, max: YEAR_MAX }),
      color: 'error',
    })
    return
  }
  runCalc(year)
}

async function runCalc(year: number) {
  phase.value = 'loading'
  loading.value = true
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const result = await $fetch<ZhinianguaResult>('/api/tools/huangji-zhiniangua/calc', {
      method: 'POST',
      body: { year },
    })

    calcResult.value = result
    phase.value = 'result'
    saveState(year, result, '')

    setTimeout(() => startAiStream(result), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('huangjiZhiniangua.error.calcFail'),
      description: err.data?.statusMessage || err.message || t('huangjiZhiniangua.error.unknown'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

async function startAiStream(result: ZhinianguaResult) {
  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/huangji-zhiniangua/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calc: result, locale: locale.value }),
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
          } else if (data.type === 'error') {
            aiError.value = data.message || t('huangjiZhiniangua.error.readingFail')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('huangjiZhiniangua.error.readingFail')
  } finally {
    aiStreaming.value = false
    if (calcResult.value && aiContent.value) {
      saveState(calcResult.value.year, calcResult.value, aiContent.value)
    }
  }
}

function saveState(year: number, calc: ZhinianguaResult, ai: string) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ year, calc, ai }))
  } catch {
    // 存储满或隐私模式：忽略
  }
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as { year?: number; calc?: ZhinianguaResult; ai?: string }
    if (!saved?.calc || typeof saved.calc.year !== 'number') return
    calcResult.value = saved.calc
    aiContent.value = saved.ai || ''
    phase.value = 'result'
  } catch {
    // 脏数据：忽略
  }
})

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
  if (import.meta.client) {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }
}

// 分享目标
const posterRef = ref<HTMLDivElement | null>(null)

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.huangjiZhinianguaTitle')} - ${siteName}`,
  description: () => t('seo.huangjiZhinianguaDesc'),
  keywords: () => t('seo.huangjiZhinianguaKeywords'),
  ogTitle: () => `${t('seo.huangjiZhinianguaOgTitle')} - ${siteName}`,
  ogDescription: () => t('seo.huangjiZhinianguaOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/huangji-zhiniangua',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.huangjiZhinianguaTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/huangji-zhiniangua',
        description: t('seo.huangjiZhinianguaDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('seo.huangjiZhinianguaTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/huangji-zhiniangua',
          description: t('seo.huangjiZhinianguaDesc'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.hzn-share-target {
  width: 720px;
}
.hzn-result-card {
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}
</style>
