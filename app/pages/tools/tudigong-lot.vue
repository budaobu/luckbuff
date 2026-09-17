<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute right-[15%] top-[10%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[28%] left-[12%] h-[280px] w-[280px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-2xl px-6 py-12">
      <div v-if="phase === 'form'">
        <header class="mb-8">
          <p class="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Tudigong Oracle</p>
          <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {{ $t('tudigongLot.title') }}
          </h1>
          <p class="mt-2 text-sm text-[var(--text-faint)]">{{ $t('tudigongLot.subtitle') }}</p>
          <div class="mt-4 h-px w-12 bg-[var(--accent-border-hover)]" />
        </header>

        <div class="mb-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
          <p class="text-center text-[11px] leading-relaxed text-[var(--text-faint)]">
            {{ $t('tudigongLot.disclaimer') }}
          </p>
        </div>

        <section class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div class="p-6">
            <div class="flex items-center justify-between gap-3">
              <label class="text-xs font-medium text-[var(--text-muted)]" for="tudigong-question">
                {{ $t('tudigongLot.questionLabel') }}
              </label>
              <QuestionInspiration @select="value => question = value" />
            </div>
            <UTextarea
              id="tudigong-question"
              v-model="question"
              class="mt-2 w-full"
              :rows="3"
              :placeholder="$t('tudigongLot.questionPlaceholder')"
              :ui="textareaUi"
            />
            <p class="mt-2 text-[11px] text-[var(--text-faint)]">{{ $t('tudigongLot.questionHint') }}</p>
            <UButton class="mt-6 w-full" color="warning" size="lg" block @click="draw">
              <template #leading>
                <UIcon name="i-heroicons-globe-alt" class="h-5 w-5" />
              </template>
              {{ $t('tudigongLot.toolCta') }}
            </UButton>
          </div>
        </section>
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
        <p class="text-sm text-[var(--text-muted)]">{{ $t('tudigongLot.drawing') }}</p>
      </div>

      <div v-else-if="result" class="pt-4">
        <TudigongLotPoster :result="result" :ai-content="aiContent" />

        <section v-if="aiSections.length" class="mt-5 space-y-3">
          <article
            v-for="section in aiSections"
            :key="section.title"
            class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5"
          >
            <h2 class="mb-2 text-sm font-semibold text-[var(--text-primary)]">{{ section.title }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="dzl-ai-content text-sm leading-7 text-[var(--text-body)]" v-html="renderMarkdown(section.content)" />
          </article>
        </section>

        <div class="mt-3 text-center">
          <p v-if="aiStreaming" class="text-xs text-[var(--accent-muted)]">{{ $t('tudigongLot.interpreting') }}</p>
          <p v-else-if="aiError" class="text-xs text-red-400">{{ aiError }}</p>
          <UButton
            v-else-if="aiContent"
            class="mt-2"
            color="warning"
            size="xs"
            variant="soft"
            @click="readLot"
          >
            {{ $t('tudigongLot.reinterpret') }}
          </UButton>
        </div>

        <nav class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton color="warning" variant="soft" @click="copyResult">
            {{ $t('tudigongLot.copyResult') }}
          </UButton>
          <AppShareButton
            tool="tudigong-lot"
            :disabled="aiStreaming"
            :summary="`${result.lotType.name} 第${result.fortune.number}签 · ${result.fortune.level}`"
            :filename="`tudigong-lot-${result.fortune.number}.png`"
          />
          <UButton color="warning" variant="soft" :to="localePath(`/tools/tudigong-lots/${result.fortune.number}`)">
            {{ $t('tudigongLot.viewDetail') }}
          </UButton>
          <UButton color="neutral" variant="ghost" @click="reset">
            {{ $t('tudigongLot.redraw') }}
          </UButton>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { DrawALotCalcResult } from '~~/server/utils/tools/draw-a-lot-data'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'drawing' | 'result'>('form')
const question = ref('')
const result = ref<(DrawALotCalcResult & { question: string }) | null>(null)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

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
    toast.add({ title: t('tudigongLot.questionRequired'), color: 'error' })
    return
  }

  phase.value = 'drawing'
  result.value = null
  aiContent.value = ''
  aiError.value = null

  try {
    const [response] = await Promise.all([
      $fetch<DrawALotCalcResult & { question: string }>('/api/tools/tudigong-lot/calc', {
        method: 'POST',
        body: { question: question.value.trim(), locale: locale.value },
      }),
      new Promise(resolve => setTimeout(resolve, 1500)),
    ])
    result.value = response
    phase.value = 'result'
    setTimeout(readLot, 200)
  } catch {
    phase.value = 'form'
    toast.add({ title: t('tudigongLot.drawFailed'), color: 'error' })
  }
}

async function readLot() {
  if (!result.value || aiStreaming.value) return
  aiContent.value = ''
  aiError.value = null
  aiStreaming.value = true

  try {
    const response = await fetch('/api/tools/tudigong-lot/reading', {
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
    aiError.value = t('tudigongLot.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

async function copyResult() {
  if (!result.value) return
  const fortune = result.value.fortune
  const text = [
    `${result.value.lotType.name} · 第${fortune.number}签`,
    `${fortune.level}`,
    fortune.poem,
    `【断曰】\n${fortune.explanation.replace(/^断曰：/, '')}`,
    `【米力仙注】\n${fortune.sacredMeaning?.replace(/^米力仙注：/, '')}`,
    `【行动提示】\n${fortune.advice}`,
    aiContent.value ? `【AI 解读】\n${aiContent.value}` : '',
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

const pageUrl = useLocalizedSeoUrl('/tools/tudigong-lot')
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.tudigongLotTitle')} - ${siteName}`,
  description: t('seo.tudigongLotDesc'),
  keywords: t('seo.tudigongLotKeywords'),
  ogTitle: () => `${t('seo.tudigongLotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.tudigongLotOgDesc'),
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
      name: `${t('seo.tudigongLotTitle')} - ${siteName}`,
      url: pageUrl.value,
      description: t('seo.tudigongLotDesc'),
      inLanguage: locale.value,
      isPartOf: { '@type': 'WebSite', name: 'LuckBuff', url: 'https://www.ososn.com' },
    }),
  }],
}))
</script>
