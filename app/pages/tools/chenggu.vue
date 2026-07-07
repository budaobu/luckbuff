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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Chenggu</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('chenggu.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('chenggu.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('chenggu.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 档案快选区 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('chenggu.selectProfile') }}</label>
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
                {{ $t('chenggu.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('chenggu.goSettings') }}</NuxtLink>{{ $t('chenggu.createSuffix') }}
              </p>
            </div>

            <!-- 性别 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('chenggu.genderLabel') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = 'male'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
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
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 阳历生日 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('chenggu.birthDateLabel') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('chenggu.birthDatePlaceholder') }}
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
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('chenggu.birthHourLabel') }}</label>
              <USelect
                v-model="form.birthHour"
                :items="hourOptions as any"
                :placeholder="$t('chenggu.birthHourPlaceholder')"
                color="warning"
                class="w-full"
                :ui="{
                  base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
                  placeholder: 'text-[var(--text-placeholder)]',
                  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl',
                  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
                }"
              />
            </div>

            <!-- 计算按钮 -->
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
              {{ $t('chenggu.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chenggu.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chenggu.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-calculator" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chenggu.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chenggu.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chenggu.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chenggu.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('chenggu.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('chenggu.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-scale" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('chenggu.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('chenggu.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.solarDate.year }}年{{ calcResult.solarDate.month }}月{{ calcResult.solarDate.day }}日 · {{ calcResult.gender === 'male' ? $t('common.male') : $t('common.female') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 骨重总览卡片 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-6 mb-5 text-center">
            <p class="text-xs text-[var(--text-muted)] mb-2">{{ $t('chenggu.totalWeight') }}</p>
            <div class="flex items-baseline justify-center gap-1">
              <span class="text-4xl font-bold text-[var(--accent)]">{{ calcResult.totalWeight.liang }}</span>
              <span class="text-lg text-[var(--text-primary)]">{{ $t('chenggu.liangUnit') }}</span>
              <span v-if="calcResult.totalWeight.qian > 0" class="text-4xl font-bold text-[var(--accent)] ml-2">{{ calcResult.totalWeight.qian }}</span>
              <span v-if="calcResult.totalWeight.qian > 0" class="text-lg text-[var(--text-primary)]">{{ $t('chenggu.qianUnit') }}</span>
            </div>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium"
              :class="fortuneLevelClass"
            >
              <span>{{ calcResult.fortune.level }}</span>
            </div>
            <p class="text-xs text-[var(--text-faint)] mt-3">
              {{ $t('chenggu.lunarDateLabel') }}：{{ calcResult.lunarDate.year }}年{{ calcResult.lunarDate.month }}月{{ calcResult.lunarDate.day }}日
            </p>
          </div>

          <!-- 骨重明细 -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('chenggu.yearWeight') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ formatWeight(calcResult.breakdown.year.weight) }}</p>
              <p class="text-[10px] text-[var(--text-faint)] mt-0.5">{{ calcResult.breakdown.year.ganzhi }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('chenggu.monthWeight') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ formatWeight(calcResult.breakdown.month.weight) }}</p>
              <p class="text-[10px] text-[var(--text-faint)] mt-0.5">{{ calcResult.breakdown.month.lunarMonth }}{{ $t('chenggu.monthUnit') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('chenggu.dayWeight') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ formatWeight(calcResult.breakdown.day.weight) }}</p>
              <p class="text-[10px] text-[var(--text-faint)] mt-0.5">{{ calcResult.breakdown.day.lunarDay }}{{ $t('chenggu.dayUnit') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('chenggu.hourWeight') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ formatWeight(calcResult.breakdown.hour.weight) }}</p>
              <p class="text-[10px] text-[var(--text-faint)] mt-0.5">{{ calcResult.breakdown.hour.shiChen }}{{ $t('chenggu.hourUnit') }}</p>
            </div>
          </div>

          <!-- 称骨歌 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('chenggu.fortunePoem') }}
            </h3>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-sm text-[var(--text-body)] leading-relaxed font-serif">{{ calcResult.fortune.poem }}</p>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('chenggu.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('chenggu.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('chenggu.generatingInterpretation') }}</p>
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
              {{ $t('chenggu.reinterpret') }}
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
            {{ $t('chenggu.copyResult') }}
          </UButton>
          <AppShareButton
            tool="chenggu"
            :summary="`骨重 ${calcResult.totalWeight.liang}两${calcResult.totalWeight.qian > 0 ? calcResult.totalWeight.qian + '钱' : ''} · ${calcResult.fortune.level}`"
            :share-target="resultRef"
            :filename="`chenggu-${calcResult.totalWeight.liang}-${calcResult.totalWeight.qian}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('chenggu.recalculate') }}
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
            {{ $t('chenggu.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { UserProfile, DiZhi } from '~/types/user'
import { SHICHEN_OPTIONS } from '~/types/user'

interface ChengguWeight {
  liang: number
  qian: number
  totalQian: number
}

interface ChengguBreakdown {
  year: { ganzhi: string; weight: ChengguWeight }
  month: { lunarMonth: number; weight: ChengguWeight }
  day: { lunarDay: number; weight: ChengguWeight }
  hour: { shiChen: string; weight: ChengguWeight }
}

interface ChengguFortune {
  level: string
  poem: string
  annotation: string
}

interface ChengguResult {
  totalWeight: ChengguWeight
  breakdown: ChengguBreakdown
  fortune: ChengguFortune
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean }
  solarDate: { year: number; month: number; day: number }
  gender: 'male' | 'female'
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  birthHour: undefined as string | undefined,
})
const calcResult = ref<ChengguResult | null>(null)

// 档案选择
const { profiles, defaultProfile } = useProfiles()
const localePath = useLocalePath()
const selectedProfileId = ref<string | null>(null)

const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const calendarDate = ref<CalendarDate | undefined>(undefined)

watch(calendarDate, () => {
  if (calendarDate.value) {
    form.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  } else {
    form.birthDate = ''
  }
})

const hourOptions: { label: string; value: DiZhi }[] = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.gender = profile.gender
  form.birthDate = profile.birthDate || ''
  form.birthHour = profile.birthHour
  if (form.birthDate) {
    try {
      calendarDate.value = parseDate(form.birthDate)
    } catch {
      calendarDate.value = undefined
    }
  } else {
    calendarDate.value = undefined
  }
}

onMounted(() => {
  if (defaultProfile.value && !form.birthDate) {
    selectProfile(defaultProfile.value)
  }
})

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const toast = useToast()

const canSubmit = computed(() => {
  return form.gender && form.birthDate
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<ChengguResult>('/api/tools/chenggu/calc', {
      method: 'POST',
      body: {
        birthDate: form.birthDate,
        gender: form.gender,
        birthHour: form.birthHour,
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    // 延迟启动 AI 解读
    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('chenggu.calcFail'),
      description: err.data?.message || err.message || t('chenggu.checkInput'),
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/chenggu/reading', {
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
            aiError.value = data.message || t('chenggu.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('chenggu.aiUnavailable')
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
  selectedProfileId.value = null
}

function formatWeight(w: { liang: number; qian: number }): string {
  if (w.liang === 0) return `${w.qian}钱`
  if (w.qian === 0) return `${w.liang}两`
  return `${w.liang}两${w.qian}钱`
}

function handleCopy() {
  if (!calcResult.value) return
  const b = calcResult.value.breakdown
  const text = `${t('chenggu.resultTitle')}

${t('chenggu.birthDateLabel')}：${calcResult.value.solarDate.year}-${calcResult.value.solarDate.month}-${calcResult.value.solarDate.day}
${t('chenggu.genderLabel')}：${calcResult.value.gender === 'male' ? t('common.male') : t('common.female')}

【${t('chenggu.totalWeight')}】${formatWeight(calcResult.value.totalWeight)}（${calcResult.value.fortune.level}）
【${t('chenggu.yearWeight')}】${b.year.ganzhi}年：${formatWeight(b.year.weight)}
【${t('chenggu.monthWeight')}】${b.month.lunarMonth}月：${formatWeight(b.month.weight)}
【${t('chenggu.dayWeight')}】${b.day.lunarDay}日：${formatWeight(b.day.weight)}
【${t('chenggu.hourWeight')}】${b.hour.shiChen}时：${formatWeight(b.hour.weight)}

【${t('chenggu.fortunePoem')}】
${calcResult.value.fortune.poem}

${aiContent.value ? '【' + t('chenggu.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

const fortuneLevelClass = computed(() => {
  if (!calcResult.value) return ''
  const level = calcResult.value.fortune.level
  if (level === '下下') return 'border-red-500/30 bg-red-500/10 text-red-400'
  if (level === '中下') return 'border-orange-500/30 bg-orange-500/10 text-orange-400'
  if (level === '中上') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  if (level === '上等') return 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]'
  return 'border-purple-500/30 bg-purple-500/10 text-purple-400'
})

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
      result.push({ title: titleLine || t('chenggu.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.chengguTitle')} - ${siteName}`,
  description: t('seo.chengguDesc'),
  keywords: t('seo.chengguKeywords'),
  ogTitle: () => `${t('seo.chengguOgTitle')} - ${siteName}`,
  ogDescription: t('seo.chengguOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/chenggu',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.chengguTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/chenggu',
        description: t('seo.chengguDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('chenggu.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/chenggu',
          description: t('seo.chengguOgDesc'),
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
