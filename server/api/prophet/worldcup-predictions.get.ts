import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const PREDICTIONS_DIR = resolve(process.cwd(), 'content', 'worldcup-predictions')

interface PredictionMeta {
  uid: string
  slug: string
  index: number
  homeTeam: string
  awayTeam: string
  summary: string
  matchTime: string
  venue: string
  dunType: string
  juNumber: number
  generatedAt: string
  hasContent: boolean
}

function parseFrontmatter(raw: string): Record<string, any> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const lines = match[1]!.split('\n')
  const result: Record<string, any> = {}
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    // Unwrap quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    // Try parse number
    if (/^-?\d+$/.test(value)) {
      result[key] = parseInt(value, 10)
    } else {
      result[key] = value
    }
  }
  return result
}

export default defineEventHandler(async () => {
  if (!existsSync(PREDICTIONS_DIR)) {
    return {
      total: 0,
      generated: 0,
      predictions: [] as PredictionMeta[],
    }
  }

  const files = readdirSync(PREDICTIONS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  const predictions: PredictionMeta[] = []

  for (const file of files) {
    const raw = readFileSync(join(PREDICTIONS_DIR, file), 'utf-8')
    const fm = parseFrontmatter(raw)
    const slug = file.replace('.md', '')
    predictions.push({
      uid: fm.uid || '',
      slug,
      index: fm.index ?? 0,
      homeTeam: fm.homeTeam || '',
      awayTeam: fm.awayTeam || '',
      summary: fm.summary || '',
      matchTime: fm.matchTime || '',
      venue: fm.venue || '',
      dunType: fm.dunType || '',
      juNumber: fm.juNumber ?? 0,
      generatedAt: fm.generatedAt || '',
      hasContent: raw.includes('### '),
    })
  }

  // Sort by match time
  predictions.sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())

  return {
    total: predictions.length,
    generated: predictions.filter(p => p.hasContent).length,
    predictions,
  }
})
