<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Ba Zhai Feng Shui</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('bazhai.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('bazhai.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('bazhai.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bazhai.genderLabel') }} <span class="text-[var(--accent)]">*</span>
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

            <!-- 出生年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bazhai.birthYearLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.birthYear"
                type="number"
                :min="1900"
                :max="2100"
                :placeholder="$t('bazhai.birthYearPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('bazhai.birthYearHint') }}
              </p>
            </div>

            <!-- 房屋朝向：角度 + 24 山双输入 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('bazhai.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.direction"
                  type="number"
                  :min="0"
                  :max="360"
                  :placeholder="$t('bazhai.directionPlaceholder')"
                  class="w-full"
                  :ui="inputUi"
                  @update:model-value="onDirectionInput"
                />
                <USelectMenu
                  v-model="selectedMountain"
                  :items="mountainOptions"
                  value-key="value"
                  :placeholder="$t('bazhai.mountainPlaceholder')"
                  class="w-32"
                  :ui="selectUi"
                  @update:model-value="onMountainSelect"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('bazhai.directionHint') }}
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
              {{ $t('bazhai.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bazhai.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bazhai.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-home" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bazhai.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bazhai.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-star" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bazhai.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bazhai.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('bazhai.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('bazhai.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('bazhai.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult" ref="resultRef">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('bazhai.resultTitle') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('bazhai.mingGua') }}：{{ calcResult.mingGua }}（{{ calcResult.mingGuaNumber }}） · {{ calcResult.dongSiMing }}｜{{ $t('bazhai.sitting') }}：{{ calcResult.sittingMountain?.name }}{{ calcResult.sittingMountain?.palace }} · {{ calcResult.dongSiZhai }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 输入信息概览 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('bazhai.inputSummary') }}
          </h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-[var(--text-muted)]">{{ $t('bazhai.genderLabel') }}</div>
            <div class="text-[var(--text-primary)]">{{ form.gender === 'male' ? $t('common.male') : $t('common.female') }}</div>
            <div class="text-[var(--text-muted)]">{{ $t('bazhai.birthYearLabel') }}</div>
            <div class="text-[var(--text-primary)]">{{ form.birthYear }}</div>
            <div class="text-[var(--text-muted)]">{{ $t('bazhai.directionLabel') }}</div>
            <div class="text-[var(--text-primary)]">{{ form.direction }}° — {{ calcResult.mountain?.name }}（{{ calcResult.mountain?.palace }}）</div>
          </div>
        </div>

        <!-- 八宫吉凶盘 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('bazhai.chartTitle') }}
          </h3>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="cell in gridCells"
              :key="cell.name"
              class="relative rounded-xl border p-3 min-h-[80px] flex flex-col justify-between"
              :class="cellClass(cell)"
            >
              <div class="flex items-start justify-between">
                <span class="text-[10px] text-[var(--text-faint)]">{{ t(`bazhai.palaceNames.${palaceNameKey(cell.name)}`) }}</span>
                <span v-if="cell.direction" class="text-[10px] text-[var(--text-faint)]">{{ t(`bazhai.directions.${directionKey(cell.direction)}`) }}</span>
                <span v-else class="text-[10px] text-[var(--text-faint)]">—</span>
              </div>
              <div class="flex flex-col items-center justify-center py-1">
                <template v-if="cell.star">
                  <span class="text-sm font-bold" :class="starClass(cell.star)">{{ starLabel(cell.star) }}</span>
                  <span class="text-[10px]" :class="levelClass(cell.level)">{{ cell.level }}</span>
                </template>
                <template v-else>
                  <span class="text-sm font-bold text-[var(--text-muted)]">—</span>
                  <span class="text-[10px] text-[var(--text-faint)]">—</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 凶方化解建议卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('bazhai.remedyTitle') }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in calcResult.inauspicious"
              :key="item.direction + item.star"
              class="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4"
            >
              <div class="flex items-center gap-2 mb-1">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ t(`bazhai.directions.${directionKey(item.direction)}`) }} · {{ starLabel(item.star) }}
                </h4>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{{ item.level }}</span>
              </div>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">
                {{ $t(`bazhai.remedy.${starKey(item.star)!}`, { direction: t(`bazhai.directions.${directionKey(item.direction)}`) }) }}
              </p>
            </div>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <!-- 标题区 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('bazhai.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('bazhai.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <!-- 结构化展示 -->
          <div v-if="aiSections.length > 0" class="space-y-3">
            <div
              v-for="(section, index) in aiSections"
              :key="section.title + index"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {{ section.title.replace(/^##\s*/, '') }}
                </h4>
                <div class="ai-section-content" v-html="renderMarkdown(section.content)" />
                <span
                  v-if="aiStreaming && index === aiSections.length - 1"
                  class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
                />
              </div>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('bazhai.generatingInterpretation') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <!-- 免责声明 -->
          <div v-if="!aiStreaming && aiContent" class="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] px-4 py-3">
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">
              {{ $t('bazhai.disclaimer') }}
            </p>
          </div>

          <!-- 重新解读 -->
          <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
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
              {{ $t('bazhai.reinterpret') }}
            </UButton>
          </div>
        </div>

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
            {{ $t('bazhai.copyResult') }}
          </UButton>
          <AppShareButton
            tool="bazhai-fengshui"
            :summary="`${calcResult.mingGua}命 · ${calcResult.mountain?.name}向 · ${form.birthYear}`"
            :share-target="resultRef"
            :filename="`bazhai-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('bazhai.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/tools') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('bazhai.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { MOUNTAINS_24 } from '~/utils/bazhai'
import type { BazhaiResult, Gua, Direction, Star } from '~/utils/bazhai'

interface CalcResult extends BazhaiResult {}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  gender: '' as 'male' | 'female' | '',
  birthYear: undefined as number | undefined,
  direction: 0,
})
const calcResult = ref<CalcResult | null>(null)
const resultRef = ref<HTMLDivElement>()
const toast = useToast()
const compassRef = ref<HTMLDivElement>()
const dragging = ref(false)

const config = useRuntimeConfig()
const siteName = config.public.siteName as string
const siteUrl = (config.public.siteUrl as string) || 'https://www.ososn.com'

// 24 山下拉选项
const mountainOptions = computed(() =>
  MOUNTAINS_24.map(m => ({ value: m.name, label: `${m.name}（${m.palace}）` })),
)

const selectedMountain = ref<string>('')

// 方向输入变化时联动 24 山
function onDirectionInput(val: number | string | undefined) {
  const num = typeof val === 'string' ? Number(val) : val
  const deg = num === undefined || Number.isNaN(num) ? 0 : num
  form.direction = deg
  updateMountainFromDirection(deg)
}

function updateMountainFromDirection(deg: number) {
  // 用 24 山中心点匹配，避免边界抖动
  let nearest: typeof MOUNTAINS_24[number] | null = null
  let minDiff = Infinity
  for (const m of MOUNTAINS_24) {
    let center: number
    if (m.start < m.end) {
      center = (m.start + m.end) / 2
    } else {
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

// 24 山选择变化时联动角度
function onMountainSelect(val: string | undefined) {
  if (!val) return
  const m = MOUNTAINS_24.find(x => x.name === val)
  if (!m) return
  let center: number
  if (m.start < m.end) {
    center = (m.start + m.end) / 2
  } else {
    center = ((m.start + (m.end + 360)) / 2) % 360
  }
  form.direction = Math.round(center)
}

// 罗盘交互
const needleStyle = computed(() => ({
  transform: `rotate(${form.direction}deg) translateX(-50%)`,
}))

function compassTickStyle(deg: number) {
  return {
    left: '50%',
    top: '8px',
    height: 'calc(50% - 8px)',
    transform: `rotate(${deg}deg) translateX(-50%)`,
  }
}

function getAngleFromEvent(e: MouseEvent | TouchEvent): number {
  if (!compassRef.value) return 0
  const rect = compassRef.value.getBoundingClientRect()
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

const canSubmit = computed(() => {
  return form.gender && form.birthYear !== undefined && form.birthYear >= 1900 && form.birthYear <= 2100 && form.direction >= 0 && form.direction <= 360
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
    const result = await $fetch<CalcResult>('/api/tools/bazhai-fengshui/calc', {
      method: 'POST',
      body: {
        direction: form.direction,
        birthYear: form.birthYear,
        gender: form.gender,
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('bazhai.calcFail'),
      description: err.data?.message || err.message || t('bazhai.checkInput'),
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
    const response = await fetch('/api/tools/bazhai-fengshui/reading', {
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
            aiError.value = data.message || t('bazhai.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('bazhai.aiUnavailable')
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
  form.gender = ''
  form.birthYear = undefined
  form.direction = 0
  selectedMountain.value = ''
}

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('bazhai.resultTitle')}

${t('bazhai.genderLabel')}：${form.gender === 'male' ? t('common.male') : t('common.female')}
${t('bazhai.birthYearLabel')}：${form.birthYear}
${t('bazhai.directionLabel')}：${form.direction}° — ${calcResult.value.mountain?.name}（${calcResult.value.mountain?.palace}）
${t('bazhai.mingGua')}：${calcResult.value.mingGua}（${calcResult.value.mingGuaNumber}） · ${calcResult.value.dongSiMing}
${t('bazhai.sitting')}：${calcResult.value.sittingMountain?.name}${calcResult.value.sittingMountain?.palace} · ${calcResult.value.dongSiZhai}

【${t('bazhai.chartTitle')}】
${calcResult.value.palaces.map(p => `${p.direction}（${p.name}）：${p.star} · ${p.level}`).join('\n')}

${aiContent.value ? '【' + t('bazhai.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

type GridCell = CalcResult['palaces'][number] | { name: '中'; direction: null; palaceNumber: null; star: null; auspicious: boolean; level: null }

// 九宫格按上南下北排列：巽 离 坤 / 震 中 兑 / 艮 坎 乾
const gridCells = computed<GridCell[]>(() => {
  if (!calcResult.value) return []
  const order: (Gua | '中')[] = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾']
  return order.map((name) => {
    if (name === '中') {
      return { name: '中', direction: null, palaceNumber: null, star: null, auspicious: true, level: null }
    }
    return calcResult.value!.palaces.find(p => p.name === name)!
  })
})

function palaceNameKey(name: string): string {
  const map: Record<string, string> = {
    坎: 'kan', 坤: 'kun', 震: 'zhen', 巽: 'xun', 乾: 'qian', 兑: 'dui', 艮: 'gen', 离: 'li', 中: 'zhong',
  }
  return map[name] || 'li'
}

function directionKey(dir: string | null): string {
  if (!dir) return 'n'
  const map: Record<string, string> = {
    北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw',
  }
  return map[dir] || 'n'
}

function cellClass(cell: GridCell) {
  if (cell.name === '中') {
    return 'border-[var(--border-light)] bg-[var(--surface-card-hover)]'
  }
  if (cell.auspicious) {
    return 'border-[var(--accent-border)] bg-[var(--accent-bg)]/40'
  }
  return 'border-red-500/10 bg-red-500/[0.03]'
}

function starClass(star: Star | null) {
  if (!star) return ''
  if (['生气', '延年', '天医'].includes(star)) return 'text-[var(--accent)]'
  if (star === '伏位') return 'text-[var(--text-muted)]'
  return 'text-red-400/90'
}

function levelClass(level: string | null) {
  if (!level) return ''
  if (level === '大吉' || level === '吉') return 'text-[var(--accent-muted)]'
  if (level === '小吉') return 'text-[var(--text-muted)]'
  return 'text-red-400/70'
}

function starKey(star: Star | null): string | undefined {
  if (!star) return undefined
  const map: Record<Star, string> = {
    生气: 'shengqi', 延年: 'yannian', 天医: 'tianyi', 伏位: 'fuwei',
    绝命: 'jueming', 五鬼: 'wugui', 祸害: 'huohai', 六煞: 'liusha',
  }
  return map[star]
}

function starLabel(star: Star | null): string {
  if (!star) return '—'
  const key = starKey(star)
  if (!key) return star
  return t(`bazhai.stars.${key}`)
}

// AI 内容分段（兼容 # / ## / ### 标题）
const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=#{1,3}\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = (lines[0] ?? '').replace(/^#{1,3}\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('bazhai.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// 初始化时同步一次 24 山
onMounted(() => {
  updateMountainFromDirection(form.direction)
})

// SEO
useSeoMeta({
  title: () => `${t('seo.bazhaiTitle')} - ${siteName}`,
  description: t('seo.bazhaiDesc'),
  keywords: t('seo.bazhaiKeywords'),
  ogTitle: () => `${t('seo.bazhaiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.bazhaiOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}/tools/bazhai-fengshui`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.bazhaiTitle')} - ${siteName}`,
        url: `${siteUrl}/tools/bazhai-fengshui`,
        description: t('seo.bazhaiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('bazhai.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}/tools/bazhai-fengshui`,
          description: t('seo.bazhaiOgDesc'),
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
.ai-section-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-section-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-section-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-section-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
