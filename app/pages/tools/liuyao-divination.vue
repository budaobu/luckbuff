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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Liu Yao Divination</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liuyaoDivination.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liuyaoDivination.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 问事内容卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-4">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('liuyaoDivination.questionLabel') }}</label>
                <QuestionInspiration @select="q => question = q" />
              </div>
              <UTextarea
                v-model="question"
                :placeholder="$t('liuyaoDivination.questionPlaceholder')"
                :rows="2"
                autoresize
                class="w-full"
                :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
              />
            </div>
            <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('liuyaoDivination.questionHint') }}</p>
          </div>
        </div>

        <!-- 起卦时间 -->
        <DivinationTimeCard
          ref="timeCardRef"
          :label="$t('liuyaoDivination.castTime')"
          :hint="$t('liuyaoDivination.castTimeHint')"
          class="mb-5"
        />

        <!-- 摇卦工作台 -->
        <LiuyaoTossWorkbench
          ref="tossWorkbenchRef"
          class="mb-5"
          @update="handleLineValuesUpdate"
        />

        <!-- 起卦按钮 -->
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
          {{ $t('liuyaoDivination.castingBtn') }}
        </UButton>

        <p v-if="!canSubmit" class="text-center text-[10px] text-[var(--text-placeholder)] mt-2">
          {{ submitHint }}
        </p>

        <!-- 错误卡片 -->
        <div
          v-if="errorInfo"
          class="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-red-400" />
            <span class="text-sm font-semibold text-red-400">{{ $t('liuyaoDivination.errorTitle') }}</span>
          </div>
          <p class="text-xs text-[var(--text-muted)]">{{ errorInfo.message }}</p>
          <p class="text-[10px] text-[var(--text-placeholder)] mt-1 font-mono">code: {{ errorInfo.code }}</p>
        </div>

        <!-- 免责声明 -->
        <p class="text-center text-[10px] text-[var(--text-placeholder)] mt-6 leading-relaxed">
          {{ $t('liuyaoDivination.disclaimer') }}
        </p>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoDivination.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoDivination.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-circle-stack" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoDivination.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoDivination.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoDivination.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoDivination.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoDivination.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoDivination.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <LiuyaoCoinSpin size="full" :label="$t('liuyaoDivination.calculating')" />
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div ref="shareTargetRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('liuyaoDivination.resultTitle') }}
            </h1>
            <p v-if="question" class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('liuyaoDivination.questionPrefix') }}：{{ question }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 时空信息 -->
          <div v-if="result.temporal_context" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('liuyaoDivination.temporalParams') }}
            </h3>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoDivination.yueJian') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ result.temporal_context.月建 }}</span>
              </div>
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoDivination.riChen') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ result.temporal_context.日辰 }}</span>
              </div>
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoDivination.shiChen') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ result.temporal_context.时辰 }}</span>
              </div>
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoDivination.xunKong') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ result.temporal_context.旬空 }}</span>
              </div>
            </div>
          </div>

          <!-- 卦象信息 -->
          <div v-if="result.hexagram" class="grid grid-cols-3 gap-3 mb-5">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoDivination.benGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.本卦 }}</p>
              <p class="text-[10px] text-[var(--accent-muted)] mt-1">{{ $t('liuyaoDivination.shiYing', { shi: result.hexagram.世爻位, ying: result.hexagram.应爻位 }) }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoDivination.bianGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.变卦 }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoDivination.huGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.互卦 }}</p>
            </div>
          </div>

          <!-- 爻象展示 -->
          <div v-if="result.lines_top_down" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('liuyaoDivination.chartTitle') }}</h3>
            <div class="space-y-1.5">
              <div
                v-for="(line, index) in result.lines_top_down"
                :key="index"
                class="flex items-center gap-3 rounded-xl border px-3 py-2"
                :class="line.isMoving ? 'border-l-2 border-l-[#c9a227]/40 bg-[var(--surface-card)]' : 'border-[var(--border-light)] bg-[var(--surface-card)]'"
              >
                <span class="text-[10px] text-[var(--text-placeholder)] w-8 text-center">{{ line.label }}</span>
                <!-- 铜钱可视化 -->
                <div class="flex-1 flex items-center justify-center">
                  <div class="flex items-center gap-1.5">
                    <LiuyaoCopperCoin
                      v-for="(coin, ci) in inferCoins(line.value)"
                      :key="ci"
                      :is-back="coin.isBack"
                      :size="30"
                    />
                    <span class="text-xs text-[var(--text-placeholder)] ml-1">={{ line.value }}</span>
                  </div>
                </div>
                <span class="text-sm font-bold w-8 text-center" :class="line.isMoving ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'">
                  {{ line.value }}
                </span>
                <span v-if="line.isMoving" class="text-[10px] text-[var(--accent-muted)]">
                  {{ line.value === 6 ? '○' : '●' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 断语 -->
        <div ref="aiInterpretationRef" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <LiuyaoGeneralAiInterpret
            :content="aiContent"
            :streaming="aiStreaming"
            :started="aiStarted"
            :error="aiError"
          />

          <!-- 重新解读按钮 -->
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
              {{ $t('liuyaoDivination.reinterpretBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleShare"
          >
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoDivination.shareBtn') }}
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoDivination.restartBtn') }}
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
            {{ $t('liuyaoDivination.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- ============ 时空拦截弹窗 ============ -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showTimeGuard"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="dismissTimeGuard"
        >
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoDivination.timeGuardTitle') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                class="text-[var(--text-placeholder)] hover:text-[var(--text-muted)]"
                @click="dismissTimeGuard"
              />
            </div>
            <div class="p-5 space-y-4">
              <p class="text-sm text-[var(--text-muted)] leading-relaxed" v-html="unescapeHtml($t('liuyaoDivination.timeGuardDesc'))" />

              <!-- 城市未识别的错误提示 -->
              <div v-if="cityNotRecognized" class="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p class="text-xs text-red-400/90 leading-relaxed">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  {{ cityNotRecognized }}
                </p>
              </div>

              <div class="space-y-3">
                <UButton
                  color="warning"
                  variant="soft"
                  block
                  :loading="geo.loading"
                  @click="requestGeoAndSubmit"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                  </template>
                  {{ geo.loading ? $t('liuyaoDivination.gettingLocation') : $t('liuyaoDivination.getLocation') }}
                </UButton>

                <!-- 定位失败时提示手动输入 -->
                <p v-if="geoError" class="text-xs text-[var(--text-faint)] -mt-1 text-center">
                  {{ $t('liuyaoDivination.locationUnavailable') }} ↓
                </p>

                <div class="flex items-center gap-2">
                  <div class="flex-1 h-px bg-[var(--surface-card-hover)]" />
                  <span class="text-[10px] text-[var(--text-placeholder)]">{{ $t('liuyaoDivination.or') }}</span>
                  <div class="flex-1 h-px bg-[var(--surface-card-hover)]" />
                </div>

                <div class="flex gap-2">
                  <UInput
                    ref="cityInputRef"
                    v-model="manualCity"
                    :placeholder="$t('liuyaoDivination.cityInputPlaceholder')"
                    class="flex-1"
                    @keyup.enter="submitWithCity"
                    :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
                  />
                  <UButton
                    color="warning"
                    variant="soft"
                    :disabled="!manualCity.trim()"
                    :loading="citySubmitting"
                    @click="submitWithCity"
                  >
                    {{ $t('liuyaoDivination.confirm') }}
                  </UButton>
                </div>
              </div>

              <p v-if="geo.error && !geoError" class="text-xs text-red-400/70">
                {{ geo.error }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoDivination.shareTitle') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
                @click="() => { shareDialogOpen = false }"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('liuyaoDivination.shareTextLabel') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('liuyaoDivination.copyTextBtn') }}
                </UButton>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('liuyaoDivination.shareScreenshotLabel') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('liuyaoDivination.screenshotAlt')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('liuyaoDivination.downloadImageBtn') }}
                </UButton>
              </div>
              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('liuyaoDivination.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>
            <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('liuyaoDivination.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { LineValue, LiuYaoResult } from '~/types/liuyao'

const { t } = useI18n()
const { locale } = useI18n()

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

// ============================================================
// 状态
// ============================================================
const phase = ref<'form' | 'animating' | 'result'>('form')

const question = ref('')
const lineValues = ref<LineValue[]>([])
const tossWorkbenchRef = ref()

const timeCardRef = ref<{ date: Ref<Date>; iso: Ref<string> } | null>(null)

const { location: geo, requestLocation, setCity } = useGeolocation()
const showTimeGuard = ref(false)
const manualCity = ref('')
const pendingSubmit = ref(false)
const cityNotRecognized = ref('')
const citySubmitting = ref(false)
const geoError = ref(false)
const cityInputRef = ref()

// 排盘结果
const result = ref<LiuYaoResult | null>(null)
const errorInfo = ref<{ code: string; message: string } | null>(null)
const toast = useToast()

// 分享
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLDivElement>()
const aiInterpretationRef = ref<HTMLDivElement>()

// ============================================================
// 计算属性
// ============================================================
const canSubmit = computed(() => {
  return question.value.trim().length > 0 && lineValues.value.length === 6
})

const submitHint = computed(() => {
  if (!question.value.trim()) return t('liuyaoDivination.needQuestion')
  if (lineValues.value.length < 6) return t('liuyaoDivination.needMoreTosses', { n: 6 - lineValues.value.length })
  return ''
})

// ============================================================
// 子时边界检测
// ============================================================
function isZiHourBoundary(date: Date = new Date()): boolean {
  const h = date.getHours()
  const m = date.getMinutes()
  const totalMinutes = h * 60 + m
  return totalMinutes >= 1350 || totalMinutes <= 90
}

function hasLocation(): boolean {
  return !!(geo.longitude && geo.latitude) || !!geo.city
}

// ============================================================
// 事件处理
// ============================================================
function handleLineValuesUpdate(values: LineValue[]) {
  lineValues.value = values
}

async function handleSubmit() {
  if (!canSubmit.value) return

  const castDate = (timeCardRef.value?.date as any).value || new Date()

  if (isZiHourBoundary(castDate) && !hasLocation()) {
    showTimeGuard.value = true
    pendingSubmit.value = true
    return
  }

  await doPredict(castDate)
}

async function requestGeoAndSubmit() {
  geoError.value = false
  const ok = await requestLocation()
  if (ok && pendingSubmit.value) {
    showTimeGuard.value = false
    await doPredict()
  } else if (!ok) {
    geoError.value = true
    nextTick(() => {
      cityInputRef.value?.$el?.querySelector('input')?.focus()
    })
  }
}

async function submitWithCity() {
  if (!manualCity.value.trim()) return
  citySubmitting.value = true
  cityNotRecognized.value = ''

  setCity(manualCity.value.trim())

  showTimeGuard.value = false
  if (pendingSubmit.value) {
    await doPredict()
  }
  citySubmitting.value = false
}

function dismissTimeGuard() {
  showTimeGuard.value = false
  pendingSubmit.value = false
  cityNotRecognized.value = ''
}

async function doPredict(castDate?: Date) {
  phase.value = 'animating'
  errorInfo.value = null

  const date = castDate || (timeCardRef.value?.date as any).value || new Date()

  try {
    const payload = {
      line_values: lineValues.value,
      cast_datetime: date.toISOString(),
      location: geo.longitude ? {
        longitude: geo.longitude,
        latitude: geo.latitude,
        timezone: geo.timezone,
        city: geo.city,
      } : {
        city: geo.city || undefined,
        timezone: geo.timezone,
      },
      question: question.value.trim(),
    }

    const chartResult = await $fetch<LiuYaoResult>('/api/liuyao-divination/chart', {
      method: 'POST',
      body: payload,
    })

    result.value = chartResult

    if (chartResult.status === 'ok') {
      phase.value = 'result'
      setTimeout(() => startAiStream(), 300)
    } else if (chartResult.status === 'system_pause') {
      phase.value = 'form'
      if (chartResult.error_code === 'CITY_NOT_RECOGNIZED') {
        showTimeGuard.value = true
        cityNotRecognized.value = (chartResult as any).message || t('liuyaoDivination.cityNotRecognizedMsg')
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoDivination.cityNotRecognized'),
          description: (chartResult as any).message || t('liuyaoDivination.cityNotRecognizedDesc'),
          color: 'warning',
        })
      } else {
        showTimeGuard.value = true
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoDivination.timeGuardIntercept'),
          description: chartResult.error_code || t('liuyaoDivination.timeGuardInterceptDesc'),
          color: 'warning',
        })
      }
    } else if (chartResult.status === 'fatal_error') {
      phase.value = 'form'
      errorInfo.value = {
        code: chartResult.error_code || 'UNKNOWN',
        message: t('liuyaoDivination.physicalBlowoutMsg'),
      }
      toast.add({
        title: t('liuyaoDivination.chartFailMsg'),
        description: chartResult.error_code || t('liuyaoDivination.unknownErrorMsg'),
        color: 'error',
      })
    }
  } catch (err: any) {
    phase.value = 'form'
    errorInfo.value = {
      code: err.data?.error_code || 'NETWORK_ERROR',
      message: err.data?.message || err.message || t('liuyaoDivination.requestFailMsg'),
    }
    toast.add({
      title: t('liuyaoDivination.requestFailMsg'),
      description: errorInfo.value.message,
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/liuyao-divination/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: result.value,
        question: question.value.trim(),
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
            aiError.value = (data as any).message || t('liuyaoDivination.aiRequestFailed')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('liuyaoDivination.aiRequestFailed')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  question.value = ''
  lineValues.value = []
  result.value = null
  errorInfo.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  tossWorkbenchRef.value?.reset()
  pendingSubmit.value = false
  manualCity.value = ''
}

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()

  const hex = result.value.hexagram
  const hexSummary = hex
    ? hex.本卦 === hex.变卦
      ? hex.本卦
      : `${hex.本卦}变${hex.变卦}`
    : ''

  const summary = `${t('liuyaoDivination.sharePrefix')}${question.value ? '「' + question.value + '」' : ''}${hexSummary ? '，' + hexSummary : ''}`

  try {
    const target = (aiContent.value && aiInterpretationRef.value)
      ? aiInterpretationRef.value
      : shareTargetRef.value

    const shareResult = await share({
      tool: 'liuyao-divination',
      name: '',
      summary,
      shareTarget: target,
      filename: `liuyao-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = shareResult
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('liuyaoDivination.shareFailMsg'),
      description: e?.message || t('liuyaoDivination.shareErrorMsg'),
      color: 'error',
    })
  }
}

async function copyShareText() {
  if (!shareData.value?.copyText) return
  try {
    await navigator.clipboard.writeText(shareData.value.copyText)
    toast.add({ title: t('liuyaoDivination.copySuccessMsg'), color: 'success' })
  } catch {
    toast.add({ title: t('liuyaoDivination.copyFailMsg'), color: 'error' })
  }
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const link = document.createElement('a')
  link.href = shareData.value.screenshotDataUrl
  link.download = shareData.value.filename
  link.click()
}

function unescapeHtml(str: string): string {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

// 根据爻值推断 3 枚铜钱正反面
function inferCoins(value: number): Array<{ isBack: boolean }> {
  switch (value) {
    case 6: return [{ isBack: false }, { isBack: false }, { isBack: false }]
    case 7: return [{ isBack: false }, { isBack: false }, { isBack: true }]
    case 8: return [{ isBack: false }, { isBack: true }, { isBack: true }]
    case 9: return [{ isBack: true }, { isBack: true }, { isBack: true }]
    default: return [{ isBack: false }, { isBack: false }, { isBack: false }]
  }
}

// ============================================================
// SEO
// ============================================================
const pageDescription = computed(() => {
  if (phase.value === 'result' && result.value?.hexagram) {
    return t('liuyaoDivination.shareText', {
      question: question.value,
      benGua: result.value.hexagram.本卦,
      bianGua: result.value.hexagram.变卦,
    })
  }
  return t('liuyaoDivination.shareTextDefault')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.liuyaoDivinationTitle')} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.liuyaoDivinationKeywords'),
  ogTitle: () => `${t('seo.liuyaoDivinationOgTitle')} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liuyao-divination',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.liuyaoDivinationTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liuyao-divination',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('home.toolLiuyaoDivinationTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liuyao-divination',
          description: t('home.toolLiuyaoDivinationDesc'),
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
