<template>
  <div>
    <section class="today-stage">
      <div
        ref="reportRoot"
        class="today-paper-wrap"
        @click="handleReportClick"
        @keydown="handleReportKeydown"
      >
        <TodayAlmanacPaper
          :day="currentDay"
          :disabled="initialLoading || advancing || !!error"
          @advance="onAdvance"
          @today="loadCurrent"
        >
          <template #actions>
            <NuxtLink
              class="today-subscribe"
              :to="localePath('/tools/almanac-calendar')"
            >
              <UIcon
                name="i-heroicons-calendar"
                class="h-3.5 w-3.5"
              />
              {{ t('todayAlmanac.subscribeCalendar') }}
            </NuxtLink>
            <AppShareButton
              class="today-share"
              tool="jinri-huangli"
              :summary="shareSummary"
              filename="jinri-huangli-tear-calendar.png"
              :share-image-factory="generateShareImage"
            />
          </template>
        </TodayAlmanacPaper>

        <div
          v-if="initialLoading || advancing"
          class="ta-status"
          role="status"
        >
          {{ initialLoading ? t('todayAlmanac.loading') : t('todayAlmanac.turning') }}
        </div>

        <div
          v-if="error"
          class="ta-error-layer"
        >
          <div class="ta-error">
            <p>{{ error }}</p>
            <button type="button" @click="loadCurrent">
              {{ t('todayAlmanac.retry') }}
            </button>
          </div>
        </div>
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
const localePath = useLocalePath()
const route = useRoute()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const siteName = 'ososn'
const reportRoot = ref<HTMLElement | null>(null)
const currentDay = ref<TodayAlmanac | null>(null)
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

const AI_TARGET_SELECTOR = '[data-ta-ai-target]'

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
  const heading = normalizeText(node.querySelector('h2, h3')?.textContent)
  if (heading) return heading

  const value = normalizeText(node.innerText)
  return value.slice(0, 40) || t('todayAlmanac.title')
}

function targetContext(node: HTMLElement) {
  const heading = normalizeText(node.querySelector('h2, h3')?.textContent)
  return {
    section: heading || t('todayAlmanac.title'),
    group: heading || t('todayAlmanac.title'),
    content: normalizeText(node.innerText).slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(AI_TARGET_SELECTOR))) {
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
    `年柱：${day.lunar.yearGanZhi}；月柱：${day.lunar.monthGanZhi}；日柱：${day.lunar.dayGanZhi}`,
    `日禄：${day.dayLu}`,
    `每日胎神：${day.taiShen}`,
    `贵人时：${day.nobleHours.map(hour => `${hour.label} ${hour.startTime}-${hour.endTime} ${hour.ganZhi}`).join('；') || '无'}`,
    `今日冲生肖：${day.chongShengXiao}`,
    `幸运生肖：${day.luckyZodiacs.map(item => `${item.zodiac}（${item.relation}）`).join('、')}`,
    `今日吉数：${day.luckyNumbers.join('、')}`,
    `每日吉句：${day.dailyQuote.text}（来源类型：${day.dailyQuote.sourceType}；来源体系：${day.dailyQuote.sourceSystem.join('、')}；关联宜事：${day.dailyQuote.relatedYi || '无'}）`,
    `宜：${day.yi.join('、')}`,
    `忌：${day.ji.join('、')}`,
    `吉神：${day.jiShen.join('、')}；凶煞：${day.xiongSha.join('、')}`,
    `冲煞：${day.chongDesc}，煞 ${day.sha}；旬空 ${day.xunKong}`,
    `方位：喜神 ${day.positions.xi}，财神 ${day.positions.cai}，福神 ${day.positions.fu}，阳贵 ${day.positions.yangGui}，阴贵 ${day.positions.yinGui}，日太岁 ${day.positions.taiSui}`,
    `颜色：大吉 ${day.colors.daJi.colors.join('/')}，次吉 ${day.colors.ciJi.colors.join('/')}，不宜 ${day.colors.buYi.colors.join('/')}`,
    `九星：${day.nineStar}`,
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
    currentDay.value = await fetchDay(currentDate.value)
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || t('todayAlmanac.loadFailed')
  }
  finally {
    initialLoading.value = false
    scheduleMidnightRefresh()
  }
}

async function onAdvance() {
  if (advancing.value || !currentDay.value) return
  advancing.value = true
  error.value = ''

  try {
    currentDay.value = await fetchDay(addDays(currentDate.value))
    currentDate.value = currentDay.value.date
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || t('todayAlmanac.loadFailed')
  }
  finally {
    advancing.value = false
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

const pageUrl = useLocalizedSeoUrl('/tools/jinri-huangli')

useSeoMeta({
  title: () => `${t('seo.jinriHuangliTitle')} - ${siteName}`,
  description: t('seo.jinriHuangliDesc'),
  keywords: t('seo.jinriHuangliKeywords'),
  ogTitle: () => `${t('seo.jinriHuangliOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jinriHuangliOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
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
        url: pageUrl.value,
        description: t('seo.jinriHuangliDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('todayAlmanac.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
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
  color: #fff8ec;
  background:
    radial-gradient(70rem 34rem at 50% 0%, rgba(255, 141, 126, 0.30), transparent 62%),
    radial-gradient(44rem 28rem at 12% 78%, rgba(84, 5, 13, 0.78), transparent 68%),
    radial-gradient(52rem 32rem at 92% 70%, rgba(65, 4, 11, 0.66), transparent 70%),
    linear-gradient(145deg, #cd1c26 0%, #9b111b 54%, #63080f 100%);
}

.today-paper-wrap {
  position: relative;
  width: min(820px, 100%);
  margin: 0 auto;
  padding: 42px 20px 40px;
}

.today-stage :deep(.today-share button) {
  min-height: 34px;
  border: 1px solid rgba(165, 22, 27, .46);
  border-radius: 1px;
  background: transparent;
  color: #a5161b !important;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 12px;
  box-shadow: none;
}

.today-subscribe {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  margin-right: 6px;
  border: 1px solid rgba(165, 22, 27, .46);
  border-radius: 1px;
  background: transparent;
  color: #a5161b;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 12px;
  text-decoration: none;
}

.today-subscribe:hover {
  background: #a5161b;
  color: #f7f0e4;
}

.today-stage :deep(.today-share button:hover) {
  background: #a5161b;
  color: #f7f0e4 !important;
}

.ta-status {
  position: absolute;
  z-index: 4;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  border: 1px solid rgba(247, 240, 228, .28);
  border-radius: 999px;
  background: rgba(76, 7, 11, .72);
  color: #ffeecb;
  font-size: 12px;
}

.ta-error-layer {
  position: absolute;
  z-index: 5;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(101, 8, 14, .90);
  text-align: center;
}

.ta-error p {
  margin: 0 0 14px;
  color: #ffeec9;
  font-size: 14px;
}

.ta-error button {
  padding: 7px 14px;
  border: 1px solid rgba(255, 238, 203, .52);
  border-radius: 1px;
  background: transparent;
  color: #ffeecb;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.ta-error button:hover {
  background: rgba(255, 238, 203, .14);
}

.today-paper-wrap :deep([data-ta-ai-target]) {
  position: relative;
  cursor: pointer;
  transition: background-color 160ms ease, box-shadow 160ms ease;
}

.today-paper-wrap :deep([data-ta-ai-target]::after) {
  content: '✦';
  position: absolute;
  z-index: 5;
  top: 7px;
  right: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(165, 22, 27, .42);
  border-radius: 999px;
  background: #f7f0e4;
  color: #a5161b;
  font-size: 10px;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  transform: translateY(2px);
  transition: opacity 140ms ease, transform 140ms ease;
}

.today-paper-wrap :deep([data-ta-ai-target]:hover),
.today-paper-wrap :deep([data-ta-ai-target]:focus-visible) {
  background-color: rgba(165, 22, 27, .05);
  box-shadow: 0 0 0 2px rgba(165, 22, 27, .14);
}

.today-paper-wrap :deep([data-ta-ai-target]:hover::after),
.today-paper-wrap :deep([data-ta-ai-target]:focus-visible::after) {
  opacity: 1;
  transform: translateY(0);
}

.today-paper-wrap :deep([data-ta-ai-target]:focus-visible) {
  outline: 2px solid rgba(165, 22, 27, .72);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .today-paper-wrap {
    padding: 26px 10px 24px;
  }

  .ta-status {
    top: 4px;
  }
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
