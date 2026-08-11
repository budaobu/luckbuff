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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Xiao Liu Ren Seeking</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('xiaoLiurenSeeking.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('xiaoLiurenSeeking.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('xiaoLiuren.disclaimer') }}
          </p>
        </div>

        <!-- 寻物表单 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 起课时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('xiaoLiurenSeeking.form.castTime')"
              :hint="$t('xiaoLiurenSeeking.form.castTimeHint')"
              required
            />

            <!-- 失物描述 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('xiaoLiurenSeeking.form.lostItemDesc') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.lostItemDesc"
                :placeholder="$t('xiaoLiurenSeeking.form.lostItemDescPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 最后见到时间 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('xiaoLiurenSeeking.form.lastSeenTime') }}</label>
              <UInput
                v-model="form.lastSeenTime"
                :placeholder="$t('xiaoLiurenSeeking.form.lastSeenTimePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 最后见到地点 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('xiaoLiurenSeeking.form.lastSeenPlace') }}</label>
              <UInput
                v-model="form.lastSeenPlace"
                :placeholder="$t('xiaoLiurenSeeking.form.lastSeenPlacePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 与失物关系 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('xiaoLiurenSeeking.form.relationship') }}</label>
              <UInput
                v-model="form.relationship"
                :placeholder="$t('xiaoLiurenSeeking.form.relationshipPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 补充描述 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm text-[var(--text-muted)]">{{ $t('xiaoLiurenSeeking.form.description') }}</label>
                <QuestionInspiration
                  :extra-categories="seekingExtraCategories"
                  @select="q => form.description = q"
                />
              </div>
              <UTextarea
                v-model="form.description"
                :placeholder="$t('xiaoLiurenSeeking.form.descriptionPlaceholder')"
                class="w-full"
                :ui="inputUi"
                :rows="2"
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
                <UIcon name="i-heroicons-hand-raised" class="w-5 h-5" />
              </template>
              {{ $t('xiaoLiurenSeeking.form.submitBtn') }}
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
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('xiaoLiurenSeeking.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 寻物指南 -->
        <div class="mt-10">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent)]" />
            <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('xiaoLiurenSeeking.tipsTitle') }}</h3>
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

      <!-- ============ 阶段 2：掐指一算动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <XiaoLiurenHand :active-index="thumbStep" />
        <p class="text-[var(--accent)] tracking-wider font-medium mt-5 text-sm">
          {{ $t('xiaoLiurenSeeking.scanning') }}
        </p>
        <p class="text-xs text-[var(--text-faint)] mt-2">
          {{ $t('xiaoLiurenSeeking.scanningSub') }}
        </p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Seeking Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('xiaoLiurenSeeking.resultTitle') }}
          </h1>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 隐藏截图目标：AI 解读完成后才挂载，保证分享图融合完整解读 -->
        <div v-if="!aiStreaming && aiContent" ref="posterRef" v-show="false" class="xiao-liuren-seeking-share-target">
          <XiaoLiurenSeekingPoster
            :lost-item-name="form.lostItemDesc || form.description || $t('xiaoLiurenSeeking.poster.itemFallback')"
            :lost-time="form.lastSeenTime"
            :last-seen-place="form.lastSeenPlace"
            :steps="result.steps"
            :final-position="result.finalPosition"
            :lunar-date="result.timeContext?.lunarDate || ''"
            :hour-branch="result.timeContext?.hourBranch || ''"
            :ai-content="aiContent"
          />
        </div>

        <!-- 页内展示：纸刊寻物启事海报（AI 流式融入） -->
        <XiaoLiurenSeekingPoster
          :lost-item-name="form.lostItemDesc || form.description || $t('xiaoLiurenSeeking.poster.itemFallback')"
          :lost-time="form.lastSeenTime"
          :last-seen-place="form.lastSeenPlace"
          :steps="result.steps"
          :final-position="result.finalPosition"
          :lunar-date="result.timeContext?.lunarDate || ''"
          :hour-branch="result.timeContext?.hourBranch || ''"
          :ai-content="aiContent"
        />

        <!-- 卦师解读状态条（融入海报之下，非独立卡片） -->
        <div class="xiao-liuren-seeking-ai-bar">
          <div v-if="aiStreaming" class="flex items-center justify-center gap-2 py-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
            <span class="text-xs text-[var(--accent-muted)]">{{ $t('xiaoLiuren.interpreting') }}</span>
          </div>
          <div v-else-if="aiError" class="flex items-center justify-center gap-2 py-1">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
            <p class="text-xs text-red-400">{{ aiError }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('common.retry') }}
            </UButton>
          </div>
          <div v-else-if="aiContent" class="flex items-center justify-center gap-4 py-1">
            <p class="text-[11px] text-[var(--text-faint)]">{{ $t('xiaoLiuren.disclaimer') }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('xiaoLiuren.reinterpret') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <AppShareButton
            tool="xiao-liuren-seeking"
            :disabled="aiStreaming || !aiContent"
            :summary="`${result.finalPosition.name} · ${result.finalPosition.meaning}`"
            :share-target="posterRef || undefined"
            :filename="`xiao-liuren-seeking-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('common.retry') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo(localePath('/seeking')) }"
          >
            <template #leading>
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
            </template>
            {{ $t('xiaoLiurenSeeking.backToSeeking') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XiaoLiurenRequest, XiaoLiurenResult } from '~/types/xiao-liuren'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<XiaoLiurenResult | null>(null)
const posterRef = ref<HTMLDivElement>()

const form = reactive({
  lostItemDesc: '',
  lastSeenTime: '',
  lastSeenPlace: '',
  relationship: '',
  description: '',
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const canSubmit = computed(() => {
  return form.lostItemDesc.trim().length > 0 || form.description.trim().length > 0
})

const submitHint = computed(() => {
  return t('xiaoLiurenSeeking.form.validation.required')
})

// 动画：大拇指在六宫之间移动
const thumbStep = ref(0)
let thumbTimer: ReturnType<typeof setInterval> | null = null

function startThumbAnimation() {
  thumbStep.value = 0
  if (thumbTimer) clearInterval(thumbTimer)
  thumbTimer = setInterval(() => {
    thumbStep.value = (thumbStep.value + 1) % 6
  }, 600)
}

function stopThumbAnimation() {
  if (thumbTimer) {
    clearInterval(thumbTimer)
    thumbTimer = null
  }
}

onBeforeUnmount(() => {
  stopThumbAnimation()
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  startThumbAnimation()

  const payload: XiaoLiurenRequest = {
    method: 'time',
    question: t('xiaoLiurenSeeking.defaultQuestion', { item: form.lostItemDesc || t('xiaoLiurenSeeking.unknownItem') }),
    datetime: (timeCardRef.value?.iso as any).value,
  }

  try {
    const calcResult = await $fetch<XiaoLiurenResult>('/api/tools/xiao-liuren/calc', {
      method: 'POST',
      body: payload,
    })
    result.value = calcResult
    setTimeout(() => {
      stopThumbAnimation()
      phase.value = 'result'
      setTimeout(() => startAiStream(), 300)
    }, 3000)
  } catch (err: any) {
    stopThumbAnimation()
    phase.value = 'form'
    toast.add({
      title: t('xiaoLiuren.calcFail'),
      description: err.data?.message || err.message || t('xiaoLiuren.checkInput'),
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
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/xiao-liuren-seeking/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: result.value,
        seekingContext: {
          lostItemDesc: form.lostItemDesc.trim(),
          lastSeenTime: form.lastSeenTime.trim(),
          lastSeenPlace: form.lastSeenPlace.trim(),
          relationship: form.relationship.trim(),
          description: form.description.trim(),
        },
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
            aiError.value = data.message || t('xiaoLiuren.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('xiaoLiuren.aiUnavailable')
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
  form.lostItemDesc = ''
  form.lastSeenTime = ''
  form.lastSeenPlace = ''
  form.relationship = ''
  form.description = ''
}

const tips = computed(() => [
  { icon: '🧭', title: t('xiaoLiurenSeeking.tips.direction.title'), content: t('xiaoLiurenSeeking.tips.direction.content') },
  { icon: '🔍', title: t('xiaoLiurenSeeking.tips.probability.title'), content: t('xiaoLiurenSeeking.tips.probability.content') },
  { icon: '⏰', title: t('xiaoLiurenSeeking.tips.timing.title'), content: t('xiaoLiurenSeeking.tips.timing.content') },
  { icon: '📍', title: t('xiaoLiurenSeeking.tips.location.title'), content: t('xiaoLiurenSeeking.tips.location.content') },
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
  if (phase.value === 'result' && result.value) {
    return `${result.value.timeContext?.lunarDate || ''} · ${result.value.finalPosition.name} · ${form.lostItemDesc || t('xiaoLiurenSeeking.defaultItem')}`
  }
  return t('seo.xiaoLiurenSeekingDesc')
})

const pageTitle = computed(() => {
  if (phase.value === 'result' && result.value) {
    return `${t('seo.xiaoLiurenSeekingTitle')} · ${result.value.finalPosition.name}`
  }
  return t('seo.xiaoLiurenSeekingTitle')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${pageTitle.value} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.xiaoLiurenSeekingKeywords'),
  ogTitle: () => `${pageTitle.value} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/xiao-liuren-seeking',
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
        url: 'https://www.ososn.com/tools/xiao-liuren-seeking',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('xiaoLiurenSeeking.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/xiao-liuren-seeking',
          description: t('xiaoLiurenSeeking.subtitle'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
/* 隐藏截图目标：固定竖版海报宽度，html-to-image 按此出图（移动端竖版比例） */
.xiao-liuren-seeking-share-target {
  width: 720px;
}
/* 卦师解读状态条：融入海报之下，与海报间距收窄 */
.xiao-liuren-seeking-ai-bar {
  margin-top: 10px;
  padding: 0 4px;
}
</style>
