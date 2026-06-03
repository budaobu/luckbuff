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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Qimen Dunjia</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('qimen.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('qimen.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('qimen.interpret.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <QimenForm @submit="handleSubmit" />
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <HexagramSpin size="full" :label="$t('qimen.calculating')" />
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && chart">
        <!-- 截图目标：只包含核心排盘信息（不含 AI 解读） -->
        <div ref="shareTargetRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('qimen.resultTitle') }}
            </h1>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- ===== 遁局信息条 ===== -->
          <QimenChartSummary :chart="chart" />

          <!-- ===== 四柱数据卡片 ===== -->
          <div class="grid grid-cols-3 gap-2 mt-3">
            <div
              v-for="item in ganzhiCards"
              :key="item.label"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center"
            >
              <div class="text-[10px] text-[var(--text-faint)] mb-1">{{ item.label }}</div>
              <div class="text-base font-bold text-[var(--text-primary)] tracking-wider">{{ item.value }}</div>
            </div>
          </div>

          <!-- ===== 九宫格盘面 ===== -->
          <div class="mt-5">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-[var(--accent)]" />
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('qimen.chartTitle') }}</h3>
            </div>
            <QimenPalaceGrid
              :palaces="chart.chart.palaces"
              :zhifu-palace="chart.chart.zhifu.palace"
              :zhishi-palace="chart.chart.zhishi.palace"
              :kongwang-palaces="chart.chart.kongwang_palaces"
            />
          </div>
        </div>

        <!-- ===== AI 解读 ===== -->
        <div class="mt-5">
          <QimenInterpretPanel
            :content="interpretContent"
            :streaming="interpretStreaming"
            :started="interpretStarted"
            :error="interpretError"
            @retry="startInterpretStream"
          />
        </div>

        <!-- ===== 警告 ===== -->
        <div v-if="chart.warnings?.length" class="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-400" />
            <h4 class="text-sm font-semibold text-amber-400">{{ $t('qimen.warningsTitle') }}</h4>
          </div>
          <ul class="text-sm text-amber-400/80 space-y-1">
            <li v-for="(w, i) in chart.warnings" :key="i">{{ w }}</li>
          </ul>
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
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="navigateTo(localePath('/tools'))">
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
              <UButton color="neutral" variant="ghost" class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="shareDialogOpen = false">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('liuyaoPage.shareTextLabel') }}</p>
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
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('liuyaoPage.shareScreenshotLabel') }}</p>
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
import type { QimenChartRequest, QimenChartResponse } from '~/types/qimen'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const chart = ref<QimenChartResponse | null>(null)
const lastFormValues = ref<QimenChartRequest | null>(null)

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
  if (!chart.value?.ganzhi) return []
  const g = chart.value.ganzhi
  return [
    { label: t('qimen.ganzhi.yearLabel') || '年柱', value: g.year },
    { label: t('qimen.ganzhi.monthLabel') || '月柱', value: g.month },
    { label: t('qimen.ganzhi.dayLabel') || '日柱', value: g.day },
    { label: t('qimen.ganzhi.timeLabel') || '时柱', value: g.time },
    { label: t('qimen.ganzhi.xunshouLabel') || '旬首', value: g.time_xun },
    { label: t('qimen.ganzhi.xunkongLabel') || '旬空', value: Array.isArray(g.time_xunkong) ? g.time_xunkong.join('、') : g.time_xunkong },
  ]
})

async function handleSubmit(payload: QimenChartRequest) {
  phase.value = 'animating'
  lastFormValues.value = { ...payload }
  chart.value = null
  interpretContent.value = ''
  interpretStarted.value = false
  interpretError.value = null

  try {
    const result = await $fetch<QimenChartResponse>('/api/qimen/chart', {
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
      title: t('qimen.error.chartFail'),
      description: err.data?.statusMessage || err.message || t('qimen.error.unknown'),
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
    const response = await fetch('/api/qimen/interpret', {
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
            interpretError.value = data.message || t('qimen.error.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    interpretError.value = e?.message || t('qimen.error.aiUnavailable')
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

async function handleShare() {
  if (!chart.value) return
  const { share } = useShare()
  const { buildShareSummary } = useQimenPrompt()

  try {
    const result = await share({
      tool: 'qimen',
      name: lastFormValues.value?.question_label || '',
      summary: buildShareSummary(chart.value),
      shareTarget: shareTargetRef.value,
      filename: `qimen-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.failTitle'),
      description: e?.message || t('share.failDesc'),
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
    return t('qimen.share.hook', { summary: `${chart.value.chart.dun_type} · ${chart.value.chart.ju_number}局` })
  }
  return t('seo.qimenDesc')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.qimenTitle')} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.qimenKeywords'),
  ogTitle: () => `${t('seo.qimenOgTitle')} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/qimen',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.qimenTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/qimen',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('home.toolQimenTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/qimen',
          description: t('home.toolQimenDesc'),
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
</style>
