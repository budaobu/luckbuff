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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Da Liu Ren</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liuren.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liuren.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('liuren.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <LiurenForm @submit="handleSubmit" />
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuren.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuren.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuren.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuren.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuren.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuren.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuren.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuren.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <HexagramSpin size="full" :label="$t('liuren.calculating')" />
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && chart">
        <!-- 截图目标 -->
        <div ref="shareTargetRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('liuren.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 占问信息 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 mb-4">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuren.result.questionLabel') }}</h3>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ chart.question }}</p>
            <div class="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
              <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
              <span>{{ chart.location }}</span>
            </div>
          </div>

          <!-- 四柱数据卡片 -->
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="item in ganzhiCards"
              :key="item.label"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center"
            >
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ item.label }}</div>
              <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ item.value }}</div>
            </div>
          </div>

          <!-- 月将占时年命 -->
          <div class="grid grid-cols-3 gap-2 mt-2">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('liuren.result.yuejiang') }}</div>
              <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ chart.calendar.yuejiang }}</div>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('liuren.result.shichen') }}</div>
              <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ chart.calendar.shichen }}</div>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ $t('liuren.result.birthYear') }}</div>
              <div class="text-base font-bold text-[var(--accent)] tracking-wider">{{ chart.calendar.birthYearBranch }}</div>
            </div>
          </div>
        </div>

        <!-- ===== AI 解读 ===== -->
        <div class="mt-5">
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--accent)]" />
              <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ $t('liuren.result.interpretTitle') }}</h3>
            </div>

            <!-- 等待首个 token -->
            <div v-if="!interpretStarted && !interpretError" class="flex flex-col items-center py-8">
              <TianganDizhi size="compact" :label="$t('liuren.result.aiAnalyzing')" />
            </div>

            <!-- 错误状态 -->
            <div v-else-if="interpretError" class="text-center py-6">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p class="text-sm text-red-400">{{ interpretError }}</p>
              <UButton color="warning" variant="soft" size="sm" class="mt-3" @click="startInterpretStream">
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                </template>
                {{ $t('common.retry') }}
              </UButton>
            </div>

            <!-- 流式内容 -->
            <div v-else class="space-y-4">
              <div
                class="text-sm text-[var(--text-body)] leading-relaxed ai-content max-w-none"
                v-html="renderedContent"
              />
              <!-- 光标 -->
              <div v-if="interpretStreaming" class="flex items-center gap-1">
                <span class="w-0.5 h-4 bg-[var(--accent)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="handleShare">
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('common.shareResult') }}
          </UButton>
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { navigateTo(localePath('/tools')) }">
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('common.back') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="shareDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="shareDialogOpen = false">
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('common.share') }}</h3>
              </div>
              <UButton color="neutral" variant="ghost" class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { shareDialogOpen = false }">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('common.copy') }}
                </UButton>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.shareScreenshot') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" class="w-full rounded-lg" />
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('common.download') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { LiurenChartRequest, LiurenChartResponse } from '~/types/liuren'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const chart = ref<LiurenChartResponse | null>(null)
const lastFormValues = ref<LiurenChartRequest | null>(null)

// AI 解读状态
const interpretContent = ref('')
const interpretStreaming = ref(false)
const interpretStarted = ref(false)
const interpretError = ref<string | null>(null)

// 分享
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLDivElement>()

// 四柱数据卡片
const ganzhiCards = computed(() => {
  if (!chart.value?.calendar) return []
  const g = chart.value.calendar.ganzhi
  return [
    { label: t('qimen.ganzhi.yearLabel') || '年柱', value: g.year },
    { label: t('qimen.ganzhi.monthLabel') || '月柱', value: g.month },
    { label: t('qimen.ganzhi.dayLabel') || '日柱', value: g.day },
    { label: t('qimen.ganzhi.timeLabel') || '时柱', value: g.hour },
  ]
})

async function handleSubmit(payload: LiurenChartRequest) {
  phase.value = 'animating'
  lastFormValues.value = { ...payload }
  chart.value = null
  interpretContent.value = ''
  interpretStarted.value = false
  interpretError.value = null

  try {
    const result = await $fetch<LiurenChartResponse>('/api/liuren/chart', {
      method: 'POST',
      body: payload,
    })
    chart.value = result
    phase.value = 'result'
    // 延迟启动 AI 解读
    setTimeout(() => startInterpretStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('liuren.error.chartFail'),
      description: err.data?.statusMessage || err.message || t('liuren.error.unknown'),
      color: 'error',
    })
  }
}

async function startInterpretStream() {
  if (!chart.value || !lastFormValues.value) return
  interpretContent.value = ''
  interpretStreaming.value = true
  interpretStarted.value = false
  interpretError.value = null

  try {
    const response = await fetch('/api/liuren/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: lastFormValues.value,
        chartJson: chart.value,
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
            if (!interpretStarted.value) interpretStarted.value = true
            interpretContent.value += data.text
          } else if (data.type === 'error') {
            interpretError.value = data.message || t('liuren.error.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    interpretError.value = e?.message || t('liuren.error.aiUnavailable')
  } finally {
    interpretStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  chart.value = null
  interpretContent.value = ''
  interpretStarted.value = false
  interpretError.value = null
}

const renderedContent = computed(() => {
  if (!interpretContent.value) return ''
  try {
    return marked.parse(interpretContent.value, { async: false }) as string
  } catch {
    return interpretContent.value
  }
})

async function handleShare() {
  if (!chart.value) return
  const { share } = useShare()

  try {
    const summary = `${chart.value.calendar.ganzhi.day}日${chart.value.calendar.ganzhi.hour}时 · ${chart.value.calendar.yuejiang}加${chart.value.calendar.shichen}`
    const result = await share({
      tool: 'liuren',
      name: chart.value.question.slice(0, 20),
      summary,
      shareTarget: shareTargetRef.value,
      filename: `liuren-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.shareFail'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

async function copyShareText() {
  if (!shareData.value?.copyText) return
  try {
    await navigator.clipboard.writeText(shareData.value.copyText)
    toast.add({ title: t('share.copySuccess'), color: 'success' })
  } catch {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  }
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const link = document.createElement('a')
  link.href = shareData.value.screenshotDataUrl
  link.download = shareData.value.filename
  link.click()
}

// SEO
const pageDescription = computed(() => {
  if (phase.value === 'result' && chart.value) {
    return t('liuren.share.hook', { summary: `${chart.value.calendar.ganzhi.day}日${chart.value.calendar.ganzhi.hour}时` })
  }
  return t('seo.liurenDesc')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.liurenTitle')} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.liurenKeywords'),
  ogTitle: () => `${t('seo.liurenOgTitle')} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liuren',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.liurenTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liuren',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('home.toolLiurenTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liuren',
          description: t('home.toolLiurenDesc'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ai-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-content :deep(h3) {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.75rem;
  margin-bottom: 0.4rem;
}
.ai-content :deep(h4) {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-body);
  margin-top: 0.5rem;
  margin-bottom: 0.3rem;
}
.ai-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
