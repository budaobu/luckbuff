<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Child Activity Interest</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('childActivityInterest.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('childActivityInterest.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('childActivityInterest.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('childActivityInterest.nameLabel') }}</label>
              <UInput
                v-model="form.name"
                :placeholder="$t('childActivityInterest.namePlaceholder')"
                color="warning"
                class="w-full"
                :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
              />
            </div>

            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('childActivityInterest.genderLabel') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
                  @click="form.gender = 'male'"
                >
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
                  @click="form.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('childActivityInterest.birthDateLabel') }}
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
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('childActivityInterest.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar v-model="calendarDate" color="warning" class="p-2" />
                </template>
              </UPopover>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('childActivityInterest.birthHourLabel') }}</label>
              <USelect
                v-model="form.birthHour"
                :items="hourOptions"
                :placeholder="$t('childActivityInterest.birthHourPlaceholder')"
                color="warning"
                class="w-full"
                :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]', placeholder: 'text-[var(--text-placeholder)]', content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl', item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]' }"
              />
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!isValid"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('childActivityInterest.submitBtn') }}
            </UButton>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-puzzle-piece" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('childActivityInterest.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('childActivityInterest.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-beaker" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('childActivityInterest.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('childActivityInterest.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('childActivityInterest.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('childActivityInterest.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('childActivityInterest.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('childActivityInterest.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-puzzle-piece" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('childActivityInterest.calculating') }}</p>
        </div>
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('childActivityInterest.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.profile.name || $t('childActivityInterest.childLabel') }} · {{ calcResult.chart.riZhu }}{{ $t('childActivityInterest.riZhuSuffix') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 主导维度 -->
          <div class="rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('childActivityInterest.dominantLabel') }}</p>
                <h2 class="text-lg font-bold text-[var(--accent)]">
                  {{ calcResult.portrait.primaryLabel }}{{ calcResult.portrait.secondaryLabel ? ` · ${calcResult.portrait.secondaryLabel}` : '' }}
                </h2>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="tag in calcResult.portrait.labels.slice(0, 5)"
                :key="tag"
                class="text-xs px-2.5 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)]"
              >
                {{ tag }}
              </span>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ calcResult.portrait.scenario }}</p>
          </div>

          <!-- 维度分数 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('childActivityInterest.dimensionLabel') }}</p>
                <h3 class="text-base font-semibold text-[var(--text-primary)]">{{ $t('childActivityInterest.dimensionTitle') }}</h3>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="dim in sortedDimensions" :key="dim.key" class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="text-[var(--text-body)]">{{ dim.label }}</span>
                  <span class="text-[var(--text-muted)]">{{ dim.score }}</span>
                </div>
                <div class="h-2 rounded-full bg-[var(--border-light)] overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-purple)] transition-all duration-1000"
                    :style="{ width: `${dim.score}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 在家观察活动 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-home" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('childActivityInterest.activityLabel') }}</p>
                <h3 class="text-base font-semibold text-[var(--text-primary)]">{{ $t('childActivityInterest.activityTitle') }}</h3>
              </div>
            </div>
            <ul class="space-y-3">
              <li
                v-for="(activity, idx) in calcResult.portrait.activities"
                :key="idx"
                class="text-sm text-[var(--text-body)] leading-relaxed flex gap-2"
              >
                <span class="text-[var(--accent)] font-medium">{{ idx + 1 }}.</span>
                <span>{{ activity }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('childActivityInterest.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('childActivityInterest.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <div v-if="aiSections.length > 0" class="space-y-3">
            <div
              v-for="(section, index) in aiSections"
              :key="section.title"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ section.title.replace(/^##\s*/, '') }}</h4>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('childActivityInterest.generatingInterpretation') }}</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
            <UButton color="warning" variant="soft" size="sm" class="group/btn" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('childActivityInterest.reinterpret') }}
            </UButton>
          </div>
        </div>

        <!-- 复访提示 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-5">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-[var(--accent-muted)] mt-0.5" />
            <div>
              <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('childActivityInterest.revisitTitle') }}</h4>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed mb-2">{{ $t('childActivityInterest.revisitDesc') }}</p>
              <UButton color="warning" variant="soft" size="xs" @click="startAiStream">
                {{ $t('childActivityInterest.revisitBtn') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="handleCopy">
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('childActivityInterest.copyResult') }}
          </UButton>
          <AppShareButton
            tool="child-activity-interest"
            :name="shareName"
            :summary="shareSummary"
            :share-target="resultRef"
            :filename="`child-activity-interest-${calcResult.profile.name || 'result'}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('childActivityInterest.recalculate') }}
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
            {{ $t('childActivityInterest.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import type { DiZhi } from '~/types/user'
import { SHICHEN_OPTIONS } from '~/types/user'
import type { ChildActivityInterestCalcResult } from '~/types/child-activity-interest'
import { getDimensionMeta, ACTIVITY_DIMENSION_ORDER } from '~/data/child-activity-interest'

interface ChildForm {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
}

const { t, locale } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive<ChildForm>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
})
const calcResult = ref<ChildActivityInterestCalcResult | null>(null)

const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const calendarDate = ref<CalendarDate | undefined>(undefined)

const hourOptions = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

watch(calendarDate, (v) => {
  form.birthDate = v ? `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}` : ''
})

const isValid = computed(() => {
  return form.gender && form.birthDate
})

const sortedDimensions = computed(() => {
  if (!calcResult.value) return []
  const effectiveLocale = locale.value === 'zh-TW' ? 'zh-TW' : locale.value === 'en' ? 'en' : 'zh-CN'
  return ACTIVITY_DIMENSION_ORDER
    .map(key => ({
      key,
      label: getDimensionMeta(key)?.labels[effectiveLocale] || getDimensionMeta(key)?.labels['zh-CN'] || key,
      score: calcResult.value!.dimensionScores[key],
    }))
    .sort((a, b) => b.score - a.score)
})

const shareName = computed(() => {
  if (!calcResult.value) return ''
  return calcResult.value.profile.name || t('childActivityInterest.childLabel')
})

const shareSummary = computed(() => {
  if (!calcResult.value) return ''
  const dims = [calcResult.value.portrait.primaryLabel, calcResult.value.portrait.secondaryLabel].filter(Boolean)
  return dims.join(' · ')
})

async function handleSubmit() {
  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<ChildActivityInterestCalcResult>('/api/tools/child-activity-interest/calc', {
      method: 'POST',
      body: {
        gender: form.gender,
        birthDate: form.birthDate,
        birthHour: form.birthHour || null,
        name: form.name || '',
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
      title: t('childActivityInterest.calcFail'),
      description: err.data?.message || err.message || t('childActivityInterest.checkInput'),
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
    const response = await fetch('/api/tools/child-activity-interest/reading', {
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
            aiError.value = data.message || t('childActivityInterest.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('childActivityInterest.aiUnavailable')
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

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('childActivityInterest.resultTitle')}

${t('childActivityInterest.childLabel')}：${calcResult.value.profile.name || t('common.unknown')}
${t('childActivityInterest.birthDateLabel')}：${calcResult.value.profile.birthDate}
${t('childActivityInterest.riZhuSuffix')}：${calcResult.value.chart.riZhu}

【${t('childActivityInterest.dominantLabel')}】
${calcResult.value.portrait.primaryLabel}${calcResult.value.portrait.secondaryLabel ? ` · ${calcResult.value.portrait.secondaryLabel}` : ''}
${calcResult.value.portrait.labels.join('、')}

${calcResult.value.portrait.scenario}

【${t('childActivityInterest.activityTitle')}】
${calcResult.value.portrait.activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}

${aiContent.value ? '【' + t('childActivityInterest.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

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
      result.push({ title: titleLine || t('childActivityInterest.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.childActivityInterestTitle')} - ${siteName}`,
  description: t('seo.childActivityInterestDesc'),
  keywords: t('seo.childActivityInterestKeywords'),
  ogTitle: () => `${t('seo.childActivityInterestOgTitle')} - ${siteName}`,
  ogDescription: t('seo.childActivityInterestOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/child-activity-interest',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.childActivityInterestTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/child-activity-interest',
        description: t('seo.childActivityInterestDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('childActivityInterest.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/child-activity-interest',
          description: t('seo.childActivityInterestOgDesc'),
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
