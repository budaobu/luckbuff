<template>
  <div class="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[var(--accent-border-hover)] hover:bg-[var(--surface-card-hover)] hover:-translate-y-0.5">
    <!-- 默认档案标识 -->
    <div
      v-if="profile.isDefault"
      class="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)]"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
      <span class="text-[10px] text-[var(--accent)] font-medium tracking-wide">{{ $t('profileCard.default') }}</span>
    </div>

    <div class="p-6">
      <!-- 头部 -->
      <div class="flex items-start gap-4 mb-5">
        <div class="w-11 h-11 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center flex-shrink-0">
          <UIcon name="i-heroicons-user" class="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] truncate">
            {{ profile.label }}
          </h3>
          <p class="text-xs text-[var(--text-faint)] mt-0.5">
            {{ profile.gender === 'male' ? $t('profileCard.maleLabel') : $t('profileCard.femaleLabel') }}
          </p>
        </div>
      </div>

      <!-- 信息列表 -->
      <div class="space-y-2.5 mb-5">
        <div v-if="profile.name" class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-identification" class="w-3.5 h-3.5 text-[var(--accent-muted)] flex-shrink-0" />
          <span class="text-[var(--text-muted)]">{{ profile.name }}</span>
        </div>
        <div v-if="profile.birthDate" class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 text-[var(--accent-muted)] flex-shrink-0" />
          <span class="text-[var(--text-muted)]">{{ profile.birthDate }}</span>
          <span v-if="profile.birthHour" class="text-xs text-[var(--text-faint)]">
            {{ SHICHEN_OPTIONS.find(s => s.dizhi === profile.birthHour)?.label }}
          </span>
        </div>
        <div v-if="profile.birthProvince" class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[var(--accent-muted)] flex-shrink-0" />
          <span class="text-[var(--text-muted)]">{{ profile.birthProvince }}</span>
        </div>
      </div>

      <!-- 操作区 -->
      <div class="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
        <button
          class="flex items-center gap-2 text-xs text-[var(--text-placeholder)] hover:text-[var(--accent)] transition-colors duration-200"
          :class="{ 'text-[var(--accent)]': profile.isDefault }"
          @click="$emit('setDefault', profile.id)"
        >
          <span
            class="w-3.5 h-3.5 rounded border transition-all duration-200 flex items-center justify-center"
            :class="profile.isDefault ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] hover:border-[var(--accent-border-hover)]'"
          >
            <UIcon v-if="profile.isDefault" name="i-heroicons-check" class="w-2.5 h-2.5 text-[var(--surface-bg)]" />
          </span>
          {{ $t('profileCard.defaultProfile') }}
        </button>

        <div class="flex items-center gap-1">
          <UButton
            icon="i-heroicons-pencil-square"
            color="neutral"
            variant="ghost"
            size="xs"
            class="text-[var(--text-placeholder)] hover:text-[var(--text-primary)]"
            @click="$emit('edit', profile)"
          />
          <UButton
            icon="i-heroicons-trash"
            color="neutral"
            variant="ghost"
            size="xs"
            class="text-[var(--text-placeholder)] hover:text-red-400"
            @click="$emit('delete', profile.id)"
          />
        </div>
      </div>
    </div>

    <!-- 底部金色渐变线 -->
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
