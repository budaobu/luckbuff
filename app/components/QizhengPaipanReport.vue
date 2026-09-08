<template>
  <div
    ref="reportRoot"
    class="qzpr"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="qzpr-card qzpr-hero">
      <div class="qzpr-hero-grid">
        <div>
          <span>{{ $t('qizhengChart.solar') }}</span>
          <strong>{{ result.basic.solarText }}</strong>
          <small>{{ result.basic.trueSolarText }} · {{ result.basic.timeBasis }}</small>
        </div>
        <div>
          <span>{{ $t('qizhengChart.birth') }}</span>
          <strong>{{ result.basic.lunarText }}</strong>
          <small>{{ result.basic.zodiac }} · {{ result.basic.genderText }} · {{ result.basic.dayNight }}</small>
        </div>
        <div>
          <span>{{ $t('qizhengChart.location') }}</span>
          <strong>{{ result.basic.locationName }}</strong>
          <small>{{ result.basic.coordinates }} · {{ result.basic.timezone }}</small>
        </div>
        <div>
          <span>{{ $t('qizhengChart.liming') }}</span>
          <strong>{{ result.liming.lifePalace }}命 / {{ result.liming.bodyPalace }}身</strong>
          <small>{{ result.liming.basis }}</small>
        </div>
      </div>
    </section>

    <section class="qzpr-section">
      <header class="qzpr-section-label">
        <h2>{{ $t('qizhengChart.pillarTitle') }}</h2>
        <p>{{ $t('qizhengChart.pillarSubtitle') }}</p>
      </header>
      <div class="qzpr-card qzpr-pillars">
        <table>
          <thead>
            <tr><th /><th v-for="pillar in result.pillars" :key="pillar.key">{{ pillar.label }}</th></tr>
          </thead>
          <tbody>
            <tr><th>{{ $t('qizhengChart.ganzhi') }}</th><td v-for="pillar in result.pillars" :key="`gz-${pillar.key}`"><b>{{ pillar.ganzhi }}</b></td></tr>
            <tr><th>{{ $t('qizhengChart.nayin') }}</th><td v-for="pillar in result.pillars" :key="`ny-${pillar.key}`">{{ pillar.nayin }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="qzpr-section">
      <header class="qzpr-section-label">
        <h2>{{ $t('qizhengChart.planetTitle') }}</h2>
        <p>{{ $t('qizhengChart.planetSubtitle') }}</p>
      </header>
      <div class="qzpr-card qzpr-table-wrap">
        <table class="qzpr-planet-table">
          <thead>
            <tr>
              <th>{{ $t('qizhengChart.star') }}</th><th>{{ $t('qizhengChart.ecliptic') }}</th><th>{{ $t('qizhengChart.branch') }}</th>
              <th>{{ $t('qizhengChart.mansion') }}</th><th>{{ $t('qizhengChart.latitude') }}</th><th>{{ $t('qizhengChart.speed') }}</th><th>{{ $t('qizhengChart.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="planet in result.planets" :key="planet.key" :class="{ 'is-remnant': planet.category === '四余' }">
              <td><b>{{ planet.name }}</b><small>{{ planet.category }}</small></td>
              <td>{{ planet.longitude }}°</td>
              <td>{{ planet.branch }}{{ planet.branchDegree }}°</td>
              <td>{{ planet.mansion }}{{ planet.mansionDegree }}°</td>
              <td>{{ planet.latitude }}°</td>
              <td>{{ planet.speed }}°/日</td>
              <td>{{ planet.status.join('、') || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="qzpr-section">
      <header class="qzpr-section-label">
        <h2>{{ $t('qizhengChart.palaceTitle') }}</h2>
        <p>{{ $t('qizhengChart.palaceSubtitle') }}</p>
      </header>
      <div class="qzpr-palace-grid">
        <article v-for="palace in result.palaces" :key="palace.name" class="qzpr-card qzpr-palace">
          <header>
            <strong>{{ palace.name }} · {{ palace.branch }}</strong>
            <span>{{ palace.lord }}主 · {{ palace.headLongitude }}°</span>
          </header>
          <div class="qzpr-stars">
            <span v-for="star in palace.stars" :key="`${palace.name}-${star}`">{{ star }}</span>
            <small v-if="!palace.stars.length">—</small>
          </div>
          <footer>
            <span v-for="item in palace.shensha" :key="`${palace.name}-${item}`">{{ item }}</span>
            <small v-if="!palace.shensha.length">—</small>
          </footer>
        </article>
      </div>
    </section>

    <section class="qzpr-section">
      <header class="qzpr-section-label">
        <h2>{{ $t('qizhengChart.signalTitle') }}</h2>
        <p>{{ $t('qizhengChart.signalSubtitle') }}</p>
      </header>
      <div class="qzpr-two-grid">
        <div class="qzpr-card qzpr-list">
          <article v-for="relation in result.relations" :key="relation.label">
            <strong>{{ relation.label }}</strong>
            <small>{{ relation.type }} · 容许度 {{ relation.orb }}°</small>
          </article>
          <p v-if="!result.relations.length">{{ $t('qizhengChart.noRelation') }}</p>
        </div>
        <div class="qzpr-card qzpr-list">
          <article v-for="item in result.keyShensha" :key="item.name">
            <strong>{{ item.name }} · {{ item.branch }}</strong>
            <small>{{ item.note }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="qzpr-section">
      <header class="qzpr-section-label">
        <h2>{{ $t('qizhengChart.cycleTitle') }}</h2>
        <p>{{ $t('qizhengChart.cycleSubtitle') }}</p>
      </header>
      <div class="qzpr-cycle-grid">
        <div class="qzpr-card qzpr-list">
          <article v-for="cycle in result.dayuns" :key="cycle.label" :class="{ 'is-current': cycle.isCurrent }">
            <strong>{{ cycle.label }}</strong>
            <small>{{ cycle.detail }}</small>
            <em v-if="cycle.isCurrent">{{ $t('qizhengChart.current') }}</em>
          </article>
        </div>
        <div class="qzpr-card qzpr-flow-list">
          <article v-for="year in result.flowYears" :key="year.year" :class="{ 'is-current': year.isCurrent }">
            <strong>{{ year.year }}</strong>
            <small>{{ year.ganzhi }} · {{ year.age }}岁 · {{ year.shortName }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="qzpr-card qzpr-methodology">
      <strong>{{ $t('qizhengChart.methodology') }}</strong>
      <dl>
        <div><dt>{{ $t('qizhengChart.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('qizhengChart.rule') }}</dt><dd>{{ result.methodology.astronomy }}</dd></div>
        <div><dt>{{ $t('qizhengChart.time') }}</dt><dd>{{ result.methodology.time }}</dd></div>
        <div><dt>{{ $t('qizhengChart.disclaimer') }}</dt><dd>{{ result.methodology.disclaimer }}</dd></div>
      </dl>
    </section>

    <Teleport to="body">
      <Transition name="qzpr-insight">
        <div v-if="insightOpen" class="qzpr-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="qzpr-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('qizhengChart.aiPanelTitle')">
            <header class="qzpr-insight-head">
              <div class="min-w-0">
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />{{ $t('qizhengChart.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('qizhengChart.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('qizhengChart.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="qzpr-insight-body">
              <div v-if="insightStatus === 'connecting'" class="qzpr-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />{{ $t('qizhengChart.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="qzpr-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" /><span>{{ insightError }}</span>
              </div>
              <div v-else class="qzpr-insight-content">{{ insightContent }}</div>
            </div>
            <footer class="qzpr-insight-foot">
              <small>{{ $t('qizhengChart.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="qzpr-insight-auth">
              <p>{{ $t('qizhengChart.aiLoginRequired') }}</p>
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
import type { QizhengPaipanResult } from '~~/app/types/qizheng-paipan'

const props = defineProps<{ result: QizhengPaipanResult }>()
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
  ? t('qizhengChart.aiFullReport')
  : t('qizhengChart.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.qzpr-hero-grid > div',
  '.qzpr-pillars td',
  '.qzpr-planet-table tbody tr',
  '.qzpr-palace',
  '.qzpr-list article',
  '.qzpr-flow-list article',
  '.qzpr-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.tagName === 'TR') {
    return normalizeText(node.querySelector<HTMLElement>('td:first-child')?.textContent ?? '')
  }
  const row = node.closest<HTMLElement>('tr')
  if (node.tagName === 'TD' && row) {
    return normalizeText([row.querySelector<HTMLElement>('td:first-child')?.textContent, node.textContent].filter(Boolean).join(' · '))
  }
  const heading = node.querySelector<HTMLElement>('strong, h3, b')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.qzpr-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.qzpr-section-label h2')?.textContent ?? '')
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
    if (node.closest('button') || node.dataset.qzprAiTarget) continue
    node.dataset.qzprAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.qzprAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('qizhengChart.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.qzprAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({ selector: node.className || node.tagName.toLowerCase(), label, ...context })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-qzpr-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.qzprAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-qzpr-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const r = props.result
  return [
    `出生：${r.basic.solarText} ${r.basic.genderText}；真太阳时：${r.basic.trueSolarText}；${r.basic.locationName}；${r.basic.dayNight}`,
    `四柱：${r.pillars.map(item => item.ganzhi).join(' ')}；节气：${r.jieqi.previous} → ${r.jieqi.next}`,
    `命身：${r.liming.lifePalace}命/${r.liming.bodyPalace}身；${r.liming.basis}`,
    `十一曜：${r.planets.map(item => `${item.name}@${item.branch}${item.branchDegree}/${item.mansion}${item.mansionDegree}${item.status.length ? `(${item.status.join(',')})` : ''}`).join('；')}`,
    `十二宫：${r.palaces.map(item => `${item.name}@${item.branch}(${item.stars.join('/') || '空'}；${item.shensha.join('/') || '无煞'})`).join('；')}`,
    `关系：${r.relations.map(item => `${item.label}(${item.orb}°)`).join('；') || '未检出'}`,
    `大运：${r.dayuns.map(item => `${item.label}${item.isCurrent ? '[当前]' : ''}`).join('、')}`,
    `流年：${r.flowYears.map(item => `${item.year}${item.ganzhi}@${item.shortName}`).join('、')}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('qizhengChart.aiFullReportTitle')
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
    const response = await fetch('/api/tools/qizheng-paipan/interpret', {
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
            throw new Error(chunk.message || t('qizhengChart.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }
    if (!insightContent.value) throw new Error(t('qizhengChart.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('qizhengChart.aiError')
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
.qzpr { display: grid; gap: 32px; }

[data-qzpr-ai-target] { position: relative; cursor: pointer; border-radius: inherit; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
[data-qzpr-ai-target]::after { content: '✦'; position: absolute; z-index: 5; top: 5px; right: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1px solid var(--accent-border); border-radius: 999px; background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg)); color: var(--accent); font-size: 10px; line-height: 1; opacity: 0; pointer-events: none; transform: translateY(2px); transition: opacity 140ms ease, transform 140ms ease; }
[data-qzpr-ai-target]:hover, [data-qzpr-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); border-color: var(--accent-border-hover); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
[data-qzpr-ai-target]:hover::after, [data-qzpr-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }
[data-qzpr-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.qzpr-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; }
.qzpr-hero { padding: 22px; }
.qzpr-hero-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.qzpr-hero-grid span, .qzpr-hero-grid small { display: block; color: var(--text-faint); font-size: 12px; }
.qzpr-hero-grid strong { display: block; margin: 7px 0; font-size: 18px; }
.qzpr-section { display: grid; gap: 14px; }
.qzpr-section-label h2 { margin: 0; font-size: 18px; }
.qzpr-section-label p { margin: 4px 0 0; color: var(--text-faint); font-size: 13px; }
.qzpr-pillars { overflow: auto; }
.qzpr-pillars table { width: 100%; border-collapse: collapse; text-align: center; }
.qzpr-pillars th, .qzpr-pillars td { min-width: 92px; padding: 10px; border-bottom: 1px solid var(--border-subtle); font-size: 14px; }
.qzpr-pillars tbody th { color: var(--text-faint); font-size: 12px; text-align: left; }
.qzpr-pillars b { font-size: 20px; }
.qzpr-table-wrap { overflow: auto; }
.qzpr-planet-table { width: 100%; min-width: 780px; border-collapse: collapse; }
.qzpr-planet-table th, .qzpr-planet-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-subtle); font-size: 13px; text-align: left; white-space: nowrap; }
.qzpr-planet-table thead th { color: var(--text-faint); font-weight: 600; }
.qzpr-planet-table b { display: block; }
.qzpr-planet-table small { color: var(--text-faint); font-size: 11px; }
.qzpr-palace-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.qzpr-palace { padding: 16px; }
.qzpr-palace header strong { display: block; font-size: 15px; }
.qzpr-palace header span { color: var(--text-faint); font-size: 12px; }
.qzpr-stars { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0; }
.qzpr-stars span { border: 1px solid var(--accent-border); color: var(--accent); border-radius: 999px; padding: 2px 8px; font-size: 12px; }
.qzpr-palace footer { display: flex; flex-wrap: wrap; gap: 5px; color: var(--text-muted); font-size: 12px; }
.qzpr-palace footer span { color: var(--text-muted); }
.qzpr-two-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: start; }
.qzpr-list { display: grid; gap: 10px; }
.qzpr-list article { padding: 10px 12px; border: 1px solid var(--border-subtle); border-radius: 10px; }
.qzpr-list article strong { display: block; font-size: 14px; }
.qzpr-list article small { color: var(--text-muted); font-size: 12px; }
.qzpr-list article.is-current { border-color: var(--accent-border); background: color-mix(in srgb, var(--accent-bg) 42%, transparent); }
.qzpr-cycle-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 14px; align-items: start; }
.qzpr-flow-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.qzpr-flow-list article { padding: 8px 10px; border: 1px solid var(--border-subtle); border-radius: 8px; }
.qzpr-flow-list article.is-current { border-color: var(--accent-border); background: color-mix(in srgb, var(--accent-bg) 42%, transparent); }
.qzpr-methodology dl { margin: 14px 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; }
.qzpr-methodology dt { color: var(--text-faint); font-size: 12px; }
.qzpr-methodology dd { margin: 4px 0 0; font-size: 13px; line-height: 1.6; }
.qzpr-insight-layer { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.5); backdrop-filter: blur(6px); }
.qzpr-insight { width: min(680px, 100%); max-height: min(78vh, 680px); display: grid; grid-template-rows: auto minmax(0,1fr) auto auto; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); }
.qzpr-insight-head { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; padding: 18px; border-bottom: 1px solid var(--border-subtle); }
.qzpr-insight-head p { display: flex; align-items: center; gap: 5px; margin: 0; color: var(--accent); font-size: 12px; }
.qzpr-insight-head h3 { margin: 6px 0 0; font-size: 16px; }
.qzpr-insight-head button { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.qzpr-insight-body { overflow: auto; padding: 18px; }
.qzpr-insight-content { white-space: pre-wrap; font-size: 14px; line-height: 1.7; }
.qzpr-insight-status, .qzpr-insight-error { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 14px; }
.qzpr-insight-error { color: var(--danger, #dc2626); }
.qzpr-insight-foot { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1px solid var(--border-subtle); }
.qzpr-insight-foot small { color: var(--text-faint); }
.qzpr-insight-foot button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--accent-border); border-radius: 8px; background: color-mix(in srgb, var(--accent-bg) 58%, transparent); color: var(--accent); padding: 7px 11px; font-size: 13px; cursor: pointer; }
.qzpr-insight-auth { padding: 14px 18px 18px; border-top: 1px dashed var(--border-subtle); }
.qzpr-insight-auth p { margin: 0 0 10px; font-size: 13px; }
.qzpr-insight-auth div { display: flex; gap: 8px; }
.qzpr-insight-auth button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border-subtle); border-radius: 8px; background: transparent; color: var(--text-primary); padding: 9px; cursor: pointer; }
.qzpr-insight-enter-active, .qzpr-insight-leave-active { transition: opacity 180ms ease; }
.qzpr-insight-enter-active .qzpr-insight, .qzpr-insight-leave-active .qzpr-insight { transition: transform 180ms ease; }
.qzpr-insight-enter-from, .qzpr-insight-leave-to { opacity: 0; }
.qzpr-insight-enter-from .qzpr-insight, .qzpr-insight-leave-to .qzpr-insight { transform: translateY(10px) scale(.98); }

@media (max-width: 900px) {
  .qzpr-hero-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .qzpr-palace-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .qzpr-cycle-grid, .qzpr-two-grid { grid-template-columns: 1fr; }
  .qzpr-methodology dl { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .qzpr-hero-grid, .qzpr-palace-grid { grid-template-columns: 1fr; }
  .qzpr-card { padding: 16px; }
  .qzpr-hero-grid strong { font-size: 16px; }
  .qzpr-insight { max-height: 88vh; }
}
</style>
