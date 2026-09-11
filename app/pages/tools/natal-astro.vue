<template>
  <div class="wn-page">
    <div class="wn-container">
      <header class="wn-header">
        <div>
          <p class="wn-eyebrow">Western Natal Chart</p>
          <h1 class="wn-title">{{ $t('natalAstro.title') }}</h1>
          <p class="wn-subtitle">{{ $t('natalAstro.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="wn-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="wn-form-wrap">
        <div class="wn-card wn-form">
          <h2 class="wn-card-title">{{ $t('natalAstro.formTitle') }}</h2>

          <div v-if="profiles.length" class="wn-profiles">
            <label>{{ $t('baziForm.selectProfile') }}</label>
            <div>
              <button
                v-for="profile in profiles"
                :key="profile.id"
                type="button"
                :class="{ 'is-active': selectedProfileId === profile.id }"
                @click="selectProfile(profile)"
              >
                <UIcon name="i-heroicons-user" class="h-3 w-3" />
                {{ profile.label }}
              </button>
            </div>
          </div>
          <div v-else class="wn-empty-profile">
            {{ $t('baziForm.noProfiles') }}
            <NuxtLink :to="localePath('/settings')">{{ $t('baziForm.goSettings') }}</NuxtLink>
          </div>

          <div class="wn-field">
            <label>{{ $t('profileForm.gender') }} <b>*</b></label>
            <div class="wn-segment">
              <button type="button" :class="{ 'is-active': form.gender === 'male' }" @click="form.gender = 'male'">
                {{ $t('common.male') }}
              </button>
              <button type="button" :class="{ 'is-active': form.gender === 'female' }" @click="form.gender = 'female'">
                {{ $t('common.female') }}
              </button>
            </div>
          </div>

          <div class="wn-field">
            <label>{{ $t('profileForm.birthDate') }} <b>*</b></label>
            <UPopover>
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                class="w-full justify-start"
                :class="{ 'wn-placeholder': !form.birthDate }"
              >
                <UIcon name="i-heroicons-calendar" class="mr-2 h-4 w-4" />
                {{ form.birthDate && calendarDate ? dateFormatter.format(calendarDate.toDate(tz)) : $t('profileForm.birthDatePlaceholder') }}
              </UButton>
              <template #content>
                <AppCalendar v-model="calendarDate" color="warning" class="p-2" />
              </template>
            </UPopover>
          </div>

          <div class="wn-field">
            <label>{{ $t('natalAstro.birthTimeLabel') }} <b>*</b></label>
            <UInput
              v-model="form.birthTime"
              type="time"
              step="60"
              class="w-full"
              :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)]' }"
            />
            <label class="wn-checkbox">
              <input v-model="form.timeUncertain" type="checkbox">
              {{ $t('natalAstro.timeUncertain') }}
            </label>
          </div>

          <div class="wn-field">
            <label>{{ $t('natalAstro.birthCityLabel') }} <b>*</b></label>
            <UInput
              v-model="form.birthCity"
              :placeholder="$t('natalAstro.birthCityPlaceholder')"
              class="w-full"
              :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
            />
          </div>

          <UButton color="warning" size="lg" block :disabled="!isValid" @click="handleSubmit">
            <template #leading>
              <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
            </template>
            {{ $t('natalAstro.submit') }}
          </UButton>
        </div>

        <div class="wn-hints">
          <article>
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('natalAstro.timeHint') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('natalAstro.locationHint') }}</p>
          </article>
          <article>
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('natalAstro.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="wn-loading">
        <span />
        <p>{{ $t('natalAstro.calculating') }}</p>
      </section>

      <div v-else-if="result" class="wn-report">
        <NatalAstroReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="wn-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="natal-astro"
          :summary="shareSummary"
          filename="natal-astro-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { UserProfile } from '~/types/user'
import type { NatalAstroResult } from '~~/app/types/natal-astro'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { profiles, defaultProfile } = useProfiles()

const tz = getLocalTimeZone()
const dateFormatter = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : 'zh-CN', { dateStyle: 'long' }))
const calendarDate = shallowRef<DateValue>()

const form = reactive({
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  birthTime: '',
  birthCity: '',
  timeUncertain: false,
})
const selectedProfileId = ref<string | null>(null)
const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<NatalAstroResult | null>(null)

const isValid = computed(() => !!(form.gender && form.birthDate && form.birthTime && form.birthCity.trim()))
const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `ASC ${result.value.angles.ascendant} · ${result.value.points.length} ${t('natalAstro.summaryPoints')}`
})

watch(calendarDate, (value) => {
  form.birthDate = value ? value.toString() : ''
})

watch(() => form.birthDate, (value) => {
  try {
    const parsed = value ? parseDate(value) : undefined
    if (parsed?.toString() !== calendarDate.value?.toString()) calendarDate.value = parsed
  }
  catch {
    calendarDate.value = undefined
  }
})

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.gender = profile.gender
  form.birthDate = profile.birthDate || ''
  form.birthCity = profile.birthProvince || ''
  if (form.birthDate) {
    try {
      calendarDate.value = parseDate(form.birthDate)
    }
    catch {
      calendarDate.value = undefined
    }
  }
}

async function handleSubmit() {
  if (!isValid.value) {
    toast.add({ title: t('natalAstro.requiredError'), color: 'error' })
    return
  }

  phase.value = 'loading'
  try {
    result.value = await $fetch<NatalAstroResult>('/api/tools/natal-astro/calc', {
      method: 'POST',
      body: {
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        gender: form.gender,
        birthCity: form.birthCity.trim(),
        timeUncertain: form.timeUncertain,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('natalAstro.fail'),
      description: error?.data?.statusMessage || error?.message || t('natalAstro.pleaseRetry'),
      color: 'error',
    })
  }
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

onMounted(() => {
  if (defaultProfile.value && !form.birthDate) selectProfile(defaultProfile.value)
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.natalAstroTitle')} - ${siteName}`,
  description: t('seo.natalAstroDesc'),
  keywords: t('seo.natalAstroKeywords'),
  ogTitle: () => `${t('seo.natalAstroOgTitle')} - ${siteName}`,
  ogDescription: t('seo.natalAstroOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/natal-astro',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('natalAstro.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/natal-astro')}`,
        description: t('seo.natalAstroDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.wn-page { min-height: 100vh; background: var(--surface-bg); color: var(--text-primary); }
.wn-container { width: 100%; max-width: 1120px; margin: 0 auto; padding: 40px 20px 72px; }
.wn-header { position: relative; display: grid; gap: 18px; margin-bottom: 30px; text-align: center; }
.wn-eyebrow { margin-bottom: 8px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
.wn-title { margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2; }
.wn-subtitle { max-width: 680px; margin: 10px 0 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.wn-back { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: 5px; color: var(--text-muted); font-size: 13px; text-decoration: none; }
.wn-back:hover { color: var(--accent); }

.wn-form-wrap { display: grid; gap: 20px; }
.wn-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 24px; }
.wn-card-title { margin: 0 0 18px; font-size: 18px; }
.wn-profiles { margin-bottom: 18px; }
.wn-profiles label { display: block; margin-bottom: 7px; color: var(--text-muted); font-size: 12px; }
.wn-profiles > div { display: flex; flex-wrap: wrap; gap: 7px; }
.wn-profiles button { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--border-light); border-radius: 999px; background: var(--surface-card); color: var(--text-muted); padding: 5px 10px; font-size: 12px; cursor: pointer; }
.wn-profiles button.is-active { border-color: var(--accent-border-hover); background: var(--accent-bg); color: var(--accent); }
.wn-empty-profile { margin-bottom: 16px; padding: 10px 12px; border: 1px solid var(--border-subtle); border-radius: 10px; color: var(--text-faint); font-size: 13px; }
.wn-empty-profile a { margin-left: 4px; color: var(--accent); }

.wn-field { margin-bottom: 16px; }
.wn-field > label { display: block; margin-bottom: 7px; color: var(--text-muted); font-size: 12px; }
.wn-field > label b { color: var(--accent); }
.wn-placeholder { color: var(--text-placeholder); }
.wn-segment { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.wn-segment button { padding: 10px; border: 1px solid var(--border-light); border-radius: 10px; background: var(--surface-card); color: var(--text-muted); font-size: 13px; cursor: pointer; }
.wn-segment button.is-active { border-color: var(--accent-border-hover); background: var(--accent-bg); color: var(--accent); }
.wn-checkbox { display: flex; align-items: center; gap: 7px; margin-top: 9px; color: var(--text-muted); font-size: 12px; }
.wn-checkbox input { accent-color: var(--accent); }

.wn-hints { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.wn-hints article { display: flex; gap: 10px; align-items: flex-start; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 14px 16px; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.wn-hints .ui-icon { flex: 0 0 auto; margin-top: 2px; color: var(--accent); }
.wn-loading { display: grid; place-items: center; min-height: 240px; color: var(--text-muted); }
.wn-loading span { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: wn-pulse 1.4s infinite; }
.wn-report { display: grid; }
.wn-actions { display: flex; justify-content: center; gap: 12px; margin-top: 26px; }

@keyframes wn-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
}

@media (max-width: 900px) {
  .wn-container { padding: 28px 16px 56px; }
  .wn-title { font-size: 24px; }
  .wn-hints { grid-template-columns: 1fr; }
  .wn-back { position: static; justify-self: center; }
}
</style>
