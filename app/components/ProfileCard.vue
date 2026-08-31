<template>
  <div class="profile-card group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
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
            class="profile-action"
            :aria-label="$t('common.edit')"
            @click="$emit('edit', profile)"
          />
          <UButton
            icon="i-heroicons-trash"
            color="neutral"
            variant="ghost"
            size="xs"
            class="profile-action profile-action-danger"
            :aria-label="$t('common.delete')"
            @click="$emit('delete', profile.id)"
          />
        </div>
      </div>
    </div>

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

<style scoped>
.profile-card {
  isolation: isolate;
  box-shadow: var(--shadow-panel);
  transition:
    transform 200ms var(--ease-out-expo),
    border-color 200ms var(--ease-out-expo),
    background-color 200ms var(--ease-out-expo),
    box-shadow 200ms var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .profile-card:hover {
    border-color: var(--accent-border);
    background: var(--surface-card-hover);
    box-shadow: var(--shadow-panel-hover);
    transform: translateY(-3px);
  }
}

.profile-card:active {
  transform: scale(0.995);
}

.profile-card:focus-within {
  border-color: var(--accent-border);
}

.profile-action {
  color: var(--text-placeholder);
  transition: color 160ms var(--ease-out-expo), transform 160ms var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .profile-action:hover {
    color: var(--text-primary);
    transform: scale(1.04);
  }

  .profile-action-danger:hover {
    color: #f87171;
  }
}

.profile-action:active {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .profile-card,
  .profile-action {
    transition: none;
  }

  .profile-card:hover,
  .profile-card:active,
  .profile-action:hover,
  .profile-action:active {
    transform: none;
  }
}
</style>
