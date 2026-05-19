<script setup lang="ts">
defineProps<{
  schema: Record<string, any>
}>()
</script>

<template>
  <component
    :is="'script'"
    type="application/ld+json"
    v-html="JSON.stringify(schema)"
  />
</template>
