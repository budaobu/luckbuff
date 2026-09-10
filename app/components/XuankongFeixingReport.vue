<template>
  <div
    ref="reportRoot"
    class="xkp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="xkp-card xkp-hero">
      <div class="xkp-hero-grid">
        <div>
          <span>{{ $t('xuankongFeixing.method') }}</span>
          <strong>{{ result.summary.method }}</strong>
          <small>{{ result.summary.methodNote }}</small>
        </div>
        <div>
          <span>{{ $t('xuankongFeixing.sittingFacing') }}</span>
          <strong>{{ result.orientation.label }}</strong>
          <small>{{ result.input.direction }}° · {{ result.orientation.facing.yuanName }}</small>
        </div>
        <div>
          <span>{{ $t('xuankongFeixing.period') }}</span>
          <strong>{{ result.summary.period.name }}</strong>
          <small>{{ result.summary.period.startYear }}–{{ result.summary.period.endYear }}</small>
        </div>
        <div>
          <span>{{ $t('xuankongFeixing.formation') }}</span>
          <strong>{{ result.summary.formation.name }}</strong>
          <small>{{ result.summary.formation.description }}</small>
        </div>
        <div>
          <span>{{ $t('xuankongFeixing.flowDate') }}</span>
          <strong>{{ result.input.inspectionDate }}</strong>
          <small>{{ $t('xuankongFeixing.lunarInput', { year: result.summary.lunarYear, month: result.summary.lunarMonth }) }}</small>
        </div>
        <div>
          <span>{{ $t('xuankongFeixing.combinations') }}</span>
          <strong>{{ result.combinations.length }}</strong>
          <small>{{ result.combinations.map(item => item.name).join('、') || $t('xuankongFeixing.noCombinations') }}</small>
        </div>
      </div>
    </section>

    <section class="xkp-section">
      <header class="xkp-section-label">
        <h2>{{ $t('xuankongFeixing.orientationTitle') }}</h2>
        <p>{{ $t('xuankongFeixing.orientationSubtitle') }}</p>
      </header>
      <div class="xkp-orientation">
        <article>
          <span>{{ $t('xuankongFeixing.facing') }}</span>
          <strong>{{ result.orientation.facingLabel }}</strong>
          <small>{{ result.input.direction }}° / {{ result.orientation.facing.startAngle }}°–{{ result.orientation.facing.endAngle }}°</small>
        </article>
        <article>
          <span>{{ $t('xuankongFeixing.sitting') }}</span>
          <strong>{{ result.orientation.sittingLabel }}</strong>
          <small>{{ result.orientation.sitting.yinYangName }}{{ result.orientation.sitting.yuanName }} · {{ result.orientation.sitting.direction }}</small>
        </article>
        <article>
          <span>{{ $t('xuankongFeixing.deviation') }}</span>
          <strong>{{ result.orientation.deviationFromCenter }}°</strong>
          <small>{{ $t('xuankongFeixing.deviationHint', { threshold: result.orientation.substitutionThreshold, distance: result.orientation.boundaryDistance }) }}</small>
        </article>
      </div>
      <div class="xkp-card xkp-mountains">
        <table>
          <thead>
            <tr>
              <th>{{ $t('xuankongFeixing.palace') }}</th>
              <th>{{ $t('xuankongFeixing.direction') }}</th>
              <th>{{ $t('xuankongFeixing.mountains') }}</th>
              <th>{{ $t('xuankongFeixing.centerAngle') }}</th>
              <th>{{ $t('xuankongFeixing.yuanDragon') }}</th>
              <th>{{ $t('xuankongFeixing.yinYang') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mountain in result.orientation.mountains" :key="mountain.name">
              <td>{{ mountain.palaceName }}</td>
              <td>{{ mountain.direction }}</td>
              <td>{{ mountain.name }}</td>
              <td>{{ mountain.centerAngle }}°</td>
              <td>{{ mountain.yuanName }}</td>
              <td>{{ mountain.yinYangName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="xkp-section">
      <header class="xkp-section-label">
        <h2>{{ $t('xuankongFeixing.chartTitle') }}</h2>
        <p>{{ $t('xuankongFeixing.chartSubtitle') }}</p>
      </header>
      <div class="xkp-grid">
        <article
          v-for="palace in displayPalaces"
          :key="palace.key"
          class="xkp-palace"
          :class="{ 'is-center': palace.isCenter, 'is-sitting': palace.isSitting, 'is-facing': palace.isFacing }"
        >
          <header>
            <strong>{{ palace.name }}{{ $t('xuankongFeixing.palaceSuffix') }}</strong>
            <span>{{ palace.direction }} · {{ palace.element }}</span>
          </header>
          <div class="xkp-star-lines">
            <div>
              <em>{{ $t('xuankongFeixing.periodStar') }}</em>
              <b>{{ palace.period }}</b>
              <small>{{ palace.periodStar.name }}<template v-if="palace.periodStar.status"> · {{ palace.periodStar.status }}</template></small>
            </div>
            <div>
              <em>{{ $t('xuankongFeixing.mountainStar') }}</em>
              <b>{{ palace.mountain }}</b>
              <small>{{ palace.mountainStar.name }}</small>
            </div>
            <div>
              <em>{{ $t('xuankongFeixing.waterStar') }}</em>
              <b>{{ palace.water }}</b>
              <small>{{ palace.waterStar.name }}</small>
            </div>
          </div>
          <footer>
            <span>{{ $t('xuankongFeixing.annualStar', { star: palace.annualStar }) }}</span>
            <span>{{ $t('xuankongFeixing.monthlyStar', { star: palace.monthlyStar }) }}</span>
            <span v-if="palace.isSitting">{{ $t('xuankongFeixing.sitting') }}</span>
            <span v-if="palace.isFacing">{{ $t('xuankongFeixing.facing') }}</span>
            <span v-if="palace.isCenter">{{ $t('xuankongFeixing.center') }}</span>
          </footer>
        </article>
      </div>
      <p class="xkp-legend">{{ $t('xuankongFeixing.chartLegend') }}</p>
    </section>

    <section class="xkp-section">
      <header class="xkp-section-label">
        <h2>{{ $t('xuankongFeixing.combinationTitle') }}</h2>
        <p>{{ $t('xuankongFeixing.combinationSubtitle', { count: result.combinations.length }) }}</p>
      </header>
      <div class="xkp-combinations">
        <article v-for="combination in result.combinations" :key="combination.name">
          <header>
            <strong>{{ combination.name }}</strong>
            <em :class="combination.kind === 'auspicious' ? 'is-good' : 'is-risk'">
              {{ combination.kind === 'auspicious' ? $t('xuankongFeixing.auspicious') : $t('xuankongFeixing.caution') }}
            </em>
          </header>
          <p>{{ combination.note }}</p>
          <small v-if="combination.palaceNames.length">{{ combination.palaceNames.join(' · ') }}</small>
        </article>
        <p v-if="!result.combinations.length" class="xkp-empty">{{ $t('xuankongFeixing.noCombinations') }}</p>
      </div>
    </section>

    <section class="xkp-card xkp-methodology">
      <strong>{{ $t('xuankongFeixing.methodologyTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('xuankongFeixing.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('xuankongFeixing.method') }}</dt><dd>{{ result.methodology.method }}</dd></div>
        <div><dt>{{ $t('xuankongFeixing.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('xuankongFeixing.substitutionTable') }}</dt><dd>{{ result.methodology.substitutionTable }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="xkp-insight">
        <div v-if="insightOpen" class="xkp-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="xkp-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('xuankongFeixing.aiPanelTitle')">
            <header class="xkp-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('xuankongFeixing.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('xuankongFeixing.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('xuankongFeixing.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="xkp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="xkp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('xuankongFeixing.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="xkp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="xkp-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="xkp-insight-foot">
              <small>{{ $t('xuankongFeixing.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="xkp-insight-auth">
              <p>{{ $t('xuankongFeixing.aiLoginRequired') }}</p>
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
import type { XuankongPalace, XuankongResult } from '~~/app/types/xuankong-feixing'

const props = defineProps<{ result: XuankongResult }>()
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
  ? t('xuankongFeixing.aiFullReport')
  : t('xuankongFeixing.aiFullReportLogin'))

const displayPalaces = computed(() => [0, 1, 2].flatMap(row =>
  [0, 1, 2].map((col) => {
    const palace = props.result.chart.palaces.find(item => item.displayRow === row && item.displayCol === col)
    return palace as XuankongPalace
  }).filter(Boolean),
))

const TARGET_SELECTORS = [
  '.xkp-hero-grid > div',
  '.xkp-palace',
  '.xkp-mountains tbody tr',
  '.xkp-combinations article',
  '.xkp-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.classList.contains('xkp-palace')) {
    return normalizeText(node.querySelector('header strong')?.textContent ?? '')
  }
  if (node.closest('.xkp-mountains')) {
    const cells = Array.from(node.querySelectorAll('td')).map(cell => normalizeText(cell.textContent ?? ''))
    return cells.filter(Boolean).join(' · ')
  }
  if (node.closest('.xkp-combinations')) {
    return normalizeText(node.querySelector('strong')?.textContent ?? '')
  }
  const heading = node.querySelector('strong')
  const section = node.closest('section')
  const sectionTitle = normalizeText(section?.querySelector('.xkp-section-label h2')?.textContent ?? '')
  return [sectionTitle, normalizeText(heading?.textContent ?? '')].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest('section')
  const sectionTitle = normalizeText(section?.querySelector('.xkp-section-label h2')?.textContent ?? '')
  return {
    section: sectionTitle || t('xuankongFeixing.chartTitle'),
    group: node.closest('.xkp-mountains') ? t('xuankongFeixing.orientationTitle') : '',
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.xkpAiTarget) continue

    node.dataset.xkpAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.xkpAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('xuankongFeixing.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.xkpAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...context,
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-xkp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.xkpAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-xkp-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const result = props.result
  const palaces = result.chart.palaces.map(palace =>
    `${palace.name}宫(${palace.direction}) 运${palace.period}/山${palace.mountain}/向${palace.water} 流年${palace.annualStar}/流月${palace.monthlyStar}`)

  return [
    `坐向：${result.orientation.label}；向首：${result.input.direction}°；方法：${result.summary.method}`,
    `元运：${result.summary.period.name}；建成/装修：${result.input.completionDate}`,
    `格局：${result.summary.formation.name}；${result.summary.formation.description}`,
    `特殊格局：${result.combinations.map(item => `${item.name}${item.palaceNames.length ? `@${item.palaceNames.join('/')}` : ''}`).join('、') || '未检出'}`,
    `流年流月：${result.input.inspectionDate}；年星${result.summary.annualCenter}入中，月星${result.summary.monthlyCenter}入中`,
    `九宫：${palaces.join('；')}`,
    `规则：${result.methodology.method}；${result.methodology.substitutionTable}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('xuankongFeixing.aiFullReportTitle')
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
    const response = await fetch('/api/tools/xuankong-feixing/interpret', {
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
            throw new Error(chunk.message || t('xuankongFeixing.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('xuankongFeixing.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('xuankongFeixing.aiError')
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
.xkp {
  display: grid;
  gap: 32px;
}

[data-xkp-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-xkp-ai-target]::after {
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

[data-xkp-ai-target]:hover,
[data-xkp-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-xkp-ai-target]:hover::after,
[data-xkp-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

[data-xkp-ai-target]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.xkp-card,
.xkp-palace,
.xkp-orientation article,
.xkp-combinations article {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-card);
}

.xkp-card {
  padding: 20px;
}

.xkp-hero-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.xkp-hero-grid > div {
  min-width: 0;
}

.xkp-hero-grid span,
.xkp-hero-grid small {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.xkp-hero-grid strong {
  display: block;
  margin: 7px 0;
  font-size: 18px;
}

.xkp-section {
  display: grid;
  gap: 14px;
}

.xkp-section-label h2 {
  font-size: 18px;
}

.xkp-section-label p {
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 13px;
}

.xkp-orientation {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.xkp-orientation article {
  padding: 16px;
}

.xkp-orientation span,
.xkp-orientation small {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.xkp-orientation strong {
  display: block;
  margin: 6px 0;
  font-size: 20px;
}

.xkp-mountains {
  overflow-x: auto;
}

.xkp-mountains table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.xkp-mountains th,
.xkp-mountains td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--border-subtle);
  text-align: left;
  white-space: nowrap;
}

.xkp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.xkp-palace {
  min-width: 0;
  padding: 12px;
  overflow: hidden;
}

.xkp-palace header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.xkp-palace header span {
  color: var(--text-faint);
  font-size: 11px;
  white-space: nowrap;
}

.xkp-palace.is-center {
  background: color-mix(in srgb, var(--accent-bg) 18%, var(--surface-card));
}

.xkp-palace.is-sitting,
.xkp-palace.is-facing {
  border-color: var(--accent-border);
}

.xkp-star-lines {
  margin-top: 12px;
  display: grid;
  gap: 7px;
}

.xkp-star-lines div {
  display: grid;
  grid-template-columns: 34px 26px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
}

.xkp-star-lines em {
  color: var(--text-faint);
  font-size: 11px;
  font-style: normal;
}

.xkp-star-lines b {
  min-width: 26px;
  font-size: 18px;
  line-height: 1;
  text-align: center;
}

.xkp-star-lines small {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: normal;
}

.xkp-palace footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.xkp-palace footer span {
  padding: 2px 6px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 10px;
}

.xkp-legend {
  color: var(--text-faint);
  font-size: 12px;
}

.xkp-combinations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.xkp-combinations article {
  padding: 16px;
}

.xkp-combinations header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.xkp-combinations em {
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-style: normal;
}

.xkp-combinations em.is-good {
  color: var(--success, #177245);
  background: color-mix(in srgb, var(--success, #177245) 10%, transparent);
}

.xkp-combinations em.is-risk {
  color: var(--error, #b3261e);
  background: color-mix(in srgb, var(--error, #b3261e) 9%, transparent);
}

.xkp-combinations p {
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.xkp-combinations small {
  display: block;
  margin-top: 9px;
  color: var(--text-faint);
  font-size: 11px;
}

.xkp-empty {
  color: var(--text-faint);
  font-size: 13px;
}

.xkp-methodology strong {
  display: block;
  margin-bottom: 14px;
  font-size: 15px;
}

.xkp-methodology dl {
  display: grid;
  gap: 12px;
}

.xkp-methodology dt {
  color: var(--text-faint);
  font-size: 12px;
}

.xkp-methodology dd {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 13px;
}

.xkp-methodology p {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-faint);
  font-size: 12px;
}

.xkp-insight-layer {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(0 0 0 / 42%);
}

.xkp-insight {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(720px, 100%);
  max-height: min(86vh, 760px);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-bg);
  box-shadow: 0 18px 60px rgb(0 0 0 / 18%);
}

.xkp-insight-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.xkp-insight-head p {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--accent);
  font-size: 12px;
}

.xkp-insight-head h3 {
  margin-top: 5px;
  overflow: hidden;
  font-size: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xkp-insight-head button,
.xkp-insight-foot button,
.xkp-insight-auth button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

.xkp-insight-head button {
  width: 30px;
  height: 30px;
}

.xkp-insight-body {
  min-height: 180px;
  overflow: auto;
  padding: 16px;
}

.xkp-insight-status,
.xkp-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.xkp-insight-error {
  color: var(--error, #b3261e);
}

.xkp-insight-content {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.xkp-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
}

.xkp-insight-foot small {
  color: var(--text-faint);
  font-size: 11px;
}

.xkp-insight-foot button {
  padding: 7px 11px;
  font-size: 12px;
  white-space: nowrap;
}

.xkp-insight-auth {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-subtle);
}

.xkp-insight-auth p {
  margin-bottom: 9px;
  color: var(--text-muted);
  font-size: 12px;
}

.xkp-insight-auth div {
  display: flex;
  gap: 8px;
}

.xkp-insight-auth button {
  padding: 7px 12px;
  font-size: 12px;
}

.xkp-insight-enter-active,
.xkp-insight-leave-active {
  transition: opacity 180ms ease;
}

.xkp-insight-enter-from,
.xkp-insight-leave-to {
  opacity: 0;
}

@media (max-width: 820px) {
  .xkp-hero-grid,
  .xkp-orientation {
    grid-template-columns: 1fr;
  }

  .xkp-grid {
    gap: 7px;
  }

  .xkp-palace {
    padding: 9px;
  }

  .xkp-palace header {
    display: grid;
    gap: 2px;
  }

  .xkp-star-lines b {
    font-size: 15px;
  }

  .xkp-star-lines div {
    gap: 4px;
    grid-template-columns: auto auto;
    grid-template-areas:
      'label number'
      'detail detail';
    align-items: center;
  }

  .xkp-star-lines em {
    grid-area: label;
  }

  .xkp-star-lines b {
    grid-area: number;
  }

  .xkp-star-lines small {
    grid-area: detail;
    line-height: 1.35;
  }

  .xkp-insight-layer {
    padding: 10px;
  }

  .xkp-insight-foot {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
