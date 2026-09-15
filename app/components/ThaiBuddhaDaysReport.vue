<template>
  <div
    ref="reportRoot"
    class="tbd"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="tbd-hero tbd-card" data-tbd-hero>
      <div class="tbd-hero-main">
        <span class="tbd-kicker">Thai Birthday Buddha</span>
        <h2>{{ $t(`thaiBuddha.days.${result.day.key}.name`) }}</h2>
        <p class="tbd-buddha">{{ $t(`thaiBuddha.days.${result.day.key}.buddha`) }}</p>
        <p class="tbd-posture">{{ $t(`thaiBuddha.days.${result.day.key}.posture`) }}</p>
      </div>
      <div class="tbd-hero-grid">
        <div>
          <span>{{ $t('thaiBuddha.birth') }}</span>
          <strong>{{ result.input.birthDate }} {{ result.input.birthTime }}</strong>
          <small>{{ result.input.timezone }}</small>
        </div>
        <div>
          <span>{{ $t('thaiBuddha.location') }}</span>
          <strong>{{ result.input.location?.name || $t('thaiBuddha.noLocation') }}</strong>
          <small>{{ result.methodology.calculationSource === 'observed-sun-events' ? $t('thaiBuddha.corrected') : $t('thaiBuddha.uncorrected') }}</small>
        </div>
        <div>
          <span>{{ $t('thaiBuddha.planet') }}</span>
          <strong>{{ $t(`thaiBuddha.planets.${result.day.planet}`) }}</strong>
          <small>{{ result.day.thai }}</small>
        </div>
        <div>
          <span>{{ $t('thaiBuddha.sunEvents') }}</span>
          <strong>{{ result.sunEvents.sunriseText }} / {{ result.sunEvents.sunsetText }}</strong>
          <small>{{ $t('thaiBuddha.sunEventHint') }}</small>
        </div>
      </div>
    </section>

    <section class="tbd-section">
      <header class="tbd-section-label">
        <h2>{{ $t('thaiBuddha.meaningTitle') }}</h2>
        <p>{{ $t('thaiBuddha.meaningSubtitle') }}</p>
      </header>
      <div class="tbd-grid">
        <article class="tbd-card">
          <h3>{{ $t('thaiBuddha.story') }}</h3>
          <p>{{ $t(`thaiBuddha.days.${result.day.key}.story`) }}</p>
        </article>
        <article class="tbd-card">
          <h3>{{ $t('thaiBuddha.personality') }}</h3>
          <p>{{ $t(`thaiBuddha.days.${result.day.key}.personality`) }}</p>
          <small>{{ $t(`thaiBuddha.days.${result.day.key}.professions`) }}</small>
        </article>
        <article class="tbd-card">
          <h3>{{ $t('thaiBuddha.timing') }}</h3>
          <dl>
            <div><dt>{{ $t('thaiBuddha.dayColor') }}</dt><dd>{{ $t(`thaiBuddha.colors.${result.colors.dayColor}`) }}</dd></div>
            <div><dt>{{ $t('thaiBuddha.luckyColor') }}</dt><dd>{{ $t(`thaiBuddha.colors.${result.colors.luckyColor}`) }}</dd></div>
            <div><dt>{{ $t('thaiBuddha.unluckyColor') }}</dt><dd>{{ $t(`thaiBuddha.colors.${result.colors.unluckyColor}`) }}</dd></div>
            <div><dt>{{ $t('thaiBuddha.luckyDay') }}</dt><dd>{{ $t(`thaiBuddha.days.${result.colors.luckyDay}.name`) }}</dd></div>
            <div><dt>{{ $t('thaiBuddha.unluckyDay') }}</dt><dd>{{ $t(`thaiBuddha.days.${result.colors.unluckyDay}.name`) }}</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <section class="tbd-section">
      <header class="tbd-section-label">
        <h2>{{ $t('thaiBuddha.taksaTitle') }}</h2>
        <p>{{ $t('thaiBuddha.taksaSubtitle') }}</p>
      </header>
      <div class="tbd-taksa-grid">
        <article
          v-for="house in result.mahaTaksa.houses"
          :key="house.house"
          class="tbd-card tbd-taksa"
          :class="{ 'is-avoid': house.house === 'kalakini' }"
        >
          <header>
            <strong>{{ $t(`thaiBuddha.houses.${house.house}`) }}</strong>
            <span>{{ $t(`thaiBuddha.directions.${house.direction}`) }}</span>
          </header>
          <p>{{ $t(`thaiBuddha.planets.${house.planet}`) }}</p>
          <small>
            {{ house.letterKind === 'vowels' ? $t('thaiBuddha.letters.vowels') : house.letters.join(' · ') }}
          </small>
          <em>{{ house.house === 'kalakini' ? $t('thaiBuddha.avoid') : $t('thaiBuddha.favorable') }}</em>
        </article>
      </div>
    </section>

    <section class="tbd-card tbd-method">
      <strong>{{ $t('thaiBuddha.methodology') }}</strong>
      <dl>
        <div><dt>{{ $t('thaiBuddha.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('thaiBuddha.rule') }}</dt><dd>{{ result.methodology.astronomy }}</dd></div>
        <div><dt>{{ $t('thaiBuddha.disclaimer') }}</dt><dd>{{ $t('thaiBuddha.disclaimerText') }}</dd></div>
      </dl>
    </section>

    <Teleport to="body">
      <Transition name="tbd-insight">
        <div v-if="insightOpen" class="tbd-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="tbd-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('thaiBuddha.aiPanelTitle')">
            <header class="tbd-insight-head">
              <div class="min-w-0">
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />{{ $t('thaiBuddha.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('thaiBuddha.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('thaiBuddha.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="tbd-insight-body">
              <div v-if="insightStatus === 'connecting'" class="tbd-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />{{ $t('thaiBuddha.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="tbd-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" /><span>{{ insightError }}</span>
              </div>
              <div v-else class="tbd-insight-content">{{ insightContent }}</div>
            </div>
            <footer class="tbd-insight-foot">
              <small>{{ $t('thaiBuddha.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="tbd-insight-auth">
              <p>{{ $t('thaiBuddha.aiLoginRequired') }}</p>
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
import type { ThaiBuddhaResult } from '~~/server/utils/tools/thai-buddha'

const props = defineProps<{ result: ThaiBuddhaResult }>()
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
  ? t('thaiBuddha.aiFullReport')
  : t('thaiBuddha.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.tbd-hero-grid > div',
  '.tbd-grid article',
  '.tbd-taksa',
  '.tbd-method',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const heading = node.querySelector<HTMLElement>('strong, h3')
  const section = node.closest<HTMLElement>('.tbd-section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.tbd-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('.tbd-section')
  return {
    section: normalizeText(section?.querySelector<HTMLElement>('.tbd-section-label h2')?.textContent ?? '') || normalizeText(node.querySelector('h2, h3')?.textContent ?? ''),
    group: '',
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return
  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.tbdAiTarget) continue
    node.dataset.tbdAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.tbdAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('thaiBuddha.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.tbdAiLabel || targetLabel(node)
  const context = targetContext(node)
  void streamInsight({ mode: 'target', target: { label, ...context }, title: label })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-tbd-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.tbdAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-tbd-ai-target]')
  if (target) activateTarget(target)
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('thaiBuddha.aiFullReportTitle')
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
    const response = await fetch('/api/tools/thai-buddha/interpret', {
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
            throw new Error(chunk.message || t('thaiBuddha.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }
    if (!insightContent.value) throw new Error(t('thaiBuddha.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('thaiBuddha.aiError')
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
.tbd { display: grid; gap: 30px; }
.tbd-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; }
.tbd-hero-main { display: grid; gap: 6px; margin-bottom: 20px; }
.tbd-kicker { color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.tbd-hero h2 { margin: 0; font-size: 26px; font-weight: 800; line-height: 1.2; }
.tbd-buddha { margin: 0; font-size: 17px; font-weight: 700; color: var(--accent); }
.tbd-posture { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.tbd-hero-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.tbd-hero-grid > div { min-width: 0; padding: 12px; border: 1px solid var(--border-subtle); border-radius: 10px; }
.tbd-hero-grid span, .tbd-card h3, .tbd-method strong { display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; }
.tbd-hero-grid strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 14px; }
.tbd-hero-grid small { display: block; margin-top: 3px; color: var(--text-faint); font-size: 11px; line-height: 1.4; }
.tbd-section-label h2 { margin: 0; font-size: 20px; color: var(--text-primary); }
.tbd-section-label p { margin: 5px 0 0; color: var(--text-muted); font-size: 13px; }
.tbd-section { display: grid; gap: 14px; }
.tbd-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.tbd-grid article p { margin: 9px 0 0; color: var(--text-body); font-size: 13px; line-height: 1.65; }
.tbd-grid article small { display: block; margin-top: 10px; color: var(--text-faint); font-size: 12px; line-height: 1.5; }
.tbd-grid dl, .tbd-method dl { margin: 10px 0 0; display: grid; gap: 8px; }
.tbd-grid dl div, .tbd-method dl div { display: flex; justify-content: space-between; gap: 10px; }
.tbd-grid dt, .tbd-method dt { color: var(--text-muted); font-size: 12px; }
.tbd-grid dd, .tbd-method dd { margin: 0; color: var(--text-primary); font-size: 12px; font-weight: 600; }
.tbd-taksa-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.tbd-taksa header { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.tbd-taksa strong { color: var(--text-primary); font-size: 13px; }
.tbd-taksa span { color: var(--text-muted); font-size: 11px; }
.tbd-taksa p { margin: 10px 0 0; color: var(--accent); font-size: 14px; font-weight: 700; }
.tbd-taksa small { display: block; margin-top: 6px; color: var(--text-muted); font-size: 12px; line-height: 1.4; }
.tbd-taksa em { display: block; margin-top: 9px; color: var(--text-faint); font-size: 10px; font-style: normal; }
.tbd-taksa.is-avoid { border-color: var(--accent-border); background: color-mix(in srgb, var(--accent-bg) 40%, transparent); }
.tbd-method { display: grid; gap: 4px; }
.tbd-method dd { max-width: 76ch; }
.tbd-insight-layer { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 18px; background: var(--overlay-bg); backdrop-filter: blur(10px); }
.tbd-insight { width: min(760px, 100%); max-height: min(82vh, 760px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; border: 1px solid var(--border-medium); border-radius: 14px; background: var(--surface-dropdown); }
.tbd-insight-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--border-light); }
.tbd-insight-head p { margin: 0; display: flex; align-items: center; gap: 6px; color: var(--accent); font-size: 11px; }
.tbd-insight-head h3 { margin: 5px 0 0; color: var(--text-primary); font-size: 16px; }
.tbd-insight-head button { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.tbd-insight-body { overflow: auto; padding: 18px; }
.tbd-insight-status, .tbd-insight-error { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 13px; }
.tbd-insight-error { color: #d0453c; }
.tbd-insight-content { white-space: pre-wrap; color: var(--text-body); font-size: 14px; line-height: 1.75; }
.tbd-insight-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px 18px; border-top: 1px solid var(--border-light); }
.tbd-insight-foot small { color: var(--text-faint); font-size: 10px; line-height: 1.4; }
.tbd-insight-foot button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--accent-border); border-radius: 8px; background: var(--accent-bg); color: var(--accent); padding: 7px 10px; font-size: 12px; cursor: pointer; }
.tbd-insight-auth { grid-column: 1 / -1; display: grid; gap: 9px; padding: 13px 18px 16px; border-top: 1px solid var(--border-light); }
.tbd-insight-auth p { margin: 0; color: var(--text-muted); font-size: 12px; }
.tbd-insight-auth div { display: flex; gap: 8px; flex-wrap: wrap; }
.tbd-insight-auth button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-input); color: var(--text-primary); padding: 7px 10px; font-size: 12px; cursor: pointer; }
[data-tbd-ai-target] { position: relative; cursor: pointer; border-radius: inherit; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
[data-tbd-ai-target]::after { content: '✦'; position: absolute; z-index: 5; top: 5px; right: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1px solid var(--accent-border); border-radius: 999px; background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg)); color: var(--accent); font-size: 10px; line-height: 1; opacity: 0; pointer-events: none; transform: translateY(2px); transition: opacity 140ms ease, transform 140ms ease; }
[data-tbd-ai-target]:hover, [data-tbd-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); border-color: var(--accent-border-hover); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
[data-tbd-ai-target]:hover::after, [data-tbd-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }
[data-tbd-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (max-width: 860px) {
  .tbd-grid, .tbd-taksa-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 620px) {
  .tbd-card { padding: 16px; }
  .tbd-hero h2 { font-size: 23px; }
  .tbd-hero-grid, .tbd-grid, .tbd-taksa-grid { grid-template-columns: 1fr; }
  .tbd-grid dl div { align-items: flex-start; flex-direction: column; gap: 2px; }
}
</style>
