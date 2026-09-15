<template>
  <div
    ref="reportRoot"
    class="skp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="skp-card skp-hero">
      <div class="skp-hero-grid">
        <div>
          <span>{{ $t('sukuyoPaipan.birthDate') }}</span>
          <strong>{{ result.birth.clockText }}</strong>
          <small>{{ result.birth.trueSolarText }} · {{ correctionText }}</small>
        </div>
        <div>
          <span>{{ $t('sukuyoPaipan.location') }}</span>
          <strong>{{ result.birth.locationName }}</strong>
          <small>{{ result.birth.coordinates }} · {{ result.birth.timezone }}</small>
        </div>
        <div>
          <span>{{ $t('sukuyoPaipan.preciseMansion') }}</span>
          <strong>{{ result.precise.mansion.name }} · {{ result.precise.mansion.sequence }}</strong>
          <small>{{ result.precise.mansion.nameEn }} · {{ groupText(result.precise.mansion.group) }}</small>
        </div>
        <div>
          <span>{{ $t('sukuyoPaipan.traditionalMansion') }}</span>
          <strong>{{ result.traditional.mansion.name }}</strong>
          <small>{{ result.traditional.lunarText || '—' }} · {{ agreementText }}</small>
        </div>
      </div>
    </section>

    <section class="skp-section">
      <header class="skp-section-label">
        <h2>{{ $t('sukuyoPaipan.astronomyTitle') }}</h2>
        <p>{{ $t('sukuyoPaipan.astronomySubtitle') }}</p>
      </header>
      <div class="skp-grid">
        <article class="skp-card skp-planet">
          <strong>{{ $t('sukuyoPaipan.moonLongitude') }}</strong>
          <b>{{ result.precise.siderealLongitude }}°</b>
          <small>{{ result.precise.nakshatra }} pada {{ result.precise.pada }} · {{ result.precise.nakshatraStartLongitude }}°</small>
        </article>
        <article class="skp-card skp-planet">
          <strong>{{ $t('sukuyoPaipan.mansionDegree') }}</strong>
          <b>{{ result.precise.mansionDegree }}°</b>
          <small>13°20′ · {{ result.precise.mansion.name }} / {{ result.precise.mansion.nameEn }}</small>
        </article>
        <article class="skp-card skp-planet">
          <strong>{{ $t('sukuyoPaipan.moonSpeed') }}</strong>
          <b>{{ result.precise.moonSpeedPerDay }}°/d</b>
          <small>{{ boundaryText }}</small>
        </article>
        <article class="skp-card skp-planet">
          <strong>{{ $t('sukuyoPaipan.ruleComparison') }}</strong>
          <b>{{ result.agree ? $t('sukuyoPaipan.agree') : $t('sukuyoPaipan.differ') }}</b>
          <small>{{ result.traditionalRelation ? `${result.traditionalRelation.role} · ${result.traditionalRelation.group}` : result.traditional.mansion.name }}</small>
        </article>
      </div>
    </section>

    <section class="skp-section">
      <header class="skp-section-label">
        <h2>{{ $t('sukuyoPaipan.attributeTitle') }}</h2>
        <p>{{ $t('sukuyoPaipan.attributeSubtitle') }}</p>
      </header>
      <div class="skp-two-grid">
        <article class="skp-card skp-attribute">
          <header>
            <strong>{{ result.precise.mansion.name }}</strong>
            <span>{{ result.precise.mansion.nameEn }} · {{ result.precise.mansion.sequence }}/27</span>
          </header>
          <dl>
            <div><dt>{{ $t('sukuyoPaipan.group') }}</dt><dd>{{ groupText(result.precise.mansion.group) }}</dd></div>
            <div><dt>{{ $t('sukuyoPaipan.category') }}</dt><dd>{{ categoryText(result.precise.mansion.category) }}</dd></div>
            <div><dt>{{ $t('sukuyoPaipan.ruler') }}</dt><dd>{{ result.precise.mansion.ruler }}</dd></div>
            <div><dt>{{ $t('sukuyoPaipan.keywords') }}</dt><dd>{{ keywordText(result.precise.mansion) }}</dd></div>
          </dl>
        </article>
        <div class="skp-list">
          <article>
            <strong>{{ $t('sukuyoPaipan.previous') }} · {{ result.neighbors.previous.name }}</strong>
            <small>{{ result.neighbors.previous.nameEn }} · {{ relationText(result.neighbors.previousRelation) }}</small>
          </article>
          <article>
            <strong>{{ $t('sukuyoPaipan.next') }} · {{ result.neighbors.next.name }}</strong>
            <small>{{ result.neighbors.next.nameEn }} · {{ relationText(result.neighbors.nextRelation) }}</small>
          </article>
          <article>
            <strong>{{ $t('sukuyoPaipan.timeStatus') }}</strong>
            <small>{{ timeStatusText }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="skp-card skp-methodology">
      <strong>{{ $t('sukuyoPaipan.methodology') }}</strong>
      <dl>
        <div><dt>{{ $t('sukuyoPaipan.engine') }}</dt><dd>{{ result.methodology.engine }} · {{ result.methodology.astronomy }}</dd></div>
        <div><dt>{{ $t('sukuyoPaipan.preciseRule') }}</dt><dd>{{ result.methodology.preciseRule }}</dd></div>
        <div><dt>{{ $t('sukuyoPaipan.traditionalRule') }}</dt><dd>{{ result.methodology.traditionalRule }}</dd></div>
        <div><dt>{{ $t('sukuyoPaipan.time') }}</dt><dd>{{ result.methodology.timeRule }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="skp-insight">
        <div v-if="insightOpen" class="skp-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="skp-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('sukuyoPaipan.aiPanelTitle')">
            <header class="skp-insight-head">
              <div class="min-w-0">
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />{{ $t('sukuyoPaipan.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('sukuyoPaipan.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('sukuyoPaipan.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="skp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="skp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />{{ $t('sukuyoPaipan.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="skp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" /><span>{{ insightError }}</span>
              </div>
              <div v-else class="skp-insight-content">{{ insightContent }}</div>
            </div>
            <footer class="skp-insight-foot">
              <small>{{ $t('sukuyoPaipan.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="skp-insight-auth">
              <p>{{ $t('sukuyoPaipan.aiLoginRequired') }}</p>
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
import type { SukuyoCategory, SukuyoGroupId, SukuyoMansion, SukuyoPaipanResult, SukuyoRelation } from '~~/app/types/sukuyo-paipan'

const props = defineProps<{ result: SukuyoPaipanResult }>()
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
  ? t('sukuyoPaipan.aiFullReport')
  : t('sukuyoPaipan.aiFullReportLogin'))

const correctionText = computed(() => props.result.birth.correctionStatus === 'corrected'
  ? t('sukuyoPaipan.corrected')
  : t('sukuyoPaipan.uncorrected'))

const agreementText = computed(() => props.result.agree
  ? t('sukuyoPaipan.agree')
  : t('sukuyoPaipan.differ'))

const boundaryText = computed(() => props.result.precise.boundaryNear
  ? t('sukuyoPaipan.boundaryNear', { hours: props.result.precise.hoursToNextBoundary ?? 0 })
  : t('sukuyoPaipan.boundarySafe', { hours: props.result.precise.hoursToNextBoundary ?? 0 }))

const timeStatusText = computed(() => {
  const status = [
    `${t('sukuyoPaipan.dayBoundary')}: ${props.result.birth.dayBoundaryChanged ? t('sukuyoPaipan.yes') : t('sukuyoPaipan.no')}`,
    `${t('sukuyoPaipan.hourBoundary')}: ${props.result.birth.hourBoundaryChanged ? t('sukuyoPaipan.yes') : t('sukuyoPaipan.no')}`,
  ]
  return status.join(' · ')
})

function groupText(group: SukuyoGroupId) {
  return t(`sukuyoPaipan.groups.${group}`)
}

function categoryText(category: SukuyoCategory) {
  return t(`sukuyoPaipan.categories.${category}`)
}

function keywordText(mansion: SukuyoMansion) {
  return locale.value === 'en'
    ? mansion.keywordsEn.join(' · ')
    : mansion.keywordsZh.join(' · ')
}

function relationText(relation: SukuyoRelation) {
  return `${relation.role} · ${relation.group}${relation.distance ? ` · ${relation.distance}` : ''}`
}

const TARGET_SELECTORS = [
  '.skp-hero-grid > div',
  '.skp-planet',
  '.skp-attribute',
  '.skp-list article',
  '.skp-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const heading = node.querySelector<HTMLElement>('strong, b')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.skp-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.skp-section-label h2')?.textContent ?? '')
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
    if (node.closest('button') || node.dataset.skpAiTarget) continue
    node.dataset.skpAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.skpAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('sukuyoPaipan.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.skpAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({ selector: node.className || node.tagName.toLowerCase(), label, ...context })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-skp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.skpAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-skp-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const r = props.result
  const p = r.precise.mansion
  const traditional = r.traditional.mansion
  return [
    `体系：宿曜占星术 / 宿曜道 27宿`,
    `出生：${r.birth.clockText}；校正后 ${r.birth.trueSolarText}；${r.birth.correctionStatus === 'corrected' ? '真太阳时已校正' : '真太阳时未校正'}`,
    `地点：${r.birth.locationName} ${r.birth.coordinates} ${r.birth.timezone}`,
    `精密本命宿：${p.name} / ${p.nameEn}，第${p.sequence}位，月亮恒星黄经 ${r.precise.siderealLongitude}°，宿内 ${r.precise.mansionDegree}°，${r.precise.nakshatra} p${r.precise.pada}`,
    `精确宿属性：${p.group}-${p.category}；ruler ${p.ruler}；关键词 ${p.keywordsZh.join('/')} / ${p.keywordsEn.join('/')}`,
    `传统农历口径：${r.traditional.lunarText} ${traditional.name}；两口径${r.agree ? '一致' : `不一致，关系 ${r.traditionalRelation?.role}（${r.traditionalRelation?.group}）`}`,
    `边界：距宿界约 ${r.precise.hoursToNextBoundary} 小时${r.precise.boundaryNear ? '；属边界风险样本' : ''}；跨日=${r.birth.dayBoundaryChanged}；跨时辰=${r.birth.hourBoundaryChanged}`,
    `邻宿关系：前 ${r.neighbors.previous.name}=${r.neighbors.previousRelation.role}；后 ${r.neighbors.next.name}=${r.neighbors.nextRelation.role}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('sukuyoPaipan.aiFullReportTitle')
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
    const response = await fetch('/api/tools/sukuyo-paipan/interpret', {
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
            throw new Error(chunk.message || t('sukuyoPaipan.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }
    if (!insightContent.value) throw new Error(t('sukuyoPaipan.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('sukuyoPaipan.aiError')
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

onMounted(() => nextTick(initializeTargets))
onBeforeUnmount(() => insightAbort?.abort())
</script>

<style scoped>
.skp { display: grid; gap: 32px; }

[data-skp-ai-target] { position: relative; cursor: pointer; border-radius: inherit; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
[data-skp-ai-target]::after { content: '✦'; position: absolute; z-index: 5; top: 5px; right: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1px solid var(--accent-border); border-radius: 999px; background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg)); color: var(--accent); font-size: 10px; line-height: 1; opacity: 0; pointer-events: none; transform: translateY(2px); transition: opacity 140ms ease, transform 140ms ease; }
[data-skp-ai-target]:hover, [data-skp-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); border-color: var(--accent-border-hover); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
[data-skp-ai-target]:hover::after, [data-skp-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }
[data-skp-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.skp-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; }
.skp-hero { padding: 22px; }
.skp-hero-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.skp-hero-grid span, .skp-hero-grid small { display: block; color: var(--text-faint); font-size: 12px; }
.skp-hero-grid strong { display: block; margin: 7px 0; font-size: 18px; }
.skp-section { display: grid; gap: 14px; }
.skp-section-label h2 { margin: 0; font-size: 18px; }
.skp-section-label p { margin: 4px 0 0; color: var(--text-faint); font-size: 13px; }
.skp-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.skp-planet { padding: 16px; }
.skp-planet strong { display: block; color: var(--text-faint); font-size: 12px; font-weight: 600; }
.skp-planet b { display: block; margin: 8px 0 6px; font-size: 20px; }
.skp-planet small { display: block; color: var(--text-muted); font-size: 12px; line-height: 1.5; }
.skp-two-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 14px; align-items: start; }
.skp-attribute header strong { display: block; font-size: 20px; }
.skp-attribute header span { display: block; margin-top: 4px; color: var(--text-faint); font-size: 12px; }
.skp-attribute dl { margin: 18px 0 0; display: grid; gap: 12px; }
.skp-attribute dt { color: var(--text-faint); font-size: 12px; }
.skp-attribute dd { margin: 3px 0 0; font-size: 14px; line-height: 1.6; }
.skp-list { display: grid; gap: 10px; }
.skp-list article { padding: 14px; border: 1px solid var(--border-subtle); border-radius: 10px; }
.skp-list strong { display: block; font-size: 14px; }
.skp-list small { display: block; margin-top: 5px; color: var(--text-muted); font-size: 12px; line-height: 1.6; }
.skp-methodology dl { margin: 14px 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; }
.skp-methodology dt { color: var(--text-faint); font-size: 12px; }
.skp-methodology dd { margin: 4px 0 0; font-size: 13px; line-height: 1.6; }
.skp-methodology p { margin: 12px 0 0; color: var(--text-faint); font-size: 12px; line-height: 1.6; }
.skp-insight-layer { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.5); backdrop-filter: blur(6px); }
.skp-insight { width: min(680px, 100%); max-height: min(78vh, 680px); display: grid; grid-template-rows: auto minmax(0,1fr) auto auto; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); }
.skp-insight-head { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; padding: 18px; border-bottom: 1px solid var(--border-subtle); }
.skp-insight-head p { display: flex; align-items: center; gap: 5px; margin: 0; color: var(--accent); font-size: 12px; }
.skp-insight-head h3 { margin: 6px 0 0; font-size: 16px; }
.skp-insight-head button { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.skp-insight-body { overflow: auto; padding: 18px; }
.skp-insight-content { white-space: pre-wrap; font-size: 14px; line-height: 1.7; }
.skp-insight-status, .skp-insight-error { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 14px; }
.skp-insight-error { color: var(--danger, #dc2626); }
.skp-insight-foot { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1px solid var(--border-subtle); }
.skp-insight-foot small { color: var(--text-faint); }
.skp-insight-foot button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--accent-border); border-radius: 8px; background: color-mix(in srgb, var(--accent-bg) 58%, transparent); color: var(--accent); padding: 7px 11px; font-size: 13px; cursor: pointer; }
.skp-insight-auth { padding: 14px 18px 18px; border-top: 1px dashed var(--border-subtle); }
.skp-insight-auth p { margin: 0 0 10px; font-size: 13px; }
.skp-insight-auth div { display: flex; gap: 8px; }
.skp-insight-auth button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border-subtle); border-radius: 8px; background: transparent; color: var(--text-primary); padding: 9px; cursor: pointer; }
.skp-insight-enter-active, .skp-insight-leave-active { transition: opacity 180ms ease; }
.skp-insight-enter-active .skp-insight, .skp-insight-leave-active .skp-insight { transition: transform 180ms ease; }
.skp-insight-enter-from, .skp-insight-leave-to { opacity: 0; }
.skp-insight-enter-from .skp-insight, .skp-insight-leave-to .skp-insight { transform: translateY(10px) scale(.98); }

@media (max-width: 900px) {
  .skp-hero-grid, .skp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .skp-two-grid { grid-template-columns: 1fr; }
  .skp-methodology dl { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .skp-hero-grid, .skp-grid { grid-template-columns: 1fr; }
  .skp-card { padding: 16px; }
  .skp-hero-grid strong { font-size: 16px; }
  .skp-insight { max-height: 88vh; }
}
</style>
