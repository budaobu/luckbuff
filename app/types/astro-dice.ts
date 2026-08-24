export interface AstroDiceFace {
  key: string
  glyph: string
  nameZh: string
  nameTw: string
  nameEn: string
  keywordZh: string
  keywordTw: string
  keywordEn: string
}

export type AstroDiceDignityType = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'neutral'

export type AstroDiceGrade = 'daji' | 'ji' | 'ping' | 'xiong'

export type AstroDiceElement = 'fire' | 'earth' | 'air' | 'water'

export interface AstroDiceCalcResult {
  planet: AstroDiceFace
  sign: AstroDiceFace
  house: AstroDiceFace
  dignity: { type: AstroDiceDignityType, label: string }
  score: number
  grade: AstroDiceGrade
  factors: Array<{ key: string, label: string, delta: number }>
  lucky: { element: AstroDiceElement, color: string, direction: string }
  seed: string
  locale: string
  generatedAt: string
}
