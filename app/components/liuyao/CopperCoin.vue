<template>
  <div
    class="relative flex items-center justify-center"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <!-- 铜钱外圈（凸起边缘） -->
    <div
      class="absolute inset-0 rounded-full"
      :class="isBack ? 'coin-edge-back' : 'coin-edge-front'"
      :style="{
        boxShadow: isBack
          ? `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(201,162,39,0.1)`
          : `0 2px 8px rgba(201, 162, 39, 0.3), inset 0 1px 2px rgba(255,255,255,0.15), 0 0 ${size * 0.4}px rgba(201, 162, 39, 0.1)`,
      }"
    />

    <!-- 铜钱主体 -->
    <div
      class="relative w-full h-full rounded-full transition-all duration-300"
      :class="isBack ? 'coin-surface-back' : 'coin-surface-front'"
    >
      <!-- 外圈凸线 -->
      <div
        class="absolute rounded-full"
        :style="{
          inset: `${size * 0.06}px`,
          border: `${Math.max(1, size * 0.02)}px solid ${isBack ? 'rgba(201, 162, 39, 0.15)' : 'rgba(201, 162, 39, 0.35)'}`,
        }"
      />

      <!-- 内圈线 -->
      <div
        class="absolute rounded-full"
        :style="{
          inset: `${size * 0.18}px`,
          border: `${Math.max(0.5, size * 0.01)}px solid ${isBack ? 'rgba(201, 162, 39, 0.08)' : 'rgba(201, 162, 39, 0.2)'}`,
        }"
      />

      <!-- 方孔 -->
      <div
        class="absolute"
        :style="{
          width: size * 0.2 + 'px',
          height: size * 0.2 + 'px',
          top: `calc(50% - ${size * 0.1}px)`,
          left: `calc(50% - ${size * 0.1}px)`,
          background: isBack ? 'rgba(15, 12, 9, 0.9)' : 'rgba(15, 12, 9, 0.95)',
          border: `${Math.max(1, size * 0.02)}px solid ${isBack ? 'rgba(201, 162, 39, 0.12)' : 'rgba(201, 162, 39, 0.25)'}`,
          borderRadius: size * 0.02 + 'px',
          boxShadow: isBack ? 'inset 0 1px 2px rgba(0,0,0,0.5)' : '0 0 4px rgba(201, 162, 39, 0.15)',
        }"
      />

      <!-- 字面：開元通寶（正面，有铭文） -->
      <template v-if="size >= 28">
        <span
          v-if="!isBack"
          class="absolute font-bold select-none pointer-events-none"
          :style="{
            fontSize: size * 0.15 + 'px',
            color: 'rgba(201, 162, 39, 0.55)',
            top: `calc(50% - ${size * 0.1}px - ${size * 0.2}px - 1px)`,
            left: '50%',
            transform: 'translateX(-50%)',
          }"
        >開</span>
        <span
          v-if="!isBack"
          class="absolute font-bold select-none pointer-events-none"
          :style="{
            fontSize: size * 0.15 + 'px',
            color: 'rgba(201, 162, 39, 0.55)',
            bottom: `calc(50% - ${size * 0.1}px - ${size * 0.2}px - 1px)`,
            left: '50%',
            transform: 'translateX(-50%)',
          }"
        >通</span>
        <span
          v-if="!isBack"
          class="absolute font-bold select-none pointer-events-none"
          :style="{
            fontSize: size * 0.15 + 'px',
            color: 'rgba(201, 162, 39, 0.55)',
            top: '50%',
            right: `calc(50% - ${size * 0.1}px - ${size * 0.2}px - 1px)`,
            transform: 'translateY(-50%)',
          }"
        >寶</span>
        <span
          v-if="!isBack"
          class="absolute font-bold select-none pointer-events-none"
          :style="{
            fontSize: size * 0.15 + 'px',
            color: 'rgba(201, 162, 39, 0.55)',
            top: '50%',
            left: `calc(50% - ${size * 0.1}px - ${size * 0.2}px - 1px)`,
            transform: 'translateY(-50%)',
          }"
        >元</span>
        <!-- 背面：光面，无文字 -->
      </template>
    </div>

    <!-- 高光 -->
    <div
      class="absolute rounded-full pointer-events-none"
      :style="{
        width: size * 0.35 + 'px',
        height: size * 0.35 + 'px',
        top: size * 0.12 + 'px',
        left: size * 0.18 + 'px',
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)',
      }"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  isBack: boolean
  size?: number
}

withDefaults(defineProps<Props>(), {
  size: 36,
})
</script>

<style scoped>
/* 字面（正面）—— 金铜质感，有铭文 */
.coin-surface-front {
  background: radial-gradient(
    circle at 35% 35%,
    rgba(201, 162, 39, 0.45) 0%,
    rgba(201, 162, 39, 0.3) 30%,
    rgba(160, 120, 30, 0.25) 60%,
    rgba(120, 85, 20, 0.2) 100%
  );
  border: 1.5px solid rgba(201, 162, 39, 0.4);
}

.coin-edge-front {
  background: transparent;
  border: 2px solid rgba(201, 162, 39, 0.25);
}

/* 背面 —— 深色暗铜光面 */
.coin-surface-back {
  background: radial-gradient(
    circle at 35% 35%,
    rgba(80, 65, 35, 0.35) 0%,
    rgba(60, 48, 25, 0.3) 30%,
    rgba(40, 32, 18, 0.35) 60%,
    rgba(25, 20, 12, 0.5) 100%
  );
  border: 1.5px solid rgba(201, 162, 39, 0.18);
}

.coin-edge-back {
  background: transparent;
  border: 2px solid rgba(201, 162, 39, 0.1);
}
</style>
