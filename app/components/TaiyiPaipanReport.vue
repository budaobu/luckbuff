<template>
  <div
    ref="reportRoot"
    class="typ"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="typ-card typ-hero">
      <div>
        <span>{{ $t('taiyiPaipan.engineTime') }}</span>
        <strong>{{ result.input.engineTime }}</strong>
        <small>{{ result.input.engineTimeBasis }}</small>
      </div>
      <div>
        <span>{{ $t('taiyiPaipan.trueSolarTime') }}</span>
        <strong>{{ result.solarTime.trueSolarTime || $t('taiyiPaipan.uncorrected') }}</strong>
        <small>{{ result.input.location }}</small>
      </div>
      <div>
        <span>{{ $t('taiyiPaipan.method') }}</span>
        <strong>{{ result.summary.methodText }}</strong>
        <small>{{ result.summary.jiStyleText }} · {{ result.calendars.jieQi }}</small>
      </div>
      <div>
        <span>{{ $t('taiyiPaipan.dunJu') }}</span>
        <strong>{{ result.summary.juText }}</strong>
        <small>{{ result.summary.sancai }} · {{ result.summary.jiyuan }}</small>
      </div>
      <div>
        <span>{{ $t('taiyiPaipan.taiyiPalace') }}</span>
        <strong>{{ result.summary.taiyiPalaceName }}{{ $t('taiyiPaipan.palaceSuffix') }}</strong>
        <small>{{ result.summary.taiyiHomeAway }}</small>
      </div>
      <div>
        <span>{{ $t('taiyiPaipan.threeCount') }}</span>
        <strong>{{ result.summary.homeAwayRelation }}</strong>
        <small>{{ result.summary.victoryJudgement }}</small>
      </div>
    </section>

    <section class="typ-section">
      <header>
        <h2>{{ $t('taiyiPaipan.pillarTitle') }}</h2>
        <p>{{ $t('taiyiPaipan.calendarSubtitle') }}</p>
      </header>
      <div class="typ-card typ-table">
        <table>
          <thead>
            <tr>
              <th />
              <th v-for="pillar in result.pillars" :key="pillar.label">
                {{ $t(`taiyiPaipan.pillars.${pillar.label}`) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{{ $t('taiyiPaipan.ganzhi') }}</th>
              <td v-for="pillar in result.pillars" :key="`gan-${pillar.label}`">{{ pillar.ganzhi }}</td>
            </tr>
            <tr>
              <th>{{ $t('taiyiPaipan.xunKong') }}</th>
              <td v-for="pillar in result.pillars" :key="`void-${pillar.label}`">{{ pillar.xunKong.join('、') || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="typ-section">
      <header>
        <h2>{{ $t('taiyiPaipan.spiritTitle') }}</h2>
        <p>{{ $t('taiyiPaipan.spiritSubtitle') }}</p>
      </header>
      <div class="typ-grid typ-spirits">
        <article v-for="spirit in result.spirits" :key="spirit.label">
          <span>{{ spirit.label }}</span>
          <strong>{{ spirit.value }}</strong>
        </article>
      </div>
    </section>

    <section class="typ-section">
      <header>
        <h2>{{ $t('taiyiPaipan.calculationTitle') }}</h2>
        <p>{{ $t('taiyiPaipan.calculationSubtitle') }}</p>
      </header>
      <div class="typ-grid typ-calculations">
        <article v-for="calculation in result.calculations" :key="calculation.label">
          <header>
            <strong>{{ calculation.label }}</strong>
            <b>{{ calculation.value }}</b>
          </header>
          <p>{{ calculation.descriptions.join('；') || '—' }}</p>
          <footer>{{ $t('taiyiPaipan.general') }} {{ calculation.general }} · {{ $t('taiyiPaipan.viceGeneral') }} {{ calculation.viceGeneral }}</footer>
        </article>
      </div>
    </section>

    <section class="typ-section">
      <header>
        <h2>{{ $t('taiyiPaipan.boardTitle') }}</h2>
        <p>{{ $t('taiyiPaipan.boardSubtitle') }}</p>
      </header>
      <div class="typ-board">
        <article v-for="palace in result.chart.palaces" :key="palace.position" :class="{ 'is-center': palace.position === '中' }">
          <header>
            <strong>{{ palace.position }}</strong>
            <span>{{ palace.palaceNumber ? `${palace.palaceNumber}宫` : $t('taiyiPaipan.center') }}</span>
          </header>
          <p>{{ palace.gods.join('、') || '—' }}</p>
        </article>
      </div>
    </section>

    <section class="typ-section">
      <header>
        <h2>{{ $t('taiyiPaipan.doorTitle') }}</h2>
        <p>{{ $t('taiyiPaipan.doorSubtitle') }}</p>
      </header>
      <div class="typ-grid typ-doors">
        <article v-for="palace in result.chart.doors" :key="palace.palaceNumber" :class="{ 'is-taiyi': palace.isTaiyi }">
          <header>
            <strong>{{ palace.palaceName }}</strong>
            <b v-if="palace.door">{{ palace.door }}{{ $t('taiyiPaipan.doorSuffix') }}</b>
            <b v-else>—</b>
          </header>
          <span>{{ palace.direction }} · {{ palace.element }} · {{ palace.wangZhuai }}</span>
        </article>
      </div>
    </section>

    <section class="typ-section">
      <header>
        <h2>{{ $t('taiyiPaipan.patternTitle') }}</h2>
        <p>{{ $t('taiyiPaipan.patternSubtitle', { count: result.patterns.length }) }}</p>
      </header>
      <div class="typ-grid typ-patterns">
        <article v-for="pattern in result.patterns" :key="pattern.name">
          <strong>{{ pattern.name }}</strong>
          <p>{{ pattern.detail }}</p>
        </article>
      </div>
    </section>

    <section class="typ-card typ-method">
      <strong>{{ $t('taiyiPaipan.methodologyTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('taiyiPaipan.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('taiyiPaipan.rule') }}</dt><dd>{{ result.methodology.method }}</dd></div>
        <div><dt>{{ $t('taiyiPaipan.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('taiyiPaipan.trueSolarTime') }}</dt><dd>{{ result.solarTime.statusText }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="typ-panel">
        <div v-if="insightOpen" class="typ-layer" @click.self="closeInsight">
          <section class="typ-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('taiyiPaipan.aiPanelTitle')">
            <header>
              <div>
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" /> {{ $t('taiyiPaipan.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('taiyiPaipan.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('taiyiPaipan.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="typ-insight-body">
              <div v-if="insightStatus === 'connecting'" class="typ-status">{{ $t('taiyiPaipan.aiConnecting') }}</div>
              <div v-else-if="insightError" class="typ-error">{{ insightError }}</div>
              <div v-else class="typ-content">{{ insightContent }}</div>
            </div>
            <footer>
              <small>{{ $t('taiyiPaipan.aiDisclaimer') }}</small>
              <button v-if="insightMode === 'target' && insightStatus === 'complete'" type="button" @click="handleFullReport">
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="typ-auth">
              <p>{{ $t('taiyiPaipan.aiLoginRequired') }}</p>
              <div>
                <button type="button" @click="signInWithGoogle(route.fullPath)">Google</button>
                <button type="button" @click="signInWithTelegram(route.fullPath)">Telegram</button>
              </div>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { TaiyiPaipanResult } from '~~/app/types/taiyi-paipan'

const props = defineProps<{ result: TaiyiPaipanResult }>()
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
  ? t('taiyiPaipan.aiFullReport')
  : t('taiyiPaipan.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.typ-hero > div',
  '.typ-table td',
  '.typ-spirits article',
  '.typ-calculations article',
  '.typ-board article',
  '.typ-doors article',
  '.typ-patterns article',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.tagName === 'TD') {
    const row = node.closest('tr')
    const rowLabel = normalizeText(row?.querySelector<HTMLElement>('th')?.textContent ?? '')
    return [rowLabel, normalizeText(node.textContent ?? '')].filter(Boolean).join(' · ')
  }
  const heading = node.querySelector<HTMLElement>('strong')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('h2')?.textContent ?? '')
  return [sectionTitle, normalizeText(heading?.textContent ?? '')].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  return {
    section: normalizeText(section?.querySelector<HTMLElement>('h2')?.textContent ?? ''),
    group: '',
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return
  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.typAiTarget) continue
    node.dataset.typAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.typAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('taiyiPaipan.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.typAiLabel || targetLabel(node)
  void requestInsight({ selector: node.tagName.toLowerCase(), label, ...targetContext(node) })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-typ-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.typAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-typ-ai-target]')
  if (target) activateTarget(target)
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

function handleFullReport() {
  if (isLoggedIn.value) {
    authRequired.value = false
    insightMode.value = 'full'
    insightTitle.value = t('taiyiPaipan.aiFullReportTitle')
    void streamInsight({ mode: 'full', title: insightTitle.value })
    return
  }
  authRequired.value = true
}

function compactContext() {
  return [
    `起局：${props.result.input.engineTime}；计式：${props.result.summary.jiStyleText}；${props.result.summary.juText}`,
    `四柱：${props.result.pillars.map(item => item.ganzhi).join(' ')}`,
    `太乙：${props.result.summary.taiyiPalaceName}宫；文昌${props.result.summary.wenchang}；始击${props.result.summary.shiji}`,
    `主客：${props.result.summary.homeAwayRelation}；${props.result.summary.victoryJudgement}`,
    `十六宫：${props.result.chart.palaces.map(item => `${item.position}=${item.gods.join('/')}`).join('；')}`,
    `八门：${props.result.chart.doors.map(item => `${item.palaceName}${item.door || '无门'}${item.wangZhuai}`).join('；')}`,
    `格局：${props.result.patterns.map(item => item.name).join('、')}`,
  ].join('\n')
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
    const response = await fetch('/api/tools/taiyi-paipan/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({ ...payload, chart: props.result, chartContext: compactContext(), locale: locale.value }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message || data?.statusMessage || `HTTP ${response.status}`)
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
        const text = line.slice(5).trim()
        if (!text || text === '[DONE]') continue
        const chunk = JSON.parse(text)
        if (chunk.type === 'text' && chunk.text) {
          insightStatus.value = 'streaming'
          insightContent.value += chunk.text
        }
        else if (chunk.type === 'error') throw new Error(chunk.message || t('taiyiPaipan.aiError'))
      }
    }
    if (!insightContent.value) throw new Error(t('taiyiPaipan.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('taiyiPaipan.aiError')
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
.typ{display:grid;gap:30px}
.typ [data-typ-ai-target]{position:relative;cursor:pointer;border-radius:inherit;transition:background-color 160ms ease,border-color 160ms ease,box-shadow 160ms ease}
.typ [data-typ-ai-target]::after{content:'✦';position:absolute;z-index:5;top:5px;right:5px;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:1px solid var(--accent-border);border-radius:999px;background:color-mix(in srgb,var(--surface-bg) 88%,var(--accent-bg));color:var(--accent);font-size:10px;line-height:1;opacity:0;pointer-events:none;transform:translateY(2px);transition:opacity 140ms ease,transform 140ms ease}
.typ [data-typ-ai-target]:hover,.typ [data-typ-ai-target]:focus-visible{background-color:color-mix(in srgb,var(--accent-bg) 58%,transparent);border-color:var(--accent-border-hover);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent-bg) 68%,transparent)}
.typ [data-typ-ai-target]:hover::after,.typ [data-typ-ai-target]:focus-visible::after{opacity:1;transform:translateY(0)}
.typ [data-typ-ai-target]:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.typ-card,.typ-grid article,.typ-board article{background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:8px}
.typ-card{padding:20px}
.typ-hero{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.typ-hero span{display:block;margin-bottom:4px;color:var(--text-secondary);font-size:12px}
.typ-hero strong{display:block;font-size:18px;line-height:1.3}
.typ-hero small{display:block;margin-top:4px;color:var(--text-muted);font-size:12px}
.typ-section{display:grid;gap:14px}
.typ-section header h2{margin:0;font-size:18px}
.typ-section header p{margin:4px 0 0;color:var(--text-muted);font-size:13px}
.typ-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.typ-grid article{padding:14px}
.typ-grid article span,.typ-grid article header span{display:block;color:var(--text-muted);font-size:12px}
.typ-grid article strong{font-size:14px}
.typ-spirits article{display:grid;gap:5px}
.typ-calculations article b{font-size:24px}
.typ-calculations article p{min-height:38px;margin:7px 0;font-size:12px;color:var(--text-muted)}
.typ-calculations footer{font-size:12px;color:var(--text-secondary)}
.typ-table{overflow:auto}
.typ-table table{width:100%;border-collapse:collapse}
.typ-table th,.typ-table td{padding:11px 10px;border-bottom:1px solid var(--border-subtle);text-align:center;white-space:nowrap}
.typ-board{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.typ-board article{min-height:94px;padding:10px}
.typ-board header{display:flex;justify-content:space-between;font-size:13px}
.typ-board p{margin:9px 0 0;font-size:12px;line-height:1.5}
.typ-board .is-center{border-style:dashed}
.typ-doors article header{display:flex;justify-content:space-between;align-items:center;gap:8px}
.typ-doors article.is-taiyi{border-color:var(--accent-border-hover);box-shadow:inset 0 0 0 1px var(--accent-border-hover)}
.typ-patterns article p{margin:7px 0 0;color:var(--text-muted);font-size:12px}
.typ-method dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}
.typ-method dt{color:var(--text-muted);font-size:12px}
.typ-method dd{margin:2px 0 0;font-size:13px}
.typ-method p{margin:0;color:var(--text-muted);font-size:12px}
.typ-layer{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--overlay-bg);backdrop-filter:blur(6px)}
.typ-insight{display:grid;grid-template-rows:auto minmax(0,1fr) auto;width:min(720px,100%);max-height:82vh;background:var(--surface-elevated);border:1px solid var(--border-subtle);border-radius:8px;overflow:hidden}
.typ-insight header{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--border-subtle)}
.typ-insight header p{display:flex;align-items:center;gap:5px;margin:0;color:var(--accent);font-size:12px}
.typ-insight h3{margin:4px 0 0;font-size:16px}
.typ-insight button{border:0;background:transparent;color:var(--text-secondary);cursor:pointer}
.typ-insight-body{overflow:auto;padding:16px 18px;line-height:1.75;white-space:pre-wrap}
.typ-status,.typ-error{color:var(--text-muted);font-size:14px}
.typ-error{color:var(--error)}
.typ-insight footer{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:13px 18px;border-top:1px solid var(--border-subtle)}
.typ-insight footer small{color:var(--text-muted)}
.typ-insight footer button{padding:7px 12px;border:1px solid var(--accent-border);border-radius:6px;color:var(--accent);cursor:pointer}
.typ-auth{padding:14px 18px;border-top:1px solid var(--border-subtle)}
.typ-auth div{display:flex;gap:8px;margin-top:8px}
.typ-auth button{padding:7px 10px;border:1px solid var(--border-subtle);border-radius:6px;background:transparent;color:var(--text-primary);cursor:pointer}
.typ-panel-enter-active,.typ-panel-leave-active{transition:opacity .18s ease}
.typ-panel-enter-from,.typ-panel-leave-to{opacity:0}
@media (max-width:760px){
  .typ-hero,.typ-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .typ-board{grid-template-columns:repeat(3,minmax(0,1fr))}
  .typ-method dl{grid-template-columns:1fr}
}
</style>
