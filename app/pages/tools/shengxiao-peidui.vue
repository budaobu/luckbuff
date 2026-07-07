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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Shengxiao Peidui</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('shengxiaoPeidui.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('shengxiaoPeidui.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 女方 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
          <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
              </div>
              <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('shengxiaoPeidui.femaleLabel') }}</span>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('shengxiaoPeidui.animalLabel') }}</label>
                <USelectMenu
                  v-model="form.female.animal"
                  :items="animalOptions"
                  value-key="value"
                  class="w-full"
                  :ui="selectUi"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('shengxiaoPeidui.yearLabel') }}</label>
                <USelectMenu
                  v-model="form.female.year"
                  :items="yearOptionsFor(form.female.animal)"
                  value-key="value"
                  class="w-full"
                  :ui="selectUi"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 男方 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
          <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
              </div>
              <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('shengxiaoPeidui.maleLabel') }}</span>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('shengxiaoPeidui.animalLabel') }}</label>
                <USelectMenu
                  v-model="form.male.animal"
                  :items="animalOptions"
                  value-key="value"
                  class="w-full"
                  :ui="selectUi"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('shengxiaoPeidui.yearLabel') }}</label>
                <USelectMenu
                  v-model="form.male.year"
                  :items="yearOptionsFor(form.male.animal)"
                  value-key="value"
                  class="w-full"
                  :ui="selectUi"
                />
              </div>
            </div>
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
          {{ $t('shengxiaoPeidui.submitBtn') }}
        </UButton>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('shengxiaoPeidui.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('shengxiaoPeidui.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('shengxiaoPeidui.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('shengxiaoPeidui.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-fire" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('shengxiaoPeidui.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('shengxiaoPeidui.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('shengxiaoPeidui.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('shengxiaoPeidui.knowledgeCard4Desc') }}</p>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('shengxiaoPeidui.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('shengxiaoPeidui.resultTitle', { label: calcResult.pairLabel }) }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ $t('shengxiaoPeidui.resultSubtitle') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 生肖配对总览卡 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center justify-between gap-4 mb-6">
              <div class="text-center flex-1">
                <p class="text-3xl font-bold text-[var(--accent)]">{{ shengxiaoEmoji(calcResult.male.animal) }}</p>
                <p class="text-sm font-medium text-[var(--text-primary)] mt-1">{{ calcResult.male.animal }}</p>
              </div>
              <div class="flex-1 text-center">
                <p class="text-sm font-semibold text-[var(--text-primary)]">{{ calcResult.zodiacVerdict.label }}</p>
                <p class="text-xs text-[var(--text-faint)] mt-1">{{ pairHeadline }}</p>
              </div>
              <div class="text-center flex-1">
                <p class="text-3xl font-bold text-[var(--accent)]">{{ shengxiaoEmoji(calcResult.female.animal) }}</p>
                <p class="text-sm font-medium text-[var(--text-primary)] mt-1">{{ calcResult.female.animal }}</p>
              </div>
            </div>

            <!-- 男方 -->
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card-hover)] p-4 mb-3">
              <p class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                {{ $t('shengxiaoPeidui.maleTitle') }}
              </p>
              <p class="text-sm text-[var(--text-body)]">
                {{ calcResult.male.year }}年属{{ calcResult.male.animal }}{{ calcResult.male.age }}岁
              </p>
              <div class="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                <p>【{{ $t('shengxiaoPeidui.nayinLabel') }}】{{ calcResult.male.naYin }}</p>
                <p>【{{ $t('shengxiaoPeidui.shengxiaoMingLabel') }}】{{ calcResult.male.shengXiaoMing }}</p>
                <p>【{{ $t('shengxiaoPeidui.mingguaLabel') }}】{{ calcResult.male.mingGua }}（{{ calcResult.male.lifeGroupLabel }}）</p>
              </div>
            </div>

            <!-- 女方 -->
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card-hover)] p-4 mb-4">
              <p class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                {{ $t('shengxiaoPeidui.femaleTitle') }}
              </p>
              <p class="text-sm text-[var(--text-body)]">
                {{ calcResult.female.year }}年属{{ calcResult.female.animal }}{{ calcResult.female.age }}岁
              </p>
              <div class="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                <p>【{{ $t('shengxiaoPeidui.nayinLabel') }}】{{ calcResult.female.naYin }}</p>
                <p>【{{ $t('shengxiaoPeidui.shengxiaoMingLabel') }}】{{ calcResult.female.shengXiaoMing }}</p>
                <p>【{{ $t('shengxiaoPeidui.mingguaLabel') }}】{{ calcResult.female.mingGua }}（{{ calcResult.female.lifeGroupLabel }}）</p>
              </div>
            </div>

            <!-- 合配标签 -->
            <div class="flex flex-wrap items-center justify-center gap-3 text-sm">
              <span
                class="px-3 py-1.5 rounded-full border font-medium"
                :class="verdictClass(calcResult.nayinVerdict.key)"
              >{{ calcResult.nayinVerdict.label }}</span>
              <span class="text-[var(--text-faint)]">｜</span>
              <span
                class="px-3 py-1.5 rounded-full border font-medium"
                :class="verdictClass(calcResult.mingguaVerdict.key)"
              >{{ calcResult.mingguaVerdict.label }}</span>
              <span class="text-[var(--text-faint)]">｜</span>
              <span
                class="px-3 py-1.5 rounded-full border font-medium"
                :class="verdictClass(calcResult.zodiacVerdict.key)"
              >{{ calcResult.zodiacVerdict.label }}</span>
            </div>
          </div>

          <!-- AI 解读摘要 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('shengxiaoPeidui.aiInterpretation') }}</h3>
              </div>
              <div v-if="aiStreaming" class="flex items-center gap-1.5">
                <span class="text-xs text-[var(--accent-muted)]">{{ $t('shengxiaoPeidui.interpreting') }}</span>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
              </div>
            </div>

            <div v-if="aiContent" class="space-y-4">
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
                <p class="text-xs text-[var(--text-muted)]">{{ $t('shengxiaoPeidui.generatingInterpretation') }}</p>
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
                {{ $t('shengxiaoPeidui.disclaimer') }}
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
                {{ $t('shengxiaoPeidui.reinterpret') }}
              </UButton>
            </div>
          </div>

          <!-- 八字合盘引导 -->
          <div class="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] p-4 mb-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <p class="text-sm text-[var(--text-body)]">{{ $t('shengxiaoPeidui.baziHunpanBanner') }}</p>
              </div>
              <UButton
                color="warning"
                variant="soft"
                size="sm"
                :to="localePath('/tools/bazi-hunpan')"
              >
                {{ $t('shengxiaoPeidui.baziHunpanCta') }}
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
            {{ $t('shengxiaoPeidui.recalculate') }}
          </UButton>
          <AppShareButton
            tool="shengxiao-peidui"
            :name="`${calcResult.male.year}${calcResult.male.animal}男${calcResult.female.year}${calcResult.female.animal}女`"
            :summary="`${calcResult.zodiacVerdict.label} · ${calcResult.nayinVerdict.label} · ${calcResult.mingguaVerdict.label}`"
            :share-target="resultRef || undefined"
            :filename="`shengxiao-peidui-${calcResult.male.year}-${calcResult.female.year}.png`"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
             @click="() => { navigateTo('/shuangren-hepan') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('shengxiaoPeidui.backToTopic') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface PartnerForm {
  animal: string
  year: number
  gender: 'male' | 'female'
}

interface PartnerResult {
  gender: 'male' | 'female'
  animal: string
  year: number
  age: number
  ganZhi: string
  naYin: string
  shengXiaoMing: string
  mingGua: string
  lifeGroup: 'east' | 'west'
  lifeGroupLabel: string
}

interface RelationVerdict {
  key: string
  label: string
  detail?: string
}

interface CalcResult {
  male: PartnerResult
  female: PartnerResult
  pairLabel: string
  zodiacVerdict: RelationVerdict
  nayinVerdict: RelationVerdict
  mingguaVerdict: RelationVerdict
  locale: string
}

const { t, locale } = useI18n()
const toast = useToast()
const localePath = useLocalePath()

const ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const BASE_YEAR = 1984 // 1984年为鼠年
const MIN_YEAR = 1936
const MAX_YEAR = new Date().getFullYear() + 1

const phase = ref<'form' | 'animating' | 'result'>('form')
const calcResult = ref<CalcResult | null>(null)
const resultRef = ref<HTMLDivElement | null>(null)

const form = ref<{ male: PartnerForm; female: PartnerForm }>({
  male: { animal: '狗', year: 1994, gender: 'male' },
  female: { animal: '虎', year: 1986, gender: 'female' },
})

const animalOptions = computed(() =>
  ANIMALS.map(animal => ({
    value: animal,
    label: `${shengxiaoEmoji(animal)} ${animal}`,
  })),
)

function animalForYear(year: number): string {
  return ANIMALS[((year - BASE_YEAR) % 12 + 12) % 12]!
}

function yearOptionsFor(animal: string): { label: string; value: number }[] {
  const index = ANIMALS.indexOf(animal)
  const years: number[] = []
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
    if (((y - BASE_YEAR) % 12 + 12) % 12 === index) {
      years.push(y)
    }
  }
  return years.reverse().map(year => ({ label: `${year}年`, value: year }))
}

function normalizeSelectValue<T>(val: T | { value: T } | null): T | null {
  if (val && typeof val === 'object' && 'value' in val) return (val as { value: T }).value
  return val as T
}

function syncYearByAnimal(role: 'male' | 'female') {
  const animal = normalizeSelectValue(form.value[role].animal)
  if (!animal) return
  form.value[role].animal = animal
  const options = yearOptionsFor(animal)
  if (!options.some(o => o.value === form.value[role].year)) {
    form.value[role].year = options[0]?.value ?? BASE_YEAR
  }
}

function syncAnimalByYear(role: 'male' | 'female') {
  const year = Number(normalizeSelectValue(form.value[role].year))
  if (!year) return
  form.value[role].year = year
  form.value[role].animal = animalForYear(year)
}

watch(() => form.value.female.animal, () => syncYearByAnimal('female'))
watch(() => form.value.female.year, () => syncAnimalByYear('female'))
watch(() => form.value.male.animal, () => syncYearByAnimal('male'))
watch(() => form.value.male.year, () => syncAnimalByYear('male'))

const selectUi = {
  base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 rounded-md text-sm',
  rounded: 'rounded-lg',
  placeholder: 'text-[var(--text-placeholder)]',
  color: {
    white: {
      outline: 'shadow-sm bg-[var(--surface-input)] text-[var(--text-primary)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-2 focus:ring-[var(--accent)]',
    },
  },
}

async function doCalc() {
  const result = await $fetch<CalcResult>('/api/tools/shengxiao-peidui/calc', {
    method: 'POST',
    body: {
      male: form.value.male,
      female: form.value.female,
      locale: locale.value,
    },
  })

  calcResult.value = result
  phase.value = 'result'

  setTimeout(() => startAiStream(), 300)
}

async function handleSubmit() {
  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    await doCalc()
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('shengxiaoPeidui.calcFail'),
      description: err.data?.statusMessage || err.message || t('shengxiaoPeidui.checkInput'),
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
    const response = await fetch('/api/tools/shengxiao-peidui/reading', {
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
            aiError.value = data.message || t('shengxiaoPeidui.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('shengxiaoPeidui.aiUnavailable')
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

const aiCards = computed(() => {
  if (!aiContent.value) return []
  return aiContent.value
    .split('\n---\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map((segment) => {
      return {
        html: marked.parse(segment, { async: false }) as string,
      }
    })
})

const pairHeadline = computed(() => {
  if (!calcResult.value) return ''
  const { zodiacVerdict } = calcResult.value
  const map: Record<string, string> = {
    sanhe: t('shengxiaoPeidui.headlineSanhe'),
    liuhe: t('shengxiaoPeidui.headlineLiuhe'),
    xiangchong: t('shengxiaoPeidui.headlineXiangchong'),
    xianghai: t('shengxiaoPeidui.headlineXianghai'),
    xiangxing: t('shengxiaoPeidui.headlineXiangxing'),
    same: t('shengxiaoPeidui.headlineSame'),
    none: t('shengxiaoPeidui.headlineNone'),
    unknown: t('shengxiaoPeidui.headlineNone'),
  }
  return map[zodiacVerdict.key] || zodiacVerdict.label
})

const shengxiaoEmoji = (animal: string) => {
  const map: Record<string, string> = {
    鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
    马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
  }
  return map[animal] || ''
}

const FAVORABLE_KEYS = ['sanhe', 'liuhe', 'same', 'bihe', 'maleShengfemale', 'femaleShengmale', 'sameGroup']
function verdictClass(key: string): string {
  if (FAVORABLE_KEYS.includes(key)) {
    return 'border-green-500/30 bg-green-500/10 text-green-400'
  }
  if (['xiangchong', 'xianghai', 'xiangxing', 'maleKefemale', 'femaleKemale', 'diffGroup'].includes(key)) {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
  }
  return 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.shengxiaoPeiduiTitle')} - ${siteName}`,
  description: t('seo.shengxiaoPeiduiDesc'),
  keywords: t('seo.shengxiaoPeiduiKeywords'),
  ogTitle: () => `${t('seo.shengxiaoPeiduiOgTitle')} - ${siteName}`,
  ogDescription: t('seo.shengxiaoPeiduiOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/shengxiao-peidui',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.shengxiaoPeiduiTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/shengxiao-peidui',
        description: t('seo.shengxiaoPeiduiDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('shengxiaoPeidui.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/shengxiao-peidui',
          description: t('seo.shengxiaoPeiduiOgDesc'),
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
:deep(.prose h2), :deep(.prose h3), :deep(.prose h4) {
  color: var(--text-primary);
  margin-bottom: 0.5em;
  font-weight: 600;
}
</style>
