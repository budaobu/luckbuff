<template>
  <div
    ref="reportRoot"
    class="zp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="zp-card zp-hero">
      <p class="zp-kicker">{{ $t('ziweiChart.reportKicker') }}</p>
      <dl class="zp-birth-grid">
        <div>
          <dt>{{ $t('ziweiChart.solar') }}</dt>
          <dd>{{ result.summary.solarDate }}</dd>
          <small>{{ result.input.birthDate }}</small>
        </div>
        <div>
          <dt>{{ $t('ziweiChart.lunar') }}</dt>
          <dd>{{ result.summary.lunarDate }}</dd>
          <small>{{ result.summary.chineseDate }}</small>
        </div>
        <div>
          <dt>{{ $t('ziweiChart.birthTime') }}</dt>
          <dd>{{ result.summary.timeText }}</dd>
          <small>{{ result.summary.timeRange }}</small>
        </div>
        <div>
          <dt>{{ $t('profileForm.gender') }}</dt>
          <dd>{{ result.summary.genderText }}</dd>
          <small>{{ result.summary.zodiac }} · {{ result.summary.sign }}</small>
        </div>
        <div>
          <dt>{{ $t('baziChart.location') }}</dt>
          <dd>{{ result.input.locationName }}</dd>
          <small>{{ result.input.coordinates || result.input.timezone }}</small>
        </div>
        <div>
          <dt>{{ $t('baziChart.trueSolar') }}</dt>
          <dd>{{ result.input.trueSolarText || '—' }}</dd>
          <small>{{ result.input.solarTimeStatusText }}</small>
        </div>
        <div>
          <dt>{{ $t('ziweiChart.fiveElementsClass') }}</dt>
          <dd>{{ result.summary.fiveElementsClass }}</dd>
          <small>{{ $t('ziweiChart.natalFoundation') }}</small>
        </div>
        <div>
          <dt>{{ $t('ziweiChart.soulBody') }}</dt>
          <dd>
            {{ result.summary.soulPalace }} / {{ result.summary.bodyPalace }}
          </dd>
          <small>{{ result.summary.soulStar }} · {{ result.summary.bodyStar }}</small>
        </div>
      </dl>
      <div class="zp-copy-row">
        <button type="button" @click="copySummary">
          <UIcon name="i-heroicons-clipboard-document" class="h-4 w-4" />
          {{ $t('baziChart.copy') }}
        </button>
      </div>
    </section>

    <section class="zp-section">
      <header class="zp-section-label">
        <h2>{{ $t('ziweiChart.chartTitle') }}</h2>
        <p>{{ $t('ziweiChart.chartSubtitle') }}</p>
      </header>
      <div class="zp-card zp-chart-card">
        <div class="zp-chart">
          <template v-for="slot in chartSlots" :key="slot.key">
            <div v-if="slot.center" class="zp-center">
              <strong>{{ result.summary.fiveElementsClass }}</strong>
              <span>{{ result.summary.soulStar }} / {{ result.summary.bodyStar }}</span>
              <small>{{ result.summary.soulPalace }} · {{ result.summary.bodyPalace }}</small>
            </div>
            <article
              v-else
              class="zp-palace"
              :class="[`zp-pos-${slot.palace?.index}`, { 'is-soul': slot.palace?.name === soulPalaceName }]"
            >
              <header>
                <strong>{{ slot.palace?.name }}</strong>
                <span>{{ slot.palace?.heavenlyStem }}{{ slot.palace?.earthlyBranch }}</span>
              </header>
              <div class="zp-star-lines">
                <p class="is-major">
                  {{ slot.palace?.majorStars.map(formatStar).join(' ') || $t('ziweiChart.emptyPalace') }}
                </p>
                <p class="is-minor">{{ slot.palace?.minorStars.map(formatStar).join(' ') }}</p>
                <p class="is-adjective">{{ slot.palace?.adjectiveStars.map(star => star.name).join(' ') }}</p>
              </div>
              <footer>
                <span>{{ slot.palace?.decadal.startAge }}-{{ slot.palace?.decadal.endAge }}</span>
                <span v-if="slot.palace?.isBodyPalace">{{ $t('ziweiChart.bodyPalace') }}</span>
                <span v-if="slot.palace?.isOriginalPalace">{{ $t('ziweiChart.originalPalace') }}</span>
              </footer>
            </article>
          </template>
        </div>
      </div>
    </section>

    <section class="zp-section">
      <header class="zp-section-label">
        <h2>{{ $t('ziweiChart.mutagenTitle') }}</h2>
        <p>{{ $t('ziweiChart.mutagenSubtitle') }}</p>
      </header>
      <div class="zp-grid-4">
        <article v-for="item in result.natalMutagens" :key="`${item.mutagen}-${item.star}`" class="zp-card zp-signal">
          <span>{{ item.mutagen }}</span>
          <strong>{{ item.star }}</strong>
          <small>{{ item.palace }}</small>
        </article>
      </div>
    </section>

    <section class="zp-section">
      <header class="zp-section-label">
        <h2>{{ $t('ziweiChart.palaceDetailTitle') }}</h2>
        <p>{{ $t('ziweiChart.palaceDetailSubtitle') }}</p>
      </header>
      <div class="zp-palace-details">
        <article v-for="palace in result.palaces" :key="palace.index" class="zp-card">
          <header>
            <strong>{{ palace.name }}</strong>
            <span>{{ palace.heavenlyStem }}{{ palace.earthlyBranch }}</span>
          </header>
          <dl>
            <div>
              <dt>{{ $t('ziweiChart.majorStars') }}</dt>
              <dd>{{ palace.majorStars.map(formatStar).join(' ') || '—' }}</dd>
            </div>
            <div>
              <dt>{{ $t('ziweiChart.minorStars') }}</dt>
              <dd>{{ palace.minorStars.map(formatStar).join(' ') || '—' }}</dd>
            </div>
            <div>
              <dt>{{ $t('ziweiChart.adjectiveStars') }}</dt>
              <dd>{{ palace.adjectiveStars.map(star => star.name).join(' ') || '—' }}</dd>
            </div>
            <div>
              <dt>{{ $t('ziweiChart.twelveSpirits') }}</dt>
              <dd>{{ palace.changsheng12 }} · {{ palace.boshi12 }} · {{ palace.jiangqian12 }} · {{ palace.suiqian12 }}</dd>
            </div>
            <div>
              <dt>{{ $t('ziweiChart.decadal') }}</dt>
              <dd>{{ palace.decadal.startAge }}-{{ palace.decadal.endAge }} · {{ palace.heavenlyStem }}{{ palace.earthlyBranch }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <section class="zp-section">
      <header class="zp-section-label">
        <h2>{{ $t('ziweiChart.majorLimitTitle') }}</h2>
        <p>{{ $t('ziweiChart.majorLimitSubtitle') }}</p>
      </header>
      <div class="zp-card zp-limit-list">
        <article v-for="limit in result.majorLimits" :key="`${limit.ageRange[0]}-${limit.palaceName}`" :class="{ 'is-current': limit.isCurrent }">
          <strong>{{ limit.yearRange[0] }}-{{ limit.yearRange[1] }}</strong>
          <span>{{ limit.ageRange[0] }}-{{ limit.ageRange[1] }}</span>
          <em>{{ limit.natalPalace }}</em>
          <small>{{ limit.heavenlyStem }}{{ limit.earthlyBranch }} · {{ limit.mutagenStars.join(' ') }}</small>
          <b v-if="limit.isCurrent">{{ $t('baziChart.current') }}</b>
        </article>
      </div>
    </section>

    <section class="zp-section">
      <header class="zp-section-label">
        <h2>{{ $t('ziweiChart.currentTitle') }}</h2>
        <p>{{ result.currentPeriods.queryDate }} · {{ result.currentPeriods.lunarDate }}</p>
      </header>
      <div class="zp-period-grid">
        <article v-for="period in result.currentPeriods.periods" :key="period.key" class="zp-card">
          <header>
            <strong>{{ period.label }}</strong>
            <span>{{ period.heavenlyStem }}{{ period.earthlyBranch }}</span>
          </header>
          <p>{{ period.natalPalace }}</p>
          <small v-if="period.nominalAge">{{ $t('ziweiChart.nominalAge') }} {{ period.nominalAge }}</small>
          <div v-if="period.mutagenStars.length" class="zp-pills">
            <span v-for="star in period.mutagenStars" :key="`${period.key}-${star}`">{{ star }}</span>
          </div>
          <small v-if="period.flowingStars.length" class="zp-flow-stars">
            {{ period.flowingStars.map(star => `${star.name}@${star.natalPalace}`).join(' · ') }}
          </small>
        </article>
      </div>
    </section>

    <section v-if="result.decadeFlowYears.length" class="zp-section">
      <header class="zp-section-label">
        <h2>{{ $t('ziweiChart.flowYearTitle') }}</h2>
        <p>{{ $t('ziweiChart.flowYearSubtitle') }}</p>
      </header>
      <div class="zp-card zp-year-list">
        <article v-for="year in result.decadeFlowYears" :key="year.yearRange[0]" :class="{ 'is-current': year.isCurrent }">
          <strong>{{ year.yearRange[0] }}</strong>
          <span>{{ year.ageRange[0] }}</span>
          <em>{{ year.heavenlyStem }}{{ year.earthlyBranch }}</em>
          <small>{{ year.natalPalace }} · {{ year.mutagenStars.join(' ') }}</small>
        </article>
      </div>
    </section>

    <section class="zp-card zp-methodology">
      <strong>{{ $t('baziChart.methodology') }}</strong>
      <dl>
        <div><dt>{{ $t('baziChart.school') }}</dt><dd>{{ result.methodology.school }}</dd></div>
        <div><dt>{{ $t('baziChart.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('baziChart.trueSolar') }}</dt><dd>{{ result.methodology.trueSolarTime }}</dd></div>
        <div><dt>{{ $t('ziweiChart.leapMonth') }}</dt><dd>{{ result.methodology.leapMonth }}</dd></div>
        <div><dt>{{ $t('ziweiChart.lateZi') }}</dt><dd>{{ result.methodology.lateZi }}</dd></div>
        <div><dt>{{ $t('ziweiChart.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
      </dl>
      <p>{{ result.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="zp-insight">
        <div
          v-if="insightOpen"
          class="zp-insight-layer"
          role="presentation"
          @click.self="closeInsight"
        >
          <section
            class="zp-insight"
            role="dialog"
            aria-modal="true"
            :aria-label="insightTitle || $t('baziChart.aiPanelTitle')"
          >
            <header class="zp-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('baziChart.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('baziChart.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('baziChart.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="zp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="zp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('baziChart.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="zp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="zp-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="zp-insight-foot">
              <small>{{ $t('baziChart.aiDisclaimer') }}</small>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ZiweiChartResult } from '~~/server/utils/tools/ziwei-chart'

const props = defineProps<{ result: ZiweiChartResult }>()
const { t, locale } = useI18n()
const reportRoot = ref<HTMLElement>()

const insightOpen = ref(false)
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
let insightAbort: AbortController | null = null

const TARGET_SELECTORS = [
  '.zp-palace',
  '.zp-center',
  '.zp-signal',
  '.zp-palace-details article',
  '.zp-limit-list article',
  '.zp-year-list article',
  '.zp-period-grid article',
  '.zp-hero',
  '.zp-methodology',
].join(',')

const soulPalaceName = computed(() =>
  props.result.palaces.find(palace => palace.earthlyBranch === props.result.summary.soulPalace.slice(0, 1))?.name,
)

const chartSlots = computed(() => {
  const byIndex = new Map(props.result.palaces.map(palace => [palace.index, palace]))
  const order = [3, 4, 5, 6, 2, 'center', 7, 1, 8, 0, 11, 10, 9] as const
  return order.map((item, index) => {
    if (item === 'center') return { key: `center-${index}`, center: true, palace: null }
    return { key: `palace-${item}`, center: false, palace: byIndex.get(item) }
  })
})

function formatStar(star: { name: string; brightness: string | null; mutagen: string | null }) {
  return `${star.name}${star.brightness ? `(${star.brightness})` : ''}${star.mutagen ? `化${star.mutagen}` : ''}`
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function sectionTitle(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  return normalizeText(section?.querySelector<HTMLElement>('.zp-section-label h2, .zp-kicker')?.textContent ?? '')
}

function targetLabel(node: HTMLElement) {
  const section = sectionTitle(node)

  if (node.classList.contains('zp-palace') || node.classList.contains('zp-center')) {
    const palace = normalizeText(node.querySelector<HTMLElement>('header strong')?.textContent ?? '')
    const stars = normalizeText(node.querySelector<HTMLElement>('.is-major')?.textContent ?? node.querySelector<HTMLElement>('strong')?.textContent ?? '')
    return [section, palace, stars].filter(Boolean).join(' · ')
  }

  if (node.closest('.zp-limit-list, .zp-year-list')) {
    const year = normalizeText(node.querySelector<HTMLElement>('strong')?.textContent ?? '')
    const palace = normalizeText(node.querySelector<HTMLElement>('em')?.textContent ?? '')
    return [section, year, palace].filter(Boolean).join(' · ')
  }

  if (node.closest('.zp-period-grid')) {
    const period = normalizeText(node.querySelector<HTMLElement>('header strong')?.textContent ?? '')
    const palace = normalizeText(node.querySelector<HTMLElement>('p')?.textContent ?? '')
    return [section, period, palace].filter(Boolean).join(' · ')
  }

  if (node.classList.contains('zp-signal')) {
    const mutagen = normalizeText(node.querySelector<HTMLElement>('span')?.textContent ?? '')
    const star = normalizeText(node.querySelector<HTMLElement>('strong')?.textContent ?? '')
    return [section, star, mutagen].filter(Boolean).join(' · ')
  }

  const explicit = node.querySelector<HTMLElement>('h2, h3, strong, dt, span')
  return [section, normalizeText(explicit?.textContent ?? '').slice(0, 36)].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = sectionTitle(node)
  const group = normalizeText(node.closest<HTMLElement>('section')?.querySelector<HTMLElement>('.zp-section-label p')?.textContent ?? '')
  return {
    section,
    group,
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.zpAiTarget) continue

    node.dataset.zpAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.zpAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('baziChart.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label: node.dataset.zpAiLabel || targetLabel(node),
    ...targetContext(node),
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-zp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.zpAiTarget !== 'true') return
  activateTarget(current)
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ target, title: target.label })
}

async function streamInsight(payload: { target: Record<string, string>, title?: string }) {
  insightAbort?.abort()
  insightAbort = new AbortController()
  insightOpen.value = true
  insightTitle.value = payload.title || ''
  insightContent.value = ''
  insightError.value = ''
  insightStatus.value = 'connecting'

  try {
    const response = await fetch('/api/tools/ziwei-paipan/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({
        ...payload,
        chart: props.result,
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

async function copySummary() {
  const summary = [
    props.result.summary.chineseDate,
    props.result.summary.timeText,
    props.result.summary.fiveElementsClass,
    `${props.result.summary.soulPalace}:${props.result.summary.soulPalaceStars}`,
  ].filter(Boolean).join(' · ')
  await navigator.clipboard.writeText(summary)
}

defineExpose({ reportRoot })
</script>

<style scoped>
.zp {
  color: var(--text-primary);
  display: grid;
  gap: 30px;
}

[data-zp-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-zp-ai-target]::after {
  content: '✦';
  position: absolute;
  z-index: 5;
  top: 6px;
  right: 6px;
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

[data-zp-ai-target]:hover,
[data-zp-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-zp-ai-target]:hover::after,
[data-zp-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

[data-zp-ai-target]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.zp-insight-layer {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: end center;
  padding: 24px;
  background: color-mix(in srgb, rgba(15, 18, 24, 0.52), transparent);
  backdrop-filter: blur(8px);
}

.zp-insight {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(680px, 100%);
  max-height: min(74vh, 680px);
  overflow: hidden;
  border: 1px solid var(--border-medium);
  border-radius: 18px;
  background: var(--surface-dropdown);
  box-shadow: var(--shadow-panel);
}

.zp-insight-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.zp-insight-head p {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
}

.zp-insight-head h3 {
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

.zp-insight-head button {
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

.zp-insight-body {
  min-height: 108px;
  overflow: auto;
  padding: 18px 20px;
}

.zp-insight-status,
.zp-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.zp-insight-error {
  color: #b91c1c;
}

.zp-insight-content {
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.zp-insight-foot {
  padding: 12px 20px;
  border-top: 1px solid var(--border-subtle);
}

.zp-insight-foot small {
  color: var(--text-placeholder);
  font-size: 10px;
  line-height: 1.4;
}

.zp-insight-enter-active,
.zp-insight-leave-active {
  transition: opacity 180ms ease;
}

.zp-insight-enter-active .zp-insight,
.zp-insight-leave-active .zp-insight {
  transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms ease;
}

.zp-insight-enter-from,
.zp-insight-leave-to {
  opacity: 0;
}

.zp-insight-enter-from .zp-insight,
.zp-insight-leave-to .zp-insight {
  opacity: 0;
  transform: translateY(18px);
}

.zp-card {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 18px;
}

.zp-hero {
  display: grid;
  gap: 16px;
}

.zp-kicker {
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.zp-birth-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.zp-birth-grid dt {
  color: var(--text-muted);
  font-size: 12px;
}

.zp-birth-grid dd {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 700;
}

.zp-birth-grid small,
.zp-signal small,
.zp-limit-list small,
.zp-year-list small {
  color: var(--text-faint);
  font-size: 12px;
}

.zp-copy-row button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
}

.zp-section-label {
  margin-bottom: 14px;
}

.zp-section-label h2 {
  font-size: 20px;
}

.zp-section-label p {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
}

.zp-chart {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-areas:
    "p3 p4 p5 p6"
    "p2 center center p7"
    "p1 center center p8"
    "p0 p11 p10 p9";
  gap: 8px;
}

.zp-center {
  grid-area: center;
  align-self: stretch;
  background: var(--surface-input);
  border-radius: 8px;
  display: grid;
  place-content: center;
  gap: 6px;
  padding: 12px;
  text-align: center;
}

.zp-center strong {
  font-size: 16px;
}

.zp-center span,
.zp-center small {
  color: var(--text-muted);
  font-size: 12px;
}

.zp-palace {
  min-height: 146px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 10px;
  display: grid;
  align-content: start;
  gap: 8px;
  background: color-mix(in srgb, var(--surface-card) 88%, transparent);
}

.zp-palace.is-soul {
  border-color: var(--accent);
}

.zp-palace header {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-size: 13px;
}

.zp-star-lines {
  display: grid;
  gap: 4px;
}

.zp-star-lines p {
  font-size: 13px;
  line-height: 1.35;
}

.zp-star-lines .is-major {
  font-weight: 700;
}

.zp-star-lines .is-minor {
  color: var(--accent);
}

.zp-star-lines .is-adjective {
  color: var(--text-faint);
  font-size: 11px;
}

.zp-palace footer {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--text-faint);
  font-size: 11px;
}

.zp-pos-3 { grid-area: p3; }
.zp-pos-4 { grid-area: p4; }
.zp-pos-5 { grid-area: p5; }
.zp-pos-6 { grid-area: p6; }
.zp-pos-2 { grid-area: p2; }
.zp-pos-7 { grid-area: p7; }
.zp-pos-1 { grid-area: p1; }
.zp-pos-8 { grid-area: p8; }
.zp-pos-0 { grid-area: p0; }
.zp-pos-11 { grid-area: p11; }
.zp-pos-10 { grid-area: p10; }
.zp-pos-9 { grid-area: p9; }

.zp-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.zp-signal {
  display: grid;
  gap: 3px;
  text-align: center;
}

.zp-signal span {
  color: var(--accent);
  font-size: 12px;
}

.zp-signal strong {
  font-size: 18px;
}

.zp-palace-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.zp-palace-details header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.zp-palace-details dl {
  display: grid;
  gap: 8px;
}

.zp-palace-details dt {
  color: var(--text-muted);
  font-size: 12px;
}

.zp-palace-details dd {
  font-size: 13px;
  line-height: 1.4;
}

.zp-limit-list,
.zp-year-list {
  display: grid;
  gap: 10px;
}

.zp-limit-list article,
.zp-year-list article {
  display: grid;
  grid-template-columns: 108px 82px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid var(--border-light);
}

.zp-limit-list article:first-child,
.zp-year-list article:first-child {
  border-top: 0;
}

.zp-limit-list em,
.zp-year-list em {
  font-style: normal;
  font-size: 13px;
}

.zp-limit-list article.is-current,
.zp-year-list article.is-current {
  color: var(--accent);
}

.zp-period-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.zp-period-grid header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.zp-period-grid p {
  font-size: 15px;
  font-weight: 700;
}

.zp-period-grid small,
.zp-flow-stars {
  color: var(--text-faint);
  font-size: 11px;
  line-height: 1.4;
}

.zp-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 6px 0;
}

.zp-pills span {
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 11px;
}

.zp-methodology {
  display: grid;
  gap: 10px;
}

.zp-methodology dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.zp-methodology dt {
  color: var(--text-muted);
  font-size: 12px;
}

.zp-methodology dd,
.zp-methodology p {
  font-size: 13px;
}

.zp-methodology p {
  color: var(--text-muted);
}

@media (max-width: 820px) {
  .zp-birth-grid,
  .zp-palace-details,
  .zp-methodology dl {
    grid-template-columns: 1fr;
  }

  .zp-chart {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      "center center"
      "p3 p4"
      "p5 p6"
      "p2 p7"
      "p1 p8"
      "p0 p11"
      "p10 p9";
  }

  .zp-palace {
    min-height: 124px;
  }

  .zp-grid-4,
  .zp-period-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zp-limit-list article,
  .zp-year-list article {
    grid-template-columns: 1fr;
    align-items: start;
  }
}

@media (max-width: 460px) {
  .zp-grid-4,
  .zp-period-grid {
    grid-template-columns: 1fr;
  }
}
</style>
