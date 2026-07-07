<template>
  <div class="space-y-5">
    <!-- 投掷按钮区 -->
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('jiaobeiWorkbench.title') }}</h3>
          <p class="text-[11px] text-[var(--text-placeholder)] mt-0.5">
            {{ completed ? $t('jiaobeiWorkbench.tossComplete') : $t('jiaobeiWorkbench.tossProgress', { n: currentToss }) }}
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            v-for="i in 3"
            :key="i"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="i <= currentToss - 1 ? 'bg-[var(--accent)]' : 'bg-[var(--surface-card-hover)]'"
          />
        </div>
      </div>

      <!-- 3D 动画区 -->
      <div v-if="tossing" class="w-full">
        <ClientOnly>
          <JiaobeiSceneLazy
            :toss="currentTossSymbol"
            :trigger="animationTrigger"
            :duration="2200"
            class="w-full"
            @complete="onAnimationComplete"
          />
          <template #fallback>
            <div class="flex items-center justify-center min-h-[220px]">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-[var(--accent)] animate-spin" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- 当前一掷结果 -->
      <div
        v-else-if="lastToss"
        class="flex flex-col items-center justify-center py-6 rounded-xl border border-[var(--accent-border)]/30 bg-[var(--accent-bg)]/20"
      >
        <span class="text-[11px] text-[var(--accent-muted)] mb-2">{{ $t('jiaobeiWorkbench.currentToss', { n: tossRecords.length }) }}</span>
        <div class="flex items-center gap-3">
          <div
            v-for="(side, idx) in lastToss.sides"
            :key="idx"
            class="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-lg font-bold"
            :class="sideClass(side)"
          >
            {{ side.label }}
          </div>
          <span class="text-xl font-bold text-[var(--accent)]">=</span>
          <span class="text-xl font-bold px-3 py-1 rounded-lg border" :class="resultClass(lastToss.symbol)">{{ lastToss.symbolLabel }}</span>
        </div>
      </div>

      <!-- 投掷按钮 -->
      <UButton
        v-if="!completed"
        color="warning"
        size="lg"
        block
        :disabled="tossing"
        class="relative overflow-hidden shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300 mt-4"
        @click="doToss"
      >
        <template #leading>
          <UIcon name="i-heroicons-hand-raised" class="w-5 h-5" />
        </template>
        {{ tossing ? $t('jiaobeiWorkbench.tossing') : $t('jiaobeiWorkbench.tossBtn') }}
      </UButton>

      <!-- 查看结果按钮 -->
      <UButton
        v-else
        color="warning"
        size="lg"
        block
        class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300 mt-4"
        @click="emitComplete"
      >
        <template #leading>
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
        </template>
        {{ $t('jiaobeiWorkbench.viewResult') }}
      </UButton>

      <!-- 重置 -->
      <div v-if="tossRecords.length > 0 && !tossing" class="flex justify-center mt-3">
        <button
          type="button"
          class="text-[11px] text-[var(--text-placeholder)] hover:text-red-400 transition-colors"
          @click="reset"
        >
          {{ $t('jiaobeiWorkbench.resetBtn') }}
        </button>
      </div>
    </div>

    <!-- 历史记录 -->
    <div v-if="tossRecords.length > 0" class="space-y-1">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] text-[var(--text-placeholder)]">{{ $t('jiaobeiWorkbench.recordLabel') }}</span>
        <span class="text-[10px] text-[var(--text-placeholder)]">{{ $t('jiaobeiWorkbench.recordHint') }}</span>
      </div>

      <div class="space-y-1.5">
        <div
          v-for="(record, index) in tossRecords"
          :key="index"
          class="flex items-center gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-2"
        >
          <div class="shrink-0 w-12 text-center">
            <span class="text-[10px] text-[var(--text-faint)] block">{{ $t('jiaobeiWorkbench.tossLabel', { n: index + 1 }) }}</span>
          </div>

          <div class="flex-1 flex items-center justify-center py-1">
            <div class="flex items-center gap-2.5">
              <div
                v-for="(side, sIdx) in record.sides"
                :key="sIdx"
                class="w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold"
                :class="sideClass(side)"
              >
                {{ side.label }}
              </div>
              <span class="text-[var(--text-placeholder)] text-sm">=</span>
              <span class="text-sm font-bold" :class="resultClass(record.symbol)">{{ record.symbolLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface TossSide {
  symbol: 'flat' | 'convex'
  label: string
}

interface TossRecord {
  symbol: 'holy' | 'laugh' | 'yin'
  symbolLabel: string
  sides: TossSide[]
  comboChar: string
}

const emit = defineEmits<{
  complete: [combo: string]
}>()

const JiaobeiSceneLazy = defineAsyncComponent(() => import('~/components/JiaobeiScene.vue'))

const tossRecords = reactive<TossRecord[]>([])
const tossing = ref(false)
const animationTrigger = ref(0)
const currentTossSymbol = ref('圣')
const lastToss = ref<TossRecord | null>(null)

const currentToss = computed(() => tossRecords.length + 1)
const completed = computed(() => tossRecords.length >= 3)

const SYMBOL_WEIGHTS: { key: 'holy' | 'laugh' | 'yin'; char: string; labelKey: string }[] = [
  { key: 'holy', char: '圣', labelKey: 'jiaobei.tossHoly' },
  { key: 'laugh', char: '笑', labelKey: 'jiaobei.tossLaugh' },
  { key: 'yin', char: '阴', labelKey: 'jiaobei.tossYin' },
]

function randomSymbol(): typeof SYMBOL_WEIGHTS[number] {
  const r = Math.random()
  // 圣杯 ~1/2, 笑杯 ~1/4, 阴杯 ~1/4 (two independent cups: P(one flat one convex)=1/2)
  if (r < 0.5) return SYMBOL_WEIGHTS[0]!
  if (r < 0.75) return SYMBOL_WEIGHTS[1]!
  return SYMBOL_WEIGHTS[2]!
}

function buildTossRecord(symbol: { key: 'holy' | 'laugh' | 'yin'; char: string; labelKey: string }): TossRecord {
  let sides: TossSide[]
  if (symbol.key === 'holy') {
    sides = [
      { symbol: 'flat', label: t('jiaobeiWorkbench.flat') },
      { symbol: 'convex', label: t('jiaobeiWorkbench.convex') },
    ]
  } else if (symbol.key === 'laugh') {
    sides = [
      { symbol: 'flat', label: t('jiaobeiWorkbench.flat') },
      { symbol: 'flat', label: t('jiaobeiWorkbench.flat') },
    ]
  } else {
    sides = [
      { symbol: 'convex', label: t('jiaobeiWorkbench.convex') },
      { symbol: 'convex', label: t('jiaobeiWorkbench.convex') },
    ]
  }

  return {
    symbol: symbol.key,
    symbolLabel: t(symbol.labelKey),
    sides,
    comboChar: symbol.char,
  }
}

function doToss() {
  if (tossing.value || completed.value) return
  tossing.value = true
  const symbol = randomSymbol()
  currentTossSymbol.value = symbol.char
  animationTrigger.value++
}

function onAnimationComplete() {
  const symbol = SYMBOL_WEIGHTS.find(s => s.char === currentTossSymbol.value)!
  const record = buildTossRecord(symbol)
  tossRecords.push(record)
  lastToss.value = record
  tossing.value = false

  if (completed.value) {
    setTimeout(() => emitComplete(), 600)
  }
}

function emitComplete() {
  const combo = tossRecords.map(r => r.comboChar).join('')
  emit('complete', combo)
}

function reset() {
  tossRecords.splice(0, tossRecords.length)
  lastToss.value = null
  tossing.value = false
  animationTrigger.value = 0
}

function sideClass(side: TossSide) {
  if (side.symbol === 'flat') return 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
  return 'border-[var(--accent-muted)] text-[var(--accent-muted)] bg-[var(--accent-muted)]/10'
}

function resultClass(symbol: string) {
  if (symbol === 'holy') return 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]'
  if (symbol === 'laugh') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  return 'border-purple-500/30 bg-purple-500/10 text-purple-400'
}

defineExpose({
  reset,
  isComplete: () => tossRecords.length === 3,
  getCombo: () => tossRecords.map(r => r.comboChar).join(''),
})
</script>
