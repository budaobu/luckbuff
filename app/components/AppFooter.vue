<template>
  <footer class="w-full border-t py-8 mt-auto transition-colors duration-300" style="border-color: var(--border-subtle);">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div
            class="w-6 h-6 rounded-md flex items-center justify-center"
            style="background-color: var(--accent-bg); border: 1px solid var(--accent-border);"
          >
            <UIcon name="i-heroicons-sparkles" class="w-3 h-3" style="color: var(--accent);" />
          </div>
          <span class="text-sm font-medium" style="color: var(--text-faint);">
            {{ $t('footer.copyright') }}
          </span>
        </div>
        <div class="flex items-center gap-6">
          <NuxtLink
            :to="localePath('/terms')"
            class="text-xs transition-colors duration-200 hover:!text-[var(--accent)]"
            style="color: var(--text-placeholder);"
          >
            {{ $t('footer.terms') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/privacy')"
            class="text-xs transition-colors duration-200 hover:!text-[var(--accent)]"
            style="color: var(--text-placeholder);"
          >
            {{ $t('footer.privacy') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>
