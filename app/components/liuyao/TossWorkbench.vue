<template>
  <div class="space-y-5">
    <!-- 投掷按钮区 -->
    <div class="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-[#f5e6c0]">{{ $t('tossWorkbench.title') }}</h3>
          <p class="text-[11px] text-[#e8e0d0]/30 mt-0.5">
            {{ completed ? $t('tossWorkbench.tossComplete') : $t('tossWorkbench.tossProgress', { n: currentToss }) }}
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            v-for="i in 6"
            :key="i"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="i <= currentToss - 1 ? 'bg-[#c9a227]' : 'bg-white/10'"
          />
        </div>
      </div>

      <!-- 投掷中动画区 -->
      <div v-if="tossing" class="flex items-center justify-center py-8">
        <div class="flex items-center gap-5">
          <div
            v-for="(animCoin, ci) in tossingCoins"
            :key="ci"
            class="toss-animation"
            :style="{ animationDelay: ci * 0.1 + 's' }"
          >
            <LiuyaoCopperCoin :is-back="animCoin.isBack" :size="52" />
          </div>
        </div>
      </div>

      <!-- 投掷按钮 -->
      <UButton
        v-else
        color="warning"
        size="lg"
        block
        :disabled="completed"
        class="relative overflow-hidden shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
        @click="doToss"
      >
        <template #leading>
          <UIcon
            name="i-heroicons-currency-yen"
            class="w-5 h-5 transition-transform"
          />
        </template>
        {{ completed ? $t('tossWorkbench.tossDone') : $t('tossWorkbench.tossBtn') }}
      </UButton>

      <!-- 重置 -->
      <div v-if="tossRecords.length > 0 && !tossing" class="flex justify-center mt-3">
        <button
          type="button"
          class="text-[11px] text-[#e8e0d0]/30 hover:text-red-400 transition-colors"
          @click="reset"
        >
          {{ $t('tossWorkbench.resetBtn') }}
        </button>
      </div>
    </div>

    <!-- 爻象展示区 —— 自下而上堆叠 -->
    <div v-if="tossRecords.length > 0" class="space-y-1">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] text-[#e8e0d0]/30">{{ $t('tossWorkbench.recordLabel') }}</span>
        <span class="text-[10px] text-[#e8e0d0]/20">{{ $t('tossWorkbench.recordHint') }}</span>
      </div>

      <div class="space-y-1.5">
        <div
          v-for="(record, index) in displayLines"
          :key="index"
          class="flex items-center gap-3 rounded-xl border transition-all duration-500"
          :class="lineCardClass(record)"
        >
          <!-- 爻位标签 -->
          <div class="shrink-0 w-12 text-center">
            <span class="text-[10px] text-[#e8e0d0]/40 block">{{ $t('tossWorkbench.tossLabel', { n: record.tossIndex }) }}</span>
            <span class="text-xs font-medium" :class="record.isMoving ? 'text-[#c9a227]' : 'text-[#e8e0d0]/60'">
              {{ record.label }}
            </span>
          </div>

          <!-- 3 枚铜钱可视化 -->
          <div class="flex-1 flex items-center justify-center py-2">
            <div class="flex items-center gap-2.5">
              <div
                v-for="(coin, ci) in record.coins"
                :key="ci"
                class="flex flex-col items-center gap-1"
              >
                <LiuyaoCopperCoin :is-back="coin.isBack" :size="40" />
                <span
                  class="text-[9px] leading-none"
                  :class="coin.isBack ? 'text-[#c9a227]/60' : 'text-[#e8e0d0]/25'"
                >
                  {{ coin.isBack ? '3' : '2' }}
                </span>
              </div>
              <!-- 等号与爻值 -->
              <div class="flex flex-col items-center ml-2">
                <span class="text-[#e8e0d0]/20 text-xs leading-none">=</span>
                <span
                  class="text-sm font-bold mt-1"
                  :class="record.isMoving ? 'text-[#c9a227]' : 'text-[#e8e0d0]/50'"
                >
                  {{ record.value }}
                </span>
              </div>
            </div>
          </div>

          <!-- 动爻标记 -->
          <div class="shrink-0 w-10 text-center">
            <span v-if="record.isMoving" class="text-[10px] text-[#c9a227]/60">
              {{ record.value === 6 ? $t('tossWorkbench.yinOld') : $t('tossWorkbench.yangOld') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LineValue } from '~/types/liuyao'

const { t } = useI18n()

interface CoinResult {
  isBack: boolean // true=背(3), false=字(2)
}

interface TossRecord {
  tossIndex: number
  label: string
  value: LineValue
  isMoving: boolean
  coins: CoinResult[]
}

const emit = defineEmits<{
  update: [values: LineValue[]]
}>()

const tossRecords = reactive<TossRecord[]>([])
const tossing = ref(false)

// 投掷动画中的铜钱状态（随机闪烁）
const tossingCoins = ref<CoinResult[]>([
  { isBack: true }, { isBack: false }, { isBack: true },
])

const currentToss = computed(() => tossRecords.length + 1)
const completed = computed(() => tossRecords.length >= 6)

const YAO_KEYS = ['tossWorkbench.yao1', 'tossWorkbench.yao2', 'tossWorkbench.yao3', 'tossWorkbench.yao4', 'tossWorkbench.yao5', 'tossWorkbench.yao6'] as const

// 展示顺序：自下而上（index 0 = 初爻在下 → unshift → index 0 = 上爻在上）
const displayLines = computed((): TossRecord[] => {
  const lines: TossRecord[] = []
  for (let i = 0; i < tossRecords.length; i++) {
    const record = { ...tossRecords[i] }
    lines.unshift(record)
  }
  return lines
})

function lineCardClass(record: TossRecord): string {
  const base = 'bg-white/[0.02] border-white/[0.06]'
  if (record.isMoving) {
    return `${base} border-l-2 border-l-[#c9a227]/40`
  }
  return base
}

// 投掷动画中铜钱快速闪烁切换
let flickerInterval: ReturnType<typeof setInterval> | null = null

function doToss() {
  if (tossing.value || completed.value) return
  tossing.value = true

  // 快速随机切换铜钱正反面，模拟翻滚效果
  flickerInterval = setInterval(() => {
    tossingCoins.value = [
      { isBack: Math.random() < 0.5 },
      { isBack: Math.random() < 0.5 },
      { isBack: Math.random() < 0.5 },
    ]
  }, 80)

  // 800ms 后停止翻滚，显示最终结果
  setTimeout(() => {
    if (flickerInterval) {
      clearInterval(flickerInterval)
      flickerInterval = null
    }

    const coin1: CoinResult = { isBack: Math.random() < 0.5 }
    const coin2: CoinResult = { isBack: Math.random() < 0.5 }
    const coin3: CoinResult = { isBack: Math.random() < 0.5 }
    const coins = [coin1, coin2, coin3]

    // 设置最终状态（停止闪烁）
    tossingCoins.value = [...coins]

    const sum = coins.reduce((acc, c) => acc + (c.isBack ? 3 : 2), 0)
    const value = sum as LineValue
    const isMoving = value === 6 || value === 9

    tossRecords.push({
      tossIndex: tossRecords.length + 1,
      label: t(YAO_KEYS[tossRecords.length]),
      value,
      isMoving,
      coins,
    })

    emit('update', tossRecords.map(r => r.value))

    // 短暂停顿后关闭动画区
    setTimeout(() => {
      tossing.value = false
    }, 400)
  }, 800)
}

function reset() {
  if (flickerInterval) {
    clearInterval(flickerInterval)
    flickerInterval = null
  }
  tossing.value = false
  tossRecords.splice(0, tossRecords.length)
  emit('update', [])
}

defineExpose({
  lineValues: () => tossRecords.map(r => r.value),
  reset,
  isComplete: () => tossRecords.length === 6,
})
</script>

<style scoped>
/* 投掷动画：铜钱抛起→旋转→落下 */
.toss-animation {
  animation: toss-bounce 0.8s ease-in-out infinite;
}

@keyframes toss-bounce {
  0% {
    transform: translateY(0) rotateY(0deg) scale(1);
    opacity: 1;
  }
  20% {
    transform: translateY(-40px) rotateY(180deg) scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-60px) rotateY(540deg) scale(1.15);
    opacity: 0.7;
  }
  80% {
    transform: translateY(-15px) rotateY(900deg) scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: translateY(0) rotateY(1080deg) scale(1);
    opacity: 1;
  }
}
</style>
