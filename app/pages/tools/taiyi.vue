<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-12" :class="{ 'ty-result-wrap': phase === 'result' }">
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

        <!-- 隐藏截图目标：完整纸质报告 -->
        <div ref="shareTargetRef" v-show="false" class="tyr-share-target">
          <TaiyiReport
            :chart="chartResult"
            :ai-content="aiContent"
            :streaming="false"
            :error="null"
            :question-type="form.questionType"
            :question-type-label="questionTypeLabel"
            :datetime="form.datetime"
          />
        </div>

        <TaiyiReport
          :chart="chartResult"
          :ai-content="aiContent"
          :streaming="aiStreaming"
          :error="aiError"
          :question-type="form.questionType"
          :question-type-label="questionTypeLabel"
          :datetime="form.datetime"
          @retry="startAiStream(chartResult)"
        />

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('taiyi.recalculate') }}
          </UButton>
          <UButton color="warning" variant="soft" class="group/btn" @click="handleShare">
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('common.shareResult') }}
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

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
                @click="() => { shareDialogOpen = false }"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>

            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.copyText') }}
                </UButton>
              </div>

              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.shareScreenshot') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('share.shareScreenshot')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.downloadImage') }}
                </UButton>
              </div>

              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('share.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>

            <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('share.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { TaiyiChartResult, QuestionType } from '~~/server/utils/taiyi/types'

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

// 分享弹窗
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

const { share } = useShare()

async function handleShare() {
  if (!chartResult.value) return

  try {
    const result = await share({
      tool: 'taiyi',
      summary: `太乙落${getPalaceLabel(chartResult.value.yearChart.taiyiGong)} · ${chartResult.value.yearChart.yinYangJu}${chartResult.value.yearChart.juNumber}局`,
      shareTarget: shareTargetRef.value,
      filename: `taiyi-${questionTypeLabel.value}-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })

    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.shareFail'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

function copyShareText() {
  if (!shareData.value) return
  navigator.clipboard.writeText(shareData.value.copyText).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const a = document.createElement('a')
  a.href = shareData.value.screenshotDataUrl
  a.download = shareData.value.filename
  a.click()
  toast.add({ title: t('share.downloadSuccess'), color: 'success' })
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

<style scoped>
.tyr-share-target {
  width: 1080px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 结果阶段：纸质报告需要更宽的版面 */
.ty-result-wrap {
  max-width: 80rem;
}
</style>
