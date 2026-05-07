<template>
  <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[#c9a227]/25 hover:bg-white/[0.04] hover:-translate-y-0.5">
    <!-- 默认档案标识 -->
    <div
      v-if="profile.isDefault"
      class="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-[#c9a227]" />
      <span class="text-[10px] text-[#c9a227] font-medium tracking-wide">默认</span>
    </div>

    <div class="p-6">
      <!-- 头部 -->
      <div class="flex items-start gap-4 mb-5">
        <div class="w-11 h-11 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-heroicons-user" class="w-5 h-5 text-[#c9a227]" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-[#f5e6c0] truncate">
            {{ profile.label }}
          </h3>
          <p class="text-xs text-[#e8e0d0]/40 mt-0.5">
            {{ profile.gender === 'male' ? '乾造 · 男' : '坤造 · 女' }}
          </p>
        </div>
      </div>

      <!-- 信息列表 -->
      <div class="space-y-2.5 mb-5">
        <div v-if="profile.name" class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-identification" class="w-3.5 h-3.5 text-[#c9a227]/40 flex-shrink-0" />
          <span class="text-[#e8e0d0]/60">{{ profile.name }}</span>
        </div>
        <div v-if="profile.birthDate" class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 text-[#c9a227]/40 flex-shrink-0" />
          <span class="text-[#e8e0d0]/60">{{ profile.birthDate }}</span>
          <span v-if="profile.birthHour" class="text-xs text-[#e8e0d0]/30">
            {{ SHICHEN_OPTIONS.find(s => s.dizhi === profile.birthHour)?.label }}
          </span>
        </div>
        <div v-if="profile.birthProvince" class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#c9a227]/40 flex-shrink-0" />
          <span class="text-[#e8e0d0]/60">{{ profile.birthProvince }}</span>
        </div>
      </div>

      <!-- 操作区 -->
      <div class="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <button
          class="flex items-center gap-2 text-xs text-[#e8e0d0]/30 hover:text-[#c9a227] transition-colors duration-200"
          :class="{ 'text-[#c9a227]': profile.isDefault }"
          @click="$emit('setDefault', profile.id)"
        >
          <span
            class="w-3.5 h-3.5 rounded border transition-all duration-200 flex items-center justify-center"
            :class="profile.isDefault ? 'border-[#c9a227] bg-[#c9a227]' : 'border-white/20 bg-white/5 hover:border-[#c9a227]/40'"
          >
            <UIcon v-if="profile.isDefault" name="i-heroicons-check" class="w-2.5 h-2.5 text-[#0a0a0f]" />
          </span>
          默认档案
        </button>

        <div class="flex items-center gap-1">
          <UButton
            icon="i-heroicons-pencil-square"
            color="neutral"
            variant="ghost"
            size="xs"
            class="text-[#e8e0d0]/30 hover:text-[#f5e6c0]"
            @click="$emit('edit', profile)"
          />
          <UButton
            icon="i-heroicons-trash"
            color="neutral"
            variant="ghost"
            size="xs"
            class="text-[#e8e0d0]/30 hover:text-red-400"
            @click="$emit('delete', profile.id)"
          />
        </div>
      </div>
    </div>

    <!-- 底部金色渐变线 -->
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/user'
import { SHICHEN_OPTIONS } from '~/types/user'

interface Props {
  profile: UserProfile
}

defineProps<Props>()
defineEmits<{
  edit: [profile: UserProfile]
  delete: [id: string]
  setDefault: [id: string]
}>()
</script>
