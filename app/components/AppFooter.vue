<template>
  <footer
    class="mt-auto w-full border-t"
    style="border-color: var(--border-subtle); background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--surface-elevated) 62%, transparent) 100%);"
  >
    <div class="mx-auto max-w-6xl px-6 py-10">
      <div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div class="max-w-sm">
          <div class="flex items-center gap-2.5">
            <img
              src="/logo-2026-08.webp"
              alt=""
              width="32"
              height="32"
              loading="lazy"
              class="h-8 w-8 rounded-lg"
              style="border: 1px solid var(--accent-border); box-shadow: var(--shadow-panel);"
            />
            <span class="text-base font-semibold tracking-tight" translate="no" style="color: var(--text-primary);">ososn</span>
          </div>
          <p class="mt-3 text-sm leading-relaxed" style="color: var(--text-faint);">
            {{ $t('footer.copyright') }}
          </p>
        </div>
        <nav class="flex items-center gap-6 md:pt-1" :aria-label="$t('footer.navigation')">
          <NuxtLink
            :to="localePath('/terms')"
            class="text-sm transition-colors duration-200 hover:!text-[var(--accent)]"
            style="color: var(--text-faint);"
          >
            {{ $t('footer.terms') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/privacy')"
            class="text-sm transition-colors duration-200 hover:!text-[var(--accent)]"
            style="color: var(--text-faint);"
          >
            {{ $t('footer.privacy') }}
          </NuxtLink>
        </nav>
      </div>
      <div class="mt-8 border-t pt-5" style="border-color: var(--border-subtle);">
        <p class="text-xs" style="color: var(--text-placeholder);">© {{ new Date().getFullYear() }} ososn</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>
