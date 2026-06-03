<script setup lang="ts">
const { t } = useI18n()

const messages = computed(() => [
  t('vedic.loading.geo'),
  t('vedic.loading.chart'),
  t('vedic.loading.ai'),
])

const messageIdx = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    messageIdx.value = (messageIdx.value + 1) % messages.value.length
  }, 1800)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="relative w-32 h-32">
      <!-- 外环 -->
      <div class="absolute inset-0 rounded-full border border-[var(--accent-border)] animate-[spin_8s_linear_infinite]">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-[var(--accent)]/80" />
      </div>
      <!-- 中环 -->
      <div class="absolute inset-4 rounded-full border border-[var(--accent-border-hover)] animate-[spin_5s_linear_infinite_reverse]">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
      </div>
      <!-- 内核 -->
      <div class="absolute inset-10 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border-hover)] flex items-center justify-center">
        <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-[var(--accent)] animate-pulse" />
      </div>
    </div>
    <p class="text-sm text-[var(--text-muted)] mt-8 tracking-wide transition-opacity duration-300">
      {{ messages[messageIdx] }}
    </p>
    <p class="text-[10px] text-[var(--text-placeholder)] mt-2">{{ $t('vedic.loading.hint') }}</p>
  </div>
</template>
