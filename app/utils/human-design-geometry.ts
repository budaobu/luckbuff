export interface HumanDesignGraphCenter {
  id: string
  gates: number[]
}

export interface HumanDesignShape {
  points?: string
  rect?: [number, number, number, number]
}

export const HUMAN_DESIGN_CENTER_SHAPES: Record<string, HumanDesignShape> = {
  head: { points: '210,16 252,74 168,74' },
  ajna: { points: '168,92 252,92 210,148' },
  throat: { rect: [172, 166, 76, 72] },
  g: { points: '210,250 262,302 210,354 158,302' },
  heart: { points: '302,232 348,262 302,292' },
  sacral: { rect: [172, 400, 76, 72] },
  spleen: { points: '136,382 136,470 64,426' },
  solarplexus: { points: '350,382 350,470 278,426' },
  root: { rect: [172, 556, 76, 72] },
} as const

export const HUMAN_DESIGN_CENTERS: HumanDesignGraphCenter[] = [
  { id: 'head', gates: [64, 61, 63] },
  { id: 'ajna', gates: [47, 24, 4, 17, 11, 43] },
  { id: 'throat', gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16] },
  { id: 'g', gates: [1, 13, 25, 46, 2, 15, 10, 7] },
  { id: 'heart', gates: [21, 40, 26, 51] },
  { id: 'sacral', gates: [34, 5, 14, 29, 59, 9, 3, 42, 27] },
  { id: 'spleen', gates: [48, 57, 44, 50, 32, 28, 18] },
  { id: 'solarplexus', gates: [6, 37, 30, 55, 49, 22, 36] },
  { id: 'root', gates: [53, 60, 52, 19, 39, 41, 58, 38, 54] },
]

export const HUMAN_DESIGN_GATE_POSITIONS: Record<number, [number, number]> = {
  64: [210, 38], 61: [210, 58], 63: [210, 78],
  47: [186, 104], 24: [210, 104], 4: [234, 104], 17: [186, 124], 11: [210, 124], 43: [234, 124],
  62: [188, 180], 23: [210, 180], 56: [232, 180], 35: [188, 196], 12: [210, 196], 45: [232, 196], 33: [188, 212], 8: [210, 212], 31: [232, 212], 20: [199, 228], 16: [221, 228],
  1: [210, 264], 13: [238, 290], 25: [210, 316], 46: [182, 290], 2: [210, 284], 15: [232, 306], 10: [210, 330], 7: [188, 306],
  21: [308, 248], 40: [336, 262], 26: [308, 278], 51: [336, 278],
  34: [190, 418], 5: [210, 418], 14: [230, 418], 29: [190, 435], 59: [210, 435], 9: [230, 435], 3: [190, 452], 42: [210, 452], 27: [230, 452],
  48: [94, 390], 57: [94, 410], 44: [94, 430], 50: [94, 450], 32: [76, 430], 28: [112, 430], 18: [94, 466],
  6: [320, 394], 37: [338, 412], 30: [338, 430], 55: [338, 448], 49: [320, 464], 22: [304, 412], 36: [304, 448],
  53: [190, 572], 60: [210, 572], 52: [230, 572], 19: [190, 589], 39: [210, 589], 41: [230, 589], 58: [190, 606], 38: [210, 606], 54: [230, 606],
}

export const HUMAN_DESIGN_ALL_CHANNELS: Array<[string, string, number, number]> = [
  ['g', 'throat', 1, 8], ['g', 'sacral', 2, 14], ['sacral', 'root', 3, 60], ['ajna', 'head', 4, 63],
  ['g', 'sacral', 5, 15], ['solarplexus', 'sacral', 6, 59], ['throat', 'g', 7, 31], ['sacral', 'root', 9, 52],
  ['g', 'throat', 10, 20], ['g', 'sacral', 10, 34], ['spleen', 'g', 10, 57], ['ajna', 'throat', 11, 56],
  ['throat', 'solarplexus', 12, 22], ['g', 'throat', 13, 33], ['throat', 'spleen', 16, 48], ['ajna', 'throat', 17, 62],
  ['spleen', 'root', 18, 58], ['root', 'solarplexus', 19, 49], ['throat', 'sacral', 20, 34], ['throat', 'spleen', 20, 57],
  ['heart', 'throat', 21, 45], ['throat', 'ajna', 23, 43], ['ajna', 'head', 24, 61], ['g', 'heart', 25, 51],
  ['heart', 'spleen', 26, 44], ['sacral', 'spleen', 27, 50], ['spleen', 'root', 28, 38], ['sacral', 'g', 29, 46],
  ['solarplexus', 'root', 30, 41], ['spleen', 'root', 32, 54], ['sacral', 'spleen', 34, 57], ['throat', 'solarplexus', 35, 36],
  ['solarplexus', 'heart', 37, 40], ['solarplexus', 'root', 39, 55], ['sacral', 'root', 42, 53], ['ajna', 'head', 47, 64],
]

export const HUMAN_DESIGN_CENTER_POINTS: Record<string, [number, number]> = {
  head: [210, 45],
  ajna: [210, 120],
  throat: [210, 202],
  g: [210, 302],
  heart: [325, 262],
  sacral: [210, 436],
  spleen: [100, 426],
  solarplexus: [325, 426],
  root: [210, 592],
}

export function humanDesignGateCenter(gate: number) {
  return HUMAN_DESIGN_CENTERS.find(center => center.gates.includes(gate))?.id ?? 'unknown'
}
