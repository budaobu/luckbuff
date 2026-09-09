<template>
  <div
    ref="reportRoot"
    class="tpp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="tpp-card tpp-hero">
      <div class="tpp-hero-grid">
        <div>
          <span>{{ $t('tiebanPaipan.engineTime') }}</span>
          <strong>{{ result.input.engineTimeText }}</strong>
          <small>{{ result.input.engineTimeBasis }}</small>
        </div>
        <div>
          <span>{{ $t('tiebanPaipan.trueSolar') }}</span>
          <strong>{{ result.solarTime.trueSolarTimeText || $t('tiebanPaipan.uncorrected') }}</strong>
          <small>{{ result.input.location }}</small>
        </div>
        <div>
          <span>{{ $t('tiebanPaipan.pillarsTitle') }}</span>
          <strong>{{ result.pillars.map(pillar => pillar.ganzhi).join(' ') }}</strong>
          <small>{{ result.birth.lunarText }} · {{ result.birth.zodiac }}</small>
        </div>
        <div>
          <span>{{ $t('tiebanPaipan.kaoke') }}</span>
          <strong>{{ result.numbers.kaokeQuarter }}</strong>
          <small>{{ result.numbers.kaokeGroup }} · {{ result.numbers.dayLife }} + {{ result.numbers.timeFortune }}</small>
        </div>
        <div>
          <span>{{ $t('tiebanPaipan.hexagram') }}</span>
          <strong>{{ result.natal.hexagram }}</strong>
          <small>{{ $t('tiebanPaipan.lifeNumber') }} {{ result.numbers.lifeNumber }}</small>
        </div>
        <div>
          <span>{{ $t('tiebanPaipan.corpus') }}</span>
          <strong>{{ result.corpus.availableCount }}/{{ result.corpus.requestedCount }}</strong>
          <small>{{ result.corpus.status === 'available' ? $t('tiebanPaipan.corpusComplete') : `${$t('tiebanPaipan.corpusMissing')} ${result.corpus.missingCount}` }}</small>
        </div>
      </div>
    </section>

    <section class="tpp-section">
      <header class="tpp-section-label">
        <h2>{{ $t('tiebanPaipan.birthTitle') }}</h2>
        <p>{{ $t('tiebanPaipan.birthSubtitle') }}</p>
      </header>
      <div class="tpp-card">
        <dl class="tpp-definition">
          <div><dt>{{ $t('tiebanPaipan.solar') }}</dt><dd>{{ result.birth.solarText }}</dd></div>
          <div><dt>{{ $t('tiebanPaipan.lunar') }}</dt><dd>{{ result.birth.lunarText }} · {{ result.birth.lunarDetail }}</dd></div>
          <div><dt>{{ $t('tiebanPaipan.gender') }}</dt><dd>{{ result.birth.genderText }} · {{ result.birth.zodiac }}</dd></div>
          <div><dt>{{ $t('tiebanPaipan.minuteQuarter') }}</dt><dd>{{ result.birth.minuteQuarter.label }} · {{ result.birth.minuteQuarter.stem }} · {{ result.birth.minuteQuarter.value }}</dd></div>
          <div><dt>{{ $t('tiebanPaipan.requestedTime') }}</dt><dd>{{ result.solarTime.requestedTimeText }}</dd></div>
          <div><dt>{{ $t('tiebanPaipan.correctedTime') }}</dt><dd>{{ result.solarTime.correctedTimeText || '—' }}</dd></div>
          <div><dt>{{ $t('tiebanPaipan.longitudeOffset') }}</dt><dd>{{ result.solarTime.longitudeOffsetMinutes ?? '—' }} min</dd></div>
          <div><dt>{{ $t('tiebanPaipan.equationOffset') }}</dt><dd>{{ result.solarTime.equationOfTimeMinutes ?? '—' }} min</dd></div>
        </dl>
        <p class="tpp-status" :class="{ 'is-boundary': result.solarTime.status === 'boundary' }">
          {{ result.solarTime.statusText }}
        </p>
      </div>
    </section>

    <section class="tpp-section">
      <header class="tpp-section-label">
        <h2>{{ $t('tiebanPaipan.numbersTitle') }}</h2>
        <p>{{ $t('tiebanPaipan.numbersSubtitle') }}</p>
      </header>
      <div class="tpp-number-grid">
        <article><span>{{ $t('tiebanPaipan.innate') }}</span><b>{{ result.numbers.innate }}</b></article>
        <article><span>{{ $t('tiebanPaipan.sound') }}</span><b>{{ result.numbers.sound }} {{ result.numbers.soundValue }}</b></article>
        <article><span>{{ $t('tiebanPaipan.dayLife') }}</span><b>{{ result.numbers.dayLife }}</b></article>
        <article><span>{{ $t('tiebanPaipan.timeFortune') }}</span><b>{{ result.numbers.timeFortune }}</b></article>
        <article><span>{{ $t('tiebanPaipan.lifeNumber') }}</span><b>{{ result.numbers.lifeNumber }}</b></article>
        <article><span>{{ $t('tiebanPaipan.acquired') }}</span><b>{{ result.numbers.acquired }}</b></article>
      </div>
      <div class="tpp-card">
        <strong>{{ $t('tiebanPaipan.minuteFormula') }}</strong>
        <p>{{ result.numbers.minuteFormula }}</p>
      </div>
    </section>

    <section class="tpp-section">
      <header class="tpp-section-label">
        <h2>{{ $t('tiebanPaipan.natalTitle') }}</h2>
        <p>{{ $t('tiebanPaipan.natalSubtitle', { hexagram: result.natal.hexagram }) }}</p>
      </header>
      <div class="tpp-natal">
        <article v-for="(item, index) in result.natal.formulas" :key="`${item.label}-${index}`">
          <header><strong>{{ item.label }}</strong><code>{{ item.formula }}</code></header>
          <p>{{ item.verse.available ? item.verse.text : $t('tiebanPaipan.missingVerse') }}</p>
          <small v-if="item.verse.available && item.verse.ages">{{ item.verse.volume }} · {{ $t('tiebanPaipan.ages') }} {{ item.verse.ages }}</small>
        </article>
      </div>
    </section>

    <section class="tpp-section">
      <header class="tpp-section-label">
        <h2>{{ $t('tiebanPaipan.flowTitle') }}</h2>
        <p>{{ $t('tiebanPaipan.flowSubtitle') }}</p>
      </header>
      <div class="tpp-band-tabs">
        <button
          v-for="(band, index) in flowBands"
          :key="band.label"
          type="button"
          :class="{ active: selectedBand === index }"
          @click="selectedBand = index"
        >
          {{ band.label }}
        </button>
      </div>
      <div class="tpp-card tpp-flow-card">
        <table>
          <thead>
            <tr>
              <th>{{ $t('tiebanPaipan.age') }}</th>
              <th>{{ $t('tiebanPaipan.ganzhi') }}</th>
              <th>{{ $t('tiebanPaipan.sequence') }}</th>
              <th>{{ $t('tiebanPaipan.originalVerse') }}</th>
              <th>{{ $t('tiebanPaipan.correctedVerse') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="year in visibleFlowYears" :key="year.age">
              <td>{{ year.age }}</td>
              <td>{{ year.ganzhi }}</td>
              <td>
                <span>{{ year.sound }} / {{ year.marker }} / {{ year.letter }}</span>
                <small>{{ year.formula }}</small>
              </td>
              <td>{{ year.verse.available ? year.verse.text : $t('tiebanPaipan.missingVerse') }}</td>
              <td>{{ year.correctedVerse.available ? year.correctedVerse.text : $t('tiebanPaipan.missingVerse') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="tpp-card tpp-methodology">
      <strong>{{ $t('tiebanPaipan.methodologyTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('tiebanPaipan.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('tiebanPaipan.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('tiebanPaipan.timeBasis') }}</dt><dd>{{ result.methodology.timeBasis }}</dd></div>
        <div><dt>{{ $t('tiebanPaipan.kaoke') }}</dt><dd>{{ result.methodology.kaoke }}</dd></div>
        <div class="tpp-wide"><dt>{{ $t('tiebanPaipan.corpus') }}</dt><dd>{{ result.corpus.source }} {{ result.corpus.fidelity }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="tpp-insight">
        <div v-if="insightOpen" class="tpp-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="tpp-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('tiebanPaipan.aiPanelTitle')">
            <header class="tpp-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('tiebanPaipan.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('tiebanPaipan.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('tiebanPaipan.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="tpp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="tpp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('tiebanPaipan.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="tpp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="tpp-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="tpp-insight-foot">
              <small>{{ $t('tiebanPaipan.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="tpp-insight-auth">
              <p>{{ $t('tiebanPaipan.aiLoginRequired') }}</p>
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
import type { TiebanPaipanResult } from '~~/app/types/tieban-paipan'

const props = defineProps<{ result: TiebanPaipanResult }>()
const route = useRoute()
const { t, locale } = useI18n()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const reportRoot = ref<HTMLElement | null>(null)
const selectedBand = ref(0)

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null

const insightFullLabel = computed(() => isLoggedIn.value
  ? t('tiebanPaipan.aiFullReport')
  : t('tiebanPaipan.aiFullReportLogin'))

const flowBands = [
  { label: '1-27', start: 1, end: 27 },
  { label: '28-54', start: 28, end: 54 },
  { label: '55-81', start: 55, end: 81 },
  { label: '82-108', start: 82, end: 108 },
]

const visibleFlowYears = computed(() => {
  const band = flowBands[selectedBand.value] || flowBands[0]!
  return props.result.flowYears.filter(year => year.age >= band.start && year.age <= band.end)
})

const TARGET_SELECTORS = [
  '.tpp-hero-grid > div',
  '.tpp-definition div',
  '.tpp-number-grid article',
  '.tpp-natal article',
  '.tpp-flow-card tbody tr',
  '.tpp-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const heading = node.querySelector<HTMLElement>('strong, b, dt')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.tpp-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 40)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.tpp-section-label h2')?.textContent ?? '')
  return {
    section: sectionTitle,
    group: '',
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.tppAiTarget) continue

    node.dataset.tppAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.tppAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('tiebanPaipan.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.tppAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...context,
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-tpp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.tppAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-tpp-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const result = props.result
  const flowLines = result.flowYears.map(item => `${item.age}:${item.ganzhi}/${item.sound}/${item.marker}/${item.letter}/${item.formula}`)
  return [
    `出生：${result.birth.solarText}；性别：${result.birth.genderText}；地点：${result.input.location}`,
    `真太阳时：${result.solarTime.trueSolarTimeText || '未校正'}；${result.solarTime.statusText}`,
    `四柱：${result.pillars.map(pillar => pillar.ganzhi).join(' ')}`,
    `农历：${result.birth.lunarText}；八刻：${result.birth.minuteQuarter.label}${result.birth.minuteQuarter.stem}`,
    `取数：先天${result.numbers.innate}；五音${result.numbers.sound}${result.numbers.soundValue}；日命${result.numbers.dayLife}；时运${result.numbers.timeFortune}`,
    `考刻：${result.numbers.kaokeGroup}；${result.numbers.kaokeQuarter}；本命数${result.numbers.lifeNumber}；卦${result.natal.hexagram}；后天${result.numbers.acquired}`,
    `本命：${result.natal.formulas.map(item => `${item.label}=${item.formula}:${item.verse.available ? item.verse.text : '缺条'}`).join('；')}`,
    `流年：${flowLines.join('；')}`,
    `语料：${result.corpus.status}；${result.corpus.availableCount}/${result.corpus.requestedCount}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('tiebanPaipan.aiFullReportTitle')
  await streamInsight({ mode: 'full', title: insightTitle.value })
}

function handleFullReport() {
  if (isLoggedIn.value) {
    void startFullReport()
    return
  }
  authRequired.value = true
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
    const response = await fetch('/api/tools/tieban-paipan/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({
        ...payload,
        chart: props.result,
        chartContext: compactContext(),
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
        const payloadText = line.slice(5).trim()
        if (!payloadText || payloadText === '[DONE]') continue

        try {
          const chunk = JSON.parse(payloadText)
          if (chunk.type === 'text' && chunk.text) {
            insightStatus.value = 'streaming'
            insightContent.value += chunk.text
          }
          else if (chunk.type === 'error') {
            throw new Error(chunk.message || t('tiebanPaipan.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('tiebanPaipan.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('tiebanPaipan.aiError')
  }
  finally {
    insightAbort = null
  }
}

function closeInsight() {
  insightAbort?.abort()
  insightAbort = null
  insightOpen.value = false
  insightStatus.value = 'connecting'
  insightContent.value = ''
}

watch(() => props.result, async () => {
  selectedBand.value = 0
  await nextTick()
  initializeTargets()
}, { immediate: true })

onMounted(() => {
  nextTick(initializeTargets)
})

onBeforeUnmount(() => {
  insightAbort?.abort()
})
</script>

<style scoped>
.tpp {
  display: grid;
  gap: 32px;
  color: var(--text-primary);
}

[data-tpp-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-tpp-ai-target]::after {
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

[data-tpp-ai-target]:hover,
[data-tpp-ai-target]:focus-visible {
  background-color: color-mix(in srgb, #d8e6d8 44%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-tpp-ai-target]:hover::after,
[data-tpp-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

.tpp-card {
  padding: 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.tpp-hero-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.tpp-hero-grid > div { min-width: 0; }

.tpp-hero-grid span,
.tpp-hero-grid small {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.tpp-hero-grid strong {
  display: block;
  margin: 7px 0;
  overflow-wrap: anywhere;
  font-size: 18px;
}

.tpp-section { display: grid; gap: 14px; }
.tpp-section-label h2 { font-size: 18px; }

.tpp-section-label p {
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 13px;
}

.tpp-definition {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px 20px;
  margin: 0;
}

.tpp-definition dt {
  color: var(--text-faint);
  font-size: 12px;
}

.tpp-definition dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  font-size: 14px;
}

.tpp-status {
  margin: 16px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.tpp-status.is-boundary { color: #92400e; }

.tpp-number-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.tpp-number-grid article {
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-card);
  text-align: center;
}

.tpp-number-grid span {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.tpp-number-grid b {
  display: block;
  margin-top: 8px;
  font-size: 24px;
  line-height: 1;
}

.tpp-card > strong {
  display: block;
  color: var(--text-muted);
  font-size: 13px;
}

.tpp-card > p {
  margin: 8px 0 0;
  font-variant-numeric: tabular-nums;
  font-size: 18px;
}

.tpp-natal {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tpp-natal article {
  padding: 15px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-card);
}

.tpp-natal header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tpp-natal strong { font-size: 14px; }

.tpp-natal code {
  color: var(--accent);
  font-size: 11px;
  white-space: nowrap;
}

.tpp-natal p {
  margin: 10px 0 0;
  line-height: 1.65;
}

.tpp-natal small {
  display: block;
  margin-top: 8px;
  color: var(--text-faint);
  font-size: 11px;
}

.tpp-band-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.tpp-band-tabs button {
  flex: 0 0 auto;
  padding: 7px 11px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 12px;
}

.tpp-band-tabs button.active {
  border-color: var(--accent-border-hover);
  background: var(--accent-bg);
  color: var(--accent);
}

.tpp-flow-card { overflow-x: auto; }

.tpp-flow-card table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.tpp-flow-card th,
.tpp-flow-card td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border-light);
  vertical-align: top;
  text-align: left;
  font-size: 13px;
}

.tpp-flow-card thead th,
.tpp-flow-card td:nth-child(1),
.tpp-flow-card td:nth-child(2) {
  color: var(--text-faint);
  white-space: nowrap;
}

.tpp-flow-card td span { display: block; }

.tpp-flow-card td small {
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.tpp-methodology dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin: 14px 0;
}

.tpp-methodology .tpp-wide { grid-column: 1 / -1; }
.tpp-methodology dt { color: var(--text-faint); font-size: 12px; }

.tpp-methodology dd {
  margin: 4px 0 0;
  font-size: 14px;
}

.tpp-methodology > p {
  margin: 0;
  color: var(--text-faint);
  font-size: 12px;
}

.tpp-insight-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--overlay-bg);
}

.tpp-insight {
  width: min(620px, 100%);
  max-height: min(80vh, 720px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-dropdown);
}

.tpp-insight-head,
.tpp-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.tpp-insight-head { border-bottom: 1px solid var(--border-light); }
.tpp-insight-foot { border-top: 1px solid var(--border-light); }

.tpp-insight-head p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--accent);
  font-size: 12px;
}

.tpp-insight-head h3 {
  margin: 4px 0 0;
  overflow: hidden;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tpp-insight-body {
  overflow: auto;
  padding: 16px;
}

.tpp-insight-content {
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.tpp-insight-status,
.tpp-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.tpp-insight-error { color: #b91c1c; }
.tpp-insight-foot small { color: var(--text-faint); font-size: 11px; }

.tpp-insight-foot button,
.tpp-insight-auth button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
}

.tpp-insight-auth {
  padding: 14px 16px;
  border-top: 1px solid var(--border-light);
  background: var(--surface-card);
}

.tpp-insight-auth p {
  margin: 0 0 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.tpp-insight-auth div { display: flex; gap: 8px; }
.tpp-insight-enter-active,
.tpp-insight-leave-active { transition: opacity 180ms ease; }
.tpp-insight-enter-from,
.tpp-insight-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .tpp-hero-grid,
  .tpp-definition,
  .tpp-methodology dl { grid-template-columns: 1fr; }
  .tpp-number-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .tpp-natal { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .tpp-number-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tpp-number-grid b { font-size: 22px; }
}
</style>
