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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Liu Yao Character Divination</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liuyaoCezi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liuyaoCezi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('liuyaoCezi.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 测字输入 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">
                {{ $t('liuyaoCezi.charLabel') }}
                <span class="text-[var(--accent)] ml-0.5">*</span>
              </label>
              <input
                v-model="form.char"
                type="text"
                maxlength="1"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-center text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)]"
                :placeholder="$t('liuyaoCezi.charPlaceholder')"
                @input="handleCharInput"
              >
              <p class="text-[10px] text-[var(--text-faint)]">{{ $t('liuyaoCezi.charHint') }}</p>
            </div>

            <!-- 占卜事项 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('liuyaoCezi.questionLabel') }}
                  <span class="text-[var(--accent)] ml-0.5">*</span>
                </label>
                <QuestionInspiration @select="q => form.question = q" />
              </div>
              <textarea
                v-model="form.question"
                rows="3"
                class="w-full px-3 py-2.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-border-hover)] resize-none"
                :placeholder="$t('liuyaoCezi.questionPlaceholder')"
              />
            </div>

            <!-- 起卦时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('liuyaoCezi.timeLabel')"
              :hint="$t('liuyaoCezi.timeHint')"
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
                <UIcon name="i-heroicons-circle-stack" class="w-5 h-5" />
              </template>
              {{ $t('liuyaoCezi.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoCezi.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoCezi.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-calculator" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoCezi.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoCezi.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoCezi.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoCezi.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoCezi.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoCezi.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：思考中动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative w-24 h-24">
          <ThinkingOrb state="solving" :size="64" class="absolute inset-0 m-auto" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-circle-stack" class="w-8 h-8 text-[var(--accent)]" />
          </div>
        </div>
        <p class="text-sm text-[var(--text-muted)] mt-6">{{ $t('liuyaoCezi.calculating') }}</p>
      </div>

      <!-- ============ 阶段 3：结果（仅海报） ============ -->
      <div v-if="phase === 'result' && result">
        <!-- 解字批命笺海报：卦象与解读已合并其中 -->
        <div ref="posterRef" class="mb-3">
          <LiuyaoCeziPoster :result="result" :ai-content="aiContent" />
        </div>

        <!-- 解读状态 -->
        <div class="flex items-center justify-center min-h-[22px]">
          <div v-if="aiStreaming" class="flex items-center gap-1.5">
            <span class="text-xs text-[var(--accent-muted)]">{{ $t('liuyaoCezi.interpreting') }}</span>
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
          </div>
          <p v-else-if="aiError" class="text-xs text-red-400">{{ aiError }}</p>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-6 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleCopy"
          >
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoCezi.copyResult') }}
          </UButton>
          <AppShareButton
            tool="liuyao-cezi"
            :summary="`字：${result.analysis.char} · ${result.hexagram.name} · 动爻${result.hexagram.movingLine}`"
            :share-target="posterRef"
            :filename="`liuyao-cezi-${result.analysis.char}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            v-if="!aiStreaming && (aiContent || aiError)"
            color="warning"
            variant="soft"
            class="group/btn"
            @click="startAiStream"
          >
            <template #leading>
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoCezi.reinterpret') }}
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
            {{ $t('liuyaoCezi.recalculate') }}
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
            {{ $t('liuyaoCezi.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiuyaoCeziRequest, LiuyaoCeziResult } from '~/types/liuyao-cezi'

const { t, locale } = useI18n()

const phase = ref<'form' | 'animating' | 'result'>('form')
const result = ref<LiuyaoCeziResult | null>(null)

const form = reactive<{
  char: string
  question: string
}>({
  char: '',
  question: '',
})

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

function isChineseChar(char: string) {
  if (!char || char.length !== 1) return false
  const cp = char.codePointAt(0) || 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

function handleCharInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  const chars = Array.from(value).filter(isChineseChar)
  form.char = chars[0] || ''
}

const canSubmit = computed(() => {
  return isChineseChar(form.char) && form.question.trim().length > 0
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  const payload: LiuyaoCeziRequest = {
    char: form.char,
    question: form.question,
    datetime: (timeCardRef.value?.iso as any).value,
  }

  try {
    const calcResult = await $fetch<LiuyaoCeziResult>('/api/tools/liuyao-cezi/calc', {
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
      title: t('liuyaoCezi.calcFail'),
      description: err.data?.message || err.message || t('liuyaoCezi.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)
const posterRef = ref<HTMLDivElement>()

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/liuyao-cezi/reading', {
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
            aiContent.value += data.text
          } else if (data.type === 'error') {
            aiError.value = data.message || t('liuyaoCezi.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('liuyaoCezi.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
  form.char = ''
  form.question = ''
}

function handleCopy() {
  if (!result.value) return
  const h = result.value.hexagram
  const linesText = result.value.lines.slice().reverse().map((line) => {
    const tags = [line.liuQin, line.liuShen]
    if (line.isMoving) tags.push(t('liuyaoCezi.movingTag'))
    if (line.isShi) tags.push(t('liuyaoCezi.shiLabel'))
    if (line.isYing) tags.push(t('liuyaoCezi.yingLabel'))
    if (line.isXunKong) tags.push(t('liuyaoCezi.xunKongTag'))
    if (line.isYuePo) tags.push(t('liuyaoCezi.yuePoTag'))
    return `${line.label} ${line.stemBranch} ${line.yin ? '阴' : '阳'} ${tags.join(' ')}`
  }).join('\n')
  const text = `${t('liuyaoCezi.resultTitle')}\n\n${t('liuyaoCezi.resultQuestionLabel')}：${result.value.input.question || t('liuyaoCezi.noQuestion')}\n${t('liuyaoCezi.charLabel')}：${result.value.analysis.char}（${result.value.analysis.strokes} 画）\n${t('liuyaoCezi.hexagramTitle')}：${h.name} ${h.symbol}，${t('liuyaoCezi.movingLineLabel')}${h.movingLine}${t('liuyaoCezi.movingLineUnit')}\n${t('liuyaoCezi.bodyTitle')}：${t('liuyaoCezi.tiLabel')}${result.value.body.tiTrigram.name} / ${t('liuyaoCezi.yongLabel')}${result.value.body.yongTrigram.name}\n\n${t('liuyaoCezi.linesTitle')}：\n${linesText}\n\n${aiContent.value ? t('liuyaoCezi.interpretation') + '：\n' + aiContent.value : ''}`
  navigator.clipboard.writeText(text).then(() => {
    useToast().add({ title: t('share.copySuccess'), color: 'success' })
  }).catch(() => {
    useToast().add({ title: t('share.copyFail'), color: 'error' })
  })
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.liuyaoCeziTitle')} - ${siteName}`,
  description: t('seo.liuyaoCeziDesc'),
  keywords: t('seo.liuyaoCeziKeywords'),
  ogTitle: () => `${t('seo.liuyaoCeziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.liuyaoCeziOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liuyao-cezi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.liuyaoCeziTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liuyao-cezi',
        description: t('seo.liuyaoCeziDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('liuyaoCezi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liuyao-cezi',
          description: t('seo.liuyaoCeziOgDesc'),
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
