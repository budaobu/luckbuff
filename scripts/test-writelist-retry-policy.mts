import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  canAutoRetryWritelistItem,
  findNextWritelistCandidate,
  isHardWritelistFailure,
  nextWritelistRetryDelayMs,
  WRITELIST_MAX_AUTO_RETRIES,
} from '../server/utils/insights/writelist-retry-policy.ts'

describe('writelist retry policy', () => {
  it('blocks auth and quota failures from automatic retries', () => {
    assert.equal(isHardWritelistFailure('AI 服务错误 (401): Invalid token'), true)
    assert.equal(isHardWritelistFailure('AI 服务错误 (403): 用户额度不足'), true)
    assert.equal(isHardWritelistFailure('AI 服务错误 (403): token quota is not enough'), true)
    assert.equal(isHardWritelistFailure('AI 服务错误 (429): 该模型当前访问量过大'), false)
  })

  it('uses increasing delays and stops after the maximum', () => {
    assert.equal(nextWritelistRetryDelayMs(1), 5 * 60_000)
    assert.equal(nextWritelistRetryDelayMs(2), 20 * 60_000)
    assert.equal(nextWritelistRetryDelayMs(3), 60 * 60_000)
    assert.equal(nextWritelistRetryDelayMs(WRITELIST_MAX_AUTO_RETRIES + 1), null)
  })

  it('only selects failed transient items when due', () => {
    const now = new Date('2026-10-30T08:00:00.000Z')
    const due = new Date('2026-10-30T07:59:59.000Z').toISOString()
    const future = new Date('2026-10-30T08:00:01.000Z').toISOString()

    assert.equal(canAutoRetryWritelistItem('pending', undefined, undefined, undefined, now), false)
    assert.equal(canAutoRetryWritelistItem('failed', 'AI 服务错误 (429)', 0, undefined, now), true)
    assert.equal(canAutoRetryWritelistItem('failed', 'AI 服务错误 (429)', 1, future, now), false)
    assert.equal(canAutoRetryWritelistItem('failed', 'AI 服务错误 (429)', 1, due, now), true)
    assert.equal(canAutoRetryWritelistItem('failed', 'AI 服务错误 (401): Invalid token', 0, undefined, now), false)
    assert.equal(canAutoRetryWritelistItem('failed', 'AI 服务错误 (429)', WRITELIST_MAX_AUTO_RETRIES, due, now), false)
  })

  it('selects a due failed item alongside pending work', () => {
    const now = new Date('2026-10-30T08:00:00.000Z')
    const pending = { id: 'pending', status: 'pending', createdAt: '2026-10-20T00:00:00.000Z' }
    const failed = {
      id: 'retryable',
      status: 'failed',
      createdAt: '2026-09-11T00:00:00.000Z',
      error: 'AI 服务错误 (429): model busy',
      attempts: 1,
      nextRetryAt: '2026-10-15T00:00:00.000Z',
    }

    assert.equal(findNextWritelistCandidate([pending, failed], now)?.id, 'retryable')
    assert.equal(findNextWritelistCandidate([pending], now)?.id, 'pending')
  })
})
