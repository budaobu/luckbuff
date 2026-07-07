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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Xuan Kong Feng Shui</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('xuankong.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('xuankong.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 大门朝向角度 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('xuankong.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.direction"
                type="number"
                :min="0"
                :max="360"
                :placeholder="$t('xuankong.directionPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('xuankong.directionHint') }}
              </p>

              <!-- 可视化罗盘 -->
              <div class="mt-4 flex justify-center">
                <div
                  ref="compassRef"
                  class="relative w-40 h-40 rounded-full border-2 border-[var(--border-light)] bg-[var(--surface-card)] cursor-crosshair select-none"
                  @mousedown="startCompassDrag"
                  @touchstart.prevent="startCompassDrag"
                  @mousemove="onCompassDrag"
                  @touchmove.prevent="onCompassDrag"
                  @mouseup="stopCompassDrag"
                  @touchend="stopCompassDrag"
                  @mouseleave="stopCompassDrag"
                >
                  <!-- 刻度 -->
                  <div class="absolute inset-0 rounded-full">
                    <div
                      v-for="deg in [0, 45, 90, 135, 180, 225, 270, 315]"
                      :key="deg"
                      class="absolute w-px h-3 bg-[var(--border-medium)] origin-bottom"
                      :style="compassTickStyle(deg)"
                    />
                  </div>
                  <!-- 方位文字 -->
                  <div class="absolute inset-0 rounded-full text-[10px] font-medium text-[var(--text-muted)]">
                    <span class="absolute top-1 left-1/2 -translate-x-1/2">N</span>
                    <span class="absolute bottom-1 left-1/2 -translate-x-1/2">S</span>
                    <span class="absolute left-1.5 top-1/2 -translate-y-1/2">W</span>
                    <span class="absolute right-1.5 top-1/2 -translate-y-1/2">E</span>
                  </div>
                  <!-- 指针 -->
                  <div
                    class="absolute bottom-1/2 left-1/2 w-0.5 h-[calc(50%-8px)] origin-bottom rounded-full bg-[var(--accent)]"
                    :style="needleStyle"
                  />
                  <div class="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                </div>
              </div>
            </div>

            <!-- 建造/入住年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('xuankong.yearLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.year"
                type="number"
                :min="1900"
                :max="2100"
                :placeholder="$t('xuankong.yearPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('xuankong.yearHint') }}
              </p>
              <p v-if="periodFeedback" class="text-xs text-[var(--accent-muted)] mt-2">
                {{ periodFeedback }}
              </p>
            </div>

            <!-- 房屋用途 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('xuankong.usageLabel') }} <span class="text-[var(--text-faint)]">（{{ $t('common.optional') }}）</span>
              </label>
              <div class="flex gap-3">
                <button
                  v-for="opt in usageOptions"
                  :key="opt.value"
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.usage === opt.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.usage = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- 计算按钮 -->
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
              {{ $t('xuankong.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xuankong.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xuankong.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xuankong.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xuankong.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xuankong.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xuankong.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xuankong.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xuankong.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calculator" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('xuankong.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('xuankong.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('xuankong.sittingFacing') }}：{{ calcResult.sittingLabel }}{{ calcResult.facingLabel }} · {{ $t('xuankong.periodLabel') }}：{{ calcResult.period.name }}（{{ calcResult.period.startYear }}–{{ calcResult.period.endYear }}）
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 九宫飞星盘 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('xuankong.chartLegend.period') }} / {{ $t('xuankong.chartLegend.mountain') }} / {{ $t('xuankong.chartLegend.facing') }}
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="cell in gridCells"
                :key="cell.palaceNumber"
                class="relative rounded-xl border p-3 min-h-[96px] flex flex-col justify-between"
                :class="cellClass(cell)"
              >
                <div class="flex items-start justify-between">
                  <span class="text-[10px] text-[var(--text-faint)]">{{ t(`xuankong.palaceNames.${palaceNameKey(cell.name)}`) }}</span>
                  <span class="text-[10px] text-[var(--text-faint)]">{{ t(`xuankong.directions.${directionKey(cell.direction)}`) }}</span>
                </div>
                <div class="flex items-center justify-center gap-1.5 py-1">
                  <span class="text-lg font-bold" :class="starClass(cell.periodStar, 'period')">{{ cell.periodStar }}</span>
                  <span class="text-xs text-[var(--text-faint)]">/</span>
                  <span class="text-lg font-bold" :class="starClass(cell.mountainStar, 'mountain')">{{ cell.mountainStar }}</span>
                  <span class="text-xs text-[var(--text-faint)]">/</span>
                  <span class="text-lg font-bold" :class="starClass(cell.facingStar, 'facing')">{{ cell.facingStar }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 格局判断 -->
          <div v-if="calcResult.pattern" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('xuankong.patternLabel') }}
            </h3>
            <p class="text-base font-bold text-[var(--accent)]">
              {{ t(`xuankong.patterns.${calcResult.pattern.key}`) }}
            </p>
            <p class="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
              {{ t(`xuankong.patternDescriptions.${calcResult.pattern.key}`) }}
            </p>
          </div>

          <!-- 兼向警告 -->
          <div v-if="calcResult.warning" class="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 mb-5">
            <div class="flex items-start gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-400 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-amber-400">{{ $t('xuankong.warningLabel') }}</p>
                <p class="text-xs text-[var(--text-muted)] mt-1">{{ calcResult.warning }}</p>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('xuankong.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('xuankong.interpreting') }}</span>
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

          <!-- 加载中 -->
          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('xuankong.generatingInterpretation') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <!-- 免责声明 -->
          <div v-if="!aiStreaming && aiContent" class="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] px-4 py-3">
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">
              {{ $t('xuankong.disclaimer') }}
            </p>
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
              {{ $t('xuankong.reinterpret') }}
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
            {{ $t('xuankong.copyResult') }}
          </UButton>
          <AppShareButton
            tool="xuankong-fengshui"
            :summary="`${calcResult.sittingLabel}${calcResult.facingLabel} · ${calcResult.period.name}`"
            :share-target="resultRef"
            :filename="`xuankong-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('xuankong.recalculate') }}
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
            {{ $t('xuankong.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface CalcResult {
  direction: number
  year: number
  period: {
    number: number
    name: string
    startYear: number
    endYear: number
  }
  sittingMountain: {
    name: string
    palace: string
    palaceNumber: number
    yin: boolean
  }
  facingMountain: {
    name: string
    palace: string
    palaceNumber: number
    yin: boolean
  }
  sittingLabel: string
  facingLabel: string
  pattern: {
    key: string
    name: string
    description: string
  } | null
  palaces: Array<{
    name: string
    direction: string
    palaceNumber: number
    periodStar: number
    mountainStar: number
    facingStar: number
  }>
  warning: string | null
  usage?: string
  locale: string
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  direction: undefined as number | undefined,
  year: undefined as number | undefined,
  usage: 'residential' as 'residential' | 'office' | 'shop',
})
const calcResult = ref<CalcResult | null>(null)
const resultRef = ref<HTMLDivElement>()
const toast = useToast()
const compassRef = ref<HTMLDivElement>()
const dragging = ref(false)

const usageOptions = computed(() => [
  { value: 'residential' as const, label: t('xuankong.usageOptions.residential') },
  { value: 'office' as const, label: t('xuankong.usageOptions.office') },
  { value: 'shop' as const, label: t('xuankong.usageOptions.shop') },
])

const canSubmit = computed(() => {
  return form.direction !== undefined && form.direction >= 0 && form.direction <= 360 && form.year !== undefined && form.year >= 1900 && form.year <= 2100
})

const periodFeedback = computed(() => {
  if (!form.year || form.year < 1900 || form.year > 2100) return ''
  let period: number
  let startYear: number
  let endYear: number
  if (form.year >= 1984 && form.year <= 2003) { period = 7; startYear = 1984; endYear = 2003 }
  else if (form.year >= 2004 && form.year <= 2023) { period = 8; startYear = 2004; endYear = 2023 }
  else if (form.year >= 2024 && form.year <= 2043) { period = 9; startYear = 2024; endYear = 2043 }
  else if (form.year < 1984) { period = 7; startYear = 1984; endYear = 2003 }
  else { period = 9; startYear = 2024; endYear = 2043 }
  return t('xuankong.periodFeedback', { period, startYear, endYear })
})

const needleStyle = computed(() => {
  const deg = form.direction ?? 0
  return {
    transform: `rotate(${deg}deg) translateX(-50%)`,
  }
})

function compassTickStyle(deg: number) {
  return {
    left: '50%',
    top: '8px',
    height: 'calc(50% - 8px)',
    transform: `rotate(${deg}deg) translateX(-50%)`,
  }
}

function getAngleFromEvent(e: MouseEvent | TouchEvent): number {
  if (!compassRef.value) return 0
  const rect = compassRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
  const rad = Math.atan2(clientY - centerY, clientX - centerX)
  let deg = rad * (180 / Math.PI) + 90
  if (deg < 0) deg += 360
  return Math.round(deg)
}

function startCompassDrag(e: MouseEvent | TouchEvent) {
  dragging.value = true
  form.direction = getAngleFromEvent(e)
}

function onCompassDrag(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return
  form.direction = getAngleFromEvent(e)
}

function stopCompassDrag() {
  dragging.value = false
}

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/xuankong-fengshui/calc', {
      method: 'POST',
      body: {
        direction: form.direction,
        year: form.year,
        usage: form.usage,
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('xuankong.calcFail'),
      description: err.data?.message || err.message || t('xuankong.checkInput'),
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
    const response = await fetch('/api/tools/xuankong-fengshui/reading', {
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
            aiError.value = data.message || t('xuankong.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('xuankong.aiUnavailable')
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
  form.direction = undefined
  form.year = undefined
  form.usage = 'residential'
}

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('xuankong.resultTitle')}

${t('xuankong.sittingFacing')}：${calcResult.value.sittingLabel}${calcResult.value.facingLabel}
${t('xuankong.periodLabel')}：${calcResult.value.period.name}（${calcResult.value.period.startYear}–${calcResult.value.period.endYear}）
${calcResult.value.pattern ? `${t('xuankong.patternLabel')}：${t(`xuankong.patterns.${calcResult.value.pattern.key}`)}` : ''}

${calcResult.value.palaces.map(p => `${t(`xuankong.palaceNames.${palaceNameKey(p.name)}`)}宫：运${p.periodStar} 山${p.mountainStar} 向${p.facingStar}`).join('\n')}

${aiContent.value ? '【' + t('xuankong.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// 九宫格按上南下北排列：巽 离 坤 / 震 中 兑 / 艮 坎 乾
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
  const isProsperous = cell.periodStar === calcResult.value?.period.number
    || cell.mountainStar === calcResult.value?.period.number
    || cell.facingStar === calcResult.value?.period.number
  if (isProsperous) {
    return 'border-[var(--accent-border)] bg-[var(--accent-bg)]/40'
  }
  return 'border-[var(--border-light)] bg-[var(--surface-card)]'
}

function starClass(star: number, type: 'period' | 'mountain' | 'facing') {
  const period = calcResult.value?.period.number
  if (star === period) return 'text-[var(--accent)]'
  if (star === 5 || star === 2) return 'text-red-400/80'
  if (type === 'period') return 'text-[var(--text-muted)]'
  return 'text-[var(--text-primary)]'
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
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('xuankong.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.xuankongTitle')} - ${siteName}`,
  description: t('seo.xuankongDesc'),
  keywords: t('seo.xuankongKeywords'),
  ogTitle: () => `${t('seo.xuankongOgTitle')} - ${siteName}`,
  ogDescription: t('seo.xuankongOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/xuankong-fengshui',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.xuankongTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/xuankong-fengshui',
        description: t('seo.xuankongDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('xuankong.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/xuankong-fengshui',
          description: t('seo.xuankongOgDesc'),
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
