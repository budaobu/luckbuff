<template>
  <div class="min-h-screen flex flex-col bg-[#0a0a0f]">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
