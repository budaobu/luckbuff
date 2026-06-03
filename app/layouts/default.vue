<template>
  <div class="min-h-screen flex flex-col bg-texture-noise" style="background-color: var(--surface-bg);">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
