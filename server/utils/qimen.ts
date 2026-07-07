import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, copyFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const PROJECT_ROOT = resolve(process.cwd())
const CACHE_DIR = join(PROJECT_ROOT, '.cache', 'qimen-engine')
const ENGINE_PATH = join(CACHE_DIR, 'qimen_engine.py')
const SOURCE_ENGINE_PATH = join(PROJECT_ROOT, 'qimen-engine.py')
const LIUYAO_CACHE = join(PROJECT_ROOT, '.cache', 'liuyao-engine')
const LIUYAO_VENDOR = join(LIUYAO_CACHE, 'lunar_python_vendor.zip')
const VENDOR_PATH = join(CACHE_DIR, 'lunar_python_vendor.zip')
const LIUYAO_SKILL = join(PROJECT_ROOT, 'liuyao-three-coin-physical-core-SKILL-contract-v2.md')

function readBlob(text: string, tag: string): string {
  const regex = new RegExp(`<!--\\s*${tag}_BEGIN\\s*(.*?)\\s*${tag}_END\\s*-->`, 's')
  const match = text.match(regex)
  if (!match) {
    throw new Error(`missing embedded payload: ${tag}`)
  }
  return match[1]!.replace(/\s+/g, '')
}

function decodeBase64Gz(blob: string): Buffer {
  const decoded = Buffer.from(blob, 'base64')
  return gunzipSync(decoded)
}

function extractVendorFromSkill(): void {
  if (!existsSync(LIUYAO_SKILL)) {
    throw new Error(`liu-yao SKILL.md not found at ${LIUYAO_SKILL}; cannot extract lunar_python vendor`)
  }
  const skillText = readFileSync(LIUYAO_SKILL, 'utf-8')
  const vendorBlob = readBlob(skillText, 'VENDOR_B64_GZ')
  const vendorBytes = decodeBase64Gz(vendorBlob)
  mkdirSync(LIUYAO_CACHE, { recursive: true })
  writeFileSync(LIUYAO_VENDOR, vendorBytes)
}

function ensureEngine(): void {
  if (existsSync(ENGINE_PATH) && existsSync(VENDOR_PATH)) return

  if (!existsSync(SOURCE_ENGINE_PATH)) {
    throw new Error(`qimen-engine.py not found at ${SOURCE_ENGINE_PATH}`)
  }

  mkdirSync(CACHE_DIR, { recursive: true })
  copyFileSync(SOURCE_ENGINE_PATH, ENGINE_PATH)

  if (!existsSync(LIUYAO_VENDOR)) {
    extractVendorFromSkill()
  }
  copyFileSync(LIUYAO_VENDOR, VENDOR_PATH)
}

const VENV_PYTHON = join(PROJECT_ROOT, '.venv', 'bin', 'python')

function pythonInterpreter(): string {
  if (process.env.QIMEN_PYTHON) return process.env.QIMEN_PYTHON
  if (existsSync(VENV_PYTHON)) return VENV_PYTHON
  return 'python3'
}

export interface QimenEnginePayload {
  question_type: string
  question_label?: string
  question_goals?: string[]
  datetime: string
  timezone: string
  calendar_type: 'solar' | 'lunar'
  is_leap_month?: boolean
  location: {
    country: string
    city: string
  }
  output_style: 'brief' | 'detailed'
}

export interface QimenEngineResult {
  status: 'ok' | 'fatal_error' | 'system_pause'
  error_code?: string
  message?: string
  [key: string]: any
}

function adaptPayload(payload: QimenEnginePayload): Record<string, any> {
  const goals = payload.question_goals || []
  const goalStr = goals.join(', ')

  const dt = new Date(payload.datetime)

  return {
    question_type: payload.question_type,
    question_goal: goalStr,
    calendar_type: payload.calendar_type,
    time_input: {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
      hour: dt.getHours(),
      minute: dt.getMinutes(),
      second: dt.getSeconds(),
    },
    location: payload.location,
    is_leap_month: payload.is_leap_month,
  }
}

export async function runQimenEngine(payload: QimenEnginePayload): Promise<QimenEngineResult> {
  ensureEngine()

  const enginePayload = adaptPayload(payload)

  const payloadFile = join(CACHE_DIR, `payload-${process.pid}-${randomBytes(8).toString('hex')}.json`)
  const outputFile = join(CACHE_DIR, `output-${process.pid}-${randomBytes(8).toString('hex')}.json`)
  writeFileSync(payloadFile, JSON.stringify(enginePayload), 'utf-8')

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      try { unlinkSync(payloadFile) } catch { /* ignore */ }
      try { unlinkSync(outputFile) } catch { /* ignore */ }
    }

    const args = [ENGINE_PATH, '--input', payloadFile, '--output', outputFile]
    const child = spawn(pythonInterpreter(), args, {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        PYTHONPATH: VENDOR_PATH,
      },
    })

    let stderr = ''

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8')
    })

    child.on('close', (code: number | null) => {
      if (code !== 0) {
        cleanup()
        reject(new Error(`Engine exited with code ${code}: ${stderr}`))
        return
      }

      try {
        const raw = JSON.parse(readFileSync(outputFile, 'utf-8')) as Record<string, any>

        if (raw.error) {
          cleanup()
          resolve({
            status: 'fatal_error',
            message: String(raw.error),
          })
          return
        }

        const result: QimenEngineResult = {
          status: 'ok',
          ...raw,
        }
        cleanup()
        resolve(result)
      } catch (e) {
        cleanup()
        reject(new Error(`Failed to parse engine output: ${(e as Error).message}`))
      }
    })

    child.on('error', (err: Error) => {
      cleanup()
      reject(new Error(`Failed to spawn engine: ${err.message}`))
    })
  })
}
