<template>
  <footer class="w-full border-t border-white/[0.04] py-8 mt-auto">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center">
            <UIcon name="i-heroicons-sparkles" class="w-3 h-3 text-[#c9a227]" />
          </div>
          <span class="text-sm font-medium text-[#e8e0d0]/40">
            {{ $t('footer.copyright') }}
          </span>
        </div>
        <div class="flex items-center gap-6">
          <NuxtLink :to="localePath('/terms')" class="text-xs text-[#e8e0d0]/30 hover:text-[#c9a227] transition-colors duration-200">
            {{ $t('footer.terms') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/privacy')" class="text-xs text-[#e8e0d0]/30 hover:text-[#c9a227] transition-colors duration-200">
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
