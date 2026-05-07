<template>
  <div class="group relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.05]">
    <!-- 顶部装饰线 -->
    <div
      class="h-px bg-gradient-to-r from-transparent to-transparent"
      :style="{ backgroundImage: `linear-gradient(to right, transparent, ${accentColor}66, transparent)` }"
    />

    <div class="relative z-10 p-6">
      <!-- 标题区 -->
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
          :style="{ background: `${accentColor}15`, border: `1px solid ${accentColor}25`, color: accentColor }"
        >
          <UIcon :name="icon" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-[#f5e6c0] tracking-wide">{{ title }}</h3>
          <p class="text-xs text-[#e8e0d0]/40 mt-0.5 truncate">{{ data.summary }}</p>
        </div>
      </div>

      <!-- 标签 -->
      <div class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="tag in data.tags"
          :key="tag"
          class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
          :style="{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}18` }"
        >
          {{ tag }}
        </span>
      </div>

      <!-- 详细解读 -->
      <p class="text-sm text-[#e8e0d0]/70 leading-relaxed mb-4">
        {{ data.detail }}
      </p>

      <!-- 额外字段 -->
      <div v-if="extraField" class="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5">
        <div class="flex items-center gap-2">
          <UIcon :name="extraField.icon" class="w-3.5 h-3.5" :style="{ color: accentColor }" />
          <span class="text-xs text-[#e8e0d0]/50">{{ extraField.label }}</span>
        </div>
        <p class="text-sm text-[#e8e0d0]/80 mt-1">{{ extraField.value }}</p>
      </div>
    </div>

    <!-- 边框 -->
    <div class="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
    <div
      class="absolute bottom-0 left-0 right-0 h-px"
      :style="{ backgroundImage: `linear-gradient(to right, transparent, ${accentColor}26, transparent)` }"
    />
  </div>
</template>

<script setup lang="ts">
import type { AiDimensionCard } from '~/types/bazi'

interface Props {
  title: string
  icon: string
  accentColor: string
  data: AiDimensionCard
  extraField?: {
    label: string
    value: string
    icon: string
  }
}

const props = defineProps<Props>()
</script>


