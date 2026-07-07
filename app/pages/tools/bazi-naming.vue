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
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bazi Naming</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('baziNaming.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziNaming.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 姓氏 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziNaming.surnameLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.surname"
                :placeholder="$t('baziNaming.surnamePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('baziNaming.surnameHint') }}
              </p>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziNaming.genderLabel') }}
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === '男'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = '男'"
                >
                  {{ $t('baziNaming.genderMale') }}
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === '女'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = '女'"
                >
                  {{ $t('baziNaming.genderFemale') }}
                </button>
              </div>
            </div>

            <!-- 出生日期 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('baziNaming.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('baziNaming.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar
                    v-model="calendarDate"
                    color="warning"
                    class="p-2"
                  />
                </template>
              </UPopover>
            </div>

            <!-- 出生时辰 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziNaming.birthHourLabel') }}
              </label>
              <USelectMenu
                v-model="form.birthHour"
                :items="shichenOptions"
                value-key="value"
                :placeholder="$t('baziNaming.birthHourPlaceholder')"
                class="w-full"
                :ui="selectUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('baziNaming.birthHourHint') }}
              </p>
            </div>

            <!-- 名字风格偏好 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm text-[var(--text-muted)]">
                  {{ $t('baziNaming.nameStyleLabel') }}
                </label>
                <UPopover>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <UIcon name="i-heroicons-light-bulb" class="w-3.5 h-3.5" />
                    {{ $t('baziNaming.styleInspiration') }}
                  </button>
                  <template #content>
                    <div class="p-3 w-64">
                      <p class="text-xs text-[var(--text-muted)] mb-2">
                        {{ $t('baziNaming.styleInspirationTitle') }}
                      </p>
                      <div class="flex flex-wrap gap-1.5">
                        <button
                          v-for="key in stylePresetKeys"
                          :key="key"
                          type="button"
                          class="px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer"
                          :class="form.nameStyle.includes($t(`baziNaming.stylePresets.${key}`))
                            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                            : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-body)] hover:border-[var(--accent-border-hover)] hover:text-[var(--accent)]'"
                          @click="applyStyle($t(`baziNaming.stylePresets.${key}`))"
                        >
                          {{ $t(`baziNaming.stylePresets.${key}`) }}
                        </button>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
              <UInput
                v-model="form.nameStyle"
                :placeholder="$t('baziNaming.nameStylePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 起名按钮 -->
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
              {{ $t('baziNaming.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 八字起名知识卡片 -->
        <div class="mt-6 space-y-3">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
            <span class="text-xs font-medium text-[var(--text-muted)]">{{ $t('baziNaming.knowledgeTitle') }}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-beaker" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziNaming.knowledgeCard1Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziNaming.knowledgeCard1Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-heart" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziNaming.knowledgeCard2Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziNaming.knowledgeCard2Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-musical-note" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziNaming.knowledgeCard3Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziNaming.knowledgeCard3Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-squares-2x2" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziNaming.knowledgeCard4Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziNaming.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('baziNaming.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && chart">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ form.surname ? $t('baziNaming.resultTitleWithName', { name: form.surname }) : $t('baziNaming.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('bazi.chartSubtitle', { riZhu: chart.riZhu, strength: chart.riZhuStrength, geju: chart.geju }) }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 四柱卡片 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('baziPan.fourPillars') }}
            </h3>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div class="space-y-1">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('baziPan.yearPillar') }}</p>
                <p class="text-lg font-bold text-[var(--accent)]">{{ chart.year.gan }}{{ chart.year.zhi }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('baziPan.monthPillar') }}</p>
                <p class="text-lg font-bold text-[var(--accent)]">{{ chart.month.gan }}{{ chart.month.zhi }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('baziPan.dayPillar') }}</p>
                <p class="text-lg font-bold text-[var(--accent)]">{{ chart.day.gan }}{{ chart.day.zhi }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('baziPan.hourPillar') }}</p>
                <p class="text-lg font-bold text-[var(--accent)]">{{ chart.hour ? chart.hour.gan + chart.hour.zhi : '?' }}</p>
              </div>
            </div>
            <!-- 五行分数 -->
            <div class="mt-4 pt-4 border-t border-[var(--border-light)]">
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="text-[var(--text-faint)]">{{ $t('bazi.wuxingStrength') }}</span>
                <span class="text-[var(--text-muted)]">{{ $t('baziNaming.xiyongLabel') }}: {{ chart.xiyong }} · {{ $t('baziNaming.jishenLabel') }}: {{ chart.jishen }}</span>
              </div>
              <div class="grid grid-cols-5 gap-2 text-center">
                <div v-for="(label, key) in wuxingLabels" :key="key">
                  <p class="text-[10px] text-[var(--text-faint)]">{{ label }}</p>
                  <p class="text-sm font-semibold" :style="{ color: wuxingColors[key] }">{{ chart.wuxingScore[key as keyof typeof chart.wuxingScore] }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 起名推荐 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <!-- 标题区 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('baziNaming.namingResult') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('baziNaming.naming') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <!-- 流式内容 -->
          <div v-if="aiContent" class="space-y-4">
            <div
              v-for="(card, index) in nameCards"
              :key="index"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <div class="ai-section-content" v-html="renderMarkdown(card)" />
              </div>
              <span
                v-if="aiStreaming && index === nameCards.length - 1 && !card.endsWith('</div>')"
                class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-4 align-middle animate-pulse mb-4"
              />
            </div>
            <!-- 打字光标 -->
            <span
              v-if="aiStreaming && (nameCards.length === 0 || aiContent.endsWith('\n'))"
              class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse"
            />
          </div>

          <!-- 加载中 -->
          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('baziNaming.generatingNames') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <!-- 重新起名 -->
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
              {{ $t('baziNaming.rename') }}
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
            {{ $t('baziNaming.copyResult') }}
          </UButton>
          <AppShareButton
            tool="bazi-naming"
            :name="form.surname"
            :summary="`姓${form.surname} · 日主${chart.riZhu}（${chart.riZhuStrength}）· 喜用${chart.xiyong}`"
            :share-target="resultRef"
            :filename="`bazi-naming-${form.surname || 'name'}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('baziNaming.restart') }}
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
            {{ $t('baziNaming.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { SHICHEN_OPTIONS } from '~/types/user'
import type { DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  surname: '',
  gender: '男' as '男' | '女',
  birthDate: '',
  birthHour: undefined as DiZhi | undefined,
  nameStyle: '',
})
const chart = ref<BaziChart | null>(null)

// 日历 picker
const tz = getLocalTimeZone()
const df = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' }))
const calendarDate = ref<CalendarDate | undefined>(undefined)

watch(calendarDate, () => {
  if (calendarDate.value) {
    form.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  } else {
    form.birthDate = ''
  }
})

// AI 起名状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const toast = useToast()
const { calc } = useBaziCalc()

const canSubmit = computed(() => {
  return form.surname.trim().length > 0 && form.birthDate.length > 0
})

const shichenOptions = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

const stylePresetKeys = [
  'classical',
  'modern',
  'dignified',
  'gentle',
  'strong',
  'fresh',
  'scholarly',
  'auspicious',
  'poetic',
  'bold',
]

function applyStyle(style: string) {
  const current = form.nameStyle.trim()
  if (!current) {
    form.nameStyle = style
    return
  }
  const parts = current.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
  if (parts.includes(style)) {
    form.nameStyle = parts.filter(s => s !== style).join('、')
  } else {
    form.nameStyle = [...parts, style].join('、')
  }
}

const wuxingLabels: Record<string, string> = {
  木: t('bazi.wuxingWood'),
  火: t('bazi.wuxingFire'),
  土: t('bazi.wuxingEarth'),
  金: t('bazi.wuxingMetal'),
  水: t('bazi.wuxingWater'),
}

const wuxingColors: Record<string, string> = {
  木: '#4ade80',
  火: '#f87171',
  土: '#fbbf24',
  金: '#e5e7eb',
  水: '#60a5fa',
}

async function handleSubmit() {
  if (!canSubmit.value) return

  const [year, month, day] = form.birthDate.split('-').map(Number) as [number, number, number]
  const genderForCalc = form.gender === '男' ? 'male' : 'female'
  const calculatedChart = calc(year, month, day, form.birthHour ?? null, genderForCalc)

  phase.value = 'animating'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  setTimeout(() => {
    chart.value = calculatedChart
    phase.value = 'result'
    startAiStream()
  }, 1000)
}

async function startAiStream() {
  if (!chart.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/bazi-naming/naming', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surname: form.surname.trim(),
        gender: form.gender === '男' ? 'male' : 'female',
        chart: chart.value,
        locale: locale.value,
        nameStyle: form.nameStyle.trim(),
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
            aiError.value = data.message || t('baziNaming.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('baziNaming.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  calendarDate.value = undefined
  form.surname = ''
  form.gender = '男'
  form.birthDate = ''
  form.birthHour = undefined
  form.nameStyle = ''
}

function handleCopy() {
  if (!chart.value) return
  const text = `${form.surname ? form.surname + ' · ' : ''}${$t('baziNaming.resultTitle')}

${$t('baziPan.yearPillar')}：${chart.value.year.gan}${chart.value.year.zhi}
${$t('baziPan.monthPillar')}：${chart.value.month.gan}${chart.value.month.zhi}
${$t('baziPan.dayPillar')}：${chart.value.day.gan}${chart.value.day.zhi}
${$t('baziPan.hourPillar')}：${chart.value.hour ? chart.value.hour.gan + chart.value.hour.zhi : '?'}

${$t('bazi.chartSubtitle', { riZhu: chart.value.riZhu, strength: chart.value.riZhuStrength, geju: chart.value.geju })}
${$t('baziNaming.xiyongLabel')}：${chart.value.xiyong} · ${$t('baziNaming.jishenLabel')}：${chart.value.jishen}

${aiContent.value ? '【' + $t('baziNaming.namingResult') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// AI 内容按 "### " 分割为卡片
const nameCards = computed(() => {
  if (!aiContent.value) return []
  const parts = aiContent.value.split(/(?=###\s)/)
  const result: string[] = []
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    result.push(trimmed)
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

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  trigger: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.baziNamingTitle')} - ${siteName}`,
  description: t('seo.baziNamingDesc'),
  keywords: t('seo.baziNamingKeywords'),
  ogTitle: () => `${t('seo.baziNamingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziNamingOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/bazi-naming',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.baziNamingTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/bazi-naming',
        description: t('seo.baziNamingDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('baziNaming.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/bazi-naming',
          description: t('seo.baziNamingOgDesc'),
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
.ai-section-content :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}
.ai-section-content :deep(p) {
  margin-bottom: 0.5em;
  line-height: 1.75;
  color: var(--text-body);
  font-size: 0.875rem;
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
  font-size: 0.875rem;
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
.ai-section-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 0.75rem 0;
}
</style>
