<script setup lang="ts">
import type { AstroFortuneTuneFormData } from '~/types/astro-fortune-tune'
import type { DiZhi } from '~/types/user'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const step = ref<'form' | 'loading' | 'result'>('form')
const formData = ref<AstroFortuneTuneFormData>({
  birthDate: '',
  birthTime: '',
  baseCity: '',
  gender: '',
  timeUncertain: false,
  candidateCities: [''],
})
const result = ref<import('~/types/astro-fortune-tune').AstroFortuneTuneCalcResult | null>(null)
const analysisText = ref('')
const errorMsg = ref('')
const streaming = ref(false)

let abortController: AbortController | null = null

const store = useProfilesStore()

function handleSaveProfile(id: string, values: {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name?: string
  birthProvince?: string
}) {
  store.update(id, values)
}

async function startAnalysis() {
  step.value = 'loading'
  analysisText.value = ''
  result.value = null
  errorMsg.value = ''
  streaming.value = true

  abortController?.abort()
  abortController = new AbortController()

  try {
    const calcResult = await $fetch<import('~/types/astro-fortune-tune').AstroFortuneTuneCalcResult>('/api/tools/astro-fortune-tune/calc', {
      method: 'POST',
      body: {
        birthDate: formData.value.birthDate,
        birthTime: formData.value.birthTime,
        baseCity: formData.value.baseCity,
        candidateCities: formData.value.candidateCities.filter(Boolean),
        timeUncertain: formData.value.timeUncertain,
        locale: locale.value,
      },
    })

    result.value = calcResult
    step.value = 'result'

    // 开始 SSE reading
    const response = await fetch('/api/tools/astro-fortune-tune/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: calcResult, locale: locale.value }),
      signal: abortController.signal,
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      throw new Error(errBody.statusMessage || errBody.message || `请求失败 (${response.status})`)
    }
    if (!response.body) {
      throw new Error('服务器未返回流式响应')
    }

    const reader = response.body.getReader()
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
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const evt = JSON.parse(payload)
          if (evt.type === 'text') {
            analysisText.value += String(evt.text ?? '')
          } else if (evt.type === 'error') {
            errorMsg.value = String(evt.message ?? '未知错误')
          }
        } catch {
          // ignore malformed chunk
        }
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      errorMsg.value = err?.message ?? '未知错误'
      if (step.value === 'loading') step.value = 'form'
    }
  } finally {
    streaming.value = false
    abortController = null
  }
}

function reset() {
  abortController?.abort()
  abortController = null
  step.value = 'form'
  analysisText.value = ''
  result.value = null
  errorMsg.value = ''
  streaming.value = false
}

// 回访流程：URL 带 ?profile=id 时自动加载档案
onMounted(() => {
  const profileId = route.query.profile as string | undefined
  if (profileId) {
    const profile = store.list.find(p => p.id === profileId)
    if (profile && profile.birthDate) {
      const DIZHI_TO_TIME: Record<DiZhi, string> = {
        '子': '00:00', '丑': '01:00', '寅': '03:00', '卯': '05:00',
        '辰': '07:00', '巳': '09:00', '午': '11:00', '未': '13:00',
        '申': '15:00', '酉': '17:00', '戌': '19:00', '亥': '21:00',
      }
      formData.value.gender = profile.gender || ''
      formData.value.birthDate = profile.birthDate
      formData.value.birthTime = profile.birthHour ? DIZHI_TO_TIME[profile.birthHour] || '' : ''
      formData.value.baseCity = profile.birthProvince || ''
      if (formData.value.candidateCities.length === 0) {
        formData.value.candidateCities = ['']
      }
      startAnalysis()
      router.replace({ query: {} })
    }
  }
})

// 分享
const shareDialogOpen = ref(false)
const shareData = ref<{
  copyText: string
  screenshotDataUrl: string | null
  filename: string
  screenshotError: string | null
} | null>(null)
const shareTargetRef = ref<HTMLElement>()

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()
  const summary = result.value.comparisons
    .filter(c => c.city.resolved)
    .map(c => `${c.city.cityName || c.city.name}: ${c.chart.ascendant.signNameZh}`)
    .join(' / ') || '占星改运对比'
  try {
    const res = await share({
      tool: 'vedic',
      name: '',
      summary,
      shareTarget: shareTargetRef.value,
      filename: `astro-fortune-tune-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = res
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

async function handleRetry() {
  await startAnalysis()
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.astroFortuneTuneTitle')} - ${siteName}`,
  description: t('seo.astroFortuneTuneDesc'),
  keywords: t('seo.astroFortuneTuneKeywords'),
  ogTitle: () => `${t('seo.astroFortuneTuneOgTitle')} - ${siteName}`,
  ogDescription: t('seo.astroFortuneTuneOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/astro-fortune-tune',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.astroFortuneTuneTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/astro-fortune-tune',
        description: t('seo.astroFortuneTuneDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('astroFortuneTune.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/astro-fortune-tune',
          description: t('astroFortuneTune.subtitle'),
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

<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[8%] left-[12%] w-[460px] h-[460px] rounded-full bg-[var(--accent)]/[0.06] blur-[130px]" />
      <div class="absolute bottom-[18%] right-[10%] w-[380px] h-[380px] rounded-full bg-[var(--accent-purple)]/[0.05] blur-[110px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <Transition name="step" mode="out-in">
        <!-- Step 1: 表单 -->
        <div v-if="step === 'form'" key="form">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Astro Fortune Tune</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('astroFortuneTune.title') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('astroFortuneTune.subtitle') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="p-6">
              <AstroFortuneTuneStepForm
                v-model="formData"
                :error-msg="errorMsg"
                @submit="startAnalysis"
                @save-profile="handleSaveProfile"
              />
            </div>
          </div>

          <!-- 知识卡片 -->
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('astroFortuneTune.knowledgeCard1Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('astroFortuneTune.knowledgeCard1Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-arrows-pointing-out" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('astroFortuneTune.knowledgeCard2Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('astroFortuneTune.knowledgeCard2Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('astroFortuneTune.knowledgeCard3Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('astroFortuneTune.knowledgeCard3Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('astroFortuneTune.knowledgeCard4Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('astroFortuneTune.knowledgeCard4Desc') }}</p>
            </div>
          </div>
        </div>

        <!-- Step 2: 计算中 -->
        <div v-else-if="step === 'loading'" key="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
          <div class="text-center space-y-4">
            <div class="w-16 h-16 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
            <p class="text-sm text-[var(--text-faint)]">{{ $t('astroFortuneTune.calculating') }}</p>
          </div>
        </div>

        <!-- Step 3: 结果 -->
        <div v-else-if="step === 'result' && result" key="result">
          <!-- 隐藏截图目标 -->
          <div ref="shareTargetRef" v-show="false" class="p-6">
            <div class="space-y-4">
              <h2 class="text-xl font-bold text-[var(--text-primary)]">{{ $t('astroFortuneTune.shareTitle') }}</h2>
              <div v-for="(c, i) in result.comparisons" :key="i" class="text-sm text-[var(--text-body)]">
                <strong>{{ c.city.cityName || c.city.name }}</strong>
                ：{{ c.chart.ascendant.signNameZh }}（{{ c.chart.ascendant.signName }}）
              </div>
            </div>
          </div>

          <AstroFortuneTuneStepResult
            :result="result"
            :analysis="analysisText"
            :streaming="streaming"
            :error-msg="errorMsg"
            @restart="reset"
            @retry="handleRetry"
            @share="handleShare"
          />
        </div>
      </Transition>
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

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.step-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
