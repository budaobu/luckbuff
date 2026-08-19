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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Liunian Fortune</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liunian.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liunian.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('liunian.disclaimer') }}
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

            <!-- 目标流年 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('liunian.yearLabel') }}
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="y in yearOptions"
                  :key="y"
                  type="button"
                  class="px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="targetYear === y
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="targetYear = y"
                >
                  {{ y }}{{ $t('liunian.yearUnit') }}
                </button>
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-2">
                {{ $t('liunian.yearHint') }}
              </p>
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
              {{ $t('liunian.submitBtn') }}
            </UButton>
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
          <p class="text-sm text-[var(--text-muted)]">{{ $t('liunian.calculating') }}</p>
        </div>
      </div>

      <!-- 结果阶段：只有海报 -->
      <div v-if="phase === 'result' && calcResult">
        <div class="max-w-md mx-auto">
          <LiunianPoster
            ref="posterCompRef"
            :target-year="calcResult.targetYear"
            :year-gan-zhi="calcResult.yearGanZhi"
            :day-master="calcResult.dayMaster"
            :shi-shen="calcResult.shiShen"
            :tai-sui="calcResult.taiSui"
            :score="calcResult.score"
            :grade="calcResult.grade"
            :lucky="calcResult.lucky"
            :ai-content="aiContent"
          />
        </div>

        <p class="text-[11px] text-[var(--text-faint)] text-center mt-4 leading-relaxed">
          {{ $t('liunian.disclaimer') }}
        </p>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-6 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('liunian.recalculate') }}
          </UButton>
          <AppShareButton
            tool="liunian"
            :name="formValues.name"
            :summary="`${calcResult.targetYear}${$t('liunian.yearUnit')} · ${calcResult.yearGanZhi.gan}${calcResult.yearGanZhi.zhi}${calcResult.yearGanZhi.shengxiao} · ${$t(`liunian.poster.grade.${calcResult.grade}`)}`"
            :share-target="posterEl"
            :filename="`liunian-${formValues.birthDate}-${calcResult.targetYear}.png`"
            :disabled="aiStreaming"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/auspicious-datetime') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('liunian.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiZhi } from '~/types/user'
import { getNextZodiacYear } from '~/utils/liunian'

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
    year: { gan: string, zhi: string }
    month: { gan: string, zhi: string }
    day: { gan: string, zhi: string }
    hour: { gan: string, zhi: string } | null
  }
  dayMaster: { gan: string, wuxing: string }
  xiyongWuxing: string
  jishenWuxing: string
  targetYear: number
  yearGanZhi: {
    gan: string
    zhi: DiZhi
    shengxiao: string
    ganWuxing: string
    zhiWuxing: string
  }
  shiShen: string
  taiSui: { relation: '值' | '冲' | '刑' | '害' | '合', delta: number } | null
  score: number
  grade: 'daji' | 'ji' | 'ping' | 'xiong' | 'daxiong'
  factors: Array<{ key: string, label: string, delta: number }>
  lucky: { direction: string, wuxing: string, color: string }
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
const defaultYear = getNextZodiacYear()
const targetYear = ref(defaultYear)
const calcResult = ref<CalcResult | null>(null)
const baziFormRef = ref<{ form: FormValues } | null>(null)
const posterCompRef = ref<{ $el: HTMLElement } | null>(null)
// 分享截图直接传海报根元素：传带 max-w 的包裹 div 时，html-to-image 克隆脱离父链后
// width:auto 会失去约束，导出图排版超宽被裁（实测）
const posterEl = computed(() => posterCompRef.value?.$el as HTMLElement | undefined)

const yearOptions = computed(() => {
  const base = defaultYear
  return [base - 1, base, base + 1, base + 2, base + 3, base + 4]
})

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
      title: t('liunian.checkInput'),
      description: t('profileForm.birthDate'),
      color: 'error',
    })
    return
  }

  formValues.value = { ...values }
  lastFormValues.value = { ...values }

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/liunian/calc', {
      method: 'POST',
      body: {
        birthDate: formValues.value.birthDate,
        birthHour: formValues.value.birthHour ?? null,
        targetYear: targetYear.value,
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
      title: t('liunian.calcFail'),
      description: err.data?.statusMessage || err.message || t('liunian.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态（内容只进海报，不单独渲染）
const aiContent = ref('')
const aiStreaming = ref(false)
const aiError = ref<string | null>(null)

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/liunian/reading', {
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
            aiContent.value += data.text
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('liunian.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('liunian.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
    if (aiError.value) {
      toast.add({
        title: t('liunian.aiUnavailable'),
        color: 'warning',
      })
    }
  }
}

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.liunianTitle')} - ${siteName}`,
  description: t('seo.liunianDesc'),
  keywords: t('seo.liunianKeywords'),
  ogTitle: () => `${t('seo.liunianOgTitle')} - ${siteName}`,
  ogDescription: t('seo.liunianOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liunian',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.liunianTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liunian',
        description: t('seo.liunianDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('liunian.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liunian',
          description: t('seo.liunianOgDesc'),
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
