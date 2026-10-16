import type { BaziChartResult, BaziWuxingItem } from '~~/server/utils/tools/bazi-chart'

export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

export const ELEMENT_KEYS: ElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water']

const ELEMENT_BY_LABEL = new Map<string, ElementKey>([
  ['木', 'wood'],
  ['火', 'fire'],
  ['土', 'earth'],
  ['金', 'metal'],
  ['水', 'water'],
])

const PILLAR_KEYS = ['year', 'month', 'day', 'hour'] as const

export interface Bazi3DCharacter {
  id: string
  char: string
  elementKey: ElementKey
  elementLabel: string
  pillarKey: (typeof PILLAR_KEYS)[number]
  isDayMaster: boolean
}

export interface Bazi3DCluster {
  elementKey: ElementKey
  label: string
  percent: number
  favorable: boolean
}

export interface Bazi3DElementRelation {
  id: string
  kind: 'generates' | 'controls'
  from: ElementKey
  to: ElementKey
}

export interface BaziPaipan3DModel {
  characters: Bazi3DCharacter[]
  clusters: Bazi3DCluster[]
  relations: Bazi3DElementRelation[]
  dayMaster: Bazi3DCharacter
}

function elementItem(result: BaziChartResult, key: ElementKey): BaziWuxingItem {
  const item = result.energy.wuxing.find(candidate => ELEMENT_BY_LABEL.get(candidate.key) === key)
  if (!item) throw new Error(`Missing Bazi element: ${key}`)
  return item
}

export function buildBaziPaipan3DModel(result: BaziChartResult): BaziPaipan3DModel {
  const characters = result.pillars.flatMap(pillar => PILLAR_KEYS.includes(pillar.key as typeof PILLAR_KEYS[number])
    ? ([pillar.gan, pillar.zhi].map((char, offset) => {
        const elementLabel = offset === 0 ? pillar.ganWuxing : pillar.zhiWuxing
        const elementKey = ELEMENT_BY_LABEL.get(elementLabel)
        if (!elementKey) throw new Error(`Unknown Bazi element: ${elementLabel}`)
        return {
          id: `${pillar.key}-${offset === 0 ? 'gan' : 'zhi'}`,
          char,
          elementKey,
          elementLabel,
          pillarKey: pillar.key as typeof PILLAR_KEYS[number],
          isDayMaster: pillar.key === 'day' && offset === 0,
        }
      }))
    : [])

  const dayMaster = characters.find(character => character.isDayMaster)
  if (!dayMaster) throw new Error('Bazi 3D model requires a day master')

  const clusters = ELEMENT_KEYS.map(key => ({
    elementKey: key,
    label: elementItem(result, key).label,
    percent: elementItem(result, key).percent,
    favorable: elementItem(result, key).state !== 'unfavorable',
  }))

  const relations: Bazi3DElementRelation[] = []
  ELEMENT_KEYS.forEach((from, index) => {
    const generates = ELEMENT_KEYS[(index + 1) % ELEMENT_KEYS.length]!
    const controls = ELEMENT_KEYS[(index + 2) % ELEMENT_KEYS.length]!
    relations.push({ id: `${from}-generates-${generates}`, kind: 'generates', from, to: generates })
    relations.push({ id: `${from}-controls-${controls}`, kind: 'controls', from, to: controls })
  })

  return { characters, clusters, relations, dayMaster }
}
