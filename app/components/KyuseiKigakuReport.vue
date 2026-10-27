<template>
  <div ref="reportRoot" class="kk" @click="handleReportClick" @keydown.enter.prevent="handleReportKeydown">
    <section v-reveal class="kk-card kk-hero kk-target">
      <div>
        <span>{{ $t('kyuseiKigaku.report.birth') }}</span>
        <strong>{{ formattedDate }}</strong>
        <small>{{ $t(`kyuseiKigaku.hours.${hourKey(result.basic.birthHour)}`) }} · {{ $t(`common.${result.basic.gender}`) }}</small>
      </div>
      <div>
        <span>{{ $t('kyuseiKigaku.report.solarYear') }}</span>
        <strong>{{ result.basic.solarYear }}</strong>
        <small>{{ result.basic.timezone }}</small>
      </div>
      <div>
        <span>{{ $t('kyuseiKigaku.report.location') }}</span>
        <strong>{{ result.basic.locationName }}</strong>
        <small>{{ result.basic.boundaryInstant }}</small>
      </div>
    </section>

    <section v-reveal class="kk-section">
      <header><h2>{{ $t('kyuseiKigaku.natalTitle') }}</h2><p>{{ $t('kyuseiKigaku.natalSubtitle') }}</p></header>
      <div class="kk-stars">
        <article v-for="item in natalCards" :key="item.key" class="kk-card kk-target">
          <span>{{ $t(`kyuseiKigaku.stars.${item.key}`) }}</span>
          <strong>{{ $t(`kyuseiKigaku.starNames.${item.meta.star}`) }}</strong>
          <small>{{ $t(`kyuseiKigaku.elements.${item.meta.element}`) }} · {{ $t(`kyuseiKigaku.directions.${item.meta.direction}`) }}</small>
        </article>
      </div>
      <div class="kk-card kk-target kk-inclination">
        <strong>{{ $t('kyuseiKigaku.inclinedPalace') }}</strong>
        <p>{{ $t(`kyuseiKigaku.palaces.${result.natal.inclinedPalace.palace}`) }} · {{ $t(`kyuseiKigaku.directions.${result.natal.inclinedPalace.direction}`) }}</p>
        <small v-if="result.natal.inclinedPalace.centerAdjusted">{{ $t('kyuseiKigaku.centerAdjusted') }}</small>
      </div>
    </section>

    <section v-reveal class="kk-section">
      <header><h2>{{ $t('kyuseiKigaku.boardsTitle') }}</h2><p>{{ $t('kyuseiKigaku.boardsSubtitle') }}</p></header>
      <div class="kk-boards">
        <article v-for="board in result.boards" :key="board.key" class="kk-card kk-board kk-target">
          <h3>{{ $t(`kyuseiKigaku.boards.${board.key}`) }} · {{ $t(`kyuseiKigaku.starNames.${board.centerStar}`) }}</h3>
          <div class="kk-grid">
            <div v-for="row in boardRows(board)" :key="board.key + row.key" class="kk-cell" :class="{ 'is-center': row.key === 'center' }">
              <span>{{ $t(`kyuseiKigaku.directions.${row.key}`) }}</span>
              <strong>{{ $t(`kyuseiKigaku.starNames.${row.star}`) }}</strong>
            </div>
          </div>
          <div class="kk-signals">
            <span v-for="signal in board.signals" :key="signal.key + signal.palace" :class="{ 'is-caution': isCaution(signal.key) }">
              {{ $t(`kyuseiKigaku.signals.${signal.key}`) }} · {{ $t(`kyuseiKigaku.directions.${signal.direction}`) }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <section v-reveal class="kk-section">
      <header><h2>{{ $t('kyuseiKigaku.compatibilityTitle') }}</h2><p>{{ $t('kyuseiKigaku.compatibilitySubtitle') }}</p></header>
      <div class="kk-two">
        <div class="kk-card kk-target">
          <strong>{{ $t('kyuseiKigaku.internalRelation') }}</strong>
          <p>{{ $t(`kyuseiKigaku.relations.${result.compatibility.primary}`) }}</p>
        </div>
        <div class="kk-card">
          <strong>{{ $t('kyuseiKigaku.affinityTitle') }}</strong>
          <div class="kk-affinities">
            <span v-for="item in result.compatibility.affinities" :key="item.star">
              {{ $t(`kyuseiKigaku.starNames.${item.star}`) }} · {{ $t(`kyuseiKigaku.relations.${item.relation}`) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section v-reveal class="kk-card kk-method kk-target">
      <strong>{{ $t('kyuseiKigaku.methodTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('kyuseiKigaku.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('kyuseiKigaku.yearBoundary') }}</dt><dd>{{ result.methodology.yearBoundary }}</dd></div>
        <div><dt>{{ $t('kyuseiKigaku.monthBoundary') }}</dt><dd>{{ result.methodology.monthBoundary }}</dd></div>
        <div><dt>{{ $t('kyuseiKigaku.disclaimer') }}</dt><dd>{{ result.methodology.disclaimer }}</dd></div>
      </dl>
    </section>

    <Teleport to="body">
      <Transition name="kk-insight">
        <div v-if="insightOpen" class="kk-layer" @click.self="closeInsight">
          <section class="kk-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('kyuseiKigaku.ai.title')">
            <header>
              <div><p>{{ $t('kyuseiKigaku.ai.title') }}</p><h3>{{ insightTitle || $t('kyuseiKigaku.ai.title') }}</h3></div>
              <button type="button" :aria-label="$t('kyuseiKigaku.ai.close')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="kk-insight-body">
              <div v-if="insightStatus === 'connecting'" class="kk-status">{{ $t('kyuseiKigaku.ai.connecting') }}</div>
              <div v-else-if="insightError" class="kk-error">{{ insightError }}</div>
              <div v-else class="kk-content">{{ insightContent }}</div>
            </div>
            <footer>
              <small>{{ $t('kyuseiKigaku.ai.disclaimer') }}</small>
              <button v-if="insightMode === 'target' && insightStatus === 'complete'" type="button" @click="handleFullReport">
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="kk-auth">
              <p>{{ $t('kyuseiKigaku.ai.loginRequired') }}</p>
              <div>
                <button type="button" @click="signInWithGoogle(route.fullPath)">Google</button>
                <button type="button" @click="signInWithTelegram(route.fullPath)">Telegram</button>
              </div>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { KyuseiBoard, KyuseiPaipanResult, KyuseiSignalKey } from '~~/app/types/kyusei-kigaku'

const props = defineProps<{ result: KyuseiPaipanResult }>()
const route = useRoute()
const { t, locale } = useI18n()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const reportRoot = ref<HTMLElement | null>(null)

const CAUTION_SIGNALS: KyuseiSignalKey[] = ['fiveYellow', 'darkSword', 'yearBreaker', 'monthBreaker', 'honmeiKill', 'honmeiTargetKill']
const natalCards = [
  { key: 'year', meta: props.result.natal.yearStar },
  { key: 'month', meta: props.result.natal.monthStar },
  { key: 'day', meta: props.result.natal.dayStar },
  { key: 'hour', meta: props.result.natal.hourStar },
]
const formattedDate = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(new Date(`${props.result.basic.birthDate}T12:00:00`)))

const HOUR_KEYS = {
  子: 'rat', 丑: 'ox', 寅: 'tiger', 卯: 'rabbit', 辰: 'dragon', 巳: 'snake',
  午: 'horse', 未: 'goat', 申: 'monkey', 酉: 'rooster', 戌: 'dog', 亥: 'pig',
} as const

function hourKey(hour: keyof typeof HOUR_KEYS) {
  return HOUR_KEYS[hour]
}

function boardRows(board: KyuseiBoard) {
  return board.stars.slice().sort((a, b) => a.palace - b.palace).map(item => ({
    key: item.palace === 5 ? 'center' : item.direction,
    star: item.star,
  }))
}

function isCaution(key: KyuseiSignalKey) {
  return CAUTION_SIGNALS.includes(key)
}

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null
const insightFullLabel = computed(() => isLoggedIn.value ? t('kyuseiKigaku.ai.fullReport') : t('kyuseiKigaku.ai.fullReportLogin'))

function compactContext() {
  const r = props.result
  return [
    `birth=${r.basic.birthDate} ${r.basic.birthHour} ${r.basic.timezone} solarYear=${r.basic.solarYear}`,
    `yearStar=${r.natal.yearStar.star}/${r.natal.yearStar.element}/${r.natal.yearStar.direction}`,
    `monthStar=${r.natal.monthStar.star}/${r.natal.monthStar.element}/${r.natal.monthStar.direction}`,
    `dayStar=${r.natal.dayStar.star}/${r.natal.dayStar.element}/${r.natal.dayStar.direction}`,
    `hourStar=${r.natal.hourStar.star}/${r.natal.hourStar.element}/${r.natal.hourStar.direction}`,
    `inclined=${r.natal.inclinedPalace.palace}/${r.natal.inclinedPalace.direction}${r.natal.inclinedPalace.centerAdjusted ? '/adjusted' : ''}`,
    ...r.boards.map(board => `${board.key}=${board.centerStar};${board.signals.map(item => `${item.key}@${item.direction}`).join(',')}`),
    `compatibility=${r.compatibility.primary}/${r.compatibility.score}`,
  ].join('\n')
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return
  for (const node of Array.from(root.querySelectorAll<HTMLElement>('.kk-target'))) {
    if (node.dataset.kkTarget) continue
    node.dataset.kkTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = node.querySelector('h2, h3, strong')?.textContent?.trim() || t('kyuseiKigaku.ai.targetFallback')
    node.dataset.kkLabel = label
    node.setAttribute('aria-label', `${label} · ${t('kyuseiKigaku.ai.action')}`)
  }
}

function activateTarget(node: HTMLElement) {
  void requestInsight({
    label: node.dataset.kkLabel || t('kyuseiKigaku.ai.targetFallback'),
    section: node.closest('section')?.querySelector('h2')?.textContent?.trim() || t('kyuseiKigaku.ai.title'),
    content: node.textContent?.replace(/\s+/g, ' ').trim().slice(0, 2600) || '',
  })
}

function handleReportClick(event: MouseEvent) {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-kk-target]')
  if (target && !(event.target as HTMLElement).closest('button, a')) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-kk-target]')
  if (target) activateTarget(target)
}

async function requestInsight(target: { label: string, section: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

function handleFullReport() {
  if (isLoggedIn.value) {
    void startFullReport()
    return
  }
  authRequired.value = true
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('kyuseiKigaku.ai.fullReportTitle')
  await streamInsight({ mode: 'full', title: insightTitle.value })
}

async function streamInsight(payload: { mode: 'target' | 'full', target?: Record<string, string>, title?: string }) {
  insightAbort?.abort()
  insightAbort = new AbortController()
  insightOpen.value = true
  insightMode.value = payload.mode
  insightTitle.value = payload.title || ''
  insightContent.value = ''
  insightError.value = ''
  authRequired.value = false
  insightStatus.value = 'connecting'
  try {
    const response = await fetch('/api/tools/kyusei-kigaku/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({ ...payload, chart: props.result, chartContext: compactContext(), locale: locale.value }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message || data?.statusMessage || `HTTP ${response.status}`)
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
        const chunk = JSON.parse(text)
        if (chunk.type === 'text' && chunk.text) {
          insightStatus.value = 'streaming'
          insightContent.value += chunk.text
        }
        else if (chunk.type === 'error') throw new Error(chunk.message || t('kyuseiKigaku.ai.error'))
      }
    }
    if (!insightContent.value) throw new Error(t('kyuseiKigaku.ai.noResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('kyuseiKigaku.ai.error')
  }
  finally {
    insightAbort = null
  }
}

function closeInsight() {
  insightAbort?.abort()
  insightAbort = null
  insightOpen.value = false
}

watch(() => props.result, async () => {
  await nextTick()
  initializeTargets()
}, { immediate: true })

onMounted(() => nextTick(initializeTargets))
onBeforeUnmount(() => insightAbort?.abort())
</script>

<style scoped>
.kk { display: grid; gap: 44px; }
.kk-card { border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--surface-card); padding: 20px; backdrop-filter: blur(14px); }
.kk-hero { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.kk-hero span, .kk-hero small { display: block; color: var(--text-faint); font-size: 12px; }
.kk-hero strong { display: block; margin: 8px 0; font-size: 18px; }
.kk-section { display: grid; gap: 16px; }
.kk-section header h2 { margin: 0; font-size: clamp(22px, 2.6vw, 30px); line-height: 1.2; }
.kk-section header p { margin: 8px 0 0; color: var(--text-faint); font-size: 14px; }
.kk-stars { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.kk-stars span, .kk-stars small { color: var(--text-faint); font-size: 12px; }
.kk-stars strong { display: block; margin: 8px 0; font-size: 17px; }
.kk-inclination strong { display: block; margin-bottom: 8px; }
.kk-inclination p { margin: 0; font-size: 20px; }
.kk-inclination small { color: var(--text-muted); }
.kk-boards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.kk-board h3 { margin: 0 0 14px; font-size: 16px; }
.kk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.kk-cell { min-height: 76px; display: grid; align-content: center; gap: 5px; border: 1px solid var(--border-light); border-radius: 6px; padding: 10px; text-align: center; }
.kk-cell span { color: var(--text-faint); font-size: 11px; }
.kk-cell strong { font-size: 14px; }
.kk-cell.is-center { border-color: var(--accent-border); background: var(--accent-faint); }
.kk-signals { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.kk-signals span { border: 1px solid var(--border-light); border-radius: 999px; color: var(--text-muted); font-size: 11px; padding: 4px 8px; }
.kk-signals .is-caution { border-color: color-mix(in srgb, #d14343 40%, transparent); color: color-mix(in srgb, #f87171 82%, var(--text-body)); }
.kk-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.kk-two strong { display: block; margin-bottom: 8px; }
.kk-two p { margin: 0; font-size: 18px; }
.kk-affinities { display: grid; gap: 7px; font-size: 13px; color: var(--text-muted); }
.kk-method dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px; margin: 14px 0 0; }
.kk-method dt { color: var(--text-faint); font-size: 12px; }
.kk-method dd { margin: 4px 0 0; font-size: 13px; line-height: 1.55; }
.kk-target { position: relative; cursor: pointer; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
.kk-target::after {
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
.kk-target:hover, .kk-target:focus-visible { border-color: var(--accent-border-hover); background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
.kk-target:hover::after, .kk-target:focus-visible::after { opacity: 1; transform: translateY(0); }
.kk-target:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.kk-layer { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 20px; background: var(--overlay-bg); backdrop-filter: blur(8px); }
.kk-insight { width: min(680px, 100%); max-height: min(78vh, 680px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto auto; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--surface-elevated); }
.kk-insight header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px; border-bottom: 1px solid var(--border-subtle); }
.kk-insight p { margin: 0; color: var(--accent); font-size: 11px; }
.kk-insight h3 { margin: 5px 0 0; font-size: 18px; }
.kk-insight button { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.kk-insight-body { min-height: 180px; overflow: auto; padding: 20px; }
.kk-content { white-space: pre-wrap; line-height: 1.75; font-size: 14px; }
.kk-status, .kk-error { color: var(--text-muted); font-size: 14px; }
.kk-error { color: #f87171; }
.kk-insight footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 18px; border-top: 1px solid var(--border-subtle); }
.kk-insight footer small { color: var(--text-faint); font-size: 11px; }
.kk-insight footer button { display: inline-flex; align-items: center; gap: 6px; color: var(--accent); }
.kk-auth { padding: 16px 18px; border-top: 1px solid var(--border-subtle); }
.kk-auth p { margin: 0 0 10px; font-size: 13px; }
.kk-auth div { display: flex; gap: 8px; }
.kk-auth button { border: 1px solid var(--border-medium); border-radius: 6px; padding: 7px 12px; color: var(--text-body); }
.kk-enter-active, .kk-leave-active { transition: opacity 180ms ease; }
.kk-enter-from, .kk-leave-to { opacity: 0; }
@media (max-width: 820px) {
  .kk-hero, .kk-stars, .kk-two, .kk-method dl { grid-template-columns: 1fr; }
  .kk-boards { grid-template-columns: 1fr; }
}
</style>
