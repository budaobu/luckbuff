<template>
  <div
    ref="reportRoot"
    class="wnr"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="wnr-card wnr-hero">
      <dl class="wnr-birth-grid">
        <div>
          <dt>{{ $t('natalAstro.birthTime') }}</dt>
          <dd>{{ result.birth.localText }}</dd>
          <small>{{ result.birth.weekday }} · {{ result.birth.utcText }}</small>
        </div>
        <div>
          <dt>{{ $t('natalAstro.birthPlace') }}</dt>
          <dd>{{ result.birth.locationName }}</dd>
          <small>{{ result.birth.coordinates }} · {{ result.birth.timezone }}</small>
        </div>
        <div>
          <dt>{{ $t('natalAstro.axes') }}</dt>
          <dd>{{ result.angles.ascendant }}</dd>
          <small>MC {{ result.angles.midheaven }}</small>
        </div>
        <div>
          <dt>{{ $t('natalAstro.timeBasis') }}</dt>
          <dd>{{ result.birth.timeBasis }}</dd>
          <small>{{ result.birth.genderText }} · {{ result.birth.timezoneOffsetText }}</small>
        </div>
      </dl>
    </section>

    <section class="wnr-section">
      <header class="wnr-section-label">
        <h2>{{ $t('natalAstro.pointsTitle') }}</h2>
        <p>{{ $t('natalAstro.pointsSubtitle') }}</p>
      </header>
      <div class="wnr-card wnr-table-wrap">
        <table class="wnr-point-table">
          <thead>
            <tr>
              <th>{{ $t('natalAstro.colBody') }}</th>
              <th>{{ $t('natalAstro.colPosition') }}</th>
              <th>{{ $t('natalAstro.colHouse') }}</th>
              <th>{{ $t('natalAstro.colState') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="point in result.points" :key="point.key">
              <td>
                <b>{{ point.nameZh }}</b>
                <small>{{ point.categoryZh }}</small>
              </td>
              <td>{{ point.degreeText }}</td>
              <td>{{ point.house }}</td>
              <td>
                <span v-if="point.isRetrograde" class="wnr-tag is-retro">R</span>
                <span v-if="point.dignityZh" class="wnr-tag">{{ point.dignityZh }}</span>
                <span v-if="point.calculation" class="wnr-tag">{{ point.calculation }}</span>
                <span v-if="point.formula" class="wnr-formula">{{ point.formula }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="wnr-section">
      <header class="wnr-section-label">
        <h2>{{ $t('natalAstro.housesTitle') }}</h2>
        <p>{{ $t('natalAstro.housesSubtitle') }}</p>
      </header>
      <div class="wnr-house-grid">
        <article v-for="cusp in result.houseCusps" :key="cusp.house" class="wnr-card wnr-house">
          <header>
            <span>{{ cusp.house }}</span>
            <strong>{{ cusp.degreeText }}</strong>
          </header>
          <footer>{{ cusp.sign }} · {{ cusp.size }}°</footer>
        </article>
      </div>
    </section>

    <section class="wnr-section">
      <header class="wnr-section-label">
        <h2>{{ $t('natalAstro.aspectsTitle') }}</h2>
        <p>{{ $t('natalAstro.aspectsSubtitle') }}</p>
      </header>
      <div class="wnr-aspect-layout">
        <div class="wnr-aspect-grid">
          <article v-for="(aspect, index) in result.aspects" :key="`${aspect.body1}-${aspect.body2}-${aspect.type}-${index}`" class="wnr-card wnr-aspect">
            <header>
              <strong>{{ aspect.body1Zh }} {{ aspect.symbol }} {{ aspect.body2Zh }}</strong>
              <span>{{ aspect.typeZh }}</span>
            </header>
            <footer>
              <small>{{ aspect.orb }}° · {{ aspect.strength }}%</small>
              <small>{{ aspect.isApplying === true ? $t('natalAstro.applying') : aspect.isApplying === false ? $t('natalAstro.separating') : '—' }}</small>
            </footer>
          </article>
        </div>
        <div class="wnr-side-stack">
          <div class="wnr-card wnr-list">
            <h3>{{ $t('natalAstro.patterns') }}</h3>
            <article v-for="(pattern, index) in result.patterns" :key="`${pattern}-${index}`">
              <strong>{{ pattern }}</strong>
            </article>
            <p v-if="!result.patterns.length">—</p>
          </div>
          <div class="wnr-card wnr-list">
            <h3>{{ $t('natalAstro.balance') }}</h3>
            <article v-for="element in result.summary.elements" :key="element.key">
              <strong>{{ element.label }}</strong>
              <small>{{ element.points.join(' · ') || '—' }}</small>
            </article>
            <article v-for="modality in result.summary.modalities" :key="modality.key">
              <strong>{{ modality.label }}</strong>
              <small>{{ modality.points.join(' · ') || '—' }}</small>
            </article>
            <article>
              <strong>{{ $t('natalAstro.polarity') }}</strong>
              <small>{{ result.summary.polarity.positive }} / {{ result.summary.polarity.negative }}</small>
            </article>
          </div>
          <div class="wnr-card wnr-list">
            <h3>{{ $t('natalAstro.dignities') }}</h3>
            <article v-for="dignity in result.summary.dignities" :key="dignity.key">
              <strong>{{ dignity.label }}</strong>
              <small>{{ dignity.points.join(' · ') || '—' }}</small>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="wnr-card wnr-methodology">
      <strong>{{ $t('natalAstro.methodology') }}</strong>
      <dl>
        <div><dt>{{ $t('natalAstro.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('natalAstro.zodiac') }}</dt><dd>{{ result.methodology.zodiac }}</dd></div>
        <div><dt>{{ $t('natalAstro.houseSystem') }}</dt><dd>{{ result.methodology.houseSystem }}</dd></div>
        <div><dt>{{ $t('natalAstro.timezoneRule') }}</dt><dd>{{ result.methodology.timezone }}</dd></div>
        <div><dt>{{ $t('natalAstro.trueSolar') }}</dt><dd>{{ result.methodology.trueSolarTime }}</dd></div>
        <div><dt>{{ $t('natalAstro.disclaimer') }}</dt><dd>{{ result.methodology.disclaimer }}</dd></div>
      </dl>
    </section>

    <Teleport to="body">
      <Transition name="wnr-insight">
        <div v-if="insightOpen" class="wnr-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="wnr-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('baziChart.aiPanelTitle')">
            <header class="wnr-insight-head">
              <div class="min-w-0">
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />{{ $t('baziChart.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('baziChart.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('baziChart.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="wnr-insight-body">
              <div v-if="insightStatus === 'connecting'" class="wnr-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />{{ $t('baziChart.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="wnr-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" /><span>{{ insightError }}</span>
              </div>
              <div v-else class="wnr-insight-content">{{ insightContent }}</div>
            </div>
            <footer class="wnr-insight-foot">
              <small>{{ $t('baziChart.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="wnr-insight-auth">
              <p>{{ $t('baziChart.aiLoginRequired') }}</p>
              <div>
                <button type="button" @click="signInWithGoogle(route.fullPath)">
                  <UIcon name="i-simple-icons-google" class="h-4 w-4" />Google
                </button>
                <button type="button" @click="signInWithTelegram(route.fullPath)">
                  <UIcon name="i-simple-icons-telegram" class="h-4 w-4" />Telegram
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
import type { NatalAstroResult } from '~~/app/types/natal-astro'

const props = defineProps<{ result: NatalAstroResult }>()
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
  ? t('baziChart.aiFullReport')
  : t('baziChart.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.wnr-birth-grid > div',
  '.wnr-point-table tbody tr',
  '.wnr-house',
  '.wnr-aspect',
  '.wnr-list article',
  '.wnr-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.tagName === 'TR') {
    return normalizeText(node.querySelector<HTMLElement>('td:first-child')?.textContent ?? '')
  }
  const heading = node.querySelector<HTMLElement>('strong, h3, b')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.wnr-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.wnr-section-label h2')?.textContent ?? '')
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
    if (node.closest('button') || node.dataset.wnrAiTarget) continue
    node.dataset.wnrAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.wnrAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('baziChart.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.wnrAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({ selector: node.className || node.tagName.toLowerCase(), label, ...context })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-wnr-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.wnrAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-wnr-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const r = props.result
  return [
    `出生：${r.birth.localText}；UTC：${r.birth.utcText}；地点：${r.birth.locationName}；时区：${r.birth.timezone}`,
    `四轴：ASC ${r.angles.ascendant}；MC ${r.angles.midheaven}；DSC ${r.angles.descendant}；IC ${r.angles.imumCoeli}`,
    `星体：${r.points.map(item => `${item.nameZh}@${item.degreeText}/H${item.house}${item.isRetrograde ? '(R)' : ''}${item.dignityZh ? `(${item.dignityZh})` : ''}`).join('；')}`,
    `宫头：${r.houseCusps.map(item => `H${item.house} ${item.degreeText}`).join('；')}`,
    `相位：${r.aspects.map(item => `${item.body1Zh}${item.symbol}${item.body2Zh}(${item.typeZh},orb ${item.orb}°,${item.strength}%)`).join('；')}`,
    `格局：${r.patterns.join('、') || '未检出'}`,
    `元素：${r.summary.elements.map(item => `${item.label}=${item.points.join('/')}`).join('；')}`,
    `模式：${r.summary.modalities.map(item => `${item.label}=${item.points.join('/')}`).join('；')}`,
    `尊贵：${r.summary.dignities.map(item => `${item.label}=${item.points.join('/')}`).join('；')}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('baziChart.aiFullReportTitle')
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
    const response = await fetch('/api/tools/natal-astro/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({ ...payload, chart: props.result, chartContext: compactContext(), locale: locale.value }),
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
            throw new Error(chunk.message || t('baziChart.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('baziChart.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('baziChart.aiError')
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
.wnr {
  display: grid;
  gap: 34px;
}

[data-wnr-ai-target] {
  position: relative;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-wnr-ai-target]::after {
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

[data-wnr-ai-target]:hover,
[data-wnr-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-wnr-ai-target]:hover::after,
[data-wnr-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

[data-wnr-ai-target]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.wnr-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 20px;
}

.wnr-birth-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
}

.wnr-birth-grid > div {
  min-width: 0;
  padding: 0 20px;
}

.wnr-birth-grid > div:first-child { padding-left: 0; }
.wnr-birth-grid dt { color: var(--text-faint); font-size: 12px; }
.wnr-birth-grid dd { margin: 8px 0 0; font-size: 20px; font-weight: 700; }
.wnr-birth-grid small { display: block; margin-top: 7px; color: var(--text-muted); font-size: 12px; line-height: 1.5; }

.wnr-section {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.wnr-section-label { position: sticky; top: 92px; }
.wnr-section-label h2 { margin: 0; font-size: 32px; font-weight: 800; line-height: 1.2; }
.wnr-section-label p { margin: 10px 0 0; color: var(--text-muted); font-size: 13px; line-height: 1.7; }

.wnr-table-wrap { overflow-x: auto; }
.wnr-point-table { width: 100%; min-width: 720px; border-collapse: collapse; }
.wnr-point-table th,
.wnr-point-table td { padding: 11px 10px; border-bottom: 1px solid var(--border-subtle); text-align: left; font-size: 13px; }
.wnr-point-table thead th { color: var(--text-faint); font-weight: 600; }
.wnr-point-table tbody tr:last-child td { border-bottom: 0; }
.wnr-point-table b { display: block; }
.wnr-point-table small { display: block; margin-top: 3px; color: var(--text-faint); font-size: 11px; }
.wnr-point-table td:last-child { min-width: 180px; }

.wnr-tag {
  display: inline-flex;
  margin-right: 5px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--surface-input);
  color: var(--text-muted);
  font-size: 11px;
}

.wnr-tag.is-retro { color: var(--accent); background: var(--accent-bg); }
.wnr-formula { display: block; margin-top: 4px; color: var(--text-faint); font-size: 11px; }

.wnr-house-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.wnr-house header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.wnr-house header span { color: var(--text-faint); font-size: 12px; }
.wnr-house header strong { font-size: 15px; }
.wnr-house footer { margin-top: 6px; color: var(--text-muted); font-size: 12px; }

.wnr-aspect-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 14px;
  align-items: start;
}

.wnr-aspect-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.wnr-aspect { padding: 14px; }
.wnr-aspect header { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.wnr-aspect header span { color: var(--text-faint); font-size: 12px; white-space: nowrap; }
.wnr-aspect header strong { min-width: 0; overflow-wrap: anywhere; }
.wnr-aspect footer { display: flex; justify-content: space-between; gap: 8px; margin-top: 7px; }
.wnr-aspect footer small { color: var(--text-muted); font-size: 11px; }

.wnr-side-stack { display: grid; gap: 10px; }
.wnr-list h3 { margin: 0 0 10px; font-size: 15px; }
.wnr-list article { padding: 8px 0; border-top: 1px dashed var(--border-subtle); }
.wnr-list article:first-of-type { border-top: 0; }
.wnr-list strong { display: block; font-size: 13px; }
.wnr-list small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 12px; line-height: 1.45; }
.wnr-list p { margin: 0; color: var(--text-faint); }

.wnr-methodology strong { display: inline-flex; padding: 4px 10px; border-radius: 999px; background: var(--accent-bg); color: var(--accent); font-size: 12px; }
.wnr-methodology dl { margin: 14px 0 0; }
.wnr-methodology > dl > div { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 12px; padding: 6px 0; }
.wnr-methodology dt { color: var(--text-faint); font-size: 12px; }
.wnr-methodology dd { margin: 0; color: var(--text-body); font-size: 13px; line-height: 1.6; }

.wnr-insight-layer {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: end center;
  padding: 20px;
  background: rgb(0 0 0 / 44%);
}

.wnr-insight {
  width: min(720px, 100%);
  max-height: min(78vh, 720px);
  overflow: auto;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-card);
}

.wnr-insight-head { position: sticky; top: 0; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 16px 18px; background: var(--surface-card); border-bottom: 1px solid var(--border-subtle); }
.wnr-insight-head p { display: flex; align-items: center; gap: 5px; margin: 0; color: var(--accent); font-size: 12px; }
.wnr-insight-head h3 { margin: 5px 0 0; font-size: 17px; }
.wnr-insight-head button { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.wnr-insight-body { min-height: 120px; padding: 16px 18px; }
.wnr-insight-status { display: flex; gap: 8px; color: var(--text-muted); }
.wnr-insight-error { display: flex; gap: 8px; color: #b91c1c; }
.wnr-insight-content { white-space: pre-wrap; font-size: 14px; line-height: 1.8; }
.wnr-insight-foot { position: sticky; bottom: 0; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 18px; border-top: 1px solid var(--border-subtle); background: var(--surface-card); }
.wnr-insight-foot small { color: var(--text-faint); }
.wnr-insight-foot button { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; background: var(--text-primary); color: var(--surface-bg); padding: 8px 13px; font-size: 13px; cursor: pointer; }
.wnr-insight-auth { padding: 14px 18px 18px; border-top: 1px solid var(--border-subtle); }
.wnr-insight-auth p { margin: 0 0 10px; color: var(--text-muted); font-size: 13px; }
.wnr-insight-auth > div { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.wnr-insight-auth button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--surface-input); color: var(--text-primary); padding: 10px; font-size: 13px; cursor: pointer; }

.wnr-insight-enter-active,
.wnr-insight-leave-active { transition: opacity 180ms ease; }
.wnr-insight-enter-from,
.wnr-insight-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .wnr { gap: 26px; }
  .wnr-birth-grid,
  .wnr-aspect-layout,
  .wnr-section { grid-template-columns: 1fr; }
  .wnr-birth-grid > div { padding: 0; }
  .wnr-section-label { position: static; }
  .wnr-house-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wnr-aspect-grid { grid-template-columns: 1fr; }
  .wnr-methodology > dl > div { grid-template-columns: 1fr; gap: 3px; }
}

@media (max-width: 520px) {
  .wnr-house-grid { grid-template-columns: 1fr; }
  .wnr-insight-layer { padding: 10px; }
}
</style>
