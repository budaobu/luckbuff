<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12" :class="{ 'ofs-result-wrap': phase === 'result' }">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Office Feng Shui</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('officeFengshui.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('officeFengshui.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('officeFengshui.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 房间类型选择器 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('officeFengshui.roomTypeLabel') }} <span class="text-[var(--accent)]">*</span>
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
                {{ $t('officeFengshui.genderLabel') }} <span class="text-[var(--accent)]">*</span>
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
                {{ $t('officeFengshui.birthDateLabel') }}
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
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('officeFengshui.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar
                    v-model="calendarDate"
                    color="warning"
                    class="p-2"
                  />
                </template>
              </UPopover>
              <p class="text-[11px] text-[var(--text-faint)] mt-1">{{ $t('officeFengshui.birthDateHint') }}</p>
            </div>

            <!-- 办公室朝向：角度 + 24 山双输入 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('officeFengshui.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.direction"
                  type="number"
                  :min="0"
                  :max="360"
                  :placeholder="$t('officeFengshui.directionPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                  @update:model-value="onDirectionInput"
                />
                <USelectMenu
                  v-model="selectedMountain"
                  :items="mountainOptions"
                  value-key="value"
                  :placeholder="$t('officeFengshui.mountainPlaceholder')"
                  class="w-32"
                  :ui="selectUi"
                  @update:model-value="onMountainSelect"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('officeFengshui.directionHint') }}
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

            <!-- 办公桌朝向 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('officeFengshui.deskDirectionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.deskDirection"
                  type="number"
                  :min="0"
                  :max="360"
                  :placeholder="$t('officeFengshui.deskDirectionPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                  @update:model-value="onDeskDirectionInput"
                />
                <USelectMenu
                  v-model="selectedDeskMountain"
                  :items="mountainOptions"
                  value-key="value"
                  :placeholder="$t('officeFengshui.mountainPlaceholder')"
                  class="w-32"
                  :ui="selectUi"
                  @update:model-value="onDeskMountainSelect"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('officeFengshui.deskDirectionHint') }}
              </p>

              <!-- 办公桌罗盘 -->
              <div class="mt-4 flex justify-center">
                <div
                  ref="deskCompassRef"
                  class="relative w-32 h-32 rounded-full border-2 border-[var(--border-light)] bg-[var(--surface-card)] cursor-crosshair select-none"
                  @mousedown="startDeskCompassDrag"
                  @touchstart.prevent="startDeskCompassDrag"
                  @mousemove="onDeskCompassDrag"
                  @touchmove.prevent="onDeskCompassDrag"
                  @mouseup="stopDeskCompassDrag"
                  @touchend="stopDeskCompassDrag"
                  @mouseleave="stopDeskCompassDrag"
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
                    :style="deskNeedleStyle"
                  />
                  <div class="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-purple)]" />
                </div>
              </div>
            </div>

            <!-- 办公室使用方式 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('officeFengshui.officeUsageLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="usage in officeUsageOptions"
                  :key="usage.value"
                  type="button"
                  class="py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 text-left px-4"
                  :class="form.officeUsage === usage.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.officeUsage = usage.value"
                >
                  <span class="block font-semibold">{{ usage.label }}</span>
                  <span class="block text-[10px] opacity-80 mt-0.5">{{ usage.sublabel }}</span>
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
              {{ $t('officeFengshui.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('officeFengshui.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('officeFengshui.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-building-office-2" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('officeFengshui.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('officeFengshui.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-arrows-pointing-out" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('officeFengshui.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('officeFengshui.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-currency-yen" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('officeFengshui.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('officeFengshui.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('officeFengshui.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果（纸质报告） ============ -->
      <div v-if="phase === 'result' && calcResult">
        <!-- 隐藏截图目标：完整纸质报告 -->
        <div ref="shareTargetRef" v-show="false" class="ofs-share-target">
          <OfficeFengshuiReport
            :result="calcResult"
            :ai-content="aiContent"
            :streaming="false"
            :error="null"
          />
        </div>

        <OfficeFengshuiReport
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
            {{ $t('officeFengshui.copyResult') }}
          </UButton>
          <AppShareButton
            tool="office-fengshui"
            :summary="`${calcResult.mingGua}命 · ${calcResult.mountain?.name}向 · ${form.birthDate}`"
            :share-target="shareTargetRef"
            :filename="`office-fengshui-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('officeFengshui.recalculate') }}
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
            {{ $t('officeFengshui.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { MOUNTAINS_24 } from '~/utils/bazhai'
import type { OfficeFengshuiResult, OfficeUsageType, RoomType } from '~/utils/office-fengshui'

interface CalcResult extends OfficeFengshuiResult {}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  roomType: 'office' as RoomType,
  gender: '' as 'male' | 'female' | '',
  birthDate: '' as string,
  direction: 0,
  deskDirection: 0,
  officeUsage: 'independent' as OfficeUsageType,
})
const calcResult = ref<CalcResult | null>(null)
const shareTargetRef = ref<HTMLElement>()
const toast = useToast()
const compassRef = ref<HTMLDivElement>()
const deskCompassRef = ref<HTMLDivElement>()
const dragging = ref(false)
const deskDragging = ref(false)

const config = useRuntimeConfig()
const siteName = computed(() => (config.public.siteName as string) || 'ososn')
const siteUrl = computed(() => (config.public.siteUrl as string) || 'https://www.ososn.com')
const pageUrl = computed(() => `${siteUrl.value}/tools/office-fengshui`)

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
  { value: 'office', label: t('officeFengshui.roomOffice'), sublabel: t('officeFengshui.roomOfficeDesc') },
  { value: 'study', label: t('officeFengshui.roomStudy'), sublabel: t('officeFengshui.roomStudyDesc') },
  { value: 'bedroom', label: t('officeFengshui.roomBedroom'), sublabel: t('officeFengshui.roomBedroomDesc') },
  { value: 'hall', label: t('officeFengshui.roomHall'), sublabel: t('officeFengshui.roomHallDesc') },
])

const currentRoomLabel = computed(() => {
  return roomOptions.value.find(r => r.value === form.roomType)?.label ?? ''
})

function selectRoomType(value: RoomType) {
  if (value === 'office') {
    form.roomType = value
    return
  }
  // 其它房型直接跳转到预定义的最终路由，不建中间占位页
  const routeMap: Record<Exclude<RoomType, 'office'>, string> = {
    study: '/tools/study-fengshui',
    bedroom: '/tools/bedroom-fengshui',
    hall: '/tools/hall-fengshui',
  }
  navigateTo(localePath(routeMap[value]))
}

// 24 山下拉选项
const mountainOptions = computed(() =>
  MOUNTAINS_24.map(m => ({ value: m.name, label: `${m.name}（${m.palace}）` })),
)

const selectedMountain = ref<string>('')
const selectedDeskMountain = ref<string>('')

// 方向输入变化时联动 24 山
function onDirectionInput(val: number | string | undefined) {
  const num = typeof val === 'string' ? Number(val) : val
  const deg = num === undefined || Number.isNaN(num) ? 0 : num
  form.direction = deg
  updateMountainFromDirection(deg)
}

function onDeskDirectionInput(val: number | string | undefined) {
  const num = typeof val === 'string' ? Number(val) : val
  const deg = num === undefined || Number.isNaN(num) ? 0 : num
  form.deskDirection = deg
  updateDeskMountainFromDirection(deg)
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

function updateDeskMountainFromDirection(deg: number) {
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
  selectedDeskMountain.value = nearest?.name || ''
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

function onDeskMountainSelect(val: string | undefined) {
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
  form.deskDirection = Math.round(center)
}

// 罗盘交互
const needleStyle = computed(() => ({
  transform: `rotate(${form.direction}deg) translateX(-50%)`,
}))

const deskNeedleStyle = computed(() => ({
  transform: `rotate(${form.deskDirection}deg) translateX(-50%)`,
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

function startDeskCompassDrag(e: MouseEvent | TouchEvent) {
  deskDragging.value = true
  const deg = getAngleFromEvent(e, deskCompassRef.value)
  form.deskDirection = deg
  updateDeskMountainFromDirection(deg)
}

function onDeskCompassDrag(e: MouseEvent | TouchEvent) {
  if (!deskDragging.value) return
  const deg = getAngleFromEvent(e, deskCompassRef.value)
  form.deskDirection = deg
  updateDeskMountainFromDirection(deg)
}

function stopDeskCompassDrag() {
  deskDragging.value = false
}

const officeUsageOptions = computed<{ value: OfficeUsageType; label: string; sublabel: string }[]>(() => [
  { value: 'independent', label: t('officeFengshui.officeUsageIndependent'), sublabel: t('officeFengshui.officeUsageIndependentDesc') },
  { value: 'openPlan', label: t('officeFengshui.officeUsageOpenPlan'), sublabel: t('officeFengshui.officeUsageOpenPlanDesc') },
  { value: 'shared', label: t('officeFengshui.officeUsageShared'), sublabel: t('officeFengshui.officeUsageSharedDesc') },
  { value: 'homeOffice', label: t('officeFengshui.officeUsageHomeOffice'), sublabel: t('officeFengshui.officeUsageHomeOfficeDesc') },
])

const currentOfficeUsageLabel = computed(() => {
  return officeUsageOptions.value.find(u => u.value === form.officeUsage)?.label ?? ''
})

const canSubmit = computed(() => {
  return form.gender
    && form.birthDate
    && form.direction >= 0
    && form.direction <= 360
    && form.deskDirection >= 0
    && form.deskDirection <= 360
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
    const result = await $fetch<CalcResult>('/api/tools/office-fengshui/calc', {
      method: 'POST',
      body: {
        roomType: form.roomType,
        direction: form.direction,
        deskDirection: form.deskDirection,
        birthYear: year,
        birthMonth: month,
        birthDay: day,
        gender: form.gender,
        officeUsage: form.officeUsage,
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
      title: t('officeFengshui.calcFail'),
      description: err.data?.message || err.message || t('officeFengshui.checkInput'),
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
    const response = await fetch('/api/tools/office-fengshui/reading', {
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
            aiError.value = data.message || t('officeFengshui.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('officeFengshui.aiUnavailable')
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
  form.roomType = 'office'
  form.gender = ''
  form.birthDate = ''
  form.direction = 0
  form.deskDirection = 0
  form.officeUsage = 'independent'
  calendarDate.value = undefined
  selectedMountain.value = ''
  selectedDeskMountain.value = ''
}

// 初始化时同步一次 24 山
onMounted(() => {
  updateMountainFromDirection(form.direction)
  updateDeskMountainFromDirection(form.deskDirection)
})

function handleCopy() {
  if (!calcResult.value) return
  const r = calcResult.value
  const text = `${t('officeFengshui.resultTitle')}

${t('officeFengshui.roomTypeLabel')}：${currentRoomLabel.value}
${t('officeFengshui.genderLabel')}：${form.gender === 'male' ? t('common.male') : t('common.female')}
${t('officeFengshui.birthDateLabel')}：${form.birthDate}
${t('officeFengshui.directionLabel')}：${form.direction}° — ${r.mountain?.name}（${r.mountain?.palace}）
${t('officeFengshui.deskDirectionLabel')}：${form.deskDirection}°
${t('officeFengshui.officeUsageLabel')}：${currentOfficeUsageLabel.value}
${t('officeFengshui.mingGua')}：${r.mingGua}（${r.mingGuaNumber}） · ${r.dongSiMing}
${t('officeFengshui.sitting')}：${r.sittingMountain?.name}${r.sittingMountain?.palace} · ${r.dongSiZhai}

【${t('officeFengshui.report.panTitle')}】
${r.palaces.map(p => `${p.direction}（${p.name}）：${p.star} · ${p.level}`).join('\n')}

【${t('officeFengshui.report.deskTitle')}】
${t('officeFengshui.report.dirBest')}${r.desk.bestDirections.join('、')}
${t('officeFengshui.report.dirAvoid')}${r.desk.avoidDirections.join('、')}

【${t('officeFengshui.report.seatTitle')}】
${t('officeFengshui.report.dirBest')}${r.seat.bestDirections.join('、')}
${t('officeFengshui.report.dirAvoid')}${r.seat.avoidDirections.join('、')}

【${t('officeFengshui.report.wenchangTitle')}】
${r.wenchang.map(w => `${w.type}：${w.directionName}`).join('\n')}

【${t('officeFengshui.report.wealthTitle')}】
${r.wealth.direction}方 · ${r.wealth.star}

${aiContent.value ? '【' + t('officeFengshui.interpretation') + '】\n' + aiContent.value : ''}
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
  updateDeskMountainFromDirection(form.deskDirection)
})

// SEO
useSeoMeta({
  title: () => `${t('seo.officeFengshuiTitle')} - ${siteName.value}`,
  description: () => t('seo.officeFengshuiDesc'),
  keywords: () => t('seo.officeFengshuiKeywords'),
  ogTitle: () => `${t('seo.officeFengshuiOgTitle')} - ${siteName.value}`,
  ogDescription: () => t('seo.officeFengshuiOgDesc'),
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
        name: `${t('seo.officeFengshuiTitle')} - ${siteName.value}`,
        url: pageUrl.value,
        description: t('seo.officeFengshuiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('officeFengshui.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('seo.officeFengshuiOgDesc'),
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
.ofs-share-target {
  width: 1080px;
}

/* 结果阶段：纸质报告需要更宽的版面 */
.ofs-result-wrap {
  max-width: 80rem;
}
</style>
