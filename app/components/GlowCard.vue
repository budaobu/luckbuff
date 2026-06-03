<template>
  <div
    class="glow-card group relative rounded-2xl backdrop-blur-sm overflow-hidden transition-all duration-500 hover:-translate-y-1"
    style="background-color: var(--surface-card);"
    :style="cardStyle"
    :class="{ 'hover:!bg-[var(--surface-card-hover)]': true }"
  >
    <div class="relative z-10 p-6">
      <div v-if="icon || $slots.icon" class="mb-4">
        <slot name="icon">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
            style="background-color: var(--accent-bg); border: 1px solid var(--accent-border); color: var(--accent);"
          >
            <UIcon v-if="icon" :name="icon" class="w-5 h-5" />
          </div>
        </slot>
      </div>
      <h3 v-if="title" class="text-base font-semibold mb-2 tracking-wide" style="color: var(--text-primary);">
        {{ title }}
      </h3>
      <div class="text-sm leading-relaxed" style="color: var(--text-muted);">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  duration?: number
  colorFrom?: string
  colorTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  duration: 8,
  colorFrom: 'var(--gradient-glow-from)',
  colorTo: 'var(--gradient-glow-to)',
})

const cardStyle = computed(() => ({
  '--glow-duration': `${props.duration}s`,
  '--glow-from': props.colorFrom,
  '--glow-to': props.colorTo,
}))
</script>

<style scoped>
.glow-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from 0deg,
    transparent 75%,
    var(--glow-from, var(--gradient-glow-from)) 85%,
    var(--glow-to, var(--gradient-glow-to)) 92%,
    var(--glow-from, var(--gradient-glow-from)) 95%,
    transparent 100%
  );
  animation: glow-spin var(--glow-duration, 8s) linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 1px;
  pointer-events: none;
  opacity: 0.6;
  transition: opacity 0.5s;
  will-change: transform;
}

.glow-card:hover::before {
  opacity: 1;
}
</style>
