import { spawn } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const PROJECT_ROOT = resolve(process.cwd())
const SKILL_PATH = join(PROJECT_ROOT, 'liuyao-three-coin-physical-core-SKILL-contract-v2.md')
const CACHE_DIR = join(PROJECT_ROOT, '.cache', 'liuyao-engine')

const ENGINE_SHA256 = 'df5fb58d143b5676bc8c379b694207601ac06bdec4bb57df0866638c0e696767'
const VENDOR_SHA256 = '2dc3b2491e950e15ee975825b9070fbeefa9d69b46703824e79341da42784e6e'

const ENGINE_PATH = join(CACHE_DIR, 'liuyao_engine.py')
const VENDOR_PATH = join(CACHE_DIR, 'lunar_python_vendor.zip')

function sha256File(path: string): string | null {
  try {
    const buf = readFileSync(path)
    return createHash('sha256').update(buf).digest('hex')
  } catch {
    return null
  }
}

function readBlob(text: string, tag: string): string {
  const regex = new RegExp(`<!--\\s*${tag}_BEGIN\\s*(.*?)\\s*${tag}_END\\s*-->`, 's')
  const match = text.match(regex)
  if (!match) {
    throw new Error(`missing embedded payload: ${tag}`)
  }
  return match[1].replace(/\s+/g, '')
}

function decodeBase64Gz(blob: string): Buffer {
  const decoded = Buffer.from(blob, 'base64')
  return gunzipSync(decoded)
}

function ensureEngine(): void {
  // Check if already cached and valid
  const engineHash = sha256File(ENGINE_PATH)
  const vendorHash = sha256File(VENDOR_PATH)

  if (engineHash === ENGINE_SHA256 && vendorHash === VENDOR_SHA256) {
    return // Already valid
  }

  // Need to extract from SKILL.md
  if (!existsSync(SKILL_PATH)) {
    throw new Error(`SKILL.md not found at ${SKILL_PATH}`)
  }

  const skillText = readFileSync(SKILL_PATH, 'utf-8')

  const engineBlob = readBlob(skillText, 'ENGINE_B64_GZ')
  const vendorBlob = readBlob(skillText, 'VENDOR_B64_GZ')

  mkdirSync(CACHE_DIR, { recursive: true })

  const engineBytes = decodeBase64Gz(engineBlob)
  const vendorBytes = decodeBase64Gz(vendorBlob)

  writeFileSync(ENGINE_PATH, engineBytes)
  writeFileSync(VENDOR_PATH, vendorBytes)

  // Verify
  if (sha256File(ENGINE_PATH) !== ENGINE_SHA256) {
    throw new Error('engine hash verification failed after extraction')
  }
  if (sha256File(VENDOR_PATH) !== VENDOR_SHA256) {
    throw new Error('vendor hash verification failed after extraction')
  }
}

export interface EnginePayload {
  line_values: number[]
  cast_datetime: string
  location?: {
    city?: string
    longitude?: number
    latitude?: number
    timezone?: string
  }
  subject_home?: string
  subject_away?: string
}

export interface EngineResult {
  status: 'ok' | 'fatal_error' | 'system_pause'
  error_code?: string
  [key: string]: any
}

const VENV_PYTHON = join(PROJECT_ROOT, '.venv', 'bin', 'python')

function pythonInterpreter(): string {
  if (process.env.LIUYAO_PYTHON) return process.env.LIUYAO_PYTHON
  if (existsSync(VENV_PYTHON)) return VENV_PYTHON
  return 'python3'
}

export async function runLiuYaoEngine(payload: EnginePayload): Promise<EngineResult> {
  ensureEngine()

  const payloadFile = join(CACHE_DIR, `payload-${process.pid}-${randomBytes(8).toString('hex')}.json`)
  writeFileSync(payloadFile, JSON.stringify(payload), 'utf-8')

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      try { unlinkSync(payloadFile) } catch { /* ignore */ }
    }

    const args = [ENGINE_PATH, '--input', payloadFile, '--pretty']
    const child = spawn(pythonInterpreter(), args, {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        PYTHONPATH: CACHE_DIR,
      },
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString('utf-8')
    })

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8')
    })

    child.on('close', (code: number | null) => {
      cleanup()
      if (code !== 0) {
        reject(new Error(`Engine exited with code ${code}: ${stderr || stdout}`))
        return
      }

      try {
        const result = JSON.parse(stdout) as EngineResult
        resolve(result)
      } catch (e) {
        reject(new Error(`Failed to parse engine output: ${(e as Error).message}\nstdout: ${stdout.slice(0, 500)}`))
      }
    })

    child.on('error', (err: Error) => {
      cleanup()
      reject(new Error(`Failed to spawn engine: ${err.message}`))
    })
  })
}
