<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12" :class="{ 'bw-result-wrap': phase === 'result' }">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bazi Wealth</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('baziWealth.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziWealth.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('baziWealth.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 档案快选区 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('baziWealth.selectProfile') }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="profile in profiles"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="selectedProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="selectProfile(profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>
            </div>
            <div v-else class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
              <p class="text-sm text-[var(--text-faint)]">
                {{ $t('baziWealth.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('baziWealth.goSettings') }}</NuxtLink>{{ $t('baziWealth.createSuffix') }}
              </p>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziWealth.genderLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'male'"
                >
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 出生日期 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('baziWealth.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('baziWealth.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar
                    v-model="calendarDate"
                    color="warning"
                    class="p-2"
                  />
                </template>
              </UPopover>
            </div>

            <!-- 出生时辰 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziWealth.birthHourLabel') }}
              </label>
              <USelectMenu
                v-model="form.birthHour"
                :items="shichenOptions"
                value-key="dizhi"
                :placeholder="$t('baziWealth.birthHourPlaceholder')"
                class="w-full"
                :ui="selectUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('baziWealth.birthHourHint') }}
              </p>
            </div>

            <!-- 姓名 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziWealth.nameLabel') }}
              </label>
              <UInput
                v-model="form.name"
                :placeholder="$t('baziWealth.namePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 出生地 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziWealth.birthProvinceLabel') }}
              </label>
              <UInput
                v-model="form.birthProvince"
                :placeholder="$t('baziWealth.birthProvincePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('baziWealth.birthProvinceHint') }}
              </p>
            </div>

            <!-- 计算按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('baziWealth.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 八字财富知识卡片 -->
        <div class="mt-6 space-y-3">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
            <span class="text-xs font-medium text-[var(--text-muted)]">{{ $t('baziWealth.knowledgeTitle') }}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-currency-yen" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziWealth.knowledgeCard1Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziWealth.knowledgeCard1Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-scale" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziWealth.knowledgeCard2Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziWealth.knowledgeCard2Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-chart-bar" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziWealth.knowledgeCard3Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziWealth.knowledgeCard3Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-arrows-right-left" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziWealth.knowledgeCard4Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziWealth.knowledgeCard4Desc') }}</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calculator" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('baziWealth.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果（纸质报告） ============ -->
      <div v-if="phase === 'result' && chart">
        <!-- 隐藏截图目标：完整纸质报告 -->
        <div ref="shareTargetRef" v-show="false" class="bwr-share-target">
          <BaziWealthReport
            :chart="chart"
            :ai-content="aiContent"
            :streaming="false"
            :error="null"
            :birth-date="form.birthDate"
            :birth-hour="form.birthHour"
            :gender="form.gender"
            :name="form.name"
          />
        </div>

        <BaziWealthReport
          :chart="chart"
          :ai-content="aiContent"
          :streaming="aiStreaming"
          :error="aiError"
          :birth-date="form.birthDate"
          :birth-hour="form.birthHour"
          :gender="form.gender"
          :name="form.name"
          @retry="startAiStream"
        />

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleCopy"
          >
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('baziWealth.copyResult') }}
          </UButton>
          <AppShareButton
            tool="bazi-wealth"
            :name="form.name"
            :summary="`日主${chart.riZhu}（${chart.riZhuStrength}）· 喜用${chart.xiyong} · 格局${chart.geju}`"
            :share-target="shareTargetRef"
            :filename="`bazi-wealth-${form.name || 'wealth'}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('baziWealth.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
             @click="() => { navigateTo('/tools') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('baziWealth.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { SHICHEN_OPTIONS } from '~/types/user'
import type { UserProfile, DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  name: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  birthHour: undefined as DiZhi | undefined,
  birthProvince: '',
})
const chart = ref<BaziChart | null>(null)

// 档案选择
const { profiles, defaultProfile } = useProfiles()
const localePath = useLocalePath()
const selectedProfileId = ref<string | null>(null)

// 日历 picker
const tz = getLocalTimeZone()
const df = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' }))
const calendarDate = ref<CalendarDate | undefined>(undefined)

watch(calendarDate, () => {
  if (calendarDate.value) {
    form.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  } else {
    form.birthDate = ''
  }
})

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.name = profile.name || profile.label || ''
  form.gender = profile.gender
  form.birthDate = profile.birthDate || ''
  form.birthHour = profile.birthHour
  form.birthProvince = profile.birthProvince || ''
  if (form.birthDate) {
    try {
      calendarDate.value = parseDate(form.birthDate)
    } catch {
      calendarDate.value = undefined
    }
  } else {
    calendarDate.value = undefined
  }
}

onMounted(() => {
  if (defaultProfile.value && !form.birthDate) {
    selectProfile(defaultProfile.value)
  }
})

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const shareTargetRef = ref<HTMLElement>()

const toast = useToast()
const { calc } = useBaziCalc()

const canSubmit = computed(() => {
  return form.birthDate.length > 0
})

const shichenOptions = [...SHICHEN_OPTIONS]

async function handleSubmit() {
  if (!canSubmit.value) return

  const [year, month, day] = form.birthDate.split('-').map(Number) as [number, number, number]
  const calculatedChart = calc(year, month, day, form.birthHour ?? null, form.gender)

  phase.value = 'animating'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  // 最少播放 1 秒动画
  setTimeout(() => {
    chart.value = calculatedChart
    phase.value = 'result'
    startAiStream()
  }, 1000)
}

async function startAiStream() {
  if (!chart.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/bazi-wealth/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chart: chart.value,
        locale: locale.value,
        name: form.name,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

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
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) {
            if (!aiStarted.value) aiStarted.value = true
            aiContent.value += data.text
          } else if (data.type === 'error') {
            aiError.value = data.message || t('baziWealth.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('baziWealth.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  chart.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  selectedProfileId.value = null
  calendarDate.value = undefined
  form.name = ''
  form.birthProvince = ''
}

function handleCopy() {
  if (!chart.value) return
  const text = `${form.name ? form.name + ' · ' : ''}${$t('baziWealth.resultTitle')}

${$t('baziPan.yearPillar')}：${chart.value.year.gan}${chart.value.year.zhi}
${$t('baziPan.monthPillar')}：${chart.value.month.gan}${chart.value.month.zhi}
${$t('baziPan.dayPillar')}：${chart.value.day.gan}${chart.value.day.zhi}
${$t('baziPan.hourPillar')}：${chart.value.hour ? chart.value.hour.gan + chart.value.hour.zhi : '?'}

${$t('bazi.chartSubtitle', { riZhu: chart.value.riZhu, strength: chart.value.riZhuStrength, geju: chart.value.geju })}
${$t('baziWealth.xiyongLabel')}：${chart.value.xiyong} · ${$t('baziWealth.jishenLabel')}：${chart.value.jishen}

${aiContent.value ? '【' + $t('baziWealth.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  trigger: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.baziWealthTitle')} - ${siteName}`,
  description: t('seo.baziWealthDesc'),
  keywords: t('seo.baziWealthKeywords'),
  ogTitle: () => `${t('seo.baziWealthOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziWealthOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/bazi-wealth',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.baziWealthTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/bazi-wealth',
        description: t('seo.baziWealthDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('baziWealth.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/bazi-wealth',
          description: t('seo.baziWealthOgDesc'),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.bwr-share-target {
  width: 1080px;
}

/* 结果阶段：纸质报告需要更宽的版面 */
.bw-result-wrap {
  max-width: 80rem;
}
</style>
