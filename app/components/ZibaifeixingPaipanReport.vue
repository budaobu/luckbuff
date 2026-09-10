<template>
  <div
    ref="reportRoot"
    class="zbp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="zbp-card zbp-hero">
      <div class="zbp-hero-grid">
        <div>
          <span>{{ $t(reportKey('input')) }}</span>
          <strong>{{ result.input.date }}</strong>
          <small>{{ $t(reportKey('timeIndex'), { index: result.input.timeIndex }) }} · {{ result.solarTime.effectiveTimeRange }}</small>
        </div>
        <div>
          <span>{{ $t(reportKey('trueSolar')) }}</span>
          <strong>{{ result.solarTime.trueSolarTimeText || $t(reportKey('uncorrected')) }}</strong>
          <small>{{ result.solarTime.statusText }}</small>
        </div>
        <div>
          <span>{{ $t(reportKey('calendar')) }}</span>
          <strong>{{ result.calendar.lunarText }}</strong>
          <small>{{ result.calendar.yearGanZhi }} · {{ result.calendar.dayGanZhi }} · {{ result.calendar.hourGanZhi }}</small>
        </div>
        <div>
          <span>{{ $t(reportKey('centers')) }}</span>
          <strong>{{ result.layers.map(layer => layer.center.label).join(' / ') }}</strong>
          <small>{{ $t(reportKey('centersHint')) }}</small>
        </div>
        <div>
          <span>{{ $t(reportKey('cautionSectors')) }}</span>
          <strong>{{ cautionSignals.length }}</strong>
          <small>{{ cautionSignals.map(item => `${item.name}宫${item.direction}`).join('、') || $t(reportKey('none')) }}</small>
        </div>
        <div>
          <span>{{ $t(reportKey('favorableSectors')) }}</span>
          <strong>{{ favorableSignals.length }}</strong>
          <small>{{ favorableSignals.map(item => `${item.name}宫${item.direction}`).join('、') || $t(reportKey('none')) }}</small>
        </div>
      </div>
    </section>

    <section class="zbp-section">
      <header class="zbp-section-label">
        <h2>{{ $t(reportKey('layersTitle')) }}</h2>
        <p>{{ $t(reportKey('layersSubtitle')) }}</p>
      </header>
      <div class="zbp-layers">
        <article
          v-for="layer in result.layers"
          :key="layer.key"
          :class="{ 'is-caution': [2, 5].includes(layer.center.number) }"
        >
          <span>{{ layer.label }}</span>
          <strong>{{ layer.center.number }} {{ layer.center.label }}</strong>
          <em>{{ layer.center.xuanKongName }} · {{ layer.center.element }} · {{ layer.center.xuanKongLuck }}</em>
          <small>{{ layer.dateBasis }}</small>
        </article>
      </div>
    </section>

    <section class="zbp-section">
      <header class="zbp-section-label">
        <h2>{{ $t(reportKey('chartTitle')) }}</h2>
        <p>{{ $t(reportKey('chartSubtitle')) }}</p>
      </header>
      <div class="zbp-grid">
        <article
          v-for="palace in displayPalaces"
          :key="palace.palaceNumber"
          class="zbp-palace"
          :class="{ 'is-center': palace.palaceNumber === 5 }"
        >
          <header>
            <strong>{{ palace.name }}{{ $t(reportKey('palaceSuffix')) }}</strong>
            <span>{{ palace.direction }} · {{ palace.element }}</span>
          </header>
          <div class="zbp-star-lines">
            <div v-for="key in layerKeys" :key="`${palace.palaceNumber}-${key}`">
              <em>{{ $t(reportKey(key)) }}</em>
              <b>{{ palace[key].number }}</b>
              <small>{{ palace[key].xuanKongName }}<template v-if="[2, 5, 7, 3].includes(palace[key].number)"> · {{ palace[key].xuanKongLuck }}</template></small>
            </div>
          </div>
        </article>
      </div>
      <p class="zbp-legend">{{ $t(reportKey('chartLegend')) }}</p>
    </section>

    <section class="zbp-section">
      <header class="zbp-section-label">
        <h2>{{ $t(reportKey('signalsTitle')) }}</h2>
        <p>{{ $t(reportKey('signalsSubtitle')) }}</p>
      </header>
      <div class="zbp-signals">
        <article
          v-for="signal in result.sectorSignals"
          :key="signal.palaceNumber"
          :class="`is-${signal.priority}`"
        >
          <header>
            <strong>{{ signal.name }}{{ $t(reportKey('palaceSuffix')) }} · {{ signal.direction }}</strong>
            <em>{{ $t(reportKey(signal.priority)) }}</em>
          </header>
          <p v-if="signal.cautionLayers.length">
            {{ t(reportKey('cautionLayers'), { layers: layerNames(signal.cautionLayers).join(' / '), stars: signal.cautionStars.join('、') }) }}
          </p>
          <p v-if="signal.favorableLayers.length">
            {{ t(reportKey('favorableLayers'), { layers: layerNames(signal.favorableLayers).join(' / '), stars: signal.favorableStars.join('、') }) }}
          </p>
          <p v-if="!signal.cautionLayers.length && !signal.favorableLayers.length">{{ $t(reportKey('neutralSignal')) }}</p>
        </article>
      </div>
    </section>

    <section class="zbp-section">
      <header class="zbp-section-label">
        <h2>{{ $t(reportKey('starsTitle')) }}</h2>
        <p>{{ $t(reportKey('starsSubtitle')) }}</p>
      </header>
      <div class="zbp-stars">
        <article
          v-for="star in starCatalog"
          :key="star.number"
        >
          <header>
            <strong>{{ star.number }} {{ star.label }} {{ star.xuanKongName }}</strong>
            <em :class="star.xuanKongLuck === '吉' ? 'is-good' : 'is-risk'">{{ star.xuanKongLuck }}</em>
          </header>
          <dl>
            <div><dt>{{ $t(reportKey('starNature')) }}</dt><dd>{{ star.element }} · {{ star.homePalace }}（{{ star.homeDirection }}）</dd></div>
            <div><dt>{{ $t(reportKey('beiDou')) }}</dt><dd>{{ star.beiDouName }}</dd></div>
            <div><dt>{{ $t(reportKey('qiMen')) }}</dt><dd>{{ star.qiMenName }} · {{ star.qiMenLuck }}<template v-if="star.qiMenDoor"> · {{ star.qiMenDoor }}门</template></dd></div>
            <div><dt>{{ $t(reportKey('taiYi')) }}</dt><dd>{{ star.taiYiName }} · {{ star.taiYiType }}</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <section class="zbp-card zbp-methodology">
      <strong>{{ $t(reportKey('methodologyTitle')) }}</strong>
      <dl>
        <div><dt>{{ $t(reportKey('engine')) }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t(reportKey('yearRule')) }}</dt><dd>{{ result.methodology.yearRule }}</dd></div>
        <div><dt>{{ $t(reportKey('monthRule')) }}</dt><dd>{{ result.methodology.monthRule }}</dd></div>
        <div><dt>{{ $t(reportKey('dayRule')) }}</dt><dd>{{ result.methodology.dayRule }}</dd></div>
        <div><dt>{{ $t(reportKey('hourRule')) }}</dt><dd>{{ result.methodology.hourRule }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="zbp-insight">
        <div v-if="insightOpen" class="zbp-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="zbp-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t(reportKey('aiPanelTitle'))">
            <header class="zbp-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t(reportKey('aiPanelTitle')) }}
                </p>
                <h3>{{ insightTitle || $t(reportKey('aiPanelTitle')) }}</h3>
              </div>
              <button type="button" :aria-label="$t(reportKey('aiClose'))" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="zbp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="zbp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t(reportKey('aiConnecting')) }}
              </div>
              <div v-else-if="insightError" class="zbp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="zbp-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="zbp-insight-foot">
              <small>{{ $t(reportKey('aiDisclaimer')) }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="zbp-insight-auth">
              <p>{{ $t(reportKey('aiLoginRequired')) }}</p>
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
import type { NineStarDetail, ZibaifeixingPalace, ZibaifeixingResult } from '~~/server/utils/tools/zibaifeixing-paipan'

const props = defineProps<{ result: ZibaifeixingResult }>()
const route = useRoute()
const { t, locale } = useI18n()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const reportRoot = ref<HTMLElement | null>(null)
const layerKeys = ['year', 'month', 'day', 'hour'] as const

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null

function reportKey(key: string) {
  return `zibaifeixingPaipan.${key}`
}

const insightFullLabel = computed(() => isLoggedIn.value
  ? t(reportKey('aiFullReport'))
  : t(reportKey('aiFullReportLogin')))

const displayPalaces = computed(() => [4, 9, 2, 3, 5, 7, 8, 1, 6]
  .map(number => props.result.palaces.find(palace => palace.palaceNumber === number))
  .filter((palace): palace is ZibaifeixingPalace => !!palace))

const cautionSignals = computed(() => props.result.sectorSignals
  .filter(item => item.priority === 'high-caution' || item.priority === 'watch'))
const favorableSignals = computed(() => props.result.sectorSignals
  .filter(item => item.priority === 'favorable'))

const starCatalog = computed<NineStarDetail[]>(() => {
  const map = new Map<number, NineStarDetail>()
  for (const palace of props.result.palaces) {
    for (const key of layerKeys) {
      map.set(palace[key].number, palace[key])
    }
  }
  return [...map.values()].sort((a, b) => a.number - b.number)
})

function layerNames(keys: Array<typeof layerKeys[number]>) {
  return keys.map(key => t(reportKey(key)))
}

const TARGET_SELECTORS = [
  '.zbp-hero-grid > div',
  '.zbp-layers article',
  '.zbp-palace',
  '.zbp-signals article',
  '.zbp-stars article',
  '.zbp-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.classList.contains('zbp-palace')) {
    return normalizeText(node.querySelector('header strong')?.textContent ?? '')
  }
  if (node.closest('.zbp-layers')) {
    return normalizeText(node.querySelector('strong')?.textContent ?? '')
  }
  if (node.closest('.zbp-signals') || node.closest('.zbp-stars')) {
    return normalizeText(node.querySelector('strong')?.textContent ?? '')
  }
  const section = node.closest('section')
  const sectionTitle = normalizeText(section?.querySelector('.zbp-section-label h2')?.textContent ?? '')
  const heading = normalizeText(node.querySelector('strong')?.textContent ?? '')
  return [sectionTitle, heading].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest('section')
  const sectionTitle = normalizeText(section?.querySelector('.zbp-section-label h2')?.textContent ?? '')
  return {
    section: sectionTitle || t(reportKey('chartTitle')),
    group: node.closest('.zbp-layers')
      ? t(reportKey('layersTitle'))
      : node.closest('.zbp-stars')
        ? t(reportKey('starsTitle'))
        : '',
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.zbpAiTarget) continue

    node.dataset.zbpAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.zbpAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t(reportKey('aiAction'))}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.zbpAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...context,
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-zbp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.zbpAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-zbp-ai-target]')
  if (target) activateTarget(target)
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({
    mode: 'target',
    target,
    title: target.label,
  })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t(reportKey('aiFullReportTitle'))
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
    const response = await fetch('/api/tools/zibaifeixing-paipan/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({
        ...payload,
        chart: props.result,
        chartContext: compactZibaifeixingContext(props.result),
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
            throw new Error(chunk.message || t(reportKey('aiError')))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t(reportKey('aiNoResult')))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t(reportKey('aiError'))
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
.zbp {
  display: grid;
  gap: 32px;
}

[data-zbp-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-zbp-ai-target]::after {
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

[data-zbp-ai-target]:hover,
[data-zbp-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-zbp-ai-target]:hover::after,
[data-zbp-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

[data-zbp-ai-target]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.zbp-card {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-card);
  padding: 18px;
}

.zbp-hero-grid,
.zbp-layers,
.zbp-signals,
.zbp-stars {
  display: grid;
  gap: 10px;
}

.zbp-hero-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.zbp-hero-grid > div,
.zbp-layers article,
.zbp-signals article,
.zbp-stars article {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface-card) 86%, transparent);
}

.zbp-hero-grid span,
.zbp-layers span {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.zbp-hero-grid strong,
.zbp-layers strong {
  display: block;
  margin-top: 7px;
  font-size: 18px;
  line-height: 1.3;
}

.zbp-hero-grid small,
.zbp-layers small {
  display: block;
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.zbp-layers {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.zbp-layers em {
  display: block;
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 12px;
  font-style: normal;
}

.zbp-layers article.is-caution {
  border-color: color-mix(in srgb, #b45309 28%, var(--border-subtle));
  background: color-mix(in srgb, #b45309 6%, var(--surface-card));
}

.zbp-section {
  display: grid;
  grid-template-columns: minmax(170px, 230px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.zbp-section-label {
  position: sticky;
  top: 88px;
}

.zbp-section-label h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}

.zbp-section-label p {
  margin: 9px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.zbp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 620px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-card);
}

.zbp-palace {
  min-height: 148px;
  padding: 13px;
  border-right: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}

.zbp-palace:nth-child(3n) {
  border-right: 0;
}

.zbp-palace:nth-child(n+7) {
  border-bottom: 0;
}

.zbp-palace.is-center {
  background: color-mix(in srgb, var(--accent-bg) 46%, var(--surface-card));
}

.zbp-palace header strong {
  display: block;
  font-size: 15px;
}

.zbp-palace header span {
  display: block;
  margin-top: 3px;
  color: var(--text-faint);
  font-size: 11px;
}

.zbp-star-lines {
  display: grid;
  gap: 4px;
  margin-top: 11px;
}

.zbp-star-lines div {
  display: grid;
  grid-template-columns: 24px 22px minmax(0, 1fr);
  gap: 5px;
  align-items: center;
  min-width: 0;
}

.zbp-star-lines em {
  color: var(--text-faint);
  font-size: 11px;
  font-style: normal;
}

.zbp-star-lines b {
  color: var(--text-primary);
  font-size: 13px;
  text-align: center;
}

.zbp-star-lines small {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zbp-legend {
  margin: 11px 0 0;
  color: var(--text-faint);
  font-size: 12px;
}

.zbp-signals,
.zbp-stars {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.zbp-signals article.is-high-caution {
  border-color: color-mix(in srgb, #b45309 28%, var(--border-subtle));
  background: color-mix(in srgb, #b45309 6%, var(--surface-card));
}

.zbp-signals article.is-favorable {
  border-color: color-mix(in srgb, #15803d 24%, var(--border-subtle));
  background: color-mix(in srgb, #15803d 5%, var(--surface-card));
}

.zbp-signals header,
.zbp-stars header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.zbp-signals strong,
.zbp-stars strong {
  min-width: 0;
  font-size: 14px;
}

.zbp-signals em,
.zbp-stars em {
  flex: none;
  padding: 2px 7px;
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 11px;
  font-style: normal;
  background: var(--surface-card-hover);
}

.zbp-signals em.is-good,
.zbp-stars em.is-good {
  color: #15803d;
}

.zbp-signals em.is-risk,
.zbp-stars em.is-risk {
  color: #b45309;
}

.zbp-signals p,
.zbp-stars p {
  margin: 9px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.55;
}

.zbp-stars dl {
  display: grid;
  gap: 7px;
  margin: 10px 0 0;
}

.zbp-stars dl div {
  min-width: 0;
}

.zbp-stars dt {
  color: var(--text-faint);
  font-size: 11px;
}

.zbp-stars dd {
  margin: 2px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.zbp-methodology dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 14px 0;
}

.zbp-methodology dt {
  color: var(--text-faint);
  font-size: 12px;
}

.zbp-methodology dd {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.55;
}

.zbp-methodology p {
  margin: 0;
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.zbp-insight-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(0 0 0 / 42%);
}

.zbp-insight {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(720px, 100%);
  max-height: min(86vh, 720px);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-bg);
}

.zbp-insight-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-subtle);
}

.zbp-insight-head p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--accent);
  font-size: 12px;
}

.zbp-insight-head h3 {
  overflow: hidden;
  margin: 6px 0 0;
  font-size: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zbp-insight-head button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--surface-card);
  color: var(--text-muted);
}

.zbp-insight-body {
  min-height: 0;
  overflow: auto;
  padding: 18px;
}

.zbp-insight-status,
.zbp-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.zbp-insight-error {
  color: #b91c1c;
}

.zbp-insight-content {
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
}

.zbp-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 18px;
  border-top: 1px solid var(--border-subtle);
}

.zbp-insight-foot small {
  color: var(--text-faint);
  font-size: 11px;
}

.zbp-insight-foot button,
.zbp-insight-auth button {
  padding: 8px 13px;
  border: 1px solid var(--accent-border);
  border-radius: 6px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
}

.zbp-insight-auth {
  padding: 13px 18px;
  border-top: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--accent-bg) 48%, transparent);
}

.zbp-insight-auth p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.zbp-insight-auth div {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.zbp-insight-auth button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.zbp-insight-enter-active,
.zbp-insight-leave-active {
  transition: opacity 180ms ease;
}

.zbp-insight-enter-from,
.zbp-insight-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .zbp-hero-grid,
  .zbp-stars {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zbp-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .zbp-section-label {
    position: static;
  }

  .zbp-methodology dl {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .zbp-hero-grid,
  .zbp-layers,
  .zbp-signals,
  .zbp-stars {
    grid-template-columns: 1fr;
  }

  .zbp-layers article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 3px 12px;
    align-items: center;
  }

  .zbp-layers strong,
  .zbp-layers em {
    grid-column: 2;
    margin-top: 0;
  }

  .zbp-layers small {
    grid-column: 1 / -1;
  }
}
</style>
