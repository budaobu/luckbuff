export const WRITELIST_MAX_AUTO_RETRIES = 3

const RETRY_DELAYS_MS = [5 * 60_000, 20 * 60_000, 60 * 60_000]

// 认证和额度问题不会因为马上重试而恢复；改好配置或充值后由人工批量重试。
export function isHardWritelistFailure(error?: string): boolean {
  const message = (error || '').toLowerCase()
  if (!message) return false
  if (message.includes('nuxt_ai_model')) return true
  if (message.includes('(401)')) return true
  if (!message.includes('(403)')) return false
  return ['额度', 'quota', 'invalid token', 'token'].some(keyword => message.includes(keyword))
}

export function isRetryableWritelistFailure(error?: string): boolean {
  return !isHardWritelistFailure(error)
}

export function nextWritelistRetryDelayMs(attempts: number): number | null {
  const delayIndex = Math.max(0, attempts) - 1
  return RETRY_DELAYS_MS[delayIndex] ?? null
}

export function canAutoRetryWritelistItem(
  status: string,
  error: string | undefined,
  attempts: number | undefined,
  nextRetryAt: string | undefined,
  now = new Date(),
): boolean {
  if (status !== 'failed' || !isRetryableWritelistFailure(error)) return false
  const attemptCount = attempts ?? 0
  if (attemptCount >= WRITELIST_MAX_AUTO_RETRIES) return false
  return !nextRetryAt || new Date(nextRetryAt).getTime() <= now.getTime()
}

interface WritelistCandidate {
  status: string
  createdAt: string
  error?: string
  attempts?: number
  nextRetryAt?: string
}

export function findNextWritelistCandidate<T extends WritelistCandidate>(items: T[], now = new Date()): T | undefined {
  return items
    .filter(item => item.status === 'pending' || canAutoRetryWritelistItem(
      item.status,
      item.error,
      item.attempts,
      item.nextRetryAt,
      now,
    ))
    .sort((a, b) => (a.nextRetryAt ?? a.createdAt).localeCompare(b.nextRetryAt ?? b.createdAt))[0]
}
