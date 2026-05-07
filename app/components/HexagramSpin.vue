<template>
  <div class="flex flex-col items-center">
    <div
      class="relative flex items-center justify-center"
      :style="{ width: containerSize, height: containerSize }"
    >
      <!-- 背景光晕 -->
      <div
        class="absolute rounded-full bg-[#c9a227]/[0.04]"
        :style="{ width: glowSize, height: glowSize, filter: 'blur(24px)' }"
      />

      <!-- 最外层虚线装饰环（极慢速旋转） -->
      <div
        class="absolute rounded-full border border-dashed border-[#c9a227]/10 outer-dashed-ring"
        :style="{ width: outerSize, height: outerSize }"
      />

      <!-- 外层实线环（慢速反向旋转） -->
      <div
        class="absolute rounded-full border border-[#c9a227]/15 outer-solid-ring"
        :style="{ width: solidRingSize, height: solidRingSize }"
      />

      <!-- 八卦主旋转环 -->
      <div
        class="absolute rounded-full border border-[#c9a227]/20 bagua-ring"
        :style="{ width: baguaRingSize, height: baguaRingSize }"
      >
        <!-- 8 个方位小圆点装饰 -->
        <div
          v-for="i in 8"
          :key="`dot-${i}`"
          class="absolute w-1 h-1 rounded-full bg-[#c9a227]/30"
          :style="{
            left: `calc(50% + ${Math.cos((i * 45 - 90) * Math.PI / 180) * 50}% - 2px)`,
            top: `calc(50% + ${Math.sin((i * 45 - 90) * Math.PI / 180) * 50}% - 2px)`,
          }"
        />

        <!-- 八卦符号 -->
        <div
          v-for="(gua, i) in BAGUA_SYMBOLS"
          :key="gua.name"
          class="absolute flex flex-col items-center justify-center bagua-item"
          :style="{
            width: charSize,
            height: charSize,
            left: `calc(50% + ${Math.cos((i * 45 - 90) * Math.PI / 180) * 50}% - ${parseInt(charSize) / 2}px)`,
            top: `calc(50% + ${Math.sin((i * 45 - 90) * Math.PI / 180) * 50}% - ${parseInt(charSize) / 2}px)`,
          }"
        >
          <span
            class="font-bold text-[#c9a227] leading-none"
            :style="{ fontSize: symbolFontSize }"
          >{{ gua.symbol }}</span>
          <span
            class="text-[#e8e0d0]/50 leading-none mt-0.5"
            :style="{ fontSize: nameFontSize }"
          >{{ gua.name }}</span>
        </div>
      </div>

      <!-- 内圈细环 -->
      <div
        class="absolute rounded-full border border-[#c9a227]/8 inner-ring"
        :style="{ width: innerRingSize, height: innerRingSize }"
      />

      <!-- 中心太极圆盘 -->
      <div
        class="absolute rounded-full flex items-center justify-center center-glow"
        :class="isTiny ? 'border border-[#c9a227]/20' : 'border-2 border-[#c9a227]/25'"
        :style="{
          width: centerSize,
          height: centerSize,
          background: 'radial-gradient(circle at 35% 35%, rgba(201,162,39,0.25), rgba(139,92,246,0.1))',
        }"
      >
        <!-- 太极 SVG -->
        <svg
          v-if="!isTiny"
          viewBox="0 0 100 100"
          class="absolute inset-0 w-full h-full opacity-20"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#c9a227" stroke-width="0.5" />
          <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2" fill="#c9a227" opacity="0.3" />
          <path d="M50,2 A48,48 0 0,0 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2" fill="#e8e0d0" opacity="0.15" />
          <circle cx="50" cy="26" r="6" fill="#1a1612" opacity="0.6" />
          <circle cx="50" cy="74" r="6" fill="#c9a227" opacity="0.5" />
        </svg>
        <span
          class="relative z-10 text-[#c9a227] font-bold"
          :style="{ fontSize: centerFontSize }"
        >易</span>
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
const BAGUA_SYMBOLS = [
  { name: '乾', symbol: '☰' },
  { name: '兑', symbol: '☱' },
  { name: '离', symbol: '☲' },
  { name: '震', symbol: '☳' },
  { name: '巽', symbol: '☴' },
  { name: '坎', symbol: '☵' },
  { name: '艮', symbol: '☶' },
  { name: '坤', symbol: '☷' },
]

interface Props {
  label?: string
  size?: 'full' | 'compact' | 'tiny'
}

const props = withDefaults(defineProps<Props>(), {
  label: '蓍草卜卦中...',
  size: 'full',
})

const isFull = computed(() => props.size === 'full')
const isCompact = computed(() => props.size === 'compact')
const isTiny = computed(() => props.size === 'tiny')

const containerSize = computed(() => {
  if (isFull.value) return '300px'
  if (isCompact.value) return '160px'
  return '80px'
})
const outerSize = computed(() => {
  if (isFull.value) return '300px'
  if (isCompact.value) return '160px'
  return '80px'
})
const solidRingSize = computed(() => {
  if (isFull.value) return '290px'
  if (isCompact.value) return '152px'
  return '76px'
})
const baguaRingSize = computed(() => {
  if (isFull.value) return '260px'
  if (isCompact.value) return '136px'
  return '68px'
})
const innerRingSize = computed(() => {
  if (isFull.value) return '110px'
  if (isCompact.value) return '58px'
  return '30px'
})
const centerSize = computed(() => {
  if (isFull.value) return '72px'
  if (isCompact.value) return '40px'
  return '22px'
})
const glowSize = computed(() => {
  if (isFull.value) return '340px'
  if (isCompact.value) return '180px'
  return '100px'
})
const charSize = computed(() => {
  if (isFull.value) return '52px'
  if (isCompact.value) return '28px'
  return '16px'
})
const symbolFontSize = computed(() => {
  if (isFull.value) return '26px'
  if (isCompact.value) return '15px'
  return '10px'
})
const nameFontSize = computed(() => {
  if (isFull.value) return '13px'
  if (isCompact.value) return '8px'
  return '6px'
})
const centerFontSize = computed(() => {
  if (isFull.value) return '28px'
  if (isCompact.value) return '16px'
  return '10px'
})
</script>

<style scoped>
/* 外层虚线环：极慢速顺时针 */
.outer-dashed-ring {
  animation: spin-dashed 24s linear infinite;
}

/* 外层实线环：慢速逆时针 */
.outer-solid-ring {
  animation: spin-solid 16s linear infinite reverse;
}

/* 八卦主环：中速顺时针 */
.bagua-ring {
  animation: spin-bagua 12s linear infinite;
}

/* 八卦项：反向旋转保持正立 */
.bagua-item {
  animation: spin-bagua 12s linear infinite reverse;
}

/* 内圈细环：慢速顺时针 */
.inner-ring {
  animation: spin-inner 20s linear infinite;
}

/* 中心脉动发光 */
.center-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes spin-dashed {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-solid {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-bagua {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-inner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(201, 162, 39, 0.15), 0 0 40px rgba(201, 162, 39, 0.05);
  }
  50% {
    box-shadow: 0 0 30px rgba(201, 162, 39, 0.25), 0 0 60px rgba(201, 162, 39, 0.1);
  }
}
</style>
