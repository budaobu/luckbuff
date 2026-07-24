import { createHash } from 'node:crypto'

export interface SourceFingerprintInput {
  title: string
  description: string
  tags: string[]
  category: string
  content: string
}

// Fingerprint of the translatable payload. Metadata fields (publishedAt, draft,
// author, readingTime, relatedTools) are intentionally excluded — they get
// copied into translations without triggering a re-translate.
export function computeSourceHash(input: SourceFingerprintInput): string {
  const payload = [
    input.title,
    input.description,
    [...input.tags].join(','),
    input.content,
    input.category,
  ].join('\n')
  return `sha1:${createHash('sha1').update(payload, 'utf-8').digest('hex')}`
}
