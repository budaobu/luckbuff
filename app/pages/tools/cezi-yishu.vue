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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Meihua Yishu Character Divination</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('ceziYishu.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('ceziYishu.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('ceziYishu.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 测字输入 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('ceziYishu.charsLabel') }}
                <span class="text-[var(--accent)] ml-0.5">*</span>
              </label>
              <input
                v-model="form.chars"
                type="text"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-center text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('ceziYishu.charsPlaceholder')"
                @input="handleCharsInput"
              >
              <p class="text-[10px] text-[var(--text-faint)]">{{ $t('ceziYishu.charsHint') }}</p>
            </div>

            <!-- 占卜事项 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('ceziYishu.questionLabel') }}
                  <span class="text-[var(--accent)] ml-0.5">*</span>
                </label>
                <QuestionInspiration @select="q => form.question = q" />
              </div>
              <textarea
                v-model="form.question"
                rows="3"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)] resize-none"
                :placeholder="$t('ceziYishu.questionPlaceholder')"
              />
            </div>

            <!-- 外应 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('ceziYishu.externalLabel') }}
                  <span class="text-[var(--accent)] ml-0.5">*</span>
                </label>
                <ExternalInspiration @select="t => form.external = t" />
              </div>
              <textarea
                v-model="form.external"
                rows="3"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)] resize-none"
                :placeholder="$t('ceziYishu.externalPlaceholder')"
              />
            </div>

            <!-- 起卦时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('ceziYishu.timeLabel')"
              :hint="$t('ceziYishu.timeHint')"
            />

            <!-- 开始测字按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-swatch" class="w-5 h-5" />
              </template>
              {{ $t('ceziYishu.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziYishu.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-swatch" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziYishu.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-eye" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziYishu.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziYishu.knowledgeCard4Desc') }}</p>
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
            <UIcon name="i-heroicons-swatch" class="w-8 h-8 text-[var(--accent)]" />
          </div>
        </div>
        <p class="text-sm text-[var(--text-muted)] mt-6">{{ $t('ceziYishu.calculating') }}</p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('ceziYishu.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 占问信息 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.resultQuestionLabel') }}</h3>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ result.input.question || $t('ceziYishu.noQuestion') }}</p>
          </div>

          <!-- 外应信息 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-eye" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.resultExternalLabel') }}</h3>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ result.input.external }}</p>
          </div>

          <!-- 拆字结果 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-pencil" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.analysisTitle') }}</h3>
            </div>

            <div class="space-y-3 mb-4">
              <div
                v-for="c in result.analysis.chars"
                :key="c.char"
                class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold text-[var(--accent)]">{{ c.char }}</span>
                  <div class="flex-1 text-xs text-[var(--text-muted)]">
                    <span>{{ c.pinyin }}</span>
                    <span class="mx-2">·</span>
                    <span>{{ c.strokes }}{{ $t('ceziYishu.strokeUnit') }}</span>
                    <span v-if="c.estimated" class="ml-2 text-[var(--accent-muted)]">（{{ $t('ceziYishu.estimated') }}）</span>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2 text-xs">
                  <div class="text-[var(--text-faint)]">
                    <span class="text-[var(--text-muted)]">{{ $t('ceziYishu.radicalLabel') }}</span> {{ c.radical }}
                  </div>
                  <div class="text-[var(--text-faint)]">
                    <span class="text-[var(--text-muted)]">{{ $t('ceziYishu.structureLabel') }}</span> {{ c.structure }}
                  </div>
                  <div class="text-[var(--text-faint)]">
                    <span class="text-[var(--text-muted)]">{{ $t('ceziYishu.wuxingLabel') }}</span> {{ c.wuxing }}
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-xl border border-[var(--accent-border-hover)] bg-[var(--accent-bg)] p-4">
              <p class="text-xs text-[var(--accent-muted)] mb-1">{{ $t('ceziYishu.totalStrokesLabel') }}</p>
              <p class="text-lg font-bold text-[var(--accent)]">
                {{ result.analysis.totalStrokes }} {{ $t('ceziYishu.strokeUnit') }}
              </p>
            </div>
          </div>

          <!-- 起卦时间 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.timeInfoTitle') }}</h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('ceziYishu.lunarYearLabel') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.time.lunar.yearGanZhi }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('ceziYishu.lunarMonthDayLabel') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.time.lunar.month }}/{{ result.time.lunar.day }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('ceziYishu.hourZhiLabel') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.time.lunar.hourZhi }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('ceziYishu.timeSumLabel') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.time.numbers.sum }}</p>
              </div>
            </div>
          </div>

          <!-- 推导过程 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-calculator" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.derivationTitle') }}</h3>
            </div>
            <div class="space-y-2 text-sm text-[var(--text-body)]">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-muted)]">{{ $t('ceziYishu.upperTrigramLabel') }}</span>
                <span class="ml-2">{{ result.derivation.upperFormula }}</span>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-muted)]">{{ $t('ceziYishu.lowerTrigramLabel') }}</span>
                <span class="ml-2">{{ result.derivation.lowerFormula }}</span>
              </div>
              <div class="rounded-xl border border-[var(--accent-border-hover)] bg-[var(--accent-bg)] p-3">
                <span class="text-[var(--accent-muted)]">{{ $t('ceziYishu.movingLineLabel') }}</span>
                <span class="ml-2 text-[var(--accent)]">{{ result.derivation.movingLineFormula }}</span>
              </div>
            </div>
          </div>

          <!-- 卦象结果 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziYishu.hexagramTitle') }}</h3>
            </div>
            <div class="text-center mb-4">
              <div class="text-5xl font-serif text-[var(--accent)] mb-2">{{ result.hexagram.symbol }}</div>
              <p class="text-lg font-semibold text-[var(--text-primary)]">{{ result.hexagram.name }}</p>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('ceziYishu.upperTrigramName') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.upper.symbol }}</p>
                <p class="text-xs text-[var(--text-muted)]">{{ result.hexagram.upper.name }}（{{ result.hexagram.upper.nature }}）</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('ceziYishu.lowerTrigramName') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.lower.symbol }}</p>
                <p class="text-xs text-[var(--text-muted)]">{{ result.hexagram.lower.name }}（{{ result.hexagram.lower.nature }}）</p>
              </div>
              <div class="rounded-xl border border-[var(--accent-border-hover)] bg-[var(--accent-bg)] p-3 text-center">
                <p class="text-[10px] text-[var(--accent-muted)] mb-1">{{ $t('ceziYishu.movingLineName') }}</p>
                <p class="text-lg font-bold text-[var(--accent)]">{{ result.hexagram.movingLine }}</p>
                <p class="text-xs text-[var(--accent-muted)]">{{ $t('ceziYishu.movingLineUnit') }}</p>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('ceziYishu.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('ceziYishu.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('ceziYishu.generatingInterpretation') }}</p>
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
              {{ $t('ceziYishu.reinterpret') }}
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
            {{ $t('ceziYishu.copyResult') }}
          </UButton>
          <AppShareButton
            tool="cezi-yishu"
            :summary="`${result.input.question ? '问：' + result.input.question + ' · ' : ''}字：${result.analysis.chars.map(c => c.char).join('')} · 总笔画 ${result.analysis.totalStrokes}`"
            :share-target="resultRef"
            :filename="`cezi-yishu-${result.analysis.totalStrokes}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('ceziYishu.recalculate') }}
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
            {{ $t('ceziYishu.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { CeziYishuRequest, CeziYishuResult } from '~/types/cezi-yishu'

const { t, locale } = useI18n()

const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<CeziYishuResult | null>(null)

const form = reactive<{
  chars: string
  question: string
  external: string
}>({
  chars: '',
  question: '',
  external: '',
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

function isChineseChar(char: string) {
  if (!char || char.length !== 1) return false
  const cp = char.codePointAt(0) || 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

function handleCharsInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  const chars = Array.from(value).filter(isChineseChar)
  form.chars = chars.join('')
}

const canSubmit = computed(() => {
  return form.chars.length > 0 && form.question.trim().length > 0 && form.external.trim().length > 0
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  const payload: CeziYishuRequest = {
    chars: form.chars,
    question: form.question,
    external: form.external,
    datetime: (timeCardRef.value?.iso as any).value,
  }

  try {
    const calcResult = await $fetch<CeziYishuResult>('/api/tools/cezi-yishu/calc', {
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
      title: t('ceziYishu.calcFail'),
      description: err.data?.message || err.message || t('ceziYishu.checkInput'),
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
    const response = await fetch('/api/tools/cezi-yishu/reading', {
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
            aiError.value = data.message || t('ceziYishu.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('ceziYishu.aiUnavailable')
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
  form.chars = ''
  form.question = ''
  form.external = ''
}

function handleCopy() {
  if (!result.value) return
  const a = result.value.analysis
  const h = result.value.hexagram
  const text = `${t('ceziYishu.resultTitle')}\n\n${t('ceziYishu.resultQuestionLabel')}：${result.value.input.question || t('ceziYishu.noQuestion')}\n${t('ceziYishu.resultExternalLabel')}：${result.value.input.external}\n${t('ceziYishu.analysisTitle')}：${result.value.input.chars}（${a.totalStrokes} 画）\n${t('ceziYishu.hexagramTitle')}：${h.name} ${h.symbol}，${t('ceziYishu.movingLineLabel')}${h.movingLine}${t('ceziYishu.movingLineUnit')}\n\n${aiContent.value ? t('ceziYishu.interpretation') + '：\n' + aiContent.value : ''}`
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
      list.push({ title: titleLine || t('ceziYishu.interpretation'), content })
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
  title: () => `${t('seo.ceziYishuTitle')} - ${siteName}`,
  description: t('seo.ceziYishuDesc'),
  keywords: t('seo.ceziYishuKeywords'),
  ogTitle: () => `${t('seo.ceziYishuOgTitle')} - ${siteName}`,
  ogDescription: t('seo.ceziYishuOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/cezi-yishu',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.ceziYishuTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/cezi-yishu',
        description: t('seo.ceziYishuDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('ceziYishu.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/cezi-yishu',
          description: t('seo.ceziYishuOgDesc'),
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
