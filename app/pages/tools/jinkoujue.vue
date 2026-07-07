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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Jin Kou Jue</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jinkoujue.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jinkoujue.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('jinkoujue.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 起课时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('jinkoujue.timeLabel')"
              :hint="$t('jinkoujue.timeHint')"
            />

            <!-- 地分起法 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('jinkoujue.diFenMethodLabel') }}</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="m in diFenMethodOptions"
                  :key="m.value"
                  type="button"
                  class="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="form.diFenMethod === m.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.diFenMethod = m.value"
                >
                  <UIcon :name="m.icon" class="w-4 h-4" />
                  {{ m.label }}
                </button>
              </div>
            </div>

            <!-- 数字地分 -->
            <div v-if="form.diFenMethod === 'number'" class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('jinkoujue.numberLabel') }}</label>
              <input
                v-model.number="form.diFenNumber"
                type="number"
                min="1"
                max="12"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-center text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('jinkoujue.numberPlaceholder')"
              >
              <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jinkoujue.numberHint') }}</p>
            </div>

            <!-- 方位地分 -->
            <div v-if="form.diFenMethod === 'direction'" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('jinkoujue.directionLabel') }}</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="d in directionOptions"
                  :key="d.value"
                  type="button"
                  class="py-2 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="form.diFenDirection === d.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.diFenDirection = d.value"
                >
                  {{ d.label }}
                </button>
              </div>
            </div>

            <!-- 占卜事项 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('jinkoujue.questionLabel') }}
                  <span class="text-[var(--accent)] ml-0.5">*</span>
                </label>
                <QuestionInspiration @select="q => form.question = q" />
              </div>
              <textarea
                v-model="form.question"
                rows="3"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)] resize-none"
                :placeholder="$t('jinkoujue.questionPlaceholder')"
              />
            </div>

            <!-- 性别 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('jinkoujue.genderLabel') }}</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = 'male'"
                >
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
                  {{ $t('common.female') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === null
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = null"
                >
                  {{ $t('jinkoujue.genderNone') }}
                </button>
              </div>
            </div>

            <!-- 出生年份 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('jinkoujue.birthYearLabel') }}</label>
              <input
                v-model.number="form.birthYear"
                type="number"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('jinkoujue.birthYearPlaceholder')"
              >
            </div>

            <!-- 开始排盘按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-scale" class="w-5 h-5" />
              </template>
              {{ $t('jinkoujue.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinkoujue.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinkoujue.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinkoujue.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinkoujue.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinkoujue.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinkoujue.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinkoujue.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinkoujue.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：思考中动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative w-24 h-24">
          <div class="absolute inset-0 rounded-full border-2 border-[var(--accent)]/20" />
          <div class="absolute inset-0 rounded-full border-t-2 border-[var(--accent)] animate-spin" />
          <div class="absolute inset-4 rounded-full border-2 border-[var(--accent)]/10" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-scale" class="w-8 h-8 text-[var(--accent)]" />
          </div>
        </div>
        <p class="text-sm text-[var(--text-muted)] mt-6">{{ $t('jinkoujue.calculating') }}</p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('jinkoujue.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 占问信息 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinkoujue.resultQuestionLabel') }}</h3>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ result.input.question || $t('jinkoujue.noQuestion') }}</p>
          </div>

          <!-- 四柱 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinkoujue.pillarsTitle') }}</h3>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="p in pillarItems"
                :key="p.key"
                class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center"
              >
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ p.label }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ p.value }}</p>
              </div>
            </div>
          </div>

          <!-- 月将 -->
          <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-3 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-[var(--text-muted)]">{{ $t('jinkoujue.yueJiangLabel') }}</span>
              <span class="text-sm font-semibold text-[var(--accent)]">{{ result.yueJiang.name }}（{{ result.yueJiang.zhi }}）</span>
            </div>
          </div>

          <!-- 金口诀排盘 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinkoujue.chartTitle') }}</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)]">
                <span class="text-xs text-[var(--text-faint)] w-12">{{ $t('jinkoujue.renYuanLabel') }}</span>
                <span class="text-lg font-bold text-[var(--text-primary)]">{{ result.chart.renYuan }}</span>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)]">
                <span class="text-xs text-[var(--text-faint)] w-12">{{ $t('jinkoujue.guiShenLabel') }}</span>
                <span class="text-lg font-bold text-[var(--text-primary)]">{{ result.chart.guiShen }}</span>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)]">
                <span class="text-xs text-[var(--text-faint)] w-12">{{ $t('jinkoujue.jiangShenLabel') }}</span>
                <span class="text-lg font-bold text-[var(--text-primary)]">{{ result.chart.jiangShen }}</span>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl border border-[var(--accent-border-hover)] bg-[var(--accent-bg)]">
                <span class="text-xs text-[var(--accent-muted)] w-12">{{ $t('jinkoujue.diFenLabel') }}</span>
                <span class="text-lg font-bold text-[var(--accent)]">{{ result.chart.diFen }}</span>
                <span v-if="result.diFenContext" class="text-xs text-[var(--accent-muted)] ml-auto">{{ result.diFenContext.value }}</span>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('jinkoujue.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('jinkoujue.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('jinkoujue.generatingInterpretation') }}</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
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
              {{ $t('jinkoujue.reinterpret') }}
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
            {{ $t('jinkoujue.copyResult') }}
          </UButton>
          <AppShareButton
            tool="jinkoujue"
            :summary="`课体：${(result as any).keTi} · 卦象：${(result as any).guaXiang} · 地分${result.chart.diFen}`"
            :share-target="resultRef"
            :filename="`jinkoujue-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('jinkoujue.recalculate') }}
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
            {{ $t('jinkoujue.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { JinkoujueDirection, JinkoujueRequest, JinkoujueResult } from '~/types/jinkoujue'

const { t, locale } = useI18n()

const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<JinkoujueResult | null>(null)

const form = reactive<{
  diFenMethod: 'time' | 'number' | 'direction'
  diFenNumber: number
  diFenDirection: JinkoujueDirection
  question: string
  gender: 'male' | 'female' | null
  birthYear: number | null
}>({
  diFenMethod: 'time',
  diFenNumber: 1,
  diFenDirection: 'unknown',
  question: '',
  gender: null,
  birthYear: null,
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const diFenMethodOptions = computed(() => [
  { value: 'time' as const, label: t('jinkoujue.methodTime'), icon: 'i-heroicons-clock' },
  { value: 'number' as const, label: t('jinkoujue.methodNumber'), icon: 'i-heroicons-numbered-list' },
  { value: 'direction' as const, label: t('jinkoujue.methodDirection'), icon: 'i-heroicons-globe-alt' },
])

const directionOptions = computed(() => [
  { value: 'north' as const, label: t('jinkoujue.directionNorth') },
  { value: 'northeast' as const, label: t('jinkoujue.directionNortheast') },
  { value: 'east' as const, label: t('jinkoujue.directionEast') },
  { value: 'southeast' as const, label: t('jinkoujue.directionSoutheast') },
  { value: 'south' as const, label: t('jinkoujue.directionSouth') },
  { value: 'southwest' as const, label: t('jinkoujue.directionSouthwest') },
  { value: 'west' as const, label: t('jinkoujue.directionWest') },
  { value: 'northwest' as const, label: t('jinkoujue.directionNorthwest') },
  { value: 'unknown' as const, label: t('jinkoujue.directionUnknown') },
])

const canSubmit = computed(() => {
  const hasQuestion = form.question.trim().length > 0
  if (form.diFenMethod === 'number') {
    return hasQuestion && typeof form.diFenNumber === 'number' && form.diFenNumber >= 1 && form.diFenNumber <= 12
  }
  return hasQuestion
})

const pillarItems = computed(() => {
  if (!result.value) return []
  const p = result.value.pillars
  return [
    { key: 'year', label: t('jinkoujue.pillarYear'), value: `${p.year.gan}${p.year.zhi}` },
    { key: 'month', label: t('jinkoujue.pillarMonth'), value: `${p.month.gan}${p.month.zhi}` },
    { key: 'day', label: t('jinkoujue.pillarDay'), value: `${p.day.gan}${p.day.zhi}` },
    { key: 'hour', label: t('jinkoujue.pillarHour'), value: `${p.hour.gan}${p.hour.zhi}` },
  ]
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  const payload: any = {
    method: form.diFenMethod,
    question: form.question,
    gender: form.gender,
    birthYear: form.birthYear,
  }

  if (form.diFenMethod === 'time') {
    ;(payload as any).datetime = (timeCardRef.value?.iso as any).value
  } else if (form.diFenMethod === 'number') {
    ;(payload as any).number = form.diFenNumber
  } else if (form.diFenMethod === 'direction') {
    ;(payload as any).direction = form.diFenDirection
  }

  try {
    const calcResult = await $fetch<JinkoujueResult>('/api/tools/jinkoujue/calc', {
      method: 'POST',
      body: payload,
    })
    result.value = calcResult
    setTimeout(() => {
      phase.value = 'result'
      setTimeout(() => startAiStream(), 300)
    }, 2500)
  } catch (err: any) {
    phase.value = 'form'
    useToast().add({
      title: t('jinkoujue.calcFail'),
      description: err.data?.message || err.message || t('jinkoujue.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/jinkoujue/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: result.value,
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
            aiError.value = data.message || t('jinkoujue.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('jinkoujue.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  form.diFenMethod = 'time'
  form.diFenNumber = 1
  form.diFenDirection = 'unknown'
  form.question = ''
  form.gender = null
  form.birthYear = null
}

function handleCopy() {
  if (!result.value) return
  const c = result.value.chart
  const p = result.value.pillars
  const text = `${t('jinkoujue.resultTitle')}\n\n${t('jinkoujue.resultQuestionLabel')}：${result.value.input.question || t('jinkoujue.noQuestion')}\n${t('jinkoujue.pillarsTitle')}：${p.year.gan}${p.year.zhi} ${p.month.gan}${p.month.zhi} ${p.day.gan}${p.day.zhi} ${p.hour.gan}${p.hour.zhi}\n${t('jinkoujue.yueJiangLabel')}：${result.value.yueJiang.name}（${result.value.yueJiang.zhi}）\n${t('jinkoujue.chartTitle')}：人元${c.renYuan} · 贵神${c.guiShen} · 将神${c.jiangShen} · 地分${c.diFen}\n\n${aiContent.value ? t('jinkoujue.interpretation') + '：\n' + aiContent.value : ''}`
  navigator.clipboard.writeText(text).then(() => {
    useToast().add({ title: t('share.copySuccess'), color: 'success' })
  }).catch(() => {
    useToast().add({ title: t('share.copyFail'), color: 'error' })
  })
}

const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const list: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      list.push({ title: titleLine || t('jinkoujue.interpretation'), content })
    }
  }
  return list
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.jinkoujueTitle')} - ${siteName}`,
  description: t('seo.jinkoujueDesc'),
  keywords: t('seo.jinkoujueKeywords'),
  ogTitle: () => `${t('seo.jinkoujueOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jinkoujueOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/jinkoujue',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.jinkoujueTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/jinkoujue',
        description: t('seo.jinkoujueDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('jinkoujue.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/jinkoujue',
          description: t('seo.jinkoujueOgDesc'),
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
