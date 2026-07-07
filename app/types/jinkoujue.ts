export type JinkoujueDiFenMethod = 'time' | 'number' | 'direction'

export interface JinkoujueTimeInput {
  method: 'time'
  datetime?: string
  timezone?: string
}

export interface JinkoujueNumberInput {
  method: 'number'
  number: number
}

export interface JinkoujueDirectionInput {
  method: 'direction'
  direction: JinkoujueDirection
}

export type JinkoujueDirection =
  | 'north'
  | 'northeast'
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest'
  | 'unknown'

export type JinkoujueRequest = {
  question?: string
  gender?: 'male' | 'female' | null
  birthYear?: number | null
} & (JinkoujueTimeInput | JinkoujueNumberInput | JinkoujueDirectionInput)

export interface JinkoujuePillar {
  gan: string
  zhi: string
}

export interface JinkoujueChart {
  renYuan: string
  guiShen: string
  jiangShen: string
  diFen: string
}

export interface JinkoujueResult {
  method: JinkoujueDiFenMethod
  pillars: {
    year: JinkoujuePillar
    month: JinkoujuePillar
    day: JinkoujuePillar
    hour: JinkoujuePillar
  }
  yueJiang: {
    name: string
    zhi: string
  }
  chart: JinkoujueChart
  input: {
    question?: string
    gender?: 'male' | 'female' | null
    birthYear?: number | null
  }
  diFenContext?: {
    label: string
    value: string
  }
  guiShenContext?: {
    nobleBranch: string
    isDaytime: boolean
    direction: 'clockwise' | 'counterclockwise'
  }
}

export interface JinkoujueInterpretRequest {
  result: JinkoujueResult
  locale?: string
}
