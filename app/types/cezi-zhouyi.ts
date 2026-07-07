export interface CeziZhouyiRequest {
  char: string
  question: string
  gender?: 'male' | 'female' | null
  birthYear?: number | null
}

export interface CeziZhouyiCharacterAnalysis {
  char: string
  pinyin: string
  strokeCount: number
  radical: string
  components: string[]
  wuxing: string
  structure: string
  meaning: string
}

export interface CeziZhouyiHexagram {
  upperTrigram: string
  upperTrigramName: string
  lowerTrigram: string
  lowerTrigramName: string
  hexagram: string
  hexagramName: string
  movingLine: number
}

export interface CeziZhouyiResult {
  input: {
    char: string
    question: string
    gender?: 'male' | 'female' | null
    birthYear?: number | null
  }
  analysis: CeziZhouyiCharacterAnalysis
  hexagram: CeziZhouyiHexagram
}

export interface CeziZhouyiInterpretRequest {
  result: CeziZhouyiResult
  locale?: string
}
