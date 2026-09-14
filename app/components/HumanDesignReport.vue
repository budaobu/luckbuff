<template>
  <div
    ref="reportRoot"
    class="hdr"
    @click="handleReportClick"
    @keydown.enter.prevent="handleReportKeydown"
    @keydown.space.prevent="handleReportKeydown"
  >
    <section class="hd-section">
      <header class="hd-section-label">
        <h2>{{ $t('humanDesign.chartTitle') }}</h2>
        <p>{{ $t('humanDesign.chartSubtitle') }}</p>
      </header>

      <div class="hd-stack">
        <div class="hd-card hd-target" data-hd-ai-target>
          <dl class="hd-birth-grid">
            <div>
              <dt>{{ $t('humanDesign.birth') }}</dt>
              <dd>{{ result.input.birthDate }} {{ result.input.birthTime }}</dd>
              <small>{{ result.input.timezone }}</small>
            </div>
            <div>
              <dt>{{ $t('humanDesign.location') }}</dt>
              <dd>{{ result.input.locationName }}</dd>
              <small>{{ result.input.coordinates || $t('humanDesign.timezoneLocation') }}</small>
            </div>
            <div>
              <dt>{{ $t('humanDesign.birthUtc') }}</dt>
              <dd>{{ formatDateTime(result.input.birthUtc) }}</dd>
              <small>{{ $t('humanDesign.utc') }}</small>
            </div>
            <div>
              <dt>{{ $t('humanDesign.designMoment') }}</dt>
              <dd>{{ formatDateTime(result.input.designUtc) }}</dd>
              <small>{{ result.methodology.designMoment }}</small>
            </div>
          </dl>
        </div>

        <div class="hd-summary-grid">
          <div class="hd-card hd-target" data-hd-ai-target>
            <span>{{ $t('humanDesign.type') }}</span>
            <strong>{{ summaryLabels.type[result.summary.type] }}</strong>
            <small>{{ $t('humanDesign.signature') }}: {{ summaryLabels.signature[result.summary.signature] }}</small>
            <small>{{ $t('humanDesign.notSelf') }}: {{ summaryLabels.notSelfTheme[result.summary.notSelfTheme] }}</small>
          </div>
          <div class="hd-card hd-target" data-hd-ai-target>
            <span>{{ $t('humanDesign.strategy') }}</span>
            <strong>{{ summaryLabels.strategy[result.summary.strategy] }}</strong>
            <small>{{ strategyDetail }}</small>
          </div>
          <div class="hd-card hd-target" data-hd-ai-target>
            <span>{{ $t('humanDesign.authority') }}</span>
            <strong>{{ summaryLabels.authority[result.summary.authority] }}</strong>
            <small>{{ authorityDetail }}</small>
          </div>
          <div class="hd-card hd-target" data-hd-ai-target>
            <span>{{ $t('humanDesign.profile') }}</span>
            <strong>{{ result.summary.profile }}</strong>
            <small>{{ profileMeaning }}</small>
          </div>
          <div class="hd-card hd-target" data-hd-ai-target>
            <span>{{ $t('humanDesign.definition') }}</span>
            <strong>{{ summaryLabels.definition[result.summary.definition] }}</strong>
            <small>{{ result.summary.definitionComponents.map(component => component.map(id => centerLabel(id)).join(' + ')).join(' / ') || '—' }}</small>
          </div>
          <div class="hd-card hd-target" data-hd-ai-target>
            <span>{{ $t('humanDesign.incarnationCross') }}</span>
            <strong>{{ result.summary.incarnationCross.code }}</strong>
            <small>{{ summaryLabels.cross[result.summary.incarnationCross.angle] }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="hd-section">
      <header class="hd-section-label">
        <h2>{{ $t('humanDesign.bodygraphTitle') }}</h2>
        <p>{{ $t('humanDesign.bodygraphSubtitle') }}</p>
      </header>
      <div class="hd-stack">
        <div class="hd-card">
          <HumanDesignBodygraph :result="result" />
        </div>
        <div class="hd-center-grid">
          <article
            v-for="center in result.centers"
            :key="center.id"
            class="hd-card hd-target"
            :class="{ 'is-defined': center.defined }"
            data-hd-ai-target
            :data-hd-ai-label="`${centerLabel(center.id)} · ${center.defined ? t('humanDesign.defined') : t('humanDesign.open')}`"
          >
            <header>
              <strong>{{ centerLabel(center.id) }}</strong>
              <em>{{ center.defined ? t('humanDesign.defined') : t('humanDesign.open') }}</em>
            </header>
            <p>{{ center.activatedGateCount }} {{ t('humanDesign.activatedGatesUnit') }}</p>
          </article>
        </div>

        <h3 class="hd-subtitle">{{ $t('humanDesign.channels') }}</h3>
        <div v-if="result.channels.length" class="hd-channel-grid">
          <article
            v-for="channel in result.channels"
            :key="channel.key"
            class="hd-card hd-target"
            data-hd-ai-target
            :data-hd-ai-label="`${channel.key} ${channel.name ?? ''}`"
          >
            <header>
              <strong>{{ channel.key }}</strong>
              <em v-if="channel.name">{{ channel.name }}</em>
            </header>
            <p>{{ channel.centers.map(id => centerLabel(id)).join(' — ') }}</p>
            <small>{{ channel.gates.join(' · ') }}</small>
          </article>
        </div>
        <p v-else class="hd-empty">{{ $t('humanDesign.noChannels') }}</p>
      </div>
    </section>

    <section class="hd-section">
      <header class="hd-section-label">
        <h2>{{ $t('humanDesign.activationsTitle') }}</h2>
        <p>{{ $t('humanDesign.activationsSubtitle') }}</p>
      </header>
      <div class="hd-stack">
        <div class="hd-activation-grid">
          <article
            v-for="activation in result.activations"
            :key="`${activation.stream}-${activation.body}`"
            class="hd-card hd-target"
            data-hd-ai-target
            :data-hd-ai-label="`${streamLabel(activation.stream)} ${bodyLabel(activation.body)} ${activation.gate}.${activation.line}`"
          >
            <header>
              <strong>{{ streamLabel(activation.stream) }} · {{ bodyLabel(activation.body) }}</strong>
              <em>{{ activation.gate }}.{{ activation.line }}</em>
            </header>
            <p>{{ centerLabel(gateCenter(activation.gate)) }}</p>
            <small>
              {{ $t('humanDesign.color') }} {{ activation.color }} · {{ activation.retrograde ? $t('humanDesign.retrograde') : $t('humanDesign.direct') }}
            </small>
          </article>
        </div>

        <h3 class="hd-subtitle">{{ $t('humanDesign.activatedGates') }}</h3>
        <div class="hd-gate-grid">
          <article
            v-for="gate in result.gates"
            :key="gate.gate"
            class="hd-card hd-target"
            data-hd-ai-target
            :data-hd-ai-label="`${gate.gate} · ${centerLabel(gate.center)}`"
          >
            <header>
              <strong>{{ gate.gate }}</strong>
              <em>{{ centerLabel(gate.center) }}</em>
            </header>
            <p>{{ gate.activations.map(item => `${streamLabel(item.stream)} ${bodyLabel(item.body)}.${item.line}`).join(' / ') }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="hd-section">
      <header class="hd-section-label">
        <h2>{{ $t('humanDesign.geneKeysTitle') }}</h2>
        <p>{{ $t('humanDesign.geneKeysSubtitle') }}</p>
      </header>
      <div class="hd-sphere-grid">
        <article
          v-for="sphere in result.geneKeys"
          :key="sphere.key"
          class="hd-card hd-target"
          data-hd-ai-target
          :data-hd-ai-label="`${sphereLabel(sphere.key)} ${sphere.gate}.${sphere.line}`"
        >
          <header>
            <strong>{{ sphereLabel(sphere.key) }}</strong>
            <em>{{ sphere.gate }}.{{ sphere.line }}</em>
          </header>
          <p>{{ centerLabel(gateCenter(sphere.gate)) }}</p>
        </article>
      </div>
    </section>

    <section v-if="result.astrology" class="hd-section">
      <header class="hd-section-label">
        <h2>{{ $t('humanDesign.astrologyTitle') }}</h2>
        <p>{{ $t('humanDesign.astrologySubtitle') }}</p>
      </header>
      <div class="hd-stack">
        <div class="hd-angle-grid">
          <article
            v-for="angle in result.astrology.angles"
            :key="angle.key"
            class="hd-card hd-target"
            data-hd-ai-target
            :data-hd-ai-label="`${angleLabel(angle.key)} ${angle.sign}`"
          >
            <header>
              <strong>{{ angleLabel(angle.key) }}</strong>
              <em>{{ angle.sign }} {{ angle.degInSign.toFixed(2) }}°</em>
            </header>
            <small v-if="angle.gate">{{ $t('humanDesign.gate') }} {{ angle.gate }}.{{ angle.line }}</small>
          </article>
        </div>
        <div class="hd-house-grid">
          <article
            v-for="house in result.astrology.houses"
            :key="house.house"
            class="hd-card hd-target"
            data-hd-ai-target
            :data-hd-ai-label="`${houseLabel(house.house)} ${house.sign}`"
          >
            <header>
              <strong>{{ houseLabel(house.house) }}</strong>
              <em>{{ house.sign }} {{ house.degInSign.toFixed(1) }}°</em>
            </header>
          </article>
        </div>
      </div>
    </section>

    <section class="hd-section">
      <header class="hd-section-label">
        <h2>{{ $t('humanDesign.methodologyTitle') }}</h2>
        <p>{{ $t('humanDesign.methodologySubtitle') }}</p>
      </header>
      <div class="hd-card hd-target" data-hd-ai-target>
        <dl class="hd-methodology">
          <div><dt>{{ $t('humanDesign.engine') }}</dt><dd>{{ result.methodology.engine }}</dd></div>
          <div><dt>{{ $t('humanDesign.ephemeris') }}</dt><dd>{{ result.methodology.ephemeris }}</dd></div>
          <div><dt>{{ $t('humanDesign.houseSystem') }}</dt><dd>{{ result.astrology?.houseSystem || result.methodology.astrologyHouseSystem }}</dd></div>
          <div><dt>{{ $t('humanDesign.privacy') }}</dt><dd>{{ $t('humanDesign.privacyValue') }}</dd></div>
        </dl>
      </div>
    </section>

    <p class="hd-disclaimer">{{ $t('humanDesign.disclaimer') }}</p>

    <Teleport to="body">
      <Transition name="hd-insight">
        <div
          v-if="insightOpen"
          class="hd-insight-layer"
          role="presentation"
          @click.self="closeInsight"
        >
          <section
            class="hd-insight"
            role="dialog"
            aria-modal="true"
            :aria-label="insightTitle || $t('humanDesign.aiPanelTitle')"
          >
            <header class="hd-insight-head">
              <div class="min-w-0">
                <p>
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ $t('humanDesign.aiPanelTitle') }}
                </p>
                <h3>{{ insightTitle || $t('humanDesign.aiPanelTitle') }}</h3>
              </div>
              <button type="button" :aria-label="$t('humanDesign.aiClose')" @click="closeInsight">
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </header>

            <div class="hd-insight-body">
              <div v-if="insightStatus === 'connecting'" class="hd-insight-status">
                <UIcon name="i-heroicons-sparkles" class="h-4 w-4 animate-pulse" />
                {{ $t('humanDesign.aiConnecting') }}
              </div>
              <div v-else-if="insightError" class="hd-insight-error">
                <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
                <span>{{ insightError }}</span>
              </div>
              <div v-else class="hd-insight-content">{{ insightContent }}</div>
            </div>

            <footer class="hd-insight-foot">
              <small>{{ $t('humanDesign.aiDisclaimer') }}</small>
              <button
                v-if="insightMode === 'target' && insightStatus === 'complete'"
                type="button"
                @click="handleFullReport"
              >
                <UIcon :name="isLoggedIn ? 'i-heroicons-arrow-right-circle' : 'i-heroicons-lock-closed'" class="h-4 w-4" />
                {{ insightFullLabel }}
              </button>
            </footer>

            <div v-if="authRequired" class="hd-insight-auth">
              <p>{{ $t('humanDesign.aiLoginRequired') }}</p>
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
import type { HumanDesignChartResult } from '~~/server/utils/tools/human-design'

const props = defineProps<{
  result: HumanDesignChartResult
}>()

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

const summaryLabels = computed(() => ({
  type: {
    manifestor: t('humanDesign.types.manifestor'),
    generator: t('humanDesign.types.generator'),
    'manifesting-generator': t('humanDesign.types.manifestingGenerator'),
    projector: t('humanDesign.types.projector'),
    reflector: t('humanDesign.types.reflector'),
  },
  strategy: {
    inform: t('humanDesign.strategies.inform'),
    respond: t('humanDesign.strategies.respond'),
    'respond-inform': t('humanDesign.strategies.respondInform'),
    invitation: t('humanDesign.strategies.invitation'),
    lunar: t('humanDesign.strategies.lunar'),
  },
  signature: {
    peace: t('humanDesign.signatures.peace'),
    satisfaction: t('humanDesign.signatures.satisfaction'),
    success: t('humanDesign.signatures.success'),
    surprise: t('humanDesign.signatures.surprise'),
  },
  notSelfTheme: {
    anger: t('humanDesign.notSelfThemes.anger'),
    frustration: t('humanDesign.notSelfThemes.frustration'),
    bitterness: t('humanDesign.notSelfThemes.bitterness'),
    disappointment: t('humanDesign.notSelfThemes.disappointment'),
  },
  authority: {
    emotional: t('humanDesign.authorities.emotional'),
    sacral: t('humanDesign.authorities.sacral'),
    splenic: t('humanDesign.authorities.splenic'),
    ego: t('humanDesign.authorities.ego'),
    'self-projected': t('humanDesign.authorities.selfProjected'),
    mental: t('humanDesign.authorities.mental'),
    lunar: t('humanDesign.authorities.lunar'),
  },
  definition: {
    none: t('humanDesign.definitions.none'),
    single: t('humanDesign.definitions.single'),
    split: t('humanDesign.definitions.split'),
    'triple-split': t('humanDesign.definitions.tripleSplit'),
    'quadruple-split': t('humanDesign.definitions.quadrupleSplit'),
  },
  cross: {
    right: t('humanDesign.crosses.right'),
    juxtaposition: t('humanDesign.crosses.juxtaposition'),
    left: t('humanDesign.crosses.left'),
  },
}))

const strategyDetail = computed(() => t(`humanDesign.strategyDetail.${props.result.summary.strategy}`))
const authorityDetail = computed(() => t(`humanDesign.authorityDetail.${props.result.summary.authority}`))
const profileMeaning = computed(() => t(`humanDesign.profiles.${props.result.summary.profile.replace('/', '_')}`))

const insightFullLabel = computed(() => isLoggedIn.value
  ? t('humanDesign.aiFullReport')
  : t('humanDesign.aiFullReportLogin'))

const CENTER_KEYS: Record<string, string> = {
  head: 'head',
  ajna: 'ajna',
  throat: 'throat',
  g: 'g',
  heart: 'heart',
  sacral: 'sacral',
  solarplexus: 'solarplexus',
  spleen: 'spleen',
  root: 'root',
}

const BODY_KEYS: Record<string, string> = {
  sun: 'sun',
  earth: 'earth',
  moon: 'moon',
  north_node: 'northNode',
  south_node: 'southNode',
  mercury: 'mercury',
  venus: 'venus',
  mars: 'mars',
  jupiter: 'jupiter',
  saturn: 'saturn',
  uranus: 'uranus',
  neptune: 'neptune',
  pluto: 'pluto',
}

const SPHERE_KEYS: Record<string, string> = {
  lifeswork: 'lifeswork',
  evolution: 'evolution',
  radiance: 'radiance',
  purpose: 'purpose',
  iq: 'iq',
  eq: 'eq',
  pearl: 'pearl',
  relating: 'relating',
  attraction: 'attraction',
  sq: 'sq',
  core: 'core',
  culture: 'culture',
  stability: 'stability',
  creativity: 'creativity',
}

const GATE_CENTER_MAP: Record<number, string> = {
  64: 'head', 61: 'head', 63: 'head',
  47: 'ajna', 24: 'ajna', 4: 'ajna', 17: 'ajna', 11: 'ajna', 43: 'ajna',
  62: 'throat', 23: 'throat', 56: 'throat', 35: 'throat', 12: 'throat', 45: 'throat', 33: 'throat', 8: 'throat', 31: 'throat', 20: 'throat', 16: 'throat',
  1: 'g', 13: 'g', 25: 'g', 46: 'g', 2: 'g', 15: 'g', 10: 'g', 7: 'g',
  21: 'heart', 40: 'heart', 26: 'heart', 51: 'heart',
  48: 'spleen', 57: 'spleen', 44: 'spleen', 50: 'spleen', 32: 'spleen', 28: 'spleen', 18: 'spleen',
  34: 'sacral', 5: 'sacral', 14: 'sacral', 29: 'sacral', 59: 'sacral', 9: 'sacral', 3: 'sacral', 42: 'sacral', 27: 'sacral',
  6: 'solarplexus', 37: 'solarplexus', 30: 'solarplexus', 55: 'solarplexus', 49: 'solarplexus', 22: 'solarplexus', 36: 'solarplexus',
  53: 'root', 60: 'root', 52: 'root', 19: 'root', 39: 'root', 41: 'root', 58: 'root', 38: 'root', 54: 'root',
}

function centerLabel(id: string) {
  const key = CENTER_KEYS[id] ?? id
  return t(`humanDesign.centers.${key}`)
}

function bodyLabel(id: string) {
  const key = BODY_KEYS[id] ?? id
  return t(`humanDesign.bodies.${key}`)
}

function sphereLabel(id: string) {
  const key = SPHERE_KEYS[id] ?? id
  return t(`humanDesign.spheres.${key}`)
}

function streamLabel(stream: 'personality' | 'design') {
  return t(`humanDesign.streams.${stream}`)
}

function gateCenter(gate: number) {
  return GATE_CENTER_MAP[gate] ?? 'unknown'
}

function angleLabel(key: string) {
  return t(`humanDesign.angles.${key}`)
}

function houseLabel(house: number) {
  return t('humanDesign.house', { number: house })
}

function formatDateTime(value: string) {
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

const TARGET_SELECTORS = ['[data-hd-ai-target]'].join(',')

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function targetLabel(node: HTMLElement) {
  if (node.dataset.hdAiLabel) return node.dataset.hdAiLabel
  const explicit = node.querySelector<HTMLElement>('h3, strong, dt, span')
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.hd-section-label h2')?.textContent ?? '')
  const ownTitle = normalizeText(explicit?.textContent ?? '').slice(0, 40)
  return [sectionTitle, ownTitle].filter(Boolean).join(' · ')
}

function targetContext(node: HTMLElement) {
  const section = node.closest<HTMLElement>('section')
  const sectionTitle = normalizeText(section?.querySelector<HTMLElement>('.hd-section-label h2')?.textContent ?? '')
  const content = normalizeText(node.textContent || '')
  return {
    section: sectionTitle,
    group: '',
    content: content.slice(0, 2600),
  }
}

function initializeTargets() {
  const root = reportRoot.value
  if (!root || import.meta.server) return

  for (const node of Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTORS))) {
    if (node.closest('button') || node.dataset.hdAiInitialized === 'true') continue
    node.dataset.hdAiInitialized = 'true'
    node.dataset.hdAiLabel = targetLabel(node)
    node.setAttribute('role', 'button')
    node.setAttribute('tabindex', '0')
    node.setAttribute('aria-label', `${node.dataset.hdAiLabel} · ${t('humanDesign.aiAction')}`)
  }
}

function activateTarget(node: HTMLElement) {
  const label = node.dataset.hdAiLabel || targetLabel(node)
  void requestInsight({
    selector: node.className || node.tagName.toLowerCase(),
    label,
    ...targetContext(node),
  })
}

function handleReportClick(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button, a')) return
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-hd-ai-target]')
  if (target) activateTarget(target)
}

function handleReportKeydown(event: KeyboardEvent) {
  const current = event.target as HTMLElement
  if (current?.dataset?.hdAiInitialized !== 'true') return
  const target = current.closest<HTMLElement>('[data-hd-ai-target]')
  if (target) activateTarget(target)
}

function compactContext() {
  const summary = props.result.summary
  return [
    `体系：人类图`,
    `类型/策略/权威：${summaryLabels.value.type[summary.type]} / ${summaryLabels.value.strategy[summary.strategy]} / ${summaryLabels.value.authority[summary.authority]}`,
    `人生角色：${summary.profile}；定义：${summaryLabels.value.definition[summary.definition]}；轮回交叉：${summary.incarnationCross.code} ${summaryLabels.value.cross[summary.incarnationCross.angle]}`,
    `中心：${props.result.centers.map(center => `${centerLabel(center.id)}${center.defined ? '定义' : '开放'}(${center.activatedGateCount}闸)`).join('、')}`,
    `通道：${props.result.channels.map(channel => `${channel.key} ${channel.name ?? ''}`).join('；') || '无'}`,
    `26个激活点：${props.result.activations.map(item => `${streamLabel(item.stream)}${bodyLabel(item.body)} ${item.gate}.${item.line}${item.retrograde ? 'R' : ''}`).join('；')}`,
    `激活闸门：${props.result.gates.map(gate => `${gate.gate}(${gate.activations.map(item => `${item.stream === 'personality' ? '个性' : '设计'}${bodyLabel(item.body)}.${item.line}`).join('/')})`).join('、')}`,
    `基因钥匙：${props.result.geneKeys.map(item => `${sphereLabel(item.key)} ${item.gate}.${item.line}`).join('；')}`,
    `占星参照：${props.result.astrology?.angles.map(angle => `${angle.key} ${angle.sign} ${angle.degInSign.toFixed(2)}度 闸${angle.gate ?? '-'}.${angle.line ?? '-'}`).join('；') || '未提供'}`,
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
  insightTitle.value = t('humanDesign.aiFullReportTitle')
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
    const response = await fetch('/api/tools/human-design/interpret', {
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
          }
          else if (chunk.type === 'error') {
            throw new Error(chunk.message || t('humanDesign.aiError'))
          }
        }
        catch (error) {
          if (error instanceof Error && error.message) throw error
        }
      }
    }

    if (!insightContent.value) throw new Error(t('humanDesign.aiNoResult'))
    insightStatus.value = 'complete'
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    insightStatus.value = 'error'
    insightError.value = error instanceof Error ? error.message : t('humanDesign.aiError')
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
.hdr {
  display: grid;
  gap: 34px;
}

.hd-section {
  display: grid;
  grid-template-columns: minmax(180px, 230px) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.hd-section-label {
  position: sticky;
  top: 92px;
}

.hd-section-label h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.hd-section-label p {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.hd-stack {
  display: grid;
  gap: 14px;
}

.hd-card {
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  padding: 16px;
  min-width: 0;
}

.hd-birth-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}

.hd-birth-grid dt,
.hd-card > span {
  color: var(--text-faint);
  font-size: 12px;
}

.hd-birth-grid dd,
.hd-card strong {
  margin: 8px 0 4px;
  font-size: 17px;
  font-weight: 750;
}

.hd-birth-grid small,
.hd-card small {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.hd-summary-grid,
.hd-center-grid,
.hd-channel-grid,
.hd-activation-grid,
.hd-gate-grid,
.hd-sphere-grid,
.hd-angle-grid,
.hd-house-grid {
  display: grid;
  gap: 12px;
}

.hd-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.hd-center-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.hd-channel-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.hd-activation-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.hd-gate-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.hd-sphere-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.hd-angle-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.hd-house-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }

.hd-card header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.hd-card em {
  color: var(--accent);
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
}

.hd-card p {
  margin: 8px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.55;
}

.hd-card.is-defined {
  border-color: color-mix(in srgb, var(--accent) 28%, transparent);
}

.hd-subtitle {
  margin: 8px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.hd-empty,
.hd-disclaimer {
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.7;
}

.hd-methodology {
  display: grid;
  gap: 8px;
  margin: 0;
}

.hd-methodology > div {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 12px;
}

.hd-methodology dt {
  color: var(--text-faint);
  font-size: 12px;
}

.hd-methodology dd {
  margin: 0;
  color: var(--text-body);
  font-size: 13px;
}

[data-hd-ai-target] {
  position: relative;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

[data-hd-ai-target]::after {
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

[data-hd-ai-target]:hover,
[data-hd-ai-target]:focus-visible {
  background-color: color-mix(in srgb, var(--accent-bg) 58%, transparent);
  border-color: var(--accent-border-hover);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-bg) 68%, transparent);
}

[data-hd-ai-target]:hover::after,
[data-hd-ai-target]:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

.hd-insight-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.52);
}

.hd-insight {
  width: min(100%, 760px);
  max-height: min(84vh, 720px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-bg);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
}

.hd-insight-head,
.hd-insight-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.hd-insight-head p,
.hd-insight-foot small {
  color: var(--text-faint);
  font-size: 12px;
}

.hd-insight-head h3 {
  margin: 5px 0 0;
  font-size: 18px;
  line-height: 1.3;
}

.hd-insight-head button,
.hd-insight-foot button {
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

.hd-insight-head button {
  background: var(--surface-input);
  color: var(--text-muted);
}

.hd-insight-body {
  overflow: auto;
  padding: 0 18px;
}

.hd-insight-content {
  white-space: pre-wrap;
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.75;
}

.hd-insight-status,
.hd-insight-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
}

.hd-insight-status {
  background: var(--accent-bg);
  color: var(--accent);
}

.hd-insight-error {
  background: color-mix(in srgb, #dc2626 9%, transparent);
  color: #b91c1c;
}

.hd-insight-auth {
  display: grid;
  gap: 10px;
  padding: 14px 18px 16px;
  border-top: 1px solid var(--border-subtle);
}

.hd-insight-auth p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.hd-insight-auth > div {
  display: flex;
  gap: 8px;
}

.hd-insight-auth button {
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

.hd-insight-enter-active,
.hd-insight-leave-active {
  transition: opacity 180ms ease;
}

.hd-insight-enter-from,
.hd-insight-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .hd-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .hd-section-label {
    position: static;
  }

  .hd-summary-grid,
  .hd-center-grid,
  .hd-activation-grid,
  .hd-angle-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hd-gate-grid,
  .hd-sphere-grid,
  .hd-house-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hd-birth-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .hd-summary-grid,
  .hd-center-grid,
  .hd-channel-grid,
  .hd-activation-grid,
  .hd-gate-grid,
  .hd-sphere-grid,
  .hd-angle-grid,
  .hd-house-grid,
  .hd-birth-grid {
    grid-template-columns: 1fr;
  }
}
</style>
