<template>
  <div class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute inset-0 bg-[radial-gradient(52rem_28rem_at_10%_0%,color-mix(in_srgb,var(--accent)_7%,transparent),transparent_62%)]" />
      <div class="absolute inset-y-0 left-[max(0px,calc(50%-32rem))] hidden w-px bg-[var(--border-light)] lg:block" />
    </div>

    <div class="relative z-10 mx-auto w-full max-w-5xl px-6 pt-28 pb-16 md:pt-32">
      <header class="max-w-2xl">
        <p class="mb-3 text-xs tracking-[0.22em] uppercase" style="color: var(--accent-muted);">
          {{ $t('zecheng.badge') }}
        </p>
        <h1 class="font-serif text-3xl font-bold tracking-tight md:text-4xl" style="color: var(--text-primary);">
          {{ $t('zecheng.title') }}
        </h1>
        <p class="mt-3 text-sm leading-relaxed" style="color: var(--text-faint);">
          {{ $t('zecheng.subtitle') }}
        </p>
        <div class="mt-5 h-px w-14 bg-[var(--accent-border-hover)]" />
      </header>

      <div class="mt-8 inline-flex rounded-xl border p-1" style="border-color: var(--border-light); background: var(--surface-input);">
        <button
          v-for="item in [['compare', $t('zecheng.tabCompare')], ['rank', $t('zecheng.tabRank')]]"
          :key="item[0]"
          type="button"
          class="rounded-lg px-4 py-2 text-sm transition-colors"
          :class="mode === item[0] ? 'font-medium' : 'hover:text-[var(--text-primary)]'"
          :style="mode === item[0]
            ? { color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' }
            : { color: 'var(--text-faint)' }"
          @click="setMode(item[0] as ZechengMode)"
        >
          {{ item[1] }}
        </button>
      </div>

      <section class="mt-5 rounded-2xl border p-5 md:p-6" style="border-color: var(--border-light); background: var(--surface-dropdown);">
        <p class="text-sm leading-relaxed" style="color: var(--text-muted);">
          {{ mode === 'compare' ? $t('zecheng.compareIntro') : $t('zecheng.rankIntro') }}
        </p>

        <div class="mt-5 grid gap-4 sm:grid-cols-3">
          <label>
            <span class="mb-1.5 block text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.form.birthYear') }}</span>
            <select v-model="form.year" class="zecheng-select">
              <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
            </select>
          </label>
          <label>
            <span class="mb-1.5 block text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.form.birthMonth') }}</span>
            <select v-model="form.month" class="zecheng-select">
              <option v-for="month in 12" :key="month" :value="month">{{ month }}</option>
            </select>
          </label>
          <label>
            <span class="mb-1.5 block text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.form.birthDay') }}</span>
            <select v-model="form.day" class="zecheng-select">
              <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
            </select>
          </label>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span class="mb-1.5 block text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.form.hour') }}</span>
            <select v-model.number="form.hour" class="zecheng-select">
              <option :value="-1">{{ $t('zecheng.form.hourUnknown') }}</option>
              <option v-for="(branch, index) in hourBranches" :key="branch" :value="index">
                {{ $t(`zecheng.hours.${branch}`) }}
              </option>
            </select>
          </label>
          <div>
            <span class="mb-1.5 block text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.form.gender') }}</span>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="gender in ['male', 'female']" :key="gender" type="button"
                class="rounded-lg border px-4 py-3 text-sm transition-colors"
                :class="form.gender === gender ? 'font-medium' : 'hover:border-[var(--border-medium)]'"
                :style="form.gender === gender
                  ? { color: 'var(--accent)', borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-bg)' }
                  : { color: 'var(--text-faint)', borderColor: 'var(--border-light)' }"
                @click="form.gender = gender as 'male' | 'female'"
              >
                {{ $t(`zecheng.form.${gender}`) }}
              </button>
            </div>
          </div>
        </div>

        <label class="mt-4 block">
          <span class="mb-1.5 block text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.form.origin') }}</span>
          <select v-model="form.originName" class="zecheng-select">
            <option v-for="city in origins" :key="city.name" :value="city.name">
              {{ city.name }} · {{ city.province }}
            </option>
          </select>
        </label>

        <div v-if="mode === 'compare'" class="mt-4">
          <label class="block">
            <span class="mb-1.5 block text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.form.target') }}</span>
            <input
              v-model="form.targetCity"
              type="text"
              maxlength="24"
              :placeholder="$t('zecheng.form.targetPlaceholder')"
              class="zecheng-input"
            >
          </label>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="city in quickTargets" :key="city" type="button"
              class="rounded-full border px-3 py-1.5 text-xs transition-colors"
              :class="form.targetCity === city ? 'font-medium' : 'hover:border-[var(--border-medium)]'"
              :style="form.targetCity === city
                ? { color: 'var(--accent)', borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-bg)' }
                : { color: 'var(--text-faint)', borderColor: 'var(--border-light)' }"
              @click="form.targetCity = city"
            >
              {{ city }}
            </button>
          </div>
        </div>

        <UButton
          class="mt-6 w-full justify-center"
          color="warning"
          size="lg"
          :loading="loading"
          @click="submit"
        >
          <template #leading>
            <UIcon :name="mode === 'compare' ? 'i-heroicons-building-library' : 'i-heroicons-chart-bar'" class="h-4 w-4" />
          </template>
          {{ mode === 'compare' ? $t('zecheng.form.submit') : $t('zecheng.form.submitRank') }}
        </UButton>

        <p v-if="error" class="mt-4 rounded-xl border px-4 py-3 text-sm" style="color: var(--color-red-500); border-color: color-mix(in srgb, var(--color-red-500) 30%, transparent);">
          {{ error }}
        </p>
      </section>

      <section v-if="result?.mode === 'compare'" class="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article class="rounded-2xl border p-5 md:p-6" style="border-color: var(--border-light); background: var(--surface-dropdown);">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="font-serif text-2xl" style="color: var(--text-primary);">{{ result.city.name }}</h2>
              <p class="mt-1 text-sm" style="color: var(--text-faint);">
                {{ result.city.province }} · {{ result.city.fenye.xiu.length ? `${result.city.fenye.xiu.join('')}之分` : $t('zecheng.result.noFenye') }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-semibold" style="color: var(--accent);">{{ result.verdict.score }}</p>
              <p class="text-xs" style="color: var(--text-faint);">
                {{ result.verdict.grade }} · {{ result.verdict.gradeWord }}
              </p>
            </div>
          </div>

          <dl class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border p-3" style="border-color: var(--border-light); background: var(--surface-card);">
              <dt class="text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.result.bearing') }}</dt>
              <dd class="mt-1 text-sm" style="color: var(--text-primary);">
                {{ result.sameCity ? $t('zecheng.result.sameCity') : `${result.bearingDeg}° · ${result.fang}` }} · {{ result.distanceKm }} km
              </dd>
            </div>
            <div class="rounded-xl border p-3" style="border-color: var(--border-light); background: var(--surface-card);">
              <dt class="text-xs" style="color: var(--text-placeholder);">{{ $t('zecheng.result.rank') }}</dt>
              <dd class="mt-1 text-sm" style="color: var(--text-primary);">
                {{ result.rank ? `#${result.rank.position} / ${result.rank.poolSize}` : '—' }}
              </dd>
            </div>
          </dl>

          <div class="mt-6 space-y-4">
            <article
              v-for="track in result.tracks" :key="track.key"
              class="rounded-xl border p-4" style="border-color: var(--border-light); background: var(--surface-card);"
            >
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-sm font-medium" style="color: var(--text-primary);">{{ $t(`zecheng.tracks.${track.key}`) }}</h3>
                <span class="text-xs" style="color: var(--text-placeholder);">
                  {{ track.suspended ? $t('zecheng.result.suspended') : trackTendency(track) }} · {{ track.weight }}
                </span>
              </div>
              <div class="mt-3 h-1.5 rounded-full" style="background: var(--surface-input);">
                <div
                  class="h-full rounded-full transition-all"
                  :style="{
                    width: `${trackPercent(track)}%`,
                    backgroundColor: track.suspended ? 'var(--border-light)' : 'var(--accent)',
                  }"
                />
              </div>
              <p class="mt-3 text-xs leading-relaxed" style="color: var(--text-muted);">{{ track.basis }}</p>
            </article>
          </div>
        </article>

        <aside class="space-y-5">
          <div class="rounded-2xl border p-5" style="border-color: var(--border-light); background: var(--surface-dropdown);">
            <h2 class="text-sm font-semibold" style="color: var(--text-primary);">{{ $t('zecheng.result.chart') }}</h2>
            <p class="mt-3 font-serif text-lg" style="color: var(--accent);">{{ result.person.pillarsText }}</p>
            <dl class="mt-4 space-y-2 text-xs leading-relaxed" style="color: var(--text-muted);">
              <div>
                <dt class="inline" style="color: var(--text-placeholder);">{{ $t('zecheng.result.favorable') }}: </dt>
                <dd class="inline">{{ result.person.favorable.join(' / ') }}</dd>
              </div>
              <div>
                <dt class="inline" style="color: var(--text-placeholder);">{{ $t('zecheng.result.unfavorable') }}: </dt>
                <dd class="inline">{{ result.person.unfavorable.join(' / ') }}</dd>
              </div>
              <div>{{ result.person.patternName }} · {{ result.person.strength }}</div>
              <div>{{ result.person.solarTimeStatusText }}</div>
            </dl>
          </div>

          <div class="rounded-2xl border p-5" style="border-color: var(--border-light); background: var(--surface-dropdown);">
            <h2 class="text-sm font-semibold" style="color: var(--text-primary);">{{ $t('zecheng.result.xiuTitle') }}</h2>
            <ul class="mt-3 space-y-2 text-xs leading-relaxed" style="color: var(--text-muted);">
              <li v-for="xiu in result.city.xiuDetail" :key="xiu.name">
                {{ xiu.name }} · {{ xiu.yao }}{{ xiu.beast }} · {{ xiu.wx }}
              </li>
              <li>{{ result.city.fenye.source }}</li>
            </ul>
          </div>
        </aside>
      </section>

      <section v-else-if="result?.mode === 'rank'" class="mt-6 rounded-2xl border p-5 md:p-6" style="border-color: var(--border-light); background: var(--surface-dropdown);">
        <h2 class="text-lg font-semibold" style="color: var(--text-primary);">{{ $t('zecheng.rank.title') }}</h2>
        <p class="mt-1 text-xs" style="color: var(--text-faint);">
          {{ $t('zecheng.rank.pool', { n: result.poolSize }) }} · {{ result.person.pillarsText }}
        </p>
        <ol class="mt-5 space-y-3">
          <li
            v-for="(city, index) in result.top" :key="city.name"
            class="rounded-xl border p-4 transition-colors hover:border-[var(--border-medium)]"
            style="border-color: var(--border-light); background: var(--surface-card);"
          >
            <button type="button" class="flex w-full items-center gap-4 text-left" @click="pickRankCity(city.name)">
              <span class="w-7 shrink-0 text-center font-serif text-lg" style="color: var(--accent);">{{ index + 1 }}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-medium" style="color: var(--text-primary);">{{ city.name }} · {{ city.province }}</span>
                <span class="mt-1 block text-xs" style="color: var(--text-placeholder);">{{ city.brief }}</span>
              </span>
              <span class="text-right">
                <span class="block text-lg font-semibold" style="color: var(--accent);">{{ city.score }}</span>
                <span class="text-xs" style="color: var(--text-faint);">{{ city.grade }} · {{ city.gradeWord }}</span>
              </span>
            </button>
          </li>
        </ol>
      </section>

      <p class="mt-8 text-xs leading-relaxed" style="color: var(--text-placeholder);">
        {{ $t('zecheng.disclaimer') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZechengResponse, ZechengTrack } from '~/types/zecheng'

type ZechengMode = 'compare' | 'rank'

interface CityOption {
  name: string
  fullName: string
  province: string
  lng: number
  lat: number
}

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const pageUrl = useLocalizedSeoUrl('/tools/zecheng')
const localizedSeoPath = useLocalizedSeoPath()
const homeUrl = localizedSeoPath('/')
const toolsUrl = localizedSeoPath('/tools')

const yearOptions = Array.from({ length: 100 }, (_, index) => new Date().getFullYear() + 1 - index)
const hourBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const quickTargets = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '纽约', '伦敦', '东京', '新加坡']

const mode = ref<ZechengMode>('compare')
const loading = ref(false)
const error = ref('')
const result = ref<ZechengResponse | null>(null)
const form = ref({
  year: 1995,
  month: 6,
  day: 15,
  hour: -1,
  gender: 'male' as 'male' | 'female',
  originName: '北京',
  targetCity: '',
})

const { data: optionData } = await useAsyncData('zecheng-options', () =>
  $fetch<{ origins: CityOption[], targets: CityOption[] }>('/api/tools/zecheng/options'),
)
const origins = computed(() => optionData.value?.origins ?? [])

function setMode(nextMode: ZechengMode) {
  mode.value = nextMode
  result.value = null
  error.value = ''
}

function trackPercent(track: ZechengTrack) {
  if (track.suspended) return 50
  return Math.round(((Math.max(-1, Math.min(1, track.tendency)) + 1) / 2) * 100)
}

function trackTendency(track: ZechengTrack) {
  return track.tendency > 0 ? `+${track.tendency}` : String(track.tendency)
}

function pickRankCity(name: string) {
  setMode('compare')
  form.value.targetCity = name
  void submit()
}

async function submit() {
  if (mode.value === 'compare' && !form.value.targetCity.trim()) {
    error.value = t('zecheng.validation.target')
    return
  }

  loading.value = true
  error.value = ''
  try {
    result.value = await $fetch<ZechengResponse>('/api/tools/zecheng/analyze', {
      method: 'POST',
      body: {
        birth: {
          year: form.value.year,
          month: form.value.month,
          day: form.value.day,
          hour: form.value.hour,
          gender: form.value.gender,
        },
        originName: form.value.originName,
        mode: mode.value,
        targetCity: form.value.targetCity,
      },
    })
    await nextTick()
    window.scrollTo({ top: 360, behavior: 'smooth' })
  }
  catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || t('zecheng.validation.failed')
  }
  finally {
    loading.value = false
  }
}

useSeoMeta({
  title: () => `${t('zecheng.seo.title')} - ${siteName}`,
  description: () => t('zecheng.seo.description'),
  keywords: () => t('zecheng.seo.keywords'),
  ogTitle: () => `${t('zecheng.seo.ogTitle')} - ${siteName}`,
  ogDescription: () => t('zecheng.seo.description'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t('zecheng.title'),
      url: pageUrl.value,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      description: t('zecheng.seo.description'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('home.title1'), item: homeUrl },
          { '@type': 'ListItem', position: 2, name: t('toolDirectories.analysisTitle'), item: toolsUrl },
          { '@type': 'ListItem', position: 3, name: t('zecheng.title'), item: pageUrl.value },
        ],
      },
    }),
  }],
}))
</script>

<style scoped>
.zecheng-select,
.zecheng-input {
  width: 100%;
  border: 1px solid var(--border-light);
  background: var(--surface-input);
  color: var(--text-primary);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  outline: none;
}

.zecheng-select:focus,
.zecheng-input:focus {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
}
</style>
