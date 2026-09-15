<template>
  <div
    ref="reportRoot"
    class="ta-report"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="ta-section">
      <header class="ta-section-label">
        <h2>{{ $t('thaiAstro.chartTitle') }}</h2>
        <p>{{ $t('thaiAstro.chartSubtitle') }}</p>
      </header>

      <div class="ta-stack">
        <div class="ta-card ta-target">
          <dl class="ta-birth-grid">
            <div>
              <dt>{{ $t('thaiAstro.birth') }}</dt>
              <dd>{{ result.input.birthDate }} {{ result.input.birthTime }}</dd>
              <small>{{ result.input.location.timezone }} · UTC{{ offsetText }}</small>
            </div>
            <div>
              <dt>{{ $t('thaiAstro.location') }}</dt>
              <dd>{{ result.input.location.name }}</dd>
              <small>{{ coordinates }}</small>
            </div>
            <div>
              <dt>{{ $t('thaiAstro.birthUtc') }}</dt>
              <dd>{{ formatDateTime(result.input.birthUtc) }}</dd>
              <small>{{ result.input.timeUncertain ? $t('thaiAstro.timeUncertain') : $t('thaiAstro.timeExact') }}</small>
            </div>
            <div>
              <dt>{{ $t('thaiAstro.engine') }}</dt>
              <dd>{{ result.methodology.ayanamsa }}</dd>
              <small>{{ result.methodology.houseSystem }} · {{ result.methodology.ayanamsha.toFixed(3) }}°</small>
            </div>
          </dl>
        </div>

        <div class="ta-summary-grid">
          <div class="ta-card ta-target" :data-ta-ai-label="`${$t('thaiAstro.ascendant')} ${signName(result.ascendant.signKey)}`">
            <span>{{ $t('thaiAstro.ascendant') }}</span>
            <strong>{{ signName(result.ascendant.signKey) }}</strong>
            <small>{{ result.ascendant.degree }}° {{ result.ascendant.minute }}' · {{ result.ascendant.nakshatraTh }} p{{ result.ascendant.pada }}</small>
          </div>
          <div class="ta-card ta-target" :data-ta-ai-label="`${$t('thaiAstro.sunSign')} ${planetByKey('Sun') ? signName(planetByKey('Sun')!.signKey) : ''}`">
            <span>{{ $t('thaiAstro.sunSign') }}</span>
            <strong>{{ planetByKey('Sun') ? signName(planetByKey('Sun')!.signKey) : '—' }}</strong>
            <small>{{ planetByKey('Sun')?.nakshatraTh }}</small>
          </div>
          <div class="ta-card ta-target" :data-ta-ai-label="`${$t('thaiAstro.moonSign')} ${planetByKey('Moon') ? signName(planetByKey('Moon')!.signKey) : ''}`">
            <span>{{ $t('thaiAstro.moonSign') }}</span>
            <strong>{{ planetByKey('Moon') ? signName(planetByKey('Moon')!.signKey) : '—' }}</strong>
            <small>{{ planetByKey('Moon')?.nakshatraTh }} p{{ planetByKey('Moon')?.pada }}</small>
          </div>
          <div class="ta-card ta-target" :data-ta-ai-label="`${$t('thaiAstro.tanuseth')} ${result.tanuseth.bodyKey ? bodyName(result.tanuseth.bodyKey) : ''}`">
            <span>{{ $t('thaiAstro.tanuseth') }}</span>
            <strong>{{ result.tanuseth.bodyKey ? `${bodyName(result.tanuseth.bodyKey)} · #${result.tanuseth.number}` : '—' }}</strong>
            <small>{{ result.tanuseth.signKey ? signName(result.tanuseth.signKey) : '' }}</small>
          </div>
          <div class="ta-card ta-target" :data-ta-ai-label="`${$t('thaiAstro.taksa')} ${bodyName(result.taksa.dayKey)}`">
            <span>{{ $t('thaiAstro.taksa') }}</span>
            <strong>{{ bodyName(result.taksa.dayKey) }}</strong>
            <small>{{ result.taksa.nightChart ? $t('thaiAstro.wednesdayNight') : $t('thaiAstro.dayChart') }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="ta-section">
      <header class="ta-section-label">
        <h2>{{ $t('thaiAstro.planetsTitle') }}</h2>
        <p>{{ $t('thaiAstro.planetsSubtitle') }}</p>
      </header>
      <div class="ta-stack">
        <div class="ta-card ta-table-card">
          <div class="ta-table">
            <div class="ta-row ta-head">
              <span>{{ $t('thaiAstro.body') }}</span>
              <span>{{ $t('thaiAstro.sign') }}</span>
              <span>{{ $t('thaiAstro.degree') }}</span>
              <span>{{ $t('thaiAstro.house') }}</span>
              <span>{{ $t('thaiAstro.mansion') }}</span>
              <span>{{ $t('thaiAstro.status') }}</span>
            </div>
            <div
              v-for="planet in result.planets"
              :key="planet.key"
              class="ta-row ta-target"
              :data-ta-ai-label="`${bodyName(planet.key)} ${signName(planet.signKey)} ${planet.degree}° H${planet.house}`"
            >
              <span class="ta-body">
                <i>{{ planet.symbol }}{{ planet.number }}</i>
                <strong>{{ bodyName(planet.key) }}</strong>
                <em v-if="planet.isTanuseth">{{ $t('thaiAstro.tanusethMark') }}</em>
              </span>
              <span>{{ signName(planet.signKey) }}</span>
              <span>{{ formatDegree(planet) }}</span>
              <span>H{{ planet.house }} · {{ houseName(planet.houseKey) }}</span>
              <span>{{ planet.nakshatraTh }} p{{ planet.pada }}</span>
              <span class="ta-tags">
                <em v-for="status in planet.statuses" :key="status">{{ statusName(status) }}</em>
                <em v-if="planet.isRetrograde">R</em>
              </span>
            </div>
          </div>
        </div>

        <div class="ta-card ta-table-card">
          <div class="ta-table">
            <div class="ta-row ta-head">
              <span>{{ $t('thaiAstro.house') }}</span>
              <span>{{ $t('thaiAstro.sign') }}</span>
              <span>{{ $t('thaiAstro.lord') }}</span>
              <span>{{ $t('thaiAstro.occupants') }}</span>
            </div>
            <div
              v-for="house in result.houses"
              :key="house.number"
              class="ta-row ta-target"
              :data-ta-ai-label="`H${house.number} ${houseName(house.key)} ${signName(house.signKey)}`"
            >
              <span class="ta-strong">H{{ house.number }} · {{ houseName(house.key) }}</span>
              <span>{{ signName(house.signKey) }}</span>
              <span>{{ bodyName(house.signLordKey) }}</span>
              <span>{{ house.occupants.map(bodyName).join(' · ') || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="ta-section">
      <header class="ta-section-label">
        <h2>{{ $t('thaiAstro.overlaysTitle') }}</h2>
        <p>{{ $t('thaiAstro.overlaysSubtitle') }}</p>
      </header>
      <div class="ta-stack">
        <div class="ta-card ta-table-card">
          <div class="ta-table">
            <div class="ta-row ta-head">
              <span>{{ $t('thaiAstro.body') }}</span>
              <span>{{ $t('thaiAstro.triyanga') }}</span>
              <span>{{ $t('thaiAstro.navamsa') }}</span>
              <span>{{ $t('thaiAstro.mansionLord') }}</span>
            </div>
            <div
              v-for="planet in result.planets"
              :key="`overlay-${planet.key}`"
              class="ta-row ta-target"
              :data-ta-ai-label="`${bodyName(planet.key)} ${triyangaName(planet.key)} ${navamsaName(planet.key)}`"
            >
              <span class="ta-strong">{{ bodyName(planet.key) }}</span>
              <span>{{ triyangaName(planet.key) }} · {{ signName(triyangaSign(planet.key)) }}</span>
              <span>{{ navamsaName(planet.key) }} · {{ signName(navamsaSign(planet.key)) }}</span>
              <span>{{ bodyName(planet.nakshatraLordKey as ThaiBodyKey) }}</span>
            </div>
          </div>
        </div>

        <div class="ta-grid-4">
          <article
            v-for="item in result.taksa.positions"
            :key="item.role"
            class="ta-card ta-target"
            :data-ta-ai-label="`${taksaRoleName(item.role)} ${bodyName(item.bodyKey)}`"
          >
            <span>{{ taksaRoleName(item.role) }}</span>
            <strong>{{ bodyName(item.bodyKey) }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="ta-section">
      <header class="ta-section-label">
        <h2>{{ $t('thaiAstro.panchangTitle') }}</h2>
        <p>{{ $t('thaiAstro.panchangSubtitle') }}</p>
      </header>
      <div class="ta-stack">
        <div class="ta-grid-4">
          <div class="ta-card ta-target"><span>{{ $t('thaiAstro.weekday') }}</span><strong>{{ result.panchang.weekday }}</strong></div>
          <div class="ta-card ta-target"><span>{{ $t('thaiAstro.tithi') }}</span><strong>{{ result.panchang.tithi }}</strong><small>{{ result.panchang.paksha }}</small></div>
          <div class="ta-card ta-target"><span>{{ $t('thaiAstro.moonMansion') }}</span><strong>{{ result.panchang.moonNakshatra }}</strong><small>{{ result.panchang.yoga }}</small></div>
          <div class="ta-card ta-target"><span>{{ $t('thaiAstro.karana') }}</span><strong>{{ result.panchang.karana }}</strong></div>
        </div>
        <div class="ta-grid-2">
          <div class="ta-card ta-target"><span>{{ $t('thaiAstro.sunrise') }}</span><strong>{{ formatDateTime(result.panchang.sunrise) }}</strong></div>
          <div class="ta-card ta-target"><span>{{ $t('thaiAstro.sunset') }}</span><strong>{{ formatDateTime(result.panchang.sunset) }}</strong></div>
        </div>
      </div>
    </section>

    <section class="ta-section">
      <header class="ta-section-label">
        <h2>{{ $t('thaiAstro.methodologyTitle') }}</h2>
        <p>{{ $t('thaiAstro.methodologySubtitle') }}</p>
      </header>
      <div class="ta-card ta-target">
        <dl class="ta-methodology">
          <div><dt>{{ $t('thaiAstro.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
          <div><dt>{{ $t('thaiAstro.houseSystem') }}</dt><dd>{{ result.methodology.houseSystem }}</dd></div>
          <div><dt>{{ $t('thaiAstro.thaiKetu') }}</dt><dd>{{ result.methodology.thaiKetu }}</dd></div>
          <div><dt>{{ $t('thaiAstro.privacy') }}</dt><dd>{{ $t('thaiAstro.privacyValue') }}</dd></div>
        </dl>
      </div>
    </section>

    <p class="ta-disclaimer">{{ $t('thaiAstro.disclaimer') }}</p>

    <Teleport to="body">
      <Transition name="ta-insight">
        <div v-if="insightOpen" class="ta-insight-layer" role="presentation" @click.self="closeInsight">
          <section class="ta-insight" role="dialog" aria-modal="true" :aria-label="insightTitle || $t('thaiAstro.aiPanelTitle')">
            <header class="ta-insight-head">
              <div class="min-w-0">
                <p><UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" /> {{ $t('thaiAstro.aiPanelTitle') }}</p>
                <h3>{{ insightTitle || $t('thaiAstro.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('thaiAstro.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>
            <div class="ta-insight-body">
              <div v-if="insightStatus === 'connecting'" class="ta-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" /> {{ $t('thaiAstro.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="ta-insight-error">{{ insightError }}</div>
              <div v-else class="ta-insight-content">{{ insightContent }}</div>
            </div>
            <footer class="ta-insight-foot">
              <small>{{ $t('thaiAstro.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>
            <div v-if="authRequired" class="ta-insight-auth">
              <p>{{ $t('thaiAstro.aiLoginRequired') }}</p>
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
import type {
  ThaiAstroChartResult,
  ThaiBodyKey,
  ThaiHouseKey,
  ThaiSignKey,
  ThaiStatusKey,
  ThaiTaksaRole,
  ThaiTriyangaKey,
} from '~~/server/utils/tools/thai-astro-paipan'

const props = defineProps<{ result: ThaiAstroChartResult }>()
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
  ? t('thaiAstro.aiFullReport')
  : t('thaiAstro.aiFullReportLogin'))

const offsetText = computed(() => {
  const offset = props.result.input.location.utcOffsetMinutes
  const sign = offset >= 0 ? '+' : '-'
  return `${sign}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`
})

const coordinates = computed(() => `${props.result.input.location.latitude.toFixed(3)}, ${props.result.input.location.longitude.toFixed(3)}`)

const BODY_KEYS: Record<string, string> = {
  Sun: 'sun',
  Moon: 'moon',
  Mars: 'mars',
  Mercury: 'mercury',
  Jupiter: 'jupiter',
  Venus: 'venus',
  Saturn: 'saturn',
  Rahu: 'rahu',
  Ketu: 'thaiKetu',
  ThaiKetu: 'thaiKetu',
  Uranus: 'uranus',
}

const SIGN_KEYS: Record<ThaiSignKey, string> = {
  aries: 'aries',
  taurus: 'taurus',
  gemini: 'gemini',
  cancer: 'cancer',
  leo: 'leo',
  virgo: 'virgo',
  libra: 'libra',
  scorpio: 'scorpio',
  sagittarius: 'sagittarius',
  capricorn: 'capricorn',
  aquarius: 'aquarius',
  pisces: 'pisces',
}

const HOUSE_KEYS: Record<ThaiHouseKey, string> = {
  tanu: 'tanu',
  katumpha: 'katumpha',
  sahatcha: 'sahatcha',
  phanthu: 'phanthu',
  putta: 'putta',
  ari: 'ari',
  patni: 'patni',
  marana: 'marana',
  supha: 'supha',
  kamma: 'kamma',
  lapha: 'lapha',
  vinat: 'vinat',
}

const TRIYANGA_KEYS: Record<ThaiTriyangaKey, string> = {
  first: 'first',
  second: 'second',
  third: 'third',
}

const TAKSA_ROLE_KEYS: Record<ThaiTaksaRole, string> = {
  attendant: 'attendant',
  longevity: 'longevity',
  power: 'power',
  glory: 'glory',
  root: 'root',
  effort: 'effort',
  minister: 'minister',
  calamity: 'calamity',
}

function bodyName(key?: ThaiBodyKey | string | null) {
  return key ? t(`thaiAstro.bodies.${BODY_KEYS[key] ?? key}`) : '—'
}

function signName(key?: ThaiSignKey | null) {
  return key ? t(`thaiAstro.signs.${SIGN_KEYS[key]}`) : '—'
}

function houseName(key: ThaiHouseKey) {
  return t(`thaiAstro.houses.${HOUSE_KEYS[key]}`)
}

function statusName(key: ThaiStatusKey) {
  return t(`thaiAstro.statuses.${key}`)
}

function triyangaName(key: ThaiBodyKey) {
  const segment = triyangaSegment(key)
  return t(`thaiAstro.triyangas.${TRIYANGA_KEYS[segment]}`)
}

function triyangaSegment(key: ThaiBodyKey): ThaiTriyangaKey {
  const planet = planetByKey(key)
  if (!planet) return 'first'
  const index = Math.min(2, Math.floor(planet.longitude % 30 / 10))
  return index === 0 ? 'first' : index === 1 ? 'second' : 'third'
}

function triyangaSign(key: ThaiBodyKey): ThaiSignKey {
  const planet = planetByKey(key)
  if (!planet) return 'aries'
  const segment = Math.min(2, Math.floor(planet.longitude % 30 / 10))
  return indexToSign((planet.sign - 1 + segment * 4) % 12)
}

function navamsaSign(key: ThaiBodyKey): ThaiSignKey {
  const planet = planetByKey(key)
  if (!planet) return 'aries'
  const elementStart = Math.floor((planet.sign - 1) / 3) * 3
  const segment = Math.min(8, Math.floor((planet.longitude % 30) / (30 / 9)))
  return indexToSign((elementStart + segment) % 12)
}

function navamsaName(key: ThaiBodyKey) {
  const segment = Math.min(8, Math.floor(((planetByKey(key)?.longitude ?? 0) % 30) / (30 / 9))) + 1
  return t('thaiAstro.navamsaNumber', { number: segment })
}

function taksaRoleName(key: ThaiTaksaRole) {
  return t(`thaiAstro.taksaRoles.${TAKSA_ROLE_KEYS[key]}`)
}

function indexToSign(index: number): ThaiSignKey {
  const keys: ThaiSignKey[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
  ]
  return keys[index] ?? 'aries'
}

function planetByKey(key: ThaiBodyKey) {
  return props.result.planets.find(planet => planet.key === key)
}

function formatDegree(planet: { degree: number, minute: number, second: number }) {
  return `${planet.degree}° ${planet.minute}' ${planet.second}"`
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(locale.value === 'ja' ? 'ja-JP' : locale.value, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(value))
  }
  catch {
    return value
  }
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.dataset.taAiLabel) return node.dataset.taAiLabel
  const explicit = node.querySelector<HTMLElement>('strong, h3, dt, span')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.ta-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(explicit?.textContent ?? '').slice(0, 48)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.ta-section-label h2')?.textContent ?? '')
  return {
    section: sectionTitle,
    group: '',
    content: normalizeText(node.innerText || node.textContent || '').slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return
  for (const node of Array.from(root.querySelectorAll<HTMLElement>('.ta-target'))) {
    if (node.closest('button') || node.dataset.taAiInitialized === 'true') continue
    node.dataset.taAiInitialized = 'true'
    node.dataset.taAiTarget = 'true'
    node.dataset.taAiLabel = targetLabel(node)
    node.setAttribute('role', 'button')
    node.setAttribute('tabindex', '0')
    node.setAttribute('aria-label', `${node.dataset.taAiLabel} · ${t('thaiAstro.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.taAiLabel || targetLabel(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...targetContext(node),
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-ta-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.taAiInitialized !== 'true') return
  const target = current.closest<HTMLElement>('[data-ta-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const result = props.result
  const planets = result.planets.map(planet =>
    `${bodyName(planet.key)} ${signName(planet.signKey)} ${planet.degree}° H${planet.house} ${planet.nakshatraTh}p${planet.pada}${planet.isRetrograde ? ' R' : ''}${planet.isTanuseth ? ' Tanuseth' : ''}`,
  ).join('；')
  const houses = result.houses.map(house =>
    `H${house.number} ${houseName(house.key)} ${signName(house.signKey)} lord=${bodyName(house.signLordKey)} occupants=${house.occupants.map(bodyName).join('/') || '-'}`,
  ).join('；')

  return [
    `体系：泰国12星宿命盘（ราศี 12 นักษัตร）`,
    `出生：${result.input.birthDate} ${result.input.birthTime} ${result.input.location.timezone}；地点：${result.input.location.name}`,
    `ลัคนา：${signName(result.ascendant.signKey)} ${result.ascendant.degree}° ${result.ascendant.nakshatraTh} p${result.ascendant.pada}`,
    `ตนุเศษ：${bodyName(result.tanuseth.bodyKey)} #${result.tanuseth.number ?? '-'}`,
    `ดาว：${planets}`,
    `ภพ：${houses}`,
    `ทักษา：${bodyName(result.taksa.dayKey)}${result.taksa.nightChart ? '(night)' : ''} ${result.taksa.positions.map(item => `${taksaRoleName(item.role)}=${bodyName(item.bodyKey)}`).join('，')}`,
    `Panchang：${result.panchang.weekday} ${result.panchang.tithi} ${result.panchang.paksha} ${result.panchang.moonNakshatra} ${result.panchang.yoga}`,
  ].join('\n')
}

async function requestInsight(target: { selector: string, label: string, section: string, group: string, content: string }) {
  await streamInsight({ mode: 'target', target, title: target.label })
}

function handleFullReport() {
  if (isLoggedIn.value) {
    void startFullReport()
    return
  }
  authRequired.value = true
}

async function startFullReport() {
  authRequired.value = false
  insightMode.value = 'full'
  insightTitle.value = t('thaiAstro.aiFullReportTitle')
  await streamInsight({ mode: 'full', title: insightTitle.value })
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
    const response = await fetch('/api/tools/thai-astro-paipan/interpret', {
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
            throw new Error(chunk.message || t('thaiAstro.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('thaiAstro.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('thaiAstro.aiError')
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
.ta-report {
  display: grid;
  gap: 34px;
}

.ta-section {
  display: grid;
  grid-template-columns: minmax(180px, 230px) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.ta-section-label {
  position: sticky;
  top: 92px;
}

.ta-section-label h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.ta-section-label p {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.ta-stack {
  display: grid;
  gap: 14px;
}

.ta-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.ta-birth-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}

.ta-birth-grid dt,
.ta-card > span {
  color: var(--text-faint);
  font-size: 12px;
}

.ta-birth-grid dd,
.ta-card strong {
  display: block;
  margin: 8px 0 4px;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 750;
}

.ta-birth-grid small,
.ta-card small {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.ta-summary-grid,
.ta-grid-4,
.ta-grid-2 {
  display: grid;
  gap: 12px;
}

.ta-summary-grid,
.ta-grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.ta-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ta-table-card {
  overflow-x: auto;
}

.ta-table {
  min-width: 680px;
}

.ta-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.9fr 1.2fr 1.2fr 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 6px;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 13px;
}

.ta-row.ta-head {
  border-top: 0;
  color: var(--text-faint);
  font-size: 12px;
  font-weight: 650;
}

.ta-row.ta-head span:nth-child(n+5),
.ta-row:not(.ta-head) span:nth-child(n+5) {
  min-width: 130px;
}

.ta-body {
  display: grid;
  gap: 2px;
}

.ta-body i {
  color: var(--accent);
  font-size: 12px;
  font-style: normal;
}

.ta-body strong,
.ta-strong {
  color: var(--text-primary);
  font-weight: 700;
}

.ta-body em {
  color: var(--accent);
  font-size: 11px;
  font-style: normal;
}

.ta-tags {
  display: flex;
  min-width: 0;
  gap: 5px;
  flex-wrap: wrap;
}

.ta-tags em {
  padding: 2px 6px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-bg) 78%, var(--accent-bg));
  color: var(--text-muted);
  font-size: 11px;
  font-style: normal;
  white-space: nowrap;
}

.ta-methodology {
  display: grid;
  gap: 8px;
  margin: 0;
}

.ta-methodology > div {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 12px;
}

.ta-methodology dt {
  color: var(--text-faint);
  font-size: 12px;
}

.ta-methodology dd {
  margin: 0;
  color: var(--text-body);
  font-size: 13px;
}

.ta-disclaimer {
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.7;
}

[data-ta-ai-target] {
  position: relative;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-ta-ai-target]::after {
  content: '✦';
  position: absolute;
  z-index: 5;
  top: 6px;
  right: 6px;
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

[data-ta-ai-target]:hover,
[data-ta-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-ta-ai-target]:hover::after,
[data-ta-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

.ta-insight-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.52);
}

.ta-insight {
  width: min(100%, 760px);
  max-height: min(84vh, 720px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-bg);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
}

.ta-insight-head,
.ta-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.ta-insight-head p,
.ta-insight-foot small {
  color: var(--text-faint);
  font-size: 12px;
}

.ta-insight-head h3 {
  margin: 5px 0 0;
  font-size: 18px;
  line-height: 1.3;
}

.ta-insight-head button,
.ta-insight-foot button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--surface-bg);
  padding: 8px 13px;
  font-size: 13px;
  cursor: pointer;
}

.ta-insight-head button {
  background: var(--surface-input);
  color: var(--text-muted);
}

.ta-insight-body {
  overflow: auto;
  padding: 0 18px;
}

.ta-insight-content {
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
}

.ta-insight-status,
.ta-insight-error {
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
}

.ta-insight-status {
  background: var(--accent-bg);
  color: var(--accent);
}

.ta-insight-error {
  background: color-mix(in srgb, #dc2626 9%, transparent);
  color: #b91c1c;
}

.ta-insight-auth {
  display: grid;
  gap: 10px;
  padding: 14px 18px 16px;
  border-top: 1px solid var(--border-subtle);
}

.ta-insight-auth p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.ta-insight-auth > div {
  display: flex;
  gap: 8px;
}

.ta-insight-auth button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-card);
  color: var(--text-muted);
  padding: 7px 12px;
  font-size: 13px;
  cursor: pointer;
}

.ta-insight-enter-active,
.ta-insight-leave-active {
  transition: opacity 180ms ease;
}

.ta-insight-enter-from,
.ta-insight-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .ta-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .ta-section-label {
    position: static;
  }

  .ta-summary-grid,
  .ta-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ta-birth-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .ta-summary-grid,
  .ta-grid-4,
  .ta-grid-2,
  .ta-birth-grid {
    grid-template-columns: 1fr;
  }
}
</style>
