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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('taiyi.title') }}</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('taiyi.pageTitle') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('taiyi.pageSubtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 出生/占问时间 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('taiyi.form.datetimeLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <input
                v-model="form.datetime"
                type="datetime-local"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)]"
              >
              <p class="text-[11px] text-[var(--text-faint)]">
                {{ $t('taiyi.form.datetimeHint') }}
              </p>
            </div>

            <!-- 问事类型 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('taiyi.form.questionTypeLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <select
                v-model="form.questionType"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)]"
              >
                <option v-for="opt in questionTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- 所问事项 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('taiyi.form.questionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <textarea
                v-model="form.question"
                rows="3"
                :placeholder="$t('taiyi.form.questionPlaceholder')"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)] resize-none"
              />
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              :loading="loading"
              :disabled="!canSubmit || loading"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
              </template>
              {{ $t('taiyi.form.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('taiyi.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('taiyi.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('taiyi.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('taiyi.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('taiyi.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('taiyi.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('taiyi.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('taiyi.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：加载 ============ -->
      <div v-if="phase === 'loading'" class="flex flex-col items-center justify-center min-h-[50vh]">
        <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
          <UIcon name="i-heroicons-square-3-stack-3d" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
        </div>
        <p class="mt-4 text-sm text-[var(--text-muted)]">{{ $t('taiyi.calculating') }}</p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && chartResult">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('taiyi.resultTitle') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ form.datetime }} · {{ questionTypeLabel }} · {{ chartResult.input.question }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 概览 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-5">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div class="rounded-lg bg-[var(--surface-dropdown)] p-3">
              <div class="text-[11px] text-[var(--text-faint)]">{{ $t('taiyi.accumulatedYears') }}</div>
              <div class="font-semibold text-[var(--text-primary)]">{{ chartResult.accumulatedYears.accumulatedYears }}</div>
            </div>
            <div class="rounded-lg bg-[var(--surface-dropdown)] p-3">
              <div class="text-[11px] text-[var(--text-faint)]">{{ $t('taiyi.cyclePosition') }}</div>
              <div class="font-semibold text-[var(--text-primary)]">{{ chartResult.yearChart.chaoShenJieQi.cyclePosition }}</div>
            </div>
            <div class="rounded-lg bg-[var(--surface-dropdown)] p-3">
              <div class="text-[11px] text-[var(--text-faint)]">{{ $t('taiyi.chaoShenJieQi') }}</div>
              <div class="font-semibold text-[var(--text-primary)]">{{ chartResult.yearChart.chaoShenJieQi.state }}</div>
            </div>
            <div class="rounded-lg bg-[var(--surface-dropdown)] p-3">
              <div class="text-[11px] text-[var(--text-faint)]">阴阳局</div>
              <div class="font-semibold text-[var(--text-primary)]">{{ chartResult.yearChart.yinYangJu }}{{ chartResult.yearChart.juNumber }}局</div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <div class="text-xs text-[var(--text-muted)] mb-2">四柱干支</div>
            <div class="flex flex-wrap gap-2 text-sm">
              <span class="px-2 py-1 rounded bg-[var(--surface-dropdown)] text-[var(--text-primary)]">年 {{ chartResult.pillars.year }}</span>
              <span class="px-2 py-1 rounded bg-[var(--surface-dropdown)] text-[var(--text-primary)]">月 {{ chartResult.pillars.month }}</span>
              <span class="px-2 py-1 rounded bg-[var(--surface-dropdown)] text-[var(--text-primary)]">日 {{ chartResult.pillars.day }}</span>
              <span class="px-2 py-1 rounded bg-[var(--surface-dropdown)] text-[var(--text-primary)]">时 {{ chartResult.pillars.hour }}</span>
            </div>
          </div>
        </div>

        <!-- 四盘卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div
            v-for="pan in [chartResult.yearChart, chartResult.monthChart, chartResult.dayChart, chartResult.hourChart]"
            :key="pan.level"
            class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-[var(--text-primary)]">{{ pan.levelLabel }}</h3>
              <span class="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]">
                {{ pan.yinYangJu }}{{ pan.juNumber }}局
              </span>
            </div>

            <div class="space-y-2 text-sm mb-4">
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">太乙宫</span>
                <span class="font-medium text-[var(--text-primary)]">{{ getPalaceLabel(pan.taiyiGong) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">计神宫</span>
                <span class="font-medium text-[var(--text-primary)]">{{ getPalaceLabel(pan.keySpirits.jiShenGong) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">文昌宫</span>
                <span class="font-medium text-[var(--text-primary)]">{{ getPalaceLabel(pan.keySpirits.wenChangGong) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">天目</span>
                <span class="font-medium text-[var(--text-primary)]">{{ getPalaceLabel(pan.keySpirits.tianMuGong) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--text-muted)]">地目</span>
                <span class="font-medium text-[var(--text-primary)]">{{ getPalaceLabel(pan.keySpirits.diMuGong) }}</span>
              </div>
            </div>

            <div class="border-t border-[var(--border-subtle)] pt-3">
              <div class="text-xs text-[var(--text-muted)] mb-2">十六神分布</div>
              <div class="grid grid-cols-4 gap-2 text-xs">
                <div
                  v-for="god in pan.gods"
                  :key="god.name"
                  class="rounded-md px-2 py-1.5 text-center"
                  :class="godNatureClass(god.nature)"
                >
                  <div class="font-medium">{{ god.name }}</div>
                  <div class="text-[10px] opacity-80">{{ getPalaceLabel(god.palace) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">太乙占事解读</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">解读中</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <div v-if="aiContent" class="space-y-3">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-4">
              <div class="text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">{{ aiContent }}</div>
            </div>
          </div>

          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">正在生成解读…</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('taiyi.recalculate') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"  @click="() => { navigateTo('/tools') }">
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('taiyi.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaiyiChartResult, QuestionType } from '~~/server/utils/taiyi/types'

const localePath = useLocalePath()
const { t } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'loading' | 'result'>('form')
const loading = ref(false)

const form = reactive({
  datetime: '',
  question: '',
  questionType: 'career' as QuestionType,
})

const questionTypeOptions = computed(() => [
  { value: 'career', label: t('taiyi.questionTypes.career') },
  { value: 'wealth', label: t('taiyi.questionTypes.wealth') },
  { value: 'love', label: t('taiyi.questionTypes.love') },
  { value: 'health', label: t('taiyi.questionTypes.health') },
  { value: 'travel', label: t('taiyi.questionTypes.travel') },
  { value: 'other', label: t('taiyi.questionTypes.other') },
])

const questionTypeLabel = computed(() => {
  return questionTypeOptions.value.find(opt => opt.value === form.questionType)?.label ?? t('taiyi.questionTypes.other')
})

const canSubmit = computed(() => {
  return form.datetime.trim().length > 0 && form.question.trim().length > 0
})

const chartResult = ref<TaiyiChartResult | null>(null)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

function parseDatetime(datetime: string): { year: number; month: number; day: number; hour: number } | null {
  const d = new Date(datetime)
  if (Number.isNaN(d.getTime())) return null
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return

  const parsed = parseDatetime(form.datetime)
  if (!parsed) {
    toast.add({ title: '时间格式不正确', color: 'error' })
    return
  }

  phase.value = 'loading'
  loading.value = true
  chartResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const result = await $fetch<TaiyiChartResult>('/api/tools/taiyi/calc', {
      method: 'POST',
      body: {
        birthYear: parsed.year,
        birthMonth: parsed.month,
        birthDay: parsed.day,
        birthHour: parsed.hour,
        question: form.question.trim(),
      },
    })

    chartResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(result), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('taiyi.error.chartFail'),
      description: err.data?.statusMessage || err.message || t('taiyi.error.unknown'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

async function startAiStream(result: TaiyiChartResult) {
  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/taiyi/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: result,
        question: form.question.trim(),
        questionType: form.questionType,
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
          } else if (data.type === 'error') {
            aiError.value = data.message || '解读服务异常'
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || '解读服务异常'
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  chartResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
}

function getPalaceLabel(palace: number): string {
  const labels: Record<number, string> = {
    1: '坎一',
    2: '坤二',
    3: '震三',
    4: '巽四',
    5: '中五',
    6: '乾六',
    7: '兑七',
    8: '艮八',
    9: '离九',
  }
  return labels[palace] ?? `宫${palace}`
}

function godNatureClass(nature: string): string {
  if (nature === '吉') return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  if (nature === '凶') return 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
  return 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] text-[var(--text-muted)]'
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.taiyiTitle')} - ${siteName}`,
  description: () => t('seo.taiyiDesc'),
  keywords: () => t('seo.taiyiKeywords'),
  ogTitle: () => `${t('seo.taiyiOgTitle')} - ${siteName}`,
  ogDescription: () => t('seo.taiyiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/taiyi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.taiyiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/taiyi',
        description: t('seo.taiyiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('seo.taiyiTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/taiyi',
          description: t('seo.taiyiDesc'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>
