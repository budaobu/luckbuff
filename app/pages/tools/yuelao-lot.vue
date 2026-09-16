<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute right-[15%] top-[10%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[28%] left-[12%] h-[280px] w-[280px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-2xl px-6 py-12">
      <div v-if="phase === 'form'">
        <header class="mb-8">
          <p class="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Yuelao Oracle</p>
          <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {{ $t('yuelaoLot.title') }}
          </h1>
          <p class="mt-2 text-sm text-[var(--text-faint)]">{{ $t('yuelaoLot.subtitle') }}</p>
          <div class="mt-4 h-px w-12 bg-[var(--accent-border-hover)]" />
        </header>

        <div class="mb-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
          <p class="text-center text-[11px] leading-relaxed text-[var(--text-faint)]">
            {{ $t('yuelaoLot.disclaimer') }}
          </p>
        </div>

        <section class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div class="p-6">
            <label class="text-xs font-medium text-[var(--text-muted)]" for="yuelao-question">
              {{ $t('yuelaoLot.questionLabel') }}
            </label>
            <UTextarea
              id="yuelao-question"
              v-model="question"
              class="mt-2 w-full"
              :rows="3"
              :placeholder="$t('yuelaoLot.questionPlaceholder')"
              :ui="textareaUi"
            />
            <p class="mt-2 text-[11px] text-[var(--text-faint)]">{{ $t('yuelaoLot.questionHint') }}</p>
            <UButton class="mt-6 w-full" color="warning" size="lg" block @click="draw">
              <template #leading>
                <UIcon name="i-heroicons-gift-top" class="h-5 w-5" />
              </template>
              {{ $t('yuelaoLot.toolCta') }}
            </UButton>
          </div>
        </section>
      </div>

      <div v-else-if="phase === 'animating'" class="flex min-h-[60vh] items-center justify-center">
        <div class="relative h-52 w-32 rounded-b-2xl border-2 border-[var(--accent-border)] bg-[var(--accent-bg)]/30">
          <div class="absolute inset-0 animate-pulse rounded-b-2xl bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <div v-else-if="result" class="pt-4">
        <div ref="posterRef" v-show="false" v-if="!aiStreaming">
          <YuelaoLotPoster :result="result" :ai-content="aiContent" />
        </div>
        <YuelaoLotPoster :result="result" :ai-content="aiContent" />

        <section v-if="aiSections.length" class="mt-5 space-y-3">
          <article
            v-for="section in aiSections"
            :key="section.title"
            class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5"
          >
            <h2 class="mb-2 text-sm font-semibold text-[var(--text-primary)]">{{ section.title }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="ylp-ai-content text-sm leading-7 text-[var(--text-body)]" v-html="renderMarkdown(section.content)" />
          </article>
        </section>

        <div class="mt-3 text-center">
          <p v-if="aiStreaming" class="text-xs text-[var(--accent-muted)]">{{ $t('yuelaoLot.interpreting') }}</p>
          <p v-else-if="aiError" class="text-xs text-red-400">{{ aiError }}</p>
          <UButton
            v-else-if="aiContent"
            class="mt-2"
            color="warning"
            size="xs"
            variant="soft"
            @click="readLot"
          >
            {{ $t('yuelaoLot.reinterpret') }}
          </UButton>
        </div>

        <nav class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton color="warning" variant="soft" @click="copyResult">
            {{ $t('yuelaoLot.copyResult') }}
          </UButton>
          <AppShareButton
            tool="yuelao-lot"
            :disabled="aiStreaming"
            :summary="`${result.lotType.name} 第${result.fortune.id}签 · ${result.fortune.rank}`"
            :share-target="posterRef || undefined"
            :filename="`yuelao-lot-${result.fortune.id}.png`"
          />
          <UButton color="warning" variant="soft" :to="localePath(`/tools/yuelao-lots/${result.fortune.id}`)">
            {{ $t('yuelaoLot.viewDetail') }}
          </UButton>
          <UButton color="neutral" variant="ghost" @click="reset">
            {{ $t('yuelaoLot.redraw') }}
          </UButton>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface YuelaoLotResult {
  lotType: { id: 'yuelao'; name: string; count: number }
  fortune: {
    id: number
    rank: string
    rankCode: 'upper' | 'upper-middle' | 'middle' | 'lower-middle' | 'lower'
    poem: string
    source: string
  }
  question: string
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const question = ref('')
const result = ref<YuelaoLotResult | null>(null)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)
const posterRef = ref<HTMLDivElement>()

const aiSections = computed(() => aiContent.value
  .split(/\n(?=##\s)/)
  .map(section => section.trim())
  .filter(Boolean)
  .map((section) => {
    const [title = '', ...body] = section.split('\n')
    return { title: title.replace(/^##\s*/, ''), content: body.join('\n').trim() }
  }))

function renderMarkdown(text: string) {
  return marked.parse(text, { async: false }) as string
}

async function draw() {
  if (!question.value.trim()) {
    toast.add({ title: t('yuelaoLot.questionRequired'), color: 'error' })
    return
  }
  phase.value = 'animating'
  result.value = null
  aiContent.value = ''
  aiError.value = null
  try {
    result.value = await $fetch<YuelaoLotResult>('/api/tools/yuelao-lot/calc', {
      method: 'POST',
      body: { question: question.value.trim(), locale: locale.value },
    })
    phase.value = 'result'
    setTimeout(readLot, 200)
  } catch {
    phase.value = 'form'
    toast.add({ title: t('yuelaoLot.drawFailed'), color: 'error' })
  }
}

async function readLot() {
  if (!result.value || aiStreaming.value) return
  aiContent.value = ''
  aiError.value = null
  aiStreaming.value = true
  try {
    const response = await fetch('/api/tools/yuelao-lot/reading', {
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
        const payload = line.replace(/^data:\s*/, '').trim()
        if (!line.startsWith('data:') || !payload || payload === '[DONE]') continue
        const event = JSON.parse(payload)
        if (event.type === 'text') aiContent.value += event.text
        if (event.type === 'error') aiError.value = event.message
      }
    }
  } catch {
    aiError.value = t('yuelaoLot.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

async function copyResult() {
  if (!result.value) return
  const text = [
    `${result.value.lotType.name} · 第${result.value.fortune.id}签`,
    result.value.fortune.rank,
    result.value.fortune.poem,
    result.value.fortune.source,
    aiContent.value,
  ].filter(Boolean).join('\n\n')
  await navigator.clipboard.writeText(text)
  toast.add({ title: t('share.textCopied'), color: 'success' })
}

function reset() {
  phase.value = 'form'
  question.value = ''
  result.value = null
  aiContent.value = ''
}

const textareaUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

const pageUrl = useLocalizedSeoUrl('/tools/yuelao-lot')
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.yuelaoLotTitle')} - ${siteName}`,
  description: t('seo.yuelaoLotDesc'),
  keywords: t('seo.yuelaoLotKeywords'),
  ogTitle: () => `${t('seo.yuelaoLotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.yuelaoLotOgDesc'),
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
      '@type': 'WebPage',
      name: `${t('seo.yuelaoLotTitle')} - ${siteName}`,
      url: pageUrl.value,
      description: t('seo.yuelaoLotDesc'),
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: t('yuelaoLot.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.yuelaoLotOgDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      },
    }),
  }],
}))

</script>

<style scoped>
.ylp-ai-content :deep(p) {
  margin-bottom: 0.6em;
}

.ylp-ai-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
