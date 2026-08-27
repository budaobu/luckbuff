import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useLocalizedSeoUrl(path: MaybeRefOrGetter<string>) {
  const localePath = useLocalePath()
  const siteUrl = (useRuntimeConfig().public.siteUrl as string) || 'https://www.ososn.com'

  return computed(() => `${siteUrl}${localePath(toValue(path))}`)
}
