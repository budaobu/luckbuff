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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Wuxing Chuanyi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('wuxingChuanyi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('wuxingChuanyi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('wuxingChuanyi.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 出生信息 -->
            <BaziForm
              ref="baziFormRef"
              minimal
              :initial-values="lastFormValues"
              @save-profile="handleSaveProfile"
            />

            <!-- 查询日期 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('wuxingChuanyi.queryDateLabel') }}</label>
              <div class="flex flex-wrap items-center gap-3">
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !queryDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ queryDate ? df.format(queryCalendarDate?.toDate(tz) || new Date()) : $t('wuxingChuanyi.queryDatePlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="queryCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="opt in quickDateOptions"
                    :key="opt.value"
                    type="button"
                    class="px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                    :class="quickDateOffset === opt.value
                      ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                      : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                    @click="setQuickDate(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('wuxingChuanyi.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-swatch" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuxingChuanyi.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuxingChuanyi.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuxingChuanyi.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuxingChuanyi.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuxingChuanyi.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuxingChuanyi.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wuxingChuanyi.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wuxingChuanyi.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('wuxingChuanyi.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('wuxingChuanyi.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('wuxingChuanyi.resultSubtitle', {
                queryDate: calcResult.queryDate,
                queryGanzhi: `${calcResult.queryGanzhi.gan}${calcResult.queryGanzhi.zhi}`,
                queryRiGanWuxing: calcResult.queryRiGanWuxing,
              }) }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 颜色卡片 -->
          <div class="grid grid-cols-1 gap-4 mb-5">
            <!-- 大吉色 -->
            <div class="rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl bg-[var(--surface-card)] border border-green-500/20 flex items-center justify-center text-green-400">
                  <UIcon name="i-heroicons-star" class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-xs text-green-400">{{ $t('wuxingChuanyi.daJiLabel') }}</p>
                  <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.daJi.wuxing }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="color in calcResult.daJi.colors"
                  :key="color"
                  class="px-3 py-1.5 rounded-lg bg-[var(--surface-card)] border border-green-500/20 text-sm text-[var(--text-primary)]"
                >
                  {{ color }}
                </span>
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ calcResult.daJi.reason }}</p>
            </div>

            <!-- 次吉色 -->
            <div class="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-bg)] p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl bg-[var(--surface-card)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-hand-thumb-up" class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-xs text-[var(--accent-muted)]">{{ $t('wuxingChuanyi.ciJiLabel') }}</p>
                  <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.ciJi.wuxing }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="color in calcResult.ciJi.colors"
                  :key="color"
                  class="px-3 py-1.5 rounded-lg bg-[var(--surface-card)] border border-[var(--accent-border)] text-sm text-[var(--text-primary)]"
                >
                  {{ color }}
                </span>
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ calcResult.ciJi.reason }}</p>
            </div>

            <!-- 不宜色 -->
            <div class="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl bg-[var(--surface-card)] border border-red-500/20 flex items-center justify-center text-red-400">
                  <UIcon name="i-heroicons-no-symbol" class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-xs text-red-400">{{ $t('wuxingChuanyi.buYiLabel') }}</p>
                  <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.buYi.wuxing }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="color in calcResult.buYi.colors"
                  :key="color"
                  class="px-3 py-1.5 rounded-lg bg-[var(--surface-card)] border border-red-500/20 text-sm text-[var(--text-primary)]"
                >
                  {{ color }}
                </span>
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ calcResult.buYi.reason }}</p>
            </div>
          </div>

          <!-- AI narrative -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('wuxingChuanyi.aiInterpretation') }}</h3>
              </div>
              <div v-if="aiStreaming" class="flex items-center gap-1.5">
                <span class="text-xs text-[var(--accent-muted)]">{{ $t('wuxingChuanyi.interpreting') }}</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
              </div>
            </div>

            <div
              v-if="aiContent"
              class="space-y-4"
            >
              <div
                v-for="(card, idx) in aiCards"
                :key="idx"
                class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] p-4"
              >
                <div
                  class="prose prose-sm max-w-none text-[var(--text-body)] leading-relaxed"
                  v-html="card.html"
                />
              </div>
            </div>

            <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
                </div>
                <p class="text-xs text-[var(--text-muted)]">{{ $t('wuxingChuanyi.generatingInterpretation') }}</p>
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
                {{ $t('wuxingChuanyi.disclaimer') }}
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
                {{ $t('wuxingChuanyi.reinterpret') }}
              </UButton>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="flex gap-3 justify-center mt-10 flex-wrap">
            <UButton
              color="warning"
              variant="soft"
              class="group/btn"
              @click="resetForm"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('wuxingChuanyi.recalculate') }}
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              class="group/btn"
              @click="handleNextDay"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </template>
              {{ $t('wuxingChuanyi.nextDayBtn') }}
            </UButton>
            <AppShareButton
              tool="wuxing-chuanyi"
              :name="formValues.name"
              :summary="`${calcResult.queryDate} · ${$t('wuxingChuanyi.daJiLabel')}${calcResult.daJi.colors.join('、')} · ${$t('wuxingChuanyi.ciJiLabel')}${calcResult.ciJi.colors.join('、')}`"
              :share-target="resultRef || undefined"
              :filename="`wuxing-chuanyi-${calcResult.queryDate}.png`"
            />
            <UButton
              color="neutral"
              variant="ghost"
              class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
               @click="() => { navigateTo('/auspicious-datetime') }"
            >
              <template #leading>
                <UIcon name="i-heroicons-cube" class="w-4 h-4" />
              </template>
              {{ $t('wuxingChuanyi.backToTopic') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { parseDate, CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
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

interface WuxingColorSet {
  wuxing: string
  colors: string[]
  reason: string
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  riGan: string
  riGanWuxing: string
  queryDate: string
  queryGanzhi: { gan: string; zhi: string }
  queryRiGan: string
  queryRiGanWuxing: string
  daJi: WuxingColorSet
  ciJi: WuxingColorSet
  buYi: WuxingColorSet
  xiyongWuxing: string
  jishenWuxing: string
  locale: string
}

const { t, locale } = useI18n()
const toast = useToast()
const store = useProfilesStore()

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  formerName: '',
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const calcResult = ref<CalcResult | null>(null)
const baziFormRef = ref<{ form: FormValues } | null>(null)
const resultRef = ref<HTMLDivElement | null>(null)

const tz = getLocalTimeZone()
const df = new DateFormatter(locale.value, { dateStyle: 'long' })
const queryCalendarDate = ref<CalendarDate | undefined>(undefined)
const queryDate = ref('')

const quickDateOffset = ref<0 | 1 | 2 | null>(null)

watch(queryCalendarDate, () => {
  if (queryCalendarDate.value) {
    queryDate.value = `${queryCalendarDate.value.year}-${String(queryCalendarDate.value.month).padStart(2, '0')}-${String(queryCalendarDate.value.day).padStart(2, '0')}`
  }
  else {
    queryDate.value = ''
  }

  // 同步高亮今天/明天/后天按钮
  const selected = queryCalendarDate.value?.toDate(tz)
  if (selected) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffDays = Math.round((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    quickDateOffset.value = diffDays >= 0 && diffDays <= 2 ? (diffDays as 0 | 1 | 2) : null
  }
  else {
    quickDateOffset.value = null
  }
})

const quickDateOptions = computed(() => [
  { value: 0 as const, label: t('wuxingChuanyi.today') },
  { value: 1 as const, label: t('wuxingChuanyi.tomorrow') },
  { value: 2 as const, label: t('wuxingChuanyi.dayAfterTomorrow') },
])

function setQuickDate(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  queryCalendarDate.value = new CalendarDate(year, month, day)
  quickDateOffset.value = offset as 0 | 1 | 2
}

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
    formerName: values.formerName || undefined,
    formerNameChangedYear: values.formerNameChangedYear,
    birthProvince: values.birthProvince || undefined,
  })
}

async function handleSubmit() {
  const values = baziFormRef.value?.form
  if (!values?.birthDate) {
    toast.add({
      title: t('wuxingChuanyi.checkInput'),
      description: t('profileForm.birthDate'),
      color: 'error',
    })
    return
  }
  if (!queryDate.value) {
    toast.add({
      title: t('wuxingChuanyi.checkInput'),
      description: t('wuxingChuanyi.queryDateLabel'),
      color: 'error',
    })
    return
  }

  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/wuxing-chuanyi/calc', {
      method: 'POST',
      body: {
        birthDate: formValues.value.birthDate,
        birthHour: formValues.value.birthHour ?? null,
        queryDate: queryDate.value,
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('wuxingChuanyi.calcFail'),
      description: err.data?.statusMessage || err.message || t('wuxingChuanyi.checkInput'),
      color: 'error',
    })
  }
}

async function handleNextDay() {
  if (!calcResult.value) return
  const d = new Date(calcResult.value.queryDate)
  d.setDate(d.getDate() + 1)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  queryDate.value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  try {
    queryCalendarDate.value = parseDate(queryDate.value)
  }
  catch {
    queryCalendarDate.value = undefined
  }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/wuxing-chuanyi/calc', {
      method: 'POST',
      body: {
        birthDate: formValues.value.birthDate,
        birthHour: formValues.value.birthHour ?? null,
        queryDate: queryDate.value,
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('wuxingChuanyi.calcFail'),
      description: err.data?.statusMessage || err.message || t('wuxingChuanyi.checkInput'),
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
    const response = await fetch('/api/tools/wuxing-chuanyi/reading', {
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
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('wuxingChuanyi.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('wuxingChuanyi.aiUnavailable')
  }
  finally {
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
}

const aiCards = computed(() => {
  if (!aiContent.value) return []
  return aiContent.value
    .split('\n---\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map((segment) => {
      return {
        html: marked.parse(segment, { async: false }) as string,
      }
    })
})

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.wuxingChuanyiTitle')} - ${siteName}`,
  description: t('seo.wuxingChuanyiDesc'),
  keywords: t('seo.wuxingChuanyiKeywords'),
  ogTitle: () => `${t('seo.wuxingChuanyiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.wuxingChuanyiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/wuxing-chuanyi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.wuxingChuanyiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/wuxing-chuanyi',
        description: t('seo.wuxingChuanyiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('wuxingChuanyi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/wuxing-chuanyi',
          description: t('seo.wuxingChuanyiOgDesc'),
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
:deep(.prose p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
:deep(.prose p:last-child) {
  margin-bottom: 0;
}
:deep(.prose strong) {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
