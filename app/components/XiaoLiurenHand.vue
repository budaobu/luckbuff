<template>
  <div class="relative w-80 h-[26rem] mx-auto select-none">
    <svg viewBox="0 0 300 420" class="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="palmSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--surface-card)" />
          <stop offset="100%" stop-color="var(--surface-card-hover)" />
        </linearGradient>
        <linearGradient id="fingerSkin" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="var(--surface-card-hover)" />
          <stop offset="100%" stop-color="var(--surface-card)" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- 左手掌：掌心朝向观者 -->
      <g class="hand">
        <!-- 手腕 -->
        <rect x="95" y="360" width="110" height="45" rx="22" fill="url(#palmSkin)" stroke="var(--border-medium)" stroke-width="2" />

        <!-- 手掌 -->
        <ellipse cx="150" cy="290" rx="85" ry="75" fill="url(#palmSkin)" stroke="var(--border-medium)" stroke-width="2" />

        <!-- 四指：小指、无名指、中指、食指 -->
        <g class="fingers">
          <!-- 食指 -->
          <rect x="185" y="60" width="34" height="180" rx="17" fill="url(#fingerSkin)" stroke="var(--border-medium)" stroke-width="2" />
          <!-- 中指 -->
          <rect x="133" y="20" width="36" height="220" rx="18" fill="url(#fingerSkin)" stroke="var(--border-medium)" stroke-width="2" />
          <!-- 无名指 -->
          <rect x="81" y="50" width="34" height="190" rx="17" fill="url(#fingerSkin)" stroke="var(--border-medium)" stroke-width="2" />
          <!-- 小指 -->
          <rect x="35" y="110" width="28" height="130" rx="14" fill="url(#fingerSkin)" stroke="var(--border-medium)" stroke-width="2" />
        </g>

        <!-- 指节纹理 -->
        <g stroke="var(--border-light)" stroke-width="2" fill="none" opacity="0.6">
          <!-- 食指指节 -->
          <line x1="185" y1="130" x2="219" y2="130" />
          <!-- 中指指节 -->
          <line x1="133" y1="100" x2="169" y2="100" />
          <!-- 无名指指节 -->
          <line x1="81" y1="120" x2="115" y2="120" />
          <!-- 小指指节 -->
          <line x1="35" y1="165" x2="63" y2="165" />
        </g>

        <!-- 大拇指 -->
        <g class="thumb-base">
          <path
            d="M 210 285
               C 245 280, 275 260, 285 230
               C 292 210, 278 195, 260 205
               C 240 215, 225 240, 215 265
               C 210 275, 208 285, 210 285 Z"
            fill="url(#palmSkin)"
            stroke="var(--border-medium)"
            stroke-width="2"
          />
        </g>
      </g>

      <!-- 宫位标记 -->
      <g class="markers">
        <g
          v-for="(pos, index) in positions"
          :key="pos.name"
          class="marker"
          :class="{ 'is-active': activeIndex === index }"
        >
          <circle
            :cx="pos.x"
            :cy="pos.y"
            r="18"
            class="marker-circle"
          />
          <text
            :x="pos.x"
            :y="pos.y + 5"
            text-anchor="middle"
            font-size="14"
            font-weight="bold"
            class="marker-text"
          >{{ pos.label }}</text>
        </g>
      </g>

      <!-- 大拇指指尖（动态） -->
      <g
        class="thumb-tip"
        :transform="`translate(${thumbPos.x}, ${thumbPos.y}) rotate(${thumbPos.rotate})`"
      >
        <path
          d="M -8 48
             C -14 48, -16 28, -11 12
             C -6 -2, 6 -2, 11 12
             C 16 28, 14 48, 8 48 Z"
          fill="url(#palmSkin)"
          stroke="var(--border-medium)"
          stroke-width="2"
        />
        <ellipse cx="0" cy="10" rx="5" ry="8" fill="#fff" opacity="0.3" />
      </g>
    </svg>

    <!-- 当前宫名 -->
    <div class="absolute bottom-0 left-0 right-0 text-center">
      <div
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium shadow-lg transition-all duration-300"
        :style="{
          borderColor: 'var(--accent-border)',
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--accent)',
        }"
      >
        <span class="text-lg font-bold">{{ activePosition.name }}</span>
        <span class="text-xs opacity-90">{{ activePosition.finger }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  activeIndex: 0,
})

// 左手掌心朝向观者，手指向上
// 从左到右：小指、无名指、中指、食指；大拇指在右侧
const positions = [
  { name: '大安', label: '安', x: 202, y: 200, finger: '食指根节' },
  { name: '留连', label: '留', x: 202, y: 78, finger: '食指尖' },
  { name: '速喜', label: '喜', x: 151, y: 48, finger: '中指尖' },
  { name: '赤口', label: '口', x: 98, y: 78, finger: '无名指尖' },
  { name: '小吉', label: '吉', x: 98, y: 200, finger: '无名指根节' },
  { name: '空亡', label: '空', x: 151, y: 212, finger: '中指根节' },
]

// 大拇指指尖位置，让它看起来正好掐到对应宫位
const thumbTargets = [
  { x: 190, y: 190, rotate: -25 },   // 大安
  { x: 192, y: 70, rotate: -10 },    // 留连
  { x: 142, y: 40, rotate: 0 },      // 速喜
  { x: 88, y: 70, rotate: 10 },      // 赤口
  { x: 86, y: 190, rotate: 25 },     // 小吉
  { x: 140, y: 202, rotate: 0 },     // 空亡
]

const activeIndexSafe = computed(() => ((props.activeIndex % 6) + 6) % 6)
const activePosition = computed(() => positions[activeIndexSafe.value]!)
const thumbPos = computed(() => thumbTargets[activeIndexSafe.value]!)
</script>

<style scoped>
.thumb-tip {
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.marker {
  transition: opacity 0.3s ease;
}

.marker-circle {
  transition: all 0.3s ease;
  stroke-width: 2;
}

.marker-text {
  transition: fill 0.3s ease;
  font-size: 14px;
}

.marker.is-active .marker-circle {
  fill: var(--accent);
  stroke: var(--accent-border-hover);
  filter: url(#glow);
}

.marker.is-active .marker-text {
  fill: #fff;
}

.marker:not(.is-active) .marker-circle {
  fill: var(--surface-card);
  stroke: var(--border-medium);
}

.marker:not(.is-active) .marker-text {
  fill: var(--text-muted);
}
</style>
