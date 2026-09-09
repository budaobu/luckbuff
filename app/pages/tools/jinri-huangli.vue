<template>
  <div>
    <section class="today-stage">
      <div class="today-stage-veil" aria-hidden="true" />
      <div class="today-stage-head">
        <div>
          <p class="today-stage-eyebrow">Today Huangli</p>
          <h1 class="today-stage-title font-serif">
          {{ t('todayAlmanac.title') }}
          </h1>
          <p class="today-stage-subtitle">
          {{ t('todayAlmanac.subtitle') }}
          </p>
        </div>

        <AppShareButton
          tool="jinri-huangli"
          :summary="shareSummary"
          filename="jinri-huangli-tear-calendar.png"
          :share-image-factory="generateShareImage"
        />
      </div>

      <div class="relative">
        <TodayAlmanacCalendarScene
          ref="sceneRef"
          :day="currentDay"
          :next-day="nextDay"
          :disabled="initialLoading || !!error || advancing"
          @advance="onAdvance"
          @settled="onSettled"
        />

        <div
          v-if="initialLoading || advancing"
          class="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs text-white/70"
        >
          {{ initialLoading ? t('todayAlmanac.loading') : t('todayAlmanac.turning') }}
        </div>

        <div
          v-if="error"
          class="absolute inset-0 flex items-center justify-center bg-[#171110]/82 px-6 text-center"
        >
          <div>
            <p class="text-sm text-white/80">{{ error }}</p>
            <UButton
              class="mt-4"
              color="warning"
              variant="outline"
              size="sm"
              @click="loadCurrent"
            >
              {{ t('todayAlmanac.retry') }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-6xl px-5 pb-8 md:px-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-white/50">
            {{ currentDay ? `${t('todayAlmanac.timezone')} · ${currentDay.timezone}` : '' }}
          </p>
          <UButton
            color="warning"
            variant="ghost"
            size="sm"
            icon="i-lucide-chevrons-down"
            :disabled="initialLoading || advancing || !!error || !nextDay"
            @click="onAdvance"
          >
            {{ t('todayAlmanac.tearAction') }}
          </UButton>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <div
        v-if="currentDay"
        ref="reportRoot"
        class="space-y-10"
        @click="handleReportClick"
        @keydown="handleReportKeydown"
      >
        <div>
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 class="font-serif text-2xl font-semibold text-[var(--text-primary)]">
                {{ formatDate(currentDay.date) }}
              </h2>
              <p class="mt-1 text-sm text-[var(--text-muted)]">
                {{ weekdayLabel(currentDay.weekday) }} · {{ currentDay.lunar.yearInChinese }}年 {{ currentDay.lunar.monthInChinese }}月{{ currentDay.lunar.dayInChinese }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="rounded-full border border-[var(--border-light)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {{ currentDay.jianChu }} · {{ currentDay.tianShen }} {{ currentDay.tianShenLuck }}
              </span>
              <span
                v-if="currentDay.isToday"
                class="rounded-full bg-[var(--accent-bg)] px-3 py-1 text-xs text-[var(--accent)]"
              >
                {{ t('todayAlmanac.todayBadge') }}
              </span>
            </div>
          </div>

          <dl class="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div
              v-for="item in summaryItems"
              :key="item.label"
              class="border-b border-[var(--border-subtle)] pb-3"
            >
              <dt class="text-xs text-[var(--text-faint)]">{{ item.label }}</dt>
              <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="rounded-2xl border border-green-500/20 bg-green-500/[0.05] p-5">
            <h3 class="text-base font-semibold text-green-600 dark:text-green-400">{{ t('todayAlmanac.yi') }}</h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="item in currentDay.yi"
                :key="`yi-${item}`"
                class="rounded-lg border border-green-500/20 bg-[var(--surface-card)] px-2.5 py-1.5 text-sm text-[var(--text-primary)]"
              >
                {{ item }}
              </span>
            </div>
          </div>
          <div class="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5">
            <h3 class="text-base font-semibold text-red-600 dark:text-red-400">{{ t('todayAlmanac.ji') }}</h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="item in currentDay.ji"
                :key="`ji-${item}`"
                class="rounded-lg border border-red-500/20 bg-[var(--surface-card)] px-2.5 py-1.5 text-sm text-[var(--text-primary)]"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ t('todayAlmanac.luckyHours') }}</h3>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <article
              v-for="hour in luckyHours"
              :key="`good-${hour.ganZhi}-${hour.startTime}`"
              class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ hour.startTime }}–{{ hour.endTime }} · {{ hour.ganZhi }}
                </p>
                <span class="text-xs text-green-600 dark:text-green-400">{{ hour.tianShen }} {{ hour.luck }}</span>
              </div>
              <p class="mt-2 text-xs leading-6 text-[var(--text-muted)]">
                {{ t('todayAlmanac.hourYi') }} {{ hour.yi.slice(0, 8).join('、') || t('common.none') }}
              </p>
            </article>
          </div>

          <h3 class="mt-7 text-lg font-semibold text-[var(--text-primary)]">{{ t('todayAlmanac.carefulHours') }}</h3>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <article
              v-for="hour in carefulHours"
              :key="`care-${hour.ganZhi}-${hour.startTime}`"
              class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ hour.startTime }}–{{ hour.endTime }} · {{ hour.ganZhi }}
                </p>
                <span class="text-xs text-red-600 dark:text-red-400">{{ hour.tianShen }} {{ hour.luck }}</span>
              </div>
              <p class="mt-2 text-xs leading-6 text-[var(--text-muted)]">
                {{ t('todayAlmanac.hourJi') }} {{ hour.ji.slice(0, 8).join('、') || t('common.none') }}
              </p>
            </article>
          </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ t('todayAlmanac.directions') }}</h3>
            <dl class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <div
                v-for="item in directionItems"
                :key="item.label"
                class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
              >
                <dt class="text-xs text-[var(--text-faint)]">{{ item.label }}</dt>
                <dd class="mt-1 text-sm text-[var(--text-primary)]">{{ item.value }}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ t('todayAlmanac.colorTitle') }}</h3>
            <div class="mt-4 space-y-3">
              <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <p class="text-xs text-green-600 dark:text-green-400">{{ t('todayAlmanac.luckyColor') }}</p>
                <p class="mt-1 text-sm text-[var(--text-primary)]">{{ currentDay.colors.daJi.colors.join('、') }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <p class="text-xs text-[var(--text-muted)]">{{ t('todayAlmanac.secondaryColor') }}</p>
                <p class="mt-1 text-sm text-[var(--text-primary)]">{{ currentDay.colors.ciJi.colors.join('、') }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <p class="text-xs text-red-600 dark:text-red-400">{{ t('todayAlmanac.avoidColor') }}</p>
                <p class="mt-1 text-sm text-[var(--text-primary)]">{{ currentDay.colors.buYi.colors.join('、') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ t('todayAlmanac.detailTitle') }}</h3>
          <dl class="mt-4 grid gap-3 md:grid-cols-2">
            <div
              v-for="item in detailItems"
              :key="item.label"
              class="border-b border-[var(--border-subtle)] pb-3"
            >
              <dt class="text-xs text-[var(--text-faint)]">{{ item.label }}</dt>
              <dd class="mt-1 text-sm leading-6 text-[var(--text-body)]">{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <p class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-xs leading-6 text-[var(--text-faint)]">
          {{ t('todayAlmanac.disclaimer') }}
        </p>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="ta-insight">
        <div
          v-if="insightOpen"
          class="ta-insight-layer"
          role="presentation"
          @click.self="closeInsight"
        >
          <section
            class="ta-insight"
            role="dialog"
            aria-modal="true"
            :aria-label="insightTitle || t('todayAlmanac.aiPanelTitle')"
          >
            <header class="ta-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ t('todayAlmanac.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || t('todayAlmanac.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="t('todayAlmanac.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="ta-insight-body">
              <div v-if="insightStatus === 'connecting'" class="ta-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ t('todayAlmanac.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="ta-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="ta-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="ta-insight-foot">
              <small>{{ t('todayAlmanac.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="ta-insight-auth">
              <p>{{ t('todayAlmanac.aiLoginRequired') }}</p>
              <div>
                <button type="button" @click="signInWithGoogle(route.fullPath)">
                  <UIcon name="i-simple-icons-google" class="h-4 w-4" />
                  Google
                </button>
                <button type="button" @click="signInWithTelegram(route.fullPath)">
                  <UIcon name="i-simple-icons-telegram" class="h-4 w-4" />
                  Telegram
                </button>
              </div>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { TodayAlmanac } from '~/types/today-almanac'
import { generateTodayAlmanacPoster } from '~/utils/today-almanac-poster'

const { t, locale } = useI18n()
const route = useRoute()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const siteName = 'ososn'
const sceneRef = ref<{ startTear: () => boolean } | null>(null)
const reportRoot = ref<HTMLElement | null>(null)
const currentDay = ref<TodayAlmanac | null>(null)
const nextDay = ref<TodayAlmanac | null>(null)
const currentDate = ref(todayInShanghai())
const initialLoading = ref(true)
const advancing = ref(false)
const error = ref('')
let midnightTimer: ReturnType<typeof setTimeout> | null = null

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null

const insightFullLabel = computed(() => isLoggedIn.value
  ? t('todayAlmanac.aiFullReport')
  : t('todayAlmanac.aiFullReportLogin'))

const AI_TARGET_SELECTORS = [
  'dl > div',
  'div.grid.gap-5 > div',
  'div > article',
  '.mt-4.space-y-3 > div',
].join(',')

const luckyHours = computed(() => currentDay.value?.hours.filter(hour => hour.luck === '吉') || [])
const carefulHours = computed(() => currentDay.value?.hours.filter(hour => hour.luck === '凶') || [])
const shareSummary = computed(() => {
  const day = currentDay.value
  if (!day) return undefined
  return `${day.date} · ${day.lunar.dayGanZhi} · ${day.jianChu}`
})

const posterLabels = computed(() => ({
  title: t('todayAlmanac.title'),
  yi: t('todayAlmanac.yi'),
  ji: t('todayAlmanac.ji'),
  jianChu: t('todayAlmanac.jianChu'),
  nineStar: t('todayAlmanac.nineStar'),
  luckyHours: t('todayAlmanac.luckyHours'),
  directions: t('todayAlmanac.directions'),
  xiDirection: t('todayAlmanac.xiDirection'),
  caiDirection: t('todayAlmanac.caiDirection'),
  fuDirection: t('todayAlmanac.fuDirection'),
  chongSha: t('todayAlmanac.chongSha'),
  colorTitle: t('todayAlmanac.colorTitle'),
  luckyColor: t('todayAlmanac.luckyColor'),
  avoidColor: t('todayAlmanac.avoidColor'),
  jieQi: t('todayAlmanac.jieQi'),
  timezone: `${t('todayAlmanac.timezone')} · UTC+8`,
}))

async function generateShareImage(): Promise<string | null> {
  const day = currentDay.value
  if (!day) throw new Error(t('todayAlmanac.loadFailed'))
  return generateTodayAlmanacPoster({
    day,
    labels: posterLabels.value,
    url: window.location.href,
  })
}

const summaryItems = computed(() => {
  const day = currentDay.value
  if (!day) return []
  return [
    { label: t('todayAlmanac.dayGanZhi'), value: day.lunar.dayGanZhi },
    { label: t('todayAlmanac.monthGanZhi'), value: day.lunar.monthGanZhi },
    { label: t('todayAlmanac.jianChu'), value: day.jianChu },
    { label: t('todayAlmanac.chongSha'), value: `${day.chongDesc} ${day.sha}` },
  ]
})

const directionItems = computed(() => {
  const day = currentDay.value
  if (!day) return []
  return [
    { label: t('todayAlmanac.xiDirection'), value: day.positions.xi },
    { label: t('todayAlmanac.caiDirection'), value: day.positions.cai },
    { label: t('todayAlmanac.fuDirection'), value: day.positions.fu },
    { label: t('todayAlmanac.yangGui'), value: day.positions.yangGui },
    { label: t('todayAlmanac.yinGui'), value: day.positions.yinGui },
    { label: t('todayAlmanac.taiSui'), value: day.positions.taiSui },
  ]
})

const detailItems = computed(() => {
  const day = currentDay.value
  if (!day) return []
  return [
    { label: t('todayAlmanac.jiShen'), value: day.jiShen.join('、') },
    { label: t('todayAlmanac.xiongSha'), value: day.xiongSha.join('、') },
    { label: t('todayAlmanac.pengZu'), value: `${day.pengZuGan}；${day.pengZuZhi}` },
    { label: t('todayAlmanac.xunKong'), value: day.xunKong },
    { label: t('todayAlmanac.nineStar'), value: day.nineStar },
    { label: t('todayAlmanac.xiu'), value: `${day.xiu.name} ${day.xiu.luck} · ${day.xiu.zheng} ${day.xiu.animal} · ${day.xiu.gong}${day.xiu.shou}` },
    { label: t('todayAlmanac.jieQi'), value: day.season.jieQi || `${day.season.nextJieQi.name} ${day.season.nextJieQi.date}` },
    { label: t('todayAlmanac.hou'), value: `${day.season.hou} · ${day.season.wuHou}` },
    { label: t('todayAlmanac.yueXiang'), value: day.season.yueXiang },
    { label: t('todayAlmanac.festivals'), value: day.festivals.join('、') || t('common.none') },
    { label: t('todayAlmanac.naYin'), value: `${day.lunar.yearNaYin} · ${day.lunar.monthNaYin} · ${day.lunar.dayNaYin}` },
    { label: t('todayAlmanac.dayWuxing'), value: day.colors.dayWuxing },
  ].filter(item => item.value)
})

function todayInShanghai(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function addDays(date: string, days = 1): string {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function formatDate(date: string) {
  return date.replace(/-/g, ' / ')
}

function weekdayLabel(weekday: number) {
  const labels = locale.value === 'en'
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return labels[weekday] || ''
}

function normalizeText(value: string | null | undefined) {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const parent = node.parentElement
  if (parent?.tagName === 'DL') {
    const label = normalizeText(node.querySelector('dt')?.textContent)
    const value = normalizeText(node.querySelector('dd')?.textContent)
    return [label, value].filter(Boolean).join(' · ')
  }

  const heading = normalizeText(node.querySelector('h3, strong, dt, p')?.textContent)
  const value = normalizeText(node.innerText).slice(0, 80)
  return [heading, value].filter((item, index, list) => item && list.indexOf(item) === index).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const heading = normalizeText(section?.querySelector('h2, h3')?.textContent)
  return {
    section: heading || t('todayAlmanac.title'),
    group: normalizeText(node.querySelector('h3, dt, p')?.textContent).slice(0, 120),
    content: normalizeText(node.innerText).slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(AI_TARGET_SELECTORS))) {
    if (node.closest('button') || node.closest('a')) continue
    node.dataset.taAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.taAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('todayAlmanac.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const day = currentDay.value
  if (!day) return
  void streamInsight({
    mode: 'target',
    title: node.dataset.taAiLabel || targetLabel(node),
    target: {
      selector: node.className || node.tagName.toLowerCase(),
      label: node.dataset.taAiLabel || targetLabel(node),
      ...targetContext(node),
    },
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-ta-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-ta-ai-target]')
  if (target && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    activateTarget(target)
  }
}

function compactAlmanacContext(day: TodayAlmanac) {
  return [
    `日期：${day.date}（${weekdayLabel(day.weekday)}）`,
    `农历：${day.lunar.yearInChinese}年 ${day.lunar.monthInChinese}月${day.lunar.dayInChinese}`,
    `干支：${day.lunar.yearGanZhi}年 ${day.lunar.monthGanZhi}月 ${day.lunar.dayGanZhi}日；纳音 ${day.lunar.dayNaYin}`,
    `建除：${day.jianChu}；十二天神：${day.tianShen} ${day.tianShenLuck}（${day.tianShenType}）`,
    `宜：${day.yi.join('、')}`,
    `忌：${day.ji.join('、')}`,
    `吉神：${day.jiShen.join('、')}；凶煞：${day.xiongSha.join('、')}`,
    `冲煞：${day.chongDesc}，煞 ${day.sha}；旬空 ${day.xunKong}`,
    `方位：喜神 ${day.positions.xi}，财神 ${day.positions.cai}，福神 ${day.positions.fu}，阳贵 ${day.positions.yangGui}，阴贵 ${day.positions.yinGui}，日太岁 ${day.positions.taiSui}`,
    `颜色：大吉 ${day.colors.daJi.colors.join('/')}，次吉 ${day.colors.ciJi.colors.join('/')}，不宜 ${day.colors.buYi.colors.join('/')}`,
    `九星：${day.nineStar}；二十八宿：${day.xiu.name} ${day.xiu.luck}`,
    `节气：${day.season.jieQi || day.season.nextJieQi.name}；候应：${day.season.hou} ${day.season.wuHou}`,
    `节日：${day.festivals.join('、') || '无'}`,
    '时辰：',
    ...day.hours.map(hour => `  ${hour.startTime}-${hour.endTime} ${hour.ganZhi} ${hour.tianShen} ${hour.luck}（${hour.type}），冲${hour.chongShengXiao}，煞${hour.sha}；宜${hour.yi.slice(0, 6).join('/') || '无'}；忌${hour.ji.slice(0, 6).join('/') || '无'}`),
  ].join('\n')
}

async function fetchDay(date: string): Promise<TodayAlmanac> {
  return $fetch<TodayAlmanac>('/api/tools/jinri-huangli/calc', {
    method: 'POST',
    body: { date },
  })
}

async function loadCurrent() {
  initialLoading.value = true
  error.value = ''
  currentDate.value = todayInShanghai()

  try {
    const [today, tomorrow] = await Promise.all([
      fetchDay(currentDate.value),
      fetchDay(addDays(currentDate.value)),
    ])
    currentDay.value = today
    nextDay.value = tomorrow
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || t('todayAlmanac.loadFailed')
  }
  finally {
    initialLoading.value = false
    scheduleMidnightRefresh()
  }
}

function onAdvance() {
  if (advancing.value || !currentDay.value || !nextDay.value) return
  if (sceneRef.value?.startTear()) advancing.value = true
}

async function onSettled() {
  const next = nextDay.value
  if (!next) {
    advancing.value = false
    return
  }

  currentDay.value = next
  currentDate.value = next.date
  nextDay.value = null
  advancing.value = false
  try {
    nextDay.value = await fetchDay(addDays(next.date))
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || t('todayAlmanac.loadFailed')
  }
  finally {
    if (nextDay.value) error.value = ''
  }
}

async function streamInsight(payload: {
  mode: 'target' | 'full'
  title?: string
  target?: Record<string, string>
}) {
  const day = currentDay.value
  if (!day) return

  insightAbort?.abort()
  insightAbort = new AbortController()
  insightOpen.value = true
  insightMode.value = payload.mode
  insightTitle.value = payload.title || t('todayAlmanac.aiPanelTitle')
  insightContent.value = ''
  insightError.value = ''
  authRequired.value = false
  insightStatus.value = 'connecting'

  try {
    const response = await fetch('/api/tools/jinri-huangli/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({
        ...payload,
        day,
        almanacContext: compactAlmanacContext(day),
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const data = await response.json()
        message = data.message || data.statusMessage || message
      }
      catch { /* keep HTTP code */ }
      if (response.status === 401) authRequired.value = true
      throw new Error(message)
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
        if (!line.startsWith('data:')) continue
        const text = line.slice(5).trim()
        if (!text || text === '[DONE]') continue
        try {
          const chunk = JSON.parse(text)
          if (chunk.type === 'error') throw new Error(chunk.message || t('todayAlmanac.aiError'))
          if (chunk.text) {
            insightStatus.value = 'streaming'
            insightContent.value += chunk.text
          }
        }
        catch (error) {
          if ((error as Error).message) throw error
        }
      }
    }
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('todayAlmanac.aiError')
  }
  finally {
    insightAbort = null
  }
}

function handleFullReport() {
  if (isLoggedIn.value) {
    void streamInsight({ mode: 'full', title: t('todayAlmanac.aiFullReportTitle') })
    return
  }
  authRequired.value = true
}

function closeInsight() {
  insightAbort?.abort()
  insightAbort = null
  insightOpen.value = false
  insightStatus.value = 'connecting'
  insightContent.value = ''
}

watch([currentDay, locale], async () => {
  await nextTick()
  initializeTargets()
}, { immediate: true })

async function refreshIfDateChanged() {
  const today = todayInShanghai()
  if (today === currentDate.value) {
    scheduleMidnightRefresh()
    return
  }
  currentDay.value = null
  nextDay.value = null
  advancing.value = false
  await loadCurrent()
}

function scheduleMidnightRefresh() {
  if (midnightTimer) clearTimeout(midnightTimer)
  const nextMidnight = Date.parse(`${addDays(todayInShanghai())}T00:00:00+08:00`)
  midnightTimer = setTimeout(() => {
    void refreshIfDateChanged()
  }, Math.max(1000, nextMidnight - Date.now()))
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') void refreshIfDateChanged()
}

onMounted(async () => {
  await loadCurrent()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (midnightTimer) clearTimeout(midnightTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  insightAbort?.abort()
})

useSeoMeta({
  title: () => `${t('seo.jinriHuangliTitle')} - ${siteName}`,
  description: t('seo.jinriHuangliDesc'),
  keywords: t('seo.jinriHuangliKeywords'),
  ogTitle: () => `${t('seo.jinriHuangliOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jinriHuangliOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/jinri-huangli',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.jinriHuangliTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/jinri-huangli',
        description: t('seo.jinriHuangliDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('todayAlmanac.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/jinri-huangli',
          description: t('seo.jinriHuangliOgDesc'),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
.today-stage {
  position: relative;
  overflow: hidden;
  color: #fffdf4;
  background:
    radial-gradient(52rem 24rem at 10% -10%, rgba(255, 221, 168, 0.10), transparent 62%),
    radial-gradient(40rem 22rem at 88% 4%, rgba(139, 43, 37, 0.16), transparent 66%),
    linear-gradient(155deg, #2b1c14 0%, #191110 48%, #100b09 100%);
}

.today-stage-veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 253, 244, 0.035) 1px, transparent 1px),
    radial-gradient(46rem 20rem at 50% 118%, rgba(207, 164, 83, 0.11), transparent 64%);
  background-size: 72px 100%, auto;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.72), transparent 72%);
}

.today-stage-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  max-width: 72rem;
  margin: 0 auto;
  padding: 36px 20px 18px;
}

.today-stage-eyebrow {
  color: #e6b978;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.today-stage-title {
  margin: 10px 0 0;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0;
}

.today-stage-subtitle {
  max-width: 38em;
  margin: 10px 0 0;
  color: rgba(255, 253, 244, 0.64);
  font-size: 14px;
  line-height: 1.7;
}

.today-stage-head > :last-child {
  flex-shrink: 0;
  padding-top: 6px;
}

[data-ta-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-ta-ai-target]::after {
  content: '✦';
  position: absolute;
  z-index: 5;
  top: 5px;
  right: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg));
  color: var(--accent);
  font-size: 10px;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  transform: translateY(2px);
  transition: opacity 140ms ease, transform 140ms ease;
}

[data-ta-ai-target]:hover,
[data-ta-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-ta-ai-target]:hover::after,
[data-ta-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

[data-ta-ai-target]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.ta-insight-layer {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: end center;
  padding: 24px;
  background: color-mix(in srgb, rgba(15, 18, 24, 0.52), transparent);
  backdrop-filter: blur(8px);
}

.ta-insight {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(560px, 100%);
  max-height: min(74vh, 680px);
  overflow: hidden;
  border: 1px solid var(--border-medium);
  border-radius: 18px;
  background: var(--surface-dropdown);
  box-shadow: var(--shadow-panel);
}

.ta-insight-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.ta-insight-head p {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
}

.ta-insight-head h3 {
  margin: 6px 0 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

.ta-insight-head button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-input);
  color: var(--text-faint);
  cursor: pointer;
}

.ta-insight-body {
  min-height: 108px;
  overflow: auto;
  padding: 18px 20px;
}

.ta-insight-content {
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.ta-insight-status,
.ta-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.ta-insight-error {
  color: #b91c1c;
}

.ta-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-subtle);
}

.ta-insight-foot small {
  min-width: 0;
  color: var(--text-placeholder);
  font-size: 10px;
  line-height: 1.4;
}

.ta-insight-foot button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.ta-insight-auth {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-card);
}

.ta-insight-auth p {
  margin: 0 0 9px;
  color: var(--text-muted);
  font-size: 12px;
}

.ta-insight-auth div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ta-insight-auth button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-input);
  color: var(--text-body);
  font-size: 12px;
  cursor: pointer;
}

.ta-insight-enter-active,
.ta-insight-leave-active {
  transition: opacity 180ms ease;
}

.ta-insight-enter-active .ta-insight,
.ta-insight-leave-active .ta-insight {
  transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms ease;
}

.ta-insight-enter-from,
.ta-insight-leave-to {
  opacity: 0;
}

.ta-insight-enter-from .ta-insight,
.ta-insight-leave-to .ta-insight {
  opacity: 0;
  transform: translateY(18px);
}
</style>
