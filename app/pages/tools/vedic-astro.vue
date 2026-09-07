<template>
  <div class="vc-page">
    <div class="vc-container">
      <header class="vc-header">
        <div>
          <p class="vc-eyebrow">Vedic Chart</p>
          <h1>{{ $t('vpc.title') }}</h1>
          <p>{{ $t('vpc.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/paipan')" class="vc-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="vc-form-wrap">
        <div class="vc-card">
          <h2>{{ $t('vpc.formTitle') }}</h2>
          <VedicStepForm
            v-model="formData"
            :error-msg="formError"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="vc-hints">
          <article><UIcon name="i-heroicons-clock" class="h-4 w-4" /><p>{{ $t('vpc.timeHint') }}</p></article>
          <article><UIcon name="i-heroicons-map-pin" class="h-4 w-4" /><p>{{ $t('vedic.form.cityHint') }}</p></article>
          <article><UIcon name="i-heroicons-shield-check" class="h-4 w-4" /><p>{{ $t('vedic.form.privacy') }}</p></article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="vc-loading">
        <span />
        <p>{{ $t('vpc.calculating') }}</p>
      </section>

      <div v-else-if="result" ref="shareTargetRef" class="vc-report">
        <VedicPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="vc-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading><UIcon name="i-heroicons-arrow-path" class="h-4 w-4" /></template>
          {{ $t('common.retry') }}
        </UButton>
        <UButton color="warning" variant="soft" @click="handleShare">
          <template #leading><UIcon name="i-heroicons-share" class="h-4 w-4" /></template>
          {{ $t('common.shareResult') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VedicFormData } from '~/types/vedic'
import type { UserProfile } from '~/types/user'
import type { VedicPaipanResult } from '~/types/vedic-paipan'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const store = useProfilesStore()

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<VedicPaipanResult | null>(null)
const formError = ref('')
const shareTargetRef = ref<HTMLElement>()
const formData = ref<VedicFormData>({
  birthDate: '',
  birthTime: '',
  city: '',
  gender: '',
  dimensions: ['core', 'career', 'love', 'annual'],
  timeUncertain: false,
})

async function handleSubmit() {
  formError.value = ''
  if (!formData.value.birthDate || !formData.value.birthTime || !formData.value.city.trim()) {
    formError.value = t('vpc.requiredError')
    return
  }

  phase.value = 'loading'
  try {
    result.value = await $fetch<VedicPaipanResult>('/api/tools/vedic-paipan/calc', {
      method: 'POST',
      body: {
        birthDate: formData.value.birthDate,
        birthTime: formData.value.birthTime,
        city: formData.value.city.trim(),
        gender: formData.value.gender || '',
        timeUncertain: formData.value.timeUncertain,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('vpc.fail'),
      description: error?.data?.statusMessage || error?.message || t('common.pleaseRetry'),
      color: 'error',
    })
  }
}

function handleSaveProfile(id: string, values: Partial<Pick<UserProfile, 'gender' | 'birthDate' | 'birthProvince'>>) {
  store.update(id, values)
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

async function handleShare() {
  if (!result.value) return
  const { share } = useShare()
  try {
    await share({
      tool: 'vedic',
      summary: `${t('vpc.ascendant')} ${result.value.ascendant.signName} · ${result.value.dasha.currentMahadasha?.planet || ''}`,
      shareTarget: shareTargetRef.value,
      filename: `vedic-paipan-${formData.value.birthDate}.png`,
      t,
    })
  }
  catch (error: any) {
    toast.add({ title: t('share.shareFail'), description: error?.message || t('share.pleaseRetry'), color: 'error' })
  }
}

onMounted(() => {
  const profileId = route.query.profile as string | undefined
  if (!profileId) return
  const profile = store.list.find(item => item.id === profileId)
  const DIZHI_TO_TIME: Record<string, string> = {
    '子': '00:00', '丑': '01:00', '寅': '03:00', '卯': '05:00',
    '辰': '07:00', '巳': '09:00', '午': '11:00', '未': '13:00',
    '申': '15:00', '酉': '17:00', '戌': '19:00', '亥': '21:00',
  }
  if (profile?.birthDate) {
    formData.value.birthDate = profile.birthDate
    formData.value.birthTime = profile.birthHour ? DIZHI_TO_TIME[profile.birthHour] || '' : ''
    formData.value.city = profile.birthProvince || ''
    formData.value.gender = profile.gender || ''
    router.replace({ query: {} })
  }
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.vedicTitle')} - ${siteName}`,
  description: t('seo.vedicDesc'),
  keywords: t('seo.vedicKeywords'),
  ogTitle: () => `${t('seo.vedicOgTitle')} - ${siteName}`,
  ogDescription: t('seo.vedicOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/vedic-astro',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('seo.vedicTitle'),
      url: 'https://www.ososn.com/tools/vedic-astro',
      description: t('seo.vedicDesc'),
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: t('vpc.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: 'https://www.ososn.com/tools/vedic-astro',
        description: t('seo.vedicDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      },
    }),
  }],
}))
</script>

<style scoped>
.vc-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.vc-container { max-width: 1120px; margin: 0 auto; padding: 40px 20px 72px; }
.vc-header { display: grid; gap: 18px; margin-bottom: 30px; position: relative; text-align: center; }
.vc-eyebrow { margin-bottom: 8px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
.vc-header h1 { margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2; }
.vc-header > div > p { max-width: 660px; margin: 10px auto 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.vc-back { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.vc-back:hover { color: var(--accent); }
.vc-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; }
.vc-card h2 { margin: 0 0 16px; font-size: 16px; font-weight: 700; }
.vc-form-wrap { display: grid; gap: 18px; max-width: 680px; margin: 0 auto; }
.vc-hints { display: grid; gap: 10px; }
.vc-hints article { display: flex; gap: 9px; align-items: flex-start; padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: 10px; background: color-mix(in srgb, var(--surface-card) 72%, transparent); color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.vc-loading { display: grid; justify-items: center; gap: 12px; padding: 72px 20px; color: var(--text-muted); font-size: 14px; }
.vc-loading span { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: vc-pulse 1s ease-in-out infinite; }
.vc-report { display: grid; gap: 38px; }
.vc-actions { display: flex; justify-content: center; gap: 10px; margin-top: 34px; flex-wrap: wrap; }
@keyframes vc-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
@media (max-width: 640px) {
  .vc-container { padding: 28px 16px 56px; }
  .vc-back { position: static; justify-content: center; }
  .vc-header h1 { font-size: 24px; }
}
</style>
