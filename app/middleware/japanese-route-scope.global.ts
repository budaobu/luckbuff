export default defineNuxtRouteMiddleware((to) => {
  const isJapaneseToolRoute = to.path === '/ja/tools/shichu-suimei'
  const isJapanesePrefixed = to.path === '/ja' || to.path.startsWith('/ja/')

  if (!isJapanesePrefixed || isJapaneseToolRoute) return

  return navigateTo(to.path.slice(3) || '/', { redirectCode: 308 })
})
