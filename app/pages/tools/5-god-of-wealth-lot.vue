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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Five Gods of Wealth Lot</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('wealthGodLot.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('wealthGodLot.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('wealthGodLot.disclaimer') }}
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
                  {{ $t('wealthGodLot.questionLabel') }}
                </label>
                <QuestionInspiration @select="onQuestionSelect" />
              </div>
              <UTextarea
                v-model="form.question"
                :placeholder="$t('wealthGodLot.questionPlaceholder')"
                :rows="3"
                class="w-full"
                :ui="textareaUi"
              />
              <p class="text-[11px] text-[var(--text-faint)]">
                {{ $t('wealthGodLot.questionHint') }}
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
              {{ $t('wealthGodLot.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wealthGodLot.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wealthGodLot.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wealthGodLot.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wealthGodLot.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wealthGodLot.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wealthGodLot.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('wealthGodLot.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('wealthGodLot.knowledgeCard4Desc') }}</p>
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
          <p class="min-h-[1.25rem] text-sm text-[var(--text-muted)]">{{ $t('wealthGodLot.shaking') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果（签谱海报为唯一结果展示形态） ============ -->
      <div v-if="phase === 'result' && calcResult">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('wealthGodLot.resultTitle') }}
          </h1>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 隐藏截图目标：AI 解读收尾后挂载，保证分享图不含半截解读 -->
        <div v-if="!aiStreaming" ref="posterRef" v-show="false" class="wealth-god-lot-share-target">
          <WealthGodLotPoster :result="calcResult" :ai-content="aiContent" />
        </div>

        <!-- 页内展示：庙宇签谱海报（AI 流式融入「财运指引」） -->
        <WealthGodLotPoster :result="calcResult" :ai-content="aiContent" />

        <!-- 解签状态条（融入海报之下，非独立卡片） -->
        <div class="wealth-god-lot-ai-bar">
          <div v-if="aiStreaming" class="flex items-center justify-center gap-2 py-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
            <span class="text-xs text-[var(--accent-muted)]">{{ $t('wealthGodLot.interpreting') }}</span>
          </div>
          <div v-else-if="aiError" class="flex items-center justify-center gap-2 py-1">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
            <p class="text-xs text-red-400">{{ aiError }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('wealthGodLot.reinterpret') }}
            </UButton>
          </div>
          <div v-else-if="aiContent" class="flex items-center justify-center gap-4 py-1">
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('wealthGodLot.reinterpret') }}
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
            {{ $t('wealthGodLot.copyResult') }}
          </UButton>
          <AppShareButton
            tool="wealth-god-lot"
            :disabled="aiStreaming"
            :summary="`${calcResult.lotType.name} 第${calcResult.fortune.number}签 · ${calcResult.fortune.level} · ${calcResult.fortune.title}`"
            :share-target="posterRef || undefined"
            :filename="`wealth-god-lot-${calcResult.fortune.number}-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('wealthGodLot.redraw') }}
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
            {{ $t('wealthGodLot.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const lotShakeTheme = useLotShakeTheme('wealthGod')
const form = reactive({
  question: '',
})
const calcResult = ref<DrawALotCalcResult | null>(null)

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const posterRef = ref<HTMLDivElement>()

const toast = useToast()

function validateForm(): string | null {
  if (!form.question.trim()) return t('wealthGodLot.questionRequired')
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
    const resultPromise = plainFetch<DrawALotCalcResult>('/api/tools/5-god-of-wealth-lot/calc', {
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
      title: t('wealthGodLot.drawFail'),
      description: err.data?.message || err.message || t('wealthGodLot.checkInput'),
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
    const response = await fetch('/api/tools/5-god-of-wealth-lot/reading', {
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
            aiError.value = data.message || t('wealthGodLot.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('wealthGodLot.aiUnavailable')
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
  const text = `${t('wealthGodLot.resultTitle')}

${calcResult.value.lotType.name} · ${t('wealthGodLot.numberLabel')}${f.number}${t('wealthGodLot.numberSuffix')}
${f.title} · ${f.level}

【${t('wealthGodLot.poemTitle')}】
${f.poem}

【${t('wealthGodLot.explanationTitle')}】
${f.explanation}

【${t('wealthGodLot.adviceTitle')}】
${f.advice}

${form.question ? t('wealthGodLot.questionLabel') + '：' + form.question + '\n' : ''}${aiContent.value ? '【' + t('wealthGodLot.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// UI Config
const textareaUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const siteName = 'ososn'

const pageUrl = useLocalizedSeoUrl('/tools/5-god-of-wealth-lot')

useSeoMeta({
  title: () => `${t('seo.wealthGodLotTitle')} - ${siteName}`,
  description: t('seo.wealthGodLotDesc'),
  keywords: t('seo.wealthGodLotKeywords'),
  ogTitle: () => `${t('seo.wealthGodLotOgTitle')} - ${siteName}`,
  ogDescription: t('seo.wealthGodLotOgDesc'),
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
        name: `${t('seo.wealthGodLotTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.wealthGodLotDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('wealthGodLot.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('seo.wealthGodLotOgDesc'),
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
.wealth-god-lot-ai-bar {
  margin-top: 10px;
}
</style>
