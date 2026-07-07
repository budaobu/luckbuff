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
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Da Liu Ren Seeking</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liurenSeeking.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liurenSeeking.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('liuren.disclaimer') }}
          </p>
        </div>

        <!-- 寻物表单 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 起课时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('liurenSeeking.form.castTime')"
              :hint="$t('liurenSeeking.form.castTimeHint')"
              required
            />

            <!-- 出生年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('liuren.form.birthYear') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="birthYearInput"
                type="number"
                :placeholder="$t('liuren.form.birthYearPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('liuren.form.birthYearHint') }}
              </p>
            </div>

            <!-- 地点 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('liuren.form.location') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.location"
                :placeholder="$t('liuren.form.locationPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="mt-1.5 text-[11px] text-[var(--text-placeholder)] leading-relaxed">
                {{ $t('liuren.form.locationHint') }}
              </p>
            </div>

            <!-- 具体描述 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm text-[var(--text-muted)]">{{ $t('liurenSeeking.form.description') }}</label>
                <QuestionInspiration
                  :extra-categories="seekingExtraCategories"
                  @select="q => form.description = q"
                />
              </div>
              <UTextarea
                v-model="form.description"
                :placeholder="$t('liurenSeeking.form.descriptionPlaceholder')"
                class="w-full"
                :ui="inputUi"
                :rows="2"
              />
            </div>

            <!-- 最后见到时间 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liurenSeeking.form.lastSeenTime') }}</label>
              <UInput
                v-model="form.lastSeenTime"
                :placeholder="$t('liurenSeeking.form.lastSeenTimePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 最后见到地点 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liurenSeeking.form.lastSeenPlace') }}</label>
              <UInput
                v-model="form.lastSeenPlace"
                :placeholder="$t('liurenSeeking.form.lastSeenPlacePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 失物描述 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liurenSeeking.form.lostItemDesc') }}</label>
              <UInput
                v-model="form.lostItemDesc"
                :placeholder="$t('liurenSeeking.form.lostItemDescPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 与失物关系 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liurenSeeking.form.relationship') }}</label>
              <UInput
                v-model="form.relationship"
                :placeholder="$t('liurenSeeking.form.relationshipPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 提交按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-radar" class="w-5 h-5" />
              </template>
              {{ $t('liurenSeeking.form.submitBtn') }}
            </UButton>

            <p v-if="!canSubmit" class="text-center text-[10px] text-[var(--text-placeholder)] -mt-3">
              {{ submitHint }}
            </p>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liurenSeeking.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liurenSeeking.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liurenSeeking.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liurenSeeking.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liurenSeeking.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liurenSeeking.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liurenSeeking.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liurenSeeking.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 寻物指南 -->
        <div class="mt-10">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent)]" />
            <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liurenSeeking.tipsTitle') }}</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(tip, idx) in tips"
              :key="idx"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]/30"
            >
              <div class="flex items-start gap-3">
                <span class="text-xl leading-none select-none">{{ tip.icon }}</span>
                <div>
                  <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ tip.title }}</h4>
                  <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ tip.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：雷达探测动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative flex items-center justify-center" style="width: 260px; height: 260px;">
          <!-- 背景光晕 -->
          <div class="absolute rounded-full bg-[var(--accent-faint)]" style="width: 300px; height: 300px; filter: blur(24px);" />

          <!-- 最外层虚线环 -->
          <div class="absolute rounded-full border border-dashed border-[var(--accent-faint)] outer-dashed-ring" style="width: 260px; height: 260px;" />

          <!-- 外层实线环 -->
          <div class="absolute rounded-full border border-[var(--accent-faint)] outer-solid-ring" style="width: 240px; height: 240px;" />

          <!-- 雷达扫描扇形 -->
          <div class="absolute rounded-full overflow-hidden" style="width: 200px; height: 200px; border: 1px solid var(--accent-border);">
            <div class="radar-sweep" />
          </div>

          <!-- 内圈细环 -->
          <div class="absolute rounded-full border border-[var(--accent-faint)] inner-ring" style="width: 100px; height: 100px;" />

          <!-- 中心定位点 -->
          <div
            class="absolute rounded-full flex items-center justify-center center-pulse"
            style="width: 48px; height: 48px; border: 2px solid var(--accent-border); background: radial-gradient(circle at 35% 35%, rgba(201,162,39,0.25), rgba(139,92,246,0.1));"
          >
            <UIcon name="i-heroicons-radar" class="w-5 h-5 text-[var(--accent)]" />
          </div>

          <!-- 九宫方位标记 -->
          <div
            v-for="(dir, i) in directions"
            :key="dir"
            class="absolute text-[10px] text-[var(--accent-muted)] radar-dot"
            :style="{
              left: `calc(50% + ${Math.cos((i * 45 - 90) * Math.PI / 180) * 50}% - 8px)`,
              top: `calc(50% + ${Math.sin((i * 45 - 90) * Math.PI / 180) * 50}% - 6px)`,
            }"
          >
            {{ dir }}
          </div>
        </div>
        <p class="text-[var(--accent)] tracking-wider font-medium mt-5 text-sm">
          {{ $t('liurenSeeking.scanning') }}
        </p>
        <p class="text-xs text-[var(--text-faint)] mt-2">
          {{ $t('liurenSeeking.scanningSub') }}
        </p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && chart">
        <div ref="shareTargetRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Seeking Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('liurenSeeking.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 寻物信息摘要 -->
          <div v-if="formSummary" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-4">
            <div class="text-sm text-[var(--text-body)] space-y-1">
              <div v-if="formSummary.description"><span class="text-[var(--text-faint)]">问事：</span>{{ formSummary.description }}</div>
              <div v-if="formSummary.lastSeenTime"><span class="text-[var(--text-faint)]">最后见到：</span>{{ formSummary.lastSeenTime }}</div>
              <div v-if="formSummary.lastSeenPlace"><span class="text-[var(--text-faint)]">最后地点：</span>{{ formSummary.lastSeenPlace }}</div>
              <div v-if="formSummary.lostItemDesc"><span class="text-[var(--text-faint)]">失物：</span>{{ formSummary.lostItemDesc }}</div>
              <div v-if="formSummary.relationship"><span class="text-[var(--text-faint)]">关系：</span>{{ formSummary.relationship }}</div>
            </div>
          </div>

          <!-- 四柱数据卡片 -->
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="item in ganzhiCards"
              :key="item.label"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center"
            >
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ item.label }}</div>
              <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ item.value }}</div>
            </div>
          </div>

          <!-- 月将占时年命 -->
          <div class="grid grid-cols-3 gap-2 mt-2">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('liuren.result.yuejiang') }}</div>
              <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ chart.calendar.yuejiang }}</div>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('liuren.result.shichen') }}</div>
              <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ chart.calendar.shichen }}</div>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('liuren.result.birthYear') }}</div>
              <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ chart.calendar.birthYearBranch }}</div>
            </div>
          </div>
        </div>

        <!-- ===== AI 解读 ===== -->
        <div class="mt-5">
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ $t('liurenSeeking.interpretTitle') }}</h3>
            </div>

            <!-- 等待首个 token -->
            <div v-if="!interpretStarted && !interpretError" class="flex flex-col items-center py-8">
              <TianganDizhi size="compact" :label="$t('liuren.result.aiAnalyzing')" />
            </div>

            <!-- 错误状态 -->
            <div v-else-if="interpretError" class="text-center py-6">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p class="text-sm text-red-400">{{ interpretError }}</p>
              <UButton color="warning" variant="soft" size="sm" class="mt-3" @click="startInterpretStream">
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                </template>
                {{ $t('common.retry') }}
              </UButton>
            </div>

            <!-- 流式内容 -->
            <div v-else class="space-y-4">
              <div
                class="text-sm text-[var(--text-body)] leading-relaxed ai-content max-w-none"
                v-html="renderedContent"
              />
              <!-- 光标 -->
              <div v-if="interpretStreaming" class="flex items-center gap-1">
                <span class="w-0.5 h-4 bg-[var(--accent)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="handleShare">
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('common.shareResult') }}
          </UButton>
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { navigateTo(localePath('/seeking')) }">
            <template #leading>
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
            </template>
            {{ $t('liurenSeeking.backToSeeking') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="shareDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="shareDialogOpen = false">
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('common.share') }}</h3>
              </div>
              <UButton color="neutral" variant="ghost" class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { shareDialogOpen = false }">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('common.copy') }}
                </UButton>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.shareScreenshot') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" class="w-full rounded-lg" />
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('common.download') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { LiurenChartResponse } from '~/types/liuren'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const chart = ref<LiurenChartResponse | null>(null)
const lastFormValues = ref<any>(null)

// AI 解读状态
const interpretContent = ref('')
const interpretStreaming = ref(false)
const interpretStarted = ref(false)
const interpretError = ref<string | null>(null)

// 分享
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLDivElement>()

const form = reactive({
  description: '',
  lastSeenTime: '',
  lastSeenPlace: '',
  lostItemDesc: '',
  relationship: '',
  location: '',
})

const birthYearInput = ref('')

const timeCardRef = ref<{ timezone: Ref<string>; iso: Ref<string> } | null>(null)

const canSubmit = computed(() => {
  const by = parseInt(birthYearInput.value, 10)
  return !isNaN(by) && by >= 1900 && by <= 2100 && !!form.location.trim()
})

const submitHint = computed(() => {
  const by = parseInt(birthYearInput.value, 10)
  if (isNaN(by) || by < 1900 || by > 2100) return t('liuren.form.validation.birthYearRequired')
  if (!form.location.trim()) return t('liuren.form.validation.locationRequired')
  return ''
})

const formSummary = computed(() => {
  if (phase.value !== 'result') return null
  const s: Record<string, string> = {}
  if (form.description) s.description = form.description
  if (form.lastSeenTime) s.lastSeenTime = form.lastSeenTime
  if (form.lastSeenPlace) s.lastSeenPlace = form.lastSeenPlace
  if (form.lostItemDesc) s.lostItemDesc = form.lostItemDesc
  if (form.relationship) s.relationship = form.relationship
  return Object.keys(s).length > 0 ? s : null
})

const ganzhiCards = computed(() => {
  if (!chart.value?.calendar) return []
  const g = chart.value.calendar.ganzhi
  return [
    { label: t('qimen.ganzhi.yearLabel') || '年柱', value: g.year },
    { label: t('qimen.ganzhi.monthLabel') || '月柱', value: g.month },
    { label: t('qimen.ganzhi.dayLabel') || '日柱', value: g.day },
    { label: t('qimen.ganzhi.timeLabel') || '时柱', value: g.hour },
  ]
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  chart.value = null
  interpretContent.value = ''
  interpretStarted.value = false
  interpretError.value = null

  const payload = {
    question: t('liurenSeeking.defaultQuestion', { item: form.lostItemDesc || t('liurenSeeking.unknownItem') }),
    birthYear: parseInt(birthYearInput.value, 10),
    location: form.location.trim(),
    timezone: (timeCardRef.value?.timezone as any).value || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
    datetime: (timeCardRef.value?.iso as any).value,
    seekingContext: {
      description: form.description.trim(),
      lastSeenTime: form.lastSeenTime.trim(),
      lastSeenPlace: form.lastSeenPlace.trim(),
      lostItemDesc: form.lostItemDesc.trim(),
      relationship: form.relationship.trim(),
    },
  }

  lastFormValues.value = { ...payload }

  try {
    const result = await $fetch<LiurenChartResponse>('/api/tools/liuren-seeking/chart', {
      method: 'POST',
      body: payload,
    })
    chart.value = result
    phase.value = 'result'
    setTimeout(() => startInterpretStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('liuren.error.chartFail'),
      description: err.data?.statusMessage || err.message || t('liuren.error.unknown'),
      color: 'error',
    })
  }
}

async function startInterpretStream() {
  if (!chart.value || !lastFormValues.value) return
  interpretContent.value = ''
  interpretStreaming.value = true
  interpretStarted.value = false
  interpretError.value = null

  try {
    const response = await fetch('/api/tools/liuren-seeking/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: lastFormValues.value,
        chartJson: chart.value,
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
            if (!interpretStarted.value) interpretStarted.value = true
            interpretContent.value += data.text
          } else if (data.type === 'error') {
            interpretError.value = data.message || t('liuren.error.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    interpretError.value = e?.message || t('liuren.error.aiUnavailable')
  } finally {
    interpretStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  chart.value = null
  interpretContent.value = ''
  interpretStarted.value = false
  interpretError.value = null
  birthYearInput.value = ''
  form.description = ''
  form.lastSeenTime = ''
  form.lastSeenPlace = ''
  form.lostItemDesc = ''
  form.relationship = ''
  form.location = ''
}

const renderedContent = computed(() => {
  if (!interpretContent.value) return ''
  try {
    return marked.parse(interpretContent.value, { async: false }) as string
  } catch {
    return interpretContent.value
  }
})

async function handleShare() {
  if (!chart.value) return
  const { share } = useShare()

  try {
    const summary = `${chart.value.calendar.ganzhi.day}日${chart.value.calendar.ganzhi.hour}时 · ${chart.value.calendar.yuejiang}加${chart.value.calendar.shichen}`
    const result = await share({
      tool: 'liuren-seeking',
      name: form.lostItemDesc?.slice(0, 20) || '',
      summary,
      shareTarget: shareTargetRef.value,
      filename: `liuren-seeking-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.shareFail'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

async function copyShareText() {
  if (!shareData.value?.copyText) return
  try {
    await navigator.clipboard.writeText(shareData.value.copyText)
    toast.add({ title: t('share.copySuccess'), color: 'success' })
  } catch {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  }
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const link = document.createElement('a')
  link.href = shareData.value.screenshotDataUrl
  link.download = shareData.value.filename
  link.click()
}

// 提示与问题灵感
const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

const tips = computed(() => [
  { icon: '🧭', title: t('liurenSeeking.tips.direction.title'), content: t('liurenSeeking.tips.direction.content') },
  { icon: '🔍', title: t('liurenSeeking.tips.probability.title'), content: t('liurenSeeking.tips.probability.content') },
  { icon: '⏰', title: t('liurenSeeking.tips.timing.title'), content: t('liurenSeeking.tips.timing.content') },
  { icon: '📍', title: t('liurenSeeking.tips.location.title'), content: t('liurenSeeking.tips.location.content') },
])

const seekingExtraCategories = [
  {
    key: 'seeking',
    groups: [
      {
        key: 'seekingDirection',
        questions: ['seekingDirection1', 'seekingDirection2', 'seekingDirection3', 'seekingDirection4', 'seekingDirection5', 'seekingDirection6'],
      },
      {
        key: 'seekingProbability',
        questions: ['seekingProbability1', 'seekingProbability2', 'seekingProbability3', 'seekingProbability4', 'seekingProbability5', 'seekingProbability6'],
      },
    ],
  },
]

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const pageDescription = computed(() => {
  if (phase.value === 'result' && chart.value) {
    return `${chart.value.calendar.ganzhi.day}日${chart.value.calendar.ganzhi.hour}时 · ${chart.value.calendar.yuejiang}加${chart.value.calendar.shichen} · ${form.lostItemDesc || t('liurenSeeking.defaultItem')}`
  }
  return t('seo.liurenSeekingDesc')
})

const pageTitle = computed(() => {
  if (phase.value === 'result' && chart.value) {
    return `${t('seo.liurenSeekingTitle')} · ${chart.value.calendar.ganzhi.day}日${chart.value.calendar.ganzhi.hour}时`
  }
  return t('seo.liurenSeekingTitle')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${pageTitle.value} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.liurenSeekingKeywords'),
  ogTitle: () => `${pageTitle.value} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liuren-seeking',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${pageTitle.value} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liuren-seeking',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('liurenSeeking.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liuren-seeking',
          description: t('liurenSeeking.subtitle'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
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

.outer-dashed-ring {
  animation: spin-dashed 24s linear infinite;
}
.outer-solid-ring {
  animation: spin-solid 16s linear infinite reverse;
}
.inner-ring {
  animation: spin-inner 20s linear infinite;
}
.center-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
.radar-sweep {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(201, 162, 39, 0.15) 60deg, rgba(201, 162, 39, 0.35) 90deg, transparent 120deg);
  transform-origin: 0 0;
  animation: radar-sweep 2s linear infinite;
  border-radius: 0 100% 0 0;
}
.radar-dot {
  animation: radar-dot-pulse 2s ease-in-out infinite;
}
@keyframes spin-dashed {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spin-solid {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spin-inner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(201, 162, 39, 0.2), 0 0 40px rgba(201, 162, 39, 0.05); }
  50% { box-shadow: 0 0 30px rgba(201, 162, 39, 0.35), 0 0 60px rgba(201, 162, 39, 0.1); }
}
@keyframes radar-sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes radar-dot-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.ai-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-content :deep(h3) {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.75rem;
  margin-bottom: 0.4rem;
}
.ai-content :deep(h4) {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.5rem;
  margin-bottom: 0.3rem;
}
.ai-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
