<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-[10%] right-[15%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[25%] left-[10%] h-[300px] w-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-2xl px-6 py-12">
      <div v-if="phase === 'form'">
        <header class="mb-7">
          <p class="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Guandi Oracle</p>
          <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {{ $t('guandiLot.title') }}
          </h1>
          <p class="mt-2 text-sm text-[var(--text-faint)]">{{ $t('guandiLot.subtitle') }}</p>
        </header>

        <div class="mb-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
          <p class="text-center text-[11px] leading-relaxed text-[var(--text-faint)]">
            {{ $t('guandiLot.disclaimer') }}
          </p>
        </div>

        <div class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div class="p-6">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]" for="guandi-question">
                  {{ $t('guandiLot.questionLabel') }}
                </label>
                <QuestionInspiration @select="onQuestionSelect" />
              </div>
              <UTextarea
                id="guandi-question"
                v-model="question"
                :placeholder="$t('guandiLot.questionPlaceholder')"
                :rows="3"
                class="w-full"
              />
              <p class="text-[11px] text-[var(--text-faint)]">{{ $t('guandiLot.questionHint') }}</p>
            </div>
            <UButton class="mt-5 w-full" color="warning" size="lg" @click="drawLot">
              <template #leading>
                <UIcon name="i-heroicons-gift-top" class="h-5 w-5" />
              </template>
              {{ $t('guandiLot.toolCta') }}
            </UButton>
          </div>
        </div>
      </div>

      <div v-else-if="phase === 'drawing'" class="flex min-h-[52vh] flex-col items-center justify-center gap-6">
        <div class="relative h-44 w-28 rounded-b-3xl border-2 border-[var(--accent-border)] bg-[var(--accent-bg)]/20">
          <div class="absolute inset-x-4 -top-14 bottom-2">
            <span
              v-for="stick in 16"
              :key="stick"
              class="absolute bottom-0 h-24 w-[4px] translate-x-1/2 rounded-full bg-[var(--accent)]/70"
              :style="{ left: `${6 + (stick % 8) * 11}%`, opacity: 0.4 + (stick % 4) * 0.13 }"
            />
          </div>
          <div class="lot-shake absolute inset-0 rounded-b-3xl" />
        </div>
        <p class="text-sm text-[var(--text-muted)]">{{ $t('guandiLot.drawing') }}</p>
      </div>

      <div v-else-if="result" class="space-y-5">
        <div ref="resultRef">
          <header class="mb-6">
            <p class="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Result</p>
            <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
              {{ $t('guandiLot.resultTitle') }}
            </h1>
          </header>

          <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-center">
            <p class="text-xs text-[var(--text-muted)]">{{ result.fortune.title }}</p>
            <div class="mt-2 flex items-baseline justify-center gap-2 text-[var(--accent)]">
              <span class="text-3xl font-bold">{{ $t('guandiLot.numberPrefix') }}</span>
              <span class="text-5xl font-black">{{ result.fortune.number }}</span>
              <span class="text-xl font-bold">{{ $t('guandiLot.numberSuffix') }}</span>
            </div>
            <div class="mt-3 inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]">
              {{ result.fortune.level }}
            </div>
            <p v-if="question" class="mt-4 text-xs text-[var(--text-faint)]">
              {{ $t('guandiLot.questionLabel') }}：{{ question }}
            </p>
          </section>

          <section class="mb-5 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5">
            <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('guandiLot.poemTitle') }}</h2>
            <p class="whitespace-pre-line font-serif text-base leading-8 text-[var(--text-body)]">{{ result.fortune.poem }}</p>
          </section>

          <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('guandiLot.explanationTitle') }}</h2>
            <p class="max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ result.fortune.explanation }}</p>
          </section>

          <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('guandiLot.adviceTitle') }}</h2>
            <p class="max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ result.fortune.advice }}</p>
          </section>
        </div>

        <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold text-[var(--text-primary)]">{{ $t('guandiLot.interpretation') }}</h2>
            <span v-if="aiStreaming" class="flex items-center gap-2 text-xs text-[var(--accent-muted)]">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              {{ $t('guandiLot.interpreting') }}
            </span>
          </div>

          <div v-if="aiSections.length" class="space-y-4">
            <article
              v-for="section in aiSections"
              :key="section.title"
              class="rounded-xl border border-[var(--border-light)] p-4"
            >
              <h3 class="mb-2 text-sm font-semibold text-[var(--text-primary)]">{{ section.title }}</h3>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="ai-markdown" v-html="renderMarkdown(section.content)" />
            </article>
          </div>
          <p v-else-if="aiStreaming" class="py-6 text-center text-sm text-[var(--text-muted)]">
            {{ $t('guandiLot.interpreting') }}
          </p>

          <div v-if="aiError" class="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {{ aiError }}
          </div>
          <div v-if="!aiStreaming && (aiContent || aiError)" class="mt-4 flex justify-center">
            <UButton color="warning" size="xs" variant="soft" @click="startReading">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
              </template>
              {{ $t('guandiLot.reinterpret') }}
            </UButton>
          </div>
        </section>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton color="warning" variant="soft" @click="copyResult">
            <template #leading><UIcon name="i-heroicons-clipboard-document" class="h-4 w-4" /></template>
            {{ $t('guandiLot.copyResult') }}
          </UButton>
          <AppShareButton
            tool="guandi-lot"
            :disabled="aiStreaming"
            :summary="`${result.lotType.name} 第${result.fortune.number}签 · ${result.fortune.level}`"
            :share-target="resultRef || undefined"
            :filename="`guandi-lot-${result.fortune.number}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton color="warning" variant="soft" :to="localePath(`/tools/guandi-lots/${result.fortune.number}`)">
            <template #leading><UIcon name="i-heroicons-book-open" class="h-4 w-4" /></template>
            {{ $t('guandiLot.viewDetail') }}
          </UButton>
          <UButton color="warning" variant="soft" @click="reset">
            <template #leading><UIcon name="i-heroicons-arrow-path" class="h-4 w-4" /></template>
            {{ $t('guandiLot.redraw') }}
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

interface DrawResult {
  lotType: { id: string; name: string; count: number }
  fortune: FortuneResult
  question: string
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'drawing' | 'result'>('form')
const question = ref('')
const result = ref<DrawResult | null>(null)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const aiSections = computed(() => {
  if (!aiContent.value) return []
  return aiContent.value
    .split(/\n(?=##\s)/)
    .map((raw) => {
      const lines = raw.trim().split('\n')
      return {
        title: lines[0]?.replace(/^##\s*/, '').trim() || t('guandiLot.interpretation'),
        content: lines.slice(1).join('\n').trim(),
      }
    })
    .filter(section => section.title || section.content)
})

function onQuestionSelect(value: string) {
  question.value = value
}

async function drawLot() {
  if (!question.value.trim()) {
    toast.add({ title: t('guandiLot.questionRequired'), color: 'error' })
    return
  }

  phase.value = 'drawing'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const [response] = await Promise.all([
      $fetch<DrawResult>('/api/tools/guandi-lot/calc', {
        method: 'POST',
        body: { question: question.value.trim(), locale: locale.value },
      }),
      new Promise(resolve => setTimeout(resolve, 1700)),
    ])
    result.value = response
    phase.value = 'result'
    setTimeout(startReading, 200)
  } catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('guandiLot.drawFailed'),
      description: error?.data?.message || error?.message || t('guandiLot.checkInput'),
      color: 'error',
    })
  }
}

async function startReading() {
  if (!result.value) return
  aiContent.value = ''
  aiError.value = null
  aiStreaming.value = true

  try {
    const response = await fetch('/api/tools/guandi-lot/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: result.value, locale: locale.value }),
    })
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const payload = line.trim()
        if (!payload.startsWith('data:')) continue
        const content = payload.slice(5).trim()
        if (!content || content === '[DONE]') continue
        try {
          const event = JSON.parse(content)
          if (event.type === 'text' && event.text) aiContent.value += event.text
          if (event.type === 'error') aiError.value = event.message || t('guandiLot.aiUnavailable')
        } catch {
          // 忽略不完整分块
        }
      }
    }
  } catch (error: any) {
    aiError.value = error?.message || t('guandiLot.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function copyResult() {
  if (!result.value) return
  const fortune = result.value.fortune
  const text = [
    t('guandiLot.resultTitle'),
    `${result.value.lotType.name} · ${t('guandiLot.numberPrefix')}${fortune.number}${t('guandiLot.numberSuffix')}`,
    `${fortune.title} · ${fortune.level}`,
    `【${t('guandiLot.poemTitle')}】\n${fortune.poem}`,
    `【${t('guandiLot.explanationTitle')}】\n${fortune.explanation}`,
    `【${t('guandiLot.adviceTitle')}】\n${fortune.advice}`,
    aiContent.value ? `【${t('guandiLot.interpretation')}】\n${aiContent.value}` : '',
  ].filter(Boolean).join('\n\n')
  navigator.clipboard.writeText(text)
    .then(() => toast.add({ title: t('share.textCopied'), color: 'success' }))
    .catch(() => toast.add({ title: t('share.copyFail'), color: 'error' }))
}

function reset() {
  phase.value = 'form'
  result.value = null
  question.value = ''
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
}

function renderMarkdown(text: string) {
  return marked.parse(text, { async: false }) as string
}

const pageUrl = useLocalizedSeoUrl('/tools/guandi-lot')

useSeoMeta({
  title: () => `${t('seo.guandiLotTitle')} - ososn`,
  description: () => t('seo.guandiLotDesc'),
  keywords: () => t('seo.guandiLotKeywords'),
  ogTitle: () => `${t('seo.guandiLotOgTitle')} - ososn`,
  ogDescription: () => t('seo.guandiLotOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: t('guandiLot.title'),
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      url: pageUrl.value,
      description: t('seo.guandiLotOgDesc'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    }),
  }],
}))
</script>

<style scoped>
.lot-shake {
  background: linear-gradient(to bottom, var(--accent-bg) / 30, transparent);
  animation: lot-shake 1.6s ease-in-out;
}

@keyframes lot-shake {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-14deg); }
  35% { transform: rotate(12deg); }
  55% { transform: rotate(-9deg); }
  75% { transform: rotate(6deg); }
}

.ai-markdown :deep(p) {
  color: var(--text-body);
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

.ai-markdown :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
