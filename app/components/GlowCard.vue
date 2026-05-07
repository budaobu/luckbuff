<template>
  <div
    class="glow-card group relative rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-1"
    :style="cardStyle"
  >
    <div class="relative z-10 p-6">
      <div v-if="icon || $slots.icon" class="mb-4">
        <slot name="icon">
          <div
            class="w-10 h-10 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center text-[#c9a227] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          >
            <UIcon v-if="icon" :name="icon" class="w-5 h-5" />
          </div>
        </slot>
      </div>
      <h3 v-if="title" class="text-base font-semibold text-[#f5e6c0] mb-2 tracking-wide">
        {{ title }}
      </h3>
      <div class="text-sm text-[#e8e0d0]/60 leading-relaxed">
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
  colorFrom: '#c9a227',
  colorTo: '#f5e6c0',
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
    from var(--glow-angle, 0deg),
    transparent 75%,
    var(--glow-from, #c9a227) 85%,
    var(--glow-to, #f5e6c0) 92%,
    var(--glow-from, #c9a227) 95%,
    transparent 100%
  );
  animation: glow-rotate var(--glow-duration, 8s) linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 1px;
  pointer-events: none;
  opacity: 0.6;
  transition: opacity 0.5s;
}

.glow-card:hover::before {
  opacity: 1;
}
</style>
