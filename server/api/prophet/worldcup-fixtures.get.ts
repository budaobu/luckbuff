import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { WorldCupFixturesData } from '~/types/qimen-worldcup'

const ICS_URL_CN = 'https://jys66.top/calendars/worldcup2026.ics'
const ICS_URL_EN = 'https://jys66.top/calendars/worldcup2026-en.ics'
const STATIC_PATH = resolve(process.cwd(), 'public', 'worldcup-2026-fixtures.json')

function loadStaticFallback(): WorldCupFixturesData {
  const raw = readFileSync(STATIC_PATH, 'utf-8')
  return JSON.parse(raw) as WorldCupFixturesData
}

function saveStatic(data: WorldCupFixturesData): void {
  try {
    writeFileSync(STATIC_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e: any) {
    console.error('[worldcup-fixtures] Failed to save static fallback:', e?.message ?? e)
  }
}

export default defineEventHandler(async (event) => {
  // Prevent browser caching — always fetch fresh data
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const query = getQuery(event)
  const lang = String(query.lang || 'zh-CN')
  const icsUrl = lang === 'en' ? ICS_URL_EN : ICS_URL_CN

  try {
    const res = await fetch(icsUrl, {
      headers: { 'User-Agent': 'LuckBuff/1.0' },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
    const raw = await res.text()
    if (!raw.includes('BEGIN:VCALENDAR')) {
      throw new Error('ICS response missing VCALENDAR marker')
    }
    const data = parseWorldCupIcs(raw, icsUrl)
    // Update static fallback so it's always current
    saveStatic(data)
    return data
  } catch (e: any) {
    console.error('[worldcup-fixtures] ICS fetch failed, using static fallback:', e?.message ?? e)
    return loadStaticFallback()
  }
})
