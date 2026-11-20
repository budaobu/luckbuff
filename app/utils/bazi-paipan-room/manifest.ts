export interface BaziRoomAssetManifest {
  version: string
  assets: {
    keeper: { geometry: string, glb: string | null }
    visitor: { geometry: string, glb: string | null }
    desk: { geometry: string, glb: string | null }
    compass: { geometry: string, glb: string | null }
    ornaments: { geometry: string, glb: string | null }
    projectionScreen: { geometry: string, glb: string | null }
  }
}

export const BAZI_ROOM_ASSET_MANIFEST: BaziRoomAssetManifest = {
  version: '2026-11-procedural-room-3',
  assets: {
    keeper: { geometry: 'procedural:keeper-v3', glb: null },
    visitor: { geometry: 'procedural:visitor-v3', glb: null },
    desk: { geometry: 'procedural:study-desk-v1', glb: null },
    compass: { geometry: 'procedural:compass-v1', glb: null },
    ornaments: { geometry: 'procedural:desk-ornaments-v1', glb: null },
    projectionScreen: { geometry: 'procedural:projection-screen-v1', glb: null },
  },
}
