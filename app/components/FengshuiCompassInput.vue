<template>
  <div class="mt-4 flex justify-center">
    <div
      ref="compassRef"
      class="relative rounded-full border-2 border-[var(--border-light)] bg-[var(--surface-card)] cursor-crosshair select-none"
      :class="sizeClass"
      @mousedown="startDrag"
      @touchstart.prevent="startDrag"
      @mousemove="onDrag"
      @touchmove.prevent="onDrag"
      @mouseup="stopDrag"
      @touchend="stopDrag"
      @mouseleave="stopDrag"
    >
      <!-- 刻度 -->
      <div class="absolute inset-0 rounded-full">
        <div
          v-for="deg in [0, 45, 90, 135, 180, 225, 270, 315]"
          :key="deg"
          class="absolute w-px h-3 bg-[var(--border-medium)] origin-bottom"
          :style="tickStyle(deg)"
        />
      </div>
      <!-- 方位文字 -->
      <div class="absolute inset-0 rounded-full text-[10px] font-medium text-[var(--text-muted)]">
        <span class="absolute top-1 left-1/2 -translate-x-1/2">N</span>
        <span class="absolute bottom-1 left-1/2 -translate-x-1/2">S</span>
        <span class="absolute left-1.5 top-1/2 -translate-y-1/2">W</span>
        <span class="absolute right-1.5 top-1/2 -translate-y-1/2">E</span>
      </div>
      <!-- 指针 -->
      <div
        class="absolute bottom-1/2 left-1/2 w-0.5 h-[calc(50%-8px)] origin-bottom rounded-full bg-[var(--accent)]"
        :style="needleStyle"
      />
      <div class="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 罗盘角度输入组件（从玄空风水工具抽取的共享组件）
 * 拖拽圆盘设置 0-360° 角度，0°=正北，顺时针递增。
 */
const props = withDefaults(defineProps<{
  modelValue: number | undefined
  size?: 'md' | 'sm'
}>(), {
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const compassRef = ref<HTMLDivElement>()
const dragging = ref(false)

const sizeClass = computed(() => props.size === 'sm' ? 'w-32 h-32' : 'w-40 h-40')

const needleStyle = computed(() => ({
  transform: `rotate(${props.modelValue ?? 0}deg) translateX(-50%)`,
}))

function tickStyle(deg: number) {
  return {
    left: '50%',
    top: '8px',
    height: 'calc(50% - 8px)',
    transform: `rotate(${deg}deg) translateX(-50%)`,
  }
}

function getAngleFromEvent(e: MouseEvent | TouchEvent): number {
  if (!compassRef.value) return 0
  const rect = compassRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
  const rad = Math.atan2(clientY - centerY, clientX - centerX)
  let deg = rad * (180 / Math.PI) + 90
  if (deg < 0) deg += 360
  return Math.round(deg)
}

function startDrag(e: MouseEvent | TouchEvent) {
  dragging.value = true
  emit('update:modelValue', getAngleFromEvent(e))
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return
  emit('update:modelValue', getAngleFromEvent(e))
}

function stopDrag() {
  dragging.value = false
}
</script>
