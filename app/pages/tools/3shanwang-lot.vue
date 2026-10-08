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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Three Mountain Kings Oracle</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('sanshanwangLot.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('sanshanwangLot.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('sanshanwangLot.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 所问之事 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('sanshanwangLot.questionLabel') }}
                </label>
                <QuestionInspiration @select="onQuestionSelect" />
              </div>
              <UTextarea
                v-model="form.question"
                :placeholder="$t('sanshanwangLot.questionPlaceholder')"
                :rows="3"
                class="w-full"
                :ui="textareaUi"
              />
              <p class="text-[11px] text-[var(--text-faint)]">
                {{ $t('sanshanwangLot.questionHint') }}
              </p>
            </div>

            <!-- 抽签按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-gift-top" class="w-5 h-5" />
              </template>
              {{ $t('sanshanwangLot.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sanshanwangLot.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sanshanwangLot.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sanshanwangLot.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sanshanwangLot.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sanshanwangLot.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sanshanwangLot.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('sanshanwangLot.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('sanshanwangLot.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-6">
          <LotShakeAnimation
            :trigger="lotShake.trigger.value"
            :theme="lotShakeTheme"
            :selected-sign="lotShake.selectedSign.value"
            class="w-full max-w-xl"
            @complete="lotShake.complete"
            @error="lotShake.fail"
          />
          <p class="min-h-[1.25rem] text-sm text-[var(--text-muted)]">{{ $t('sanshanwangLot.shaking') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('sanshanwangLot.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.lotType.name }} · {{ $t('sanshanwangLot.numberLabel') }}{{ calcResult.fortune.number }}{{ $t('sanshanwangLot.numberSuffix') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 签运总览 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-6 mb-5 text-center">
            <p class="text-xs text-[var(--text-muted)] mb-2">{{ calcResult.fortune.title }}</p>
            <div class="flex items-baseline justify-center gap-1">
              <span class="text-4xl font-bold text-[var(--accent)]">{{ $t('sanshanwangLot.numberLabel') }}</span>
              <span class="text-5xl font-bold text-[var(--accent)]">{{ calcResult.fortune.number }}</span>
              <span class="text-xl font-bold text-[var(--accent)]">{{ $t('sanshanwangLot.numberSuffix') }}</span>
            </div>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium"
              :class="levelClass"
            >
              <span>{{ calcResult.fortune.level }}</span>
            </div>
            <div class="mt-4 space-y-1 text-xs text-[var(--text-faint)]">
              <p v-if="form.question">
                {{ $t('sanshanwangLot.questionLabel') }}：{{ form.question }}
              </p>
            </div>
          </div>

          <!-- 签诗 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('sanshanwangLot.poemTitle') }}
            </h3>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-sm text-[var(--text-body)] leading-relaxed font-serif whitespace-pre-line">{{ calcResult.fortune.poem }}</p>
            </div>
          </div>

          <!-- 签意与签示 -->
          <div class="grid grid-cols-1 gap-3 mb-5">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('sanshanwangLot.explanationTitle') }}</p>
              <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ calcResult.fortune.explanation }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('sanshanwangLot.adviceTitle') }}</p>
              <p class="text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-line">{{ calcResult.fortune.advice }}</p>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('sanshanwangLot.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('sanshanwangLot.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('sanshanwangLot.generatingInterpretation') }}</p>
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
              {{ $t('sanshanwangLot.reinterpret') }}
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
            {{ $t('sanshanwangLot.copyResult') }}
          </UButton>
          <AppShareButton
            tool="3shanwang-lot"
            :summary="`${calcResult.lotType.name} 第${calcResult.fortune.number}签 · ${calcResult.fortune.level}`"
            :share-target="resultRef"
            :filename="`3shanwang-lot-${calcResult.fortune.number}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('sanshanwangLot.redraw') }}
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
            {{ $t('sanshanwangLot.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface FortuneResult {
  number: number
  title: string
  level: string
  levelCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower'
  poem: string
  explanation: string
  advice: string
}

interface DrawALotCalcResult {
  lotType: {
    id: string
    name: string
    count: number
  }
  fortune: FortuneResult
  question: string
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const lotShake = useLotShake()
const lotShakeTheme = useLotShakeTheme('sanshanwang')
const form = reactive({
  question: '',
})
const calcResult = ref<DrawALotCalcResult | null>(null)

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const toast = useToast()

function validateForm(): string | null {
  if (!form.question.trim()) return t('sanshanwangLot.questionRequired')
  return null
}

function onQuestionSelect(question: string) {
  form.question = question
}

async function handleSubmit() {
  const error = validateForm()
  if (error) {
    toast.add({ title: error, color: 'error' })
    return
  }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const resultPromise = plainFetch<DrawALotCalcResult>('/api/tools/3shanwang-lot/calc', {
        method: 'POST',
        body: {
          question: form.question.trim(),
          locale: locale.value,
        },
      })
    const animationPromise = lotShake.play()
    const result = await resultPromise
    if (lotShake.error.value) throw new Error(lotShake.error.value)

    lotShake.setSign(result.fortune.number)
    await animationPromise
    calcResult.value = result
    phase.value = 'result'
    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    lotShake.cancel()
    phase.value = 'form'
    toast.add({
      title: t('sanshanwangLot.drawFail'),
      description: err.data?.message || err.message || t('sanshanwangLot.checkInput'),
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
    const response = await fetch('/api/tools/3shanwang-lot/reading', {
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
            aiError.value = data.message || t('sanshanwangLot.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('sanshanwangLot.aiUnavailable')
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
  form.question = ''
}

function handleCopy() {
  if (!calcResult.value) return
  const f = calcResult.value.fortune
  const text = `${t('sanshanwangLot.resultTitle')}

${calcResult.value.lotType.name} · ${t('sanshanwangLot.numberLabel')}${f.number}${t('sanshanwangLot.numberSuffix')}
${f.title} · ${f.level}

【${t('sanshanwangLot.poemTitle')}】
${f.poem}

【${t('sanshanwangLot.explanationTitle')}】
${f.explanation}

【${t('sanshanwangLot.adviceTitle')}】
${f.advice}

${form.question ? t('sanshanwangLot.questionLabel') + '：' + form.question + '\n' : ''}${aiContent.value ? '【' + t('sanshanwangLot.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

const levelClass = computed(() => {
  if (!calcResult.value) return ''
  const code = calcResult.value.fortune.levelCode
  if (code === 'upper') return 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]'
  if (code === 'upper-middle') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  if (code === 'middle') return 'border-purple-500/30 bg-purple-500/10 text-purple-400'
  if (code === 'lower-middle') return 'border-orange-500/30 bg-orange-500/10 text-orange-400'
  return 'border-red-500/30 bg-red-500/10 text-red-400'
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
    const titleLine = lines[0]!.replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('sanshanwangLot.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// UI Config
const textareaUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const siteName = 'ososn'

const pageUrl = useLocalizedSeoUrl('/tools/3shanwang-lot')

useSeoMeta({
  title: () => `${t('seo.sanshanwangLotTitle')} - ${siteName}`,
  description: t('seo.sanshanwangLotDesc'),
  keywords: t('seo.sanshanwangLotKeywords'),
  ogTitle: () => `${t('seo.sanshanwangLotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.sanshanwangLotOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.sanshanwangLotTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.sanshanwangLotDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('sanshanwangLot.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('seo.sanshanwangLotOgDesc'),
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
