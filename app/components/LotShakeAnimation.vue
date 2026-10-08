<template>
  <div class="lot-shake-animation">
    <ClientOnly>
      <component
        :is="LotShakeSceneLazy"
        :trigger="trigger"
        :theme="theme"
        :selected-sign="selectedSign"
        :duration="duration"
        @complete="emit('complete')"
        @error="message => emit('error', message)"
      />
      <template #fallback>
        <div class="lot-shake-fallback" data-state="loading" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { LotShakeTheme } from '~/composables/useLotShake'

defineProps<{
  trigger: number
  theme: LotShakeTheme
  selectedSign?: number | null
  duration?: number
}>()

const emit = defineEmits<{
  complete: []
  error: [message: string]
}>()

const LotShakeSceneLazy = defineAsyncComponent(() => import('~/components/LotShakeScene.vue'))
</script>

<style scoped>
.lot-shake-animation {
  width: min(576px, calc(100vw - 48px));
  height: min(58vh, 420px);
  min-height: 340px;
}

@media (max-width: 640px) {
  .lot-shake-animation {
    height: min(52vh, 340px);
    min-height: 300px;
  }
}

.lot-shake-fallback {
  width: 100%;
  height: 100%;
}
</style>
