<template>
  <figure class="lieflat-chart">
    <figcaption class="lieflat-head">
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>
    </figcaption>
    <div class="lieflat-body">
      <slot />
    </div>
    <small class="lieflat-source">{{ source }}</small>
  </figure>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
  source: string
}

defineProps<Props>()
</script>

<style scoped>
.lieflat-chart {
  min-width: 0;
  margin: 0;
  background: var(--bzp-card);
  border-radius: 24px;
  padding: 18px 18px 12px;
}

.lieflat-head {
  display: grid;
  gap: 3px;
}

.lieflat-head h2 {
  margin: 0;
  color: var(--bzp-ink);
  font-family: Inter, 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.lieflat-head p {
  margin: 0;
  color: var(--bzp-soft);
  font-family: Inter, 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.4;
}

.lieflat-body {
  margin-top: 12px;
}

.lieflat-body > :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.lieflat-source {
  display: block;
  margin-top: 8px;
  color: var(--bzp-faint);
  font-family: Inter, 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
