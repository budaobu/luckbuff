<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 表单阶段 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Jinri Yi Ji</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jinriYiji.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jinriYiji.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('jinriYiji.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 出生信息 -->
            <BaziForm
              ref="baziFormRef"
              minimal
              :initial-values="lastFormValues"
              @save-profile="handleSaveProfile"
            />

            <!-- 起卦时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('jinriYiji.divinationTimeLabel')"
              :hint="$t('jinriYiji.divinationTimeHint')"
            />

            <!-- 今日场景 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('jinriYiji.sceneLabel') }}
              </label>
              <div class="flex flex-wrap gap-2 mb-3">
                <button
                  v-for="opt in sceneOptions"
                  :key="opt.value"
                  type="button"
                  class="px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="scenes.includes(opt.value)
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="toggleScene(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
              <UInput
                v-model="customScene"
                :placeholder="$t('jinriYiji.customScenePlaceholder')"
                color="warning"
                class="w-full"
                :ui="{
                  base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
                }"
              />
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('jinriYiji.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYiji.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYiji.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-calculator" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYiji.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYiji.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYiji.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYiji.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYiji.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYiji.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 动画阶段 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calculator" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('jinriYiji.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('jinriYiji.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('jinriYiji.resultSubtitle', {
                lunarDate: calcResult.lunar.lunarDate,
                dayGanZhi: calcResult.lunar.dayGanZhi,
              }) }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 农历日期卡片 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-calendar" class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ $t('jinriYiji.lunarDateTitle') }}
                </h3>
                <p class="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                  {{ calcResult.lunar.lunarDate }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-3">
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jinriYiji.yearPillar') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.lunar.yearGanZhi }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jinriYiji.monthPillar') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.lunar.monthGanZhi }}</p>
              </div>
              <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center">
                <p class="text-[10px] text-[var(--text-faint)]">{{ $t('jinriYiji.dayPillar') }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ calcResult.lunar.dayGanZhi }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
              <span class="px-2 py-1 rounded-lg bg-[var(--surface-card-hover)] border border-[var(--border-light)]">
                {{ $t('jinriYiji.weekLabel') }} {{ calcResult.lunar.week }}
              </span>
              <span class="px-2 py-1 rounded-lg bg-[var(--surface-card-hover)] border border-[var(--border-light)]">
                {{ $t('jinriYiji.shengxiaoLabel') }} {{ calcResult.lunar.shengXiao }}
              </span>
              <span v-if="calcResult.lunar.jieQi" class="px-2 py-1 rounded-lg bg-[var(--surface-card-hover)] border border-[var(--border-light)]">
                {{ calcResult.lunar.jieQi }}
              </span>
            </div>
          </div>

          <!-- 宜忌 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('jinriYiji.yijiTitle') }}
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-xl border border-green-500/20 bg-green-500/[0.06] p-4">
                <p class="text-xs text-green-400 mb-2">{{ $t('jinriYiji.yiLabel') }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(item, idx) in calcResult.lunar.yi"
                    :key="`yi-${idx}`"
                    class="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-green-500/20 text-sm text-[var(--text-primary)]"
                  >
                    {{ item }}
                  </span>
                  <span v-if="!calcResult.lunar.yi.length" class="text-xs text-[var(--text-faint)]">{{ $t('jinriYiji.noYi') }}</span>
                </div>
              </div>
              <div class="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                <p class="text-xs text-red-400 mb-2">{{ $t('jinriYiji.jiLabel') }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(item, idx) in calcResult.lunar.ji"
                    :key="`ji-${idx}`"
                    class="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-red-500/20 text-sm text-[var(--text-primary)]"
                  >
                    {{ item }}
                  </span>
                  <span v-if="!calcResult.lunar.ji.length" class="text-xs text-[var(--text-faint)]">{{ $t('jinriYiji.noJi') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 吉神凶煞 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('jinriYiji.shenshaTitle') }}
            </h3>
            <div class="space-y-3">
              <div v-if="calcResult.lunar.jiShen.length" class="flex items-start gap-3">
                <span class="text-xs text-green-400 whitespace-nowrap mt-0.5">{{ $t('jinriYiji.jiShenLabel') }}</span>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(item, idx) in calcResult.lunar.jiShen"
                    :key="`js-${idx}`"
                    class="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-[var(--text-primary)]"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
              <div v-if="calcResult.lunar.xiongSha.length" class="flex items-start gap-3">
                <span class="text-xs text-red-400 whitespace-nowrap mt-0.5">{{ $t('jinriYiji.xiongShaLabel') }}</span>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(item, idx) in calcResult.lunar.xiongSha"
                    :key="`xs-${idx}`"
                    class="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-[var(--text-primary)]"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-xs text-[var(--text-muted)] whitespace-nowrap mt-0.5">{{ $t('jinriYiji.chongShaLabel') }}</span>
                <span class="text-sm text-[var(--text-body)]">{{ calcResult.lunar.chongDesc }} {{ calcResult.lunar.sha ? `· ${calcResult.lunar.sha}` : '' }}</span>
              </div>
            </div>
          </div>

          <!-- 用户四柱摘要 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('jinriYiji.userPillarsTitle') }}
            </h3>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="p in pillarItems"
                :key="p.label"
                class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3 text-center"
              >
                <p class="text-[10px] text-[var(--text-faint)]">{{ p.label }}</p>
                <p class="text-lg font-bold text-[var(--text-primary)]">{{ p.gan }}{{ p.zhi }}</p>
              </div>
            </div>
          </div>

          <!-- AI narrative -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('jinriYiji.aiInterpretation') }}</h3>
              </div>
              <div v-if="aiStreaming" class="flex items-center gap-1.5">
                <span class="text-xs text-[var(--accent-muted)]">{{ $t('jinriYiji.interpreting') }}</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
              </div>
            </div>

            <div
              v-if="aiContent"
              class="space-y-4"
            >
              <div
                v-for="(card, idx) in aiCards"
                :key="idx"
                class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] p-4"
              >
                <div
                  class="prose prose-sm max-w-none text-[var(--text-body)] leading-relaxed"
                  v-html="card.html"
                />
              </div>
            </div>

            <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
                </div>
                <p class="text-xs text-[var(--text-muted)]">{{ $t('jinriYiji.generatingInterpretation') }}</p>
              </div>
            </div>

            <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
                <p class="text-sm text-red-400">{{ aiError }}</p>
              </div>
            </div>

            <div v-if="!aiStreaming && aiContent" class="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] px-4 py-3">
              <p class="text-xs text-[var(--text-faint)] leading-relaxed">
                {{ $t('jinriYiji.disclaimer') }}
              </p>
            </div>

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
                {{ $t('jinriYiji.reinterpret') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('jinriYiji.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/fortune-telling') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('jinriYiji.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { Ref } from 'vue'
import type { DiZhi } from '~/types/user'

interface FormValues {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
  formerName: string
  formerNameChangedYear?: number
  birthProvince: string
}

interface LunarDayInfo {
  date: string
  lunarDate: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  yearNaYin: string
  monthNaYin: string
  dayNaYin: string
  yi: string[]
  ji: string[]
  jiShen: string[]
  xiongSha: string[]
  tianShen: string
  tianShenLuck: string
  tianShenType: string
  jieQi: string
  shengXiao: string
  week: string
  monthInChinese: string
  dayInChinese: string
  chongDesc: string
  chongShengXiao: string
  sha: string
  nineStar: string
  xunKong: string
  positionTaiSuiDesc: string
  positionXiDesc: string
  positionYangGuiDesc: string
  positionYinGuiDesc: string
  positionCaiDesc: string
  positionFuDesc: string
  lu: string
}

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  targetDate: string
  lunar: LunarDayInfo
  scenes: string[]
  locale: string
}

const { t, locale } = useI18n()
const toast = useToast()
const store = useProfilesStore()

const phase = ref<'form' | 'animating' | 'result'>('form')
const formValues = ref<FormValues>({
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  name: '',
  formerName: '',
  birthProvince: '',
})
const lastFormValues = ref<Partial<FormValues>>({})
const scenes = ref<string[]>([])
const customScene = ref('')
const calcResult = ref<CalcResult | null>(null)
const timeCardRef = ref<{ iso: Ref<string> } | null>(null)
const baziFormRef = ref<{ form: FormValues } | null>(null)
const resultRef = ref<HTMLDivElement | null>(null)

const sceneOptions = computed(() => [
  { value: 'haircut', label: t('jinriYiji.sceneOptions.haircut') },
  { value: 'lottery', label: t('jinriYiji.sceneOptions.lottery') },
  { value: 'contract', label: t('jinriYiji.sceneOptions.contract') },
  { value: 'move', label: t('jinriYiji.sceneOptions.move') },
  { value: 'travel', label: t('jinriYiji.sceneOptions.travel') },
  { value: 'job', label: t('jinriYiji.sceneOptions.job') },
  { value: 'opening', label: t('jinriYiji.sceneOptions.opening') },
  { value: 'date', label: t('jinriYiji.sceneOptions.date') },
])

function toggleScene(value: string) {
  const idx = scenes.value.indexOf(value)
  if (idx > -1) {
    scenes.value.splice(idx, 1)
  }
  else {
    scenes.value.push(value)
  }
}

function handleSaveProfile(id: string, values: FormValues) {
  store.update(id, {
    gender: values.gender,
    birthDate: values.birthDate,
    birthHour: values.birthHour,
    name: values.name || undefined,
    formerName: values.formerName || undefined,
    formerNameChangedYear: values.formerNameChangedYear,
    birthProvince: values.birthProvince || undefined,
  })
}

async function handleSubmit() {
  const values = baziFormRef.value?.form
  if (!values?.birthDate) {
    toast.add({
      title: t('jinriYiji.checkInput'),
      description: t('profileForm.birthDate'),
      color: 'error',
    })
    return
  }

  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const timeIso = timeCardRef.value?.iso
  const qiguaTime = (typeof timeIso === 'string' ? timeIso : (timeIso as unknown as Ref<string>)?.value) || new Date().toISOString()

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/jinri-yiji/calc', {
      method: 'POST',
      body: {
        birthDate: formValues.value.birthDate,
        birthHour: formValues.value.birthHour ?? null,
        qiguaTime,
        scenes: scenes.value,
        customScene: customScene.value,
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
      title: t('jinriYiji.calcFail'),
      description: err.data?.statusMessage || err.message || t('jinriYiji.checkInput'),
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
    const response = await fetch('/api/tools/jinri-yiji/reading', {
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
            aiError.value = data.message || t('jinriYiji.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('jinriYiji.aiUnavailable')
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
}

const pillarItems = computed(() => {
  if (!calcResult.value) return []
  const p = calcResult.value.userGanzhi
  return [
    { label: t('jinriYiji.yearPillar'), gan: p.year.gan, zhi: p.year.zhi },
    { label: t('jinriYiji.monthPillar'), gan: p.month.gan, zhi: p.month.zhi },
    { label: t('jinriYiji.dayPillar'), gan: p.day.gan, zhi: p.day.zhi },
    { label: t('jinriYiji.hourPillar'), gan: p.hour?.gan || '?', zhi: p.hour?.zhi || '?' },
  ]
})

const sceneDisplayLabel = computed(() => {
  if (!calcResult.value?.scenes.length) return t('jinriYiji.sceneFallback')
  return calcResult.value.scenes.map((s) => {
    const key = `jinriYiji.sceneOptions.${s}`
    const label = t(key)
    return label === key ? s : label
  }).join('、')
})

const aiCards = computed(() => {
  if (!aiContent.value) return []
  return aiContent.value
    .split('\n---\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map((segment) => {
      const replaced = segment.replace(/\{场景\}/g, sceneDisplayLabel.value)
      return {
        html: marked.parse(replaced, { async: false }) as string,
      }
    })
})

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.jinriYijiTitle')} - ${siteName}`,
  description: t('seo.jinriYijiDesc'),
  keywords: t('seo.jinriYijiKeywords'),
  ogTitle: () => `${t('seo.jinriYijiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jinriYijiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/jinri-yiji',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.jinriYijiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/jinri-yiji',
        description: t('seo.jinriYijiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('jinriYiji.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/jinri-yiji',
          description: t('seo.jinriYijiOgDesc'),
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
:deep(.prose p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
:deep(.prose p:last-child) {
  margin-bottom: 0;
}
:deep(.prose strong) {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
