import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useLocalizedSeoPath() {
  const localePath = useLocalePath()
  const siteUrl = (useRuntimeConfig().public.siteUrl as string) || 'https://www.ososn.com'

  return (path: MaybeRefOrGetter<string>) => {
    const localizedPath = localePath(toValue(path) || '/')
    return `${siteUrl}${localizedPath === '/' ? '' : localizedPath}`
  }
}

export function useLocalizedSeoUrl(path: MaybeRefOrGetter<string>) {
  const localizedSeoPath = useLocalizedSeoPath()

  return computed(() => localizedSeoPath(path))
}
