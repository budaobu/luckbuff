<template>
  <div class="relative z-10 mx-auto max-w-3xl px-5 py-12">
    <div v-if="phase === 'form'">
      <header class="mb-8">
        <span class="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--accent-muted)]">
          {{ $t('footballPrediction.badge') }}
        </span>
        <h1 class="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {{ $t('footballPrediction.liuyaoTitle') }}
        </h1>
        <p class="mt-2 text-sm text-[var(--text-faint)]">
          {{ $t('footballPrediction.liuyaoSubtitle') }}
        </p>
      </header>

      <form class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] p-5 sm:p-6" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm text-[var(--text-muted)]">{{ $t('footballPrediction.form.homeTeam') }}</span>
            <UInput v-model="form.homeTeam" :placeholder="$t('footballPrediction.form.teamPlaceholder')" class="w-full" />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm text-[var(--text-muted)]">{{ $t('footballPrediction.form.awayTeam') }}</span>
            <UInput v-model="form.awayTeam" :placeholder="$t('footballPrediction.form.teamPlaceholder')" class="w-full" />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm text-[var(--text-muted)]">{{ $t('footballPrediction.form.kickoff') }}</span>
            <FootballDateTimePicker
              v-model="form.kickoff"
              :placeholder="$t('footballPrediction.form.kickoffPlaceholder')"
              :title="$t('footballPrediction.form.kickoff')"
              required
            />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm text-[var(--text-muted)]">{{ $t('footballPrediction.form.competition') }}</span>
            <UInput v-model="form.competition" :placeholder="$t('footballPrediction.form.competitionPlaceholder')" class="w-full" />
          </label>
          <label class="block sm:col-span-2">
            <span class="mb-2 block text-sm text-[var(--text-muted)]">{{ $t('footballPrediction.form.venue') }}</span>
            <UInput v-model="form.venue" :placeholder="$t('footballPrediction.form.venuePlaceholder')" class="w-full" />
          </label>
        </div>

        <div class="mt-5">
          <FootballDateTimePicker
            v-model="form.castAt"
            :label="$t('footballPrediction.form.castAt')"
            :title="$t('footballPrediction.form.castAt')"
            :placeholder="$t('footballPrediction.form.castAtPlaceholder')"
            default-to-now
          />
        </div>

        <UButton
          type="submit"
          color="warning"
          size="lg"
          block
          class="mt-6"
          :disabled="!canSubmit"
          :loading="submitting"
        >
          <template #leading>
            <UIcon name="i-heroicons-sparkles" class="h-5 w-5" />
          </template>
          {{ $t('footballPrediction.form.liuyaoSubmit') }}
        </UButton>
      </form>
    </div>

    <div v-else-if="phase === 'loading'" class="flex min-h-[58vh] flex-col items-center justify-center">
      <ThinkingOrb state="working" :size="64" />
      <p class="mt-6 text-sm text-[var(--text-faint)]">{{ $t('footballPrediction.loading') }}</p>
    </div>

    <div v-else-if="result" class="space-y-6">
      <FootballPredictionPoster
        ref="posterRef"
        :result="result"
        :method-label="$t('footballPrediction.methods.liuyao')"
      />

      <div class="flex flex-wrap justify-center gap-3">
        <AppShareButton
          tool="liuyao"
          :name="`${result.match.homeTeam} vs ${result.match.awayTeam}`"
          :summary="`${result.liuyao?.primary || ''} · ${result.prediction.primaryScore.home}-${result.prediction.primaryScore.away}`"
          :share-target="posterTarget"
          :filename="`liuyao-football-${result.generatedAt.slice(0, 10)}.png`"
        />
        <UButton color="neutral" variant="soft" @click="reset">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          </template>
          {{ $t('footballPrediction.again') }}
        </UButton>
        <UButton color="neutral" variant="ghost" @click="navigateTo(localePath('/prophet'))">
          {{ $t('common.back') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FootballPredictionRequest, FootballPredictionResult } from '~/types/football-prediction'

const { t } = useI18n()
const localePath = useLocalePath()

const phase = ref<'form' | 'loading' | 'result'>('form')
const submitting = ref(false)
const result = ref<FootballPredictionResult | null>(null)
const posterRef = ref<{ rootRef?: HTMLElement } | null>(null)
const form = reactive({
  homeTeam: '',
  awayTeam: '',
  competition: '',
  venue: '',
  kickoff: '',
  castAt: '',
})

const canSubmit = computed(() => {
  return form.homeTeam.trim().length > 0
    && form.awayTeam.trim().length > 0
    && form.homeTeam.trim() !== form.awayTeam.trim()
    && !Number.isNaN(new Date(form.kickoff).getTime())
})

const posterTarget = computed(() => posterRef.value?.rootRef)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  phase.value = 'loading'
  submitting.value = true

  try {
    const payload: FootballPredictionRequest = {
      homeTeam: form.homeTeam.trim(),
      awayTeam: form.awayTeam.trim(),
      competition: form.competition.trim(),
      venue: form.venue.trim(),
      kickoff: new Date(form.kickoff).toISOString(),
      castAt: form.castAt || new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
    }
    result.value = await $fetch<FootballPredictionResult>('/api/prophet/liuyao-football', {
      method: 'POST',
      body: payload,
    })
    phase.value = 'result'
  } catch (error) {
    phase.value = 'form'
    useToast().add({
      title: t('footballPrediction.error'),
      description: error instanceof Error ? error.message : t('footballPrediction.error'),
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}

function reset() {
  result.value = null
  phase.value = 'form'
}

useSeoMeta({
  title: () => t('footballPrediction.liuyaoSeoTitle'),
  description: () => t('footballPrediction.liuyaoSeoDescription'),
  keywords: () => t('footballPrediction.liuyaoKeywords'),
  ogTitle: () => t('footballPrediction.liuyaoTitle'),
  ogDescription: () => t('footballPrediction.liuyaoSubtitle'),
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/prophet/liuyao-football',
  twitterCard: 'summary_large_image',
})
</script>
