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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Lucky Plant</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('luckyPlant.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('luckyPlant.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('luckyPlant.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 档案快选区 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('luckyPlant.selectProfile') }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="profile in profiles"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="selectedProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="selectProfile(profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>
            </div>
            <div v-else class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
              <p class="text-sm text-[var(--text-faint)]">
                {{ $t('luckyPlant.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('luckyPlant.goSettings') }}</NuxtLink>{{ $t('luckyPlant.createSuffix') }}
              </p>
            </div>

            <!-- 姓名 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('luckyPlant.nameLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model="form.name"
                :placeholder="$t('luckyPlant.namePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 性别 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('luckyPlant.genderLabel') }}
              </label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = 'male'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="form.gender = 'female'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 出生日期 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('luckyPlant.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('luckyPlant.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar
                    v-model="calendarDate"
                    color="warning"
                    class="p-2"
                  />
                </template>
              </UPopover>
            </div>

            <!-- 喜用五行 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('luckyPlant.preferredElementLabel') }}</label>
              <USelect
                v-model="form.preferredElement"
                :items="elementOptions"
                :placeholder="$t('luckyPlant.preferredElementPlaceholder')"
                color="warning"
                class="w-full"
                :ui="selectUi"
              />
              <p class="text-[11px] text-[var(--text-faint)]">
                {{ $t('luckyPlant.preferredElementHint') }}
              </p>
            </div>

            <!-- 摆放场景 -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('luckyPlant.placementLabel') }}</label>
              <USelect
                v-model="form.placement"
                :items="placementOptions"
                :placeholder="$t('luckyPlant.placementPlaceholder')"
                color="warning"
                class="w-full"
                :ui="selectUi"
              />
            </div>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('luckyPlant.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('luckyPlant.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('luckyPlant.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('luckyPlant.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('luckyPlant.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('luckyPlant.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('luckyPlant.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('luckyPlant.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 计算按钮 -->
        <UButton
          color="warning"
          size="lg"
          block
          :disabled="!canSubmit"
          class="mt-5 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
          @click="handleSubmit"
        >
          <template #leading>
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
          </template>
          {{ $t('luckyPlant.submitBtn') }}
        </UButton>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('luckyPlant.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('luckyPlant.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.profile.name }} · {{ calcResult.profile.birthDate }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 五行推算卡片 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sun" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('luckyPlant.derivedXiYong') }}</h3>
                <p class="text-2xl font-bold text-[var(--accent)]">{{ calcResult.derived.xiYongLabel }}</p>
              </div>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">
              {{ calcResult.derived.reasoning }}
            </p>
          </div>

          <!-- 推荐植物列表 -->
          <div class="mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('luckyPlant.plantListTitle') }}
            </h3>
            <div class="space-y-3">
              <div
                v-for="(plant, index) in calcResult.recommendations"
                :key="plant.id"
                class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-card)] overflow-hidden"
              >
                <div class="p-5">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                        <UIcon name="i-heroicons-sparkles" class="w-6 h-6" />
                      </div>
                      <div>
                        <h4 class="text-base font-semibold text-[var(--text-primary)]">
                          <span class="text-[var(--accent-muted)] mr-1">{{ index + 1 }}.</span>{{ plant.name }}
                        </h4>
                        <div class="flex flex-wrap gap-1.5 mt-1">
                          <span class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)]">
                            {{ $t('luckyPlant.plantElement') }} {{ plant.element }}
                          </span>
                          <span
                            v-for="tag in plant.tags"
                            :key="tag"
                            class="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-faint)]"
                          >
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-2.5">
                    <div>
                      <p class="text-[11px] text-[var(--accent-muted)] mb-1">{{ $t('luckyPlant.plantMeaning') }}</p>
                      <p class="text-xs text-[var(--text-body)] leading-relaxed">{{ plant.meaning }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-[var(--accent-muted)] mb-1">{{ $t('luckyPlant.plantCare') }}</p>
                      <p class="text-xs text-[var(--text-body)] leading-relaxed">{{ plant.care }}</p>
                    </div>
                    <p class="text-[11px] text-[var(--text-faint)] italic">
                      {{ plant.matchReason }}
                    </p>
                  </div>
                </div>
              </div>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('luckyPlant.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('luckyPlant.interpreting') }}</span>
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
              :key="section.title"
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
              <p class="text-xs text-[var(--text-muted)]">{{ $t('luckyPlant.generatingInterpretation') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
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
              {{ $t('luckyPlant.reinterpret') }}
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
            {{ $t('luckyPlant.copyResult') }}
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
            {{ $t('luckyPlant.recalculate') }}
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
            {{ $t('luckyPlant.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { UserProfile } from '~/types/user'

interface LuckyPlantCalcResult {
  profile: {
    name: string
    birthDate: string
    gender?: 'male' | 'female'
  }
  derived: {
    season: string
    seasonLabel: string
    natalElement: string
    natalElementLabel: string
    xiYong: string
    xiYongLabel: string
    reasoning: string
  }
  recommendations: Array<{
    id: string
    name: string
    element: string
    tags: string[]
    meaning: string
    care: string
    wealthBoost: number
    difficulty: string
    matchReason: string
  }>
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  name: '',
  birthDate: '',
  gender: undefined as 'male' | 'female' | undefined,
  preferredElement: undefined as string | undefined,
  placement: undefined as string | undefined,
})
const calcResult = ref<LuckyPlantCalcResult | null>(null)

// 档案选择
const { profiles, defaultProfile } = useProfiles()
const localePath = useLocalePath()
const selectedProfileId = ref<string | null>(null)

// 日历 picker
const tz = getLocalTimeZone()
const df = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' }))
const calendarDate = ref<CalendarDate | undefined>(undefined)

watch(calendarDate, () => {
  if (calendarDate.value) {
    form.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
    derivePreferredElement()
  }
  else {
    form.birthDate = ''
    if (!form.preferredElement) form.preferredElement = undefined
  }
})

function derivePreferredElement() {
  if (!form.birthDate) return
  const month = Number(form.birthDate.slice(5, 7))
  if (Number.isNaN(month)) return
  // 按节气大致划分：2-4 春木、5-7 夏火、8-10 秋金、11-1 冬水；旺则宜泄
  let element: string | undefined
  if (month >= 2 && month <= 4) element = 'fire' // 木旺 → 火
  else if (month >= 5 && month <= 7) element = 'earth' // 火旺 → 土
  else if (month >= 8 && month <= 10) element = 'water' // 金旺 → 水
  else element = 'wood' // 水旺 → 木

  // 如果用户已经手动选择过，不再覆盖；首次根据生日自动填充
  if (!form.preferredElement || selectedProfileId.value) {
    form.preferredElement = element
  }
}

function selectProfile(profile: UserProfile) {
  selectedProfileId.value = profile.id
  form.name = profile.name || profile.label || ''
  form.birthDate = profile.birthDate || ''
  form.gender = profile.gender
  if (form.birthDate) {
    try {
      calendarDate.value = parseDate(form.birthDate)
      derivePreferredElement()
    }
    catch {
      calendarDate.value = undefined
    }
  }
  else {
    calendarDate.value = undefined
    form.preferredElement = undefined
  }
}

onMounted(() => {
  if (defaultProfile.value && !form.birthDate) {
    selectProfile(defaultProfile.value)
  }
})

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const toast = useToast()

const elementOptions = computed(() => [
  { label: t('luckyPlant.elementOptions.wood'), value: 'wood' },
  { label: t('luckyPlant.elementOptions.fire'), value: 'fire' },
  { label: t('luckyPlant.elementOptions.earth'), value: 'earth' },
  { label: t('luckyPlant.elementOptions.metal'), value: 'metal' },
  { label: t('luckyPlant.elementOptions.water'), value: 'water' },
])

const placementOptions = computed(() => [
  { label: t('luckyPlant.placementOptions.livingRoom'), value: 'livingRoom' },
  { label: t('luckyPlant.placementOptions.bedroom'), value: 'bedroom' },
  { label: t('luckyPlant.placementOptions.office'), value: 'office' },
  { label: t('luckyPlant.placementOptions.balcony'), value: 'balcony' },
  { label: t('luckyPlant.placementOptions.entry'), value: 'entry' },
])

const canSubmit = computed(() => {
  return form.name.trim().length > 0 && form.birthDate.length > 0
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
    const result = await $fetch<LuckyPlantCalcResult>('/api/tools/lucky-plant/calc', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        birthdate: form.birthDate,
        gender: form.gender,
        preferredElement: form.preferredElement ? mapElementToChinese(form.preferredElement) : undefined,
        placement: form.placement,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    // 延迟启动 AI 解读
    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('luckyPlant.calcFail'),
      description: err.data?.message || err.message || t('luckyPlant.checkInput'),
      color: 'error',
    })
  }
}

function mapElementToChinese(value: string): string {
  const map: Record<string, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
  }
  return map[value] || value
}

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/lucky-plant/reading', {
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
            aiError.value = data.message || t('luckyPlant.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('luckyPlant.aiUnavailable')
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
  selectedProfileId.value = null
  calendarDate.value = undefined
  form.name = ''
  form.birthDate = ''
  form.gender = undefined
  form.preferredElement = undefined
  form.placement = undefined
}

function handleCopy() {
  if (!calcResult.value) return
  const plants = calcResult.value.recommendations
    .map((p, idx) => `${idx + 1}. ${p.name}（五行${p.element}）\n   ${p.matchReason}\n   养护：${p.care}`)
    .join('\n\n')
  const text = `${t('luckyPlant.resultTitle')}

${t('luckyPlant.nameLabel')}：${calcResult.value.profile.name}
${t('luckyPlant.birthDateLabel')}：${calcResult.value.profile.birthDate}
${t('luckyPlant.derivedXiYong')}：${calcResult.value.derived.xiYongLabel}
${t('luckyPlant.derivedReasoning')}：${calcResult.value.derived.reasoning}

${t('luckyPlant.plantListTitle')}：
${plants}

${aiContent.value ? '【' + t('luckyPlant.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// AI 内容分段
const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('luckyPlant.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

const selectUi = {
  base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  placeholder: 'text-[var(--text-placeholder)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.luckyPlantTitle')} - ${siteName}`,
  description: t('seo.luckyPlantDesc'),
  keywords: t('seo.luckyPlantKeywords'),
  ogTitle: () => `${t('seo.luckyPlantOgTitle')} - ${siteName}`,
  ogDescription: t('seo.luckyPlantOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/lucky-plant',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.luckyPlantTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/lucky-plant',
        description: t('seo.luckyPlantDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('luckyPlant.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/lucky-plant',
          description: t('seo.luckyPlantOgDesc'),
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
