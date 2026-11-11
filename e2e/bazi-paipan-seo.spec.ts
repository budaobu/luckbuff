import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'

const fixturePath = resolve(new URL('.', import.meta.url).pathname, 'fixtures/bazi-paipan-seo-head.json')
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as Record<string, { path: string, nodes: string[] }>

test.use({
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:3069',
})

function extractSeoHead(head: string) {
  return head.match(
    /<title[^>]*>[\s\S]*?<\/title>|<meta[^>]+>|<link[^>]+>|<script[^>]+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,
  )?.filter(node => (
    /^<title/i.test(node)
    || /name="(?:description|keywords|robots)"/i.test(node)
    || /property="(?:og:|article:)/i.test(node)
    || /name="twitter:/i.test(node)
    || /rel="(?:canonical|alternate)"[^>]*hreflang=/i.test(node)
    || /rel="canonical"/i.test(node)
    || /type="application\/ld\+json"/i.test(node)
  )) ?? []
}

for (const [locale, expected] of Object.entries(fixture)) {
  test(`preserves ${locale} rendered SEO head byte-for-byte`, async ({ request, baseURL }) => {
    const response = await request.get(expected.path)
    expect(response.status()).toBe(200)
    const html = await response.text()
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[0]
    expect(head, 'Rendered head exists').toBeTruthy()
    expect(baseURL ? expected.path.startsWith('/') : true).toBe(true)
    expect(extractSeoHead(head!), {
      message: () => `SEO nodes changed for ${locale}`,
    }).toEqual(expected.nodes)
  })
}
