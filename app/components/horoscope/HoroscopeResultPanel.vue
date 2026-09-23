<template>
  <div
    ref="reportRoot"
    class="hrp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="hrp-card hrp-hero" :data-hr-ai-label="$t('horoscope.ai.summary')">
      <div class="hrp-score-main">
        <span>{{ $t('horoscope.fields.overall') }}</span>
        <strong>{{ result.scores.overall }}</strong>
      </div>
      <div class="hrp-hero-copy">
        <h2>{{ $t(`horoscope.signs.${result.sign.slug}`) }} · {{ formattedDate }}</h2>
        <p>{{ result.summary }}</p>
        <dl>
          <div><dt>{{ $t('horoscope.fields.moonSign') }}</dt><dd>{{ zodiacName(result.sky.moonSignIndex) }}</dd></div>
          <div><dt>{{ $t('horoscope.fields.moonPhase') }}</dt><dd>{{ $t(`horoscope.phases.${result.sky.moonPhaseKey}`) }}</dd></div>
          <div><dt>{{ $t('horoscope.fields.compatibility') }}</dt><dd>{{ $t(`horoscope.signs.${result.compatibility.slug}`) }}</dd></div>
          <div><dt>{{ $t('horoscope.fields.direction') }}</dt><dd>{{ $t(`horoscope.directions.${result.luckyDirectionKey}`) }}</dd></div>
        </dl>
      </div>
    </section>

    <section class="hrp-section">
      <header><h3>{{ $t('horoscope.sections.scores') }}</h3><p>{{ $t('horoscope.sections.scoresSubtitle') }}</p></header>
      <div class="hrp-score-grid">
        <article class="hrp-card" :data-hr-ai-label="$t('horoscope.fields.love')">
          <span>{{ $t('horoscope.fields.love') }}</span><strong>{{ result.scores.love }}</strong><p>{{ result.loveHint }}</p>
        </article>
        <article class="hrp-card" :data-hr-ai-label="$t('horoscope.fields.work')">
          <span>{{ $t('horoscope.fields.work') }}</span><strong>{{ result.scores.work }}</strong><p>{{ result.workHint }}</p>
        </article>
        <article class="hrp-card" :data-hr-ai-label="$t('horoscope.fields.wealth')">
          <span>{{ $t('horoscope.fields.wealth') }}</span><strong>{{ result.scores.wealth }}</strong><p>{{ result.wealthHint }}</p>
        </article>
        <article class="hrp-card" :data-hr-ai-label="$t('horoscope.fields.health')">
          <span>{{ $t('horoscope.fields.health') }}</span><strong>{{ result.scores.health }}</strong><p>{{ result.healthHint }}</p>
        </article>
        <article class="hrp-card" :data-hr-ai-label="$t('horoscope.fields.luckyNumber')">
          <span>{{ $t('horoscope.fields.luckyNumber') }}</span><strong>{{ result.luckyNumber }}</strong>
        </article>
        <article class="hrp-card" :data-hr-ai-label="$t('horoscope.fields.luckyColor')">
          <span>{{ $t('horoscope.fields.luckyColor') }}</span>
          <strong class="hrp-color">
            <i :style="{ backgroundColor: colorValue }" aria-hidden="true" />
            {{ $t(`horoscope.colors.${result.luckyColorKey}`) }}
          </strong>
        </article>
      </div>
    </section>

    <section class="hrp-section">
      <header><h3>{{ $t('horoscope.sections.sky') }}</h3><p>{{ $t('horoscope.sections.skySubtitle') }}</p></header>
      <div class="hrp-sky-grid">
        <article class="hrp-card">
          <h4>{{ $t('horoscope.sections.positions') }}</h4>
          <ul>
            <li v-for="planet in result.sky.planets" :key="planet.key" :data-hr-ai-label="`${planet.nameZh} ${zodiacName(planet.signIndex)}`">
              <span>{{ planet.nameZh }}</span>
              <b>{{ zodiacName(planet.signIndex) }} {{ planet.degree }}°</b>
              <small v-if="planet.isRetrograde">R</small>
            </li>
          </ul>
        </article>
        <article class="hrp-card">
          <h4>{{ $t('horoscope.sections.aspects') }}</h4>
          <p v-if="!result.sky.aspects.length">{{ $t('horoscope.empty.aspects') }}</p>
          <ul>
            <li v-for="aspect in result.sky.aspects" :key="`${aspect.transitKey}-${aspect.type}`" :data-hr-ai-label="`${aspect.transitNameZh}${aspect.typeZh}`">
              <span>{{ aspect.transitNameZh }} {{ aspect.typeZh }}</span>
              <b>{{ aspect.orb }}°</b>
              <small>{{ aspect.strength }}%</small>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="hrp-card hrp-method" :data-hr-ai-label="$t('horoscope.sections.method')">
      <h4>{{ $t('horoscope.sections.method') }}</h4>
      <p><b>{{ result.methodology.engine }}</b> · {{ result.methodology.zodiac }}<br>{{ result.methodology.scoring }}</p>
      <small>{{ result.methodology.disclaimer }}</small>
    </section>

    <Teleport to="body">
      <Transition name="hrp-modal">
        <div v-if="insightOpen" class="hrp-layer" role="presentation" @click.self="closeInsight">
          <section class="hrp-dialog" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('horoscope.ai.title')">
            <header>
              <div><p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />{{ $t('horoscope.ai.title') }}</p><h3>{{ insightTitle }}</h3></div>
              <button type="button" :aria-label="$t('horoscope.ai.close')" @click="closeInsight"><UIcon name="i-heroicons-x-mark" class="h-4 w-4" /></button>
            </header>
            <div class="hrp-dialog-body">
              <div v-if="insightStatus === 'connecting'" class="hrp-status"><UIcon name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />{{ $t('horoscope.ai.connecting') }}</div>
              <div v-else-if="insightError" class="hrp-error"><UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" /><span>{{ insightError }}</span></div>
              <div v-else>{{ insightContent }}</div>
            </div>
            <footer>
              <small>{{ $t('horoscope.ai.disclaimer') }}</small>
              <button v-if="insightMode === 'target' && insightStatus === 'complete'" type="button" @click="handleFullReport">
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="hrp-auth">
              <p>{{ $t('horoscope.ai.loginRequired') }}</p>
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
import type { HoroscopeResult } from '~/types/horoscope'
import { HOROSCOPE_ZODIAC_SIGNS } from '~/utils/horoscope/signs'

const props = defineProps<{ result: HoroscopeResult }>()
const { t, locale } = useI18n()
const route = useRoute()
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

const TARGET_SELECTOR = '[data-hr-ai-target]'
const formattedDate = computed(() => new Date(`${props.result.date}T12:00:00+08:00`)
  .toLocaleDateString(locale.value === 'en' ? 'en-US' : locale.value === 'ja' ? 'ja-JP' : locale.value, { month: 'long', day: 'numeric' }))
const insightFullLabel = computed(() => isLoggedIn.value ? t('horoscope.ai.fullReport') : t('horoscope.ai.fullReportLogin'))
const colorValue = computed(() => ({
  crimson: '#C2404A', amber: '#D58F3B', emerald: '#39795D', sky: '#3B7B93',
  indigo: '#4A548F', violet: '#705492', rose: '#B45F84', slate: '#5F6B75',
  gold: '#B98B2D', teal: '#35847F', mint: '#5A9275', coral: '#C96A50',
}[props.result.luckyColorKey as keyof Record<string, string>] ?? 'var(--accent)'))

function zodiacName(index: number) {
  return locale.value === 'en'
    ? ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][index]
    : locale.value === 'ja'
      ? ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'][index]
      : HOROSCOPE_ZODIAC_SIGNS[index]!
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return
  for (const node of Array.from(root.querySelectorAll<HTMLElement>('[data-hr-ai-label]'))) {
    if (node.dataset.hrAiTarget) continue
    node.dataset.hrAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    node.setAttribute('aria-label', `${node.dataset.hrAiLabel} · ${t('horoscope.ai.action')}`)
  }
}

function targetLabel(node: HTMLElement) {
  return node.dataset.hrAiLabel || node.textContent?.replace(/\s+/g, ' ').trim() || t('horoscope.ai.title')
}

function targetContext(node: HTMLElement) {
  return {
    label: targetLabel(node),
    section: node.closest('section')?.querySelector('h3')?.textContent?.trim() || t('horoscope.ai.title'),
    content: node.innerText.replace(/\s+/g, ' ').trim().slice(0, 2600),
  }
}

function activateTarget(node: HTMLElement) {
  void requestInsight(targetContext(node))
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>(TARGET_SELECTOR)
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.hrAiTarget !== 'true') return
  const target = current.closest<HTMLElement>(TARGET_SELECTOR)
  if (target) activateTarget(target)
}

function compactContext() {
  const result = props.result
  return [
    `日期：${result.date}；星座：${result.sign.nameZh}/${result.sign.name}；月亮星座：${HOROSCOPE_ZODIAC_SIGNS[result.sky.moonSignIndex]}`,
    `分数：综合${result.scores.overall}，爱情${result.scores.love}，工作${result.scores.work}，财运${result.scores.wealth}，健康${result.scores.health}`,
    `幸运：${result.luckyNumber} / ${result.luckyColorKey} / ${result.luckyDirectionKey}；建议：${result.loveHint}; ${result.workHint}; ${result.wealthHint}; ${result.healthHint}`,
    `行星：${result.sky.planets.map(planet => `${planet.nameZh}@${planet.signIndex + 1}${planet.isRetrograde ? 'R' : ''}`).join('；')}`,
    `相位：${result.sky.aspects.map(aspect => `${aspect.transitNameZh}${aspect.typeZh}(orb${aspect.orb}°,${aspect.strength}%)`).join('；') || '无明显相位'}`,
    `口径：${result.methodology.engine}; ${result.methodology.scoring}`,
  ].join('\n')
}

async function requestInsight(target: { label: string; section: string; content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('horoscope.ai.fullReportTitle')
  await streamInsight({ mode: 'full', title: insightTitle.value })
}

function handleFullReport() {
  if (isLoggedIn.value) {
    void startFullReport()
    return
  }
  authRequired.value = true
}

async function streamInsight(payload: { mode: 'target' | 'full'; target?: Record<string, string>; title?: string }) {
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
    const response = await fetch(`/api/horoscope/${props.result.sign.slug}/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: insightAbort.signal,
      body: JSON.stringify({ ...payload, chart: props.result, chartContext: compactContext(), locale: locale.value }),
    })
    if (!response.ok) {
      if (response.status === 401) authRequired.value = true
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || data.statusMessage || `HTTP ${response.status}`)
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
        else if (chunk.type === 'error') throw new Error(chunk.message || t('horoscope.ai.error'))
      }
    }
    if (!insightContent.value) throw new Error(t('horoscope.ai.noResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('horoscope.ai.error')
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
.hrp { display: grid; gap: 26px; }
.hrp-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 18px; }
.hrp-hero { display: grid; grid-template-columns: 130px minmax(0,1fr); gap: 20px; align-items: center; padding: 22px; }
.hrp-score-main { display: grid; gap: 4px; justify-items: center; border: 1px solid var(--accent-border); border-radius: 12px; background: var(--accent-bg); padding: 18px 10px; color: var(--accent); }
.hrp-score-main strong { font-size: 42px; line-height: 1; }
.hrp-score-main span { font-size: 12px; font-weight: 600; }
.hrp-hero-copy h2 { margin: 0; font-size: 24px; }
.hrp-hero-copy p { margin: 8px 0 0; color: var(--text-muted); line-height: 1.7; }
.hrp-hero-copy dl { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px 16px; margin: 14px 0 0; }
.hrp-hero-copy dt { color: var(--text-faint); font-size: 12px; }
.hrp-hero-copy dd { margin: 2px 0 0; font-weight: 600; }
.hrp-section header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
.hrp-section h3 { margin: 0; font-size: 17px; }
.hrp-section header p { margin: 0; color: var(--text-faint); font-size: 13px; }
.hrp-score-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
.hrp-score-grid span { display: block; color: var(--text-faint); font-size: 12px; }
.hrp-score-grid strong { display: block; margin: 5px 0 8px; font-size: 26px; }
.hrp-score-grid p { min-height: 38px; margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
.hrp-color { display: flex; align-items: center; gap: 8px; }
.hrp-color i { width: 16px; height: 16px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 35%); }
.hrp-sky-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.hrp-sky-grid h4 { margin: 0 0 10px; font-size: 14px; }
.hrp-sky-grid ul { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.hrp-sky-grid li { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 13px; }
.hrp-sky-grid li span:first-child { flex: 1; min-width: 56px; color: var(--text-muted); }
.hrp-sky-grid small { color: var(--accent); }
.hrp-method p { margin: 8px 0; color: var(--text-muted); line-height: 1.7; }
.hrp-method small { color: var(--text-faint); }
.hrp-layer { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 18px; background: rgb(0 0 0 / 48%); backdrop-filter: blur(8px); }
.hrp-dialog { display: flex; width: min(720px, 100%); max-height: min(84dvh, 700px); flex-direction: column; overflow: hidden; border: 1px solid var(--border-medium); border-radius: 14px; background: var(--surface-bg); }
.hrp-dialog header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 16px 18px; border-bottom: 1px solid var(--border-subtle); }
.hrp-dialog header p { display: flex; align-items: center; gap: 5px; margin: 0 0 4px; color: var(--accent); font-size: 12px; }
.hrp-dialog header h3 { margin: 0; overflow: hidden; font-size: 17px; text-overflow: ellipsis; white-space: nowrap; }
.hrp-dialog header button, .hrp-dialog footer button, .hrp-auth button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border-light); border-radius: 8px; background: transparent; color: var(--text-primary); padding: 7px 10px; cursor: pointer; }
.hrp-dialog-body { flex: 1; overflow: auto; padding: 18px; color: var(--text-primary); line-height: 1.8; white-space: pre-wrap; }
.hrp-status, .hrp-error { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
.hrp-error { color: rgb(220 80 80); }
.hrp-dialog footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 18px; border-top: 1px solid var(--border-subtle); }
.hrp-dialog footer small { color: var(--text-faint); }
.hrp-auth { padding: 14px 18px; border-top: 1px solid var(--border-subtle); background: var(--accent-bg); }
.hrp-auth p { margin: 0 0 10px; color: var(--accent); font-size: 13px; }
.hrp-auth div { display: flex; gap: 8px; }
[data-hr-ai-target] { position: relative; cursor: pointer; border-radius: inherit; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
[data-hr-ai-target]::after { content: '✦'; position: absolute; z-index: 5; top: 5px; right: 5px; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1px solid var(--accent-border); border-radius: 999px; background: var(--surface-bg); color: var(--accent); font-size: 10px; opacity: 0; pointer-events: none; transform: translateY(2px); transition: opacity 140ms ease, transform 140ms ease; }
[data-hr-ai-target]:hover, [data-hr-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); border-color: var(--accent-border-hover); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
[data-hr-ai-target]:hover::after, [data-hr-ai-target]:focus-visible::after { opacity: 1; transform: translateY(0); }
[data-hr-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.hrp-modal-enter-active, .hrp-modal-leave-active { transition: opacity 180ms ease; }
.hrp-modal-enter-from, .hrp-modal-leave-to { opacity: 0; }
@media (max-width: 760px) {
  .hrp-hero { grid-template-columns: 1fr; }
  .hrp-score-grid { grid-template-columns: 1fr 1fr; }
  .hrp-score-grid p { min-height: 0; }
  .hrp-hero-copy dl { grid-template-columns: 1fr 1fr; }
  .hrp-sky-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .hrp-hero-copy dl { grid-template-columns: 1fr; }
  .hrp-dialog footer { align-items: flex-start; flex-direction: column; }
  .hrp-dialog footer button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  [data-hr-ai-target], .hrp-modal-enter-active, .hrp-modal-leave-active { transition: none; }
}
</style>
