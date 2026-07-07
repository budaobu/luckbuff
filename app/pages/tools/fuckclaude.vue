<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <!-- 标题区 -->
      <div class="mb-8 text-center">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Claude Environment Check</span>
        <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('fuckClaude.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-2 max-w-lg mx-auto">
          {{ $t('fuckClaude.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-4" />

        <!-- 特性徽章 -->
        <div class="mt-5 flex flex-wrap justify-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-xs text-[var(--accent)]">
            <UIcon name="i-heroicons-computer-desktop" class="w-3.5 h-3.5" />
            {{ $t('fuckClaude.badgeLocal') }}
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5" />
            {{ $t('fuckClaude.badgeNoUpload') }}
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <UIcon name="i-heroicons-code-bracket" class="w-3.5 h-3.5" />
            {{ $t('fuckClaude.badgeOpenSource') }}
          </span>
        </div>
      </div>

      <!-- 主卡片 -->
      <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-6">
        <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
        <div class="p-6 md:p-8">
          <!-- 初始 / 就绪状态 -->
          <div v-if="phase === 'idle'" class="flex flex-col items-center text-center py-8">
            <div class="w-20 h-20 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center mb-5">
              <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 text-[var(--accent)]" />
            </div>
            <p class="text-sm text-[var(--text-muted)] mb-6">{{ $t('fuckClaude.ready') }}</p>
            <UButton
              color="warning"
              size="lg"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="startScan"
            >
              <template #leading>
                <UIcon name="i-heroicons-shield-exclamation" class="w-5 h-5" />
              </template>
              {{ $t('fuckClaude.start') }}
            </UButton>
          </div>

          <!-- 扫描中 -->
          <div v-else-if="phase === 'scanning'" class="flex flex-col items-center py-6">
            <!-- 分数环 -->
            <div class="relative w-40 h-40 mb-6">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-light)" stroke-width="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--accent)"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringOffset"
                  class="transition-all duration-500 ease-out"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-[var(--text-primary)]">{{ animatedScore }}</span>
                <span class="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Risk Score</span>
              </div>
            </div>

            <!-- 当前 mascot -->
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon :name="mascotIcon" class="w-5 h-5 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-sm text-[var(--text-muted)]">{{ $t('fuckClaude.scanning') }}</p>
            </div>

            <!-- 信号列表 -->
            <div class="w-full space-y-2">
              <div
                v-for="(signal, index) in signals"
                :key="signal.id"
                class="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300"
                :class="signalRowClass(index, signal.verdict)"
              >
                <UIcon :name="signalIconMap[signal.id]" class="w-5 h-5 shrink-0" :class="signalIconClass(index, signal.verdict)" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-[var(--text-primary)]">{{ signal.name }}</span>
                    <span v-if="signal.claudeUsed" class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]">
                      {{ $t('fuckClaude.claudeBadge') }}
                    </span>
                    <span class="text-[10px] text-[var(--text-muted)]">{{ $t('fuckClaude.weight') }} {{ signal.weight }}</span>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] truncate">{{ signal.raw }}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-sm font-semibold" :class="scoreColorClass(signal.verdict)">+{{ signal.contribution }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 结果 -->
          <div v-else-if="phase === 'result' && result" class="py-2">
            <div class="flex flex-col items-center mb-8">
              <div class="relative w-44 h-44 mb-5">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-light)" stroke-width="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    :stroke="bandColor"
                    stroke-width="8"
                    stroke-linecap="round"
                    :stroke-dasharray="ringCircumference"
                    :stroke-dashoffset="ringOffset"
                    class="transition-all duration-700 ease-out"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-4xl font-bold" :class="bandTextClass">{{ result.total }}</span>
                  <span class="text-[10px] uppercase tracking-wider" :class="bandTextClass">{{ $t(`fuckClaude.band.${result.band}.title`) }}</span>
                </div>
              </div>

              <div class="text-center max-w-md">
                <h2 class="text-xl font-semibold mb-2" :class="bandTextClass">
                  {{ $t(`fuckClaude.band.${result.band}.desc`) }}
                </h2>
                <p v-if="result.hits.length === 0" class="text-sm text-[var(--text-muted)]">{{ $t('fuckClaude.noHits') }}</p>
              </div>
            </div>

            <!-- 命中信号 -->
            <div v-if="result.hits.length > 0" class="mb-6">
              <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <UIcon name="i-heroicons-signal" class="w-4 h-4 text-[var(--accent-muted)]" />
                {{ $t('fuckClaude.resultHitsTitle') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="hit in result.hits"
                  :key="hit.id"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border"
                  :class="hitChipClass(hit.verdict)"
                >
                  <UIcon :name="signalIconMap[hit.id]" class="w-3.5 h-3.5" />
                  {{ hit.name }}
                  <b>+{{ hit.contribution }}</b>
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-wrap justify-center gap-3">
              <UButton
                color="warning"
                variant="soft"
                class="group/btn"
                @click="copyResult"
              >
                <template #leading>
                  <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
                </template>
                {{ $t('common.copy') }}
              </UButton>
              <UButton
                color="warning"
                class="group/btn"
                @click="startScan"
              >
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                </template>
                {{ $t('fuckClaude.retest') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 检测哪些信号 -->
      <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
        <h3 class="text-base font-semibold text-[var(--text-primary)] mb-1">{{ $t('fuckClaude.signalsTitle') }}</h3>
        <p class="text-xs text-[var(--text-faint)] mb-4">{{ $t('fuckClaude.signalsSubtitle') }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="signal in signalList"
            :key="signal.id"
            class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card-hover)]/30 p-3"
          >
            <div class="flex items-center gap-2 mb-1">
              <UIcon :name="signalIconMap[signal.id]" class="w-4 h-4 text-[var(--accent-muted)]" />
              <span class="text-sm font-medium text-[var(--text-primary)]">{{ $t(`fuckClaude.signal.${signal.id}.name`) }}</span>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t(`fuckClaude.signal.${signal.id}.desc`) }}</p>
          </div>
        </div>
      </div>

      <!-- 检测原理 -->
      <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
        <h3 class="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
          {{ $t('fuckClaude.howTitle') }}
        </h3>
        <div class="space-y-3 text-xs text-[var(--text-faint)] leading-relaxed">
          <p>{{ $t('fuckClaude.howP1') }}</p>
          <p>{{ $t('fuckClaude.howP2') }}</p>
        </div>
      </div>

      <!-- 隐私说明 -->
      <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
        <h3 class="text-base font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-[var(--accent-muted)]" />
          {{ $t('fuckClaude.privacyTitle') }}
        </h3>
        <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fuckClaude.privacyBody') }}</p>
      </div>

      <!-- FAQ -->
      <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
        <h3 class="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
          {{ $t('fuckClaude.faqTitle') }}
        </h3>
        <div class="space-y-4">
          <div v-for="i in 4" :key="i">
            <h4 class="text-sm font-medium text-[var(--text-primary)] mb-1">{{ $t(`fuckClaude.faq.q${i}`) }}</h4>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t(`fuckClaude.faq.a${i}`) }}</p>
          </div>
        </div>
      </div>

      <!-- 底部免责声明 -->
      <div class="text-center">
        <p class="text-[11px] text-[var(--text-faint)] leading-relaxed">
          {{ $t('fuckClaude.footerDisclaimer') }}
          <a href="https://github.com/LinXiaoTao/FuckClaude" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] hover:underline">GitHub</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { runFuckClaudeScan, type RiskBand, type SignalId, type SignalResult } from '~/composables/useFuckClaude'

const { t } = useI18n()
const toast = useToast()

const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = useRequestURL().origin
const pagePath = '/tools/fuckclaude'

const phase = ref<'idle' | 'scanning' | 'result'>('idle')
const signals = ref<SignalResult[]>([])
const result = ref<ReturnType<typeof runFuckClaudeScan> | null>(null)
const currentIndex = ref(-1)
const animatedScore = ref(0)
const running = ref(false)

const RING_R = 52
const ringCircumference = 2 * Math.PI * RING_R
const ringOffset = computed(() => ringCircumference * (1 - animatedScore.value / 100))

const signalIconMap: Record<string, string> = {
  timezone: 'i-heroicons-clock',
  timezoneOffset: 'i-heroicons-clock',
  language: 'i-heroicons-globe-alt',
  intlLocale: 'i-heroicons-adjustments-horizontal',
  fonts: 'i-heroicons-pencil-square',
  emoji: 'i-heroicons-face-smile',
}

const signalList = [
  { id: 'timezone' },
  { id: 'timezoneOffset' },
  { id: 'language' },
  { id: 'intlLocale' },
  { id: 'fonts' },
  { id: 'emoji' },
]

const mascotIcon = computed(() => {
  if (phase.value === 'scanning') return 'i-heroicons-magnifying-glass'
  if (!result.value) return 'i-heroicons-magnifying-glass'
  if (result.value.band === 'low') return 'i-heroicons-shield-check'
  if (result.value.band === 'medium') return 'i-heroicons-exclamation-triangle'
  return 'i-heroicons-fire'
})

const bandColor = computed(() => {
  if (!result.value) return 'var(--accent)'
  if (result.value.band === 'low') return '#22c55e'
  if (result.value.band === 'medium') return '#f59e0b'
  return '#ef4444'
})

const bandTextClass = computed(() => {
  if (!result.value) return 'text-[var(--text-primary)]'
  if (result.value.band === 'low') return 'text-green-500'
  if (result.value.band === 'medium') return 'text-amber-500'
  return 'text-red-500'
})

function scoreColorClass(verdict: RiskBand) {
  if (verdict === 'high') return 'text-red-500'
  if (verdict === 'medium') return 'text-amber-500'
  return 'text-[var(--text-muted)]'
}

function signalRowClass(index: number, verdict: RiskBand) {
  const base = 'border-[var(--border-light)] bg-[var(--surface-card)]'
  if (index === currentIndex.value) return `${base} border-[var(--accent-border-hover)] ring-1 ring-[var(--accent-border-hover)]`
  if (verdict === 'high') return 'border-red-500/30 bg-red-500/5'
  if (verdict === 'medium') return 'border-amber-500/30 bg-amber-500/5'
  return base
}

function signalIconClass(index: number, verdict: RiskBand) {
  if (index === currentIndex.value) return 'text-[var(--accent)]'
  if (verdict === 'high') return 'text-red-500'
  if (verdict === 'medium') return 'text-amber-500'
  return 'text-[var(--text-muted)]'
}

function hitChipClass(verdict: RiskBand) {
  if (verdict === 'high') return 'border-red-500/30 bg-red-500/10 text-red-500'
  if (verdict === 'medium') return 'border-amber-500/30 bg-amber-500/10 text-amber-500'
  return 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

async function startScan() {
  if (running.value) return
  running.value = true
  phase.value = 'scanning'
  signals.value = []
  result.value = null
  currentIndex.value = -1
  animatedScore.value = 0

  // 预生成占位信号列表，扫描时逐步填充
  const placeholder = signalList.map(s => ({
    id: s.id as SignalId,
    name: t(`fuckClaude.signal.${s.id}.name`),
    raw: '',
    score: 0,
    weight: 0,
    contribution: 0,
    verdict: 'low' as RiskBand,
  }))
  signals.value = placeholder

  await delay(150)

  const scan = runFuckClaudeScan(t)
  const scanSignals = scan.signals

  for (let i = 0; i < scanSignals.length; i++) {
    currentIndex.value = i
    await delay(460)

    const signal = scanSignals[i]
    if (!signal) continue
    signals.value[i] = signal

    // 累加动画分数
    const target = Math.min(100, signals.value.slice(0, i + 1).reduce((sum, s) => sum + s.contribution, 0))
    animateScoreTo(target)

    await delay(150)
  }

  currentIndex.value = -1
  result.value = scan
  animatedScore.value = scan.total
  phase.value = 'result'
  running.value = false
}

function animateScoreTo(target: number) {
  const start = animatedScore.value
  const duration = 300
  const startTime = performance.now()
  function step(now: number) {
    const p = Math.min(1, (now - startTime) / duration)
    animatedScore.value = Math.round(start + (target - start) * p)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function copyResult() {
  if (!result.value) return
  const lines: string[] = []
  lines.push(t('fuckClaude.title'))
  lines.push(`${t('fuckClaude.band.' + result.value.band + '.title')}: ${result.value.total}`)
  if (result.value.hits.length > 0) {
    lines.push('')
    lines.push(t('fuckClaude.resultHitsTitle'))
    for (const hit of result.value.hits) {
      lines.push(`${hit.name}: +${hit.contribution}`)
    }
  }
  else {
    lines.push(t('fuckClaude.noHits'))
  }
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// SEO
useSeoMeta({
  title: () => `${t('seo.fuckClaudeTitle')} - ${siteName}`,
  description: t('seo.fuckClaudeDesc'),
  keywords: t('seo.fuckClaudeKeywords'),
  ogTitle: () => `${t('seo.fuckClaudeOgTitle')} - ${siteName}`,
  ogDescription: t('seo.fuckClaudeOgDesc'),
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
        name: `${t('seo.fuckClaudeTitle')} - ${siteName}`,
        url: `${siteUrl}${pagePath}`,
        description: t('seo.fuckClaudeDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('fuckClaude.title'),
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}${pagePath}`,
          description: t('seo.fuckClaudeOgDesc'),
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
