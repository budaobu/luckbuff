import { defineEventHandler } from 'h3'

const siteUrl = 'https://www.ososn.com'

const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/tools', changefreq: 'weekly', priority: '0.9' },
  { loc: '/tools/bazi', changefreq: 'weekly', priority: '0.8' },
  { loc: '/tools/zhouyi', changefreq: 'weekly', priority: '0.8' },
  { loc: '/tools/liu-yao', changefreq: 'weekly', priority: '0.8' },
  { loc: '/tools/zwds', changefreq: 'weekly', priority: '0.8' },
  { loc: '/settings', changefreq: 'monthly', priority: '0.5' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
]

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler((event) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  return sitemap
})
