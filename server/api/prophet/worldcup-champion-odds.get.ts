import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface OptaRow {
  team: string
  topGroup: number
  l32: number
  l16: number
  qf: number
  sf: number
  final: number
  champ: number
}

interface LiuyaoResult {
  verdict: string
  brief: string
}

interface TeamOdds {
  code: string
  name: string
  group: string
  continent: string
  opta: OptaRow
  liuyao: LiuyaoResult
}

const ROOT = process.cwd().includes('.output') ? resolve(process.cwd(), '..', '..') : process.cwd()
const CSV_PATH = resolve(ROOT, 'app', 'data', 'worldcup2026-opta.csv')
const LIUYAO_PATH = resolve(ROOT, 'app', 'data', 'worldcup2026-liuyao-champion.json')
const TEAMS_PATH = resolve(ROOT, 'app', 'data', 'teams.json')

const teamNameToCode: Record<string, string> = {
  'Spain': 'ESP', 'France': 'FRA', 'England': 'ENG', 'Argentina': 'ARG',
  'Portugal': 'POR', 'Brazil': 'BRA', 'Germany': 'GER', 'Netherlands': 'NED',
  'Norway': 'NOR', 'Belgium': 'BEL', 'Colombia': 'COL', 'Morocco': 'MAR',
  'Switzerland': 'SUI', 'Uruguay': 'URU', 'Ecuador': 'ECU', 'Japan': 'JPN',
  'Croatia': 'CRO', 'United States': 'USA', 'Türkiye': 'TUR', 'Mexico': 'MEX',
  'Senegal': 'SEN', 'Austria': 'AUT', 'Paraguay': 'PAR', 'Sweden': 'SWE',
  'Korea Rep': 'KOR', 'Canada': 'CAN', 'Australia': 'AUS', 'Egypt': 'EGY',
  'Bosnia': 'BIH', 'Iran': 'IRN', 'Algeria': 'ALG', 'Czechia': 'CZE',
  "Côte d'Ivoire": 'CIV', 'Ghana': 'GHA', 'Scotland': 'SCO', 'Panama': 'PAN',
  'South Africa': 'RSA', 'Tunisia': 'TUN', 'Qatar': 'QAT', 'Iraq': 'IRQ',
  'Jordan': 'JOR', 'Congo DR': 'COD', 'Uzbekistan': 'UZB', 'Saudi Arabia': 'KSA',
  'New Zealand': 'NZL', 'Cabo Verde': 'CPV', 'Haiti': 'HAI', 'Curaçao': 'CUW',
}

const continentMap: Record<string, string> = {
  ESP: 'UEFA', FRA: 'UEFA', ENG: 'UEFA', POR: 'UEFA', GER: 'UEFA',
  NED: 'UEFA', NOR: 'UEFA', BEL: 'UEFA', SUI: 'UEFA', CRO: 'UEFA',
  TUR: 'UEFA', AUT: 'UEFA', SWE: 'UEFA', BIH: 'UEFA', CZE: 'UEFA',
  SCO: 'UEFA',
  ARG: 'CONMEBOL', BRA: 'CONMEBOL', COL: 'CONMEBOL', URU: 'CONMEBOL',
  ECU: 'CONMEBOL', PAR: 'CONMEBOL',
  MAR: 'CAF', SEN: 'CAF', EGY: 'CAF', ALG: 'CAF', CIV: 'CAF',
  GHA: 'CAF', RSA: 'CAF', TUN: 'CAF', COD: 'CAF', CPV: 'CAF',
  JPN: 'AFC', KOR: 'AFC', IRN: 'AFC', AUS: 'AFC', KSA: 'AFC',
  IRQ: 'AFC', JOR: 'AFC', UZB: 'AFC', QAT: 'AFC',
  USA: 'CONCACAF', MEX: 'CONCACAF', CAN: 'CONCACAF', PAN: 'CONCACAF',
  HAI: 'CONCACAF', CUW: 'CONCACAF',
  NZL: 'OFC',
}

function parsePercent(s: string): number {
  return parseFloat(s.replace('%', '')) || 0
}

function parseCsv(raw: string): OptaRow[] {
  const lines = raw.trim().split('\n')
  const rows: OptaRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim()
    if (!line) continue
    const parts = line.split(',')
    if (parts.length < 8) continue
    rows.push({
      team: parts[0]!,
      topGroup: parsePercent(parts[1]!),
      l32: parsePercent(parts[2]!),
      l16: parsePercent(parts[3]!),
      qf: parsePercent(parts[4]!),
      sf: parsePercent(parts[5]!),
      final: parsePercent(parts[6]!),
      champ: parsePercent(parts[7]!),
    })
  }
  return rows
}

export default defineEventHandler(async () => {
  const csvRaw = readFileSync(CSV_PATH, 'utf-8')
  const liuyaoRaw = JSON.parse(readFileSync(LIUYAO_PATH, 'utf-8'))
  const teamsRaw = JSON.parse(readFileSync(TEAMS_PATH, 'utf-8'))

  const optaRows = parseCsv(csvRaw)

  // Build group map from teams.json
  const groupMap: Record<string, string> = {}
  for (const [groupName, teams] of Object.entries(teamsRaw.groups || {}) as [string, any[]][]) {
    for (const t of teams) {
      groupMap[t.id] = groupName.replace('组', '')
    }
  }

  const teams: TeamOdds[] = optaRows.map((row) => {
    const code = teamNameToCode[row.team] || row.team
    return {
      code,
      name: row.team,
      group: groupMap[code] || '?',
      continent: continentMap[code] || 'Other',
      opta: row,
      liuyao: liuyaoRaw.teams[code] || { verdict: '待定', brief: '尚未起卦' },
    }
  })

  // Sort by champ probability desc by default
  teams.sort((a, b) => b.opta.champ - a.opta.champ)

  return {
    teams,
    generatedAt: liuyaoRaw.generatedAt,
    method: liuyaoRaw.method,
  }
})
