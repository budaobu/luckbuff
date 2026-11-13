import { gzipSync } from 'node:zlib'
import type { IncomingMessage, ServerResponse } from 'node:http'

export default defineEventHandler((event) => {
  const url = new URL(getRequestURL(event))
  if (!/^\/_i18n\/[^/]+\/[^/]+\/messages\.json$/.test(url.pathname)) return

  event.node.res.setHeader('Vary', 'Accept-Encoding')
  const acceptEncoding = getRequestHeader(event, 'accept-encoding') ?? ''
  if (!acceptEncoding.toLowerCase().includes('gzip')) return

  if (event.method !== 'GET' && event.method !== 'HEAD') return
  if (getRequestHeaders(event)['content-encoding']) return

  const res = event.node.res
  const originalSetHeader = res.setHeader.bind(res)
  const originalWrite = res.write.bind(res)
  const originalEnd = res.end.bind(res)
  const chunks: Buffer[] = []

  res.setHeader = ((name: string | number, value: unknown) => {
    if (typeof name === 'string' && name.toLowerCase() === 'content-length') return res
    return originalSetHeader(name as never, value as never)
  }) as typeof res.setHeader

  res.write = ((chunk: unknown, encoding?: BufferEncoding | ((error?: Error | null) => void), cb?: (error?: Error | null) => void) => {
    const callback = typeof encoding === 'function' ? encoding : cb
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8'))
    } else {
      chunks.push(chunk === undefined ? Buffer.alloc(0) : Buffer.from(chunk as Uint8Array))
    }
    callback?.()
    return true
  }) as typeof res.write

  res.end = ((chunk?: unknown, encoding?: BufferEncoding | (() => void), cb?: () => void) => {
    const callback = typeof encoding === 'function' ? encoding : cb
    if (chunk !== undefined) {
      if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8'))
      } else {
        chunks.push(Buffer.from(chunk as Uint8Array))
      }
    }

    try {
      if (res.writableEnded || !chunks.length) {
        originalEnd(callback)
        return res as ServerResponse<IncomingMessage>
      }

      originalSetHeader('Content-Encoding', 'gzip')
      originalWrite(gzipSync(Buffer.concat(chunks), { level: 6 }))
      originalEnd(callback)
    } catch {
      res.removeHeader('content-encoding')
      res.statusCode = 500
      originalEnd('i18n message compression failed')
    }
    return res as ServerResponse<IncomingMessage>
  }) as typeof res.end
})
