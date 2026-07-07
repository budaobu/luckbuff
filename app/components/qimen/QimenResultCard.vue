<template>
  <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mt-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--accent)]" />
      <h3 class="text-lg font-semibold text-[var(--text-primary)]">
        {{ $t('qimen.interpretTitle') }}
      </h3>
    </div>

    <!-- idle -->
    <div v-if="status === 'idle'" class="text-center py-6">
      <p class="text-sm text-[var(--text-faint)]">{{ $t('qimen.interpretIdle') }}</p>
    </div>

    <!-- loading -->
    <div v-else-if="status === 'loading'" class="flex flex-col items-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-[var(--accent)] animate-spin mb-2" />
      <p class="text-sm text-[var(--text-muted)]">{{ $t('qimen.interpretLoading') }}</p>
    </div>

    <!-- error -->
    <div v-else-if="status === 'error'" class="text-center py-6">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p class="text-sm text-red-400">{{ error }}</p>
      <UButton color="warning" variant="soft" size="sm" class="mt-3" @click="$emit('retry')">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </template>
        {{ $t('common.retry') }}
      </UButton>
    </div>

    <!-- streaming / done -->
    <div v-else class="space-y-3">
      <div class="text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
        {{ content }}
      </div>
      <!-- 光标 -->
      <div v-if="status === 'streaming'" class="flex items-center gap-1">
        <span class="w-0.5 h-4 bg-[var(--accent)] animate-pulse" />
      </div>
    </div>

    <!-- 底部元信息 -->
    <div v-if="metadata" class="mt-4 pt-3 border-t border-[var(--border-light)] flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-faint)]">
      <span>{{ metadata.yinYang === 'yang' ? '阳遁' : '阴遁' }}{{ metadata.juShu }}局</span>
      <span>|</span>
      <span>日：{{ metadata.riGanzhi }}</span>
      <span>|</span>
      <span>时：{{ metadata.shiGanzhi }}</span>
      <span>|</span>
      <span>节气：{{ metadata.jieqi }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export type QimenResultStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

interface Metadata {
  juShu: number
  yinYang: 'yang' | 'yin'
  riGanzhi: string
  shiGanzhi: string
  jieqi: string
}

defineProps<{
  status: QimenResultStatus
  content: string
  error?: string | null
  metadata?: Metadata | null
}>()

defineEmits<{
  retry: []
}>()
</script>
