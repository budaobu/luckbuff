<template>
  <div class="qmp-page">
    <div class="qmp-container">
      <header class="qmp-header">
        <div>
          <p class="qmp-eyebrow">Qimen Chart</p>
          <h1 class="qmp-title">{{ $t('qimenPaipan.title') }}</h1>
          <p class="qmp-subtitle">{{ $t('qimenPaipan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/paipan')" class="qmp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="qmp-form-wrap">
        <form class="qmp-card qmp-form" @submit.prevent="handleSubmit">
          <h2 class="qmp-card-title">{{ $t('qimenPaipan.formTitle') }}</h2>

          <DivinationTimeCard
            ref="timeCardRef"
            :label="$t('qimenPaipan.time')"
            :hint="$t('qimenPaipan.timeHint')"
            required
          />

          <div>
            <label for="qimen-paipan-location">{{ $t('qimenPaipan.location') }}</label>
            <UInput
              id="qimen-paipan-location"
              v-model="form.location"
              :placeholder="$t('qimenPaipan.locationPlaceholder')"
              class="w-full"
            />
            <p class="qmp-field-hint">{{ $t('qimenPaipan.locationHint') }}</p>
          </div>

          <UButton type="submit" color="warning" size="lg" block>
            <template #leading>
              <UIcon name="i-heroicons-table-cells" class="h-4 w-4" />
            </template>
            {{ $t('qimenPaipan.submit') }}
          </UButton>
        </form>

        <div class="qmp-hints">
          <article class="qmp-hint">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <p>{{ $t('qimenPaipan.timeHint') }}</p>
          </article>
          <article class="qmp-hint">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
            <p>{{ $t('qimenPaipan.locationHint') }}</p>
          </article>
          <article class="qmp-hint">
            <UIcon name="i-heroicons-sun" class="h-4 w-4" />
            <p>{{ $t('qimenPaipan.solarTimeHint') }}</p>
          </article>
          <article class="qmp-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('qimenPaipan.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="qmp-loading">
        <span class="qmp-loading-dot" />
        <p>{{ $t('qimenPaipan.calculating') }}</p>
      </section>

      <div v-else-if="result" class="qmp-report">
        <QimenPaipanReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="qmp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('common.retry') }}
        </UButton>
        <AppShareButton
          tool="qimen-paipan"
          :summary="shareSummary"
          filename="qimen-paipan-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QimenPaipanResult } from '~~/app/types/qimen-paipan'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()
const timeCardRef = ref<{ iso: string, timezone: string } | null>(null)

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<QimenPaipanResult | null>(null)
const form = ref({ location: '' })
const lastFormValues = ref({ location: '' })
const shareSummary = computed(() => {
  if (!result.value) return undefined
  const summary = result.value.summary
  return `${summary.dunTypeText}${summary.juNumber}${t('qimenPaipan.juSuffix')} · ${summary.solarTerm} · ${summary.zhiFu}@${summary.zhiFuPalace}`
})

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
  }
  catch {
    return 'Asia/Shanghai'
  }
}

interface ResolvedLocation {
  name: string
  longitude?: number
  latitude?: number
  timezone?: string
}

async function resolveLocation(name: string): Promise<ResolvedLocation | null> {
  if (!name.trim()) return null
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

async function handleSubmit() {
  const datetime = timeCardRef.value?.iso
  if (!datetime) {
    toast.add({ title: t('qimenPaipan.requiredError'), color: 'error' })
    return
  }

  lastFormValues.value = { ...form.value }
  phase.value = 'loading'

  try {
    const location = await resolveLocation(form.value.location)
    const timezone = location?.timezone || timeCardRef.value?.timezone || browserTimezone()
    result.value = await $fetch<QimenPaipanResult>('/api/tools/qimen-paipan/calc', {
      method: 'POST',
      body: {
        datetime,
        timezone,
        location: form.value.location,
        longitude: location?.longitude,
        latitude: location?.latitude,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('qimenPaipan.fail'),
      description: error?.data?.statusMessage || error?.message || t('qimenPaipan.pleaseRetry'),
      color: 'error',
    })
  }
}

function resetToForm() {
  phase.value = 'form'
  result.value = null
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.qimenPaipanTitle')} - ${siteName}`,
  description: t('seo.qimenPaipanDesc'),
  keywords: t('seo.qimenPaipanKeywords'),
  ogTitle: () => `${t('seo.qimenPaipanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.qimenPaipanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/qimen-paipan',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('qimenPaipan.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/qimen-paipan')}`,
        description: t('seo.qimenPaipanDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.qmp-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.qmp-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.qmp-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.qmp-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.qmp-title {
  font-size: 30px;
  line-height: 1.2;
}

.qmp-subtitle {
  max-width: 720px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 14px;
}

.qmp-back {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 12px;
}

.qmp-form-wrap {
  display: grid;
  gap: 18px;
}

.qmp-card {
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.qmp-card-title {
  margin-bottom: 18px;
  font-size: 18px;
}

.qmp-form {
  display: grid;
  gap: 18px;
}

.qmp-form label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 14px;
}

.qmp-field-hint {
  margin: 7px 0 0;
  color: var(--text-faint);
  font-size: 12px;
}

.qmp-hints {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.qmp-hint {
  display: flex;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 13px;
}

.qmp-hint :deep(.iconify) {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

.qmp-loading {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.qmp-loading-dot {
  width: 12px;
  height: 12px;
  border: 2px solid var(--accent-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: qmp-spin 900ms linear infinite;
}

.qmp-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

@keyframes qmp-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .qmp-container {
    padding-top: 28px;
  }

  .qmp-title {
    font-size: 25px;
  }

  .qmp-hints {
    grid-template-columns: 1fr;
  }

  .qmp-actions {
    flex-wrap: wrap;
  }
}
</style>
