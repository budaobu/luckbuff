export interface BaziRoomAssetManifest {
  version: string
  assets: {
    keeper: { geometry: string, glb: string | null }
    instrument: { geometry: string, glb: string | null }
    ganzhiDisk: { geometry: string, glb: string | null }
    fiveElements: { geometry: string, glb: string | null }
    deskComputer: { geometry: string, glb: string | null }
    projectionScreen: { geometry: string, glb: string | null }
  }
}

export const BAZI_ROOM_ASSET_MANIFEST: BaziRoomAssetManifest = {
  version: '2026-11-procedural-2',
  assets: {
    keeper: {
      geometry: 'procedural:keeper-v1',
      glb: null,
    },
    instrument: {
      geometry: 'procedural:instrument-v1',
      glb: null,
    },
    ganzhiDisk: {
      geometry: 'procedural:ganzhi-disk-v1',
      glb: null,
    },
    fiveElements: {
      geometry: 'procedural:five-elements-v1',
      glb: null,
    },
    deskComputer: {
      geometry: 'procedural:desk-computer-v1',
      glb: null,
    },
    projectionScreen: {
      geometry: 'procedural:projection-screen-v1',
      glb: null,
    },
  },
}
