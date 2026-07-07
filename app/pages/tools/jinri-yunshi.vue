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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Jinri Yunshi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jinriYunshi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jinriYunshi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('jinriYunshi.disclaimer') }}
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
              :label="$t('jinriYunshi.divinationTimeLabel')"
              :hint="$t('jinriYunshi.divinationTimeHint')"
            />

            <!-- 场景选择 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('jinriYunshi.sceneLabel') }}
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in sceneOptions"
                  :key="opt.value"
                  type="button"
                  class="px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="scene === opt.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="scene = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
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
              {{ $t('jinriYunshi.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYunshi.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYunshi.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-calculator" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYunshi.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYunshi.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-fire" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYunshi.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYunshi.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jinriYunshi.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('jinriYunshi.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('jinriYunshi.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jinriYunshi.resultTitle') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jinriYunshi.resultSubtitle', {
              riGan: calcResult.qiguaRigan,
              riZhi: calcResult.qiguaRizhi,
              tendency: calcResult.wuxingEnergy.label,
            }) }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 五行能量 -->
        <div
          class="rounded-2xl border p-5 mb-5"
          :class="energyBannerClass"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-[var(--surface-card)] border border-[var(--border-light)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-fire" class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-[var(--text-primary)]">
                {{ $t('jinriYunshi.wuxingEnergy') }}
              </h3>
              <p class="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {{ calcResult.wuxingEnergy.label }} · {{ calcResult.wuxingEnergy.wuxing }}
              </p>
            </div>
          </div>
        </div>

        <!-- 四柱摘要 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('jinriYunshi.pillarsTitle') }}
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
          <p class="text-xs text-[var(--text-muted)] mt-3">
            {{ $t('jinriYunshi.xiyongLabel', { xiyong: calcResult.xiyongWuxing, jishen: calcResult.jishenWuxing }) }}
          </p>
        </div>

        <!-- 人际宜忌 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-users" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('jinriYunshi.renjiTitle') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="rounded-xl border border-green-500/20 bg-green-500/[0.06] p-4">
              <p class="text-xs text-green-400 mb-2">{{ $t('jinriYunshi.renjiYi') }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in calcResult.renji.yi"
                  :key="item.dizhi"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-green-500/20 text-sm text-[var(--text-primary)]"
                >
                  <span>{{ shengxiaoEmoji(item.shengxiao) }}</span>
                  <span>{{ item.shengxiao }}</span>
                  <span class="text-[10px] text-[var(--text-faint)]">{{ item.relations.join('/') }}</span>
                </span>
              </div>
            </div>
            <div class="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
              <p class="text-xs text-red-400 mb-2">{{ $t('jinriYunshi.renjiJi') }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in calcResult.renji.ji"
                  :key="item.dizhi"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-red-500/20 text-sm text-[var(--text-primary)]"
                >
                  <span>{{ shengxiaoEmoji(item.shengxiao) }}</span>
                  <span>{{ item.shengxiao }}</span>
                  <span class="text-[10px] text-[var(--text-faint)]">{{ item.relations.join('/') }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 吉时推荐 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('jinriYunshi.jishiTitle') }}
          </h3>
          <div class="space-y-3">
            <div v-for="item in calcResult.jishi.ji" :key="item.dizhi" class="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.06] p-3">
              <div class="w-10 h-10 rounded-lg bg-[var(--surface-card)] border border-green-500/20 flex items-center justify-center text-green-400 font-bold">
                {{ item.dizhi }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-[var(--text-primary)]">{{ item.timeRange }}</p>
                <p class="text-[11px] text-[var(--text-faint)]">{{ item.reason }}</p>
              </div>
            </div>
            <div v-for="item in calcResult.jishi.xiong" :key="item.dizhi" class="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3">
              <div class="w-10 h-10 rounded-lg bg-[var(--surface-card)] border border-red-500/20 flex items-center justify-center text-red-400 font-bold">
                {{ item.dizhi }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-[var(--text-primary)]">{{ item.timeRange }}</p>
                <p class="text-[11px] text-[var(--text-faint)]">{{ item.reason }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 方位宜忌 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-map" class="w-4 h-4 text-[var(--accent-muted)]" />
            {{ $t('jinriYunshi.fangweiTitle') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="rounded-xl border border-green-500/20 bg-green-500/[0.06] p-4">
              <p class="text-xs text-green-400 mb-2">{{ $t('jinriYunshi.fangweiJi') }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(item, idx) in calcResult.fangwei.ji"
                  :key="idx"
                  class="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-green-500/20 text-sm text-[var(--text-primary)]"
                >
                  {{ item.direction }}方（{{ item.wuxing }}）
                </span>
              </div>
            </div>
            <div class="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
              <p class="text-xs text-red-400 mb-2">{{ $t('jinriYunshi.fangweiXiong') }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(item, idx) in calcResult.fangwei.xiong"
                  :key="idx"
                  class="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-red-500/20 text-sm text-[var(--text-primary)]"
                >
                  {{ item.direction }}方（{{ item.wuxing }}）
                </span>
              </div>
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
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('jinriYunshi.aiInterpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('jinriYunshi.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <div
            v-if="aiContent"
            class="prose prose-sm max-w-none text-[var(--text-body)] leading-relaxed"
            v-html="renderedAiContent"
          />

          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('jinriYunshi.generatingInterpretation') }}</p>
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
              {{ $t('jinriYunshi.disclaimer') }}
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
              {{ $t('jinriYunshi.reinterpret') }}
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
            {{ $t('jinriYunshi.recalculate') }}
          </UButton>
          <AppShareButton
            tool="jinri-yunshi"
            :name="formValues.name"
            :summary="`${calcResult.wuxingEnergy.label} · 日柱${calcResult.qiguaRigan}${calcResult.qiguaRizhi} · 宜${calcResult.renji.yi.map(i => i.shengxiao).join('、')}`"
            :share-target="resultRef || undefined"
            :filename="`jinri-yunshi-${formValues.birthDate}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
             @click="() => { navigateTo('/fortune-telling') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('jinriYunshi.backToTools') }}
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

interface CalcResult {
  userGanzhi: {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string } | null
  }
  userZhi: DiZhi[]
  userGan: string[]
  xiyongWuxing: string
  jishenWuxing: string
  qiguaRizhi: DiZhi
  qiguaRigan: string
  wuxingEnergy: {
    wuxing: string
    tendency: 'shun' | 'ni' | 'ping'
    label: string
  }
  renji: {
    yi: Array<{ shengxiao: string; dizhi: DiZhi; relations: string[]; score: number }>
    ji: Array<{ shengxiao: string; dizhi: DiZhi; relations: string[]; score: number }>
  }
  jishi: {
    ji: Array<{ dizhi: DiZhi; timeRange: string; score: number; reason: string }>
    xiong: Array<{ dizhi: DiZhi; timeRange: string; score: number; reason: string }>
  }
  fangwei: {
    ji: Array<{ direction: string; wuxing: string }>
    xiong: Array<{ direction: string; wuxing: string }>
  }
  scene: string
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
const scene = ref<'work' | 'business' | 'contract' | 'family' | 'social'>('work')
const calcResult = ref<CalcResult | null>(null)
const timeCardRef = ref<{ iso: Ref<string> } | null>(null)
const baziFormRef = ref<{ form: FormValues } | null>(null)
const resultRef = ref<HTMLDivElement | null>(null)

const sceneOptions = computed(() => [
  { value: 'work' as const, label: t('jinriYunshi.sceneOptions.work') },
  { value: 'business' as const, label: t('jinriYunshi.sceneOptions.business') },
  { value: 'contract' as const, label: t('jinriYunshi.sceneOptions.contract') },
  { value: 'family' as const, label: t('jinriYunshi.sceneOptions.family') },
  { value: 'social' as const, label: t('jinriYunshi.sceneOptions.social') },
])

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
      title: t('jinriYunshi.checkInput'),
      description: t('profileForm.birthDate'),
      color: 'error',
    })
    return
  }

  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  const qiguaTime = (timeCardRef.value?.iso as any).value || new Date().toISOString()

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/jinri-yunshi/calc', {
      method: 'POST',
      body: {
        birthDate: formValues.value.birthDate,
        birthHour: formValues.value.birthHour ?? null,
        qiguaTime,
        scene: scene.value,
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
      title: t('jinriYunshi.calcFail'),
      description: err.data?.statusMessage || err.message || t('jinriYunshi.checkInput'),
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
    const response = await fetch('/api/jinri-yunshi/reading', {
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
            aiError.value = data.message || t('jinriYunshi.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('jinriYunshi.aiUnavailable')
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

const energyBannerClass = computed(() => {
  if (!calcResult.value) return 'border-[var(--border-subtle)] bg-[var(--surface-card)]'
  const t = calcResult.value.wuxingEnergy.tendency
  if (t === 'shun') return 'border-green-500/20 bg-green-500/[0.08]'
  if (t === 'ni') return 'border-red-500/20 bg-red-500/[0.08]'
  return 'border-[var(--border-subtle)] bg-[var(--surface-card)]'
})

const pillarItems = computed(() => {
  if (!calcResult.value) return []
  const p = calcResult.value.userGanzhi
  return [
    { label: t('jinriYunshi.yearPillar'), gan: p.year.gan, zhi: p.year.zhi },
    { label: t('jinriYunshi.monthPillar'), gan: p.month.gan, zhi: p.month.zhi },
    { label: t('jinriYunshi.dayPillar'), gan: p.day.gan, zhi: p.day.zhi },
    { label: t('jinriYunshi.hourPillar'), gan: p.hour?.gan || '?', zhi: p.hour?.zhi || '?' },
  ]
})

const renderedAiContent = computed(() => {
  if (!aiContent.value) return ''
  return marked.parse(aiContent.value, { async: false }) as string
})

const shengxiaoEmoji = (animal: string) => {
  const map: Record<string, string> = {
    鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
    马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
  }
  return map[animal] || ''
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.jinriYunshiTitle')} - ${siteName}`,
  description: t('seo.jinriYunshiDesc'),
  keywords: t('seo.jinriYunshiKeywords'),
  ogTitle: () => `${t('seo.jinriYunshiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jinriYunshiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/jinri-yunshi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.jinriYunshiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/jinri-yunshi',
        description: t('seo.jinriYunshiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('jinriYunshi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/jinri-yunshi',
          description: t('seo.jinriYunshiOgDesc'),
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
