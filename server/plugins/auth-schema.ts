import { sqlite } from '../utils/db'

// The repo ships drizzle-kit–generated SQL for the better-auth + user_profiles
// schema (server/db/migrations/0000_high_stranger.sql) but nothing ever executed
// it — fresh deploys booted with an empty auth.db and every OAuth call failed
// with "no such table: verification". drizzle.config.ts only generates; there is
// no migrate runner wired into the app. This plugin applies that exact DDL at
// startup, made idempotent with IF NOT EXISTS so it is safe on every boot.
//
// Keep in sync with server/db/migrations/0000_high_stranger.sql.
const SCHEMA_DDL = `
CREATE TABLE \`account\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`account_id\` text NOT NULL,
	\`provider_id\` text NOT NULL,
	\`user_id\` text NOT NULL,
	\`access_token\` text,
	\`refresh_token\` text,
	\`id_token\` text,
	\`access_token_expires_at\` integer,
	\`refresh_token_expires_at\` integer,
	\`scope\` text,
	\`password\` text,
	\`created_at\` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	\`updated_at\` integer NOT NULL,
	FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX \`account_userId_idx\` ON \`account\` (\`user_id\`);
CREATE TABLE \`session\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`expires_at\` integer NOT NULL,
	\`token\` text NOT NULL,
	\`created_at\` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	\`updated_at\` integer NOT NULL,
	\`ip_address\` text,
	\`user_agent\` text,
	\`user_id\` text NOT NULL,
	FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX \`session_token_unique\` ON \`session\` (\`token\`);
CREATE INDEX \`session_userId_idx\` ON \`session\` (\`user_id\`);
CREATE TABLE \`user\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`email\` text NOT NULL,
	\`email_verified\` integer DEFAULT false NOT NULL,
	\`image\` text,
	\`created_at\` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	\`updated_at\` integer NOT NULL
);
CREATE UNIQUE INDEX \`user_email_unique\` ON \`user\` (\`email\`);
CREATE TABLE \`user_profiles\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`profiles\` text DEFAULT '[]' NOT NULL,
	\`merged_at\` integer,
	\`created_at\` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	\`updated_at\` integer NOT NULL,
	FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX \`user_profiles_user_id_unique\` ON \`user_profiles\` (\`user_id\`);
CREATE INDEX \`user_profiles_userId_idx\` ON \`user_profiles\` (\`user_id\`);
CREATE TABLE \`verification\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`identifier\` text NOT NULL,
	\`value\` text NOT NULL,
	\`expires_at\` integer NOT NULL,
	\`created_at\` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	\`updated_at\` integer NOT NULL
);
CREATE INDEX \`verification_identifier_idx\` ON \`verification\` (\`identifier\`);
`

export default defineNitroPlugin(() => {
  try {
    const idempotent = SCHEMA_DDL.replace(/CREATE TABLE `/g, 'CREATE TABLE IF NOT EXISTS `')
      .replace(/CREATE UNIQUE INDEX `/g, 'CREATE UNIQUE INDEX IF NOT EXISTS `')
      .replace(/CREATE INDEX `/g, 'CREATE INDEX IF NOT EXISTS `')
    sqlite.exec(idempotent)
  } catch (err) {
    console.error('[auth-schema] failed to ensure auth tables:', err)
  }
})
