<template>
  <div>
    <label v-if="label" class="block text-sm text-[var(--text-muted)] mb-2">{{ label }}</label>
    <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-3">
      <ClientOnly>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent)]" />
            <span class="text-sm text-[var(--text-primary)]">{{ formatNowTime }}</span>
          </div>
          <span class="text-[11px] text-[var(--text-faint)]">{{ userTimezone }}</span>
        </div>
        <template #fallback>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent)]" />
            <span class="text-sm text-[var(--text-faint)]">{{ $t('common.loading') }}</span>
          </div>
        </template>
      </ClientOnly>
      <p v-if="hint" class="text-[11px] text-[var(--text-faint)] mt-1.5">
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label?: string
  hint?: string
}>()

const userTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai')
const nowTime = ref(new Date())

// 每秒更新当前时间
onMounted(() => {
  const timer = setInterval(() => {
    nowTime.value = new Date()
  }, 1000)
  onUnmounted(() => clearInterval(timer))
})

const formatNowTime = computed(() => {
  return nowTime.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: userTimezone.value,
    hour12: false,
  })
})

const year = computed(() => nowTime.value.getFullYear())
const month = computed(() => nowTime.value.getMonth() + 1)
const day = computed(() => nowTime.value.getDate())
const hour = computed(() => nowTime.value.getHours())

defineExpose({
  timezone: userTimezone,
  year,
  month,
  day,
  hour,
})
</script>
