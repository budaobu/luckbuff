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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Auspicious Hours</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jishi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jishi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('jishi.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 日期选择 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                {{ $t('jishi.dateLabel') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !selectedDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ selectedDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('jishi.datePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar v-model="calendarDate" color="warning" class="p-2" />
                </template>
              </UPopover>

              <!-- 快捷按钮 -->
              <div class="flex flex-wrap gap-2 mt-3">
                <button
                  v-for="btn in quickDateButtons"
                  :key="btn.key"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                  :class="selectedQuickKey === btn.key
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-body)]'"
                  @click="selectQuickDate(btn.offset, btn.key)"
                >
                  {{ btn.label }}
                </button>
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
              {{ $t('jishi.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jishi.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jishi.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sun" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jishi.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jishi.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jishi.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jishi.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jishi.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jishi.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 动画阶段 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('jishi.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('jishi.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('jishi.resultSubtitle', {
                date: calcResult.date,
                dayGanZhi: calcResult.dayGanZhi,
                jianChu: calcResult.jianChu,
              }) }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 日柱与建除 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jishi.dayPillar') }}</p>
                <p class="text-xl font-bold text-[var(--text-primary)]">{{ calcResult.dayGanZhi }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jishi.monthZhi') }}</p>
                <p class="text-xl font-bold text-[var(--text-primary)]">{{ calcResult.monthZhi }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jishi.jianChu') }}</p>
                <p class="text-xl font-bold text-[var(--text-primary)]">{{ calcResult.jianChu }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jishi.jieQi') }}</p>
                <p class="text-xl font-bold text-[var(--text-primary)]">
                  {{ calcResult.jieQi.name || $t('jishi.noJieQi') }}
                </p>
              </div>
            </div>
            <p v-if="calcResult.jieQi.name" class="text-xs text-[var(--text-muted)] mt-3">
              {{ calcResult.jieQi.isToday ? $t('jishi.jieQiToday', { name: calcResult.jieQi.name }) : $t('jishi.jieQiNear', { name: calcResult.jieQi.name }) }}
            </p>
          </div>

          <!-- 十二时辰黄黑道 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('jishi.shiChenTitle') }}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div
                v-for="item in calcResult.shiChen"
                :key="item.dizhi"
                class="rounded-xl border p-3 text-center"
                :class="item.type === '黄道'
                  ? 'border-green-500/20 bg-green-500/[0.06]'
                  : 'border-red-500/20 bg-red-500/[0.06]'"
              >
                <p class="text-lg font-bold" :class="item.type === '黄道' ? 'text-green-400' : 'text-red-400'">
                  {{ item.dizhi }}
                </p>
                <p class="text-[10px] text-[var(--text-faint)]">{{ item.timeRange }}</p>
                <p class="text-xs font-medium mt-1" :class="item.type === '黄道' ? 'text-green-400' : 'text-red-400'">
                  {{ item.tianShen }}
                </p>
                <p class="text-[10px]" :class="item.type === '黄道' ? 'text-green-400/70' : 'text-red-400/70'">
                  {{ item.type }}
                </p>
              </div>
            </div>
          </div>

          <!-- AI narrative -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('jishi.aiInterpretation') }}</h3>
              </div>
              <div v-if="aiStreaming" class="flex items-center gap-1.5">
                <span class="text-xs text-[var(--accent-muted)]">{{ $t('jishi.interpreting') }}</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
              </div>
            </div>

            <div
              v-if="aiContent"
              class="prose prose-sm max-w-none text-[var(--text-body)] leading-relaxed"
              v-html="renderedAiContent"
            />

            <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
                </div>
                <p class="text-xs text-[var(--text-muted)]">{{ $t('jishi.generatingInterpretation') }}</p>
              </div>
            </div>

            <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
                <p class="text-sm text-red-400">{{ aiError }}</p>
              </div>
            </div>

            <div v-if="!aiStreaming && aiContent" class="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] px-4 py-3">
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">
                {{ $t('jishi.disclaimer') }}
              </p>
            </div>

            <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
              <UButton
                color="warning"
                variant="soft"
                size="sm"
                class="group/btn"
                @click="startAiStream"
              >
                <template #leading>
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                </template>
                {{ $t('jishi.reinterpret') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('jishi.recalculate') }}
          </UButton>
          <AppShareButton
            tool="jishi"
            :summary="`${calcResult.dayGanZhi}日 · 建除${calcResult.jianChu} · 黄道${calcResult.shiChen.filter(s => s.type === '黄道').map(s => s.dizhi).join('、')}`"
            :share-target="resultRef || undefined"
            :filename="`jishi-${calcResult.date}.png`"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/fortune-telling') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('jishi.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import type { DiZhi } from '~/types/user'

interface ShiChenItem {
  dizhi: DiZhi
  timeRange: string
  tianShen: string
  type: '黄道' | '黑道'
}

interface CalcResult {
  date: string
  dayPillar: { gan: string; zhi: string }
  dayGanZhi: string
  monthZhi: DiZhi
  jianChu: string
  jieQi: {
    name: string | null
    isToday: boolean
    isNear: boolean
  }
  shiChen: ShiChenItem[]
  locale: string
}

const { t, locale } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const selectedDate = ref('')
const calcResult = ref<CalcResult | null>(null)
const resultRef = ref<HTMLDivElement | null>(null)

const tz = getLocalTimeZone()
const df = new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), {
  dateStyle: 'medium',
})

const calendarDate = ref<CalendarDate | undefined>(undefined)
const selectedQuickKey = ref<'today' | 'tomorrow' | 'dayAfterTomorrow' | null>(null)

watch(calendarDate, () => {
  if (calendarDate.value) {
    selectedDate.value = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
    syncQuickKey()
  }
})

function selectQuickDate(offset: number, key: 'today' | 'tomorrow' | 'dayAfterTomorrow') {
  const d = today(tz).add({ days: offset })
  calendarDate.value = d
  selectedQuickKey.value = key
}

function syncQuickKey() {
  const selected = formatDate(calendarDate.value)
  if (!selected) {
    selectedQuickKey.value = null
    return
  }
  const todayDate = today(tz)
  const todayStr = formatDate(todayDate)
  const tomorrowStr = formatDate(todayDate.add({ days: 1 }))
  const dayAfterTomorrowStr = formatDate(todayDate.add({ days: 2 }))
  if (selected === todayStr) selectedQuickKey.value = 'today'
  else if (selected === tomorrowStr) selectedQuickKey.value = 'tomorrow'
  else if (selected === dayAfterTomorrowStr) selectedQuickKey.value = 'dayAfterTomorrow'
  else selectedQuickKey.value = null
}

const quickDateButtons = computed(() => [
  { key: 'today' as const, label: t('jishi.today'), offset: 0 },
  { key: 'tomorrow' as const, label: t('jishi.tomorrow'), offset: 1 },
  { key: 'dayAfterTomorrow' as const, label: t('jishi.dayAfterTomorrow'), offset: 2 },
])

function formatDate(date: { year: number; month: number; day: number } | undefined): string {
  if (!date) return ''
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

onMounted(() => {
  selectQuickDate(0, 'today')
})

async function handleSubmit() {
  if (!selectedDate.value) {
    toast.add({
      title: t('jishi.checkInput'),
      description: t('jishi.dateLabel'),
      color: 'error',
    })
    return
  }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/jishi/calc', {
      method: 'POST',
      body: {
        date: selectedDate.value,
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
      title: t('jishi.calcFail'),
      description: err.data?.statusMessage || err.message || t('jishi.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态
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
    const response = await fetch('/api/tools/jishi/reading', {
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
            aiError.value = data.message || t('jishi.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('jishi.aiUnavailable')
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
  selectQuickDate(0, 'today')
}

const renderedAiContent = computed(() => {
  if (!aiContent.value) return ''
  return marked.parse(aiContent.value, { async: false }) as string
})

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.jishiTitle')} - ${siteName}`,
  description: t('seo.jishiDesc'),
  keywords: t('seo.jishiKeywords'),
  ogTitle: () => `${t('seo.jishiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jishiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/jishi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.jishiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/jishi',
        description: t('seo.jishiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('jishi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/jishi',
          description: t('seo.jishiOgDesc'),
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
:deep(.prose p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
:deep(.prose p:last-child) {
  margin-bottom: 0;
}
:deep(.prose strong) {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
