<template>
  <div
    ref="reportRoot"
    class="lrp"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="lrp-card lrp-hero">
      <div class="lrp-hero-grid">
        <div>
          <span>{{ $t('liurenPaipan.engineTime') }}</span>
          <strong>{{ result.input.engineTime }}</strong>
          <small>{{ result.input.engineTimeBasis }}</small>
        </div>
        <div>
          <span>{{ $t('liurenPaipan.monthGeneral') }}</span>
          <strong>{{ result.summary.monthGeneral }}{{ $t('liurenPaipan.generalAddedTo') }}{{ result.summary.hourBranch }}{{ $t('liurenPaipan.hourUnit') }}</strong>
          <small>{{ result.input.location }}</small>
        </div>
        <div>
          <span>{{ $t('liurenPaipan.dayMaster') }}</span>
          <strong>{{ result.summary.dayGan }} / {{ result.summary.dayBranch }}</strong>
          <small>{{ result.pillars[2]?.ganzhi }}</small>
        </div>
        <div>
          <span>{{ $t('liurenPaipan.xunShou') }}</span>
          <strong>{{ result.summary.xunShou }}</strong>
          <small>{{ $t('liurenPaipan.xunKong') }} {{ result.summary.xunKong.join('、') }}</small>
        </div>
        <div>
          <span>{{ $t('liurenPaipan.coursePattern') }}</span>
          <strong>{{ result.summary.coursePattern }}</strong>
          <small>{{ $t('liurenPaipan.threeTransmissionShort') }} {{ transmissionSummary }}</small>
        </div>
        <div>
          <span>{{ $t('liurenPaipan.nianMing') }}</span>
          <strong>{{ nianMingText || '—' }}</strong>
          <small>{{ result.summary.nianMing ? `${result.summary.nianMing.luNianGanZhi} · ${result.summary.nianMing.genderText}` : $t('liurenPaipan.notProvided') }}</small>
        </div>
      </div>
    </section>

    <section class="lrp-section">
      <header class="lrp-section-label">
        <h2>{{ $t('liurenPaipan.pillarTitle') }}</h2>
        <p>{{ $t('liurenPaipan.pillarSubtitle') }}</p>
      </header>
      <div class="lrp-card lrp-pillars">
        <table>
          <thead>
            <tr>
              <th />
              <th v-for="pillar in result.pillars" :key="pillar.label">
                {{ $t(`liurenPaipan.pillars.${pillar.label}`) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{{ $t('liurenPaipan.ganzhi') }}</th>
              <td v-for="pillar in result.pillars" :key="`gan-${pillar.label}`" class="lrp-ganzhi">
                {{ pillar.ganzhi }}
              </td>
            </tr>
            <tr>
              <th>{{ $t('liurenPaipan.xun') }}</th>
              <td v-for="pillar in result.pillars" :key="`xun-${pillar.label}`">
                {{ pillar.xun || '—' }}
              </td>
            </tr>
            <tr>
              <th>{{ $t('liurenPaipan.xunKong') }}</th>
              <td v-for="pillar in result.pillars" :key="`kong-${pillar.label}`">
                {{ pillar.xunKong.join('、') || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="lrp-section">
      <header class="lrp-section-label">
        <h2>{{ $t('liurenPaipan.courseTitle') }}</h2>
        <p>{{ $t('liurenPaipan.courseSubtitle') }}</p>
      </header>
      <div class="lrp-courses">
        <article v-for="course in result.courses" :key="course.label">
          <header>
            <strong>{{ $t(`liurenPaipan.courses.${course.label}`) }}</strong>
            <span>{{ course.title }}</span>
          </header>
          <b>{{ course.upper }}</b>
          <i>{{ course.lower }}</i>
          <p>{{ course.god || $t('liurenPaipan.noGod') }}</p>
        </article>
      </div>
    </section>

    <section class="lrp-section">
      <header class="lrp-section-label">
        <h2>{{ $t('liurenPaipan.transmissionTitle') }}</h2>
        <p>{{ $t('liurenPaipan.transmissionSubtitle') }}</p>
      </header>
      <div class="lrp-transmissions">
        <article v-for="item in result.transmissions" :key="item.label">
          <header>
            <strong>{{ $t(`liurenPaipan.transmissions.${item.label}`) }}</strong>
            <span>{{ item.sixRelative || '—' }}</span>
          </header>
          <b>{{ item.branch }}</b>
          <p>{{ item.god || $t('liurenPaipan.noGod') }}</p>
          <footer>{{ item.hiddenGan ? `${$t('liurenPaipan.hiddenGan')} ${item.hiddenGan}` : $t('liurenPaipan.noHiddenGan') }}</footer>
        </article>
      </div>
    </section>

    <section class="lrp-section">
      <header class="lrp-section-label">
        <h2>{{ $t('liurenPaipan.chartTitle') }}</h2>
        <p>{{ $t('liurenPaipan.chartSubtitle') }}</p>
      </header>
      <div class="lrp-grid">
        <article
          v-for="palace in result.chart.palaces"
          :key="palace.branch"
          class="lrp-palace"
          :class="{ 'is-void': palace.isVoid }"
        >
          <header>
            <strong>{{ palace.branch }}</strong>
            <span>{{ palace.jianChu }}</span>
          </header>
          <b>{{ palace.skyBranch }}</b>
          <p>{{ palace.god }}</p>
          <footer>
            <span v-if="palace.hiddenGan">{{ $t('liurenPaipan.hiddenGan') }} {{ palace.hiddenGan }}</span>
            <span v-if="palace.isVoid">{{ $t('liurenPaipan.void') }}</span>
          </footer>
        </article>
      </div>
      <p class="lrp-legend">{{ $t('liurenPaipan.chartLegend') }}</p>
    </section>

    <section class="lrp-section">
      <header class="lrp-section-label">
        <h2>{{ $t('liurenPaipan.marksTitle') }}</h2>
        <p>{{ $t('liurenPaipan.marksSubtitle') }}</p>
      </header>
      <div class="lrp-marks">
        <article>
          <strong>{{ $t('liurenPaipan.yiMa') }}</strong><b>{{ result.marks.yiMa }}</b>
        </article>
        <article>
          <strong>{{ $t('liurenPaipan.dingMa') }}</strong><b>{{ result.marks.dingMa }}</b>
        </article>
        <article>
          <strong>{{ $t('liurenPaipan.tianMa') }}</strong><b>{{ result.marks.tianMa }}</b>
        </article>
      </div>
    </section>

    <section class="lrp-section">
      <header class="lrp-section-label">
        <h2>{{ $t('liurenPaipan.guiRenTitle') }}</h2>
        <p>{{ $t('liurenPaipan.guiRenSubtitle') }}</p>
      </header>
      <div class="lrp-gods">
        <article>
          <strong>{{ $t('liurenPaipan.yangGuiRen') }}</strong>
          <div>
            <span v-for="(god, index) in guiRen.yang" :key="`yang-${index}`">
              {{ god }}<i>{{ guiRen.branches[index] }}</i>
            </span>
          </div>
        </article>
        <article>
          <strong>{{ $t('liurenPaipan.yinGuiRen') }}</strong>
          <div>
            <span v-for="(god, index) in guiRen.yin" :key="`yin-${index}`">
              {{ god }}<i>{{ guiRen.branches[index] }}</i>
            </span>
          </div>
        </article>
      </div>
    </section>

    <section class="lrp-section">
      <header class="lrp-section-label">
        <h2>{{ $t('liurenPaipan.shenShaTitle') }}</h2>
        <p>{{ $t('liurenPaipan.shenShaSubtitle', { count: result.shenSha.length }) }}</p>
      </header>
      <div class="lrp-shensha">
        <article v-for="(item, index) in result.shenSha" :key="`${item.name}-${item.value}-${index}`">
          <header>
            <strong>{{ item.name }}</strong>
            <span>{{ item.value }}</span>
          </header>
          <p>{{ item.description || '—' }}</p>
        </article>
      </div>
    </section>

    <section class="lrp-card lrp-methodology">
      <strong>{{ $t('liurenPaipan.methodologyTitle') }}</strong>
      <dl>
        <div><dt>{{ $t('liurenPaipan.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
        <div><dt>{{ $t('liurenPaipan.method') }}</dt><dd>{{ result.methodology.method }}</dd></div>
        <div><dt>{{ $t('liurenPaipan.calendar') }}</dt><dd>{{ result.methodology.calendar }}</dd></div>
        <div><dt>{{ $t('liurenPaipan.timeBasis') }}</dt><dd>{{ result.methodology.timeBasis }}</dd></div>
        <div><dt>{{ $t('liurenPaipan.trueSolarTime') }}</dt><dd>{{ result.solarTime.statusText }}</dd></div>
      </dl>
      <p>{{ result.methodology.disclaimer }}</p>
    </section>

    <Teleport to="body">
      <Transition name="lrp-insight">
        <div v-if="insightOpen" class="lrp-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="lrp-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('liurenPaipan.aiPanelTitle')">
            <header class="lrp-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('liurenPaipan.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('liurenPaipan.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('liurenPaipan.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="lrp-insight-body">
              <div v-if="insightStatus === 'connecting'" class="lrp-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('liurenPaipan.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="lrp-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="lrp-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="lrp-insight-foot">
              <small>{{ $t('liurenPaipan.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="lrp-insight-auth">
              <p>{{ $t('liurenPaipan.aiLoginRequired') }}</p>
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
import type { LiurenPaipanResult } from '~~/app/types/liuren-paipan'

const props = defineProps<{ result: LiurenPaipanResult }>()
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
  ? t('liurenPaipan.aiFullReport')
  : t('liurenPaipan.aiFullReportLogin'))

const transmissionSummary = computed(() => props.result.transmissions.map(item => item.branch).join('→'))
const nianMingText = computed(() => props.result.summary.nianMing
  ? `${props.result.summary.nianMing.birthYearGanZhi} · ${props.result.summary.nianMing.genderText}`
  : '')

const guiRen = computed(() => ({
  branches: props.result.chart.palaces.map(palace => palace.branch),
  yang: props.result.chart.yangGuiRen,
  yin: props.result.chart.yinGuiRen,
}))

const TARGET_SELECTORS = [
  '.lrp-hero-grid > div',
  '.lrp-pillars td',
  '.lrp-courses article',
  '.lrp-transmissions article',
  '.lrp-palace',
  '.lrp-marks article',
  '.lrp-gods article',
  '.lrp-shensha article',
  '.lrp-methodology',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const row = node.closest<HTMLElement>('tr')
  if (node.tagName === 'TD' && row) {
    const rowLabel = normalizeText(row.querySelector<HTMLElement>(':scope > th')?.textContent ?? '')
    const value = normalizeText(node.textContent ?? '')
    return [rowLabel, value].filter(Boolean).join(' · ')
  }

  const heading = node.querySelector<HTMLElement>('strong, b, dt')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.lrp-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(heading?.textContent ?? '').slice(0, 36)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.lrp-section-label h2')?.textContent ?? '')
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
    if (node.closest('button') || node.dataset.lrpAiTarget) continue

    node.dataset.lrpAiTarget = 'true'
    node.tabIndex = 0
    node.setAttribute('role', 'button')
    const label = targetLabel(node)
    node.dataset.lrpAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('liurenPaipan.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.lrpAiLabel || targetLabel(node)
  const context = targetContext(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...context,
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-lrp-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.lrpAiTarget !== 'true') return
  const target = current.closest<HTMLElement>('[data-lrp-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const result = props.result
  const palaceLines = result.chart.palaces.map(palace => [
    `地盘${palace.branch}`,
    `天盘${palace.skyBranch}`,
    palace.god,
    palace.hiddenGan ? `遁${palace.hiddenGan}` : '',
    palace.jianChu,
    palace.isVoid ? '空' : '',
  ].filter(Boolean).join('/'))

  return [
    `起课：${result.input.engineTime}；时区：${result.input.requestedTimezone}；地点：${result.input.location}`,
    `真太阳时：${result.solarTime.trueSolarTime || '未校正'}；${result.solarTime.statusText}`,
    `月将：${result.summary.monthGeneral}；占时：${result.summary.hourBranch}时`,
    `四柱：${result.pillars.map(pillar => pillar.ganzhi).join(' ')}`,
    `旬首：${result.summary.xunShou}；旬空：${result.summary.xunKong.join('、')}`,
    `年命：${result.summary.nianMing ? `${result.summary.nianMing.birthYearGanZhi}(${result.summary.nianMing.genderText})，行年${result.summary.nianMing.luNianGanZhi}` : '未提供'}`,
    `四课：${result.courses.map(course => `${course.title}=${course.text}${course.god ? `(${course.god})` : ''}`).join('；')}`,
    `三传：${result.transmissions.map(item => `${item.branch}${item.god}${item.sixRelative ? `/${item.sixRelative}` : ''}${item.hiddenGan ? `/遁${item.hiddenGan}` : ''}`).join('→')}`,
    `课体：${result.summary.coursePattern}`,
    `天地盘：${palaceLines.join('；')}`,
    `神煞：${result.shenSha.map(item => `${item.name}${item.value}`).join('、')}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('liurenPaipan.aiFullReportTitle')
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
    const response = await fetch('/api/tools/liuren-paipan/interpret', {
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
            throw new Error(chunk.message || t('liurenPaipan.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('liurenPaipan.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('liurenPaipan.aiError')
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
.lrp {
  display: grid;
  gap: 32px;
  color: var(--text-primary);
}

[data-lrp-ai-target] {
  position: relative;
  cursor: pointer;
  border-radius: inherit;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-lrp-ai-target]::after {
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

[data-lrp-ai-target]:hover,
[data-lrp-ai-target]:focus-visible {
  background-color: color-mix(in srgb, #d8e6d8 44%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-lrp-ai-target]:hover::after,
[data-lrp-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

.lrp-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 20px;
}

.lrp-hero-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.lrp-hero-grid > div { min-width: 0; }

.lrp-hero-grid span,
.lrp-hero-grid small {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.lrp-hero-grid strong {
  display: block;
  margin: 7px 0;
  font-size: 18px;
}

.lrp-section { display: grid; gap: 14px; }

.lrp-section-label h2 { font-size: 18px; }

.lrp-section-label p {
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 13px;
}

.lrp-pillars { overflow-x: auto; }

.lrp-pillars table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

.lrp-pillars th,
.lrp-pillars td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-body);
  font-size: 14px;
  text-align: center;
}

.lrp-pillars thead th,
.lrp-pillars tbody th {
  color: var(--text-faint);
  font-size: 12px;
  font-weight: 600;
}

.lrp-ganzhi { font-size: 18px; font-weight: 700; }

.lrp-courses,
.lrp-transmissions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.lrp-transmissions { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.lrp-courses article,
.lrp-transmissions article {
  min-height: 144px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  text-align: center;
}

.lrp-courses header,
.lrp-transmissions header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-faint);
  font-size: 11px;
}

.lrp-courses b,
.lrp-transmissions b {
  display: block;
  margin: 16px 0 8px;
  font-size: 32px;
  line-height: 1;
}

.lrp-courses i {
  display: block;
  color: var(--text-muted);
  font-size: 14px;
  font-style: normal;
}

.lrp-courses p,
.lrp-transmissions p {
  margin: 8px 0 0;
  color: var(--text-body);
  font-size: 13px;
}

.lrp-transmissions footer {
  margin-top: 10px;
  color: var(--text-faint);
  font-size: 11px;
}

.lrp-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.lrp-palace {
  min-height: 132px;
  padding: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-card);
  text-align: center;
}

.lrp-palace.is-void {
  background: color-mix(in srgb, var(--accent-bg) 22%, var(--surface-card));
}

.lrp-palace header {
  display: flex;
  justify-content: space-between;
  color: var(--text-faint);
  font-size: 11px;
}

.lrp-palace header strong {
  color: var(--text-primary);
  font-size: 13px;
}

.lrp-palace b {
  display: block;
  margin: 16px 0 8px;
  font-size: 28px;
  line-height: 1;
}

.lrp-palace p {
  margin: 0;
  color: var(--text-body);
  font-size: 12px;
}

.lrp-palace footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 8px;
}

.lrp-palace footer span {
  padding: 1px 5px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 9px;
  white-space: nowrap;
}

.lrp-legend {
  color: var(--text-faint);
  font-size: 12px;
}

.lrp-marks {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.lrp-marks article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-card);
}

.lrp-marks strong { color: var(--text-muted); font-size: 13px; }
.lrp-marks b { font-size: 22px; }

.lrp-gods {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.lrp-gods article {
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-card);
}

.lrp-gods strong {
  display: block;
  margin-bottom: 10px;
  color: var(--text-muted);
  font-size: 13px;
}

.lrp-gods div {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

.lrp-gods span {
  padding: 5px 3px;
  border-radius: 8px;
  background: var(--surface-input);
  color: var(--text-body);
  font-size: 11px;
  text-align: center;
}

.lrp-gods i {
  display: block;
  margin-top: 1px;
  color: var(--text-faint);
  font-style: normal;
  font-size: 10px;
}

.lrp-shensha {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-height: 620px;
  gap: 10px;
  overflow: auto;
  padding-right: 4px;
}

.lrp-shensha article {
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-card);
}

.lrp-shensha header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.lrp-shensha strong { font-size: 13px; }
.lrp-shensha span { color: var(--accent); font-size: 13px; }

.lrp-shensha p {
  margin: 6px 0 0;
  color: var(--text-faint);
  font-size: 11px;
  line-height: 1.5;
}

.lrp-methodology dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin: 14px 0;
}

.lrp-methodology dt { color: var(--text-faint); font-size: 12px; }

.lrp-methodology dd {
  margin: 4px 0 0;
  color: var(--text-body);
  font-size: 14px;
}

.lrp-methodology > p {
  margin: 0;
  color: var(--text-faint);
  font-size: 12px;
}

.lrp-insight-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--overlay-bg);
}

.lrp-insight {
  width: min(620px, 100%);
  max-height: min(80vh, 720px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-dropdown);
}

.lrp-insight-head,
.lrp-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.lrp-insight-head { border-bottom: 1px solid var(--border-light); }
.lrp-insight-foot { border-top: 1px solid var(--border-light); }

.lrp-insight-head p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--accent);
  font-size: 12px;
}

.lrp-insight-head h3 {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lrp-insight-body {
  overflow: auto;
  padding: 16px;
}

.lrp-insight-content {
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.lrp-insight-status,
.lrp-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.lrp-insight-error { color: #b91c1c; }
.lrp-insight-foot small { color: var(--text-faint); font-size: 11px; }

.lrp-insight-foot button,
.lrp-insight-auth button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
}

.lrp-insight-auth {
  padding: 14px 16px;
  border-top: 1px solid var(--border-light);
  background: var(--surface-card);
}

.lrp-insight-auth p {
  margin: 0 0 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.lrp-insight-auth div { display: flex; gap: 8px; }

.lrp-insight-enter-active,
.lrp-insight-leave-active { transition: opacity 180ms ease; }

.lrp-insight-enter-from,
.lrp-insight-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .lrp-hero-grid,
  .lrp-methodology dl { grid-template-columns: 1fr; }
  .lrp-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lrp-shensha { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lrp-gods div { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .lrp-courses { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lrp-transmissions,
  .lrp-marks { grid-template-columns: 1fr; }
  .lrp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lrp-shensha { grid-template-columns: 1fr; max-height: none; }
  .lrp-gods { grid-template-columns: 1fr; }
  .lrp-gods div { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lrp-courses b,
  .lrp-transmissions b { font-size: 28px; }
  .lrp-palace b { font-size: 24px; }
}
</style>
