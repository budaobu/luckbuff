<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12" :class="{ 'bfs-result-wrap': phase === 'result' }">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Bedroom Feng Shui</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('bedroomFengshui.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('bedroomFengshui.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('bedroomFengshui.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 房间类型选择器 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bedroomFengshui.roomTypeLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="room in roomOptions"
                  :key="room.value"
                  type="button"
                  class="py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 text-left px-4"
                  :class="form.roomType === room.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="selectRoomType(room.value)"
                >
                  <span class="block font-semibold">{{ room.label }}</span>
                  <span class="block text-[10px] opacity-80 mt-0.5">{{ room.sublabel }}</span>
                </button>
              </div>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bedroomFengshui.genderLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'male'"
                >
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 阳历生日 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                {{ $t('bedroomFengshui.birthDateLabel') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('bedroomFengshui.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar
                    v-model="calendarDate"
                    color="warning"
                    class="p-2"
                  />
                </template>
              </UPopover>
              <p class="text-[11px] text-[var(--text-faint)] mt-1">{{ $t('bedroomFengshui.birthDateHint') }}</p>
            </div>

            <!-- 卧室朝向 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bedroomFengshui.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.direction"
                  type="number"
                  :min="0"
                  :max="360"
                  :placeholder="$t('bedroomFengshui.directionPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                  @update:model-value="onDirectionInput"
                />
                <USelectMenu
                  v-model="selectedMountain"
                  :items="mountainOptions"
                  value-key="value"
                  :placeholder="$t('bedroomFengshui.mountainPlaceholder')"
                  class="w-32"
                  :ui="selectUi"
                  @update:model-value="onMountainSelect"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('bedroomFengshui.directionHint') }}
              </p>

              <!-- 可视化罗盘 -->
              <div class="mt-4 flex justify-center">
                <div
                  ref="compassRef"
                  class="relative w-40 h-40 rounded-full border-2 border-[var(--border-light)] bg-[var(--surface-card)] cursor-crosshair select-none"
                  @mousedown="startCompassDrag"
                  @touchstart.prevent="startCompassDrag"
                  @mousemove="onCompassDrag"
                  @touchmove.prevent="onCompassDrag"
                  @mouseup="stopCompassDrag"
                  @touchend="stopCompassDrag"
                  @mouseleave="stopCompassDrag"
                >
                  <!-- 刻度 -->
                  <div class="absolute inset-0 rounded-full">
                    <div
                      v-for="deg in [0, 45, 90, 135, 180, 225, 270, 315]"
                      :key="deg"
                      class="absolute w-px h-3 bg-[var(--border-medium)] origin-bottom"
                      :style="compassTickStyle(deg)"
                    />
                  </div>
                  <!-- 方位文字 -->
                  <div class="absolute inset-0 rounded-full text-[10px] font-medium text-[var(--text-muted)]">
                    <span class="absolute top-1 left-1/2 -translate-x-1/2">N</span>
                    <span class="absolute bottom-1 left-1/2 -translate-x-1/2">S</span>
                    <span class="absolute left-1.5 top-1/2 -translate-y-1/2">W</span>
                    <span class="absolute right-1.5 top-1/2 -translate-y-1/2">E</span>
                  </div>
                  <!-- 指针 -->
                  <div
                    class="absolute bottom-1/2 left-1/2 w-0.5 h-[calc(50%-8px)] origin-bottom rounded-full bg-[var(--accent)]"
                    :style="needleStyle"
                  />
                  <div class="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                </div>
              </div>
            </div>

            <!-- 床位朝向 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bedroomFengshui.bedDirectionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.bedDirection"
                  type="number"
                  :min="0"
                  :max="360"
                  :placeholder="$t('bedroomFengshui.bedDirectionPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                  @update:model-value="onBedDirectionInput"
                />
                <USelectMenu
                  v-model="selectedBedMountain"
                  :items="mountainOptions"
                  value-key="value"
                  :placeholder="$t('bedroomFengshui.mountainPlaceholder')"
                  class="w-32"
                  :ui="selectUi"
                  @update:model-value="onBedMountainSelect"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('bedroomFengshui.bedDirectionHint') }}
              </p>

              <!-- 床位罗盘 -->
              <div class="mt-4 flex justify-center">
                <div
                  ref="bedCompassRef"
                  class="relative w-32 h-32 rounded-full border-2 border-[var(--border-light)] bg-[var(--surface-card)] cursor-crosshair select-none"
                  @mousedown="startBedCompassDrag"
                  @touchstart.prevent="startBedCompassDrag"
                  @mousemove="onBedCompassDrag"
                  @touchmove.prevent="onBedCompassDrag"
                  @mouseup="stopBedCompassDrag"
                  @touchend="stopBedCompassDrag"
                  @mouseleave="stopBedCompassDrag"
                >
                  <div class="absolute inset-0 rounded-full">
                    <div
                      v-for="deg in [0, 45, 90, 135, 180, 225, 270, 315]"
                      :key="deg"
                      class="absolute w-px h-3 bg-[var(--border-medium)] origin-bottom"
                      :style="compassTickStyle(deg)"
                    />
                  </div>
                  <div class="absolute inset-0 rounded-full text-[10px] font-medium text-[var(--text-muted)]">
                    <span class="absolute top-1 left-1/2 -translate-x-1/2">N</span>
                    <span class="absolute bottom-1 left-1/2 -translate-x-1/2">S</span>
                    <span class="absolute left-1.5 top-1/2 -translate-y-1/2">W</span>
                    <span class="absolute right-1.5 top-1/2 -translate-y-1/2">E</span>
                  </div>
                  <div
                    class="absolute bottom-1/2 left-1/2 w-0.5 h-[calc(50%-8px)] origin-bottom rounded-full bg-[var(--accent-purple)]"
                    :style="bedNeedleStyle"
                  />
                  <div class="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-purple)]" />
                </div>
              </div>
            </div>

            <!-- 卧室禁忌 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bedroomFengshui.tabooLabel') }}
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  v-for="taboo in tabooOptions"
                  :key="taboo.key"
                  type="button"
                  class="py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 text-left px-4 flex items-start gap-2"
                  :class="form.taboos[taboo.key]
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.taboos[taboo.key] = !form.taboos[taboo.key]"
                >
                  <span class="mt-0.5">
                    <UIcon
                      :name="form.taboos[taboo.key] ? 'i-heroicons-check-circle' : 'i-heroicons-circle'"
                      class="w-4 h-4"
                    />
                  </span>
                  <span class="block">
                    <span class="block font-semibold">{{ taboo.label }}</span>
                    <span class="block text-[10px] opacity-80 mt-0.5">{{ taboo.sublabel }}</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- 计算按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('bedroomFengshui.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bedroomFengshui.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bedroomFengshui.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-building-office-2" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bedroomFengshui.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bedroomFengshui.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bedroomFengshui.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bedroomFengshui.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-moon" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bedroomFengshui.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bedroomFengshui.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-compass" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('bedroomFengshui.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果（纸质报告） ============ -->
      <div v-if="phase === 'result' && calcResult">
        <!-- 隐藏截图目标：完整纸质报告 -->
        <div ref="shareTargetRef" v-show="false" class="bfs-share-target">
          <BedroomFengshuiReport
            :result="calcResult"
            :ai-content="aiContent"
            :streaming="false"
            :error="null"
          />
        </div>

        <BedroomFengshuiReport
          :result="calcResult"
          :ai-content="aiContent"
          :streaming="aiStreaming"
          :error="aiError"
          @retry="startAiStream"
        />

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleCopy"
          >
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('bedroomFengshui.copyResult') }}
          </UButton>
          <AppShareButton
            tool="bedroom-fengshui"
            :summary="`${calcResult.mingGua}命 · ${calcResult.mountain?.name}向 · ${form.birthDate}`"
            :share-target="shareTargetRef"
            :filename="`bedroom-fengshui-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('bedroomFengshui.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/tools'); }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('bedroomFengshui.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { MOUNTAINS_24 } from '~/utils/bazhai'
import type { BedroomFengshuiResult, BedroomTaboos } from '~/utils/bedroom-fengshui'

interface CalcResult extends BedroomFengshuiResult {}

type RoomType = 'office' | 'study' | 'bedroom' | 'hall'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  roomType: 'bedroom' as RoomType,
  gender: '' as 'male' | 'female' | '',
  birthDate: '' as string,
  direction: 0,
  bedDirection: 0,
  taboos: {
    beamOverBed: false,
    doorRushBed: false,
    mirrorFacingBed: false,
    windowBehindBed: false,
    windowAboveBed: false,
    bathroomWall: false,
    kitchenWall: false,
    slopedCeiling: false,
  } as BedroomTaboos,
})
const calcResult = ref<CalcResult | null>(null)
const shareTargetRef = ref<HTMLElement>()
const toast = useToast()
const compassRef = ref<HTMLDivElement>()
const bedCompassRef = ref<HTMLDivElement>()
const dragging = ref(false)
const bedDragging = ref(false)

const config = useRuntimeConfig()
const siteName = computed(() => (config.public.siteName as string) || 'ososn')
const siteUrl = computed(() => (config.public.siteUrl as string) || 'https://www.ososn.com')
const pageUrl = computed(() => `${siteUrl.value}/tools/bedroom-fengshui`)

// 阳历生日日历
const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const calendarDate = ref<CalendarDate | undefined>(undefined)

watch(calendarDate, (val) => {
  if (val) {
    form.birthDate = `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
  }
  else {
    form.birthDate = ''
  }
})

// 房间类型选项
const roomOptions = computed<{ value: RoomType; label: string; sublabel: string }[]>(() => [
  { value: 'office', label: t('bedroomFengshui.roomOffice'), sublabel: t('bedroomFengshui.roomOfficeDesc') },
  { value: 'study', label: t('bedroomFengshui.roomStudy'), sublabel: t('bedroomFengshui.roomStudyDesc') },
  { value: 'bedroom', label: t('bedroomFengshui.roomBedroom'), sublabel: t('bedroomFengshui.roomBedroomDesc') },
  { value: 'hall', label: t('bedroomFengshui.roomHall'), sublabel: t('bedroomFengshui.roomHallDesc') },
])

function selectRoomType(value: RoomType) {
  if (value === 'bedroom') {
    form.roomType = value
    return
  }
  // 其它房型直接跳转到预定义的最终路由
  const routeMap: Record<Exclude<RoomType, 'bedroom'>, string> = {
    office: '/tools/office-fengshui',
    study: '/tools/study-fengshui',
    hall: '/tools/hall-fengshui',
  }
  navigateTo(localePath(routeMap[value]))
}

// 24 山下拉选项
const mountainOptions = computed(() =>
  MOUNTAINS_24.map(m => ({ value: m.name, label: `${m.name}（${m.palace}）` })),
)

const selectedMountain = ref<string>('')
const selectedBedMountain = ref<string>('')

// 方向输入变化时联动 24 山
function onDirectionInput(val: number | string | undefined) {
  const num = typeof val === 'string' ? Number(val) : val
  const deg = num === undefined || Number.isNaN(num) ? 0 : num
  form.direction = deg
  updateMountainFromDirection(deg)
}

function onBedDirectionInput(val: number | string | undefined) {
  const num = typeof val === 'string' ? Number(val) : val
  const deg = num === undefined || Number.isNaN(num) ? 0 : num
  form.bedDirection = deg
  updateBedMountainFromDirection(deg)
}

function updateMountainFromDirection(deg: number) {
  let nearest: typeof MOUNTAINS_24[number] | null = null
  let minDiff = Infinity
  for (const m of MOUNTAINS_24) {
    let center: number
    if (m.start < m.end) {
      center = (m.start + m.end) / 2
    }
    else {
      center = ((m.start + (m.end + 360)) / 2) % 360
    }
    const diff = Math.abs(((deg - center + 540) % 360) - 180)
    if (diff < minDiff) {
      minDiff = diff
      nearest = m
    }
  }
  selectedMountain.value = nearest?.name || ''
}

function updateBedMountainFromDirection(deg: number) {
  let nearest: typeof MOUNTAINS_24[number] | null = null
  let minDiff = Infinity
  for (const m of MOUNTAINS_24) {
    let center: number
    if (m.start < m.end) {
      center = (m.start + m.end) / 2
    }
    else {
      center = ((m.start + (m.end + 360)) / 2) % 360
    }
    const diff = Math.abs(((deg - center + 540) % 360) - 180)
    if (diff < minDiff) {
      minDiff = diff
      nearest = m
    }
  }
  selectedBedMountain.value = nearest?.name || ''
}

// 24 山选择变化时联动角度
function onMountainSelect(val: string | undefined) {
  if (!val) return
  const m = MOUNTAINS_24.find(x => x.name === val)
  if (!m) return
  let center: number
  if (m.start < m.end) {
    center = (m.start + m.end) / 2
  }
  else {
    center = ((m.start + (m.end + 360)) / 2) % 360
  }
  form.direction = Math.round(center)
}

function onBedMountainSelect(val: string | undefined) {
  if (!val) return
  const m = MOUNTAINS_24.find(x => x.name === val)
  if (!m) return
  let center: number
  if (m.start < m.end) {
    center = (m.start + m.end) / 2
  }
  else {
    center = ((m.start + (m.end + 360)) / 2) % 360
  }
  form.bedDirection = Math.round(center)
}

// 罗盘交互
const needleStyle = computed(() => ({
  transform: `rotate(${form.direction}deg) translateX(-50%)`,
}))

const bedNeedleStyle = computed(() => ({
  transform: `rotate(${form.bedDirection}deg) translateX(-50%)`,
}))

function compassTickStyle(deg: number) {
  return {
    left: '50%',
    top: '8px',
    height: 'calc(50% - 8px)',
    transform: `rotate(${deg}deg) translateX(-50%)`,
  }
}

function getAngleFromEvent(e: MouseEvent | TouchEvent, refEl?: HTMLDivElement): number {
  const el = refEl || compassRef.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
  const rad = Math.atan2(clientY - centerY, clientX - centerX)
  let deg = rad * (180 / Math.PI) + 90
  if (deg < 0) deg += 360
  return Math.round(deg)
}

function startCompassDrag(e: MouseEvent | TouchEvent) {
  dragging.value = true
  const deg = getAngleFromEvent(e)
  form.direction = deg
  updateMountainFromDirection(deg)
}

function onCompassDrag(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return
  const deg = getAngleFromEvent(e)
  form.direction = deg
  updateMountainFromDirection(deg)
}

function stopCompassDrag() {
  dragging.value = false
}

function startBedCompassDrag(e: MouseEvent | TouchEvent) {
  bedDragging.value = true
  const deg = getAngleFromEvent(e, bedCompassRef.value)
  form.bedDirection = deg
  updateBedMountainFromDirection(deg)
}

function onBedCompassDrag(e: MouseEvent | TouchEvent) {
  if (!bedDragging.value) return
  const deg = getAngleFromEvent(e, bedCompassRef.value)
  form.bedDirection = deg
  updateBedMountainFromDirection(deg)
}

function stopBedCompassDrag() {
  bedDragging.value = false
}

const tabooOptions = computed(() => [
  { key: 'beamOverBed' as const, label: t('bedroomFengshui.tabooBeamOverBed'), sublabel: t('bedroomFengshui.tabooBeamOverBedDesc') },
  { key: 'doorRushBed' as const, label: t('bedroomFengshui.tabooDoorRushBed'), sublabel: t('bedroomFengshui.tabooDoorRushBedDesc') },
  { key: 'mirrorFacingBed' as const, label: t('bedroomFengshui.tabooMirrorFacingBed'), sublabel: t('bedroomFengshui.tabooMirrorFacingBedDesc') },
  { key: 'windowBehindBed' as const, label: t('bedroomFengshui.tabooWindowBehindBed'), sublabel: t('bedroomFengshui.tabooWindowBehindBedDesc') },
  { key: 'windowAboveBed' as const, label: t('bedroomFengshui.tabooWindowAboveBed'), sublabel: t('bedroomFengshui.tabooWindowAboveBedDesc') },
  { key: 'bathroomWall' as const, label: t('bedroomFengshui.tabooBathroomWall'), sublabel: t('bedroomFengshui.tabooBathroomWallDesc') },
  { key: 'kitchenWall' as const, label: t('bedroomFengshui.tabooKitchenWall'), sublabel: t('bedroomFengshui.tabooKitchenWallDesc') },
  { key: 'slopedCeiling' as const, label: t('bedroomFengshui.tabooSlopedCeiling'), sublabel: t('bedroomFengshui.tabooSlopedCeilingDesc') },
])

const bedMountainLabel = computed(() => {
  if (!calcResult.value) return ''
  // bedDirection 是床头朝向（人躺卧时头部所指）
  const bedSittingDeg = (calcResult.value.bedDirection + 180) % 360
  const sitting = MOUNTAINS_24.find((x) => {
    const normalized = bedSittingDeg
    if (x.start < x.end) {
      return normalized >= x.start && normalized < x.end
    }
    return normalized >= x.start || normalized < x.end
  }) || MOUNTAINS_24[0]!
  return `${sitting.name}（${sitting.palace}）`
})

const canSubmit = computed(() => {
  return form.gender
    && form.birthDate
    && form.direction >= 0
    && form.direction <= 360
    && form.bedDirection >= 0
    && form.bedDirection <= 360
})

async function handleSubmit() {
  if (!canSubmit.value) return

  const [year, month, day] = form.birthDate.split('-').map(Number)
  if (!year || !month || !day) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/bedroom-fengshui/calc', {
      method: 'POST',
      body: {
        roomType: form.roomType,
        direction: form.direction,
        bedDirection: form.bedDirection,
        birthYear: year,
        birthMonth: month,
        birthDay: day,
        gender: form.gender,
        taboos: form.taboos,
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('bedroomFengshui.calcFail'),
      description: err.data?.message || err.message || t('bedroomFengshui.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/bedroom-fengshui/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: calcResult.value,
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
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
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) {
            if (!aiStarted.value) aiStarted.value = true
            aiContent.value += data.text
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('bedroomFengshui.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('bedroomFengshui.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  form.roomType = 'bedroom'
  form.gender = ''
  form.birthDate = ''
  form.direction = 0
  form.bedDirection = 0
  form.taboos = {
    beamOverBed: false,
    doorRushBed: false,
    mirrorFacingBed: false,
    windowBehindBed: false,
    windowAboveBed: false,
    bathroomWall: false,
    kitchenWall: false,
    slopedCeiling: false,
  }
  calendarDate.value = undefined
  selectedMountain.value = ''
  selectedBedMountain.value = ''
}

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('bedroomFengshui.resultTitle')}

${t('bedroomFengshui.genderLabel')}：${form.gender === 'male' ? t('common.male') : t('common.female')}
${t('bedroomFengshui.birthDateLabel')}：${form.birthDate}
${t('bedroomFengshui.directionLabel')}：${form.direction}° — ${calcResult.value.mountain?.name}（${calcResult.value.mountain?.palace}）
${t('bedroomFengshui.bedDirectionLabel')}：${form.bedDirection}° — ${bedMountainLabel.value}
${t('bedroomFengshui.mingGua')}：${calcResult.value.mingGua}（${calcResult.value.mingGuaNumber}） · ${calcResult.value.dongSiMing}
${t('bedroomFengshui.sitting')}：${calcResult.value.sittingMountain?.name}${calcResult.value.sittingMountain?.palace} · ${calcResult.value.dongSiZhai}

【${t('bedroomFengshui.chartTitle')}】
${calcResult.value.palaces.map(p => `${p.direction}（${p.name}）：${p.star} · ${p.level}`).join('\n')}

【${t('bedroomFengshui.bedTitle')}】
${t('bedroomFengshui.bedBest')}${calcResult.value.bed.bestDirections.join('、')}
${t('bedroomFengshui.bedAvoid')}${calcResult.value.bed.avoidDirections.join('、')}

${aiContent.value ? '【' + t('bedroomFengshui.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// 初始化时同步一次 24 山
onMounted(() => {
  updateMountainFromDirection(form.direction)
  updateBedMountainFromDirection(form.bedDirection)
})

// SEO
useSeoMeta({
  title: () => `${t('seo.bedroomFengshuiTitle')} - ${siteName.value}`,
  description: () => t('seo.bedroomFengshuiDesc'),
  keywords: () => t('seo.bedroomFengshuiKeywords'),
  ogTitle: () => `${t('seo.bedroomFengshuiOgTitle')} - ${siteName.value}`,
  ogDescription: () => t('seo.bedroomFengshuiOgDesc'),
  ogImage: () => `${siteUrl.value}/og-image.png`,
  ogType: 'website',
  ogUrl: pageUrl.value,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.bedroomFengshuiTitle')} - ${siteName.value}`,
        url: pageUrl.value,
        description: t('seo.bedroomFengshuiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('bedroomFengshui.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('seo.bedroomFengshuiOgDesc'),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
        },
      }),
    },
  ],
}))

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}
const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
}
</script>

<style scoped>
/* 截图目标固定 1080px 宽，保证报告以桌面版面导出 */
.bfs-share-target {
  width: 1080px;
}

/* 结果阶段：纸质报告需要更宽的版面 */
.bfs-result-wrap {
  max-width: 80rem;
}
</style>
