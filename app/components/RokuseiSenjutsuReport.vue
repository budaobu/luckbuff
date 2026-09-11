<template>
  <div
    ref="reportRoot"
    class="rks"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="rks-card rks-hero">
      <div class="rks-hero-main">
        <p>{{ $t('rokusei.report.destinyStar') }}</p>
        <h2>{{ starName }} {{ signText }}</h2>
        <strong v-if="result.birth.isReigo">{{ $t('rokusei.report.reigoBadge') }}</strong>
      </div>
      <div class="rks-hero-facts">
        <div>
          <span>{{ $t('rokusei.report.starNumber') }}</span>
          <strong>{{ result.birth.starNumber }}</strong>
        </div>
        <div>
          <span>{{ $t('rokusei.report.dayGanZhi') }}</span>
          <strong>{{ result.birth.dayGanZhi }}</strong>
        </div>
        <div>
          <span>{{ $t('rokusei.report.yearBranch') }}</span>
          <strong>{{ result.birth.yearBranch }}</strong>
        </div>
        <div>
          <span>{{ $t('rokusei.report.voidPair') }}</span>
          <strong>{{ result.birth.voidBranches.join('') }}</strong>
        </div>
        <div>
          <span>{{ $t('rokusei.report.annualNow') }}</span>
          <strong>{{ phaseName(result.annual.phase) }}</strong>
        </div>
        <div>
          <span>{{ $t('rokusei.report.fateNow') }}</span>
          <strong>{{ activeFateText }}</strong>
        </div>
      </div>
    </section>

    <section class="rks-section">
      <header>
        <h2>{{ $t('rokusei.report.baziTitle') }}</h2>
        <p>{{ $t('rokusei.report.baziSubtitle') }}</p>
      </header>
      <div class="rks-card rks-pillars">
        <table>
          <thead>
            <tr>
              <th />
              <th v-for="pillar in result.bazi.pillars" :key="pillar.key">
                {{ pillar.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{{ $t('rokusei.report.ganZhi') }}</th>
              <td v-for="pillar in result.bazi.pillars" :key="`gan-${pillar.key}`">
                {{ pillar.ganzhi }}
              </td>
            </tr>
            <tr>
              <th>{{ $t('rokusei.report.tenGod') }}</th>
              <td v-for="pillar in result.bazi.pillars" :key="`god-${pillar.key}`">
                {{ pillar.shishen || '—' }}
              </td>
            </tr>
            <tr>
              <th>{{ $t('rokusei.report.void') }}</th>
              <td v-for="pillar in result.bazi.pillars" :key="`void-${pillar.key}`">
                {{ pillar.voidBranches.join('') || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rks-section">
      <header>
        <h2>{{ $t('rokusei.report.rhythmTitle') }}</h2>
        <p>{{ $t('rokusei.report.rhythmSubtitle', { year: result.annual.year }) }}</p>
      </header>
      <div class="rks-rhythm-grid">
        <div class="rks-rhythm-main">
          <span>{{ $t('rokusei.report.annual') }}</span>
          <strong>{{ phaseName(result.annual.phase) }}</strong>
          <small>{{ rankText(result.annual.phase.rank) }}</small>
        </div>
        <div>
          <span>{{ $t('rokusei.report.monthlyNow') }}</span>
          <strong>{{ currentMonthlyText }}</strong>
        </div>
        <div>
          <span>{{ $t('rokusei.report.dailyNow') }}</span>
          <strong>{{ currentDailyText }}</strong>
        </div>
        <div v-if="result.birth.isReigo">
          <span>{{ $t('rokusei.report.oppositeStar') }}</span>
          <strong>{{ oppositeStarName }}</strong>
          <small>{{ phaseName(result.annual.oppositePhase) }}</small>
        </div>
      </div>
    </section>

    <section class="rks-section">
      <header>
        <h2>{{ $t('rokusei.report.annualTimeline') }}</h2>
        <p>{{ $t('rokusei.report.cycleNote') }}</p>
      </header>
      <div class="rks-cycle-grid">
        <div
          v-for="phase in result.annual.timeline"
          :key="phase.year"
          :class="{ 'is-active': phase.year === result.annual.year, 'is-risk': phase.rank === 'big' }"
        >
          <span>{{ phase.year }}</span>
          <strong>{{ phaseName(phase) }}</strong>
          <small>{{ rankText(phase.rank) }}</small>
        </div>
      </div>
    </section>

    <section class="rks-section">
      <header>
        <h2>{{ $t('rokusei.report.monthlyTimeline') }}</h2>
        <p>{{ $t('rokusei.report.monthlyNote', { year: result.annual.year }) }}</p>
      </header>
      <div class="rks-cycle-grid compact">
        <div
          v-for="phase in result.monthly"
          :key="phase.month"
          :class="{ 'is-active': phase.month === currentMonth, 'is-risk': phase.rank === 'big' }"
        >
          <span>{{ $t('rokusei.report.monthN', { n: phase.month }) }}</span>
          <strong>{{ phaseName(phase) }}</strong>
          <small>{{ rankText(phase.rank) }}</small>
        </div>
      </div>
    </section>

    <section class="rks-section">
      <header>
        <h2>{{ $t('rokusei.report.dailyTimeline') }}</h2>
        <p>{{ $t('rokusei.report.dailyNote') }}</p>
      </header>
      <div class="rks-cycle-grid compact">
        <div
          v-for="phase in result.daily"
          :key="phase.date"
          :class="{ 'is-active': phase.isToday, 'is-risk': phase.rank === 'big' }"
        >
          <span>{{ phase.date.slice(5) }}</span>
          <strong>{{ phaseName(phase) }}</strong>
          <small>{{ rankText(phase.rank) }}</small>
        </div>
      </div>
    </section>

    <section class="rks-section">
      <header>
        <h2>{{ $t('rokusei.report.fateTitle') }}</h2>
        <p>{{ $t('rokusei.report.fateSubtitle') }}</p>
      </header>
      <div class="rks-fate-list">
        <article
          v-for="cycle in result.fateCycles"
          :key="cycle.index"
          :class="{ 'is-current': cycle.isCurrent, 'is-kill': cycle.isFateKill }"
        >
          <div>
            <strong>{{ cycle.startYear }}-{{ cycle.endYear }}</strong>
            <span>{{ $t('rokusei.report.ageRange', { start: cycle.startAge, end: cycle.endAge }) }}</span>
          </div>
          <div>
            <em>{{ $t(`rokusei.fateStars.${cycle.fateStarId}`) }}</em>
            <span>{{ cycle.ganzhi }} · {{ cycle.tenGod }}</span>
          </div>
          <b v-if="cycle.isFateKill">{{ $t('rokusei.report.fateKill') }}</b>
        </article>
      </div>
    </section>

    <section class="rks-card rks-method">
      <strong>{{ $t('rokusei.report.methodTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('rokusei.report.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('rokusei.report.starRule') }}</dt><dd>{{ result.methodology.starRule }}</dd></div>
        <div><dt>{{ $t('rokusei.report.signRule') }}</dt><dd>{{ result.methodology.signRule }}</dd></div>
        <div><dt>{{ $t('rokusei.report.cycleRule') }}</dt><dd>{{ result.methodology.cycleRule }}</dd></div>
        <div><dt>{{ $t('rokusei.report.fateRule') }}</dt><dd>{{ result.methodology.fateRule }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="rks-insight">
        <div v-if="insightOpen" class="rks-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="rks-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('rokusei.ai.title')">
            <header>
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('rokusei.ai.title') }}
                </p>
                <h3>{{ insightTitle || $t('rokusei.ai.title') }}</h3>
              </div>
              <button type="button" :aria-label="$t('rokusei.ai.close')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="rks-insight-body">
              <div v-if="insightStatus === 'connecting'" class="rks-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('rokusei.ai.connecting') }}
              </div>
              <div v-else-if="insightError" class="rks-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="rks-content">{{ insightContent }}</div>
            </div>
            <footer>
              <small>{{ $t('rokusei.ai.disclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="rks-auth">
              <p>{{ $t('rokusei.ai.loginRequired') }}</p>
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
import type { RokuseiCyclePhase, RokuseiSenjutsuResult } from '~~/app/types/rokusei-senjutsu'

const props = defineProps<{ result: RokuseiSenjutsuResult }>()
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

const starName = computed(() => t(`rokusei.stars.${props.result.birth.starId}`))
const oppositeStarName = computed(() => t(`rokusei.stars.${props.result.birth.oppositeStarId}`))
const signText = computed(() => t(`rokusei.signs.${props.result.birth.sign}`))
const activeFateText = computed(() => props.result.activeFateCycle
  ? t(`rokusei.fateStars.${props.result.activeFateCycle.fateStarId}`)
  : t('rokusei.report.noActiveFate'))
const currentMonth = computed(() => Number(props.result.daily[0]?.date.slice(5, 7)) || 1)
const currentMonthlyText = computed(() => {
  const phase = props.result.monthly.find(item => item.month === currentMonth.value)
  return phase ? phaseName(phase) : '—'
})
const currentDailyText = computed(() => {
  const phase = props.result.daily.find(item => item.isToday)
  return phase ? phaseName(phase) : '—'
})
const insightFullLabel = computed(() => isLoggedIn.value
  ? t('rokusei.ai.fullReport')
  : t('rokusei.ai.fullReportLogin'))

const TARGET_SELECTORS = [
  '.rks-hero-facts > div',
  '.rks-pillars td',
  '.rks-rhythm-grid > div',
  '.rks-cycle-grid > div',
  '.rks-fate-list article',
  '.rks-method',
].join(',')

function phaseName(phase: RokuseiCyclePhase) {
  return t(`rokusei.phases.${phase.id}`)
}

function rankText(rank: RokuseiCyclePhase['rank']) {
  return t(`rokusei.ranks.${rank}`)
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const row = node.closest<HTMLElement>('tr')
  if (node.tagName === 'TD' && row) {
    const rowLabel = normalizeText(row.querySelector<HTMLElement>(':scope > th')?.textContent ?? '')
    return [rowLabel, normalizeText(node.textContent ?? '')].filter(Boolean).join(' · ')
  }
  const heading = node.querySelector<HTMLElement>('strong, em')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('header h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('header h2')?.textContent ?? '')
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
    if (node.closest('button') || node.dataset.rksAiTarget) continue
    node.dataset.rksAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.rksAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('rokusei.ai.action')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.rksAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...context,
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-rks-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.rksAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-rks-ai-target]')
  if (target) activateTarget(target)
}

function openInsight(title: string) {
  insightAbort?.abort()
  insightAbort = null
  insightOpen.value = true
  insightTitle.value = title
  insightContent.value = ''
  insightError.value = ''
  authRequired.value = false
  insightStatus.value = 'connecting'
}

function closeInsight() {
  insightAbort?.abort()
  insightAbort = null
  insightOpen.value = false
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function handleFullReport() {
  insightMode.value = 'full'
  await streamInsight({ mode: 'full', title: t('rokusei.ai.fullReportTitle') })
}

async function streamInsight(payload: { mode: 'target' | 'full', target?: Record<string, string>, title?: string }) {
  openInsight(payload.title || '')
  insightAbort = new AbortController()
  insightStatus.value = 'streaming'

  try {
    const response = await fetch('/api/tools/rokusei-senjutsu/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        chart: props.result,
        locale: locale.value,
      }),
      signal: insightAbort.signal,
    })

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '')
      if (response.status === 401) authRequired.value = true
      throw new Error(detail || `${t('rokusei.ai.requestFailed')} (${response.status})`)
    }

    const reader = response.body.getReader()
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
        const rawPayload = line.slice(5).trim()
        if (!rawPayload || rawPayload === '[DONE]') continue
        try {
          const event = JSON.parse(rawPayload)
          if (event.type === 'text') {
            insightContent.value += event.text
            insightStatus.value = 'streaming'
          }
          else if (event.type === 'error') {
            throw new Error(event.message || t('rokusei.ai.requestFailed'))
          }
        }
        catch (error) {
          if (error instanceof SyntaxError) continue
          throw error
        }
      }
    }
    insightStatus.value = 'complete'
  }
  catch (error: any) {
    if (error.name === 'AbortError') return
    insightError.value = error.message || t('rokusei.ai.requestFailed')
    insightStatus.value = 'error'
  }
  finally {
    insightAbort = null
  }
}

onMounted(() => nextTick(initializeTargets))
watch(() => props.result, () => nextTick(initializeTargets), { deep: true })
</script>

<style scoped>
.rks { display: grid; gap: 34px; color: var(--text-primary); }
.rks-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 22px; }
.rks-hero { display: grid; gap: 20px; }
.rks-hero-main p { margin: 0 0 6px; color: var(--accent); font-size: 12px; font-weight: 700; }
.rks-hero-main h2 { margin: 0; font-size: clamp(30px, 6vw, 46px); line-height: 1.1; }
.rks-hero-main strong { display: inline-block; margin-top: 10px; padding: 5px 9px; border: 1px solid var(--accent-border); border-radius: 999px; color: var(--accent); font-size: 12px; }
.rks-hero-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.rks-hero-facts > div { min-width: 0; padding: 14px; border: 1px solid var(--border-subtle); border-radius: 10px; background: color-mix(in srgb, var(--surface-card) 72%, transparent); }
.rks-hero-facts span { display: block; color: var(--text-faint); font-size: 12px; }
.rks-hero-facts strong { display: block; min-height: 24px; margin-top: 5px; font-size: 16px; overflow-wrap: anywhere; }
.rks-section { display: grid; gap: 15px; }
.rks-section header h2 { margin: 0; font-size: 20px; }
.rks-section header p { margin: 6px 0 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.rks-pillars { overflow-x: auto; }
.rks-pillars table { width: 100%; border-collapse: collapse; min-width: 580px; }
.rks-pillars th, .rks-pillars td { padding: 13px 12px; border-bottom: 1px solid var(--border-subtle); text-align: center; font-size: 14px; }
.rks-pillars thead th { color: var(--text-muted); font-size: 13px; font-weight: 600; }
.rks-pillars tbody th { width: 88px; color: var(--text-faint); font-size: 12px; font-weight: 600; text-align: left; }
.rks-rhythm-grid { display: grid; grid-template-columns: 1.4fr repeat(3, minmax(0, 1fr)); gap: 12px; }
.rks-rhythm-grid > div, .rks-cycle-grid > div { min-width: 0; padding: 15px; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--surface-card); }
.rks-rhythm-grid span, .rks-cycle-grid span { display: block; color: var(--text-faint); font-size: 12px; }
.rks-rhythm-grid strong, .rks-cycle-grid strong { display: block; min-height: 25px; margin-top: 5px; font-size: 16px; }
.rks-rhythm-grid small, .rks-cycle-grid small { display: block; margin-top: 5px; color: var(--text-muted); font-size: 12px; }
.rks-rhythm-main { background: color-mix(in srgb, var(--accent-bg) 22%, var(--surface-card)); border-color: var(--accent-border); }
.rks-cycle-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.rks-cycle-grid.compact strong { font-size: 15px; }
.is-active { border-color: var(--accent-border); background: color-mix(in srgb, var(--accent-bg) 18%, var(--surface-card)); }
.is-risk strong { color: #b45309; }
.rks-fate-list { display: grid; gap: 10px; }
.rks-fate-list article { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: center; padding: 14px; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--surface-card); }
.rks-fate-list strong { display: block; font-size: 14px; }
.rks-fate-list em { display: block; font-style: normal; font-weight: 700; }
.rks-fate-list span { display: block; margin-top: 3px; color: var(--text-muted); font-size: 12px; }
.rks-fate-list b { padding: 4px 8px; border-radius: 999px; background: color-mix(in srgb, #b45309 13%, transparent); color: #92400e; font-size: 12px; }
.is-kill { border-color: color-mix(in srgb, #b45309 30%, transparent); }
.rks-method strong { display: block; margin-bottom: 15px; font-size: 16px; }
.rks-method dl { display: grid; gap: 10px; margin: 0; }
.rks-method div { display: grid; grid-template-columns: 88px 1fr; gap: 12px; }
.rks-method dt { color: var(--text-faint); font-size: 13px; }
.rks-method dd { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.rks-method > p { margin: 15px 0 0; padding-top: 13px; border-top: 1px solid var(--border-subtle); color: var(--text-faint); font-size: 12px; line-height: 1.6; }

.rks-insight-layer { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 18px; background: var(--overlay-bg); backdrop-filter: blur(8px); }
.rks-insight { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; width: min(720px, 100%); max-height: min(82vh, 720px); overflow: hidden; border: 1px solid var(--border-medium); border-radius: 14px; background: var(--surface-bg); }
.rks-insight > header { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; padding: 18px; border-bottom: 1px solid var(--border-subtle); }
.rks-insight > header p { display: flex; gap: 6px; align-items: center; margin: 0; color: var(--accent); font-size: 12px; font-weight: 700; }
.rks-insight > header h3 { margin: 6px 0 0; font-size: 17px; }
.rks-insight > header button { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid var(--border-light); border-radius: 999px; color: var(--text-muted); background: transparent; }
.rks-insight-body { overflow-y: auto; padding: 18px; }
.rks-content { white-space: pre-wrap; line-height: 1.75; font-size: 14px; }
.rks-status, .rks-error { display: flex; gap: 8px; align-items: center; color: var(--text-muted); font-size: 14px; }
.rks-error { color: #b91c1c; }
.rks-insight > footer { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1px solid var(--border-subtle); }
.rks-insight > footer small { color: var(--text-faint); font-size: 11px; }
.rks-insight > footer button { padding: 8px 12px; border: 1px solid var(--accent-border); border-radius: 8px; color: var(--accent); font-size: 13px; background: transparent; }
.rks-auth { padding: 14px 18px; border-top: 1px solid var(--border-subtle); background: color-mix(in srgb, var(--accent-bg) 16%, transparent); }
.rks-auth p { margin: 0 0 10px; font-size: 13px; }
.rks-auth div { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.rks-auth button { display: flex; gap: 8px; align-items: center; justify-content: center; padding: 9px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-card); font-size: 13px; }
[data-rks-ai-target] { position: relative; cursor: pointer; border-radius: inherit; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
[data-rks-ai-target]::after { content: '✦'; position: absolute; z-index: 5; top: 5px; right: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1px solid var(--accent-border); border-radius: 999px; background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg)); color: var(--accent); font-size: 10px; line-height: 1; opacity: 0; pointer-events: none; transform: translateY(2px); transition: opacity 140ms ease, transform 140ms ease; }
[data-rks-ai-target]:hover, [data-rks-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); border-color: var(--accent-border-hover); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
[data-rks-ai-target]:hover::after, [data-rks-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }
[data-rks-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rks-insight-enter-active, .rks-insight-leave-active { transition: opacity 180ms ease; }
.rks-insight-enter-from, .rks-insight-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .rks-hero-facts, .rks-rhythm-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rks-cycle-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .rks-rhythm-main { grid-column: 1 / -1; }
  .rks-fate-list article { grid-template-columns: 1fr; align-items: start; }
}
@media (max-width: 560px) {
  .rks-card { padding: 16px; }
  .rks-hero-facts, .rks-rhythm-grid { grid-template-columns: 1fr; }
  .rks-cycle-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rks-method div { grid-template-columns: 1fr; }
}
</style>
