<template>
  <div
    class="pointer-events-none absolute -bottom-2 -right-2 z-0 w-16 h-16 rotate-12 text-[var(--accent)]/[0.07] transition-opacity duration-500 group-hover:opacity-20"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="w-full h-full"
    >
      <template v-if="type === 'guanyin'">
        <!-- 签筒 -->
        <rect x="7" y="8" width="10" height="12" rx="2" />
        <line x1="10" y1="5" x2="10" y2="8" />
        <line x1="12" y1="4" x2="12" y2="8" />
        <line x1="14" y1="5" x2="14" y2="8" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </template>

      <template v-else-if="type === 'wealth'">
        <!-- 方孔钱 -->
        <circle cx="12" cy="12" r="9" />
        <rect x="10" y="10" width="4" height="4" rx="0.5" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </template>

      <template v-else-if="type === 'sanshan'">
        <!-- 三峰山 -->
        <path d="M4 18 L8 10 L12 16 L16 8 L20 18 Z" />
      </template>

      <template v-else-if="type === 'mazu'">
        <!-- 灯笼 -->
        <rect x="7" y="6" width="10" height="12" rx="2" />
        <line x1="12" y1="3" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="21" />
        <line x1="9" y1="12" x2="15" y2="12" />
      </template>

      <template v-else-if="type === 'zhuge'">
        <!-- 卷轴 -->
        <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="14" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
      </template>

    <template v-else-if="type === 'jiaobei'">
      <!-- 筊杯 -->
      <path d="M6 17c-1.5-2.5-1-6 3-7.5" />
      <path d="M18 17c1.5-2.5 1-6-3-7.5" />
    </template>
   </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'guanyin' | 'wealth' | 'sanshan' | 'mazu' | 'zhuge' | 'jiaobei'
}>()
</script>
