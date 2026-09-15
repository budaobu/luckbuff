<template>
  <div
    ref="reportRoot"
    class="ttr"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="ttr-hero">
      <div class="ttr-kicker">Thai Tarot · ไพ่ทาโรต์</div>
      <h2>{{ result.spread.nameZh }} · {{ result.spread.nameTh }}</h2>
      <p class="ttr-question">{{ result.question }}</p>

      <dl class="ttr-facts">
        <div class="ttr-fact"><dt>{{ $t('thaiTarot.report.seed') }}</dt><dd>{{ result.seed }}</dd></div>
        <div class="ttr-fact"><dt>{{ $t('thaiTarot.report.system') }}</dt><dd>Thai-language RWS</dd></div>
        <div class="ttr-fact"><dt>{{ $t('thaiTarot.report.reversalPolicy') }}</dt><dd>{{ orientationPolicy }}</dd></div>
        <div class="ttr-fact"><dt>{{ $t('thaiTarot.report.coverage') }}</dt><dd>{{ result.methodology.deckCoverage }}</dd></div>
      </dl>
    </section>

    <section class="ttr-section">
      <header>
        <h3>{{ $t('thaiTarot.report.overview') }}</h3>
        <p>{{ $t('thaiTarot.report.overviewSubtitle') }}</p>
      </header>
      <div class="ttr-stats">
        <div class="ttr-stat"><small>{{ $t('thaiTarot.report.major') }}</small><strong>{{ result.summary.majorCount }}</strong></div>
        <div class="ttr-stat"><small>{{ $t('thaiTarot.report.minor') }}</small><strong>{{ result.summary.minorCount }}</strong></div>
        <div class="ttr-stat"><small>{{ $t('thaiTarot.report.upright') }}</small><strong>{{ result.summary.uprightCount }}</strong></div>
        <div class="ttr-stat"><small>{{ $t('thaiTarot.report.reversed') }}</small><strong>{{ result.summary.reversedCount }}</strong></div>
        <div v-for="suit in result.summary.suitCounts" :key="suit.suit" class="ttr-stat">
          <small>{{ suit.suit }}</small><strong>{{ suit.count }}</strong>
        </div>
      </div>
    </section>

    <section class="ttr-section">
      <header>
        <h3>{{ $t('thaiTarot.report.cards') }}</h3>
        <p>{{ $t('thaiTarot.report.cardsSubtitle') }}</p>
      </header>

      <article v-for="(card, index) in result.cards" :key="`${card.id}-${card.position.key}`" class="ttr-card">
        <header class="ttr-card-head">
          <span>{{ index + 1 }} · {{ positionLabel(card.position) }}</span>
          <strong :class="{ 'is-reversed': card.orientation === 'reversed' }">
            {{ card.orientation === 'reversed' ? $t('thaiTarot.report.reversed') : $t('thaiTarot.report.upright') }}
          </strong>
        </header>

        <h4>{{ card.englishName }}</h4>
        <p class="ttr-thai">{{ card.thaiName }}</p>
        <div class="ttr-tags">
          <span>{{ card.isMajor ? $t('thaiTarot.report.major') : `${$t('thaiTarot.report.minor')} · ${card.suit}` }}</span>
          <span>{{ $t('thaiTarot.report.element') }} · {{ card.element }}</span>
          <span>Yes/No · {{ card.yesNo }}</span>
        </div>

        <div class="ttr-fields">
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.core') }}</span><strong>{{ card.meaning }}</strong></div>
          <div class="ttr-field"><span>{{ orientationHeading(card.orientation) }}</span><strong>{{ orientationMeaning(card) }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.keywords') }}</span><strong>{{ card.keywords.join(' · ') }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.astrology') }}</span><strong>{{ card.astrology }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.advice') }}</span><strong>{{ card.advice }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.love') }}</span><strong>{{ card.love }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.work') }}</span><strong>{{ card.work }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.money') }}</span><strong>{{ card.money }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.health') }}</span><strong>{{ card.health }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.timing') }}</span><strong>{{ card.timing }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.places') }}</span><strong>{{ card.places.major }} / {{ card.places.minor }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.occupations') }}</span><strong>{{ card.occupations }}</strong></div>
          <div class="ttr-field"><span>{{ $t('thaiTarot.report.person') }}</span><strong>{{ card.person }}</strong></div>
        </div>

        <details>
          <summary>{{ $t('thaiTarot.report.moreEvidence') }}</summary>
          <div class="ttr-fields">
            <div class="ttr-field"><span>{{ $t('thaiTarot.report.season') }}</span><strong>{{ card.season }}</strong></div>
            <div class="ttr-field"><span>{{ $t('thaiTarot.report.direction') }}</span><strong>{{ card.direction }}</strong></div>
            <div v-for="symbol in card.rwsSymbols" :key="symbol" class="ttr-symbol">{{ symbol }}</div>
            <div v-for="question in card.journalQuestions" :key="question" class="ttr-question-item">{{ question }}</div>
          </div>
        </details>
      </article>
    </section>

    <section class="ttr-section">
      <header><h3>{{ $t('thaiTarot.report.methodTitle') }}</h3></header>
      <div class="ttr-method">
        <div class="ttr-field"><span>{{ $t('thaiTarot.report.shuffle') }}</span><strong>{{ result.methodology.randomness }}</strong></div>
        <div class="ttr-field"><span>{{ $t('thaiTarot.report.attribution') }}</span><strong>{{ result.source.attribution }}</strong></div>
        <div class="ttr-field"><span>{{ $t('thaiTarot.report.license') }}</span><strong>{{ result.source.license }}</strong></div>
      </div>
      <p class="ttr-disclaimer">{{ $t('thaiTarot.report.disclaimer') }}</p>
    </section>

    <Teleport to="body">
      <Transition name="ttr-insight">
        <div v-if="insightOpen" class="ttr-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="ttr-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('thaiTarot.ai.panel')">
            <header>
              <div><small><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />{{ $t('thaiTarot.ai.panel') }}</small><h3>{{ insightTitle || $t('thaiTarot.ai.panel') }}</h3></div>
              <button type="button" :aria-label="$t('thaiTarot.ai.close')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="ttr-insight-body">
              <p v-if="insightStatus === 'connecting'" class="ttr-status">{{ $t('thaiTarot.ai.connecting') }}</p>
              <p v-else-if="insightError" class="ttr-error">{{ insightError }}</p>
              <p v-else class="ttr-content">{{ insightContent }}</p>
            </div>
            <footer>
              <small>{{ $t('thaiTarot.ai.disclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="ttr-auth">
              <p>{{ $t('thaiTarot.ai.loginRequired') }}</p>
              <div>
                <button type="button" @click="signInWithGoogle(route.fullPath)"><UIcon name="i-simple-icons-google" class="h-4 w-4" />Google</button>
                <button type="button" @click="signInWithTelegram(route.fullPath)"><UIcon name="i-simple-icons-telegram" class="h-4 w-4" />Telegram</button>
              </div>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ThaiTarotOrientation, ThaiTarotResult, ThaiTarotSpreadPosition } from '~~/server/utils/tools/thai-tarot'

const props = defineProps<{ result: ThaiTarotResult, aiEndpoint?: string }>()
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
  ? t('thaiTarot.ai.fullReport')
  : t('thaiTarot.ai.fullReportLogin'))

const orientationPolicy = computed(() => props.result.includeReversed
  ? t('thaiTarot.report.withReversed')
  : t('thaiTarot.report.uprightOnly'))

function positionLabel(position: ThaiTarotSpreadPosition) {
  if (locale.value === 'en' || locale.value === 'ja') return position.labelEn
  return position.labelZh
}

function orientationHeading(orientation: ThaiTarotOrientation) {
  return orientation === 'reversed' ? t('thaiTarot.report.reversedMeaning') : t('thaiTarot.report.uprightMeaning')
}

function orientationMeaning(card: { orientation: ThaiTarotOrientation, upright: string, reversed: string }) {
  return card.orientation === 'reversed' ? card.reversed : card.upright
}

const TARGET_SELECTORS = [
  '.ttr-fact',
  '.ttr-stat',
  '.ttr-card',
  '.ttr-field',
  '.ttr-symbol',
  '.ttr-question-item',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const card = node.closest<HTMLElement>('.ttr-card')
  const heading = node.querySelector<HTMLElement>('h4, strong, dt')
  const cardName = card?.querySelector<HTMLElement>('h4')?.textContent ?? ''
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 48)
  return [cardName, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('h3')?.textContent ?? '')
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
    if (node.closest('button, a, summary') || node.dataset.ttrAiTarget) continue
    node.dataset.ttrAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.ttrAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('thaiTarot.ai.action')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.ttrAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({ selector: node.className || node.tagName.toLowerCase(), label, ...context })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a, summary')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-ttr-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.ttrAiTarget !== 'true') return
  activateTarget(current.closest<HTMLElement>('[data-ttr-ai-target]')!)
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

function handleFullReport() {
  if (isLoggedIn.value) {
    void streamInsight({ mode: 'full', title: t('thaiTarot.ai.fullReportTitle') })
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
    const response = await fetch(props.aiEndpoint ?? '/api/tools/thai-tarot/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({ ...payload, result: props.result, locale: locale.value }),
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const data = await response.json()
        message = data.message || data.statusMessage || message
      }
      catch { /* Keep HTTP message. */ }
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
            throw new Error(chunk.message || t('thaiTarot.ai.error'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }
    if (!insightContent.value) throw new Error(t('thaiTarot.ai.noResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('thaiTarot.ai.error')
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
  insightError.value = ''
}

watch(() => props.result, async () => {
  await nextTick()
  initializeTargets()
}, { immediate: true })

onMounted(() => nextTick(initializeTargets))
onBeforeUnmount(() => insightAbort?.abort())
</script>

<style scoped>
.ttr { display: grid; gap: 28px; }
.ttr-hero, .ttr-section > header, .ttr-stat, .ttr-card, .ttr-method {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}
.ttr-hero { padding: 22px; display: grid; gap: 16px; }
.ttr-kicker, .ttr-section header small { color: var(--accent); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; }
.ttr-hero h2 { margin: 0; font-size: 24px; font-weight: 800; }
.ttr-question { margin: 0; color: var(--text-muted); line-height: 1.7; }
.ttr-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 0; }
.ttr-fact, .ttr-field { padding: 10px 12px; border-radius: 9px; background: var(--surface-input); }
.ttr-fact dt, .ttr-field span { display: block; color: var(--text-faint); font-size: 11px; }
.ttr-fact dd, .ttr-field strong { display: block; margin: 4px 0 0; color: var(--text-body); font-size: 13px; font-weight: 500; line-height: 1.6; }
.ttr-section { display: grid; gap: 14px; }
.ttr-section > header h3 { margin: 0; font-size: 19px; }
.ttr-section > header p { margin: 4px 0 0; color: var(--text-muted); font-size: 13px; }
.ttr-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 8px; }
.ttr-stat { padding: 12px; text-align: center; }
.ttr-stat small { display: block; color: var(--text-faint); font-size: 11px; }
.ttr-stat strong { display: block; margin-top: 4px; font-size: 20px; font-variant-numeric: tabular-nums; }
.ttr-card { padding: 18px; display: grid; gap: 12px; }
.ttr-card-head { display: flex; justify-content: space-between; gap: 10px; color: var(--text-muted); font-size: 12px; }
.ttr-card h4 { margin: 0; font-size: 20px; }
.ttr-thai { margin: 0; color: var(--text-faint); font-size: 13px; }
.ttr-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.ttr-tags span { padding: 4px 8px; border-radius: 999px; border: 1px solid var(--border-light); color: var(--text-muted); font-size: 11px; }
.ttr-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ttr-symbol, .ttr-question-item { padding: 10px 12px; border: 1px dashed var(--border-light); border-radius: 9px; color: var(--text-muted); font-size: 12px; }
details summary { cursor: pointer; color: var(--accent); font-size: 13px; }
details[open] summary { margin-bottom: 8px; }
.ttr-method { padding: 14px; display: grid; gap: 8px; }
.ttr-disclaimer { margin: 0; color: var(--text-faint); font-size: 12px; line-height: 1.6; }
.ttr-insight-layer { position: fixed; inset: 0; z-index: 100; display: grid; place-items: end center; padding: 16px; background: rgba(15, 15, 18, .44); backdrop-filter: blur(5px); }
.ttr-insight { width: min(720px, 100%); max-height: min(82vh, 720px); overflow: auto; padding: 18px; border: 1px solid var(--border-subtle); border-radius: 14px 14px 0 0; background: var(--surface-bg); }
.ttr-insight header { display: flex; justify-content: space-between; gap: 12px; }
.ttr-insight header small { display: inline-flex; align-items: center; gap: 5px; color: var(--accent); font-size: 12px; }
.ttr-insight h3 { margin: 5px 0 0; font-size: 17px; }
.ttr-insight-body { min-height: 96px; margin-top: 14px; }
.ttr-content { white-space: pre-wrap; color: var(--text-body); line-height: 1.75; font-size: 14px; }
.ttr-status { color: var(--text-muted); font-size: 13px; }
.ttr-error { color: #b45309; font-size: 13px; }
.ttr-insight footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 12px; }
.ttr-insight footer small { color: var(--text-faint); font-size: 11px; }
.ttr-insight button, .ttr-auth button { cursor: pointer; }
.ttr-insight footer button { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; padding: 7px 12px; color: #fff; background: var(--accent); font-size: 12px; }
.ttr-auth { margin-top: 12px; padding: 12px; border: 1px solid var(--accent-border); border-radius: 10px; background: var(--accent-bg); }
.ttr-auth p { margin: 0 0 8px; font-size: 13px; }
.ttr-auth div { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ttr-auth button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-card); padding: 8px; font-size: 12px; }
[data-ttr-ai-target] { position: relative; cursor: pointer; transition: background-color 160ms ease, box-shadow 160ms ease; }
[data-ttr-ai-target]::after { content: '✦'; position: absolute; top: 5px; right: 5px; display: grid; place-items: center; width: 18px; height: 18px; border: 1px solid var(--accent-border); border-radius: 999px; background: var(--surface-bg); color: var(--accent); font-size: 10px; opacity: 0; transform: translateY(2px); pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; }
[data-ttr-ai-target]:hover, [data-ttr-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 62%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 65%, transparent); outline: none; }
[data-ttr-ai-target]:hover::after, [data-ttr-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }
.ttr-insight-enter-active, .ttr-insight-leave-active { transition: opacity 180ms ease; }
.ttr-insight-enter-from, .ttr-insight-leave-to { opacity: 0; }
@media (max-width: 760px) {
  .ttr-facts { grid-template-columns: 1fr 1fr; }
  .ttr-fields { grid-template-columns: 1fr; }
  .ttr-card-head { align-items: flex-start; flex-direction: column; }
}
</style>
