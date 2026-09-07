<template>
  <div
    ref="reportRoot"
    class="qmp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="qmp-card qmp-hero">
      <div class="qmp-hero-grid">
        <div>
          <span>{{ $t('qimenPaipan.engineTime') }}</span>
          <strong>{{ result.input.engineTime }}</strong>
          <small>
            {{ result.solarTime.trueSolarTime ? `${$t('qimenPaipan.trueSolarTime')} ${result.solarTime.trueSolarTime}` : result.solarTime.statusText }}
            · {{ result.input.location }}
          </small>
        </div>
        <div>
          <span>{{ $t('qimenPaipan.method') }}</span>
          <strong>{{ result.summary.method }}</strong>
          <small>{{ result.input.engineTimeBasis }}</small>
        </div>
        <div>
          <span>{{ $t('qimenPaipan.dunJu') }}</span>
          <strong>{{ result.summary.dunTypeText }}{{ result.summary.juNumber }}{{ $t('qimenPaipan.juSuffix') }}</strong>
          <small>{{ result.summary.yuan }} · {{ result.summary.solarTerm }}</small>
        </div>
        <div>
          <span>{{ $t('qimenPaipan.zhiFu') }}</span>
          <strong>{{ result.summary.zhiFu }}</strong>
          <small>{{ result.summary.zhiFuPalace }}{{ $t('qimenPaipan.palaceSuffix') }}</small>
        </div>
        <div>
          <span>{{ $t('qimenPaipan.zhiShi') }}</span>
          <strong>{{ result.summary.zhiShi }}</strong>
          <small>{{ result.summary.zhiShiPalace }}{{ $t('qimenPaipan.palaceSuffix') }}</small>
        </div>
        <div>
          <span>{{ $t('qimenPaipan.xunShou') }}</span>
          <strong>{{ result.summary.xunShou }}</strong>
          <small>{{ $t('qimenPaipan.hiddenYi') }} {{ result.summary.hiddenYi }}</small>
        </div>
      </div>
    </section>

    <section class="qmp-section">
      <header class="qmp-section-label">
        <h2>{{ $t('qimenPaipan.pillarTitle') }}</h2>
        <p>{{ $t('qimenPaipan.pillarSubtitle') }}</p>
      </header>
      <div class="qmp-card qmp-pillars">
        <table>
          <thead>
            <tr>
              <th />
              <th v-for="pillar in result.pillars" :key="pillar.label">
                {{ $t(`qimenPaipan.pillars.${pillar.label}`) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{{ $t('qimenPaipan.ganzhi') }}</th>
              <td v-for="pillar in result.pillars" :key="`gan-${pillar.label}`" class="qmp-ganzhi">
                {{ pillar.ganzhi }}
              </td>
            </tr>
            <tr>
              <th>{{ $t('qimenPaipan.xunKongDirection') }}</th>
              <td v-for="pillar in result.pillars" :key="`void-${pillar.label}`">
                {{ pillar.xunKongDirection.join('、') || '—' }}
              </td>
            </tr>
            <tr>
              <th>{{ $t('qimenPaipan.guXu') }}</th>
              <td v-for="pillar in result.pillars" :key="`gu-${pillar.label}`">
                {{ pillar.guXu.join(' / ') || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="qmp-section">
      <header class="qmp-section-label">
        <h2>{{ $t('qimenPaipan.chartTitle') }}</h2>
        <p>{{ $t('qimenPaipan.chartSubtitle') }}</p>
      </header>
      <div class="qmp-grid">
        <article
          v-for="palace in orderedPalaces"
          :key="palace.palace"
          class="qmp-palace"
          :class="{
            'is-zhifu': palace.name === result.summary.zhiFuPalace,
            'is-zhishi': palace.name === result.summary.zhiShiPalace,
            'is-center': palace.isCenter,
            'is-void': palace.isVoid,
          }"
        >
          <header>
            <strong>{{ palace.name }}{{ $t('qimenPaipan.palaceSuffix') }}</strong>
            <span>{{ palace.direction }} · {{ palace.element }}</span>
          </header>
          <div class="qmp-stems">
            <b>{{ palace.skyStem || '—' }}</b>
            <i>{{ palace.earthStem }}</i>
          </div>
          <p class="qmp-star-door">
            <span>{{ palace.star }}</span>
            <span>{{ palace.door || '—' }}</span>
          </p>
          <p class="qmp-god">{{ palace.god || '—' }}</p>
          <footer>
            <span v-if="palace.name === result.summary.zhiFuPalace">{{ $t('qimenPaipan.zhiFu') }}</span>
            <span v-if="palace.name === result.summary.zhiShiPalace">{{ $t('qimenPaipan.zhiShi') }}</span>
            <span v-if="palace.isVoid">{{ $t('qimenPaipan.void') }}</span>
            <span v-if="palace.earthDoor && palace.earthDoor !== palace.door">{{ palace.earthDoor }}</span>
            <span v-if="palace.originalStar && palace.originalStar !== palace.star">{{ palace.originalStar }}</span>
          </footer>
          <small v-if="palace.hostsCenter || palace.isCenter" class="qmp-host">
            {{ palace.isCenter ? $t('qimenPaipan.center') : result.chart.centerHosting }}
          </small>
        </article>
      </div>
      <p class="qmp-legend">{{ $t('qimenPaipan.chartLegend') }}</p>
    </section>

    <section class="qmp-section">
      <header class="qmp-section-label">
        <h2>{{ $t('qimenPaipan.signalTitle') }}</h2>
        <p>{{ $t('qimenPaipan.signalSubtitle') }}</p>
      </header>
      <div class="qmp-signals">
        <article v-for="signal in signalGroups" :key="signal.key">
          <strong>{{ $t(`qimenPaipan.pillars.${signal.key}`) }}</strong>
          <dl>
            <div>
              <dt>{{ $t('qimenPaipan.xunKongDirection') }}</dt>
              <dd>{{ signal.xunKongDirection.join('、') || '—' }}</dd>
            </div>
            <div>
              <dt>{{ $t('qimenPaipan.guXu') }}</dt>
              <dd>{{ signal.guXu.join(' / ') || '—' }}</dd>
            </div>
            <div>
              <dt>{{ $t('qimenPaipan.voidPalace') }}</dt>
              <dd>{{ formattedVoidPalaces }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <section class="qmp-section">
      <header class="qmp-section-label">
        <h2>{{ $t('qimenPaipan.patternTitle') }}</h2>
        <p>{{ $t('qimenPaipan.patternSubtitle', { count: result.patterns.length }) }}</p>
      </header>
      <div class="qmp-patterns">
        <article v-for="(pattern, index) in result.patterns" :key="`${pattern.name}-${pattern.palace}-${index}`">
          <header>
            <strong>{{ pattern.name }}</strong>
            <em :class="pattern.auspiciousness.includes('吉') ? 'is-good' : pattern.auspiciousness.includes('凶') ? 'is-risk' : 'is-neutral'">
              {{ pattern.auspiciousness }}
            </em>
            <span>{{ pattern.category }}<template v-if="pattern.palace"> · {{ pattern.palace }}</template></span>
          </header>
          <p>{{ pattern.detail }}</p>
          <small v-if="pattern.sources.length">
            {{ pattern.sources.map(source => `《${source.book}》${source.section}`).join(' / ') }}
          </small>
        </article>
      </div>
    </section>

    <section class="qmp-card qmp-methodology">
      <strong>{{ $t('qimenPaipan.methodologyTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('qimenPaipan.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('qimenPaipan.method') }}</dt><dd>{{ result.methodology.method }}</dd></div>
        <div><dt>{{ $t('qimenPaipan.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('qimenPaipan.timeBasis') }}</dt><dd>{{ result.methodology.timeBasis }}</dd></div>
        <div><dt>{{ $t('qimenPaipan.trueSolarTime') }}</dt><dd>{{ result.solarTime.statusText }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="qmp-insight">
        <div v-if="insightOpen" class="qmp-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="qmp-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('qimenPaipan.aiPanelTitle')">
            <header class="qmp-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('qimenPaipan.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('qimenPaipan.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('qimenPaipan.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="qmp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="qmp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('qimenPaipan.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="qmp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="qmp-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="qmp-insight-foot">
              <small>{{ $t('qimenPaipan.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="qmp-insight-auth">
              <p>{{ $t('qimenPaipan.aiLoginRequired') }}</p>
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
import type { QimenPaipanResult } from '~~/app/types/qimen-paipan'

const props = defineProps<{ result: QimenPaipanResult }>()
const route = useRoute()
const { t, locale } = useI18n()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const reportRoot = ref<HTMLElement | null>(null)

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null

const insightFullLabel = computed(() => isLoggedIn.value
  ? t('qimenPaipan.aiFullReport')
  : t('qimenPaipan.aiFullReportLogin'))

const orderedPalaces = computed(() => [4, 9, 2, 3, 5, 7, 8, 1, 6]
  .map(number => props.result.chart.palaces.find(palace => palace.palace === number))
  .filter(palace => !!palace))

const signalGroups = computed(() => (['year', 'month', 'day', 'hour'] as const).map((key) => {
  const pillar = props.result.pillars.find(item => item.label === key)
  return {
    key,
    xunKongDirection: pillar?.xunKongDirection || [],
    guXu: pillar?.guXu || [],
  }
}))

const formattedVoidPalaces = computed(() => props.result.chart.timeXunKongPalaces
  .map((number) => {
    const palace = props.result.chart.palaces.find(item => item.palace === number)
    return palace ? `${palace.name}${t('qimenPaipan.palaceSuffix')}` : String(number)
  })
  .join('、'))

const TARGET_SELECTORS = [
  '.qmp-hero-grid > div',
  '.qmp-pillars td',
  '.qmp-palace',
  '.qmp-signals article',
  '.qmp-patterns article',
  '.qmp-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const row = node.closest<HTMLElement>('tr')
  if (node.tagName === 'TD' && row) {
    const rowLabel = normalizeText(row.querySelector<HTMLElement>(':scope > th')?.textContent ?? '')
    const value = normalizeText(node.textContent ?? '')
    return [rowLabel, value].filter(Boolean).join(' · ')
  }

  const heading = node.querySelector<HTMLElement>('strong, dt, b')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.qmp-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.qmp-section-label h2')?.textContent ?? '')
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
    if (node.closest('button') || node.dataset.qmpAiTarget) continue

    node.dataset.qmpAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.qmpAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('qimenPaipan.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.qmpAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...context,
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-qmp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.qmpAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-qmp-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const result = props.result
  const palaces = result.chart.palaces.map(palace => [
    `${palace.name}宫(${palace.direction})`,
    `天${palace.skyStem}/地${palace.earthStem}`,
    palace.star,
    palace.door || '无门',
    palace.god || '无神',
    palace.isVoid ? '空' : '',
    palace.hostsCenter ? '寄宫' : '',
  ].filter(Boolean).join(' '))

  return [
    `起局：${result.input.engineTime}；时区：${result.input.requestedTimezone}；地点：${result.input.location}`,
    `局：${result.summary.dunTypeText}${result.summary.juNumber}局 · ${result.summary.yuan} · ${result.summary.solarTerm} · ${result.summary.method}`,
    `四柱：${result.pillars.map(pillar => pillar.ganzhi).join(' ')}`,
    `旬首：${result.summary.xunShou}（遁${result.summary.hiddenYi}）；旬空：${result.chart.timeXunKong.join('、')}`,
    `值符：${result.summary.zhiFu}@${result.summary.zhiFuPalace}；值使：${result.summary.zhiShi}@${result.summary.zhiShiPalace}`,
    `九宫：${palaces.join('；')}`,
    `格局/十干克应：${result.patterns.map(pattern => `${pattern.name}${pattern.palace ? `@${pattern.palace}` : ''}(${pattern.auspiciousness})`).join('、') || '未检出'}`,
    `规则：${result.methodology.method}；${result.methodology.calendar}；${result.methodology.timeBasis}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('qimenPaipan.aiFullReportTitle')
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
    const response = await fetch('/api/tools/qimen-paipan/interpret', {
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
            throw new Error(chunk.message || t('qimenPaipan.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('qimenPaipan.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('qimenPaipan.aiError')
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
.qmp {
  display: grid;
  gap: 34px;
}

[data-qmp-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-qmp-ai-target]::after {
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

[data-qmp-ai-target]:hover,
[data-qmp-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-qmp-ai-target]:hover::after,
[data-qmp-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

[data-qmp-ai-target]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.qmp-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 20px;
}

.qmp-hero-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.qmp-hero-grid > div {
  min-width: 0;
}

.qmp-hero-grid span,
.qmp-hero-grid small {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.qmp-hero-grid strong {
  display: block;
  margin: 7px 0;
  font-size: 18px;
}

.qmp-section {
  display: grid;
  gap: 14px;
}

.qmp-section-label h2 {
  font-size: 18px;
}

.qmp-section-label p {
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 13px;
}

.qmp-pillars {
  overflow-x: auto;
}

.qmp-pillars table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

.qmp-pillars th,
.qmp-pillars td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-body);
  font-size: 14px;
  text-align: center;
}

.qmp-pillars thead th,
.qmp-pillars tbody th {
  color: var(--text-faint);
  font-size: 12px;
  font-weight: 600;
}

.qmp-ganzhi {
  font-size: 18px;
  font-weight: 700;
}

.qmp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.qmp-palace {
  min-height: 178px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.qmp-palace.is-zhifu {
  border-color: color-mix(in srgb, var(--accent) 48%, var(--border-subtle));
}

.qmp-palace.is-zhishi {
  border-color: color-mix(in srgb, var(--accent-purple) 48%, var(--border-subtle));
}

.qmp-palace.is-void {
  background: color-mix(in srgb, var(--accent-bg) 22%, var(--surface-card));
}

.qmp-palace header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.qmp-palace header strong {
  color: var(--text-primary);
  font-size: 14px;
}

.qmp-stems {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
}

.qmp-stems b {
  font-size: 30px;
}

.qmp-stems i {
  color: var(--text-muted);
  font-size: 18px;
  font-style: normal;
}

.qmp-star-door,
.qmp-god {
  margin: 0;
  color: var(--text-body);
  font-size: 13px;
  text-align: center;
}

.qmp-star-door {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.qmp-palace footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 10px;
}

.qmp-palace footer span {
  padding: 2px 6px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 10px;
}

.qmp-host {
  display: block;
  margin-top: 6px;
  color: var(--accent-muted);
  font-size: 11px;
  text-align: center;
}

.qmp-legend {
  color: var(--text-faint);
  font-size: 12px;
}

.qmp-signals,
.qmp-patterns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.qmp-signals article,
.qmp-patterns article {
  padding: 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.qmp-signals strong {
  display: block;
  margin-bottom: 10px;
}

.qmp-signals dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.qmp-signals dt {
  color: var(--text-faint);
  font-size: 12px;
}

.qmp-signals dd {
  margin: 2px 0 0;
  color: var(--text-body);
  font-size: 14px;
}

.qmp-patterns header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qmp-patterns em {
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-style: normal;
}

.qmp-patterns .is-good {
  background: color-mix(in srgb, #22c55e 16%, transparent);
  color: #15803d;
}

.qmp-patterns .is-risk {
  background: color-mix(in srgb, #ef4444 14%, transparent);
  color: #b91c1c;
}

.qmp-patterns .is-neutral {
  background: var(--accent-bg);
  color: var(--accent);
}

.qmp-patterns p {
  margin: 10px 0 8px;
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.6;
}

.qmp-patterns small {
  display: block;
  color: var(--text-faint);
  font-size: 11px;
}

.qmp-methodology dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin: 14px 0;
}

.qmp-methodology dt {
  color: var(--text-faint);
  font-size: 12px;
}

.qmp-methodology dd {
  margin: 4px 0 0;
  color: var(--text-body);
  font-size: 14px;
}

.qmp-methodology > p {
  margin: 0;
  color: var(--text-faint);
  font-size: 12px;
}

.qmp-insight-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--overlay-bg);
}

.qmp-insight {
  width: min(620px, 100%);
  max-height: min(80vh, 720px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-dropdown);
}

.qmp-insight-head,
.qmp-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.qmp-insight-head {
  border-bottom: 1px solid var(--border-light);
}

.qmp-insight-foot {
  border-top: 1px solid var(--border-light);
}

.qmp-insight-head p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--accent);
  font-size: 12px;
}

.qmp-insight-head h3 {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qmp-insight-body {
  overflow: auto;
  padding: 16px;
}

.qmp-insight-content {
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.qmp-insight-status,
.qmp-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.qmp-insight-error {
  color: #b91c1c;
}

.qmp-insight-foot small {
  color: var(--text-faint);
  font-size: 11px;
}

.qmp-insight-foot button,
.qmp-insight-auth button {
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

.qmp-insight-auth {
  padding: 14px 16px;
  border-top: 1px solid var(--border-light);
  background: var(--surface-card);
}

.qmp-insight-auth p {
  margin: 0 0 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.qmp-insight-auth div {
  display: flex;
  gap: 8px;
}

.qmp-insight-enter-active,
.qmp-insight-leave-active {
  transition: opacity 180ms ease;
}

.qmp-insight-enter-from,
.qmp-insight-leave-to {
  opacity: 0;
}

@media (max-width: 820px) {
  .qmp-hero-grid,
  .qmp-methodology dl {
    grid-template-columns: 1fr;
  }

  .qmp-grid {
    gap: 8px;
  }

  .qmp-palace {
    min-height: 154px;
    padding: 10px;
  }

  .qmp-stems {
    margin: 10px 0;
  }

  .qmp-stems b {
    font-size: 24px;
  }

  .qmp-stems i {
    font-size: 15px;
  }

  .qmp-star-door,
  .qmp-god {
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .qmp-signals,
  .qmp-patterns {
    grid-template-columns: 1fr;
  }

  .qmp-palace footer {
    display: none;
  }

  .qmp-host {
    display: none;
  }
}
</style>
