<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Liuyao World Cup 2026</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
            {{ $t('liuyao.title') }}
          </h1>
          <p class="text-sm text-[#e8e0d0]/40 mt-2">
            {{ $t('liuyao.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
        </div>

        <!-- 赛事选择器卡片 -->
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden mb-5">
          <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />
          <div class="p-6">
            <LiuyaoTournamentPicker
              :groups="teamsData.groups || {}"
              :bracket="bracketData"
              @update="handleSubjectUpdate"
            />
          </div>
        </div>

        <!-- 摇卦工作台卡片 -->
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden mb-5">
          <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />
          <div class="p-6">
            <LiuyaoTossWorkbench
              ref="tossWorkbenchRef"
              @update="handleLineValuesUpdate"
            />
          </div>
        </div>

        <!-- 起卦按钮 -->
        <UButton
          color="warning"
          size="lg"
          block
          :disabled="!canSubmit"
          class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
          @click="handleSubmit"
        >
          <template #leading>
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
          </template>
          {{ $t('liuyao.castingBtn') }}
        </UButton>

        <p v-if="!canSubmit" class="text-center text-[10px] text-[#e8e0d0]/25 mt-2">
          {{ submitHint }}
        </p>

        <!-- 错误卡片：物理层熔断 -->
        <div
          v-if="errorInfo"
          class="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-red-400" />
            <span class="text-sm font-semibold text-red-400">{{ $t('liuyao.physicalBlowout') }}</span>
          </div>
          <p class="text-xs text-[#e8e0d0]/50">{{ errorInfo.message }}</p>
          <p class="text-[10px] text-[#e8e0d0]/25 mt-1 font-mono">code: {{ errorInfo.code }}</p>
        </div>

        <!-- 免责声明 -->
        <p class="text-center text-[10px] text-[#e8e0d0]/20 mt-6 leading-relaxed">
          {{ $t('liuyao.disclaimer') }}
        </p>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <LiuyaoCoinSpin size="full" :label="$t('liuyao.calculating')" />
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && liuYaoResult">
        <div ref="shareTargetRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
              {{ $t('liuyao.resultTitle') }}
            </h1>
            <div class="flex items-center gap-3 mt-3">
              <span class="text-base">{{ getFlag(subject.home!.id) }}</span>
              <span class="text-sm text-[#f5e6c0]">{{ getTeamName(subject.home!.id, subject.home!.name) }}</span>
              <span class="text-xs text-[#e8e0d0]/30">VS</span>
              <span class="text-sm text-[#f5e6c0]">{{ getTeamName(subject.away!.id, subject.away!.name) }}</span>
              <span class="text-base">{{ getFlag(subject.away!.id) }}</span>
            </div>
            <div class="w-12 h-px bg-[#c9a227]/30 mt-4" />
          </div>

          <!-- 时空信息 -->
          <div v-if="liuYaoResult.temporal_context" class="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[#f5e6c0] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[#c9a227]/60" />
              {{ $t('liuyaoPage.temporalParams') }}
            </h3>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="rounded-lg bg-white/[0.02] p-3">
                <span class="text-[#e8e0d0]/30 block mb-1">{{ $t('liuyaoPage.yueJian') }}</span>
                <span class="text-[#f5e6c0] font-medium">{{ liuYaoResult.temporal_context.月建 }}</span>
              </div>
              <div class="rounded-lg bg-white/[0.02] p-3">
                <span class="text-[#e8e0d0]/30 block mb-1">{{ $t('liuyaoPage.riChen') }}</span>
                <span class="text-[#f5e6c0] font-medium">{{ liuYaoResult.temporal_context.日辰 }}</span>
              </div>
              <div class="rounded-lg bg-white/[0.02] p-3">
                <span class="text-[#e8e0d0]/30 block mb-1">{{ $t('liuyaoPage.shiChen') }}</span>
                <span class="text-[#f5e6c0] font-medium">{{ liuYaoResult.temporal_context.时辰 }}</span>
              </div>
              <div class="rounded-lg bg-white/[0.02] p-3">
                <span class="text-[#e8e0d0]/30 block mb-1">{{ $t('liuyaoPage.xunKong') }}</span>
                <span class="text-[#f5e6c0] font-medium">{{ liuYaoResult.temporal_context.旬空 }}</span>
              </div>
            </div>
          </div>

          <!-- 卦象信息 -->
          <div v-if="liuYaoResult.hexagram" class="grid grid-cols-3 gap-3 mb-5">
            <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p class="text-[10px] text-[#e8e0d0]/40 mb-1.5">{{ $t('liuyaoPage.benGua') }}</p>
              <p class="text-lg font-bold text-[#f5e6c0]">{{ liuYaoResult.hexagram.本卦 }}</p>
              <p class="text-[10px] text-[#c9a227]/60 mt-1">{{ $t('liuyaoPage.shiYing', { shi: liuYaoResult.hexagram.世爻位, ying: liuYaoResult.hexagram.应爻位 }) }}</p>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p class="text-[10px] text-[#e8e0d0]/40 mb-1.5">{{ $t('liuyaoPage.bianGua') }}</p>
              <p class="text-lg font-bold text-[#f5e6c0]">{{ liuYaoResult.hexagram.变卦 }}</p>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p class="text-[10px] text-[#e8e0d0]/40 mb-1.5">{{ $t('liuyaoPage.huGua') }}</p>
              <p class="text-lg font-bold text-[#f5e6c0]">{{ liuYaoResult.hexagram.互卦 }}</p>
            </div>
          </div>

          <!-- 爻象展示 -->
          <div v-if="liuYaoResult.lines_top_down" class="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[#f5e6c0] mb-3">{{ $t('liuyao.chartTitle') }}</h3>
            <div class="space-y-1.5">
              <div
                v-for="(line, index) in liuYaoResult.lines_top_down"
                :key="index"
                class="flex items-center gap-3 rounded-xl border px-3 py-2"
                :class="line.isMoving ? 'border-l-2 border-l-[#c9a227]/40 bg-white/[0.02]' : 'border-white/[0.06] bg-white/[0.01]'"
              >
                <span class="text-[10px] text-[#e8e0d0]/30 w-8 text-center">{{ line.label }}</span>
                <!-- 铜钱可视化 -->
                <div class="flex-1 flex items-center justify-center">
                  <div class="flex items-center gap-1.5">
                    <LiuyaoCopperCoin
                      v-for="(coin, ci) in inferCoins(line.value)"
                      :key="ci"
                      :is-back="coin.isBack"
                      :size="30"
                    />
                    <span class="text-xs text-[#e8e0d0]/30 ml-1">={{ line.value }}</span>
                  </div>
                </div>
                <span class="text-sm font-bold w-8 text-center" :class="line.isMoving ? 'text-[#c9a227]' : 'text-[#e8e0d0]/50'">
                  {{ line.value }}
                </span>
                <span v-if="line.isMoving" class="text-[10px] text-[#c9a227]/60">
                  {{ line.value === 6 ? '○' : '●' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 断语 -->
        <div ref="aiInterpretationRef" class="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 mb-5">
          <LiuyaoAiInterpretation
            :content="aiStream.content.value"
            :streaming="aiStream.streaming.value"
            :started="aiStream.started.value"
            :error="aiStream.error.value"
            :home-label="subject.home ? `${getTeamName(subject.home.id, subject.home.name)} ${$t('liuyaoPage.homeWinSuffix')}` : $t('matchProbability.homeDefault')"
            :away-label="subject.away ? `${getTeamName(subject.away.id, subject.away.name)} ${$t('liuyaoPage.awayWinSuffix')}` : $t('matchProbability.awayDefault')"
          />

          <!-- 重新解读按钮 -->
          <div v-if="!aiStream.streaming.value && (aiStream.content.value || aiStream.error.value)" class="flex justify-center mt-4">
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              class="group/btn"
              @click="startAiStream"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('liuyaoPage.reinterpretBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleShare"
          >
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoPage.shareBtn') }}
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoPage.restartBtn') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[#e8e0d0]/50 hover:text-[#e8e0d0]/80 hover:bg-white/5"
            @click="navigateTo('/tools')"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoPage.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- ============ 时空拦截弹窗 ============ -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showTimeGuard"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="dismissTimeGuard"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-white/[0.08] bg-[#1a1612] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[#f5e6c0]">{{ $t('liuyaoPage.timeGuardTitle') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                class="text-[#e8e0d0]/30 hover:text-[#e8e0d0]/60"
                @click="dismissTimeGuard"
              />
            </div>
            <div class="p-5 space-y-4">
              <p class="text-sm text-[#e8e0d0]/70 leading-relaxed" v-html="unescapeHtml($t('liuyaoPage.timeGuardDesc'))" />

              <!-- 城市未识别的错误提示 -->
              <div v-if="cityNotRecognized" class="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p class="text-xs text-red-400/90 leading-relaxed">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  {{ cityNotRecognized }}
                </p>
              </div>

              <div class="space-y-3">
                <UButton
                  color="warning"
                  variant="soft"
                  block
                  :loading="geo.loading"
                  @click="requestGeoAndSubmit"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                  </template>
                  {{ geo.loading ? $t('liuyaoPage.gettingLocation') : $t('liuyaoPage.getLocation') }}
                </UButton>

                <!-- 定位失败时提示手动输入 -->
                <p v-if="geoError" class="text-xs text-[#e8e0d0]/40 -mt-1 text-center">
                  {{ $t('liuyaoPage.locationUnavailable') }} ↓
                </p>

                <div class="flex items-center gap-2">
                  <div class="flex-1 h-px bg-white/5" />
                  <span class="text-[10px] text-[#e8e0d0]/20">{{ $t('liuyaoPage.or') }}</span>
                  <div class="flex-1 h-px bg-white/5" />
                </div>

                <div class="flex gap-2">
                  <UInput
                    ref="cityInputRef"
                    v-model="manualCity"
                    :placeholder="$t('liuyaoPage.cityInputPlaceholder')"
                    class="flex-1"
                    @keyup.enter="submitWithCity"
                    :ui="{ base: 'bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25' }"
                  />
                  <UButton
                    color="warning"
                    variant="soft"
                    :disabled="!manualCity.trim()"
                    :loading="citySubmitting"
                    @click="submitWithCity"
                  >
                    {{ $t('liuyaoPage.confirm') }}
                  </UButton>
                </div>
              </div>

              <p v-if="geo.error && !geoError" class="text-xs text-red-400/70">
                {{ geo.error }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-white/[0.08] bg-[#1a1612] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[#f5e6c0]">{{ $t('liuyaoPage.shareTitle') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[#e8e0d0]/40 hover:text-[#e8e0d0]/80 hover:bg-white/5"
                @click="shareDialogOpen = false"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[#e8e0d0]/40 mb-1.5 tracking-wide">{{ $t('liuyaoPage.shareTextLabel') }}</p>
                <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-sm text-[#e8e0d0]/80 leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('liuyaoPage.copyTextBtn') }}
                </UButton>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[#e8e0d0]/40 mb-1.5 tracking-wide">{{ $t('liuyaoPage.shareScreenshotLabel') }}</p>
                <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('liuyaoPage.screenshotAlt')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('liuyaoPage.downloadImageBtn') }}
                </UButton>
              </div>
              <div v-else class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[#e8e0d0]/20 mx-auto mb-2" />
                <p class="text-xs text-[#e8e0d0]/40">{{ $t('liuyaoPage.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>
            <div class="px-5 py-3 border-t border-white/[0.06] text-center">
              <p class="text-[10px] text-[#e8e0d0]/30">{{ $t('liuyaoPage.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { WorldCupTeam, LineValue, LiuYaoResult } from '~/types/liuyao'

const { t } = useI18n()
const { locale } = useI18n()
const { build: buildLiuYaoPrompt } = useLiuYaoPrompt()
const aiStream = useAiStream()

// ============================================================
// 数据加载
// ============================================================
import teamsData from '~/data/teams.json'
import bracketData from '~/data/bracket.json'

// ============================================================
// 状态
// ============================================================
const phase = ref<'form' | 'animating' | 'result'>('form')

const subject = reactive<{ home: WorldCupTeam | null; away: WorldCupTeam | null }>({
  home: null,
  away: null,
})

const lineValues = ref<LineValue[]>([])
const tossWorkbenchRef = ref()

const { location: geo, requestLocation, setCity, resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()
const showTimeGuard = ref(false)
const manualCity = ref('')
const pendingSubmit = ref(false)
const cityNotRecognized = ref('')
const citySubmitting = ref(false)
const geoError = ref(false)
const cityInputRef = ref()

// 排盘结果
const liuYaoResult = ref<LiuYaoResult | null>(null)
const errorInfo = ref<{ code: string; message: string } | null>(null)
const toast = useToast()

// 分享
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLDivElement>()
const aiInterpretationRef = ref<HTMLDivElement>()

// ============================================================
// 计算属性
// ============================================================
const canSubmit = computed(() => {
  return subject.home !== null && subject.away !== null && lineValues.value.length === 6
})

const submitHint = computed(() => {
  if (!subject.home || !subject.away) return t('liuyaoPage.needSelectMatch')
  if (lineValues.value.length < 6) return t('liuyaoPage.needMoreTosses', { n: 6 - lineValues.value.length })
  return ''
})

// ============================================================
// 子时边界检测
// ============================================================
function isZiHourBoundary(date: Date = new Date()): boolean {
  const h = date.getHours()
  const m = date.getMinutes()
  const totalMinutes = h * 60 + m
  // 22:30 = 1350 分钟, 01:30 = 90 分钟
  return totalMinutes >= 1350 || totalMinutes <= 90
}

function hasLocation(): boolean {
  return !!(geo.longitude && geo.latitude) || !!geo.city
}

// ============================================================
// 事件处理
// ============================================================
function handleSubjectUpdate(val: { home: WorldCupTeam | null; away: WorldCupTeam | null }) {
  subject.home = val.home
  subject.away = val.away
}

function handleLineValuesUpdate(values: LineValue[]) {
  lineValues.value = values
}

async function handleSubmit() {
  if (!canSubmit.value) return

  // 子时边界拦截
  if (isZiHourBoundary() && !hasLocation()) {
    showTimeGuard.value = true
    pendingSubmit.value = true
    return
  }

  await doPredict()
}

async function requestGeoAndSubmit() {
  geoError.value = false
  const ok = await requestLocation()
  if (ok && pendingSubmit.value) {
    showTimeGuard.value = false
    await doPredict()
  } else if (!ok) {
    // 定位失败，引导用户使用手动输入
    geoError.value = true
    nextTick(() => {
      // 聚焦到城市输入框
      cityInputRef.value?.$el?.querySelector('input')?.focus()
    })
  }
}

async function submitWithCity() {
  if (!manualCity.value.trim()) return
  citySubmitting.value = true
  cityNotRecognized.value = ''

  setCity(manualCity.value.trim())

  showTimeGuard.value = false
  if (pendingSubmit.value) {
    await doPredict()
  }
  citySubmitting.value = false
}

function dismissTimeGuard() {
  showTimeGuard.value = false
  pendingSubmit.value = false
  cityNotRecognized.value = ''
}

async function doPredict() {
  phase.value = 'animating'
  errorInfo.value = null

  try {
    const payload = {
      line_values: lineValues.value,
      cast_datetime: new Date().toISOString(),
      location: geo.longitude ? {
        longitude: geo.longitude,
        latitude: geo.latitude,
        timezone: geo.timezone,
        city: geo.city,
      } : {
        city: geo.city || undefined,
        timezone: geo.timezone,
      },
      subject_home: subject.home?.id,
      subject_away: subject.away?.id,
    }

    const result = await $fetch<LiuYaoResult>('/api/liu-yao/predict', {
      method: 'POST',
      body: payload,
    })

    liuYaoResult.value = result

    // Status 三路分流
    if (result.status === 'ok') {
      phase.value = 'result'
      // 延迟启动 AI 解读，让页面先渲染
      setTimeout(() => startAiStream(), 300)
    } else if (result.status === 'system_pause') {
      phase.value = 'form'
      if (result.error_code === 'CITY_NOT_RECOGNIZED') {
        // 城市名无法解析为经纬度，重新打开弹窗并显示具体错误
        showTimeGuard.value = true
        cityNotRecognized.value = result.message || t('liuyaoPage.cityNotRecognizedMsg')
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoPage.cityNotRecognized'),
          description: result.message || t('liuyaoPage.cityNotRecognizedDesc'),
          color: 'warning',
        })
      } else {
        // 其他 system_pause（如 ZI_HOUR_BOUNDARY_UNCALIBRATED）
        showTimeGuard.value = true
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoPage.timeGuardIntercept'),
          description: result.error_code || t('liuyaoPage.timeGuardInterceptDesc'),
          color: 'warning',
        })
      }
    } else if (result.status === 'fatal_error') {
      phase.value = 'form'
      errorInfo.value = {
        code: result.error_code || 'UNKNOWN',
        message: t('liuyaoPage.physicalBlowoutMsg'),
      }
      toast.add({
        title: t('liuyaoPage.chartFailMsg'),
        description: result.error_code || t('liuyaoPage.unknownErrorMsg'),
        color: 'error',
      })
    }
  } catch (err: any) {
    phase.value = 'form'
    errorInfo.value = {
      code: err.data?.error_code || 'NETWORK_ERROR',
      message: err.data?.message || err.message || t('liuyaoPage.requestFailMsg'),
    }
    toast.add({
      title: t('liuyaoPage.requestFailMsg'),
      description: errorInfo.value.message,
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!liuYaoResult.value) return
  aiStream.reset()
  await nextTick()

  const { systemPrompt, userPrompt } = buildLiuYaoPrompt(
    liuYaoResult.value,
    subject.home,
    subject.away,
    locale.value,
  )
  await aiStream.startStream(userPrompt, systemPrompt, true)
}

function resetForm() {
  phase.value = 'form'
  subject.home = null
  subject.away = null
  lineValues.value = []
  liuYaoResult.value = null
  errorInfo.value = null
  aiStream.reset()
  tossWorkbenchRef.value?.reset()
  pendingSubmit.value = false
  manualCity.value = ''
}

async function handleShare() {
  if (!liuYaoResult.value || !subject.home || !subject.away) return
  const { share } = useShare()

  const summary = liuYaoResult.value.hexagram
    ? `${liuYaoResult.value.hexagram.本卦} vs ${liuYaoResult.value.hexagram.变卦}`
    : ''

  try {
    // 优先截取 AI 断语卡片，若 AI 尚未输出则回退到完整结果区域
    const target = (aiStream.content.value && aiInterpretationRef.value)
      ? aiInterpretationRef.value
      : shareTargetRef.value

    const result = await share({
      tool: 'liuyao',
      name: '',
      summary,
      shareTarget: target,
      filename: `liuyao-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('liuyaoPage.shareFailMsg'),
      description: e?.message || t('liuyaoPage.shareErrorMsg'),
      color: 'error',
    })
  }
}

async function copyShareText() {
  if (!shareData.value?.copyText) return
  try {
    await navigator.clipboard.writeText(shareData.value.copyText)
    toast.add({ title: t('liuyaoPage.copySuccessMsg'), color: 'success' })
  } catch {
    toast.add({ title: t('liuyaoPage.copyFailMsg'), color: 'error' })
  }
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const link = document.createElement('a')
  link.href = shareData.value.screenshotDataUrl
  link.download = shareData.value.filename
  link.click()
}

// 国旗映射
const FLAG_MAP: Record<string, string> = {
  MEX: '🇲🇽', RSA: '🇿🇦', KOR: '🇰🇷', CZE: '🇨🇿',
  CAN: '🇨🇦', BIH: '🇧🇦', QAT: '🇶🇦', SUI: '🇨🇭',
  BRA: '🇧🇷', MAR: '🇲🇦', HAI: '🇭🇹', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA: '🇺🇸', PAR: '🇵🇾', AUS: '🇦🇺', TUR: '🇹🇷',
  GER: '🇩🇪', CUW: '🇨🇼', CIV: '🇨🇮', ECU: '🇪🇨',
  NED: '🇳🇱', JPN: '🇯🇵', SWE: '🇸🇪', TUN: '🇹🇳',
  BEL: '🇧🇪', EGY: '🇪🇬', IRN: '🇮🇷', NZL: '🇳🇿',
  ESP: '🇪🇸', CPV: '🇨🇻', KSA: '🇸🇦', URU: '🇺🇾',
  FRA: '🇫🇷', SEN: '🇸🇳', NOR: '🇳🇴', IRQ: '🇮🇶',
  ARG: '🇦🇷', ALG: '🇩🇿', AUT: '🇦🇹', JOR: '🇯🇴',
  POR: '🇵🇹', COD: '🇨🇩', UZB: '🇺🇿', COL: '🇨🇴',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', CRO: '🇭🇷', GHA: '🇬🇭', PAN: '🇵🇦',
}

function getFlag(id: string): string {
  return FLAG_MAP[id] || '🏳️'
}

function unescapeHtml(str: string): string {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

function getTeamName(id: string, fallbackName: string): string {
  const key = `teams.${id}`
  const translated = t(key)
  return translated === key ? fallbackName : translated
}

function isYin(val: number): boolean {
  return val === 6 || val === 8
}

// 根据爻值推断 3 枚铜钱正反面
// 6=3字(2+2+2) 7=2字1背(2+2+3) 8=1字2背(2+3+3) 9=3背(3+3+3)
function inferCoins(value: number): Array<{ isBack: boolean }> {
  switch (value) {
    case 6: return [{ isBack: false }, { isBack: false }, { isBack: false }]
    case 7: return [{ isBack: false }, { isBack: false }, { isBack: true }]
    case 8: return [{ isBack: false }, { isBack: true }, { isBack: true }]
    case 9: return [{ isBack: true }, { isBack: true }, { isBack: true }]
    default: return [{ isBack: false }, { isBack: false }, { isBack: false }]
  }
}

// ============================================================
// SEO
// ============================================================
const pageDescription = computed(() => {
  if (phase.value === 'result' && subject.home && subject.away && liuYaoResult.value?.hexagram) {
    return t('liuyao.shareText', {
      home: subject.home.name,
      away: subject.away.name,
      benGua: liuYaoResult.value.hexagram.本卦,
      bianGua: liuYaoResult.value.hexagram.变卦,
    })
  }
  return t('liuyao.shareTextDefault')
})

useSeoMeta({
  title: t('liuyao.seoTitle'),
  titleTemplate: '%s',
  description: pageDescription,
  ogTitle: t('liuyao.seoOgTitle'),
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liu-yao',
  twitterCard: 'summary_large_image',
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
