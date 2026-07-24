<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12" :class="{ 'zp-result-wrap': phase === 'result' }">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Zi Ping Bazi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('zipingBazi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('zipingBazi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              :show-former-name="false"
              :show-birth-province="false"
              :submit-label="$t('zipingBazi.submit')"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>

        <!-- 子平术知识卡片 -->
        <div class="mt-6 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4 font-serif">{{ $t('zipingBazi.methodologyTitle') }}</h2>
            <div class="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
              <p>{{ $t('zipingBazi.methodologyIntro') }}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard1Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard1Desc') }}</p>
                </div>
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard2Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard2Desc') }}</p>
                </div>
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard3Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard3Desc') }}</p>
                </div>
                <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
                    <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('zipingBazi.methodologyCard4Title') }}</h4>
                  </div>
                  <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('zipingBazi.methodologyCard4Desc') }}</p>
                </div>
              </div>
              <p class="text-xs text-[var(--text-faint)]">{{ $t('zipingBazi.methodologySource') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <TianganDizhi size="full" :label="$t('zipingBazi.calculating')" />
      </div>

      <!-- 阶段 3：结果（纸质报告：命盘 + AI 白话逐项注解） -->
      <div v-if="phase === 'result' && chart">
        <!-- 隐藏截图目标：完整纸质报告 -->
        <div ref="shareTargetRef" v-show="false" class="zpr-share-target">
          <ZipingBaziReport
            :chart="chart"
            :ai-content="aiContent"
            :streaming="false"
            :error="null"
            :birth-date="formValues.birthDate"
            :birth-hour="formValues.birthHour"
            :gender="formValues.gender"
            :name="formValues.name"
          />
        </div>

        <ZipingBaziReport
          :chart="chart"
          :ai-content="aiContent"
          :streaming="aiStreaming"
          :error="aiError"
          :birth-date="formValues.birthDate"
          :birth-hour="formValues.birthHour"
          :gender="formValues.gender"
          :name="formValues.name"
          @retry="startAiStream"
        />

        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" @click="resetToForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton color="warning" variant="soft" @click="handleShare">
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('common.shareResult') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { navigateTo('/') }">
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
import type { ZipingBaziChart } from '~/types/ziping-bazi'
import type { DiZhi } from '~/types/user'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const toast = useToast()
const siteName = config.public.siteName || 'ososn'
const siteUrl = (config.public.siteUrl as string) || 'https://www.ososn.com'

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
const chart = ref<ZipingBaziChart | null>(null)

const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

const store = useProfilesStore()

// 分享弹窗
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

async function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  phase.value = 'animating'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const result = await $fetch<ZipingBaziChart>('/api/tools/ziping-bazi/calc', {
      method: 'POST',
      body: {
        gender: values.gender,
        birthDate: values.birthDate,
        birthHour: values.birthHour || null,
        name: values.name || '',
        locale: locale.value,
      },
    })

    chart.value = result

    setTimeout(() => {
      phase.value = 'result'
      startAiStream()
    }, 1200)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('zipingBazi.calcFail'),
      description: err?.data?.message || err?.message || t('zipingBazi.checkInput'),
      color: 'error',
    })
  }
}

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
  })
}

async function startAiStream() {
  if (!chart.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/ziping-bazi/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chart.value,
        name: formValues.value.name || '',
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
            aiError.value = data.message || t('zipingBazi.aiRequestFailed')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('zipingBazi.aiRequestFailed')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
}

const { share } = useShare()

async function handleShare() {
  if (!chart.value) return

  try {
    const result = await share({
      tool: 'ziping-bazi',
      name: formValues.value.name,
      summary: `日主${chart.value.riZhu}（${chart.value.riZhuStrength}）· ${chart.value.geju}`,
      shareTarget: shareTargetRef.value,
      filename: `ziping-bazi-${formValues.value.name || '命盘'}-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })

    shareData.value = result
    shareDialogOpen.value = true
  }
  catch (e: any) {
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

useSeoMeta({
  title: () => `${t('seo.zipingBaziTitle')} - ${siteName}`,
  description: t('seo.zipingBaziDesc'),
  keywords: t('seo.zipingBaziKeywords'),
  ogTitle: () => `${t('seo.zipingBaziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.zipingBaziOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}/tools/ziping-bazi`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: `${siteUrl}/tools/ziping-bazi` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.zipingBaziTitle')} - ${siteName}`,
        url: `${siteUrl}/tools/ziping-bazi`,
        description: t('seo.zipingBaziDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('zipingBazi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}/tools/ziping-bazi`,
          description: t('zipingBazi.subtitle'),
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
.zpr-share-target {
  width: 1080px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 结果阶段：纸质报告需要更宽的版面 */
.zp-result-wrap {
  max-width: 80rem;
}
</style>
