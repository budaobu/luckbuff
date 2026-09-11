<template>
  <div class="rks-page">
    <div class="rks-container">
      <header class="rks-header">
        <div>
          <p class="rks-eyebrow">Rokusei Senjutsu</p>
          <h1>{{ $t('rokusei.title') }}</h1>
          <p class="rks-subtitle">{{ $t('rokusei.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/fortune-telling')" class="rks-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('tools.categoryFortuneTelling') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="rks-form-wrap">
        <div class="rks-card">
          <h2>{{ $t('rokusei.formTitle') }}</h2>
          <BaziForm
            :initial-values="lastFormValues"
            :show-name="false"
            :show-former-name="false"
            require-hour
            :submit-label="$t('rokusei.submit')"
            @submit="handleSubmit"
            @save-profile="handleSaveProfile"
          />
        </div>
        <div class="rks-hints">
          <article>
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('rokusei.hourHint') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('rokusei.locationHint') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('rokusei.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="rks-loading">
        <span />
        <p>{{ $t('rokusei.calculating') }}</p>
      </section>

      <div v-else-if="result" class="rks-report">
        <RokuseiSenjutsuReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="rks-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="rokusei-senjutsu"
          :summary="shareSummary"
          filename="rokusei-senjutsu-report.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { RokuseiSenjutsuResult } from '~~/app/types/rokusei-senjutsu'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<RokuseiSenjutsuResult | null>(null)
const lastFormValues = ref<Partial<FormValues>>({})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  const birth = result.value.birth
  return `${t(`rokusei.stars.${birth.starId}`)} ${t(`rokusei.signs.${birth.sign}`)} · ${t(`rokusei.phases.${result.value.annual.phase.id}`)}`
})

async function resolveLocation(name: string) {
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

async function handleSubmit(values: FormValues) {
  if (!values.birthDate || !values.birthHour) {
    toast.add({ title: t('rokusei.requiredError'), color: 'error' })
    return
  }

  lastFormValues.value = { ...values }
  phase.value = 'loading'
  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    result.value = await $fetch<RokuseiSenjutsuResult>('/api/tools/rokusei-senjutsu/calc', {
      method: 'POST',
      body: {
        birthDate: values.birthDate,
        birthHour: values.birthHour,
        gender: values.gender,
        location,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('rokusei.fail'),
      description: error?.data?.statusMessage || error?.message || t('rokusei.pleaseRetry'),
      color: 'error',
    })
  }
}

function handleSaveProfile(id: string, values: FormValues) {
  const store = useProfilesStore()
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    birthProvince: values.birthProvince || undefined,
  })
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.rokuseiTitle')} - ${siteName}`,
  description: t('seo.rokuseiDesc'),
  keywords: t('seo.rokuseiKeywords'),
  ogTitle: () => `${t('seo.rokuseiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.rokuseiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/rokusei-senjutsu',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('rokusei.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/rokusei-senjutsu')}`,
        description: t('seo.rokuseiDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.rks-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.rks-container { width: 100%; max-width: 1120px; margin: 0 auto; padding: 40px 20px 72px; }
.rks-header { margin-bottom: 28px; text-align: center; }
.rks-eyebrow { margin-bottom: 8px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
.rks-header h1 { margin: 0; font-size: clamp(27px, 4vw, 32px); line-height: 1.2; }
.rks-subtitle { max-width: 700px; margin: 10px auto 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.rks-back { position: absolute; top: 40px; left: 20px; display: inline-flex; gap: 6px; align-items: center; color: var(--text-muted); font-size: 13px; }
.rks-back:hover { color: var(--accent); }
.rks-form-wrap { display: grid; gap: 16px; max-width: 680px; margin: 0 auto; }
.rks-card { padding: 20px; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); }
.rks-card h2 { margin: 0 0 16px; font-size: 17px; }
.rks-hints { display: grid; gap: 10px; }
.rks-hints article { display: flex; gap: 9px; align-items: flex-start; padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: 10px; background: color-mix(in srgb, var(--surface-card) 72%, transparent); color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.rks-hints svg { flex-shrink: 0; margin-top: 2px; }
.rks-loading { display: grid; justify-items: center; gap: 12px; padding: 72px 20px; color: var(--text-muted); }
.rks-loading span { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1s ease-in-out infinite; }
.rks-actions { display: flex; gap: 10px; justify-content: center; margin-top: 30px; }
.rks-report { display: grid; }
@keyframes pulse { 50% { opacity: .35; transform: scale(.92); } }
@media (max-width: 760px) {
  .rks-container { padding-top: 28px; }
  .rks-back { position: static; justify-content: center; margin-top: 16px; }
}
</style>
