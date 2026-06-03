<template>
  <div class="flex flex-col items-center">
    <div
      class="relative flex items-center justify-center"
      :style="{ width: containerSize, height: containerSize }"
    >
      <!-- 外圆：地支 -->
      <div
        class="outer-ring absolute rounded-full border border-[var(--accent-border-hover)]"
        :style="{ width: outerSize, height: outerSize }"
      >
        <div
          v-for="(zhi, i) in DI_ZHI"
          :key="zhi"
          class="zhi-char absolute text-[var(--accent)] font-bold flex items-center justify-center"
          :style="{
            width: charSize,
            height: charSize,
            fontSize: charFontSize,
            left: `calc(50% + ${Math.cos((i * 30 - 90) * Math.PI / 180) * 50}% - ${parseInt(charSize) / 2}px)`,
            top: `calc(50% + ${Math.sin((i * 30 - 90) * Math.PI / 180) * 50}% - ${parseInt(charSize) / 2}px)`,
          }"
        >
          {{ zhi }}
        </div>
      </div>

      <!-- 内圆：天干 -->
      <div
        class="inner-ring absolute rounded-full border border-[var(--accent-border)]"
        :style="{ width: innerSize, height: innerSize }"
      >
        <div
          v-for="(gan, i) in TIAN_GAN"
          :key="gan"
          class="gan-char absolute text-[var(--text-primary)] font-medium flex items-center justify-center"
          :style="{
            width: innerCharSize,
            height: innerCharSize,
            fontSize: innerCharFontSize,
            left: `calc(50% + ${Math.cos((i * 36 - 90) * Math.PI / 180) * 50}% - ${parseInt(innerCharSize) / 2}px)`,
            top: `calc(50% + ${Math.sin((i * 36 - 90) * Math.PI / 180) * 50}% - ${parseInt(innerCharSize) / 2}px)`,
          }"
        >
          {{ gan }}
        </div>
      </div>

      <!-- 中心太极 -->
      <div
        class="absolute rounded-full bg-gradient-to-br from-[var(--accent-bg-hover)] to-[var(--accent-purple-faint)] flex items-center justify-center"
        :style="{ width: centerSize, height: centerSize }"
      >
        <svg viewBox="0 0 100 100" class="w-3/4 h-3/4 opacity-60">
          <circle cx="50" cy="50" r="48" fill="none" stroke="#c9a227" stroke-width="1" />
          <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2" fill="#c9a227" opacity="0.8" />
          <path d="M50,2 A48,48 0 0,0 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2" fill="#e8e0d0" opacity="0.8" />
          <circle cx="50" cy="26" r="6" fill="#e8e0d0" />
          <circle cx="50" cy="74" r="6" fill="#c9a227" />
        </svg>
      </div>
    </div>

    <p v-if="computedLabel" class="mt-4 text-sm text-[var(--accent)] tracking-wider">
      {{ computedLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { TIAN_GAN, DI_ZHI } from '~/utils/bazi/constants'

interface Props {
  label?: string
  size?: 'full' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  size: 'full',
})

const { t } = useI18n()

const computedLabel = computed(() => props.label ?? t('common.loading'))

const isFull = computed(() => props.size === 'full')

const containerSize = computed(() => isFull.value ? '280px' : '140px')
const outerSize = computed(() => isFull.value ? '280px' : '140px')
const innerSize = computed(() => isFull.value ? '180px' : '90px')
const centerSize = computed(() => isFull.value ? '60px' : '30px')
const charSize = computed(() => isFull.value ? '32px' : '16px')
const charFontSize = computed(() => isFull.value ? '16px' : '10px')
const innerCharSize = computed(() => isFull.value ? '28px' : '14px')
const innerCharFontSize = computed(() => isFull.value ? '14px' : '8px')
</script>

<style scoped>
/* 外圆顺时针旋转 */
.outer-ring {
  animation: rotate-cw 6s linear infinite;
}

/* 内圆逆时针旋转 */
.inner-ring {
  animation: rotate-ccw 8s linear infinite;
}

/* 地支文字反向旋转，保持正向 */
.zhi-char {
  animation: counter-rotate-cw 6s linear infinite;
}

/* 天干文字反向旋转，保持正向 */
.gan-char {
  animation: counter-rotate-ccw 8s linear infinite;
}

/* 确保 label 绝对不受旋转影响 */
p {
  animation: none !important;
}

@keyframes rotate-cw {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rotate-ccw {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes counter-rotate-cw {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes counter-rotate-ccw {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
