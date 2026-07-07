<template>
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
      @click="open = true"
    >
      <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
      {{ $t('externalInspiration.button') }}
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-8 px-4 bg-black/40 backdrop-blur-sm overflow-hidden"
          @click.self="open = false"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
          >
            <div
              v-if="open"
              class="w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] shadow-2xl overflow-hidden"
            >
              <!-- 头部 -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-eye" class="w-5 h-5 text-[var(--accent)]" />
                  <h3 class="text-base font-semibold text-[var(--text-primary)]">
                    {{ $t('externalInspiration.title') }}
                  </h3>
                </div>
                <button
                  type="button"
                  class="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  @click="open = false"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                </button>
              </div>

              <!-- 说明 -->
              <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card)]">
                <p class="text-xs text-[var(--text-muted)] leading-relaxed">
                  {{ $t('externalInspiration.tip') }}
                </p>
              </div>

              <!-- 内容区 -->
              <div class="flex-1 overflow-y-auto p-5 space-y-5">
                <div
                  v-for="group in groups"
                  :key="group.key"
                >
                  <h4 class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
                    {{ $t(`externalInspiration.groups.${group.key}`) }}
                  </h4>
                  <div class="space-y-1.5">
                    <button
                      v-for="(q, idx) in group.items"
                      :key="idx"
                      type="button"
                      class="w-full text-left px-3.5 py-2.5 rounded-lg text-sm text-[var(--text-body)] bg-[var(--surface-card)] border border-[var(--border-light)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] hover:border-[var(--accent-border-hover)] transition-colors cursor-pointer leading-relaxed"
                      @click="select(q)"
                    >
                      {{ $t(`externalInspiration.items.${q}`) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'select', text: string): void
}>()

const { t } = useI18n()

const groups = [
  {
    key: 'weather',
    items: ['sunny', 'rainy', 'windy', 'cloudy', 'thunder', 'snow'],
  },
  {
    key: 'writing',
    items: ['brush', 'pen', 'paper', 'ink', 'writeFast', 'writeSlow'],
  },
  {
    key: 'sound',
    items: ['bird', 'dog', 'car', 'bell', 'knock', 'phone'],
  },
  {
    key: 'sight',
    items: ['birdFly', 'leafFall', 'doorOpen', 'lightFlicker', 'shadow', 'stranger'],
  },
  {
    key: 'object',
    items: ['book', 'cup', 'key', 'flower', 'money', 'knife'],
  },
]

function select(key: string) {
  emit('select', t(`externalInspiration.items.${key}`))
  open.value = false
}
</script>
