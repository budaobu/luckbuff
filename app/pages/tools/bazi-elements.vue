<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[8%] left-[16%] w-[420px] h-[420px] rounded-full bg-[var(--accent)]/[0.06] blur-[120px]" />
      <div class="absolute bottom-[24%] right-[12%] w-[360px] h-[360px] rounded-full bg-[var(--accent-purple)]/[0.05] blur-[110px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12" :class="{ 'bze-page-result': phase === 'result' }">
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bazi Elements</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('baziElements.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziElements.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <BaziForm
              :initial-values="formValues"
              :show-former-name="false"
              :show-birth-province="false"
              :submit-label="$t('baziElements.submit')"
              @submit="handleSubmit"
            />
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h2 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziElements.card1Title') }}</h2>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziElements.card1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h2 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziElements.card2Title') }}</h2>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziElements.card2Desc') }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="phase === 'result' && result">
        <BaziElementsPoster
          :result="result"
          :ai-content="aiContent"
          :streaming="aiStreaming"
          :error="aiError"
          :name="formValues.name"
          :birth-date="formValues.birthDate"
          :birth-hour="formValues.birthHour"
          :gender="formValues.gender"
          @retry="startReading"
        />

        <div class="flex gap-3 justify-center mt-8 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
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
            @click="() => { navigateTo(localePath('/tools/bazi')) }"
          >
            <template #leading>
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </template>
            {{ $t('baziElements.backToBazi') }}
          </UButton>
        </div>
      </div>
    </div>

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
                <h2 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h2>
              </div>
              <UButton color="neutral" variant="ghost" @click="shareDialogOpen = false">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
              </div>
              <img
                v-if="shareData?.screenshotDataUrl"
                :src="shareData.screenshotDataUrl"
                :alt="$t('share.shareScreenshot')"
                class="w-full rounded-lg border border-[var(--border-light)]"
              >
              <p v-else-if="shareData?.screenshotError" class="text-xs text-[var(--text-faint)]">
                {{ shareData.screenshotError }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { BaziElementsResult } from '~~/server/utils/tools/bazi-elements'
import type { DiZhi } from '~/types/user'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const phase = ref<'form' | 'result'>('form')
const formValues = ref<FormValues>({ gender: 'male', birthDate: '', birthHour: undefined, name: '' })
const result = ref<BaziElementsResult | null>(null)

const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)
let aiAbortController: AbortController | null = null

const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

async function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  try {
    result.value = await $fetch<BaziElementsResult>('/api/tools/bazi-elements/calc', {
      method: 'POST',
      body: values,
    })
    phase.value = 'result'
    await nextTick()
    shareTargetRef.value = document.querySelector<HTMLElement>('.bze') ?? undefined
    startReading()
  }
  catch (error: any) {
    toast.add({
      title: t('baziElements.failed'),
      description: error?.data?.statusMessage || error?.message || t('baziElements.checkInput'),
      color: 'error',
    })
  }
}

async function startReading() {
  if (!result.value) return
  aiAbortController?.abort()
  aiAbortController = new AbortController()
  const { signal } = aiAbortController
  aiStreaming.value = true
  aiError.value = null
  aiContent.value = ''

  try {
    const response = await fetch('/api/tools/bazi-elements/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({ ...formValues.value, locale: locale.value }),
    })
    if (!response.ok) {
      const text = await response.text()
      let message = `HTTP ${response.status}`
      try {
        const data = JSON.parse(text)
        message = data.message || data.statusMessage || message
      }
      catch {}
      throw new Error(message)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error(t('baziElements.aiFailed'))
    const decoder = new TextDecoder()
    let buffer = ''
    let received = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        const event = JSON.parse(payload) as { type?: string; text?: string; message?: string }
        if (event.type === 'error') throw new Error(event.message || t('baziElements.aiFailed'))
        if (event.type === 'text' && event.text) {
          received = true
          aiContent.value += event.text
        }
      }
    }

    if (!received || !aiContent.value.trim()) throw new Error(t('baziElements.aiFailed'))
  }
  catch (error: any) {
    if (!signal.aborted) aiError.value = error?.message || t('baziElements.aiFailed')
  }
  finally {
    aiAbortController = null
    aiStreaming.value = false
  }
}

function resetToForm() {
  aiAbortController?.abort()
  phase.value = 'form'
  result.value = null
  aiContent.value = ''
  aiError.value = null
  aiStreaming.value = false
}

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()
  try {
    const summary = t('baziElements.shareSummary', {
      dayMaster: result.value.dayMaster,
      strength: result.value.strength,
      favorable: result.value.favorable.join('、'),
    })
    shareData.value = await share({
      tool: 'bazi-elements',
      name: formValues.value.name,
      summary,
      shareTarget: shareTargetRef.value,
      filename: `bazi-elements-${formValues.value.name || 'chart'}-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareDialogOpen.value = true
  }
  catch (error: any) {
    toast.add({
      title: t('share.shareFail'),
      description: error?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

const siteName = 'ososn'
useSeoMeta({
  title: () => `${t('seo.baziElementsTitle')} - ${siteName}`,
  description: t('seo.baziElementsDesc'),
  keywords: t('seo.baziElementsKeywords'),
  ogTitle: () => `${t('seo.baziElementsOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziElementsOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: `https://www.ososn.com/tools/bazi-elements`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: t('seo.baziElementsTitle'),
        url: 'https://www.ososn.com/tools/bazi-elements',
        description: t('seo.baziElementsDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('baziElements.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/bazi-elements',
          description: t('seo.baziElementsDesc'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.bze-page-result {
  max-width: 80rem;
}
</style>
