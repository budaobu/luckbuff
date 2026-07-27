import { vReveal } from '~/composables/useReveal'

// Server counterpart of reveal.client.ts — registers the same directive so
// SSR can resolve v-reveal; vReveal.getSSRProps() returns {} (no attributes,
// element stays fully visible in SSR HTML).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', vReveal)
})
