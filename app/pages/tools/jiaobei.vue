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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Jiaobei Divination</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jiaobei.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jiaobei.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('jiaobei.disclaimer') }}
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
                  {{ $t('jiaobei.questionLabel') }}
                </label>
                <QuestionInspiration @select="onQuestionSelect" />
              </div>
              <UTextarea
                v-model="form.question"
                :placeholder="$t('jiaobei.questionPlaceholder')"
                :rows="3"
                class="w-full"
                :ui="textareaUi"
              />
              <p class="text-[11px] text-[var(--text-faint)]">
                {{ $t('jiaobei.questionHint') }}
              </p>
            </div>

            <!-- 掷筊按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-hand-raised" class="w-5 h-5" />
              </template>
              {{ $t('jiaobei.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jiaobei.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jiaobei.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jiaobei.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jiaobei.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jiaobei.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jiaobei.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jiaobei.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jiaobei.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：掷筊工作台 ============ -->
      <div v-if="phase === 'tossing'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Jiaobei Divination</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jiaobei.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jiaobei.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <JiaobeiTossWorkbench
          ref="workbenchRef"
          @complete="onWorkbenchComplete"
        />
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('jiaobei.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('jiaobei.numberLabel') }}{{ calcResult.fortune.number }}{{ $t('jiaobei.numberSuffix') }}
              <span v-if="calcResult.fortune.name"> · {{ calcResult.fortune.name }}</span>
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 筊杯组合 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-6 mb-5 text-center">
            <p class="text-xs text-[var(--text-muted)] mb-3">{{ $t('jiaobei.tossesTitle') }}</p>
            <div class="flex items-center justify-center gap-3">
              <div
                v-for="(t, i) in calcResult.tosses"
                :key="i"
                class="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold"
                :class="tossClass(t)"
              >
                {{ t }}
              </div>
            </div>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium"
              :class="levelClass"
            >
              <span>{{ calcResult.fortune.level }}</span>
            </div>
            <div class="mt-4 space-y-1 text-xs text-[var(--text-faint)]">
              <p v-if="form.question">
                {{ $t('jiaobei.questionLabel') }}：{{ form.question }}
              </p>
            </div>
          </div>

          <!-- 卦辞 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('jiaobei.poemTitle') }}
            </h3>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-sm text-[var(--text-body)] leading-relaxed font-serif whitespace-pre-line">{{ calcResult.fortune.poem }}</p>
            </div>
          </div>

          <!-- 解卦与断曰 -->
          <div class="grid grid-cols-1 gap-3 mb-5">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('jiaobei.explanationTitle') }}</p>
              <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ calcResult.fortune.explanation }}</p>
            </div>
            <div v-if="calcResult.fortune.advice" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('jiaobei.adviceTitle') }}</p>
              <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ calcResult.fortune.advice }}</p>
            </div>
            <div v-if="calcResult.fortune.story" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <p class="text-[11px] text-[var(--text-muted)] mb-1">{{ $t('jiaobei.storyTitle') }}</p>
              <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ calcResult.fortune.story }}</p>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('jiaobei.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('jiaobei.interpreting') }}</span>
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('jiaobei.generatingInterpretation') }}</p>
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
              {{ $t('jiaobei.reinterpret') }}
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
            {{ $t('jiaobei.copyResult') }}
          </UButton>
          <AppShareButton
            tool="jiaobei"
            :summary="`第${calcResult.fortune.number}筊 · ${calcResult.fortune.name || calcResult.fortune.level} · ${calcResult.tosses.join('')}`"
            :share-target="resultRef"
            :filename="`jiaobei-${calcResult.fortune.number}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('jiaobei.redraw') }}
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
            {{ $t('jiaobei.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface JiaobeiFortune {
  number: number
  combo: string
  comboNormalized: string
  name: string
  poem: string
  explanation: string
  advice: string
  level: string
  levelCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower'
  story: string
  interpretation: string
}

interface JiaobeiCalcResult {
  fortune: JiaobeiFortune
  tosses: string[]
  question: string
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'tossing' | 'result'>('form')
const form = reactive({
  question: '',
})
const calcResult = ref<JiaobeiCalcResult | null>(null)
const workbenchRef = ref<{ reset: () => void } | null>(null)

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const toast = useToast()

function validateForm(): string | null {
  if (!form.question.trim()) return t('jiaobei.questionRequired')
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

  phase.value = 'tossing'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  workbenchRef.value?.reset()
}

async function onWorkbenchComplete(combo: string) {
  try {
    const result = await $fetch<JiaobeiCalcResult>('/api/tools/jiaobei/calc', {
      method: 'POST',
      body: {
        question: form.question.trim(),
        locale: locale.value,
        combo,
      },
    })

    calcResult.value = result
    phase.value = 'result'
    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'tossing'
    toast.add({
      title: t('jiaobei.drawFail'),
      description: err.data?.message || err.message || t('jiaobei.checkInput'),
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
    const response = await fetch('/api/tools/jiaobei/reading', {
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
            aiError.value = data.message || t('jiaobei.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('jiaobei.aiUnavailable')
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
  workbenchRef.value?.reset()
}

function handleCopy() {
  if (!calcResult.value) return
  const f = calcResult.value.fortune
  const text = `${t('jiaobei.resultTitle')}

${t('jiaobei.numberLabel')}${f.number}${t('jiaobei.numberSuffix')}${f.name ? ' · ' + f.name : ''}
${f.level}
${calcResult.value.tosses.join(' → ')}

【${t('jiaobei.poemTitle')}】
${f.poem}

【${t('jiaobei.explanationTitle')}】
${f.explanation}

${f.advice ? '【' + t('jiaobei.adviceTitle') + '】\n' + f.advice + '\n\n' : ''}${form.question ? t('jiaobei.questionLabel') + '：' + form.question + '\n' : ''}${aiContent.value ? '【' + t('jiaobei.interpretation') + '】\n' + aiContent.value : ''}
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

function tossClass(toss: string) {
  if (toss === t('jiaobei.tossHoly')) return 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
  if (toss === t('jiaobei.tossYang') || toss === t('jiaobei.tossLaugh')) return 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
  return 'border-purple-500/50 text-purple-400 bg-purple-500/10'
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
    const titleLine = lines[0]?.replace(/^##\s*/, '').trim() ?? ''
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('jiaobei.interpretation'), content })
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

useSeoMeta({
  title: () => `${t('seo.jiaobeiTitle')} - ${siteName}`,
  description: t('seo.jiaobeiDesc'),
  keywords: t('seo.jiaobeiKeywords'),
  ogTitle: () => `${t('seo.jiaobeiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jiaobeiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/jiaobei',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.jiaobeiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/jiaobei',
        description: t('seo.jiaobeiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('jiaobei.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/jiaobei',
          description: t('seo.jiaobeiOgDesc'),
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
