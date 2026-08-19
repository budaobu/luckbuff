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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Jin Suo Yu Guan Feng Shui</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('jinsuoyuguan.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('jinsuoyuguan.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('jinsuoyuguan.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 房屋朝向角度 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('jinsuoyuguan.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.direction"
                type="number"
                :min="0"
                :max="360"
                :placeholder="$t('jinsuoyuguan.directionPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('jinsuoyuguan.directionHint') }}
              </p>

              <!-- 可视化罗盘 -->
              <FengshuiCompassInput v-model="form.direction" />
            </div>

            <!-- 房屋用途 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('jinsuoyuguan.usageLabel') }} <span class="text-[var(--text-faint)]">（{{ $t('common.optional') }}）</span>
              </label>
              <div class="flex gap-3">
                <button
                  v-for="opt in usageOptions"
                  :key="opt.value"
                  type="button"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.usage === opt.value
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.usage = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- 户型要素：八宫砂水 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('jinsuoyuguan.layoutLabel') }}
              </label>
              <p class="text-[11px] text-[var(--text-faint)] mb-3">
                {{ $t('jinsuoyuguan.layoutHint') }}
              </p>
              <div class="grid grid-cols-3 gap-2">
                <template v-for="cell in formGridCells" :key="cell.key">
                  <!-- 中宫立极提示 -->
                  <div
                    v-if="cell.key === 'zhong'"
                    class="rounded-lg border border-dashed border-[var(--border-light)] bg-[var(--surface-input)]/50 flex flex-col items-center justify-center p-3 text-center"
                  >
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-[var(--accent-muted)] mb-1" />
                    <span class="text-[10px] text-[var(--text-faint)] leading-snug">
                      {{ $t('jinsuoyuguan.centerLabel') }}
                    </span>
                  </div>
                  <!-- 八宫要素选择 -->
                  <div
                    v-else
                    class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-input)] p-2"
                  >
                    <div class="flex items-baseline justify-between mb-1.5 px-0.5">
                      <span class="text-xs font-semibold text-[var(--text-primary)]">
                        {{ $t(`jinsuoyuguan.palaceNames.${cell.key}`) }}<span class="text-[var(--text-faint)] font-normal">·{{ $t(`jinsuoyuguan.palaceDirs.${cell.key}`) }}</span>
                      </span>
                      <span class="text-[9px] text-[var(--text-faint)]">
                        {{ cell.wants === 'sha' ? $t('jinsuoyuguan.wantsSha') : $t('jinsuoyuguan.wantsShui') }}
                      </span>
                    </div>
                    <div class="grid grid-cols-2 gap-1">
                      <button
                        v-for="el in elementKeys"
                        :key="el"
                        type="button"
                        class="px-0.5 py-1 rounded text-[10px] leading-tight border transition-all duration-150 truncate"
                        :class="cell.selected.includes(el)
                          ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                          : 'border-transparent bg-[var(--surface-card)] text-[var(--text-faint)] hover:border-[var(--border-light)]'"
                        @click="toggleElement(cell.key, el)"
                      >
                        {{ $t(`jinsuoyuguan.elements.${el}`) }}
                      </button>
                    </div>
                  </div>
                </template>
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
              {{ $t('jinsuoyuguan.submitBtn') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-calculator" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('jinsuoyuguan.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果（只有海报） ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div class="max-w-md mx-auto">
          <JinsuoyuguanPoster
            ref="posterCompRef"
            :direction="calcResult.direction"
            :facing="calcResult.facing"
            :sitting="calcResult.sitting"
            :usage="calcResult.usage"
            :palaces="calcResult.palaces"
            :score="calcResult.score"
            :grade="calcResult.grade"
            :best="calcResult.best"
            :worst="calcResult.worst"
            :ai-content="aiContent"
          />
        </div>

        <p class="text-[11px] text-[var(--text-faint)] text-center mt-4 leading-relaxed">
          {{ $t('jinsuoyuguan.disclaimer') }}
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
            {{ $t('jinsuoyuguan.recalculate') }}
          </UButton>
          <AppShareButton
            tool="jinsuoyuguan-fengshui"
            :summary="`${posterSummary}`"
            :share-target="posterEl"
            :filename="`jinsuoyuguan-${new Date().toISOString().slice(0, 10)}.png`"
            :disabled="aiStreaming"
          />
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/fengshui') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('jinsuoyuguan.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type PalaceKey = 'kan' | 'kun' | 'zhen' | 'xun' | 'qian' | 'dui' | 'gen' | 'li'
type ElementKey =
  | 'door'
  | 'window'
  | 'balcony'
  | 'bathroom'
  | 'kitchen'
  | 'tallFurniture'
  | 'appliance'
  | 'aquarium'

interface PalaceResult {
  key: PalaceKey
  wants: 'sha' | 'shui'
  theme: string
  elements: ElementKey[]
  score: number
  status: 'ji' | 'xiong' | 'ping'
  fixKeys: string[]
}

interface CalcResult {
  direction: number
  facing: PalaceKey
  sitting: PalaceKey
  usage?: string
  palaces: PalaceResult[]
  score: number
  grade: 'daji' | 'ji' | 'ping' | 'xiong' | 'daxiong'
  best: PalaceKey | null
  worst: PalaceKey | null
  locale: string
}

const PALACE_WANTS: Record<PalaceKey, 'sha' | 'shui'> = {
  kan: 'sha',
  kun: 'sha',
  zhen: 'sha',
  xun: 'sha',
  qian: 'shui',
  dui: 'shui',
  gen: 'shui',
  li: 'shui',
}

const { t, locale } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive({
  direction: undefined as number | undefined,
  usage: 'residential' as 'residential' | 'office' | 'shop',
  layout: Object.fromEntries(
    (Object.keys(PALACE_WANTS) as PalaceKey[]).map(k => [k, [] as ElementKey[]]),
  ) as Record<PalaceKey, ElementKey[]>,
})
const calcResult = ref<CalcResult | null>(null)
const posterCompRef = ref<{ $el: HTMLElement } | null>(null)
// 分享截图直接传海报根元素：传带 max-w 的包裹 div 时，html-to-image 克隆脱离父链后
// width:auto 会失去约束，导出图排版超宽被裁（与 liunian 同款处理）
const posterEl = computed(() => posterCompRef.value?.$el as HTMLElement | undefined)

const elementKeys: ElementKey[] = ['door', 'window', 'balcony', 'bathroom', 'kitchen', 'tallFurniture', 'appliance', 'aquarium']

// 表单九宫格按上南下北排列：巽 离 坤 / 震 中 兑 / 艮 坎 乾
const formGridCells = computed(() => {
  const order: Array<PalaceKey | 'zhong'> = ['xun', 'li', 'kun', 'zhen', 'zhong', 'dui', 'gen', 'kan', 'qian']
  return order.map((key) => {
    if (key === 'zhong') return { key: 'zhong' as const }
    return {
      key,
      wants: PALACE_WANTS[key],
      selected: form.layout[key],
    }
  })
})

const usageOptions = computed(() => [
  { value: 'residential' as const, label: t('jinsuoyuguan.usageOptions.residential') },
  { value: 'office' as const, label: t('jinsuoyuguan.usageOptions.office') },
  { value: 'shop' as const, label: t('jinsuoyuguan.usageOptions.shop') },
])

const canSubmit = computed(() => {
  return form.direction !== undefined && form.direction >= 0 && form.direction <= 360
})

function toggleElement(palace: PalaceKey, el: ElementKey) {
  const list = form.layout[palace]
  const idx = list.indexOf(el)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(el)
}

const posterSummary = computed(() => {
  if (!calcResult.value) return ''
  return `${t('jinsuoyuguan.poster.sittingPrefix')}${t(`jinsuoyuguan.palaceNames.${calcResult.value.sitting}`)}${t('jinsuoyuguan.poster.facingPrefix')}${t(`jinsuoyuguan.palaceNames.${calcResult.value.facing}`)} · ${t(`jinsuoyuguan.poster.grade.${calcResult.value.grade}`)}`
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/jinsuoyuguan-fengshui/calc', {
      method: 'POST',
      body: {
        direction: form.direction,
        layout: form.layout,
        usage: form.usage,
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
      title: t('jinsuoyuguan.calcFail'),
      description: err.data?.statusMessage || err.message || t('jinsuoyuguan.checkInput'),
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
    const response = await fetch('/api/tools/jinsuoyuguan-fengshui/reading', {
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
            aiError.value = data.message || t('jinsuoyuguan.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('jinsuoyuguan.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
    if (aiError.value) {
      toast.add({
        title: t('jinsuoyuguan.aiUnavailable'),
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

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.jinsuoyuguanTitle')} - ${siteName}`,
  description: t('seo.jinsuoyuguanDesc'),
  keywords: t('seo.jinsuoyuguanKeywords'),
  ogTitle: () => `${t('seo.jinsuoyuguanOgTitle')} - ${siteName}`,
  ogDescription: t('seo.jinsuoyuguanOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/jinsuoyuguan-fengshui',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.jinsuoyuguanTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/jinsuoyuguan-fengshui',
        description: t('seo.jinsuoyuguanDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('jinsuoyuguan.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/jinsuoyuguan-fengshui',
          description: t('seo.jinsuoyuguanOgDesc'),
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
