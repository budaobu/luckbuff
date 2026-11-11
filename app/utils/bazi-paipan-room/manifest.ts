export interface BaziRoomAssetManifest {
  version: string
  assets: {
    keeper: { geometry: string, glb: string | null }
    instrument: { geometry: string, glb: string | null }
  }
}

export const BAZI_ROOM_ASSET_MANIFEST: BaziRoomAssetManifest = {
  version: '2026-11-procedural-1',
  assets: {
    keeper: {
      geometry: 'procedural:keeper-v1',
      glb: null,
    },
    instrument: {
      geometry: 'procedural:instrument-v1',
      glb: null,
    },
  },
}
