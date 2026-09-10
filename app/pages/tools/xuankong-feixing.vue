<template>
  <div class="xfp-page">
    <div class="xfp-container">
      <header class="xfp-header">
        <div>
          <p class="xfp-eyebrow">Xuan Kong Flying Star</p>
          <h1 class="xfp-title">{{ $t('xuankongFeixing.title') }}</h1>
          <p class="xfp-subtitle">{{ $t('xuankongFeixing.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="xfp-back">
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <section v-if="phase === 'form'" class="xfp-form-wrap">
        <form class="xfp-card xfp-form" @submit.prevent="handleSubmit">
          <h2 class="xfp-card-title">{{ $t('xuankongFeixing.formTitle') }}</h2>

          <div>
            <label for="xuankong-feixing-direction">{{ $t('xuankongFeixing.directionLabel') }} <span class="xfp-required">*</span></label>
            <UInput
              id="xuankong-feixing-direction"
              v-model="form.direction"
              type="number"
              min="0"
              max="359.9"
              step="0.1"
              inputmode="decimal"
              :placeholder="$t('xuankongFeixing.directionPlaceholder')"
              color="warning"
              class="w-full"
            />
            <p class="xfp-field-hint">{{ $t('xuankongFeixing.directionHint') }}</p>
          </div>

          <div class="xfp-date-grid">
            <div>
              <label for="xuankong-feixing-completion">{{ $t('xuankongFeixing.completionLabel') }} <span class="xfp-required">*</span></label>
              <UInput
                id="xuankong-feixing-completion"
                v-model="form.completionDate"
                type="date"
                color="warning"
                class="w-full"
              />
              <p class="xfp-field-hint">{{ $t('xuankongFeixing.completionHint') }}</p>
            </div>
            <div>
              <label for="xuankong-feixing-inspection">{{ $t('xuankongFeixing.inspectionLabel') }}</label>
              <UInput
                id="xuankong-feixing-inspection"
                v-model="form.inspectionDate"
                type="date"
                color="warning"
                class="w-full"
              />
              <p class="xfp-field-hint">{{ $t('xuankongFeixing.inspectionHint') }}</p>
            </div>
          </div>

          <div>
            <span class="xfp-label">{{ $t('xuankongFeixing.usageLabel') }}</span>
            <div class="xfp-segments">
              <button
                v-for="option in usageOptions"
                :key="option.value"
                type="button"
                :class="{ 'is-active': form.usage === option.value }"
                @click="form.usage = option.value"
              >
                {{ $t(option.labelKey) }}
              </button>
            </div>
          </div>

          <UButton type="submit" color="warning" size="lg" block>
            <template #leading>
              <UIcon name="i-heroicons-table-cells" class="h-4 w-4" />
            </template>
            {{ $t('xuankongFeixing.submit') }}
          </UButton>
        </form>

        <div class="xfp-hints">
          <article class="xfp-hint">
            <UIcon name="i-heroicons-viewfinder-circle" class="h-4 w-4" />
            <p>{{ $t('xuankongFeixing.compassHint') }}</p>
          </article>
          <article class="xfp-hint">
            <UIcon name="i-heroicons-calendar-days" class="h-4 w-4" />
            <p>{{ $t('xuankongFeixing.periodHint') }}</p>
          </article>
          <article class="xfp-hint">
            <UIcon name="i-heroicons-squares-2x2" class="h-4 w-4" />
            <p>{{ $t('xuankongFeixing.chartHint') }}</p>
          </article>
          <article class="xfp-hint">
            <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
            <p>{{ $t('xuankongFeixing.privacyHint') }}</p>
          </article>
        </div>
      </section>

      <section v-else-if="phase === 'loading'" class="xfp-loading">
        <span class="xfp-loading-dot" />
        <p>{{ $t('xuankongFeixing.calculating') }}</p>
      </section>

      <div v-else-if="result" class="xfp-report">
        <XuankongFeixingReport :result="result" />
      </div>

      <div v-if="phase === 'result'" class="xfp-actions">
        <UButton color="warning" variant="soft" @click="resetToForm">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('xuankongFeixing.recalculate') }}
        </UButton>
        <AppShareButton
          tool="xuankong-feixing"
          :summary="shareSummary"
          filename="xuankong-feixing-poster.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XuankongResult, XuankongUsage } from '~~/app/types/xuankong-feixing'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

type UsageOption = XuankongUsage | 'general'
const usageOptions = [
  { value: 'general', labelKey: 'xuankongFeixing.usageGeneral' },
  { value: 'residential', labelKey: 'xuankongFeixing.usageResidential' },
  { value: 'office', labelKey: 'xuankongFeixing.usageOffice' },
  { value: 'shop', labelKey: 'xuankongFeixing.usageShop' },
] as const satisfies ReadonlyArray<{ value: UsageOption, labelKey: string }>

const phase = ref<'form' | 'loading' | 'result'>('form')
const result = ref<XuankongResult | null>(null)
const form = ref({
  direction: '',
  completionDate: '',
  inspectionDate: '',
  usage: 'general' as UsageOption,
})

const shareSummary = computed(() => {
  if (!result.value) return undefined
  return `${result.value.orientation.label} · ${result.value.summary.method} · ${result.value.summary.formation.name}`
})

onMounted(() => {
  if (!form.value.inspectionDate) {
    form.value.inspectionDate = new Date().toISOString().slice(0, 10)
  }
})

async function handleSubmit() {
  const direction = Number(form.value.direction)
  if (!form.value.direction || Number.isNaN(direction) || direction < 0 || direction >= 360) {
    toast.add({ title: t('xuankongFeixing.directionError'), color: 'error' })
    return
  }
  if (!form.value.completionDate) {
    toast.add({ title: t('xuankongFeixing.completionError'), color: 'error' })
    return
  }

  phase.value = 'loading'
  try {
    result.value = await $fetch<XuankongResult>('/api/tools/xuankong-feixing/calc', {
      method: 'POST',
      body: {
        direction,
        completionDate: form.value.completionDate,
        inspectionDate: form.value.inspectionDate || undefined,
        usage: form.value.usage === 'general' ? undefined : form.value.usage,
        locale: locale.value,
      },
    })
    phase.value = 'result'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (error: any) {
    phase.value = 'form'
    toast.add({
      title: t('xuankongFeixing.fail'),
      description: error?.data?.statusMessage || error?.message || t('xuankongFeixing.pleaseRetry'),
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
  title: () => `${t('seo.xuankongFeixingTitle')} - ${siteName}`,
  description: t('seo.xuankongFeixingDesc'),
  keywords: t('seo.xuankongFeixingKeywords'),
  ogTitle: () => `${t('seo.xuankongFeixingOgTitle')} - ${siteName}`,
  ogDescription: t('seo.xuankongFeixingOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/xuankong-feixing',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('xuankongFeixing.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: `https://www.ososn.com${localePath('/tools/xuankong-feixing')}`,
        description: t('seo.xuankongFeixingDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
.xfp-page {
  min-height: 100vh;
  background: var(--surface-bg);
  color: var(--text-primary);
}

.xfp-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
}

.xfp-header {
  display: grid;
  gap: 18px;
  margin-bottom: 30px;
  text-align: center;
}

.xfp-eyebrow {
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.xfp-title {
  font-size: 30px;
  line-height: 1.2;
}

.xfp-subtitle {
  max-width: 760px;
  margin: 10px auto 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.xfp-back {
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

.xfp-form-wrap {
  display: grid;
  gap: 18px;
}

.xfp-card {
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-card);
}

.xfp-card-title {
  margin-bottom: 18px;
  font-size: 18px;
}

.xfp-form {
  display: grid;
  gap: 18px;
}

.xfp-form label,
.xfp-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 14px;
}

.xfp-required {
  color: var(--accent);
}

.xfp-field-hint {
  margin: 7px 0 0;
  color: var(--text-faint);
  font-size: 12px;
}

.xfp-date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.xfp-segments {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.xfp-segments button {
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 13px;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}

.xfp-segments button.is-active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.xfp-hints {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.xfp-hint {
  display: flex;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface-card) 82%, transparent);
}

.xfp-hint p {
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.xfp-loading {
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 70px 0;
}

.xfp-loading-dot {
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: xfp-spin 0.9s linear infinite;
}

@keyframes xfp-spin {
  to { transform: rotate(360deg); }
}

.xfp-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
  flex-wrap: wrap;
}

@media (max-width: 700px) {
  .xfp-container {
    padding: 30px 16px 56px;
  }

  .xfp-title {
    font-size: 27px;
  }

  .xfp-date-grid,
  .xfp-hints {
    grid-template-columns: 1fr;
  }

  .xfp-segments {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .xfp-loading-dot {
    animation: none;
  }

  .xfp-segments button {
    transition: none;
  }
}
</style>
