<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bazi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('bazi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('bazi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <!-- 顶部金色渐变线 -->
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <TianganDizhi size="full" :label="$t('bazi.calculating')" />
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && chart">
        <!-- 隐藏截图目标：运势五维分析卡片（首选） -->
        <div ref="shareTargetRef" v-show="false" class="p-6">
          <FortuneRadar
            :scores="aiResult?.dimensionScores ?? { 感情运: 70, 事业运: 70, 财运: 70, 健康运: 70, 学业运: 70 }"
          />
        </div>

        <!-- 隐藏截图目标：五行力量分布（备选，AI 不可用时使用） -->
        <div ref="shareTargetBackupRef" v-show="false" class="p-6">
          <WuxingAnalysis
            :wuxing-score="chart.wuxingScore"
            :analysis-text="analysisRef?.getSummary?.() ?? ''"
          />
        </div>
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ formValues.name ? $t('bazi.chartTitle', { name: formValues.name }) : $t('bazi.chartTitleNoName') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('bazi.chartSubtitle', { riZhu: chart.riZhu, strength: chart.riZhuStrength, geju: chart.geju }) }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <UTabs
          :items="tabItems"
          :ui="{
            list: 'bg-[var(--surface-dropdown)] rounded-xl p-1 border border-[var(--border-medium)] gap-1',
            trigger: 'text-[var(--text-muted)] data-[active]:text-[var(--text-primary)] data-[active]:bg-[var(--accent-bg-hover)] data-[active]:font-medium px-4 py-2 text-sm rounded-lg transition-all hover:text-[var(--text-body)]',
            indicator: 'bg-transparent',
            content: 'pt-5',
          }"
        >
          <template #ai>
            <BaziAiInterpret
              :chart="chart"
              :ai-stream="aiStreamState"
              :ai-result="aiResult"
              @retry="startAiStream"
            />
          </template>

          <template #pan>
            <BaziPan :chart="chart" />
          </template>

          <template #analysis>
            <BaziAnalysis ref="analysisRef" :chart="chart" />
          </template>
        </UTabs>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetToForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleShare"
          >
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('common.shareResult') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="navigateTo('/')"
          >
            <template #leading>
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </template>
            {{ $t('common.backHome') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <!-- 遮罩 -->
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />

          <!-- 弹窗卡片 -->
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <!-- 顶部渐变线 -->
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <!-- 标题 -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
                @click="shareDialogOpen = false"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>

            <!-- 内容区 -->
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <!-- 文案 -->
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.copyText') }}
                </UButton>
              </div>

              <!-- 截图预览 -->
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.shareScreenshot') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('share.shareScreenshot')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.downloadImage') }}
                </UButton>
              </div>

              <!-- 截图失败提示 -->
              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('share.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>

            <!-- 底部 -->
            <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('share.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { BaziChart, BaziAiResult } from '~/types/bazi'
import type { DiZhi } from '~/types/user'
const { t } = useI18n()
const { locale } = useI18n()

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  formerName: '',
  formerNameChangedYear: undefined,
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const chart = ref<BaziChart | null>(null)
const aiResult = ref<BaziAiResult | null>(null)

const analysisRef = ref<{ getSummary: () => string } | null>(null)

const tabItems = [
  { label: t('bazi.aiInterpret'), slot: 'ai' },
  { label: t('bazi.panCalculation'), slot: 'pan' },
  { label: t('bazi.comprehensiveAnalysis'), slot: 'analysis' },
]

const store = useProfilesStore()
const { calc } = useBaziCalc()
const toast = useToast()

const aiLoading = ref(false)
const aiError = ref<string | null>(null)

const aiStreamState = computed(() => ({
  content: '',
  streaming: aiLoading.value,
  started: !aiLoading.value && !!aiResult.value,
  error: aiError.value,
}))

// 分享弹窗
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()
const shareTargetBackupRef = ref<HTMLElement>()

function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const [year, month, day] = values.birthDate.split('-').map(Number)

  chart.value = calc(year, month, day, values.birthHour ?? null, values.gender)
  phase.value = 'animating'

  // 最少播放 1.5 秒动画
  setTimeout(() => {
    phase.value = 'result'
    startAiStream()
  }, 1500)
}

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
    formerName: values.formerName || undefined,
    formerNameChangedYear: values.formerNameChangedYear,
    birthProvince: values.birthProvince || undefined,
  })
}

async function startAiStream() {
  if (!chart.value) return

  aiLoading.value = true
  aiError.value = null
  aiResult.value = null

  await nextTick()

  const summary = analysisRef.value?.getSummary() ?? ''
  const profile = {
    id: 'temp',
    label: '临时',
    name: formValues.value.name,
    gender: formValues.value.gender,
    birthDate: formValues.value.birthDate,
    birthHour: formValues.value.birthHour,
  }

  try {
    const result = await $fetch<BaziAiResult>('/api/bazi/interpret', {
      method: 'POST',
      body: {
        chart: chart.value,
        profile,
        summary,
        locale: locale.value,
      },
    })

    aiResult.value = {
      overview: result.overview ?? '',
      personality: result.personality ?? { summary: '', detail: '', tags: [] },
      career: result.career ?? { summary: '', detail: '', tags: [], wealthTrend: '' },
      relationship: result.relationship ?? { summary: '', detail: '', tags: [], timing: '' },
      health: result.health ?? { summary: '', detail: '', tags: [], seasons: '' },
      dimensionScores: result.dimensionScores ?? {},
      dayunScores: result.dayunScores ?? [],
      historicalPredictions: result.historicalPredictions ?? [],
      comprehensiveAdvice: result.comprehensiveAdvice ?? [],
    }
  } catch (e: any) {
    aiError.value = e?.data?.statusMessage || e?.message || t('bazi.aiRequestFailed')
  } finally {
    aiLoading.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  aiResult.value = null
  aiLoading.value = false
  aiError.value = null
}

async function handleShare() {
  if (!chart.value) return
  const { share } = useShare()

  // AI 解读有结果且有 dimensionScores 时用首选目标，否则用备选（五行力量分布）
  const hasAiScores = !!aiResult.value?.dimensionScores
  const target = hasAiScores ? shareTargetRef.value : shareTargetBackupRef.value

  try {
    const result = await share({
      tool: 'bazi',
      name: formValues.value.name,
      summary: `日主${chart.value.riZhu}（${chart.value.riZhuStrength}），${chart.value.geju}`,
      shareTarget: target,
      filename: `bazi-${formValues.value.name || '命盘'}-${new Date().toISOString().slice(0, 10)}.png`,
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

function copyShareText() {
  if (!shareData.value) return
  navigator.clipboard.writeText(shareData.value.copyText).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const a = document.createElement('a')
  a.href = shareData.value.screenshotDataUrl
  a.download = shareData.value.filename
  a.click()
  toast.add({ title: t('share.downloadSuccess'), color: 'success' })
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.baziTitle')} - ${siteName}`,
  description: t('seo.baziDesc'),
  keywords: t('seo.baziKeywords'),
  ogTitle: () => `${t('seo.baziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/bazi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.baziTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/bazi',
        description: t('seo.baziDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('home.toolBaziTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/bazi',
          description: t('home.toolBaziDesc'),
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
