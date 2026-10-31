import { wrapFetchWithEmptyAiStreamRetry } from '~~/server/utils/ai/stream-retry'

export default defineNitroPlugin(() => {
  const g = globalThis as { __luckbuffAiStreamRetryPatched?: boolean }
  if (g.__luckbuffAiStreamRetryPatched) return
  g.__luckbuffAiStreamRetryPatched = true

  const originalFetch = globalThis.fetch.bind(globalThis)
  globalThis.fetch = wrapFetchWithEmptyAiStreamRetry(originalFetch, useRuntimeConfig().aiBaseUrl as string) as typeof fetch
})
