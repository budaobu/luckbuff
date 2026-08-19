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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">C-Section Date Selection</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('poufuchanZeri.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('poufuchanZeri.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明（含医嘱提示） -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('poufuchanZeri.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 预产期窗口 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                {{ $t('poufuchanZeri.windowLabel') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !form.startDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ form.startDate && startCalendarDate ? df.format(startCalendarDate.toDate(tz)) : $t('poufuchanZeri.startPlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="startCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !form.endDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ form.endDate && endCalendarDate ? df.format(endCalendarDate.toDate(tz)) : $t('poufuchanZeri.endPlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="endCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
              </div>
              <p class="text-[11px] text-[var(--text-faint)]">{{ $t('poufuchanZeri.windowHint') }}</p>
            </div>

            <!-- 母亲生辰 -->
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent)]" />
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('poufuchanZeri.motherSection') }}</h3>
                <span class="text-[var(--accent)]">*</span>
              </div>

              <div v-if="store.list.length > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="profile in store.list"
                  :key="`m-${profile.id}`"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="motherProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-body)]'"
                  @click="selectProfile('mother', profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>

              <div class="space-y-1.5">
                <label class="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  {{ $t('poufuchanZeri.birthDateLabel') }}
                  <span class="text-[var(--accent)]">*</span>
                </label>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !mother.birthDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ mother.birthDate && motherCalendarDate ? df.format(motherCalendarDate.toDate(tz)) : $t('poufuchanZeri.birthDatePlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="motherCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs text-[var(--text-muted)]">{{ $t('poufuchanZeri.birthHourLabel') }}</label>
                <div class="relative">
                  <select
                    v-model="mother.birthHour"
                    class="w-full appearance-none px-3 py-2.5 pr-9 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-border-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-border-hover)] cursor-pointer"
                  >
                    <option value="">{{ $t('poufuchanZeri.birthHourPlaceholder') }}</option>
                    <option v-for="opt in hourOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <UIcon name="i-heroicons-chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- 父亲生辰 -->
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent)]" />
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('poufuchanZeri.fatherSection') }}</h3>
                <span class="text-[var(--accent)]">*</span>
              </div>

              <div v-if="store.list.length > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="profile in store.list"
                  :key="`f-${profile.id}`"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="fatherProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-body)]'"
                  @click="selectProfile('father', profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>

              <div class="space-y-1.5">
                <label class="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  {{ $t('poufuchanZeri.birthDateLabel') }}
                  <span class="text-[var(--accent)]">*</span>
                </label>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !father.birthDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ father.birthDate && fatherCalendarDate ? df.format(fatherCalendarDate.toDate(tz)) : $t('poufuchanZeri.birthDatePlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="fatherCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs text-[var(--text-muted)]">{{ $t('poufuchanZeri.birthHourLabel') }}</label>
                <div class="relative">
                  <select
                    v-model="father.birthHour"
                    class="w-full appearance-none px-3 py-2.5 pr-9 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-border-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-border-hover)] cursor-pointer"
                  >
                    <option value="">{{ $t('poufuchanZeri.birthHourPlaceholder') }}</option>
                    <option v-for="opt in hourOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <UIcon name="i-heroicons-chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] pointer-events-none" />
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
              {{ $t('poufuchanZeri.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="i in 4" :key="i" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon :name="knowledgeIcons[i - 1]" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t(`poufuchanZeri.knowledgeCard${i}Title`) }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t(`poufuchanZeri.knowledgeCard${i}Desc`) }}</p>
          </div>
        </div>
      </div>

      <!-- 动画阶段 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calendar-days" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('poufuchanZeri.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段：择日海报（AI 解读流式融入，兼任分享截图目标） -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="posterRef" class="pzp-share-target">
          <PoufuchanZeriPoster
            :start-date="calcResult.window.startDate"
            :end-date="calcResult.window.endDate"
            :mother="{ birthDate: calcResult.mother.birthDate, shengXiao: calcResult.mother.shengXiao }"
            :father="{ birthDate: calcResult.father.birthDate, shengXiao: calcResult.father.shengXiao }"
            :best="calcResult.best"
            :top-list="calcResult.ranked.slice(0, 8)"
            :total-count="calcResult.ranked.length"
            :ai-content="aiContent"
          />
        </div>

        <!-- 隐士解读状态条 -->
        <div class="pz-ai-bar">
            <div v-if="aiStreaming" class="flex items-center justify-center gap-2 py-1">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('poufuchanZeri.interpreting') }}</span>
            </div>
            <div v-else-if="aiError" class="flex items-center justify-center gap-2 py-1">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-xs text-red-400">{{ aiError }}</p>
            </div>
            <div v-else-if="aiContent" class="flex items-center justify-center gap-4 py-1">
              <p class="text-[11px] text-[var(--text-faint)]">{{ $t('poufuchanZeri.disclaimer') }}</p>
              <UButton
                color="warning"
                variant="soft"
                size="xs"
                class="group/btn shrink-0"
                @click="startAiStream"
              >
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
                </template>
                {{ $t('poufuchanZeri.reinterpret') }}
              </UButton>
            </div>
          </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-8 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('poufuchanZeri.recalculate') }}
          </UButton>
          <AppShareButton
            tool="poufuchan-zeri"
            :disabled="aiStreaming || !aiContent"
            :summary="`${calcResult.best.date} ${calcResult.best.dizhi}时（${calcResult.best.timeRange}）· ${calcResult.best.dayGanZhi}日${calcResult.best.hourGanZhi}时 · ${$t('poufuchanZeri.scoreLabel')}${calcResult.best.totalScore}`"
            :share-target="posterRef || undefined"
            :filename="`poufuchan-zeri-${calcResult.best.date}-${calcResult.best.dizhi}.png`"
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
            {{ $t('poufuchanZeri.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DiZhi } from '~/types/user'
import { useProfilesStore } from '~/stores/profiles'

interface ScoredHour {
  dizhi: DiZhi
  timeRange: string
  ganZhi: string
  tianShen: string
  tianShenType: '黄道' | '黑道'
  timeYi: string[]
  timeJi: string[]
  score: number
  tags: string[]
}

interface ScoredDay {
  date: string
  lunarDate: string
  dayGanZhi: string
  shengXiao: string
  tianShen: string
  tianShenLuck: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  chongDesc: string
  week: string
  dayScore: number
  hours: ScoredHour[]
}

interface RankedCandidate {
  rank: number
  date: string
  lunarDate: string
  dayGanZhi: string
  week: string
  dizhi: DiZhi
  timeRange: string
  hourGanZhi: string
  tianShen: string
  tianShenType: '黄道' | '黑道'
  dayScore: number
  hourScore: number
  totalScore: number
  tags: string[]
}

interface PersonResult {
  birthDate: string
  birthHour: DiZhi | null
  pillars: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  shengXiao: string
}

interface CalcResult {
  window: { startDate: string; endDate: string }
  mother: PersonResult
  father: PersonResult
  days: ScoredDay[]
  ranked: RankedCandidate[]
  best: RankedCandidate
  locale: string
}

const { t, locale } = useI18n()
const store = useProfilesStore()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const calcResult = ref<CalcResult | null>(null)
const posterRef = ref<HTMLDivElement | null>(null)

const tz = getLocalTimeZone()
const df = new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), {
  dateStyle: 'medium',
})

/* ---------- 表单状态 ---------- */

const form = reactive({ startDate: '', endDate: '' })
const mother = reactive({ birthDate: '', birthHour: undefined as DiZhi | undefined })
const father = reactive({ birthDate: '', birthHour: undefined as DiZhi | undefined })

const startCalendarDate = ref<CalendarDate | undefined>(undefined)
const endCalendarDate = ref<CalendarDate | undefined>(undefined)
const motherCalendarDate = ref<CalendarDate | undefined>(undefined)
const fatherCalendarDate = ref<CalendarDate | undefined>(undefined)

const motherProfileId = ref('')
const fatherProfileId = ref('')

function toDateStr(v: { year: number; month: number; day: number }): string {
  return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`
}

watch(startCalendarDate, () => { if (startCalendarDate.value) form.startDate = toDateStr(startCalendarDate.value) })
watch(endCalendarDate, () => { if (endCalendarDate.value) form.endDate = toDateStr(endCalendarDate.value) })
watch(motherCalendarDate, () => { if (motherCalendarDate.value) mother.birthDate = toDateStr(motherCalendarDate.value) })
watch(fatherCalendarDate, () => { if (fatherCalendarDate.value) father.birthDate = toDateStr(fatherCalendarDate.value) })

function selectProfile(which: 'mother' | 'father', profile: typeof store.list[0]) {
  const target = which === 'mother' ? mother : father
  if (which === 'mother') motherProfileId.value = profile.id
  else fatherProfileId.value = profile.id
  target.birthDate = profile.birthDate || ''
  target.birthHour = profile.birthHour
  const calRef = which === 'mother' ? motherCalendarDate : fatherCalendarDate
  try {
    calRef.value = target.birthDate ? parseDate(target.birthDate) : undefined
  }
  catch {
    calRef.value = undefined
  }
}

const hourOptions = computed(() => {
  const ranges: Record<DiZhi, string> = {
    子: '23:00~01:00', 丑: '01:00~03:00', 寅: '03:00~05:00', 卯: '05:00~07:00',
    辰: '07:00~09:00', 巳: '09:00~11:00', 午: '11:00~13:00', 未: '13:00~15:00',
    申: '15:00~17:00', 酉: '17:00~19:00', 戌: '19:00~21:00', 亥: '21:00~23:00',
  }
  const names = t('poufuchanZeri.hourNames').split(',')
  return (Object.keys(ranges) as DiZhi[]).map((dizhi, idx) => ({
    label: `${names[idx]}（${ranges[dizhi]}）`,
    value: dizhi,
  }))
})

const knowledgeIcons = [
  'i-heroicons-question-mark-circle',
  'i-heroicons-scale',
  'i-heroicons-clock',
  'i-heroicons-light-bulb',
]

onMounted(() => {
  const today = new Date()
  const twoWeeks = new Date(today)
  twoWeeks.setDate(twoWeeks.getDate() + 14)
  form.startDate = toDateStr({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() })
  form.endDate = toDateStr({ year: twoWeeks.getFullYear(), month: twoWeeks.getMonth() + 1, day: twoWeeks.getDate() })
  try {
    startCalendarDate.value = parseDate(form.startDate)
    endCalendarDate.value = parseDate(form.endDate)
  }
  catch { /* ignore */ }
})

/* ---------- 提交计算 ---------- */

async function handleSubmit() {
  if (!form.startDate || !form.endDate) {
    toast.add({ title: t('poufuchanZeri.checkInput'), description: t('poufuchanZeri.windowLabel'), color: 'error' })
    return
  }
  if (!mother.birthDate) {
    toast.add({ title: t('poufuchanZeri.checkInput'), description: t('poufuchanZeri.motherSection'), color: 'error' })
    return
  }
  if (!father.birthDate) {
    toast.add({ title: t('poufuchanZeri.checkInput'), description: t('poufuchanZeri.fatherSection'), color: 'error' })
    return
  }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/poufuchan-zeri/calc', {
      method: 'POST',
      body: {
        startDate: form.startDate,
        endDate: form.endDate,
        mother: { birthDate: mother.birthDate, birthHour: mother.birthHour || null },
        father: { birthDate: father.birthDate, birthHour: father.birthHour || null },
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
      title: t('poufuchanZeri.calcFail'),
      description: err.data?.statusMessage || err.message || t('poufuchanZeri.checkInput'),
      color: 'error',
    })
  }
}

/* ---------- AI 流式解读 ---------- */

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
    const response = await fetch('/api/tools/poufuchan-zeri/reading', {
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
            aiError.value = data.message || t('poufuchanZeri.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('poufuchanZeri.aiUnavailable')
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

/* ---------- SEO ---------- */

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.poufuchanZeriTitle')} - ${siteName}`,
  description: t('seo.poufuchanZeriDesc'),
  keywords: t('seo.poufuchanZeriKeywords'),
  ogTitle: () => `${t('seo.poufuchanZeriOgTitle')} - ${siteName}`,
  ogDescription: t('seo.poufuchanZeriOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/poufuchan-zeri',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.poufuchanZeriTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/poufuchan-zeri',
        description: t('seo.poufuchanZeriDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('poufuchanZeri.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/poufuchan-zeri',
          description: t('seo.poufuchanZeriOgDesc'),
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
/* 海报容器：结果页唯一展示组件，兼任分享截图目标 */
.pzp-share-target {
  width: 100%;
}

/* 隐士解读状态条 */
.pz-ai-bar {
  margin-top: 10px;
  padding: 0 4px;
}
</style>
