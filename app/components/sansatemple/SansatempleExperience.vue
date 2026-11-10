<template>
  <div class="sansa-root" data-testid="sansatemple-experience">
    <noscript class="sansa-noscript">
      {{ t('sansatemple.noscript') }}
    </noscript>

    <div v-if="stage !== 'temple' || webglFailed" class="sansa-entry">
      <div class="sansa-poster" role="img" :aria-label="t('sansatemple.title')">
        <div class="sansa-poster-sky" />
        <div class="sansa-poster-mountain" />
        <div class="sansa-poster-hall" />
        <div class="sansa-poster-path" />
        <div class="sansa-poster-lamp left" />
        <div class="sansa-poster-lamp right" />
        <div class="sansa-poster-copy">
          <p class="sansa-kicker">{{ t('sansatemple.kicker') }}</p>
          <h1>{{ t('sansatemple.title') }}</h1>
          <p>{{ webglFailed ? t('sansatemple.webglFallback') : t('sansatemple.subtitle') }}</p>
        </div>
      </div>

      <section v-if="stage !== 'error' && !webglFailed" class="sansa-panel" aria-labelledby="sansa-channels">
        <h2 id="sansa-channels">{{ t('sansatemple.channels.title') }}</h2>
        <p v-if="channelList.length === 0">{{ t('sansatemple.loading') }}</p>
        <ul v-else class="sansa-channel-list">
          <li v-for="item in channelList" :key="item.id">
            <button
              type="button"
              :data-testid="`sansatemple-channel-${item.id}`"
              :disabled="item.full || connection.connecting.value"
              @click="enter(item.id)"
            >
              <span>{{ t('sansatemple.channels.name', { n: item.id }) }}</span>
              <span>{{ item.full ? t('sansatemple.channels.full') : `${item.count}/${item.capacity}` }}</span>
            </button>
          </li>
        </ul>
        <p v-if="allFull" class="sansa-status">{{ t('sansatemple.channels.queue') }}</p>
        <p v-if="notice" class="sansa-status" data-testid="sansatemple-notice">{{ noticeText }}</p>
        <p v-if="connection.connecting.value" class="sansa-status" data-testid="sansatemple-loading">{{ t('sansatemple.opening') }}</p>
      </section>

      <section v-else class="sansa-panel">
        <h2>{{ t('sansatemple.failedTitle') }}</h2>
        <p>{{ webglFailed ? t('sansatemple.webglFallback') : t('sansatemple.failedText') }}</p>
        <button type="button" data-testid="sansatemple-retry" @click="retry">{{ t('sansatemple.retry') }}</button>
      </section>

      <footer class="sansa-footer">
        <p>{{ t('sansatemple.disclaimer') }}</p>
        <p>
          <a href="https://sansatemple.com" rel="noopener noreferrer" target="_blank">{{ t('sansatemple.inspiration') }}</a>
        </p>
      </footer>
    </div>

    <div v-else class="sansa-stage" :data-self-z="selfState.z.toFixed(2)">
      <ClientOnly>
        <TempleScene
          ref="sceneRef"
          :peers="connection.peers.value"
          :self-id="selfId || 'pending'"
          :cushions="connection.cushions.value"
          :incense="connection.incense.value"
          :quality="quality"
          :reduced-motion="reducedMotion"
          @ready="sceneReady = true"
          @failed="webglFailed = true"
          @moved="onMoved"
          @arrived-at-cushion="connection.requestPray"
          @reverence="doReverence"
          @beads="beadsOpen = true"
          @pray="togglePray"
          @info="recordRendererInfo"
        />
        <template #fallback>
          <div class="sansa-stage-loading">{{ t('sansatemple.opening') }}</div>
        </template>
      </ClientOnly>

      <header class="sansa-top">
        <button type="button" class="sansa-room-pill" data-testid="sansatemple-channel-label">
          <UIcon name="i-lucide-map" class="size-4" />
          <strong>{{ t('sansatemple.channels.name', { n: selectedChannel }) }}</strong>
          <span>{{ connection.connected.value ? Object.keys(connection.peers.value).length : 0 }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3 opacity-60" />
        </button>
        <div class="sansa-top-actions">
          <button type="button" data-testid="sansatemple-menu" aria-haspopup="dialog" :aria-label="t('sansatemple.menu')" @click="settingsOpen = true">
            <UIcon name="i-lucide-settings-2" class="size-5" />
          </button>
        </div>
      </header>

      <aside v-if="settingsOpen" class="sansa-settings" role="dialog" aria-labelledby="sansa-settings-title">
        <div class="sansa-panel-head">
          <h2 id="sansa-settings-title">{{ t('sansatemple.settings.title') }}</h2>
          <button type="button" @click="settingsOpen = false">{{ t('sansatemple.close') }}</button>
        </div>
        <label>{{ t('sansatemple.settings.master') }}<input v-model.number="audioSettings.master" type="range" min="0" max="1" step="0.05"></label>
        <label>{{ t('sansatemple.settings.environment') }}<input v-model.number="audioSettings.environment" type="range" min="0" max="1" step="0.05"></label>
        <label>{{ t('sansatemple.settings.chanting') }}<input v-model.number="audioSettings.chanting" type="range" min="0" max="1" step="0.05"></label>
        <label>{{ t('sansatemple.settings.effects') }}<input v-model.number="audioSettings.effects" type="range" min="0" max="1" step="0.05"></label>
        <fieldset>
          <legend>{{ t('sansatemple.settings.mode') }}</legend>
          <button type="button" :aria-pressed="chantMode === 'personal' && !serviceActive" :disabled="serviceActive" @click="chantMode = 'personal'">
            {{ t('sansatemple.settings.personal') }}
          </button>
          <button type="button" :aria-pressed="chantMode === 'common' || serviceActive" @click="chantMode = 'common'">
            {{ t('sansatemple.settings.common') }}
          </button>
        </fieldset>
        <p>{{ t('sansatemple.settings.next', { time: nextServiceLabel }) }}</p>
        <fieldset>
          <legend>{{ t('sansatemple.settings.quality') }}</legend>
          <button v-for="item in qualityOptions" :key="item" type="button" :aria-pressed="quality === item" @click="quality = item">
            {{ t(`sansatemple.settings.${item}`) }}
          </button>
        </fieldset>
        <p v-if="rendererInfo" class="sansa-metrics" data-testid="sansatemple-renderer-info">
          {{ quality }} · {{ rendererInfo.calls }} / {{ rendererInfo.triangles }} / {{ rendererInfo.textures }}
        </p>
        <button type="button" data-testid="sansatemple-leave" @click="leaveTemple">{{ t('sansatemple.leave') }}</button>
      </aside>

      <nav class="sansa-controls" aria-label="Temple actions">
        <button type="button" data-testid="sansatemple-pray" :aria-pressed="bowing" :disabled="!inHall" @click="togglePray">
          <UIcon name="i-lucide-heart-handshake" class="size-5" />
          <span>{{ t('sansatemple.actions.pray') }}</span>
        </button>
        <button type="button" data-testid="sansatemple-beads" @click="beadsOpen = true">
          <UIcon name="i-lucide-circle-dot" class="size-5" />
          <span>{{ t('sansatemple.actions.beads') }}</span>
        </button>
        <button type="button" data-testid="sansatemple-reverence" @click="doReverence">
          <UIcon name="i-lucide-hand-heart" class="size-5" />
          <span>{{ t('sansatemple.actions.reverence') }}</span>
        </button>
        <button type="button" data-testid="sansatemple-woodfish" :disabled="!inHall" @click="hitWoodfish">
          <UIcon name="i-lucide-drum" class="size-5" />
          <span>{{ t('sansatemple.actions.woodfish') }}</span>
        </button>
        <button type="button" data-testid="sansatemple-incense" :disabled="!nearAltar" @click="lightIncense">
          <UIcon name="i-lucide-flame" class="size-5" />
          <span>{{ t('sansatemple.actions.incense') }}</span>
        </button>
        <button
          v-for="minutes in meditationOptions"
          :key="minutes"
          type="button"
          :data-testid="`sansatemple-meditate-${minutes}`"
          :disabled="!inHall || meditating"
          @click="startMeditation(minutes)"
        >
          <UIcon name="i-lucide-flower-2" class="size-5" />
          <span>{{ t('sansatemple.actions.meditate', { n: minutes }) }}</span>
        </button>
      </nav>

      <p v-if="notice" class="sansa-toast" data-testid="sansatemple-toast">{{ noticeText }}</p>
      <p v-if="bowing" class="sansa-state">{{ t('sansatemple.states.praying') }}</p>
      <p v-if="incenseCount > 0" class="sansa-state">{{ t('sansatemple.states.incense', { n: incenseCount }) }}</p>

      <div v-if="meditating" class="sansa-meditation" data-testid="sansatemple-meditation" @click="stopMeditation">
        <p>{{ meditationCountdown }}</p>
      </div>

      <div v-if="beadsOpen" class="sansa-beads" role="dialog" aria-labelledby="sansa-beads-title" data-testid="sansatemple-beads-view">
        <header>
          <h2 id="sansa-beads-title">{{ t('sansatemple.beads.title') }}</h2>
          <span data-testid="sansatemple-bead-count">{{ beadCount }}/108</span>
          <button type="button" data-testid="sansatemple-beads-close" @click="beadsOpen = false">{{ t('sansatemple.close') }}</button>
        </header>
        <ol
          class="sansa-bead-ring"
          data-testid="sansatemple-bead-ring"
          tabindex="0"
          @wheel.prevent="advanceBeads(Math.sign($event.deltaY))"
          @keydown.down.prevent="advanceBeads(1)"
          @keydown.right.prevent="advanceBeads(1)"
          @keydown.up.prevent="advanceBeads(-1)"
          @keydown.left.prevent="advanceBeads(-1)"
        >
          <li
            v-for="(active, index) in beadStates"
            :key="index"
            :class="{ active }"
            aria-hidden="true"
          />
        </ol>
        <div class="sansa-bead-buttons">
          <button type="button" data-testid="sansatemple-bead-advance" @click="advanceBeads(1)">{{ t('sansatemple.beads.advance') }}</button>
          <button type="button" @click="beadCount = 0">{{ t('sansatemple.beads.reset') }}</button>
        </div>
        <p>{{ t('sansatemple.beads.localOnly') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TempleScene, { type SansaQuality } from './TempleScene.vue'
import { loadSansaAudioSettings, useSansatempleAudio } from '~/composables/useSansatempleAudio'
import { useSansatempleConnection } from '~/composables/useSansatempleConnection'
import type { SansaChannelSummary } from '~~/server/utils/sansatemple/types'
import type { SansaAction } from '~~/server/utils/sansatemple/types'

const { t } = useI18n()
const channelList = ref<SansaChannelSummary[]>([])
const stage = ref<'entry' | 'loading' | 'temple' | 'error'>('entry')
const selectedChannel = ref('')
const notice = ref('')
const webglFailed = ref(false)
const sceneReady = ref(false)
const sceneRef = ref<InstanceType<typeof TempleScene> | null>(null)
const settingsOpen = ref(false)
const beadsOpen = ref(false)
const bowing = ref(false)
const meditating = ref(false)
const meditationEndsAt = ref(0)
const meditationMinutes = ref(0)
const chantMode = ref<'personal' | 'common'>('personal')
const reducedMotion = computed(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
const quality = ref<SansaQuality | 'auto'>('auto')
const qualityOptions = ['auto', 'high', 'medium', 'low'] as const
const rendererInfo = ref<{ quality: SansaQuality; calls: number; triangles: number; textures: number } | null>(null)
const selfId = ref('')
const selfState = ref<{ x: number; z: number; rotation: number; action: SansaAction }>({ x: 0, z: 22, rotation: Math.PI, action: 'walking' })
const beadCount = ref(0)
const audioSettings = reactive(loadSansaAudioSettings())
const audio = useSansatempleAudio()

const meditationOptions = [5, 10, 20]
const allFull = computed(() => channelList.value.length > 0 && channelList.value.every(item => item.full))
const noticeText = computed(() => {
  if (!notice.value) return ''
  if (notice.value.startsWith('reverence:')) return t('sansatemple.reverenceNotice', { name: notice.value.slice(10) })
  const key = `sansatemple.notices.${notice.value.replace(/^reverence:/, 'reverence:')}`
  return t(key)
})
const channelCapacity = computed(() => channelList.value.find(item => item.id === selectedChannel.value)?.capacity || 50)
const incenseCount = computed(() => connection.incense.value.filter(item => item.peerId === selfId.value).length)
const serviceActive = computed(() => Boolean(connection.service.value && Date.now() < connection.service.value.endsAt))
const nextServiceLabel = computed(() => new Date(connection.nextServiceAt.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const inHall = computed(() => selfState.value.z < 8.5)
const nearAltar = computed(() => Math.abs(selfState.value.z - 7.5) < 2.5)
const beadStates = computed(() => Array.from({ length: 108 }, (_, index) => index === beadCount.value % 108 && !(beadCount.value === 108 && index === 0)))
const meditationCountdown = computed(() => {
  const remaining = Math.max(0, Math.ceil((meditationEndsAt.value - nowTick.value) / 1000))
  return t('sansatemple.meditation.remaining', { time: `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` })
})
const nowTick = ref(Date.now())

const connection = useSansatempleConnection(notice)

watch(() => connection.connected.value, (value) => {
  if (!value) return
  const self = connection.peers.value[Object.keys(connection.peers.value)[0] ?? '']
  selfId.value = self?.id ?? ''
  selectedChannel.value = self?.id ? selectedChannel.value : selectedChannel.value
  stage.value = 'temple'
  audio.initialize()
  audio.setSettings({ ...audioSettings })
  audio.startEnvironment()
  syncChant()
})

watch(() => connection.notice.value, (value) => {
  if (value) notice.value = value
  if (value && !connection.connected.value) stage.value = 'entry'
})

watch(() => connection.lastCushion.value, (value) => {
  if (!value) return
  if (value === 'unavailable') {
    notice.value = ''
    sceneRef.value?.cancelPray()
    return
  }
  bowing.value = true
  sceneRef.value?.setAction('praying')
})

let chantWatcher: string | null = null
watch([() => serviceActive.value, chantMode, () => audioSettings.chanting, () => audioSettings.master], syncChant)

let tickTimer: number | null = null
onMounted(async () => {
  const response = await fetch('/api/sansatemple/channels')
  channelList.value = await response.json() as SansaChannelSummary[]
  tickTimer = window.setInterval(() => {
    nowTick.value = Date.now()
    if (meditating.value && Date.now() >= meditationEndsAt.value) finishMeditation()
  }, 1000)
  beadCount.value = Number.parseInt(localStorage.getItem('luckbuff.sansatemple.beads') || '0', 10) || 0
})

onBeforeUnmount(() => {
  if (tickTimer) window.clearInterval(tickTimer)
})

async function enter(channelId: string) {
  if (connectingWith(channelId)) return
  selectedChannel.value = channelId
  stage.value = 'loading'
  notice.value = ''
  audio.initialize()
  try {
    await connection.connect(channelId)
  } catch {
    stage.value = 'error'
  }
}

function connectingWith(channelId: string) {
  return connection.connecting.value || connection.connected.value
}

function retry() {
  stage.value = 'entry'
  webglFailed.value = false
  notice.value = ''
}

function onMoved(state: { x: number; z: number; rotation: number; action: 'idle' | 'walking' | 'praying' | 'meditating' | 'woodfish' | 'incense' }) {
  selfState.value = state
  connection.sendState(state)
}

function togglePray() {
  if (!inHall.value) return
  if (bowing.value) {
    bowing.value = false
    sceneRef.value?.cancelPray()
    connection.releaseCushion()
    return
  }
  sceneRef.value?.beginPray()
}

function doReverence() {
  connection.reverence()
  if (!notice.value.startsWith('reverence:')) notice.value = ''
}

function hitWoodfish() {
  audio.effect('woodfish')
  const scene = sceneRef.value
  scene?.setAction?.('woodfish')
  window.setTimeout(() => scene?.setAction?.(bowing.value ? 'praying' : meditating.value ? 'meditating' : 'idle'), 320)
}

function lightIncense() {
  if (!nearAltar.value || incenseCount.value >= 3) return
  connection.lightIncense()
  sceneRef.value?.setAction?.('incense')
  window.setTimeout(() => sceneRef.value?.setAction?.('idle'), 900)
}

function startMeditation(minutes: number) {
  meditationMinutes.value = minutes
  meditationEndsAt.value = Date.now() + minutes * 60_000
  meditating.value = true
  sceneRef.value?.meditate()
}

function stopMeditation() {
  meditating.value = false
  sceneRef.value?.stopMeditate()
}

function finishMeditation() {
  stopMeditation()
  audio.effect('chime')
}

function advanceBeads(direction: number) {
  if (direction <= 0) {
    beadCount.value = (beadCount.value + 107) % 108
    return
  }
  beadCount.value = Math.min(108, beadCount.value + 1)
  audio.effect('bead')
  navigator.vibrate?.(10)
  localStorage.setItem('luckbuff.sansatemple.beads', String(beadCount.value))
}

function syncChant() {
  const shouldPlay = audioSettings.master > 0 && audioSettings.chanting > 0 && (chantMode.value === 'common' || serviceActive.value)
  if (shouldPlay === (chantWatcher === 'playing')) return
  chantWatcher = shouldPlay ? 'playing' : 'stopped'
  if (shouldPlay) audio.startChant()
  else audio.stopChant()
}

function recordRendererInfo(info: { quality: SansaQuality; calls: number; triangles: number; textures: number }) {
  rendererInfo.value = info
  const target = window as typeof window & { __sansatempleDiagnostics?: unknown }
  target.__sansatempleDiagnostics = info
}

function leaveTemple() {
  connection.leave()
  audio.stopEnvironment()
  audio.stopChant()
  stage.value = 'entry'
  webglFailed.value = false
  bowing.value = false
  meditating.value = false
  beadsOpen.value = false
  settingsOpen.value = false
  selectedChannel.value = ''
  selfId.value = ''
}
</script>

<style scoped>
.sansa-root {
  min-height: 100dvh;
  color: #ece7dd;
  background: #101623;
}

.sansa-noscript {
  display: block;
  padding: 24px;
  text-align: center;
}

.sansa-entry {
  max-width: 840px;
  margin: 0 auto;
  padding: 24px 16px calc(28px + env(safe-area-inset-bottom));
}

.sansa-poster {
  position: relative;
  min-height: 260px;
  overflow: hidden;
  border-radius: 8px;
  background: #182031;
}

.sansa-poster-sky,
.sansa-poster-mountain,
.sansa-poster-hall,
.sansa-poster-path {
  position: absolute;
}

.sansa-poster-sky {
  inset: 0;
  background: linear-gradient(#121a29, #253246 58%, #4a3b2e);
}

.sansa-poster-mountain {
  left: 10%;
  right: 18%;
  bottom: 28%;
  height: 42%;
  clip-path: polygon(0 100%, 28% 10%, 49% 58%, 68% 22%, 100% 100%);
  background: #2b4034;
}

.sansa-poster-hall {
  left: 39%;
  bottom: 28%;
  width: 22%;
  height: 20%;
  border-top: 13px solid #363440;
  background: #77543d;
}

.sansa-poster-path {
  left: 46%;
  bottom: 0;
  width: 8%;
  height: 30%;
  clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
  background: #81868d;
}

.sansa-poster-lamp {
  position: absolute;
  bottom: 16%;
  width: 10px;
  height: 24px;
  border-radius: 50%;
  background: #f0a35e;
  box-shadow: 0 0 24px 12px rgb(240 163 94 / 25%);
}

.sansa-poster-lamp.left { left: 31%; }
.sansa-poster-lamp.right { right: 31%; }

.sansa-poster-copy,
.sansa-panel,
.sansa-settings,
.sansa-beads {
  position: relative;
  z-index: 2;
}

.sansa-poster-copy {
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  background: rgb(16 22 35 / 18%);
}

.sansa-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: #c6bba7;
}

.sansa-poster-copy h1 {
  margin: 0;
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 600;
}

.sansa-poster-copy p:last-child {
  max-width: 440px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #d3cec5;
}

.sansa-panel,
.sansa-settings,
.sansa-beads {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: rgb(22 29 43 / 88%);
}

.sansa-panel h2,
.sansa-settings h2,
.sansa-beads h2 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.sansa-channel-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sansa-channel-list button {
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 6px;
  background: rgb(255 255 255 / 4%);
  color: inherit;
  padding: 0 12px;
  font: inherit;
  cursor: pointer;
}

.sansa-channel-list button:hover:not(:disabled),
.sansa-controls button:hover:not(:disabled),
.sansa-settings button:hover:not(:disabled),
.sansa-beads button:hover:not(:disabled) {
  background: rgb(255 255 255 / 10%);
}

.sansa-channel-list button:disabled {
  opacity: .48;
  cursor: not-allowed;
}

.sansa-status {
  min-height: 20px;
  margin: 12px 0 0;
  color: #c3bccf;
}

.sansa-footer {
  margin-top: 22px;
  color: #9d9a96;
  font-size: 12px;
  line-height: 1.6;
}

.sansa-footer a {
  color: inherit;
}

.sansa-stage {
  position: fixed;
  inset: 0;
  z-index: 60;
  isolation: isolate;
  overflow: hidden;
}

.sansa-stage-loading,
.sansa-toast,
.sansa-state {
  position: absolute;
  z-index: 4;
  border-radius: 6px;
  background: rgb(248 245 238 / 88%);
  color: #4b423a;
  padding: 8px 10px;
  font-size: 13px;
}

.sansa-stage-loading {
  inset: 0;
  display: grid;
  place-items: center;
}

.sansa-top {
  position: absolute;
  z-index: 5;
  top: max(68px, calc(env(safe-area-inset-top) + 68px));
  left: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
  color: #3f3831;
  font-size: 13px;
}

.sansa-top button,
.sansa-controls button,
.sansa-settings button,
.sansa-beads button,
.sansa-panel > button {
  min-height: 38px;
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 6px;
  background: rgb(248 245 238 / 86%);
  color: inherit;
  padding: 0 11px;
  font: inherit;
  cursor: pointer;
}

.sansa-top button:last-child {
  margin-left: auto;
}

.sansa-room-pill {
  display: inline-flex;
  min-width: 118px;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 0 12px;
  box-shadow: 0 5px 16px rgb(72 49 27 / 14%);
}

.sansa-room-pill strong {
  font-size: 13px;
  font-weight: 650;
}

.sansa-room-pill span {
  min-width: 18px;
  color: #68615a;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.sansa-top-actions {
  display: flex;
  margin-left: auto;
}

.sansa-top-actions button {
  display: grid;
  width: 38px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  color: #4b423a;
  box-shadow: 0 5px 16px rgb(72 49 27 / 14%);
}

.sansa-controls {
  position: absolute;
  z-index: 5;
  left: 10px;
  right: 10px;
  bottom: max(10px, env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
  gap: 4px;
  overflow-x: auto;
  width: min(680px, calc(100vw - 20px));
  margin: 0 auto;
  padding: 4px;
  border-radius: 999px;
  background: rgb(248 245 238 / 82%);
  box-shadow: 0 9px 26px rgb(72 49 27 / 15%);
  backdrop-filter: blur(12px);
}

.sansa-controls button {
  flex: 0 0 auto;
  display: inline-flex;
  min-width: 74px;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: 0;
  border-radius: 999px;
  padding: 6px 9px;
  color: #544b43;
  font-size: 10px;
  box-shadow: none;
}

.sansa-controls button:disabled {
  opacity: .38;
  cursor: not-allowed;
}

.sansa-toast {
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
}

.sansa-state {
  right: 12px;
  bottom: 66px;
}

.sansa-settings {
  position: absolute;
  z-index: 7;
  top: max(112px, calc(env(safe-area-inset-top) + 112px));
  right: 10px;
  width: min(330px, calc(100vw - 20px));
  margin: 0;
  max-height: calc(100dvh - 140px);
  overflow: auto;
}

.sansa-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sansa-settings label,
.sansa-settings fieldset {
  display: grid;
  gap: 5px;
  margin: 12px 0;
  font-size: 13px;
}

.sansa-settings fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border: 0;
  padding: 0;
}

.sansa-settings legend {
  width: 100%;
  padding: 0;
}

.sansa-settings button {
  min-height: 32px;
}

.sansa-settings button[aria-pressed="true"] {
  border-color: #d9ad68;
  background: rgb(217 173 104 / 18%);
}

.sansa-settings input {
  width: 100%;
}

.sansa-metrics {
  margin: 8px 0 12px;
  font-size: 12px;
  color: #b5b0a6;
}

.sansa-settings > button:last-child,
.sansa-panel > button {
  width: 100%;
}

.sansa-meditation {
  position: absolute;
  z-index: 6;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(10 15 24 / 58%);
}

.sansa-meditation p {
  font-size: 28px;
  color: #f1ece2;
}

.sansa-beads {
  position: fixed;
  inset: 0;
  z-index: 8;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 18px;
  border-radius: 0;
}

.sansa-beads header {
  position: absolute;
  top: max(16px, env(safe-area-inset-top));
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sansa-beads header h2 {
  margin: 0;
  font-size: 16px;
}

.sansa-beads header span {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

.sansa-bead-ring {
  display: grid;
  grid-template-columns: repeat(18, minmax(11px, 17px));
  gap: 6px;
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 8px;
  list-style: none;
  max-width: min(88vw, 520px);
  overflow: auto;
}

.sansa-bead-ring li {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #6b452b;
}

.sansa-bead-ring li.active {
  outline: 2px solid #f0c37d;
  background: #b37041;
}

.sansa-bead-buttons {
  display: flex;
  gap: 8px;
}

.sansa-beads p {
  margin: 0;
  color: #a8a39b;
  font-size: 12px;
}

@media (max-width: 520px) {
  .sansa-entry {
    padding-top: 12px;
  }

  .sansa-poster {
    min-height: 220px;
  }

  .sansa-controls {
    justify-content: flex-start;
  }
}
</style>
