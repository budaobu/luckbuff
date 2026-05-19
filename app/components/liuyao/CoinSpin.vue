<template>
  <div class="flex flex-col items-center">
    <div
      class="relative flex items-center justify-center"
      :style="{ width: containerSize, height: containerSize }"
    >
      <!-- 背景光晕 -->
      <div
        class="absolute rounded-full bg-[#c9a227]/[0.05]"
        :style="{ width: glowSize, height: glowSize, filter: 'blur(30px)' }"
      />

      <!-- 外层虚线装饰环（极慢速旋转） -->
      <div
        class="absolute rounded-full border border-dashed border-[#c9a227]/8 coin-outer-dashed"
        :style="{ width: outerSize, height: outerSize }"
      />

      <!-- 铜钱轨道环 -->
      <div
        class="absolute rounded-full border border-[#c9a227]/10 coin-orbit-ring"
        :style="{ width: orbitSize, height: orbitSize }"
      />

      <!-- 3 枚铜钱 -->
      <div
        v-for="(coin, i) in coins"
        :key="i"
        class="absolute flex items-center justify-center coin-wrapper"
        :style="{
          width: coinSize,
          height: coinSize,
          left: `calc(50% + ${Math.cos((i * 120 - 90) * Math.PI / 180) * orbitRadius}px - ${parseInt(coinSize) / 2}px)`,
          top: `calc(50% + ${Math.sin((i * 120 - 90) * Math.PI / 180) * orbitRadius}px - ${parseInt(coinSize) / 2}px)`,
        }"
      >
        <!-- 铜钱主体 -->
        <div
          class="relative w-full h-full rounded-full coin-body"
          :class="`coin-flip-${i}`"
          :style="{
            background: coinBg,
            boxShadow: `0 0 ${isFull ? '20' : '10'}px rgba(201, 162, 39, 0.2), inset 0 1px 2px rgba(255,255,255,0.1)`,
          }"
        >
          <!-- 铜钱外圈 -->
          <div
            class="absolute inset-[3px] rounded-full border border-[#c9a227]/30"
            :style="{ borderColor: 'rgba(201, 162, 39, 0.3)' }"
          />
          <!-- 方孔 -->
          <div
            class="absolute rounded-sm coin-hole"
            :style="{
              width: holeSize,
              height: holeSize,
              top: `calc(50% - ${parseInt(holeSize) / 2}px)`,
              left: `calc(50% - ${parseInt(holeSize) / 2}px)`,
              background: '#0f0c09',
              border: `1px solid rgba(201, 162, 39, 0.2)`,
            }"
          />
          <!-- 铜钱文字/纹饰 -->
          <span
            v-if="!isTiny"
            class="absolute font-bold coin-text"
            :class="`coin-text-${i}`"
            :style="{
              fontSize: textFontSize,
              color: 'rgba(201, 162, 39, 0.7)',
            }"
          >{{ coin.char }}</span>
        </div>
      </div>

      <!-- 中心光圈 -->
      <div
        class="absolute rounded-full flex items-center justify-center coin-center-glow"
        :class="isTiny ? 'border border-[#c9a227]/15' : 'border border-[#c9a227]/20'"
        :style="{
          width: centerSize,
          height: centerSize,
          background: 'radial-gradient(circle at 35% 35%, rgba(201,162,39,0.2), rgba(15,12,9,0.8))',
        }"
      >
        <span
          v-if="!isTiny"
          class="text-[#c9a227] font-bold"
          :style="{ fontSize: centerFontSize }"
        >卦</span>
      </div>
    </div>

    <p
      v-if="label"
      class="text-[#c9a227]/80 tracking-wider font-medium"
      :class="isTiny ? 'mt-2 text-xs' : 'mt-5 text-sm'"
    >
      {{ label }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  size?: 'full' | 'compact' | 'tiny'
}

const props = withDefaults(defineProps<Props>(), {
  label: '铜钱落定，排盘中...',
  size: 'full',
})

// 3 枚铜钱各自的文字
const coins = [
  { char: '元' },
  { char: '亨' },
  { char: '利' },
]

const isFull = computed(() => props.size === 'full')
const isCompact = computed(() => props.size === 'compact')
const isTiny = computed(() => props.size === 'tiny')

const containerSize = computed(() => {
  if (isFull.value) return '280px'
  if (isCompact.value) return '150px'
  return '80px'
})
const glowSize = computed(() => {
  if (isFull.value) return '320px'
  if (isCompact.value) return '170px'
  return '100px'
})
const outerSize = computed(() => {
  if (isFull.value) return '280px'
  if (isCompact.value) return '150px'
  return '80px'
})
const orbitSize = computed(() => {
  if (isFull.value) return '200px'
  if (isCompact.value) return '106px'
  return '58px'
})
const orbitRadius = computed(() => {
  if (isFull.value) return 60
  if (isCompact.value) return 32
  return 17
})
const coinSize = computed(() => {
  if (isFull.value) return '64px'
  if (isCompact.value) return '36px'
  return '20px'
})
const holeSize = computed(() => {
  if (isFull.value) return '12px'
  if (isCompact.value) return '7px'
  return '4px'
})
const textFontSize = computed(() => {
  if (isFull.value) return '10px'
  if (isCompact.value) return '7px'
  return '5px'
})
const centerSize = computed(() => {
  if (isFull.value) return '52px'
  if (isCompact.value) return '30px'
  return '18px'
})
const centerFontSize = computed(() => {
  if (isFull.value) return '22px'
  if (isCompact.value) return '13px'
  return '8px'
})

const coinBg = computed(() => {
  return 'linear-gradient(135deg, rgba(201,162,39,0.25) 0%, rgba(201,162,39,0.12) 50%, rgba(139,92,246,0.08) 100%)'
})
</script>

<style scoped>
/* 外层虚线环 */
.coin-outer-dashed {
  animation: coin-spin-outer 20s linear infinite;
}

/* 铜钱轨道环 */
.coin-orbit-ring {
  animation: coin-spin-orbit 10s linear infinite;
}

/* 铜钱容器 —— 沿轨道公转（反向抵消轨道旋转，让铜钱自转） */
.coin-wrapper {
  animation: coin-orbit 10s linear infinite;
}

/* 3 枚铜钱各自翻转动画，错开延迟 */
.coin-flip-0 {
  animation: coin-flip 2s ease-in-out infinite;
}
.coin-flip-1 {
  animation: coin-flip 2s ease-in-out infinite 0.3s;
}
.coin-flip-2 {
  animation: coin-flip 2s ease-in-out infinite 0.6s;
}

/* 铜钱文字保持不翻转 */
.coin-text-0 {
  animation: coin-counter-flip 2s ease-in-out infinite;
}
.coin-text-1 {
  animation: coin-counter-flip 2s ease-in-out infinite 0.3s;
}
.coin-text-2 {
  animation: coin-counter-flip 2s ease-in-out infinite 0.6s;
}

/* 方孔微光 */
.coin-hole {
  box-shadow: 0 0 4px rgba(201, 162, 39, 0.1);
}

/* 中心脉动 */
.coin-center-glow {
  animation: coin-center-pulse 3s ease-in-out infinite;
}

@keyframes coin-spin-outer {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes coin-spin-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes coin-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes coin-flip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

@keyframes coin-counter-flip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(-180deg); }
}

@keyframes coin-center-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(201, 162, 39, 0.1), 0 0 30px rgba(201, 162, 39, 0.03);
  }
  50% {
    box-shadow: 0 0 25px rgba(201, 162, 39, 0.2), 0 0 50px rgba(201, 162, 39, 0.08);
  }
}
</style>
