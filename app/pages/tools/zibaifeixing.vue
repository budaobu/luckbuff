<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 表单阶段 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zi Bai Fei Xing</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('zibaifeixing.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('zibaifeixing.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">
                  {{ $t('zibaifeixing.yearLabel') }} <span class="text-[var(--accent)]">*</span>
                </label>
                <UInput
                  v-model.number="form.year"
                  type="number"
                  :min="1900"
                  :max="2100"
                  :placeholder="$t('zibaifeixing.yearPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                />
              </div>
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">
                  {{ $t('zibaifeixing.monthLabel') }} <span class="text-[var(--accent)]">*</span>
                </label>
                <UInput
                  v-model.number="form.month"
                  type="number"
                  :min="1"
                  :max="12"
                  :placeholder="$t('zibaifeixing.monthPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                />
              </div>
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">
                  {{ $t('zibaifeixing.dayLabel') }} <span class="text-[var(--accent)]">*</span>
                </label>
                <UInput
                  v-model.number="form.day"
                  type="number"
                  :min="1"
                  :max="31"
                  :placeholder="$t('zibaifeixing.dayPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                />
              </div>
            </div>
            <p class="text-[11px] text-[var(--text-faint)] -mt-3">
              {{ $t('zibaifeixing.dateHint') }}
            </p>

            <!-- 关注事项 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('zibaifeixing.intentLabel') }} <span class="text-[var(--text-faint)]">（{{ $t('common.optional') }}）</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in intentOptions"
                  :key="opt.value"
                  type="button"
                  class="px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.intent === opt.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.intent = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('zibaifeixing.intentHint') }}
              </p>
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('zibaifeixing.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zibaifeixing.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zibaifeixing.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-star" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zibaifeixing.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zibaifeixing.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zibaifeixing.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zibaifeixing.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zibaifeixing.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zibaifeixing.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 动画阶段 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calculator" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('zibaifeixing.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('zibaifeixing.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('zibaifeixing.dateSummary', {
                year: calcResult.input.year,
                month: calcResult.input.month,
                day: calcResult.input.day,
                branch: calcResult.input.lunarYearBranch,
                jieqi: calcResult.currentJieqi.name,
              }) }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 入中星摘要 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-star" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('zibaifeixing.centerLabel') }}
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('zibaifeixing.yearLabelShort') }}</p>
                <p class="text-2xl font-bold" :class="starClass(calcResult.yearCenter)">{{ calcResult.yearCenter }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('zibaifeixing.monthLabelShort') }}</p>
                <p class="text-2xl font-bold" :class="starClass(calcResult.monthCenter)">{{ calcResult.monthCenter }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('zibaifeixing.dayLabelShort') }}</p>
                <p class="text-2xl font-bold" :class="starClass(calcResult.dayCenter)">{{ calcResult.dayCenter }}</p>
              </div>
            </div>
          </div>

          <!-- 九宫紫白盘 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('zibaifeixing.chartLegend.year') }} / {{ $t('zibaifeixing.chartLegend.month') }} / {{ $t('zibaifeixing.chartLegend.day') }}
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="cell in gridCells"
                :key="cell.palaceNumber"
                class="relative rounded-xl border p-3 min-h-[96px] flex flex-col justify-between"
                :class="cellClass(cell)"
              >
                <div class="flex items-start justify-between">
                  <span class="text-[10px] text-[var(--text-faint)]">{{ t(`zibaifeixing.palaceNames.${palaceNameKey(cell.name)}`) }}</span>
                  <span class="text-[10px] text-[var(--text-faint)]">{{ t(`zibaifeixing.directions.${directionKey(cell.direction)}`) }}</span>
                </div>
                <div class="flex items-center justify-center gap-1.5 py-1">
                  <span class="text-lg font-bold" :class="starClass(cell.yearStar)">{{ cell.yearStar }}</span>
                  <span class="text-xs text-[var(--text-faint)]">/</span>
                  <span class="text-lg font-bold" :class="starClass(cell.monthStar)">{{ cell.monthStar }}</span>
                  <span class="text-xs text-[var(--text-faint)]">/</span>
                  <span class="text-lg font-bold" :class="starClass(cell.dayStar)">{{ cell.dayStar }}</span>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('zibaifeixing.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('zibaifeixing.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <div v-if="aiSections.length > 0" class="space-y-3">
            <div
              v-for="(section, index) in aiSections"
              :key="section.title + index"
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('zibaifeixing.generatingInterpretation') }}</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <div v-if="!aiStreaming && aiContent" class="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] px-4 py-3">
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">
              {{ $t('zibaifeixing.disclaimer') }}
            </p>
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
              {{ $t('zibaifeixing.reinterpret') }}
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
            {{ $t('zibaifeixing.copyResult') }}
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('zibaifeixing.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
             @click="() => { navigateTo('/fortune-telling') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('zibaifeixing.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface CalcResult {
  input: {
    year: number
    month: number
    day: number
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    lunarYearBranch: string
    intent: 'general' | 'wealth' | 'health' | 'love' | 'study' | 'travel' | 'renovation'
  }
  yearCenter: number
  monthCenter: number
  dayCenter: number
  currentJieqi: {
    name: string
    date: string
  }
  palaces: Array<{
    palaceNumber: number
    name: string
    direction: string
    yearStar: number
    monthStar: number
    dayStar: number
  }>
  locale: string
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  year: undefined as number | undefined,
  month: undefined as number | undefined,
  day: undefined as number | undefined,
  intent: 'general' as 'general' | 'wealth' | 'health' | 'love' | 'study' | 'travel' | 'renovation',
})
const calcResult = ref<CalcResult | null>(null)
const resultRef = ref<HTMLDivElement>()
const toast = useToast()

const canSubmit = computed(() => {
  return form.year !== undefined
    && form.year >= 1900
    && form.year <= 2100
    && form.month !== undefined
    && form.month >= 1
    && form.month <= 12
    && form.day !== undefined
    && form.day >= 1
    && form.day <= 31
})

const intentOptions = computed(() => [
  { value: 'general' as const, label: t('zibaifeixing.intentOptions.general') },
  { value: 'wealth' as const, label: t('zibaifeixing.intentOptions.wealth') },
  { value: 'health' as const, label: t('zibaifeixing.intentOptions.health') },
  { value: 'love' as const, label: t('zibaifeixing.intentOptions.love') },
  { value: 'study' as const, label: t('zibaifeixing.intentOptions.study') },
  { value: 'travel' as const, label: t('zibaifeixing.intentOptions.travel') },
  { value: 'renovation' as const, label: t('zibaifeixing.intentOptions.renovation') },
])

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/zibaifeixing/calc', {
      method: 'POST',
      body: {
        year: form.year,
        month: form.month,
        day: form.day,
        intent: form.intent,
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('zibaifeixing.calcFail'),
      description: err.data?.message || err.message || t('zibaifeixing.checkInput'),
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
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/zibaifeixing/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: calcResult.value,
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
            aiError.value = data.message || t('zibaifeixing.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('zibaifeixing.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  form.year = undefined
  form.month = undefined
  form.day = undefined
  form.intent = 'general'
}

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('zibaifeixing.resultTitle')}

${calcResult.value.input.year}年${calcResult.value.input.month}月${calcResult.value.input.day}日
农历：${calcResult.value.input.lunarYear}年（${calcResult.value.input.lunarYearBranch}）${calcResult.value.input.lunarMonth}月${calcResult.value.input.lunarDay}日
节气：${calcResult.value.currentJieqi.name}
入中星：年${calcResult.value.yearCenter} / 月${calcResult.value.monthCenter} / 日${calcResult.value.dayCenter}

${calcResult.value.palaces.map(p => `${t(`zibaifeixing.palaceNames.${palaceNameKey(p.name)}`)}宫：年${p.yearStar} / 月${p.monthStar} / 日${p.dayStar}`).join('\n')}

${aiContent.value ? '【' + t('zibaifeixing.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

const gridCells = computed(() => {
  if (!calcResult.value) return []
  const order = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾']
  return order.map(name => calcResult.value!.palaces.find(p => p.name === name)!).filter(Boolean)
})

function palaceNameKey(name: string): string {
  const map: Record<string, string> = {
    坎: 'kan', 坤: 'kun', 震: 'zhen', 巽: 'xun', 中: 'zhong', 乾: 'qian', 兑: 'dui', 艮: 'gen', 离: 'li',
  }
  return map[name] || 'zhong'
}

function directionKey(dir: string): string {
  const map: Record<string, string> = {
    北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw', 中宫: 'center',
  }
  return map[dir] || 'center'
}

function cellClass(cell: CalcResult['palaces'][number]) {
  const dangerous = [cell.yearStar, cell.monthStar, cell.dayStar].some(s => s === 5 || s === 2)
  if (dangerous) {
    return 'border-red-400/20 bg-red-400/[0.06]'
  }
  return 'border-[var(--border-light)] bg-[var(--surface-card)]'
}

function starClass(star: number) {
  if (star === 5) return 'text-red-400'
  if (star === 2) return 'text-orange-400'
  if ([1, 6, 8, 9].includes(star)) return 'text-[var(--accent)]'
  return 'text-[var(--text-primary)]'
}

const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('zibaifeixing.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.zibaifeixingTitle')} - ${siteName}`,
  description: t('seo.zibaifeixingDesc'),
  keywords: t('seo.zibaifeixingKeywords'),
  ogTitle: () => `${t('seo.zibaifeixingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.zibaifeixingOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/zibaifeixing',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.zibaifeixingTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/zibaifeixing',
        description: t('seo.zibaifeixingDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('zibaifeixing.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/zibaifeixing',
          description: t('seo.zibaifeixingOgDesc'),
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
