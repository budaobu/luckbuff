<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-[10%] right-[15%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[25%] left-[10%] h-[300px] w-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-2xl px-6 py-12">
      <div v-if="phase === 'form'">
        <header class="mb-7">
          <p class="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Wong Tai Sin Oracle</p>
          <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {{ $t('wongTaiSinLot.title') }}
          </h1>
          <p class="mt-2 text-sm text-[var(--text-faint)]">{{ $t('wongTaiSinLot.subtitle') }}</p>
        </header>

        <div class="mb-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
          <p class="text-center text-[11px] leading-relaxed text-[var(--text-faint)]">
            {{ $t('wongTaiSinLot.disclaimer') }}
          </p>
        </div>

        <div class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div class="p-6">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-[var(--text-muted)]" for="wong-tai-sin-question">
                  {{ $t('wongTaiSinLot.questionLabel') }}
                </label>
                <QuestionInspiration @select="onQuestionSelect" />
              </div>
              <UTextarea
                id="wong-tai-sin-question"
                v-model="question"
                :placeholder="$t('wongTaiSinLot.questionPlaceholder')"
                :rows="3"
                class="w-full"
              />
              <p class="text-[11px] text-[var(--text-faint)]">{{ $t('wongTaiSinLot.questionHint') }}</p>
            </div>
            <UButton class="mt-5 w-full" color="warning" size="lg" @click="drawLot">
              <template #leading>
                <UIcon name="i-heroicons-gift-top" class="h-5 w-5" />
              </template>
              {{ $t('wongTaiSinLot.toolCta') }}
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
        <p class="text-sm text-[var(--text-muted)]">{{ $t('wongTaiSinLot.drawing') }}</p>
      </div>

      <div v-else-if="result" class="space-y-5">
        <div ref="resultRef">
          <header class="mb-6">
            <p class="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Result</p>
            <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
              {{ $t('wongTaiSinLot.resultTitle') }}
            </h1>
          </header>

          <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-center">
            <p class="text-xs text-[var(--text-muted)]">{{ result.fortune.title }}</p>
            <div class="mt-2 flex items-baseline justify-center gap-2 text-[var(--accent)]">
              <span class="text-3xl font-bold">{{ $t('wongTaiSinLot.numberPrefix') }}</span>
              <span class="text-5xl font-black">{{ result.fortune.number }}</span>
              <span class="text-xl font-bold">{{ $t('wongTaiSinLot.numberSuffix') }}</span>
            </div>
            <div class="mt-3 inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]">
              {{ result.fortune.level }}
            </div>
            <p v-if="question" class="mt-4 text-xs text-[var(--text-faint)]">
              {{ $t('wongTaiSinLot.questionLabel') }}：{{ question }}
            </p>
          </section>

          <section class="mb-5 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] p-5">
            <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wongTaiSinLot.poemTitle') }}</h2>
            <p class="whitespace-pre-line font-serif text-base leading-8 text-[var(--text-body)]">{{ result.fortune.poem }}</p>
          </section>

          <section v-if="result.fortune.allusion" class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wongTaiSinLot.allusionTitle') }}</h2>
            <p class="whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ result.fortune.allusion }}</p>
          </section>

          <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wongTaiSinLot.explanationTitle') }}</h2>
            <p class="max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ result.fortune.explanation }}</p>
          </section>

          <section class="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <h2 class="mb-3 text-sm font-semibold text-[var(--text-primary)]">{{ $t('wongTaiSinLot.adviceTitle') }}</h2>
            <p class="max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-7 text-[var(--text-body)]">{{ result.fortune.advice }}</p>
          </section>
        </div>

        <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold text-[var(--text-primary)]">{{ $t('wongTaiSinLot.interpretation') }}</h2>
            <span v-if="aiStreaming" class="flex items-center gap-2 text-xs text-[var(--accent-muted)]">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              {{ $t('wongTaiSinLot.interpreting') }}
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
            {{ $t('wongTaiSinLot.interpreting') }}
          </p>

          <div v-if="aiError" class="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {{ aiError }}
          </div>
          <div v-if="!aiStreaming && (aiContent || aiError)" class="mt-4 flex justify-center">
            <UButton color="warning" size="xs" variant="soft" @click="startReading">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
              </template>
              {{ $t('wongTaiSinLot.reinterpret') }}
            </UButton>
          </div>
        </section>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton color="warning" variant="soft" @click="copyResult">
            <template #leading><UIcon name="i-heroicons-clipboard-document" class="h-4 w-4" /></template>
            {{ $t('wongTaiSinLot.copyResult') }}
          </UButton>
          <AppShareButton
            tool="wong-tai-sin-lot"
            :disabled="aiStreaming"
            :summary="`${result.lotType.name} 第${result.fortune.number}签 · ${result.fortune.level}`"
            :share-target="resultRef || undefined"
            :filename="`wong-tai-sin-lot-${result.fortune.number}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            color="warning"
            variant="soft"
            :to="localePath(`/tools/wong-tai-sin-lots/${result.fortune.number}`)"
          >
            <template #leading><UIcon name="i-heroicons-book-open" class="h-4 w-4" /></template>
            {{ $t('wongTaiSinLot.viewDetail') }}
          </UButton>
          <UButton color="warning" variant="soft" @click="reset">
            <template #leading><UIcon name="i-heroicons-arrow-path" class="h-4 w-4" /></template>
            {{ $t('wongTaiSinLot.redraw') }}
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
  allusion?: string
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
        title: lines[0]?.replace(/^##\s*/, '').trim() || t('wongTaiSinLot.interpretation'),
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
    toast.add({ title: t('wongTaiSinLot.questionRequired'), color: 'error' })
    return
  }

  phase.value = 'drawing'
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const [response] = await Promise.all([
      plainFetch<DrawResult>('/api/tools/wong-tai-sin-lot/calc', {
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
      title: t('wongTaiSinLot.drawFailed'),
      description: error?.data?.message || error?.message || t('wongTaiSinLot.checkInput'),
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
    const response = await fetch('/api/tools/wong-tai-sin-lot/reading', {
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
          if (event.type === 'error') aiError.value = event.message || t('wongTaiSinLot.aiUnavailable')
        } catch {
          // Ignore incomplete stream chunks.
        }
      }
    }
  } catch (error: any) {
    aiError.value = error?.message || t('wongTaiSinLot.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function copyResult() {
  if (!result.value) return
  const fortune = result.value.fortune
  const text = [
    t('wongTaiSinLot.resultTitle'),
    `${result.value.lotType.name} · ${t('wongTaiSinLot.numberPrefix')}${fortune.number}${t('wongTaiSinLot.numberSuffix')}`,
    `${fortune.title} · ${fortune.level}`,
    `【${t('wongTaiSinLot.poemTitle')}】\n${fortune.poem}`,
    fortune.allusion ? `【${t('wongTaiSinLot.allusionTitle')}】\n${fortune.allusion}` : '',
    `【${t('wongTaiSinLot.explanationTitle')}】\n${fortune.explanation}`,
    `【${t('wongTaiSinLot.adviceTitle')}】\n${fortune.advice}`,
    aiContent.value ? `【${t('wongTaiSinLot.interpretation')}】\n${aiContent.value}` : '',
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

const pageUrl = useLocalizedSeoUrl('/tools/wong-tai-sin-lot')

useSeoMeta({
  title: () => `${t('seo.wongTaiSinLotTitle')} - ososn`,
  description: () => t('seo.wongTaiSinLotDesc'),
  keywords: () => t('seo.wongTaiSinLotKeywords'),
  ogTitle: () => `${t('seo.wongTaiSinLotOgTitle')} - ososn`,
  ogDescription: () => t('seo.wongTaiSinLotOgDesc'),
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
      name: t('wongTaiSinLot.title'),
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      url: pageUrl.value,
      description: t('seo.wongTaiSinLotOgDesc'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    }),
  }],
}))
</script>

<style scoped>
@keyframes lot-shake {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-8deg); }
  40% { transform: rotate(7deg); }
  60% { transform: rotate(-5deg); }
  80% { transform: rotate(3deg); }
}

.lot-shake {
  animation: lot-shake 1s ease-in-out;
}
</style>
