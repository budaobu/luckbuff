import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

// 工具页/专题页浏览与占卜提交计数。与 .views.json 同目录，
// 部署 rsync 已排除（.page-views.json），服务器计数不会被本地旧副本覆盖。
const VIEWS_FILE = resolve(process.cwd(), 'content', 'insights', '.page-views.json')
const DAILY_RETENTION_DAYS = 40

export const PAGE_VIEW_TYPES = ['tool', 'hub', 'tool-submit'] as const
export type PageViewType = typeof PAGE_VIEW_TYPES[number]

interface ViewEntry {
  total: number
  daily: Record<string, number>
}

type ViewsData = Partial<Record<PageViewType, Record<string, ViewEntry>>>

let cache: ViewsData | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function load(): ViewsData {
  if (cache) return cache
  try {
    cache = JSON.parse(readFileSync(VIEWS_FILE, 'utf-8')) as ViewsData
  } catch {
    cache = {}
  }
  return cache
}

function persistNow(): void {
  if (!cache) return
  mkdirSync(dirname(VIEWS_FILE), { recursive: true })
  const tmp = `${VIEWS_FILE}.tmp`
  writeFileSync(tmp, JSON.stringify(cache))
  renameSync(tmp, VIEWS_FILE)
}

function schedulePersist(): void {
  if (persistTimer) return
  persistTimer = setTimeout(() => {
    persistTimer = null
    try {
      persistNow()
    } catch {
      // 计数丢失可接受，下轮写盘再试
    }
  }, 2000)
  persistTimer.unref?.()
}

function pruneDaily(daily: Record<string, number>, today: Date): void {
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - DAILY_RETENTION_DAYS)
  const cutoffKey = dayKey(cutoff)
  for (const key of Object.keys(daily)) {
    if (key < cutoffKey) delete daily[key]
  }
}

export function recordPageView(type: PageViewType, slug: string): number {
  const data = load()
  const bucket = (data[type] ??= {})
  const entry = (bucket[slug] ??= { total: 0, daily: {} })
  const now = new Date()
  entry.total += 1
  const key = dayKey(now)
  entry.daily[key] = (entry.daily[key] || 0) + 1
  pruneDaily(entry.daily, now)
  schedulePersist()
  return entry.total
}

export interface PageViewStats {
  last7Total: number
  last30Total: number
  daily: Array<{ date: string; count: number }>
  top: Array<{ slug: string; views: number }>
}

export function getPageViewStats(type: PageViewType): PageViewStats {
  const data = load()[type] ?? {}

  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dayKey(d))
  }

  const daily = days.map(date => ({
    date,
    count: Object.values(data).reduce((sum, v) => sum + (v.daily[date] || 0), 0),
  }))

  const last7Total = daily.slice(-7).reduce((s, d) => s + d.count, 0)
  const last30Total = daily.reduce((s, d) => s + d.count, 0)

  const top = Object.entries(data)
    .map(([slug, v]) => ({ slug, views: v.total }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20)

  return { last7Total, last30Total, daily, top }
}
