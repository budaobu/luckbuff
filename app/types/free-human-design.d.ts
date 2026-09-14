declare module 'free-human-design' {
  export interface FreeHumanDesignActivation {
    stream: 'personality' | 'design'
    body: string
    gate: number
    line: number
    color: number
    longitude: number
    retrograde: boolean
  }

  export interface FreeHumanDesignChannel {
    key: string
    gates: [number, number]
    centers: [string, string]
    name: string | null
  }

  export interface FreeHumanDesignAstroPoint {
    longitude: number
    sign: string
    signIndex?: number
    degInSign: number
    gateLine?: { gate: number, line: number }
  }

  export interface FreeHumanDesignChart {
    input: {
      birthdate: string
      birthtime: string
      timezone: string
      birth_utc: string
      location: {
        lat: number
        lng: number
        city?: string
        province?: string
        country?: string
        source: string
      } | null
    }
    geneKeys: {
      spheres: Record<string, { gk: number, line: number }>
    }
    humanDesign: {
      type: string
      authority: string
      profile: string | null
      definitionCount: number
      activations: {
        personality: FreeHumanDesignActivation[]
        design: FreeHumanDesignActivation[]
      }
      activatedGates: number[]
      definedChannels: FreeHumanDesignChannel[]
      definedCenters: string[]
      openCenters: string[]
      centers: Record<string, boolean>
      gateActivations: Record<string, Array<{
        stream: 'personality' | 'design'
        body: string
        line: number
      }>>
    }
    astrology: {
      location: { lat: number, lng: number, city?: string, source: string }
      angles: Record<string, FreeHumanDesignAstroPoint>
      houses: {
        system: string
        requestedSystem: string
        cusps: Array<{ house: number, longitude: number, sign: string, degInSign: number }>
      }
    } | null
    _meta: {
      jd_personality: number
      jd_design: number
    }
  }

  export function computeChart(input: {
    birthdate: string
    birthtime: string
    timezone: string
    location?: { lat: number, lng: number }
    houseSystem?: 'placidus' | 'whole' | 'equal'
    midpoints?: boolean
  }): FreeHumanDesignChart
}
