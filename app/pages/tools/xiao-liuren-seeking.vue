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
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Xiao Liu Ren Seeking</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('xiaoLiurenSeeking.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('xiaoLiurenSeeking.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('xiaoLiuren.disclaimer') }}
          </p>
        </div>

        <!-- 寻物表单 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 起课时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('xiaoLiurenSeeking.form.castTime')"
              :hint="$t('xiaoLiurenSeeking.form.castTimeHint')"
              required
            />

            <!-- 失物描述 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('xiaoLiurenSeeking.form.lostItemDesc') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.lostItemDesc"
                :placeholder="$t('xiaoLiurenSeeking.form.lostItemDescPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 最后见到时间 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('xiaoLiurenSeeking.form.lastSeenTime') }}</label>
              <UInput
                v-model="form.lastSeenTime"
                :placeholder="$t('xiaoLiurenSeeking.form.lastSeenTimePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 最后见到地点 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('xiaoLiurenSeeking.form.lastSeenPlace') }}</label>
              <UInput
                v-model="form.lastSeenPlace"
                :placeholder="$t('xiaoLiurenSeeking.form.lastSeenPlacePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 与失物关系 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('xiaoLiurenSeeking.form.relationship') }}</label>
              <UInput
                v-model="form.relationship"
                :placeholder="$t('xiaoLiurenSeeking.form.relationshipPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 补充描述 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm text-[var(--text-muted)]">{{ $t('xiaoLiurenSeeking.form.description') }}</label>
                <QuestionInspiration
                  :extra-categories="seekingExtraCategories"
                  @select="q => form.description = q"
                />
              </div>
              <UTextarea
                v-model="form.description"
                :placeholder="$t('xiaoLiurenSeeking.form.descriptionPlaceholder')"
                class="w-full"
                :ui="inputUi"
                :rows="2"
              />
            </div>

            <!-- 提交按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-hand-raised" class="w-5 h-5" />
              </template>
              {{ $t('xiaoLiurenSeeking.form.submitBtn') }}
            </UButton>

            <p v-if="!canSubmit" class="text-center text-[10px] text-[var(--text-placeholder)] -mt-3">
              {{ submitHint }}
            </p>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 寻物指南 -->
        <div class="mt-10">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent)]" />
            <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.tipsTitle') }}</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(tip, idx) in tips"
              :key="idx"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]/30"
            >
              <div class="flex items-start gap-3">
                <span class="text-xl leading-none select-none">{{ tip.icon }}</span>
                <div>
                  <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ tip.title }}</h4>
                  <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ tip.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：掐指一算动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <XiaoLiurenHand :active-index="thumbStep" />
        <p class="text-[var(--accent)] tracking-wider font-medium mt-5 text-sm">
          {{ $t('xiaoLiurenSeeking.scanning') }}
        </p>
        <p class="text-xs text-[var(--text-faint)] mt-2">
          {{ $t('xiaoLiurenSeeking.scanningSub') }}
        </p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Seeking Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('xiaoLiurenSeeking.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 寻物信息摘要 -->
          <div v-if="formSummary" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-4">
            <div class="text-sm text-[var(--text-body)] space-y-1">
              <div v-if="formSummary.lostItemDesc"><span class="text-[var(--text-faint)]">{{ $t('xiaoLiurenSeeking.form.lostItemDesc') }}：</span>{{ formSummary.lostItemDesc }}</div>
              <div v-if="formSummary.lastSeenTime"><span class="text-[var(--text-faint)]">{{ $t('xiaoLiurenSeeking.form.lastSeenTime') }}：</span>{{ formSummary.lastSeenTime }}</div>
              <div v-if="formSummary.lastSeenPlace"><span class="text-[var(--text-faint)]">{{ $t('xiaoLiurenSeeking.form.lastSeenPlace') }}：</span>{{ formSummary.lastSeenPlace }}</div>
              <div v-if="formSummary.relationship"><span class="text-[var(--text-faint)]">{{ $t('xiaoLiurenSeeking.form.relationship') }}：</span>{{ formSummary.relationship }}</div>
              <div v-if="formSummary.description"><span class="text-[var(--text-faint)]">{{ $t('xiaoLiurenSeeking.form.description') }}：</span>{{ formSummary.description }}</div>
            </div>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('xiaoLiurenSeeking.interpretTitle') }}</h3>
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
            tool="xiao-liuren-seeking"
            :summary="`${result.finalPosition.name} · ${result.finalPosition.meaning}`"
            :share-target="resultRef"
            :filename="`xiao-liuren-seeking-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('common.retry') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo(localePath('/seeking')) }"
          >
            <template #leading>
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
            </template>
            {{ $t('xiaoLiurenSeeking.backToSeeking') }}
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
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<XiaoLiurenResult | null>(null)
const resultRef = ref<HTMLDivElement>()

const form = reactive({
  lostItemDesc: '',
  lastSeenTime: '',
  lastSeenPlace: '',
  relationship: '',
  description: '',
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const canSubmit = computed(() => {
  return form.lostItemDesc.trim().length > 0 || form.description.trim().length > 0
})

const submitHint = computed(() => {
  return t('xiaoLiurenSeeking.form.validation.required')
})

const formSummary = computed(() => {
  if (phase.value !== 'result') return null
  const s: Record<string, string> = {}
  if (form.lostItemDesc) s.lostItemDesc = form.lostItemDesc
  if (form.lastSeenTime) s.lastSeenTime = form.lastSeenTime
  if (form.lastSeenPlace) s.lastSeenPlace = form.lastSeenPlace
  if (form.relationship) s.relationship = form.relationship
  if (form.description) s.description = form.description
  return Object.keys(s).length > 0 ? s : null
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

  const payload: XiaoLiurenRequest = {
    method: 'time',
    question: t('xiaoLiurenSeeking.defaultQuestion', { item: form.lostItemDesc || t('xiaoLiurenSeeking.unknownItem') }),
    datetime: (timeCardRef.value?.iso as any).value,
  }

  try {
    const calcResult = await $fetch<XiaoLiurenResult>('/api/tools/xiao-liuren/calc', {
      method: 'POST',
      body: payload,
    })
    result.value = calcResult
    setTimeout(() => {
      stopThumbAnimation()
      phase.value = 'result'
      setTimeout(() => startAiStream(), 300)
    }, 3000)
  } catch (err: any) {
    stopThumbAnimation()
    phase.value = 'form'
    toast.add({
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

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/xiao-liuren-seeking/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: result.value,
        seekingContext: {
          lostItemDesc: form.lostItemDesc.trim(),
          lastSeenTime: form.lastSeenTime.trim(),
          lastSeenPlace: form.lastSeenPlace.trim(),
          relationship: form.relationship.trim(),
          description: form.description.trim(),
        },
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
  form.lostItemDesc = ''
  form.lastSeenTime = ''
  form.lastSeenPlace = ''
  form.relationship = ''
  form.description = ''
}

function stepValueLabel(step: XiaoLiurenStep) {
  const names = ['大安', '留连', '速喜', '赤口', '小吉', '空亡']
  return `${step.value} → ${names[((step.positionIndex % 6) + 6) % 6]}`
}

const contextText = computed(() => {
  if (!result.value) return ''
  if (result.value.method === 'time' && result.value.timeContext) {
    return result.value.timeContext.lunarDate
  }
  return ''
})

function handleCopy() {
  if (!result.value) return
  const text = `${t('xiaoLiurenSeeking.resultTitle')}\n\n${t('xiaoLiurenSeeking.form.lostItemDesc')}：${form.lostItemDesc || t('xiaoLiurenSeeking.unknownItem')}\n${t('xiaoLiuren.finalPosition')}：${result.value.finalPosition.name}\n${result.value.finalPosition.finger} · ${result.value.finalPosition.meaning}\n${result.value.finalPosition.summary}\n\n${aiContent.value ? t('xiaoLiurenSeeking.interpretTitle') + '：\n' + aiContent.value : ''}`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.copySuccess'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
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
      list.push({ title: titleLine || t('xiaoLiurenSeeking.interpretTitle'), content })
    }
  }
  return list
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

const tips = computed(() => [
  { icon: '🧭', title: t('xiaoLiurenSeeking.tips.direction.title'), content: t('xiaoLiurenSeeking.tips.direction.content') },
  { icon: '🔍', title: t('xiaoLiurenSeeking.tips.probability.title'), content: t('xiaoLiurenSeeking.tips.probability.content') },
  { icon: '⏰', title: t('xiaoLiurenSeeking.tips.timing.title'), content: t('xiaoLiurenSeeking.tips.timing.content') },
  { icon: '📍', title: t('xiaoLiurenSeeking.tips.location.title'), content: t('xiaoLiurenSeeking.tips.location.content') },
])

const seekingExtraCategories = [
  {
    key: 'seeking',
    groups: [
      {
        key: 'seekingDirection',
        questions: ['seekingDirection1', 'seekingDirection2', 'seekingDirection3', 'seekingDirection4', 'seekingDirection5', 'seekingDirection6'],
      },
      {
        key: 'seekingProbability',
        questions: ['seekingProbability1', 'seekingProbability2', 'seekingProbability3', 'seekingProbability4', 'seekingProbability5', 'seekingProbability6'],
      },
    ],
  },
]

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const pageDescription = computed(() => {
  if (phase.value === 'result' && result.value) {
    return `${result.value.timeContext?.lunarDate || ''} · ${result.value.finalPosition.name} · ${form.lostItemDesc || t('xiaoLiurenSeeking.defaultItem')}`
  }
  return t('seo.xiaoLiurenSeekingDesc')
})

const pageTitle = computed(() => {
  if (phase.value === 'result' && result.value) {
    return `${t('seo.xiaoLiurenSeekingTitle')} · ${result.value.finalPosition.name}`
  }
  return t('seo.xiaoLiurenSeekingTitle')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${pageTitle.value} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.xiaoLiurenSeekingKeywords'),
  ogTitle: () => `${pageTitle.value} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/xiao-liuren-seeking',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${pageTitle.value} - ${siteName}`,
        url: 'https://www.ososn.com/tools/xiao-liuren-seeking',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('xiaoLiurenSeeking.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/xiao-liuren-seeking',
          description: t('xiaoLiurenSeeking.subtitle'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
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
