import { gzipSync } from 'node:zlib'
import type { IncomingMessage, ServerResponse } from 'node:http'

export default defineEventHandler((event) => {
  const url = new URL(getRequestURL(event))
  if (!/^\/_i18n\/[^/]+\/[^/]+\/messages\.json$/.test(url.pathname)) return

  const acceptEncoding = getRequestHeader(event, 'accept-encoding') ?? ''
  if (!acceptEncoding.toLowerCase().includes('gzip')) return

  const res = event.node.res
  const originalSetHeader = res.setHeader.bind(res)
  const originalWrite = res.write.bind(res)
  const originalEnd = res.end.bind(res)
  const chunks: Buffer[] = []

  originalSetHeader('Content-Encoding', 'gzip')
  originalSetHeader('Vary', 'Accept-Encoding')

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
      originalWrite(gzipSync(Buffer.concat(chunks), { level: 9 }))
      originalEnd(callback)
    } catch {
      res.statusCode = 500
      originalEnd('i18n message compression failed')
    }
    return res as ServerResponse<IncomingMessage>
  }) as typeof res.end
})
