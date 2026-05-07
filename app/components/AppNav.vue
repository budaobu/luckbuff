<template>
  <nav class="w-full border-b border-white/[0.04] bg-[#0a0a0f]/70 backdrop-blur-xl sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded-lg bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center transition-all duration-300 group-hover:bg-[#c9a227]/20 group-hover:border-[#c9a227]/40">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[#c9a227] transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span class="text-lg font-bold text-[#c9a227] tracking-tight">LuckBuff</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-4 py-2 rounded-lg text-sm text-[#e8e0d0]/60 hover:text-[#f5e6c0] hover:bg-white/[0.04] transition-all duration-200"
          :class="{ 'text-[#c9a227] bg-[#c9a227]/10': route.path === item.to }"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <!-- Mobile Menu Button -->
      <UButton
        class="md:hidden"
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="mobileOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
        @click="mobileOpen = !mobileOpen"
      />
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="md:hidden border-t border-white/[0.04] bg-[#0a0a0f]/90 backdrop-blur-xl px-6 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block px-4 py-3 rounded-xl text-sm text-[#e8e0d0]/60 hover:text-[#f5e6c0] hover:bg-white/[0.04] transition-all"
          :class="{ 'text-[#c9a227] bg-[#c9a227]/10': route.path === item.to }"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const mobileOpen = ref(false)

const navItems = [
  { label: '首页', to: '/' },
  { label: '算命工具', to: '/tools' },
  { label: '我的档案', to: '/settings' },
]
</script>
