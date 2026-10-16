declare module 'troika-three-text' {
  import type { Material, Mesh, Object3DEventMap } from 'three'

  export class Text extends Mesh<import('three').BufferGeometry, Material, Object3DEventMap> {
    text: string
    font: string
    fontSize: number
    color: string
    anchorX: string
    anchorY: string
    sdfGlyphSize: number
    userData: Record<string, unknown>
    dispose(): void
  }
}
