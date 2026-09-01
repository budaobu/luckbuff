<template>
  <div class="relative overflow-hidden">
    <div class="relative z-10 max-w-6xl mx-auto px-6 pt-28 md:pt-32 pb-12">
      <div v-if="phase === 'form'" class="max-w-2xl mx-auto">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">New School BaZi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('newSchoolBazi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">{{ $t('newSchoolBazi.subtitle') }}</p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="p-6">
            <BaziForm
              :initial-values="lastFormValues"
              :show-former-name="false"
              :show-birth-province="false"
              :submit-label="$t('newSchoolBazi.submit')"
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
          </div>
        </div>

        <div class="mt-6 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-3 font-serif">
            {{ $t('newSchoolBazi.methodologyTitle') }}
          </h2>
          <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ $t('newSchoolBazi.methodologyIntro') }}</p>
          <p class="mt-4 text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('newSchoolBazi.methodologyNotice') }}</p>
        </div>
      </div>

      <div v-else-if="phase === 'loading'" class="flex flex-col items-center justify-center min-h-[55vh]">
        <TianganDizhi size="full" :label="$t('newSchoolBazi.calculating')" />
      </div>

      <div v-else-if="phase === 'result' && chart" class="max-w-3xl mx-auto">
        <div ref="shareTargetRef">
          <NewSchoolBaziPoster
            :chart="chart"
            :ai-content="aiContent"
            :method-notice="methodNotice"
            :streaming="aiStreaming"
            :error="aiError"
            :name="formValues.name"
          />
        </div>

        <div class="flex gap-3 justify-center mt-8 flex-wrap">
          <UButton color="warning" variant="soft" @click="resetToForm">
            <template #leading><UIcon name="i-heroicons-arrow-path" class="w-4 h-4" /></template>
            {{ $t('newSchoolBazi.again') }}
          </UButton>
          <UButton color="warning" variant="soft" @click="handleShare">
            <template #leading><UIcon name="i-heroicons-share" class="w-4 h-4" /></template>
            {{ $t('common.shareResult') }}
          </UButton>
          <UButton color="neutral" variant="ghost" @click="() => { navigateTo('/') }">
            <template #leading><UIcon name="i-heroicons-home" class="w-4 h-4" /></template>
            {{ $t('common.backHome') }}
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
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] w-[90vw] max-w-md mx-4 overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h3>
              <UButton color="neutral" variant="ghost" @click="() => { shareDialogOpen = false }">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm whitespace-pre-wrap">
                {{ shareData?.copyText }}
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <img :src="shareData.screenshotDataUrl" :alt="$t('share.shareScreenshot')" class="w-full rounded-lg">
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  {{ $t('share.downloadImage') }}
                </UButton>
              </div>
              <p v-else class="text-xs text-[var(--text-faint)]">{{ shareData?.screenshotError || $t('share.screenshotFailed') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { NewSchoolBaziChart } from '~/types/new-school-bazi'
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
const pageUrl = useLocalizedSeoUrl('/tools/new-school-bazi')

const phase = ref<'form' | 'loading' | 'result'>('form')
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
const chart = ref<NewSchoolBaziChart | null>(null)

const rawAiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)
const methodNotice = ref('')
const aiContent = computed(() => rawAiContent.value.replace(/^METHOD:[^\n]*\n?/u, ''))

const store = useProfilesStore()
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

async function handleSubmit(values: FormValues) {
  formValues.value = { ...values }
  lastFormValues.value = { ...values }
  phase.value = 'loading'
  chart.value = null
  rawAiContent.value = ''
  methodNotice.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    chart.value = await $fetch<NewSchoolBaziChart>('/api/tools/new-school-bazi/calc', {
      method: 'POST',
      body: {
        gender: values.gender,
        birthDate: values.birthDate,
        birthHour: values.birthHour || null,
      },
    })
    phase.value = 'result'
    await nextTick()
    startAiStream()
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('newSchoolBazi.calcFailed'),
      description: error?.data?.message || error?.message || t('newSchoolBazi.checkInput'),
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

  rawAiContent.value = ''
  methodNotice.value = ''
  aiStreaming.value = true
  aiError.value = null

  try {
    const response = await fetch('/api/tools/new-school-bazi/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender: formValues.value.gender,
        birthDate: formValues.value.birthDate,
        birthHour: formValues.value.birthHour || null,
        name: formValues.value.name || '',
        locale: locale.value,
      }),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

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
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) {
            rawAiContent.value += data.text
            const method = rawAiContent.value.match(/^METHOD:([^\n]+)/u)
            if (method?.[1]) methodNotice.value = method[1]!.trim()
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('newSchoolBazi.readingFailed')
          }
        }
        catch {}
      }
    }
  }
  catch (error: any) {
    aiError.value = error?.message || t('newSchoolBazi.readingFailed')
  }
  finally {
    rawAiContent.value = rawAiContent.value.replace(/\.{3,}$/u, '').trimEnd()
    aiStreaming.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  chart.value = null
  rawAiContent.value = ''
  methodNotice.value = ''
  aiStreaming.value = false
  aiError.value = null
}

const { share } = useShare()

async function handleShare() {
  if (!chart.value) return
  try {
    const result = await share({
      tool: 'new-school-bazi',
      name: formValues.value.name,
      summary: `${chart.value.riZhuStrength} · ${chart.value.geju} · ${chart.value.xiyong}`,
      shareTarget: shareTargetRef.value,
      filename: `new-school-bazi-${formValues.value.name || 'chart'}-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = result
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

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const link = document.createElement('a')
  link.href = shareData.value.screenshotDataUrl
  link.download = shareData.value.filename
  link.click()
}

useSeoMeta({
  title: () => `${t('seo.newSchoolBaziTitle')} - ${siteName}`,
  description: t('seo.newSchoolBaziDesc'),
  keywords: t('seo.newSchoolBaziKeywords'),
  ogTitle: () => `${t('seo.newSchoolBaziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.newSchoolBaziOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.newSchoolBaziTitle')} - ${siteName}`,
        url: pageUrl.value,
        description: t('seo.newSchoolBaziDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('newSchoolBazi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('newSchoolBazi.subtitle'),
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
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
