<template>
  <div class="grid grid-cols-2 gap-3">
    <button
      v-for="room in roomOptions"
      :key="room.value"
      type="button"
      class="py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 text-left px-4"
      :class="modelValue === room.value
        ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
        : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
      @click="emit('update:modelValue', room.value)"
    >
      <span class="block font-semibold">{{ room.label }}</span>
      <span class="block text-[10px] opacity-80 mt-0.5">{{ room.sublabel }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 房间类型选择器（通用组件，自 office-fengshui 的房间类型选择器抽取）
 * 通过 i18nScope 复用既有工具的房间文案命名空间（如 officeFengshui），
 * 新工具默认使用共享的 roomTypeSelector 命名空间。
 */
const props = withDefaults(defineProps<{
  modelValue: string
  options?: string[]
  i18nScope?: string
}>(), {
  options: () => ['bedroom', 'study', 'office', 'hall', 'shop'],
  i18nScope: 'roomTypeSelector',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

const roomOptions = computed(() => props.options.map(value => ({
  value,
  label: t(`${props.i18nScope}.room${capitalize(value)}`),
  sublabel: t(`${props.i18nScope}.room${capitalize(value)}Desc`),
})))

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>
