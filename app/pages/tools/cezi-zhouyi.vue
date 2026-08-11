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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zhouyi Character Divination</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('ceziZhouyi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('ceziZhouyi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('ceziZhouyi.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 测字输入 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('ceziZhouyi.charLabel') }}
                <span class="text-[var(--accent)] ml-0.5">*</span>
              </label>
              <input
                v-model="form.char"
                type="text"
                maxlength="1"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-center text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('ceziZhouyi.charPlaceholder')"
                @input="handleCharInput"
              >
              <p class="text-[10px] text-[var(--text-faint)]">{{ $t('ceziZhouyi.charHint') }}</p>
            </div>

            <!-- 占卜事项 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('ceziZhouyi.questionLabel') }}
                  <span class="text-[var(--accent)] ml-0.5">*</span>
                </label>
                <QuestionInspiration @select="q => form.question = q" />
              </div>
              <textarea
                v-model="form.question"
                rows="3"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)] resize-none"
                :placeholder="$t('ceziZhouyi.questionPlaceholder')"
              />
            </div>

            <!-- 性别 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('ceziZhouyi.genderLabel') }}</label>
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
                  {{ $t('ceziZhouyi.genderNone') }}
                </button>
              </div>
            </div>

            <!-- 出生年份 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('ceziZhouyi.birthYearLabel') }}</label>
              <input
                v-model.number="form.birthYear"
                type="number"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('ceziZhouyi.birthYearPlaceholder')"
              >
            </div>

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
              {{ $t('ceziZhouyi.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziZhouyi.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziZhouyi.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-swatch" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziZhouyi.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziZhouyi.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziZhouyi.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziZhouyi.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ceziZhouyi.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ceziZhouyi.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：思考中动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative w-24 h-24">
          <ThinkingOrb state="solving" :size="64" class="absolute inset-0 m-auto" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-swatch" class="w-8 h-8 text-[var(--accent)]" />
          </div>
        </div>
        <p class="text-sm text-[var(--text-muted)] mt-6">{{ $t('ceziZhouyi.calculating') }}</p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('ceziZhouyi.resultTitle') }}
          </h1>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 隐藏截图目标：AI 解读完成后才挂载，保证分享图融合完整解读 -->
        <div v-if="!aiStreaming && aiContent" ref="posterRef" v-show="false" class="cezi-zhouyi-share-target">
          <CeziZhouyiPoster :result="result" :ai-content="aiContent" />
        </div>

        <!-- 页内展示：解字批命笺海报（AI 流式融入） -->
        <CeziZhouyiPoster :result="result" :ai-content="aiContent" />

        <!-- 隐士解读状态条（融入海报之下，非独立卡片） -->
        <div class="cezi-zhouyi-ai-bar">
          <div v-if="aiStreaming" class="flex items-center justify-center gap-2 py-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
            <span class="text-xs text-[var(--accent-muted)]">{{ $t('ceziZhouyi.interpreting') }}</span>
          </div>
          <div v-else-if="aiError" class="flex items-center justify-center gap-2 py-1">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
            <p class="text-xs text-red-400">{{ aiError }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('ceziZhouyi.reinterpret') }}
            </UButton>
          </div>
          <div v-else-if="aiContent" class="flex items-center justify-center gap-4 py-1">
            <p class="text-[11px] text-[var(--text-faint)]">{{ $t('ceziZhouyi.disclaimer') }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('ceziZhouyi.reinterpret') }}
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
            {{ $t('ceziZhouyi.copyResult') }}
          </UButton>
          <AppShareButton
            tool="cezi-zhouyi"
            :disabled="aiStreaming || !aiContent"
            :summary="`${result.input.question ? '问：' + result.input.question + ' · ' : ''}字：${result.analysis.char} · ${result.hexagram.hexagramName} · ${result.analysis.strokeCount} 画`"
            :share-target="posterRef || undefined"
            :filename="`cezi-zhouyi-${result.analysis.char}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('ceziZhouyi.recalculate') }}
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
            {{ $t('ceziZhouyi.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CeziZhouyiRequest, CeziZhouyiResult } from '~/types/cezi-zhouyi'

const { t, locale } = useI18n()

const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<CeziZhouyiResult | null>(null)

const form = reactive<{
  char: string
  question: string
  gender: 'male' | 'female' | null
  birthYear: number | null
}>({
  char: '',
  question: '',
  gender: null,
  birthYear: null,
})

const isChineseChar = (char: string) => {
  if (!char || char.length !== 1) return false
  const cp = char.codePointAt(0) || 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

const canSubmit = computed(() => {
  return isChineseChar(form.char) && form.question.trim().length > 0
})

function handleCharInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  const chars = Array.from(value).filter(isChineseChar)
  form.char = chars[0] || ''
}

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  const payload: CeziZhouyiRequest = {
    char: form.char,
    question: form.question,
    gender: form.gender,
    birthYear: form.birthYear,
  }

  try {
    const calcResult = await $fetch<CeziZhouyiResult>('/api/tools/cezi-zhouyi/calc', {
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
      title: t('ceziZhouyi.calcFail'),
      description: err.data?.message || err.message || t('ceziZhouyi.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const posterRef = ref<HTMLDivElement>()

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/cezi-zhouyi/reading', {
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
            aiError.value = data.message || t('ceziZhouyi.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('ceziZhouyi.aiUnavailable')
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
  form.char = ''
  form.question = ''
  form.gender = null
  form.birthYear = null
}

function handleCopy() {
  if (!result.value) return
  const a = result.value.analysis
  const h = result.value.hexagram
  const text = `${t('ceziZhouyi.resultTitle')}\n\n${t('ceziZhouyi.resultQuestionLabel')}：${result.value.input.question || t('ceziZhouyi.noQuestion')}\n${t('ceziZhouyi.analysisTitle')}：${a.char}（${a.pinyin}，${a.strokeCount} 画，${a.radical} 部，${a.wuxing}）\n${t('ceziZhouyi.hexagramTitle')}：${h.hexagramName} ${h.hexagram}，${t('ceziZhouyi.movingLineLabel')}${h.movingLine}${t('ceziZhouyi.movingLineUnit')}\n\n${aiContent.value ? t('ceziZhouyi.interpretation') + '：\n' + aiContent.value : ''}`
  navigator.clipboard.writeText(text).then(() => {
    useToast().add({ title: t('share.copySuccess'), color: 'success' })
  }).catch(() => {
    useToast().add({ title: t('share.copyFail'), color: 'error' })
  })
}

// SEO

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.ceziZhouyiTitle')} - ${siteName}`,
  description: t('seo.ceziZhouyiDesc'),
  keywords: t('seo.ceziZhouyiKeywords'),
  ogTitle: () => `${t('seo.ceziZhouyiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.ceziZhouyiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/cezi-zhouyi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.ceziZhouyiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/cezi-zhouyi',
        description: t('seo.ceziZhouyiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('ceziZhouyi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/cezi-zhouyi',
          description: t('seo.ceziZhouyiOgDesc'),
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
/* 隐藏截图目标：固定竖版海报宽度，html-to-image 按此出图（移动端竖版比例） */
.cezi-zhouyi-share-target {
  width: 720px;
}
/* 隐士解读状态条：融入海报之下，与海报间距收窄 */
.cezi-zhouyi-ai-bar {
  margin-top: 10px;
  padding: 0 4px;
}
</style>
