<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent-purple)]/[0.06] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Tarot</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('tarot.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('tarot.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('tarot.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-6">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 问事内容 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm text-[var(--text-muted)]">
                  {{ $t('tarot.questionLabel') }} <span class="text-[var(--accent)]">*</span>
                </label>
                <QuestionInspiration @select="q => form.question = q" />
              </div>
              <UTextarea
                v-model="form.question"
                :placeholder="$t('tarot.questionPlaceholder')"
                :rows="3"
                class="w-full"
                :ui="textareaUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('tarot.questionHint') }}
              </p>
            </div>

            <!-- 性别（可选） -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('tarot.genderLabel') }}
              </label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = form.gender === 'male' ? '' : 'male'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
                  {{ $t('tarot.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = form.gender === 'female' ? '' : 'female'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
                  {{ $t('tarot.female') }}
                </button>
              </div>
            </div>

            <!-- 牌阵选择 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('tarot.spreadLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  v-for="s in spreads"
                  :key="s.key"
                  type="button"
                  class="relative rounded-xl border p-3 text-left transition-all duration-200"
                  :class="form.spread === s.key
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] hover:border-[var(--border-medium)]'"
                  @click="form.spread = s.key"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      :name="s.icon"
                      class="w-4 h-4"
                      :class="form.spread === s.key ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'"
                    />
                    <span class="text-sm font-medium" :class="form.spread === s.key ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'">
                      {{ s.name }}
                    </span>
                  </div>
                  <p class="text-[10px] mt-1 leading-relaxed" :class="form.spread === s.key ? 'text-[var(--accent-muted)]' : 'text-[var(--text-faint)]'">
                    {{ s.desc }}
                  </p>
                  <span class="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full border"
                    :class="form.spread === s.key ? 'border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)]' : 'border-[var(--border-subtle)] text-[var(--text-faint)]'"
                  >
                    {{ s.cardCount }}{{ $t('tarot.cardCountSuffix') }}
                  </span>
                </button>
              </div>
            </div>

            <!-- 开始占卜按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('tarot.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 塔罗知识卡片 -->
        <div class="mb-6">
          <h3 class="text-xs font-medium text-[var(--text-muted)] mb-3 tracking-wide">{{ $t('tarot.knowledgeTitle') }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="(k, i) in knowledgeCards" :key="i" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                  <UIcon :name="k.icon" class="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div>
                  <h4 class="text-sm font-medium text-[var(--text-primary)] mb-1">{{ k.title }}</h4>
                  <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">{{ k.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('tarot.drawing') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && drawResult">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('tarot.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ drawResult.spread_name }} · {{ drawResult.question || $t('tarot.noQuestion') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 抽牌结果卡片 -->
          <div class="mb-5">
            <div class="flex flex-wrap gap-3 justify-center" :class="drawResult.cards.length > 4 ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : ''">
              <div
                v-for="(card, index) in drawResult.cards"
                :key="index"
                class="group relative rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] overflow-hidden transition-all duration-300 hover:border-[var(--accent-border-hover)]"
                :style="drawResult.cards.length <= 4 ? 'width: calc(25% - 0.75rem); min-width: 140px;' : ''"
                :class="drawResult.cards.length > 4 ? 'p-3' : 'p-4'"
              >
                <!-- 牌面装饰 -->
                <div class="relative mb-3 rounded-lg overflow-hidden" :class="drawResult.cards.length > 4 ? 'h-20' : 'h-28'">
                  <div class="absolute inset-0 flex items-center justify-center"
                    :class="card.is_major
                      ? 'bg-[var(--accent-purple)]/10'
                      : card.element === '火' ? 'bg-red-500/10'
                      : card.element === '水' ? 'bg-blue-500/10'
                      : card.element === '风' ? 'bg-sky-500/10'
                      : 'bg-emerald-500/10'"
                  >
                    <UIcon name="i-heroicons-rectangle-stack" class="text-[var(--text-faint)] opacity-30"
                      :class="drawResult.cards.length > 4 ? 'w-8 h-8' : 'w-12 h-12'"
                    />
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-xs font-bold" :class="card.orientation === '正位' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'">
                      {{ card.orientation === '正位' ? '↑' : '↓' }}
                    </span>
                  </div>
                </div>
                <!-- 牌名 -->
                <div class="text-center">
                  <p class="text-[10px] text-[var(--text-faint)] mb-1 tracking-wide">{{ card.position }}</p>
                  <p class="font-semibold" :class="[drawResult.cards.length > 4 ? 'text-xs' : 'text-sm', card.is_major ? 'text-[var(--accent-purple)]' : 'text-[var(--text-primary)]']">
                    {{ card.card }}
                  </p>
                  <div class="flex items-center justify-center gap-1 mt-1">
                    <span class="text-[10px] px-1.5 py-0.5 rounded border"
                      :class="card.orientation === '正位' ? 'border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)]' : 'border-[var(--border-subtle)] text-[var(--text-faint)]'"
                    >
                      {{ card.orientation }}
                    </span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-faint)]">
                      {{ card.element }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 牌阵统计 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('tarot.statsTitle') }}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="text-center rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('tarot.majorArcana') }}</p>
                <p class="text-lg font-bold text-[var(--accent-purple)]">{{ majorCount }}/{{ drawResult.cards.length }}</p>
              </div>
              <div class="text-center rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('tarot.uprightCount') }}</p>
                <p class="text-lg font-bold text-[var(--accent)]">{{ uprightCount }}/{{ drawResult.cards.length }}</p>
              </div>
              <div class="text-center rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('tarot.dominantElement') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ dominantElement }}</p>
              </div>
              <div class="text-center rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">Seed</p>
                <p class="text-xs font-mono text-[var(--text-muted)] truncate">{{ drawResult.seed }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <!-- 标题区 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('tarot.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('tarot.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <!-- 结构化展示 -->
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

          <!-- 加载中 -->
          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('tarot.generatingInterpretation') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <!-- 重新解读 -->
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
              {{ $t('tarot.reinterpret') }}
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
            {{ $t('tarot.copyResult') }}
          </UButton>
          <AppShareButton
            tool="tarot"
            :summary="`${drawResult.spread_name} · ${drawResult.cards.map(c => c.card).join(' · ')}`"
            :share-target="resultRef"
            :filename="`tarot-${drawResult.spread}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('tarot.redraw') }}
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
            {{ $t('tarot.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface TarotCard {
  position: string
  card: string
  orientation: string
  is_major: boolean
  element: string
}

interface TarotDrawResult {
  seed: number
  spread: string
  spread_name: string
  question: string
  gender: string
  time_factor: string
  cards: TarotCard[]
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  question: '',
  spread: 'three',
  gender: '' as 'male' | 'female' | '',
})
const drawResult = ref<TarotDrawResult | null>(null)

// 牌阵选项
const spreads = computed(() => [
  { key: 'single', name: t('tarot.spreadSingle'), desc: t('tarot.spreadSingleDesc'), cardCount: 1, icon: 'i-heroicons-square-2x2' },
  { key: 'three', name: t('tarot.spreadThree'), desc: t('tarot.spreadThreeDesc'), cardCount: 3, icon: 'i-heroicons-squares-2x2' },
  { key: 'diamond', name: t('tarot.spreadDiamond'), desc: t('tarot.spreadDiamondDesc'), cardCount: 5, icon: 'i-heroicons-diamond' },
  { key: 'moon', name: t('tarot.spreadMoon'), desc: t('tarot.spreadMoonDesc'), cardCount: 4, icon: 'i-heroicons-moon' },
  { key: 'horseshoe', name: t('tarot.spreadHorseshoe'), desc: t('tarot.spreadHorseshoeDesc'), cardCount: 7, icon: 'i-heroicons-arc' },
  { key: 'celtic', name: t('tarot.spreadCeltic'), desc: t('tarot.spreadCelticDesc'), cardCount: 10, icon: 'i-heroicons-plus-circle' },
])

// 塔罗知识卡片
const knowledgeCards = computed(() => [
  { icon: 'i-heroicons-book-open', title: t('tarot.knowledge1Title'), desc: t('tarot.knowledge1Desc') },
  { icon: 'i-heroicons-swatch', title: t('tarot.knowledge2Title'), desc: t('tarot.knowledge2Desc') },
  { icon: 'i-heroicons-arrows-up-down', title: t('tarot.knowledge3Title'), desc: t('tarot.knowledge3Desc') },
  { icon: 'i-heroicons-hand-raised', title: t('tarot.knowledge4Title'), desc: t('tarot.knowledge4Desc') },
])

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()
const toast = useToast()

const canSubmit = computed(() => {
  return form.question.trim().length > 0 && form.spread.length > 0
})

// 牌阵统计
const majorCount = computed(() => drawResult.value?.cards.filter((c: TarotCard) => c.is_major).length || 0)
const uprightCount = computed(() => drawResult.value?.cards.filter((c: TarotCard) => c.orientation === '正位').length || 0)
const dominantElement = computed(() => {
  if (!drawResult.value) return '-'
  const elements: Record<string, number> = {}
  for (const c of drawResult.value.cards) {
    elements[c.element] = (elements[c.element] || 0) + 1
  }
  const sorted = Object.entries(elements).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || '-'
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  drawResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<TarotDrawResult>('/api/tools/tarot/draw', {
      method: 'POST',
      body: {
        spread: form.spread,
        question: form.question.trim(),
        gender: form.gender,
        locale: locale.value,
      },
    })

    drawResult.value = result
    phase.value = 'result'

    // 延迟启动 AI 解读
    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('tarot.drawFail'),
      description: err.data?.message || err.message || t('tarot.checkInput'),
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!drawResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/tarot/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: drawResult.value,
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
            aiError.value = data.message || t('tarot.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('tarot.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  drawResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  form.gender = ''
}

function handleCopy() {
  if (!drawResult.value) return
  const cards = drawResult.value.cards.map((c: TarotCard, i: number) =>
    `${i + 1}. ${c.position} · ${c.card} · ${c.orientation} · ${c.element}元素`
  ).join('\n')

  const text = `${t('tarot.resultTitle')}

${t('tarot.questionLabel')}：${drawResult.value.question || t('tarot.noQuestion')}
${t('tarot.spreadLabel')}：${drawResult.value.spread_name}

【${t('tarot.statsTitle')}】
${cards}

${aiContent.value ? '【' + t('tarot.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// AI 内容分段
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
      result.push({ title: titleLine || t('tarot.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// UI Config
const textareaUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] resize-none',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.tarotTitle')} - ${siteName}`,
  description: t('seo.tarotDesc'),
  keywords: t('seo.tarotKeywords'),
  ogTitle: () => `${t('seo.tarotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.tarotOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/tarot',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.tarotTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/tarot',
        description: t('seo.tarotDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('tarot.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/tarot',
          description: t('seo.tarotOgDesc'),
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
