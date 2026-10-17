import { spawnSync } from 'node:child_process'
import { access } from 'node:fs/promises'

const projectRoot = new URL('../../', import.meta.url)
const cliPath = new URL('node_modules/@gltf-transform/cli/bin/cli.js', projectRoot)
const sourcePath = new URL('scripts/blender/instrument-source/instrument.gltf', projectRoot)
const outputPath = new URL('public/assets/bazi-paipan-3d/instrument.glb', projectRoot)

function localPath(url) {
  return decodeURIComponent(url.pathname)
}

try {
  await access(cliPath)
  await access(sourcePath)
}
catch {
  throw new Error('Run build-bazi-instrument.py before optimize-bazi-instrument.mjs')
}

const result = spawnSync(process.execPath, [
  localPath(cliPath),
  'optimize',
  localPath(sourcePath),
  localPath(outputPath),
  '--compress', 'draco',
  '--texture-compress', 'ktx2',
  '--texture-size', '1024',
  '--flatten', 'false',
  '--join', 'false',
  '--simplify', 'false',
  '--instance', 'false',
  '--palette', 'false',
  '--prune', 'false',
  '--prune-attributes', 'false',
  '--prune-solid-textures', 'false',
], {
  stdio: 'inherit',
  env: process.env,
})

if (result.status !== 0) {
  throw new Error('gltf-transform optimize failed; ensure KTX-Software provides the ktx command on PATH')
}
