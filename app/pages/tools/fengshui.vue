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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Feng Shui</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('fengshui.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('fengshui.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('fengshui.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 档案快选区 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('fengshui.selectProfile') }}</label>
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
                {{ $t('fengshui.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('fengshui.goSettings') }}</NuxtLink>{{ $t('fengshui.createSuffix') }}
              </p>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshui.genderLabel') }} <span class="text-[var(--accent)]">*</span>
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
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 出生日期 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('fengshui.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('fengshui.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar v-model="calendarDate" color="warning" class="p-2" />
                </template>
              </UPopover>
            </div>

            <!-- 出生时辰 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshui.birthHourLabel') }}
              </label>
              <USelectMenu
                v-model="form.birthHour"
                :items="shichenOptions as any"
                value-key="dizhi"
                :placeholder="$t('fengshui.birthHourPlaceholder')"
                class="w-full"
                :ui="selectUi"
              />
            </div>

            <!-- 宅朝向角度 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshui.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.direction"
                  type="number"
                  :min="0"
                  :max="360"
                  :placeholder="$t('fengshui.directionPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshui.directionHint') }}
              </p>
            </div>

            <!-- 建造年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshui.buildYearLabel') }} <span class="text-[var(--text-faint)]">（{{ $t('common.optional') }}）</span>
              </label>
              <UInput
                v-model.number="form.buildYear"
                type="number"
                :min="1900"
                :max="2100"
                :placeholder="$t('fengshui.buildYearPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 入住年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshui.moveInYearLabel') }} <span class="text-[var(--text-faint)]">（{{ $t('common.optional') }}）</span>
              </label>
              <UInput
                v-model.number="form.moveInYear"
                type="number"
                :min="1900"
                :max="2100"
                :placeholder="$t('fengshui.moveInYearPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
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
              {{ $t('fengshui.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 风水知识卡片 -->
        <div class="mt-6">
          <h3 class="text-xs font-medium text-[var(--text-muted)] mb-3">{{ $t('fengshui.knowledgeTitle') }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-compass" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshui.knowledgeCard1Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.knowledgeCard1Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-home" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshui.knowledgeCard2Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.knowledgeCard2Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-star" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshui.knowledgeCard3Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.knowledgeCard3Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshui.knowledgeCard4Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ $t('fengshui.knowledgeCard4Desc') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-compass" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('fengshui.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result'" ref="resultRef">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('fengshui.resultTitle') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ directionText }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 输入信息概览 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('fengshui.inputSummary') }}
          </h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-[var(--text-muted)]">{{ $t('fengshui.genderLabel') }}</div>
            <div class="text-[var(--text-primary)]">{{ form.gender === 'male' ? $t('common.male') : $t('common.female') }}</div>
            <div class="text-[var(--text-muted)]">{{ $t('fengshui.birthDateLabel') }}</div>
            <div class="text-[var(--text-primary)]">{{ form.birthDate }}</div>
            <div class="text-[var(--text-muted)]">{{ $t('fengshui.birthHourLabel') }}</div>
            <div class="text-[var(--text-primary)]">{{ form.birthHour ? shichenMap[form.birthHour] : $t('fengshui.unknownHour') }}</div>
            <div class="text-[var(--text-muted)]">{{ $t('fengshui.directionLabel') }}</div>
            <div class="text-[var(--text-primary)]">{{ form.direction }}° — {{ directionName }}</div>
            <div v-if="form.buildYear" class="text-[var(--text-muted)]">{{ $t('fengshui.buildYearLabel') }}</div>
            <div v-if="form.buildYear" class="text-[var(--text-primary)]">{{ form.buildYear }}</div>
            <div v-if="form.moveInYear" class="text-[var(--text-muted)]">{{ $t('fengshui.moveInYearLabel') }}</div>
            <div v-if="form.moveInYear" class="text-[var(--text-primary)]">{{ form.moveInYear }}</div>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('fengshui.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('fengshui.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('fengshui.generatingInterpretation') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <!-- 固定提示 -->
          <div v-if="!aiStreaming && aiContent" class="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] px-4 py-3">
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">
              {{ $t('fengshui.disclaimer') }}
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
              {{ $t('fengshui.reinterpret') }}
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
            {{ $t('fengshui.copyResult') }}
          </UButton>
          <AppShareButton
            tool="fengshui"
            :summary="`${form.direction}°${directionName ? ' · ' + directionName : ''} · ${form.birthDate}`"
            :share-target="resultRef"
            :filename="`fengshui-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('fengshui.recalculate') }}
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
            {{ $t('fengshui.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { SHICHEN_OPTIONS } from '~/types/user'
import type { UserProfile } from '~/types/user'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const phase = ref<'form' | 'animating' | 'result'>('form')
const resultRef = ref<HTMLDivElement>()
const toast = useToast()

// 档案选择
const { profiles, defaultProfile } = useProfiles()
const selectedProfileId = ref<string | null>(null)

const form = reactive({
  gender: '' as 'male' | 'female' | '',
  birthDate: '',
  birthHour: undefined as string | undefined,
  direction: undefined as number | undefined,
  buildYear: undefined as number | undefined,
  moveInYear: undefined as number | undefined,
})

const calendarDate = ref<CalendarDate | undefined>(undefined)

watch(calendarDate, () => {
  if (calendarDate.value) {
    form.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  } else {
    form.birthDate = ''
  }
})

const tz = getLocalTimeZone()
const df = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' }))

const shichenOptions: { dizhi: DiZhi; label: string }[] = SHICHEN_OPTIONS.map(s => ({
  dizhi: s.dizhi,
  label: `${s.label} (${s.range})`,
}))

const shichenMap: Record<string, string> = Object.fromEntries(
  SHICHEN_OPTIONS.map(s => [s.dizhi, `${s.label} (${s.range})`])
)

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  if (profile.gender) form.gender = profile.gender
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

// 方向名称
const directionName = computed(() => {
  const d = form.direction ?? 0
  const names: Record<string, string[]> = {
    'zh-CN': '北 东北 东 东南 南 西南 西 西北'.split(' '),
    'zh-TW': '北 東北 東 東南 南 西南 西 西北'.split(' '),
    'en': 'N NE E SE S SW W NW'.split(' '),
  }
  const list = names[locale.value] || names['zh-CN']!
  const idx = Math.round(d / 45) % 8
  return list[idx]
})

const directionText = computed(() => {
  const parts: string[] = []
  parts.push(`${t('fengshui.directionLabel')}: ${form.direction}° (${directionName.value})`)
  if (form.buildYear) parts.push(`${t('fengshui.buildYearLabel')}: ${form.buildYear}`)
  if (form.moveInYear) parts.push(`${t('fengshui.moveInYearLabel')}: ${form.moveInYear}`)
  return parts.join(' | ')
})

const canSubmit = computed(() => {
  return form.gender && form.birthDate && form.direction !== undefined && form.direction >= 0 && form.direction <= 360
})

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  setTimeout(() => {
    phase.value = 'result'
    setTimeout(() => startAiStream(), 300)
  }, 1500)
}

async function startAiStream() {
  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/fengshui/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender: form.gender,
        birthDate: form.birthDate,
        birthHour: form.birthHour || undefined,
        direction: form.direction,
        buildYear: form.buildYear || undefined,
        moveInYear: form.moveInYear || undefined,
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
            aiError.value = data.message || t('fengshui.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('fengshui.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  selectedProfileId.value = null
  form.gender = ''
  form.birthDate = ''
  form.birthHour = undefined
  form.direction = undefined
  form.buildYear = undefined
  form.moveInYear = undefined
  calendarDate.value = undefined
}

function handleCopy() {
  const text = `${t('fengshui.resultTitle')}

${t('fengshui.genderLabel')}：${form.gender === 'male' ? t('common.male') : t('common.female')}
${t('fengshui.birthDateLabel')}：${form.birthDate}
${t('fengshui.directionLabel')}：${form.direction}° — ${directionName.value}
${form.buildYear ? t('fengshui.buildYearLabel') + '：' + form.buildYear + '\n' : ''}${form.moveInYear ? t('fengshui.moveInYearLabel') + '：' + form.moveInYear + '\n' : ''}
${aiContent.value ? '【' + t('fengshui.interpretation') + '】\n' + aiContent.value : ''}
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
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('fengshui.interpretation'), content })
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
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.fengshuiTitle')} - ${siteName}`,
  description: t('seo.fengshuiDesc'),
  keywords: t('seo.fengshuiKeywords'),
  ogTitle: () => `${t('seo.fengshuiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.fengshuiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/fengshui',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.fengshuiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/fengshui',
        description: t('seo.fengshuiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('fengshui.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/fengshui',
          description: t('seo.fengshuiOgDesc'),
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
