<template>
  <div class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute top-[8%] right-[12%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[110px]" />
      <div class="absolute bottom-[22%] left-[8%] h-[300px] w-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[95px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-2xl px-6 py-12">
      <div v-if="phase === 'form'">
        <header class="mb-7">
          <span class="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Omikuji</span>
          <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {{ $t('omikuji.title') }}
          </h1>
          <p class="mt-2 text-sm text-[var(--text-faint)]">{{ $t('omikuji.subtitle') }}</p>
          <div class="mt-4 h-px w-12 bg-[var(--accent-border-hover)]" />
        </header>

        <div class="mb-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
          <p class="text-center text-[11px] leading-relaxed text-[var(--text-faint)]">
            {{ $t('omikuji.disclaimer') }}
          </p>
        </div>

        <section class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="space-y-5 p-6">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="omikuji-question" class="text-xs font-medium text-[var(--text-muted)]">
                  {{ $t('omikuji.questionLabel') }}
                </label>
                <QuestionInspiration @select="onQuestionSelect" />
              </div>
              <UTextarea
                id="omikuji-question"
                v-model="question"
                :placeholder="$t('omikuji.questionPlaceholder')"
                :rows="3"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <UButton color="primary" size="lg" block :disabled="phase !== 'form'" @click="drawLot">
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="h-5 w-5" />
              </template>
              {{ $t('omikuji.draw') }}
            </UButton>
          </div>
        </section>

        <section class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article
            v-for="card in knowledgeCards"
            :key="card.title"
            class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
          >
            <h2 class="mb-2 text-sm font-semibold text-[var(--text-primary)]">{{ card.title }}</h2>
            <p class="text-xs leading-relaxed text-[var(--text-faint)]">{{ card.description }}</p>
          </article>
        </section>
      </div>

      <div v-else-if="phase === 'drawing'" class="flex min-h-[60vh] flex-col items-center justify-center">
        <div class="relative flex h-52 w-36 items-start justify-center">
          <div class="omikuji-box" :class="{ shake: animationStep === 0 }">
            <span class="box-lid" />
            <span class="box-face">
              <span>{{ $t('omikuji.boxMark') }}</span>
            </span>
          </div>
          <div class="omikuji-slip" :class="{ drop: animationStep === 1 }" />
          <div class="box-shadow" :class="{ grow: animationStep === 1 }" />
        </div>
        <p class="mt-6 min-h-5 text-sm text-[var(--text-muted)]">
          {{ animationStep === 0 ? $t('omikuji.shaking') : $t('omikuji.opening') }}
        </p>
      </div>

      <div v-else-if="result">
        <div class="mb-8">
          <span class="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">Result</span>
          <h1 class="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {{ $t('omikuji.resultTitle') }}
          </h1>
          <div class="mt-4 h-px w-12 bg-[var(--accent-border-hover)]" />
        </div>

        <div v-if="!aiStreaming" ref="posterRef" v-show="false">
          <OmikujiPoster :result="result" :ai-content="aiContent" />
        </div>
        <OmikujiPoster :result="result" :ai-content="aiContent" />

        <div class="mt-3 flex min-h-8 items-center justify-center">
          <span v-if="aiStreaming" class="flex items-center gap-2 text-xs text-[var(--accent-muted)]">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            {{ $t('omikuji.interpreting') }}
          </span>
          <template v-else>
            <p v-if="aiError" class="text-xs text-red-400">{{ aiError }}</p>
            <UButton
              v-if="aiError || aiContent"
              color="primary"
              variant="soft"
              size="xs"
              @click="startAiStream"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="h-3.5 w-3.5" />
              </template>
              {{ $t('omikuji.reinterpret') }}
            </UButton>
          </template>
        </div>

        <div class="mt-10 flex flex-wrap justify-center gap-3">
          <UButton color="primary" variant="soft" @click="copyResult">
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="h-4 w-4" />
            </template>
            {{ $t('omikuji.copy') }}
          </UButton>
          <AppShareButton
            tool="omikuji"
            :disabled="aiStreaming"
            :summary="shareSummary"
            :share-target="posterRef || undefined"
            :filename="`omikuji-${result.fortune.number}.png`"
          />
          <UButton color="primary" variant="soft" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
            </template>
            {{ $t('omikuji.redraw') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="navigateTo('/tools')"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="h-4 w-4" />
            </template>
            {{ $t('omikuji.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface OmikujiCalcResult {
  lotType: { id: string; name: string; count: number }
  fortune: {
    number: number
    rank: string
    rankCode: string
    title: string
    poem: string
    summary: string
    action: string
    luckyDirection: string
    symbolColor: string
    aspects: Array<{ key: string; label: string; text: string }>
  }
  question: string
}

const { t, locale } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'drawing' | 'result'>('form')
const animationStep = ref<0 | 1>(0)
const question = ref('')
const result = ref<OmikujiCalcResult | null>(null)
const posterRef = ref<HTMLDivElement>()
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

const knowledgeCards = computed(() => [
  {
    title: t('omikuji.knowledge1Title'),
    description: t('omikuji.knowledge1Desc'),
  },
  {
    title: t('omikuji.knowledge2Title'),
    description: t('omikuji.knowledge2Desc'),
  },
  {
    title: t('omikuji.knowledge3Title'),
    description: t('omikuji.knowledge3Desc'),
  },
  {
    title: t('omikuji.knowledge4Title'),
    description: t('omikuji.knowledge4Desc'),
  },
])

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

const shareSummary = computed(() => {
  const fortune = result.value?.fortune
  return fortune ? `${result.value!.lotType.name} No.${fortune.number} · ${fortune.rank} · ${fortune.title}` : ''
})

function onQuestionSelect(value: string) {
  question.value = value
}

async function drawLot() {
  if (!question.value.trim()) {
    toast.add({ title: t('omikuji.questionRequired'), color: 'error' })
    return
  }

  phase.value = 'drawing'
  animationStep.value = 0
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  setTimeout(() => {
    animationStep.value = 1
  }, 900)

  try {
    const drawn = await plainFetch<OmikujiCalcResult>('/api/tools/omikuji/calc', {
      method: 'POST',
      body: { question: question.value.trim(), locale: locale.value },
    })

    setTimeout(() => {
      result.value = drawn
      phase.value = 'result'
      setTimeout(() => startAiStream(), 250)
    }, 1800)
  } catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('omikuji.drawFailed'),
      description: error?.data?.message || error?.message || t('omikuji.checkInput'),
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/omikuji/reading', {
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
        const raw = line.trim()
        if (!raw.startsWith('data:')) continue
        const payload = raw.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) aiContent.value += data.text
          if (data.type === 'error') aiError.value = data.message || t('omikuji.aiUnavailable')
        } catch {
          // Ignore non-JSON SSE chunks.
        }
      }
    }
  } catch (error: any) {
    aiError.value = error?.message || t('omikuji.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

async function copyResult() {
  if (!result.value) return
  const fortune = result.value.fortune
  const text = [
    t('omikuji.resultTitle'),
    `${result.value.lotType.name} No.${fortune.number} · ${fortune.rank} · ${fortune.title}`,
    '',
    fortune.poem,
    '',
    `${t('omikujiPoster.summaryLabel')}: ${fortune.summary}`,
    `${t('omikujiPoster.actionLabel')}: ${fortune.action}`,
    `${t('omikujiPoster.directionLabel')}: ${fortune.luckyDirection}`,
    `${t('omikujiPoster.colorLabel')}: ${fortune.symbolColor}`,
    '',
    aiContent.value ? `${t('omikuji.interpretation')}\n${aiContent.value}` : '',
  ].filter(Boolean).join('\n')

  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: t('share.textCopied'), color: 'success' })
  } catch {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  }
}

function resetForm() {
  phase.value = 'form'
  animationStep.value = 0
  result.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
}

const pageUrl = useLocalizedSeoUrl('/tools/omikuji')
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.omikujiTitle')} - ${siteName}`,
  description: () => t('seo.omikujiDesc'),
  keywords: () => t('seo.omikujiKeywords'),
  ogTitle: () => `${t('seo.omikujiOgTitle')} - ${siteName}`,
  ogDescription: () => t('seo.omikujiOgDesc'),
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
      name: `${t('seo.omikujiTitle')} - ${siteName}`,
      url: pageUrl.value,
      description: t('seo.omikujiDesc'),
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: t('omikuji.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.omikujiOgDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      },
    }),
  }],
}))
</script>

<style scoped>
.omikuji-box {
  position: absolute;
  top: 52px;
  left: 50%;
  width: 96px;
  height: 82px;
  transform: translateX(-50%);
}

.box-face {
  position: absolute;
  inset: 12px 0 0;
  display: grid;
  place-items: center;
  border: 2px solid var(--accent-border);
  border-radius: 12px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--accent) 6%, transparent));
  color: var(--accent);
  font-size: 20px;
  font-weight: 700;
}

.box-lid {
  position: absolute;
  top: 0;
  left: -6px;
  width: 108px;
  height: 26px;
  border: 2px solid var(--accent-border);
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent-bg) 70%, transparent);
}

.omikuji-slip {
  position: absolute;
  top: 66px;
  left: 50%;
  width: 40px;
  height: 92px;
  border: 1px solid var(--accent-border);
  border-radius: 5px;
  background: #fff;
  opacity: 0;
  transform: translate(-50%, -12px) rotate(-10deg);
  box-shadow: 0 8px 18px rgb(0 0 0 / 14%);
}

.box-shadow {
  position: absolute;
  bottom: 12px;
  left: 50%;
  width: 72px;
  height: 9px;
  border-radius: 50%;
  background: rgb(0 0 0 / 22%);
  filter: blur(5px);
  transform: translateX(-50%);
}

.shake {
  animation: box-shake .85s ease-in-out;
}

.drop {
  opacity: 1;
  animation: slip-drop .95s cubic-bezier(.25, .46, .45, .94) forwards;
}

.grow {
  opacity: .9;
  transition: opacity .4s ease .3s;
}

@keyframes box-shake {
  0%, 100% { transform: translateX(-50%) rotate(0); }
  20% { transform: translateX(-54%) rotate(-4deg); }
  45% { transform: translateX(-46%) rotate(4deg); }
  70% { transform: translateX(-52%) rotate(-2deg); }
}

@keyframes slip-drop {
  0% { opacity: 0; transform: translate(-50%, -30px) rotate(-12deg); }
  30% { opacity: 1; }
  100% { opacity: 1; transform: translate(-50%, 58px) rotate(5deg); }
}
</style>
