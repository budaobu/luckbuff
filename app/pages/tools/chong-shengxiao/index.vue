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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Chong Shengxiao</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('chongShengxiao.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('chongShengxiao.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('chongShengxiao.disclaimer') }}
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
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('chongShengxiao.queryDateLabel') }}</label>
              <div class="flex flex-wrap items-center gap-3">
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !queryDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ queryDate && queryCalendarDate ? df.format(queryCalendarDate.toDate(tz)) : $t('chongShengxiao.queryDatePlaceholder') }}
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
              {{ $t('chongShengxiao.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chongShengxiao.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chongShengxiao.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chongShengxiao.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chongShengxiao.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chongShengxiao.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chongShengxiao.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chongShengxiao.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chongShengxiao.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('chongShengxiao.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('chongShengxiao.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('chongShengxiao.resultSubtitle', {
                queryDate: calcResult.queryDate,
                dayGanZhi: calcResult.lunar.dayGanZhi,
                dayShengXiao: calcResult.lunar.dayShengXiao,
              }) }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 今日冲生肖 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-arrows-right-left" class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ $t('chongShengxiao.dayClashTitle') }}
                </h3>
                <p class="text-xs text-[var(--text-muted)]">
                  {{ $t('chongShengxiao.dayClashSubtitle') }}
                </p>
              </div>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 mb-3">
              <p class="text-2xl font-bold text-[var(--accent)] text-center">
                {{ calcResult.lunar.dayShengXiao }}{{ $t('chongShengxiao.daySuffix') }}{{ calcResult.lunar.dayChongDesc }}
              </p>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">
              {{ $t('chongShengxiao.todayPrefix') }}{{ calcResult.lunar.relationSentence }}
            </p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
              <span class="px-2 py-1 rounded-lg bg-[var(--surface-card-hover)] border border-[var(--border-light)]">
                {{ $t('chongShengxiao.dayShaLabel') }} {{ calcResult.lunar.daySha }}
              </span>
              <span class="px-2 py-1 rounded-lg bg-[var(--surface-card-hover)] border border-[var(--border-light)]">
                {{ $t('chongShengxiao.lunarDateLabel') }} {{ calcResult.lunar.lunarDate }}
              </span>
            </div>
          </div>

          <!-- AI 解读 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('chongShengxiao.aiInterpretation') }}</h3>
              </div>
              <div v-if="aiStreaming" class="flex items-center gap-1.5">
                <span class="text-xs text-[var(--accent-muted)]">{{ $t('chongShengxiao.interpreting') }}</span>
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
                <p class="text-xs text-[var(--text-muted)]">{{ $t('chongShengxiao.generatingInterpretation') }}</p>
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
                {{ $t('chongShengxiao.disclaimer') }}
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
                {{ $t('chongShengxiao.reinterpret') }}
              </UButton>
            </div>
          </div>

          <!-- 时辰对冲表 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('chongShengxiao.hourClashTitle') }}
            </h3>
            <div class="space-y-2">
              <div
                v-for="item in calcResult.lunar.hours"
                :key="item.zhi"
                class="flex items-center justify-between rounded-xl border p-3"
                :class="item.luck === '吉'
                  ? 'border-green-500/20 bg-green-500/[0.06]'
                  : 'border-red-500/20 bg-red-500/[0.06]'"
              >
                <div class="flex items-center gap-3">
                  <span class="text-base font-bold" :class="item.luck === '吉' ? 'text-green-400' : 'text-red-400'">
                    {{ item.zhi }}{{ $t('chongShengxiao.hourSuffix') }}
                  </span>
                  <span class="text-xs text-[var(--text-faint)]">{{ item.timeRange }}</span>
                </div>
                <div class="flex items-center gap-3 text-xs">
                  <span class="text-[var(--text-body)]">
                    {{ $t('chongShengxiao.hourClashLabel') }}{{ item.chongShengXiao }}
                  </span>
                  <span class="text-[var(--text-muted)]">
                    {{ $t('chongShengxiao.hourShaLabel') }}{{ item.sha }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded font-medium"
                    :class="item.luck === '吉' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                  >
                    {{ item.luck === '吉' ? $t('chongShengxiao.auspicious') : $t('chongShengxiao.inauspicious') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 三神方位 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-map" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('chongShengxiao.godDirectionTitle') }}
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('chongShengxiao.godXiLabel') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.lunar.positionXiDesc }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('chongShengxiao.godCaiLabel') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.lunar.positionCaiDesc }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('chongShengxiao.godFuLabel') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.lunar.positionFuDesc }}</p>
              </div>
            </div>
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
            {{ $t('chongShengxiao.recalculate') }}
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
            {{ $t('chongShengxiao.nextDayBtn') }}
          </UButton>
          <AppShareButton
            tool="chong-shengxiao"
            :name="formValues.name"
            :summary="`${calcResult.queryDate} · ${calcResult.lunar.dayShengXiao}${$t('chongShengxiao.daySuffix')}冲${calcResult.lunar.dayChongShengXiao}`"
            :share-target="resultRef || undefined"
            :filename="`chong-shengxiao-${calcResult.queryDate}.png`"
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
            {{ $t('chongShengxiao.backToTopic') }}
          </UButton>
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

interface HourInfo {
  zhi: DiZhi
  timeRange: string
  chongShengXiao: string
  sha: string
  luck: string
  tianShenType: string
}

interface LunarInfo {
  date: string
  lunarDate: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  dayZhi: DiZhi
  dayShengXiao: string
  dayChongDesc: string
  dayChongZhi: DiZhi
  dayChongShengXiao: string
  daySha: string
  positionXiDesc: string
  positionCaiDesc: string
  positionFuDesc: string
  hours: HourInfo[]
  relationSentence: string
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  queryDate: string
  lunar: LunarInfo
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
  { value: 0 as const, label: t('chongShengxiao.today') },
  { value: 1 as const, label: t('chongShengxiao.tomorrow') },
  { value: 2 as const, label: t('chongShengxiao.dayAfterTomorrow') },
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

onMounted(() => {
  setQuickDate(0)
})

async function doCalc() {
  const result = await $fetch<CalcResult>('/api/tools/chong-shengxiao/calc', {
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

async function handleSubmit() {
  const values = baziFormRef.value?.form
  if (!values?.birthDate) {
    toast.add({
      title: t('chongShengxiao.checkInput'),
      description: t('profileForm.birthDate'),
      color: 'error',
    })
    return
  }
  if (!queryDate.value) {
    toast.add({
      title: t('chongShengxiao.checkInput'),
      description: t('chongShengxiao.queryDateLabel'),
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
    await doCalc()
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('chongShengxiao.calcFail'),
      description: err.data?.statusMessage || err.message || t('chongShengxiao.checkInput'),
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
    await doCalc()
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('chongShengxiao.calcFail'),
      description: err.data?.statusMessage || err.message || t('chongShengxiao.checkInput'),
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
    const response = await fetch('/api/tools/chong-shengxiao/reading', {
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
            aiError.value = data.message || t('chongShengxiao.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('chongShengxiao.aiUnavailable')
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
  title: () => `${t('seo.chongShengxiaoTitle')} - ${siteName}`,
  description: t('seo.chongShengxiaoDesc'),
  keywords: t('seo.chongShengxiaoKeywords'),
  ogTitle: () => `${t('seo.chongShengxiaoOgTitle')} - ${siteName}`,
  ogDescription: t('seo.chongShengxiaoOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/chong-shengxiao',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.chongShengxiaoTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/chong-shengxiao',
        description: t('seo.chongShengxiaoDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('chongShengxiao.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/chong-shengxiao',
          description: t('seo.chongShengxiaoOgDesc'),
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
