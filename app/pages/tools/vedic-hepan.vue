<script setup lang="ts">
import type { VedicHepanFormData, VedicHepanCalcResult } from '~/types/vedic-hepan'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const step = ref<'form' | 'loading' | 'result'>('form')
const formData = ref<VedicHepanFormData>({
  personA: { name: '', gender: '', birthDate: '', birthTime: '', birthCity: '', timeUncertain: false },
  personB: { name: '', gender: '', birthDate: '', birthTime: '', birthCity: '', timeUncertain: false },
})
const result = ref<VedicHepanCalcResult | null>(null)
const analysisText = ref('')
const errorMsg = ref('')
const streaming = ref(false)

let abortController: AbortController | null = null

const shareDialogOpen = ref(false)
const shareData = ref<{
  copyText: string
  screenshotDataUrl: string | null
  filename: string
  screenshotError: string | null
} | null>(null)
const shareTargetRef = ref<HTMLElement>()

async function startAnalysis() {
  step.value = 'loading'
  analysisText.value = ''
  result.value = null
  errorMsg.value = ''
  streaming.value = true

  abortController?.abort()
  abortController = new AbortController()

  try {
    const calcResult = await $fetch<VedicHepanCalcResult>('/api/tools/vedic-hepan/calc', {
      method: 'POST',
      body: {
        personA: {
          name: formData.value.personA.name,
          gender: formData.value.personA.gender,
          birthDate: formData.value.personA.birthDate,
          birthTime: formData.value.personA.birthTime,
          birthCity: formData.value.personA.birthCity,
          timeUncertain: formData.value.personA.timeUncertain,
        },
        personB: {
          name: formData.value.personB.name,
          gender: formData.value.personB.gender,
          birthDate: formData.value.personB.birthDate,
          birthTime: formData.value.personB.birthTime,
          birthCity: formData.value.personB.birthCity,
          timeUncertain: formData.value.personB.timeUncertain,
        },
        locale: locale.value,
      },
    })

    result.value = calcResult
    step.value = 'result'

    const response = await fetch('/api/tools/vedic-hepan/reading', {
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

async function handleRetry() {
  await startAnalysis()
}

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()
  const summary = `${result.value.personA.name} ${result.value.ascendantComparison.aSignZh} · ${result.value.personB.name} ${result.value.ascendantComparison.bSignZh}`
  try {
    const res = await share({
      tool: 'vedic-hepan',
      name: '',
      summary,
      shareTarget: shareTargetRef.value,
      filename: `vedic-hepan-${new Date().toISOString().slice(0, 10)}.png`,
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

const config = useRuntimeConfig()
const siteName = computed(() => config.public.siteName || 'ososn')
const pageUrl = computed(() => `${config.public.siteUrl || 'https://www.ososn.com'}/tools/vedic-hepan`)

useSeoMeta({
  title: () => `${t('seo.vedicHepanTitle')} - ${siteName.value}`,
  description: t('seo.vedicHepanDesc'),
  keywords: t('seo.vedicHepanKeywords'),
  ogTitle: () => `${t('seo.vedicHepanOgTitle')} - ${siteName.value}`,
  ogDescription: t('seo.vedicHepanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl.value,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.vedicHepanTitle')} - ${siteName.value}`,
        url: pageUrl.value,
        description: t('seo.vedicHepanDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('vedicHepan.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('seo.vedicHepanOgDesc'),
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
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Vedic Compatibility
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('vedicHepan.title') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('vedicHepan.subtitle') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
            <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
              {{ $t('vedicHepan.disclaimer') }}
            </p>
          </div>

          <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="p-6">
              <VedicHepanStepForm
                v-model="formData"
                :error-msg="errorMsg"
                @submit="startAnalysis"
              />
            </div>
          </div>

          <!-- 知识卡片 -->
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.knowledgeCard1Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('vedicHepan.knowledgeCard1Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-link" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.knowledgeCard2Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('vedicHepan.knowledgeCard2Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.knowledgeCard3Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('vedicHepan.knowledgeCard3Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('vedicHepan.knowledgeCard4Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('vedicHepan.knowledgeCard4Desc') }}</p>
            </div>
          </div>
        </div>

        <!-- Step 2: 计算中 -->
        <div v-else-if="step === 'loading'" key="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
          <div class="text-center space-y-4">
            <div class="w-16 h-16 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
            <p class="text-sm text-[var(--text-faint)]">{{ $t('vedicHepan.calculating') }}</p>
          </div>
        </div>

        <!-- Step 3: 结果 -->
        <div v-else-if="step === 'result' && result" key="result">
          <div ref="shareTargetRef" v-show="false" class="p-6">
            <div class="space-y-4">
              <h2 class="text-xl font-bold text-[var(--text-primary)]">{{ $t('vedicHepan.shareTitle') }}</h2>
              <div class="text-sm text-[var(--text-body)]">
                {{ result.personA.name }} {{ result.ascendantComparison.aSignZh }} · {{ result.personB.name }} {{ result.ascendantComparison.bSignZh }}
              </div>
            </div>
          </div>

          <VedicHepanStepResult
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
