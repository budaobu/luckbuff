<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12" :class="{ 'fso-result-wrap': phase === 'result' }">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Feng Shui Ornaments</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('fengshuiOrnament.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('fengshuiOrnament.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('fengshuiOrnament.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 房间类型 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.roomTypeLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <RoomTypeSelector v-model="form.roomType" />
            </div>

            <!-- 房间朝向角度 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.direction"
                type="number"
                :min="0"
                :max="360"
                :placeholder="$t('fengshuiOrnament.directionPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.directionHint') }}
              </p>
              <FengshuiCompassInput v-model="form.direction" />
            </div>

            <!-- 建成/装修年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.yearLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.year"
                type="number"
                :min="1900"
                :max="2100"
                :placeholder="$t('fengshuiOrnament.yearPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.yearHint') }}
              </p>
            </div>

            <!-- 房间长宽 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.sizeLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.lengthM"
                  type="number"
                  :min="1"
                  :max="100"
                  step="0.1"
                  :placeholder="$t('fengshuiOrnament.lengthPlaceholder')"
                  class="flex-1"
                  :ui="inputUi"
                />
                <span class="text-[var(--text-faint)]">×</span>
                <UInput
                  v-model.number="form.widthM"
                  type="number"
                  :min="1"
                  :max="100"
                  step="0.1"
                  :placeholder="$t('fengshuiOrnament.widthPlaceholder')"
                  class="flex-1"
                  :ui="inputUi"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.sizeHint') }}
              </p>
            </div>

            <!-- 门的大致方位 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.doorLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="dir in eightDirections"
                  :key="dir"
                  type="button"
                  class="py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.doorDirection === dir
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.doorDirection = dir"
                >
                  {{ t(`fengshuiOrnament.directions.${directionKey(dir)}`) }}
                </button>
              </div>
            </div>

            <!-- 缺角/凸出标注（可选） -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.irregularLabel') }}
                <span class="text-[var(--text-faint)]">（{{ $t('common.optional') }}）</span>
              </label>
              <div class="grid grid-cols-4 gap-2">
                <div
                  v-for="dir in eightDirections"
                  :key="dir"
                  class="rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] p-2 text-center"
                >
                  <div class="text-xs text-[var(--text-muted)] mb-1.5">
                    {{ t(`fengshuiOrnament.directions.${directionKey(dir)}`) }}
                  </div>
                  <div class="flex gap-1 justify-center">
                    <button
                      type="button"
                      class="px-1.5 py-0.5 rounded text-[10px] border transition-all duration-200"
                      :class="irregularType(dir) === 'missing'
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                        : 'border-[var(--border-light)] text-[var(--text-faint)] hover:border-[var(--border-medium)]'"
                      @click="toggleIrregular(dir, 'missing')"
                    >
                      {{ $t('fengshuiOrnament.irregularMissing') }}
                    </button>
                    <button
                      type="button"
                      class="px-1.5 py-0.5 rounded text-[10px] border transition-all duration-200"
                      :class="irregularType(dir) === 'protruding'
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                        : 'border-[var(--border-light)] text-[var(--text-faint)] hover:border-[var(--border-medium)]'"
                      @click="toggleIrregular(dir, 'protruding')"
                    >
                      {{ $t('fengshuiOrnament.irregularProtruding') }}
                    </button>
                  </div>
                </div>
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.irregularHint') }}
              </p>
            </div>

            <!-- 使用者列表 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.usersLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="space-y-3">
                <div
                  v-for="(user, idx) in form.users"
                  :key="idx"
                  class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-input)] p-4 space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-[var(--text-muted)]">
                      {{ $t('fengshuiOrnament.userTitle', { index: idx + 1 }) }}
                    </span>
                    <button
                      v-if="form.users.length > 1"
                      type="button"
                      class="text-[var(--text-faint)] hover:text-red-400 transition-colors"
                      @click="form.users.splice(idx, 1)"
                    >
                      <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <UInput
                      v-model="user.nickname"
                      :placeholder="$t('fengshuiOrnament.nicknamePlaceholder')"
                      :ui="inputUi"
                    />
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                        :class="user.gender === 'male'
                          ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                          : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                        @click="user.gender = 'male'"
                      >
                        {{ $t('common.male') }}
                      </button>
                      <button
                        type="button"
                        class="flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                        :class="user.gender === 'female'
                          ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                          : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                        @click="user.gender = 'female'"
                      >
                        {{ $t('common.female') }}
                      </button>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs text-[var(--text-muted)]">
                      {{ $t('fengshuiOrnament.birthLabel') }}
                    </label>
                    <div class="grid grid-cols-4 gap-2">
                      <UInput
                        v-model.number="user.birthYear"
                        type="number"
                        :min="1900"
                        :max="2100"
                        :placeholder="$t('fengshuiOrnament.birthYearPlaceholder')"
                        :ui="inputUi"
                      />
                      <UInput
                        v-model.number="user.birthMonth"
                        type="number"
                        :min="1"
                        :max="12"
                        :placeholder="$t('fengshuiOrnament.birthMonthPlaceholder')"
                        :ui="inputUi"
                      />
                      <UInput
                        v-model.number="user.birthDay"
                        type="number"
                        :min="1"
                        :max="31"
                        :placeholder="$t('fengshuiOrnament.birthDayPlaceholder')"
                        :ui="inputUi"
                      />
                      <UInput
                        v-model.number="user.birthHour"
                        type="number"
                        :min="0"
                        :max="23"
                        :placeholder="$t('fengshuiOrnament.birthHourPlaceholder')"
                        :ui="inputUi"
                      />
                    </div>
                    <p class="text-[11px] text-[var(--text-faint)]">
                      {{ $t('fengshuiOrnament.birthHint') }}
                    </p>
                  </div>
                </div>
              </div>
              <UButton
                v-if="form.users.length < 6"
                color="neutral"
                variant="soft"
                size="sm"
                class="mt-3"
                @click="addUser"
              >
                <template #leading>
                  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                </template>
                {{ $t('fengshuiOrnament.addUser') }}
              </UButton>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.usersHint') }}
              </p>
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
              {{ $t('fengshuiOrnament.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-gift" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('fengshuiOrnament.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果（纸质报告） ============ -->
      <div v-if="phase === 'result' && calcResult">
        <!-- 隐藏截图目标：完整纸质报告（固定宽度，供分享出图） -->
        <div ref="shareTargetRef" v-show="false" class="fso-share-target">
          <FengshuiOrnamentReport
            :result="calcResult"
            :ai-content="aiContent"
            :streaming="false"
            :error="null"
          />
        </div>

        <!-- 可见交互版报告 -->
        <FengshuiOrnamentReport
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
            @click="handleShare"
          >
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('common.shareResult') }}
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
            {{ $t('fengshuiOrnament.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/fengshui') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('fengshuiOrnament.backToTopic') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
                @click="() => { shareDialogOpen = false }"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>

            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.copyText') }}
                </UButton>
              </div>

              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.shareScreenshot') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('share.shareScreenshot')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.downloadImage') }}
                </UButton>
              </div>

              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('share.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>

            <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('share.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Direction } from '~/utils/bazhai'
import type { ElementGap } from '~/utils/ornament-rules'

type YouXingKey = 'shengqi' | 'tianyi' | 'yannian' | 'fuwei' | 'wugui' | 'liusha' | 'huohai' | 'jueming'

interface EnvironmentPalace {
  direction: Direction | '中宫'
  mountainStar: number
  facingStar: number
  periodStar: number
  yearStar: number
  isTaiSui: boolean
  isWuHuang: boolean
  isSanSha: boolean
  isAnJianSha: boolean
  isDoor: boolean
  hasIrregularCorner: boolean
  elementGap: ElementGap
  gapReasons: string[]
}

interface PerPersonResult {
  nickname: string
  gender: 'male' | 'female'
  mingGua: string
  mingGuaNumber: number
  dongSiMing: string
  dayGan: string
  yearZhi: string
  baguaAssignment: Partial<Record<Direction, YouXingKey>>
  roomFacingStar: { direction: Direction; star: string; auspicious: boolean }
  matchedPositions: { wenchang: boolean; taohua: boolean; guiren: boolean }
  wenchangDirection: Direction | null
  taohuaDirection: Direction | null
  guirenDirections: Direction[]
}

interface CalcResult {
  roomType: string
  direction: number
  year: number
  roomGeometry: {
    lengthM: number
    widthM: number
    doorDirection: Direction
    sectorNote: string
    irregular?: Array<{ direction: Direction; type: 'missing' | 'protruding' }>
  }
  xuankong: {
    period: { number: number; name: string; startYear: number; endYear: number }
    sittingLabel: string
    facingLabel: string
    pattern: { key: string; name: string; description: string } | null
    warning: string | null
  }
  liunian: {
    ganzhiYear: string
    yearCenter: number
    taiSuiDirection: Direction
    suiPoDirection: Direction
    sanShaDirection: Direction
  }
  environment: { palaces: EnvironmentPalace[] }
  perPerson: PerPersonResult[]
  locale: string
}

interface UserForm {
  nickname: string
  birthYear: number | undefined
  birthMonth: number | undefined
  birthDay: number | undefined
  birthHour: number | undefined
  gender: 'male' | 'female'
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const calcResult = ref<CalcResult | null>(null)
const toast = useToast()

// 分享弹窗
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

const eightDirections: Direction[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

const DIR_TO_SPOT: Record<Direction, string> = {
  北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw',
}
const SPOT_TO_DIR: Record<string, Direction> = {
  n: '北', ne: '东北', e: '东', se: '东南', s: '南', sw: '西南', w: '西', nw: '西北',
}

function emptyUser(): UserForm {
  return {
    nickname: '',
    birthYear: undefined,
    birthMonth: undefined,
    birthDay: undefined,
    birthHour: undefined,
    gender: 'male',
  }
}

const form = reactive({
  roomType: 'bedroom',
  direction: undefined as number | undefined,
  year: undefined as number | undefined,
  lengthM: undefined as number | undefined,
  widthM: undefined as number | undefined,
  doorDirection: '东南' as Direction,
  irregular: [] as Array<{ spot: string; type: 'missing' | 'protruding' }>,
  users: [emptyUser()] as UserForm[],
})

// ---- 本地持久化（本工具独立命名空间，不与其他工具互通）----
const STORAGE_KEY = 'fengshui-ornament-form'

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved && typeof saved === 'object') {
      if (typeof saved.roomType === 'string') form.roomType = saved.roomType
      if (typeof saved.direction === 'number') form.direction = saved.direction
      if (typeof saved.year === 'number') form.year = saved.year
      if (typeof saved.lengthM === 'number') form.lengthM = saved.lengthM
      if (typeof saved.widthM === 'number') form.widthM = saved.widthM
      if (typeof saved.doorDirection === 'string' && eightDirections.includes(saved.doorDirection)) {
        form.doorDirection = saved.doorDirection
      }
      if (Array.isArray(saved.irregular)) form.irregular = saved.irregular
      if (Array.isArray(saved.users) && saved.users.length > 0) {
        form.users = saved.users.map((u: Partial<UserForm>) => ({ ...emptyUser(), ...u }))
      }
    }
  } catch {
    // 本地存储损坏时忽略，使用默认表单
  }
})

watch(form, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch {
    // 存储失败不影响使用
  }
}, { deep: true })

function addUser() {
  if (form.users.length < 6) form.users.push(emptyUser())
}

function irregularType(dir: Direction): 'missing' | 'protruding' | null {
  return form.irregular.find(r => r.spot === DIR_TO_SPOT[dir])?.type ?? null
}

function toggleIrregular(dir: Direction, type: 'missing' | 'protruding') {
  const spot = DIR_TO_SPOT[dir]
  const idx = form.irregular.findIndex(r => r.spot === spot)
  if (idx >= 0 && form.irregular[idx]!.type === type) {
    form.irregular.splice(idx, 1)
  } else if (idx >= 0) {
    form.irregular[idx]!.type = type
  } else {
    form.irregular.push({ spot, type })
  }
}

const canSubmit = computed(() => {
  const baseOk = form.direction !== undefined && form.direction >= 0 && form.direction <= 360
    && form.year !== undefined && form.year >= 1900 && form.year <= 2100
    && form.lengthM !== undefined && form.lengthM > 0
    && form.widthM !== undefined && form.widthM > 0
  if (!baseOk) return false
  return form.users.every(u =>
    u.birthYear !== undefined && u.birthYear >= 1900 && u.birthYear <= 2100
    && u.birthMonth !== undefined && u.birthMonth >= 1 && u.birthMonth <= 12
    && u.birthDay !== undefined && u.birthDay >= 1 && u.birthDay <= 31)
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/fengshui-ornament/calc', {
      method: 'POST',
      body: {
        roomType: form.roomType,
        direction: form.direction,
        year: form.year,
        lengthM: form.lengthM,
        widthM: form.widthM,
        doorDirection: form.doorDirection,
        irregular: form.irregular,
        users: form.users.map((u, idx) => ({
          nickname: u.nickname.trim() || `${t('fengshuiOrnament.defaultNickname')}${idx + 1}`,
          birthYear: u.birthYear,
          birthMonth: u.birthMonth,
          birthDay: u.birthDay,
          birthHour: u.birthHour ?? null,
          gender: u.gender,
        })),
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('fengshuiOrnament.calcFail'),
      description: err.data?.message || err.message || t('fengshuiOrnament.checkInput'),
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
    const response = await fetch('/api/tools/fengshui-ornament/reading', {
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
          } else if (data.type === 'error') {
            aiError.value = data.message || t('fengshuiOrnament.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('fengshuiOrnament.aiUnavailable')
  } finally {
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
}

function directionKey(dir: string): string {
  const map: Record<string, string> = {
    北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw', 中宫: 'center',
  }
  return map[dir] || 'center'
}

// ---- 分享：对完整纸质报告组件截图 ----
const { share } = useShare()

async function handleShare() {
  if (!calcResult.value) return
  try {
    const result = await share({
      tool: 'fengshui-ornament',
      summary: `${calcResult.value.xuankong.sittingLabel}${calcResult.value.xuankong.facingLabel} · ${calcResult.value.xuankong.period.name}`,
      shareTarget: shareTargetRef.value,
      filename: `fengshui-ornament-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.shareFail'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

function copyShareText() {
  if (!shareData.value) return
  navigator.clipboard.writeText(shareData.value.copyText).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const a = document.createElement('a')
  a.href = shareData.value.screenshotDataUrl
  a.download = shareData.value.filename
  a.click()
  toast.add({ title: t('share.downloadSuccess'), color: 'success' })
}

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const config = useRuntimeConfig()
const siteName = config.public.siteName as string
const siteUrl = (config.public.siteUrl as string) || 'https://www.ososn.com'

useSeoMeta({
  title: () => `${t('seo.fengshuiOrnamentTitle')} - ${siteName}`,
  description: t('seo.fengshuiOrnamentDesc'),
  keywords: t('seo.fengshuiOrnamentKeywords'),
  ogTitle: () => `${t('seo.fengshuiOrnamentOgTitle')} - ${siteName}`,
  ogDescription: t('seo.fengshuiOrnamentOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}/tools/fengshui-ornament`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.fengshuiOrnamentTitle')} - ${siteName}`,
        url: `${siteUrl}/tools/fengshui-ornament`,
        description: t('seo.fengshuiOrnamentDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('fengshuiOrnament.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}/tools/fengshui-ornament`,
          description: t('seo.fengshuiOrnamentOgDesc'),
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
</script>

<style scoped>
/* 结果阶段：纸质报告需要更宽的版面 */
.fso-result-wrap {
  max-width: 80rem;
}

/* 隐藏截图目标：固定宽度，保证出图一致 */
.fso-share-target {
  width: 1080px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
