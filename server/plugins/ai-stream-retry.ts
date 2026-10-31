import { wrapFetchWithEmptyAiStreamRetry } from '~~/server/utils/ai/stream-retry'

export default defineNitroPlugin(() => {
  const g = globalThis as { __luckbuffAiStreamRetryPatched?: boolean }
  if (g.__luckbuffAiStreamRetryPatched) return
  g.__luckbuffAiStreamRetryPatched = true

  const originalFetch = globalThis.fetch.bind(globalThis)
  const config = useRuntimeConfig()
  const configuredTokens = Number(config.aiMaxTokens) || 8192
  // Reasoning models count thought tokens against max_tokens. Tool endpoints
  // predate that behavior and often cap short readings at 1k-4k, producing a
  // 200 response with finish_reason=length and an empty content field.
  const minOutputTokens = Math.min(8192, configuredTokens)
  globalThis.fetch = wrapFetchWithEmptyAiStreamRetry(
    originalFetch,
    config.aiBaseUrl as string,
    minOutputTokens,
    configuredTokens,
  ) as typeof fetch
})
