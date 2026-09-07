<template>
  <div
    ref="reportRoot"
    class="vpc"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="vpc-card vpc-hero">
      <dl class="vpc-birth-grid">
        <div>
          <dt>{{ $t('vpc.birth') }}</dt>
          <dd>{{ result.birth.localText }}</dd>
          <small>{{ result.birth.location.timezone }} · UTC{{ offsetText }}</small>
        </div>
        <div>
          <dt>{{ $t('vpc.location') }}</dt>
          <dd>{{ result.birth.location.name }}</dd>
          <small>{{ coordinates }}</small>
        </div>
        <div>
          <dt>{{ $t('vpc.gender') }}</dt>
          <dd>{{ genderText }}</dd>
          <small>{{ result.birth.timeUncertain ? $t('vpc.timeUncertain') : $t('vpc.timeExact') }}</small>
        </div>
        <div>
          <dt>{{ $t('vpc.engine') }}</dt>
          <dd>{{ result.methodology.ayanamsa }}</dd>
          <small>{{ result.methodology.houseSystem }} · {{ result.methodology.ayanamsha.toFixed(3) }}°</small>
        </div>
      </dl>
    </section>

    <section class="vpc-section">
      <header class="vpc-section-label">
        <h2>{{ $t('vpc.chartTitle') }}</h2>
        <p>{{ $t('vpc.chartSubtitle') }}</p>
      </header>
      <div class="vpc-body-stack">
        <div class="vpc-quad">
          <div class="vpc-card"><span>{{ $t('vpc.ascendant') }}</span><strong>{{ signName(result.ascendant.signKey) }} {{ result.ascendant.degree }}°</strong><small>{{ result.ascendant.nakshatra }} p{{ result.ascendant.pada }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.moon') }}</span><strong>{{ planetByName('Moon') ? signName(planetByName('Moon')!.signKey) : '—' }}</strong><small>{{ moonNakshatra }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.sun') }}</span><strong>{{ planetByName('Sun') ? signName(planetByName('Sun')!.signKey) : '—' }}</strong><small>{{ sunNakshatra }}</small></div>
          <div class="vpc-card vpc-current"><span>{{ $t('vpc.dasha') }}</span><strong>{{ currentDasha }}</strong><small>{{ currentSubDasha }}</small></div>
        </div>

        <div class="vpc-card vpc-table-card">
          <div class="vpc-table">
            <div class="vpc-row vpc-head">
              <span>{{ $t('vpc.planet') }}</span>
              <span>{{ $t('vpc.sign') }}</span>
              <span>{{ $t('vpc.degree') }}</span>
              <span>{{ $t('vpc.house') }}</span>
              <span>{{ $t('vpc.nakshatra') }}</span>
              <span>{{ $t('vpc.status') }}</span>
            </div>
            <div v-for="planet in result.planets" :key="planet.name" class="vpc-row">
              <span class="vpc-strong">{{ planetName(planet.name) }}</span>
              <span>{{ signName(planet.signKey) }}</span>
              <span>{{ planet.degree }}° {{ planet.minute }}' {{ planet.second }}"</span>
              <span>H{{ planet.house }}</span>
              <span>{{ planet.nakshatra }} p{{ planet.pada }}</span>
              <span class="vpc-tags">
                <em>{{ dignityName(planet.dignity) }}</em>
                <em v-if="planet.isRetrograde">Rx</em>
                <em v-if="planet.isCombust">{{ $t('vpc.combust') }}</em>
                <em v-if="planet.isVargottama">Vargottama</em>
              </span>
            </div>
          </div>
        </div>

        <div class="vpc-card vpc-table-card">
          <div class="vpc-table vpc-house-table">
            <div class="vpc-row vpc-head">
              <span>{{ $t('vpc.house') }}</span>
              <span>{{ $t('vpc.sign') }}</span>
              <span>{{ $t('vpc.lord') }}</span>
              <span>{{ $t('vpc.planets') }}</span>
            </div>
            <div v-for="house in result.houses" :key="house.number" class="vpc-row">
              <span class="vpc-strong">H{{ house.number }}</span>
              <span>{{ signName(house.signKey) }}</span>
              <span>{{ planetName(house.signLord) }} @ H{{ house.lordHouse }}</span>
              <span>{{ house.planets.map(planetName).join(' · ') || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="vpc-section">
      <header class="vpc-section-label">
        <h2>{{ $t('vpc.vargaTitle') }}</h2>
        <p>{{ $t('vpc.vargaSubtitle') }}</p>
      </header>
      <div class="vpc-body-stack">
        <div class="vpc-pills">
          <button
            v-for="varga in result.vargas"
            :key="varga.key"
            type="button"
            :class="{ active: selectedVargaKey === varga.key }"
            @click.stop="selectedVargaKey = varga.key"
          >
            {{ varga.label }}
          </button>
        </div>
        <div v-if="selectedVarga" class="vpc-card">
          <header class="vpc-mini-head">
            <strong>{{ selectedVarga.label }}</strong>
            <span>{{ $t('vpc.vargaLagna') }}: {{ signName(selectedVarga.ascendant.signKey) }}</span>
          </header>
          <div class="vpc-varga-grid">
            <article v-for="planet in selectedVarga.planets" :key="`${selectedVarga.key}-${planet.name}`">
              <strong>{{ planetName(planet.name) }}</strong>
              <span>{{ signName(planet.signKey) }}</span>
              <em>H{{ planet.house }}</em>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="vpc-section">
      <header class="vpc-section-label">
        <h2>{{ $t('vpc.dashaTitle') }}</h2>
        <p>{{ $t('vpc.dashaSubtitle') }}</p>
      </header>
      <div class="vpc-body-stack">
        <div class="vpc-card">
          <div class="vpc-dasha-current">
            <div><span>{{ $t('vpc.mahadasha') }}</span><strong>{{ planetName(result.dasha.currentMahadasha?.planet || '') }}</strong><small>{{ formatPeriod(result.dasha.currentMahadasha) }}</small></div>
            <div><span>{{ $t('vpc.antardasha') }}</span><strong>{{ planetName(result.dasha.currentAntar?.planet || '') }}</strong><small>{{ formatPeriod(result.dasha.currentAntar) }}</small></div>
            <div><span>{{ $t('vpc.pratyantardasha') }}</span><strong>{{ planetName(result.dasha.currentPratyantar?.planet || '') }}</strong><small>{{ formatPeriod(result.dasha.currentPratyantar) }}</small></div>
          </div>
        </div>
        <div class="vpc-card">
          <article v-for="dasha in result.dasha.mahadashas" :key="`${dasha.planet}-${dasha.startTime}`" class="vpc-dasha-row">
            <header>
              <strong>{{ planetName(dasha.planet) }}</strong>
              <span>{{ formatDate(dasha.startTime) }} → {{ formatDate(dasha.endTime) }}</span>
              <em v-if="dasha.progressPercent !== undefined">{{ dasha.progressPercent.toFixed(1) }}%</em>
            </header>
          </article>
        </div>
      </div>
    </section>

    <section class="vpc-section">
      <header class="vpc-section-label">
        <h2>{{ $t('vpc.panchangTitle') }}</h2>
        <p>{{ $t('vpc.panchangSubtitle') }}</p>
      </header>
      <div class="vpc-body-stack">
        <div class="vpc-detail-grid">
          <div class="vpc-card"><span>{{ $t('vpc.tithi') }}</span><strong>{{ result.panchang.tithiName }}</strong><small>{{ result.panchang.paksha }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.nakshatra') }}</span><strong>{{ result.panchang.nakshatraName }}</strong><small>{{ result.panchang.nakshatraLord }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.yoga') }}</span><strong>{{ result.panchang.yogaName }}</strong><small>{{ result.panchang.karana }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.vara') }}</span><strong>{{ result.panchang.varaName }}</strong><small>{{ result.panchang.currentHora }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.sunrise') }}</span><strong>{{ formatDateTime(result.panchang.sunrise) }}</strong><small>{{ formatDateTime(result.panchang.sunset) }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.masa') }}</span><strong>{{ result.panchang.masaName }}</strong><small>{{ result.panchang.samvatsara }} · Samvat {{ result.panchang.vikramSamvat }}</small></div>
        </div>
        <div class="vpc-card vpc-time-list">
          <article><strong>{{ $t('vpc.rahuKalam') }}</strong><span>{{ formatInterval(result.panchang.rahuKalam) }}</span></article>
          <article><strong>{{ $t('vpc.yamaganda') }}</strong><span>{{ formatInterval(result.panchang.yamagandaKalam) }}</span></article>
          <article><strong>{{ $t('vpc.gulika') }}</strong><span>{{ formatInterval(result.panchang.gulikaKalam) }}</span></article>
          <article><strong>{{ $t('vpc.abhijit') }}</strong><span>{{ formatInterval(result.panchang.abhijitMuhurta) }}</span></article>
        </div>
      </div>
    </section>

    <section class="vpc-section">
      <header class="vpc-section-label">
        <h2>{{ $t('vpc.systemTitle') }}</h2>
        <p>{{ $t('vpc.systemSubtitle') }}</p>
      </header>
      <div class="vpc-body-stack">
        <div class="vpc-two-col">
          <div class="vpc-card">
            <h3>{{ $t('vpc.specialLagna') }}</h3>
            <article v-for="item in result.specialLagnas" :key="item.key" class="vpc-list-row">
              <strong>{{ specialLagnaName(item.key) }}</strong>
              <span>{{ signName(item.signKey) }} {{ item.degree }}°</span>
            </article>
          </div>
          <div class="vpc-card">
            <h3>{{ $t('vpc.arudha') }}</h3>
            <article v-for="item in result.arudhaPadas" :key="item.key" class="vpc-list-row">
              <strong>{{ item.key }}</strong>
              <span>{{ signName(item.signKey) }} · H{{ item.house }}</span>
            </article>
          </div>
        </div>
        <div class="vpc-card">
          <h3>{{ $t('vpc.sav') }}</h3>
          <div class="vpc-bars">
            <div v-for="(bindus, index) in result.ashtakavarga.sav.byHouse" :key="index" class="vpc-bar">
              <span>H{{ index + 1 }}</span>
              <i><em :style="{ width: `${Math.min(100, (bindus / 40) * 100)}%` }" /></i>
              <strong>{{ bindus }}</strong>
            </div>
          </div>
          <small>{{ $t('vpc.savSummary', { total: result.ashtakavarga.sav.totalBindus, strongest: result.ashtakavarga.sav.strongestHouse, weakest: result.ashtakavarga.sav.weakestHouse }) }}</small>
        </div>
        <div class="vpc-card">
          <h3>{{ $t('vpc.drishti') }}</h3>
          <article v-for="item in result.drishti.planets" :key="item.planet" class="vpc-aspect-row">
            <strong>{{ planetName(item.planet) }} @ H{{ item.sourceHouse }}</strong>
            <span>{{ item.aspectedHouses.map(house => `H${house.house}/${house.type}`).join(' · ') }}</span>
            <small>{{ item.aspectedPlanets.map(planet => `${planetName(planet.planet)}-H${planet.house}`).join(' · ') || '—' }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="vpc-section">
      <header class="vpc-section-label">
        <h2>{{ $t('vpc.transitTitle') }}</h2>
        <p>{{ $t('vpc.transitSubtitle') }}</p>
      </header>
      <div class="vpc-body-stack">
        <div class="vpc-three-col">
          <div class="vpc-card"><span>{{ $t('vpc.saturnTransit') }}</span><strong>{{ signName(result.transits.saturn.signKey) }} · H{{ result.transits.saturn.house }}</strong><small>{{ formatDateTime(result.transits.asAt) }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.sadeSati') }}</span><strong>{{ result.transits.sadeSati.status ? result.transits.sadeSati.phaseName || $t('vpc.active') : $t('vpc.inactive') }}</strong><small>{{ result.transits.sadeSati.description }}</small></div>
          <div class="vpc-card"><span>{{ $t('vpc.chandrashtama') }}</span><strong>{{ result.transits.chandrashtama.isActive ? $t('vpc.active') : $t('vpc.inactive') }}</strong><small>{{ result.transits.chandrashtama.signName }}</small></div>
        </div>
      </div>
    </section>

    <p class="vpc-disclaimer">{{ $t('vpc.disclaimer') }}</p>

    <Teleport to="body">
      <Transition name="vpc-insight">
        <div v-if="insightOpen" class="vpc-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="vpc-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('vpc.aiPanelTitle')">
            <header>
              <div>
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" /> {{ $t('vpc.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('vpc.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('vpc.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="vpc-insight-body">
              <div v-if="insightStatus === 'connecting'" class="vpc-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" /> {{ $t('vpc.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="vpc-insight-error">{{ insightError }}</div>
              <div v-else class="vpc-insight-content">{{ insightContent }}</div>
            </div>
            <footer>
              <small>{{ $t('vpc.aiDisclaimer') }}</small>
              <button v-if="insightMode === 'target' && insightStatus === 'complete'" type="button" @click="handleFullReport">
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="vpc-auth">
              <p>{{ $t('vpc.aiLoginRequired') }}</p>
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
import type { VedicPaipanResult } from '~/types/vedic-paipan'

const props = defineProps<{ result: VedicPaipanResult }>()
const route = useRoute()
const { t, locale } = useI18n()
const { isLoggedIn, signInWithGoogle, signInWithTelegram } = useAuth()
const reportRoot = ref<HTMLElement | null>(null)
const selectedVargaKey = ref('d1')

const insightOpen = ref(false)
const insightMode = ref<'target' | 'full'>('target')
const insightTitle = ref('')
const insightContent = ref('')
const insightStatus = ref<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
const insightError = ref('')
const authRequired = ref(false)
let insightAbort: AbortController | null = null

const selectedVarga = computed(() => props.result.vargas.find(item => item.key === selectedVargaKey.value))
const offsetText = computed(() => {
  const offset = props.result.birth.location.utcOffsetMinutes
  const sign = offset >= 0 ? '+' : '-'
  return `${sign}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`
})
const coordinates = computed(() => `${props.result.birth.location.latitude.toFixed(3)}, ${props.result.birth.location.longitude.toFixed(3)}`)
const genderText = computed(() => props.result.birth.gender === 'male'
  ? t('vedic.form.genderMale')
  : props.result.birth.gender === 'female' ? t('vedic.form.genderFemale') : t('vedic.form.genderNone'))
const insightFullLabel = computed(() => isLoggedIn.value ? t('vpc.aiFullReport') : t('vpc.aiFullReportLogin'))

const TARGET_SELECTORS = [
  '.vpc-card',
  'article',
  '.vpc-row > span',
  '.vpc-varga-grid article',
  '.vpc-bar',
  '.vpc-pills button',
].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.vpc-section-label h2')?.textContent ?? '')
  const explicit = node.querySelector<HTMLElement>('strong, h3, dt, span')
  const ownTitle = normalizeText(explicit?.textContent ?? '').slice(0, 48)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.vpc-section-label h2')?.textContent ?? '')
  const group = node.closest<HTMLElement>('.vpc-card')?.querySelector<HTMLElement>('h3')
  return {
    section: sectionTitle,
    group: normalizeText(group?.textContent ?? ''),
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return
  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.vpcAiTarget) continue
    node.dataset.vpcAiTarget = 'true'
    if (node.tagName !== 'BUTTON') {
      node.tabIndex = 0
      node.setAttribute('role', 'button')
    }
    const label = targetLabel(node)
    node.dataset.vpcAiLabel = label
    node.setAttribute('aria-label', `${label} · ${t('vpc.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  void requestInsight({
    label: node.dataset.vpcAiLabel || targetLabel(node),
    ...targetContext(node),
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-vpc-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.vpcAiTarget !== 'true') return
  activateTarget(current)
}

function compactContext() {
  const r = props.result
  return [
    `Birth: ${r.birth.localText} ${r.birth.location.name} ${r.birth.location.timezone}`,
    `Lagna: ${r.ascendant.signName} ${r.ascendant.degree}° ${r.ascendant.nakshatra} p${r.ascendant.pada}`,
    `Planets: ${r.planets.map(planet => `${planet.name}-${planet.signName}-H${planet.house}-${planet.degree}°${planet.nakshatra}/p${planet.pada}${planet.isRetrograde ? '-Rx' : ''}`).join('; ')}`,
    `Houses: ${r.houses.map(house => `H${house.number}-${house.signName}-L${house.signLord}@H${house.lordHouse}[${house.planets.join('+') || '-'}]`).join('; ')}`,
    `Dasha: ${r.dasha.currentMahadasha?.planet || '-'}/${r.dasha.currentAntar?.planet || '-'}/${r.dasha.currentPratyantar?.planet || '-'}`,
    `D9: Lagna ${r.vargas.find(item => item.key === 'd9')?.ascendant.signName}; ${r.vargas.find(item => item.key === 'd9')?.planets.map(planet => `${planet.name}-${planet.signName}-H${planet.house}`).join('; ')}`,
    `D10: Lagna ${r.vargas.find(item => item.key === 'd10')?.ascendant.signName}; ${r.vargas.find(item => item.key === 'd10')?.planets.map(planet => `${planet.name}-${planet.signName}-H${planet.house}`).join('; ')}`,
    `Panchang: ${r.panchang.tithiName}/${r.panchang.nakshatraName}/${r.panchang.yogaName}/${r.panchang.karana}/${r.panchang.varaName}`,
    `Special Lagnas: ${r.specialLagnas.map(item => `${item.key}-${item.signName}`).join('; ')}`,
    `Arudha: ${r.arudhaPadas.map(item => `${item.key}-H${item.house}`).join('; ')}`,
    `SAV: ${r.ashtakavarga.sav.byHouse.map((bindus, index) => `H${index + 1}:${bindus}`).join(',')}`,
    `Transit: Saturn-${r.transits.saturn.signName}-H${r.transits.saturn.house}; SadeSati=${r.transits.sadeSati.status}; Dhaiya=${r.transits.dhaiya.status}`,
  ].join('\n')
}

async function requestInsight(target: { label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('vpc.aiFullReportTitle')
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
    const response = await fetch('/api/tools/vedic-paipan/interpret', {
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
      } catch { /* keep HTTP code */ }
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
          } else if (chunk.type === 'error') {
            throw new Error(chunk.message || t('vpc.aiError'))
          }
        } catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }
    if (!insightContent.value) throw new Error(t('vpc.aiNoResult'))
    insightStatus.value = 'complete'
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('vpc.aiError')
  } finally {
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

function signName(key: string) {
  return t(`vpc.signs.${key}`)
}

function planetName(name: string) {
  if (!name) return '—'
  const translated = t(`vpc.planetNames.${name}`)
  return translated === `vpc.planetNames.${name}` ? name : translated
}

function dignityName(value: string) {
  const translated = t(`vpc.dignities.${value}`)
  return translated === `vpc.dignities.${value}` ? value : translated
}

function specialLagnaName(key: string) {
  return t(`vpc.specialLagnas.${key}`)
}

function planetByName(name: string) {
  return props.result.planets.find(planet => planet.name === name)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: props.result.birth.location.timezone }).format(new Date(value))
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: props.result.birth.location.timezone,
    hour12: false,
  }).format(new Date(value))
}

function formatPeriod(period?: { startTime: string, endTime: string }) {
  if (!period) return '—'
  return `${formatDateTime(period.startTime)} → ${formatDateTime(period.endTime)}`
}

function formatInterval(interval?: { start: string, end: string } | null) {
  if (!interval) return '—'
  return `${formatDateTime(interval.start)} - ${formatDateTime(interval.end)}`
}

const moonNakshatra = computed(() => {
  const moon = planetByName('Moon')
  return moon ? `${moon.nakshatra} p${moon.pada} · H${moon.house}` : '—'
})
const sunNakshatra = computed(() => {
  const sun = planetByName('Sun')
  return sun ? `${sun.nakshatra} p${sun.pada} · H${sun.house}` : '—'
})
const currentDasha = computed(() => planetName(props.result.dasha.currentMahadasha?.planet || ''))
const currentSubDasha = computed(() => `${planetName(props.result.dasha.currentAntar?.planet || '')} / ${planetName(props.result.dasha.currentPratyantar?.planet || '')}`)

watch(() => props.result, async () => {
  selectedVargaKey.value = 'd1'
  await nextTick()
  initializeTargets()
}, { immediate: true })

watch(selectedVargaKey, async () => {
  await nextTick()
  initializeTargets()
})

onMounted(() => nextTick(initializeTargets))
onBeforeUnmount(() => insightAbort?.abort())
</script>

<style scoped>
.vpc { display: grid; gap: 34px; }
.vpc-card { border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-card); padding: 20px; min-width: 0; }
.vpc-hero { display: grid; }
.vpc-birth-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 0; }
.vpc-birth-grid dt { color: var(--text-faint); font-size: 12px; }
.vpc-birth-grid dd { margin: 8px 0 0; font-size: 19px; font-weight: 700; }
.vpc-birth-grid small { display: block; margin-top: 7px; color: var(--text-muted); font-size: 12px; line-height: 1.5; }
.vpc-section { display: grid; grid-template-columns: minmax(180px, 230px) minmax(0, 1fr); gap: 26px; align-items: start; }
.vpc-section-label { position: sticky; top: 92px; }
.vpc-section-label h2 { margin: 0; font-size: 28px; font-weight: 800; line-height: 1.2; }
.vpc-section-label p { margin: 10px 0 0; color: var(--text-muted); font-size: 13px; line-height: 1.7; }
.vpc-body-stack { display: grid; gap: 14px; }
.vpc-quad, .vpc-three-col, .vpc-detail-grid { display: grid; gap: 12px; }
.vpc-quad { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.vpc-three-col { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.vpc-detail-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.vpc-two-col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.vpc-card > span, .vpc-card h3 { display: block; color: var(--text-faint); font-size: 12px; font-weight: 600; }
.vpc-card h3 { margin: 0 0 12px; color: var(--text-muted); font-size: 13px; }
.vpc-card strong { display: block; margin-top: 7px; font-size: 17px; }
.vpc-card small { display: block; margin-top: 6px; color: var(--text-muted); font-size: 11px; line-height: 1.5; }
.vpc-current { border-color: var(--accent-border); }
.vpc-current strong { color: var(--accent); }
.vpc-table-card { overflow-x: auto; }
.vpc-table { min-width: 740px; }
.vpc-row { display: grid; grid-template-columns: 105px repeat(5, minmax(0, 1fr)); gap: 8px; padding: 11px 0; border-top: 1px solid var(--border-subtle); font-size: 13px; }
.vpc-row:first-child { border-top: 0; }
.vpc-head { color: var(--text-faint); font-size: 12px; }
.vpc-strong { font-weight: 700; }
.vpc-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.vpc-tags em { padding: 2px 6px; border-radius: 999px; background: var(--surface-input); color: var(--text-muted); font-size: 10px; font-style: normal; }
.vpc-house-table .vpc-row { grid-template-columns: 55px repeat(3, minmax(0, 1fr)); }
.vpc-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.vpc-pills button { padding: 6px 10px; border: 1px solid var(--border-light); border-radius: 7px; background: var(--surface-input); color: var(--text-muted); font-size: 12px; cursor: pointer; }
.vpc-pills button.active { border-color: var(--accent-border-hover); background: var(--accent-bg); color: var(--accent); }
.vpc-mini-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 14px; font-size: 13px; }
.vpc-mini-head strong { font-size: 16px; }
.vpc-varga-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
.vpc-varga-grid article { padding: 10px; border: 1px solid var(--border-light); border-radius: 9px; background: var(--surface-input); }
.vpc-varga-grid strong { display: block; font-size: 13px; }
.vpc-varga-grid span, .vpc-varga-grid em { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; font-style: normal; }
.vpc-dasha-current { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.vpc-dasha-row { padding: 8px 0; border-top: 1px solid var(--border-subtle); }
.vpc-dasha-row:first-of-type { border-top: 0; }
.vpc-dasha-row header { display: flex; align-items: baseline; gap: 10px; }
.vpc-dasha-row strong { min-width: 72px; margin: 0; font-size: 13px; }
.vpc-dasha-row span { color: var(--text-muted); font-size: 12px; }
.vpc-dasha-row em { margin-left: auto; color: var(--accent); font-size: 11px; font-style: normal; }
.vpc-list-row { display: flex; justify-content: space-between; gap: 10px; padding: 7px 0; border-top: 1px solid var(--border-subtle); font-size: 12px; }
.vpc-list-row:first-of-type { border-top: 0; }
.vpc-list-row strong { margin: 0; font-size: 12px; }
.vpc-bars { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 28px; }
.vpc-bar { display: grid; grid-template-columns: 32px minmax(0, 1fr) 28px; align-items: center; gap: 9px; font-size: 12px; }
.vpc-bar i { height: 6px; overflow: hidden; border-radius: 999px; background: var(--surface-input); }
.vpc-bar em { display: block; height: 100%; background: var(--accent); }
.vpc-aspect-row { padding: 9px 0; border-top: 1px solid var(--border-subtle); font-size: 12px; }
.vpc-aspect-row:first-of-type { border-top: 0; }
.vpc-aspect-row span { display: block; margin-top: 4px; color: var(--text-muted); }
.vpc-aspect-row small { color: var(--text-faint); }
.vpc-time-list article { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid var(--border-subtle); font-size: 12px; }
.vpc-time-list article:first-of-type { border-top: 0; }
.vpc-disclaimer { color: var(--text-faint); font-size: 12px; line-height: 1.6; }
[data-vpc-ai-target] { position: relative; border-radius: inherit; transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
[data-vpc-ai-target]::after { content: '✦'; position: absolute; z-index: 5; top: 5px; right: 5px; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--accent-border); border-radius: 999px; background: color-mix(in srgb, var(--surface-bg) 88%, var(--accent-bg)); color: var(--accent); font-size: 10px; opacity: 0; pointer-events: none; transition: opacity 140ms ease; }
[data-vpc-ai-target]:hover, [data-vpc-ai-target]:focus-visible { background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent); border-color: var(--accent-border-hover); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent); }
[data-vpc-ai-target]:hover::after, [data-vpc-ai-target]:focus-visible::after { opacity: 1; }
[data-vpc-ai-target]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.vpc-insight-layer { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--overlay-bg); }
.vpc-insight { width: min(760px, 100%); max-height: min(82vh, 760px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; border: 1px solid var(--border-medium); border-radius: 12px; background: var(--surface-dropdown); }
.vpc-insight header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 18px; border-bottom: 1px solid var(--border-light); }
.vpc-insight header p { display: flex; align-items: center; gap: 6px; margin: 0 0 6px; color: var(--accent); font-size: 12px; }
.vpc-insight h3 { margin: 0; font-size: 18px; }
.vpc-insight header button { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }
.vpc-insight-body { overflow: auto; padding: 18px; }
.vpc-insight-status { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
.vpc-insight-error { color: #b91c1c; font-size: 14px; }
.vpc-insight-content { white-space: pre-wrap; font-size: 14px; line-height: 1.75; color: var(--text-body); }
.vpc-insight footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 18px; border-top: 1px solid var(--border-light); }
.vpc-insight footer small { color: var(--text-faint); font-size: 11px; }
.vpc-insight footer button { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; background: var(--text-primary); color: var(--surface-bg); padding: 8px 13px; font-size: 13px; cursor: pointer; }
.vpc-auth { padding: 0 18px 18px; }
.vpc-auth p { margin: 0 0 9px; color: var(--text-muted); font-size: 13px; }
.vpc-auth div { display: flex; gap: 8px; }
.vpc-auth button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-light); border-radius: 999px; background: var(--surface-card); color: var(--text-body); padding: 7px 12px; font-size: 13px; cursor: pointer; }
.vpc-insight-enter-active, .vpc-insight-leave-active { transition: opacity 180ms ease; }
.vpc-insight-enter-from, .vpc-insight-leave-to { opacity: 0; }
@media (max-width: 1000px) {
  .vpc-section { grid-template-columns: 1fr; }
  .vpc-section-label { position: static; }
  .vpc-birth-grid, .vpc-quad, .vpc-three-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .vpc-detail-grid { grid-template-columns: 1fr; }
  .vpc-two-col { grid-template-columns: 1fr; }
}
@media (max-width: 620px) {
  .vpc { gap: 26px; }
  .vpc-birth-grid, .vpc-quad, .vpc-three-col, .vpc-dasha-current, .vpc-bars { grid-template-columns: 1fr; }
  .vpc-card { padding: 16px; }
  .vpc-dasha-row header { flex-wrap: wrap; }
}
</style>
