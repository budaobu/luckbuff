<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Xiao Liu Ren</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('xiaoLiuren.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('xiaoLiuren.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('xiaoLiuren.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 起卦方式 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('xiaoLiuren.methodLabel') }}</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="m in methodOptions"
                  :key="m.value"
                  type="button"
                  class="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="form.method === m.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.method = m.value"
                >
                  <UIcon :name="m.icon" class="w-4 h-4" />
                  {{ m.label }}
                </button>
              </div>
            </div>

            <!-- 时间起卦：日期时间 -->
            <DivinationTimeCard
              v-if="form.method === 'time'"
              ref="timeCardRef"
              :label="$t('xiaoLiuren.timeLabel')"
              :hint="$t('xiaoLiuren.timeHint')"
            />

            <!-- 数字起卦 -->
            <div v-if="form.method === 'number'" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('xiaoLiuren.numberLabel') }}</label>
              <div class="grid grid-cols-3 gap-2">
                <input
                  v-for="(_, i) in form.numbers"
                  :key="i"
                  v-model.number="form.numbers[i]"
                  type="number"
                  min="1"
                  max="99"
                  class="px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-center text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                  :placeholder="$t('xiaoLiuren.numberPlaceholder')"
                >
              </div>
            </div>

            <!-- 汉字起卦 -->
            <div v-if="form.method === 'character'" class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('xiaoLiuren.characterLabel') }}</label>
              <input
                v-model="form.text"
                type="text"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('xiaoLiuren.characterPlaceholder')"
              >
            </div>

            <!-- 占卜事项 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('xiaoLiuren.questionLabel') }}
                  <span class="text-[var(--accent)] ml-0.5">*</span>
                </label>
                <QuestionInspiration @select="q => form.question = q" />
              </div>
              <textarea
                v-model="form.question"
                rows="3"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)] resize-none"
                :placeholder="$t('xiaoLiuren.questionPlaceholder')"
              />
            </div>

            <!-- 性别 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('xiaoLiuren.genderLabel') }}</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = 'male'"
                >
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === null
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = null"
                >
                  {{ $t('xiaoLiuren.genderNone') }}
                </button>
              </div>
            </div>

            <!-- 出生年份 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('xiaoLiuren.birthYearLabel') }}</label>
              <input
                v-model.number="form.birthYear"
                type="number"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('xiaoLiuren.birthYearPlaceholder')"
              >
            </div>

            <!-- 掐指一算按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-hand-raised" class="w-5 h-5" />
              </template>
              {{ $t('xiaoLiuren.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiuren.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiuren.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiuren.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiuren.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiuren.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiuren.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiuren.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiuren.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：掐指一算动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <XiaoLiurenHand :active-index="thumbStep" />
        <p class="text-sm text-[var(--text-muted)] mt-4">{{ $t('xiaoLiuren.calculating') }}</p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('xiaoLiuren.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 占问信息 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiuren.resultQuestionLabel') }}</h3>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ result.input.question || $t('xiaoLiuren.noQuestion') }}</p>
          </div>

          <!-- 起卦信息 -->
          <div v-if="contextText" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-3 mb-4 text-xs text-[var(--text-muted)]">
            {{ contextText }}
          </div>

          <!-- 落宫过程 -->
          <div class="grid grid-cols-3 gap-2 mb-5">
            <div
              v-for="(step, index) in result.steps"
              :key="index"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center"
              :class="index === result.steps.length - 1 ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)]' : ''"
            >
              <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ step.label }}</p>
              <p class="text-base font-bold text-[var(--text-primary)]">{{ stepValueLabel(step) }}</p>
            </div>
          </div>

          <!-- 最终结果 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-6 mb-5 text-center">
            <p class="text-xs text-[var(--text-muted)] mb-2">{{ $t('xiaoLiuren.finalPosition') }}</p>
            <div class="text-4xl font-bold text-[var(--accent)] mb-2">{{ result.finalPosition.name }}</div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] text-xs text-[var(--accent)] mb-3">
              <UIcon name="i-heroicons-hand-raised" class="w-3.5 h-3.5" />
              {{ result.finalPosition.finger }}
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ result.finalPosition.meaning }}</p>
            <p class="text-xs text-[var(--text-faint)] mt-2 font-serif">{{ result.finalPosition.summary }}</p>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('xiaoLiuren.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('xiaoLiuren.interpreting') }}</span>
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
                <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ section.title.replace(/^##\s*/, '') }}</h4>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('xiaoLiuren.generatingInterpretation') }}</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              class="group/btn"
              @click="startAiStream"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('xiaoLiuren.reinterpret') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleCopy"
          >
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('xiaoLiuren.copyResult') }}
          </UButton>
          <AppShareButton
            tool="xiao-liuren"
            :summary="`${result.finalPosition.name} · ${result.finalPosition.finger} · ${result.finalPosition.meaning}`"
            :share-target="resultRef"
            :filename="`xiao-liuren-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('xiaoLiuren.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
             @click="() => { navigateTo('/tools') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('xiaoLiuren.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { XiaoLiurenRequest, XiaoLiurenResult, XiaoLiurenStep } from '~/types/xiao-liuren'

const { t, locale } = useI18n()

const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<XiaoLiurenResult | null>(null)

const form = reactive<{
  method: 'time' | 'number' | 'character'
  numbers: [number, number, number]
  text: string
  question: string
  gender: 'male' | 'female' | null
  birthYear: number | null
}>({
  method: 'time',
  numbers: [1, 1, 1],
  text: '',
  question: '',
  gender: null,
  birthYear: null,
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const methodOptions = computed(() => [
  { value: 'time' as const, label: t('xiaoLiuren.methodTime'), icon: 'i-heroicons-clock' },
  { value: 'number' as const, label: t('xiaoLiuren.methodNumber'), icon: 'i-heroicons-numbered-list' },
  { value: 'character' as const, label: t('xiaoLiuren.methodCharacter'), icon: 'i-heroicons-language' },
])

const canSubmit = computed(() => {
  const hasQuestion = form.question.trim().length > 0
  if (form.method === 'number') {
    return hasQuestion && form.numbers.every(n => typeof n === 'number' && n >= 1 && n <= 99)
  }
  if (form.method === 'character') {
    return hasQuestion && form.text.trim().length > 0
  }
  return hasQuestion
})

// 动画：大拇指在六宫之间移动
const thumbStep = ref(0)
let thumbTimer: ReturnType<typeof setInterval> | null = null

function startThumbAnimation() {
  thumbStep.value = 0
  if (thumbTimer) clearInterval(thumbTimer)
  thumbTimer = setInterval(() => {
    thumbStep.value = (thumbStep.value + 1) % 6
  }, 600)
}

function stopThumbAnimation() {
  if (thumbTimer) {
    clearInterval(thumbTimer)
    thumbTimer = null
  }
}

onBeforeUnmount(() => {
  stopThumbAnimation()
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  startThumbAnimation()

  const payload: any = {
    method: form.method,
    question: form.question,
    gender: form.gender,
    birthYear: form.birthYear,
  }

  if (form.method === 'time') {
    ;(payload as any).datetime = (timeCardRef.value?.iso as any).value
  } else if (form.method === 'number') {
    ;(payload as any).numbers = form.numbers
  } else if (form.method === 'character') {
    ;(payload as any).text = form.text.trim()
  }

  try {
    const calcResult = await $fetch<XiaoLiurenResult>('/api/tools/xiao-liuren/calc', {
      method: 'POST',
      body: payload,
    })
    result.value = calcResult
    // 再掐几下再出结果
    setTimeout(() => {
      stopThumbAnimation()
      phase.value = 'result'
      setTimeout(() => startAiStream(), 300)
    }, 3000)
  } catch (err: any) {
    stopThumbAnimation()
    phase.value = 'form'
    useToast().add({
      title: t('xiaoLiuren.calcFail'),
      description: err.data?.message || err.message || t('xiaoLiuren.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/xiao-liuren/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: result.value,
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
            if (!aiStarted.value) aiStarted.value = true
            aiContent.value += data.text
          } else if (data.type === 'error') {
            aiError.value = data.message || t('xiaoLiuren.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('xiaoLiuren.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  form.method = 'time'
  form.text = ''
  form.question = ''
  form.gender = null
  form.birthYear = null
  form.numbers = [1, 1, 1]
}

const contextText = computed(() => {
  if (!result.value) return ''
  if (result.value.method === 'time' && result.value.timeContext) {
    return result.value.timeContext.lunarDate
  }
  if (result.value.method === 'number' && result.value.numberContext) {
    return t('xiaoLiuren.numberContext', { numbers: result.value.numberContext.numbers.join('、') })
  }
  if (result.value.method === 'character' && result.value.characterContext) {
    return result.value.characterContext.strokeHint
  }
  return ''
})

function stepValueLabel(step: XiaoLiurenStep) {
  const names = ['大安', '留连', '速喜', '赤口', '小吉', '空亡']
  return `${step.value} → ${names[step.positionIndex]}`
}

function handleCopy() {
  if (!result.value) return
  const text = `${t('xiaoLiuren.resultTitle')}\n\n${t('xiaoLiuren.resultQuestionLabel')}：${result.value.input.question || t('xiaoLiuren.noQuestion')}\n${t('xiaoLiuren.finalPosition')}：${result.value.finalPosition.name}\n${result.value.finalPosition.finger} · ${result.value.finalPosition.meaning}\n${result.value.finalPosition.summary}\n\n${aiContent.value ? t('xiaoLiuren.interpretation') + '：\n' + aiContent.value : ''}`
  navigator.clipboard.writeText(text).then(() => {
    useToast().add({ title: t('share.copySuccess'), color: 'success' })
  }).catch(() => {
    useToast().add({ title: t('share.copyFail'), color: 'error' })
  })
}

const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const list: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      list.push({ title: titleLine || t('xiaoLiuren.interpretation'), content })
    }
  }
  return list
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.xiaoLiurenTitle')} - ${siteName}`,
  description: t('seo.xiaoLiurenDesc'),
  keywords: t('seo.xiaoLiurenKeywords'),
  ogTitle: () => `${t('seo.xiaoLiurenOgTitle')} - ${siteName}`,
  ogDescription: t('seo.xiaoLiurenOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/xiao-liuren',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.xiaoLiurenTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/xiao-liuren',
        description: t('seo.xiaoLiurenDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('xiaoLiuren.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/xiao-liuren',
          description: t('seo.xiaoLiurenOgDesc'),
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
