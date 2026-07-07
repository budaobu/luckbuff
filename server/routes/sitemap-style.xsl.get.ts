import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xslt+xml')
  setHeader(event, 'Cache-Control', 'public, max-age=600, must-revalidate')

  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          :root {
            --accent: #00dc82;
            --accent-hover: #00b86b;
            --bg: #0a0a0a;
            --bg-elevated: #141414;
            --border: #262626;
            --text: #e5e5e5;
            --text-muted: #737373;
          }
          * { box-sizing: border-box; }
          body {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
            font-size: 13px;
            color: var(--text);
            background: var(--bg);
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          a { color: inherit; transition: color 0.15s; }
          a:hover { color: var(--accent); }
          .container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
          .header { margin-bottom: 1.25rem; }
          .header h1 { font-size: 1rem; font-weight: 600; margin: 0 0 0.25rem 0; }
          .header-meta { color: var(--text-muted); font-size: 12px; }
          .table-wrap { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-elevated); }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 0.625rem 1rem; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); background: var(--bg); border-bottom: 1px solid var(--border); }
          td { padding: 0.5rem 1rem; border-bottom: 1px solid var(--border); font-size: 12px; }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: rgba(255,255,255,0.02); }
          td a { text-decoration: none; word-break: break-all; }
          @media (prefers-color-scheme: light) {
            :root { --accent: #00a963; --bg: #ffffff; --bg-elevated: #f5f5f5; --border: #d4d4d4; --text: #171717; --text-muted: #525252; }
            tr:hover td { background: rgba(0,0,0,0.02); }
          }
          @media (max-width: 640px) {
            .container { padding: 1rem; }
            th, td { padding: 0.5rem 0.75rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XML Sitemap</h1>
            <div class="header-meta">
              <xsl:choose>
                <xsl:when test="local-name(/*) = 'sitemapindex'">
                  <xsl:value-of select="count(/*[local-name()='sitemapindex']/*[local-name()='sitemap'])"/> sitemaps
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="count(/*[local-name()='urlset']/*[local-name()='url'])"/> URLs
                </xsl:otherwise>
              </xsl:choose>
            </div>
          </div>
          <xsl:choose>
            <xsl:when test="local-name(/*) = 'sitemapindex'">
              <div class="table-wrap">
                <table>
                  <thead><tr><th style="width:70%">Sitemap</th><th style="width:30%">Last Modified</th></tr></thead>
                  <tbody>
                    <xsl:for-each select="/*[local-name()='sitemapindex']/*[local-name()='sitemap']">
                      <tr>
                        <td><a href="{*[local-name()='loc']}"><xsl:value-of select="*[local-name()='loc']"/></a></td>
                        <td><xsl:value-of select="concat(substring(*[local-name()='lastmod'],0,11),' ',substring(*[local-name()='lastmod'],12,5))"/></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:when>
            <xsl:otherwise>
              <div class="table-wrap">
                <table>
                  <thead><tr><th style="width:50%">URL</th><th style="width:25%">Images</th><th style="width:25%">Last Updated</th></tr></thead>
                  <tbody>
                    <xsl:for-each select="/*[local-name()='urlset']/*[local-name()='url']">
                      <tr>
                        <td><a href="{*[local-name()='loc']}"><xsl:value-of select="*[local-name()='loc']"/></a></td>
                        <td><xsl:value-of select="count(*[local-name()='image'])"/></td>
                        <td><xsl:value-of select="concat(substring(*[local-name()='lastmod'],0,11),' ',substring(*[local-name()='lastmod'],12,5))"/></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`
})
