import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { wrapFetchWithEmptyAiStreamRetry } from '../server/utils/ai/stream-retry.ts'

function sseResponse(events: string[]): Response {
  const body = `${events.map(event => `data: ${event}`).join('\n\n')}\n\ndata: [DONE]\n\n`
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' },
  })
}

async function readText(response: Response): Promise<string> {
  return await response.text()
}

describe('AI empty stream retry', () => {
  it('retries once when the first completion has no text', async () => {
    let calls = 0
    const fetchLike = wrapFetchWithEmptyAiStreamRetry(async () => {
      calls++
      return calls === 1 ? sseResponse(['{}']) : sseResponse(['{"choices":[{"delta":{"content":"解读"}}]}'])
    }, 'https://ai.example/v1/chat/completions')

    const text = await readText(await fetchLike('https://ai.example/v1/chat/completions', { method: 'POST' }))
    assert.equal(calls, 2)
    assert.match(text, /解读/)
  })

  it('does not retry completions that already contain text', async () => {
    let calls = 0
    const fetchLike = wrapFetchWithEmptyAiStreamRetry(async () => {
      calls++
      return sseResponse(['{"choices":[{"delta":{"content":"正常"}}]}'])
    }, 'https://ai.example/v1/chat/completions')

    await readText(await fetchLike('https://ai.example/v1/chat/completions', { method: 'POST' }))
    assert.equal(calls, 1)
  })

  it('emits an explicit error when both completions are empty', async () => {
    let calls = 0
    const fetchLike = wrapFetchWithEmptyAiStreamRetry(async () => {
      calls++
      return sseResponse(['{}'])
    }, 'https://ai.example/v1/chat/completions')

    const text = await readText(await fetchLike('https://ai.example/v1/chat/completions', { method: 'POST' }))
    assert.equal(calls, 2)
    assert.match(text, /AI 返回内容为空/)
  })

  it('leaves non-stream responses untouched', async () => {
    let calls = 0
    const fetchLike = wrapFetchWithEmptyAiStreamRetry(async () => {
      calls++
      return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    }, 'https://ai.example/v1/chat/completions')

    await readText(await fetchLike('https://ai.example/v1/chat/completions', { method: 'POST' }))
    assert.equal(calls, 1)
  })
})
