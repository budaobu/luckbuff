import { defineEventHandler, setResponseHeaders } from 'h3'

export default defineEventHandler((event) => {
  const res = event.node.res

  setResponseHeaders(event, {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // XSS protection via CSP — strict but functional for Vue SSR
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://hm.baidu.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api2.gptniux.com https://hm.baidu.com https://geocoding-api.open-meteo.com https://nominatim.openstreetmap.org",
      "frame-src https://googleads.g.doubleclick.net",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),

    // Strict HSTS (HTTPS only)
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Origin isolation
    'Cross-Origin-Opener-Policy': 'same-origin',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  })
})
