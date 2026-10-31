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
  it('raises output limits for reasoning models before first fetch', async () => {
    let maxTokens: unknown
    const fetchLike = wrapFetchWithEmptyAiStreamRetry(async (_input, init) => {
      maxTokens = JSON.parse(String(init?.body)).max_tokens
      return sseResponse(['{"choices":[{"delta":{"content":"正常"}}]}'])
    }, 'https://ai.example/v1/chat/completions', 8192)

    await readText(await fetchLike('https://ai.example/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ max_tokens: 2048 }),
    }))
    assert.equal(maxTokens, 8192)
  })

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

  it('falls back to a non-stream completion after two empty streams', async () => {
    let calls = 0
    const bodies: unknown[] = []
    const fetchLike = wrapFetchWithEmptyAiStreamRetry(async (_input, init) => {
      calls++
      bodies.push(JSON.parse(String(init?.body)))
      if (calls <= 2) return sseResponse(['{}'])
      return new Response(JSON.stringify({
        choices: [{ message: { content: '非流式兜底' } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }, 'https://ai.example/v1/chat/completions')

    const text = await readText(await fetchLike('https://ai.example/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test', stream: true }),
    }))
    assert.equal(calls, 3)
    assert.equal(bodies[2]?.stream, false)
    assert.match(text, /非流式兜底/)
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
