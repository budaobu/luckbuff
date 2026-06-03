import { createRequire } from 'node:module'
import { dirname, join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdirSync, readFileSync, existsSync } from 'node:fs'

const requireFromHere = createRequire(import.meta.url)
const piniaPkgPath = requireFromHere.resolve('pinia/package.json')
const piniaEsmPath = join(dirname(piniaPkgPath), 'dist/pinia.mjs')

// Auto-scan all page routes for llms.txt generation
const __dirname = dirname(fileURLToPath(import.meta.url))
function scanPages(dir: string, baseDir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...scanPages(fullPath, baseDir))
    } else if (entry.isFile() && extname(entry.name) === '.vue') {
      const rel = relative(baseDir, fullPath)
      let route = '/' + rel.replace(/\.vue$/, '').replace(/\/index$/, '')
      if (route === '/index') route = '/'
      results.push(route)
    }
  }
  return results
}
// Scan content/worldcup-predictions for match prediction markdown files
function scanContent(dir: string): Array<{ slug: string; summary: string; generatedAt: string }> {
  const results: Array<{ slug: string; summary: string; generatedAt: string }> = []
  if (!existsSync(dir)) return results
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue
    // Skip locale-suffixed files (e.g. .en.md, .zh-tw.md) — _i18nTransform handles multilingual URLs
    if (/\.\w{2}(-\w{2})?\.md$/.test(file)) continue
    const raw = readFileSync(join(dir, file), 'utf-8')
    const slug = file.replace('.md', '')
    // Extract summary and generatedAt from frontmatter
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
    let summary = ''
    let generatedAt = ''
    if (fmMatch) {
      const summaryMatch = fmMatch[1].match(/^summary:\s*(.+)$/m)
      if (summaryMatch) {
        summary = summaryMatch[1].trim().replace(/^["']|["']$/g, '')
      }
      const genMatch = fmMatch[1].match(/^generatedAt:\s*(.+)$/m)
      if (genMatch) {
        generatedAt = genMatch[1].trim().replace(/^["']|["']$/g, '')
      }
    }
    results.push({ slug, summary, generatedAt })
  }
  return results
}
const contentItems = scanContent(join(__dirname, 'content', 'worldcup-predictions'))

const autoRoutes = scanPages(join(__dirname, 'app', 'pages'), join(__dirname, 'app', 'pages'))

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  srcDir: 'app',
  serverDir: 'server',

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    'nuxt-llms',
  ],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.ososn.com',
    name: 'LuckBuff',
  },

  llms: {
    domain: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.ososn.com',
    title: 'LuckBuff',
    description: 'LuckBuff (ososn) is an online platform offering traditional Chinese metaphysics and divination tools, including Bazi (Four Pillars) charting, Plum Blossom divination, Liu Yao (Six Yao) hexagram casting, Qimen Dunjia chart analysis, Zi Wei Dou Shu (Purple Star Astrology), and Vedic Astrology. The platform supports Simplified Chinese, Traditional Chinese, and English.',
  },

  sitemap: {
    sitemapsPathPrefix: '/',
    xsl: false,
    autoI18n: {
      differentDomains: false,
      defaultLocale: 'zh-CN',
      strategy: 'prefix_except_default',
      locales: [
        { code: 'zh-CN', language: 'zh-CN', _sitemap: 'sitemap-zh-CN', _hreflang: 'zh-CN' },
        { code: 'zh-TW', language: 'zh-TW', _sitemap: 'sitemap-zh-TW', _hreflang: 'zh-TW' },
        { code: 'en', language: 'en', _sitemap: 'sitemap-en', _hreflang: 'en' },
      ],
    },
    defaults: {
      changefreq: 'weekly',
      priority: 0.8,
    },
    urls: contentItems.map(item => ({
      loc: `/prophet/match/${item.slug}`,
      lastmod: item.generatedAt || undefined,
      changefreq: 'weekly' as const,
      priority: 0.6,
      _i18nTransform: true,
    })),
  },

  colorMode: {
    preference: 'system',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'luckbuff-color-mode',
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.ososn.com',
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json', language: 'zh-CN' },
      { code: 'zh-TW', name: '繁體中文', file: 'zh-TW.json', language: 'zh-TW' },
      { code: 'en', name: 'English', file: 'en.json', language: 'en' },
    ],
    defaultLocale: 'zh-CN',
    lazy: true,
    bundle: {
      commonJs: false,
    },
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    head: {
      addSeoAttributes: {
        canonicalQueries: [],
      },
    },
  },

  css: ['~/assets/css/main.css'],

  alias: {
    pinia: piniaEsmPath,
  },

  vite: {
    optimizeDeps: {
      include: ['nanoid', '@internationalized/date', 'html-to-image', 'marked'],
    },
    resolve: {
      alias: {
        pinia: piniaEsmPath,
      },
    },
  },

  icon: {
    serverBundle: 'remote',
  },

  nitro: {
    routeRules: {
      '/': { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' }, sitemap: { priority: 1.0 } },
      '/en': { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' } },
      '/zh-TW': { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' } },
      '/settings': { sitemap: { priority: 0.5, changefreq: 'monthly' } },
      '/terms': { sitemap: { priority: 0.3, changefreq: 'yearly' } },
      '/privacy': { sitemap: { priority: 0.3, changefreq: 'yearly' } },
    },
    compressPublicAssets: { gzip: true, brotli: true },
  },

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
  },

  fonts: {
    provider: 'google',
    families: [],
    processCSSVariables: false,
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  runtimeConfig: {
    autoRoutes,
    contentItems,
    aiBaseUrl: 'https://api2.gptniux.com/v1/chat/completions',
    aiApiKey: '',
    aiModel: 'claude-opus-4-6',
    aiMaxTokens: 8192,
    aiProvider: 'gptniux',
    public: {
      siteUrl: '',
      googleSiteVerification: '',
      baiduAnalyticsId: '',
    },
  },
})