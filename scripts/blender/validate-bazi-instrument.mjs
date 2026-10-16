import { NodeIO } from '@gltf-transform/core'
import { KHRDracoMeshCompression, KHRTextureBasisu } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
import { readFile } from 'node:fs/promises'

const glbPath = new URL('../../public/assets/bazi-paipan-3d/instrument.glb', import.meta.url)
const io = new NodeIO()
  .registerExtensions([KHRDracoMeshCompression, KHRTextureBasisu])
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
  })
const document = await io.read(glbPath.pathname)
const root = document.getRoot()
const nodeNames = root.listNodes().map(node => node.getName())
const requiredNodes = ['ring_01', 'ring_02', 'ring_03', 'ring_04']

let triangles = 0
for (const mesh of root.listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    const indices = primitive.getIndices()
    const vertices = primitive.getAttribute('POSITION')
    if (!vertices) throw new Error(`Mesh ${mesh.getName()} has no POSITION accessor`)
    triangles += (indices ? indices.getCount() : vertices.getCount()) / 3
  }
}

const textures = root.listTextures().map((texture) => {
  const size = texture.getSize()
  if (!size) throw new Error(`Texture ${texture.getName()} has no size`)
  return {
    name: texture.getName(),
    mimeType: texture.getMimeType(),
    width: size[0],
    height: size[1],
    bytes: texture.getImage()?.byteLength ?? 0,
  }
})

const glb = await readFile(glbPath)
const result = {
  nodeNames,
  requiredNodesPresent: requiredNodes.every(name => nodeNames.includes(name)),
  triangles,
  maxTriangleCount: 80000,
  glbBytes: glb.byteLength,
  maxGlbBytes: 1024 * 1024,
  textures,
  maxTextureSize: 2048,
}

if (!result.requiredNodesPresent) throw new Error(`Missing required ring nodes: ${nodeNames.join(', ')}`)
if (result.triangles > result.maxTriangleCount) throw new Error(`Triangle budget exceeded: ${result.triangles}`)
if (result.glbBytes > result.maxGlbBytes) throw new Error(`GLB budget exceeded: ${result.glbBytes}`)
if (textures.some(texture => Math.max(texture.width, texture.height) > result.maxTextureSize)) {
  throw new Error('Texture budget exceeded')
}

console.log(JSON.stringify(result, null, 2))
