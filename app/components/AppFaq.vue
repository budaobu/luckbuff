<template>
  <section class="app-faq">
    <h2>{{ title }}</h2>
    <div class="app-faq-list">
      <details
        v-for="item in items"
        :key="item.question"
      >
        <summary>
          <span>{{ item.question }}</span>
          <UIcon
            name="i-heroicons-chevron-down"
            class="app-faq-chevron h-4 w-4"
          />
        </summary>
        <p>{{ item.answer }}</p>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
interface AppFaqItem {
  question: string
  answer: string
}

defineProps<{
  title: string
  items: AppFaqItem[]
}>()
</script>

<style scoped>
.app-faq {
  margin-top: 28px;
}

.app-faq h2 {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.4;
}

.app-faq-list {
  display: grid;
  gap: 8px;
}

.app-faq details {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-card);
}

.app-faq summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 46px;
  padding: 11px 14px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
}

.app-faq summary::-webkit-details-marker {
  display: none;
}

.app-faq-chevron {
  flex: 0 0 auto;
  color: var(--text-faint);
  transition: transform 160ms ease;
}

.app-faq details[open] .app-faq-chevron {
  transform: rotate(180deg);
}

.app-faq p {
  margin: 0;
  padding: 0 14px 13px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

@media (prefers-reduced-motion: reduce) {
  .app-faq-chevron {
    transition: none;
  }
}
</style>
