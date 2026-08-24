<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent-purple)]/[0.06] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：起手式 ============ -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Astrology Dice</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('astroDice.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('astroDice.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('astroDice.disclaimer') }}
          </p>
        </div>

        <!-- 摇骰卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-6">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <p class="text-sm text-[var(--text-muted)] leading-relaxed text-center">
              {{ $t('astroDice.intro') }}
            </p>
            <UButton
              color="warning"
              size="lg"
              block
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleRoll"
            >
              <template #leading>
                <UIcon name="i-heroicons-cube" class="w-5 h-5" />
              </template>
              {{ $t('astroDice.rollBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mb-6">
          <h3 class="text-xs font-medium text-[var(--text-muted)] mb-3 tracking-wide">{{ $t('astroDice.knowledgeTitle') }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div v-for="(k, i) in knowledgeCards" :key="i" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                  <UIcon :name="k.icon" class="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div>
                  <h4 class="text-sm font-medium text-[var(--text-primary)] mb-1">{{ k.title }}</h4>
                  <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">{{ k.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：摔骰动画 ============ -->
      <div v-else-if="phase === 'rolling'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="w-full max-w-xl">
          <DiceAstrologyDiceRoller
            ref="rollerRef"
            :results="diceResults"
            :symbols="diceSymbols"
            @landed="handleLanded"
          />
          <p class="text-sm text-[var(--text-muted)] text-center mt-4">{{ $t('astroDice.rolling') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果（只有海报） ============ -->
      <div v-else-if="phase === 'result' && calcResult">
        <div class="max-w-md mx-auto">
          <AstroDicePoster
            ref="posterCompRef"
            :result="calcResult"
            :ai-content="aiContent"
            :ai-failed="!!aiError"
          />
        </div>

        <p class="text-[11px] text-[var(--text-faint)] text-center mt-4 leading-relaxed">
          {{ $t('astroDice.disclaimer') }}
        </p>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-6 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleRoll"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('astroDice.reroll') }}
          </UButton>
          <AppShareButton
            tool="astro-dice"
            :summary="shareSummary"
            :share-target="posterEl"
            :filename="`astro-dice-${calcResult.seed.slice(0, 8)}.png`"
            :disabled="aiStreaming"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo(localePath('/astrology')) }"
          >
            <template #leading>
              <UIcon name="i-heroicons-star" class="w-4 h-4" />
            </template>
            {{ $t('astroDice.backToAstrology') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AstroDiceCalcResult, AstroDiceFace } from '~/types/astro-dice'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'rolling' | 'result'>('form')
const calcResult = ref<AstroDiceCalcResult | null>(null)
const rollerRef = ref<{ roll: () => void } | null>(null)
const posterCompRef = ref<{ $el: HTMLElement } | null>(null)
// 分享截图直接传海报根元素，同 liunian 的实测结论：传包裹 div 会导致导出排版超宽被裁
const posterEl = computed(() => posterCompRef.value?.$el as HTMLElement | undefined)

/* ---------- 骰面本地化 ---------- */

function faceName(face: AstroDiceFace): string {
  if (locale.value === 'en') return face.nameEn
  if (locale.value === 'zh-TW') return face.nameTw
  return face.nameZh
}

// 组件挂载即需 3 颗骰子，calc 返回前用空 label 占位（语义由服务端定，落地后才揭晓）
const PLACEHOLDER_RESULTS = [{ label: '', glyph: '' }, { label: '', glyph: '' }, { label: '', glyph: '' }]
const diceResults = ref<{ label: string, glyph: string }[]>(PLACEHOLDER_RESULTS)
const diceSymbols = [ASTRO_DICE_PLANET_GLYPHS, ASTRO_DICE_SIGN_GLYPHS, ASTRO_DICE_HOUSE_GLYPHS]

const knowledgeCards = computed(() => [
  { icon: 'i-heroicons-globe-alt', title: t('astroDice.knowledge1Title'), desc: t('astroDice.knowledge1Desc') },
  { icon: 'i-heroicons-sparkles', title: t('astroDice.knowledge2Title'), desc: t('astroDice.knowledge2Desc') },
  { icon: 'i-heroicons-squares-2x2', title: t('astroDice.knowledge3Title'), desc: t('astroDice.knowledge3Desc') },
])

const shareSummary = computed(() => {
  if (!calcResult.value) return ''
  const r = calcResult.value
  return `${faceName(r.planet)} · ${faceName(r.sign)} · ${faceName(r.house)}`
})

/* ---------- 摇骰主流程：calc（服务端随机）→ 摔骰动画 → landed → AI 解读进海报 ---------- */

async function handleRoll() {
  phase.value = 'rolling'
  calcResult.value = null
  diceResults.value = PLACEHOLDER_RESULTS
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const result = await $fetch<AstroDiceCalcResult>('/api/tools/astro-dice/calc', {
      method: 'POST',
      body: { locale: locale.value },
    })

    calcResult.value = result
    diceResults.value = [
      { label: faceName(result.planet), glyph: result.planet.glyph },
      { label: faceName(result.sign), glyph: result.sign.glyph },
      { label: faceName(result.house), glyph: result.house.glyph },
    ]

    await nextTick()
    rollerRef.value?.roll()
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('astroDice.calcFail'),
      description: err.data?.statusMessage || err.message || t('astroDice.calcFail'),
      color: 'error',
    })
  }
}

function handleLanded() {
  // 落地后稍作停留让标签可读，再切换到海报
  setTimeout(() => {
    phase.value = 'result'
    setTimeout(() => startAiStream(), 300)
  }, 900)
}

/* ---------- AI 解读（内容只进海报，不单独渲染） ---------- */

const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/astro-dice/reading', {
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
            aiContent.value += data.text
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('astroDice.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('astroDice.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
    if (aiError.value) {
      toast.add({
        title: t('astroDice.aiUnavailable'),
        color: 'warning',
      })
    }
  }
}

/* ---------- SEO ---------- */

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.astroDiceTitle')} - ${siteName}`,
  description: t('seo.astroDiceDesc'),
  keywords: t('seo.astroDiceKeywords'),
  ogTitle: () => `${t('seo.astroDiceOgTitle')} - ${siteName}`,
  ogDescription: t('seo.astroDiceOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/astro-dice',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.astroDiceTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/astro-dice',
        description: t('seo.astroDiceDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('astroDice.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/astro-dice',
          description: t('seo.astroDiceOgDesc'),
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
