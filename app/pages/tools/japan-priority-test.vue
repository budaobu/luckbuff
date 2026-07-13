<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：排序表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('japanPriorityTest.formTag') }}</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('japanPriorityTest.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('japanPriorityTest.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 题目 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] overflow-hidden mb-5">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <p class="text-base text-[var(--text-primary)] font-medium leading-relaxed mb-4">
              {{ $t('japanPriorityTest.scenarioIntro') }}
            </p>
            <ul class="space-y-2 mb-4">
              <li
                v-for="item in items"
                :key="item.key"
                class="flex items-start gap-2 text-sm text-[var(--text-body)] leading-relaxed"
              >
                <span class="text-[var(--accent)] font-mono text-xs mt-0.5 w-4 shrink-0">{{ item.num }}.</span>
                {{ $t(`japanPriorityTest.${item.key}`) }}
              </li>
            </ul>
            <p class="text-sm text-[var(--text-muted)]">
              {{ $t('japanPriorityTest.scenarioQuestion') }}
            </p>
          </div>
        </div>

        <!-- 排序交互 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden mb-5">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('japanPriorityTest.rankTitle') }}</p>
              <p class="text-[11px] text-[var(--text-faint)]">{{ $t('japanPriorityTest.rankHint') }}</p>
            </div>

            <ol class="space-y-2">
              <li
                v-for="(item, index) in ordered"
                :key="item.key"
                class="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2.5 transition-all duration-300"
              >
                <span class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-xs font-semibold text-[var(--accent)] shrink-0">
                  {{ index + 1 }}
                </span>
                <span class="flex-1 text-sm text-[var(--text-primary)]">{{ $t(`japanPriorityTest.${item.key}`) }}</span>
                <div class="flex gap-1 shrink-0">
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
                    :class="index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[var(--accent)] hover:border-[var(--accent-border)]'"
                    :disabled="index === 0"
                    :aria-label="$t('japanPriorityTest.moveUp')"
                    @click="move(index, -1)"
                  >
                    <UIcon name="i-heroicons-chevron-up" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
                    :class="index === ordered.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[var(--accent)] hover:border-[var(--accent-border)]'"
                    :disabled="index === ordered.length - 1"
                    :aria-label="$t('japanPriorityTest.moveDown')"
                    @click="move(index, 1)"
                  >
                    <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
                  </button>
                </div>
              </li>
            </ol>

            <div class="flex items-center justify-between mt-5">
              <button
                type="button"
                class="text-xs text-[var(--text-faint)] hover:text-[var(--accent-muted)] transition-colors"
                @click="shuffle"
              >
                {{ $t('japanPriorityTest.shuffle') }}
              </button>
              <UButton
                color="warning"
                size="md"
                class="group/btn justify-center"
                @click="handleSubmit"
              >
                {{ $t('japanPriorityTest.submitBtn') }}
                <template #trailing>
                  <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                </template>
              </UButton>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('japanPriorityTest.disclaimer') }}
          </p>
        </div>

        <!-- 知识卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('japanPriorityTest.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('japanPriorityTest.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('japanPriorityTest.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('japanPriorityTest.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('japanPriorityTest.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('japanPriorityTest.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('japanPriorityTest.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('japanPriorityTest.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：结果 -->
      <div v-if="phase === 'result'">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">{{ $t('japanPriorityTest.resultLabel') }}</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('japanPriorityTest.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 排序结果卡（可截图） -->
          <div
            ref="shareCardRef"
            class="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
            :style="{ background: 'linear-gradient(180deg, var(--card-gradient-from), transparent), var(--surface-card)' }"
          >
            <div class="relative z-10">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-3">{{ $t('japanPriorityTest.yourOrderTitle') }}</p>
              <ol class="space-y-2">
                <li
                  v-for="(item, index) in submittedOrder"
                  :key="item.key"
                  class="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)]/60 px-3 py-2.5"
                >
                  <span class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-xs font-semibold text-[var(--accent)] shrink-0">
                    {{ index + 1 }}
                  </span>
                  <span class="flex-1 text-sm text-[var(--text-primary)]">{{ item.text }}</span>
                  <span class="text-[10px] text-[var(--text-faint)] shrink-0">{{ item.symbol }}</span>
                </li>
              </ol>
            </div>
          </div>

          <!-- AI 解读 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('japanPriorityTest.interpretation') }}</h3>
              </div>
              <div v-if="aiStreaming" class="flex items-center gap-1.5">
                <span class="text-xs text-[var(--accent-muted)]">{{ $t('japanPriorityTest.interpreting') }}</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
              </div>
            </div>

            <div v-if="aiSections.length > 0" class="space-y-3">
              <div
                v-for="(section, index) in aiSections"
                :key="section.title"
                class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
                :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
              >
                <div class="relative z-10 p-4">
                  <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    {{ section.title }}
                  </h4>
                  <div class="ai-section-content" v-html="renderMarkdown(section.content)" />
                  <span
                    v-if="aiStreaming && index === aiSections.length - 1"
                    class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
                  />
                </div>
              </div>
            </div>

            <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
                </div>
                <p class="text-xs text-[var(--text-muted)]">{{ $t('japanPriorityTest.generatingInterpretation') }}</p>
              </div>
            </div>

            <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
                <p class="text-sm text-red-400">{{ aiError }}</p>
              </div>
            </div>

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
                {{ $t('japanPriorityTest.reinterpret') }}
              </UButton>
            </div>
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
            {{ $t('japanPriorityTest.copyResult') }}
          </UButton>
          <AppShareButton
            tool="japan-priority-test"
            :summary="shareSummary"
            :share-target="shareCardRef ?? undefined"
            :filename="`japan-priority-test-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('japanPriorityTest.retest') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo(localePath('/psychological-test')) }"
          >
            <template #leading>
              <UIcon name="i-heroicons-beaker" class="w-4 h-4" />
            </template>
            {{ $t('japanPriorityTest.backToCategory') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface PriorityItem {
  key: 'baby' | 'toilet' | 'phone' | 'doorbell' | 'tap'
  num: number
}

const items: PriorityItem[] = [
  { key: 'baby', num: 1 },
  { key: 'toilet', num: 2 },
  { key: 'phone', num: 3 },
  { key: 'doorbell', num: 4 },
  { key: 'tap', num: 5 },
]

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'result'>('form')
const ordered = ref<PriorityItem[]>([...items])
const submittedOrder = ref<{ key: string; text: string; symbol: string }[]>([])

const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()
const shareCardRef = ref<HTMLDivElement | null>(null)

const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = useRequestURL().origin
const pagePath = '/tools/japan-priority-test'

const symbolKeys: Record<PriorityItem['key'], string> = {
  baby: 'symbolBaby',
  toilet: 'symbolToilet',
  phone: 'symbolPhone',
  doorbell: 'symbolDoorbell',
  tap: 'symbolTap',
}

function itemText(key: PriorityItem['key']): string {
  return t(`japanPriorityTest.${key}`)
}

function itemSymbol(key: PriorityItem['key']): string {
  return t(`japanPriorityTest.${symbolKeys[key]}`)
}

function move(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= ordered.value.length) return
  const next = [...ordered.value]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved!)
  ordered.value = next
}

function shuffle() {
  const next = [...ordered.value]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  ordered.value = next
}

const shareSummary = computed(() => {
  if (!submittedOrder.value.length) return ''
  return submittedOrder.value.map(item => item.text).join(' → ')
})

async function handleSubmit() {
  submittedOrder.value = ordered.value.map(item => ({
    key: item.key,
    text: itemText(item.key),
    symbol: itemSymbol(item.key),
  }))
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  phase.value = 'result'

  setTimeout(() => startAiStream(), 300)
}

async function startAiStream() {
  if (!submittedOrder.value.length) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/japan-priority-test/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: submittedOrder.value.map(item => ({ key: item.key, text: item.text })),
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
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('japanPriorityTest.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('japanPriorityTest.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  submittedOrder.value = []
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
}

function handleCopy() {
  if (!submittedOrder.value.length) return
  const text = `${t('japanPriorityTest.resultTitle')}

【${t('japanPriorityTest.yourOrderTitle')}】
${submittedOrder.value.map((item, i) => `${i + 1}. ${item.text}（${item.symbol}）`).join('\n')}

${aiContent.value ? '【' + t('japanPriorityTest.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

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
      result.push({ title: titleLine || t('japanPriorityTest.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

useSeoMeta({
  title: () => `${t('seo.japanPriorityTestTitle')} - ${siteName}`,
  description: t('seo.japanPriorityTestDesc'),
  keywords: t('seo.japanPriorityTestKeywords'),
  ogTitle: () => `${t('seo.japanPriorityTestOgTitle')} - ${siteName}`,
  ogDescription: t('seo.japanPriorityTestOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}${pagePath}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.japanPriorityTestTitle')} - ${siteName}`,
        url: `${siteUrl}${pagePath}`,
        description: t('seo.japanPriorityTestDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('japanPriorityTest.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}${pagePath}`,
          description: t('seo.japanPriorityTestOgDesc'),
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
}
</style>
