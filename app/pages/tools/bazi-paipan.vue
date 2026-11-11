<template>
  <div class="room-page">
    <section class="room-hero" aria-labelledby="bazi-room-title">
      <ClientOnly>
        <BaziPaipanRoomStage :model="roomModel" :stage="roomStage" />
        <template #fallback>
          <div class="stage-fallback">
            <span aria-hidden="true">命</span>
            <p>{{ $t('baziPaipanRoom.ritualLoading') }}</p>
          </div>
        </template>
      </ClientOnly>

      <header class="scene-header">
        <div>
          <p class="scene-eyebrow">Bazi Chart Room</p>
          <h1 id="bazi-room-title" class="scene-title">{{ $t('baziChart.title') }}</h1>
          <p class="scene-subtitle">{{ $t('baziChart.subtitle') }}</p>
        </div>
      </header>

      <div v-if="phase === 'idle'" class="hero-action">
        <button
          type="button"
          data-testid="bazi-room-enter"
          :disabled="!roomStage.ready.value && !roomStage.errorMessage.value"
          @click="startGuide"
        >
          <UIcon name="i-lucide-door-open" class="h-4 w-4" />
          {{ $t('baziPaipanRoom.enter') }}
        </button>
        <button
          type="button"
          class="ghost"
          data-testid="bazi-room-skip"
          :disabled="!roomStage.ready.value && !roomStage.errorMessage.value"
          @click="skipToFullChart"
        >
          {{ $t('baziPaipanRoom.skipFull') }}
        </button>
      </div>

      <div v-else-if="phase === 'topic'" class="topic-board" role="group" aria-label="Bazi question topics">
        <p>{{ $t('baziPaipanRoom.chooseTopic') }}</p>
        <div class="topic-list">
          <button
            v-for="topic in BAZI_ROOM_TOPICS"
            :key="topic.id"
            type="button"
            :data-testid="`bazi-room-topic-${topic.id}`"
            @click="selectTopic(topic.id)"
          >
            <UIcon :name="topic.icon" class="h-4 w-4" />
            {{ $t(`baziPaipanRoom.topics.${topic.id}`) }}
          </button>
        </div>
        <button type="button" class="ghost" @click="skipToFullChart">
          {{ $t('baziPaipanRoom.skipFull') }}
        </button>
      </div>

      <div v-else-if="phase === 'calculating'" class="calculating-note" aria-live="polite">
        <span class="turning-mark" aria-hidden="true">儀</span>
        <p>{{ $t('baziPaipanRoom.calculating') }}</p>
      </div>

      <section
        v-else-if="phase === 'revealed' && result && lens"
        class="result-layout"
        aria-live="polite"
      >
        <div class="topic-card">
          <header>
            <div>
              <small>{{ dateLabel }}</small>
              <h2>{{ cardTitle }}</h2>
            </div>
            <UIcon :name="activeTopicConfig.icon" class="h-5 w-5" />
          </header>

          <div class="chenyu-seal" data-testid="bazi-room-chenyu">
            <small>{{ $t('baziPaipanRoom.chenyu') }}</small>
            <strong>{{ chenyu || $t('baziPaipanRoom.readingWaiting') }}</strong>
          </div>

          <dl class="pillar-summary">
            <div v-for="pillar in result.pillars" :key="pillar.key" :class="{ active: lens.focusPillarKeys.includes(pillar.key) }">
              <dt>{{ pillar.label }}</dt>
              <dd>{{ pillar.ganzhi }}</dd>
            </div>
            <div v-if="lens.today" class="today">
              <dt>{{ $t('baziPaipanRoom.todayTimeline') }}</dt>
              <dd>{{ lens.today.ganzhi }}</dd>
            </div>
          </dl>

          <section class="slice-group">
            <h3>{{ $t('baziPaipanRoom.natalSlice') }}</h3>
            <dl>
              <div v-for="item in lens.natal" :key="item.id" data-testid="bazi-room-natal-slice">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section class="slice-group">
            <h3>{{ lens.today ? $t('baziPaipanRoom.todaySlice') : $t('baziPaipanRoom.noTodaySlice') }}</h3>
            <dl v-if="lens.todayFields.length">
              <div v-for="item in lens.todayFields" :key="item.id" data-testid="bazi-room-today-slice">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section v-if="lens.nobleHints.length" class="noble-hints">
            <h3>{{ $t('baziPaipanRoom.nobleHints') }}</h3>
            <ul>
              <li v-for="item in lens.nobleHints" :key="item">{{ item }}</li>
            </ul>
          </section>

          <section class="reading-panel" data-testid="bazi-room-reading">
            <header>
              <h3>{{ $t('baziPaipanRoom.reading') }}</h3>
              <button v-if="readingError" type="button" @click="startReading(true)">
                <UIcon name="i-lucide-rotate-cw" class="h-3.5 w-3.5" />
                {{ $t('baziPaipanRoom.retry') }}
              </button>
            </header>
            <p v-if="readingStreaming" class="reading-wait">{{ $t('baziPaipanRoom.readingWaiting') }}</p>
            <p v-else-if="readingError" class="reading-error">{{ $t('baziPaipanRoom.readingFailed') }}</p>
            <div v-else class="reading-body">{{ readingContent }}</div>

            <NuxtLink
              v-if="!readingStreaming"
              class="deep-link"
              :to="localePath(activeTopicConfig.link)"
              data-testid="bazi-room-deep-link"
              @click="trackRoomEvent({ type: 'deepLinkClick' })"
            >
              {{ $t('baziPaipanRoom.deepLink') }}
              <UIcon name="i-lucide-arrow-right" class="h-3.5 w-3.5" />
            </NuxtLink>
          </section>

          <footer class="topic-actions">
            <button type="button" data-testid="bazi-room-change-topic" @click="phase = 'topic'; trackRoomEvent({ type: 'topicChanged' })">
              <UIcon name="i-lucide-repeat-2" class="h-4 w-4" />
              {{ $t('baziPaipanRoom.changeTopic') }}
            </button>
            <button type="button" data-testid="bazi-room-open-full" @click="openFullChart">
              <UIcon name="i-lucide-table-properties" class="h-4 w-4" />
              {{ $t('baziPaipanRoom.fullResult') }}
            </button>
            <AppShareButton
              tool="bazi-paipan"
              :summary="posterSummary"
              :filename="`bazi-room-${todayDate}-${activeTopic}.png`"
              :share-image-factory="createPoster"
              :label="$t('baziPaipanRoom.poster')"
            />
            <button type="button" @click="openBirthDialog(activeTopic)">
              <UIcon name="i-lucide-user-round-pen" class="h-4 w-4" />
              {{ $t('baziPaipanRoom.changePerson') }}
            </button>
          </footer>
        </div>

        <aside class="birth-aside">
          <p>{{ $t('baziPaipanRoom.localReady') }}</p>
          <dl>
            <div>
              <dt>{{ $t('baziChart.formTitle') }}</dt>
              <dd>{{ birthValues?.birthDate }} {{ birthValues?.birthHourUnknown ? '' : birthValues?.birthHour }}</dd>
            </div>
            <div>
              <dt>{{ $t('profileForm.gender') }}</dt>
              <dd>{{ birthValues?.gender === 'male' ? $t('common.male') : $t('common.female') }}</dd>
            </div>
          </dl>
          <button type="button" class="danger" @click="clearLocal">
            {{ $t('baziPaipanRoom.clearLocal') }}
          </button>
        </aside>
      </section>
    </section>

    <div class="room-content">
      <section class="intro-hints" aria-label="Bazi chart notes">
        <article>
          <UIcon name="i-heroicons-clock" class="h-4 w-4" />
          <p>{{ $t('baziChart.hourHint') }}</p>
        </article>
        <article>
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
          <p>{{ $t('baziChart.locationHint') }}</p>
        </article>
        <article>
          <UIcon name="i-heroicons-shield-check" class="h-4 w-4" />
          <p>{{ $t('baziChart.privacyHint') }}</p>
        </article>
      </section>

      <p class="disclaimer">{{ $t('baziChart.disclaimer') }}</p>
    </div>

    <Teleport to="body">
      <Transition name="room-modal">
        <div
          v-if="birthDialogOpen"
          class="modal-layer"
          role="presentation"
          @click.self="closeBirthDialog"
        >
          <section
            ref="birthDialogRef"
            class="modal birth-modal"
            role="dialog"
            aria-modal="true"
            :aria-label="$t('baziPaipanRoom.birthTitle')"
            @keydown="handleDialogKeydown"
          >
            <header>
              <div>
                <small>{{ $t('baziPaipanRoom.ritualLoading') }}</small>
                <h2>{{ $t('baziPaipanRoom.birthTitle') }}</h2>
              </div>
              <button type="button" class="icon-only" :aria-label="$t('baziPaipanRoom.close')" @click="closeBirthDialog">
                <UIcon name="i-lucide-x" class="h-4 w-4" />
              </button>
            </header>

            <div class="modal-body">
              <BaziForm
                :initial-values="lastFormValues"
                :show-name="false"
                :show-former-name="false"
                require-hour
                :submit-label="$t('baziPaipanRoom.reveal')"
                @submit="handleSubmit"
                @save-profile="handleSaveProfile"
              />
            </div>

            <footer v-if="hasLocalBirth">
              <button type="button" @click="forgetLocalAndKeepDialog">
                {{ $t('baziPaipanRoom.changePerson') }}
              </button>
              <button type="button" class="danger" @click="clearLocal">
                {{ $t('baziPaipanRoom.clearLocal') }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="room-modal">
        <div
          v-if="fullDialogOpen"
          class="modal-layer"
          role="presentation"
          @click.self="closeFullChart"
        >
          <section
            ref="fullDialogRef"
            class="modal full-modal"
            role="dialog"
            aria-modal="true"
            :aria-label="$t('baziPaipanRoom.fullTitle')"
            @keydown="handleDialogKeydown"
          >
            <header>
              <div>
                <small>{{ dateLabel }}</small>
                <h2>{{ $t('baziPaipanRoom.fullTitle') }}</h2>
              </div>
              <div class="full-tools">
                <AppShareButton
                  tool="bazi-paipan"
                  :summary="posterSummary"
                  :filename="`bazi-room-${todayDate}-${activeTopic}.png`"
                  :share-image-factory="createPoster"
                  :label="$t('baziPaipanRoom.poster')"
                />
                <button type="button" class="icon-only" :aria-label="$t('baziPaipanRoom.close')" @click="closeFullChart">
                  <UIcon name="i-lucide-x" class="h-4 w-4" />
                </button>
              </div>
            </header>

            <div class="full-tabs" role="tablist" :aria-label="$t('baziPaipanRoom.fullTitle')">
              <button
                v-for="tab in fullTabs"
                :id="`bazi-full-tab-${tab.id}`"
                :key="tab.id"
                type="button"
                role="tab"
                :aria-selected="fullTab === tab.id"
                :class="{ active: fullTab === tab.id }"
                :data-testid="`bazi-full-tab-${tab.id}`"
                @click="fullTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="modal-body">
              <div v-if="fullTab === 'cycles' && lens" class="today-timeline" data-testid="bazi-room-today-timeline">
                <span>{{ dateLabel }}</span>
                <strong>{{ lens.today?.ganzhi || '—' }}</strong>
                <small>{{ lens.today?.tenGod || $t('baziPaipanRoom.noTodaySlice') }}</small>
              </div>
              <div v-if="fullTab === 'cycles'" class="month-timeline" data-testid="bazi-room-month-timeline">
                <span v-for="month in monthTimeline" :key="month.label" :class="{ current: month.isCurrent }">
                  <small>{{ month.label }}</small>
                  <strong>{{ month.ganzhi }}</strong>
                </span>
              </div>
              <BaziPaipanReport
                v-if="result"
                :result="result"
                :section="fullTab"
                :active-dayun-index="currentDayunIndex"
              />
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import type { BaziTopicLens } from '~~/server/utils/tools/bazi-paipan-topic-lens'
import BaziPaipanRoomStage from '~/components/bazi-paipan-room/BaziPaipanRoomStage.vue'
import { getMonthPillar } from '~/utils/bazi/calendar'
import { buildBaziRoomSceneModel, type BaziRoomPhase } from '~/utils/bazi-paipan-room/model'
import { BAZI_ROOM_TOPICS, type BaziRoomTopicId } from '~/utils/bazi-paipan-room/topics'
import { useBaziPaipanStageKit } from '~/composables/useBaziPaipanStageKit'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  birthHourUnknown?: boolean
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

interface LocalChartCache {
  values: FormValues
  result: BaziChartResult
  hash: string
  savedAt: string
}

interface LocalReadingCache {
  chenyu: string
  reading: string
}

type RoomAnalyticsEvent =
  | { type: 'enter' }
  | { type: 'interactive'; ms: number; quality: string }
  | { type: 'quality'; quality: string }
  | { type: 'topic'; topic: string }
  | { type: 'birthSubmitted' }
  | { type: 'guideSkipped' }
  | { type: 'revealCompleted'; topic: string }
  | { type: 'chenyuShown'; topic: string }
  | { type: 'readingExpanded'; topic: string }
  | { type: 'fullChartOpened' }
  | { type: 'topicChanged' }
  | { type: 'poster' }
  | { type: 'deepLinkClick' }

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const route = useRoute()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

const phase = ref<BaziRoomPhase>('idle')
const result = ref<BaziChartResult | null>(null)
const lens = ref<BaziTopicLens | null>(null)
const activeTopic = ref<BaziRoomTopicId>('fate')
const pendingTopic = ref<BaziRoomTopicId | null>(null)
const openFullAfterReveal = ref(false)
const birthValues = ref<FormValues | null>(null)
const lastFormValues = ref<Partial<FormValues>>({})
const todayDate = ref('')
const chenyu = ref('')
const readingContent = ref('')
const readingStreaming = ref(false)
const readingError = ref(false)
const birthDialogOpen = ref(false)
const fullDialogOpen = ref(false)
const fullTab = ref<'chart' | 'elements' | 'cycles' | 'relations'>('chart')
const birthDialogRef = ref<HTMLElement | null>(null)
const fullDialogRef = ref<HTMLElement | null>(null)
let readingAbort: AbortController | null = null

watch(birthDialogOpen, async (open) => {
  if (!open) return
  await nextTick()
  birthDialogRef.value?.querySelector<HTMLElement>('button')?.focus()
})

watch(fullDialogOpen, async (open) => {
  if (!open) return
  await nextTick()
  fullDialogRef.value?.querySelector<HTMLElement>('[role="tab"]')?.focus()
})

const initialRoomModel = buildBaziRoomSceneModel({ phase: 'idle', result: null, lens: null })
const qualityOverride = computed(() => {
  const value = route.query.baziRoomQuality
  return value === 'high' || value === 'mid' || value === 'low' ? value : null
})
const freezeScene = computed(() => route.query.freeze === '1' || qualityOverride.value === 'low')
const reducedMotion = ref(false)
const roomStage = useBaziPaipanStageKit({
  initialModel: initialRoomModel,
  reducedMotion,
  qualityOverride,
  freeze: freezeScene,
})
const roomModel = computed(() => buildBaziRoomSceneModel({
  phase: phase.value,
  result: result.value,
  lens: lens.value,
}))

const activeTopicConfig = computed(() => BAZI_ROOM_TOPICS.find(topic => topic.id === activeTopic.value) ?? BAZI_ROOM_TOPICS[0])
const fourPillars = computed(() => result.value?.pillars.map(pillar => pillar.ganzhi).join(' ') ?? '')
const cardTitle = computed(() => activeTopic.value === 'fate'
  ? t('baziPaipanRoom.fateTitle')
  : t('baziPaipanRoom.todayTitle', { topic: t(`baziPaipanRoom.topics.${activeTopic.value}`) }))
const dateLabel = computed(() => todayDate.value)
const posterSummary = computed(() => `${cardTitle.value} · ${chenyu.value || fourPillars.value} · ${todayDate.value}`)
const currentDayunIndex = computed(() => result.value?.dayuns.find(dayun => dayun.isCurrent)?.index ?? null)
const monthTimeline = computed(() => {
  if (!result.value || !todayDate.value) return []
  const year = Number(todayDate.value.slice(0, 4))
  const currentMonth = Number(todayDate.value.slice(5, 7))
  const yearGan = result.value.pillars.find(pillar => pillar.key === 'year')?.gan ?? '甲'
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    const pillar = getMonthPillar(yearGan, year, month, 15)
    return {
      label: `${month}月`,
      ganzhi: `${pillar.gan}${pillar.zhi}`,
      isCurrent: month === currentMonth,
    }
  })
})
const fullTabs = computed(() => ([
  { id: 'chart' as const, label: t('baziPaipanRoom.tabChart') },
  { id: 'elements' as const, label: t('baziPaipanRoom.tabElements') },
  { id: 'cycles' as const, label: t('baziPaipanRoom.tabCycles') },
  { id: 'relations' as const, label: t('baziPaipanRoom.tabRelations') },
]))
const hasLocalBirth = computed(() => Boolean(birthValues.value))

function trackRoomEvent(event: RoomAnalyticsEvent) {
  // The repository has page-view analytics only; no custom event sink exists yet.
  void event
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function stableHash(value: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

function chartHash(values: FormValues, chart: BaziChartResult) {
  return stableHash([
    values.birthDate,
    values.birthHourUnknown ? 'unknown' : values.birthHour ?? '',
    values.gender,
    values.birthProvince || '',
    chart.pillars.map(pillar => pillar.ganzhi).join(''),
  ].join('|'))
}

function chartCacheKey(hash: string) {
  return `bazi-room:chart:${hash}`
}

function readingCacheKey(hash: string, topic: BaziRoomTopicId, date: string) {
  return `bazi-room:reading:${hash}:${topic}:${date}`
}

async function resolveLocation(name: string) {
  const direct = await resolveCityCoords(name)
  if (direct) return { name, ...direct }
  const fallback = await resolveCityCoordsFallback(name)
  if (fallback) return { name, ...fallback }
  return { name }
}

function startGuide() {
  phase.value = 'topic'
  trackRoomEvent({ type: 'enter' })
}

function selectTopic(topic: BaziRoomTopicId) {
  activeTopic.value = topic
  trackRoomEvent({ type: 'topic', topic })
  if (birthValues.value) {
    void revealTopic(topic)
  }
  else {
    openBirthDialog(topic)
  }
}

function skipToFullChart() {
  trackRoomEvent({ type: 'guideSkipped' })
  if (birthValues.value) {
    activeTopic.value = 'fate'
    openFullAfterReveal.value = true
    void revealTopic('fate')
  }
  else {
    openBirthDialog('fate')
    openFullAfterReveal.value = true
  }
}

function openBirthDialog(topic: BaziRoomTopicId) {
  pendingTopic.value = topic
  birthDialogOpen.value = true
}

function closeBirthDialog() {
  if (phase.value === 'calculating') return
  birthDialogOpen.value = false
  pendingTopic.value = null
  if (phase.value === 'idle') phase.value = 'topic'
}

function clearLocal() {
  if (!birthValues.value) return
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('bazi-room:chart:') || key.startsWith('bazi-room:reading:')) {
        window.localStorage.removeItem(key)
      }
    }
  }
  catch { /* local storage may be unavailable */ }
  birthValues.value = null
  result.value = null
  lens.value = null
  readingAbort?.abort()
  chenyu.value = ''
  readingContent.value = ''
  readingError.value = false
  phase.value = 'topic'
  toast.add({ title: t('baziPaipanRoom.clearLocal'), color: 'success' })
}

function forgetLocalAndKeepDialog() {
  if (!birthValues.value) return
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('bazi-room:chart:') || key.startsWith('bazi-room:reading:')) {
        window.localStorage.removeItem(key)
      }
    }
  }
  catch { /* ignore */ }
  birthValues.value = null
  result.value = null
  lens.value = null
}

async function handleSubmit(values: FormValues) {
  if (!values.birthDate || (!values.birthHour && !values.birthHourUnknown)) {
    toast.add({ title: t('baziChart.requiredError'), color: 'error' })
    return
  }

  const topic = pendingTopic.value ?? activeTopic.value
  activeTopic.value = topic
  lastFormValues.value = { ...values }
  birthDialogOpen.value = false
  phase.value = 'calculating'
  trackRoomEvent({ type: 'birthSubmitted' })

  try {
    const location = values.birthProvince ? await resolveLocation(values.birthProvince) : null
    const nextResult = await plainFetch<BaziChartResult>('/api/tools/bazi-paipan/calc', {
      method: 'POST',
      body: {
        birthDate: values.birthDate,
        birthHour: values.birthHourUnknown ? 'unknown' : values.birthHour,
        gender: values.gender,
        location,
      },
    })
    const nextLens = await plainFetch<BaziTopicLens>('/api/tools/bazi-paipan/lens', {
      method: 'POST',
      body: {
        topic,
        date: todayDate.value,
        birth: {
          birthDate: values.birthDate,
          birthHour: values.birthHourUnknown ? 'unknown' : values.birthHour,
          gender: values.gender,
          location,
        },
      },
    })
    applyResult(values, nextResult, nextLens)
  }
  catch (error: any) {
    phase.value = 'topic'
    birthDialogOpen.value = true
    toast.add({
      title: t('baziChart.fail'),
      description: error?.data?.statusMessage || error?.message || t('baziChart.pleaseRetry'),
      color: 'error',
    })
  }
}

async function applyResult(values: FormValues, nextResult: BaziChartResult, nextLens: BaziTopicLens) {
  result.value = nextResult
  lens.value = nextLens
  birthValues.value = { ...values }
  activeTopic.value = nextLens.topic
  phase.value = 'revealed'
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })

  const hash = chartHash(values, nextResult)
  const cache: LocalChartCache = {
    values: { ...values },
    result: nextResult,
    hash,
    savedAt: new Date().toISOString(),
  }
  try {
    window.localStorage.setItem(chartCacheKey(hash), JSON.stringify(cache))
  }
  catch { /* chart cache is best-effort */ }

  trackRoomEvent({ type: 'revealCompleted', topic: nextLens.topic })
  void startReading()
  if (openFullAfterReveal.value) {
    openFullAfterReveal.value = false
    openFullChart()
  }
}

async function revealTopic(topic: BaziRoomTopicId) {
  if (!birthValues.value) return
  activeTopic.value = topic
  phase.value = 'calculating'
  chenyu.value = ''
  readingContent.value = ''
  readingError.value = false

  try {
    lens.value = await plainFetch<BaziTopicLens>('/api/tools/bazi-paipan/lens', {
      method: 'POST',
      body: {
        topic,
        date: todayDate.value,
        birth: birthPayload(birthValues.value),
      },
    })
    phase.value = 'revealed'
    trackRoomEvent({ type: 'revealCompleted', topic })
    void startReading()
  }
  catch (error: any) {
    phase.value = 'revealed'
    toast.add({
      title: t('baziChart.fail'),
      description: error?.data?.statusMessage || error?.message || t('baziChart.pleaseRetry'),
      color: 'error',
    })
  }
}

function birthPayload(values: FormValues) {
  return {
    birthDate: values.birthDate,
    birthHour: values.birthHourUnknown ? 'unknown' : values.birthHour,
    gender: values.gender,
  }
}

async function startReading(force = false) {
  if (!birthValues.value || !result.value) return
  const topic = activeTopic.value
  const hash = chartHash(birthValues.value, result.value)
  const key = readingCacheKey(hash, topic, todayDate.value)

  if (!force) {
    try {
      const cached = window.localStorage.getItem(key)
      if (cached) {
        const parsed = JSON.parse(cached) as LocalReadingCache
        chenyu.value = parsed.chenyu
        readingContent.value = parsed.reading
        trackRoomEvent({ type: 'chenyuShown', topic })
        trackRoomEvent({ type: 'readingExpanded', topic })
        return
      }
    }
    catch { /* ignore malformed cache */ }
  }

  readingAbort?.abort()
  readingAbort = new AbortController()
  const timeout = window.setTimeout(() => readingAbort?.abort(), 22000)
  chenyu.value = ''
  readingContent.value = ''
  readingStreaming.value = true
  readingError.value = false

  try {
    const response = await fetch('/api/tools/bazi-paipan/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: readingAbort.signal,
      body: JSON.stringify({
        topic,
        date: todayDate.value,
        birth: birthPayload(birthValues.value),
        locale: locale.value,
      }),
    })
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

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
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const event = JSON.parse(payload)
          if (event.type === 'chenyu' && event.text) {
            chenyu.value = String(event.text).slice(0, 14)
            trackRoomEvent({ type: 'chenyuShown', topic })
          }
          else if (event.type === 'reading' && event.text) {
            readingContent.value += event.text
          }
          else if (event.type === 'error') {
            throw new Error(event.message || 'reading failed')
          }
        }
        catch (error) {
          if (error instanceof Error && error.message !== 'Unexpected token') throw error
        }
      }
    }
    if (!readingContent.value) throw new Error('empty reading')

    try {
      window.localStorage.setItem(key, JSON.stringify({
        chenyu: chenyu.value,
        reading: readingContent.value,
      } satisfies LocalReadingCache))
    }
    catch { /* cache is best-effort */ }
    trackRoomEvent({ type: 'readingExpanded', topic })
  }
  catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    readingError.value = true
  }
  finally {
    window.clearTimeout(timeout)
    readingStreaming.value = false
  }
}

function openFullChart() {
  fullDialogOpen.value = true
  trackRoomEvent({ type: 'fullChartOpened' })
}

function closeFullChart() {
  fullDialogOpen.value = false
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    const target = event.target as HTMLElement | null
    if (target?.closest('[aria-haspopup="dialog"], [role="combobox"]')) return
    event.preventDefault()
    if (birthDialogOpen.value) closeBirthDialog()
    else closeFullChart()
    return
  }
  if (event.key !== 'Tab') return

  const layer = event.currentTarget as HTMLElement
  const focusable = Array.from(layer.querySelectorAll<HTMLElement>(`
    a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])
  `)).filter(item => item.offsetParent !== null || item === document.activeElement)
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

async function createPoster() {
  if (!result.value) return null
  trackRoomEvent({ type: 'poster' })
  const { createBaziPaipanInstrumentPoster } = await import('~/utils/bazi-paipan-3d/poster')
  return createBaziPaipanInstrumentPoster({
    result: result.value,
    currentDayun: result.value.dayuns.find(dayun => dayun.isCurrent) ?? result.value.dayuns[0] ?? null,
    siteName: 'ososn',
    posterKicker: `${t(`baziPaipanRoom.topics.${activeTopic.value}`)} · ${todayDate.value}`,
    posterTitle: chenyu.value || fourPillars.value,
    posterMeta: `${t(`baziPaipanRoom.topics.${activeTopic.value}`)} · ${todayDate.value}`,
  })
}

function handleSaveProfile(id: string, values: FormValues) {
  const store = useProfilesStore()
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    birthHourUnknown: values.birthHourUnknown || undefined,
    birthProvince: values.birthProvince || undefined,
  })
}

const pageUrl = useLocalizedSeoUrl('/tools/bazi-paipan')
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.baziChartTitle')} - ${siteName}`,
  description: t('seo.baziChartDesc'),
  keywords: t('seo.baziChartKeywords'),
  ogTitle: () => `${t('seo.baziChartOgTitle')} - ${siteName}`,
  ogDescription: t('seo.baziChartOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: t('baziChart.title'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        url: pageUrl.value,
        description: t('seo.baziChartDesc'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      }),
    },
  ],
}))

onMounted(() => {
  todayDate.value = localDateString()
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  try {
    const started = performance.now()
    const stopReady = watch(roomStage.ready, (ready) => {
      if (!ready) return
      stopReady()
      trackRoomEvent({ type: 'interactive', ms: Math.round(performance.now() - started), quality: roomStage.quality.value })
      trackRoomEvent({ type: 'quality', quality: roomStage.quality.value })
    })
    const stopError = watch(roomStage.errorMessage, (message) => {
      if (!message) return
      stopError()
      trackRoomEvent({ type: 'interactive', ms: Math.round(performance.now() - started), quality: 'fallback' })
    })

    const cachedChart = Object.keys(window.localStorage)
      .filter(key => key.startsWith('bazi-room:chart:'))
      .map(key => window.localStorage.getItem(key))
      .filter(Boolean)
      .map(value => JSON.parse(value!) as LocalChartCache)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0]
    if (cachedChart?.values) {
      birthValues.value = cachedChart.values
      result.value = cachedChart.result
      lastFormValues.value = { ...cachedChart.values }
    }
  }
  catch { /* local storage optional */ }

  if (route.query.baziRoomE2E === '1') {
    ;(window as Window & {
      __baziPaipanRoomE2E?: {
        submit: (values: FormValues) => void
        reveal: (topic: BaziRoomTopicId, chart: BaziChartResult, topicLens: BaziTopicLens) => void
      }
    }).__baziPaipanRoomE2E = {
      submit: (values: FormValues) => {
        void handleSubmit(values)
      },
      reveal: (topic, chart, topicLens) => {
        activeTopic.value = topic
        applyResult({
          gender: 'male',
          birthDate: chart.birth.solarText,
          birthHour: chart.birth.selectedHour === 'unknown' ? undefined : chart.birth.selectedHour as DiZhi,
          birthHourUnknown: chart.birth.selectedHour === 'unknown',
          name: '',
          formerName: '',
          birthProvince: '',
        }, chart, topicLens)
      },
    }
  }
})

onBeforeUnmount(() => {
  readingAbort?.abort()
  delete (window as Window & { __baziPaipanRoomE2E?: unknown }).__baziPaipanRoomE2E
})
</script>

<style scoped>
.room-page {
  min-height: 100svh;
  background: #05080f;
  color: #e9eefa;
}

.room-hero {
  position: relative;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  background: #05080f;
}

.room-hero::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 34vh;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(5, 8, 15, 0) 0%, rgba(5, 8, 15, 0.52) 78%, rgba(5, 8, 15, 0.78) 100%);
}

.stage-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 16px;
  background: #05080f;
  color: #e9eefa;
}

.stage-fallback span {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid rgba(212, 175, 109, 0.6);
  border-radius: 4px;
  color: #f2d998;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 25px;
}

.stage-fallback p,
.calculating-note p {
  margin: 0;
  font-size: 13px;
}

.hero-action,
.topic-board,
.calculating-note,
.result-layout {
  position: absolute;
  z-index: 8;
  left: 50%;
  translate: -50% 0;
}

.hero-action {
  bottom: clamp(74px, 12vh, 130px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: min(520px, calc(100% - 32px));
}

.hero-action button,
.topic-board > button,
.topic-list button,
.topic-actions button,
.reading-panel header button,
.birth-aside button,
.modal footer button {
  min-height: 40px;
  border: 1px solid rgba(233, 238, 250, 0.18);
  border-radius: 6px;
  background: rgba(7, 11, 19, 0.78);
  color: #e9eefa;
  padding: 0 14px;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(12px);
}

.hero-action button:first-child {
  border-color: rgba(212, 175, 109, 0.72);
  color: #f2d998;
}

.hero-action button:disabled {
  opacity: 0.56;
  cursor: wait;
}

.hero-action .ghost,
.topic-board > .ghost {
  border-color: transparent;
  background: rgba(7, 11, 19, 0.42);
  color: rgba(233, 238, 250, 0.66);
}

.hero-action button:hover,
.hero-action button:focus-visible,
.topic-list button:hover,
.topic-list button:focus-visible,
.topic-actions button:hover,
.topic-actions button:focus-visible,
.birth-aside button:hover,
.birth-aside button:focus-visible {
  border-color: rgba(212, 175, 109, 0.62);
  color: #f2d998;
}

.topic-board {
  bottom: 70px;
  display: grid;
  justify-items: center;
  gap: 13px;
  width: min(620px, calc(100% - 32px));
  padding: 18px;
  border: 1px solid rgba(233, 238, 250, 0.13);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.74);
  color: #e9eefa;
  backdrop-filter: blur(16px);
}

.topic-board p {
  margin: 0;
  color: #f2d998;
  font-size: 15px;
  font-weight: 700;
}

.topic-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.topic-list button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 0 8px;
}

.calculating-note {
  bottom: 84px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e9eefa;
}

.turning-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(212, 175, 109, 0.7);
  border-radius: 4px;
  color: #f2d998;
  animation: turn 1.4s ease-in-out infinite;
}

.room-content {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 64px 20px 72px;
  background:
    linear-gradient(180deg, rgba(5, 8, 15, 0.96) 0%, rgba(7, 12, 20, 0.94) 100%);
  border-top: 1px solid rgba(212, 175, 109, 0.16);
}

.scene-header {
  position: absolute;
  z-index: 9;
  top: 14px;
  left: 50%;
  translate: -50% 0;
  width: min(680px, calc(100% - 32px));
  text-align: center;
  pointer-events: none;
  padding: 12px 18px;
  border: 1px solid rgba(212, 175, 109, 0.18);
  border-radius: 8px;
  background: rgba(5, 9, 16, 0.58);
  backdrop-filter: blur(16px);
}

.scene-eyebrow {
  margin: 0 0 8px;
  color: #f2d998;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.scene-title {
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  line-height: 1.2;
  color: #f4f7ff;
}

.scene-subtitle {
  max-width: 680px;
  margin: 10px auto 0;
  color: rgba(233, 238, 250, 0.66);
  font-size: 14px;
  line-height: 1.7;
}

.result-layout {
  position: absolute;
  z-index: 9;
  left: auto;
  translate: none;
  top: 148px;
  right: 24px;
  bottom: 26px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  align-content: start;
  width: min(430px, calc(100% - 48px));
  overflow: auto;
  padding-right: 4px;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 175, 109, 0.35) transparent;
}

.topic-card,
.birth-aside {
  border: 1px solid rgba(212, 175, 109, 0.22);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.82);
  color: #e9eefa;
  padding: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.topic-card > header,
.reading-panel > header,
.modal > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.topic-card > header small,
.modal > header small {
  display: block;
  color: rgba(233, 238, 250, 0.48);
  font-size: 12px;
}

.topic-card h2 {
  margin: 3px 0 0;
  font-size: 20px;
  font-weight: 800;
  color: #f4f7ff;
}

.topic-card > header {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(212, 175, 109, 0.16);
}

.chenyu-seal {
  position: relative;
  display: grid;
  gap: 7px;
  margin: 16px 0;
  padding: 16px;
  border: 1px solid rgba(212, 175, 109, 0.34);
  border-radius: 8px;
  background: rgba(23, 17, 8, 0.58);
}

.chenyu-seal small {
  color: rgba(233, 238, 250, 0.48);
  font-size: 12px;
}

.chenyu-seal strong {
  min-height: 40px;
  color: #f4f7ff;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(24px, 4vw, 34px);
  line-height: 1.25;
}

.chenyu-seal::after {
  content: '印';
  position: absolute;
  top: 12px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 31px;
  height: 35px;
  border: 2px solid color-mix(in srgb, #b91c1c 62%, transparent);
  color: color-mix(in srgb, #b91c1c 78%, transparent);
  font-size: 13px;
  font-weight: 800;
  transform: rotate(7deg) scale(0.9);
  animation: stamp 420ms cubic-bezier(.2, 1.4, .3, 1) both;
}

.pillar-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.pillar-summary div {
  min-width: 0;
  padding: 10px;
  border: 1px solid rgba(233, 238, 250, 0.1);
  border-radius: 6px;
  background: rgba(15, 22, 34, 0.68);
}

.pillar-summary div.active,
.pillar-summary div.today {
  border-color: rgba(212, 175, 109, 0.45);
  background: rgba(45, 32, 14, 0.66);
}

.pillar-summary dt {
  color: rgba(233, 238, 250, 0.45);
  font-size: 11px;
}

.pillar-summary dd {
  margin: 5px 0 0;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 17px;
  font-weight: 800;
}

.slice-group {
  margin-top: 18px;
}

.slice-group h3,
.noble-hints h3,
.reading-panel h3 {
  margin: 0 0 10px;
  color: #f2d998;
  font-size: 14px;
  font-weight: 800;
}

.slice-group dl {
  display: grid;
  gap: 7px;
  margin: 0;
}

.slice-group dl > div,
.birth-aside dl > div {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid rgba(233, 238, 250, 0.08);
}

.slice-group dt,
.birth-aside dt {
  color: rgba(233, 238, 250, 0.45);
  font-size: 12px;
}

.slice-group dd,
.birth-aside dd {
  min-width: 0;
  margin: 0;
  color: rgba(233, 238, 250, 0.74);
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.noble-hints {
  margin-top: 18px;
}

.noble-hints ul {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.noble-hints li {
  padding: 5px 8px;
  border: 1px solid rgba(212, 175, 109, 0.3);
  border-radius: 5px;
  background: rgba(45, 32, 14, 0.55);
  color: #f2d998;
  font-size: 12px;
}

.reading-panel {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(212, 175, 109, 0.18);
  border-radius: 8px;
  background: rgba(11, 17, 27, 0.7);
}

.reading-panel header {
  margin-bottom: 10px;
}

.reading-panel header button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  background: rgba(18, 25, 38, 0.82);
  color: rgba(233, 238, 250, 0.7);
}

.reading-wait,
.reading-error {
  margin: 0;
  color: rgba(233, 238, 250, 0.7);
  font-size: 13px;
}

.reading-error {
  color: #b91c1c;
}

.reading-body {
  color: rgba(233, 238, 250, 0.84);
  font-size: 14px;
  line-height: 1.85;
  white-space: pre-wrap;
}

.deep-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 13px;
  color: #f2d998;
  font-size: 13px;
  font-weight: 700;
}

.topic-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.topic-actions button,
.birth-aside button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(18, 25, 38, 0.82);
  color: rgba(233, 238, 250, 0.72);
}

.birth-aside {
  display: grid;
  gap: 13px;
}

.birth-aside > p {
  margin: 0;
  color: #f2d998;
  font-size: 13px;
  font-weight: 700;
}

.birth-aside dl {
  margin: 0;
}

.birth-aside button {
  justify-content: center;
}

.birth-aside .danger,
.modal footer .danger {
  border-color: color-mix(in srgb, #b91c1c 34%, transparent);
  color: #b91c1c;
}

.intro-hints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(212, 175, 109, 0.16);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.72);
  backdrop-filter: blur(14px);
}

.intro-hints article {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 13px;
  border: 1px solid rgba(233, 238, 250, 0.08);
  border-radius: 8px;
  background: rgba(15, 22, 34, 0.6);
  color: #f2d998;
}

.intro-hints p {
  margin: 0;
  color: rgba(233, 238, 250, 0.68);
  font-size: 13px;
  line-height: 1.65;
}

.disclaimer {
  margin: 24px 0 0;
  color: rgba(233, 238, 250, 0.4);
  font-size: 12px;
  line-height: 1.7;
}

.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(3, 6, 12, 0.72);
  backdrop-filter: blur(10px);
}

.modal {
  --surface-dropdown: rgba(7, 11, 19, 0.98);
  --surface-card: rgba(11, 17, 27, 0.88);
  --surface-card-hover: rgba(18, 25, 38, 0.88);
  --surface-input: rgba(15, 22, 34, 0.86);
  --surface-elevated: rgba(9, 14, 23, 0.94);
  --border-subtle: rgba(233, 238, 250, 0.09);
  --border-light: rgba(233, 238, 250, 0.13);
  --border-medium: rgba(212, 175, 109, 0.22);
  --text-primary: #f4f7ff;
  --text-body: rgba(233, 238, 250, 0.84);
  --text-muted: rgba(233, 238, 250, 0.66);
  --text-faint: rgba(233, 238, 250, 0.48);
  --text-placeholder: rgba(233, 238, 250, 0.36);
  --accent: #f2d998;
  --accent-bg: rgba(45, 32, 14, 0.42);
  --accent-border: rgba(212, 175, 109, 0.32);
  --accent-border-hover: rgba(212, 175, 109, 0.58);
  --accent-faint: rgba(45, 32, 14, 0.28);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  width: min(680px, 100%);
  max-height: min(88vh, 900px);
  overflow: hidden;
  border: 1px solid rgba(212, 175, 109, 0.24);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.98);
  color: #e9eefa;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(20px);
}

.full-modal {
  width: min(1180px, 100%);
  height: min(92vh, 1000px);
}

.modal > header {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(212, 175, 109, 0.16);
}

.modal h2 {
  margin: 3px 0 0;
  font-size: 17px;
  font-weight: 800;
}

.full-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-only {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(233, 238, 250, 0.13);
  border-radius: 6px;
  background: rgba(18, 25, 38, 0.82);
  color: rgba(233, 238, 250, 0.7);
  cursor: pointer;
}

.icon-only:hover,
.icon-only:focus-visible {
  color: var(--accent);
}

.modal-body {
  min-height: 0;
  overflow: auto;
  padding: 18px;
}

.modal > footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 13px 18px;
  border-top: 1px solid rgba(233, 238, 250, 0.08);
}

.modal footer button {
  min-height: 36px;
  border: 1px solid rgba(233, 238, 250, 0.13);
  border-radius: 6px;
  background: rgba(18, 25, 38, 0.82);
  color: rgba(233, 238, 250, 0.72);
  cursor: pointer;
}

.full-tabs {
  display: flex;
  gap: 5px;
  padding: 12px 18px 0;
  overflow-x: auto;
}

.full-tabs button {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(233, 238, 250, 0.13);
  border-radius: 6px;
  background: rgba(18, 25, 38, 0.82);
  color: rgba(233, 238, 250, 0.72);
  font-size: 13px;
  cursor: pointer;
}

.full-tabs button.active,
.full-tabs button:focus-visible {
  border-color: rgba(212, 175, 109, 0.48);
  background: rgba(45, 32, 14, 0.52);
  color: #f2d998;
}

.today-timeline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 11px 13px;
  border: 1px solid rgba(212, 175, 109, 0.28);
  border-radius: 6px;
  background: rgba(45, 32, 14, 0.42);
  color: rgba(233, 238, 250, 0.7);
  font-size: 12px;
}

.today-timeline strong {
  color: #f2d998;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 18px;
}

.month-timeline {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 5px;
  margin-bottom: 14px;
}

.month-timeline > span {
  display: grid;
  gap: 3px;
  padding: 8px;
  border: 1px solid rgba(233, 238, 250, 0.1);
  border-radius: 5px;
  background: rgba(15, 22, 34, 0.62);
  text-align: center;
}

.month-timeline > span.current {
  border-color: rgba(212, 175, 109, 0.42);
  background: rgba(45, 32, 14, 0.52);
}

.month-timeline small {
  color: rgba(233, 238, 250, 0.45);
  font-size: 11px;
}

.month-timeline strong {
  color: #f4f7ff;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 15px;
}

.room-modal-enter-active,
.room-modal-leave-active {
  transition: opacity 150ms ease;
}

.room-modal-enter-from,
.room-modal-leave-to {
  opacity: 0;
}

@keyframes turn {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}

@keyframes stamp {
  0% { opacity: 0; transform: rotate(18deg) scale(1.5); }
  100% { opacity: 1; transform: rotate(7deg) scale(0.9); }
}

@media (min-width: 900px) {
  .room-content {
    padding-top: 54px;
  }
}

@media (max-width: 900px) {
  .result-layout {
    top: 168px;
    right: 14px;
    bottom: 18px;
    width: min(420px, calc(100% - 28px));
  }

  .intro-hints {
    grid-template-columns: 1fr;
  }

  .pillar-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .room-hero {
    min-height: 520px;
  }

  .topic-board {
    bottom: 58px;
    padding: 14px;
  }

  .topic-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .scene-subtitle {
    display: none;
  }

  .result-layout {
    top: 138px;
    right: 10px;
    bottom: 12px;
    width: calc(100% - 20px);
    padding-right: 0;
  }

  .pillar-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .slice-group dl > div,
  .birth-aside dl > div {
    grid-template-columns: 1fr;
  }

  .modal-layer {
    align-items: stretch;
    padding: 0;
  }

  .modal {
    width: 100%;
    height: 100%;
    max-height: none;
    border: 0;
    border-radius: 0;
  }

  .modal-body {
    padding: 14px;
  }

  .month-timeline {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .turning-mark {
    animation: none;
  }

  .chenyu-seal::after {
    animation: none;
    transform: rotate(7deg) scale(0.9);
  }
}
</style>
  color: #f4f7ff;
  color: #f4f7ff;
