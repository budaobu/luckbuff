import type { WorldCupFixture, WorldCupFixturesData } from '~/types/qimen-worldcup'

// Real fixtures have flag emojis in team names; placeholder matches do not.
function hasAnyEmoji(name: string): boolean {
  // Standard two-letter flag emojis (Regional Indicator Symbols)
  if (/[\u{1F1E6}-\u{1F1FF}]/u.test(name)) return true
  // Other pictographic emojis (tag sequences like Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿, etc.)
  return /\p{Extended_Pictographic}/u.test(name)
}

function isPlaceholderTeam(name: string): boolean {
  return !hasAnyEmoji(name)
}

function uidToSlug(uid: string): string {
  return uid
    .replace(/@(worldcup-calendar|jys66\.top)$/, '')
    .replace(/^worldcup2026-en-/, 'worldcup2026-')
}

// Strip leading emoji prefix (e.g. "🇲🇽 墨西哥" → "墨西哥")
function stripEmojiPrefix(name: string): string {
  const firstSpace = name.indexOf(' ')
  if (firstSpace > 0) {
    const prefix = name.slice(0, firstSpace)
    if (hasAnyEmoji(prefix)) {
      return name.slice(firstSpace + 1).trimStart()
    }
  }
  return name
}

interface IcsEvent {
  uid: string
  summary: string
  dtStart: string
  dtEnd?: string
  location?: string
  description?: string
  isAllDay: boolean
}

function unfoldLines(raw: string): string[] {
  const lines = raw.split(/\r?\n/)
  const result: string[] = []
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      result[result.length - 1] += line.slice(1)
    } else {
      result.push(line)
    }
  }
  return result
}

function unescapeIcsText(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\;/g, ';')
    .replace(/\\,/g, ',')
    .replace(/\\\\/g, '\\')
}


function parseIcsEvents(raw: string): IcsEvent[] {
  const lines = unfoldLines(raw)
  const events: IcsEvent[] = []
  let current: Partial<IcsEvent> = {}
  let inEvent = false

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      current = {}
    } else if (line === 'END:VEVENT') {
      inEvent = false
      if (current.uid && current.summary && current.dtStart) {
        events.push({
          uid: current.uid,
          summary: current.summary,
          dtStart: current.dtStart,
          dtEnd: current.dtEnd,
          location: current.location,
          description: current.description,
          isAllDay: current.isAllDay ?? false,
        })
      }
      current = {}
    } else if (inEvent) {
      const idx = line.indexOf(':')
      if (idx === -1) continue

      const keyWithParams = line.slice(0, idx)
      const rawValue = line.slice(idx + 1)
      const key = keyWithParams.split(';')[0]
      const value = unescapeIcsText(rawValue)

      // Detect all-day events: either explicit VALUE=DATE or YYYYMMDD without time
      if (keyWithParams.includes('VALUE=DATE') || (key === 'DTSTART' && /^\d{8}$/.test(value))) {
        current.isAllDay = true
      }

      switch (key) {
        case 'UID':
          current.uid = value
          break
        case 'SUMMARY':
          current.summary = value
          break
        case 'DTSTART':
          current.dtStart = value
          break
        case 'DTEND':
          current.dtEnd = value
          break
        case 'LOCATION':
          current.location = value
          break
        case 'DESCRIPTION':
          current.description = value
          break
      }
    }
  }

  return events
}

function icsDateToIso(dt: string, isAllDay: boolean): string | null {
  if (isAllDay) {
    // YYYYMMDD -> ISO
    if (dt.length !== 8) return null
    return `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T00:00:00.000Z`
  }

  // YYYYMMDDTHHMMSSZ -> ISO
  if (dt.length < 15) return null
  const year = dt.slice(0, 4)
  const month = dt.slice(4, 6)
  const day = dt.slice(6, 8)
  const hour = dt.slice(9, 11)
  const minute = dt.slice(11, 13)
  const second = dt.slice(13, 15)
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
}

export function parseWorldCupIcs(raw: string, sourceUrl?: string): WorldCupFixturesData {
  const events = parseIcsEvents(raw)

  const fixtures: WorldCupFixture[] = events
    .filter((e) => {
      // Skip all-day stage markers (e.g. "世界杯三十二强赛")
      if (e.isAllDay) return false
      // Skip events without the " vs " separator (not a specific match)
      if (!e.summary.includes(' vs ')) return false
      return true
    })
    .map((e) => {
      const parts = e.summary.split(' vs ')
      const rawHome = parts[0]?.trim() || ''
      const rawAway = parts[1]?.trim() || ''
      // Use raw names (with emoji) for placeholder detection
      const isPlaceholder = isPlaceholderTeam(rawHome) || isPlaceholderTeam(rawAway)
      // Strip emoji for storage (compatible with teamNameToCode)
      const homeTeam = stripEmojiPrefix(rawHome)
      const awayTeam = stripEmojiPrefix(rawAway)

      const venue = e.location || ''
      const startTime = icsDateToIso(e.dtStart, e.isAllDay)

      return {
        uid: e.uid,
        slug: uidToSlug(e.uid),
        homeTeam,
        awayTeam,
        summary: e.summary,
        startTime: startTime || '',
        endTime: e.dtEnd ? icsDateToIso(e.dtEnd, e.isAllDay) : null,
        venue,
        isPlaceholder,
      }
    })
    // Defensive: drop any fixture with empty startTime
    .filter((f) => f.startTime)

  return {
    updatedAt: new Date().toISOString(),
    source: sourceUrl || 'https://jys66.top/calendars/worldcup2026.ics',
    total: fixtures.length,
    events: fixtures,
  }
}
