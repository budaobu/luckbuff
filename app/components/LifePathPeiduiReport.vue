<template>
  <div
    ref="reportRoot"
    class="lpr"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="lpr-card lpr-hero">
      <p class="lpr-kicker">{{ $t('lifePathPeidui.report.kicker') }}</p>
      <h2>{{ $t('lifePathPeidui.report.title', { a: result.personA.lifePathNumber, b: result.personB.lifePathNumber }) }}</h2>
      <div class="lpr-hero-grid">
        <div>
          <span>{{ $t('lifePathPeidui.personA') }}</span>
          <strong>{{ result.personA.name || $t('lifePathPeidui.personA') }}</strong>
          <small>{{ result.personA.birthDate }}</small>
        </div>
        <div class="lpr-hero-pair" aria-hidden="true">
          <strong>{{ result.personA.lifePathNumber }}</strong>
          <UIcon name="i-heroicons-arrows-right-left" class="h-4 w-4" />
          <strong>{{ result.personB.lifePathNumber }}</strong>
        </div>
        <div>
          <span>{{ $t('lifePathPeidui.personB') }}</span>
          <strong>{{ result.personB.name || $t('lifePathPeidui.personB') }}</strong>
          <small>{{ result.personB.birthDate }}</small>
        </div>
      </div>
      <p class="lpr-verdict">{{ result.matrix.tierLabel }} · {{ result.matrix.summary }}</p>
    </section>

    <section class="lpr-section">
      <header class="lpr-section-label">
        <h2>{{ $t('lifePathPeidui.report.profilesTitle') }}</h2>
        <p>{{ $t('lifePathPeidui.report.profilesSubtitle') }}</p>
      </header>
      <div class="lpr-profile-grid">
        <article v-for="person in [result.personA, result.personB]" :key="person.lifePathNumber + person.birthDate">
          <header>
            <strong>{{ person.lifePathNumber }} · {{ person.profile.symbol }}</strong>
            <span>{{ person.name || $t(person === result.personA ? 'lifePathPeidui.personA' : 'lifePathPeidui.personB') }}</span>
          </header>
          <p class="lpr-calc">{{ person.calculation }}</p>
          <div class="lpr-tags">
            <span v-for="tag in person.profile.tags" :key="tag">{{ tag }}</span>
          </div>
          <dl>
            <div><dt>{{ $t('lifePathPeidui.report.need') }}</dt><dd>{{ person.profile.dimension.relationshipNeed }}</dd></div>
            <div><dt>{{ $t('lifePathPeidui.report.communication') }}</dt><dd>{{ person.profile.dimension.communication }}</dd></div>
            <div><dt>{{ $t('lifePathPeidui.report.emotion') }}</dt><dd>{{ person.profile.dimension.emotion }}</dd></div>
            <div><dt>{{ $t('lifePathPeidui.report.lifestyle') }}</dt><dd>{{ person.profile.dimension.lifestyle }}</dd></div>
          </dl>
          <small v-if="person.isMaster">{{ person.masterNote }}</small>
        </article>
      </div>
    </section>

    <section class="lpr-section">
      <header class="lpr-section-label">
        <h2>{{ $t('lifePathPeidui.report.signalTitle') }}</h2>
        <p>{{ $t('lifePathPeidui.report.signalSubtitle') }}</p>
      </header>
      <div class="lpr-signal-grid">
        <article>
          <strong>{{ result.matrix.tierLabel }}</strong>
          <p>{{ result.matrix.summary }}</p>
          <small>{{ result.matrix.pairKey }}</small>
        </article>
        <article>
          <strong>{{ $t('lifePathPeidui.report.sharedTitle') }}</strong>
          <p>{{ result.sharedFocus.join(' · ') || $t('lifePathPeidui.report.noShared') }}</p>
        </article>
        <article>
          <strong>{{ $t('lifePathPeidui.report.contrastTitle') }}</strong>
          <p>{{ result.contrast.join(' · ') }}</p>
        </article>
      </div>
    </section>

    <section class="lpr-section">
      <header class="lpr-section-label">
        <h2>{{ $t('lifePathPeidui.report.dimensions') }}</h2>
        <p>{{ $t('lifePathPeidui.report.dimensionsSubtitle') }}</p>
      </header>
      <div class="lpr-dimension-grid">
        <article v-for="dimension in result.dimensions" :key="dimension.key">
          <strong>{{ dimension.label }}</strong>
          <p>{{ dimension.reading }}</p>
        </article>
      </div>
    </section>

    <section class="lpr-section">
      <header class="lpr-section-label">
        <h2>{{ $t('lifePathPeidui.report.matrix') }}</h2>
        <p>{{ $t('lifePathPeidui.report.matrixLegend') }}</p>
      </header>
      <div class="lpr-card lpr-matrix-card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th v-for="number in 9" :key="`head-${number}`">{{ number }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in 9" :key="`row-${row}`">
              <th>{{ row }}</th>
              <td v-for="column in 9" :key="`${row}-${column}`" :class="tierFor(row, column)">
                <span v-if="isActivePair(row, column)">★</span>
                <span v-else>{{ $t(`lifePathPeidui.tier.${tierFor(row, column)}`) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p class="lpr-disclaimer">{{ $t('lifePathPeidui.disclaimer') }}</p>

    <Teleport to="body">
      <Transition name="lpr-insight">
        <div v-if="insightOpen" class="lpr-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="lpr-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('lifePathPeidui.report.aiPanelTitle')">
            <header>
              <div class="min-w-0">
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" /> {{ $t('lifePathPeidui.report.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('lifePathPeidui.report.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('lifePathPeidui.report.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="lpr-insight-body">
              <div v-if="insightStatus === 'connecting'" class="lpr-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" /> {{ $t('lifePathPeidui.report.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="lpr-insight-error">{{ insightError }}</div>
              <div v-else class="lpr-insight-content">{{ insightContent }}</div>
            </div>
            <footer>
              <small>{{ $t('lifePathPeidui.report.aiDisclaimer') }}</small>
              <button v-if="insightMode === 'target' && insightStatus === 'complete'" type="button" @click="handleFullReport">
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="lpr-insight-auth">
              <p>{{ $t('lifePathPeidui.report.aiLoginRequired') }}</p>
              <div>
                <button type="button" @click="signInWithGoogle(route.fullPath)">
                  <UIcon name="i-simple-icons-google" class="h-4 w-4" /> Google
                </button>
                <button type="button" @click="signInWithTelegram(route.fullPath)">
                  <UIcon name="i-simple-icons-telegram" class="h-4 w-4" /> Telegram
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
import { lifePathPairTier, type LifePathCalcResult } from '~~/server/utils/tools/lifepath-peidui-data'

const props = defineProps<{ result: LifePathCalcResult }>()

const route = useRoute()
const { t, locale } = useI18n()
const toast = useToast()
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
  ? t('lifePathPeidui.report.aiFullReport')
  : t('lifePathPeidui.report.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.lpr-hero-grid > div',
  '.lpr-profile-grid > article',
  '.lpr-signal-grid > article',
  '.lpr-dimension-grid > article',
  '.lpr-matrix-card tbody td',
].join(',')

function tierFor(row: number, column: number) {
  return lifePathPairTier(row, column)
}

function isActivePair(row: number, column: number) {
  return (row === props.result.personA.pairRoot && column === props.result.personB.pairRoot)
    || (row === props.result.personB.pairRoot && column === props.result.personA.pairRoot)
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.closest('.lpr-matrix-card')) {
    const rowLabel = normalizeText(node.closest('tr')?.querySelector<HTMLElement>('th')?.textContent ?? '')
    return `${rowLabel}-${normalizeText(node.textContent || '')}`
  }
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.lpr-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(node.querySelector<HTMLElement>('h3, strong, span')?.textContent ?? '').slice(0, 42)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.lpr-section-label h2')?.textContent ?? '')
  return {
    section: sectionTitle || t('lifePathPeidui.report.pairTitle'),
    group: '',
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.lprAiTarget) continue
    node.dataset.lprAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.lprAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('lifePathPeidui.report.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label: node.dataset.lprAiLabel || targetLabel(node),
    ...targetContext(node),
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-lpr-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-lpr-ai-target]')
  if (target) activateTarget(target)
}

function compactPairContext() {
  const result = props.result
  const dimension = (person: typeof result.personA) => [
    person.profile.dimension.relationshipNeed,
    person.profile.dimension.communication,
    person.profile.dimension.emotion,
    person.profile.dimension.lifestyle,
    person.profile.dimension.growth,
  ].join('；')

  return [
    `配对：${result.personA.lifePathNumber} × ${result.personB.lifePathNumber}`,
    `A：${result.personA.profile.symbol} / ${result.personA.profile.tags.join('、')} / ${dimension(result.personA)}`,
    `B：${result.personB.profile.symbol} / ${result.personB.profile.tags.join('、')} / ${dimension(result.personB)}`,
    `主灵数：A${result.personA.isMaster ? `=${result.personA.lifePathNumber}(根${result.personA.pairRoot})` : ''}，B${result.personB.isMaster ? `=${result.personB.lifePathNumber}(根${result.personB.pairRoot})` : ''}`,
    `关系层级：${result.matrix.pairKey} / ${result.matrix.tierLabel} / ${result.matrix.summary}`,
    `共同与差异：${result.sharedFocus.join('、')} / ${result.contrast.join('、')}`,
    `维度：${result.dimensions.map(item => `${item.label}=${item.reading}`).join('；')}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('lifePathPeidui.report.aiFullReportTitle')
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
    const response = await fetch('/api/tools/lifepath-peidui/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({ ...payload, result: props.result, resultContext: compactPairContext(), locale: locale.value }),
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
            throw new Error(chunk.message || t('lifePathPeidui.aiUnavailable'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }
    if (!insightContent.value) throw new Error(t('lifePathPeidui.report.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('lifePathPeidui.aiUnavailable')
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

async function copyPair() {
  const result = props.result
  await navigator.clipboard.writeText(`${result.personA.lifePathNumber} × ${result.personB.lifePathNumber} · ${result.matrix.tierLabel}`)
  toast.add({ title: t('share.textCopied'), color: 'success' })
}

watch(() => props.result, async () => {
  await nextTick()
  initializeTargets()
}, { immediate: true })

onMounted(() => nextTick(initializeTargets))
onBeforeUnmount(() => insightAbort?.abort())

defineExpose({ copyPair })
</script>

<style scoped>
.lpr { display: grid; gap: 32px; }

[data-lpr-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-lpr-ai-target]::after {
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

[data-lpr-ai-target]:hover,
[data-lpr-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-lpr-ai-target]:hover::after,
[data-lpr-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }

[data-lpr-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.lpr-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 20px;
}

.lpr-hero { display: grid; gap: 18px; }
.lpr-kicker { margin: 0; color: var(--text-faint); font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.lpr-hero h2 { margin: 8px 0 0; font-size: 28px; line-height: 1.2; }
.lpr-hero-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; align-items: center; }
.lpr-hero-grid > div:not(.lpr-hero-pair) { padding: 14px; border: 1px solid var(--border-subtle); border-radius: 10px; }
.lpr-hero-grid span, .lpr-hero-grid small { display: block; margin-top: 5px; color: var(--text-muted); font-size: 12px; }
.lpr-hero-grid strong { display: block; margin-top: 5px; font-size: 18px; }
.lpr-hero-pair { display: grid; justify-items: center; gap: 8px; color: var(--accent); }
.lpr-hero-pair strong { display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; border: 1px solid var(--accent-border); border-radius: 999px; font-size: 22px; }
.lpr-verdict { margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.6; }

.lpr-section { display: grid; gap: 16px; }
.lpr-section-label h2 { margin: 0; font-size: 18px; }
.lpr-section-label p { margin: 5px 0 0; color: var(--text-muted); font-size: 13px; }
.lpr-profile-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.lpr-profile-grid article, .lpr-signal-grid article, .lpr-dimension-grid article {
  padding: 18px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}
.lpr-profile-grid header { display: grid; gap: 4px; }
.lpr-profile-grid strong { color: var(--accent); font-size: 16px; }
.lpr-profile-grid span { color: var(--text-muted); font-size: 13px; }
.lpr-calc { margin: 12px 0; color: var(--text-muted); font-size: 12px; }
.lpr-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.lpr-tags span { padding: 3px 8px; border-radius: 999px; background: var(--surface-card-hover); color: var(--text-muted); font-size: 12px; }
.lpr-profile-grid dl { display: grid; gap: 10px; margin: 0; }
.lpr-profile-grid dt { color: var(--text-faint); font-size: 12px; }
.lpr-profile-grid dd { margin: 2px 0 0; color: var(--text-body); font-size: 13px; line-height: 1.55; }
.lpr-profile-grid small { display: block; margin-top: 12px; color: var(--text-muted); font-size: 12px; line-height: 1.5; }
.lpr-signal-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.lpr-dimension-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.lpr-signal-grid strong, .lpr-dimension-grid strong { display: block; margin-bottom: 8px; font-size: 14px; }
.lpr-signal-grid p, .lpr-dimension-grid p { margin: 0; color: var(--text-body); font-size: 13px; line-height: 1.6; }
.lpr-signal-grid small { display: block; margin-top: 8px; color: var(--text-faint); }
.lpr-matrix-card { overflow: auto; }
.lpr-matrix-card table { width: 100%; min-width: 520px; border-collapse: collapse; text-align: center; font-size: 12px; }
.lpr-matrix-card th { color: var(--text-faint); font-weight: 650; }
.lpr-matrix-card th, .lpr-matrix-card td { min-width: 44px; padding: 8px; border: 1px solid var(--border-light); }
.lpr-matrix-card td.strong { color: var(--accent); }
.lpr-matrix-card td.supportive { color: var(--text-body); }
.lpr-matrix-card td.growth { color: #b47325; }
.lpr-matrix-card td.balanced { color: var(--text-faint); }
.lpr-disclaimer { margin: 0; color: var(--text-faint); font-size: 11px; line-height: 1.6; text-align: center; }

.lpr-insight-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, .54);
  backdrop-filter: blur(8px);
}
.lpr-insight {
  display: flex;
  max-width: 780px;
  width: 100%;
  max-height: min(88vh, 820px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-bg);
}
.lpr-insight header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); }
.lpr-insight header p { display: flex; align-items: center; gap: 5px; margin: 0; color: var(--accent); font-size: 12px; }
.lpr-insight header h3 { margin: 6px 0 0; overflow: hidden; font-size: 16px; text-overflow: ellipsis; white-space: nowrap; }
.lpr-insight header button { display: inline-flex; padding: 6px; border: 1px solid var(--border-light); border-radius: 999px; background: var(--surface-card); color: var(--text-muted); cursor: pointer; }
.lpr-insight-body { min-height: 140px; flex: 1; overflow: auto; padding: 18px 20px; }
.lpr-insight-content { color: var(--text-body); font-size: 13px; line-height: 1.75; white-space: pre-wrap; }
.lpr-insight-status { display: flex; align-items: center; gap: 8px; color: var(--accent); font-size: 13px; }
.lpr-insight-error { color: #b91c1c; font-size: 13px; line-height: 1.6; }
.lpr-insight footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px; border-top: 1px solid var(--border-subtle); }
.lpr-insight footer small { min-width: 0; color: var(--text-placeholder); font-size: 10px; }
.lpr-insight footer button { display: inline-flex; flex-shrink: 0; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid var(--accent-border); border-radius: 999px; background: var(--accent-bg); color: var(--accent); font-size: 12px; cursor: pointer; }
.lpr-insight-auth { padding: 12px 20px 16px; border-top: 1px solid var(--border-subtle); background: var(--surface-card); }
.lpr-insight-auth p { margin: 0 0 9px; color: var(--text-muted); font-size: 12px; }
.lpr-insight-auth div { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.lpr-insight-auth button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: 10px; background: var(--surface-input); color: var(--text-body); font-size: 12px; cursor: pointer; }
.lpr-insight-enter-active, .lpr-insight-leave-active { transition: opacity 180ms ease; }
.lpr-insight-enter-from, .lpr-insight-leave-to { opacity: 0; }
.lpr-insight-enter-active .lpr-insight, .lpr-insight-leave-active .lpr-insight { transition: transform 180ms cubic-bezier(.23, 1, .32, 1), opacity 180ms ease; }
.lpr-insight-enter-from .lpr-insight, .lpr-insight-leave-to .lpr-insight { opacity: 0; transform: translateY(18px); }

@media (max-width: 760px) {
  .lpr-hero-grid { grid-template-columns: 1fr; }
  .lpr-profile-grid, .lpr-dimension-grid { grid-template-columns: 1fr; }
  .lpr-signal-grid { grid-template-columns: 1fr; }
  .lpr-insight { max-height: 94vh; }
}
</style>
