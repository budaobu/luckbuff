import { createHash } from 'node:crypto'
import { defineNitroPlugin, setResponseHeader } from '#imports'

const SCRIPT_SOURCES = [
  'https://pagead2.googlesyndication.com',
  'https://ep1.adtrafficquality.google',
  'https://ep2.adtrafficquality.google',
  'https://fundingchoicesmessages.google.com',
  'https://googleads.g.doubleclick.net',
  'https://www.googletagservices.com',
  'https://hm.baidu.com',
]

const CONNECT_SOURCES = [
  'https://api2.gptniux.com',
  'https://hm.baidu.com',
  'https://geocoding-api.open-meteo.com',
  'https://nominatim.openstreetmap.org',
  'https://pagead2.googlesyndication.com',
  'https://ep1.adtrafficquality.google',
  'https://ep2.adtrafficquality.google',
  'https://fundingchoicesmessages.google.com',
  'https://googleads.g.doubleclick.net',
  'https://www.googletagservices.com',
]

function scriptHash(code: string) {
  const digest = createHash('sha256').update(code, 'utf8').digest('base64')
  return `'sha256-${digest}'`
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    if (typeof response.body !== 'string' || !response.body.includes('<html')) return

    const inlineScripts = [...response.body.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    const hashes = inlineScripts.flatMap(([, attributes = '', code = '']) => {
      const type = attributes.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase()
      const executable = !type || ['module', 'text/javascript', 'application/javascript'].includes(type)
      return executable && code ? [scriptHash(code)] : []
    })

    const csp = [
      "default-src 'self'",
      ["script-src 'self'", ...hashes, ...SCRIPT_SOURCES].join(' '),
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      ["connect-src 'self'", ...CONNECT_SOURCES].join(' '),
      "frame-src https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
      "worker-src 'self' blob:",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; ')

    setResponseHeader(event, 'Content-Security-Policy', csp)
  })
})
