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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Ziwei Doushu</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('zwds.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('zwds.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <!-- 顶部金色渐变线 -->
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <ZwdsForm
              :initial-values="lastFormValues"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zwds.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zwds.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zwds.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zwds.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zwds.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zwds.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zwds.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zwds.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <TianganDizhi size="full" :label="$t('zwds.calculating')" />
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && chart">
        <!-- 隐藏截图目标（综合分析 > 流年 > 当前年份的流年概览卡片） -->
        <div ref="shareTargetRef" v-show="false" class="p-6">
          <GlowCard :title="$t('zwdsAnalysis.liuNianOverviewTitle')">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div class="text-sm text-[var(--text-muted)]">{{ $t('zwdsAnalysis.currentYearLabel') }}</div>
                <div class="text-base font-bold text-[var(--text-primary)]">{{ currentLiunianGanZhi }}</div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-sm text-[var(--text-muted)]">{{ $t('zwdsAnalysis.taisuiEntryLabel') }}</div>
                <div class="text-sm text-[var(--text-primary)]">{{ currentLiunianTaiSuiGong }}宫（{{ currentLiunianTaiSuiZhi }}）</div>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <span
                  v-for="s in currentLiunianSiHua"
                  :key="s.star + s.type"
                  class="text-xs px-2 py-1 rounded border"
                  :class="sihuaBadgeClass(s.type)"
                >
                  {{ s.star }}化{{ s.type }}
                </span>
              </div>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ currentLiunianSummary }}</p>
              <div class="flex items-center gap-4 pt-2">
                <div
                  class="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold border"
                  :class="ratingClass(currentLiunianRating)"
                >
                  {{ ratingLabel(currentLiunianRating) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ ratingText(currentLiunianRating) }}</p>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>

        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('zwds.chartTitle', { name: formValues.name || '' }) }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ chartSubtitleText }}
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
            <ZwdsAiInterpret
              :chart="chart"
              :content="aiContent"
              :streaming="aiStreaming"
              :started="aiStarted"
              :error="aiError"
              @retry="startAiStream"
            />
          </template>

          <template #pan>
            <ZwdsPan :chart="chart" :has-hour="!!formValues.birthHour" />
          </template>

          <template #analysis>
            <ZwdsAnalysis ref="analysisRef" :chart="chart" />
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
            @click="() => { navigateTo('/tools') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </template>
            {{ $t('zwds.backHome') }}
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
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
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
                @click="() => { shareDialogOpen = false }"
              >
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
                  {{ $t('share.copyText') }}
                </UButton>
              </div>
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
              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('share.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>
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
import type { ZwdsChart } from '~/types/zwds'
import type { DiZhi } from '~/types/user'
import { getLiunianAnalysis } from '~/utils/zwds/analysis'

const { t } = useI18n()
const { locale } = useI18n()

// AI 解读状态（本地管理，替代 useAiStream）
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  birthProvince: string
}

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const chart = ref<ZwdsChart | null>(null)

const analysisRef = ref<{ getSummary: () => string; liunianOverviewRef: HTMLElement | null } | null>(null)

// 当前年份流年数据（用于隐藏截图目标）
const currentYear = new Date().getFullYear()
const currentLiunian = computed(() => {
  if (!chart.value) return null
  return getLiunianAnalysis(chart.value, currentYear)
})
const currentLiunianGanZhi = computed(() => currentLiunian.value?.yearGanZhi ?? '')
const currentLiunianTaiSuiGong = computed(() => currentLiunian.value?.taiSuiGong ?? '')
const currentLiunianTaiSuiZhi = computed(() => currentLiunian.value?.taiSuiZhi ?? '')
const currentLiunianSiHua = computed(() => currentLiunian.value?.liuNianSiHua ?? [])
const currentLiunianSummary = computed(() => currentLiunian.value?.summary ?? '')
const currentLiunianRating = computed(() => currentLiunian.value?.rating ?? 'stable')

const chartSubtitleText = computed(() => {
  if (!chart.value) return ''
  const mingGong = chart.value.mingGong.zhi
  const mainStars = chart.value.mingGong.mainStars
  const starsText = mainStars.length > 0
    ? mainStars.join('、')
    : `${t('zwdsPan.borrowLabel')}${getJieDuiZhi(chart.value.mingGong.zhi)}`
  const wuxingJu = chart.value.wuxingJu
  return t('zwds.chartSubtitle', { mingGong, mainStars: starsText, wuxingJu })
})

function getJieDuiZhi(zhi: DiZhi): DiZhi {
  const ZHI_ORDER: DiZhi[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
  const idx = ZHI_ORDER.indexOf(zhi)
  return ZHI_ORDER[(idx + 6) % 12]!
}

function sihuaBadgeClass(type: string): string {
  switch (type) {
    case '禄': return 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]'
    case '权': return 'border-red-500/20 bg-red-500/10 text-red-400'
    case '科': return 'border-[var(--accent-purple-border)] bg-[var(--accent-purple-faint)] text-[var(--accent-purple-text)]'
    case '忌': return 'border-[var(--text-faint)]/20 bg-[var(--text-faint)]/10 text-[var(--text-muted)]'
    default: return 'border-[var(--border-light)] bg-[var(--surface-card-hover)] text-[var(--text-body)]'
  }
}

function ratingClass(rating: string): string {
  switch (rating) {
    case 'shunSui': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    case 'stable': return 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    case 'liuYi': return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    case 'jinShen': return 'border-red-500/30 bg-red-500/10 text-red-400'
    case 'yiBan': return 'border-[var(--border-light)] bg-[var(--surface-card-hover)] text-[var(--text-body)]'
    default: return 'border-[var(--border-light)] bg-[var(--surface-card-hover)] text-[var(--text-body)]'
  }
}

function ratingText(rating: string): string {
  switch (rating) {
    case 'shunSui': return t('zwdsAnalysis.ratingShunSui')
    case 'stable': return t('zwdsAnalysis.ratingPingWen')
    case 'liuYi': return t('zwdsAnalysis.ratingLiuYi')
    case 'jinShen': return t('zwdsAnalysis.ratingJinShen')
    case 'yiBan': return t('zwdsAnalysis.ratingYiBan')
    default: return t('zwdsAnalysis.ratingPingWen')
  }
}

function ratingLabel(rating: string): string {
  switch (rating) {
    case 'shunSui': return t('zwdsAnalysis.ratingLabelShunSui')
    case 'stable': return t('zwdsAnalysis.ratingLabelStable')
    case 'liuYi': return t('zwdsAnalysis.ratingLabelLiuYi')
    case 'jinShen': return t('zwdsAnalysis.ratingLabelJinShen')
    case 'yiBan': return t('zwdsAnalysis.ratingLabelYiBan')
    default: return t('zwdsAnalysis.ratingLabelStable')
  }
}

const tabItems = computed(() => [
  { label: t('zwds.aiInterpretation'), slot: 'ai' as const },
  { label: t('zwdsPan.chartTitle'), slot: 'pan' as const },
  { label: t('zwdsAnalysis.tabsLabelBenMing'), slot: 'analysis' as const },
])

const store = useProfilesStore()
const { calc } = useZwdsCalc()
const toast = useToast()
const route = useRoute()
const router = useRouter()

// 分享弹窗
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const [year, month, day] = values.birthDate.split('-').map(Number) as [number, number, number]

  chart.value = calc(year, month, day, values.birthHour ?? null, values.gender)
  phase.value = 'animating'

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
    birthProvince: values.birthProvince || undefined,
  })
}

async function startAiStream() {
  if (!chart.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

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
    const response = await fetch('/api/zwds/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chart.value,
        profile,
        summary,
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
            aiError.value = data.message || t('zwds.aiRequestFailed')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('zwds.aiRequestFailed')
  } finally {
    aiStreaming.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
}

// 回访流程：URL 带 ?profile=id 时自动加载档案并排盘
onMounted(() => {
  const profileId = route.query.profile as string | undefined
  if (profileId) {
    const profile = store.list.find(p => p.id === profileId)
    if (profile && profile.gender && profile.birthDate) {
      const values: FormValues = {
        gender: profile.gender,
        birthDate: profile.birthDate,
        birthHour: profile.birthHour,
        name: profile.name || '',
        birthProvince: profile.birthProvince || '',
      }
      lastFormValues.value = { ...values }
      handleSubmit(values)
      // 清除 query 参数，避免刷新重复提交
      router.replace({ query: {} })
    }
  }
})

async function handleShare() {
  if (!chart.value) return
  const { share } = useShare()

  try {
    const result = await share({
      tool: 'zwds',
      name: formValues.value.name,
      summary: `命宫${chart.value.mingGong.zhi}（${chart.value.mingGong.mainStars.join('、') || '借对宫'}），${chart.value.wuxingJu}局`,
      shareTarget: shareTargetRef.value,
      filename: `zwds-${formValues.value.name || '命盘'}-${new Date().toISOString().slice(0, 10)}.png`,
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
  title: () => `${t('seo.zwdsTitle')} - ${siteName}`,
  description: t('seo.zwdsDesc'),
  keywords: t('seo.zwdsKeywords'),
  ogTitle: () => `${t('seo.zwdsOgTitle')} - ${siteName}`,
  ogDescription: t('seo.zwdsOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/zwds',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.zwdsTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/zwds',
        description: t('seo.zwdsDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('home.toolZwdsTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/zwds',
          description: t('home.toolZwdsDesc'),
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
