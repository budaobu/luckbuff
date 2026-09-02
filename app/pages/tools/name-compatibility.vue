<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[8%] right-[16%] w-[420px] h-[420px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[28%] left-[12%] w-[360px] h-[360px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[110px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12" :class="{ 'ncp-page-result': phase === 'result' }">
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Name Compatibility</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('nameCompatibility.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">{{ $t('nameCompatibility.subtitle') }}</p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-xs font-medium text-[var(--text-muted)] mb-2">{{ $t('nameCompatibility.nameA') }}</label>
              <UInput
                v-model="form.nameA"
                :placeholder="$t('nameCompatibility.namePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-[var(--text-muted)] mb-2">{{ $t('nameCompatibility.nameB') }}</label>
              <UInput
                v-model="form.nameB"
                :placeholder="$t('nameCompatibility.namePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">{{ $t('nameCompatibility.nameHint') }}</p>
            </div>
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </template>
              {{ $t('nameCompatibility.submit') }}
            </UButton>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('nameCompatibility.card1Title') }}</h2>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('nameCompatibility.card1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <h2 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ $t('nameCompatibility.card2Title') }}</h2>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('nameCompatibility.card2Desc') }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="phase === 'result' && result">
        <NameCompatibilityPoster
          :result="result"
          :ai-content="aiContent"
          :streaming="aiStreaming"
          :error="aiError"
          @retry="startReading"
        />
        <div class="flex gap-3 justify-center mt-8 flex-wrap">
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
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="shareDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="shareDialogOpen = false">
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] w-[90vw] max-w-md mx-4 overflow-hidden shadow-2xl">
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h2 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h2>
              <UButton color="neutral" variant="ghost" @click="shareDialogOpen = false">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm whitespace-pre-wrap">
                {{ shareData?.copyText }}
              </div>
              <img v-if="shareData?.screenshotDataUrl" :src="shareData.screenshotDataUrl" class="w-full rounded-lg" alt="">
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { NameCompatibilityResult } from '~~/server/utils/name-compatibility/engine'

const { t, locale } = useI18n()
const toast = useToast()
const phase = ref<'form' | 'result'>('form')
const form = reactive({ nameA: '', nameB: '' })
const result = ref<NameCompatibilityResult | null>(null)
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()
let abortController: AbortController | null = null

const canSubmit = computed(() => form.nameA.trim() !== form.nameB.trim() && form.nameA.trim().length >= 2 && form.nameB.trim().length >= 2)
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

async function handleSubmit() {
  if (!canSubmit.value) return
  try {
    const payload = { nameA: form.nameA.trim(), nameB: form.nameB.trim() }
    result.value = await $fetch<NameCompatibilityResult>('/api/tools/name-compatibility/calc', { method: 'POST', body: payload })
    phase.value = 'result'
    await nextTick()
    shareTargetRef.value = document.querySelector<HTMLElement>('.ncp') ?? undefined
    startReading()
  }
  catch (error: any) {
    toast.add({
      title: t('nameCompatibility.failed'),
      description: error?.data?.statusMessage || error?.message || t('nameCompatibility.checkInput'),
      color: 'error',
    })
  }
}

async function startReading() {
  if (!result.value) return
  abortController?.abort()
  abortController = new AbortController()
  const { signal } = abortController
  aiContent.value = ''
  aiError.value = null
  aiStreaming.value = true
  try {
    const response = await fetch('/api/tools/name-compatibility/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({ nameA: form.nameA.trim(), nameB: form.nameB.trim(), locale: locale.value }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const reader = response.body?.getReader()
    if (!reader) throw new Error(t('nameCompatibility.aiFailed'))
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
        if (event.type === 'error') throw new Error(event.message || t('nameCompatibility.aiFailed'))
        if (event.type === 'text' && event.text) {
          received = true
          aiContent.value += event.text
        }
      }
    }
    if (!received || !aiContent.value.trim()) throw new Error(t('nameCompatibility.aiFailed'))
  }
  catch (error: any) {
    if (!signal.aborted) aiError.value = error?.message || t('nameCompatibility.aiFailed')
  }
  finally {
    abortController = null
    aiStreaming.value = false
  }
}

function resetToForm() {
  abortController?.abort()
  phase.value = 'form'
  result.value = null
  aiContent.value = ''
  aiError.value = null
}

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()
  try {
    shareData.value = await share({
      tool: 'name-compatibility',
      name: `${form.nameA} · ${form.nameB}`,
      summary: t(`nameCompatibility.pattern.${result.value.pattern}`),
      shareTarget: shareTargetRef.value,
      filename: `name-compatibility-${form.nameA}-${form.nameB}.png`,
      t,
    })
    shareDialogOpen.value = true
  }
  catch (error: any) {
    toast.add({ title: t('share.shareFail'), description: error?.message || t('share.pleaseRetry'), color: 'error' })
  }
}

const siteName = 'ososn'
useSeoMeta({
  title: () => `${t('seo.nameCompatibilityTitle')} - ${siteName}`,
  description: t('seo.nameCompatibilityDesc'),
  keywords: t('seo.nameCompatibilityKeywords'),
  ogTitle: () => `${t('seo.nameCompatibilityOgTitle')} - ${siteName}`,
  ogDescription: t('seo.nameCompatibilityOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/name-compatibility',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('seo.nameCompatibilityTitle'),
      url: 'https://www.ososn.com/tools/name-compatibility',
      description: t('seo.nameCompatibilityDesc'),
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: t('nameCompatibility.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: 'https://www.ososn.com/tools/name-compatibility',
        description: t('seo.nameCompatibilityDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      },
    }),
  }],
}))
</script>

<style scoped>
.ncp-page-result {
  max-width: 80rem;
}
</style>
