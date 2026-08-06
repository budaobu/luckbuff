import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// Local SQLite file for the self-hosted auth + user profile store.
// Path is overridable via env for tests; defaults to a gitignored file in repo root.
const sqlitePath = process.env.AUTH_DB_PATH || './auth.db'

export const sqlite = new Database(sqlitePath)
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

export { schema }
