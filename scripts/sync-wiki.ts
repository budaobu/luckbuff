import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { NodeHtmlMarkdown } from 'node-html-markdown'

const SOURCE_ORIGIN = 'https://www.qingnang.cc'
const SOURCE_INDEX = `${SOURCE_ORIGIN}/wiki`
const SOURCE_SITEMAP = `${SOURCE_ORIGIN}/sitemap.xml`
const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT_DIR = join(ROOT, 'content', 'wiki')
const ENTRIES_DIR = join(OUTPUT_DIR, 'entries')
const IMAGES_DIR = join(ROOT, 'public', 'images', 'wiki')
const REQUEST_TIMEOUT_MS = 20_000
const REQUEST_DELAY_MS = 250
const MAX_RETRIES = 2

interface WikiEntryMeta {
  sourcePath: string
  sourceUrl: string
  title: string
  description: string
  category: string
  categoryTitle: string
  domain: string
  tags: string[]
  excerpt: string
  resources: WikiResource[]
}

interface WikiResource {
  sourceUrl: string
  localPath: string
  sha256: string
}

interface WikiSyncFailure {
  kind: 'page' | 'resource' | 'integrity'
  source: string
  error: string
}

interface WikiManifest {
  generated: true
  syncedAt: string
  source: string
  integritySource: string
  stats: {
    discoveredPages: number
    savedPages: number
    addedPages: number
    updatedPages: number
    removedPages: number
    downloadedResources: number
    failedPages: number
    failedResources: number
  }
  integrity: {
    checked: boolean
    missingFromLocal: string[]
    missingFromSitemap: string[]
    unresolvedWikiLinks: string[]
  }
  failures: WikiSyncFailure[]
  entries: Array<Omit<WikiEntryMeta, 'resources'>>
}

interface FetchedPage {
  path: string
  html: string
}

interface StoredPage {
  path: string
  markdown: string
  meta: WikiEntryMeta
}

interface ParsedFrontmatter {
  meta: WikiEntryMeta
  markdown: string
}

const failures: WikiSyncFailure[] = []
const downloadedResources = new Map<string, WikiResource>()
const wikiLinkTargets = new Set<string>()

function sleep(ms: number): Promise<void> {
  return new Promise(resolveTimer => setTimeout(resolveTimer, ms))
}

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

function normalizeWikiPath(input: string, base: string): string | null {
  try {
    const url = new URL(input, base)
    if (url.origin !== SOURCE_ORIGIN || url.search) return null
    const decoded = decodeSafe(url.pathname).replace(/\/+$/, '')
    if (decoded !== '/wiki' && !decoded.startsWith('/wiki/')) return null
    const segments = decoded.split('/').slice(2)
    if (segments.some(segment => !segment || segment === '.' || segment === '..' || segment.includes('\0'))) return null
    return decoded || '/wiki'
  }
  catch {
    return null
  }
}

async function fetchText(url: string): Promise<{ text: string; finalUrl: string }> {
  let lastError: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          'user-agent': 'ososn-wiki-sync/1.0 (+https://www.ososn.com)',
          accept: 'text/html,application/xhtml+xml',
        },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return { text: await response.text(), finalUrl: response.url || url }
    }
    catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES) await sleep(500)
    }
  }
  throw new Error(lastError instanceof Error ? lastError.message : String(lastError))
}

function decodeNextFlightPayload(html: string): string {
  const marker = 'self.__next_f.push([1,"'
  let cursor = 0
  let payload = ''
  while (true) {
    const start = html.indexOf(marker, cursor)
    if (start < 0) break
    const stringStart = start + marker.length
    let escaped = false
    let end = -1
    for (let index = stringStart; index < html.length; index += 1) {
      const char = html[index]
      if (escaped) {
        escaped = false
      }
      else if (char === '\\') {
        escaped = true
      }
      else if (char === '"') {
        end = index
        break
      }
    }
    if (end < 0) throw new Error('Next.js flight payload is truncated')
    payload += JSON.parse(`"${html.slice(stringStart, end)}"`)
    cursor = end + 1
  }
  if (!payload) throw new Error('Next.js flight payload missing')
  return payload
}

function extractSourceMarkdown(payload: string, html: string, sourcePath: string): string {
  const candidates: string[] = []
  const lines = payload.split('\n')
  for (const [lineIndex, line] of lines.entries()) {
    const marker = line.match(/^([0-9a-f]+):T[0-9a-f]+,(.*)$/)
    if (!marker) continue
    let end = lines.length
    for (let index = lineIndex + 1; index < lines.length; index += 1) {
      if (/^[0-9a-f]+:/.test(lines[index]!)) {
        end = index
        break
      }
    }
    const value = [marker[2]!, ...lines.slice(lineIndex + 1, end)].join('\n')
    if (value.trimStart().startsWith('#')) candidates.push(value)
  }
  const markdown = candidates.sort((left, right) => right.length - left.length)[0]
  if (markdown?.trim()) return markdown.trim()
  return extractRenderedMarkdown(html, sourcePath)
}

function extractRenderedMarkdown(payload: string, sourcePath: string): string {
  const containerStart = payload.indexOf('<div class="markdown-body')
  if (containerStart < 0) throw new Error('wiki content block missing')
  const contentStart = payload.indexOf('>', containerStart) + 1
  const tags = [...payload.slice(contentStart).matchAll(/<\/?div\b[^>]*>/g)]
  let depth = 1
  let end = -1
  for (const tag of tags) {
    depth += tag[0]!.startsWith('</') ? -1 : 1
    if (depth === 0) {
      end = contentStart + (tag.index ?? 0)
      break
    }
  }
  if (end < 0) throw new Error('wiki content block is unbalanced')
  const markdown = NodeHtmlMarkdown.translate(payload.slice(contentStart, end), {
    codeBlockStyle: 'fenced',
    globalStrip: [],
  }).trim()
  if (!markdown) throw new Error(`wiki content for ${sourcePath} is empty`)
  return markdown.trim()
}

function extractBalancedObjects(payload: string, startMarker: string): Array<Record<string, unknown>> {
  const results: Array<Record<string, unknown>> = []
  let cursor = 0
  while (true) {
    const start = payload.indexOf(startMarker, cursor)
    if (start < 0) break
    let depth = 0
    let quoted = false
    let escaped = false
    let end = -1
    for (let index = start; index < payload.length; index += 1) {
      const char = payload[index]
      if (quoted) {
        if (escaped) escaped = false
        else if (char === '\\') escaped = true
        else if (char === '"') quoted = false
        continue
      }
      if (char === '"') quoted = true
      else if (char === '{') depth += 1
      else if (char === '}') {
        depth -= 1
        if (depth === 0) {
          end = index + 1
          break
        }
      }
    }
    if (end < 0) break
    cursor = end
    try {
      const parsed = JSON.parse(payload.slice(start, end))
      if (parsed && typeof parsed === 'object') results.push(parsed)
    }
    catch {
      cursor = start + startMarker.length
    }
  }
  return results
}

function extractIndexEntries(payload: string): WikiEntryMeta[] {
  return extractBalancedObjects(payload, '{"title":"')
    .flatMap((item): WikiEntryMeta[] => {
      const sourcePath = normalizeWikiPath(String(item.url || ''), SOURCE_INDEX)
      const title = String(item.title || '').trim()
      if (!sourcePath || sourcePath === '/wiki' || !title) return []
      return [{
        sourcePath,
        sourceUrl: `${SOURCE_ORIGIN}${sourcePath}`,
        title,
        description: String(item.excerpt || '').trim(),
        category: String(item.category || '').trim(),
        categoryTitle: String(item.categoryTitle || '').trim(),
        domain: String(item.domain || '').trim(),
        tags: Array.isArray(item.tags) ? item.tags.map(tag => String(tag)).filter(Boolean) : [],
        excerpt: String(item.excerpt || '').trim(),
        resources: [],
      }]
    })
}

function extractWikiPaths(payload: string, base: string): string[] {
  return [...payload.matchAll(/(?:https:\/\/www\.qingnang\.cc)?\/wiki\/[^\s"'\\)<>,]+/g)]
    .map(match => normalizeWikiPath(match[0], base))
    .filter((path): path is string => path !== null)
}

function metaFromHtml(html: string, sourcePath: string): WikiEntryMeta {
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.split(/[｜|]/, 1)[0]?.trim() || sourcePath.slice(1)
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] || ''
  return {
    sourcePath,
    sourceUrl: `${SOURCE_ORIGIN}${sourcePath}`,
    title,
    description,
    category: '',
    categoryTitle: '未分类',
    domain: sourcePath.split('/')[2] || '',
    tags: [],
    excerpt: description,
    resources: [],
  }
}

function frontmatter(meta: WikiEntryMeta): string {
  const serializable = { ...meta }
  delete serializable.resources
  return `---\n${JSON.stringify(serializable, null, 2)}\n---\n`
}

function parseFrontmatter(raw: string, sourcePath: string): ParsedFrontmatter {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) throw new Error('entry frontmatter missing')
  const meta = JSON.parse(match[1]!) as WikiEntryMeta
  if (meta.sourcePath !== sourcePath) throw new Error('entry source path mismatch')
  return { meta: { ...meta, resources: [] }, markdown: match[2]!.trim() }
}

async function existingEntryPaths(): Promise<string[]> {
  async function walk(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true })
    const files = await Promise.all(entries.map(async (entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? walk(path) : (entry.name.endsWith('.md') ? [path] : [])
    }))
    return files.flat()
  }
  try {
    return (await walk(ENTRIES_DIR)).map(file => `/wiki/${relative(ENTRIES_DIR, file).split(/[\\/]/).join('/')}`)
      .map(path => path.replace(/\/index\.md$/, '').replace(/\.md$/, '').replace(/\/+$/, '') || '/wiki')
  }
  catch {
    return []
  }
}

async function writeFileAtomic(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.tmp-${process.pid}`
  await writeFile(temporary, content, 'utf8')
  await rename(temporary, path)
}

async function writeBinaryFileAtomic(path: string, bytes: Uint8Array): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const temporary = `${path}.tmp-${process.pid}`
  await writeFile(temporary, bytes)
  await rename(temporary, path)
}

function imageExtension(url: URL, contentType: string): string {
  const pathExtension = extname(decodeSafe(url.pathname)).toLowerCase()
  if (/^\.(avif|gif|jpe?g|png|svg|webp)$/.test(pathExtension)) return pathExtension
  const types: Record<string, string> = {
    'image/avif': '.avif',
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg+xml': '.svg',
    'image/webp': '.webp',
  }
  return types[contentType.split(';')[0]!.trim().toLowerCase()] || '.bin'
}

async function downloadImage(sourceUrl: string): Promise<WikiResource> {
  const cached = downloadedResources.get(sourceUrl)
  if (cached) return cached
  let lastError: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(sourceUrl, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { 'user-agent': 'ososn-wiki-sync/1.0' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.startsWith('image/')) throw new Error(`non-image content type: ${contentType || 'missing'}`)
      const bytes = new Uint8Array(await response.arrayBuffer())
      if (!bytes.length) throw new Error('empty image response')
      const digest = createHash('sha256').update(bytes).digest('hex')
      const extension = imageExtension(new URL(sourceUrl), contentType)
      const localPath = `/images/wiki/${digest.slice(0, 24)}${extension}`
      await writeBinaryFileAtomic(join(ROOT, 'public', localPath), bytes)
      const resource: WikiResource = { sourceUrl, localPath, sha256: digest }
      downloadedResources.set(sourceUrl, resource)
      return resource
    }
    catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES) await sleep(500)
    }
  }
  throw new Error(lastError instanceof Error ? lastError.message : String(lastError))
}

function markdownLinks(markdown: string, base: string): Array<{ image: boolean; text: string; href: string; title: string; raw: string }> {
  const result = []
  const pattern = /(!?)\[([^\]]*)\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+(")[^"]*\4)?\s*\)/g
  for (const match of markdown.matchAll(pattern)) {
    const href = match[3]!.startsWith('<') ? match[3]!.slice(1, -1) : match[3]!
    result.push({ image: match[1] === '!', text: match[2]!, href, title: '', raw: match[0]! })
  }
  void base
  return result
}

async function transformMarkdown(markdown: string, sourcePath: string): Promise<{ markdown: string; meta: WikiEntryMeta }> {
  const sourceUrl = `${SOURCE_ORIGIN}${sourcePath}`
  const resources: WikiResource[] = []
  const seenResources = new Set<string>()
  let output = markdown
  for (const link of markdownLinks(markdown, sourceUrl)) {
    const target = normalizeWikiPath(link.href, sourceUrl)
    if (target && !link.image) {
      const hash = decodeSafe(new URL(link.href, sourceUrl).hash)
      const replacement = `[${link.text}](${decodeSafe(target)}${hash})`
      wikiLinkTargets.add(target)
      if (replacement !== link.raw) output = output.replace(link.raw, replacement)
      continue
    }
    if (!link.image) continue
    try {
      const imageUrl = new URL(link.href, sourceUrl).toString()
      if (!/^https?:/.test(imageUrl) || seenResources.has(imageUrl)) continue
      seenResources.add(imageUrl)
      const resource = await downloadImage(imageUrl)
      resources.push(resource)
      output = output.replace(link.raw, `[${link.text}](${resource.localPath})`)
    }
    catch (error) {
      failures.push({
        kind: 'resource',
        source: `${sourcePath} ${link.href}`,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return {
    markdown: output,
    meta: {
      sourcePath,
      sourceUrl,
      title: '',
      description: '',
      category: '',
      categoryTitle: '',
      domain: '',
      tags: [],
      excerpt: '',
      resources,
    },
  }
}

function mergeMeta(base: WikiEntryMeta, pageMeta: WikiEntryMeta): WikiEntryMeta {
  return {
    ...base,
    resources: pageMeta.resources,
  }
}

async function fetchSitemapPaths(): Promise<string[]> {
  const { text } = await fetchText(SOURCE_SITEMAP)
  return [...text.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(match => normalizeWikiPath(match[1]!, SOURCE_SITEMAP))
    .filter((path): path is string => path !== null)
}

async function main(): Promise<void> {
  const startedAt = new Date()
  await mkdir(OUTPUT_DIR, { recursive: true })
  const metadata = new Map<string, WikiEntryMeta>()
  const stored = new Map<string, StoredPage>()
  const queue = ['/wiki']
  const seen = new Set(queue)

  while (queue.length) {
    const sourcePath = queue.shift()!
    const sourceUrl = `${SOURCE_ORIGIN}${sourcePath}`
  try {
      const response = await fetchText(sourceUrl)
      const html = response.text
      const payload = decodeNextFlightPayload(html)
      const canonicalHref = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]
      const canonicalPath = (canonicalHref ? normalizeWikiPath(canonicalHref, response.finalUrl) : null)
        || normalizeWikiPath(response.finalUrl, response.finalUrl)
        || sourcePath

      if (canonicalPath === '/wiki') {
        for (const entry of extractIndexEntries(payload)) metadata.set(entry.sourcePath, entry)
      }

      for (const path of extractWikiPaths(payload, response.finalUrl)) {
        if (!seen.has(path)) {
          seen.add(path)
          queue.push(path)
        }
      }

      if (canonicalPath === '/wiki') continue
      const canonicalMeta = extractIndexEntries(payload).at(0)
      const baseMeta = canonicalMeta && canonicalMeta.sourcePath === canonicalPath
        ? canonicalMeta
        : metadata.get(canonicalPath) || metaFromHtml(html, canonicalPath)
      const markdown = extractSourceMarkdown(payload, html, canonicalPath)
      const transformed = await transformMarkdown(markdown, canonicalPath)
      stored.set(canonicalPath, {
        path: canonicalPath,
        markdown: transformed.markdown,
        meta: mergeMeta(baseMeta, transformed.meta),
      })
      console.log(`[wiki-sync] ${String(stored.size).padStart(3, '0')} ${canonicalPath}`)
    }
    catch (error) {
      failures.push({
        kind: 'page',
        source: sourcePath,
        error: error instanceof Error ? error.message : String(error),
      })
      console.error(`[wiki-sync] page failed: ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`)
    }
    await sleep(REQUEST_DELAY_MS)
  }

  const oldPaths = await existingEntryPaths()
  const stageDir = join(OUTPUT_DIR, `.staging-${process.pid}`)
  await rm(stageDir, { recursive: true, force: true })
  await mkdir(stageDir, { recursive: true })

  let added = 0
  let updated = 0
  for (const page of stored.values()) {
    const relative = `${page.path.slice('/wiki/'.length)}.md`
    const destination = join(stageDir, relative)
    const content = `${frontmatter(page.meta)}${page.markdown}\n`
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, content, 'utf8')
    const oldPath = page.path
    if (!oldPaths.includes(oldPath)) added += 1
    else {
      try {
        const oldRelative = `${oldPath.slice('/wiki/'.length)}.md`
        const previous = await readFile(join(ENTRIES_DIR, oldRelative), 'utf8')
        if (previous !== content) updated += 1
      }
      catch {
        updated += 1
      }
    }
  }

  await rm(ENTRIES_DIR, { recursive: true, force: true })
  await rename(stageDir, ENTRIES_DIR)

  let sitemapPaths: string[] = []
  try {
    sitemapPaths = await fetchSitemapPaths()
  }
  catch (error) {
    failures.push({
      kind: 'integrity',
      source: SOURCE_SITEMAP,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  const savedPaths = [...stored.keys()]
  const unresolvedWikiLinks = [...wikiLinkTargets].filter(path => path !== '/wiki' && !stored.has(path))
  if (unresolvedWikiLinks.length) {
    failures.push({
      kind: 'integrity',
      source: 'wiki links',
      error: `unresolved wiki links: ${unresolvedWikiLinks.join(', ')}`,
    })
  }
  const missingFromLocal = sitemapPaths.filter(path => path !== '/wiki' && !stored.has(path))
  const missingFromSitemap = savedPaths.filter(path => !sitemapPaths.includes(path))
  if (missingFromLocal.length) {
    failures.push({
      kind: 'integrity',
      source: 'sitemap comparison',
      error: `missing local pages: ${missingFromLocal.join(', ')}`,
    })
  }
  if (missingFromSitemap.length) {
    failures.push({
      kind: 'integrity',
      source: 'sitemap comparison',
      error: `pages absent from sitemap: ${missingFromSitemap.join(', ')}`,
    })
  }

  const resourceCount = new Set([...stored.values()].flatMap(page => page.meta.resources.map(resource => resource.sourceUrl))).size
  const manifest: WikiManifest = {
    generated: true,
    syncedAt: startedAt.toISOString(),
    source: SOURCE_INDEX,
    integritySource: SOURCE_SITEMAP,
    stats: {
      discoveredPages: [...seen].filter(path => path !== '/wiki').length,
      savedPages: stored.size,
      addedPages: added,
      updatedPages: updated,
      removedPages: oldPaths.filter(path => !stored.has(path)).length,
      downloadedResources: resourceCount,
      failedPages: failures.filter(failure => failure.kind === 'page').length,
      failedResources: failures.filter(failure => failure.kind === 'resource').length,
    },
    integrity: {
      checked: sitemapPaths.length > 0,
      missingFromLocal,
      missingFromSitemap,
      unresolvedWikiLinks,
    },
    failures,
    entries: [...stored.values()].map((page) => {
      const { resources: _resources, ...meta } = page.meta
      return meta
    }),
  }
  await writeFileAtomic(join(OUTPUT_DIR, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const elapsed = Math.round((Date.now() - startedAt.getTime()) / 1000)
  console.log(`[wiki-sync] done in ${elapsed}s: ${JSON.stringify(manifest.stats)}`)
  if (failures.length) {
    console.error(`[wiki-sync] ${failures.length} failures:`)
    for (const failure of failures) console.error(`- ${failure.kind}: ${failure.source}: ${failure.error}`)
    process.exitCode = 1
  }
}

await main()
