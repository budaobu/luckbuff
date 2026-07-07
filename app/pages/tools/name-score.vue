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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Name Score</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('nameScore.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('nameScore.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('nameScore.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 档案快选区 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('nameScore.selectProfile') }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="profile in profiles"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="selectedProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="selectProfile(profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>
            </div>
            <div v-else class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
              <p class="text-sm text-[var(--text-faint)]">
                {{ $t('nameScore.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('nameScore.goSettings') }}</NuxtLink>{{ $t('nameScore.createSuffix') }}
              </p>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('nameScore.genderLabel') }}
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'male'"
                >
                  {{ $t('nameScore.genderMale') }}
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'female'"
                >
                  {{ $t('nameScore.genderFemale') }}
                </button>
              </div>
            </div>

            <!-- 姓名 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('nameScore.nameLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.name"
                :placeholder="$t('nameScore.namePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('nameScore.nameHint') }}
              </p>
            </div>

            <!-- 出生日期（非必须） -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('nameScore.birthDateLabel') }}
              </label>
              <div class="flex items-center gap-2">
                <UPopover class="flex-1">
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('nameScore.birthDatePlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar
                      v-model="calendarDate"
                      color="warning"
                      class="p-2"
                    />
                  </template>
                </UPopover>
                <UButton
                  v-if="form.birthDate"
                  color="neutral"
                  variant="ghost"
                  class="text-[var(--text-faint)] hover:text-[var(--text-body)]"
                  @click="clearBirthDate"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                </UButton>
              </div>
            </div>

            <!-- 出生时辰（非必须） -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('nameScore.birthHourLabel') }}
              </label>
              <div class="flex items-center gap-2">
                <USelectMenu
                  v-model="form.birthHour"
                  :items="shichenOptions"
                  value-key="value"
                  :placeholder="$t('nameScore.birthHourPlaceholder')"
                  class="flex-1"
                  :ui="selectUi"
                />
                <UButton
                  v-if="form.birthHour"
                  color="neutral"
                  variant="ghost"
                  class="text-[var(--text-faint)] hover:text-[var(--text-body)]"
                  @click="form.birthHour = undefined"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                </UButton>
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('nameScore.birthHourHint') }}
              </p>
            </div>

            <!-- 开始测试 -->
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
              {{ $t('nameScore.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-star" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('nameScore.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('nameScore.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-swatch" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('nameScore.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('nameScore.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('nameScore.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('nameScore.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('nameScore.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('nameScore.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('nameScore.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result'">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ form.name ? $t('nameScore.resultTitleWithName', { name: form.name }) : $t('nameScore.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ resultSubtitle }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 八字概览 -->
          <div v-if="chart" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('nameScore.baziPillars') }}
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

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <!-- 标题区 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('nameScore.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('nameScore.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('nameScore.generatingInterpretation') }}</p>
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
              {{ $t('nameScore.reinterpret') }}
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
            {{ $t('nameScore.copyResult') }}
          </UButton>
          <AppShareButton
            tool="name-score"
            :name="form.name"
            :summary="shareSummary"
            :share-target="resultRef"
            :filename="`name-score-${form.name || 'name'}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('nameScore.recalculate') }}
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
            {{ $t('nameScore.backToTools') }}
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
import type { UserProfile, DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { calc } = useBaziCalc()

const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = useRequestURL().origin
const pagePath = '/tools/name-score'

const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  name: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  birthHour: undefined as DiZhi | undefined,
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

function clearBirthDate() {
  calendarDate.value = undefined
  form.birthDate = ''
}

// 档案选择
const { profiles, defaultProfile } = useProfiles()
const selectedProfileId = ref<string | null>(null)

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.name = profile.name || profile.label || ''
  form.gender = profile.gender
  if (profile.birthDate) {
    const [y, m, d] = profile.birthDate.split('-').map(Number) as [number, number, number]
    calendarDate.value = new CalendarDate(y, m, d)
    form.birthDate = profile.birthDate
  } else {
    calendarDate.value = undefined
    form.birthDate = ''
  }
  form.birthHour = profile.birthHour
}

onMounted(() => {
  if (defaultProfile.value && !form.name) {
    selectProfile(defaultProfile.value)
  }
})

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const canSubmit = computed(() => {
  return form.name.trim().length >= 1
})

const shichenOptions = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

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

const resultSubtitle = computed(() => {
  const parts: string[] = []
  parts.push(form.gender === 'male' ? t('nameScore.genderMale') : t('nameScore.genderFemale'))
  if (form.birthDate) parts.push(form.birthDate)
  if (form.birthHour) parts.push(`${form.birthHour}${t('nameScore.hourSuffix')}`)
  return parts.join(' · ')
})

const shareSummary = computed(() => {
  if (!chart.value) return form.name
  return `${form.name} · ${t('baziPan.dayPillar')}${chart.value.day.gan}${chart.value.day.zhi} · ${t('baziNaming.xiyongLabel')}${chart.value.xiyong}`
})

async function handleSubmit() {
  if (!canSubmit.value) return

  let calculatedChart: BaziChart | null = null
  if (form.birthDate) {
    const [year, month, day] = form.birthDate.split('-').map(Number) as [number, number, number]
    if (year && month && day) {
      try {
        calculatedChart = calc(year, month, day, form.birthHour ?? null, form.gender)
      } catch (e: any) {
        toast.add({
          title: t('nameScore.calcFail'),
          description: e?.message || t('nameScore.checkInput'),
          color: 'error',
        })
        return
      }
    }
  }

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
  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/name-score/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        gender: form.gender,
        birthDate: form.birthDate || undefined,
        birthHour: form.birthHour,
        chart: chart.value,
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
            aiError.value = data.message || t('nameScore.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('nameScore.aiUnavailable')
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
  selectedProfileId.value = null
  clearBirthDate()
  form.birthHour = undefined
  form.name = ''
  form.gender = 'male'
}

function handleCopy() {
  const lines: string[] = []
  lines.push(t('nameScore.resultTitle'))
  lines.push('')
  lines.push(`${t('nameScore.nameLabel')}：${form.name}`)
  lines.push(`${t('nameScore.genderLabel')}：${form.gender === 'male' ? t('nameScore.genderMale') : t('nameScore.genderFemale')}`)
  if (form.birthDate) lines.push(`${t('nameScore.birthDateLabel')}：${form.birthDate}`)
  if (form.birthHour) lines.push(`${t('nameScore.birthHourLabel')}：${form.birthHour}`)
  if (chart.value) {
    lines.push('')
    lines.push(`${t('baziPan.yearPillar')}：${chart.value.year.gan}${chart.value.year.zhi}`)
    lines.push(`${t('baziPan.monthPillar')}：${chart.value.month.gan}${chart.value.month.zhi}`)
    lines.push(`${t('baziPan.dayPillar')}：${chart.value.day.gan}${chart.value.day.zhi}`)
    lines.push(`${t('baziPan.hourPillar')}：${chart.value.hour ? chart.value.hour.gan + chart.value.hour.zhi : '?'}`)
    lines.push(`${t('baziNaming.xiyongLabel')}：${chart.value.xiyong} · ${t('baziNaming.jishenLabel')}：${chart.value.jishen}`)
  }
  if (aiContent.value) {
    lines.push('')
    lines.push(`【${t('nameScore.interpretation')}】`)
    lines.push(aiContent.value)
  }
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
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
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('nameScore.interpretation'), content })
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

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  trigger: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
}

// SEO
useSeoMeta({
  title: () => `${t('seo.nameScoreTitle')} - ${siteName}`,
  description: t('seo.nameScoreDesc'),
  keywords: t('seo.nameScoreKeywords'),
  ogTitle: () => `${t('seo.nameScoreOgTitle')} - ${siteName}`,
  ogDescription: t('seo.nameScoreOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}${pagePath}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.nameScoreTitle')} - ${siteName}`,
        url: `${siteUrl}${pagePath}`,
        description: t('seo.nameScoreDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('nameScore.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}${pagePath}`,
          description: t('seo.nameScoreOgDesc'),
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
