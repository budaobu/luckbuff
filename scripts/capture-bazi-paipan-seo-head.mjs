import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(projectRoot, 'e2e/fixtures/bazi-paipan-seo-head.json')
const baseUrl = process.env.BAZI_SEO_BASE_URL || 'http://127.0.0.1:3069'
const localePaths = {
  'zh-CN': '/tools/bazi-paipan',
  'zh-TW': '/zh-TW/tools/bazi-paipan',
  en: '/en/tools/bazi-paipan',
  ja: '/ja/tools/bazi-paipan',
  ko: '/ko/tools/bazi-paipan',
}

function extractSeoHead(html) {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[0]
  if (!head) throw new Error('Rendered HTML has no head element')

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

const fixture = {}
for (const [locale, path] of Object.entries(localePaths)) {
  const response = await fetch(`${baseUrl}${path}`)
  if (!response.ok) throw new Error(`${locale} page returned HTTP ${response.status}`)
  const html = await response.text()
  fixture[locale] = { path, nodes: extractSeoHead(html) }
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8')
console.log(`Captured Bazi Paipan SEO heads to ${outputPath}`)
