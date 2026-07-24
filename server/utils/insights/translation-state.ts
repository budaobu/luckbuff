import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, unlinkSync, renameSync } from 'node:fs'
import { resolve, join } from 'node:path'
import {
  readInsightRaw,
  hasTranslationFile,
  TRANSLATION_LANGS,
  type TranslationLang,
} from '~~/server/utils/insights'

// Runtime translation status — a cache derived from frontmatter truth plus
// transient states (translating / failed). NOT deployed, NOT committed:
// rebuildable from the .md files at any time via rebuildTranslationState().

const STATE_DIR = resolve(process.cwd(), 'content', 'insights', '.translations')

export type TranslationStatus = 'translating' | 'done' | 'stale' | 'locked-stale' | 'failed'

export interface LangState {
  status: TranslationStatus
  hash: string | null
  locked: boolean
  updatedAt: string | null
  error: string | null
}

export type TranslationState = Partial<Record<TranslationLang, LangState>>

function statePath(slug: string): string {
  return join(STATE_DIR, `${slug}.json`)
}

export function readTranslationState(slug: string): TranslationState {
  const path = statePath(slug)
  if (!existsSync(path)) return {}
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf-8'))
    return parsed && typeof parsed === 'object' ? parsed as TranslationState : {}
  } catch {
    return {}
  }
}

export function writeTranslationState(slug: string, state: TranslationState): void {
  mkdirSync(STATE_DIR, { recursive: true })
  const path = statePath(slug)
  const tmpPath = `${path}.tmp-${process.pid}`
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
  renameSync(tmpPath, path)
}

export function patchTranslationState(slug: string, lang: TranslationLang, patch: Partial<LangState>): void {
  const state = readTranslationState(slug)
  const current: LangState = state[lang] ?? { status: 'done', hash: null, locked: false, updatedAt: null, error: null }
  state[lang] = { ...current, ...patch, updatedAt: new Date().toISOString() }
  writeTranslationState(slug, state)
}

export function deleteTranslationState(slug: string): void {
  const path = statePath(slug)
  if (existsSync(path)) unlinkSync(path)
}

// Transient 'translating' states older than this are presumed dead (process
// restarted mid-translation) and reported as failed so the admin can retry.
const STALE_TRANSLATING_MS = 10 * 60 * 1000

// Rebuild one language's state from its frontmatter (the source of truth),
// preserving live transient info when it's still fresh.
export function rebuildLangState(slug: string, lang: TranslationLang, sourceHash: string): LangState {
  const prior = readTranslationState(slug)[lang]

  if (prior?.status === 'translating' && prior.updatedAt) {
    const age = Date.now() - new Date(prior.updatedAt).getTime()
    if (age < STALE_TRANSLATING_MS) return prior
    return { ...prior, status: 'failed', error: '翻译超时或进程已重启，请手动重试' }
  }

  if (!hasTranslationFile(slug, lang)) {
    return {
      status: prior?.status === 'failed' ? 'failed' : 'translating',
      hash: null,
      locked: false,
      updatedAt: prior?.updatedAt ?? null,
      error: prior?.error ?? null,
    }
  }

  const raw = readInsightRaw(slug, lang)
  const hash = raw?.translated_from ?? null
  const locked = raw?.locked === true
  let status: TranslationStatus
  if (!hash) {
    status = 'done'
  } else if (hash === sourceHash) {
    status = 'done'
  } else {
    status = locked ? 'locked-stale' : 'stale'
  }
  return { status, hash, locked, updatedAt: raw?.translated_at ?? null, error: null }
}

export interface TranslationOverviewEntry extends LangState {
  exists: boolean
}

export function getTranslationOverview(slug: string, sourceHash: string): Record<TranslationLang, TranslationOverviewEntry> {
  const overview = {} as Record<TranslationLang, TranslationOverviewEntry>
  for (const lang of TRANSLATION_LANGS) {
    const state = rebuildLangState(slug, lang, sourceHash)
    overview[lang] = { ...state, exists: hasTranslationFile(slug, lang) }
  }
  return overview
}

// Used by the list endpoint: needs hashes for many articles without each
// caller recomputing them.
export function listTranslationStates(): Record<string, TranslationState> {
  if (!existsSync(STATE_DIR)) return {}
  const out: Record<string, TranslationState> = {}
  for (const file of readdirSync(STATE_DIR)) {
    if (!file.endsWith('.json')) continue
    const slug = file.replace(/\.json$/, '')
    out[slug] = readTranslationState(slug)
  }
  return out
}
