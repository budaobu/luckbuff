<template>
  <div class="room-page">
    <section class="room-hero" :style="roomHeroStyle" aria-labelledby="bazi-room-title">
      <ClientOnly>
        <BaziPaipanRoomStage
          :model="roomModel"
          :stage="roomStage"
          :labels="roomRendererLabels"
          @keeper-anchor="keeperAnchor = $event"
        />
        <template #fallback>
          <div class="stage-fallback">
            <span aria-hidden="true">命</span>
            <p>{{ $t('baziPaipanRoom.ritualLoading') }}</p>
          </div>
        </template>
      </ClientOnly>

      <header class="scene-header">
        <button
          type="button"
          class="back-button"
          data-testid="bazi-room-back"
          :aria-label="$t('baziPaipanRoom.back')"
          :title="$t('baziPaipanRoom.back')"
          @click="goBack"
        >
          <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
          <span>{{ $t('baziPaipanRoom.back') }}</span>
        </button>
        <div>
          <p class="scene-eyebrow">{{ $t('baziPaipanRoom.roomLabel') }}</p>
          <h1 id="bazi-room-title" class="scene-title">{{ $t('baziChart.title') }}</h1>
          <p class="scene-subtitle">{{ $t('baziChart.subtitle') }}</p>
        </div>
      </header>

      <div v-if="flowStage === 'calculating'" class="calculating-note" aria-live="polite">
        <span class="turning-mark" aria-hidden="true">盘</span>
        <p>{{ $t('baziPaipanRoom.calculatingRoom') }}</p>
      </div>

      <div
        v-if="flowStage === 'boot' || flowStage === 'start' || flowStage === 'question' || flowStage === 'birth'"
        class="keeper-bubble"
        data-testid="bazi-room-keeper-bubble"
        aria-live="polite"
      >
        {{ keeperBubble }}
      </div>

      <div v-if="flowStage === 'slideshow'" class="screen-reader-only" aria-live="polite">
        {{ activeSlideTitle }}。{{ projectionSlideDetail }}
      </div>

      <div v-if="flowStage === 'slideshow' && result" class="top-share">
        <AppShareButton
          tool="bazi-paipan"
          :summary="posterSummary"
          :filename="`bazi-room-${todayDate}-${activeTopic}.png`"
          :share-image-factory="createPoster"
          :aria-label="$t('baziPaipanRoom.poster')"
        />
      </div>

      <div v-if="flowStage === 'slideshow' && activeSlideId === 'full-chart'" class="screen-cta">
        <button type="button" data-testid="bazi-room-open-full-screen" @click="openFullChart">
          <UIcon name="i-lucide-table-properties" class="h-4 w-4" />
          {{ $t('baziPaipanRoom.fullResult') }}
        </button>
      </div>

      <Transition name="side-panel">
        <section
          v-if="sideView === 'form'"
          class="side-panel"
          :aria-label="$t('baziPaipanRoom.birthTitle')"
          data-testid="bazi-room-form-card"
        >
          <header>
            <div>
              <small>{{ $t(`baziPaipanRoom.topics.${activeTopic}`) }}</small>
              <h2>{{ $t('baziPaipanRoom.birthTitle') }}</h2>
            </div>
            <button type="button" class="icon-only" :aria-label="$t('baziPaipanRoom.close')" @click="closeBirthForm">
              <UIcon name="i-lucide-x" class="h-4 w-4" />
            </button>
          </header>
          <div class="side-panel-body">
            <BaziForm
              ref="birthFormRef"
              :initial-values="lastFormValues"
              :show-name="false"
              :show-former-name="false"
              require-hour
              hide-submit
              @submit="handleSubmit"
              @save-profile="handleSaveProfile"
            />
            <div class="form-notes">
              <p>{{ $t('baziChart.hourHint') }}</p>
              <p>{{ $t('baziChart.privacyHint') }}</p>
            </div>
          </div>
          <footer class="side-panel-footer">
            <button
              type="button"
              data-testid="bazi-room-reveal"
              :disabled="!birthFormRef?.isValid"
              @click="birthFormRef?.submit()"
            >
              <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
              {{ $t('baziPaipanRoom.reveal') }}
            </button>
          </footer>
        </section>
      </Transition>

      <Transition name="scene-pop">
        <aside
          v-if="activeSceneCard === 'visitor'"
          class="scene-popcard"
          role="dialog"
          :aria-label="$t('baziPaipanRoom.localBirthCard')"
          data-testid="bazi-room-user-card"
        >
          <header>
            <h2>{{ $t('baziPaipanRoom.localBirthCard') }}</h2>
            <button type="button" :aria-label="$t('baziPaipanRoom.close')" @click="activeSceneCard = 'none'">
              <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
            </button>
          </header>
          <dl>
            <div><dt>{{ $t('baziChart.solar') }}</dt><dd>{{ birthValues?.birthDate || '—' }}</dd></div>
            <div><dt>{{ $t('profileForm.birthHour') }}</dt><dd>{{ birthValues?.birthHourUnknown ? $t('baziForm.unknownHour') : birthValues?.birthHour || '—' }}</dd></div>
            <div><dt>{{ $t('baziChart.location') }}</dt><dd>{{ birthValues?.birthProvince || '—' }}</dd></div>
            <div><dt>{{ $t('profileForm.gender') }}</dt><dd>{{ birthValues?.gender === 'male' ? $t('common.male') : $t('common.female') }}</dd></div>
          </dl>
        </aside>
      </Transition>

      <nav
        v-if="flowStage === 'boot' || flowStage === 'start' || flowStage === 'question' || flowStage === 'birth'"
        class="room-actions flow-actions"
        :aria-label="$t('baziPaipanRoom.roomActions')"
      >
        <button
          v-if="flowStage === 'boot'"
          type="button"
          class="start-button"
          data-testid="bazi-room-start"
          @click="startFlow"
        >
          <UIcon name="i-lucide-play" class="h-4 w-4" />
          {{ $t('baziPaipanRoom.start') }}
        </button>
        <template v-else-if="flowStage === 'start' || flowStage === 'question'">
          <button
            v-for="topic in BAZI_ROOM_TOPICS"
            :key="topic.id"
            type="button"
            class="topic-option"
            :data-testid="`bazi-room-topic-${topic.id}`"
            @click="selectTopic(topic.id)"
          >
            <UIcon :name="topic.icon" class="h-4 w-4" />
            {{ $t(`baziPaipanRoom.topics.${topic.id}`) }}
          </button>
        </template>
        <span v-else class="flow-hint">{{ $t('baziPaipanRoom.birthTitle') }}</span>
      </nav>

      <nav
        v-if="flowStage === 'slideshow'"
        class="room-actions slide-shortcuts"
        :aria-label="$t('baziPaipanRoom.slideNavigation')"
        data-testid="bazi-room-slideshow"
      >
        <div class="slide-pager">
          <button
            type="button"
            :disabled="slideIndex === 0"
            :aria-label="$t('baziPaipanRoom.previousSlide')"
            :title="$t('baziPaipanRoom.previousSlide')"
            data-testid="bazi-room-prev-slide"
            @click="goToSlide(slideIndex - 1)"
          >
            <UIcon name="i-lucide-chevron-left" class="h-4 w-4" />
          </button>

          <div class="slide-progress" aria-hidden="true">
            <div class="slide-dots">
              <span v-for="(slide, index) in slideIds" :key="slide" :class="{ active: index === slideIndex }" />
            </div>
            <span class="slide-number">{{ slideIndex + 1 }} / {{ slideIds.length }}</span>
          </div>
          <button
            type="button"
            :disabled="slideIndex === slideIds.length - 1"
            :aria-label="$t('baziPaipanRoom.nextSlide')"
            :title="$t('baziPaipanRoom.nextSlide')"
            data-testid="bazi-room-next-slide"
            @click="goToSlide(slideIndex + 1)"
          >
            <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
          </button>
        </div>

        <span class="action-divider" aria-hidden="true" />
        <div class="slide-actions">
          <button
            type="button"
            data-testid="bazi-room-change-topic"
            :aria-label="$t('baziPaipanRoom.askAgain')"
            :title="$t('baziPaipanRoom.askAgain')"
            @click="openKeeperGuide"
          >
            <UIcon name="i-lucide-repeat-2" class="h-4 w-4" />
            {{ $t('baziPaipanRoom.actionAskAgain') }}
          </button>
          <button
            type="button"
            data-testid="bazi-room-change-person"
            :aria-label="$t('baziPaipanRoom.changePerson')"
            :title="$t('baziPaipanRoom.changePerson')"
            @click="openBirthForm(activeTopic)"
          >
            <UIcon name="i-lucide-user-round-pen" class="h-4 w-4" />
            {{ $t('baziPaipanRoom.actionChangePerson') }}
          </button>
          <button
            type="button"
            v-if="activeSlideId !== 'full-chart'"
            data-testid="bazi-room-open-full"
            :aria-label="$t('baziPaipanRoom.fullResult')"
            :title="$t('baziPaipanRoom.fullResult')"
            @click="openFullChart"
          >
            <UIcon name="i-lucide-table-properties" class="h-4 w-4" />
            {{ $t('baziPaipanRoom.actionFullChart') }}
          </button>
          <button
            type="button"
            class="danger"
            data-testid="bazi-room-clear-local"
            :aria-label="$t('baziPaipanRoom.clearLocal')"
            :title="$t('baziPaipanRoom.clearLocal')"
            @click="clearLocal"
          >
            <UIcon name="i-lucide-eraser" class="h-4 w-4" />
            {{ $t('baziPaipanRoom.actionClear') }}
          </button>
        </div>
      </nav>

      <footer class="scene-footnote">
        <p>{{ $t('baziChart.disclaimer') }}</p>
      </footer>
    </section>

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
import type { BaziCurrentPillarsResult } from '~~/server/api/tools/bazi-paipan/current.get'
import BaziPaipanRoomStage from '~/components/bazi-paipan-room/BaziPaipanRoomStage.vue'
import { getMonthPillar, solarToGanZhi } from '~/utils/bazi/calendar'
import {
  buildBaziRoomSceneModel,
  type BaziRoomFlowStage,
  type BaziRoomPhase,
  type BaziRoomPillar,
  type BaziRoomSlideId,
} from '~/utils/bazi-paipan-room/model'
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
const router = useRouter()
const { resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()

const phase = ref<BaziRoomPhase>('idle')
const flowStage = ref<BaziRoomFlowStage>('boot')
const result = ref<BaziChartResult | null>(null)
const lens = ref<BaziTopicLens | null>(null)
const currentPillars = ref<BaziRoomPillar[]>(import.meta.client ? localCurrentPillars(new Date()) : [])
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
const sideView = ref<'form' | 'hidden'>('hidden')
const slideIndex = ref(0)
const activeSceneCard = ref<'none' | 'visitor'>('none')
const fullDialogOpen = ref(false)
const fullTab = ref<'chart' | 'elements' | 'cycles' | 'relations'>('chart')
const fullDialogRef = ref<HTMLElement | null>(null)
const birthFormRef = ref<{ submit: () => void, isValid: boolean } | null>(null)
let readingAbort: AbortController | null = null

watch(fullDialogOpen, async (open) => {
  if (!open) return
  await nextTick()
  fullDialogRef.value?.querySelector<HTMLElement>('[role="tab"]')?.focus()
})

const initialRoomModel = buildBaziRoomSceneModel({
  phase: 'idle',
  flowStage: 'boot',
  currentPillars: currentPillars.value,
  result: null,
  lens: null,
})
const qualityOverride = computed(() => {
  const value = route.query.baziRoomQuality
  return value === 'high' || value === 'mid' || value === 'low' ? value : null
})
const freezeScene = computed(() => route.query.freeze === '1' || qualityOverride.value === 'low')
const reducedMotion = ref(false)
const keeperAnchor = ref({ x: 31, y: 41 })
const roomRendererLabels = computed(() => ({
  room: t('baziPaipanRoom.roomLabel'),
  chart: t('baziChart.title'),
  idle: t('baziPaipanRoom.ritualLoading'),
  calculating: t('baziPaipanRoom.calculating'),
  revealed: t('baziPaipanRoom.fullTitle'),
  today: t('baziPaipanRoom.todayTimeline'),
  currentBazi: t('baziPaipanRoom.currentBazi'),
  flowYear: t('baziPaipanRoom.flowYear'),
  flowMonth: t('baziPaipanRoom.flowMonth'),
  flowDay: t('baziPaipanRoom.flowDay'),
  flowHour: t('baziPaipanRoom.flowHour'),
  pillars: t('baziPaipanRoom.pillarSummary'),
  reading: t('baziPaipanRoom.reading'),
  fullChart: t('baziPaipanRoom.fullResult'),
}))
const roomStage = useBaziPaipanStageKit({
  initialModel: initialRoomModel,
  reducedMotion,
  qualityOverride,
  freeze: freezeScene,
  onSelect: handleSceneSelect,
})
const roomHeroStyle = computed(() => ({
  '--keeper-x': `${keeperAnchor.value.x}%`,
  '--keeper-y': `${keeperAnchor.value.y}%`,
}))
const roomModel = computed(() => buildBaziRoomSceneModel({
  phase: phase.value,
  flowStage: flowStage.value,
  currentPillars: currentPillars.value,
  slideId: activeSlideId.value,
  slideTitle: activeSlideTitle.value,
  slideDetail: flowStage.value === 'slideshow' ? projectionSlideDetail.value : t('baziPaipanRoom.currentCycleNote'),
  slideIndex: slideIndex.value,
  slideCount: slideIds.value.length,
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
const slideIds = computed<BaziRoomSlideId[]>(() => [
  'natal',
  'topic-natal',
  ...((lens.value?.natal.length ?? 0) > 3 ? ['topic-extra' as const] : []),
  ...(lens.value?.today ? ['topic-current' as const] : []),
  'reading',
  'full-chart',
])
const activeSlideId = computed(() => slideIds.value[slideIndex.value] ?? 'natal')
const activeSlideTitle = computed(() => ({
  'natal': t('baziPaipanRoom.userBazi'),
  'topic-natal': t('baziPaipanRoom.topicResultTitle', { topic: t(`baziPaipanRoom.topics.${activeTopic.value}`) }),
  'topic-extra': t('baziPaipanRoom.topicResultTitle', { topic: t(`baziPaipanRoom.topics.${activeTopic.value}`) }),
  'topic-current': t('baziPaipanRoom.currentTopicResultTitle', { topic: t(`baziPaipanRoom.topics.${activeTopic.value}`) }),
  'reading': cardTitle.value,
  'full-chart': t('baziPaipanRoom.fullResult'),
})[activeSlideId.value])
const projectionSlideDetail = computed(() => {
  if (activeSlideId.value === 'natal') {
    const currentDayun = result.value?.dayuns.find(dayun => dayun.isCurrent)
    return [
      fourPillars.value,
      currentDayun ? `${t('baziPaipanRoom.currentDayun')}：${currentDayun.ganzhi}` : '',
    ].filter(Boolean).join('\n')
  }
  if (activeSlideId.value === 'topic-natal') {
    return (lens.value?.natal ?? []).slice(0, 3).map(item => `${item.label}：${item.value}（${item.evidence}）`).join('\n')
  }
  if (activeSlideId.value === 'topic-extra') {
    return (lens.value?.natal ?? []).slice(3).map(item => `${item.label}：${item.value}（${item.evidence}）`).join('\n')
  }
  if (activeSlideId.value === 'topic-current') {
    return [
      ...(lens.value?.todayFields ?? []).map(item => `${item.label}：${item.value}`),
      ...(lens.value?.nobleHints ?? []),
    ].join('\n')
  }
  if (activeSlideId.value === 'reading') {
    if (readingStreaming.value) return t('baziPaipanRoom.readingWaiting')
    return [chenyu.value, readingContent.value].filter(Boolean).join('。') || t('baziPaipanRoom.readingWaiting')
  }
  return t('baziPaipanRoom.fullEntryHint')
})
const keeperBubble = computed(() => ({
  boot: t('baziPaipanRoom.bootBubble'),
  start: t('baziPaipanRoom.questionBubble'),
  question: t('baziPaipanRoom.questionBubble'),
  birth: t('baziPaipanRoom.birthBubble'),
  calculating: t('baziPaipanRoom.calculating'),
  slideshow: cardTitle.value,
})[flowStage.value])
const hasLocalBirth = computed(() => Boolean(birthValues.value))

function trackRoomEvent(event: RoomAnalyticsEvent) {
  // The repository has page-view analytics only; no custom event sink exists yet.
  void event
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function currentPillarLabels() {
  return {
    year: t('baziPaipanRoom.flowYear'),
    month: t('baziPaipanRoom.flowMonth'),
    day: t('baziPaipanRoom.flowDay'),
    hour: t('baziPaipanRoom.flowHour'),
  } as const
}

function toRoomCurrentPillars(value: BaziCurrentPillarsResult): BaziRoomPillar[] {
  const labels = currentPillarLabels()
  return value.pillars.map(pillar => ({
    key: `flow${pillar.key.charAt(0).toUpperCase()}${pillar.key.slice(1)}` as BaziRoomPillar['key'],
    label: labels[pillar.key],
    gan: pillar.gan,
    zhi: pillar.zhi,
    position: [0, 0, 0],
    highlighted: true,
  }))
}

function localCurrentPillars(date = new Date()): BaziRoomPillar[] {
  const result = solarToGanZhi(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours())
  const values = [
    { key: 'flowYear' as const, label: t('baziPaipanRoom.flowYear'), ...result.year },
    { key: 'flowMonth' as const, label: t('baziPaipanRoom.flowMonth'), ...result.month },
    { key: 'flowDay' as const, label: t('baziPaipanRoom.flowDay'), ...result.day },
    { key: 'flowHour' as const, label: t('baziPaipanRoom.flowHour'), ...result.hour! },
  ]
  return values.map(value => ({
    key: value.key,
    label: value.label,
    gan: value.gan,
    zhi: value.zhi,
    position: [0, 0, 0],
    highlighted: true,
  }))
}

async function loadCurrentPillars() {
  const now = new Date()
  currentPillars.value = localCurrentPillars(now)
  try {
    const query = new URLSearchParams({ date: localDateString(now), hour: String(now.getHours()) })
    const response = await plainFetch<BaziCurrentPillarsResult>(`/api/tools/bazi-paipan/current?${query}`)
    currentPillars.value = toRoomCurrentPillars(response)
  }
  catch { /* keep the same-engine local result rendered above */ }
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

function selectTopic(topic: BaziRoomTopicId) {
  activeTopic.value = topic
  activeSceneCard.value = 'none'
  trackRoomEvent({ type: 'topic', topic })
  if (birthValues.value) {
    sideView.value = 'hidden'
    flowStage.value = 'calculating'
    void revealTopic(topic)
  }
  else {
    openBirthForm(topic)
  }
}

function openBirthForm(topic: BaziRoomTopicId) {
  pendingTopic.value = topic
  sideView.value = 'form'
  flowStage.value = 'birth'
  activeSceneCard.value = 'none'
}

function startFlow() {
  sideView.value = 'hidden'
  flowStage.value = 'start'
  trackRoomEvent({ type: 'guideSkipped' })
}

function closeBirthForm() {
  sideView.value = 'hidden'
  flowStage.value = result.value ? 'slideshow' : 'start'
}

function goBack() {
  if (window.history.state?.back) router.back()
  else void navigateTo(localePath('/tools'))
}

function openKeeperGuide() {
  sideView.value = 'hidden'
  flowStage.value = 'question'
  activeSceneCard.value = 'none'
  trackRoomEvent({ type: 'topicChanged' })
}

function handleSceneSelect(target: 'keeper' | 'visitor') {
  if (target === 'keeper') {
    openKeeperGuide()
    activeSceneCard.value = 'none'
    return
  }
  if (!birthValues.value) {
    openBirthForm(activeTopic.value)
    return
  }
  activeSceneCard.value = activeSceneCard.value === 'visitor' ? 'none' : 'visitor'
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
  phase.value = 'idle'
  flowStage.value = 'boot'
  sideView.value = 'hidden'
  slideIndex.value = 0
  activeSceneCard.value = 'none'
  toast.add({ title: t('baziPaipanRoom.clearLocal'), color: 'success' })
}

async function handleSubmit(values: FormValues) {
  if (!values.birthDate || (!values.birthHour && !values.birthHourUnknown)) {
    toast.add({ title: t('baziChart.requiredError'), color: 'error' })
    return
  }

  const topic = pendingTopic.value ?? activeTopic.value
  activeTopic.value = topic
  lastFormValues.value = { ...values }
  sideView.value = 'hidden'
  pendingTopic.value = null
  activeSceneCard.value = 'none'
  phase.value = 'calculating'
  flowStage.value = 'calculating'
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
    sideView.value = 'form'
    flowStage.value = 'birth'
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
  flowStage.value = 'slideshow'
  sideView.value = 'hidden'
  slideIndex.value = 0
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
  flowStage.value = 'calculating'
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
    flowStage.value = 'slideshow'
    slideIndex.value = 0
    trackRoomEvent({ type: 'revealCompleted', topic })
    void startReading()
  }
  catch (error: any) {
    phase.value = 'revealed'
    flowStage.value = 'slideshow'
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

function goToSlide(index: number) {
  slideIndex.value = Math.min(Math.max(index, 0), slideIds.value.length - 1)
}

function handleSlideKeydown(event: KeyboardEvent) {
  if (flowStage.value !== 'slideshow' || fullDialogOpen.value || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
  const target = event.target as HTMLElement | null
  if (target?.closest('input, select, textarea, button, a, [contenteditable="true"]')) return

  if (event.key === 'ArrowRight' || event.key === 'j' || event.key === 'J') {
    event.preventDefault()
    goToSlide(slideIndex.value + 1)
  }
  else if (event.key === 'ArrowLeft' || event.key === 'k' || event.key === 'K') {
    event.preventDefault()
    goToSlide(slideIndex.value - 1)
  }
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    const target = event.target as HTMLElement | null
    if (target?.closest('[aria-haspopup="dialog"], [role="combobox"]')) return
    event.preventDefault()
    closeFullChart()
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
  window.addEventListener('keydown', handleSlideKeydown)
  void loadCurrentPillars()

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
      sideView.value = 'hidden'
      phase.value = 'idle'
      flowStage.value = 'boot'
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
  window.removeEventListener('keydown', handleSlideKeydown)
  delete (window as Window & { __baziPaipanRoomE2E?: unknown }).__baziPaipanRoomE2E
})
</script>

<style scoped>
.room-page {
  position: fixed;
  inset: 0;
  z-index: 70;
  height: 100svh;
  overflow: hidden;
  background: #05080f;
  color: #e9eefa;
}

.room-hero {
  position: relative;
  height: 100%;
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

.calculating-note,
.info-rail {
  position: absolute;
  z-index: 8;
}

.keeper-bubble {
  position: absolute;
  z-index: 9;
  top: clamp(118px, calc(var(--keeper-y, 41%) - 84px), calc(100% - 148px));
  left: clamp(8px, calc(var(--keeper-x, 31%) - 160px), calc(100% - 328px));
  width: min(320px, calc(100% - 36px));
  padding: 11px 14px;
  border: 1px solid rgba(212, 175, 109, 0.3);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.9);
  color: rgba(238, 243, 255, 0.88);
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(16px);
}

.keeper-bubble::after {
  content: '';
  position: absolute;
  left: clamp(18px, var(--keeper-x, 31%), calc(100% - 18px));
  bottom: -8px;
  width: 14px;
  height: 14px;
  border-left: 1px solid rgba(212, 175, 109, 0.3);
  border-bottom: 1px solid rgba(212, 175, 109, 0.3);
  background: rgba(7, 11, 19, 0.94);
  transform: translateX(-50%) rotate(45deg);
}

.screen-reader-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.top-share {
  position: absolute;
  z-index: 14;
  top: 14px;
  right: 24px;
}

.top-share :deep(button) {
  min-height: 38px;
  padding-right: 12px;
  padding-left: 12px;
  font-size: 12px;
}

.screen-cta {
  position: absolute;
  z-index: 13;
  left: 50%;
  bottom: 84px;
  translate: -50% 0;
}

.screen-cta button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(212, 175, 109, 0.58);
  border-radius: 6px;
  background: rgba(68, 44, 10, 0.94);
  color: #ffe8ab;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(14px);
}

.screen-cta button:hover,
.screen-cta button:focus-visible {
  border-color: rgba(242, 217, 152, 0.82);
  background: rgba(88, 57, 13, 0.96);
}

.result-carousel {
  position: absolute;
  z-index: 10;
  top: 118px;
  right: 24px;
  bottom: 106px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(426px, calc(100% - 48px));
  overflow: hidden;
  border: 1px solid rgba(212, 175, 109, 0.24);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.88);
  color: #e9eefa;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}

.result-carousel > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 16px;
  border-bottom: 1px solid rgba(212, 175, 109, 0.16);
  color: #f2d998;
}

.result-carousel small {
  display: block;
  color: rgba(233, 238, 250, 0.48);
  font-size: 11px;
}

.result-carousel h2 {
  margin: 3px 0 0;
  color: #f4f7ff;
  font-size: 18px;
  font-weight: 700;
}

.slide-body {
  min-height: 0;
  overflow: auto;
  padding: 16px;
  overscroll-behavior: contain;
}

.flow-slide {
  display: grid;
  gap: 16px;
  justify-items: center;
}

.large-ganzhi {
  display: grid;
  min-width: 138px;
  min-height: 138px;
  place-items: center;
  border: 1px solid rgba(212, 175, 109, 0.36);
  border-radius: 8px;
  background: rgba(23, 17, 8, 0.58);
  color: #f4f7ff;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 46px;
  font-weight: 700;
}

.flow-slide > dl {
  display: grid;
  width: 100%;
  gap: 8px;
  margin: 0;
}

.flow-slide > dl > div {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid rgba(233, 238, 250, 0.08);
}

.flow-slide dt {
  color: rgba(233, 238, 250, 0.46);
  font-size: 12px;
}

.flow-slide dd {
  min-width: 0;
  margin: 0;
  color: rgba(233, 238, 250, 0.82);
  font-size: 13px;
  line-height: 1.6;
}

.cycle-strip,
.current-cycles {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cycle-strip {
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}

.cycle-strip span,
.current-cycles span {
  display: grid;
  min-width: 58px;
  place-items: center;
  gap: 2px;
  padding: 6px 7px;
  border: 1px solid rgba(233, 238, 250, 0.1);
  border-radius: 6px;
  background: rgba(15, 22, 34, 0.68);
}

.cycle-strip span.active,
.current-cycles span {
  border-color: rgba(212, 175, 109, 0.42);
  background: rgba(45, 32, 14, 0.56);
}

.cycle-strip small,
.current-cycles small {
  color: rgba(233, 238, 250, 0.48);
  font-size: 11px;
}

.cycle-strip strong,
.current-cycles strong {
  color: #f2d998;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 15px;
}

.info-rail {
  top: 224px;
  left: 24px;
  bottom: 104px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(380px, calc(100% - 48px));
  overflow: auto;
  padding-right: 4px;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 175, 109, 0.35) transparent;
}

.calculating-note {
  left: 50%;
  translate: -50% 0;
}

.side-panel {
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
  position: absolute;
  z-index: 10;
  top: 148px;
  right: 24px;
  bottom: 104px;
  display: flex;
  flex-direction: column;
  width: min(420px, calc(100% - 48px));
  overflow: hidden;
  border: 1px solid rgba(212, 175, 109, 0.24);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.94);
  color: #e9eefa;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(20px);
}

.side-panel > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(212, 175, 109, 0.16);
}

.side-panel h2 {
  margin: 3px 0 0;
  color: #f4f7ff;
  font-size: 18px;
}

.side-panel small {
  color: rgba(233, 238, 250, 0.48);
  font-size: 12px;
}

.side-panel-body {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px 14px;
}

.side-panel-body :deep(.bazi-form-profile-hint),
.side-panel-body :deep(.form-notes) {
  display: none;
}

.side-panel-body :deep(.bazi-form-ganzhi) {
  display: none;
}

.side-panel-body :deep(.space-y-5) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.side-panel-body :deep(.bazi-form-field-wide) {
  grid-column: 1 / -1;
}

.side-panel-body :deep(.bazi-form-field) {
  min-width: 0;
}

.side-panel-body :deep(.space-y-1\.5) {
  gap: 5px;
}

.side-panel-body :deep(label) {
  margin-bottom: 0;
}

.side-panel-body :deep(.h-8) {
  height: 2rem;
}

.side-panel-body :deep(button) {
  min-height: 34px;
}

.side-panel-footer {
  flex-shrink: 0;
  padding: 10px 14px 12px;
  border-top: 1px solid rgba(212, 175, 109, 0.16);
}

.side-panel-footer button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  min-height: 44px;
  border: 1px solid rgba(212, 175, 109, 0.5);
  border-radius: 6px;
  background: rgba(66, 43, 9, 0.9);
  color: #f2d998;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.side-panel-footer button:hover:not(:disabled),
.side-panel-footer button:focus-visible:not(:disabled) {
  border-color: rgba(212, 175, 109, 0.72);
  background: rgba(85, 54, 11, 0.96);
}

.side-panel-footer button:disabled {
  opacity: 0.46;
  cursor: not-allowed;
}

.side-panel-body :deep(.space-y-5) {
  display: grid;
  gap: 10px;
}

.side-panel-body :deep(.space-y-5 > .space-y-2) {
  display: grid;
  gap: 6px;
}

.side-panel-body :deep(.space-y-5 > div.rounded-lg) {
  padding: 10px 12px;
}

.side-panel-body :deep(.text-sm) {
  font-size: 13px;
}

.side-panel-body :deep(.h-4.w-4) {
  height: 1rem;
  width: 1rem;
}

.form-notes {
  display: grid;
  gap: 7px;
  margin-top: 16px;
  padding-top: 13px;
  border-top: 1px solid rgba(233, 238, 250, 0.08);
}

.form-notes p {
  margin: 0;
  color: rgba(233, 238, 250, 0.52);
  font-size: 11px;
  line-height: 1.55;
}

.info-card {
  position: absolute;
  z-index: 9;
  left: 24px;
  bottom: 106px;
  width: min(316px, calc(100% - 48px));
  border: 1px solid rgba(212, 175, 109, 0.22);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.86);
  padding: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.user-info-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212, 175, 109, 0.16);
  color: #f2d998;
}

.user-info-card small {
  display: block;
  color: rgba(233, 238, 250, 0.48);
  font-size: 11px;
}

.user-info-card h2 {
  margin: 3px 0 0;
  color: #f4f7ff;
  font-size: 17px;
  font-weight: 800;
}

.user-info-card dl {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
}

.user-info-card dl > div {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 10px;
}

.user-info-card dt {
  color: rgba(233, 238, 250, 0.45);
  font-size: 12px;
}

.user-info-card dd {
  min-width: 0;
  margin: 0;
  color: rgba(233, 238, 250, 0.82);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.scene-popcard {
  position: absolute;
  z-index: 12;
  left: 24px;
  bottom: 104px;
  width: min(330px, calc(100% - 48px));
  padding: 14px;
  border: 1px solid rgba(212, 175, 109, 0.28);
  border-radius: 8px;
  background: rgba(7, 11, 19, 0.94);
  color: #e9eefa;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(20px);
}

.scene-popcard header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.scene-popcard h2 {
  margin: 0;
  color: #f2d998;
  font-size: 14px;
}

.scene-popcard button {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(233, 238, 250, 0.13);
  border-radius: 5px;
  background: rgba(18, 25, 38, 0.8);
  color: rgba(233, 238, 250, 0.65);
  cursor: pointer;
}

.scene-popcard dl {
  display: grid;
  gap: 9px;
  margin: 0;
}

.scene-popcard dl > div {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 10px;
}

.scene-popcard dt {
  color: rgba(233, 238, 250, 0.45);
  font-size: 12px;
}

.scene-popcard dd {
  min-width: 0;
  margin: 0;
  color: rgba(233, 238, 250, 0.82);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.guide-list {
  display: grid;
  gap: 7px;
}

.guide-list button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid rgba(233, 238, 250, 0.12);
  border-radius: 6px;
  background: rgba(15, 22, 34, 0.68);
  color: rgba(233, 238, 250, 0.78);
  font-size: 13px;
  cursor: pointer;
}

.guide-list button:hover,
.guide-list button:focus-visible {
  border-color: rgba(212, 175, 109, 0.52);
  color: #f2d998;
}

.room-actions {
  position: absolute;
  z-index: 12;
  left: 50%;
  bottom: 20px;
  translate: -50% 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: min(720px, calc(100% - 32px));
  padding: 8px 10px;
  border: 1px solid rgba(212, 175, 109, 0.2);
  border-radius: 8px;
  background: rgba(5, 9, 16, 0.84);
  backdrop-filter: blur(16px);
}

.flow-actions {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: min(700px, calc(100% - 32px));
}

.current-cycles {
  flex-wrap: wrap;
  justify-content: center;
}

.start-button {
  border-color: rgba(212, 175, 109, 0.62) !important;
  background: rgba(74, 48, 11, 0.94) !important;
  color: #ffe8ab !important;
  font-weight: 700;
  animation: start-pulse 1.8s ease-in-out infinite;
}

.topic-option {
  flex: 0 0 auto;
}

.slide-shortcuts {
  gap: 8px;
}

.slide-pager {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slide-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slide-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-divider {
  width: 1px;
  height: 22px;
  background: rgba(233, 238, 250, 0.14);
}

.flow-hint {
  color: rgba(233, 238, 250, 0.52);
  font-size: 12px;
}

.room-actions button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(233, 238, 250, 0.14);
  border-radius: 6px;
  background: rgba(18, 25, 38, 0.8);
  color: rgba(233, 238, 250, 0.78);
  font-size: 12px;
  cursor: pointer;
}

.room-actions button:hover,
.room-actions button:focus-visible {
  border-color: rgba(212, 175, 109, 0.52);
  color: #f2d998;
}

.room-actions button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.room-actions button.danger {
  border-color: color-mix(in srgb, #b91c1c 28%, transparent);
  color: #d98080;
}

.room-actions button.danger:hover,
.room-actions button.danger:focus-visible {
  border-color: color-mix(in srgb, #b91c1c 52%, transparent);
  color: #ef4444;
}

.scene-footnote {
  position: absolute;
  z-index: 5;
  right: 24px;
  bottom: 4px;
  width: min(360px, calc(100% - 48px));
}

.scene-footnote p {
  margin: 0;
  color: rgba(233, 238, 250, 0.3);
  font-size: 10px;
  line-height: 1.4;
  text-align: right;
}

.side-panel-enter-active,
.side-panel-leave-active,
.scene-pop-enter-active,
.scene-pop-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.side-panel-enter-from,
.side-panel-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.scene-pop-enter-from,
.scene-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
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

@media (min-width: 768px) {
  .room-page {
    height: 100svh;
  }

  .side-panel {
    top: 120px;
    bottom: 100px;
  }
}
.reading-panel header button,
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

.scene-header {
  position: absolute;
  z-index: 9;
  top: 14px;
  left: 24px;
  width: min(380px, calc(100% - 48px));
  text-align: left;
  pointer-events: none;
  padding: 12px 18px;
  border: 1px solid rgba(212, 175, 109, 0.18);
  border-radius: 8px;
  background: rgba(5, 9, 16, 0.58);
  backdrop-filter: blur(16px);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  margin-bottom: 12px;
  padding: 0 9px;
  border: 1px solid rgba(233, 238, 250, 0.16);
  border-radius: 6px;
  background: rgba(11, 17, 27, 0.82);
  color: rgba(233, 238, 250, 0.78);
  font-size: 12px;
  cursor: pointer;
  pointer-events: auto;
}

.back-button:hover,
.back-button:focus-visible {
  border-color: rgba(212, 175, 109, 0.55);
  color: #f2d998;
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
  max-width: 360px;
  margin: 10px 0 0;
  color: rgba(233, 238, 250, 0.66);
  font-size: 14px;
  line-height: 1.7;
}

.topic-card {
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

.slide-pillars {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
}

.chenyu-seal.compact {
  width: 100%;
  margin: 0;
  padding: 12px;
}

.chenyu-seal.compact strong {
  min-height: 32px;
  font-size: 22px;
}

.reading-slide,
.full-entry-slide {
  display: grid;
  gap: 13px;
  align-content: start;
}

.reading-slide > button,
.full-entry-slide > button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  border: 1px solid rgba(233, 238, 250, 0.16);
  border-radius: 6px;
  background: rgba(18, 25, 38, 0.84);
  color: rgba(233, 238, 250, 0.8);
  font-size: 13px;
  cursor: pointer;
}

.full-entry-slide > p {
  margin: 0;
  color: rgba(233, 238, 250, 0.68);
  font-size: 13px;
  line-height: 1.7;
}

.full-entry-slide > button {
  border-color: rgba(212, 175, 109, 0.5);
  background: rgba(66, 43, 9, 0.9);
  color: #f2d998;
  font-weight: 700;
}

.secondary-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.secondary-actions > * {
  min-width: 0;
}

.result-carousel > footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid rgba(212, 175, 109, 0.16);
}

.result-carousel > footer > button {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
}

.slide-dots {
  display: flex;
  align-items: center;
  gap: 5px;
}

.slide-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(233, 238, 250, 0.24);
}

.slide-dots span.active {
  background: #f2d998;
}

.slide-number {
  min-width: 38px;
  color: rgba(233, 238, 250, 0.55);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: center;
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

.slice-group dl > div {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid rgba(233, 238, 250, 0.08);
}

.slice-group dt {
  color: rgba(233, 238, 250, 0.45);
  font-size: 12px;
}

.slice-group dd {
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

.modal footer .danger {
  border-color: color-mix(in srgb, #b91c1c 34%, transparent);
  color: #b91c1c;
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
  --surface-bg: #05080f;
  --surface-card: rgba(11, 17, 27, 0.88);
  --surface-card-hover: rgba(18, 25, 38, 0.88);
  --surface-input: rgba(15, 22, 34, 0.86);
  --surface-elevated: rgba(9, 14, 23, 0.94);
  --border-subtle: rgba(233, 238, 250, 0.12);
  --border-light: rgba(233, 238, 250, 0.17);
  --border-medium: rgba(212, 175, 109, 0.22);
  --text-primary: #f4f7ff;
  --text-body: rgba(240, 245, 255, 0.88);
  --text-muted: rgba(233, 238, 250, 0.72);
  --text-faint: rgba(233, 238, 250, 0.58);
  --text-placeholder: rgba(233, 238, 250, 0.48);
  --accent: #f2d998;
  --accent-bg: rgba(45, 32, 14, 0.42);
  --accent-border: rgba(212, 175, 109, 0.32);
  --accent-border-hover: rgba(212, 175, 109, 0.58);
  --accent-faint: rgba(45, 32, 14, 0.28);
  --warning: #facc15;
  --warning-bg: rgba(250, 204, 21, 0.12);
  --shadow-panel: 0 24px 70px rgba(0, 0, 0, 0.32);
  color-scheme: dark;
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

@keyframes start-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 109, 0);
    opacity: 0.88;
  }
  50% {
    box-shadow: 0 0 0 7px rgba(212, 175, 109, 0.12);
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .info-rail {
    top: 168px;
    left: 14px;
    bottom: 104px;
    width: min(420px, calc(100% - 28px));
  }

  .pillar-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .result-carousel {
    top: 148px;
    right: 14px;
    bottom: 104px;
    width: min(420px, calc(100% - 28px));
  }

  .side-panel {
    top: 168px;
    right: 14px;
    bottom: 104px;
    width: min(420px, calc(100% - 28px));
  }
}

@media (max-width: 640px) {
  .scene-subtitle {
    display: none;
  }

  .scene-header {
    top: 8px;
    left: 8px;
    width: calc(100% - 112px);
    padding: 9px 11px;
  }

  .scene-title {
    font-size: 21px;
  }

  .keeper-bubble {
    width: calc(100% - 20px);
    padding: 9px 11px;
    font-size: 13px;
  }

  .keeper-bubble::after {
  }

  .result-carousel {
    top: 166px;
    right: 8px;
    bottom: 78px;
    width: calc(100% - 16px);
  }

  .result-carousel h2 {
    font-size: 16px;
  }

  .slide-body {
    padding: 12px;
  }

  .large-ganzhi {
    min-width: 112px;
    min-height: 112px;
    font-size: 36px;
  }

  .flow-slide > dl > div {
    grid-template-columns: 1fr;
    gap: 3px;
  }

  .info-rail {
    top: 148px;
    left: 10px;
    bottom: 196px;
    width: calc(100% - 20px);
    padding-right: 0;
  }

  .side-panel {
    top: 148px;
    right: 10px;
    bottom: 196px;
    width: calc(100% - 20px);
  }

  .room-actions {
    left: 10px;
    right: 10px;
    bottom: 8px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: none;
    translate: none;
  }

  .room-actions button {
    justify-content: center;
  }

  .flow-actions {
    display: flex;
    flex-wrap: wrap;
  }

  .topic-option {
    flex: 1 0 calc(33% - 8px);
    justify-content: center;
    min-width: 0;
  }

  .slide-shortcuts {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    overflow: visible;
  }

  .slide-pager {
    justify-content: center;
  }

  .slide-progress {
    flex: 0 0 auto;
  }

  .slide-actions {
    display: flex;
    gap: 6px;
  }

  .slide-actions button {
    flex: 1 1 0;
    justify-content: center;
    min-width: 0;
    padding: 0 5px;
    gap: 4px;
    font-size: 11px;
  }

  .action-divider {
    display: none;
  }

  .top-share {
    top: 8px;
    right: 8px;
  }

  .screen-cta {
    bottom: 116px;
  }

  .secondary-actions {
    grid-template-columns: 1fr;
  }

  .scene-footnote {
    display: none;
  }

  .user-info-card {
    display: none;
  }

  .pillar-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .slice-group dl > div {
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

  .start-button {
    animation: none;
    opacity: 1;
  }

  .chenyu-seal::after {
    animation: none;
    transform: rotate(7deg) scale(0.9);
  }
}
</style>
