<template>
  <div class="flp-page">
    <FengshuiLuopanBackground />
    <div class="flp-container">
      <header class="flp-header">
        <div>
          <p class="flp-eyebrow">Feng Shui Luopan</p>
          <h1 class="flp-title">{{ $t('fengshuiLuopan.title') }}</h1>
          <p class="flp-subtitle">{{ $t('fengshuiLuopan.subtitle') }}</p>
        </div>
        <NuxtLink :to="localePath('/chart')" class="flp-back">
          <UIcon name="i-heroicons-arrow-left" />
          {{ $t('paipanTopic.title') }}
        </NuxtLink>
      </header>

      <ClientOnly>
        <main class="flp-workspace">
          <section class="flp-hero" aria-live="polite">
            <div class="flp-scene">
              <FengshuiLuopanDial
                ref="sceneRef"
                :interactive="status === 'manual'"
                :status="status"
                :visible-layers="visibleLayers"
                @heading-change="handleManualHeading"
              />
            </div>

            <div
              v-if="!['unsupported', 'manual', 'active'].includes(status)"
              class="flp-overlay"
              :class="`is-${status}`"
            >
              <div class="flp-panel">
                <UIcon :name="statusIcon" class="flp-panel-icon" />
                <h2>{{ statusTitle }}</h2>
                <p>{{ statusMessage }}</p>

                <UButton
                  v-if="status === 'permission-required'"
                  color="warning"
                  size="lg"
                  block
                  @click="requestSensorPermission"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-device-phone-mobile" />
                  </template>
                  {{ $t('fengshuiLuopan.action.start') }}
                </UButton>

                <UButton
                  v-if="status === 'sensor-error' || status === 'permission-denied'"
                  color="warning"
                  variant="soft"
                  block
                  @click="restartSensor"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-path" />
                  </template>
                  {{ $t('fengshuiLuopan.action.retry') }}
                </UButton>

                <UButton
                  v-if="status === 'sensor-error' || status === 'permission-denied'"
                  color="neutral"
                  variant="ghost"
                  block
                  @click="useManualMode"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-computer-desktop" />
                  </template>
                  {{ $t('fengshuiLuopan.action.manual') }}
                </UButton>

                <div v-if="status === 'calibrating'" class="flp-calibration">
                  <div class="flp-progress">
                    <span :style="{ width: `${Math.round(calibration.coverage * 100)}%` }" />
                  </div>
                  <ol>
                    <li :class="{ done: calibration.level }">{{ $t('fengshuiLuopan.calibration.level') }}</li>
                    <li :class="{ done: calibration.coverage >= 0.98 }">{{ $t('fengshuiLuopan.calibration.rotate') }}</li>
                    <li :class="{ done: calibration.stable }">{{ $t('fengshuiLuopan.calibration.stabilize') }}</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <aside v-if="status === 'manual'" class="flp-guide">
            <div class="flp-guide-main">
              <h2>{{ $t('fengshuiLuopan.desktop.title') }}</h2>
              <p class="flp-lead">{{ $t('fengshuiLuopan.desktop.lead') }}</p>
              <p>{{ $t('fengshuiLuopan.desktop.explain') }}</p>

              <div class="flp-manual-reading">
                <small>{{ $t('fengshuiLuopan.reading.heading') }}</small>
                <strong>{{ Math.round(activeHeading ?? 0) }}°</strong>
                <input
                  class="flp-heading-slider"
                  type="range"
                  min="0"
                  max="359"
                  step="1"
                  :value="activeHeading ?? 0"
                  :aria-label="$t('fengshuiLuopan.reading.heading')"
                  @input="handleSliderInput"
                >
                <span>{{ $t('fengshuiLuopan.reading.manualNote') }}</span>
              </div>

              <dl class="flp-sensors">
                <div>
                  <dt>
                    <UIcon name="i-heroicons-cursor-arrow-rays" />
                    {{ $t('fengshuiLuopan.desktop.drag') }}
                  </dt>
                  <dd>{{ $t('fengshuiLuopan.desktop.dragDesc') }}</dd>
                </div>
                <div>
                  <dt>
                    <UIcon name="i-heroicons-arrows-right-left" />
                    {{ $t('fengshuiLuopan.desktop.keyboard') }}
                  </dt>
                  <dd>{{ $t('fengshuiLuopan.desktop.keyboardDesc') }}</dd>
                </div>
                <div>
                  <dt>
                    <UIcon name="i-heroicons-device-phone-mobile" />
                    {{ $t('fengshuiLuopan.desktop.sensor') }}
                  </dt>
                  <dd>{{ $t('fengshuiLuopan.desktop.sensorDesc') }}</dd>
                </div>
              </dl>

            </div>

            <div class="flp-guide-action">
              <div class="flp-qr" v-html="qrSvg" />
              <strong>{{ $t('fengshuiLuopan.desktop.scan') }}</strong>
              <span>{{ $t('fengshuiLuopan.desktop.scanHint') }}</span>
            </div>
          </aside>

          <aside v-else class="flp-side">
            <section class="flp-card flp-reading">
              <p>{{ $t('fengshuiLuopan.reading.heading') }}</p>
              <strong>{{ activeHeading !== null ? `${Math.round(activeHeading)}°` : '—' }}</strong>
              <span>{{ $t('fengshuiLuopan.reading.sensorNote') }}</span>

              <div v-if="direction" class="flp-direction">
                <div>
                  <small>{{ $t('fengshuiLuopan.reading.mountain') }}</small>
                  <b>{{ direction.mountain }}</b>
                </div>
                <div>
                  <small>{{ $t('fengshuiLuopan.reading.trigram') }}</small>
                  <b>{{ direction.trigram }}</b>
                </div>
                <div>
                  <small>{{ $t('fengshuiLuopan.reading.element') }}</small>
                  <b>{{ direction.element }}</b>
                </div>
                <div>
                  <small>{{ $t('fengshuiLuopan.reading.ganzhi') }}</small>
                  <b>{{ direction.heavenlyStem }}{{ direction.earthlyBranch }}</b>
                </div>
              </div>
            </section>

            <section class="flp-card">
              <div class="flp-card-head">
                <h3>{{ $t('fengshuiLuopan.profile.title') }}</h3>
              </div>
              <div class="flp-segment">
                <button
                  v-for="profile in profileOptions"
                  :key="profile"
                  type="button"
                  :class="{ active: activeProfile === profile }"
                  @click="activeProfile = profile"
                >
                  {{ $t(`fengshuiLuopan.profile.${profile}`) }}
                </button>
              </div>

            </section>

            <section class="flp-card">
              <h3>{{ $t('fengshuiLuopan.sensor.title') }}</h3>
              <ul class="flp-status-list">
                <li :class="{ warning: !calibration.level }">{{ $t('fengshuiLuopan.sensor.level') }}</li>
                <li :class="{ warning: calibration.magneticDisturbance }">{{ $t('fengshuiLuopan.sensor.magnetic') }}</li>
                <li>{{ statusLabel }}</li>
              </ul>
              <p v-if="calibration.magneticDisturbance" class="flp-warning">
                {{ $t('fengshuiLuopan.sensor.interference') }}
              </p>
              <button type="button" class="flp-recalibrate" @click="restartSensor">
                {{ $t('fengshuiLuopan.action.recalibrate') }}
              </button>
            </section>

            <details class="flp-help">
              <summary>{{ $t('fengshuiLuopan.help.title') }}</summary>
              <p>{{ $t('fengshuiLuopan.help.accuracy') }}</p>
              <p>{{ $t('fengshuiLuopan.help.trueNorth') }}</p>
              <p>{{ $t('fengshuiLuopan.help.culture') }}</p>
            </details>
          </aside>
        </main>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { CalibrationEngine } from '~/utils/fengshui-luopan/calibration-engine'
import { detectDeviceCapability } from '~/utils/fengshui-luopan/capability'
import { OrientationEngine } from '~/utils/fengshui-luopan/orientation-engine'
import { resolveLuopanDirection } from '~/utils/fengshui-luopan/engine'
import { normalizeDegrees } from '~/utils/fengshui-luopan/heading'
import type {
  CalibrationFeedback,
  DeviceCapability,
  LuopanProfileId,
  LuopanSample,
  LuopanStatus,
} from '~/types/fengshui-luopan'

type LuopanSceneInstance = ComponentPublicInstance & {
  setHeading: (value: LuopanSample | number) => void
}

const { t } = useI18n()
const localePath = useLocalePath()
const pageUrl = useLocalizedSeoUrl('/tools/fengshui-luopan')

const sceneRef = ref<LuopanSceneInstance | null>(null)
const status = ref<LuopanStatus>('detecting')
const capability = ref<DeviceCapability | null>(null)
const activeHeading = ref<number | null>(null)
const calibration = ref<CalibrationFeedback>({
  phase: 'idle',
  coverage: 0,
  stable: false,
  level: false,
  magneticDisturbance: false,
})
const activeProfile = ref<LuopanProfileId>('complete')
const qrSvg = ref('')
const profileOptions: LuopanProfileId[] = ['complete', 'reading', 'compact']
const luopanLayerProfiles: Record<LuopanProfileId, number[]> = {
  complete: [0, 1, 2, 3, 4, 5, 6, 7],
  reading: [1, 3, 5],
  compact: [0, 1, 3],
}

let orientationEngine: OrientationEngine | null = null
let calibrationEngine: CalibrationEngine | null = null
let sensorTimeout: ReturnType<typeof setTimeout> | null = null
let initializationTimeout: number | null = null
let lastUiUpdate = 0

const visibleLayers = computed(() => luopanLayerProfiles[activeProfile.value])

const direction = computed(() => {
  return activeHeading.value === null ? null : resolveLuopanDirection(activeHeading.value)
})

const statusTitle = computed(() => {
  const keys: Partial<Record<LuopanStatus, string>> = {
    detecting: 'detecting',
    manual: 'manual',
    'permission-required': 'permissionRequired',
    'permission-denied': 'permissionDenied',
    calibrating: 'calibrating',
    initializing: 'initializing',
    'sensor-error': 'sensorError',
  }
  const key = keys[status.value]
  return key ? t(`fengshuiLuopan.status.${key}`) : ''
})

const statusMessage = computed(() => {
  if (status.value === 'calibrating') {
    return calibration.value.phase === 'leveling'
      ? t('fengshuiLuopan.calibration.levelHint')
      : calibration.value.phase === 'stabilizing'
        ? t('fengshuiLuopan.calibration.stabilizeHint')
        : t('fengshuiLuopan.calibration.rotateHint')
  }
  if (status.value === 'sensor-error') {
    return calibration.value.magneticDisturbance
      ? t('fengshuiLuopan.sensor.interference')
      : t('fengshuiLuopan.status.sensorErrorMessage')
  }
  const keys: Partial<Record<LuopanStatus, string>> = {
    detecting: 'detectingMessage',
    manual: 'manualMessage',
    'permission-required': 'permissionRequiredMessage',
    'permission-denied': 'permissionDeniedMessage',
    initializing: 'initializingMessage',
  }
  const key = keys[status.value]
  return key ? t(`fengshuiLuopan.status.${key}`) : ''
})

const statusIcon = computed(() => {
  const icons: Record<LuopanStatus, string> = {
    detecting: 'i-heroicons-ellipsis-horizontal-circle',
    unsupported: 'i-heroicons-computer-desktop',
    manual: 'i-heroicons-computer-desktop',
    'browser-unsupported': 'i-heroicons-exclamation-triangle',
    'permission-required': 'i-heroicons-lock-closed',
    'permission-denied': 'i-heroicons-shield-exclamation',
    calibrating: 'i-heroicons-arrow-path',
    initializing: 'i-heroicons-sparkles',
    active: 'i-heroicons-check-circle',
    'sensor-error': 'i-heroicons-wifi',
  }
  return icons[status.value]
})

const statusLabel = computed(() => statusTitle.value || t('fengshuiLuopan.status.active'))

function clearSensorTimeout() {
  if (sensorTimeout) {
    clearTimeout(sensorTimeout)
    sensorTimeout = null
  }
}

function clearInitializationTimeout() {
  if (initializationTimeout) {
    clearTimeout(initializationTimeout)
    initializationTimeout = null
  }
}

function stopRealtime() {
  clearSensorTimeout()
  clearInitializationTimeout()
  orientationEngine?.stop()
  orientationEngine = null
  calibrationEngine?.abort()
  calibrationEngine = null
}

function handleManualHeading(heading: number) {
  activeHeading.value = normalizeDegrees(heading)
}

function handleSliderInput(event: Event) {
  const heading = normalizeDegrees((event.target as HTMLInputElement).valueAsNumber)
  activeHeading.value = heading
  sceneRef.value?.setHeading(heading)
}

function useManualMode() {
  stopRealtime()
  activeHeading.value = normalizeDegrees(activeHeading.value ?? 0)
  status.value = 'manual'
}

async function generateQrCode() {
  const QRCode = await import('qrcode')
  qrSvg.value = await QRCode.toString(window.location.href, {
    type: 'svg',
    margin: 1,
    width: 188,
    color: { dark: '#3d2d1c', light: '#fffaf0' },
  })
}

function handleSample(sample: LuopanSample) {
  clearSensorTimeout()
  sceneRef.value?.setHeading(sample)
  calibration.value = calibrationEngine?.feed(sample) ?? calibration.value

  if (calibration.value.phase === 'error') {
    stopRealtime()
    status.value = 'sensor-error'
    return
  }

  if (calibration.value.phase === 'complete' && status.value === 'calibrating') {
    clearInitializationTimeout()
    status.value = 'initializing'
    initializationTimeout = window.setTimeout(() => {
      if (status.value === 'initializing') status.value = 'active'
    }, 700)
  }

  const now = performance.now()
  if (now - lastUiUpdate > 120) {
    lastUiUpdate = now
    activeHeading.value = sample.heading
  }
}

function startSensor() {
  if (!capability.value?.canUseCompass) {
    status.value = 'browser-unsupported'
    return
  }

  stopRealtime()
  orientationEngine = new OrientationEngine()
  calibrationEngine = new CalibrationEngine()
  calibration.value = calibrationEngine.start()
  status.value = 'calibrating'
  orientationEngine.start(handleSample)
  sensorTimeout = setTimeout(() => {
    const engine = orientationEngine
    if (!engine?.validSampleReceived) {
      stopRealtime()
      status.value = 'sensor-error'
    }
  }, 4500)
}

async function requestSensorPermission() {
  if (!capability.value) return
  if (!capability.value.requiresPermission) {
    startSensor()
    return
  }

  try {
    const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    const permission = await orientationEvent.requestPermission?.()
    if (permission === 'granted') startSensor()
    else status.value = 'permission-denied'
  }
  catch {
    status.value = 'permission-denied'
  }
}

function restartSensor() {
  if (!capability.value?.canUseCompass) return
  if (capability.value.requiresPermission) status.value = 'permission-required'
  else startSensor()
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopRealtime()
    return
  }

  if (status.value === 'active' || status.value === 'calibrating' || status.value === 'initializing') {
    stopRealtime()
    status.value = 'sensor-error'
  }
}

onMounted(() => {
  const detected = detectDeviceCapability()
  capability.value = detected
  if (!detected.isMobileLike || !detected.canUseCompass) {
    useManualMode()
    generateQrCode()
    return
  }
  status.value = 'permission-required'
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  stopRealtime()
})

useSeoMeta({
  title: () => `${t('seo.fengshuiLuopanTitle')} - ososn`,
  description: t('seo.fengshuiLuopanDesc'),
  keywords: t('seo.fengshuiLuopanKeywords'),
  ogTitle: () => `${t('seo.fengshuiLuopanOgTitle')} - ososn`,
  ogDescription: t('seo.fengshuiLuopanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  htmlAttrs: {
    'data-flp-dark': 'true',
  },
  meta: [
    { name: 'theme-color', content: '#0c0c0c' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('fengshuiLuopan.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        url: pageUrl.value,
        description: t('seo.fengshuiLuopanDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))
</script>

<style scoped>
:global(html[data-flp-dark='true']) {
  --surface-bg: rgb(12, 12, 12);
  --surface-elevated: #151515;
  --surface-card: rgba(255, 255, 255, 0.045);
  --surface-card-hover: rgba(255, 255, 255, 0.07);
  --surface-dropdown: #151515;
  --surface-input: rgba(255, 255, 255, 0.07);
  --text-primary: #dddddd;
  --text-body: rgba(255, 255, 255, 0.85);
  --text-muted: rgba(255, 255, 255, 0.72);
  --text-faint: rgba(255, 255, 255, 0.62);
  --text-placeholder: rgba(255, 255, 255, 0.45);
  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-light: rgba(255, 255, 255, 0.18);
  --border-medium: rgba(255, 255, 255, 0.2);
  --border-strong: rgba(255, 255, 255, 0.24);
  --overlay-bg: rgba(12, 12, 12, 0.72);
  --shadow-panel: 0 16px 38px rgba(0, 0, 0, 0.32);
}

.flp-page {
  --surface-bg: rgb(12, 12, 12);
  --surface-card: rgba(255, 255, 255, 0.045);
  --surface-input: rgba(255, 255, 255, 0.07);
  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-light: rgba(255, 255, 255, 0.18);
  --text-primary: #e6e6e6;
  --text-muted: rgba(230, 230, 230, 0.72);
  --accent: #ff5a48;
  --flp-dial-size: min(94vw, 66dvh);

  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: rgb(12, 12, 12);
  color: var(--text-primary);
  color-scheme: dark;
}

.flp-container {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 18px 16px 56px;
}

.flp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.flp-eyebrow {
  margin-bottom: 5px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.flp-title {
  color: #dddddd;
  font-size: clamp(1.3rem, 3vw, 1.65rem);
  line-height: 1.2;
}

.flp-subtitle {
  max-width: 620px;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 14px;
}

.flp-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  color: var(--text-muted);
  font-size: 13px;
}

.flp-back :deep(.iconify) {
  width: 15px;
  height: 15px;
}

.flp-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
}

.flp-hero {
  --flp-dial-size: min(94vw, calc(100dvh - 190px));

  position: relative;
  height: var(--flp-dial-size);
  border: 0;
  border-radius: 0;
  overflow: visible;
  background: transparent;
}

.flp-hero .flp-scene {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.flp-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: color-mix(in srgb, var(--surface-bg) 58%, transparent);
}

.flp-panel {
  width: min(360px, 100%);
  padding: 18px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-card) 94%, transparent);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.32);
  text-align: center;
}

.flp-panel-icon {
  width: 25px;
  height: 25px;
  color: var(--accent);
}

.flp-panel h2 {
  margin-top: 9px;
  font-size: 17px;
}

.flp-panel p {
  min-height: 38px;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.flp-calibration {
  margin-top: 10px;
  text-align: left;
}

.flp-progress {
  height: 4px;
  overflow: hidden;
  border-radius: 99px;
  background: var(--surface-input);
}

.flp-progress span {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.2s ease;
}

.flp-calibration ol {
  display: grid;
  gap: 5px;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 12px;
  list-style: decimal;
  padding-left: 17px;
}

.flp-calibration .done {
  color: var(--accent);
}

.flp-guide {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 228px;
  gap: 20px;
  padding: 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--surface-card);
}

.flp-guide h2 {
  font-size: 19px;
}

.flp-lead {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.flp-guide-main p {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.flp-sensors {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.flp-sensors dt {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 650;
}

.flp-sensors dt :deep(.iconify) {
  width: 15px;
  height: 15px;
  color: var(--accent);
}

.flp-sensors dd {
  margin: 3px 0 0 21px;
  color: var(--text-muted);
  font-size: 12px;
}

.flp-manual-reading {
  display: grid;
  gap: 4px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-input);
}

.flp-manual-reading small,
.flp-manual-reading span {
  color: var(--text-muted);
  font-size: 12px;
}

.flp-manual-reading strong {
  font-size: 26px;
  line-height: 1;
}

.flp-heading-slider {
  width: 100%;
  height: 4px;
  margin-top: 9px;
  accent-color: var(--accent);
}

.flp-guide-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 15px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: #fffaf0;
  text-align: center;
}

.flp-qr {
  width: 188px;
}

.flp-qr :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.flp-guide-action strong {
  color: #3d2d1c;
  font-size: 13px;
}

.flp-guide-action span {
  color: #736a5b;
  font-size: 11px;
}

.flp-side {
  display: grid;
  gap: 10px;
}

.flp-card {
  padding: 13px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
}

.flp-reading {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.flp-reading > p,
.flp-reading > span {
  grid-column: 1 / -1;
  color: var(--text-muted);
  font-size: 12px;
}

.flp-reading > strong {
  font-size: 30px;
  line-height: 1;
}

.flp-direction {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding-top: 9px;
  border-top: 1px solid var(--border-subtle);
}

.flp-direction small {
  display: block;
  color: var(--text-muted);
  font-size: 11px;
}

.flp-direction b {
  font-size: 16px;
}

.flp-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flp-card h3 {
  margin-bottom: 9px;
  font-size: 14px;
}

.flp-segment {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  padding: 3px;
  border-radius: 8px;
  background: var(--surface-input);
}

.flp-segment button {
  padding: 6px 3px;
  border: 0;
  border-radius: 6px;
  color: var(--text-muted);
  background: transparent;
  font-size: 12px;
}

.flp-segment button.active {
  color: var(--accent);
  background: var(--surface-card);
  box-shadow: 0 1px 3px rgba(31, 22, 12, 0.08);
}

.flp-layers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  margin-top: 10px;
}

.flp-layers label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  font-size: 12px;
}

.flp-layers input {
  width: 13px;
  height: 13px;
  accent-color: var(--accent);
}

.flp-status-list {
  display: grid;
  gap: 5px;
  color: var(--text-muted);
  font-size: 12px;
  list-style: none;
}

.flp-status-list li::before {
  content: '';
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 5px;
  border-radius: 99px;
  background: var(--accent);
  vertical-align: middle;
}

.flp-status-list .warning::before {
  background: #c0574a;
}

.flp-warning {
  margin-top: 8px;
  color: #a94b3f;
  font-size: 12px;
}

.flp-recalibrate {
  width: 100%;
  margin-top: 10px;
  padding: 7px;
  border: 1px solid var(--border-light);
  border-radius: 7px;
  color: var(--text-muted);
  background: transparent;
  font-size: 12px;
}

.flp-help {
  padding: 12px 13px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--surface-card);
  color: var(--text-muted);
  font-size: 12px;
}

.flp-help p {
  margin-top: 7px;
  line-height: 1.55;
}

@media (max-width: 860px) {
  .flp-guide {
    grid-template-columns: 1fr;
  }

  .flp-guide-action {
    order: -1;
  }
}

@media (max-width: 640px) {
  .flp-container {
    padding-top: 18px;
  }

  .flp-header {
    display: grid;
    margin-bottom: 12px;
  }

  .flp-workspace {
    gap: 9px;
  }

  .flp-hero {
    min-height: min(64vh, 470px);
    border-radius: 12px;
  }

  .flp-panel {
    padding: 15px;
  }

  .flp-side {
    gap: 7px;
  }

  .flp-card {
    padding: 11px;
  }

  .flp-reading > strong {
    font-size: 26px;
  }

  .flp-direction {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
