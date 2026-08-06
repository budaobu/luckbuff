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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Mother-in-law & Daughter-in-law Bazi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('baziPoxiHepan.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('baziPoxiHepan.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('baziPoxiHepan.disclaimer') }}
          </p>
        </div>

        <!-- Person A -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
          <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
              </div>
              <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPoxiHepan.personA') }}</span>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <!-- Profile 快选 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('baziPoxiHepan.selectProfile') }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="profile in profiles"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="selectedA === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="selectProfile(profile, 'A')"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.genderLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="formA.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="formA.gender = 'male'"
                >
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="formA.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="formA.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 出生日期 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('baziPoxiHepan.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !formA.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ formA.birthDate && calendarDateA ? df.format(calendarDateA.toDate(tz)) : $t('baziPoxiHepan.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar v-model="calendarDateA" color="warning" class="p-2" />
                </template>
              </UPopover>
            </div>

            <!-- 出生时辰 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.birthHourLabel') }}
              </label>
              <USelectMenu
                v-model="formA.birthHour"
                :items="shichenOptions"
                value-key="dizhi"
                :placeholder="$t('baziPoxiHepan.birthHourPlaceholder')"
                class="w-full"
                :ui="selectUi"
              />
            </div>

            <!-- 姓名 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.nameLabel') }}
              </label>
              <UInput v-model="formA.name" :placeholder="$t('baziPoxiHepan.namePlaceholder')" class="w-full" :ui="inputUi" />
            </div>

            <!-- 出生地 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.birthProvinceLabel') }}
              </label>
              <UInput v-model="formA.birthProvince" :placeholder="$t('baziPoxiHepan.birthProvincePlaceholder')" class="w-full" :ui="inputUi" />
            </div>
          </div>
        </div>

        <!-- Person B -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
          <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
              </div>
              <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPoxiHepan.personB') }}</span>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <!-- Profile 快选 -->
            <div v-if="profiles.length > 0" class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('baziPoxiHepan.selectProfile') }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="profile in profiles"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="selectedB === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="selectProfile(profile, 'B')"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>
            </div>

            <!-- 性别 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.genderLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="formB.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="formB.gender = 'male'"
                >
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="formB.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="formB.gender = 'female'"
                >
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 出生日期 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                {{ $t('baziPoxiHepan.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !formB.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ formB.birthDate && calendarDateB ? df.format(calendarDateB.toDate(tz)) : $t('baziPoxiHepan.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar v-model="calendarDateB" color="warning" class="p-2" />
                </template>
              </UPopover>
            </div>

            <!-- 出生时辰 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.birthHourLabel') }}
              </label>
              <USelectMenu
                v-model="formB.birthHour"
                :items="shichenOptions"
                value-key="dizhi"
                :placeholder="$t('baziPoxiHepan.birthHourPlaceholder')"
                class="w-full"
                :ui="selectUi"
              />
            </div>

            <!-- 姓名 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.nameLabel') }}
              </label>
              <UInput v-model="formB.name" :placeholder="$t('baziPoxiHepan.namePlaceholder')" class="w-full" :ui="inputUi" />
            </div>

            <!-- 出生地 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('baziPoxiHepan.birthProvinceLabel') }}
              </label>
              <UInput v-model="formB.birthProvince" :placeholder="$t('baziPoxiHepan.birthProvincePlaceholder')" class="w-full" :ui="inputUi" />
            </div>
          </div>
        </div>

        <!-- 合盘按钮 -->
        <UButton
          color="warning"
          size="lg"
          block
          :disabled="!canSubmit"
          class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
          @click="handleSubmit"
        >
          <template #leading>
            <UIcon name="i-heroicons-heart" class="w-5 h-5" />
          </template>
          {{ $t('baziPoxiHepan.submitBtn') }}
        </UButton>

        <!-- 婆媳八字合盘知识卡片 -->
        <div class="mt-6 space-y-3">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
            <span class="text-xs font-medium text-[var(--text-muted)]">{{ $t('baziPoxiHepan.knowledgeTitle') }}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-link" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPoxiHepan.knowledgeCard1Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPoxiHepan.knowledgeCard1Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-scale" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPoxiHepan.knowledgeCard2Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPoxiHepan.knowledgeCard2Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-fire" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPoxiHepan.knowledgeCard3Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPoxiHepan.knowledgeCard3Desc') }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('baziPoxiHepan.knowledgeCard4Title') }}</h4>
              </div>
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('baziPoxiHepan.knowledgeCard4Desc') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-heart" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('baziPoxiHepan.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && chartA && chartB" class="max-w-5xl -mx-6 md:mx-auto">
        <div ref="resultRef" class="px-6 md:px-0">
          <BaziPoxiReport
            :chart-a="chartA"
            :chart-b="chartB"
            :ai-content="aiContent"
            :streaming="aiStreaming"
            :error="aiError"
            :name-a="formA.name"
            :name-b="formB.name"
            :gender-a="formA.gender"
            :gender-b="formB.gender"
            @retry="startAiStream"
          />
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap px-6 md:px-0">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleCopy"
          >
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('baziPoxiHepan.copyResult') }}
          </UButton>
          <AppShareButton
            tool="bazi-poxi-hepan"
            :name="`${formA.name || $t('baziPoxiHepan.personA')} & ${formB.name || $t('baziPoxiHepan.personB')}`"
            :summary="`${formA.name || $t('baziPoxiHepan.personA')} · ${formB.name || $t('baziPoxiHepan.personB')} · ${chartA.riZhu} · ${chartB.riZhu}`"
            :share-target="resultRef"
            :filename="`bazi-poxi-hepan-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('baziPoxiHepan.recalculate') }}
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
            {{ $t('baziPoxiHepan.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { SHICHEN_OPTIONS } from '~/types/user'
import type { UserProfile, DiZhi } from '~/types/user'
import type { BaziChart } from '~/types/bazi'

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')

// Person A form
const formA = reactive({
  name: '',
  gender: 'female' as 'male' | 'female',
  birthDate: '',
  birthHour: undefined as DiZhi | undefined,
  birthProvince: '',
})

// Person B form
const formB = reactive({
  name: '',
  gender: 'female' as 'male' | 'female',
  birthDate: '',
  birthHour: undefined as DiZhi | undefined,
  birthProvince: '',
})

const chartA = ref<BaziChart | null>(null)
const chartB = ref<BaziChart | null>(null)

// Profile selection
const { profiles, defaultProfile } = useProfiles()
const selectedA = ref<string | null>(null)
const selectedB = ref<string | null>(null)

// Calendar pickers
const tz = getLocalTimeZone()
const df = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' }))
const calendarDateA = ref<CalendarDate | undefined>(undefined)
const calendarDateB = ref<CalendarDate | undefined>(undefined)

watch(calendarDateA, () => {
  if (calendarDateA.value) {
    formA.birthDate = `${calendarDateA.value.year}-${String(calendarDateA.value.month).padStart(2, '0')}-${String(calendarDateA.value.day).padStart(2, '0')}`
  } else {
    formA.birthDate = ''
  }
})

watch(calendarDateB, () => {
  if (calendarDateB.value) {
    formB.birthDate = `${calendarDateB.value.year}-${String(calendarDateB.value.month).padStart(2, '0')}-${String(calendarDateB.value.day).padStart(2, '0')}`
  } else {
    formB.birthDate = ''
  }
})

function selectProfile(profile: UserProfile, target: 'A' | 'B') {
  if (target === 'A') {
    selectedA.value = profile.id
    formA.name = profile.name || profile.label || ''
    formA.gender = profile.gender
    formA.birthDate = profile.birthDate || ''
    formA.birthHour = profile.birthHour
    formA.birthProvince = profile.birthProvince || ''
    if (formA.birthDate) {
      try { calendarDateA.value = parseDate(formA.birthDate) } catch { calendarDateA.value = undefined }
    } else {
      calendarDateA.value = undefined
    }
  } else {
    selectedB.value = profile.id
    formB.name = profile.name || profile.label || ''
    formB.gender = profile.gender
    formB.birthDate = profile.birthDate || ''
    formB.birthHour = profile.birthHour
    formB.birthProvince = profile.birthProvince || ''
    if (formB.birthDate) {
      try { calendarDateB.value = parseDate(formB.birthDate) } catch { calendarDateB.value = undefined }
    } else {
      calendarDateB.value = undefined
    }
  }
}

onMounted(() => {
  if (defaultProfile.value && !formA.birthDate) {
    selectProfile(defaultProfile.value, 'A')
  }
  if (profiles.value.length > 1 && !formB.birthDate) {
    const second = profiles.value.find(p => p.id !== defaultProfile.value?.id)
    if (second) selectProfile(second, 'B')
  }
})

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const toast = useToast()

const canSubmit = computed(() => {
  return formA.birthDate.length > 0 && formB.birthDate.length > 0
})

const shichenOptions = [...SHICHEN_OPTIONS]

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  chartA.value = null
  chartB.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const calcRes = await $fetch('/api/tools/bazi-poxi-hepan/calc', {
      method: 'POST',
      body: {
        personA: {
          gender: formA.gender,
          birthDate: formA.birthDate,
          birthHour: formA.birthHour,
          name: formA.name,
        },
        personB: {
          gender: formB.gender,
          birthDate: formB.birthDate,
          birthHour: formB.birthHour,
          name: formB.name,
        },
        locale: locale.value,
      },
    })

    chartA.value = calcRes.chartA as BaziChart
    chartB.value = calcRes.chartB as BaziChart
    phase.value = 'result'
    startAiStream()
  } catch (e: any) {
    phase.value = 'form'
    aiError.value = e?.message || t('baziPoxiHepan.aiUnavailable')
    toast.add({ title: t('baziPoxiHepan.aiUnavailable'), color: 'error' })
  }
}

async function startAiStream() {
  if (!chartA.value || !chartB.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/bazi-poxi-hepan/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chartA: chartA.value,
        chartB: chartB.value,
        locale: locale.value,
        nameA: formA.name,
        nameB: formB.name,
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
            aiError.value = data.message || t('baziPoxiHepan.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('baziPoxiHepan.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  chartA.value = null
  chartB.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  selectedA.value = null
  selectedB.value = null
  calendarDateA.value = undefined
  calendarDateB.value = undefined
  formA.name = ''
  formA.gender = 'female'
  formA.birthDate = ''
  formA.birthHour = undefined
  formA.birthProvince = ''
  formB.name = ''
  formB.gender = 'female'
  formB.birthDate = ''
  formB.birthHour = undefined
  formB.birthProvince = ''
}

function handleCopy() {
  if (!chartA.value || !chartB.value) return
  const text = `${$t('baziPoxiHepan.resultTitle')}

${formA.name || $t('baziPoxiHepan.personA')}：
${$t('baziPan.yearPillar')}：${chartA.value.year.gan}${chartA.value.year.zhi}
${$t('baziPan.monthPillar')}：${chartA.value.month.gan}${chartA.value.month.zhi}
${$t('baziPan.dayPillar')}：${chartA.value.day.gan}${chartA.value.day.zhi}
${$t('baziPan.hourPillar')}：${chartA.value.hour ? chartA.value.hour.gan + chartA.value.hour.zhi : '?'}

${formB.name || $t('baziPoxiHepan.personB')}：
${$t('baziPan.yearPillar')}：${chartB.value.year.gan}${chartB.value.year.zhi}
${$t('baziPan.monthPillar')}：${chartB.value.month.gan}${chartB.value.month.zhi}
${$t('baziPan.dayPillar')}：${chartB.value.day.gan}${chartB.value.day.zhi}
${$t('baziPan.hourPillar')}：${chartB.value.hour ? chartB.value.hour.gan + chartB.value.hour.zhi : '?'}

${aiContent.value ? '【' + $t('baziPoxiHepan.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  trigger: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
}

// SEO
const config = useRuntimeConfig()
const siteName = computed(() => config.public.siteName || 'ososn')
const pageUrl = computed(() => `${config.public.siteUrl || 'https://www.ososn.com'}/tools/bazi-poxi-hepan`)

useSeoMeta({
  title: () => `${t('seo.baziPoxiHepanTitle')} - ${siteName.value}`,
  description: t('seo.baziPoxiHepanDesc'),
  keywords: t('seo.baziPoxiHepanKeywords'),
  ogTitle: () => `${t('seo.baziPoxiHepanOgTitle')} - ${siteName.value}`,
  ogDescription: t('seo.baziPoxiHepanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
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
        name: `${t('seo.baziPoxiHepanTitle')} - ${siteName.value}`,
        url: pageUrl.value,
        description: t('seo.baziPoxiHepanDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('baziPoxiHepan.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: pageUrl.value,
          description: t('seo.baziPoxiHepanOgDesc'),
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
