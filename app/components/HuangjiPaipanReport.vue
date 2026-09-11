<template>
  <div
    ref="reportRoot"
    class="hjp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="hjp-card hjp-hero">
      <div class="hjp-hero-grid">
        <div>
          <span>{{ $t('huangjiPaipan.report.year') }}</span>
          <strong>{{ result.year }} · {{ result.ganzhi }}</strong>
          <small>{{ $t('huangjiPaipan.report.jinian') }} {{ result.jinian }}</small>
        </div>
        <div>
          <span>{{ $t('huangjiPaipan.report.annualHexagram') }}</span>
          <strong>{{ result.layers.annual.name }}</strong>
          <small>{{ result.layers.annual.meaning }}</small>
        </div>
        <div>
          <span>{{ $t('huangjiPaipan.report.currentYao') }}</span>
          <strong>{{ result.yao.label }}</strong>
          <small>{{ result.yao.dangWei ? $t('huangjiPaipan.report.dangWei') : $t('huangjiPaipan.report.buDangWei') }}</small>
        </div>
        <div>
          <span>{{ $t('huangjiPaipan.report.scheme') }}</span>
          <strong>{{ result.methodology.scheme }}</strong>
          <small>{{ result.methodology.evidenceLevel }}</small>
        </div>
      </div>
    </section>

    <section class="hjp-section">
      <header class="hjp-section-label">
        <h2>{{ $t('huangjiPaipan.report.chronologyTitle') }}</h2>
        <p>{{ $t('huangjiPaipan.report.chronologySubtitle') }}</p>
      </header>
      <div class="hjp-card">
        <dl class="hjp-definition">
          <div>
            <dt>{{ $t('huangjiPaipan.units.yuan') }}</dt>
            <dd>{{ result.chronology.yuan.label }}</dd>
            <small>{{ result.chronology.yuan.range }} · {{ $t('huangjiPaipan.report.yearN', { n: result.chronology.yuan.yearInRange }) }}</small>
          </div>
          <div>
            <dt>{{ $t('huangjiPaipan.units.hui') }}</dt>
            <dd>{{ result.chronology.hui.label }}</dd>
            <small>{{ result.chronology.hui.range }} · {{ $t('huangjiPaipan.report.yearN', { n: result.chronology.hui.yearInRange }) }}</small>
          </div>
          <div>
            <dt>{{ $t('huangjiPaipan.units.yun') }}</dt>
            <dd>{{ result.chronology.yun.label }}</dd>
            <small>{{ result.chronology.yun.range }} · {{ $t('huangjiPaipan.report.yearN', { n: result.chronology.yun.yearInRange }) }}</small>
          </div>
          <div>
            <dt>{{ $t('huangjiPaipan.units.shi') }}</dt>
            <dd>{{ result.chronology.shi.label }}</dd>
            <small>{{ result.chronology.shi.range }} · {{ $t('huangjiPaipan.report.yearN', { n: result.chronology.shi.yearInRange }) }}</small>
          </div>
        </dl>
      </div>
    </section>

    <section class="hjp-section">
      <header class="hjp-section-label">
        <h2>{{ $t('huangjiPaipan.report.layersTitle') }}</h2>
        <p>{{ $t('huangjiPaipan.report.layersSubtitle') }}</p>
      </header>
      <div class="hjp-layer-grid">
        <article v-for="layer in layerCards" :key="layer.key">
          <header>
            <strong>{{ layer.title }}</strong>
            <span>{{ layer.value }}</span>
          </header>
          <p>{{ layer.detail }}</p>
          <small>{{ layer.meta }}</small>
        </article>
      </div>
    </section>

    <section class="hjp-section">
      <header class="hjp-section-label">
        <h2>{{ $t('huangjiPaipan.report.annualTitle') }}</h2>
        <p>{{ $t('huangjiPaipan.report.annualSubtitle') }}</p>
      </header>
      <div class="hjp-annual-grid">
        <article class="hjp-card">
          <strong>{{ result.layers.annual.name }}</strong>
          <p>{{ result.layers.annual.guaci }}</p>
          <small>{{ $t('huangjiPaipan.report.annualCycle', { n: result.positions.annualIndex }) }}</small>
        </article>
        <article class="hjp-card">
          <strong>{{ result.yao.label }}</strong>
          <p>{{ result.yao.text }}</p>
          <small>{{ result.yao.dangWei ? $t('huangjiPaipan.report.dangWei') : $t('huangjiPaipan.report.buDangWei') }}</small>
        </article>
        <article class="hjp-card">
          <strong>{{ result.layers.decade.name }}</strong>
          <p>{{ $t('huangjiPaipan.report.decadeLine', { n: result.positions.decadeLine }) }}</p>
          <small>{{ $t('huangjiPaipan.report.yearInJiazi', { n: result.positions.yearInJiaziCycle }) }}</small>
        </article>
        <article class="hjp-card">
          <strong>{{ result.layers.jiazi60.name }}</strong>
          <p>{{ $t('huangjiPaipan.report.jiaziLine', { n: result.positions.jiaziLine }) }}</p>
          <small v-if="result.adjustments.jiaziStartSkippedPrincipal">{{ $t('huangjiPaipan.report.skippedPrincipal') }}</small>
          <small v-else>{{ $t('huangjiPaipan.report.noAdjustment') }}</small>
        </article>
      </div>
    </section>

    <section class="hjp-card hjp-methodology">
      <strong>{{ $t('huangjiPaipan.report.methodologyTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('huangjiPaipan.report.scheme') }}</dt><dd>{{ result.methodology.scheme }}</dd></div>
        <div><dt>{{ $t('huangjiPaipan.report.evidence') }}</dt><dd>{{ result.methodology.evidenceLevel }}</dd></div>
        <div><dt>{{ $t('huangjiPaipan.report.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('huangjiPaipan.report.cycle') }}</dt><dd>{{ result.methodology.cycle }}</dd></div>
        <div><dt>{{ $t('huangjiPaipan.report.order') }}</dt><dd>{{ result.methodology.order }}</dd></div>
      </dl>
      <p>{{ $t('huangjiPaipan.report.disclaimer') }}</p>
    </section>

    <Teleport to="body">
      <Transition name="hjp-insight">
        <div v-if="insightOpen" class="hjp-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="hjp-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('huangjiPaipan.aiPanelTitle')">
            <header class="hjp-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('huangjiPaipan.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('huangjiPaipan.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('huangjiPaipan.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="hjp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="hjp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('huangjiPaipan.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="hjp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="hjp-insight-content">{{ insightContent }}</div>
            </div>
            <footer class="hjp-insight-foot">
              <small>{{ $t('huangjiPaipan.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="hjp-insight-auth">
              <p>{{ $t('huangjiPaipan.aiLoginRequired') }}</p>
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
import type { HuangjiPaipanResult } from '~~/server/utils/huangji/paipan'

const props = defineProps<{ result: HuangjiPaipanResult }>()
const route = useRoute()
const { t, locale } = useI18n()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const reportRoot = ref<HTMLElement | null>(null)

const layerCards = computed(() => {
  const layers = props.result.layers
  const positions = props.result.positions
  return [
    { key: 'yuan', title: t('huangjiPaipan.layer.yuan'), value: layers.yuan.name, detail: layers.yuan.meaning, meta: layers.yuan.guaci },
    { key: 'season', title: t('huangjiPaipan.layer.seasonPrincipal'), value: layers.seasonPrincipal.name, detail: layers.seasonPrincipal.meaning, meta: t('huangjiPaipan.report.yearInSeason', { n: positions.yearInSeason }) },
    { key: 'term', title: t('huangjiPaipan.layer.term'), value: layers.term.name, detail: layers.term.meaning, meta: t('huangjiPaipan.report.termLine', { n: positions.termLine }) },
    { key: 'hui', title: t('huangjiPaipan.layer.hui'), value: layers.hui.name, detail: layers.hui.meaning, meta: layers.hui.guaci },
    { key: 'duty', title: t('huangjiPaipan.layer.duty2160'), value: layers.duty2160.name, detail: layers.duty2160.meaning, meta: t('huangjiPaipan.report.yearInDuty', { n: positions.yearInDuty }) },
    { key: 'yun', title: t('huangjiPaipan.layer.yun360'), value: layers.yun360.name, detail: layers.yun360.meaning, meta: t('huangjiPaipan.report.yunLine', { n: positions.yunLine }) },
    { key: 'raw', title: t('huangjiPaipan.layer.rawJiazi'), value: layers.rawJiazi60.name, detail: layers.rawJiazi60.meaning, meta: t('huangjiPaipan.report.jiaziLine', { n: positions.jiaziLine }) },
    { key: 'jiazi', title: t('huangjiPaipan.layer.jiazi'), value: layers.jiazi60.name, detail: layers.jiazi60.meaning, meta: t('huangjiPaipan.report.yearInJiazi', { n: positions.yearInJiaziCycle }) },
    { key: 'decade', title: t('huangjiPaipan.layer.decade'), value: layers.decade.name, detail: layers.decade.meaning, meta: t('huangjiPaipan.report.decadeLine', { n: positions.decadeLine }) },
    { key: 'annual', title: t('huangjiPaipan.layer.annual'), value: layers.annual.name, detail: layers.annual.meaning, meta: t('huangjiPaipan.report.annualCycle', { n: positions.annualIndex }) },
  ]
})

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null

const insightFullLabel = computed(() => isLoggedIn.value
  ? t('huangjiPaipan.aiFullReport')
  : t('huangjiPaipan.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.hjp-hero-grid > div',
  '.hjp-definition > div',
  '.hjp-layer-grid article',
  '.hjp-annual-grid article',
  '.hjp-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const heading = node.querySelector<HTMLElement>('strong, b, dt')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.hjp-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 40)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.hjp-section-label h2')?.textContent ?? '')
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
    if (node.closest('button') || node.dataset.hjpAiTarget === 'true') continue
    node.dataset.hjpAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.hjpAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('huangjiPaipan.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.hjpAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({ selector: node.className || node.tagName.toLowerCase(), label, ...context })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-hjp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.hjpAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-hjp-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const result = props.result
  const layers = Object.entries(result.layers).map(([key, gua]) => `${key}:${gua.name}`)
  return [
    `年份：${result.year}（${result.ganzhi}）；皇极积年：${result.jinian}`,
    `元：${result.chronology.yuan.label} 第${result.chronology.yuan.yearInRange}年；会：${result.chronology.hui.label} 第${result.chronology.hui.yearInRange}年`,
    `运：${result.chronology.yun.label} 第${result.chronology.yun.yearInRange}年；世：${result.chronology.shi.label} 第${result.chronology.shi.yearInRange}年`,
    `层级卦：${layers.join('；')}`,
    `60年卦调整：${result.adjustments.jiaziStartSkippedPrincipal ? '原始世卦落四正，年度起点跳过' : '无需跳过'}`,
    `值爻：${result.yao.label}（${result.yao.dangWei ? '当位' : '不当位'}）${result.yao.text}`,
    `口径：${result.methodology.scheme}；${result.methodology.order}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('huangjiPaipan.aiFullReportTitle')
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
    const response = await fetch('/api/tools/huangji-paipan/interpret', {
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
            throw new Error(chunk.message || t('huangjiPaipan.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }
    if (!insightContent.value) throw new Error(t('huangjiPaipan.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('huangjiPaipan.aiError')
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
.hjp { display: grid; gap: 34px; }
.hjp-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; }
.hjp-hero-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
.hjp-hero-grid > div { min-width: 0; }
.hjp-hero-grid span, .hjp-definition dt, .hjp-layer-grid header strong, .hjp-methodology dt { display: block; margin-bottom: 6px; color: var(--text-faint); font-size: 12px; }
.hjp-hero-grid strong, .hjp-definition dd, .hjp-layer-grid header span { display: block; margin: 0; color: var(--text-primary); font-size: 18px; line-height: 1.3; }
.hjp-hero-grid small, .hjp-definition small, .hjp-layer-grid small, .hjp-annual-grid small { display: block; margin-top: 6px; color: var(--text-muted); font-size: 12px; line-height: 1.5; }
.hjp-section-label h2 { margin: 0; color: var(--text-primary); font-size: 18px; }
.hjp-section-label p { margin: 6px 0 0; color: var(--text-muted); font-size: 13px; }
.hjp-definition { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin: 0; }
.hjp-layer-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.hjp-layer-grid article { border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--surface-card); padding: 16px; min-width: 0; }
.hjp-layer-grid p { display: -webkit-box; overflow: hidden; margin: 10px 0 0; color: var(--text-muted); font-size: 13px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.hjp-annual-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.hjp-annual-grid strong { display: block; margin-bottom: 8px; color: var(--text-primary); font-size: 17px; }
.hjp-annual-grid p { min-height: 52px; margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.hjp-methodology strong { display: block; margin-bottom: 16px; color: var(--text-primary); font-size: 15px; }
.hjp-methodology dl { display: grid; gap: 10px; margin: 0; }
.hjp-methodology dd { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.hjp-methodology > p { margin: 16px 0 0; color: var(--text-faint); font-size: 12px; line-height: 1.6; }

[data-hjp-ai-target] { position: relative; cursor: pointer; border-radius: inherit; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
[data-hjp-ai-target]::after { content: '✦'; position: absolute; z-index: 5; top: 5px; right: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1px solid var(--accent-border); border-radius: 999px; background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg)); color: var(--accent); font-size: 10px; line-height: 1; opacity: 0; pointer-events: none; transform: translateY(2px); transition: opacity 140ms ease, transform 140ms ease; }
[data-hjp-ai-target]:hover, [data-hjp-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); border-color: var(--accent-border-hover); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
[data-hjp-ai-target]:hover::after, [data-hjp-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }
[data-hjp-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.hjp-insight-layer { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(15, 17, 23, .56); backdrop-filter: blur(10px); }
.hjp-insight { width: min(760px, 100%); max-height: min(80vh, 720px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); }
.hjp-insight-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; border-bottom: 1px solid var(--border-subtle); }
.hjp-insight-head p { display: flex; align-items: center; gap: 6px; margin: 0; color: var(--accent); font-size: 12px; }
.hjp-insight-head h3 { margin: 6px 0 0; overflow: hidden; color: var(--text-primary); font-size: 17px; text-overflow: ellipsis; white-space: nowrap; }
.hjp-insight-head button, .hjp-insight-foot button, .hjp-insight-auth button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border-subtle); border-radius: 8px; background: transparent; color: var(--text-primary); cursor: pointer; font-size: 13px; padding: 8px 12px; }
.hjp-insight-body { overflow: auto; padding: 20px; }
.hjp-insight-status, .hjp-insight-error { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 14px; }
.hjp-insight-error { color: var(--color-danger, #d9534f); }
.hjp-insight-content { color: var(--text-primary); font-size: 14px; line-height: 1.75; white-space: pre-wrap; }
.hjp-insight-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; border-top: 1px solid var(--border-subtle); }
.hjp-insight-foot small { color: var(--text-faint); font-size: 12px; }
.hjp-insight-auth { padding: 16px 20px; border-top: 1px solid var(--border-subtle); }
.hjp-insight-auth p { margin: 0 0 10px; color: var(--text-muted); font-size: 13px; }
.hjp-insight-auth div { display: flex; gap: 8px; }
.hjp-insight-enter-active, .hjp-insight-leave-active { transition: opacity .18s ease; }
.hjp-insight-enter-from, .hjp-insight-leave-to { opacity: 0; }

@media (max-width: 960px) {
  .hjp-hero-grid, .hjp-definition, .hjp-annual-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hjp-layer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 620px) {
  .hjp-hero-grid, .hjp-definition, .hjp-annual-grid { grid-template-columns: 1fr; }
  .hjp-layer-grid { grid-template-columns: 1fr; }
  .hjp-insight-foot { align-items: flex-start; flex-direction: column; }
}
</style>
