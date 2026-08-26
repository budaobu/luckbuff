<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 表单阶段 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Car Pickup Date Selection</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('ticheZeri.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('ticheZeri.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('ticheZeri.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 提车日期窗口 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                {{ $t('ticheZeri.windowLabel') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !form.startDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ form.startDate && startCalendarDate ? df.format(startCalendarDate.toDate(tz)) : $t('ticheZeri.startPlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="startCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !form.endDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ form.endDate && endCalendarDate ? df.format(endCalendarDate.toDate(tz)) : $t('ticheZeri.endPlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="endCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
              </div>
              <p class="text-[11px] text-[var(--text-faint)]">{{ $t('ticheZeri.windowHint') }}</p>
            </div>

            <!-- 车主生辰 -->
            <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent)]" />
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ticheZeri.ownerSection') }}</h3>
                <span class="text-[var(--accent)]">*</span>
              </div>

              <!-- 档案选择（与黄道吉日页同款） -->
              <div v-if="store.list.length > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="profile in store.list"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="ownerProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-body)]'"
                  @click="selectProfile(profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>

              <div class="space-y-1.5">
                <label class="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  {{ $t('ticheZeri.birthDateLabel') }}
                  <span class="text-[var(--accent)]">*</span>
                </label>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                    :class="{ 'text-[var(--text-placeholder)]': !owner.birthDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ owner.birthDate && ownerCalendarDate ? df.format(ownerCalendarDate.toDate(tz)) : $t('ticheZeri.birthDatePlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="ownerCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs text-[var(--text-muted)]">{{ $t('ticheZeri.birthHourLabel') }}</label>
                <div class="relative">
                  <select
                    v-model="owner.birthHour"
                    class="w-full appearance-none px-3 py-2.5 pr-9 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-border-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-border-hover)] cursor-pointer"
                  >
                    <option value="">{{ $t('ticheZeri.birthHourPlaceholder') }}</option>
                    <option v-for="opt in hourOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <UIcon name="i-heroicons-chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] pointer-events-none" />
                </div>
              </div>
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('ticheZeri.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="i in 4" :key="i" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon :name="knowledgeIcons[i - 1]" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t(`ticheZeri.knowledgeCard${i}Title`) }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t(`ticheZeri.knowledgeCard${i}Desc`) }}</p>
          </div>
        </div>
      </div>

      <!-- 动画阶段 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calendar-days" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('ticheZeri.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段：择日海报（AI 解读流式融入，兼任分享截图目标） -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="posterRef" class="tzp-share-target">
          <TicheZeriPoster
            :start-date="calcResult.window.startDate"
            :end-date="calcResult.window.endDate"
            :owner="{
              shengXiao: calcResult.owner.shengXiao,
              dayMasterWuxing: calcResult.owner.dayMasterWuxing,
              xiyong: calcResult.owner.xiyong,
            }"
            :best="calcResult.best"
            :top-list="calcResult.ranked.slice(0, 8)"
            :total-count="calcResult.ranked.length"
            :ai-content="aiContent"
          />
        </div>

        <!-- 解读状态条 -->
        <div class="tz-ai-bar">
            <div v-if="aiStreaming" class="flex items-center justify-center gap-2 py-1">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('ticheZeri.interpreting') }}</span>
            </div>
            <div v-else-if="aiError" class="flex items-center justify-center gap-2 py-1">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-xs text-red-400">{{ aiError }}</p>
            </div>
            <div v-else-if="aiContent" class="flex items-center justify-center gap-4 py-1">
              <p class="text-[11px] text-[var(--text-faint)]">{{ $t('ticheZeri.disclaimer') }}</p>
              <UButton
                color="warning"
                variant="soft"
                size="xs"
                class="group/btn shrink-0"
                @click="startAiStream"
              >
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
                </template>
                {{ $t('ticheZeri.reinterpret') }}
              </UButton>
            </div>
          </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-8 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('ticheZeri.recalculate') }}
          </UButton>
          <AppShareButton
            tool="tiche-zeri"
            :disabled="aiStreaming || !aiContent"
            :summary="`${calcResult.best.date} ${calcResult.best.dayGanZhi}日 · ${calcResult.best.jianChu}日 · ${$t('ticheZeri.scoreLabel')}${calcResult.best.dayScore}`"
            :share-target="posterRef || undefined"
            :filename="`tiche-zeri-${calcResult.best.date}.png`"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/auspicious-datetime') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('ticheZeri.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DiZhi } from '~/types/user'
import { useProfilesStore } from '~/stores/profiles'

interface ScoredDay {
  date: string
  lunarDate: string
  dayGanZhi: string
  shengXiao: string
  tianShen: string
  tianShenLuck: string
  jianChu: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  chongDesc: string
  week: string
  dayScore: number
  tags: string[]
}

interface RankedDay extends ScoredDay {
  rank: number
}

interface OwnerResult {
  birthDate: string
  birthHour: DiZhi | null
  pillars: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  shengXiao: string
  dayMaster: string
  dayMasterWuxing: string
  xiyong: string
  jishen: string
}

interface CalcResult {
  window: { startDate: string; endDate: string }
  owner: OwnerResult
  days: ScoredDay[]
  ranked: RankedDay[]
  best: RankedDay
  locale: string
}

const { t, locale } = useI18n()
const store = useProfilesStore()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const calcResult = ref<CalcResult | null>(null)
const posterRef = ref<HTMLDivElement | null>(null)

const tz = getLocalTimeZone()
const df = new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), {
  dateStyle: 'medium',
})

/* ---------- 表单状态 ---------- */

const form = reactive({ startDate: '', endDate: '' })
const owner = reactive({ birthDate: '', birthHour: undefined as DiZhi | undefined })

const startCalendarDate = ref<CalendarDate | undefined>(undefined)
const endCalendarDate = ref<CalendarDate | undefined>(undefined)
const ownerCalendarDate = ref<CalendarDate | undefined>(undefined)

const ownerProfileId = ref('')

function toDateStr(v: { year: number; month: number; day: number }): string {
  return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`
}

watch(startCalendarDate, () => { if (startCalendarDate.value) form.startDate = toDateStr(startCalendarDate.value) })
watch(endCalendarDate, () => { if (endCalendarDate.value) form.endDate = toDateStr(endCalendarDate.value) })
watch(ownerCalendarDate, () => { if (ownerCalendarDate.value) owner.birthDate = toDateStr(ownerCalendarDate.value) })

function selectProfile(profile: typeof store.list[0]) {
  ownerProfileId.value = profile.id
  owner.birthDate = profile.birthDate || ''
  owner.birthHour = profile.birthHour
  try {
    ownerCalendarDate.value = owner.birthDate ? parseDate(owner.birthDate) : undefined
  }
  catch {
    ownerCalendarDate.value = undefined
  }
}

const hourOptions = computed(() => {
  const ranges: Record<DiZhi, string> = {
    子: '23:00~01:00', 丑: '01:00~03:00', 寅: '03:00~05:00', 卯: '05:00~07:00',
    辰: '07:00~09:00', 巳: '09:00~11:00', 午: '11:00~13:00', 未: '13:00~15:00',
    申: '15:00~17:00', 酉: '17:00~19:00', 戌: '19:00~21:00', 亥: '21:00~23:00',
  }
  const names = t('ticheZeri.hourNames').split(',')
  return (Object.keys(ranges) as DiZhi[]).map((dizhi, idx) => ({
    label: `${names[idx]}（${ranges[dizhi]}）`,
    value: dizhi,
  }))
})

const knowledgeIcons = [
  'i-heroicons-question-mark-circle',
  'i-heroicons-scale',
  'i-heroicons-clock',
  'i-heroicons-light-bulb',
]

onMounted(() => {
  const today = new Date()
  const oneMonth = new Date(today)
  oneMonth.setMonth(oneMonth.getMonth() + 1)
  form.startDate = toDateStr({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() })
  form.endDate = toDateStr({ year: oneMonth.getFullYear(), month: oneMonth.getMonth() + 1, day: oneMonth.getDate() })
  try {
    startCalendarDate.value = parseDate(form.startDate)
    endCalendarDate.value = parseDate(form.endDate)
  }
  catch { /* ignore */ }
})

/* ---------- 提交计算 ---------- */

async function handleSubmit() {
  if (!form.startDate || !form.endDate) {
    toast.add({ title: t('ticheZeri.checkInput'), description: t('ticheZeri.windowLabel'), color: 'error' })
    return
  }
  if (!owner.birthDate) {
    toast.add({ title: t('ticheZeri.checkInput'), description: t('ticheZeri.ownerSection'), color: 'error' })
    return
  }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/tiche-zeri/calc', {
      method: 'POST',
      body: {
        startDate: form.startDate,
        endDate: form.endDate,
        owner: { birthDate: owner.birthDate, birthHour: owner.birthHour || null },
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('ticheZeri.calcFail'),
      description: err.data?.statusMessage || err.message || t('ticheZeri.checkInput'),
      color: 'error',
    })
  }
}

/* ---------- AI 流式解读 ---------- */

const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/tiche-zeri/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: calcResult.value,
        locale: locale.value,
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
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('ticheZeri.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('ticheZeri.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
}

/* ---------- SEO ---------- */

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.ticheZeriTitle')} - ${siteName}`,
  description: t('seo.ticheZeriDesc'),
  keywords: t('seo.ticheZeriKeywords'),
  ogTitle: () => `${t('seo.ticheZeriOgTitle')} - ${siteName}`,
  ogDescription: t('seo.ticheZeriOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/tiche-zeri',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.ticheZeriTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/tiche-zeri',
        description: t('seo.ticheZeriDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('ticheZeri.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/tiche-zeri',
          description: t('seo.ticheZeriOgDesc'),
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
/* 海报容器：结果页唯一展示组件，兼任分享截图目标 */
.tzp-share-target {
  width: 100%;
}

/* 解读状态条 */
.tz-ai-bar {
  margin-top: 10px;
  padding: 0 4px;
}
</style>
