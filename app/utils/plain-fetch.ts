type PlainFetchOptions = Record<string, unknown>

export const plainFetch = $fetch as unknown as <T = unknown>(
  url: string,
  options?: PlainFetchOptions,
) => Promise<T>
